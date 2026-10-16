<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — SPEC §COLOR-PARITY: the Modeller paints each element's real IFC colour (MODELLER_MASTER row 11)
SCOPE: bim-ootb `modeller/arc_editable.js` colorFor(). Read the log after every run. Spec 2026-09-26 before code.

## State (main)
`arc_editable.js:292` stamps `color: colorFor(cls)` = a per-CLASS cosmetic PALETTE; only alpha is read from
`elements_meta.material_rgba` (§MAT-PARITY Task 1). The Viewer's rule (`viewer/streaming.js:1500-1510`, §S265c "Trust IFC
data"): `material_rgba` present → its r,g,b; NULL → the class fallback. Both apps set `THREE.ColorManagement.enabled=false`
(`modeller.html:357`, Viewer loader), so a hex built from the 0–1 floats equals the Viewer's `new THREE.Color(r,g,b)`.

## Change
`colorFor(cls, rgba)`: a parseable "r,g,b[,a]" with finite r,g,b in [0,1] → `round(255·c)` packed hex; else the PALETTE
(unchanged NULL fallback). `§COLOR-PARITY building=… real=N palette=M` logged once per seed. Re-opening an already
persisted building is unaffected (seed idempotency is keyed on the gid — its old rows stand).

## Witness W-COLOR-PARITY (`modeller/tests/witness_e2e_color_parity.js`, real Open of Duplex and HHS)
- C1 REAL — every seeded mesh whose element has a `material_rgba` renders that colour (±1/255 per channel).
- C2 FALLBACK — every element with NULL rgba keeps its class PALETTE colour.
- C3 NOT-VACUOUS — ≥1 real-colour element per building AND ≥1 whose real colour differs from its PALETTE colour
  (else the check proves nothing — INCONCLUSIVE).
- C4 GLASS — the §MAT-PARITY opacity still holds (Duplex windows opacity 0.1).
Regression: witness_glass_parity_e2e, W-E2E-WALK-ALL, W-SAVE-COMPLETEIT, smoke_arc_only (base vs fix).
