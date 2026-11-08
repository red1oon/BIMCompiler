---
description: Technical feature paper for BIM OOTB — in-browser IFC parsing, clash detection, 4D/5D analysis and instanced rendering in a serverless, local-first BIM viewer.
---
# BIM OOTB — Technical Feature Paper
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **For the ERP side**, see the one-page evaluator companion — **[Migrate & Compare (ERP)](MigrateComparisonPaper.md)** — legacy ERP vs the WASM event-sourced browser.
>
> **Authoring / prior-art record:** **[Event-Sourced Geometry as a Fold over a Signed Operation Log](ModellerKernelFold.md)** — the dated disclosure of geometry-as-replay over the same signed log that carries the ERP records, with a cross-system comparison.

## What It Is

BIM OOTB is a browser-based IFC viewer that runs entirely on the client. No server. No cloud subscription. No software to install. Open a URL, drop an IFC file, and view a full BIM model with construction scheduling, cost breakdown, and clash detection — all in a single browser tab.

The viewer handles buildings from 200 to 122,000+ elements with smooth orbit, pick, and section cut — and a **whole-city view that streams a 1,000,000+ element city** (52 buildings, 24 archetypes) in the same single browser tab. After first load, it works offline from local cache.

The viewer is read-only by design. Alongside it now ships an early **browser BIM authoring modeller** — **DAGeVu** — and a "choose your door" landing that wires viewer, modeller, and the ERP engine over one shared signed op-log. These are covered in the **DAGeVu — Browser BIM Authoring Modeller** section below; the bulk of this paper documents the mature read-only viewer.

## How It Works

### IFC In, Building Out

An IFC file is parsed once into a SQLite database. Geometry is content-hashed and deduplicated — identical columns, beams, or fittings share one mesh. The database is cached locally in the browser's IndexedDB. On return visits, the building loads from cache in under one second.

### Split-Database Streaming

For large buildings (15,000+ elements), the database is split into three files:

| File | Size (Terminal, 48K elements) | Loads in |
|------|------|----------|
| Positions (bbox centres) | 1.1 MB | <1 second |
| Metadata (properties, transforms) | 17 MB | 1-2 seconds |
| Geometry (mesh BLOBs) | 249 MB | Background stream |

The viewer shows the building outline instantly from positions, populates storey/discipline panels from metadata, and streams real geometry in the background sorted by camera distance — nearest elements appear first. You can orbit, pick, and filter while geometry is still loading.

### Rendering Pipeline

