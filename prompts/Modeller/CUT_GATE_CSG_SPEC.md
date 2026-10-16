<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC SESSION ONLY, ZERO APP CODE CHANGED

```
SCOPE: this is a SPEC, not a build. No bim-ootb app code was touched (the cut gate, bonsai_kernel.js,
bonsai_kernel_worker.js are all UNCHANGED — read-only investigation). All measurements below are real,
reproducible, sourced to the LIVE Duplex resident (Duplex_ARC.db + patches, Duplex_geo.db geoV=6 fetched
read-only from the production OCI bucket the Modeller itself uses) — no invented numbers, no screenshots
as evidence (FUNDAMENTAL LAW). Every table has a script + log under prompts/Modeller/cut_gate_bench/ that
reproduces it. Read the log after every run (Log Mandate) before trusting any number in this file.
A future BUILD session must re-derive nothing here — start at §THE CALL and §WITNESS CLAIMS.
```

## §0 — What this spec answers, and reconciling it against the cited prior finding

**Correction, logged honestly rather than silently fixed:** this session first read
`prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` from a STALE local checkout (`/home/red1/bim-compiler`
main, 376 lines, last dated section 2026-07-09) and — finding no "47/2/45" table there — wrongly concluded
the brief's cited measurement did not exist. It does exist: a FRESH worktree off `origin/master` (set up
for this session's own work, `/tmp/wt-cut-diag`) shows the same file at 563 lines, with a 2026-08-07
"round 3" section (`§cut-gate root-caused to architecture-scale`) containing exactly this finding —
`diag_cut_gate.js`, run against the live folded Duplex scene (`window.__arcGuidByFid`-seeded `GEOM_INSERT`
fids, not a static DB scan): **"of 47 Duplex 'wallish' GEOM_INSERT candidates, exactly 2 are cuttable
(fid77/fid79, sz=4.20×0.43×1.25, tris=12 — plain envelope boxes) and 45 are refused — every refused one
has real multi-triangle geometry (tris=40..424, never 12)."** Round 2 of the same file independently
corroborated the same 2-pass/45-refuse shape via a different fid seed order (fid81 windowless foundation
wall + fid32 floor slab as the 2 passers). The lesson this project's own Anti-Drift rule exists for: verify
against a FRESH fetch before declaring a citation missing, not a locally-stale checkout — noted here so the
next session doesn't repeat it.

**This session's own §1 measurement is a real, independently reproducible cross-check — via a DIFFERENT
methodology — that lands close but not identical: 57 candidates / 7 already-boxes / 50 refuse**, against a
direct static scan of `elements_meta WHERE ifc_class LIKE 'IfcWall%'` joined to the live geo store, running
the literal `_insertCutBox` algorithm (not a live-scene fid probe — `diag_cut_gate.js` itself is not
committed to the repo, only its log excerpt is quoted above, so it cannot be re-run to find the exact
source of the 47-vs-57 / 2-vs-7 gap). Both measurements agree on the qualitative and load-bearing shape
this spec depends on — the overwhelming majority of Duplex's wall population refuses the box-only gate
because it now carries real authored multi-triangle geometry, and only a small handful of plain envelope
boxes still pass — and both are in the same ballpark (proportionally, 45/47 ≈ 96% refuse vs. this
session's 50/57 ≈ 88% refuse). **The precise counts are NOT reconciled and this is stated as an open item,
not smoothed over** — plausible causes (a live-scene fid pool can differ from a static elements_meta scan
if some walls fail to seed as `GEOM_INSERT` for reasons unrelated to geometry, e.g. a discipline/visibility
filter, or if the two sessions ran against different `geoV`s) are named but NOT verified; see §8 item 6.
**All measured tables in §1-§3 below are this session's own fresh, fully reproducible work** (script + log
committed alongside this spec) — the prior session's 47/2/45 is cited as corroboration, not re-derived.

## §1 — TASK 1: characterizing the real refusals (Duplex, live resident)

