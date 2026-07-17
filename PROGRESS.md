# PROGRESS — Current Development State

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.

## Current State
**Gate:** `./scripts/run_RosettaStones.sh` — S190 fleet: 116/157 PASS, 4 ALL GREEN (BR,MO,RL,WI). 21 buildings. 9-gate system.
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

⏸ **PUSH PAUSE in effect (2026-07-11, until lifted)** — commit locally, verify on localhost, do
not push/open a PR unless the user explicitly lifts it for that session. `CLAUDE.md` §⏸ PUSH PAUSE.

## OPEN — to be assigned to sessions (user dispatches from this list, check before starting cold)
- `prompts/RESUME_ERP_POST_TAIL_AND_USERGUIDE.md` — §A (Cash/Inventory) CLOSED 2026-07-18, see Archive;
  §B (ERPUserGuide navigation + core S&D-flow chapter) still open on this branch.
- `prompts/RESUME_HR_BIM_ASSET.md` §2026-07-06c — A/B/C bugs + E decision.
- `prompts/RESUME_WORLD_HISTORY_DEDUP_RESTORE.md` §2026-07-06 — G6, Ph3, Pt1 parked.
- `prompts/PILL_DRAWER_REORGANIZATION.md` — first-touch flicker.
- `prompts/OPEN_BUTTON_IFC_BCF_MERGE.md` — not started.
- DiscWalk: `prompts/Modeller/DISC_Walker/RESUME_DISC_WALKER_ENVELOPE_BOUND.md` §STOREY-UNKNOWN
  (source of truth) + `DISC_WALKER_BRANCH_CLOSEOUT.md` (3 stale PRs #722/#724/#725 + guide-
  screenshot camera bug). Do NOT re-attempt `_hostAxis` swap or R-DOOR-SCORE (both disproven).
- `prompts/SPARSE_WALL_ROOM_INFERENCE.md` Phase 1 — sparse-wall fusion (HHS), 4-step follow-up.
- `prompts/Modeller/DISC_Walker/XRAY_FIXTURE_CLASSIFICATION_FIX.md` — SampleCastle walls
  misclassified as glowing fixtures, root-caused, POC-gated.
- `prompts/FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md` — HHS's 2 remaining islands (storey='Unknown').
- `prompts/ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md` §25 — large-group Find-panel filter-cheap opt;
  §14 — Hospital's real per-tab-switch number never captured (263MB DB wouldn't stream in sandbox).
- `prompts/PHOTOREAL_STILL_RENDER.md` — Time Machine high-quality movie export, explicit
  next-session ask, not started.
- HBA IoT items 1/2/0 (CCTV double-click, camera-POV fly-to ⛔ needs facing vector, mobile
  card-stack) — `prompts/RESUME_HBA_MOBILE_CARD_STACK.md` (bim-ootb).
- Held (prove smallest piece first): Modeller prefab dialogue — `prompts/PREFAB_LASSO_MACRO_LIBRARY_DIALOGUE.md`.
- Kernel op-log T4+T5 (unify 3 kernel copies) — BROWSER-GATED. `prompts/KERNEL_HARDENING_BATCH1_SPEC.md §STATUS`.
- Modeller onboarding — Hospital/Clinic/LTU/HHS_Office + SH/DX/SC into `IFC/`. `prompts/ARC_GEO_FETCH_SPEC.md §NEXT` item 2.
- ⛔ BLOCKED: `migration/DV_*_rules.sql` EXEMPT from append-only, or enforce? `prompts/CODEBASE_QUALITY_AUDIT_2026-07-02.md §TRIAGE`.
- Modeller polish: PBR textures (item 9); SSAO (needs EffectComposer). ARC occupancy drift (99%→92-95%,
  `W-DW-DENSITY-TE` D3) unexplained, low-priority — `project_arc_meshreadpixels_branch_unmerged.md`.