The viewer uses [Three.js r184](https://threejs.org/) (Apr 2025) with physically-based rendering (PBR). Upgraded from r160 across 24 releases — r184 brings better uniform uploads, tighter draw call batching, and a WebGPU-ready architecture with seamless WebGL fallback. See [Three.js release notes](https://github.com/mrdoob/three.js/releases) and [WebGPU migration guide](https://threejs.org/docs/#manual/en/introduction/Installation).

- **Geometry instancing**: Elements sharing the same shape are rendered as a single GPU draw call via `BatchedMesh`. A 122K-element building produces roughly 15,000 draw calls instead of 122,000.
- **IFC-faithful materials**: Colours are extracted from the IFC's own `IfcSurfaceStyle` definitions. Where the IFC author assigned no colour (common in Revit exports), a class-based palette provides physically plausible defaults — concrete is warm grey, steel is reflective, glass is smooth and blue-tinted.
- **Per-class PBR properties**: Roughness and metalness vary by IFC class. Structural steel (IfcBeam, IfcColumn) is smooth and reflective. Concrete (IfcSlab, IfcWall) is rough and matte. Glass (IfcWindow, IfcCurtainWall) is near-mirror.
- **Cinematic tone mapping**: ACESFilmic with tuned exposure. No washed-out greys.
- **Procedural environment map**: vertex-coloured gradient sky via PMREMGenerator — subtle reflections on all PBR materials without HDR textures.
- **Batched X-ray**: material `needsUpdate` spread across 3 frames (45 materials per frame) — eliminates GPU shader recompile stutter on toggle.

### Visibility Culling (DLOD)

Two-tier frustum culling, both pure visibility — no geometry simplified or replaced:

- **BatchedMesh** (unique elements): Three.js r184 `perObjectFrustumCulled` handles per-slot culling natively inside `renderer.render()` — zero JS cost. 84% of slots hidden when camera is inside a room.
- **InstancedMesh** (repeated elements, desktop only): Custom zero-scale matrix trick hides off-screen instances. ~32% hidden at typical zoom. ~1.5ms tick for 35K instances.

Mobile skips the custom DLOD tick entirely — r184 native culling handles BatchedMesh, and InstancedMesh buffer re-upload (`instanceMatrix.needsUpdate`) costs more than it saves on mobile GPUs. Instead: on-demand render gate (skip `renderer.render()` when idle) + DPR 0.75 during orbit (44% fewer pixels while dragging) + render throttle (1/10 frames during streaming) + 20K bbox cap (sampled for buildings >20K elements).

What you see is exactly what is in the IFC file — no proxies, no LOD geometry, no simplification.

**WebGPU status (S276b):** The viewer is WebGPU-ready — `navigator.gpu.requestAdapter()` detects hardware WebGPU and activates `WebGPURenderer` automatically. Currently all browsers fall back to WebGL r184 (Intel iGPU = no adapter, mobile = skipped for stability, Chrome Linux PRIME = SwiftShader rejected). WebGL r184 performs better than r160 even without WebGPU — the upgrade delivers improved batching, native frustum culling, and cleaner shader compilation. WebGPU will activate automatically when browser/GPU support matures.

### City-Scale Streaming — 1,000,000+ elements (S285)

The same viewer scales from one building to an entire city: **1,035,522 elements across 52 buildings (24 archetypes)** in one browser tab, with no server. Five techniques make a million elements tractable on a desktop browser:

- **Facade-first residency.** A city is mostly hidden services — across the city, MEP/plumbing/structure is ~86% of elements; the architectural facade (ARC) is only ~14% (145K elements). The city streams **ARC only** by default, so the whole facade builds and stays resident. Structure and MEP for a building load on demand when you go into it. From the street you never see a building's pipes, so they are never fetched or built.
- **Element-count memory budget.** Residency is bounded by **element count (~250K, the measured browser-pressure knee)**, not bytes — the honest limit for geometry the browser can hold. The whole ARC facade (145K) sits comfortably under it and is never evicted while panning the overview.
- **Visibility streaming by ray-blast.** A 6×4 grid of rays from the camera is tested against one axis-aligned bounding box per building (≈52 boxes, sub-millisecond) — first-hit per ray gives free occlusion: a building behind another is never streamed. The set of streamed buildings follows the camera.
- **Distance/visibility eviction with hysteresis.** Buildings that leave the view are demoted back to their bounding-box placeholder and their geometry freed — farthest and largest first, never the small spread-out buildings (kept as cheap context), and only after being out of view for two consecutive frames (no pop-off/pop-back churn). A ghost sweep frees any straggler mesh whose building was evicted mid-stream.
- **Incremental BVH.** Bounding-volume hierarchies are built only for newly-added geometry in a single background pass — never a re-walk of the whole geometry cache — so a heavy building no longer stalls the tab.

The launch sprouts small buildings first (they render fast and are visibly spread out), then fills in the large ones. Entering a building (it fills ~70% of the view) frees the distant facades and meshes that one building in full.

## Feature Overview

### Viewing
- Orbit, pan, zoom with mouse or touch
- Pick any element to see IFC properties (class, name, storey, material, dimensions)
- X-ray mode (transparent) and wireframe mode
- Section cut at any angle
- Night mode with adjustable ambient lighting
- Storey filter and discipline filter (Architecture, Structure, MEP, Electrical, Plumbing, ACMV)
- Colour Palette panel — 5 sliders for exposure, sun intensity, ambient, hemisphere, and tone mapping
- Walk mode with GPS blue-dot tracking, device orientation (accelerometer/gyroscope), wall X-ray on approach

### IFC Import and Export
- Drop any IFC file into the browser — parsed into SQLite, cached locally, no upload
- **IFC export**: reconstruct a valid IFC STEP file from the SQLite database, download directly from the browser. No server, no web-ifc dependency — pure STEP/ISO-10303-21 text generation
- 4D Excel export: 3-sheet workbook (schedule, project summary, discipline/phase breakdown)
- 5D BOQ Excel export: 7-sheet workbook (cover, executive summary, material/labour/equipment, BOQ, work packages, discipline breakdown, provisions)

### 2D
- Section cut views
- Elevation generation
- Grid overlay with drag-to-recompile
- Door arc generation from IFC openings
- Dimension chains
- Doc Canvas: AABBCC lettered/numbered grid derived from column cadence, with circle bubbles and dimension labels

### 4D Construction Scheduling
- Time Machine: scrub through construction phases on a timeline
- Elements appear in construction sequence with frontier highlighting
- Cinematic drone tour auto-generated from building storeys
- Gantt chart overlay with phase progress
- Gantt Phase Stepper: step through construction phases one at a time, meshes materialise per phase
- Closed 360 BIM↔ERP loop: selecting a model element lights its matching project line back in the ERP (and vice-versa) over a shared signed op-log — one identity, two separate surfaces, no server

### 5D Cost
- Bill of Quantities extracted from IFC element dimensions — browser-side JavaScript BOM extractor groups elements by storey, discipline, and IFC class
- Cost dashboard with phase-by-phase breakdown
- 17 country-specific rate templates
- Building envelope, storey heights, floor-to-floor deltas, column cadence and bay proportions computed automatically
- Budget-vs-actual variance twin: the Time Machine reads the *stored* Planned↔Committed figures off the project records (not a re-computation), so the cost story scrubs in lockstep with the 4D
- Shopfloor cost-element S-curve: a stacked Material/Labour/Burden/Overhead accrual folded from the project's manufacturing orders — each bucket sums to the phase's planned amount to the cent (BigDecimal)

### Clash Detection
- R-tree spatial index built from element bounding boxes
- Configurable clash rules (tolerances per discipline pair)
- Two-point distance measurement tool
- Snag reporting with QR codes that deep-link back to the clashing elements

### Sharing
- Share a URL — recipient sees the exact camera angle, picked element, storey filter, x-ray state, clash pair, Time Machine cursor, and tour state
- Native OS share sheet on mobile (Web Share API)
- Share preview card on desktop with canvas snapshot
- QR code generation for on-site access
- No account required to view

### Doc Pill (Design Interface)
- Red Pill icon toggles a 9-icon document design interface
- Contains: Home, Grid, Time Machine, Phase Stepper, Open, Save, MEP Routes, UBBL Compliance Checklist, Rosetta Stone Calibration
- Automatic BOM extraction on entry
- Rosetta Stone calibration mode: drag grid to align with real building geometry for verification

### Search and Navigation
- Find panel with inline voice search (microphone in search bar)
- NLP natural-language queries ("show me all walls on level 2")
- Context-aware filter chips auto-generated from loaded building's top IFC classes
- Help Tree: 6 expandable entries (Time Machine, Find, Section, Clash, Palette, Issues) with blue/red bar toggle

## Performance

Measured on a standard laptop (Intel i7, integrated GPU, Chrome):

| Building | Elements | Geometry DB | Cache Load | Draw Calls | Orbit FPS |
|----------|----------|-------------|------------|------------|-----------|
| SampleHouse | 218 | 0.4 MB | instant | 45 | 60 |
| FZKHaus | 620 | 1.2 MB | instant | 89 | 60 |
| Clinic (federated MEP) | 16,114 | 72 MB | <1s | ~1,800 | 60 |
| Terminal | 48,428 | 249 MB | <1s | ~2,000 | 45-60 |
| Hospital | 63,182 | 318 MB | <1s | ~3,500 | 30-45 |
| LTU A-House | 122,330 | 379 MB | <1s | ~15,000 | 20-30 |

All measurements with geometry cached in IndexedDB. First load depends on network speed for the initial database download.

## Spatial ERP — Browser-Based ERP Engine

BIM OOTB includes an ERP engine using iDempiere's Application Dictionary
(AD) rendered in a browser via SQLite WASM. Full specification: `docs/ERP.md`.

### Architecture

Three-layer separation (ERP.md §11):
- **Data:** 5 core tables (containers, items, documents, document_lines,
  journal) + kernel_ops event log. Legacy iDempiere tables (C_BPartner,
  M_Product, etc.) coexist in the same SQLite database for imported
  reference data.
- **Logic:** Business rules as pure JavaScript functions (`rules/*.js`).
  Each takes a db handle + document ID, reads via SQL, writes via
  `commitOp()`. Independently testable.
- **Presentation:** Constellation globe (initbubble.json, <300ms first
  paint), cascading accordion drill, compiled manifest for field
  definitions.

AD metadata (13MB, 1,003 table definitions, 59K rows) is treated as
compile-time input. A build script extracts the needed window/tab/field
definitions into a ~2KB manifest.json. The browser loads the manifest,
not the full AD. See ERP.md §13.

### Database Coverage

ad_seed.db contains 356 of iDempiere's 1,003 tables (35%). Missing
tables are server-only infrastructure (~400: processors, auth, alerts,
import staging, views, translations) and advanced business modules
(~250: manufacturing, commissions, dunning, subscriptions, quality
control). All GardenWorld business data and all AD metadata are present.
See ERP.md §16.1.

Storage: PostgreSQL GardenWorld ~350MB; SQLite equivalent 12.1MB (29x
compression). 151 bytes/row vs 500-800 in PostgreSQL. Difference is
MVCC, WAL, TOAST, and system catalog overhead — required for multi-user
servers, unnecessary in single-user browser. See ERP.md §16.2.

### Current State

| Capability | Status |
|---|---|
| AD menu tree (826 nodes) | Working |
| Window/Tab/Field rendering | Working |
| FK resolution (Name lookup) | Working |
| DisplayLogic (conditional fields) | Working |
| CRUD (Create/Read/Update/Delete) | Working |
| Data Globe (spatial constellation) | Working |
| Instant globe (<300ms, no WASM) | Working |
| Cascading accordion drill | Working |
| QR code + deep links (?window, ?record, ?client) | Working |
| kernel_ops (undo/redo/audit) | Working |
| Journal (double-entry accounting) | Working |
| Compiled manifest | Specified (ERP.md §13) |
| Kernel invariant enforcement (10 rules) | Specified (ERP.md §15.1) |
| Settings JSON (cross-OOTB config) | Specified (S282) |

### Construction ERP vs Primavera / Procore

| Capability | BIM OOTB | Primavera P6 | Procore | SAP PS |
|---|---|---|---|---|
| 4D Schedule + 3D Model | Same browser tab | Separate tools | Separate | Separate |
| 5D Cost + BOQ | Extracted from IFC | Manual input | Manual | Manual |
| Budget-vs-actual variance | Twin folded from one op-log¹ | Yes (full EVM/CPM) | Limited | Yes |
| Offline | Yes | No | No | No |
| Server required | No | Oracle DB | Cloud | SAP HANA |
| Licence cost | Free (MIT) | $3-8K/user/yr | $375+/mo | Enterprise |
| IFC integration | Native | None | Limited | None |
| BOM from model | Automatic | N/A | N/A | Manual |
| Install | URL | Desktop | Cloud | On-premise/cloud |
| ERP foundation | iDempiere AD (open) | Proprietary | Proprietary | Proprietary |

¹ Planned↔Committed and the shopfloor cost S-curve fold from the same signed op-log as the 3D/4D, so they can never drift — the honest claim is this *unification + log-native what-if*, **not** a CPM engine (no resource levelling or critical-path depth like P6).

### iDempiere Relationship

ERP OOTB uses iDempiere's AD as the source for UI metadata. The
compiled manifest preserves the AD's tab hierarchy, field ordering,
FK relationships, and mandatory flags in a 2KB JSON file. Legacy
tables from the PostgreSQL export coexist with the 5-table runtime
model. When a user needs a feature served by a table not yet loaded
(e.g., C_Commission), the manifest defines its structure and data is
fetched on demand. See ERP.md §16.6.

## Comparison

| Capability | BIM OOTB | Autodesk APS (Forge) | IFC.js / ThatOpen | Trimble Connect |
|---|---|---|---|---|
| Runs in browser | Yes | Yes | Yes | Yes |
| Server required | **No** | Yes (cloud) | No | Yes |
| Works offline | **Yes** | No | No | No |
| Install required | **None** | None | npm build | Desktop or web |
| IFC colour fidelity | **IfcSurfaceStyle extracted** | Proprietary conversion | WASM parse | Proprietary |
| IFC export from browser | **Yes (STEP format)** | No | No | No |
| Max elements (smooth) | **125K** | ~50K (server tiles) | ~20K | Server-rendered |
| Load from cache | **<1 second** | N/A (cloud) | N/A | N/A |
| 4D scheduling | **Integrated** | Separate product | No | Separate |
| 5D cost | **Integrated** | Separate product | No | Separate |
| Clash detection | **Integrated** | Separate (Navisworks) | No | Limited |
| BOM extraction | **Automatic from IFC** | Manual | No | No |
| Design interface (2D grids) | **Doc Pill + AABBCC grid** | Separate tools | No | No |
| Voice search | **Integrated (NLP + mic)** | No | No | No |
| Walk mode + GPS | **Integrated** | No | No | No |
| Cost | **Free** | Metered API | Free (library) | Licensed |
| Vendor lock-in | **None (IFC standard)** | SVF/SVF2 proprietary | IFC standard | Proprietary |
| ERP integration | **Built-in (AD engine)** | None | None | None |
| Construction scheduling | **4D in same viewer** | None | None | None |
| Browser authoring (B-rep) | **DAGeVu (spine-proven, op-log fold)** | No | No | No |

### Key Differences

**vs Autodesk APS**: Autodesk requires a cloud pipeline — IFC uploads to their server, converts to a proprietary format (SVF2), and streams pre-processed tiles back. This takes minutes per model, costs per API call, and cannot function offline. BIM OOTB processes IFC once into SQLite and runs entirely from local cache thereafter.

**vs IFC.js / ThatOpen Company**: IFC.js parses IFC files in the browser using a WASM module at load time. This works for small models but becomes slow above 20K elements because it re-parses geometry on every page load. BIM OOTB pre-extracts geometry into a SQLite database with content-hash deduplication, so repeat visits load from cache without re-parsing.

**vs Desktop viewers (Solibri, BIMvision, Navisworks)**: Desktop applications require installation, licensing, and specific operating systems. BIM OOTB runs on any device with a browser — including tablets on a construction site with no internet after the initial cache.

## IFC Geometry: What Authoring Tools Actually Export

A common objection to mesh-based BIM viewers is that triangle meshes lose the mathematical precision of B-rep (boundary representation) solids — NURBS surfaces, exact booleans, parametric history. This is technically true but misidentifies where the loss occurs.

### The IFC Tessellation Chain

Authoring tools (Revit, ArchiCAD, Tekla) maintain B-rep internally for interactive editing. But when they export to IFC, they tessellate:

| IFC Representation | What It Is | Who Exports It |
|---|---|---|
| `IfcFacetedBrep` | Planar polygonal faces (triangle soup) | Revit, ArchiCAD, most exporters |
| `IfcTriangulatedFaceSet` | Explicit triangle mesh (IFC4) | Revit (IFC4 mode), Tekla |
| `IfcExtrudedAreaSolid` | Linear extrusion of a 2D profile | All (simple walls, columns) |
| `IfcSweptSolid` | Profile swept along a path | ArchiCAD, Tekla |
| `IfcAdvancedBrep` | NURBS surfaces (true B-rep) | Virtually no production exporter |

A dome that is a parametric `Revolution` family inside Revit's `.rvt` arrives in the IFC as `IfcFacetedBrep` — thousands of flat triangles. The B-rep was discarded by the authoring tool's own exporter, not by the viewer.

### Downstream Industry Practice

No commercial BIM workflow downstream of authoring operates on B-rep:

- **Navisworks** (Autodesk's own clash detection) — tessellated meshes internally
- **Solibri** (model checking) — tessellated meshes
- **Robot / ETABS** (structural analysis) — simplified stick/shell models, not NURBS
- **CostX / Procore** (cost estimation) — quantities from schedules + faceted visual reference
- **Primavera P6** (4D scheduling) — no geometry at all
- **Trimble FieldLink** (site layout) — survey points and coordinates

If Autodesk's own billion-dollar coordination product (Navisworks) runs clash detection on tessellated meshes, the precision is sufficient for construction delivery.

### Where B-rep Matters (and Where It Doesn't)

B-rep kernels (OpenCascade, Parasolid) are essential for **design authoring** — push/pull faces, fillet edges, compute precise booleans. That is Revit's job.

Construction-phase BIM — viewing, measuring, clash detection, 4D scheduling, 5D costing, field coordination — operates on the **IFC deliverable**, which is already tessellated at source. Sub-millimeter measurement accuracy is a coordinate precision problem (Float64), not a surface representation problem.

BIM OOTB consumes the IFC file as-is. What the architect exported is what the site team sees. No re-modelling, no re-tessellation, no geometry invented beyond what the authoring tool provided.

## DAGeVu — Browser BIM Authoring Modeller

The viewer described above is read-only by design — it consumes the IFC deliverable and never invents geometry. Alongside it now sits an **authoring counterpart**: **DAGeVu**, a browser BIM geometry-authoring surface shipped on GitHub Pages (first landed in PR #370 with 13 witnesses; many follow-ups since). It is a **separate surface** — it does not load or touch the production read-only viewer.

This is an **early, spine-proven authoring surface**, not a finished CAD application. What it demonstrates is the core thesis rather than a complete feature set.

### Geometry as a Fold over a Signed Op-Log

DAGeVu treats an **occt-wasm B-rep kernel as a pure `ops → mesh` function**. The **signed operation log IS the feature tree**, and the displayed geometry is a deterministic **fold** (replay) over that log — the same op-log philosophy that drives the ERP engine described above, where business records are likewise a fold over a signed `kernel_ops` log. Geometry and ERP records ride the *same kind* of signed log. The dated prior-art disclosure of this idea is recorded in **[Event-Sourced Geometry as a Fold over a Signed Operation Log](ModellerKernelFold.md)**.

(The surface was renamed from "Bonsai" to **DAGeVu** to avoid a brand clash with BlenderBIM's Bonsai add-on. The internal `window.Bonsai` API, the `bonsai_*.js` filenames, and the `W-BONSAI-*` witness IDs are unchanged — only user-facing strings moved.)

### Shipped Capabilities

- **occt B-rep kernel rendered through Three.js** — the occt-wasm mesh output renders through the same Three.js r184 pipeline as the viewer (`W-BONSAI-VIEWER`).
- **Signed op-log feature tree** — every authoring op is a signed entry on the in-viewer `kernel_ops` log; history replay and pick-cut fold the model from the log (`W-BONSAI-SIGNED`, `W-BONSAI-RECIPE`).
- **planegcs sketch constraint solver** — a 2D sketch is solved into a constrained profile that drives the occt extrude (`W-BONSAI-SKETCH`).
- **Depth ops** — sweep along a path, plus fillet / chamfer edge ops (route-sweep / fillet-chamfer depth track, PR #376; `GEOM_SWEEP` leg).
- **BOM-hierarchy INSERT catalog** — insert library components at a chosen LOD via a filter + cheat-sheet + tree picker (`W-BOM-CATALOG`, PR #386), backed by **real library meshes** lazily loaded on insert, preferring detail over box matches (`W-BOM-MESH`, PRs #387–#388).
- **Recursive BOM-assembly insert** — drop a whole house / floor / room / set in a single action, with a ported wall-anchored layout walk and component orientation (`W-BOM-ASSEMBLY`, PR #393; layout/orient follow-ups PRs #389–#394).
- **Operability** — grid-move preview with numeric dimension input (PR #380); Iso / Top view presets and zoom-to-fit (PR #381); placement, edit, delete, point-undo, persistence across reload (PRs #378–#379).
- **op_hash-keyed incremental regen cache** — shape and mesh reuse keyed by op hash, so re-folding the log does not re-evaluate unchanged ops (PR #382).
- **Bonsai-style Outliner** — a collapsible richer Find over the signed op-log (`W-BONSAI-OUTLINER`).
- **Authoring grid + IFC4 export** — snap-to-grid 2D correlation (`W-BONSAI-GRID`) and IFC4 export of the authored signed op-log (`W-BONSAI-IFC`).
- **Lucide line icons + authoring audio** and a bottom-right pill rail (PRs #371, #404).

### Connect Scene — One Shared History Across BIM and ERP

The viewer, the DAGeVu modeller, and the ERP engine are **separate surfaces** that share one signed op-log. **Connect Scene** (PRs #383–#385) is the cross-surface context broker over that log: the surfaces stay independent, and only **selection, timeline, and identity** cross between them. Proven legs are P0 (broker), P1 (selection), P2 (timeline — one log, two folds, that co-vanish on undo; `W-CONNECT-TIMELINE`), and P3 (identity / commit; `W-CONNECT-IDENTITY`). This is the concrete realization of *one shared history* spanning the geometry fold and the ERP record fold.

### Morpheus — Choose-Your-Door Landing

A "choose your door" front door (`index2.html`, PRs #372–#374) wires the read-only viewer, the DAGeVu authoring modeller, and the ERP engine behind an 8-icon launcher, including real drop-your-own-IFC import into the same extraction pipeline the viewer uses.

## Architecture

```
IFC File
  ↓  (extract once)
SQLite Database (.db)
  ├── elements_meta      — guid, class, name, storey, discipline, material_rgba
  ├── element_transforms  — position (cx, cy, cz), rotation, bbox
  ├── element_instances   — geometry_hash (content-addressed dedup)
  └── component_geometries — vertex/index/normal BLOBs
  ↓  (browser loads from URL or cache)
sql.js (SQLite over WASM)
  ↓  (query → BufferGeometry)
Three.js r184
  ├── InstancedMesh    — elements sharing geometry (2+ instances)
  ├── BatchedMesh      — single-instance elements grouped by bucket
  └── MeshStandardMaterial — PBR with per-class roughness/metalness
  ↓
WebGL → Screen
```

No server in the loop. No WebSocket. No REST API. The browser is the entire application.

## Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Rendering | [Three.js r184](https://threejs.org/) ESM | WebGL/WebGPU, BatchedMesh, InstancedMesh, PBR |
| Database | sql.js (SQLite WASM) | Query engine in browser |
| Spatial index | rtree-sql.js 1.7.0 | R-tree for clash detection |
| Caching | Service Worker + IndexedDB | Offline-first, cache-first |
| BVH | three-mesh-bvh 0.8.0 | Accelerated raycasting for pick |
| Tone mapping | ACESFilmic | Cinematic colour grading |
| Export (Excel) | SheetJS | 4D schedule + 5D BOQ multi-sheet workbooks |
| Export (IFC) | Custom STEP writer | IFC STEP/ISO-10303-21 generation from SQLite |
| Voice | Web Speech API | NLP voice commands + Find search |
| Location | Geolocation + DeviceOrientation | Walk mode GPS + accelerometer |
| Share | Web Share API + Canvas | Native share sheet + preview snapshot |
| ERP | iDempiere AD + sql.js | Application Dictionary renderer in browser |
| Authoring kernel | occt-wasm (OpenCascade) + planegcs | B-rep `ops → mesh` fold + 2D sketch constraint solver (DAGeVu) |

All open-source dependencies. No proprietary components.

## Catalogue

33 buildings from public IFC test files, ranging from a 65-element sample house to a 125,698-element university campus (LTU A-House, Sweden). Includes residential, commercial, hospital, airport terminal, and federated MEP models.

## Contact

Open source. MIT licence.
GitHub: [github.com/red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler)

---

*BIM OOTB — Frictionless BIM. View, author, and run the ERP in one browser, over one signed log. Zero install.*