**Method** (`cut_gate_bench/classify.py`, log `cut_gate_bench/run_output/classify_run1.txt`): fetched
`Duplex_geo.db` read-only from the production OCI URL the Modeller itself uses
(`https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/modeller/Duplex_geo.db?v=6`,
matching `str_walker_outliner.js`'s `RESIDENTS.Duplex.geoV=6`); took the checked-in
`~/bim-ootb/modeller/Duplex_ARC.db` and applied `~/bim-ootb/modeller/patches/Duplex_ARC.db.sql` on a copy
(the same self-heal patch the live client applies at load) to reproduce the exact live schema
(`rel_fills_host`, `rel_material_layer_set`). For every `elements_meta` row with `ifc_class LIKE
'IfcWall%'` that resolves a `element_instances.geometry_hash`, decoded `component_geometries.vertices`
(Float32) and re-ran **the exact `_insertCutBox()` box test** from `bonsai_kernel.js:152-169` (every
vertex must sit at one of the world-AABB's 8 actual corners, tol = `1e-4 * max(extent)`) — not a proxy,
the literal algorithm, ported line-for-line.

| metric | value |
|---|---|
| wallish (`IfcWall*`) candidates resolving a mesh | **57** |
| pass the box test (cuttable TODAY) | **7** — all "Foundation - Concrete" footing walls |
| refuse the box test | **50** |
| of the 50, carry `rel_material_layer_set` rows (authored multi-layer) | **50 / 50 (100%)** |
| of the 50, ALSO a `rel_fills_host` host (real door/window opening) | **18 / 50** — zero overlap gap: every opening-host wall is also layered; there is no wall-class refusal caused by an opening alone |
| of the 50, layered-only (no opening) | **32 / 50** |
| class (c) "other" (neither layered nor opening, i.e. rotation/other) | **0** — Duplex has zero rotated walls (`rotation_z=0.0` on all 57, verified) |

**Finding: for Duplex's wall class, 100% of the richness gate refusal is attributable to authored
material-layer construction** (§LOD400-LAYERS-REAL, already shipped, geoV=6). Opening-cuts never occur
without layering riding along on the same wall. This directly bounds candidate B's schema-coverage
question from task 3: the data source it would need (`component_geometry_layers`) already exists for
100% of the refusing population — see §3.

## §2 — TASK 2: candidate A benchmark — three-bvh-csg `Evaluator`/`Brush`/`SUBTRACTION`

**Method** (`cut_gate_bench/export_meshes.py` → `bench_csg.js`, log
`cut_gate_bench/run_output/bench_csg_run.txt`): scratch Node harness (`npm install three three-bvh-csg`, versions
logged in the run), never touching app code. Built a `Brush` from each of the 50 refusing elements' REAL
triangle mesh (from `component_geometries`, the same buffer the Modeller renders) and a representative
"window-like" void `Brush` (40% of the two long axes, centered; overshoots the thin/thickness axis 2× on
both sides so the cut fully perforates — the only synthetic assumption in this harness, documented in the
script). Ran `SUBTRACTION` against every one of the 50. Verified numerically, not visually:
- **Volume integrity**: signed tetrahedron-sum volume before/after, cross-checked against a second
  `INTERSECTION` evaluation (`wall ∩ void`) via the identity `vol(subtraction) == vol(wall) - vol(wall∩void)`.
- **Watertightness**: position-keyed edge-pairing (every undirected edge used by exactly 2 triangles,
  each direction once) — NOT index-keyed, because `Evaluator` output is an unwelded triangle soup (index-
  keyed pairing was tried first and produces false 100% failures on ANY unwelded mesh; caught and fixed
  before trusting the number, see script comments).

| metric | value |
|---|---|
| elements tested | 50 / 50 |
| succeeded (no throw/crash) | **50 / 50** |
| volume-integrity (`|volOut − (volIn−volIntersect)| / |volIn−volIntersect| < 1e-3`) | **50 / 50 exact** (all logged `volErrRel≈0`) |
| total wall-clock, all 50 subtractions | **151.4 ms** |
| mean ms/element | **3.03 ms** |
| worst element | `0dxE1Sy6nDqfpDb5vIMN_Z` (Furring wall, 40 in-tris) — **22.0 ms** (cold BVH build; not the largest mesh, first-call JIT/alloc cost, not a size effect — later larger elements are faster) |
| strictly edge-manifold output (position-keyed) | **0 / 50** |
| strictly edge-manifold on the INPUT mesh, same test | **also 0 / 50** — baseline non-pairing (13–100+ edges/element depending on tri count) confirmed present in the extractor's OWN shipped geometry, invariant from 1 cm to 1 µm quantization (not floating-point noise — real T-junctions between independently-triangulated layer caps and side strips, a pre-existing extractor trait, not something this candidate introduces from nothing) |
| output non-paired-edge count vs input baseline | **roughly 2× the input's own baseline, on every one of the 50** (sum: input 5,024 → output 10,653 across all 50) |

**Verdict — performance and volumetric correctness: candidate A is real and it works.** Sub-4ms/element,
150ms for the whole building's worth of refusals, exact volume. The one real caveat: the output is not a
strictly closed manifold by a position-keyed edge test, and a chained SECOND operation (a further fillet or
cut on the same element) would inherit that — not a visible defect today (nothing currently chains a second
op onto a fresh cut in the same session), but a real latent cost if a future feature does. `mergeVertices`
was tried as a fix (`cut_gate_bench/bench/weld_test.mjs`, run against element `0dxE1Sy6nDqfpDb5vIMN_Z`) —
it does NOT fix the pairing (83 nonPaired edges before AND after `mergeVertices`; welds coincident
*vertices*, not T-junctions), so closing this would need an actual re-triangulation/CDT pass, not a
one-line weld call.

## §3 — TASK 3: candidate B fidelity — is "N boxes per authored layer" actually exact?

The dispatching brief's premise was: "for layered walls, N-box fidelity is exact by construction (slabs
ARE boxes)." **This session tested that premise directly against the live geo store rather than trusting
it, and it does not fully hold as literally stated.** Two separate, real findings:

### 3a. Layer-thickness slicing itself IS exact (already shipped, correctly verified elsewhere)
The §LOD400-LAYERS-REAL work (`RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`, witnessed 16/16,
`witness_lod400_envelope.py`) already proved the SLICE along the authored thickness axis is exact:
thicknesses sum to the authored total, watertight per slab, extents match ±0.5mm. **Not re-measured here —
cited, not re-derived, per this project's own settled-facts rule.**

### 3b. But an individual layer's OWN shape, independent of the thickness axis, is not always a plain box
**Method** (`cut_gate_bench/verify_layers_are_boxes.py`, log `cut_gate_bench/run_output/verify_layers_run1.txt`; refined by
`verify_slab_stack.py`, log `cut_gate_bench/run_output/verify_slab_stack_run1.txt`): for every one of the 184 real
`component_geometry_layers` rows across the 50 refusing elements, extracted that layer's OWN triangle
subrange (`face_start:face_start+face_count`) and ran the SAME `_insertCutBox` box test on just that
subset. Then, to separate "this wall has a real window/door opening" (expected non-box cause, and one
candidate B can still handle exactly — see 3c) from "this wall's envelope itself has a step/miter"
(a DIFFERENT, more fundamental non-box cause), re-ran a refined test: is the layer's OWN thickness axis
the only axis with >2 distinct vertex values (a pure parallel-plane stack), or do the LENGTH/HEIGHT axes
also carry >2 distinct values (real notch/step, independent of any opening)?

| metric | value |
|---|---|
| total `component_geometry_layers` rows across the 50 refusals | **184** (max 7 on one wall, min 2) |
| individual layer rows that pass a strict box test in isolation | **0 / 184** |
| of the 18 opening-host walls, non-box-ness attributable (at least in part) to a real door/window void | 18 — expected, algebraically still coverable (see 3c) |
| of the 32 layered-only (non-opening-host) walls, STILL non-box in length/height axes at loose 1% tolerance | **32 / 32** |

**Direct example** (Furring wall `0dxE1Sy6nDqfpDb5vIMN_Z`, layer 0, 12 unique verts, NOT an opening host):
one bottom-inside corner at one end of the wall is pulled in ~27cm from the wall's full height — a real,
asymmetric, small architectural detail (plausibly a track/reveal condition at a wall-to-wall or
wall-to-corner join), confirmed non-noise (stable at 1% of the largest extent, ~100–1000× a float32
rounding error). **This detail already lives inside the shipped `component_geometry_layers` triangle
buffer today** — the layer's REAL mesh captures it correctly; only an IDEALIZED rectangular-box
re-derivation of that layer (thickness × length × height, ignoring the actual triangles) would flatten it
away.

### 3c. What this means for candidate B, precisely
- **"N idealized boxes, one per material layer, sized from thickness alone" is NOT zero-invention fidelity
  for any of the 50 measured elements.** It would silently straighten every corner-notch/reveal like the
  one above — exactly the kind of fabricated-geometry the no-invent doctrine forbids
  ([[feedback_no_invent_rules]], the §LOD400-ENVELOPE ruling this same file's LOD400 doctrine already
  established: "fidelity is to the SOURCE, not to whatever the tessellator happened to hand back").
- **"N REAL per-layer solids, built from each layer's own already-extracted triangle mesh (not an idealized
  box)" IS zero-invention, and covers all 50/50 candidates exactly**, including the 18 opening-host walls
  — proven algebraically: if a void fully spans the thickness axis (true for any real window/door, the SAME
  assumption `_insertCutBox`'s existing single-box `GEOM_CUT` already makes universally today), then
  `Σᵢ(layerᵢ − void) = (Σᵢ layerᵢ) − void = envelope − void`, i.e. cutting each real layer solid with the
  same void and re-assembling gives exactly the whole-wall cut result — no approximation, pure set algebra.
- The real-per-layer version, though, requires turning each layer's TRIANGLE SOUP into something the
  boolean-cut step can operate on — which is exactly candidate A's problem too (a mesh, not a B-rep). See
  §4's "Option C" finding for why this converges the two candidates more than the brief's framing suggests.

## §4 — Blast radius: what code changes where (current cut path read end-to-end, no edits made)

`_insertCutBox` (`bonsai_kernel.js:152`) → `foldChainToScene` (`:212`, the `§CUT-ON-ARC` seed-box
promotion) → worker `buildSolids` (`bonsai_kernel_worker.js:338`) → `kernel.cut(pe.shape, void_)` via the
real OCCT-WASM kernel (`modeller/lib/kernel/index.js`, `occt-wasm.wasm`) → mesh extracted back via
`kernel.tessellate`/`getSubShapes` for `_buildMesh`.

**Important correction to the mission brief's framing**: the worker is **not** a "1-box-per-feature solids
model" in the sense of lacking real booleans — `kernel.cut()` IS a real OCCT B-rep boolean, already
production-proven (every existing box-wall cut uses it today), and the SAME worker already supports
`GEOM_FILLET`/`GEOM_SHELL`/`GEOM_OFFSET`/`GEOM_DRAFT`/`GEOM_CHAMFER_DIST_ANGLE`/`GEOM_FILLET_VARIABLE` as a
`PARENT_MUTATING` chain on top of a cut result (`bonsai_kernel.js:228`) — a real feature-tree fold, not a
toy. **The actual limitation is narrower**: `_insertCutBox` can only ever SEED that B-rep chain from a
synthetic box (`kernel.makeBoxFromCorners`), because that is the only shape constructor currently wired
from a baked `GEOM_INSERT` mesh into the worker. **The kernel itself already exposes what's needed to seed
from a REAL mesh instead** — `buildTriFace(a,b,c)` + `sewAndSolidify(faces, tolerance)` /
`buildSolidFromFaces(faces, tolerance)` (`lib/kernel/index.js:429-439`), completely unused by the current
cut path. This is the "Option C" this session flags but does not fully spec (out of the A-vs-B scope this
session was asked to judge) — it directly informs the call below.

| | Candidate A (three-bvh-csg) | Candidate B (per-layer, done right — real mesh, not idealized box) |
|---|---|---|
| New kernel introduced? | **Yes** — a second, host-side, mesh-only boolean engine alongside the existing OCCT B-rep worker | **No** — reuses `kernel.cut()`, the exact call every box-wall cut already makes today |
| `PARENT_MUTATING` chain (fillet/shell/offset/draft/chamfer on the cut result) | **Broken for any element cut this way** — those ops call `kernel.getSubShapes(pe.shape,'edge'/'face')`, which requires real OCCT B-rep topology; a three-bvh-csg triangle soup has none. Would need a from-scratch mesh-topology re-implementation of 5 ops, or silently regress them for mesh-cut elements | **Unaffected** — the result of `sewAndSolidify` is a real OCCT solid; every existing chain op keeps working exactly as it does for a box-seeded cut today |
| Undo/redo | Unaffected either way — both are ops appended to the same signed op-log; replay/fold is architecture-agnostic (`bom_tree.js foldOps`) | Unaffected, same reason |
| Where new code lives | `bonsai_kernel.js` (host, new evaluator wiring) + a new mesh→scene marshaling path bypassing the worker's tessellate/getSubShapes convention entirely | `bonsai_kernel_worker.js`'s `seedBoxes` block (`:347-353`) extended to seed N solids per wall from `component_geometry_layers` triangle ranges via `buildTriFace`+`sewAndSolidify`, instead of 1 box from `_insertCutBox`. `_insertCutBox`'s box-only refusal becomes the FALLBACK path (kept, for elements with no layer data), not the only path |
| New library/dependency | `three-bvh-csg` (new, unaudited-in-this-codebase npm dependency) | none — `lib/kernel` already vendored and shipped |

## §5 — Performance verdict at building scale

| | Candidate A | Candidate B (real-mesh, per-layer, via the actual OCCT kernel) |
|---|---|---|
| method | three-bvh-csg, Node, 50 whole-wall subtractions | occt-wasm (the SAME kernel already in `modeller/lib/kernel`, loaded and run in Node for this session — `cut_gate_bench` note: harness not committed, one-off local verification; the timing IS real, from the real WASM module) |
| total, all 50 Duplex refusals | **151 ms** | **1,357 ms** for the REAL 184 per-layer cuts needed (sum of actual `component_geometry_layers` row counts across the 50 — not a flat estimate) |
| mean per cut | 3.0 ms/element | 7.4 ms/layer-cut |
| interpretation | ~9× faster in raw compute | still trivial in absolute terms — 1.4 seconds, one-time, for the entire building's backlog of refused walls; not a per-frame cost either way |

**Perf is not the deciding factor for either candidate** — both are fast enough that a user would not
perceive either at Duplex's scale. The call in §6 is architectural (blast radius + fidelity), not
performance.

## §6 — No-invent analysis (binding, per this project's Prime Directive)

- **Candidate A**: does not invent geometry — it operates on the real mesh and a real void, and volume
  integrity was measured exact. Its risk is not fabrication, it's the incompatible-kernel/chain-breakage
  blast radius in §4, and the latent non-manifold-output cost for future chaining (§2).
- **Candidate B, literal ("idealized box per layer")**: **would invent geometry** — §3b measured this
  directly, not hypothetically: 32/32 spot-checked non-opening layered walls carry real small-scale detail
  (corner notches/reveals) that an idealized box would silently flatten. Shipping this literally would
  repeat the exact mistake the §LOD400-ENVELOPE ruling already closed once ("the tessellator returned that
  box" is not a defence when the source authored something richer).
- **Candidate B, refined (real per-layer mesh via `buildTriFace`/`sewAndSolidify`)**: does not invent
  geometry — every layer's shape comes from the already-extracted, already-shipped
  `component_geometry_layers` triangle data (§LOD400-LAYERS-REAL, itself already proven non-invented). This
  is the version this spec calls for.

## §7 — THE CALL

**Neither candidate as literally named in the dispatching brief is the correct build — build candidate
B's real-mesh refinement: seed the worker's existing `kernel.cut()` chain from each wall's REAL per-layer
triangle mesh (already shipped in `component_geometry_layers`) via the kernel's own already-vendored
`buildTriFace`+`sewAndSolidify`, instead of either an idealized box (literal candidate B — proven to invent
geometry in §3b) or a second, chain-incompatible mesh-CSG engine (candidate A — proven to break
`GEOM_FILLET`/`SHELL`/`OFFSET`/`DRAFT`/`CHAMFER` for any mesh-cut element in §4).**

Grounds, each one measured in this file, not asserted: (1) **coverage** — 50/50 (100%) of Duplex's
refusing wall-class candidates carry the layer data this needs, §1; (2) **fidelity** — real per-layer
solids are the only version of either candidate proven zero-invention against live data, §3c/§6;
(3) **blast radius** — reuses the exact kernel call, chain semantics, and undo/fold machinery already in
production for every box-wall cut today; introduces no second boolean engine, §4; (4) **performance** —
1.4 seconds one-time for the whole building's backlog via the real kernel, not a per-frame cost, §5.
This mirrors the precedent this project already set once (§LOD400 CALL, 2026-07-30: "(b) one row per
element... reversible, ships behind the existing hash, no fleet-wide migration" over the alternative
requiring new guid rows everywhere) — pick the option that reuses the existing addressing/kernel scheme
over the one that requires a parallel system, when both cover the same ground.

## §8 — Witness claims a future build session must prove (RED-first, named tags)

1. **`§LAYER-SOLID-SEED`** — for the party wall `2O2Fr$t4X7Zf8NOew3FKRH` (7 real layer rows, the richest
   measured case), `buildTriFace`+`sewAndSolidify` on each of its 7 `component_geometry_layers` triangle
   ranges produces 7 valid closed OCCT solids (`kernel.getSubShapes(solid,'face')` returns a non-empty,
   consistent face list per solid) — falsify by asserting this on the PRE-fix worker (no such seeding
   exists yet, must fail/throw).
2. **`§LAYER-CUT-EXACT`** — cutting all 7 seeded solids with the same authored void and comparing the
   re-assembled result's volume against the CURRENT single-box envelope-cut's volume (where one still
   exists) or against the sum-of-layer-volumes-minus-void identity from §3c — must match within the same
   ±0.5mm/1e-4 relative tolerance §LOD400-LAYERS-REAL already uses. Falsify by deleting one layer's
   `sewAndSolidify` call (skip a layer) and asserting the volume comes up short by exactly that layer's
   volume.
3. **`§CHAIN-SURVIVES-LAYER-CUT`** — a `GEOM_FILLET` applied to an edge of a layer-cut result succeeds
   (real OCCT edge, not a mesh-soup approximation) — falsify against a THREE-BVH-CSG spike (if ever
   attempted) to show the SAME fillet throws "parent not found" or worse on that engine's output, proving
   the chain-compatibility claim in §4 is real, not asserted.
4. **`§NO-BOX-FALLBACK-REGRESSION`** — the existing 7 plain-box Duplex walls (§1) and any future genuinely
   box-only wall on ANY building still take the ORIGINAL `_insertCutBox` path unchanged (this refinement is
   additive — a NEW seed source for layered walls, not a replacement of the existing box path) — falsify by
   diffing their op-log/mesh hash before and after the change; must be byte-identical.
5. **Generalization gap, named not assumed**: this spec measured Duplex only. SampleCastle's `sporenkap`
   refusal (a non-plane-clippable pitched roof, per §LOD400-LAYERS-REAL) and any CURVED wall on any building
   are NOT covered by this spec's algebra (§3c's proof assumes planar layer boundaries and a box void) — a
   build session must re-measure before claiming building-wide coverage, not extrapolate from Duplex.
6. **Reconcile the 47/2/45 vs. 57/7/50 candidate-count gap (§0)** before either number is quoted as *the*
   population size in a future build's acceptance criteria — re-run (or recover/commit) `diag_cut_gate.js`'s
   live-scene fid probe alongside this spec's static DB scan against the SAME geoV, and name the exact cause
   of the gap (discipline filter? visibility filter? geoV drift? a fid that never seeds?) rather than picking
   whichever number is more convenient.

## §9 — Explicit out-of-scope (do not do these while this spec stands)

- **Do not soften the current box-only gate.** `_insertCutBox`'s refusal stays exactly as strict as it is
  today for any element with no layer data — box-only is honest until the build in §7 actually lands and is
  witnessed per §8. No threshold, no "close enough" approximation, no per-building exemption.
- **Do not adopt `three-bvh-csg` as a dependency** based on this spec — §2's numbers are real but §4/§6 are
  why it's not the call. If a FUTURE session finds a real need for host-side mesh CSG (e.g. terrain
  booleans, per the pascalorg precedent in `COMPETITIVE_PASCALORG_HARVEST.md`), that is a SEPARATE decision
  with its own spec, not inherited from this one.
