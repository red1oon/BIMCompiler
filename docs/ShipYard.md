# ShipYard — A Deterministic Engine for Any Manufactured Assembly
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **Foundation:** [MANIFESTO](MANIFESTO.md) · BBC §3.5 · ProjectOrderBlueprint §3 (Abstract Category Tree) · BIM_COBOL §TILE

<div class="bim-banner" markdown>
<b>Roof tiles as hull plates. Tunnel linings as prefab rings. Earthworks as volumetric BOMs.</b> The engine does not compile buildings. It compiles recursive Bills of Materials with spatial coordinates. Construction was the first proof. This document demonstrates why it is not the last.
</div>

---

## 0. Thesis — Why the Engine Is Domain-Agnostic

**ShipYard is not Rosetta Stone.** Rosetta Stones decompose a real building
(IFC → BOM), recompile it, and verify exact sameness. ShipYard domains
(marine, tunnel, plant) have no reference IFC to decompose — you design
a hull from scratch, not from a scanned ship. The value of ShipYard is
different: **the spatial recipes learned from Rosetta Stones transfer to
domains that have never been compiled before.**

A BED_SET tack arrangement proven on SH is a spatial motif — parent at
origin, children at relative offsets. That same motif works as a cabin
furniture set on a ship, a utility room fitout in a tunnel, or an equipment
skid in a plant. The BOM recipe is proven data; the domain is just a
different M_Product_Category.

This is the same transfer mechanism as two other domains that solved the
"reusable geometry" problem:

- **Protein science** solved the folding problem (1D amino acid sequence →
  3D structure) by learning spatial motifs from 200K solved structures in
  the Protein Data Bank. A helix-turn-helix motif from one protein predicts
  the fold of another. Our BOM assemblies are the structural motifs — proven
  spatial arrangements that transfer across building types and domains.

- **Robotics** solves forward kinematics by accumulating parent-child
  transforms through a link chain — mathematically identical to our BOM walk
  anchor stack. A robot arm calibrated in one configuration reuses the same
  link transforms in any configuration.

Both domains distinguish between **learning** (solve the structure, capture
the relationships) and **applying** (reuse the relationships in a new context).
Rosetta Stones are the learning phase. ShipYard is the application phase.

The BIM Intent Compiler has no concept of "building." Its core loop is:

1. Read a parent BOM. For each child line, accumulate (dx, dy, dz).
2. If the child has its own BOM, recurse.
3. If the child is a leaf, emit a placed element at the accumulated world position.
4. Verify: count, volume, digest, provenance, isolation.

This loop is identical whether the parent is a floor plan, a hull section, a tunnel
ring, or a process plant skid. The domain lives in the **data** — category taxonomies,
component libraries, YAML mappings — never in the engine code.

**What the engine requires from any domain:**

| Requirement | How it's met | Engine assumption |
|-------------|-------------|-------------------|
| Recursive decomposition | Parent → children, each with qty + offset | Any physical assembly has this |
| Leaf products with geometry | M_Product in component library | Any manufactured item has dimensions |
| Spatial placement | dx/dy/dz tack offsets (LBD convention) | Any assembly has relative positions |
| Deterministic verification | G1-G6 gates: count, volume, digest, provenance | Arithmetic, not domain knowledge |

**What varies per domain (data, not code):**

| Domain data | Where it lives | How it's authored |
|-------------|---------------|-------------------|
| Category taxonomy | M_Product_Category rows in ERP.db | INSERT statements or YAML import |
| Product catalog | M_Product rows + component_library.db geometry | LOD meshes + product attributes |
| Assembly recipes | m_bom + m_bom_line in {PREFIX}_BOM.db | IFC extraction OR hand-authored |
| Classification YAML | `classify_{prefix}.yaml` | ~30 lines per domain instance |
| Validation rules | AD_Val_Rule rows (jurisdiction-scoped) | Domain regulatory requirements |

**The 35-building proof is not the point.** The point is that 35 buildings, 3
infrastructure types (bridge, road, rail), and 1 generative house all compile
through the same 11-stage pipeline, the same 77 verbs, the same 9 gates — and
the engine never asks what domain it's operating in.

This section demonstrates the claim with four domains: marine (§1-§8), tunnel (§9),
earthworks (§10), and industrial plant (§11). Each maps to existing engine patterns.
Where new capability is needed, it is identified as a bounded extension — not a
redesign.

---

## 1. Marine — The BOM Mapping

A ship hull is a recursive BOM — identical in structure to a building.

| Construction | Marine | BOM Pattern |
|-------------|--------|-------------|
| BUILDING | VESSEL | Root M_Product (IsBOM=Y, cat=VE) |
| FLOOR | HULL / SUPERSTRUCTURE | Major assembly (IsBOM=Y, cat=HULL) |
| ROOM | SECTION (frame 1..N) | Structural segment (IsBOM=Y, cat=SECTION) |
| FURNITURE SET | FRAME + PLATE group | Component group within section |
| LEAF (wall panel, pipe) | PLATE, STIFFENER, BRACKET | Leaf M_Product (IsBOM=N) |

