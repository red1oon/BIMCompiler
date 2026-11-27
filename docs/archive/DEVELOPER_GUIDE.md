# Developer Guide

> **Superseded 2026-11-13 by [DeveloperGuide.md](../DeveloperGuide.md)** (current, both repos). Kept here unchanged for the compiler-side detail it still carries.

Expert-level onboarding. Assumes you know Java, SQL, and BIM concepts.

> **Architecture Reference**
> Governing architectural principles, spatial storage model (SpaceSize AABB / ERP mapping),
> and the Place / GPD / PhantomLayout spatial constructs live in:
> - `PREFAB_ARCHITECTURE.md` — BOM chain, Place descriptor, GPD, variance child, PhantomLayout (§8)
> - `BIMasBOMConcept.md` — BOM dimension model: Category (M_BomCategory) + Owner (C_DocType.DocSubType) + SpaceSize (AABB). iDempiere ERD mapping, buffer space invariant, M_Product→M_BOM flattening rationale.
> - `ConstructionAsERP.md` — C_Order, C_DocType model (§11.36), three-concern separation (§11.9: WHAT/HOW/WHERE), PP_Order_Node verb storage.
>
> This guide covers pipeline stages, key files, build commands, and developer how-to patterns.
> **Technical architecture content from this guide is being migrated en bloc to the above references.**

**Updated:** 2026-03-16 (M_Product source-of-truth in component_library.db, pipeline diagram updated, ad_product_dim removed)

### Authoritative Docs

| Document | Scope |
|----------|-------|
| `ConstructionAsERP.md` | C_Order, C_DocType, three-concern lock, PP_Order_Node, §11 design decisions |
| `PREFAB_ARCHITECTURE.md` | BOM chain, Place/GPD/PhantomLayout, MRP BOM Drop |
| `DATA_MODEL.md` | Authoritative 3-DB schema reference ({PREFIX}_BOM.db, component_library.db, output.db) |
| `BIMasBOMConcept.md` | 3 BOM dimensions, buffer space, iDempiere ERD |
| `BIM_COBOL.md` | Language spec v0.13, 63 verbs, 196 witnesses, verb grammar, §18 Synthetic BOM spec |
| `TheRosettaStoneStrategy.txt` | Terminal recomposition (TE-1..TE-8), 51K elements, Synthetic Rosetta Stone |
| `ACTION_ROADMAP.md` | Production roadmap: 8 phases (A–H), 3 tracks, dependency graph, milestone gates |
| `TestArchitecture.md` | QA hardening: 4-layer defense (hash seal + G4-TAMPER + data integrity + pre-commit hook) |
| `bim_architecture_viz.html` | Interactive pipeline + 3-DB ERD visualization |
| `DEVELOPER_GUIDE.md` | This file — pipeline, build, how-to patterns |

Superseded docs archived to `docs/archive/`.

## The Machine

```
LAYER 1 — Geometry Extraction (one-time per IFC source)
IFC source  →  tools/extract.py (IfcOpenShell)  →  component_library.db
                                                    ├── component_geometries (vertex/face blobs)
                                                    ├── I_Geometry_Map (element → geometry hash)
                                                    └── surface_styles, material_layers

LAYER 2 — Product Catalog + BOM Dictionary (per building, reproducible)
IFC source  →  IfcOpenShell  →  Reference DB (*_extracted.db)
                                       │
                     IFCtoBOM Java pipeline (classify_*.yaml)
                     ├── ExtractionPopulator  → I_Element_Extraction (component_library.db)
                     ├── ProductRegistrar     → M_Product + M_Product_Image (component_library.db)
                     ├── StructuralBomBuilder → m_bom + m_bom_line ({PREFIX}_BOM.db)
                     ├── BomValidator         → pre-commit QA (9 checks — FAIL = rollback)
                     └── IntegrityHash        → SHA-256 fingerprint

LAYER 3 — Compilation (reads both DBs, writes output)
DSL text  →  Parser  →  Records  →  Compiler  →  Writer  →  SQLite DB (output)
              │                       │              │
              │                   reads from      writes to
              ├── {PREFIX}_BOM.db (structure only) ─┘
              │   m_bom + m_bom_line (child_product_id = FK reference)
              │   M_Product (transitional copy — target: remove, read from library)
              └── component_library.db (catalog + geometry) ─────────────────────┘
                  M_Product (master) + M_Product_Image → component_geometries
```

### 3-DB Architecture (Phase E)

See `ConstructionAsERP.md` for 3-DB architecture details ({PREFIX}_BOM.db, component_library.db, Output DBs).

Source code lives in `DAGCompiler/src/main/java/com/bim/compiler/`. Build with `mvn compile -q`. Run E2E tests with `mvn exec:java -pl DAGCompiler -Dexec.mainClass="..." -q`.

## DAG Pipeline

| Stage | Class | Input | Output |
|-------|-------|-------|--------|
| Parse | `BuildingParser` | `.bim` text | `BuildingDefinition` (records) |
| Validate | `BuildingCompiler` | Definition | Constraint-checked definition |
| Compile | `StoreyCompiler` | Per-storey specs | Room geometries, walls, openings |
| Multi-unit | `MultiUnitCompiler` | Unit blocks | Merged storey with party walls |
| Place (SH/DX) | `PlacementLoader.loadFromBOM()` + `StoreyCompiler.applyPlacementOverrides()` | m_bom_line ({PREFIX}_BOM.db) + `ad_room_boundary` | Computed element positions (per-storey consumed list + global emission) |
| Place (BOM, SH/DX) | `FurnitureWorker` → `BOMTierResolver` | Room bounds + BOM tree (m_bom/m_bom_line) | BOM-expanded furniture/fixture positions (three-way dispatch: fixture params / GPD / FLOAT) |
| Place (generative) | `StoreyCompiler` + `MEPWriter` | Room bounds | MEP/fixture positions for generative buildings (TB-LKTN only) |
| Write | `BuildingWriter` → sub-writers + `emitGlobalPlacementElements()` | All specs + consumed list | `DAGCompiler/lib/output/*.db` (SQLite) |
| Witness | `WitnessGenerator` | Output DB | `*_witness.json` proof claims |

Every stage reads metadata from `library/_SH_compile.db` (or `_DX_compile.db`) — a temp copy of `{PREFIX}_BOM.db` enriched with shared schema by `run_RosettaStones.sh`. Java reads the path via `System.getProperty("bom.db")`. Geometry comes from `library/component_library.db` (LOD) via JDBC. No stage invents values.

**Place stage split (SH/DX — EXTRACTED buildings):**

The Place stage has two sequential sub-stages for EXTRACTED buildings:
1. **Per-storey override** — `StoreyCompiler.applyPlacementOverrides()`: consumes IfcSlab, IfcFurnishingElement, IfcFurniture from PlacementLoader and calls `markConsumed()`. Clears compiled walls/doors/windows without emitting them directly.
2. **Global emission** — `BuildingWriter.emitGlobalPlacementElements()`: emits everything NOT consumed (walls, doors, windows, MEP, structural, roofs). Uses MeshBinder for LOD geometry. Runs `PlacementProver` pre-write.

**Phase G-1 (2026-02-26):** `FixturePlacer` and `FurnitureTypeResolver` deleted.
`FurnitureWorker` calls `BOMTierResolver.resolveForRoom()` directly — no intermediary.
`MEPWriter` runs only for generative buildings (`isGenerative()=true`); SH/DX MEP
comes from `emitGlobalPlacementElements()` via the PlacementLoader reference path.
See `docs/ConstructionAsERP.md` §3.7 for the ST mode roadmap.

## Key Files

