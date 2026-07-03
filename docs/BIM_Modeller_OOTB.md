# BIM Modeller OOTB — The Browser as Modelling Computer
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **Related:** [The ERP World View](MANIFESTO.md) · 2D Layout Architecture · SQLite3D Schema · BOM Compilation · Discipline Validation

<div class="bim-banner" markdown>
<b>A modeller is not a program that writes files.</b> It is an interactive log of operations applied to a database. The browser is the ideal runtime for this log.
</div>

---

## The Claim

The browser is not a viewer with modelling features bolted on. It is a better modelling environment than Revit, Bonsai, or ArchiCAD — for a structural reason, not a feature reason.

**The geometry kernel and the data model are the same runtime.**

This is not incremental improvement. It is inverting the modelling stack.

---

## Why Two-Click Measurement Unlocks the Argument

Open the viewer. Click a wall face. Click a column centre. Read `6.42 m`.

That is not a measurement feature. It is proof that five primitives are working together in a unified coordinate space. Understanding what those primitives are — and what they imply — is the entire theoretical foundation.

### The Six Lines That Matter

```javascript
// 1. Screen pixel → Normalised Device Coordinate [-1,+1]
mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

// 2. NDC → ray through camera frustum into world space
raycaster.setFromCamera(mouse, camera);

// 3. Ray → triangle intersection → exact world-space point (metres)
const hits = raycaster.intersectObjects(meshes, false);
const point = hits[0].point.clone();   // THREE.Vector3, IFC world metres

// 4. Store first point, second click gives second point
// 5. Euclidean distance in 3D — one call
const dist = p1.distanceTo(p2).toFixed(2) + 'm';
```

Everything else in `measure.js` is UI chrome. The measurement kernel is six lines.

### The Five Primitives

**1. NDC conversion** maps any screen size to the same [-1,+1] square the GPU uses. One division, one multiply, one offset.

**2. Ray casting** — `raycaster.setFromCamera()` constructs a ray from the camera position through the pixel's projection onto the near plane, extending to infinity in world space. The entire projection pipeline — camera position, field of view, aspect ratio, view matrix — is reduced to one call. The application sees a ray, not a matrix stack.

**3. Möller–Trumbore intersection** — `intersectObjects()` tests the ray against every visible triangle using the Möller–Trumbore algorithm and returns hits sorted by distance. `hits[0].point` is the exact 3D world-space coordinate where the ray pierced the nearest triangle surface — not an approximation, but the interpolated intersection point in metres in the IFC coordinate system.

**4. World-space coordinates** — because the DB stores `center_x/y/z` in metres and vertices are centred at origin with placement removed, every mesh sits at its correct IFC world position. The hit point is directly comparable to `element_transforms` data. A measurement from wall face to column centre is meaningful in the same unit system the architect used. No coordinate transform required.

**5. `Vector3.distanceTo()`** — `√((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)`. One method. In metres. Because the scene is in metres.

### Why the Shared Coordinate Space Is the Whole Argument

The measurement works because the scene and the database share the **same coordinate space**. The hit point from the raycaster is in the same space as `element_transforms.center_x/y/z`. This was a deliberate schema decision at extraction time: raw world-space metres, no recentring, no intermediate coordinate system.

That shared coordinate space is what makes every modelling operation a short step from measurement:

| Modelling operation | What it is in this coordinate space |
|---|---|
| **Snap to element** | Hit point + `SELECT WHERE center_x BETWEEN ? AND ?` → nearest element. Already in `picking.js`. |
| **Place element** | `INSERT INTO element_transforms VALUES (hit.point.x, hit.point.y, hit.point.z)`. The hit point IS the placement coordinate. |
| **Dimension constraint** | `p1.distanceTo(p2) < tolerance` — already in `measure.js` line 1463 (same-spot area detection). |
| **Clash** | Two hit points define a bounding volume; the R-tree query is already built in `measure.js`. |
| **Grid alignment** | Hit point X/Y → `SELECT position FROM grid_lines ORDER BY ABS(position - ?) LIMIT 1`. |
| **Section cut** | Hit point Z → scissors plane. Already in `tools.js`. |