```
VESSEL (M_Product, IsBOM=Y, cat=VE)
  └─ HULL (M_Product, IsBOM=Y, cat=HULL)
       ├─ SECTION_001 (M_Product, IsBOM=Y, cat=SECTION)
       │    ├─ FRAME_WEB (M_Product, IsBOM=N, cat=FRAME)     ← structural frame
       │    ├─ PLATE_HULL_12MM × 30 (verb_ref=TILE)          ← hull plating
       │    └─ STIFFENER_T100 × 6 (verb_ref=ARRAY)           ← longitudinal stiffeners
       ├─ SECTION_002 ...
       └─ SECTION_030 ...
  └─ SUPERSTRUCTURE (M_Product, IsBOM=Y, cat=SUPER)
       ├─ BRIDGE_DECK (M_Product, IsBOM=Y, cat=DECK)
       └─ ENGINE_ROOM (M_Product, IsBOM=Y, cat=ROOM)         ← same ROOM pattern as buildings
```

**The walker doesn't know this is a ship.** It sees: parent BOM has children, each
child has dx/dy/dz offsets, leaf products resolve to component library geometry.
Same recursion, same tack convention, same G1-G6 gates.

---

## 2. Verb Reuse

| Verb | Construction use | Marine use | Proven at scale |
|------|-----------------|------------|-----------------|
| **TILE** | Roof plates, ceiling panels, floor tiles | Hull plates on section surface | 74.4% of TE's 48K elements |
| **ARRAY** | Fence posts, bollards, sleepers | Longitudinal stiffeners, frames | Rail sleepers (93% compression) |
| **FRAME** | Columns, beams, bracing | Transverse frames, bulkheads | Structural bays in TE |
| **CLUSTER** | Semi-regular groupings | Bracket clusters, fitting groups | 47,607 instances in TE |
| **ROUTE** | MEP piping, ducting | Bilge piping, fuel lines, HVAC | Sprinkler/drainage runs |

No new verbs needed for Phase 1. The five dominant construction verbs cover the
dominant marine assembly patterns.

---

## 3. Component Library

Leaf products for a hull BOM — flat geometry, variation via ASI:

| M_Product | M_AttributeSet | Varying (ASI) | Fixed |
|-----------|---------------|---------------|-------|
| PLATE_HULL_12MM | BIM_Plate | length_mm, width_mm, curvature_radius | thickness=12mm |
| PLATE_HULL_16MM | BIM_Plate | length_mm, width_mm, curvature_radius | thickness=16mm |
| STIFFENER_T100 | BIM_Profile | length_mm | profile=T100×10 |
| FRAME_WEB_200 | BIM_Profile | height_mm, length_mm | web=200×12 |
| BRACKET_KNEE | BIM_Component | — (fixed geometry) | standard knee bracket |

**Key insight:** Hull plates are flat steel. The curvature is in the **placement**
(tack positions follow the hull form), not in the plate geometry. Same principle
as roof tiles — flat LOD item, curved surface placement.

---

## 4. YAML Taxonomy

```yaml
# classify_hull_demo.yaml
prefix: HD
building_type: VESSEL
doc_sub_type: HD

storeys:
  - { name: "Hull", code: HULL }
  - { name: "Superstructure", code: SUPER }

disciplines:
  ARC: HD_BOM    # hull structure = "architecture" of a ship

floor_rooms:
  Hull:
    bom_id: HULL_HD_STD
    spaces:
      - { name: SECTION_001, template_bom: HD_SECTION_001, aabb_mm: [3000, 12000, 8000] }
      - { name: SECTION_002, template_bom: HD_SECTION_002, aabb_mm: [3000, 12000, 8000] }
      # ... 30 sections at 3m frame spacing
```

Same YAML schema as `classify_sh.yaml`. Different category names.

---

## 5. Exception Ordering — Configure-to-Order for Ships

The same 4-mutation algebra (Replace, Remove, Compress, Add) applies:

```
C_Order: "Build me Hull Demo"                               ← 3 lines
├── C_OrderLine #1: family_ref='VESSEL_HD_STD'              ← entire vessel
├── C_OrderLine #2: exception — thicker plates on section 7
│   locator_ref  = 'VE.HULL.SECTION_007.PLATE_HULL_12MM'
│   replacement  = PLATE_HULL_16MM                          ← ice-class reinforcement
└── C_OrderLine #3: exception — add bow thruster
    locator_ref  = 'VE.HULL.SECTION_001'
    mutation     = ADD
    product      = BOW_THRUSTER_200KW
```

**A shipyard's product catalog** = library of exception orders against base hull
designs. "Standard 90m cargo vessel, but ice-class hull forward of frame 12" =
12 C_OrderLines, not a new vessel design.

---

## 6. What's New — LOFTED_SURFACE (Phase 2)

Phase 1 uses flat TILE on each section — plates laid on a planar grid.
Phase 2 adds curved-surface placement from naval architecture station offsets.

**Station offset table:** Cross-sections at regular intervals along the hull
(stations), with waterline heights defining the hull form. This is classical
naval architecture — the math is well-defined (cubic spline interpolation between
stations).

```
Station  Waterline  Half-breadth (mm)
0        0          0                   ← bow
0        2000       1200
0        4000       2800
5        0          0                   ← frame 5
5        2000       3600
5        4000       5200
...
30       0          0                   ← stern
```

**New capability:** `LOFTED_SURFACE` shape type in EYES.
- Input: station offset table (CSV or YAML)
- Output: `positionAt(station, waterline) → (x, y, z)` — plate tack positions
- Integration: TILE verb surface provider (flat plane and lofted surface both
  implement the same interface)

