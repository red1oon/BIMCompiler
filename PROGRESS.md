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

## Modeller §NEEDS-DESIGN batch (2026-07-03, watchdog→Fable5) — ✅ SHIPPED
- Items 1,2,4,5,6,7 (eye-toggle, filter→scene dim, auto-expand-on-pick, Outliner windowing+O(k) pick,
  selection edge outline, real shadows+perf guard) — bim-ootb **PR #625** MERGED; item 8 (floating drag
  dims) — **PR #627** MERGED. Spec+decisions+DONE log: bim-ootb `prompts/RESUME_MODELLER_POLISH3.md`.
  New witnesses 30/30 (OLVIRT/OLEYE/OLFILTER/SELOUTLINE/SHADOWS/FLOATDIM); regression 7 suites green.
- Item 10 DECIDED (user delegated): keep R=Insert; `T`=arm rotate ring, `S`=arm scale cubes (Move sub-modes).
  Ready to build — spec in `prompts/RESUME_MODELLER_COMPETITIVE_POLISH.md` §DECISIONS note, witness W-E2E-RSARM.
- OPEN (unassigned): item 9 PBR textures; SSAO (needs EffectComposer vendored); per-instance hide (§DECISIONS-2).

## Kernel op-log timebomb audit (2026-07-03) — 3-agent scalability/macro/security sweep
- Findings: `prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md` (13 defects, root cause: sound at op-CREATION,
  green-by-construction everywhere else → armed by success milestones). Batch-1 spec + full next-session plan:
  `prompts/KERNEL_HARDENING_BATCH1_SPEC.md`.
- ✅ T3 period-close DELETE gated behind confirmed archive (W-PCLOSE-ARCHIVE 10/10) + ✅ T6 multi-tab persist
  tip-guard + caller committed-checks (W-CROSS-TAB-PERSIST 9/9) — bim-ootb PR #623, erp sw v759, kernel v9→v10.
  Both red-before/green-after in node over the REAL kernel; poc_teams_phase_d 11/11 unchanged.
- ✅ T1 trust-root DECIDED by doctrine excavation (not fresh design): device-level central roster +
  ROTATE/REVOKE + burn-not-reattribute already in DistributedERP.md §228/§290/§445 + witnessed
  `scripts/poc_rotate.js`. Employee-attribution (PIN-as-metadata) split out as a separate question.
- ⛔ T4+T5 (unify 3 kernel copies) BROWSER-GATED — analysis done (neither copy is a superset), needs the
  W-ONE-KERNEL building-load smoke. NEXT LANE = **T2→T1** (node-verifiable, additive-canonical recommended) —
  execution plan in the batch-1 spec §NEXT SESSION. Deferred id-race retry + T7 scale cliff (~5k ops).

## Codebase quality audit (2026-07-02) — TRIAGED 2026-07-03
- ✅ §5 self-XSS fixed BOTH repos (bim-ootb PR #618 sw v758 + bc PR #20; W-XSS-FILENAME 10/10 + 5/5, incl. the
  download-link sink the audit missed) · ✅ §2 doc-vs-code drift fixed, every number re-verified (bc PR #20).
- ⛔ BLOCKED (user call): are `migration/DV_*_rules.sql` mined-rule files EXEMPT from append-only, or enforce?
- OPEN: §1 refactors (spec-first, Sacred file), §2 dead-code removal, §3 shallow specs 27/29 (bim-ootb).
  Full triage: `prompts/CODEBASE_QUALITY_AUDIT_2026-07-02.md §TRIAGE`.

## Archive — DONE/shipped (one-line pointers; detail in cards + memory topic files)
- Ninja Create two-way engine + live export — `prompts/NINJA_MODE_PILL.md # DONE`, W-NINJA-{EXTRACT,CALLOUT,EXPORT,EXPORT-LIVE} + W-ASSET-STATUS (bim-ootb PR #301/#309, sw v673/v681, 2026-06-14)
- Reflexive AD self-edit — W-AD-{OPLOG-DISTRIB,SELFEDIT,SELFEDIT-LIVE} (bim-ootb PR #312 sw v683, 2026-06-14)
- Odoo red-band fold-gap re-audit — W-ODOO-QWEB 41/41 to-the-cent; server actions honestly deferred; migrate_status_panel live (2026-06-14)
- Pre-2026-06-14 DONE items (21 lines) → `prompts/archive/PROGRESS_DONE_ARCHIVE_pre_2026-06-14.md`
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
