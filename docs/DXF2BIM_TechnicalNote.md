# DXF2BIM — a deterministic 2D ⇄ BIM round trip (technical note)
*[← Back to the **User Guide**](USER_GUIDE.md) · [User guide for this feature](DXF2BIMGuide.md) · [Home](index.md)*

**Redhuan D. Oon · 2026-10-17 · MIT licensed · status: preliminary (basic shapes)**

---

## Abstract

We describe a deterministic, rule-based method that (1) reduces a BIM model to a **standard 2D drawing set**
(plans, elevations, roof plan, section) whose every grid line, dimension, level and door swing is derived from IFC
relationships and measured geometry, and (2) rebuilds a **BIM model from such a 2D set** — walls, floor slabs,
roof, openings and door/window fills — exporting IFC4 with a storey structure. The meaning the geometry cannot carry
is stated as **metadata embedded in the DXF itself**, each marking recording its source (file, model or user). A
**qualify verdict** gates the build: either the set is complete, or a machine-readable list of blocking items is
returned. Nothing is guessed: an unknown value is a named gap. No AI or machine-learning inference runs at any step
of the pipeline. On a two-storey residential model (the Duplex) the round trip reproduces every converted element
within 1 mm of the reference run and exports 96 wall pieces, 2 slabs, 1 roof, 14 doors and 22 windows on 2 storeys.

---

## 1 · Problem

Turning 2D drawings into BIM is usually manual (link the drawing, trace it) or probabilistic (recognise symbols).
Our own earlier attempts at the **first leg** — producing the 2D set from a model — failed in instructive ways
(measured on the earlier writer, BIMCompiler `2D_Layout/python/drawing_writer*.py`):

| Earlier rule | Consequence |
|---|---|
| exterior vs inner wall by element name (`'Ext' in name`) | inner load-bearing walls not gridded |
| grid snapped to a 100 mm module, merged within 0.20 m | dimensions no longer equal the model |
| dimensions written as text | figures typed, not measured |
| door hinge always at the opening's min-x; swing side by **which side has more furniture** | door swings matched the model 6 of 14 times (≈ chance) |
| plans drew only the elements of that storey | walls spanning two storeys missing from the upper plan |
| elevations: everything within 1.0 m of the face, or every triangle edge | inner walls and clutter in elevations |

The common cause: meaning was **inferred** from names, furniture and snapping, and **no test compared the drawing
back to the model**, so errors were invisible and fixed by hand.

## 2 · Method

1. **Semantics from IFC relationships, not names.** Load-bearing = a foundation wall runs under the wall's axis;
   door/window host from `IfcRelFillsElement`; door hinge from the IFC door operation type (left/right hand) and
   placement axes; swing side from the asymmetric leaf; radius = leaf width. Missing data → a gap note, never an arc.
2. **Drafting conventions, stated as choices.** Plans show everything the cut plane (storey + 1.2 m) passes through,
   whatever its storey; grid on load-bearing and exterior axes, labels 1…n / A…n skipping I and O, never snapped;
   three dimension tiers (overall · grid-to-grid · detail) as real DIMENSION entities; slab thickness from a
   **section**; interior door heights from the **door schedule** via the door tag.
3. **Metadata in the DXF.** A layer `DXF2BIM-MARK` holds `@KEY=value` texts: view/role, level, face, cut, units,
   layer meanings, tags, schedule rows, wall tops, regions/exclusions. A suffix `@BY=model|user` records who stated
   it; none = stated in the file. The file remains an ordinary DXF.
4. **Qualify verdict.** Before building, the set is checked: units stated (never taken from the header alone),
   every storey has a plan with a level, every building face an elevation, every layer mapped, every dimension text
   equal to its measurement, grid lines on walls, levels consistent, and every pipeline gap resolved. Output:
   *qualifies*, or blocking/advisory items with code, sheet, entity handles and position.
5. **Rebuild with provenance.** Walls (footprint or line pairs), slabs (from the plan outline and the section),
   roof (roof plan + level), openings cut from drawn wall gaps, fills from a component library (real meshes; a
   missing product is a hard failure, never a box). Every element records the DXF handle and layer it came from.
6. **Witnesses against the model, with falsification.** Every rule is checked against the source model (the
   answer key of the round trip), and every check is run once with the rule deliberately broken to prove it fails.

