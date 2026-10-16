# ⚠ DO NOT REMOVE — INFRA_ROAD_RAIL_GAP_CLOSURE: what "real" road/rail compilation requires, read the log after every run

## Scope
**EXTRACT OR COMPILE ONLY.** This file names the gaps between "the RD/RL walker compiles a toy file"
and "this suite can compile a real road/rail project" — grounded in code already read, not invented.
Companion to `docs/archive/InfrastructureAnalysis.md` (frozen 2026-03-28 snapshot) and
`docs/archive/beyond-buildings-roadmap.md` (domain-extension thesis). This file is the ACTIVE tracker;
the archived docs are prior-art context, not to be re-derived.

## 2026-08-15 — Session origin
User asked whether IFC4X3 (Civil 3D-exportable) could bolster the BIM5D suite for road planning. Traced
existing prior art (`InfrastructureAnalysis.md`), found the current `reference/infrastructure/Infra-Road.ifc`
is a **416KB synthetic teaching file** — its own IFC header reads `FILE_NAME(...'ifc silly sample scene -
project'...)`, authored in SketchUp, description "Demystifying IFC with a playful scene using diverse
building elements and compositions." Compare to the real building refs this project already compiles
against: `TerminalMerged.ifc` (593MB, real airport), `Hospital 2.0.ifc` (236MB, real hospital),
`LTU_AHouse_AIR.ifc` (708MB). No public real-scale road/rail IFC project was found via search (buildingSMART's
official `IFC4.3.x-sample-models` repo tops out at 796KB, all single-feature conformance test cases, same
toy category — checked via `gh api` tree listing 2026-08-15).

## §1 — Real gap closure = 4 items, not 1

### Item 1 — Walker/extraction mechanism (SCOPED, SPEC WRITTEN, **NOT EXECUTED**)
`prompts/done/135_rd_rl_infra_walker.md` already names this precisely: `IFCtoBOM/ExtractionPopulator.java`
groups elements by `storey` (`IfcBuildingStorey` name only); infra files use `IfcRoadPart`/`IfcRailwayPart`/
`IfcFacilityPart` instead, which land in `spatial_structure.type` but are never recognized as spatial
containers, so `storeyElements` stays empty and P127's `SpatialContainerConfig.discover()` finds nothing.
**That file has no `# DONE` prefix and an empty findings section below its `---`** — despite living in
`prompts/done/`, it was never run. Do not assume it's closed because of its folder location.

**Correction to a claim made earlier in this same session's chat, before this file existed:** I initially
guessed the gap was in `DAGCompiler/.../bom/walker/PlacementCollectorVisitor.java`, which hardcodes
`"FLOOR".equals(childBom.getBomType())` in ~6 places (lines 295, 337, 532, 537, 663, 1049 area) to anchor
Z-offsets. Reading `BomDropper.java:631-637` (`deriveHostType(int depth)`) shows `bom_type` is assigned
**generically by tree depth** — `depth 0 → BUILDING`, `depth 1 → FLOOR`, `default → ROOM` — not by source
IFC class name. So once ExtractionPopulator (135) correctly builds a FACILITY→SEGMENT→LEAF tree for infra,
`BomDropper` should label the depth-1 SEGMENT nodes `"FLOOR"` automatically, and `PlacementCollectorVisitor`'s
existing checks should fire without modification. **This is unconfirmed until 135 is actually run** — flag
it as the first thing to check in 135's Gate output, not a second guaranteed fix.

**Action:** run 135 as written. Its own gate (`RD`/`RL` element count > 0, `SH` regression 7/7) is sufficient
proof for this item. If RD/RL still produce 0 elements after 135, the PlacementCollectorVisitor angle above
is the next thing to check — append findings to 135, don't fork a duplicate task file.

