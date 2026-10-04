# CIVIL_HIGHWAY_JELAPANG — first civil-works (highway) IFC through the viewer importer

# ⚠ DO NOT REMOVE
- **Scope:** (A) the importer units bug that crushes a 2 km highway ×0.001 — spec, fix, witness;
  (B) a record of how a civil/linear model differs from our building assumptions (findings only,
  no implementation until the user picks an item).
- **Code lives in bim-ootb** (`viewer/import_worker.js`). Work in a `/tmp/wt-*` worktree off
  `origin/main` — the shared `~/bim-ootb` tree is hook-blocked for edits.
- **Read the log after every run.** Exit code / "it loaded" is not evidence. The proof is the
  `§UNITS_V2`, `§GEOREF_REBASE`, `§CAMERA envelope=` and `§FOG_DENSITY` lines, plus the stored
  `element_transforms` extents.
- No visual check is a test (PRIMAL LAW). "Close-up no longer cuts off" must be stated as numbers.

---

## §0 Source set (measured 2026-10-04)

Folder: `~/Downloads/JALAN JELAPANG IFC/` — 7 IFC files + their Civil 3D export logs, and the
browser-import result `JELAPANG.db` (408 MB, imported 2026-10-04T14:28Z).

| File | IfcBuildingElementProxy | Note (from the file's own `.log`) |
|---|---|---|
| JELAPANG_ROAD.ifc (278 MB) | 4008 | mainline 3D solids |
| JELAPANG_ROAD FURNITURE.ifc | 1011 | 39 solids + 972 block refs |
| JELAPANG_ROAD LIGHTING.ifc | 227 | |
| JELAPANG_DRAINAGE.ifc | 200 | 11 pipes + 95 structures + 2 TIN surfaces **skipped** by exporter |
| JELAPANG_ROAD SIGNAGE.ifc | 138 | |
| JELAPANG_ROAD MARKING.ifc | 90 | |
| JELAPANG_EARTHWORK.ifc (5 KB) | 0 | 1 TIN surface **skipped** — no terrain exported |
| **Total** | **5674** | = `elements_meta` row count in `JELAPANG.db` ✓ |

All files: `FILE_SCHEMA(('IFC2X3'))`, exporter `ODA SDAI 24.12` (Civil 3D 2024),
`#8=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)` — **declared unit is metres, no prefix.**

Real extent (raw `IFCCARTESIANPOINT`s with |x|>1000, LIGHTING + SIGNAGE files):
x 27,578 → 29,677 m, y −24,153 → −22,956 m, z −12.1 → 66.7 m ⇒ **≈ 2.10 km × 1.20 km × 79 m**.
(The user describes it as a 7 km highway; bbox diagonal is ≈ 2.4 km. Route length along the
alignment is NOT measured — IFC2X3 carries no IfcAlignment. Do not quote 7 km as a measured value.)

---

## §A Units bug — span heuristic overrides the declared unit

### A.1 Defect (measured)
`JELAPANG.db` `element_transforms`: x 27.56 → 29.69, y −24.24 → −22.91, z −0.011 → 0.085.
Exactly **×0.001** of the raw IFC. Viewer log of the same load:
`§CAMERA envelope=2x1x0m dist=80m`, `§FOG_DENSITY env=100m density=0.00400`,
`§OFFSET ifc=(29, -24, 0)`. Road solids are ~3 cm thick in scene units → near-plane clipping /
cut-off on close-up (user report). No `§GEOREF_REBASE` fired (mid-x 28.6 < 10,000).

### A.2 Cause (code read, bim-ootb `de9682e3`)
`viewer/import_worker.js:666-705` `§UNITS v2`: `_span = max(axis span of centres, max bbox)`;
`if (_span > 1500) autoScale = 0.001` (scales centres, bboxes, verts). Rationale in the comment:
*"No real building spans 1.5km"*. JELAPANG x-span ≈ 2,049 m → classified as millimetres.
The file's declared `LENGTHUNIT` IS read — but only later (`:764-776`, `_lengthUnitScale`) and only
for `§SITE_IDENTITY` site placement, never for this decision.

### A.3 Open question — MUST be answered by reading code before A.4 is implemented
The `:756-762` comment states `GetFlatMesh()`'s `flatTransformation` is **already auto-normalised
to metres** by web-ifc. If that is true for every file, the span heuristic is a *second* scaling
that only makes sense for files whose declared unit is wrong (authored in mm, declared m) — and the
declared unit can't help those. Read the web-ifc `OpenModel` settings in `import_worker.js` and
web-ifc's unit handling, and record here: (a) are transforms/verts normalised to metres before
`§UNITS v2` runs? (b) which real file motivated the heuristic (JKR series per the comment — what
did it declare?). The rule in A.4 depends on the answer; do not code it on assumption.

### A.4 Rule (to confirm against A.3)
1. Determine `declaredLen` = the file's `IFCSIUNIT … LENGTHUNIT` prefix scale (move the existing
   `:764-776` read ABOVE `§UNITS v2`; one reader, not two).