The raycaster doesn't know it's measuring. It's finding 3D coordinates. Everything the modeller needs is a different question asked of the same coordinate.

---

## The Modelling Inversion

> *"Revit treats save as a moment. This treats save as continuous. Every click, drag, and extrude is recorded the instant it happens. The file is not the source of truth — the log is. Exporting to IFC is rendering to a format, not saving your work."*

Every traditional modelling tool separates two things that should be one: the geometry kernel (C++, native, fast) and the data layer (SQL, IFC, or proprietary binary). They talk through an API. That API is the source of most of the save/export/reload friction, the collaboration bottleneck, and the crash recovery problem.

In this architecture, the separation does not exist:

| Traditional modelling | Browser modelling |
|---|---|
| Geometry kernel (C++) + separate data layer | WASM SQLite — kernel AND data in same process |
| Save → export → reload cycle | DB is always live |
| Undo/redo as bolt-on memory stack | `kernel_ops` log — replay to any point, survives reload |
| Collaboration requires server | IndexedDB + WebRTC delta sync, peer-to-peer |
| Crash recovery from autosave file | Replay `kernel_ops` from last committed op |
| Plugin API separate from core | Every module replaceable at runtime via `<script>` |

### The Kernel-Op Log

The pattern is not new. SolidWorks has the FeatureTree. Revit has Regen. Every parametric modeller records an operation history and replays it to regenerate geometry. What is new here is making **the log the primary storage** and **running it in a browser without a native application**.

```sql
CREATE TABLE kernel_ops (
    id          INTEGER PRIMARY KEY,
    timestamp   INTEGER,
    op_type     TEXT,     -- PLACE, EXTRUDE, BOOLEAN, SWEEP
    parameters  JSON,     -- { profile: "rect", depth: 3000, … }
    input_guids JSON,     -- Elements this operates on
    output_guid TEXT,     -- Element created or modified
    changelog_id INTEGER  -- Links to AD_ChangeLog
);
```

All modelling reduces to three composable primitives:

| Primitive | SQL representation |
|---|---|
| **Place** — position an element at a world coordinate | `INSERT INTO element_transforms (center_x, center_y, center_z)` |
| **Extrude** — profile + depth → mesh | `kernel_ops` row; Web Worker re-evaluates geometry BLOB |
| **Boolean** — union / subtract / intersect | `kernel_ops` row; `input_guids` marks source elements; **Manifold** library handles the geometry |

`component_geometries` becomes a **cache** of evaluated recipes, not the source of truth. When a wall height changes, the recipe is updated, the geometry hash is invalidated, and a Web Worker re-evaluates the BLOB. The scene repaints. No save. No export.

