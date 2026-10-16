# ⚠ DO NOT REMOVE — GRID_ROTATION_GUARD: closed, shipped and merged; historical record archived

## 🏁 LANE CLOSED 2026-07-11 (Watchdog-verified each round) — MERGED to bim-ootb `main`, shipped and live
Guard against grid-drag misclassification of oblique-yawed/tilted elements in `grid_kinematics.js` /
`bonsai_gridmove.js` (AABB-vs-real-edge mismatch for anything off a 90° multiple). Built, witnessed, and
independently Watchdog-verified across three escalating rounds, same day 2026-07-10 (yaw-only guard →
3-axis tilt extension → axis-scope 'y' fix), with the last PR merging 2026-07-11.

**Shipped, all MERGED to bim-ootb `main` (verified via `gh pr view` + `git merge-base --is-ancestor`):**
- **PR #720** (merged 2026-07-10) — original oblique-yaw guard: `grid_kinematics.js`/`bonsai_gridmove.js`
  gain an optional `yawRad` per element; ATTACH/EDGE/SPAN classification is skipped beyond 0.01 rad of a
  90° multiple on the x/z axes. `W-GRID-ROTATION-GUARD` 33/33.
- **PR #721** (merged 2026-07-10) — hardens `GEOM_GRID_MOVE`'s SCALE fold (`bonsai_kernel_worker.js`)
  against a rotated shape via a composed rotate→scale→rotate-back matrix.
- **PR #722** (merged 2026-07-11) — §ROTATION-GUARD-3AXIS + §AXIS-SCOPE: extends the guard to
  `tiltXRad`/`tiltYRad` (roll/pitch — found live-reachable on 3-4 of 293 newly-tilted SampleCastle
  elements after `feat/embed-8-arc-buildings` merged, closing a real gap the original guard's own
  dormancy claim hadn't accounted for) and to axis `'y'` (the Modeller's real second in-plan axis — the
  guard originally only covered x/z, a Viewer Y-up assumption that doesn't hold for the Modeller's Z-up
  scene). Fixed a genuine pre-existing regression as a side effect (`W-GRID-SCALE-YAW-HARDENING`
  19/21→21/21, traced to the same axis-scope bug).

**Final regression, all green (206/206):** `W-GRIDKINEMATICS-PURE` 98/98 · `W-GRIDMOVE-ADAPTER-FAKES` 4/4 ·
`W-GRIDKINEMATICS-REAL-DUPLEX` 8/8 · `W-GRID-ROTATION-GUARD` 34/34 · `W-GRID-SCALE-YAW-HARDENING` 21/21 ·
`W-GRIDMOVE-SMARTSCOPE` 6/6 · `W-GRID-INSERT` 6/6 · `W-GRID-TILT-GUARD` 29/29.

**Named non-goal, never in this file's scope (still real, belongs to a different lane if ever picked up):**
the render layer does not wire `rotation_x`/`rotation_y` into the actual THREE mesh transform
(`mesh.matrixWorld` stays IDENTITY for tilted elements today) — this guard is correctly inert against a
tilt that isn't rendered yet. Not a defect of this guard; a separate, deeper gap outside its 3-file
allowlist (`grid_kinematics.js`/`bonsai_gridmove.js`/`witness_grid_rotation_guard.js`), named but
deliberately not fixed here per the file's own §2 rule 4.

Full day-by-day build/verify history (§0–§9, every diagnosis/build/Watchdog-reverify round, all dated
2026-07-10) archived verbatim, nothing lost:
**`prompts/archive/GRID_ROTATION_GUARD_full_history_2026-07-10_to_2026-07-10.md`**