**Architectural precedent:** `AlignmentContext.elevationAt(x, y)` already does
terrain-following for infrastructure. Same pattern — a surface provider that maps
2D grid coordinates to 3D world positions. Different domain math.

**Scope:** 2-3 sessions. Not blocking Phase 1 or public release.

**Generalisation:** The lofted surface pattern — parameters + formula → placement
coordinates — is the same computation used by TRIM, TILE, ROUTE, and ARRAY verbs.
See Geometry Forge §3 for the unified treatment.

---

## 7. Implementation Phases

### Phase 1 — Flat-Tile Hull (1 session, pre-release proof)

| Step | What | Deliverable |
|------|------|-------------|
| 1 | Category taxonomy | M_Product_Category rows: VE, HULL, SECTION, FRAME, PLATE |
| 2 | Component library | 5 leaf products with LOD geometry (flat plates, profiles) |
| 3 | BOM recipes | VESSEL_HD → HULL → 5 SECTIONs × 60 PLATEs = 300 elements |
| 4 | YAML | `classify_hull_demo.yaml` |
| 5 | Compile | `./scripts/run_RosettaStones.sh classify_hull_demo.yaml` |
| 6 | Gates | G1-G6 PASS — proves domain-agnostic compilation |

**Proof statement:** "The same engine that compiles a 48,428-element airport
terminal also compiles a 300-element ship hull. Zero code changes."

### Phase 2 — Curved Surface (2-3 sessions, post-release)

| Step | What |
|------|------|
| 1 | Station offset table parser (CSV → LoftedSurface) |
| 2 | `LoftedSurface.positionAt(station, waterline) → (x,y,z)` |
| 3 | TILE verb surface provider abstraction |
| 4 | Recompile HD with curved placement — plates follow hull form |
| 5 | Visual verification in Bonsai viewport |

### Phase 3 — Full Marine Vocabulary (future)

Domain-specific verbs if needed: WELD (joint specification), BALLAST (tank
placement), COMPARTMENT (watertight subdivision). Each is additive — does not
modify existing verb semantics.

---

## 8. Gate Verification

All 6 gates apply unchanged:

| Gate | Marine verification |
|------|-------------------|
| G1-COUNT | 300 plates in output = SUM(m_bom_line.qty) in recipe |
| G2-VOLUME | Aggregate steel volume within tolerance |
| G3-DIGEST | SHA256 spatial fingerprint reproducible |
| G4-TAMPER | No hardcoded coordinates in hull compilation |
| G5-PROVENANCE | Every plate traces to component library |
| G6-ISOLATION | Hull compilation doesn't contaminate building outputs |

**The gates don't know what a ship is.** They verify BOM expansion arithmetic.

---

## 8b. The Authoring Flow — BOM Drop → ASI Verbs → Approve → New Domain

This is how the engine is actually used to create new domain recipes. It is not
a design tool where you draw geometry. It is a **BOM configurator** where you
compose products, attach verb parameters, compile, verify, and promote.

### 8b.1 The Flow

```
Step 1: BOM Drop                    Step 2: ASI Verb Parameters
┌────────────────────────┐          ┌────────────────────────────────┐
│ C_OrderLine:           │          │ M_AttributeSetInstance:        │
│   product = TILED_ROOF │    →     │   verb = TILE                 │
│   qty = 1              │          │   grid_x = 10                 │
│                        │          │   grid_y = 30                 │
└────────────────────────┘          │   spacing_mm = 500            │
                                    └────────────────────────────────┘
        │                                       │
        ▼                                       ▼
Step 3: Compile + Verb Cascade      Step 4: DocAction = Approve
┌────────────────────────┐          ┌────────────────────────────────┐
│ TILE fires: 300 plates │          │ Promote compiled subtree       │
│ TRIM fires: plates     │    →     │ to new M_BOM in library:       │
│   trimmed at bulkhead  │          │   "HULL_SECTION_STD"           │
│ G1-G6 gates PASS       │          │ Provenance: who, when, gates   │
└────────────────────────┘          └────────────────────────────────┘
```

**The user never touches geometry.** They:

1. **Drop** an existing BOM product into a C_OrderLine (BOM Drop, BBC §3.4)
2. **Parameterise** it via M_AttributeSetInstance — verb type, grid dimensions,
   spacing, material. The ASI is the instruction set for the verb engine
3. **Compile** — the verb expands the recipe into placed elements. Callout rules
   (POB §9) fire cascading consequences: TRIM adjusts intersecting elements,
   ROUTE reroutes pipes that cross the new geometry, validation rules check
   compliance
4. **Verify** — G1-G6 gates confirm the result is deterministic and traceable
5. **Approve** — DocAction=Approve promotes the verified result to a reusable
   BOM template in the library (POB §4). The promoted BOM carries provenance:
   who authored it, which gates passed, which source BOMs it was derived from

**The same flow creates any domain recipe:**

| User intent | Step 1 (Drop) | Step 2 (ASI) | Step 3 (Verbs) | Step 4 (Approve) |
|------------|---------------|-------------|----------------|------------------|
| Roof for a house | TILED_ROOF | TILE(10×5, 600mm) | TRIM at walls | → ROOF_SH_PITCHED |
| Hull section | PLATED_SECTION | TILE(10×30, 500mm) | TRIM at bulkhead | → HULL_SECTION_STD |
| Tunnel ring | RING_6SEG | ARRAY(6, 60°) | — | → RING_TBM_STD |
| Pipe rack bay | FRAME_BAY | FRAME(6m spacing) | — | → RACK_BAY_STD |
| Retaining wall | PANEL_WALL | ARRAY(1×12, 3000mm) | — | → RETWALL_PRECAST |