2. If a length unit is declared **and** web-ifc normalised the geometry to metres (A.3a = yes):
   `autoScale = 1`. The span heuristic does not run. A 2 km civil model stays 2 km.
3. Span heuristic stays only as the fallback when no `LENGTHUNIT` is declared, OR when declared
   metres disagrees with element-level evidence (to be defined from A.3b's real case — not invented).
4. `§UNITS_V2` line gains `declared=<METRE|MILLI…|none> decidedBy=<declared|span>` so the decision
   is in the log, not inferred.
5. Georef rebase is unchanged: at true scale mid-x ≈ 28,627 m > 10 km ⇒ x is rebased to a
   whole-metre local origin (`§GEOREF_REBASE`). y mid ≈ −23,555 ⇒ also rebased.

### A.5 Witness — `W-UNITS-DECLARED` (names the issue it proves)
Issue: *declared-metre model over 1.5 km is crushed ×0.001*.
- Input: `JELAPANG_ROAD LIGHTING.ifc` (19.7 MB, smallest file with real coordinates).
- Assert from the `§`-log: `§UNITS_V2 … autoScale=1 declared=METRE decidedBy=declared`;
  `§GEOREF_REBASE` fired with offset x≈28,6xx, y≈−23,5xx.
- Assert from stored transforms: x-span ≥ 2,000 m and ≤ 2,200 m (raw: 2,049 m); z-span ≥ 70 m.
- Regression guard: one existing mm-authored building import still yields `autoScale=0.001`
  (pick the case A.3b identifies). Without it the witness can't tell a fix from a flip.
- VACUOUS guard: if 0 transforms, print `INCONCLUSIVE`, never PASS.
- Downstream (log, not eyes): re-import JELAPANG full set → `§CAMERA envelope≈2100x1200x79m`.
  Then check `§FOG_DENSITY env=` and the camera near/far scale off the new envelope — fog at
  `env=100m` was clamped for a 2 m model; whether it scales to a 2 km envelope is part of the check.

---

## §B Civil vs building — impact findings (record only, no work until picked)

B.1 **Classless model.** 5674/5674 are `IfcBuildingElementProxy`, `storey=Unknown`, names
`IfcBuildingElementProxy_<id>`. Class-driven features are inert here — the load log already says
so: `§SURFACE_RULES_CLASS IfcBuildingElementProxy:R7=5674`, `§MEP_HUE_TALLY VACUOUS`,
`§TRI_SRC_TALLY … NO-OP`, `§4D_PILL_GATE has_schedule=false`. Not yet checked: whether the Civil 3D
property sets carry useful type data (next read before any classification work).

B.2 **Discipline lost in federation.** All 5674 stored as `discipline=ARC`. The only discipline
signal is the **source file name** (ROAD / FURNITURE / LIGHTING / DRAINAGE / SIGNAGE / MARKING).
Stamping discipline from filename is extraction, not invention — mapping to our discipline codes
needs one user decision (which codes a civil set uses).

B.3 **Exporter dropped content.** No terrain (EARTHWORK TIN skipped), no drainage network
(106 pipes/structures skipped as 2D). The viewer cannot show what the IFC doesn't carry — fix is
upstream (export settings) or a separate surface import; record, don't fake a ground.

B.4 **4D for a linear asset.** Buildings sequence by storey; a road sequences by chainage. IFC2X3
has no IfcAlignment, so chainage would have to be derived from element position along the route
— a NEW rule needing its own spec. Not in scope until asked.

B.5 **Building-scale constants.** After §A, the scene is ~1000× larger than anything tested:
camera near/far, fog envelope, DLOD distance thresholds, BVH, walk/fly speeds, film beats that
assume storeys. Each needs a `§` line read on JELAPANG before any claim it "works for civil".

---

## Status
- 2026-10-04: §0 measured, §A cause read from code, spec written. **Next: answer A.3, then
  implement A.4 + W-UNITS-DECLARED.**