## Archive — DONE/shipped (one-line pointers; detail in cards + memory topic files)
- ✅ B-3 + W-POST-TAIL posting oracles (2026-07-17/18, Fable 5) — 6 G-seed classes + BankStatement/
  MatchPO/Requisition `maxDiff=0c`; ledger 43→52; 17/20 posters fold; Cash/Inventory next, Production ⛔.
  `prompts/FABLE5_B3_POSTING_ORACLE.md` + `prompts/HARDEN_MATRIX.md §W-POST-TAIL`.
- ✅ §W-POST-TAIL-2 Cash/Inventory CLOSED (2026-07-18, Sonnet) — drove the REAL posters on a fresh
  scratch clone over the 5 real remaining docs: BOTH C_Cash docs are `IsActive='N'` (CannotPostInactive-
  Document); 2/3 M_Inventory drafts have zero lines (`@NoLines@`), the 1 completable draft has no cost
  data anywhere (`"No Costs for TShirt - Red Large"`). Neither worked around (data mutation on existing
  docs, out of scope). Ledger STAYS 52/17-of-20 — Cash+Inventory join Production as named ⛔, each
  precisely cited, none a placeholder. `prompts/HARDEN_MATRIX.md §W-POST-TAIL` (§W-POST-TAIL-2 band).
- ✅ 2026-07-10 marathon branches (2026-07-17 verify) — `fix/grid-tilt-guard`, `fix/dw-rot-units`,
  `fable/dwprobe-dedup`, `fix/terminal-oracle-source` all confirmed fully superseded (exact fix
  content already verbatim on main via other commits) and pruned, local+origin, bim-ootb.
- ✅ FLY_TOUR + walker translation-invariance cure chain (2026-07-16/17) — PRs #812,#815,#832-#835
  merged+Pages-deployed; §WALKER-PHASE-SENSITIVITY resolved. `prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`.
- ✅ Photoreal staffage + BimWhale ground fix (2026-07-17) — local only (PUSH PAUSE). `prompts/PHOTOREAL_STILL_RENDER.md`.
- ✅ LTU krn-persist readonly-ops fix, LIVE (PR #808). `prompts/MOBILE_PERF.md`.
- ✅ Room Lens §14/§26 (2026-07-15/16) — x-crossing, bbox threshold, door markers, §26 texture-
  serialization hang fixed LIVE (PR #811). `prompts/ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md`.
- ✅ Room Lens taxonomy + island-bridge (2026-07-15) — Clinic 71.8%→95.7%, HHS 49.4%→85.2%
  connected (PR #794/#795).
- ✅ DiscWalk containment (2026-07-12/13) — Bug A/B, D3/D4/D4b, storey='Unknown' substrate() fix.
  §TE-ARC-DATUM + §LIVEWIRE closed.
- ✅ Modeller glass parity + guide-quality pass (2026-07-13) — PR #735.
- ✅ Building Parts Taxonomy — `prompts/BUILDING_PARTS_TAXONOMY.md`.
- ✅ MANAGER housekeeping (2026-07-11/13) — stale branches/worktrees pruned.
- ✅ pending merge only: `SCALE_AND_UX_SWEEP.md` (#665), `OFFLINE_GITHUB_RELEASE_BUNDLE.md` — human merge click.
- 2026-07-05 arc (Save/Open, grid, Teams E2E, HBA mobile, UBBL) — ALL MERGED (#654-664).
- Pre-2026-07-05: `prompts/archive/PROGRESS_DONE_ARCHIVE_pre_2026-07-05.md` / `_pre_2026-06-14.md`.
  Viewer S-series/DAGCompiler: MEMORY.md "Project — Shipped".

## OCI Deployment
- Live: `bim-ootb-live` (SYSNOVA landing + viewer + single DBs). Always upload here.
- Single DB per building: `buildings/{Name}_extracted.db` (metadata + geometry + bbox).
- `deploy/sandbox/` stale (last ~S225) — not used for deploy. `deploy/dev/` is canonical.
- Deploy SOP: `deploy/OCI_UPLOAD.md`

## Reference
- Docs site: https://red1oon.github.io/BIMCompiler/
- Academic paper: `docs/SPATIAL_COMPILATION_PAPER.md`
- OCI setup: `internal/OCI_SETUP.md`