**A roof IS a hull section IS a tunnel ring.** The BOM product is different. The
verb parameters are different. The engine flow is identical. The user who knows
how to author a roof recipe already knows how to author a hull recipe — because
the authoring interface is the same: Drop, Parameterise, Compile, Verify, Approve.

### 8b.2 TRIM as Spatial Predicate — The DM Glass Wall Example

The DemoHouse (DM) has a pitched roof meeting a glass curtain wall. When the roof
BOM is dropped and compiled, the TRIM verb (wired S89, `TrimWallsToRoofVerb`)
queries: "which wall elements intersect the roof AABB?" The glass curtain wall
panels that extend above the roof slope are trimmed — their height ASI is adjusted
to match the roof intersection line.

This is a **spatial predicate firing as a Callout rule** (POB §9):

```
Trigger:   ROOF BOM compiled (DiffVerb: new geometry in roof zone)
Rule:      AD_Rule: IF element.ifc_class = 'IfcCurtainWall'
                    AND element.AABB intersects roof.AABB
           THEN TRIM element.height TO roof.slope_at(element.x)
Cascade:   Trimmed wall → recalculate wall AABB → recalculate floor AABB
           → recalculate building AABB → update G2-VOLUME
```

**For a ship hull, the equivalent is:**

```
Trigger:   SECTION BOM compiled (plates tiled on section surface)
Rule:      AD_Rule: IF plate.AABB intersects bulkhead.AABB
           THEN TRIM plate.width TO bulkhead.face_at(plate.y)
Cascade:   Trimmed plate → recalculate section steel volume
           → recalculate hull weight → update G2-VOLUME
```

Same verb. Same Callout mechanism. Same cascade pattern. Different domain geometry.

### 8b.3 Why This Has No Equivalent in Blender or Any 3D Authoring Tool

Blender is the most capable open-source 3D tool in existence. Its Geometry Nodes
system, modifier stack, and particle engine can generate complex procedural geometry.
But the comparison reveals a fundamental architectural difference:

**Blender operates on geometry. This engine operates on typed products.**

| Capability | Blender | BIM Intent Compiler |
|-----------|---------|-------------------|
| **Repeating elements** | Array modifier: 100 cubes | ARRAY verb: 100 M_Products with cost, schedule, carbon |
| **Grid placement** | Geometry Nodes: Grid + Instance on Points | TILE verb: M_Products with provenance, qty, swap pool |
| **Procedural scattering** | Particle system or GN Distribute Points | CLUSTER verb: tolerance-grouped M_Products with audit trail |
| **Boolean intersection** | Boolean modifier (mesh CSG) | TRIM verb: ASI height adjustment + Callout cascade |
| **Piping/curves** | Curve to Mesh + profile | ROUTE verb: segment M_Products with per-leg ASI + junction products |
| **Parameterisation** | Drivers + custom properties | M_AttributeSetInstance: typed, versioned, per-instance, ERP-native |
| **Variant management** | Save as... (separate .blend files) | Exception C_OrderLine: 3 lines, not a copy |
| **Undo** | Linear undo stack (opaque) | DiffVerb log: typed, named, replayable, composable, queryable |
| **Verification** | Visual inspection | G1-G6 mathematical proof: count, volume, digest, provenance |
| **What to buy** | — (no concept) | C_Order + C_OrderLine: direct ERP procurement |
| **What it costs** | — (no concept) | `SUM(price × qty)` — a query |
| **Who changed what** | — (no concept) | AD_ChangeLog: full provenance per field per record |
| **Regulatory compliance** | — (no concept) | AD_Val_Rule: jurisdiction-scoped, machine-checkable |
| **Reusable recipes** | Node Groups (geometry only) | Approved BOMs: products + cost + schedule + provenance + gates |
| **Configure-to-order** | — (no concept) | 200 variants as exception diffs against base |

**Blender's Array modifier** produces 100 identical meshes. It does not know they
are steel plates. It cannot tell you they cost RM 2,400 each. It cannot tell you
they need to arrive on site in week 14. It cannot tell you that replacing 12 of
them with thicker plates for ice-class adds RM 8,400 to the project cost and 3
days to the schedule.

**Blender's Geometry Nodes** can scatter 10,000 instances on a surface with
procedural variation. The result is a mesh. Not a bill of materials. Not a
procurement list. Not a construction schedule. Not an audit trail. Not a
compliance certificate.

**Blender's modifier stack** is a sequence of geometry operations. It is not
typed, not auditable, not replayable as named operations, not composable across
projects, and not promotable to a shared library with provenance.

**The gap is not capability — it is semantics.** Blender can generate any geometry
this engine can produce. But geometry without product identity, cost, schedule,
provenance, and verification is a picture, not a plan. The construction industry
does not need better pictures. It needs deterministic answers to: what do I buy,
where does it go, what does it cost, and can I prove it?

