<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §CATALOG-PATH: the Modeller's catalog has been empty since #550
SCOPE: bim-ootb `modeller/bonsai_library.js` catalog fetch + `modeller/sw.js` precache + the witness that missed it.
Read the log after every run. Spec written 2026-09-26 before any code.

## Issue (measured 2026-09-26, merged main `b0826a5a`)
- `modeller/bonsai_library.js:34` fetches `dagevu_catalog.json` relative to its own script → `modeller/dagevu_catalog.json`.
  #550 (2026-06-27, "extract Modeller into its own top-level folder") left the file at `viewer/dagevu_catalog.json`.
- Live: `…/bim-ootb/modeller/dagevu_catalog.json` 404, `…/viewer/dagevu_catalog.json` 200 (274,212 B).
- Headless log: `§LIBRARY catalog loaded products=0 groups=0 cheat=0 assemblies=0` (the witness server's `404` body parses as
  JSON, so it reads 0 instead of `catalog load failed`; live it hits the catch — empty either way).
- Effect on Terminal Walk-ALL: `§DW §BEND disc=PLB joints=597` → 726× `GEOM_INSERT unknown component FITTING_ELBOW_GENERIC`
  + 468× `…FITTING_TEE_GENERIC` (2 folds × 597). The fittings are signed rows that never render.
- W-TERMINAL-WALKALL-PERF T6 NO-ERROR is scope-blind to it (pageerror only).

## Change
1. `bonsai_library.js`: fetch `../viewer/dagevu_catalog.json?v=11` (the Modeller already loads shared files from `../viewer/`,
   e.g. `sw.js` precaches `../viewer/connect_scene.js`). One file, one owner — no copy that can drift.
2. `sw.js`: precache `../viewer/dagevu_catalog.json`; bump `CACHE_VERSION`.
3. Log on a non-OK fetch (`§LIBRARY catalog load failed http=<status>`) instead of parsing a 404 body as a catalog.

## Witness
- **W-TERMINAL-WALKALL-PERF T7 FOLD-CLEAN** (new): 0 `GEOM_INSERT unknown component` lines AND `§LIBRARY catalog loaded
  products=N` with N > 0. Base must be RED (1,194 / products=0); after the fix GREEN. If no `§BEND` joints were produced
  the check prints INCONCLUSIVE, never PASS.
- Behaviour that may legitimately MOVE once the catalog loads (measure base vs fix, same tree, report both):
  `§ARC §LOD300-MATCH matched=` per resident (Terminal base 12 / 35,552), W-E2E-WALK-ALL, W-E2E-WALK, W-SAVE-COMPLETEIT,
  W-MEP-OPENPATH, W-WALK-GESTURE, W-MEP-REROUTE, W-BEND-FITTING. A moved number is reported, not silently re-pinned.
