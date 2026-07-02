# PROGRESS — Current Development State

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.

## Current State

**▶ 2026-07-03 — POS replenishment redesign + Kitchen Display + E-Invoice research done, mixed readiness.**
POS sale cycle (Order→Ship→Invoice→backflush) is genuinely real, dispatched via the shared archetype engine —
not the gap. The "replenishment drawer" IS the gap: reads real `m_replenish` policy (19 real seed rows) but
auto-commits on click with no staging/review, ignores `QtyBatchSize`, never routes inter-warehouse vs external
PO. POS also uses its own green-on-black palette, zero shared classes with the rest of the app (confirms
"rough" HMI). Kitchen Display: absent but well-scoped to build NOW (real `AD_InfoWindow` mechanism exists,
unused; `C_OrderLine` already has every field needed; `pos_lens.js` has a copyable JOIN precedent). E-Invoice:
stays blocked — deliberately gated behind an existing 7-box research gate in `RESUME_HR_BIM_ASSET.md`, not
just unbuilt. Full spec, staged design, Fable5/Opus assignment per thread:
`prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md`.

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
frameElement/clearGround). **✅ ARC anchor-placement bug FIXED+MERGED same day (W-MV-PARITY → PR #613, main 8449306):** `center_xyz`
is the IFC placement ANCHOR; fix = render-side `R·anchorOffset` at fold (`foldInsert §ARC-ANCHOR`), signed op-log
byte-identical. W-MV-PARITY 12/12 tolerances unchanged (T2/X1 18.03 m → ~1e-6 m); NEW standing witness
`witness_residents_anchor_sweep.js` 15/15 — all 5 residents by maths (Terminal 35552 @7.6e-6) + screenshots;
13-witness blast radius all green; **SampleCastle's floating fragments confirmed GONE** (that saga is closed).
Spec+closeout: `prompts/RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md`. Still open: (3) proximity-clustering-as-BOM
design call (user go-ahead needed, unchanged).
Spec: `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`.

**▶ MODELLER GUIDE (bim-compiler side) — ✅ FULLY DONE 2026-07-02, both threads closed, guide is now accurate+detailed.**
SC ARC screenshot embedded (3rd attempt, prior 2 retracted as premature — confirmed PR #598/#613 live on `main`
`8449306` independently: `witness_arc_editable.js` 10/10, `witness_e2e_mv_parity.js` 12/12, real-click capture
shows genuine detail — dormers/window frames/skylights, one isolated object traced by raycast to the scene's
`AxesHelper`, not a data defect). The other 21 §F2 frames: a concurrent bim-ootb session fixed the harness (PR
#608) and committed the 8 recaptures straight to `docs/img/modeller/` — found this mid-session while
independently recapturing the same 8 myself; eyeballed both sets (equivalent), reverted my redundant copies
rather than clobber already-committed work. **Full visual audit, all 22 frames opened and eyeballed one by
one** (not trusting witness-pass): all legible, close-ups actually zoom to the element, `insert-placed`/
`delete-gone` whole-building crops confirmed intentional (PR #608's own design split), not a defect. Also
brought Move/Scale/Rotate/Grid-Stretch/Delete's prose-only sections up to the same numbered-step format as the
rest of the guide. `mkdocs build --strict` exit 0, 22/22 image refs resolve. Detail:
`prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` (now archivable).

**▶ HR_BIM_Asset (bim-ootb Viewer) — §P10d + §P11 ✅ BOTH DONE+LIVE 2026-07-02** (PR #609/#611/#612, then
#614/#615). `lane/hr-overlay` merged to main — surfaced + resolved a real duplicate-lineage collision with
PR #592 (two independent sessions had built the same module; verified `lane/hr-overlay` was a strict superset,
kept its content). Live: real ContaCam CCTV still (6 distinct crops), animated per-sensor colored horizontal
bars (Bonsai federation/river-inspired, replaces static charts), fly-to-zone bug fixed (instanced/batched
meshes weren't resolved — same class of bug `setTint` already had fixed), pill tooltip fix (was showing
internal id). **§P11 ✅ DONE+LIVE (PR #614, main `5a83955`):** every pane showing a real AD-compiled record
(Dashboard Resources, Payslip lines, Leave unpaid entries, Tenancy subscriptions, IoT billing rows) now
deep-links into its real iDempiere window (`hba_lens.js erpLink()`+`AD_WINDOWS`, every id sourced from
`ad_full.db`, reusing `navigate_find.js`'s proven URL shape) — includes a mid-session user extension (Leave,
which has no native AD table of its own, links to the real "Leave without pay" `hr_concept` it feeds on
payroll instead). New `witness_erp_deeplink.js` 19/19, full 34-file HBA suite zero regression, live chromium
smoke on all 5 panes. Docs: `docs/HRBIMAssetGuide.md` gained the Payslip/Leave/Tenancy pane sections (never
documented before) + a "Jump straight to the ERP record" explainer, 5 new screenshots. Spec:
`prompts/RESUME_HR_BIM_ASSET.md` §P10d/§P11.

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
