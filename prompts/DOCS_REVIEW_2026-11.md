# ⚠ DO NOT REMOVE — Public docs review, 2026-11 (scope + rules)

**Scope:** every page published to https://red1oon.github.io/BIMCompiler/ from `docs/` (the `mkdocs.yml` nav +
the not-in-nav pages mkdocs still builds). `docs/archive/` and `docs/internal/` are excluded from the site and out
of scope. Work on branch `docs/review-2026-11` (worktree `/tmp/wt-docs-review`). Publish ONLY via
`scripts/safe_gh_deploy.sh` (`prompts/DOCS_DEPLOY_POLICY.md`). **Read the build log + the deploy log after every run.**

User ask (2026-11-03): *"Do a documentation review, update to latest, remove stale, and even revamp where needed.
Focus on what is published at Github.io as from docs/ here."*

## §1 Baseline (measured 2026-11-03, `mkdocs build`, log in session scratchpad)
- Build exit 0, **34 WARNING** (broken links: 27 in `LAST_MILE_PROBLEM.md`, 2 `PROJECT_CHRONOLOGY.md`,
  1 `SpatialCompilationPaper.md`, 4 `VibeProgramming.md` — all point at files moved to `docs/archive/` or
  `docs/internal/`, or deleted) + **4 INFO** missing anchors (CivilWorksGuide, HRBIMAssetGuide ×2, WhatsNew).
- **5 pages built but not in nav:** DXF2BIM_BASIC_SHAPES_SPEC, DXF2BIM_SPEC, ERP_PROJECT_REVIEW,
  NinjaExcelReport_UserManual, ReplicationFlowRows.
- `WhatsNew.md` last entry **2026-08-16**; bim-ootb has shipped releases 1.8x → **1.84.0 (2026-10-31)** since,
  plus Team mode, DXF2BIM, Regulatory Report, Load Summary, CAPEX dashboard work.
- 25 pages last touched 2026-07-03 (a bulk pass) — the most likely to be stale.
- Live `gh-pages` holds `halal/`, `HalalTrace/` from branch `docs/halaltrace` (PR open, not on master) — must be
  carried into the deploy tree (not committed) or the guard aborts. Same for the gitignored `glassbowl_data.db`.

