# SQLite Schema — BIM OOTB Viewer Database

> **The innovation:** IFC → web-ifc WASM → SQLite BLOBs → Three.js GPU. No server. No format conversion. No proprietary viewer. One DB per building, straight from the IFC standard to the browser.

**Updated:** 2026-05-19

---

*For a full feature comparison against Autodesk APS, IFC.js, and Trimble, see [Feature Comparison](FeatureComparison.md).*

## Architecture: Why SQLite Beats Autodesk/Bonsai

| Traditional (Autodesk/Revit) | BIM OOTB |
|---|---|
| Proprietary binary format (.rvt) | Open SQLite + IFC |
| Server-side rendering (Forge/ACC) | Client-side Three.js from DB BLOBs |
| Viewer requires cloud account + API key | Zero install, zero account |
| Geometry locked in application | Raw Float32Array vertices in DB — any tool can read |
| IFC export lossy | IFC is the source — round-trip guaranteed |
| 4D/5D bolt-on product (Navisworks) | Same DB, same tables, same viewer |

| Traditional (Bonsai/IfcOpenShell) | BIM OOTB |
|---|---|
| Python + C++ dependency chain | Single WASM file (web-ifc, 1.3MB) |
| Blender GPU required for viewing | Browser WebGL — any device |
| IfcOpenShell tessellation (slow, OOM on large) | web-ifc tessellation (fast, handles 48K elements in seconds) |
| Bbox recalculated from vertices | Bbox extracted from IFC IfcBoundingBox representation |
| GPL entanglement (Blender) | MIT license throughout |

**Security & Collaboration:** When this DB is contributed to the shared gallery, a 3-layer cryptographic verification chain (HMAC pipeline attestation + Ed25519 identity + transport integrity) ensures only valid, verified databases are accepted. See [`EnterpriseAuthentication.md`](EnterpriseAuthentication.md).

---

## Schema (10 tables, one DB)

Produced by `scripts/extractIFC2DB.js` (Node.js) or browser Drop IFC (`import_worker.js` + `import_db_builder.js`). Both produce identical output.

### Core Tables

```sql
-- Project identity
CREATE TABLE project_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);
-- Keys: project_name, building_name, import_date, source_file, source_uri
-- source_uri: Origin URI of the IFC (supports https://, future ifc:// scheme).
--   Enables provenance tracking, re-fetch/recompile, and interoperability
--   with emerging IFC URI standards (e.g. proposed ifc:// addressing).

-- Element catalog (WHAT is in the building)
CREATE TABLE elements_meta (
    guid TEXT PRIMARY KEY,       -- IFC GlobalId
    ifc_class TEXT,              -- e.g. IfcWall, IfcBeam, IfcPipeSegment
    element_name TEXT,           -- User-visible name from IFC
    storey TEXT,                 -- Building storey assignment
    discipline TEXT,             -- ARC/STR/MEP/ELEC/PLB/ACMV/FP
    material_name TEXT,          -- IFC material name (if assigned)
    material_rgba TEXT,          -- "r,g,b,a" colour string (null = use discipline colour)
    building TEXT                -- Building name (for multi-building DBs)
);

-- Spatial placement + IFC-extracted bounding box
CREATE TABLE element_transforms (
    guid TEXT PRIMARY KEY,
    center_x REAL,              -- World-space centroid X (metres)
    center_y REAL,              -- World-space centroid Y
    center_z REAL,              -- World-space centroid Z
    rotation_x REAL,            -- Rotation (radians)
    rotation_y REAL,
    rotation_z REAL,
    bbox_x REAL,                -- IFC BoundingBox width (metres) — NOT computed from vertices
    bbox_y REAL,                -- IFC BoundingBox depth
    bbox_z REAL                 -- IFC BoundingBox height
);

-- Geometry instancing (deduplication via content hash)
CREATE TABLE element_instances (
    guid TEXT PRIMARY KEY,
    geometry_hash TEXT           -- FNV-1a hash of centred vertices + indices
);

-- Geometry BLOBs (shared across elements with same hash)
CREATE TABLE component_geometries (
    geometry_hash TEXT PRIMARY KEY,
    vertices BLOB,              -- Float32Array, centred at origin, Z-up
    faces BLOB,                 -- Int32Array (triangle indices)
    normals BLOB,               -- Float32Array, precomputed vertex normals (Z-up)
    building TEXT
);
```

