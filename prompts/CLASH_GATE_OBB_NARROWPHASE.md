<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# CLASH GATE — OBB narrow-phase upgrade (TOUGH, Fable) — 2026-07-11, strategy session

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `modeller/sdg_gate.js` — the RED/ORANGE conformity gate. Currently AABB-only
(axis-aligned bounding box) for clash/clearance. This is a REAL, named weakness (MANAGER strategy
review, 2026-07-11): AABB over-flags (two boxes overlap, real rotated shapes don't) and under-flags
on rotated elements (AABB is a loose bound on anything not axis-aligned). Read the log after every
run. PUSH PAUSE IN EFFECT (`CLAUDE.md` §⏸ PUSH PAUSE) — commit locally, verify on localhost, do
NOT push, do NOT open a PR, until told otherwise.
```

## Why this is the tough one (read before starting)
This is deliberately the harder of two parallel tasks today — a real computational-geometry
implementation, not a template port. It's also BOUNDED: Separating Axis Theorem (SAT) for
oriented-box pairs is a well-documented, precisely specifiable algorithm — the difficulty is
correctness and performance at scale (Terminal: ~48K elements), not open-ended judgment. You have
everything you need in this doc to do it right; don't improvise the math, follow §2 exactly.

## §1 — Current state (read the real code first)
`modeller/sdg_gate.js`:
- `overlaps(a, b)` — per-axis AABB interval overlap, layout `[minx,maxx,miny,maxy,minz,maxz]`.
- `penetration(a, b)` — min separating translation if all 3 axes overlap, else 0.
- `faceGap(a, b)` — signed gap when separated on exactly one axis.
- `evaluate(before, after, moved, rel, opts)` — the gate entry point; for each moved element vs
  every other, calls `penetration`/`faceGap` on AABBs to flag `clash`/`clearance`/`door-out`/
  `door-crush`/`abuts-realign`.
`element_transforms` (both bim-compiler and bim-ootb DBs) already has everything needed for a real
OBB: `center_x/y/z`, `rotation_x/y/z`, `bbox_x/y/z` (half-extents or full extents — CHECK which,
don't assume; verify against a known element's actual measured geometry before trusting the sign/
scale convention).

## §2 — What to build: two-phase broad/narrow collision (standard architecture, don't reinvent)
**Phase 1 (broad, KEEP AS-IS):** the existing AABB `overlaps()`/`penetration()` stays exactly as
the cheap first filter — do not remove or slow down the common (no-candidate-overlap) case.
**Phase 2 (narrow, NEW):** only for AABB-overlapping pairs, run a real OBB-OBB Separating Axis Test:
1. Build each element's OBB: center (`center_x/y/z`), half-extents from `bbox_x/y/z` (verify
   full-vs-half first, §1), rotation matrix from `rotation_x/y/z` (verify Euler order/units —
   radians vs degrees, same landmine already found once in this project's `dw-rot-units` work,
   don't repeat it blind — check a known-rotated element's actual placement to confirm).
2. SAT for OBB pairs: test the 15 candidate separating axes (3 from box A's local axes, 3 from box
   B's, 9 cross products of A's axes × B's axes). For each axis, project both boxes' half-extents
   and the center-to-center vector onto it; if the projected intervals don't overlap on ANY axis,
   the boxes are disjoint (real, non-clashing) — even if their AABBs overlapped. If they overlap on
   ALL 15 axes, compute the minimum-overlap axis as the real penetration depth/direction (this
   REPLACES the AABB `penetration()` value for that pair, more precisely).
3. **Numerical stability**: near-parallel axes produce near-zero cross products — guard with an
   epsilon (a standard, well-known SAT pitfall, not something to discover the hard way; cite your
   epsilon choice and why).
4. Feed the corrected penetration/gap value into the EXISTING `evaluate()` RED/ORANGE logic — don't
   rewrite the RED/ORANGE decision rules themselves, only the geometry test underneath them.

## §3 — Witness (real proof, not eyeballed)
1. **False-positive fix, proven on real data**: find (or construct from real element geometry) a
   pair of ROTATED elements whose AABBs overlap but whose real OBBs do NOT (a classic SAT teaching
   case — two boxes near-diagonal to each other). Show the OLD code flags it (or a synthetic
   equivalent using real bim-ootb element dimensions/rotations), the NEW code correctly clears it.
2. **No regression**: rerun `witness_sdg_gate.js` (existing) — must stay 11/11 (the axis-aligned
   cases, which are the majority, must produce IDENTICAL results before/after, since AABB and OBB
   agree exactly when rotation=0).
3. **Performance**: measure narrow-phase cost on a real AABB-overlap-heavy building (Terminal or
   Hospital — check `W-DW-CLASH-TE`'s existing clash-candidate counts as your starting point,
   170→3 candidates per the existing witness) — report actual timing, don't assume it's fine.
4. Save the log, read it yourself before claiming pass.

## §4 — Non-goals
- Do not touch the RED/ORANGE decision thresholds (`CLASH_TOL`, `CLEARANCE`) — only the geometry
  test feeding them.
- Do not build a general mesh-boolean (actual triangle-level intersection) — OBB-OBB SAT is the
  right fidelity/cost tradeoff here, a full mesh boolean is a much bigger, separate undertaking.
- Do not touch `door-out`/`abuts-realign`'s existing AABB-based logic beyond feeding it the
  corrected penetration value — their surrounding logic (host-fit checks etc.) stays as-is.

## DONE WHEN
OBB-SAT narrow-phase exists, proven to correct a real AABB false-positive case, zero regression on
existing witness, performance measured and reported honestly (even if it's a real cost, say so —
don't hide a slowdown to claim a clean win).

---

## ✅ RESULT — 2026-07-11 (Fable session): built, witnessed, committed LOCALLY (PUSH PAUSE honoured)
**Branch `feat/clash-obb-narrowphase` @ `1f54cd1`, worktree `/tmp/wt-clash-obb` — NOT pushed, no PR
(per §⏸ PUSH PAUSE). Files: `modeller/sdg_gate.js` (§OBB SAT), `modeller/modeller.html` (`_gateObb()`
live-op-log wiring, all 3 `evaluate()` call sites), new `modeller/tests/witness_sdg_gate_obb.js` +
`witness_sdg_gate_obb_smoke.js`.**

### §1-landmines — VERIFIED against real data before any math (both were live):
- **`bbox_x/y/z` = WORLD-AABB FULL extent, NOT local dims and NOT half-extents.** Proof: the −90° wall
  (`…VyWx4`) stores (0.29, 5.8) vs its base_geometries local mesh (5.80, 0.29) — swapped; the 37°
  furniture (`…VyY1R`, rotZ=0.6458 rad) stores exactly `|L·cosθ|+|W·sinθ|` = (1.477, 1.449) vs local
  (1.116, 0.973) — matches to 3 decimals (witness W4 locks this at <0.01mm). ⇒ OBB local half-extents
  must come from the element's own local mesh box, never `bbox/2` on a rotated element.
- **Rotation = RADIANS** (values are exact ±π/2, π); `obbAxes()` mirrors `bonsai_library.js place()`'s
  two production branches exactly: yaw-only ⇒ Rz(rz); rotX/rotY ⇒ Rx(rx)·Ry(rz)·Rz(−ry) (THREE
  `Euler(rotX, rotZRad, −rotY)` order 'XYZ' — viewer parity, including that branch seam).
- **NEW recon fact (matters for wiring):** the resident `*_ARC.db` flow PRE-BAKES yaw into
  world-oriented real meshes (op `placement.rot=0`) — those elements ARE axis-aligned boxes to the
  op-log and are honestly ABSENT from the OBB map (AABB already exact; nothing invented). The narrow
  phase's live customers: gizmo `GEOM_ROTATE`d elements, the §ARC-3AXIS tilted ones (SH_ARC 3 /
  Hospital 422 / Terminal 325), catalog drops with yaw, and `*_extracted.db` local-file opens (real
  non-90° yaw params). Grid-stretched fids are omitted (world-axis stretch ≠ local-axis op → AABB
  fallback); `GEOM_SCALE` multiplies local h (fold scales local geometry).
- Epsilon: cross axes skipped when |Ai×Bj| < 1e-6 (sin of edge angle ≈ 6e-5°) — Ericson, Real-Time
  Collision Detection §4.4.1; conservative direction (can only keep an AABB-era flag, never fabricate
  a separation).

### §3-witness numbers (logs read, all saved to session scratchpad):
1. **False positive, real data (W-SDG-OBB 11/11 PASS):** W2 — the two real non-90° SampleHouse
   elements (±37°/−35° furniture, measured local h + measured rotations): AABBs interpenetrate
   **0.0428m** (> 2×CLASH_TOL, old gate = RED clash) while real OBBs are disjoint → new gate CLEAR.
   Hand-derived W1/W7 known answers exact (45° pair: AABB 0.2142 vs SAT 0; penetrating pair: AABB
   claims 0.914m, true MTV depth 0.2929m). W5 proves the 9 cross axes are load-bearing (pair
   separable ONLY edge×edge). **Browser, real user path (§OBB-SMOKE 5/5):** gizmo-rotate 45° →
   commitMove → old path phantom RED **0.0224m**, live obb-fed gate clean.
2. **Zero regression:** `witness_sdg_gate.js` **11/11 PASS** (no `opts.obb` ⇒ byte-identical path);
   pre-existing browser `witness_sdg_gate_smoke.js` **6/6 PASS** with the wiring live.
3. **Performance (measured on real DBs, not assumed):** SAT **535 ns/pair** (Terminal) /
   **401 ns/pair** (Hospital). Full census: ALL 41,226 Terminal AABB-overlapping pairs = **22.1ms**;
   Hospital 47,679 pairs = 19.1ms. Realistic gate workload (rotated-side pairs only: 419 TE / 1,494
   HO) = **0.25ms / 0.54ms per full sweep**. Honest cost statement: SAT is ~5× the AABB test per pair
   (4.3ms baseline for the same 41K pairs) — but it only ever runs on broad-phase survivors with a
   rotated side, so a real gate call (~170 candidates, W-DW-CLASH-TE scale) adds well under 0.1ms.
4. `_gateObb()` map build is cached by op-log length (§GATE-OBB log line: `entries=N builtAtOps=M`).

### Follow-ups (named, not hidden):
- `faceGap`/clearance (ORANGE) stays AABB-based per §4 non-goals — a rotated pair's gap remains the
  conservative AABB approximation (stated in the code header).
- Pre-baked-yaw resident elements can't be OBB-refined from the op-log (orientation lost at ARC-db
  bake time); recovering it would need the source `element_transforms` threaded through Open — a
  separate, deliberate substrate decision, not done here.
- PUSH PENDING: when PUSH PAUSE lifts, push `feat/clash-obb-narrowphase` from `/tmp/wt-clash-obb`
  (plain js/html, no LFS content) and open the PR.

---

## §MESH_NARROWPHASE — viewer mesh-to-mesh clash narrow phase (2026-09-04, Fable) — SPEC, written before code

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb VIEWER clash pipeline (`viewer/measure.js` `_queryClashesPairRtree` → `_currentClashes`
rows → `_revealClashes` list / `_flyToClash` / `clash_report.js` / `clash_snag.js`), NOT the modeller
gate above (that §OBB SAT lives un-merged on `origin/feat/clash-obb-narrowphase` @ 1f54cd1a; its math
is REUSED here as the mid phase, its file is not touched). Consumer: the film lane
(`MEP_CLASH_REVEAL_MOVIE.md`) — a clash pair rendered into a film is a permanent shareable artefact, so
CORRECTNESS OF THE PAIR SET IS THE DELIVERABLE; speed is measured and reported, never traded for it.
Read the log after every run — exit code is not evidence.
CORRECTION to this file's header: "PUSH PAUSE IN EFFECT" is STALE — push permission has been ON since
2026-07-17 (`bim-compiler/CLAUDE.md` §⏸ PUSH PAUSE — LIFTED). This lane pushes and opens a PR; the user
reviews it (NO auto-merge).
```

### §M.0 — What was measured before designing (read-only probes, 2026-09-04)
Every number below is from `sqlite3` on the files in `~/bim-ootb/buildings/` (scratchpad `probe_db.sh`,
`probe_geo.sh`, `probe_dev.sh`) or from a code read at the cited line.

| fact | value | consequence |
|---|---|---|
| Viewer DB-name resolution | `db=…/X.db` → `X_meta.db` + `X_geo.db` (`streaming.js:2958-2971`; `_extracted.db` is rewritten to `_meta.db`/`_geo.db` when those exist) | `BLD=Terminal` serves **`Terminal_meta.db`+`Terminal_geo.db`**, `BLD=Hospital` serves `Hospital_meta.db`+`Hospital_geo.db`. Never pass `Hospital_meta`. |
| `Terminal_meta.db` | 48,428 rows, **rotated=0** (all `rotation_*` = 0), 9,394 hashes, all present in `Terminal_geo.db` (missing=0); disciplines ACMV:1570 ARC:35552 ELEC:833 FP:989 MEP:277 PLB:8175 STR:1032 | **The OBB mid phase is VACUOUS for rotation on every building the viewer serves** (also `Hospital_meta.db` 63,182 rotated=0, `Hospital_extracted.db` rotated=0, `deploy/dev/buildings/Terminal_extracted.db` rotated=0). It still runs — it can only reject where the stored `bbox_x/y/z` is looser than the real local mesh box — and its rotation branch is proven ONLY by the synthetic oracle (§M.4). Stated as a measured limitation, not hidden. |
| `~/bim-ootb/buildings/Terminal_extracted.db` (May) | rotated=40,451 (37,594 with rotX/rotY), but **0 of its 7,150 hashes exist in `Terminal_geo.db`** | It is a DIFFERENT, older extraction; it cannot be rendered against the resident geo.db and is NOT a valid narrow-phase target. The benchmark lane's discipline census (STR 34356 · MEP 9733 · ARC 2222) is from THIS file, not from what the viewer serves. |
| Broad phase population | `_queryClashesPairRtree` returns rows `[guidA, guidB, classA, classB, discA, discB, nameA, nameB, overlap_m]`, capped at `A._CLASH_PAGE_SIZE` (200; the export lifts it to 50000 at `clash_report.js:454`), overlap = min-axis AABB overlap, dropped below `rule.tolerance_m` (25–75 mm, `clash_rules.json`) | Rows are consumed BY INDEX (`c[0..8]`) in 8 files — the narrow phase must ANNOTATE rows (`c[9]`), never remove/reorder them. Rules cover 12 pairs; **PLB (8,175 elements on Terminal_meta) has no rule and is never checked** — pre-existing gap, out of scope, named. |
| Prior headless measurement | `bim-compiler/build/erp/measure_narrowphase.log` (Terminal monolith, 4,000 capped candidates): `confirmed=2220 false_positive=1780 fp_rate=44.5% per_pair_ms=0.318`; rich variant (`closestPointToGeometry` per pair) `per_pair_ms=5.139` | Proves the library path works headless (CDN import of three-mesh-bvh@0.8.0 in `loader.js:196`). The 44.5 % is a CAPPED SAMPLE, not the building; and `closestPointToGeometry` is 16× the verdict cost — contact points must come from a cheaper enumeration (§M.2 stage 3). |
| Memory on record | `CPE_4D_PERF_MEM_STUDY.md` §R12_HOSPITAL_MEM: heap 1,546–1,577 MB; `meshCache BVH 50.2 MB` on 20,609 entries; `§BVH_DEFERRED built=20609 ms=26,981`; lever 1 = the 324.8 MB meshCache batch-only duplicates (re-fetch from resident geo.db on demand) | Triangle BVHs ALREADY EXIST post-stream. The narrow phase REUSES `geo.boundsTree`; it never builds a second BVH set and never moves BVH construction earlier in the load. Any geometry it must fetch itself is transient and released at run end (lever-1 pattern). |

### §M.1 — The representation question (answered by code read, recorded so it is not re-derived)
Elements are drawn as BatchedMesh slots or InstancedMesh instances, but the narrow phase needs neither:
- **Per-element local geometry** = `A.meshCache[element_instances.geometry_hash]` — the local-space
  `BufferGeometry` `blobToGeometry` built (`scene.js:1883`, IFC Y↔Z swap already applied), retained for
  the building's life (only cleared at unload, `streaming.js:3479-3483`). It is the SAME object a
  BatchedMesh slot was copied from (`bm.userData.slotGeo[slotId]`, `streaming.js:2329`) and the same
  object an InstancedMesh renders (`iMesh.geometry`, `:2216`). Its BVH is `geo.boundsTree`, built by
  the `§BVH_DEFERRED` chain (`streaming.js:1761-1783`) after streaming.
- **Per-element world matrix** = `Matrix4.compose(ifc2three(center_x,center_y,center_z),
  Quaternion.setFromEuler(Euler(rotation_x, rotation_z, -rotation_y, 'XYZ')), (1,1,1))` — byte-identical
  for InstancedMesh (`streaming.js:2224-2229`) and BatchedMesh (`:2333-2338`); `ifc2three` =
  `(ix-off.x, iz-off.z, -(iy-off.y))` (`scene.js:499`); rotations are RADIANS (§1-landmines above).
- **Relative matrix for the BVH call** = `inv(M_A) · M_B` (B's local frame → A's local frame), passed as
  `geomToMesh` to `bt_A.intersectsGeometry(geoB, rel)` / `bt_A.bvhcast(bt_B, rel, cb)`.
- **Witness invariant I4 (scene-matrix parity)** checks this answer against the LIVE scene: for a
  sample of judged elements, `bm.getMatrixAt(slotId)` (via `A._batchMeta`) or
  `iMesh.getMatrixAt(instanceIndex)` (via `A._instanceGuids`) must equal the DB-derived matrix to 1e-5.
  A Time-Machine-zeroed matrix or a changed convention fails it.
- **meshCache miss** (box-proxy streamed, or a future lever-1 release): fetch `vertices, faces[,normals]`
  for that hash from `A._rangeDb` (async) or `A.libDb` (sync) with the exact SQL shape of
  `streaming.js:1863-1931`, `blobToGeometry`, `computeBoundsTree`, hold in a RUN-LOCAL transient map,
  `disposeBoundsTree()+dispose()` at run end. Counted as `geomPinnedPeak`/`geomReleased`.

### §M.2 — The three stages (each measured, each logged)
1. **BROAD (unchanged)** — the existing rows. Candidate generator only. Nothing removed from it.
2. **MID — OBB/SAT (this file's §2 math, ported from `sdg_gate.js` `obbPenetration` @ 1f54cd1a)** —
   OBB per element: `h` = half-extents of `geo.boundingBox` (the LOCAL mesh box — never `bbox/2`, per
   §1-landmines), centre = `M · localBoxCentre`, axes = the 3 columns of `M`'s rotation part (unit
   scale). 15 axes (3+3+9 cross), each axis skipped when `|A_i×B_j|² < 1e-12` (`OBB_EPS=1e-6`, Ericson
   RTCD §4.4.1 — conservative: can only keep a broad-phase candidate, never fabricate a separation).
   Separating axis found → `verdict=CLEAR stage=OBB reason=OBB_SEPARATING_AXIS`. Else `obbDepthM` =
   minimum normalized overlap (the oriented-box MTV depth; a PROXY severity, labelled).
3. **NARROW — triangle-exact via `MeshBVH`** —
   a. `bt_A.intersectsGeometry(geoB, rel)` (early-exit) → true ⇒ `CLASH reason=MESH_TRIANGLES_INTERSECT`.
   b. false ⇒ **containment check** (a duct fully inside a slab has NO surface intersection — a real
      hole in a triangle-only test, IfcClash covers it with ray protrusion): only when one element's
      world AABB lies inside the other's, cast 3 axis rays from the inner element's centroid in the
      outer's local frame through `bt.raycast(ray, DoubleSide)`; odd hit-parity on ≥2 of 3 rays ⇒
      `CLASH reason=MESH_CONTAINED` (majority vote guards a non-watertight mesh; the count is logged).
   c. else `CLEAR reason=MESH_NO_TRIANGLE_INTERSECTION`.
   d. **Contact + extent for CLASH (what the film needs)** — `bt_A.bvhcast(bt_B, rel,
      {intersectsTriangles})` enumerates intersecting triangle PAIRS (ExtendedTriangle
      `intersectsTriangle`), capped at 4,096 (`truncated` flagged); contact = centroid of the A-side
      intersecting-triangle centroids (A-local → world via `M_A`), extent = diagonal of their bbox,
      `triPairs` = count. For CONTAINED: contact = inner element's world centroid, extent = its bbox
      diagonal. This replaces the 5.1 ms/pair `closestPointToGeometry` (§M.0) with one traversal that
      only runs on CLASH pairs.
   e. Geometry unavailable (no meshCache entry, no DB blob, no BVH possible) ⇒ `verdict=UNKNOWN
      reason=NO_GEOMETRY` — kept in the output, never dropped, counted as `unknown`.

### §M.3 — Output schema (per pair; the film lane's contract — designed for it, not drawn here)
Attached as `row[9]` on every `_currentClashes` row it judged (indices 0–8 untouched) and collected in
`A.clashNarrow.lastRun.pairs[]`:
```
{ pairId,                  // sorted 'guidLo|guidHi' — stable across frames/sessions (NOT _clashPairKey, which is row-ordered)
  guidA, guidB, classA, classB, discA, discB,
  stage: 'BROAD'|'OBB'|'MESH', verdict: 'CLASH'|'CLEAR'|'UNKNOWN',
  reason: 'OBB_SEPARATING_AXIS'|'MESH_TRIANGLES_INTERSECT'|'MESH_CONTAINED'|'MESH_NO_TRIANGLE_INTERSECTION'|'NO_GEOMETRY',
  aabbOverlapM,            // the broad phase's c[8] (legacy severity proxy)
  obbDepthM,               // SAT minimum-translation depth of the two ORIENTED LOCAL boxes (proxy, labelled)
  severityM,               // = obbDepthM for CLASH — a bbox-class PROXY, not true mesh penetration (BENCHMARK lane §3 stays open)
  triPairs, truncated,     // intersecting triangle pairs enumerated (0 for CONTAINED/CLEAR)
  contact: {x,y,z},        // three.js world (session-relative: A.modelOffset) — for the camera / leader line
  contactIfc: {ix,iy,iz},  // IFC space via A.three2ifc — the persist-safe form (scene.js:503 rule)
  extentM,                 // size of the contact region — the "1 or 2 near and facing" ranking key
  bvhReusedA, bvhReusedB,  // true when the §BVH_DEFERRED tree was reused (false = built on demand, counted)
  ms }
```
Legacy severity `c[8]` is never overwritten; the list shows the verdict beside it.

### §M.4 — Witness claims (`viewer/tests/witness_clash_mesh_narrowphase.js`, witness_kit contract)
Population = one record per broad-phase pair judged (module verdict) **plus** the witness's OWN oracle
re-test of that pair — a direct `intersectsGeometry` + ray-parity call on the meshCache geometry with the
DB matrix, written inside the witness, independent of `clash_narrow.js`'s staging. On `origin/main`
(no module) the witness judges the LEGACY answer (every broad-phase row = "clash") against the same
oracle — that is the RED-before.
- **I1 no false positives** — every `verdict=CLASH` row: oracle says triangles intersect or contained.
- **I2 no silent losses** — record count = broad total; every record's verdict/reason from the enum.
- **I3 clear is really clear** — every `verdict=CLEAR` row: oracle says NO intersection and NOT
  contained (catches an unsound OBB rejection or a containment miss). VACUOUS if 0 CLEAR rows.
- **I4 scene-matrix parity** — §M.1's matrix vs the live `getMatrixAt`, max |Δ| < 1e-5 on the sample.
- **I5 synthetic oracle (hand-known answers, run in-page through the SAME `testPair`)** —
  S1 axis-aligned unit cube vs 45°-yawed unit cube at (2.2, 2.2, 0): AABB overlap 0.2142 m, OBBs
  disjoint ⇒ CLEAR@OBB (this file's W1). S1' same pair with the OBB stage disabled ⇒ CLEAR@MESH (the
  mesh agrees). S2 pipe-through-beam: 0.1 m-radius cylinder along X crossing a 0.4×0.6 m beam along Y
  ⇒ CLASH@MESH with `triPairs≥1`, contact inside the beam's box, extent ≤ beam depth+pipe Ø.
  S3 unit cubes offset 0.9 on X ⇒ CLASH, `obbDepthM=0.1` (AABB=OBB=mesh agree), contact inside the
  0.1 m slab of overlap. S4 0.2 m cube fully inside a 2 m cube ⇒ no surface intersection, CLASH
  reason=MESH_CONTAINED. S5 unit cube vs 45°-yawed cube at (1.5,1.5,0) ⇒ CLASH, `obbDepthM=0.2929`
  (this file's W7; AABB would say 0.9142).
- **RED CONTROL** — a CLASH record's oracle flag flipped → I1 fails.
- **INCONCLUSIVE** when `window._bvhReady=false`, streaming did not finish, the BVH chain did not drain,
  or broad=0 — prints `INCONCLUSIVE`, never `PASS`. `§CLASH_OBB` prints `VACUOUS` when no judged pair
  has a rotated side (the case on every served DB, §M.0).

### §M.5 — Log lines (the evidence; every claim in the DONE appendix cites one)
- `§CLASH_NARROW_INIT` — module wired; allocates nothing (first-load cost claim).
- `§CLASH_NARROWPHASE pair=<discA|discB> broad= obbSurvivors= meshTrue= contained= unknown=
  falsePositiveRate=<pct of broad that mesh says CLEAR> ms= msPerPair=` per discipline pair, plus
  `pair=TOTAL` per building.
- `§CLASH_OBB rotatedSides= rejected= [VACUOUS]`.
- `§CLASH_NARROW_LOSS broad= accounted= lost=` (must be 0).
- `§CLASH_MEM heapBeforeMB= heapPeakMB= heapAfterMB= bvhReusedEntries= bvhBuiltNew= geomPinnedPeak=
  geomReleased=` per run; `bvhBuiltNew` must be 0 or explained.
- `§CLASH_NARROW_SELFTEST case=<S1..S5> expect= got= PASS|FAIL` and a summary line.
- `§WITNESS_CLASH_MESH_NARROWPHASE pass= fail= ran=`.

### §M.6 — Production wiring (minimal; no new panel, no film work)
`viewer/clash_narrow.js` (`setupClashNarrow(A)`, loaded after `clash_matrix.js`, before `measure.js`;
`sw.js` PRECACHE + `CACHE_VERSION` bump in the same PR). On a matrix cell click, after `_revealClashes`,
`A.clashNarrow.qualifyRows(page)` runs async in yielding chunks on the CURRENT PAGE only (≤200 rows,
~0.3 ms each) and re-renders the list: CLEAR rows are struck through and labelled `bbox-only`, the header
gains `mesh-true n/N`. Progressive storey rows are qualified as they arrive. Nothing runs at load; nothing
runs while the matrix is closed. Export/snag/deep-link/history read `c[0..8]` exactly as before.

### §M.7 — Non-goals (restated for this section)
No film, camera mode, labels, leader lines, or new panels. No true mesh penetration depth (BENCHMARK lane
§3 — `severityM` stays a labelled proxy). No change to `deploy/live/`, no `.db` commits, no schedule/TM/
dlod changes. The modeller gate's own OBB branch is not merged or modified by this lane.

### §M.8 — RESULTS (filled from the logs after the runs; TBD until then)
TBD (measured below).
