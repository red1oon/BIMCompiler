# Java Era (Bonsai / pre-April 2026) — FOSSIL STATUS + what was mined from it

**Status (2026-07-10, user-directed): DEPRECATED as runtime, PRESERVED as fossils.**
The Python+Java pipeline (IFCtoBOM → DAGCompiler → RosettaStoneGateTest) is not developed
further. The current framework is SQLite-WASM, browser-native, no server, no install. The
fossils stay untouched in place — they are part of a complete suite and their traceability
matters; make copies before any experiment, restore originals after.

## Why the fossils still matter (verified 2026-07-10, not nostalgia)

The Java generative MEP placer SOLVED fixture-placement "geometry hell" in Oct–Dec 2025.
Re-verified end-to-end this session in an isolated worktree: a real SampleHouse compile
placed **43 devices (LIVING 15 + BEDROOM 9 + CORRIDOR 19), 0 breaches**, and the schedule
math (`SpaceScheduleDAO.resolveQty` over `ad_space_type_mep_bom` × real room dims)
reproduces that count exactly. That measured data + those semantics were **mined into the
JS walker** (see below); the Java code itself is now a reference dictionary, not a dependency.

## What was mined OUT (lives in the JS era now)

| Java source | JS destination | Proof |
|---|---|---|
| `ad_space_type_mep_bom` (188 rows) + `ad_placement_offset` | `rule_space_schedule` etc. in `build/duplex_rules.db` via `build/project_rule_space_schedule.py` (residential class ONLY) | `scripts/witness_rule_space_schedule.js` 6/6 |
| `resolveQty` / `computePosition` / `distributeInstance` / FLOOR half-height lift / co-location spacing semantics | `placeSchedule()` in `build/disc_walker.js` (`dwWalk {schedule:true}`) | `scripts/witness_dx_walkback_rsgt.js` 10/10 |
| Generative-device LOD400 mesh bindings (product → geometry_hash) | stamped per schedule row; meshes remain in `library/component_library.db` (`component_geometries`) | W4 LOD400 check |

Per-instance MEP **routing** geometry (real pipe rotations/lengths) is NOT in the catalog —
it lives in `build/Duplex_mep_extracted.db` `element_transforms` (Duplex only; Terminal has
no real MEP ground truth). Point any future routing-geometry work there.

## Known breakage at repo HEAD (found 2026-07-10, deliberately NOT fixed on master)

The extraction front-half fails for EVERY building at HEAD (shared-tree logs 2026-07-07/09
show the same): committed `library/component_library.db` lost its `M_Product` table
(revert commit `187c6f5af`) and the generative LOD mesh type-rows; `restore_generative_meshes.py`
crashes on the `ad_geometry_map` → `I_Geometry_Map` rename. **Recipe that made a fresh
worktree fully green (SH 9/9 gates), if the Java oracle is ever needed again:**

1. `./scripts/rebuild_erp.sh` (ERP.db/disc_patterns.db is a regenerated artifact — 12KB stub in a fresh checkout).
2. Restore `M_Product` (38,663 rows) into component_library.db from `library/component_library_pre_s173.db` (ATTACH + CREATE TABLE + INSERT).
3. `ALTER TABLE ad_geometry_map RENAME TO I_Geometry_Map; CREATE VIEW ad_geometry_map AS SELECT * FROM I_Geometry_Map;`
4. Copy gitignored inputs from a live checkout: `DAGCompiler/lib/input/*_extracted.db`, `deploy/buildings/Clinic_extracted.db`, `HHS_Office_Federated_extracted.db`.
5. `python3 scripts/restore_generative_meshes.py` (14/14 device meshes restore).
6. `./scripts/run_RosettaStones.sh classify_sh.yaml` → 9/9.

This was executed in the (disposable) `/tmp/wt-fable-g1count` worktree; **nothing was
committed over any fossil file**.