### 4D Scheduling Tables (empty if IFC has no schedule data)

```sql
CREATE TABLE schedules (
    schedule_id TEXT PRIMARY KEY,
    name TEXT,
    status TEXT,
    created_date TEXT
);

CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    schedule_id TEXT,
    name TEXT,
    start_date TEXT,
    finish_date TEXT,
    duration_days REAL,
    status TEXT
);

CREATE TABLE task_sequences (
    predecessor_id TEXT,
    successor_id TEXT,
    sequence_type TEXT,         -- FINISH_START, START_START, etc.
    lag_days REAL DEFAULT 0,
    PRIMARY KEY (predecessor_id, successor_id)
);

CREATE TABLE task_elements (
    task_id TEXT,
    guid TEXT,                  -- Links task → building element
    PRIMARY KEY (task_id, guid)
);
```

---

## Key Design Decisions

### 1. Geometry centred at origin + world-space centre
Each element's vertices are centred at (0,0,0). The viewer positions them via `center_x/y/z`. This enables:
- **Instancing**: identical shapes share one geometry BLOB regardless of position
- **Deduplication**: FNV-1a hash of centred vertices → same shape = same hash
- Terminal: 48,428 elements → 9,394 unique geometries (81% dedup, 45% smaller DB)

### 2. IfcBoundingBox separation
web-ifc's `GetFlatMesh` returns multiple geometry entries per element. One may be the IfcBoundingBox (8 vertices, 36 indices). We detect it, extract dimensions, skip it from body mesh. Without this, small fittings get oversized highlight boxes.

### 3. Near-white material skip
85% of elements get default white surface style from IFC authoring tools. We skip materials with R,G,B all > 0.95 — the viewer uses discipline-based colours instead (ARC=beige, STR=grey, MEP=green). Real colours (grey concrete, blue pipes) are preserved.

### 4. Auto-scale heuristic
IFC files may use mm or m. If element SPREAD > 500 in any axis, assume mm → divide by 1000. Uses spread (MAX-MIN), not absolute coords — buildings at large grid offsets (e.g. Singapore SVY21) stay in metres.

### 5. Single DB = both extracted + library
Browser Drop produces one DB with all tables. The viewer assigns the same handle to `extDb` and `libDb`. For OCI hosting, the same file is served as both `_extracted.db` and `_library.db`. No split needed.

---

## Extraction Paths

| Path | Engine | Use case |
|---|---|---|
| `scripts/extractIFC2DB.js` | web-ifc (Node.js) | Batch extraction, <100K elements |
| Browser Drop IFC | web-ifc (WASM) | Interactive import in viewer |
| `scripts/extract_merge_disciplines.py` | IfcOpenShell (Python) | Large merged IFCs >200MB (per-discipline) |

All three produce the same schema. Viewer doesn't distinguish source.

---

## Viewer Pipeline

```
SQLite DB → sql.js WASM → query elements_meta + element_transforms
  → stream geometry BLOBs from component_geometries
  → Float32Array → THREE.BufferGeometry → GPU
  → precomputed normals BLOB skips computeVertexNormals() (zero CPU at load)

Pick: click → raycast → guid → SELECT bbox_x,y,z → yellow highlight box
Filter: storey/discipline → hide/show InstancedMesh instances
4D: BroadcastChannel relay — viewer runs GROUP BY queries, sends results
    to boq_charts.html (no DB re-load, sub-second render)
```

No intermediate format. No conversion. DB BLOBs ARE the GPU buffers.
Normals precomputed at IFC extraction time — viewer just copies and applies Y↔Z swap.

---

## Authorship Map — What's Ours vs Third-Party

### Third-party libraries (loaded from CDN, not modified)