### Item 2 — Chainage / linear referencing (NAMED, NOT SPEC'D, NOT BUILT)
Real roads position elements by station-along-a-curve (chainage + offset), not Cartesian dx/dy/dz. Named
as N7 in `InfrastructureAnalysis.md` ("BOM assumes Cartesian dx/dy/dz... Real-world curved alignments would
[need conversion]"), rated LOW at the time only because the demo files are straight/Cartesian. Any real
project's `IfcAlignment` curve entities need this conversion before placement math applies. No design work
exists yet — not even a draft. Needs its own spec before coding (Spec-First rule).

### Item 3 — Terrain / Z-reference (NAMED, NOT BUILT — but real, tested PRIOR ART exists, unported)
`InfrastructureAnalysis.md` §N4 defers full `IfcMapConversion` subtraction and names a full validator-rule
table keyed off terrain Z (cut depth, fill height, min cover, flood clearance, max gradient, super-elevation,
smooth contour) — all of it needs a real natural-ground surface to measure against.

**`prompts/TERRAIN_MIGRATION.md` is directly relevant and should be read before any new terrain design.**
It is a port spec (not yet executed — `bim-ootb/modeller/` has no terrain code yet, only the sample
input/output pair from PR #1227) for real, tested prior art in the user's own IfcOpenShell/Bonsai fork:
`~/IfcOpenShell/.../federation/pdf_terrain/` — PDF/PNG survey scan → Google Vision OCR → georeferenced
elevation points → `IfcGeographicElement`s under one `IfcSite`, plus DXF. Validated on a real survey: 689
points, "pixel-perfect alignment" per the source's own header. Four real OCR bugs already found and fixed
(decimal separator, image-dimension mismatch, split-value merging, pixel→metre scale from chainage markers).

**What it gives this lane, and what it doesn't (read `TERRAIN_MIGRATION.md` §0/§3 in full, don't re-derive):**
- Gives: a proven, real-data path from a survey drawing to georeferenced elevation points in IFC — exactly
  the kind of real Z-reference data item 3 needs, and it already speaks IFC (`IfcGeographicElement`/`IfcSite`),
  so once Item 1 is closed, extraction of terrain points through the same pipeline should need no new
  spatial-container work (points, not a Segment hierarchy).
- Does NOT give: a continuous surface/mesh. It is a **point cloud only** — no TIN/interpolation step exists
  in the source (the original tool hands surface-from-points off to Civil 3D). Cut/fill volume math needs
  SOME interpolation between points, which is real, unbuilt scope on top of the port (`TERRAIN_MIGRATION.md`
  §7 Q1) — a genuinely open, undecided question, not a detail to assume away.
- Not yet ported anywhere. Its target is the browser Modeller (`bim-ootb`), not this compiler's Java
  pipeline — porting the extraction logic a second time into `IFCtoBOM`/`DAGCompiler`, or simply importing
  the Modeller-exported IFC through the existing extraction path, are both open, undecided integration
  choices for infra's purposes specifically (the port spec was written for Modeller cut/fill, not for this
  lane — read it as reusable proof, not as already-scoped for this lane).

**Action:** do not design a new terrain extraction pipeline. If/when this item is picked up, start from
`TERRAIN_MIGRATION.md` and answer its open questions (§7) in the direction this lane needs, same PORT
discipline as the doc itself states.

### Item 3a — TIN spec (resolves `TERRAIN_MIGRATION.md` §7 Q1, 2026-08-16)

**Decision this spec makes:** build a real TIN, don't stay point-cloud-only. Delaunay triangulation of the
extracted points' XY, with Z carried as a per-vertex attribute, is a deterministic, closed-form algorithm —
not a research problem, fits this project's "deterministic, non-invent" bar better than most features here.

**Library, not hand-rolled:**
- Java pipeline (`DAGCompiler`): JTS Topology Suite, `org.locationtech.jts.triangulate.DelaunayTriangulationBuilder`
  — mature, MIT/EPL licensed, standard in JVM geometry work.
- Browser Modeller (`bim-ootb`): Delaunator (or d3-delaunay, which wraps it) — same algorithm, JS side, the
  library `TERRAIN_MIGRATION.md`'s target already leans browser/ThreeJS-WASM.