```
DAGCompiler/src/main/java/com/bim/compiler/
├── dsl/
│   ├── BuildingSpecs.java        # 26 record types (RoomSpec, WallSpec, SlabSpec, etc.)
│   ├── BuildingCompiler.java     # Entry points, validation
│   ├── StoreyCompiler.java       # Walls, openings, stairs per storey + placement overrides
│   ├── MultiUnitCompiler.java    # Multi-unit layout, party walls
│   ├── PlacementLoader.java          # Placement cache façade: loadFromBOM() (SH/DX via M_BOM_Line in {PREFIX}_BOM.db) or loadLegacyFlat() (Terminal only, legacy extraction archive in component_library.db)
│   ├── BuildingWriter.java       # Write orchestrator (schema + global emission)
│   ├── ElementPersistence.java   # Element write (10 columns incl. material_name, material_rgba)
│   ├── MEPWriter.java            # MEP/fixture writer (passes material to output)
│   ├── OpeningWriter.java        # Door/window writer
│   ├── StructuralWriter.java     # Column/beam writer
│   ├── StairWriter.java          # Stair writer
│   ├── WitnessGenerator.java     # Witness claim proofs
│   ├── CompilerConfig.java       # Config reader (placement_mode, etc.)
│   ├── RelationalResolver.java   # Relational placement engine (RM-2+): coordinate computation for SH/DX
│   ├── ExteriorRuleAD.java       # Exterior wall rule lookup
│   ├── BoundElement.java         # Proof-carrying type (mesh fits bbox)
│   ├── MeshBinder.java           # Bind library mesh to element (scale + validate)
│   └── *EndToEndTest.java        # E2E tests for 3 Rosetta Stones + TB-LKTN
├── library/
│   ├── ComponentLibrary.java     # LOD400 component lookup
│   ├── BOMTierResolver.java      # Unified BOM resolver — three-way dispatch: fixture params / GPD / FLOAT
│   ├── BOMTreeLoader.java        # Shared AD-layer BOM tree loader (m_bom_line + m_attribute → BOMNode/BOMChild)
│   ├── FurnitureWorker.java      # BundleWorker impl — dispatches to BOMTierResolver, maps PlacedFurniture → PlacedElement
│   ├── WorkerRegistry.java       # BundleWorker factory registry
│   ├── SlotRegistry.java         # Room→assembly slot dispatch (ad_room_slot)
│   ├── BomTemplateComposer.java  # ST mode: walk M_BomCategoryLine tree → select best-fit BOMs
│   └── ManifestResolver.java     # Assembly face clearances
├── validation/
│   ├── PlacementProver.java      # 14 proofs in 5 tiers (non-blocking audit)
│   ├── SpatialDigest.java        # Spatial fingerprint hash
│   └── GeometryIntegrityChecker.java  # Vertex-to-bbox + mesh topology validation
└── geometry/
    ├── Point3D.java, BoundingBox.java
    └── (geometry primitives)
```

## The Library Databases

The compiler uses a 3-database split. For complete schema details, table definitions,
column types, and cross-DB FK map, see [`DATA_MODEL.md`](../DATA_MODEL.md) §1-5.

| Database | Role | Key Tables |
|----------|------|------------|
| `component_library.db` | Master product catalog + LOD geometry (source of truth) | M_Product, M_Product_Image, I_Element_Extraction, LOD_Object, component_geometries, surface_styles |
| `{PREFIX}_BOM.db` | Per-building spatial recipe + config/rules (~73 tables) | m_bom, m_bom_line, m_attribute, M_BomCategory, C_DocType, ad_room_boundary, ad_wall_type, ad_opening_family |
| `output.db` | Compiled building (fresh each compile) | elements_meta, elements_rtree, base_geometries, c_order, c_orderline, co_empty_space, PP_Order_Node |

LOD geometry is extracted from real IFC files. Working tables are curated from standards and Rosetta Stone observations. The compiler reads both at runtime — LOD provides the mesh, working tables tell it where and how to place it.

## BOM Pattern (How Assemblies Work)

> **Dimension model:** see [BIMasBOMConcept.md](BIMasBOMConcept.md).
> M_BOM (`m_bom`) = product + assembly merged. M_BOM_Line (`m_bom_line`) = child reference + SpaceSize.
> Three dimensions: `bom_category` (WHAT), `doc_sub_type` (WHO — §11.37: was c_bpartner), SpaceSize (HOW MUCH).
> All BOM tables live in `library/{PREFIX}_BOM.db`.

A BOM recipe = parent assembly + ordered children. Each child has a name pattern (matches `component_definitions`) and spatial params.

```
BED_SET (m_bom — in {PREFIX}_BOM.db)
├── seq 1: BED       name_pattern="Bed_Queen"    back_to_wall=true
└── seq 2: SIDE_TABLE name_pattern="Side_Table"   dx=0.98
```

The resolver loads the tree, finds matching components by name pattern, applies offsets. No geometry invented — everything comes from the library.

### Adding a BOM Recipe — Verb-First

**Rule: Use BIM COBOL verbs. Never write raw INSERT/UPDATE/DELETE against m_bom or m_bom_line.**

BIM COBOL verbs validate inputs, enforce the SY_ namespace, auto-detect component types, and produce witness-auditable payloads. Raw SQL bypasses all of this.

**Example:** Create a STUDY_DESK_SET with desk + lamp via ScriptRunner or test dispatch.

```bimcobol
-- Level 0 primitives (§18.4)
CREATE BOM SY_STUDY_DESK TYPE SET CATEGORY ST
ADD LINE TO SY_STUDY_DESK CHILD Desk ROLE DESK SEQ 10 DX 0.0
ADD LINE TO SY_STUDY_DESK CHILD ELEC_LIGHT ROLE LAMP SEQ 20 DX 0.4
SET DIMENSIONS ON SY_STUDY_DESK LINE DESK WIDTH 1200 DEPTH 600 HEIGHT 750
SET DIMENSIONS ON SY_STUDY_DESK LINE LAMP WIDTH 300 DEPTH 300 HEIGHT 100

-- Or use Level 1 convenience verbs (§18.6)
CREATE ROOM ST 3000 2500 2800         -- auto-select best-fit template
FURNISH ROOM SY_ST_3000x2500 WITH Desk ELEC_LIGHT
```

**Verify:** dispatch via registry in a test, assert `result.pass()` and check DB via `MBOM.get()` / `MBOMLine.getByBom()`.

**When raw SQL is justified:** migration scripts for schema changes, bulk seed data that pre-dates the verb layer, or read-only queries for inspection. Never for BOM CRUD in production code.

## Verb-First Development Discipline

**The verb layer is not optional.** Every BOM mutation in production code must go through a BIM COBOL verb. This section explains why, how to check, and when to write new verbs.

### Why Verb-First

| Without verbs | With verbs |
|--------------|-----------|
| Raw SQL scattered across Java classes | Single verb class per operation |
| No validation — bad data enters silently | `VerbResult.fail()` with diagnostic payload |
| No audit trail — who changed what? | VerbLogger traces every dispatch |
| Copy-paste → drift → inconsistency | Layered composition (L1 calls L0, never skips) |
| Tests check side effects, not intent | Witness claims test the full dispatch pipeline |
| AI agents invent novel SQL mutations | AI agents compose existing verbs |

### The Verb Lookup Checklist

Before writing any code that touches `m_bom` or `m_bom_line`, run through this:

1. **Does a verb already exist?** Check `VerbRegistry.createDefault()` or run:
   ```bash
   mvn test -pl BIM_COBOL -Dtest=VerbRegistryTest -q  # prints all 38 keywords
   ```

2. **Can I compose existing verbs?** Level 1 verbs call Level 0 primitives. Level 2 will call Level 1. Never skip layers. Example: CREATE ROOM composes VALIDATE AABB → CREATE BOM → ADD LINE → SET DIMENSIONS.

3. **Is this a new verb?** If yes, follow the canonical pattern:
   - Create `XxxVerb.java` implementing `Verb<XxxVerb.XxxPayload>`
   - Define `keyword()`, `execute()`, nested payload record
   - Register in `VerbRegistry.createDefault()`
   - Write witness test FIRST (standing rule)
   - Update count assertions in SyntheticBomPrimitiveTest, UtilityVerbTest, VerbRegistryTest

4. **Is this raw SQL?** Only justified for:
   - Migration scripts (schema DDL, bulk seed data)
   - Read-only inspection queries (BuildingInspector, debug)
   - DAGCompiler batch reads (compilation hotpath, no orm-core dependency)

### Code Review Gate: Spotting Cheating Code

**Red flags** in PR review — any of these means "should be a verb":

| Pattern | Fix |
|---------|-----|
| `new MBOMLine(conn)` outside a verb class | Move to a verb or call an existing verb |
| `line.delete()` outside RemoveLineVerb/StripRoomVerb | Use REMOVE LINE or STRIP ROOM |
| `new MBOM(conn); bom.save()` outside CreateBomVerb/CreateRoomVerb | Use CREATE BOM or CREATE ROOM |
| `MBOMLine.getByBom()` + mutation loop | Compose existing verbs (STRIP ROOM, RESIZE ROOM) |
| Hardcoded `INSERT INTO m_bom` in Java | Use verb dispatch |
| `bomConn.prepareStatement("UPDATE m_bom_line...")` | Use SET TACK, SET DIMENSIONS, SET LINE PROPERTY |

**Green flags** — correct verb usage:

```java
// Good: dispatch through registry
VerbResult<?> r = registry.dispatch(ctx, "CREATE ROOM KT 3500 2500 2800");
assertTrue(r.pass());

// Good: compose primitives inside a verb's execute()
MBOMLine line = new MBOMLine(conn);  // inside AddLineVerb.execute() — this IS the verb

// Good: read-only DAO query for inspection
List<MBOM> all = MBOM.getByCategory(conn, "KT");  // no mutation
```

