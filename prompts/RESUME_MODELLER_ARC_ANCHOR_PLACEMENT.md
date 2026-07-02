<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — RESUME: Modeller ARC-seed ANCHOR-PLACEMENT bug (proven 2026-07-02, W-MV-PARITY)

## ✅ FIX DONE 2026-07-02 (same day) — bim-ootb PR #613 **MERGED to main (8449306)**, verified landed (not agent-report-only); worktree was /tmp/wt-anchor-fix
Render-side offset exactly per §Fix design below; signed op-log byte-identical. Seam landed:
`real_geometry.js recenter()` returns `anchorOffset` per hash → `arc_editable.js` carries it on geomAssets
(assets, NOT op params) → `bonsai_library.js registerRealGeometry` stores it and `foldInsert §ARC-ANCHOR`
adds back `R·anchorOffset` (`rotAnchor` mirrors `place()`'s yaw + §ARC-3AXIS branches; corrected pl.x/y/z
threaded through the GEOM_MOVE fold; tilted seeds drop the bogus assumedHalfZ re-seat).
**Definition of done MET (logs read, `/tmp/wt-anchor-fix/logs/`):**
- W-MV-PARITY **12/12**, tolerances unchanged — T2 18.03 m → **7.2e-7 m**; X1 18.03 m → **1.2e-6 m**;
  M2 repointed at anchor truth (the modeller's convention IS anchor now — witness updated in the same PR).
- NEW standing witness `modeller/tests/witness_residents_anchor_sweep.js` (W-ANCHOR-SWEEP **15/15**):
  all 5 residents, real user open path, rendered AABB centres vs node-independent
  `center + AABBcentre(R·rawVerts)` — SH 39@2.7e-7 · DX 253@7.2e-7 · SC 3225@1.0e-6 ·
  SC-ARC 3225@1.0e-6 · Terminal **35552@7.6e-6** — plus a screenshot per resident, eyeballed:
  **SampleCastle's "floating panels/scattered fragments" are GONE** (fix-design point 6 confirmed).
- Blast radius ALL green: W-ARC-EDITABLE 10/10 (no-register node path byte-identical), foldinsert-regression
  5/5, W-E2E-{LOD-MATCH 6, TERMINAL-OPEN 7, CUT 7, MOVE 9, ROTATE 7, SCALE 7, WALK 8, WALK-ALL 10,
  STRETCH-RIDE 9, GRIDSTRETCH 7}, W-TERMINAL-WALKALL-PERF 6/6.
- Note: all CURRENT resident DBs have 0 tilted (rotation_x/y≠0) rows — the 497/3317 SampleCastle figure in
  older comments was a previous file version; the 3-axis rotAnchor branch is dormant-but-correct safety.
- Environment note: `witness_arc_editable_smoke.js` needs `playwright`, which is installed NOWHERE on this
  machine (pre-existing; not a regression) — covered by W-ARC-EDITABLE (node) + the puppeteer E2E suite.
Secondary findings below (viewer `building` column, §SEL-TINT-REFOLD) remain PARKED/unclaimed.

```
# ⚠ DO NOT REMOVE
SCOPE: fix the Modeller's ARC-seed element placement to the PROVEN anchor semantics (below), flip
W-MV-PARITY's two deliberate REDs green, and re-verify every ARC-seeded resident visually + by maths.
Read the log after every run. The DIAGNOSIS below is triple-verified and SETTLED — do not re-litigate it;
spend the session on the FIX and its blast radius.
```

## THE PROVEN FINDING (do not re-derive — 3 independent confirmations, 2026-07-02)
**`center_xyz` in every `*_extracted.db` `element_transforms` is the IFC local-placement ANCHOR, not the
element's volumetric centre.** The raw geometry blob's vertices carry the local offset from that anchor.
- Proof: `world = center + R(rotXYZ)·rawBlobVerts` makes the modeller's `Duplex_extracted.db`
  (base_geometries) and the viewer's `Duplex_extracted.db` (component_geometries — a DIFFERENT extraction
  run) agree per-guid to **residualMax 1.44e-5 m over all 215 shared elements** (`§MV-PARITY-T`).
  Confirmed twice more: independent sqlite+python recomputation (same 1.442e-5), and the Viewer's own code
  has always used this convention (`viewer/streaming.js` composes pos=ifc2three(center) + Euler, raw verts).
- **The Modeller violates it**: `modeller/real_geometry.js recenter()` subtracts each blob's own AABB centre
  (its comment literally assumes "local (0,0) == the shape's own geometric centre" — proven wrong), then
  `arc_editable.js` seats that AABB centre on `center_xyz`. Net effect: every element whose blob has a
  non-zero local origin is displaced by exactly that (rotated) anchor→centre vector.