## §2 Rules for the review (what each fix may and may not do)
1. **Objective fixes are applied:** broken links/anchors; facts contradicted by current bim-ootb `origin/main`
   (counts, versions, shortcuts, menu names, URLs, "not yet / planned" for things that shipped, "works" for things
   retired); dead pointers. Every changed fact traces to a bim-ootb file:line, PR number or CHANGELOG line — cited
   in the change report, not invented. User guides carry user facts, not developer journal notes (owner's
   readability pass on BIMUserGuide, bim-compiler #265).
2. **Remove stale:** content describing a feature that is verifiably gone or superseded is deleted (or replaced by
   the current fact). Each removal listed in the report with its evidence. **Whole-page retirement is proposed,
   not done.**
3. **Revamp = proposal first** (`feedback_propose_before_editing_docs`): structure, nav, titles, tone are written
   up in §4 for the owner's go; not applied ahead of approval.
4. Voice of `MigrateComparisonPaper.md` is deliberate — do not flatten it. `SpatialCompilationPaper.md` is a
   priority-dated published paper — links only.
5. A link to a doc that lives only in `docs/archive/` or `docs/internal/` is repointed to its GitHub blob URL
   (`https://github.com/red1oon/BIMCompiler/blob/master/docs/...`) if the file exists there, else removed.

## §3 Results (2026-11-03)
**Build after review: exit 0, 0 WARNING (was 34), 0 missing-anchor INFO (was 4).** 37 files, +563/−402.
Seven review agents (one per nav cluster), each fact checked against bim-ootb `origin/main` 342fb4eb; spot claims
re-verified by hand before publishing (Schedule Editor deleted — `viewer/tm_panel.js:209-217`; Red Pill button
unwired — `viewer.html:396,450` hide `#doc-btn`, nothing creates it; c_order 8→56 — bim-ootb `1dffb397`).
- **Links:** all 34 broken links (LAST_MILE_PROBLEM, PROJECT_CHRONOLOGY, VibeProgramming, SpatialCompilationPaper)
  + 5 in HTML pages (FoldEngineBlackBook, ERPConceptRosetta) repointed to the archive/internal GitHub blob; 6 anchors fixed;
  2 dead external URLs fixed (Bentley SYNCHRO, TheRosettaStoneStrategy).
- **What's New:** backfilled 2026-08-16 → 2026-11-02 (~50 user-visible items, releases 1.54–1.84); dev tags stripped.
- **Front door:** index.md map + USER_GUIDE cards link DXF2BIM, Civil Works, Teams, What's New.
- **Stale facts fixed:** Modeller Export menu (3 → 8 items), Team pill/Team mode, rail open by default, LOD400-only walks;
  Teams overlay is Modeller+ERP only (not Viewer); clash rules 12 → 18, BCF shipped; Schedule Editor + ✎ removed →
  Gantt drawer; navigate.js split; Viewer drawer rows + Alt+G/J/P; Ninja export live; Aging built; Scriptor built;
  kernel_ops sharing built; precache 109 → 173; locales 15 → 18; release 1.84.0; `deploy/dev` paths → bim-ootb paths.
- **Removed stale:** dev-journal notes in user guides (witness names, dated fix histories), dead RESUME pointers, the
  SampleCastle box-fallback paragraph, unverifiable "500KB"/"~49MB" size claims, server-only 4D/5D next steps.
- **Regenerated:** DXF2BIM_FORMAT.md (`modeller/tools/gen_format_doc.js`: registry 43 → 65, `@WALLMIN`). Yellow list current.

**Flagged stale, not fixed (needs a re-measure, not a guess):** ArchitectureOverview counts (sw versions, commits,
witnesses — dated 2026-09-28); MigrateComparisonPaper surface/LOC counts; HolyGrail figures (2026-09-03);
MANIFESTO/StrategicPositioning gate numbers (21 buildings, 116/157); FeatureComparison catalogue/perf tables;
ModellerGuide walk/clash tables; ERPUserGuide roadmap table (2026-06-12); BIMtoProject status block;
AboutMore folder/architecture/size sections (deploy/dev era); NinjaExcel manual cites a missing `run_all.sh`.

## §4 Revamp proposals (awaiting owner go)
1. **Nav orphans:** add NinjaExcelReport_UserManual under *The 3 Apps* (after its dev-gate lines are reworded); move
   DXF2BIM_SPEC, DXF2BIM_BASIC_SHAPES_SPEC, ERP_PROJECT_REVIEW to `docs/internal/` (internal specs/audit; repoint
   DXF2BIMGuide's developer link); keep ReplicationFlowRows (generated, engineer-facing) off nav, linked from DistributedERP.
2. **History group:** PROJECT_CHRONOLOGY, VibeProgramming, 4DGenerator, EnablingTechTimeline, LAST_MILE_PROBLEM,
   BIMERPPaper, SYSTEMS_INSTALLER_GUIDE (legacy Java), RED_PILL (origin story) → a *History & Legacy* nav section.
3. **Split guide vs evidence:** ModellerGuide, BIMUserGuide (Cinema + silent bake → subpages), ERPUserGuide (roadmap +
   appendix out), 4D5DAnalysis (Python engine → dev docs).
4. **One Team entry point:** a short *Team mode* section in USER_GUIDE pointing at the live Team guide
   (bim-ootb `erp/team_guide.html`); TeamsOverlayGuide stays as the ALPHA demonstrator.
5. **One-pass re-measure** of the dated numbers in §3 "Flagged", ideally from one generated facts file.
6. **Overlap:** trim SpatialERP_OOTB to concept; SpatialERPIntegration as the single three-surfaces map;
   MANIFESTO (philosophy) ↔ TwoAppsOneKernel (evidence) reciprocal pointers; BIMtoProject rewritten as a user page.
