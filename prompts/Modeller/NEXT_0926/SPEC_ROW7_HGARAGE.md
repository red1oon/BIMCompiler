<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE
SCOPE: MODELLER_MASTER §RESUME 2026-09-26b NEXT #3 — HospitalGarage's structural grid (140 STR columns walked to a
degenerate 15×102 / colRMS 1.20 m). The 1D per-axis clustering in `str_walker.js` does not describe this building.
Read the log after every run; exit code is not evidence. Scratch spec — folded into MODELLER_MASTER by the watcher,
never committed here. Terminal must not move (18×10, 131/158 exact, colRMS 0.1323).

# SPEC_ROW7_HGARAGE — the lattice is ROTATED 2°, not off-lattice (measured + IFC-sourced)

Branch `fix/row7-hgarage-grid` off origin/main `9bc2d3c8`, worktree `/tmp/wt-hgarage-grid`.
Substrate = what the app itself opens: `modeller/Garage_ARC.db` (tracked; 140 IfcColumn/STR, 195 IfcBeam, anchors)
+ `HospitalGarage_geo.db` fetched from OCI (2,408,448 B, 502 blobs; the §STRWALK-GEO re-init substrate).
Centres are the true mesh centres via `CrossEdges.readBoxes(db, geoDb)` — 140/140 real, anchor→centre offset in
plan p50 25.4 mm, p90 73.2 mm, max 190.3 mm. Probe logs: session scratchpad `logs/probe_*.log`.

## A. Measured geometry (the answer to "what is this layout")
| measurement | value |
|---|---|
| shipped walk (origin/main, true centres) | grid **15×103**, girders 140, colRMS **1.1930 m**, exact (<5 mm) **6/140**, **102 of 118 gridlines have ONE member** (one line per column). Anchors (the Open-time INIT): 15×102, 1.1976 m |
| K=4 nearest-neighbour vectors, angle mod 90° | **459/560 (82 %) in the 87–88° bin**; only 18 % within ±2° of axis-aligned |
| NN spacing (0.25 m bins) | 5.50 m ×171 · 11.00 m ×117 · 4.50 m ×41 · 10.00 m ×27 (p50 5.59 m) — one regular cadence |
| all-pairs direction histogram, 0.01° bins, mod 90 → [−45°, 45°) | **mode −2.00°, 16.5 % of the 9,730 pairs in ONE 0.01° bin** (full-precision centres; 15.7 % on mm-rounded ones); next bins −20.12° ×140, 16.12° ×134 (diagonals of the same lattice); anchors: 12.3 % |
| refined angle (mean of the ±0.02° inliers) | **−2.0000°** (anchors: −2.0001°); Terminal on the same detector: 0.0000° (mode share 19.6 %) |
| walk in the frame rotated by −2.000° (same clusterer, gapTol 0.5, median fit) | grid **17×29**, 228 girders, colRMS **0.0607 m**, exact **132/140**, singleton lines 7 |
| frame-Y cadence (29 lines) | 5.49 m = 18 ft, run of 13 consecutive; 4.57 m = 15 ft at the ends; sub-lines at 0.54–2.74 m around y≈135–142 (ramp/core) |
| frame-X cadence (17 lines) | 5.59 m (18 ft 4 in) ×6 consecutive, 11.18 m (36 ft 8 in) ×2; twin lines 0.52/1.02/1.09/1.46 m apart at both ends (paired columns) |
| the 8 non-exact columns | residuals 0.038 ×2, 0.101, 0.133, 0.165, 0.368 ×2, 0.432 m — off-cadence by design (the 0.21 m / 0.16 m posts and the 0.34 m stubs), same class as Terminal's facade eccentricity |
| beams | 105/195 IfcBeam centres within 10 mm of a lattice line in the −2° frame (20 on X-lines, 85 on Y-lines); the rest sit at a constant 0.038 / 0.203 m (1.5 in / 8 in) face offset |
| RMS objective is NOT a valid angle estimator here | golden-section on colRMS lands at −1.992° (RMS 0.0604 but only 56 exact); at ±0.1° the clusters merge (17×28, RMS 0.13). The mode-of-directions estimator is what finds −2.000°. |

**So: ONE rectilinear lattice, rotated −2.000° from the world axes.** Not multiple grids, not radial, not eccentric.