## 3 · Evidence (Duplex, 2026-10-16)

Each number is read from a witness log; the full number → log-line mapping is in
`prompts/film_dxf2bim_facts.md` (BIMCompiler).

| Claim | Result | Witness |
|---|---|---|
| Standard set is deterministic | 5 separate processes → one digest | `test_std2d` W1-proc |
| Grid on the load-bearing / exterior axes, none extra | x = 3 axes, y = 4 axes, labels 1–3 / A–D | `test_std2d` W2, W4 |
| Dimensions equal to the model, no overrides | 34 DIMENSION entities on the ground-floor plan (3 tiers), each within 0.5 mm | `test_std2d` W3 |
| Door hinge and swing from the IFC | 14 / 14 arcs; earlier hand-made set 6 / 14 swing side | `test_std2d` W5 (+ INFO line) |
| A 50 mm wall shift in the model is detected | stale drawing fails grid and dimension checks; regenerated passes | `test_std2d` W7 |
| Standard set qualifies | 0 blocking, 75 advisory | `rosetta_qualify` (Node) = Modeller page |
| Rebuild parity, page vs Node | every element within 1 mm, same run fingerprint | Modeller `witness_dxf_convert` C1 |
| IFC export | 96 wall pieces, 2 slabs, 1 roof, 14 doors, 22 windows; 2 storeys; all contained | `witness_dxf_convert` C2 |
| Raw drawings refused until complete | stripped set blocked; filled through the editor, then convert | `witness_dxf_meta_editor` E2/E5 |
| Units trap caught (independent sample) | header mm → 0.80 × 0.56 m; door radii 24–36 in → 20.2 × 14.3 m; units carry their source | `jscad_units_probe`, `t8_sandbox` |
| Independent drawing (not authored by us) | 17 walls, outline 384 × 192 in = printed 32′ × 16′; height 120 in from its level lines | `farm_walls`, `farm_heights` |

**Determinism and genericity.** The reader modules contain no building names, layer names or building-specific
numbers; the standard writer contains no Duplex constants. All tolerances are named constants recorded in the spec.

## 4 · Limits (what is not claimed)

- **Basic shapes only** — no stairs, MEP, furniture; columns are cut but not yet drawn as gridded column symbols.
- **Rectilinear geometry** — skewed/curved walls are reported as gaps; roofs are drawn as flat outlines.
- **Openings above or below the plan cut** are not yet shown as gaps from their host relationship (in progress).
- **Blocks (INSERT)** in user DXF files are not expanded yet; door/window blocks are therefore not read.
- **The metadata of the standard set is derived from the model** (`@BY=model`). A raw drawing needs a person to
  state it through the editor; door schedule entry is being added.
- **One round-trip building** (Duplex) and **one partial independent drawing** (Farmhouse). "Any DXF" is not claimed.
- **No novelty claim beyond our search:** prior art reviewed (2026-10-11): manual tracing in commercial authoring
  tools; an open student project reading structural members from user-typed layer names; an open-source script
  converting lines to IFC curves; a manufacturing tool extruding parts. We found **no general, deterministic,
  open-source DXF-to-BIM tool**; a combination of the features above was not found elsewhere in that search.
  A wider search (commercial tools, research, patents) has not been done.

## 5 · Reproduce

Everything is MIT licensed on GitHub: BIMCompiler (reader modules `deploy/dev/dxf2*.js`, writer
`2D_Layout/python/std2d.py`, tests `tests/dxf2bim/`, specs `docs/DXF2BIM_*.md`) and bim-ootb (Modeller
`modeller/dxf2bim*`, `modeller/dxf_*`, witnesses `modeller/tests/witness_dxf_*`, lane spec
`prompts/DXF2BIM_MODELLER_LANE.md`). Work landed in BIMCompiler PRs #176–#193 and bim-ootb PRs #2049–#2069,
dated 2026-10-16/17. The developer chain is in the [user guide](DXF2BIMGuide.md#for-developers).

*Development note: the code, tests and this note were written with AI assistance (Claude Code); the pipeline
itself makes no AI call. Test drawing credit: American Farmhouse drawings by Jay Osborne (freefarmhouse.com),
CC BY-SA, not included in the repository.*