| Library | License | What it does | How loaded |
|---|---|---|---|
| [web-ifc](https://github.com/ThatOpenCompany/engine_web-ifc) @0.0.77 | MPL-2.0 | C++/WASM IFC parser + tessellator | CDN `unpkg.com` in `import_worker.js` |
| [sql.js](https://github.com/sql-js/sql.js) @1.10.3 | MIT | SQLite compiled to WASM — runs SQL in browser | Local `lib/` (CDN fallback) |
| [Three.js](https://github.com/mrdoob/three.js) r160 ESM | MIT | WebGL 3D renderer + BatchedMesh | Local `lib/` (CDN fallback) |
| [dxf-parser](https://github.com/gdsestimating/dxf-parser) | MIT | DXF file parsing for 2D plans | Vendored minified `dxf-parser.js` |
| [ExcelJS](https://github.com/exceljs/exceljs) | MIT | Excel export for BOQ charts | CDN `cdnjs.cloudflare.com` |

None of these libraries are modified. They are called via their public APIs.

### Original BIM OOTB scripts (all by Redhuan D. Oon, MIT)

| Script | What it does | Novelty |
|---|---|---|
| `import_worker.js` | Calls web-ifc API → extracts entities → 4×4 transform, Y→Z-up, centroid re-centre, discipline classify, storey map, material extract, geometry dedup (FNV-1a hash), auto-scale mm→m, **precompute vertex normals**, multi-file merge | The extraction pipeline — turns raw web-ifc output into structured DB records |
| `import_db_builder.js` | Takes extracted data → creates 10-table SQLite schema via sql.js, stores normals BLOB | The schema design — BOM-based, instanced, 4D-ready |
| `streaming.js` | Queries DB → streams BLOBs → Float32Array → Three.js BufferGeometry → GPU | **The core innovation** — DB BLOBs are GPU buffers, no intermediate format |
| `picking.js` | Raycast → GUID → SQL query → highlight box from bbox | Click-to-identify from DB, not scene graph |
| `navigate.js` | Storey/discipline filter, search, tree panel | SQL-driven navigation, not IFC hierarchy |
| `section_cut.js` | Clipping plane computed from DB geometry | Section cut from DB, not mesh boolean |
| `elevation.js` | 2D elevation projected from DB geometry | Elevation from DB BLOB vertices |
| `scene_to_db.js` | Three.js scene → write back to SQLite DB | Reverse pipeline — browser edits persist to DB |
| `ifc_export_worker.js` | DB → IFC STEP/ISO-10303-21 text file | Pure text generation — **no web-ifc dependency** |
| `mesh_import_worker.js` | DAE/OBJ/GLB → DB (uses Three.js loaders from CDN) | Multi-format import to same DB schema |
| `diff.js` | Compare two DBs (base vs variation) | Variation order / design diff from SQL |
| `walk.js` | First-person walk mode | Camera + collision from DB spatial data |
| `sitecam.js` | GPS/compass/AR mobile camera overlay | Real-world BIM overlay |
| `scene.js`, `panels.js`, `helpers.js`, `city.js`, `wizard.js`, `nlp.js`, `locale_loader.js`, `grid_dims.js`, `rates.js`, `title_block.js`, `dxf_export.js`, `semantic_enrichment.js`, `variation_order.js` | UI, i18n, enrichment, export | All original |

### The innovation boundary

web-ifc, sql.js, and Three.js each solve one problem. **No existing project combines them into a serverless BIM pipeline.** The original contribution is:

1. **Schema design** — 10 tables that hold an entire building as queryable data
2. **Extraction pipeline** — IFC entities → classified, instanced, centroid-recentred DB records
3. **DB-to-GPU streaming** — SQLite BLOB → Float32Array → BufferGeometry with zero conversion
4. **Round-trip** — browser edits → DB → IFC export, closing the loop without a server
5. **R-tree clash detection** — `rtree-sql.js` WASM (2025) enables O(n log N) spatial clash queries entirely in the browser. The critical enabler for S245-S246 clash detection, proximity LOD, and deep-link sharing. See [VibeProgramming.md §Technology Convergence](../VibeProgramming.md#the-technology-convergence--why-this-was-impossible-before-2025) for the full timeline.

---

## WASM Engine: rtree-sql.js — Source, Safekeeping, Contribution

### The Engine That Makes This Possible

The entire BIM OOTB viewer runs on **one npm package**: [`rtree-sql.js`](https://www.npmjs.com/package/rtree-sql.js) v1.7.0 by Daniel Barela (`danielbarela`). It is a rebuild of [sql.js](https://github.com/sql-js/sql.js) with a single compile flag added: `-DSQLITE_ENABLE_RTREE=1`. That flag enables SQLite's R-tree spatial index module — the algorithm (Guttman, 1984) that gives us O(log N) spatial queries instead of O(n²) cross-joins. Without it, clash detection on 48K elements is mathematically impossible in a browser.

**The package is effectively abandoned.** Three versions ever published (1.0.0, 1.0.1, 1.7.0). Last update: 3 June 2022. No public GitHub repository. No documentation beyond the sql.js README. No maintainer activity in 3 years.

### Local Safekeeping

CDN dependency is a single point of failure. Local copies are kept for continuity:

```
BIMOOTB/lib/rtree-sql/
  sql-wasm.js      — 49KB  (WASM loader, MIT license)
  sql-wasm.wasm    — 631KB (SQLite 3.x + R-tree, compiled via Emscripten)
```

Verified working: R-tree `CREATE VIRTUAL TABLE ... USING rtree(...)` executes successfully. This is the exact binary served by `cdn.jsdelivr.net/npm/rtree-sql.js@1.7.0/dist/`.

The WASM binary is also vendored locally at `deploy/dev/lib/sql-wasm.wasm` for local-first loading (CDN fallback).

### Source Repositories

| Package | Source | License | Status | Our dependency |
|---------|--------|---------|--------|----------------|
| **rtree-sql.js** v1.7.0 | No public repo (npm only, `danielbarela`) | MIT | **Stale** — last update Jun 2022 | **Critical** — loaded on every page view |
| **sql.js** v1.14.1 | [github.com/sql-js/sql.js](https://github.com/sql-js/sql.js) | MIT | Active (Ophir Lojkine) | Upstream of rtree-sql.js |
| **SQLite** (C source) | [sqlite.org/src](https://sqlite.org/src/dir?ci=tip) | Public domain | Active (D. Richard Hipp) | Compiled into WASM |
| **Emscripten** | [github.com/emscripten-core/emscripten](https://github.com/emscripten-core/emscripten) | MIT | Active (Alon Zakai + community) | Compiler toolchain |
| **Three.js** r160 ESM | [github.com/mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT | Active | 3D renderer |
| **web-ifc** v0.0.77 | [github.com/ThatOpenCompany/engine](https://github.com/ThatOpenCompany/engine) | MPL-2.0 | Active | IFC parser (import only) |

### Live Demonstration — Shareable Clash Deep-Link

The R-tree powers the entire clash detection pipeline: spatial index → O(log N) query → fly-to → shareable URL. This link opens a specific clash pair in the Hospital Garage (63K elements), pre-positioned at the overlap zone:

[**Open Clash Pair — Hospital Garage MEP vs ARC**](https://red1oon.github.io/bim-ootb/viewer/viewer.html?db=buildings%2FHospitalGarage_extracted.db#clash=0GjpF04mX1K8P$TdM8fU2_~3ltWc9XO98DfOXi0yjJr4p&st=&cam=-44.21,-8.22,-42.42&tgt=-52.01,-7.95,-35.39&tol=25)

URL anatomy:
```
?db=...HospitalGarage_extracted.db     ← SQLite DB with R-tree
#clash=GUID_A~GUID_B                   ← the two clashing elements
&st=                                   ← storey (empty = whole building)
&cam=-44.21,-8.22,-42.42               ← camera position (metres)
&tgt=-52.01,-7.95,-35.39               ← camera target (look-at point)
&tol=25                                ← tolerance in mm
```

What happens on load: viewer opens DB → builds R-tree async → parses `#clash` URL → locates both elements by GUID → positions camera → highlights overlap zone in red/blue. **Zero server. Zero login. Zero install.** Paste this URL in WhatsApp — the recipient sees the 3D clash on their phone.

### How to Rebuild from Source

Since rtree-sql.js is abandoned, we can rebuild from sql.js (its upstream) at any time:

```bash
git clone https://github.com/sql-js/sql.js
cd sql.js

# Add R-tree flag to Makefile (the ONLY change Barela made)
# Find the SQLITEFLAGS line and append:
#   -DSQLITE_ENABLE_RTREE=1

make

# Output: dist/sql-wasm.js + dist/sql-wasm.wasm (with R-tree enabled)
# Verify:
node -e "
const fs = require('fs');
const initSqlJs = require('./dist/sql-wasm.js');
initSqlJs({ wasmBinary: fs.readFileSync('./dist/sql-wasm.wasm') }).then(SQL => {
  const db = new SQL.Database();
  db.run('CREATE VIRTUAL TABLE t USING rtree(id, x0, x1, y0, y1, z0, z1)');
  console.log('R-tree: OK');
});
"
```

This produces a newer SQLite (with memory fixes from 2024-2025) while retaining R-tree support. Consider publishing as a maintained fork if contributing upstream fails.

### Contribution Opportunities

Areas where our production experience gives us unique credibility to contribute back:

#### To sql-js/sql.js — R-tree as a standard build option

| What | Why we're qualified | Where |
|------|-------------------|-------|
| PR: R-tree build variant | We are likely the heaviest production user of R-tree in WASM. [Issue #390](https://github.com/sql-js/sql.js/issues/390) has been open since 2020, unanswered. | PR to sql-js/sql.js |
| Benchmark: large DB stress testing | 48K–126K elements, batch INSERT into R-tree, spatial query timing on mobile | Issue with data |
| Documentation: BLOB-to-GPU pattern | No application in any industry streams geometry from SQLite BLOBs to WebGL. We invented this pipeline. | Wiki or example |

#### To Three.js — InstancedMesh from database BLOBs

| What | Why we're qualified | Where |
|------|-------------------|-------|
| Example: SQLite → BufferGeometry → InstancedMesh | Working pipeline: `new Float32Array(blob)` → `setAttribute('position', ...)` → GPU. No tutorial exists. | three.js/examples |
| Mobile GPU instancing limits | Real data: which phones fail at which element count, memory thresholds | Documentation |
| DLOD §S274 per-slot/instance frustum culling | r160 native BM culling + IM zero-scale. See `docs/FeatureComparison.md` §Visibility Culling. | `viewer/dlod.js` |

#### To web-ifc / That Open Engine — IFC4 edge cases at scale

| What | Why we're qualified | Where |
|------|-------------------|-------|
| Tessellation bugs at scale | 48K elements across 7 disciplines — we've hit edge cases others haven't. | Bug reports with reproducible IFC files |
| IFC → SQLite extraction pipeline | Our `extractIFC2DB.js` is a reference implementation: entity classification, transform extraction, geometry dedup. | Documentation contribution |

#### To SQLite (sqlite.org forum) — R-tree in WASM real-world data

| What | Why we're qualified | Where |
|------|-------------------|-------|
| R-tree performance in WASM: benchmarks | Timing: batch INSERT of 48K bboxes, spatial query latency on mobile Chrome/Safari. The SQLite WASM team has no BIM/3D users. | [Forum post](https://sqlite.org/forum) |
| BLOB streaming at scale | Using SQLite as a geometry delivery format (not just data storage) is unprecedented. Our experience informs their WASM roadmap. | Forum post |

#### New npm package — maintained fork

| What | Rationale |
|------|-----------|
| Publish `@bimootb/sql-rtree` (or similar) | Our most critical dependency is a 3-year-old package from an inactive author. One npm unpublish and our CDN breaks. Own your supply chain. |
| Include: R-tree + FTS5 (future full-text search) | FTS5 enables "search by element name" across 48K elements — future feature with zero cost to add at compile time. |
| Pin SQLite version, test against our DBs | Regression testing with real buildings, not toy data. |

---

## Kernel Ops — Transactional Operation Log

Every user action in the viewer (pick, filter, grid move, section cut) is recorded in an append-only `kernel_ops` table inside the same SQLite DB. This is the **fossil record** of the design session — enabling undo/redo, state replay on reload, and 4D Time Machine playback.

### Schema

```sql
CREATE TABLE kernel_ops (
    id INTEGER PRIMARY KEY,        -- Auto-increment, total ordering
    timestamp INTEGER NOT NULL,    -- Date.now() epoch ms
    op_type TEXT NOT NULL,         -- GRID_MOVE, VIEW_FILTER, ELEMENT_PICK, SESSION_START, ...
    parameters TEXT NOT NULL,      -- JSON blob — op-specific data
    input_guids TEXT,              -- JSON array of affected element GUIDs (nullable)
    output_guid TEXT,              -- Created/modified entity ID (nullable)
    undone INTEGER DEFAULT 0,      -- 0=active, 1=undone (soft delete)
    user_tag TEXT DEFAULT 'local'  -- Multi-user tag (future: collaborative sessions)
);
CREATE INDEX idx_kernel_ops_type ON kernel_ops(op_type);
CREATE INDEX idx_kernel_ops_undone ON kernel_ops(undone, id);
```

### Operations

| Operation | What it records | Undo behaviour |
|---|---|---|
| `SESSION_START` | Page load timestamp | — (boundary marker) |
| `ELEMENT_PICK` | IFC class, name, discipline, storey, GUID | — (read-only) |
| `GRID_MOVE` | Label, axis, old/new position | Restore previous position |
| `GRID_DETECT` | Detected grid lines from slab geometry | Remove detected grids |
| `VIEW_FILTER` | Storey/discipline visibility toggle | Restore previous filter |
| `SECTION_CUT` | Clipping plane axis + position | Remove section |

### Undo / Redo

Linear undo stack — most recent non-undone op is undone first:

```
commitOp(db, 'GRID_MOVE', {label:'A', axis:'x', from:0, to:5}, [guid1])
undoOp(db)   → marks op as undone=1, returns {op_type:'GRID_MOVE', parameters:{...}}
redoOp(db)   → clears undone flag on earliest undone op
```

The caller is responsible for applying the reverse transform (e.g., moving the grid back). The log records intent, not geometry — keeping it small and queryable.

### Replay on Reload

On page load, `replayOps(db, 'GRID_MOVE')` returns all non-undone ops in order. The grid system re-applies each move to restore the exact state from the previous session. This survives browser refresh because `kernel_ops` is persisted to IndexedDB via debounced write (2s after last op).

### Compaction

`compact(db)` runs on page load to prevent unbounded log growth:

1. **Delete undone ops** — they'll never be redone after reload
2. **Collapse consecutive GRID_MOVE** — drag produces 100s of intermediate positions; keep only the final position per label+axis
3. **Prune old sessions** — keep only the last 2 `SESSION_START` boundaries

### Time Machine Integration

The Time Machine (4D playback) reads `kernel_ops` as a fossil record of construction phases. Each op's timestamp maps to a construction timeline position. The TM can:
- Replay the sequence visually (show/hide elements by op timestamp)
- Scrub backwards/forwards through the design history
- Export the sequence as a 4D schedule

### Persistence Flow

```
User action → commitOp() → INSERT into kernel_ops → debounced IDB write
             ↓
Browser DB (sql.js in memory) ←→ IndexedDB (bim_ootb_cache, ArrayBuffer)
             ↓
IFC Export → kernel_ops table included in exported .db file
```

The same SQLite DB that holds geometry also holds the operation log. Export the DB → you export the full design history. Import it back → history replays automatically.

---

## Extended Domain: ERP in the Same Browser

The SQLite-in-browser pattern extends beyond BIM. The full iDempiere Application Dictionary (500+ windows, 15K+ fields) runs in the same stack: PostgreSQL AD → SQLite export → sql.js WASM → browser UI. Same DB engine, same WASM runtime, same zero-install principle. See [**AD-in-Browser (iDempiere)**](ERP.md) for the full spec.

---

## Proven Scale

| Building | Elements | Unique Hashes | DB Size |
|---|---|---|---|
| Terminal | 48,428 | 9,394 | 268MB |
| LTU AHouse | 125,698 | — | 56MB (old path) |
| Hospital | 63,917 | — | 90MB (old path) |
| Ifc4_Revit | 11,412 | 3,724 | 41MB |
| HHS Office | 6,871 | 3,265 | merged 6 IFCs |
| WBDG Office | 7,000 | 4,141 | merged 3 IFCs |