**This is what the engine provides that no 3D authoring tool — Blender, Revit,
ArchiCAD, or any visual editor — can provide:** a typed, verified, auditable,
ERP-native bill of materials with spatial coordinates. The authoring flow
(Drop → ASI → Verb → Approve) is how domain experts create these recipes
without touching geometry. The engine compiles geometry FROM the recipe.
The recipe is the source of truth. The geometry is the output.

---

## 9. Tunnels — Prefab Rings as BOM Segments

Tunnel construction is one of the most BOM-native domains outside buildings.
A bored tunnel is a sequence of prefab concrete ring segments — each ring is a
product, each segment within the ring is a child product, and the rings are
placed sequentially along an alignment.

### 9.1 The BOM Mapping

```
TUNNEL (M_Product, IsBOM=Y, cat=TN)
  └─ BORE (M_Product, IsBOM=Y, cat=BORE)
       ├─ RING_001 (M_Product, IsBOM=Y, cat=RING)
       │    ├─ SEGMENT_A × 1 (key segment)
       │    ├─ SEGMENT_B × 2 (standard segments)
       │    └─ SEGMENT_C × 3 (counter-key segments)
       ├─ RING_002 ...
       └─ RING_1200 ...
  └─ SYSTEMS (M_Product, IsBOM=Y, cat=SYS)
       ├─ VENTILATION (IsBOM=Y) → DUCT × N (verb_ref=ROUTE)
       ├─ DRAINAGE (IsBOM=Y) → PIPE × N (verb_ref=ROUTE)
       └─ LIGHTING (IsBOM=Y) → FIXTURE × N (verb_ref=ARRAY)
```

| Construction | Tunnel | Engine pattern |
|-------------|--------|----------------|
| FLOOR | RING | Repeating structural unit — **Compress** (qty=1200) |
| ROOM / SET | SEGMENT group | Fixed recipe: 6 segments per ring (A+2B+3C) |
| MEP piping | Ventilation ducts, drainage | **ROUTE** verb along alignment |
| Lighting array | Tunnel lighting | **ARRAY** verb at uniform spacing |
| TILE (roof plates) | — | Not applicable (rings are 3D, not 2D grid) |

### 9.2 What the Engine Already Handles

**Reference class compression.** 1,200 identical rings = 1 C_OrderLine with
`qty=1200, is_reference_class=1`. The compiler instantiates at regular dz offsets
along the tunnel axis. This is the ProjectOrderBlueprint §1.2 pattern — identical
to "100 floors as one line" in a skyscraper.

**Indexed exceptions.** Ring 847 needs a cross-passage opening? One exception
C_OrderLine at `locator_ref='TN.BORE.RING[847]'`, mutation=Replace,
product=RING_CROSS_PASSAGE. Same algebra as "floor 47 gets the executive lobby."

**ROUTE for services.** Ventilation ducting along a tunnel alignment is structurally
identical to sprinkler piping along a corridor. The ROUTE verb handles both —
axis-aligned uniform-step placement with junction products at branches.

**ARRAY for fixtures.** Tunnel lighting at 10m intervals = `ARRAY(1×120, 10000mm)`.
Same verb as rail sleepers or fence posts.

### 9.3 What's New — Alignment-Following Placement

Tunnel rings follow a 3D alignment (horizontal curves + vertical grades). The
existing TILE verb places on flat planes. Tunnel ring placement needs:

`positionAt(chainage) → (x, y, z, heading, cant)`

**Already substantially addressed.** The INFRA_DESIGNER_SRS §1 `AlignmentContext`
provides exactly this for road/rail: `elevationAt(x, y)`, `headingAt(chainage)`,
curvature interpolation from survey data. Tunnel alignment is the same math with
an additional degree of freedom (cant/roll for curved tunnels).

**Extension scope:** Add `rollAt(chainage)` to AlignmentContext. ~1 session.

### 9.4 IFC Source Data Available