### Verb Tiers (Current)

| Tier | Count | Purpose | Example |
|------|-------|---------|---------|
| Original | 15 | Geometry + inspection | EN BLOC, WIRE LIGHTING, CHECK BOM |
| Data | 8 | BOM query + export | SELECT BOM, CLONE BOM, LIST BOM |
| P0 Primitive | 8 | BOM CRUD atoms | CREATE BOM, ADD LINE, SET TACK |
| Utility | 3 | Validation + transform | VALIDATE AABB, SNAP TO GRID |
| L1 Convenience | 4 | Room-level composed | CREATE ROOM, FURNISH ROOM, STRIP ROOM |
| **Total** | **38** | | |

Next: L2 Floor-Level (§18.7), L3 Unit-Level (§18.8), L4 Building-Level (§18.9), L5 Operations (§18.10).

### EntityType — Dictionary vs User vs Application

iDempiere concept enforced at the PO layer. The `entity_type` column on `m_bom` and `m_bom_line` governs who owns the record and whether it can be mutated.

| Code | Constant | Meaning |
|------|----------|---------|
| `D` | `ENTITYTYPE_Dictionary` | Pristine dictionary data shipped with the system. **Read-only** — PO layer rejects UPDATE and DELETE. |
| `U` | `ENTITYTYPE_User` | Created at runtime by verbs (SY_ prefix BOMs, FURNISH lines, fillers). Fully mutable. |
| `A` | `ENTITYTYPE_Application` | Custom industry extensions (e.g., hospital-specific templates). Mutable by application code. |

**Enforcement:** `MBOM.beforeSave()` and `MBOMLine.beforeSave()` throw `IllegalStateException` on UPDATE of `D` records. `delete()` overrides do the same. This is a **code-level guard**, not documentation — it cannot be bypassed without changing the PO class.

**For verb authors:** All verbs that create new MBOM/MBOMLine records must call `setEntityType(MBOM.ENTITYTYPE_User)` before save. The Filler utility uses `X_M_BOM.ENTITYTYPE_User`. Dictionary records (entity_type=D) loaded from the catalog cannot be modified or deleted through verbs — the PO layer will throw.

### Key BOM Params

| param_key | Values | Effect |
|-----------|--------|--------|
| `dx`, `dy`, `dz` | meters | Offset from parent origin |
| `rotation` | radians | Rotation around Z |
| `back_to_wall` | true/false | Snap to back wall of room |
| `wall_rule` | back/door/side_interior | Which wall to place against |
| `placement_wall` | back/door/side_interior | Same (BOM-driven variant) |
| `z_rule` | floor/ceiling | Z reference point |
| `z_offset` | meters | Offset from z_rule reference |
| `spacing` | meters | For repeated elements (toilets along wall) |
| `qty_rule` | match_role:TOILET | Match count of another role |
| `name_pattern` | SQL LIKE | Override child_name_pattern |

### MANIFEST Faces (Phase 115B)

Each assembly declares clearance requirements per face:

```sql
-- What clearance does BED_SET need in front?
SELECT clearance_m FROM ad_assembly_manifest
WHERE assembly_id='BED_SET' AND face='FRONT';
-- → 0.6 (meters)
```

Interface types: `CLEARANCE` (free space), `WALL_BACK` (against wall), `JOINABLE` (can abut another assembly).

## Material Pipeline (Phase MAT)

Materials and colours flow from IFC sources through the full compilation pipeline.

### Data Flow

```
IFC source file (e.g., SampleHouse.ifc)
  ├── IfcRelAssociatesMaterial → IfcMaterial.Name → material_name
  └── Representation → IfcStyledItem → IfcSurfaceStyleRendering
      → IfcColourRgb (R,G,B) + Transparency → material_rgba
                    │
                    ↓
    material_extractor.py --ifc ... --ref ...
                    │
                    ↓
    Reference DB: elements_meta.material_name, elements_meta.material_rgba
                    │
                    ↓
    material_extractor.py --populate-placement --ref ... --library ...
                    │
                    ↓
    {PREFIX}_BOM.db: M_BOM_Line.material_name, M_BOM_Line.material_rgba (was: ad_element_placement, deprecated)
                    │
                    ↓
    PlacementLoader.java (reads materialName, materialRgba per placement)
                    │
                    ↓
    StoreyCompiler / BuildingWriter (creates specs with material fields)
                    │
                    ↓
    ElementPersistence.writeElementMeta() (10-column INSERT)
                    │
                    ↓
    Output DB: elements_meta.material_name, elements_meta.material_rgba
```

### RGBA Format

`material_rgba` stores comma-separated RGBA values (0.0–1.0):
- Format: `"R,G,B,A"` — e.g., `"0.000,0.502,0.753,0.100"`
- Alpha = 1.0 - IFC_Transparency (IFC uses transparency, we store opacity)
- Glass: `Transparency: 0.9` → `alpha = 0.1` → 90% see-through
- Opaque wall: `Transparency: 0.0` → `alpha = 1.0` → fully solid

### Key Classes

| Class | Material Role |
|-------|--------------|
| `PlacementLoader.Placement` | Record with `materialName()`, `materialRgba()` fields |
| `BuildingSpecs.SlabSpec` | `materialName`, `materialRgba` fields (with backwards-compat constructor) |
| `BuildingSpecs.FixtureSpec` | `materialName`, `materialRgba` fields (with backwards-compat constructor) |
| `ElementPersistence` | `writeElementMeta()` 10-param version: ...fireRatingHr, materialName, materialRgba |
| `BuildingWriter` | Schema includes material columns; global emission passes material |
| `StoreyCompiler` | `applyPlacementOverrides()` passes material from PlacementLoader to specs |
| `MEPWriter` | `writeFixture()` passes material to ElementPersistence |

### Transparency Pipeline (Window Glass)

Transparent materials (glass, water, shower screens) require TWO things in the output DB:

1. `elements_meta.material_name` must match a `surface_styles.style_name` that has `transparency > 0`
2. The `surface_styles` table must be present (copied from `component_library.db` by `BuildingWriter.copySurfaceStyles()`)

The Bonsai Federation addon joins these:
```sql
LEFT JOIN surface_styles s ON m.material_name = s.style_name
```
If `s.transparency > 0.01`, the addon sets `blend_method = 'BLEND'` and `Alpha = 1.0 - transparency` on the Blender material. Without this join, elements appear opaque regardless of `material_rgba` alpha.

Key transparent styles in `surface_styles`:
| style_name | transparency | Use |
|-----------|-------------|-----|
| `Glass` | 0.9 | SH/DX windows, curtain wall panels |
| `Glass - Clear, Grey` | 0.64 | Tinted glass |
| `Window_W1` | 0.6 | TB-LKTN standard windows |
| `Window_W2` | 0.6 | TB-LKTN secondary windows |
| `Window_W3_Small` | 0.6 | TB-LKTN small windows (wet rooms) |
| `Shower` | 0.3 | Shower screens |
| `Interior Fill` | 0.85 | Interior transparent fills |

**Trap:** IFC exports assign `material_name = 'Window Frame'` to IfcWindow (the frame, not the glass pane). Migration RM6 fixes this to `'Glass'` in both M_BOM_Line and C_OrderLine (Construction Order Details).

### Running the Extractor

```bash
# Step 1: Enrich reference DB from IFC source
python3 DAGCompiler/tools/material_extractor.py \
    --ifc DAGCompiler/lib/input/SampleHouse.ifc \
    --ref DAGCompiler/lib/input/SampleHouse_extracted.db

# Step 2: Copy materials from reference DB → M_BOM_Line (was: ad_element_placement)
python3 DAGCompiler/tools/material_extractor.py \
    --populate-placement \
    --ref DAGCompiler/lib/input/SampleHouse_extracted.db \
    --library library/component_library.db \
    --building-type SampleHouse

# Step 3: Compile — materials flow automatically via PlacementLoader
mvn exec:java -pl DAGCompiler \
    -Dexec.mainClass="com.bim.compiler.dsl.SampleHouseEndToEndTest" -q

# Verify in output
sqlite3 DAGCompiler/lib/output/samplehouse.db \
    "SELECT material_name, material_rgba FROM elements_meta WHERE material_name IS NOT NULL"
```

## Extraction Tool (`tools/extract.py`)

Unified tool for both Layer 1 (LOD400) and Layer 3 (Rosetta reference) extraction:

```bash
# Layer 3: Extract Rosetta reference from IFC file
python3 tools/extract.py --to reference  source.ifc  -o reference/rosetta/out.db

# Layer 3: Extract Rosetta reference from pre-tessellated DB (e.g., federation)
python3 tools/extract.py --to reference  database/enhanced_federation_GI.db \
    -o reference/rosetta/terminal.db  --exclude IfcPlate,IfcOpeningElement

# Layer 1: Extract LOD400 geometry to component library
python3 tools/extract.py --to library  source.ifc  --classes IfcFurniture,IfcDoor

# Filter by discipline (DB sources only)
python3 tools/extract.py --to reference  federation.db  -o out.db  --discipline ARC,STR
```

Replaces: `extract_all_components.py`, `import_ifc_furniture.py`, `extract_duplex_components.py`, `populate_sample_house_db.py`, `populate_duplex_db.py`. Old scripts kept in `scripts/` for reference.

## Build & Test

### Pre-commit hook (4-gate automatic enforcement)

The pre-commit hook (`scripts/pre-commit`, installed at `.git/hooks/pre-commit`)
runs automatically on every `git commit`. It enforces 4 gates:

| Gate | What | When |
|------|------|------|
| 1 | Block library/ binary commits | Always |
| 2 | `mvn compile test-compile` | Always |
| 3 | Tamper seal (`verify_test_seal.sh`) | When test or production trust-boundary files are staged |
| 4 | Data integrity (D-1 orphans, D-3 count cross-check) | When `*_BOM.db` or IFCtoBOM/RosettaStoneToBOM.py are staged |

If any gate fails, the commit is blocked. See `docs/TestArchitecture.md` for
the full 4-layer defense architecture and re-seal procedure.

```bash
# Verify seal manually (start of every session)
bash scripts/verify_test_seal.sh            # INTACT or BROKEN
bash scripts/verify_test_seal.sh --detail   # shows which files changed

# Install/repair hook if missing
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

### Test suites

```bash
# From project root — always /home/red1/bim-compiler
./scripts/run_tests.sh            # all four suites
./scripts/run_tests.sh dag        # DAGCompiler only (191/1 baseline)
./scripts/run_tests.sh orm        # ORMSandbox only (25/1 baseline)
./scripts/run_tests.sh topology   # TopologyMaker only (19/0 baseline)
./scripts/run_tests.sh cobol      # BIM_COBOL only (56/0 baseline)
```

Expected baseline (2026-03-03): **290 PASS / 2 intentional RED / 0 SKIP** (G8-DX calibration + ORMSandbox pre-existing).

### Individual module commands

```bash
mvn compile -q                    # Compile all modules

# DAGCompiler — 163 contract tests (DriftGuard + LOD + Rosetta + Placement)
mvn test -pl DAGCompiler

# ORMSandbox — 25 DAO smoke + BOM witness tests
mvn test -pl ORMSandbox

# TopologyMaker — 19 strategy + PO tests
mvn test -pl TopologyMaker

# BIM_COBOL — 110 verb witness tests (38 verbs + ScriptRunner) [1]
mvn test -pl BIM_COBOL
```

> **[1]** BIM COBOL is the construction programming language layer — 38 verbs across 5 tiers:
> 15 original verbs (geometry + inspection), 8 data handling, 8 P0 synthetic BOM primitives (§18.4),
> 3 utility verbs (§18.5), 4 Level 1 convenience verbs (§18.6). See [`docs/BIM_COBOL.md`](../BIM_COBOL.md)
> for the full language specification and verb scoreboard.

### Spatial fidelity check (SH / DX only — SpatialDigest gate)

```bash
python3 tools/spatial_checker.py \
  DAGCompiler/lib/output/samplehouse.db \
  DAGCompiler/lib/input/SampleHouse_extracted.db \
  --discipline ARC
