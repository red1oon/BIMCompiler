<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — PORT SPEC: PDF Terrain (Bonsai/Blender/Python, TESTED & WORKING) → DAGeVu Modeller (no code in this doc)

```
SCOPE: port spec, not a design. The feature already exists, is tested, and works — this doc extracts what
it does and how, and maps it onto the browser/ThreeJS-WASM Modeller. PORT, DO NOT INVENT (same discipline
as prompts/done/77_federation_port.md, which ported this same author's Federation addon from the same
source tree to Java — this is the sibling port, to the browser instead).

SOURCE (real, read directly 2026-08-06, not from memory or a prior session's citation):
  ~/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/pdf_terrain/  (Blender operators + UI)
  ~/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/pdf2blend/scripts/survey_extract_pipeline.py
    (the actual Vision-API-to-points extraction — this is the file whose header proves it works)
  Both are the user's own prior work, in the user's own IfcOpenShell fork
  (github.com/red1oon/IfcOpenShell, branch feature/IFC4_DB) — not upstream IfcOpenShell/Bonsai, and not
  inspired by it. An earlier draft of this spec wrongly treated this as a from-scratch design problem and
  credited unrelated projects; both errors are corrected here. See MEMORY note on this incident.

Implementation target: ~/bim-ootb/modeller/ (the DAGeVu Modeller — this is the "why" behind the filename:
migrating an already-proven capability INTO the Modeller, not authoring a new one).

SAMPLE REFERENCE PAIR (2026-08-06, `bim-ootb` PR #1227): `~/bim-ootb/internal/PDF_Terrain/` carries the
real golden input/output pair copied from the source — `survey_highres.png` (9.0MB, the actual 300 DPI
survey image) and `survey_highres_extracted.json` (192KB, the real 689-point extraction result for that
exact image). Use this as the test fixture for the ported extraction logic (§1 Stage 3) — feed the PNG
through the port and diff against this JSON's 689 points, rather than inventing a new test image. See that
folder's own `README.md` for what was and wasn't copied (the raw Vision API cache was deliberately left
out — re-extraction should call the real API once, or reuse the original fork's cache directly, off-repo).
```

## §0 — What this actually is (read the source, don't re-derive)

**PDF Terrain** — a Blender/Bonsai addon that converts a civil survey drawing (PDF or PNG, elevation
numbers printed on it) into georeferenced 3D elevation points, exportable as IFC and DXF. Real, validated
proof-of-concept sample checked into the source tree: `samples/survey_highres_extracted.json` — **689
real elevation points** extracted from a real survey, with the raw Google Vision cache
(`survey_highres_GV.json`, 426 KB) also checked in so the pipeline can be re-run with zero API cost.
`survey_extract_pipeline.py`'s own header: *"TESTED & WORKING: December 2025 - 688 points, pixel-perfect
alignment."*

**One correction to the source's own README, worth being precise about:** its README title says "3D
Terrain" but the actual output is a **georeferenced point cloud**, not a continuous surface/mesh. Each
elevation point becomes its own small sphere in Blender and its own `IfcGeographicElement` in the IFC
export (§2) — there is no triangulation/TIN step in this codebase. The README's own recommended workflow
for turning the points into an actual walkable surface is to import the DXF into **Civil 3D** and run
*"Create Surface → From Point Cloud"* there — i.e., surface generation is explicitly handed off to a
separate CAD tool today, not built here. Any spec that assumed a TIN-reconstruction step was built (an
earlier draft of this doc did) is wrong; port what exists, decide the surface question fresh (§6/§8 Q1).

## §1 — The proven pipeline, stage by stage (verbatim from the real code)

**Stage 1 — PDF → PNG.** `pdf_to_png()`, 300 DPI (README: *"High-res images: Better OCR accuracy (300 DPI
recommended)"*). PNG input skips this stage.