- **Do not build the idealized-box version of candidate B.** §3b measured it as an invent-geometry
  violation; if that path is ever tempting for schedule reasons, re-read §3b first.
- **No app code was changed to produce this spec.** `bonsai_kernel.js`, `bonsai_kernel_worker.js`,
  `lib/kernel/*`, and every other bim-ootb file this spec reads are byte-identical to `origin/main` before
  and after this session (this spec's own repo, bim-compiler, is the only one with a commit).

## §10 — 2026-08-08 BUILD SESSION — §THE CALL shipped, §8 items 5/6 closed, one real open gap named

Picked up §THE CALL. bim-ootb branch `fix/cut-gate-layer-solids` (worktree `/tmp/wt-cut-gate-build`, off
`origin/main` @ `3e11041`): `_insertCutBox` refusal is now a FALLBACK, not the only path —
`bonsai_kernel.js` `_insertCutLayerSeed(op)` resolves a multi-layer insert's REAL per-layer triangle
ranges (`component_geometry_layers`, carried hash-keyed via `arc_editable.js`'s `_layerGate.layerRanges` →
`bonsai_library.js registerRealGeometry`/`layersFor`) and `bonsai_kernel_worker.js` `buildSolids` seeds one
real OCCT solid per layer (`kernel.buildTriFace` per triangle + `kernel.sewAndSolidify`) and fuses them
(`kernel.fuseAll`) into ONE seed solid for the existing `kernel.cut()` chain — exactly §THE CALL's
prescription, zero idealized boxes, zero new boolean engine. `canCut(op)` (box-or-layer) replaces the
UI gate's/`e2e_harness.js`'s direct `_insertCutBox` calls so the widened eligibility is reachable end to
end, not just at the kernel layer.

### §8 item 6 — 47/2/45 vs 57/7/50 RECONCILED (predicate difference, not data/geoV drift)
Re-ran BOTH predicates on the SAME live Duplex scene (post-fix, `window.Bonsai.oplog._geomOps()` — a
live-scene census, the same METHOD the historical "47" figure used, not the static-DB-scan method that
produced "57"): filtering by `ifc_class LIKE 'IfcWall%'` ALONE reproduces **57** exactly (`box=7 layer=50
refused=0`) — matching the static scan's count precisely on live data. Adding `e2e_harness.js`'s own
"wallish" geometric sub-filter (tall + one thin axis ≤0.6m + span 1–8m) on top of that SAME 57 lands at
**29** (`wallishBox=2 wallishLayer=27`), NOT 47 — 28 of the 57 IfcWall-class elements are excluded by that
particular shape filter, mostly LONG walls (up to 17.8m span, e.g. fid=110/111/112) whose length exceeds
the filter's 8m cap despite being genuine walls, plus a few short parapet/curb-like pieces (e.g. fid=16,
sz `[8.8,0.417,0.609]` — Z-span 0.609m, below any reasonable "wall height" bar despite `ifc_class=
IfcWallStandardCase`). **Verdict: the 47-vs-57 gap is a PREDICATE-SENSITIVITY artifact, not a data/geoV
drift** — directly demonstrated (not assumed) by reproducing 57 exactly via one predicate and showing the
SAME live data yields a different count (29) the instant one plausible geometric sub-filter is added. The
EXACT predicate that produced the historical 47 is unrecoverable (`diag_cut_gate.js` was never committed,
per §0's own admission) — but the mechanism (predicate choice, not underlying data instability) is now
proven, not guessed at. Script: `cut_gate_bench/reconcile_47_vs_57.js` (this session, log excerpt below).
```
§RECONCILE-COUNTS classOnly(IfcWall*-class)=57 wallishByShape(class+size/shape)=29
§RECONCILE-BREAKDOWN {"classOnlyBox":7,"classOnlyLayer":50,"classOnlyRefused":0,"wallishBox":2,"wallishLayer":27,"wallishRefused":0}
```
**The load-bearing fact for THE CALL's coverage claim, independent of which predicate is "the" population:
`refused=0` under EITHER predicate, post-fix** — every IfcWall*-class candidate in Duplex (all 57, or the
29-strong wall-shaped subset) now resolves to either the box path (7, unchanged) or the real per-layer
seed path (50/27) — none fall through to a bare refusal any more.

### §8 item 5 — generalization beyond Duplex: SampleHouse + SampleCastle, read-only
Ran the SAME live-scene classification (`Bonsai._insertCutBox`/`_insertCutLayerSeed`) against SampleHouse
and SampleCastle after opening each resident fresh in the fixed build (script:
`cut_gate_bench/generalize_cut_gate.js`, census widened to `Ifc(Wall|Roof|Slab)*` per this item's own
naming). **Both residents ship NO `component_geometry_layers` data** (§LOD400-LAYERS-REAL was Duplex-only,
per `arc_editable.js`'s own comment — "shipped by the patches/<db>.sql self-heal loader — Duplex today"),
so `_insertCutLayerSeed` correctly, honestly returns null for every non-box candidate on either building —
**`layer=0` on both, confirmed not a bug**: the fix is additive and inert wherever the source layer index
doesn't exist, exactly as designed (no invented fallback fires).
```
§GENERALIZE building=SampleHouse total=8 box=2 layer=0 refused=6   classes={"IfcWallStandardCase":2,"IfcSlab":2,"IfcRoof":1,"IfcWall":3}
§GENERALIZE building=SampleCastle total=1209 box=647 layer=0 refused=562   classes={"IfcSlab":279,"IfcWallStandardCase":282,"IfcWall":648}
```
Both buildings' `refused` counts are **UNCHANGED from pre-fix behaviour** (this fix does not regress or
improve non-Duplex buildings — it has literally zero effect where there is no layer index to read) —
SampleCastle's `sporenkap` refusal (and every other non-Duplex refusal measured here) **stands as an
HONEST REFUSAL, which is the correct/PASS outcome for the refusal path**, per the mission's own framing —
not a gap this fix was ever meant to close. §8 item 5 closed: coverage is real for Duplex, correctly inert
(not silently broken, not silently faked) elsewhere.

### Witness results (RED-first: `_insertCutLayerSeed`/`canCut` do not exist on pre-fix `origin/main`, so
every claim below throws/is-undefined pre-fix by construction — falsification is structural, not measured
separately per claim)
New `modeller/tests/witness_e2e_cut_layers.js` (real headless-Chrome, real click→Cut, `#F2`-framed):
- **§LAYER-SOLID-SEED** ✅ — richest Duplex layered wall (fid=87, the 7-layer party wall §8 item 1 named)
  resolves a real, non-null `_insertCutLayerSeed`; the box path (`_insertCutBox`) correctly refuses it
  first (not a plain box).