```

Note: `-pl DAGCompiler` is required since source is in the DAGCompiler module.

### Schema Snapshots (after any migration)

```bash
sqlite3 library/{PREFIX}_BOM.db .schema > library/schema_snapshot_bom.sql
sqlite3 library/component_library.db .schema > library/schema_snapshot_component.sql
```

These are **local reference files** — gitignored under `library/`, never pushed.
Purpose: full DDL (column names, types, FKs, CHECK constraints) readable without querying the DB.
Regenerate after every migration script run.

### Migration Script Index

All migrations live in `migration/`. Each is idempotent (safe to re-run). Run from project root.

**{PREFIX}_BOM.db migrations** (`sqlite3 library/{PREFIX}_BOM.db < migration/<file>`):

| Script | Phase | Purpose |
|--------|-------|---------|
| `migration_NORM1_M_Product.sql` | NORM-1 | Rename ad_product_dim → M_Product, add FKs, seed assembly stubs |
| `migration_NORM2_child_product_id.sql` | NORM-2 | Unify m_bom_line three-way split into child_product_id → M_Product |
| `migration_M_Product_Category.sql` | NORM | Create M_Product_Category (4 parent + 29 IFC class leaves) |
| `migration_ST1c_template_bom.sql` | ST-1c | Template-driven compilation walker, register ST_SH |
| `migration_G1_step5_stall_params.sql` | G1 | Data-drive stall divider constants (spacing, depth, height) |
| `migration_DIGEST_spatial_fingerprint.sql` | G3 | Store computed spatial digests into c_order.spatial_digest |
| `migration_X1_bug_fixes.sql` | X1 | Reposition SH door/window elements to ABSOLUTE with reference-matched bboxes |
| `migration_G8_DX_quick_wins.sql` | G8 | Deactivate Piano in LIVING_SET, raise DINING_SET min_area threshold |
| `migration_G8_DX_phase2.sql` | G8 | Replace BOM-generated upper floor with ABSOLUTE entries |
| `migration_SH_absolute_furniture.sql` | G8 | SH EXTRACTED furniture: ABSOLUTE placement from IFC reference |
| `migration_c_order_idempiere_naming.sql` | C_Order | c_order → iDempiere CamelCase column naming |
| `migration_c_order_to_c_doctype.sql` | C_DocType | c_order → C_DocType: absorb type-level config |
| `migration_P01_product_catalog.sql` | P0.1 | Product catalog normalisation; create M_AttributeSet, seed DX products |
| `migration_P01_BOM_SH_products.sql` | P0.1 | 11 SH-specific M_Product entries + 8 reused |
| `migration_P01_BOM_extracted.sql` | P0.1 | EXTRACTED BOMs: EXT_SH (55 BUY) + EXT_DX (1099 BUY) |
| `migration_P01_BOM_precision.sql` | P0.1 | Restore full-precision BOM coordinates (INTEGER→REAL fix) |
| `migration_material_rgba_backfill.sql` | G3/G5 | Backfill material_rgba from reference extracted DBs |
| `migration_P02_bom_walk_columns.sql` | P0.2 | Add instance columns (storey, element_ref, ordinal, orientation, material) to m_bom_line |
| `migration_tack_origin.sql` | Tack | Tack Convention §4: origin on m_bom, non-negative child offsets |
| `migration_topology_maker_bootstrap.sql` | T0 | TopologyMaker bootstrap: tables + atoms-to-rooms catalog seeds |

**component_library.db migrations** (`sqlite3 library/component_library.db < migration/<file>`):

| Script | Phase | Purpose |
|--------|-------|---------|
| `migration_lod_to_ad_views.sql` | P0 | Backward-compat views: lod_* → ad_* table renames |
| `migration_dx_cascade_gap.sql` | P0 | DX cascade gap: insert missing IfcFlowController, rename DUPLEX→Duplex |
| `migration_P01_placement_product_link.sql` | P0.1 | Add M_Product_ID to ad_element_placement, backfill 1099 DX rows |
| `migration_P01_BOM_SH_placement_link.sql` | P0.1 | Backfill M_Product_ID on 55 SH active rows |
| `migration_LOD_pair.sql` | P0.1 | Create LOD_key + LOD_Object pair (product → geometry → mesh) |
| `migration_SH_M_Product_Image.sql` | P0.1 | Supplement LOD_pair for 8 SH products assigned after initial run |
| `migration_P02_M_Product_Image_rename.sql` | P0.2 | Rename LOD_key → M_Product_Image (iDempiere alignment) |
| `migration_P02_deactivate_sh_dx.sql` | P0.2 | Deactivate SH/DX in ad_element_placement, drop lod_element_placement view |
| `migration_product_image_proper.sql` | P0.2 | Rewrite M_Product_Image: element_ref + name matching (fixes LOD_pair gaps) |
| `migration_rename_extraction_tables.sql` | Final | Rename ad_element_placement → I_Element_Extraction, ad_geometry_map → I_Geometry_Map |

**Run order:** Within each phase, run in alphabetical order. Cross-phase dependencies:
NORM → G-gates → P0.1 → P0.2 → Tack → T0. Each script documents its prerequisites in its header.

## Javadoc

No `maven-javadoc-plugin` is configured. Running `mvn javadoc:javadoc` uses defaults
and produces **9 errors, 100 warnings** — all in `ORMSandbox/src/main/java/.../po/`:

| Issue | Count | Cause |
|-------|-------|-------|
| `invalid uri` | 4 | `§` in `@see` links (e.g., `"docs/BIM_COBOL.md §15.6"`) |
| `heading out of sequence` | 2 | `<H3>` without `<H2>` |
| `reference not found` | 1 | `{@link #getDepthMmWithDefault()}` doesn't exist |
| `malformed HTML` | 1 | Unescaped `<` in `remaining_mm < 0` |
| `no @param/@return/@throws` | 100 | PO methods missing parameter docs |

The pipeline code (IFCtoBOM, DAGCompiler, BIM_COBOL) has **100% class-level Javadoc**
with ASSUMPTION comments on infrastructure-sensitive files (see `docs/InfrastructureAnalysis.md`).
The ORMSandbox PO layer is the only Javadoc debt.

## DAO Framework & Debug Tooling (orm-core)

The project has a second module stack — `orm-core`, `ORMSandbox`, and `TopologyMaker` — that
sits alongside `DAGCompiler` without depending on it. They share only the SQLite database file.

> Full specification: `orm-core/docs/BIMDAOTechnicalFramework.md`

### Symbiotic Architecture

```
Migrations ──────────────────┐
TopologyMaker (orm-core) ────┼──► {PREFIX}_BOM.db (working)  ◄── DAO layer reads / writes
                             │        │
                             │   DAGCompiler reads (raw batch SQL — no orm-core dependency)
                             │        │          also reads component_library.db (LOD)
                             │        ▼
                             │   output DBs (samplehouse.db, duplex.db …)
                             │        │
                             └────────┴──► BuildingInspector reads {PREFIX}_BOM.db + component_library.db
```

`DAGCompiler` uses raw batch JDBC (`loadRooms()`, `loadRules()` — one query each) for
compilation speed. `orm-core` provides a typed iDempiere-style DAO layer for inspection,
seeding new domain data, and debugging. The two systems communicate through data, not code.
Most code now uses a single `{PREFIX}_BOM.db` connection; files needing LOD geometry open a second
connection to `component_library.db` (e.g., `ComponentLibrary`, `BuildingWriter`, `MeshBinder`).

### BuildingInspector — Primary Debug Tool

`BuildingInspector` navigates the full BIM construct via typed entity objects and prints
structured reports. Run it whenever a test fails and you need to understand the data state
before touching Java.

```bash
# From project root
mvn -pl ORMSandbox exec:java \
  -Dexec.mainClass="com.bim.ormsandbox.BuildingInspector" \
  -Dexec.args="library/{PREFIX}_BOM.db <command> [arg]"
```

| Command | Argument | What it shows |
|---------|----------|--------------|
| `buildings` | — | All registered buildings: id, type, doc_status, expected_elements |
| `rooms` | `<buildingType>` | Room boundaries: X/Y min/max, centroid, area, coordinate_frame |
| `bom` | `<bomId>` | Full recursive BOM tree with dx/dy/dz offsets, rotation_rule, product dims |
| `rules` | `<buildingType>` | Element rules: host_ref, ifc_class, discipline, position_rule, height |
| `slots` | `<roomType>` | BOM dispatch for room type: assembly_id, priority, required |
| `product` | `<productId>` | Product dimensions in meters (W × D × H) + clearances |

Can also point at an output DB to inspect compiled results:
```bash
mvn -pl ORMSandbox exec:java \
  -Dexec.mainClass="com.bim.ormsandbox.BuildingInspector" \
  -Dexec.args="DAGCompiler/lib/output/samplehouse.db rooms SampleHouse"
```

### Debug Workflow — Real Example (G8 Frame-of-Reference Bug)

**Symptom:** `RosettaPlacementTest` G8-SH RED — 16/17 furniture elements fail nearest-neighbour
check. Compiled X centroid ≈ +3900mm, reference X centroid ≈ −3000mm. Delta ≈ 6900mm.

**Step 1 — Check the DB data before reading any Java:**

```bash
mvn -pl ORMSandbox exec:java \
  -Dexec.args="library/{PREFIX}_BOM.db rooms SampleHouse"
```
```
=== ROOM BOUNDARIES for 'SampleHouse' (2) ===
  [42] ROOM_Ground_Floor_1    type=LIVING       frame=IFC_GLOBAL_MM
       X: [-7510, 1359]  centX=-3075
       Y: [-281,  4409]  centY=2064
       area=39.2 m²

  [43] ROOM_Ground_Floor_2    type=BEDROOM      frame=IFC_GLOBAL_MM
       X: [4113, 6120]   centX=5116
       Y: [946,  4367]   centY=2656
       area=8.3 m²
```

**Reading:** DB has correct calibrated values. LIVING centroid = −3075mm.
`coordinate_frame = IFC_GLOBAL_MM` — bounds are already in world space.
**Data is not the problem.** Eliminates the "migration didn't apply" hypothesis instantly.

**Step 2 — Check BOM dispatch:**

```bash
mvn -pl ORMSandbox exec:java \
  -Dexec.args="library/{PREFIX}_BOM.db slots LIVING"
```
```
=== ROOM SLOTS for 'LIVING' (2) ===
  [12] LIVING/FURNITURE    asm=LIVING_SET    priority=100  required=no
```

**Reading:** Correct BOM dispatched to correct room. Dispatch is not the problem.

**Step 3 — Inspect BOM children:**

```bash
mvn -pl ORMSandbox exec:java \
  -Dexec.args="library/{PREFIX}_BOM.db bom LIVING_SET"
```
```
=== BOM CHAIN: LIVING_SET ===
  [BOM] LIVING_SET  type=SET  groupBy=ROOM
    [LEAF] role=SOFA        seq=10  pattern='Sofa%'          offset(dx=0.0,  dy=0.0, dz=0.0)
      [PRODUCT] Sofa  2.000m × 0.800m × 0.450m
    [LEAF] role=SOFA_B      seq=20  pattern='Sofa_Loveseat%' offset(dx=-1.5, dy=0.0, dz=0.0)
    [LEAF] role=COFFEE_TABLE seq=30 pattern='Coffee_Table%'  offset(dx=0.0,  dy=1.2, dz=0.0)
    [LEAF] role=SIDE_TABLE_A seq=40 pattern='Side_Table%'    offset(dx=1.2,  dy=0.0, dz=0.0)
```

**Reading:** Children are correct. Offsets are relative to the anchor.
If the anchor were at LIVING X(−7510…1359), furniture would land at X ≈ −3000mm.
But compiled output shows X ≈ +3900mm — the BEDROOM range.

**Hypothesis formed from three commands, under 5 minutes:**
The compiler is applying a LOCAL→GLOBAL offset transform on top of bounds that are
already in `IFC_GLOBAL_MM`. The `coordinate_frame` column is not being checked
before the transform is applied, causing a double-shift of ≈ +6900mm in X.

**Step 4 — Go directly to the fix location:**

The inspector eliminated data, dispatch, and BOM structure as causes. Only the anchor
computation remains. Open `BOMTierResolver.java` → `computeBomAnchorForRoom()` and
look for where the
building/storey offset is added without checking `room.coordinateFrame()`.

**Without BuildingInspector** the same investigation takes 90–120 minutes:
add debug prints → recompile → read 1,197 log lines → run `sqlite3` manually →
cross-reference by hand. With it: three commands, one hypothesis, straight to the fix.

### orm-core Entity Coverage

Typed X_/M_ entity pairs in orm-core. Each pair gives:
- `COLUMNNAME_*` constants — compile-time safety for column names
- Factory methods — `MBOM.get(conn, "BED_SET_MASTER")` vs raw ResultSet
- `beforeSave()` validation — catches NOT NULL violations before the DB does

All tables below live in `{PREFIX}_BOM.db` except `lod_geometry_map` (component_library.db).

| Entity pair | Table | Key factory methods |
|-------------|-------|-------------------|
| `MBOM` | `m_bom` | `get(bomId)` — assembly header |
| `MBOMLine` | `m_bom_line` | `getByBom(bomId)` — child placement + SpaceSize |
| `Filler` | `m_bom_line` | `fill(bomId)` — create interstitial fillers between items; `distanceBetween()` — measuring tape; `isStripComplete()` — ground truth check |
| `M_AdRoomBoundary` | `ad_room_boundary` | `getByBuilding(type)`, `get(type, roomName)` |
| `MOrderLine` | `c_orderline` | `getByBuilding(type)` |
| `M_AdProductDim` | `ad_product_dim` | `get(productId)` — **units in meters** |
| `MOrder` | `c_order` | `getAll()`, `get(buildingId)` |
| `M_AdRoomSlot` | `ad_room_slot` | `getByRoomType(roomType)` |
| `M_AdTypologyPattern` | `ad_typology_pattern` | `getActive()`, `getByStrategy(strategy)` |
| `M_AdGeometryMap` | `lod_geometry_map` (component_library.db) | `getByBuilding(type)`, `getOrphans(type)` |
| `MCBPartner` | `C_BPartner` | `getAll()` — iDempiere business partners. Pattern scoping migrated to C_DocType.DocSubType (§11.37). |
| `MCDocType` | `C_DocType` | `get(id)`, `getAll()` — DocBaseType (RE/CO/IN) + DocSubType (SH/DX/TB/TE/ST). Drives template selection + BOM scoping. |
| `MBomCategoryLine` | `m_bom_category_line` | `getByParent(categoryValue)` — recursive decomposition recipe (RE→SL/GF/RF) |
| `MBomCategory` | `m_bom_category` | `getByValue(value)` — category lookup (GF, RE, SET, FLOOR, …) |

### Guardrails

- **Never import orm-core in DAGCompiler** — compilation hotpath stays raw batch SQL
- **Never use ModelQuery against `v_*` views** — views are SQL contracts, not entity tables
- **BasePO never commits** — caller (TopologyBatchProcess, test) owns the transaction
- **`ad_product_dim` units are meters** — `getWidth()` returns 0.45 not 450 for a chair
- **Empty string ≠ null** — `get_ValueAsString()` returns `""` for empty DB values,
  not `null`; always check `== null || isEmpty()` in dispatch guards

Run ORMSandbox smoke tests:
```bash
mvn test -pl ORMSandbox
```

## Output DB Schema

The compiler writes to SQLite. Each compilation run creates a fresh output DB via `BuildingWriter.initSchema()` (~40 DDL statements). For the full coordinate flow diagram and table column definitions, see [`DATA_MODEL.md`](../DATA_MODEL.md) §4.

**Browsable template:** `library/output_template.db` is a blank copy of the output schema with an extra `_schema_guide` table documenting every table's purpose and the three-concern lock (WHAT/HOW/WHERE). Open it with `sqlite3` or DB Browser to explore the data model without running the compiler. Regenerate after schema changes with `./scripts/generate_output_template.sh`.

```sql
sqlite3 library/output_template.db "SELECT table_name, description FROM _schema_guide"
```

Key tables:

| Table | Content |
|-------|---------|
| `spatial_structure` | Project → Site → Building → Storey hierarchy |
| `elements_meta` | Every element: guid, ifc_class, name, storey, discipline, material_name, material_rgba |
| `elements_rtree` | Spatial index: id, minX, maxX, minY, maxY, minZ, maxZ |
| `base_geometries` | Vertices/faces BLOBs (float32/int32 arrays) + hash |
| `assembly_components` | BOM parent-child relationships |
| `mep_systems` / `system_nodes` / `system_edges` | MEP system graph |
| `simple_qto` | Quantity takeoff (area, volume, length) |

Query examples:
```sql
-- All toilets on Ground floor
SELECT e.element_name, r.minX, r.maxX, r.minY, r.maxY
FROM elements_meta e
JOIN elements_rtree r ON e.id = r.id
WHERE e.ifc_class = 'IfcFlowTerminal'
  AND e.element_name LIKE 'Toilet%'
  AND e.storey = 'Ground';

-- Glass panels with transparency
SELECT e.guid, e.material_name, e.material_rgba
FROM elements_meta e
WHERE e.material_name = 'Glass';
-- 0.000,0.502,0.753,0.100 → blue glass, alpha=0.1 (90% transparent)
```

## Traps

- `elements_rtree` columns: id, minX, **maxX**, minY, **maxY**, minZ, **maxZ** (NOT interleaved min/max pairs)
- Walls stored as `IfcPlate` (not IfcWall) — SQL must include IfcPlate
- `findByName("ChairDesk")` fails — must pass `%ChairDesk%` with wildcards
- `component_definitions.orientation` can be NULL → `valueOf(null)` throws NPE
- BOM role names must match writer constants: `BRANCH` not `FP_BRANCH`
- World-space geometry: all elements at zero transforms (Pattern B). No transform stacking.
- Library geometry (non-GEO_ hash) uses canonical coords, NOT world coords — bounds check invalid
- `element_instances` column is `guid` (NOT `element_guid`) in the output DB schema
- `lod_geometry_map` ordinals: SH uses GLOBAL ordinals (renumbered), DX uses per-class-per-storey (rank-based lookup)
- `ComponentLibrary.resolveGeometryByInstance()` has TWO lookup strategies: direct ordinal, then rank-based fallback
- Shadow validator matches by placement_id = ordinal — renumber geometry_map to match, never element_rule
- R*Tree uses float32 rounding — use `struct.pack('f')` in Python, don't cast all to float in Java
- OpeningWriter distorts bbox — post-write fixup needed
- TB-LKTN compilation relies entirely on PlacementLoader — StructuralWriter doesn't fire (0 compiled walls)
- TB-LKTN DSL completeness (generative building audit): Grid + rooms + adjacencies = complete. Windows/doors are in element_rules (family_refs now wired to WINDOW_W1/W2/W3 and DOOR_D*). WINDOW declarations missing from DSL text itself — all 11 windows are metadata-only (design gap: DSL should declare `WINDOW north` per room as SH does). Drain perimeter (8 segments) is ABSOLUTE GEN-BOX — pending compiler-agnostic refactor. Furniture BOMs all `is_active=0` (Last Mile deferred). Roof wired to HIP_ROOF_MY (main) + GABLE_PORCH_MY (porch) in metadata; compiler currently still uses GABLE_25 orientation string (pending Java dispatch refactor).
- DSL `.bim` files are opaque manifests — never read or analyze them directly

## Data Provenance: How the Model is Stacked

Three IFC source families feed three layers:

```
  IFC SOURCE FILES          LAYER 1: GEOMETRY       LAYER 2: METADATA         LAYER 3: ROSETTA
  (fossil truth)            (Python extraction)     (SQL migrations)          (spatial validation)
  ════════════════          ═══════════════════     ════════════════          ══════════════════

  Federation DB ─────→ extract_all_components.py ─┐
  (SJTII Terminal,      8,400+ definitions        │
   9 disciplines,                                 │
   51K elements)     migrate_tank_geometry.py ─────┤
                       3 water tanks              │
                                                  ├─→ component_library.db (LOD)
  SampleHouse IFC ───→ import_ifc_furniture.py ───┤     ┌──────────────────┐
  (Ifc4, UK house)      furniture families        │     │ component_geom   │ ← LOD geometry
                                                  │     │ component_defs   │
  Duplex IFCs ──┬───→ import_ifc_furniture.py ────┤     │ lod_geometry_map │
  (Ifc2x3, US)  │      furniture (Phase 109)      │     │ surface_styles   │
                 └──→ extract_duplex_components.py ┘     └──────────────────┘
                        MEP fixtures (Phase 114)
                                                         {PREFIX}_BOM.db (Working)
                                                         ┌──────────────────┐
                                                         │ m_bom/m_bom_line │ ← BOM assembly
  Standards ─────────→ migration_108B..119D.sql ────────→│ c_orderline  │ ← rules + config
  Rosetta findings        (hand-curated,                 │ ad_space_type    │
  Building codes          idempotent)                    │ ad_product_dim   │
                                                         │ ... (~73 tables) │
                                                         └──────────────────┘
                                                               │ (reads)
                                                               ↓
  examples/*.bim → Parser → Compiler → Writer ──────→ DAGCompiler/lib/output/*.db
                                                               │
                                                               ↓ (compares)
  SampleHouse IFC ──→ extract.py ──────────────────→ DAGCompiler/lib/input/*.db
  Duplex IFCs ──────→ extract.py ──────────────────→ DAGCompiler/lib/input/*.db
  Federation DB ────→ extract.py ──────────────────→ DAGCompiler/lib/input/*.db
                           │
                           ↓
                    material_extractor.py ──→ enriches reference DBs with material_name/rgba
                    placement_extractor.py ─→ M_BOM_Line (positions + materials; was: ad_element_placement)
                    spatial_checker.py ─────→ X-ray fidelity scores
```

### Layer 1: Geometry (Python extraction → component_library.db)

**Purpose:** "What does a toilet/door/sprinkler LOOK like?" — mesh vertices, faces, bounds.

| Script | Source | Phase | What it Extracts |
|--------|--------|-------|-----------------|
| `extract_all_components.py` | Federation DB | early | 8,400+ defs: pipes, ducts, beams, columns, sprinklers, doors, windows, furniture, etc. |
| `import_ifc_furniture.py` | Duplex ARC + SampleHouse + Revit ARC | 109 | Residential furniture families (beds, sofas, tables, chairs, cabinets) |
| `extract_duplex_components.py` | Duplex ARC + MEP | 114 | MEP fixtures (WC, lavatory, shower, pendant lights, appliances) |
| `migrate_tank_geometry.py` | Federation DB | 113 | 3 FRP water tank BLOBs (cross-DB copy) |

All scripts use `INSERT OR IGNORE` on `geometry_hash` — identical meshes are deduplicated. Result: **23,888 component definitions** with LOD400 geometry.

### Layer 2: Metadata (SQL migrations → {PREFIX}_BOM.db)

**Purpose:** "How do things ASSEMBLE? Which wall type goes WHERE?" — curated construction knowledge.

Source: `migration/migration_108B.sql` through `migration_119D.sql` (all idempotent). Written by hand from building codes, IPC standards, Rosetta Stone observations, and engineering judgement.

Examples of what Layer 2 encodes:
- `m_bom` / `m_bom_line` ({PREFIX}_BOM.db): BED_SET = bed + side_table, with dx=0.98m offset
- `ad_wall_type`: EXTERIOR + UK_Residential profile → 290mm brick
- `ad_opening_family`: D_EXT_DBL → 1860x2110mm, depth 200mm
- `ad_room_slot`: BATHROOM → BATHROOM_SET assembly at priority 1 (deprecated by bom_category)
- `ad_assembly_manifest`: BED_SET needs 0.6m CLEARANCE on FRONT face

**Layer 2 is NOT extractable** — it's the compiler's learned knowledge, curated over 30+ phases.

### Layer 3: Rosetta Stone (spatial validation)

**Purpose:** "Did we put things in the RIGHT PLACE?" — measure output against real IFC buildings.

| Script | Source | Phase | What it Produces |
|--------|--------|-------|-----------------|
| `populate_sample_house_db.py` | SampleHouse IFC | 118C | Reference DB: 55 elements with world-space bboxes |
| `populate_duplex_db.py` | Duplex ARC+MEP IFC | 114/119B | Reference DB: 1,085 elements with world-space bboxes |
| `rosetta_dictionary.py` | Any DB | 119D | Spatial skeleton: 11-section text dump of spatial facts |
| `spatial_checker.py` | Output DB vs Reference DB | 118C+ | X-ray fidelity score (dimension signature fingerprint) |

Layer 3 **reads but never writes** to `component_library.db`. It compares compiler output against reference DBs to measure spatial fidelity. Findings from Layer 3 feed back into Layer 2 as new migration SQL.

### The Feedback Loop

```
Layer 3 (Rosetta)  ──discovers──→  "Duplex walls are 417mm, not 150mm"
                                          │
                                          ↓
Layer 2 (Metadata)  ←──migration──  migration_119_wall_alignment.sql
                                          │
                                          ↓
Layer 1 (Geometry)                  (unchanged — same meshes, better placement)
```

### Rosetta Stone Pairs (Current — Phase RM-4)

| Stone | IFC Source | Reference DB | Elements | F1 Score |
|-------|-----------|-------------|----------|----------|
| SampleHouse | `SampleHouse.ifc` | `DAGCompiler/lib/input/SampleHouse_extracted.db` | 55 | **100%** |
| Duplex | `Duplex_*.ifc` | `DAGCompiler/lib/input/Duplex_extracted.db` | 1,085 | **100%** |
| Terminal | Federation of 7 IFCs | `DAGCompiler/lib/input/Terminal_Extracted.db` | 51,088 | **~100%** |
| TB-LKTN | *None (generative)* | *None* | 138 | N/A (generative — no reference IFC) |

IFC source files are stored in `DAGCompiler/lib/input/` for SampleHouse and Duplex (Terminal was merged from 7 IFCs into the federation DB). TB-LKTN is the first generative building — 58 elements from relational rules only, no IFC reference. It proves the compiler can generate buildings from pure intent without an existing IFC model.

## Viewing Output (Bonsai Federation Addon)

The primary viewing path is **NOT** GLTF export — it's the **Bonsai Federation addon** in Blender, which reads the output SQLite DB directly.

### Addon Location

```
/home/red1/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/
├── stage2_tessellation_loader.py   # Material creation + geometry loading from DB
├── __init__.py                     # Addon registration
└── ...
```

### How "Full Load" Works

The Federation addon's "Full Load" feature:
1. Connects to the output SQLite DB (`DAGCompiler/lib/output/*.db`)
2. Queries `elements_meta` joined with `element_geometry` + `element_transforms` + `surface_styles`
3. Unpacks binary vertex/face BLOBs from `base_geometries`
4. Creates Blender meshes with materials derived from `material_rgba` + `surface_styles`
5. Positions elements using `element_transforms` (center_x/y/z)

### Material Creation Pipeline (in addon)

```
Output DB
  ├── elements_meta.material_name ──┐
  ├── elements_meta.material_rgba   │  LEFT JOIN on material_name = style_name
  └── surface_styles ───────────────┘
         │
         ↓
  stage2_tessellation_loader.py::get_or_create_db_material()
         │
         ├── Parse RGBA → base color (with gray amplification for subtle colors)
         ├── surface_styles.transparency > 0.01?
         │   YES → blend_method='BLEND', Alpha = 1.0 - transparency
         │   NO  → opaque material
         ├── surface_styles RGB overrides element RGBA when available
         ├── specular_exponent → Blender roughness (inverse mapping)
         └── reflectance_method hints (METAL → metallic=0.9, GLASS → roughness≤0.1)
```

### Key Query (with surface_styles)

```sql
SELECT m.guid, m.ifc_class, m.discipline,
       g.geometry_hash,
       t.center_x, t.center_y, t.center_z,
       m.material_name, m.material_rgba,
       s.transparency, s.specular_ratio, s.specular_exponent,
       s.specular_r, s.specular_g, s.specular_b,
       s.reflectance_method, s.surface_r, s.surface_g, s.surface_b
FROM elements_meta m
JOIN element_geometry g ON m.guid = g.guid
JOIN element_transforms t ON m.guid = t.guid
LEFT JOIN surface_styles s ON m.material_name = s.style_name
ORDER BY g.geometry_hash, m.discipline
```

### Viewing Workflow

```bash
# 1. Compile a building
mvn exec:java -pl DAGCompiler -Dexec.mainClass="com.bim.compiler.dsl.SampleHouseEndToEndTest" -q

# 2. Open Blender with Bonsai addon
# 3. Federation panel → "Full Load" → select DAGCompiler/lib/output/samplehouse.db
# 4. Materials, transparency, and geometry load automatically from DB
```

## Mesh2Library — Parametric Mesh System

Fabricated mesh components (roofs, drain channels) are generated at compile time from
metadata parameters. No Python mesh scripts. No hardcoded vertex lists in Java.

### Sealed Interface

```java
public sealed interface ParametricMesh
    permits GableRoofMesh, HipRoofMesh, HalfRoundDrainMesh {
    MeshResult generate(MeshParameters params);
}
```

Adding a new mesh shape = new `permits` entry + new Java class + 2 SQL rows.
The CompilerContractTest blocks any Python mesh script that sneaks back in.

### Registered Mesh Types (as of Feb 2026)

| mesh_type | Generator | Building use | Params |
|---|---|---|---|
| `GABLE_ROOF_MY` | `GableRoofMesh` | Generic MY residential gable | pitch_deg, overhang_mm, ridge_axis |
| `HIP_ROOF_MY` | `HipRoofMesh` | TB-LKTN main block hip roof | pitch_deg, span_mm, depth_mm, ridge_length_mm, overhang_mm |
| `GABLE_PORCH_MY` | `GableRoofMesh` | TB-LKTN front porch gable | pitch_deg, span_mm, depth_mm, overhang_mm, ridge_axis=Y |
| `GABLE_CANOPY_MY` | `GableRoofMesh` | Generic porch canopy | pitch_deg, overhang_mm, canopy_type |
| `DRAIN_HALFROUND_MY` | `HalfRoundDrainMesh` | TB-LKTN perimeter drain G5 | diameter_mm=230, wall_thickness_mm=40, segment_length_mm=1000, segments_n=16 |

### Three-Table Authority for Fabricated Meshes

```
lod_parametric_mesh_param  → shape parameters (pitch, span, diameter)
m_attribute ({PREFIX}_BOM.db)        → where the mesh sits in the assembly (dx/dy/dz)
ad_product_dim            → resulting bounding box (generated bbox → catalog entry)
```

Fabricated mesh BOM leaves in `ad_product_dim`:
| product_id | W × D × H (m) | Description |
|---|---|---|
| `HIP_ROOF_MY` | 9.9 × 5.4 × 1.26 | TB-LKTN hip roof (rows 3-5) |
| `GABLE_PORCH_MY` | 5.1 × 3.6 × 0.86 | TB-LKTN porch gable |
| `DRAIN_HALFROUND_MY` | 0.23 × 1.0 × 0.115 | 1m drain segment |

### span_mm / depth_mm — Runtime vs Static

For **building-specific mesh types** (HIP_ROOF_MY, GABLE_PORCH_MY): `span_mm` and
`depth_mm` are extracted from 2D layout drawings and stored statically in
`lod_parametric_mesh_param`. The mesh reads them from the DB.

For **generic mesh types** (GABLE_ROOF_MY, GABLE_CANOPY_MY): `span_mm` and `depth_mm`
are **not** in the DB. They are injected at compile time from the ENVELOPE placement
bbox — which is itself computed from the building's room bounds (the 2D grid). So:

```
GRID axes/spacing  →  room bounds (minX, maxX, minY, maxY)
                    →  ENVELOPE placement bbox
                    →  MeshParameters.put("span_mm", (maxY-minY)*1000)
                    →  MeshParameters.put("depth_mm", (maxX-minX)*1000)
```

This is "infer span from 2D layout" — no hardcoded building dimensions in Java.

### Compiler Agnostic Direction (OPEN TODO)

Currently `BuildingWriter.resolveRoofGeometry()` checks
`orientation.startsWith("GABLE_")` and calls the hardcoded `writeGableGeometry()`.
This path bypasses the parametric mesh system. The `family_ref` in C_OrderLine
now records the intent (e.g., `HIP_ROOF_MY`) but the Java dispatch has not been refactored yet.

**Required Java change:** replace `writeGableGeometry()` with:
1. Read `family_ref` from placement → look up `lod_parametric_mesh.generator_class`
2. Load `lod_parametric_mesh_param` → build `MeshParameters`
3. Inject runtime dims: `span_mm`, `depth_mm` from placement bbox (for generic types)
4. Dispatch: `new GableRoofMesh()` / `new HipRoofMesh()` per `generator_class`
5. Write `MeshResult` to output DB

Same refactor unlocks `HalfRoundDrainMesh` for the perimeter drain (currently GEN-BOX).

### Drain Perimeter (OPEN TODO — blocked on Java refactor above)

`IfcSlab_drain_1` through `_8` are currently `ABSOLUTE + GEN-BOX (8v/12f)`.
Target: `BOUNDARY/PERIMETER + HalfRoundDrainMesh (68v/132f, LOD400 N=16)`.
`DRAIN_HALFROUND_MY` is registered in DB — only the Java dispatch path is missing.
Perimeter offset: 700mm from outer wall face (aligns with roof eave drip line).

## Relational Placement (Phase RM)

The compiler uses relational rules instead of flat coordinates for element placement.

### Placement Mode

Controlled by `ad_sysconfig.placement_mode`:
- `FLAT` — reads coordinates from M_BOM_Line / legacy extraction archive (Terminal only)
- `RELATIONAL` — computes coordinates from C_OrderLine + grid/room/wall metadata (current)

Toggle without code change: `UPDATE ad_sysconfig SET config_value='FLAT' WHERE config_key='placement_mode'`

### Relational Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `ad_building_grid` | Structural grid lines per building | axis, line_ref, offset_mm |
| `ad_room_boundary` | Rooms mapped to grid cells | room_ref, grid_min_*, grid_max_* |
| `ad_wall_face` | Room boundary faces → wall type + adjacency | room_ref, face_direction, wall_type |
| `c_orderline` (C_OrderLine — Construction Order Details) | Element placement rules (host + position + family) | host_type, host_ref, position_rule, material_name |
| `ad_element_dependency` | Parent-child cascade chain | parent_ref, child_ref, dependency_type |

### Resolution Flow

```
c_orderline (what + where)
  → host_ref → ad_wall_face (which wall face)
    → room_ref → ad_room_boundary (which room)
      → grid cells → ad_building_grid (grid offsets)
        → COMPUTED coordinates (minX, maxX, minY, maxY, minZ, maxZ)
```

`RelationalResolver.java` implements this chain. Shadow validation confirms computed coords match flat oracle within 0.001mm.

## Validation (PlacementProver)

`PlacementProver.java` runs 14 mathematical proofs in 5 tiers after compilation:

| Tier | Proofs | Scope | Requires |
|------|--------|-------|----------|
| 1 | P01-P04 | Per-element arithmetic | Coordinates only |
| 2 | P05-P06 | Pairwise relations | Coordinates only |
| 3 | P07-P09 | Host-element containment | Relational metadata |
| 4 | P10-P12 | Topological closure | Wall face + room data |
| 5 | P13-P14 | Conservation laws | Grid + slab data |

The prover is **non-blocking** — it reports violations but never prevents emission. Score remains the arbiter.

Architectural boundary: `BoundElement` constructor = THE GATE (enforces mesh-fits-bbox). `PlacementProver` = THE AUDIT (reports anomalies).

## DAO Pattern (orm-core)

**Rule:** Use DAO for all new resolver code. Raw JDBC is legacy — permitted in production paths already committed, not in new code.

### Three modules, three roles

| Module | Package | When to use |
|--------|---------|-------------|
| `orm-core` | `com.bim.orm` | Shared PO base + query builder. Zero business logic. |
| `ORMSandbox` | `com.bim.ormsandbox` | Building inspector, preflight checks, standalone tools. |
| `TopologyMaker` | `com.bim.topology` | Typology/UBBL domain — its own PO layer. |

`DAGCompiler` may import `orm-core` (Phase 4c added this dep). It does NOT import ORMSandbox PO classes.

### How to use ModelQuery

```java
// Load all m_bom_line rows for a given BOM (conn = {PREFIX}_BOM.db)
List<X_M_BOMLine> children = new ModelQuery<>(conn, X_M_BOMLine::new, X_M_BOMLine.Table_Name)
    .where("bom_id = ?", bomId)
    .orderBy("sequence ASC")
    .list();

// Load a product_dim by product_id (conn = {PREFIX}_BOM.db)
X_AdProductDim dim = new ModelQuery<>(conn, X_AdProductDim::new, X_AdProductDim.Table_Name)
    .where("product_id = ?", productId)
    .first();  // returns null if not found
```

### PO naming convention

- `X_` prefix — plain PO (column getters/setters, no business logic)
- `M_` prefix — domain model (adds factory methods, lifecycle, validation)
- Table_Name constant: `X_M_BOMLine.Table_Name = "m_bom_line"` (must match actual table)
- PK field: TEXT PK must be set explicitly before `save()` — `BasePO.isNewRecord` flag determines INSERT vs UPDATE

### BasePO trap

`isNewRecord` is an explicit flag — not derived from PK presence. TEXT PKs are non-blank before `save()` but the row may not exist yet. Always set `isNewRecord = true` for new objects:

```java
X_M_BOMLine child = new X_M_BOMLine(conn);
child.setBomId("SOFA_AREA");
child.setSequence(1);
child.markAsNew();   // sets isNewRecord = true
child.save();        // → INSERT
```

### What BOMCascadeResolver needs

```java
// BOMTreeLoader — DAO-only, no JDBC
BOMNode loadTree(Connection conn, String rootBomId) {
    List<X_M_BOMLine> rows = new ModelQuery<>(conn, X_M_BOMLine::new, X_M_BOMLine.Table_Name)
        .where("bom_id = ?", rootBomId)
        .orderBy("sequence ASC").list();
    // recursively load child_bom_id subtrees
    ...
}
```

See `BOMTreeLoader.load()` (Phase G-1 Step 2) as the canonical working example — shared AD-layer tree loader used by both `BOMTierResolver` and `FloorPlateBOMResolver`.

---

## Where to Start

1. Read `USER_GUIDE.md` for DSL syntax and the four buildings
2. Run an E2E test (`SampleHouseEndToEndTest`), then query the output DB
3. Read `BuildingSpecs.java` — the 26 record types are the compiler's vocabulary
4. Read the relational tables: C_OrderLine (Construction Order Details), `ad_wall_face`, `ad_building_grid`
5. Add a simple BOM recipe (SQL only) and see it appear in output
6. Read `ConstructionAsERP.md` for the full theory
7. Read `CurrentState.txt` for known issues and architectural trade-offs
8. Read [`BIM_COBOL.md`](../BIM_COBOL.md) — the construction programming language (12 verbs, 63 witnesses). Start with the scoreboard in §2.4, then the formula coverage table in §4.3
