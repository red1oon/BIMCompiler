# Prior-Art Record — Event-Sourced Geometry as a Fold over a Signed Operation Log
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **Defensive publication / authorship record.** First published **2026-06-18** by the BIM OOTB project
> (red1oon), extended **2026-07-13** with a second, related disclosure. This page is a dated, public,
> enabling disclosure of the architecture described below so that it stands as prior art. It is the
> geometry-side companion to the **[Feature Comparison](FeatureComparison.md)** (BIM viewer) and
> **[Migrate & Compare (ERP)](MigrateComparisonPaper.md)** (the WASM event-sourced browser ERP).
>
> Two things are disclosed, dated separately below: (1) geometry as a deterministic fold over a signed
> operation log, and (2) a typed dependency graph over real IFC relations that gates every edit's cascade
> against that same log — the combination that lets the Modeller open a *complete, real, production* IFC
> and safely edit *part* of it.

## What is disclosed

A single **cryptographically hash-chained operation log** (an append-only, tamper-evident event log — "git
for data") serving as the **sole source of truth for both** (a) ERP transactional records **and** (b) BIM
**parametric geometry**, executed **entirely in the browser client** with no server, where **geometry is not
stored** but is a **deterministic fold** — a pure replay of the logged feature operations through a reused
boundary-representation (B-rep) geometry kernel.

In this architecture a parametric feature (e.g. a wall as an extruded profile, an opening as a boolean cut) is
recorded as **one signed row in the operation log**: an operation type plus its parameters. The rendered solid
is obtained by **replaying** that row through the kernel. Undo, redo, history scrubbing, branching, design
variants ("multiverse"), distributed sync, and audit are therefore **not separate features of the modeller** —
they are intrinsic properties of the log, shared identically with the ERP records that ride the same log.

## Precise scope of the claim (what is, and is NOT, claimed novel)

We **do not** claim first authorship of:

- **Event-sourced / replayable CAD architecture in general** — this is a recognised pattern (see the
  event-sourced collaborative-CAD literature) and is partially embodied by commercial cloud CAD.
- **Cloud parametric feature history with branch & merge** — shipped and **patented** by others
  (Onshape / PTC). Their implementation is server-authoritative cloud.
- **Browser-resident OCCT/B-rep CAD** — demonstrated by Chili3D and ifc5cad (both AGPL).
- **Model versioning / immutable audit trails of committed states** — demonstrated by Speckle.

We **record as prior art**, as of the date above, the **specific combination** none of the above embodies:

> A **single tamper-evident, hash-chained operation log** that is the **sole source of truth for both ERP
> records and BIM parametric geometry**, run **fully client-side**, in which **geometry is derived as a
> deterministic fold (replay) over the log rather than stored** — demonstrated by a working reference
> implementation (below).

## Feature comparison — where this sits among prior systems

| Capability | **BIM OOTB (this work)** | Onshape | Chili3D | ifc5cad | Speckle | Bonsai / IfcOpenShell |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Parametric feature history | ✅ | ✅ | ✅ (in-memory undo) | ✅ (in-memory undo) | — | ✅ (in-memory undo) |
| Geometry **derived as a fold** (replay), not stored | ✅ | ✅ (server) | ❌ | ❌ | ❌ | ❌ |
| **Cryptographically signed / tamper-evident** log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **One substrate for ERP records *and* geometry** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Runs **fully client-side** (no server) | ✅ | ❌ | ✅ | ✅ | partial | desktop |
| Branch / variant / distributed history | ✅ | ✅ (patented) | ❌ | ❌ | ✅ (versions) | ❌ |
| Reuses an open B-rep kernel | ✅ (OCCT) | ❌ (proprietary) | ✅ (OCCT) | ✅ (OCCT) | n/a | ✅ (OCCT) |

The distinguishing intersection — **signed log + geometry-as-fold + unified ERP+BIM substrate + fully
client-side** — is held by no prior system in the row above.

**A second, independent axis** — added 2026-07-13, same disclosure lineage, full detail in the Extension
section below — is whether a system can open a *complete, real, production* IFC and safely edit *part* of
it via a dependency graph recovered from real IFC relations, not a generic parametric-feature DAG:

| Capability | **BIM OOTB (this work)** | Bonsai / IfcOpenShell | FreeCAD |
|---|:--:|:--:|:--:|
| Opens a **complete, real, production** IFC and edits it in place | ✅ | ✅ | partial (BIM workbench, IFC import) |
| Dependency graph **recovered from real IFC relations / measured geometry** (not a generic parametric-feature DAG) | ✅ | ❌ | ❌ |
| **Delta-based** conformity check (flags only what an edit changed, not pre-existing conditions) | ✅ | ❌ | ❌ |
| RED (hard) / ORANGE (soft) **gated exception on every edit**, not a silent accept | ✅ | ❌ | ❌ |
| Cascade runs **within the same signed, replayable operation log** as the fold mechanism above | ✅ | n/a (no signed log) | n/a (in-memory undo, no signed log) |

FreeCAD's own Dependency Graph is a real, related idea — a DAG of document objects so a parametric change
propagates to its dependents — but it is a *general CAD* feature graph (sketch → pad → boolean, within one
authored document), not derived from a real building's IFC relations, and it carries no delta-based
RED/ORANGE gate. Bonsai edits real IFC entities directly via IfcOpenShell inside Blender with no
graph-cascade or signed provenance at all — closer to a direct-mesh editor with IFC awareness than a
dependency-aware one.

## Reference implementation (enabling disclosure)

The mechanism is demonstrated, not merely asserted. The reference reuses the open-source **occt-wasm** kernel
(OpenCASCADE compiled to WebAssembly) as a stateless pure function and our own signed operation-log engine as
the feature tree.

A feature is recorded as one log row, for example an extruded-area solid (the dominant BIM geometry form):

```
op_type    = "GEOM_EXTRUDE"
parameters = { "profile": { "w": 4, "h": 0.2 }, "dir": [0, 0, 3] }
```

Replaying that row builds a rectangular profile and extrudes it; an opening is a second row whose replay cuts a
boolean void from the wall. The witness (`W-KERNEL-FOLD`, 2026-06-18) records that replaying a serialised log
row reproduces **byte-identical** geometry, and that boolean openings fold deterministically:

```
init ok                                          (kernel loads in-browser)
live    tris=12  bbox=[0,0,0,4,0.2,3]  cs=1782029157     extrude → wall
replay                                 cs=1782029157  identical=Y   ← fold is deterministic
opening tris=32                        cs=3687298821  deterministic=Y  changedVsWall=Y
```

`cs` is a checksum of the tessellated vertex positions; identical checksum across an independent replay
establishes that the geometry is fully determined by the log row — i.e. geometry is a fold over the log.

### Engineering facts established by the reference

- The kernel is **single-threaded** (no `SharedArrayBuffer`), so it requires **no cross-origin isolation**
  (no COOP/COEP) and runs on ordinary static hosting.
- Geometry replay is **deterministic** for both extrusion and boolean operations under fixed tessellation.
- The reused kernel is embedded as a **separately-loadable WebAssembly module**, preserving the open-source
  kernel's licence terms while the surrounding application remains independently licensed.

---

## Extension — a graph-cascade conformity layer on the same substrate
*Published 2026-07-13, same disclosure lineage as above.*

### What is disclosed

Alongside the fold mechanism above, the same client-side substrate carries a second layer: a **typed
dependency graph recovered from real IFC relations (or derived from measured geometry, never guessed),
driving a delta-based conformity gate on every committed edit** — so that opening a *complete, real,
production* IFC building and editing *only the part touched* is provably safe, not merely possible.

On import, the tree already used for the BOM (parent→child `contains`) is extended with typed lateral
edges: `hosted-by` (an opening's real host wall, recovered from `IfcRelFillsElement`), `abuts` (real
face-touch adjacency, geometry-derived), `anchored-to` (element-to-datum-plane by measured face cadence,
no `IfcGrid` required), `spans` (an element's bounding box reaching between two distinct datums). A drag
on one datum/gridline folds forward through this graph as **one signed operation** (`GEOM_GRID_MOVE`) —
hosted openings ride their host wall rather than stretch or divorce from it, spans stretch with sizes
held, `contains` cascades en-bloc.

After the fold, a **delta-based conformity gate** evaluates only what the edit changed — a pre-existing
condition the building already shipped with is never flagged — against the same graph: **RED** for a
hard constraint the edit broke (a hosted opening crushed by a shrunk host, a real volumetric clash),
**ORANGE** for a soft, user-acceptable side effect (an abutting wall that now wants to realign). The gate
runs live during the drag (a green/orange/red preview before commit) and again on the committed result.

### Reference implementation

`sdg_gate.js` (§GATE-1) evaluates `{red:[...], orange:[...]}` from before/after axis-aligned bounding
boxes, the recovered relations, and which elements the fold actually moved — pure geometry over measured
data, with exactly one tunable parameter (a residential clearance figure, itself mined from a real
building's own MEP separations, not asserted). `bonsai_gridmove.js`'s `§PREDRAG` pipeline runs the same
evaluator live, before commit. Handlers shipped and witnessed to date: hosted-opening ride, door-crush
RED, abuts-realign ORANGE, an OBB-SAT narrow-phase clash upgrade, and a UBBL-bylaw-shaped demo case. Full
build log: `prompts/SPATIAL_DEPENDENCY_GRAPH.md` and the project's `RESUME_MODELLER_CONFORMITY_GATE.md`.

### Named gaps — real extensions the substrate makes possible, not yet built

Stated plainly so the disclosure above isn't read as claiming more than it does: no general graph-query
API, no multi-hop traversal (the cascade is one hop, directional, wall→door only), no MEP flow/
connectivity graph (no `flows-into` edge type exists), no assembly clone/duplicate-with-reconnect. Each is
a plausible extension of the same recovered, non-invented relations — not a different architecture — but
none were shipped at the 2026-07-13 date of this disclosure, and none should be read into the claims above. *(Update 2026-10-27: the Modeller now has relation-carrying copy and paste — a copied wall brings the doors and windows it hosts, and the pasted door belongs to the pasted wall — so "assembly clone/duplicate-with-reconnect" is no longer a gap. The other gaps stand.)* This is a fast-moving build, not a
finished one; the tiered gap-and-sequencing plan is tracked internally, not restated here each time it
moves — see `prompts/BONSAI_KERNEL_RESEARCH.md §GAP-TO-COMPETITIVE`.

---

## Provenance

This disclosure is timestamped by its publication to the project's public documentation site and by the
project's version-control history. It is intended to establish the date and authorship of the combination
described, and to serve as prior art against later claims to that combination.

*BIM OOTB — red1oon — first published 2026-06-18, extended 2026-07-13.*