- **Measured on Duplex: 253 of 265 elements displaced >0.5 m; mean 2.74 m; max 18.03 m**
  (IfcFooting `0kF45Qs8L9PAM9kmb1lT5l` 18.03; IfcCoverings 15.9/14.7/13.7; IfcStairFlight 12.8).
  The Viewer renders the SAME modeller file correctly (anchor-corrected maxDC 9.0e-7); the Modeller's
  render only "looks like a building" because we had no ground truth next to it. All 32 modeller witnesses
  stayed green because they assert SELF-consistency with the wrong convention.
- **This most likely IS the parked "floating panels / scattered fragments on SampleCastle" bug** (memory
  `project_modeller_arc_viewer_rotation_gap` blamed yaw-only rotation — rotation is a real but SECONDARY
  gap; anchor displacement explains scattered-fragments-at-distance directly). Also re-frames the whole
  2026-07-01 "second wing / DB provenance" saga: both DB copies were fine; the Modeller's placement was off.

## ⭐ A 4TH CONFIRMATION — the ORIGINAL extractor already used anchor semantics, by construction (2026-07-02
## triage of the pre-JS/Python era; closes the "decide explicitly" branch in Fix design point 4 below)
This was never an open design question — it's how the source-of-truth extractor has computed world-space
since before the Modeller existed. Read directly, not inferred:
- **`DAGCompiler/python/extractIFCtoDB.py` (the script that PRODUCES every `*_extracted.db`)**, lines
  ~1187–1196: `mat4 = shape.transformation.matrix` (IfcOpenShell's own world-placement transform for the
  tessellated shape) → `center = mat4[:3, 3]` — **this translation IS what gets written to `center_x/y/z`**.
  `local_min`/`local_max` (and the stored vertex blob) come straight from `verts` — IfcOpenShell's RAW local
  tessellation, never re-based on its own AABB. The extractor's own world-space bbox two lines later
  (line ~1205) is computed as `world_corners = (rot3 @ corners.T).T + mat4[:3, 3]` — **the EXACT
  `world = R·local + center` formula W-MV-PARITY proved**, just read straight out of the script that has
  been doing this the whole time. There was never a version of this pipeline that used AABB-centre; the
  Modeller's `recenter()` is a JS-side invention that was never cross-checked against this file.