## B. IfcGrid / IFC placement (extract-not-invent check)
- `HospitalGarage_IFC4.ifc` and `_IFC2x3.ifc` (6.4 MB each, `~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/`) carry
  **0 IFCGRID, 0 IFCGRIDAXIS** — no authored grid to extract. 140 IFCCOLUMN, all `Concrete-Square-Column:24 x 24` family.
- The rotation IS in the source: `#196109= IFCLOCALPLACEMENT($,#196108)` (IfcSite) → `#196108= IFCAXIS2PLACEMENT3D(#196104,#20,#196106)`
  → **`#196106= IFCDIRECTION((0.0348994967025161,0.999390827019096,0.))` = 88.000°** (≡ −2.000° mod 90). The extractor
  applied the site placement, so `Garage_ARC.db` world coordinates carry the 88° (checked: column #1722 local
  (222.93, 456.76) ft → world y 171.03 = the DB's y max). `#100 TrueNorth = (0.99939, 0.03490)` = 2.000°.
  Building and storey placements are identity. Units: feet (`IFCCONVERSIONBASEDUNIT FOOT`).
- Same check on Hospital (`Hospital_IFC4_STR.ifc`): IfcSite RefDirection `(0.996195, −0.087156)` = **−5.000°**; the same
  detector on `Hospital_ARC.db` (349 columns, anchors) reads mode −5.00° / refined −4.9993°. Two independent buildings
  where the measured mode equals the IfcSite rotation to ≤ 0.001°.
- The runtime DB does not carry the site placement (`project_metadata` = 4 rows), so the angle must be MEASURED from
  the real columns at walk time; the witness cross-checks the measurement against the IFC-sourced constant.

## C. The smallest change — cluster in the measured frame (`str_walker.js` + bridge render/snap)
1. `str_walker.js`
   - `swDetectRotation(columns, opts)` — all-pairs direction mod 90 → 0.01° histogram mode → refine = mean of the
     ±0.02° inliers → `{ thetaDeg, theta, modeDeg, modeShare, pairs, inliers, applied, reason, exact0, exactRot, lines0,
     linesRot }`. Gates (both logged, never silent):
     - **dead-band** `SW_GRID_ROT_MIN_DEG = 0.05` — below it a measured angle is within-line jitter, not a rotation
       (Terminal measures −0.0002°; HospitalGarage −2.0000°; 0.05° over Terminal's 150 m = 131 mm). `applied=false, reason='below-deadband'`.
     - **support gate** — the rotated walk must put MORE real columns exactly (<5 mm) on gridlines than the axis-aligned
       walk (`exactRot > exact0`); otherwise `applied=false, reason='fewer-exact'`. HospitalGarage 6 → 132 (applied);
       Hospital 43 → 26 (refused — its columns are per-storey stacks over ≥ 2 wing directions, −5° and +10°; a single
       rotation does not describe it and this row does not pretend it does).
     - `opts.theta` (radians) overrides detection (witness use); `opts.rotate === false` disables it.
   - `swToFrame(x, y, theta)` / `swToWorld(u, v, theta)` — the rotation about the origin (world = R(θ)·frame; same CCW
     convention as `bonsai_library.place()`'s yaw).
   - `swWalkSkeleton(columns, opts)` — detects; when applied, rotates the column list into the frame, then the EXISTING
     `swDeriveGrid` / `swWalkColumns` / `swWalkGirders` run unchanged. `grid.theta` / `grid.thetaDeg` / `grid.rotation`
     are added; **walked x/y and every girder datum are in the grid frame** (= world when θ = 0, i.e. byte-identical
     for Terminal and every axis-aligned fixture). `swReWalk` is frame-agnostic — untouched.
   - NO invented gridlines: the frame is a rigid rotation of the real coordinates; every line value is still a real
     column coordinate (median). 17×29 = 46 lines for 140 columns (was 118).
2. `str_walker_bridge.js`
   - `swbInit` logs `rot=−2.000°` in `§STRWALK-INIT` and one `§STRWALK-ROT` line with the detector census + gate verdict
     (APPLIED / REFUSED / NONE), so a walk that did or did not rotate is visible in the log. Stores the world centroid of
     the source columns for the datum snap.
   - `swbRenderOps` — column placement = `swToWorld(c.x, c.y)`; girder centre = `swToWorld(mid)`, `placement.rot = thetaDeg`
     (`place()` takes DEGREES, yaw about +Z). θ = 0 ⇒ `rot: 0`, byte-identical ops.
   - `swbOnGridMove` / `swbReplay` — the authoring grid is world-axis-aligned (`bonsai_grid.js`), so a dragged world datum
     is projected into the frame through the building's column centroid before the snap (`§STRWALK-SNAP` logs world →
     frame → line); `STR_REANCHOR.from/to` are converted back to world before commit. Δ is applied along the structural
     axis (frame), which differs from the authoring axis by θ — 2° here; a rotated AUTHORING grid is a separate row.
   - `swbTabData` gains `rotationDeg`; the STR tab label shows `Grid 17×29 ∠−2.00°` when θ ≠ 0 (the `grid` string is
     unchanged — witnesses parse it).
3. `str_walker_outliner.js` — `§STRWALK-GEO` line adds `grid=AxB rot=…°` so the browser re-init proves the rotated walk
   on the real Open path.
4. Cache-bust: `modeller.html` `?v=` bumps for `str_walker.js`, `str_walker_bridge.js`, `str_walker_outliner.js`;
   `sw.js` CACHE_VERSION bump.

## D. Witness + done-criterion
**New `modeller/tests/witness_row7_hgarage_grid.js` (W-ROW7-HGARAGE-GRID, pure node, real modules, real `Garage_ARC.db`;
`modeller/HospitalGarage_geo.db` when present (gitignored — copy from OCI) else the anchor leg with its own expected
numbers; INCONCLUSIVE (exit 2) if `Garage_ARC.db` is absent).** Each claim names the issue it proves:
- **H0 IFC-SOURCED** — the detector's refined angle equals the IfcSite RefDirection of `HospitalGarage_IFC4.ifc`
  (`#196106`, 88.000° ≡ −2.000°) within 0.01°. Extract check: the estimator reproduces the source, it does not invent.
- **H1 DETECTOR-FIRES** — `applied=true`, mode share ≥ 10 %, reason `more-exact`, exact 6 → 132 (anchors: 6 → 110).
- **H2 GRID-DESCRIBES** — `swbInit(db,{geoDb})`: grid 17×29 (was 15×103), colRMS 0.0607 ± 0.002 (was 1.193), exact
  132/140, singleton lines 7 (was 102); every gridline value is a member coordinate (no invented line).
- **H3 RENDER-WORLD** — `swbRenderOps` column placements land on the real world centres within each column's residual
  (max 0.432 m, 132 within 5 mm); every girder op carries `rot = −2.000`; girder endpoints re-projected to world sit on
  walked columns.
- **H4 REWALK-FRAME** — `swbOnGridMove({axis:'x', datum: world x of a 23-member line, delta: 1})` re-anchors exactly
  that line's members, each by 1.000 m along the frame axis = world (cos θ, sin θ) = (0.99939, −0.03490); spans change by
  1.000; the STR_REANCHOR from/to are world coordinates.
- **H5 TERMINAL-HELD** — `Terminal_arcstr_proof.db`: measured −0.0002° → `applied=false` (dead-band), 18×10, colRMS
  0.1323, 131 exact — unchanged (INCONCLUSIVE if the gitignored fixture is absent).
- **H6 HOSPITAL-REFUSED** — `Hospital_ARC.db` (tracked): measured −4.999° (= its IfcSite −5.000°) but `applied=false`,
  reason `fewer-exact` (43 → 26); grid stays 66×56. The witness can say NO.
- **H7 RED-CONTROL** — the HospitalGarage columns pre-rotated into their own frame: detector reads 0.000°, `applied=false`
  and the axis-aligned walk is 17×29 — a rotation is never applied where there is none (no-op proven, not assumed).

**Extend `witness_e2e_row7_geo_reinit.js`** with **R6 HGARAGE-ROTATED-GRID**: the real HospitalGarage Open's `§STRWALK-GEO`
line carries `grid=17×29 rot=-2.000°` and colRMS ≤ 0.07, and `swbTabData().grid === '17×29'`. Red on base (15×103).

**Regression set, base vs fix in the same tree:** W-ROW7-TRUE-CENTRE 6/0 · W-ROW7-GRID-BASELINE 5/0 · W-E2E-ROW7-GEO-REINIT 6/0
(→ 7/0) · W-E2E-STR-REWALK-COMMIT 9/0 · W-E2E-GRIDMOVE-REAL 8/0 · §STR-INTO-ARC 11/0 · §STRWALK-SMOKE 9/0 (all base
measured 2026-09-26, logs `scratchpad/logs/base/`). Terminal numbers must be identical on every one.

## E. Regression risk
- Terminal / synthetic axis-aligned fixtures: θ = 0 ⇒ the column list, grid, walk, girders and render ops are the same
  objects/values as before (three additive fields on `grid`). W-E2E-STR-REWALK-COMMIT's 2×2 fixture: 4 columns, 6 pairs,
  mode 0.00° ⇒ dead-band.
- Hospital: detector runs (60,664 pairs, ms) and REFUSES; walk unchanged. Log gains one `§STRWALK-ROT` line.
- Wall-bearing residents (`swDeriveSemiGrid`): untouched (no columns ⇒ no detector).
- Girder render now passes `rot` through `place()` — the same yaw path every library drop uses; θ = 0 ⇒ `rot: 0`.
- Cost: all-pairs O(n²) on 140–349 columns = 10k–61k atan2 — sub-millisecond scale; two extra clusterings for the gate.

## F. Open question for red1 (not blocking this row)
The authoring grid (`bonsai_grid.js`) draws and drags WORLD-axis lines; on a rotated building the STR re-walk moves
columns along the structural axis (2° off the drag axis here). Fine at 2°; a rotated authoring grid (draw/drag in the
building frame) is its own row if a resident with a large site rotation (Hospital −5° once its wings are split) is ever
to be edited by grid drag.

## RESULTS (2026-09-26, branch fix/row7-hgarage-grid; logs scratchpad/logs/{base,fix}/)
| claim | base (origin/main 9bc2d3c8) | fix |
|---|---|---|
| HospitalGarage node walk, true centres (`swbInit(db,{geoDb})`) | 15×103 · colRMS 1.1930 m · exact 6/140 · 140 girders · 102 one-column lines | **17×29 · 0.0607 m · 132/140 · 228 girders · 7 one-column lines · rot −2.000°** |
| HospitalGarage node walk, anchors (`swbInit(db)`) | 15×102 · 1.1976 m · 6/140 | 17×29 · 0.0819 m · 110/140 · rot −2.0001° |
| HospitalGarage REAL Open in the browser (§STRWALK-GEO, OCI geo) | `centres=mesh:140 anchor:0 colRMS=1.1930m` | `… colRMS=0.0607m grid=17×29 rot=-2.000°`, tab 17×29 (R6) |
| detector vs IFC | — | −2.0000° vs IfcSite 88.000° ≡ −2.000° (H0); Hospital −4.9993° vs −5.000°, REFUSED 43→26 exact (H6) |
| grid drag on the rotated lattice (node, Δ=1 m, 23-member line) | — | 23 STR_REANCHOR + 46 STR_RESPAN, each column (0.99939, −0.03490) m in world, rows WORLD (H4) |
| W-ROW7-HGARAGE-GRID (new) | 0/8 on base modules (no detector) | **8/0** mesh leg · 8/0 anchor leg |
| W-E2E-ROW7-GEO-REINIT | 6/0 | **7/0** (R6 added; red on base: no grid= field, 15×103) |
| W-ROW7-TRUE-CENTRE | 6/0 | 6/0 (18×10, colRMS 0.1323, 131 exact — Terminal did not move) |
| W-ROW7-GRID-BASELINE | 5/0 | 5/0 (0.0939 / 0.1039 mean-fit baselines unchanged) |
| W-E2E-STR-REWALK-COMMIT | 9/0 | 9/0 (2×2 fixture: dead-band, byte-identical ops) |
| W-E2E-GRIDMOVE-REAL | 8/0 | 8/0 |
| §STR-INTO-ARC | 11/0 | 11/0 (18×10, residRMS 0.104, 108 girders) |
| §STRWALK-SMOKE | 9/0 | 9/0 |
Cache-bust: modeller.html str_walker v4 · bridge v7 · outliner v17; modeller/sw.js CACHE_VERSION v54 (merged over main's v53 — #1771-#1773 landed mid-session; only sw.js conflicted).
**Shipped: bim-ootb PR #1774** (`fix/row7-hgarage-grid` @ 50ed3834 = 30863a0a + merge of origin/main 9325eb6d; auto-merge squash armed). All 8 witnesses re-run green on the merged tree (logs scratchpad/logs/merged/). Worktree `/tmp/wt-hgarage-grid` left in place.