**Input:** the `ground_pattern` points from `TERRAIN_MIGRATION.md`'s Stage 3 extraction — real (x,y,z)
triples. **Do not triangulate `invert_pattern`/IL points into the ground TIN** — those are pipe/drain invert
levels, a different surface entirely; keep them in their own collection as the source already does.

**Output — open sub-question, not decided here:** a triangle list (3 vertex indices each) over the point
set. Whether this gets exported as a new IFC shape (`IfcTriangulatedFaceSet` under `IfcSite`) or stays
internal to volume computation only is unresolved — `TERRAIN_MIGRATION.md` never decided this either (its
own §1 Stage 6 confirms the source tool exports per-point `IfcGeographicElement`s, no surface entity, ever).
Don't invent an answer; name it as the next open question when this is picked up.

**Volume/cut-fill math:** standard prismoidal / grid-sampling comparison of TIN-surface Z vs. design-surface
Z at consistent sample points — feeds the SAME already-proven pattern `TERRAIN_MIGRATION.md` §5 names (real
quantity → declared UOM `M3` → existing `analysis_sidecar.js`/`proj_fold.js` BOM machinery). Not a new
costing engine.

**Known limitation — explicit, not silently accepted:** no breaklines. The source pipeline (Google Vision
OCR of printed elevation numbers on a scanned survey) extracts scattered points only, no linework — so
auto-triangulation can draw a triangle edge straight across a ditch, ridge, or top-of-bank instead of
following it. A real Civil 3D surface lets a surveyor draw breaklines to force the triangulation to respect
those features; this spec doesn't have that input to work with. Acceptable for gentle terrain and the
validator-rule table's actual need (code-compliance thresholds: max gradient, min cover, max crossfall —
not survey-grade precision). Not a substitute for surveyor-judgment precision on tight engineering
tolerances. If breaklines are ever needed, that's separate, unscoped future work, not assumed here.

**Witness/gate — numeric, not visual, per this project's law:**
- (a) Euler-formula invariant on the real 689-point fixture (`survey_highres_extracted.json`, already
  checked into `~/bim-ootb/internal/PDF_Terrain/`): triangulate it, confirm triangle count matches
  `2N − 2 − boundary_points` for the resulting convex hull — a concrete, checkable count, not an eyeball
  check.
- (b) volume-conservation check on a synthetic test surface with an analytically known volume (e.g. a
  tilted plane or a pyramid of known dimensions) — triangulate, sum per-triangle prism volumes, compare to
  the closed-form answer.

**Status:** SPEC'D (this entry, 2026-08-16). NOT BUILT. Prerequisite: `TERRAIN_MIGRATION.md`'s point-extraction
port must land first (Item 3) — this TIN step attaches downstream of point extraction, upstream of cut/fill
volume math.

### Item 4 — Real-scale validation data (BLOCKED — no source found, not a code task)
No public real-project-scale road/rail IFC exists to validate against (checked buildingSMART's official
repo + web search, 2026-08-15 — see session log above). The toy 416KB file is sufficient to prove Items 1-3
mechanically but not to prove the suite holds at real complexity (intersections, multiple alignments, varying
cross-sections, real chainage lengths). Real closure requires either the user's own project/client access
(the same channel that produced `TerminalMerged.ifc`/`Hospital 2.0.ifc`) or a vendor corridor sample
(Civil 3D/Trimble Novapoint demo data — bigger than the cert files, still not a real project, a step up
only) — **⛔ BLOCKED: does the user have a real road/rail project IFC source, or should this validate against
a vendor corridor demo instead?** Not resolvable by extraction; a user fact/decision.

## §2 — Definition of done
Items 1-3 built and passing their own gates (`RD`/`RL` element count > 0 + 7/7 regression; a named chainage
test case; a named terrain cut/fill test case), THEN validated against real-scale data (Item 4) — mirrors
how Terminal/Hospital validate the building pipeline today. Right now: Item 1 is spec'd but not run; Item 2
is named but not spec'd; Item 3's point-extraction half is real prior art awaiting a port decision and its
TIN half is spec'd (Item 3a) but not built; Item 4 is blocked on a user decision.

---