- Same block (lines ~1210–1219) also confirms **full 3-axis Euler (`rot_x`,`rot_y`,`rot_z`) has ALWAYS been
  extracted and self-validated** (`§ROT_FAIL` reconstructs Euler→matrix and diffs against the source `rot3`,
  tolerance 1e-6) — the earlier "yaw-only" bug (PR #595) was purely `arc_editable.js buildSeedOps` not
  reading two columns that were sitting right there in the DB the whole time, not an extraction gap. Same
  lesson twice: read the extractor before assuming the JS port's convention is the ground truth.
- **Don't be confused by `DAGCompiler/src/main/java/.../ElementPersistence.java`'s `writeElement()`**
  (~line 80–95), which DOES compute `cx = (minX+maxX)/2` etc. — that's AABB-centre, and it's legitimately
  correct THERE because it's the COMPILER's generative writer for synthetic, self-authored box geometry
  (BOM-drop/walker-placed fixtures written to the compile output, e.g. `output.db`), where the box IS built
  symmetric around its own centre by construction — anchor and AABB-centre coincide for those elements only.
  It is a **different table, different pipeline, different pedigree** from `*_extracted.db` (memory: "oracle
  = raw extraction", `output.db` = COOKED). The Modeller's ARC-seed reads `*_extracted.db` — it must follow
  `extractIFCtoDB.py`'s convention, not this one. Citing this Java file as license for AABB-centre would be
  the exact mistake that created the bug in the first place.
- **Consequence for Fix design point 4 (below): the "decide explicitly" framing is WRONG — there is no real
  choice.** Placement MUST stay anchor-semantics (render-side offset). Treating `center_xyz` as a true centre
  would diverge from `extractIFCtoDB.py`, the Viewer, and the DB's own documented meaning — not a smaller
  vs. larger change, just the only one that keeps the Modeller reading the file it was actually given.

## The standing regression witness (merged via bim-ootb PR #610)
`modeller/tests/witness_e2e_mv_parity.js` — W-MV-PARITY, 4 legs, whitebox §-log lines:
- `§MV-PARITY-M`  modeller vs its own convention (self-consistency, PASSES — 6.8e-7)
- `§MV-PARITY-T`  anchor-semantics cross-extraction proof (PASSES — 1.44e-5)
- `§MV-PARITY-M-TRUTH` + assert **T2 (RED by design: maxDisp 18.03 vs 1e-3 tol)**
- `§MV-PARITY-V/X` viewer-on-same-file + cross-app — **X1 RED by design (18.03)**
- `§MV-PARITY-V2` viewer LOD400 on its native file (PASSES — triExact 1119/1119)
LOD400 triangle parity is PERFECT everywhere (boxFallback=0; 253/253, 215/215, 1119/1119) — the bug is
POSITION ONLY. **Definition of done for the fix = T2 and X1 flip green (12/12) with tolerances unchanged.**

## Fix design (seam suggestion — validate, don't assume)
Do NOT naively delete `recenter()` — `place()`/`foldInsert`/gizmo/catalog-drop math all assume centred local
geometry (see the §CUT-ON-ARC B-rep promotion + GEOM_SCALE/ROTATE paths). The additive seam:
1. `real_geometry.js recenter()` already computes the subtracted centre `(cx,cy,cz)` — RETURN it as
   `anchorOffset` alongside positions/bbox (per geometry HASH, shared by all instances of that hash).
2. At fold time (`bonsai_library.js foldInsert` §REAL-GEOM branch), when a mesh carries `realGeomHash`,
   translate the placed mesh by `R·anchorOffset` (the element's own rotation applied to the offset) so the
   final world position == anchor semantics. Seat-on-ground (`seatHalfZ`) logic must be re-derived: with
   anchor semantics the element's world z comes straight from center_z + offset — the ARC seed's
   `cz − seatHalfZ` adjustment probably has to go for real-geometry elements (measure, don't guess).
3. Rotation interacts: the offset must rotate with the element (3-axis where present — the §ARC-3AXIS path).
4. Grid-stretch/GEOM_GRID_MOVE/§STRETCH-RIDE operate on world AABBs — re-run their witnesses. **NOT an open
   design choice** (see the ⭐ Python-era confirmation above): the op-log substrate (placement x/y/z in signed
   `GEOM_INSERT` params) KEEPS meaning "anchor" — that's what `extractIFCtoDB.py` and the Viewer already mean
   by it. RENDER-SIDE OFFSET is the only correct fix, and it happens to also be the smaller, reversible one —
   every signed op stays byte-identical.
5. Blast radius to re-verify after: witness_arc_editable(+smoke), witness_e2e_lod_match,
   witness_e2e_terminal_open, W-E2E-{CUT,MOVE,ROTATE,SCALE,WALK,WALK-ALL,STRETCH-RIDE}, W-MV-PARITY 12/12,
   PLUS an actual screenshot of each resident (SH/DX/SC/SC-ARC/Terminal) — the whole lesson of this bug is
   that witness-green ≠ looks-right; compare the modeller's Duplex against the deployed Viewer's Duplex.
6. SampleCastle: after the fix, re-check the floating fragments + whether the rotation-gap item shrinks.

## Secondary findings parked here (small, independent)
- Viewer cannot stream a raw modeller extraction — `elements_meta` lacks the `building` column its queries
  need (`§HELPERS_QUERY_ERR no such column: m.building`). One additive column (or tolerant query) fixes
  cross-open; W-MV-PARITY Leg V works around via a fixture copy.
- §SEL-TINT-REFOLD (from the same day's guide-frames work): an authoritative re-fold drops the selection
  emissive (2b5a8c→000000) while `_selSet` still holds the element — selection-plumbing nit, unclaimed.

## Where things live
- Witness + this finding: bim-ootb `main` (PR #610), worktree was `/tmp/wt-mv-parity` (branch
  `feat/mv-parity-witness`). Logs from the proving runs: `/tmp/wt-mv-parity/mv_parity_run{1,2,3}.log`
  (ephemeral). Independent recomputation script pattern: session scratchpad 2026-07-02 (sqlite+struct
  unpack float32 blobs, XYZ-intrinsic Euler — reproduce in ~40 lines if needed).
- Context prompts: `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` (the LOD400/real-geometry history),
  `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` (the SampleCastle saga this finding re-frames).
- Ground-truth source for the ⭐ confirmation above (bim-compiler repo, read before touching the fix):
  `DAGCompiler/python/extractIFCtoDB.py` lines ~1187–1219 (anchor transform + world-bbox formula + 3-axis
  Euler self-validation) vs. `DAGCompiler/src/main/java/com/bim/compiler/dsl/ElementPersistence.java`
  lines ~80–95 (the unrelated AABB-centre generative writer — different pipeline, do not borrow its
  convention).