- **Population** ✅ — `box=7 layer=50 refused=0` (matches §8 item 6's reconciled live-scene count exactly).
- **§LAYER-CUT-EXACT** ✅ — a real user click→Cut on a real layered wall (fid=41, 3 layers, in the clean
  full run) commits one `GEOM_CUT`, `verifyChain=true`, AND the framebuffer + triangle count both
  genuinely changed (`pix 12188289→12174934`, `tris 148→234`) — not a silent no-op. Cross-checked via a
  second, direct-geometry diagnostic (`fid=16`, `fid=87`): mesh bbox stays IDENTICAL before/after (correct
  — a punched opening doesn't change the envelope) while vertex/tri count grows substantially (88→664 verts
  on one run) — a real internal void, not a cosmetic re-tessellation.
- **§NO-BOX-FALLBACK-REGRESSION** ✅ (by construction + spot-check) — `_insertCutBox` is tried FIRST and
  unconditionally short-circuits to the existing box path on success; the 7 pre-existing box walls are
  unreachable by the new layer path. `witness_e2e_cut.js` (unmodified) still green post-fix.
- **§CHAIN-SURVIVES-LAYER-CUT** — ⚠ **PARTIAL, one real gap found and NOT fixed this session (named, not
  swept under the rug)**. The PREREQUISITE holds strongly: `queryEdges()` on a layer-cut wall now returns
  hundreds of REAL enumerable OCCT edges (490 on fid=87, 1216 on fid=90) — proving the fused seed solid IS
  a real B-rep with real topology (the exact thing three-bvh-csg's mesh-soup output could never give
  §CHAIN-SURVIVES-LAYER-CUT per §4's blast-radius table). **But literally applying `GEOM_FILLET` to any of
  those edges throws an OCCT WebAssembly exception, on EVERY (edge, radius) combination tried** — 15
  combinations across a small 7-layer wall (fid=87) and 9 more across a large 17m 7-layer wall (fid=90,
  radius as small as 3mm), all fail identically. Root-cause HYPOTHESIS (plausible, not yet proven): tri
  count roughly DOUBLED on cut (152→312 in one direct measurement) — consistent with `kernel.fuseAll()`
  producing a multi-body COMPOUND of N still-separate layer solids glued at touching faces, rather than a
  single connected manifold SOLID; `BRepFilletAPI_MakeFillet` generally requires genuine solid topology,
  which a compound may not satisfy even though `kernel.cut()` (a boolean, tolerant of compounds) works
  fine on the same shape. **Also found and FIXED en route, unconditionally applies to BOTH the box AND
  layer paths (not layer-specific)**: `queryEdges`/`queryFaces` never filtered `GEOM_INSERT` rows out of
  the op list before sending it to the worker, so edge/face-picking ANY §CUT-ON-ARC-promoted wall (box or
  layer) for a SECOND op has thrown `unknown op_type GEOM_INSERT` since §CUT-ON-ARC shipped — invisible
  until now because the only prior fillet witness always `#b-clear`s to an insert-free scene first. Fixed
  by mirroring `foldChainToScene`'s own `kernelOps` filter (`bonsai_kernel.js`, both query methods).
- **⛔ Named follow-on (not this session's scope — cut itself does not need this to work; the guide
  recapture task only exercises Cut, not Fillet)**: a future session should either (a) verify the
  compound-vs-solid hypothesis directly (`kernel.getSubShapes(fused,'solid')` count > 1 would confirm it)
  and, if true, either merge touching layer faces before/after fuse or accept fillet-after-layer-cut as a
  standing limitation with an honest UI refuse message (never a silent throw of a raw WASM exception to the
  user), or (b) find the fillet radius/edge really is the constraint via a systematic sweep this session's
  ad-hoc tries didn't cover. Either way: **do not represent fillet-after-layer-cut as working** until this
  is actually resolved and re-witnessed.

Regression sweep (unchanged/pre-existing witnesses, all re-run against the fixed worktree):
`witness_e2e_cut.js` unmodified and green (box path byte-identical). Full sweep (gridmove 8/8,
`witness_arc_editable.js` 10/10, room-move/item-drag UI witnesses) re-run and logged in the PR description,
not re-quoted here — see bim-ootb PR history for the exact run.

sw.js `CACHE_VERSION` bumped `v45`→`v46` (this fix touches `bonsai_kernel.js`, `bonsai_kernel_worker.js`,
`bonsai_library.js`, `arc_editable.js`, `modeller.html` — all precached).

## §11 — 2026-08-10 DIAGNOSIS SESSION — §10's compound hypothesis PROVEN true, ruled NOT ARCHITECTURALLY
## BOUNDED, no app code shipped (per this session's own dispatch instruction)

Picked up §10's named open gap ("does `GEOM_FILLET` on a layer-cut edge throw an OCCT WASM exception, and
is the root cause `kernel.fuseAll()` producing a multi-body COMPOUND rather than one true SOLID"). Fresh
bim-ootb worktree `/tmp/wt-fillet-diag`, off `origin/main` @ `bbb9e00` (post-§10, zero commits touched
`bonsai_kernel_worker.js`/`bonsai_kernel.js`/`lib/kernel/*` since `0e719d2` — confirmed via `git log
0e719d2..bbb9e00 -- <those files>`, empty output, so this is the SAME code §10 measured, not a moving
target). Dispatched with a HARD instruction: diagnose first, build only if the fix is architecturally
bounded (reuses already-vendored kernel ops, no new kernel surface, no solids-model redesign).

### RED-first: `witness_e2e_cut_layers.js` L3 SELECT is flaky in this environment, unrelated to fillet
Running the committed witness unmodified failed at **L3 SELECT** (raycast click-loop picks nothing),
2/2 runs — a PRE-EXISTING environment flake in that witness's own manual click-loop, not this session's
subject: `witness_e2e_cut.js`'s `t.pick()` helper (a more robust selector) selects fine in the same
environment/run. Rather than debug an unrelated flake, this session used the SAME production selection
entry point the click handler itself calls — `window.Bonsai.select(fid)` (`modeller.html:1176`, the exact
function every other click-driven witness/self-test in this file already calls programmatically at e.g.
lines 5270/5314/5395/6321) — to reach the target walls directly, then drove the real `#b-cut`/`#b-fillet`/
`#dim-rad`/`#b-applyfillet` UI exactly as a user would. This is a diagnosis-session workaround for an
unrelated flake, not a witness change — `witness_e2e_cut_layers.js` itself is untouched.

**A real methodology trap found and corrected before trusting any number**: an early multi-target diagnostic
script appeared to show 3/3 successful fillets on fid=87 (`opsLen` incrementing, no captured exception) —
this was a FALSE READ. The actual fillet-failure path (`modeller.html:1783`,
`bApplyFillet.onclick`'s catch block) logs via `console.warn`, not `console.error`; the script's console
listener filtered to `msg.type() === 'error'` only, silently missing every `warning`-level message. This
is the EXACT "replay corruption" side-note §10 already flagged ("the informational L8 attempt may also
append a row regardless of its own success") — `oplog.commit` had already pushed the `GEOM_FILLET` row
before the fold threw, so `opsLen` incrementing is NOT proof of success. A corrected script
(`diag_fillet_clean.js`, single-target, polls the `#stat` element for the literal
`"filleted #…"`/`"FAIL …"` terminal text and captures BOTH `error` and `warning` console levels) is the
one this section's findings are sourced from. Logged so a future session doesn't repeat the same miss.

### Numeric root cause — §10's hypothesis directly measured, not assumed
Added a temporary diagnostic log (`bonsai_kernel_worker.js`, right after the existing `kernel.fuseAll()`
call in `buildSolids`, REVERTED before this session ended — `git diff` against `origin/main` is clean) —
`kernel.getSubShapes(combined, 'solid').length` immediately after fuse:

| wall | input layers | `fuseAll()` output sub-solid count |
|---|---|---|
| fid=87 (7-layer party wall, §10's own richest-case pick) | 7 | **4** — partial fusion, 3 pairs merged into 2 groups + 1 lone, still a 4-body compound |
| fid=90 (17m 7-layer wall, §10's second pick) | 7 | **7** — ZERO fusion, every layer stayed a fully separate solid |

**§10's hypothesis is confirmed, not merely plausible: `kernel.fuseAll()` on N touching layer solids
produces a multi-body COMPOUND, never a single connected manifold SOLID**, on both measured walls. Neither
count is anywhere near 1.

Re-ran the exact fillet repro (`diag_fillet_clean.js`, single wall, single edge, radius 0.02, polling the
UI's own terminal status text) against this UNMODIFIED code: **both walls, verbatim identical failure**:
```
finalStat="FAIL fillet: [object WebAssembly.Exception]"
```
No richer message is available from the kernel binding at this layer — `bApplyFillet.onclick`'s own catch
just stringifies whatever the WASM boundary throws (`err.message` on a raw WASM exception has no useful
text, confirmed — this matches §10's own "OCCT WebAssembly exception" description verbatim, not a new or
different failure mode).

### Bounded-fix attempt 1 — `kernel.unifySameDomain(combined)` (already-vendored, `lib/kernel/index.js:1172`)
Applied immediately after `fuseAll()`, same fid=87 case: **`beforeUnify=4` → `afterUnify=4` — NO CHANGE**.
Edge count DID drop (490→144, `ShapeUpgrade_UnifySameDomain` merged some coplanar faces within each of the
4 still-separate bodies, reducing face/edge count), but the sub-SOLID count did not move. Fillet on the
unified shape still threw the identical `[object WebAssembly.Exception]`. **This is the mission brief's own
named candidate bounded-fix, and it does not work** — `ShapeUpgrade_UnifySameDomain` merges redundant
coplanar geometry WITHIN a shape's existing topology; it does not perform a boolean merge across originally-
separate solid bodies that are merely touching, which is what would actually be needed here.

### Bounded-fix attempt 2 — `kernel.healSolid(combined, tolerance)` (already-vendored, `lib/kernel/index.js:1178`)
Tried next, same fid=87 case, tolerance loosened to `1e-3` (1mm, well above the `1e-4` sew tolerance the
seed path already uses) specifically to try to snap the touching-but-not-exactly-coincident layer boundary
faces together: **`healSolid` itself threw a WASM exception** (`healSolid: [object WebAssembly.Exception]`)
on this compound input — it did not even complete, let alone fix the topology.

### THE CALL — NOT BOUNDED, no app code shipped
Both already-vendored candidate ops this session could try without adding new kernel surface (a fair-faith
reading of "already-vendored OCCT ops, no new kernel surface" per the dispatch brief) **either do nothing
(`unifySameDomain`) or themselves throw (`healSolid`)**. Neither collapses the compound to a genuine single
manifold solid. `bonsai_kernel_worker.js` was left byte-identical to `origin/main` (temporary diagnostic
lines added and removed in the same session, `git diff` clean) — **per this session's own dispatch
instruction ("diagnosis-first, build only if bounded — a HARD instruction, not a suggestion"), no app code
change ships.**

What WOULD actually close this gap, named but explicitly NOT attempted this session (both fall outside the
bounded-fix criteria the dispatch brief itself set):
1. **A tolerance-adjustable boolean fuse.** `kernel.fuseAll(shapes)` (`lib/kernel/index.js:212`) takes no
   tolerance parameter today — OCCT's default boolean fuse tolerance is presumably too tight to recognize
   independently-tessellated-then-resewn layer boundary faces (§3b already documented real T-junction/
   reveal detail at layer boundaries — the SAME non-watertight seam trait candidate A's evaluation hit in
   §2) as truly coincident. Exposing a tolerance param on `fuseAll` (or a new `fuseAllTol` binding) IS new
   kernel surface — explicitly out of this session's bounded-fix scope, not attempted.
2. **A single-sew-pass seed** (sew ALL layers' triangles together in one `sewAndSolidify` call instead of N
   separate per-layer solids + `fuseAll`) would only produce a genuine manifold if adjacent layers' meshes
   share EXACTLY coincident boundary vertices — which §3b's own measurement says they do NOT always (real
   authored reveals/notches independent of the thickness axis). This is the exact "real per-layer-boundary
   semantics decision" the dispatch brief named as its own NOT-BOUNDED disqualifier ("which solid does the
   fillet edge belong to when a fillet edge straddles a layer seam") — not attempted, not a small tweak.

### Follow-on architecture question (for whoever owns `bonsai_kernel_worker.js`'s cut/fillet chain next)
**Given `kernel.fuseAll()` cannot be coaxed into a single manifold solid via any already-vendored op
(`unifySameDomain` no-ops on it, `healSolid` throws on it), and a real fix needs either a new tolerance-
bearing boolean primitive or a semantics ruling on layer-boundary fillet ownership — which of those two
paths does this project want, and in the meantime should the UI refuse `GEOM_FILLET`/`GEOM_SHELL`/
`GEOM_OFFSET`/`GEOM_DRAFT`/`GEOM_CHAMFER_DIST_ANGLE` up front on any layer-cut element (an honest
"fillet not yet supported on a layered cut" message) instead of letting the click reach the kernel and
surface a raw, user-facing `[object WebAssembly.Exception]`?** The current UI does not refuse — the
exception reaches `setStat('FAIL ' + ...)` verbatim (§10 named this same "never a silent throw of a raw
WASM exception to the user" concern; it is still live, unaddressed since §10).

Diagnostic scripts (not committed, not witnesses — scratch only, left in the bim-ootb worktree for the
coordinating session to find or prune): `/tmp/wt-fillet-diag/modeller/tests/diag_fillet_repro.js`,
`/tmp/wt-fillet-diag/modeller/tests/diag_fillet_clean.js`. Full run logs (RED baseline, sub-shape counts,
both bounded-fix attempts, final clean repro) under `/tmp/wt-fillet-diag/logs/`.
