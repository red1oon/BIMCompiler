# PROGRESS — Current Development State

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.

## Current State

**▶ 2026-07-03 — POS/Kitchen lane: Fable5 threads ✅ SHIPPED (bim-ootb #617 + bim-compiler #19 both MERGED).**
Kitchen Display BUILT: queue = FOLD over the op log (open C- deliver-later shipments, oldest-first), serve =
pos_core's own `completeShipmentOps` — zero new business verbs; `kitchen_core.js` (truth: `build/erp/`,
mirror: bim-ootb `erp/`) + `kitchen_lens.js` + pill (pos-station gated) + sw v757. Witnesses W-KDS-QUEUE
12/12 + W-KDS-LIVE real-user path (ring→deliver-later→ticket qty-maths→Serve chainOk=Y→empty) + W-POS-LIVE
regression PASS. POS HMI restyled onto the app slate/blue baseline (109 token swaps, all extracted; replenish
rows now 12px stylesheet classes). STILL OPEN on this lane: Thread-1 steps 1-5 (staged replenishment
review + QtyBatchSize + PO-vs-Move routing — Opus, spec ready in §DESIGN) · Thread-3 E-Invoice ⛔ behind the
7-box research gate. Spec + closeout: `prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md`.

**▶ 2026-07-03 — Modeller competitive-polish: §FABLE5-NOW ✅ ALL 10 SHIPPED (bim-ootb PR #616 merged).**
Outliner⇄canvas made symmetric (hover both ways, multi-select tints + ctrl-click rows), geomap seed-audit
surfaced, typed Rotate/Scale inputs, gesture undo (stretch+riders = one Ctrl+Z, arcseed can never mass-undo),
collapse persistence, dead-click toast, help panel — six new witnesses green incl. W-GRID-NUMERIC 6/6 which
MEASURES grid-alignment accuracy for the first time (0–208.5mm vs 300mm tol on 3 real buildings). STILL OPEN
from the research: §NEEDS-DESIGN band (keystone = per-instance pick identity for walked InstancedMesh) + real
BCF file interop — both need Sonnet scope calls first. New witnessed finding for that pile: GEOM_SCALE folds
LOCAL-axes while cube handles/preview are world-aligned. Research spec:
`prompts/RESUME_MODELLER_COMPETITIVE_POLISH.md`; implementation spec: bim-ootb
`prompts/RESUME_MODELLER_POLISH_BATCH.md`.

**▶ 2026-07-03 — HBA ERP-governed-display research done, DECISION PENDING.** User wants pane display (not just
§P11's deep-link target) to derive from a real iDempiere chain (HHS↔`M_Warehouse`, personnel↔`C_BPartner`↔
`AD_User`). Live-verified: `HR_Employee` has zero rows anywhere — seed-data gap, not a code gap. Full spec +
3 open questions + staged plan: `prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md`. Do not start building until the
open questions are answered.

**▶ 2026-07-02 NIGHT — watchdog quality-review pass across all 4 lanes below.** All hold up structurally (no
TODO/FIXME, no silent-degradation, no invented claims) but each has 3-6 small polish/coverage gaps + one real
open design call. Findings + Fable5/Opus/Sonnet assignment logged in each lane's own §FOLLOWUP/§NIGHT section:
`prompts/RESUME_IFC_BOM_GEOMAPPING.md` §FOLLOWUP-POLISH, `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`
§NIGHT (top), `prompts/RESUME_HR_BIM_ASSET.md` §NIGHT (bottom), `prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md`
§NIGHT (reopens that card — was marked archivable, now isn't until its 6 items land).

**▶ MODELLER (bim-ootb) — one genuinely-open design call:** proximity-clustering-as-BOM (window-as-assembly),
user go-ahead needed. The LOD400/Walk-All/anchor lane itself is ✅ concluded (see Archive).

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
- GEOMAPPING lane ✅ CONCLUDED 2026-07-02 — 7-building corpus ALL 100% GUID joins (HHS re-mined off the 69% MEP file), alias layer mining+runtime shipped (bc #12–#18, ootb #600–#603+#605) — `prompts/RESUME_IFC_BOM_GEOMAPPING.md` → [[project_ifc_bom_geomapping]]
- Modeller LOD400 real-geometry + Walk-All + §STRETCH-RIDE + Terminal perf-guard (#606) + guide frames (#608) + ARC anchor fix (#613, W-MV-PARITY 12/12, anchor-sweep 15/15, SC floating fragments GONE) ✅ 2026-07-02 — `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`, `prompts/RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md`
- Modeller GUIDE ✅ FULLY DONE 2026-07-02 — all 22 §F2 frames eyeballed, SC ARC shot embedded, prose sections numbered, mkdocs --strict 0 — `prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md`
- Modeller competitive-polish §FABLE5-NOW 10/10 ✅ 2026-07-03 (bim-ootb #616; W-GRID-NUMERIC measures grid accuracy) — bim-ootb `prompts/RESUME_MODELLER_POLISH_BATCH.md` → [[project_modeller_competitive_polish]]
- HR_BIM_Asset §P10d + §P11 ✅ DONE+LIVE 2026-07-02 (#609–#615) — all 5 HBA panes deep-link real iDempiere windows, witness_erp_deeplink 19/19 — `prompts/RESUME_HR_BIM_ASSET.md` → [[project_hba_compile_not_model]]
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