**Stage 2 — Google Vision OCR, cached, one call per survey.** `extract_elevations_google()` sends the
image to Google Cloud Vision. **Caching is load-bearing, not an optimization afterthought:** the raw
response is saved as `<name>_GV.json` and every subsequent run (including changing extraction parameters
to retune the regex/merge logic) reads the cache — *"Test with different extraction parameters: No
additional cost."* This is exactly the "one-shot, deterministic-after-import" property this port must
preserve (§0 of the original architecture-tension framing still holds; it's now grounded in code that
already does it, not a design goal).

**Stage 3 — Text → elevation points, with FOUR documented, hard-won bugs (fixed, don't reintroduce):**
```
BUG #1 DECIMAL SEPARATOR — Vision sometimes returns comma (44,317) not period. Pattern must accept both:
  ^[2-5][0-9][.,][0-9]{2,3}$   then   z = float(text.replace(',', '.'))
BUG #2 IMAGE DIMENSIONS — Vision's own text-bounds are SMALLER than the real image (9598 vs actual 9934).
  Must read true width/height from the image file itself (PIL), never from the annotation bounds.
BUG #3 OCR SPLIT VALUES — Vision sometimes splits "44.103" into "44" + "103" as two separate detections.
  merge_split_elevations() recombines adjacent number-pairs by proximity (y_tolerance=15, x_max_gap=100).
BUG #4 SCALE — never hardcode a pixel→metre scale. Derive it from two known chainage markers on the
  survey itself: scale = (chainage_B − chainage_A) / (pixel_B − pixel_A). Real example in the source:
  (17100−16800)/(7519−428) = 0.0423 m/pixel — this is where the "0.0423 default" in the operator comes
  from; it's a fitted constant from ONE real survey, not a universal default (§8 Q4).
```
Two point TYPES are extracted, not one: `ground_pattern` (plain elevations) and `invert_pattern` (pipe/
drain invert levels, suffixed `IL`, e.g. `44.317IL`) — the Blender side keeps them in separate
collections (`Ground_Elevations`, `Invert_Levels`). A port that only handles ground elevations drops real
data the source pipeline already extracts.

**Stage 4 — Pixel → world coordinates.** `_pixel_to_world()`: `y_flipped = image_height − py; x = px ×
scale; y = y_flipped × scale × y_scale_factor; z = pz` (z already in metres from Stage 3). **Real, currently
live limitation, in the code's own words:** a more general affine-transform path exists
(`calculate_affine_transform()`, handles rotated/skewed scans) but is **wired off** — `if False and
affine_transform is not None:  # Disabled for testing` — only the simple linear transform is active
today. Port the simple transform as the proven baseline; whether to also port and re-enable the affine
path is a real open decision, not a given (§8 Q5).

**Stage 5 — Visualization (Blender-specific, needs a browser equivalent, not a literal port).** Points
render as small spheres, a reference image is placed at Z=40m under them, an orthographic top-down camera
is set up for review. §3 maps this onto Three.js primitives.

**Stage 6 — Export.** Two independent exports, both real, both already working:
- **IFC** (`_export_terrain_ifc`): one `IfcGeographicElement` **per point** (not one terrain-surface
  entity), each carrying a `Survey_Data` property set — `PointID`, `Elevation`, `PointType`, `PixelX`,
  `PixelY` — all assigned into one `IfcSite` via `spatial.assign_container`. This resolves what the
  earlier draft of this spec left as an open schema question by guesswork — the real answer, from working
  code, is per-point `IfcGeographicElement`, no `IfcTriangulatedFaceSet`, no `PredefinedType='TERRAIN'`.
- **DXF** (`_export_terrain_dxf`): 3D `POINT` entities + `TEXT` labels, on separate `SURVEY-POINTS`/
  `SURVEY-LABELS` layers — the hand-off format for Civil 3D's surface-from-points workflow (§0).

## §2 — Port mapping (Python/Blender construct → browser/ThreeJS-WASM equivalent)

Same table shape as `77_federation_port.md`'s DAO-mapping table — map, don't redesign:

| Source (Blender/Python) | Target (Modeller/browser) | Notes |
|---|---|---|
| `BIM_OT_pdf_terrain_pick_file` (file picker) | existing IFC-upload surface (`import.js` `detectFormat` + routing, per `COMPETITIVE_PASCALORG_HARVEST.md` §4 item 5) | new format branch, not a new upload mechanism |
| `subprocess` call to `survey_extract_pipeline.py` | the SAME regex/merge/scale logic, ported to plain JS — pure functions, no Blender API surface, straightforward line-for-line port (§1 Stage 3) | this half needs no design decisions, only translation |
| `extract_elevations_google()` (Vision API call) | a browser `fetch` to the Vision REST endpoint | **credential handling is genuinely different in a browser — §4, real open problem, not glossed over** |
| `<name>_GV.json` / `<name>_extracted.json` cache files (filesystem) | the signed op-log / IndexedDB, same as every other extracted/authored artifact in this codebase — NOT loose files | the *property* (one-shot, cached, re-runnable free) is what must be preserved, not literally the filesystem mechanism |
| Blender spheres + collections (`Ground_Elevations`/`Invert_Levels`/`Labels`) | Three.js `InstancedMesh` of small spheres (or points, `THREE.Points`), one instance per extracted point, grouped by point type | visualization-only; the source's own "not a real surface" honesty (§0) carries over |
| `_export_terrain_ifc` (`ifcopenshell.api`, per-point `IfcGeographicElement`) | `bonsai_ifc.js`'s existing export path (`GEOM_EXTRUDE_POLY → IfcWall` is its current shape, per its own header comment) gains a new branch emitting the SAME schema shape verified real in §1 Stage 6 | mirror the file's existing pattern, don't rewrite it — same discipline `ROOM_MOVE_AND_ITEM_DRAG_SPEC.md` already established for fold-site additions |
| Real op-log commit (new, doesn't exist in the Python version at all) | each extracted point (or the whole batch, TBD §8 Q2) becomes a signed op, same non-negotiable rule as every other geometry-authoring feature in this codebase (`ROOM_MOVE_AND_ITEM_DRAG_SPEC.md` §1 item 1) | the Python tool has no such concept (Blender scene = the state); the browser port MUST have one — this is a real, new requirement the port adds, not present in the source to copy |

## §3 — What's proven vs. what the port must newly solve

**Proven, port with confidence:** the regex/merge/scale extraction logic (Stage 3) — four real bugs
already found and fixed, 689-point real validation, "pixel-perfect alignment" per the source's own claim.
This is the hardest part of the whole feature and it already works; treat it as a near-verbatim
translation task, not a research task.

**Not proven, needs a real decision in the port (not present or not finished in the source):**
1. **Credential handling in a browser context (§4).** The desktop tool reads
   `GOOGLE_APPLICATION_CREDENTIALS` (a service-account JSON key file) — a model that assumes a trusted
   local/server process. A pure client-side app cannot hold that credential safely; anyone opening
   devtools would see it.
2. **Op-log integration** — the source has no signed-log concept at all (§2's last row).
3. **The affine-transform path is real code that is currently OFF** (§1 Stage 4) — port decision, not a
   given default.
4. **Surface reconstruction from the point cloud** — the source explicitly does not do this itself (§0);
   whether the Modeller should (for §5's cut/fill need) is new scope this port adds, not something to
   copy from a working Python function that doesn't exist.

## §4 — The credential problem (new, real, not in the source)

The user's own cost framing (2026-08-06) is correct and answers a DIFFERENT question — Vision API's free
tier (~1,000 `TEXT_DETECTION` calls/month) comfortably covers one call per terrain import, so **cost is
not the blocker.** The blocker is **key exposure**: a service-account JSON credential embedded in
client-side JS is visible to anyone who opens the browser's network tab or view-source, unlike the
desktop tool's environment-variable model which never ships the key to an untrusted machine. Two real
options, named, not decided:
- **(a) User-supplied API key, entered per-session or stored locally (never bundled in the app).**
  Matches "no server to rent" — the key a user's own browser holds is scoped to their own Vision project
  and their own quota; a leaked key only spends the leaker's own free tier, a low-consequence exposure
  given the "1 call needed" usage pattern.
- **(b) A minimal proxy** (the ONE call is relayed through something that holds the real key server-side).
  Breaks "zero server" for this one optional feature — same class of exception the
  `project_java_bridge` memory already accepts for a different advanced-feature case ("browser is the
  default... optional [external help] for the one thing that genuinely needs it").
Whichever is chosen, it must not compromise the "everything after import is deterministic, zero further
AI calls" property (§1 Stage 2) — that property is proven in the source (the cache) and must survive the
port unchanged.

## §5 — Modeller integration: cut/fill and weather-sensitive positioning

These downstream uses (the original ask) still stand, but now correctly scoped against a **point cloud**,
not a mesh — this changes the shape of the work:

- **Cut/fill** needs SOME interpolation between the extracted points to get a continuous surface a
  building footprint can be compared against (nearest-neighbour, IDW, or a real TIN step this port would
  have to newly build — the source never did, §0/§3). Once a surface exists in any form, the volume math
  is the SAME already-proven pattern as `TERRAIN_MIGRATION.md`'s earlier draft correctly identified: real
  quantity → declared UOM (M3) → the existing `analysis_sidecar.js`/`proj_fold.js` BOM machinery, not a
  new costing engine. That part of the earlier draft was right; keep it.
- **Weather-sensitive positioning** (slope/aspect/drainage, no live weather API — same non-goal as
  before) is likewise still valid but now depends on whichever surface-reconstruction choice above is
  made — a point cloud alone has no well-defined slope at a given XY without one.

## §6 — Non-goals (v1)

- No live weather/forecast API (unchanged from the earlier draft's reasoning — a second external-API
  dependency here repeats §4's exact problem for a much lower-value feature).
- No terrain sculpting/editing tools — this is an import pipeline, not an authoring tool.
- No multi-survey stitching.
- No re-implementing the affine-transform path just because it exists in the source — port the PROVEN
  simple transform first; enabling the disabled path is a follow-on, not part of this baseline (§8 Q5).
- No surface-reconstruction algorithm chosen here (§3 item 4) — named as an open question, not decided by
  default in either direction.

## §7 — Open questions (resolve against the real source / real test data before implementing)

- **Q1 — Surface reconstruction.** Point cloud only (matching the source, hand off to something else for
  a surface — mirrors the source's own Civil-3D hand-off) vs. build a real TIN/interpolation step in the
  Modeller (new scope, needed for §5's cut/fill). Not decided here.
- **Q2 — Op granularity.** One signed op per extracted point (689 ops for the sample survey) vs. one op
  for the whole batch (matching how `GEOM_ROOM_MOVE` carries a whole member list in one op, per
  `ROOM_MOVE_AND_ITEM_DRAG_SPEC.md` §2.4's precedent) — the batch shape is probably right by that
  precedent, but not asserted here without checking against a real op-log size/perf test.
- **Q3 — Credential model** (§4): user-supplied key vs. minimal proxy. Real product decision.
- **Q4 — Scale constant.** `0.0423 m/pixel` is fitted from ONE real survey's chainage markers (§1 Stage
  3, BUG #4) — the port must compute this per-survey from real markers on THAT image, never carry the
  0.0423 forward as a default for a different survey.
- **Q5 — Affine transform.** Currently disabled even in the proven source (§1 Stage 4). Port the simple
  transform now; re-enabling/porting the affine path is a separate, later decision.
- **Q6 — Two point types.** Ground elevations and invert levels (§1 Stage 3) are both real, both already
  extracted by the proven pipeline — confirm both get ported, not just ground elevations (the more
  visible/obvious one).
