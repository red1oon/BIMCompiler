# PROGRESS — Current Development State

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.

## Current State

**▶ GEOMAPPING (IFC→BOM classifier) — ✅ LANE CONCLUDED 2026-07-02, foundation fix + verification pass same day.**
All 3 tiers + Rung-1 rooms (21/21 IoU ground-truth Duplex) + graph-context alias layer (mining + runtime),
all shipped/wired/witnessed (bc PR #12–#18, ootb PR #600–#603+#605). Corpus = SH/DX/SC/Terminal/Clinic/Hospital/
HHS, **every building's sidecar GUID join now measured 100.0%** — HHS was re-mined off the weak 69%-join
`Ifc4_Revit_MEP.ifc` onto the 6 `opensourceBIM_HHS_Office_*.ifc` files (100.0%, 6,871/6,871), alias_map.json
re-mined on the corrected foundation (HHS's LOBO sample grew 4,718→6,726 elements, same 99.7% recovery rate),
zero regression on the other 6 buildings (bit-identical bands). §ALIAS-SPEC's runtime half (`alias()` + IFC2x3→4
rename table in bim-ootb `classify_geom.js`) was checked and found already shipped (PR #603) — re-verified GREEN,
not re-implemented. Item 5 (topology-transfer cross-building spike) deliberately deferred to the RosettaStone
graph-hypothesis thread, not duplicated here. Spec: `prompts/RESUME_IFC_BOM_GEOMAPPING.md`.

**▶ MODELLER (bim-ootb) — LOD400 real-geometry, Walk-All-Disciplines, §STRETCH-RIDE all ✅ DONE+LIVE 2026-07-02**
(PR #598/#599/#604). Evening session same day closed the two follow-ups: (1) **Terminal-scale perf-guard ✅ PR #606
MERGED** — real 35,552-mesh run proved the 50k guard never fires + the flash blew its 1.2s budget 33× (39.3s);
fixed (rAF time-budget + chain group-commit), standing witness `witness_e2e_walkall_terminal_scale.js` 6/6;
(2) **guide-frame framing ✅ PR #608 MERGED + guide LIVE** (8 frames recaptured+eyeballed, harness clamp/wall-pick/
frameElement/clearGround). **⚠ NEW PROVEN BUG (W-MV-PARITY, PR #610): the ARC-seed misplaces elements — `center_xyz`
is the IFC placement ANCHOR (proven cross-extraction to 1.4e-5 m), but `real_geometry.js recenter()` seats the blob's
AABB centre on it → Duplex 253/265 elements >0.5 m off, max 18.03 m; Viewer renders the same file correctly; LOD400
tri-parity itself is perfect (253/253, 1119/1119). Witness deliberately RED on T2/X1 until fixed. FIX = fresh session,
spec `prompts/RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` — likely also the real cause of SampleCastle's floating
fragments.** Still open: (3) proximity-clustering-as-BOM design call (user go-ahead needed, unchanged).
Spec: `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`.

**Gate:** `./scripts/run_RosettaStones.sh` — S190 fleet: 116/157 PASS, 4 ALL GREEN (BR,MO,RL,WI). 21 buildings, 9-gate system.

| PFX | EL | GATES | Notes |
|-----|----|-------|-------|
| BR | 33 | 9/9 | ALL GREEN |
| MO | 2791 | 9/9 | ALL GREEN |
| RL | 1 | 9/9 | ALL GREEN |
| WI | 1 | 9/9 | ALL GREEN |
| DX | 1169 | 8/9 | MetadataMissing (IfcOpeningElement) |
| SH | 65 | 8/9 | MetadataMissing (generative MEP) |
| TE | 48428 | 8/10 | C8 mesh diversity, GEO no pairs (federated) |

**Pipeline:** 11 stages. 77 verbs. 7403 products (ERP.db). 4-DB architecture.

## Archive — DONE/shipped (one-line pointers; detail in specs + memory topic files)
- Modeller VISION-LOCK arc: §ARC-1 editable substrate → §SDG-CASCADE ride → §GATE-1 RED/ORANGE conformity →
  §STRETCH-1 grid-stretchable, all DONE+LIVE 2026-06-29 (bim-ootb PR #571/#573/#574/#575) — `prompts/RESUME_ARC_EDITABLE_SUBSTRATE.md`, `prompts/RESUME_MODELLER_CONFORMITY_GATE.md`, `prompts/RESUME_ARC_STRETCHABLE.md` → [[project_arc_editable_substrate]]
- Terminal §8E TE-walk suite complete (ARC/STR-canopy/MEP-density/clash/GREEN-report), cross-building held-out
  generalization (LTU_AHouse 0.839 precision), route-to-FACE ACMV fix, ELEC host-bind anti-float — all DONE
  2026-06-29/30 (bim-compiler + bim-ootb `lane/arc-mesh-readpixels`) — `prompts/WALKER_GUARDS_ROSETTASTONE_SPEC.md` → [[project_terminal_rule_mining]]
- SEED→3D corridor trunk (engine+render-gate+animation) DONE+LIVE 2026-06-30 (bim-ootb #580/#582/#583) — `prompts/RESUME_SEED_TRUNK.md`
- disc-walker density-fix (area-scaled counts, LANDED-tube/GENERATED-cube render split, offline IDB cache) DONE+LIVE
  2026-06-28 (bim-ootb #558/#559/#560/#562) — `prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md`
- Modeller editor + Outliner polish backlog → ZERO except user-gated #3b solid-scale (deferred, occt-wasm kernel
  rework needed) — 2026-06-28 (bim-ootb #562–#570) — `prompts/RESUME_MODELLER_POLISH.md`
- Modeller FIRST-CLASS real-user E2E gates + Walk-tool IDB-hang/112s-freeze fixes DONE+LIVE 2026-07-01 (bim-ootb
  #584 sw v25) — full E2E suite (INSERT/SCALE/ROTATE/SKETCH/ROUTE/etc.) still IN PROGRESS, `modeller/tests/E2E_SUITE_RESUME.md` → [[project_modeller_vision_lock]] [[feedback_test_real_user_path_not_seams]]
- SC (Schependomlaan) IFC2BOM onboarding 2/4→7/10 gates, BOM-cascade-as-modelling-grammar vision banked —
  2026-06-23 — `prompts/MODELLING_FROM_BOM_CASCADE.md`
- Benchmark & Clash-Resolution lane — Phase A DONE (bench_suite.html LIVE, IfcClash/pick/rich-clash measured);
  Phase B-F NOT STARTED, A2 full-stack iDempiere blocked on missing REST plugin — `prompts/BENCHMARK_AND_CLASH_RESOLUTION_LANE.md`
- TM 4D/5D variance + 360 loop/kanban/pivot/shopfloor S-curve LIVE 2026-06-21 (bim-ootb #462) — `prompts/TM_4D5D_VARIANCE_LANE.md`
- Ninja Create (PackOut/PackIn) two-way engine + export + live DOM SHIPPED 2026-06-14 (bim-ootb #301/#309)
- Reflexive AD self-edit (dictionary edit → live repaint, no reload) SHIPPED 2026-06-14 (bim-ootb #312)
- Odoo red-band fold-gap re-audited, server actions confirmed not a code gap — 2026-06-14
- AD_Process FOLD lane — P1 GeneratePO + P2-leg1 GenShipment DONE/LIVE 2026-06-17 (bim-ootb #352/#355); NEXT
  (unstarted) = C_Invoice_Generate (proc 119)
- POS gap-close banked — `prompts/POS_GAP_CLOSE.md # DONE` (2026-06-12g2)
- WH×POS pick lane BUILT, live-verified — `prompts/WH_POS_PICK_LANE.md # DONE` (2026-06-13)
- Multi-lane WAVE 2+3 — `prompts/MULTI_LANE_LAUNCH.md`, `prompts/MULTI_LANE_WAVE3.md # DONE` (2026-06-12)
- MIGRATE_POSTING_CONFIG — bim-ootb PR #271 sw v653, IDB ad_seed_v15 (2026-06-12b)
- POS lens addon §P-1..§P-4 — `prompts/POS_LENS_SESSION.md # DONE` LIVE (2026-06-12)
- ERP backend-gap arc + backend lane DATA/ENGINE-SEAM — `prompts/ERP_BACKEND_GAP.md` (2026-06-03/09)
- Lens-family doctrine + FRONTEND Accts-Posted lens + iDempiere Renderer #1 + LENS lane-3 chrome fleet — PR
  #82/#83/#84/#92/#94, sw v560/v565, LIVE (2026-06-02/03)
- STEP-0 §SEAM-FROZEN host conformance, Migrate ShowMe + ERP folder home — LIVE (2026-06-02/03)
- Engine POST plugin §13.1 accounting genome PROVEN (2026-06-02) → [[project_glassbowl]]
- ERPMaker/AnyAppMaker docs + Odoo fold source (2026-06-02) → [[project_erpmaker]]
- Holy Grail doc + falsifier POC prompts + MIT license sweep (2026-06-01)
- ERP Secured/Distributed doctrine + 6-witness POC suite + W-CHAIN live (2026-06-01) → [[project_erp_secured_phase]]
- Glassbowl engine-as-data explorer + lifecycle chain + orbit viz — `docs/GLASSBOWL{,_DOSSIER}.md`, LIVE → [[project_glassbowl]]
- Viewer S-series (S188–S286): browser viewer, DLOD, mobile perf, find/nav, multi-format import, cinematic — see MEMORY.md "Project — Shipped"

## OCI Deployment
- Live: `bim-ootb-live` (SYSNOVA landing + viewer + single DBs). Always upload here.
- Single DB per building: `buildings/{Name}_extracted.db` (metadata + geometry + bbox).
- `deploy/sandbox/` stale (last ~S225) — not used for deploy. `deploy/dev/` is canonical.
- Deploy SOP: `deploy/OCI_UPLOAD.md`

## Earlier Work (compressed)
- **S200-S210:** BIM OOTB browser viewer, OCI deployment, BOQ charts, health checks
- **S195-S198:** Direct DB streaming (replaced Blender .blend pipeline)
- **S188-S193:** RTree, nD engine, DLOD — all Blender-era, superseded by browser viewer
- **S165-S186:** GN instances, chunked loading, cockpit UI — GN HALTED, RTree won
- **2D Layout:** Phase A closed, Java pipeline 5/5, 13/13 conformity. Browser DXF viewer (S236).
- **DAGCompiler:** S190 fleet 21 buildings. S104 IFCtoERP complete.

## Reference
- Docs site: https://red1oon.github.io/BIMCompiler/
- Academic paper: `docs/SPATIAL_COMPILATION_PAPER.md`
- OCI setup: `internal/OCI_SETUP.md`