[bSI-InfraRoom/IFC-Tunnel-Deployment](https://github.com/bSI-InfraRoom/IFC-Tunnel-Deployment):
60+ IFC tunnel files from 10+ vendors (ACCA, Trimble Tekla, GeometryGym, 12d).
Includes geotechnics, excavation, and tunnel systems (ventilation, drainage, lighting).
IFC 4.4 draft — the pre-standardization deployment test files.

---

## 10. Earthworks — Volumetric BOMs

Cut-and-fill earthworks are the simplest BOM pattern: material moved from one
location to another, measured in volume.

### 10.1 The BOM Mapping

```
EARTHWORKS (M_Product, IsBOM=Y, cat=EW)
  ├─ CUT_ZONE_001 (IsBOM=Y, cat=CUT)
  │    ├─ TOPSOIL_STRIP (M_Product, IsBOM=N)     qty=volume_m3, ASI: depth_mm
  │    └─ ROCK_EXCAVATION (M_Product, IsBOM=N)   qty=volume_m3, ASI: density
  ├─ FILL_ZONE_001 (IsBOM=Y, cat=FILL)
  │    ├─ STRUCTURAL_FILL (M_Product, IsBOM=N)   qty=volume_m3, ASI: compaction_%
  │    └─ DRAINAGE_BLANKET (M_Product, IsBOM=N)  qty=volume_m3, ASI: thickness_mm
  └─ RETAINING (IsBOM=Y, cat=RET)
       └─ WALL_SEGMENT × 12 (verb_ref=ARRAY)     ← precast retaining wall panels
```

**5D cost is immediate.** Earthworks cost = `SUM(volume × unit_rate)`. The
M_Product for TOPSOIL_STRIP carries a price per m3. The BOM qty is the volume.
Cost of the entire earthworks operation is a query — same pattern as building cost.

**CutFillCalculator already exists.** INFRA_DESIGNER_SRS §5 documents the
proven cut-and-fill volumetric engine (689-point survey, grading strategy,
net balance). The calculation outputs volumes — those volumes become BOM quantities.

### 10.2 What the Engine Already Handles

Everything. Earthworks is the trivial case: no curved surfaces, no complex
placement geometry. Each zone is a BOM node. Each material type is a leaf product.
Quantities are volumes. Gate verification: G1 checks zone count, G2 checks
total volume, G5 checks every material traces to the product catalog.

### 10.3 IFC Source Data Available

[bSI-InfraRoom/IFC-infra-unit-test](https://github.com/bSI-InfraRoom/IFC-infra-unit-test):
`IfcEarthworksCut`, `IfcEarthworksFill` test files. Also: borehole models,
drainage systems, georeferenced terrain TINs. IFC4X3.

---

## 11. Industrial Plant — Process as BOM

Industrial process plants (refineries, chemical plants, power stations) are
the domain that most closely mirrors manufacturing ERP — because they ARE
manufacturing facilities. The BOM pattern is native.

### 11.1 The BOM Mapping

```
PLANT (M_Product, IsBOM=Y, cat=IP)
  ├─ PROCESS_UNIT_001 (IsBOM=Y, cat=UNIT)
  │    ├─ VESSEL_PRESSURE (M_Product, IsBOM=N, cat=VESSEL)   ASI: diameter, pressure_rating
  │    ├─ HEAT_EXCHANGER (M_Product, IsBOM=N, cat=EQUIP)     ASI: duty_kw, tube_count
  │    ├─ PIPE_RUN_001 (IsBOM=Y, cat=PIPING)                 verb_ref=ROUTE
  │    │    ├─ PIPE_CS_150MM × 24 segments                    ASI: length_mm per segment
  │    │    ├─ ELBOW_90_150MM × 6
  │    │    └─ VALVE_GATE_150MM × 2
  │    └─ INSTRUMENT_CLUSTER (IsBOM=Y, cat=INST)             verb_ref=CLUSTER
  │         ├─ TEMP_TRANSMITTER × 3
  │         └─ PRESSURE_GAUGE × 2
  ├─ UTILITY_UNIT (IsBOM=Y, cat=UTIL)
  └─ PIPE_RACK (IsBOM=Y, cat=RACK)
       └─ BAY × 20 (verb_ref=FRAME)                          ← structural bays at 6m spacing
```

### 11.2 What the Engine Already Handles

| Plant pattern | Engine equivalent | Proven by |
|--------------|-------------------|-----------|
| Pipe routing | **ROUTE** verb | TE fire protection: 9,345 pipe elements |
| Equipment placement | Leaf M_Product with ASI | All 35 buildings: products with per-instance attributes |
| Structural steel (pipe racks) | **FRAME** verb | TE structural bays |
| Instrument clusters | **CLUSTER** verb | TE semi-regular groups (47,607 instances) |
| Modular skids | BOM sub-assembly (IsBOM=Y) | Any intermediate BOM node — proven at every depth |
| P&ID traceability | AD_ChangeLog + W_Verb_Node | Full audit trail per element |

**Disciplines map directly.** Construction has ARC/STR/FP/ELEC/ACMV. A plant
has PROCESS/PIPING/ELECTRICAL/INSTRUMENTATION/STRUCTURAL/HVAC. Same AD_Org
pattern — metadata partitions, not structural divisions. Same AD_Val_Rule
scoping per discipline.

### 11.3 What's New — Minimal

**Isometric drawing output.** Plant piping conventionally produces isometric
drawings for fabrication. This is a presentation concern (AD_PrintFormat in
iDempiere terms), not a compilation concern. The BOM data is complete; the
rendering is a view.

**P&ID linkage.** Process plants have Piping & Instrumentation Diagrams that
define logical connectivity. The engine's `I_Element_Connectivity` extraction
table (ACTION_ROADMAP R22) would carry this — same table, different domain
source. This is a known gap (TODO) but the schema slot exists.

### 11.4 IFC Gap — Industry Uses Different Standards

The process plant industry primarily uses **ISO 15926**, **DEXPI**, and
**PCF** (Piping Component File) — not IFC. No public IFC models of refineries
or chemical plants exist. This means the plant vertical would be hand-authored
(like the marine Phase 1) or would require an import adapter from DEXPI/PCF
to BOM.db.

**This does not block the engine proof.** A hand-authored 200-element process
unit BOM compiles through the existing pipeline identically to a hand-authored
hull BOM. The import path differs; the compilation path is the same.

---

## 12. The Design Framework — What's Already Addressed

The strategic review (prompts/40_strategic_review.md Appendix B) asked: what is the
engine's true potential? The answer across four domains:

### 12.1 Engine Patterns That Transfer Without Modification

| Pattern | Construction proof | Marine | Tunnel | Earthworks | Plant |
|---------|-------------------|--------|--------|------------|-------|
| BOM recursion | 35 buildings, 48K elements | Hull → Section → Plate | Tunnel → Ring → Segment | Zone → Material layer | Unit → Equipment → Pipe |
| TILE verb | 74.4% of TE (35K elements) | Hull plating | — | — | — |
| ROUTE verb | Sprinkler/drainage/HVAC | Bilge/fuel piping | Ventilation/drainage | — | Process piping |
| ARRAY verb | Rail sleepers (93% compression) | Stiffeners, frames | Lighting, rings | Retaining wall panels | Pipe rack bays |
| FRAME verb | Structural bays | Transverse frames | — | — | Pipe rack structure |
| CLUSTER verb | 47,607 semi-regular instances | Bracket groups | — | — | Instrument clusters |
| ASI per-instance | Wall length, pipe diameter | Plate size, thickness | Ring orientation | Volume, compaction | Pressure rating, duty |
| Exception ordering | 200 houses in 5 lines | Ice-class in 12 lines | Cross-passage in 1 line | — | Upgraded vessel in 3 lines |
| Reference class | 100 floors as 1 line | 1,200 rings as 1 line | Same | — | 20 identical bays as 1 line |
| G1-G6 gates | 19/34 ALL GREEN | Same arithmetic | Same | Same | Same |
| AD_Val_Rule | UBBL/NFPA (30 rules) | Classification society rules | Tunnel safety regs | Geotechnical standards | ASME/API codes |
| 4D-8D as queries | ScheduleDAO, CostDAO, etc. | Same SQL, different products | Same | Same | Same |
| Order inheritance | SH_BASE → SH_SOLAR → SH_PREMIUM | HULL_STD → HULL_ICE → HULL_ICE_ARCTIC | — | — | UNIT_STD → UNIT_HI_PRESS |

### 12.2 New Capabilities Required (Bounded Extensions)

| Extension | For which domains | Precedent in engine | Scope |
|-----------|------------------|-------------------|-------|
| **LOFTED_SURFACE** (curved TILE) | Marine hull plating | AlignmentContext terrain-following | 2-3 sessions |
| **Alignment roll** (cant) | Tunnel ring placement | AlignmentContext heading/elevation | ~1 session |
| **DEXPI/PCF import** | Industrial plant | IFCtoBOM extraction pipeline | Separate adapter |
| **Isometric view** | Plant piping | AD_PrintFormat (presentation) | Post-compilation |

Four extensions across four domains. None requires redesigning the engine.
Each is a bounded addition to an existing pattern. The engine's core loop —
recurse BOM, accumulate tack, emit leaf, verify gates — remains untouched.

### 12.3 The Design Framework Inventory

The following engine capabilities, already designed and substantially implemented,
are what make domain-agnostic compilation possible. Each was built for construction
but is structurally domain-independent:

| Framework capability | Spec | Status | Why it generalises |
|---------------------|------|--------|-------------------|
| Recursive BOM walker | BBC §2.2 | **PROVEN** (48K elements) | Any assembly decomposes recursively |
| Tack convention (LBD) | BBC §4 | **PROVEN** (35 buildings) | Any physical object has a bounding box corner |
| Verb algebra (77 verbs) | BIM_COBOL §6 | **PROVEN** (5 dominant) | Spatial patterns repeat across domains |
| Category-constrained swap | BBC §3.5 | **IMPLEMENTED** | Any product catalog has type hierarchies |
| 4-mutation exception ordering | POB §1.1 | **IMPLEMENTED** (Sessions A-E) | Any configured product has variants |
| Reference class compression | POB §1.2 | **IMPLEMENTED** | Any repeated unit can be qty × template |
| Order inheritance | POB §6 | **IMPLEMENTED** (S68e) | Any variant stack is composable |
| 6-gate verification | TestArch G1-G6 | **PROVEN** (19/34 GREEN) | Arithmetic verification is domain-agnostic |
| Tamper seal | TestArch §seal | **PROVEN** (v6) | Code integrity is domain-agnostic |
| AD_Val_Rule jurisdiction | DocValidate.md | **IMPLEMENTED** (30 rules) | Every domain has regulatory codes |
| DiffVerb + Callout | POB §9 | **IMPLEMENTED** (S72) | Reactive editing applies to any spatial assembly |
| AD_ChangeLog audit | POB §10 | **IMPLEMENTED** | Provenance applies to any design process |
| nD as queries | POB §5 | **IMPLEMENTED** (4D-7D DAOs) | Cost/schedule/carbon are product attributes |
| AlignmentContext | INFRA_DESIGNER §1 | **PROVEN** (689 survey pts) | Any linear infrastructure follows a path |
| CutFillCalculator | INFRA_DESIGNER §5 | **PROVEN** | Any site has earthworks |
| BOM Mining (Approve) | POB §4 | **SPEC** | Any domain accumulates reusable patterns |
| Site-as-warehouse | POB §2.2 | **SPEC** | Any multi-unit project has plot allocation |
| Domain-agnostic pipeline | BBC §5 (11 stages) | **PROVEN** (RE/CO/IN/IP) | Stages operate on abstract BOM nodes |

**The framework is not aspirational — it is substantially built.** Of 18 capabilities
listed, 14 are PROVEN or IMPLEMENTED, 4 are SPEC (design complete, code pending).
The extensions required for marine, tunnel, earthworks, and plant are not new
framework capabilities — they are surface providers and import adapters that plug
into existing framework interfaces.

### GEO Formula Verification — The ShipYard Breakthrough

For buildings, GEO debug mode verifies compiled positions against the
**extraction source** — a database of positions from the original IFC
(LMP §7). The comparison
target is a lookup: `SELECT minX, minY, minZ FROM extracted.elements_rtree
WHERE guid = ?`.

ShipYard domains have no extraction source. A hull is designed, not scanned.
But they have something better: **a mathematical definition.** A hull surface
is a NURBS equation. A tunnel lining is a circular arc. A bridge deck follows
a survey alignment. The shape is defined by a formula, not a database.

GEO evolves from database comparison to **formula comparison:**

| Domain | GEO comparison target | What it proves |
|--------|----------------------|---------------|
| Building (Rosetta) | `extracted.db` lookup by GUID | Compiled position matches IFC source |
| Ship hull | `hull_surface(u, v) → (x, y, z)` | Plate sits on the design surface |
| Tunnel ring | `arc(angle, radius) → (x, y, z)` | Segment follows the bore profile |
| Bridge deck | `alignment(chainage, offset) → (x, y, z)` | Element follows the survey curve |
| Plant pipe | `pipe_route(param) → (x, y, z)` | Segment follows the P&ID route |

The TACK LEAF log line stays the same — `anchor + offset + half → centroid`.
The MATCH/DRIFT verdict stays the same — delta per axis, within tolerance.
Only the **comparison target** changes: from a database query to a function
evaluation.

```
[GEO] TACK LEAF HullPlate_A7 guid=...
  compiled  LBD=(12.450, 3.200, -1.800)
  surface   LBD=(12.450, 3.200, -1.802)   ← hull_surface(u=0.45, v=0.32)
  delta=(0.000mm, 0.000mm, 2.000mm) MATCH (≤5mm hull tolerance)
```

This is the equivalent of protein science's energy minimisation — the
verification target isn't a reference structure, it's a physics equation.
"Does this folded shape have minimum free energy?" becomes "Does this hull
plate sit on the design surface within tolerance?"

**BIMEyes integration.** The existing EYES proof framework
(EYES_SRS.md) defines proofs as `prove(placement) → PROVEN |
VIOLATED`. A formula-based proof is the same interface:

```java
public class SurfaceConformanceProof implements Proof {
    /** P-SURFACE: element LBD within tolerance of design surface. */
    ProofResult prove(Placement p, SurfaceFunction surface, double toleranceMm);
}
```

The 26 existing EYES proofs check spatial invariants (overlap, containment,
gradient). SurfaceConformanceProof checks conformance to a mathematical
definition. Same proof framework, new comparison target. The GEO log
carries the verdict.

**What this means for ShipYard:** a hull block is compiled from a BOM
(plates + stiffeners + brackets, each with tack offsets). GEO verifies
every plate against the hull surface equation. If any plate drifts from the
surface, the log says which plate, by how much, on which axis. The shipyard
doesn't need to visually inspect the 3D model — the compiler's own GEO
proof chain tells them whether the block is correct.

This is the billion-dollar capability: **geometry verification by formula,
not by inspection.** No other BIM tool does this because no other tool
compiles from BOMs and has a mathematical comparison target. Rosetta Stones
taught the spatial relationships. GEO proves they hold — for buildings
against extraction, for ships against hull equations, for tunnels against
bore profiles.

---

## Cross-Domain Precedent

The abstract problem — infer 3D structure from 1D specification by learning
from solved examples — has been solved in two other domains:

**Protein science.** The folding problem (1D amino acid sequence → 3D
structure) was solved by learning spatial motifs from 200K experimentally
solved proteins in the Protein Data Bank. Template-based modelling reuses
known folds for new sequences. AlphaFold proved that learned spatial
relationships generalise. Our Rosetta Stone library is the PDB for
buildings — 35 solved structures whose tack offsets, verb patterns, and
product resolutions transfer to new buildings of similar type.

**Robotics.** URDF decomposes a robot into links with parent-child
transforms. Forward kinematics accumulates transforms to compute world
positions — the same math as our BOM walk anchor stack. Calibration
verifies computed vs measured positions — their GEO MATCH/DRIFT.

Construction is the last major domain to gain this capability. The engine
is domain-agnostic — the same BOM walker, tack convention, and GEO proof
that compiles a 35-building residential library can compile a hull block
library, a tunnel ring library, or an industrial plant module library.
The spatial relationships are different data, not different code.

See [TheRosettaStoneStrategy.md](https://github.com/red1oon/BIMCompiler/blob/master/docs/archive/TheRosettaStoneStrategy.md) §Cross-Domain for the full comparison table.

---

## References

- ProjectOrderBlueprint.md §3 — Abstract Category Tree (VESSEL example)
- BIM_COBOL.md §TILE — TILE verb specification
- TerminalAnalysis.md — 48K-element proof of TILE at scale
- InfrastructureAnalysis.md — Domain-agnostic precedent (BR/RD/RL)
- INFRA_DESIGNER_SRS.md §1 — AlignmentContext terrain-following
- `prompts/40_strategic_review.md` — Strategic review (Appendices A-C, local only)
- [bSI-InfraRoom/IFC-Tunnel-Deployment](https://github.com/bSI-InfraRoom/IFC-Tunnel-Deployment) — 60+ tunnel IFC files
- [bSI-InfraRoom/IFC-infra-unit-test](https://github.com/bSI-InfraRoom/IFC-infra-unit-test) — Earthworks, marine, drainage IFC4X3

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