**The profile is an `M_Product`.** Common cross-sections — rectangular, circular, L-shape, C-shape, hollow box — are stored as `M_Product` rows with `IsBOM=N` and a `profile_vertices` BLOB (a 2D polyline in the product's local plane). This means a profile is not hardcoded geometry. It is a catalog entry: swappable by `M_Product_Category`, priced via `M_PriceList`, jurisdictionally constrained by `AD_Val_Rule`, and replaceable at the order level via `C_OrderLine` exception. The Extrude primitive becomes: look up the profile product, extrude its vertices by depth, write the resulting mesh to `component_geometries`. Changing the profile is a product swap — the same Configure-to-Order pattern the ERP layer uses everywhere.

**Boolean operations use Manifold.** [Manifold](https://github.com/elalish/manifold) is a C++ geometry library (Apache 2.0, active maintainers, used in Blender 3.x+) with a pre-built WASM target. It handles union, subtraction, and intersection on triangle meshes robustly and fast — without OpenCascade, without CGAL, without the GPL. A Web Worker loads the Manifold WASM module, applies the Boolean to the two input geometry BLOBs, and writes the result as a new `component_geometries` row. The originals are not deleted — they are marked `hidden=1` in `elements_meta`, preserving the operation history for undo.

### Constraints as SQL Queries

The discipline validation rules — sprinkler spacing ≥ 3 000 mm, emergency light within 6 m of exit — are already expressed as SQL predicates in `AD_Val_Rule`. Modelling constraints are the same thing:

```sql
-- Wall must align to grid
SELECT COUNT(*) FROM element_transforms t
WHERE t.guid = ?
  AND NOT EXISTS (
    SELECT 1 FROM grid_lines g WHERE ABS(t.center_x - g.position) < 0.3
  );
-- 0 = satisfied. 1 = rejected, UI highlights violation.
```

The solver runs on every `kernel_op` commit. The BOM placement verbs in BBC.md — PLACE, STACK, MIRROR, ARRAY, ROUTE — are the operation vocabulary. The constraint system is the same `AD_Val_Rule` engine the compiler uses for regulatory validation, extended to interactive spatial constraints.

---

## What Is Already Running

The foundation is not theoretical. It is in production:

| Capability | File | Status |
|---|---|---|
| Two-click length, area measurement | `measure.js` | Done |
| Clash detection — R-tree spatial index, rule-driven | `measure.js` | Done |
| 2D grid overlay — scissors, saved sections, print | `grid_overlay.js` | Done |
| `AD_ChangeLog` — full op audit, before/after | `bim_changelog` table | Done |
| Web Worker geometry evaluation off main thread | `import_worker.js`, `ifc_export_worker.js` | Done |
| `kernel_ops`-style routing — RouteWalker | `routewalker.js` → `RW2D-` elements in DB | Done |
| Constraint engine — discipline validation | `AD_Val_Rule` SQL predicates | Done |
| 126K elements at 60fps — browser, no server | `streaming.js` + Three.js InstancedMesh | Done |

---

## Tracing Forward — How Every Modeller Is Built

Before defining the next category, it is worth tracing the underlying instrumentation of existing modellers. Every one of them — Autodesk Revit, Blender/Bonsai, ArchiCAD, SketchUp, Rhino — is assembled from the same five components. The components differ in implementation. The structure is invariant.

### The Five Components of Any Modeller

**1. A geometry kernel** — the mathematical engine that produces surfaces, solids, and meshes from parametric input. Revit uses ShapeManager (Autodesk's proprietary ACIS derivative). Rhino uses OpenNURBS. Bonsai uses OpenCascade via IfcOpenShell. SketchUp uses its own push-pull engine. These kernels are written in C++, compiled natively, and are the deepest dependency in the stack. They are also the highest barrier to entry, the highest maintenance cost, and the primary source of version incompatibility between tools.

**2. A document model** — the file format that serialises the modelling session. `.rvt` (Revit), `.blend` (Blender), `.pln` (ArchiCAD), `.3dm` (Rhino). These are proprietary binary formats. Opening them requires the originating application. They are the lock-in mechanism — not by malice, but because the document model and the kernel are tightly coupled. Changing one breaks the other.

**3. An operation history** — every parametric modeller records what was done, not just the result. Revit's Regen regenerates families from parameters. Blender's modifier stack applies operations in order. SolidWorks' FeatureTree is the definitive example. The history is the source of truth; the geometry is the rendered output. This is the correct insight — and it is buried inside proprietary formats where no external tool can read it.

**4. A constraint system** — relationships between elements. A door stays centred in a wall when the wall moves. A beam follows a column. Dimensions drive geometry rather than annotating it. This is implemented as a solver — a specialised engine that propagates constraint changes through a dependency graph. In Revit, this is the parametric engine. In Grasshopper, it is the visual DAG. In FreeCAD, it is the topological naming problem — still unsolved after a decade.

**5. A collaboration layer** — how multiple authors work on the same model simultaneously. Revit: central file on a shared drive (or BIM 360 server). ArchiCAD: Teamwork server. Blender: no native solution. The collaboration layer is always a server. Always a licence cost. Always a configuration burden.

### How Each Component Maps to This Architecture

| Component | Revit | Blender/Bonsai | This architecture |
|---|---|---|---|
| **Geometry kernel** | ShapeManager (proprietary C++) | OpenCascade via IfcOpenShell (C++) | web-ifc WASM (import) + Three.js GPU (render) + BLOB cache (store) |
| **Document model** | `.rvt` binary — application-locked | `.blend` binary — application-locked | SQLite DB — open, queryable by any tool, any language |
| **Operation history** | Regen / parametric families (embedded in .rvt) | Modifier stack (embedded in .blend) | `kernel_ops` table — SQL rows, readable, replayable, diffable |
| **Constraint system** | Parametric solver (proprietary) | No native constraint solver | `AD_Val_Rule` SQL predicates — same engine as regulatory validation |
| **Collaboration** | Central file server / BIM 360 | No native solution | IndexedDB + WebRTC DataChannel + CRDT on `kernel_ops` log |

Every component exists in this architecture. None requires a native application. None requires a server. None requires a proprietary format. The document model is an open standard (SQLite). The operation history is a SQL table. The constraint system is the same rules engine already validating building codes.

### Where Blender's Complexity Was Crushed

Blender is the most capable open-source 3D environment available. It is also a geometric modeller bolted on top of a render engine bolted on top of a Python scripting host — three different architectural layers that were never designed together. For BIM specifically, this produces compound complexity:

- Every BIM operation must cross the Python → C++ boundary (IfcOpenShell) and the C++ → GPU boundary (Blender's render pipeline) and the GPU → IFC boundary (export). Three translations per operation.
- The modifier stack is powerful but opaque to external tools — a `.blend` file's modifier history is not queryable by SQL, not diffable by git, not readable by a Java compiler or a browser.
- City-scale geometry (1M elements) required an R-tree spatial index and a custom bake pipeline of four parallel `subprocess.Popen` workers — engineering built *around* Blender's constraints, not *with* Blender's capabilities.
- The Geometry Nodes parametric system, while impressive, is a visual programming environment with no database integration. Its "parameters" live in the node graph, not in a schema anyone else can read.

The browser approach does not compete with Blender on rendering fidelity or artistic capability. It eliminates the need for Blender's specific role in the BIM pipeline: the role of *geometry host* and *IFC intermediary*. That role is taken by the SQLite DB, the WASM runtime, and Three.js. What remains of Blender's value — physics simulation, rendering, animation — is orthogonal to BIM modelling and unaffected.

### What IfcOpenShell Actually Is — Stripped to Its Core

Once you trace the five components through every modeller, a question becomes unavoidable: what is IfcOpenShell's fundamental role?

The answer, when stripped of its C++ machinery and Python API, is this: **IfcOpenShell is a classification dictionary parser.**

The IFC schema defines a vocabulary — `IfcWall`, `IfcColumn`, `IfcDoor`, `IfcBuildingStorey`, `IfcCostSchedule` — and a set of property schemas that describe what attributes each type can carry. This vocabulary could, in principle, be applied to *any* geometry representation. It is not intrinsically tied to BREP. It is not intrinsically tied to STEP serialisation. The classification is the valuable thing. The geometry carrier is incidental.

IfcOpenShell's C++ core does three things:
1. **Parses** the ISO-10303-21 STEP text file into memory
2. **Resolves** the entity references and property set chains
3. **Tessellates** the BREP geometry into triangle meshes

Steps 1 and 2 are dictionary lookups — traversing a known schema to extract named types and their attribute values. Step 3 is geometry evaluation — expensive, OpenCascade-dependent, and the source of the WASM weight problem.

In this architecture, steps 1 and 2 happen once at extraction time via web-ifc. The results are stored as plain text in `elements_meta.ifc_class` — a string like `"IfcWall"`. After that, the IFC dictionary is just a vocabulary the DB uses for filtering, discipline assignment, and constraint scoping. No IfcOpenShell required. The classification persists as data; the parser is no longer needed.

This reframing matters for the category definition. IFC's enduring value is not its geometry representation (which competing standards — USD, glTF — handle better for visualisation). Its value is its **domain-specific classification vocabulary for the built environment** — 800+ named entity types covering architecture, structure, MEP, cost, schedule, and facility management. That vocabulary is freely available, jurisdiction-neutral, and understood by every BIM tool on the planet.

The insight: **IFC is a dictionary. IfcOpenShell is one way to read it.** The dictionary can be loaded once, stored as strings in a SQLite table, and queried by any tool that can run SQL. The parser becomes a one-time import utility — exactly how web-ifc is used here.

What this means for the geometry-ERP gap the community has not solved: the IFC classification vocabulary already contains `IfcCostSchedule`, `IfcTask`, `IfcConstructionResource`. These entities exist in the dictionary. What has always been missing is a data model — a business logic layer — that treats them as first-class objects rather than optional schema entries that no tool authors in practice. That is the ERP layer: `M_Product`, `C_Order`, `AD_Val_Rule`. The IFC dictionary provides the vocabulary. The ERP pattern provides the logic. The SQLite DB unifies them.

IfcOpenShell, in this light, is not a competitor or a dependency. It is a reference implementation of the dictionary — the authoritative source for what the vocabulary means, useful for batch extraction and complex property set operations, but not the runtime. The runtime is SQL.

### Where Autodesk's Complexity Was Crushed

Revit's architecture is the industry standard for a reason: it solved the constraint and collaboration problems that every other tool struggled with in the 2000s. Its parametric family system is genuinely powerful. But the architecture reflects the constraints of 2002:

- The central file server was the only viable collaboration model before cloud infrastructure existed. In 2026, it is a liability: a single point of failure, a licence cost, a firewall configuration problem, and an offline blocker.
- ShapeManager's BREP kernel produces precise solid geometry. It also requires full tessellation at export time, full parse at import time, and proprietary representation at all times in between. The kernel is the reason IFC round-trips are lossy — the BREP model does not map cleanly to IFC's representation schema.
- APS/Forge/ACC requires server-side tiling infrastructure to stream large models to a browser. Two SQLite files served from OCI Object Storage achieve comparable element counts with zero infrastructure.

The parameter that Autodesk has not solved — and structurally cannot solve within its current architecture — is the geometry-ERP gap. A Revit model is a geometric model with cost data bolted on via linked schedules and external databases. The connection between the 3D element and the construction procurement order is, in practice, a human with a spreadsheet.

---

## The Next Category

Every generation of design software was defined by what it treated as the primary artefact:

| Generation | Primary artefact | Representative tool | Breakthrough |
|---|---|---|---|
| **CAD** (1970s–) | The 2D drawing | AutoCAD | Lines became editable vectors instead of ink |
| **3D modelling** (1980s–) | The solid/surface mesh | CATIA, Pro/E | Drawings became derived views of 3D form |
| **BIM** (2000s–) | The parametric building model | Revit, ArchiCAD | Geometry became linked to data |
| **Generative/Parametric** (2010s–) | The algorithm | Grasshopper, Dynamo | Intent became the model, output became derived |
| **?** (2020s–) | | | |

The pattern is consistent: each generation demotes the previous generation's primary artefact to a *derived view* and elevates something more fundamental as the source of truth.

CAD demoted the drawing to a view of vectors. 3D demoted 2D to a projection of solids. BIM demoted geometry to a view of a parametric model. Generative demoted the model to an output of an algorithm.

**The next demotion is the parametric model itself.** The parametric model — the `.rvt` file, the `.blend` file — becomes a derived view of a database transaction log.

### Defining the Category: Transactional Spatial Computing

The category is defined by three inversions of the BIM assumption:

**Inversion 1 — The model is a log, not a file.**
Every operation is a committed database transaction. The current state of the building is the result of replaying the log from the beginning. There is no "save" command because every operation is already saved. There is no "file" because the log is the model. IFC export is not saving — it is rendering the log's current state into a delivery format.

**Inversion 2 — Geometry is a derived view, not the source.**
Geometry is a materialized view of the operation log — a cache of evaluated recipes stored as GPU-ready BLOBs. When a parameter changes, the cache is invalidated and recomputed. The source of truth is the recipe (`kernel_ops`), not the mesh (`component_geometries`). This is what every parametric modeller has been building toward — but storing the recipe in an open, queryable, diffable SQL table instead of a proprietary binary completes the inversion.

**Inversion 3 — The building is an ERP product, not a geometric object.**
`M_Product` with `IsBOM=Y`. `C_Order` with exception lines. `AD_Val_Rule` with jurisdiction scope. The building is a manufactured product at city scale. Its cost is `SUM(price × qty)` — a query, not a feature. Its schedule is a topological sort of the BOM tree — a query, not a Gantt chart plugin. Its regulatory compliance is an SQL predicate — a query, not a specialist workflow. The geometry is the spatial expression of the product; the product is the source of truth.

### What This Category Is Not

It is not a viewer. Viewers display; they do not log operations.

It is not a generative tool. Grasshopper generates geometry from algorithms; the algorithm is still the artefact. Here the log is the artefact — the algorithm (BOM verbs, constraint rules) is configuration.

It is not a cloud BIM platform. Cloud BIM (BIM 360, Trimble Connect, Procore) moves the central file server to a cloud server. The file is still the artefact; the server is still required. This category has no server. The log is the model; the browser is the runtime; the collaboration is peer-to-peer.

It is not an IFC tool. IFC is the import format and the export format. It is not the model.

### The Name

The category can be called **Compiled BIM** — building models that are not authored but compiled from a formal recipe (BOM + verbs + rules), with every operation recorded as a committed transaction in an open database, geometry generated as a derived view, and regulatory compliance enforced as SQL predicates at the moment of operation rather than as a post-processing check.

The compiler is not an application. It is a data architecture. The runtime is wherever SQL runs: a browser, a Java process, a Python script, a Web Worker. The model is wherever SQLite runs: a laptop, a phone, an OCI bucket, a USB stick. The collaboration is wherever WebRTC runs: between any two devices with a browser.

This is not audacious because it requires new technology. It is audacious because it requires discarding old assumptions about what a modeller is.

---

## The Five Proofs Required

To claim "browser is a better modeller" rather than "browser is a capable modelling environment," five proofs are needed. None require new theory — the architecture supports all five:

| Proof | What it requires | Foundation already in place |
|---|---|---|
| **1. Reparametrizable elements** | Wall height change → scene repaint from updated recipe, no re-import | `kernel_ops` + geometry hash invalidation + Web Worker |
| **2. Constraint maintenance** | Move a column → attached beams follow via constraint propagation | `AD_Val_Rule` SQL + `kernel_ops` dependency tracking |
| **3. Infinite undo/redo** | From `kernel_ops` log replay, survives page reload | `bim_changelog` table + `kernel_ops` ordered by id |
| **4. Collaborative session** | Two browsers, same DB, peer-to-peer delta sync | IndexedDB + WebRTC DataChannel + CRDT on op log |
| **5. Crash recovery** | Kill the tab; reopen; state restored to last committed op | `kernel_ops` in SQLite, survives tab close |

### The One to Do First

Five proofs is a roadmap. One proof is a commitment. The right one to build first:

**Proof 1 — a reparametrizable wall height.** Pick a wall in the Sample House. Add a height slider to the UI. When it moves: write a `kernel_op` with the new depth, invalidate the geometry hash, have a Web Worker re-extrude the profile, repaint the scene. Reload the page — the wall stays at the new height because the `kernel_ops` table survived.

This single feature, working in browser, no server, no save button, crash-recoverable, simultaneously proves: the kernel-op log, geometry cache invalidation, Web Worker evaluation, and crash recovery. It is the minimum viable proof that the architecture is not theoretical. Everything else — constraints, collaboration, Boolean — is an extension of the same pattern. But this one, working, changes the conversation from *"could be a modeller"* to *"is a modeller."*

---

## The Performance Reality

The risk in any kernel-op approach: evaluation in WASM may be slower than native C++. The mitigation: aggressive caching (materialized views in `component_geometries`) and progressive evaluation (only re-evaluate what changed).

But the ceiling is already proven: 126K elements at 60fps on desktop, usable on mobile, 729 draw calls, from two static SQLite files with no server. Kernel evaluation for a single extrude — one profile, one depth, one new mesh — is trivial compared to streaming a hospital.

The performance problem was solved by the schema (geometry BLOBs as pre-computed GPU buffers, instancing via hash deduplication). Modelling reuses that infrastructure — it does not replace it.

---

## What This Means for the Open BIM Community

The [osArch community](MANIFESTO.md#the-open-bim-question-where-the-community-got-stuck) debates which geometry kernel, which file format, which desktop application. The question this project asks is: **what if the modelling session is the database transaction log?**

IFC export becomes what glTF export is to a game engine — a delivery format for other tools, not the primary artefact. The primary artefact is the `kernel_ops` log in SQLite, offline, in the browser, owned by the architect without a server, a license, or a Blender install.

That is the inversion.

---

## Postscript — How This Was Discovered *(2026-05-08)*

This synthesis did not arrive fully formed. It emerged in stages within a single conversation, and the final formulation was forced by a question asked near the end of it.

### The Stages

**Stage 1 — a practical observation.** The observation was that `measure.js` makes two-click length measurement feel trivial. The question asked was: what is actually underneath it? That forced the dissection: six lines of code, five primitives, and — crucially — a *shared coordinate space* between the GPU scene and the SQLite DB. The measurement was not the point. The coordinate unification was.

**Stage 2 — the schema decision, recognised in retrospect.** The coordinate unification only works because of a decision made much earlier in the project for an entirely different reason: extract IFC to SQLite in world-space metres, no recentring, geometry BLOBs as GPU-ready buffers. That was a streaming performance decision. It accidentally created the precondition for a modeller. The modeller emerged from the viewer's schema.

**Stage 3 — an AI named the kernel-op log.** A DeepSeek exchange gave the pattern a structure: `kernel_ops` table, three primitives (Place, Extrude, Boolean), constraints as SQL predicates. It assembled the implementation correctly. But it was describing an implementation, not an inversion.

**Stage 4 — the question that forced the claim.** *"No save?! And the log is it?"* — asked with genuine surprise. That question forced the explanation of why save exists at all: the RAM-to-disk bridge. Once stated plainly, everything followed. Save is the bridge. SQLite eliminates the bridge. Therefore save is made instantaneous and invisible. The geometry is the spreadsheet display. The log is the formulae. **That formulation did not exist before the question was asked.**

### Who Else Knows the Pieces

The components of this idea are individually well known. The synthesis applied to BIM is not documented anywhere the author has found.

**Event sourcing** (Martin Fowler, 2005) — the log as source of truth, current state as deterministic replay. Standard in distributed systems and financial audit trails. Not applied to BIM geometry.

**"The Log"** (Jay Kreps, LinkedIn engineering blog, 2013) — arguably the most important essay in distributed systems of the last decade. Argues that an append-only ordered log is the universal primitive underlying databases, version control, and distributed consensus. Widely read by backend engineers. Unknown in AEC.

**Datomic** (Rich Hickey, 2012) — a database that stores facts as immutable assertions with timestamps, never deletes, queries any past state. The closest philosophical prior art to the `kernel_ops` log. Never applied to spatial data.

**Git** — the most widely deployed event-sourcing system in history, understood by millions as version control for code. Nobody applied the mental model to building geometry before this explicit analogy.

**Revit's parametric engine / SolidWorks FeatureTree** — they store the operation history but inside a proprietary binary. The log is the truth but it is locked. No external tool can query it. No browser can replay it. The insight was always there, imprisoned in the file format.

**The IFC-as-dictionary insight** — that IfcOpenShell is a classification dictionary parser and the IFC vocabulary is freely usable as plain strings in any SQL schema — has not been stated in the osArch literature in this form. Dion Moult has argued "IFC as database," meaning storing IFC natively. This is the inverse: the IFC vocabulary lives as SQL strings, the IFC parser is a one-time import utility. The dictionary outlives the parser.

### The Synthesis Nobody Has Published

The specific combination:

```
Event sourcing  (Fowler/Kreps)
  + IFC classification as SQL vocabulary  (not IFC as file)
  + ERP BOM patterns  (iDempiere — 30 years of manufacturing logic)
  + Browser-native SQLite  (sql.js WASM)
  + World-space coordinate unification  (the viewer's schema decision)
  + Geometry as materialized view  (component_geometries as cache, not truth)
= Compiled BIM
```

Each ingredient exists independently. The combination — applied to architectural modelling, running in a browser tab, with no server and no save command — does not appear in any paper, any osArch thread, any Autodesk research blog, or any academic BIM literature reviewed to date.

The conversation is where it became a *claim* rather than an *observation*.

---

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
