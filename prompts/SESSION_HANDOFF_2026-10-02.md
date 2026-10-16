# ⚠ DO NOT REMOVE — SESSION HANDOFF 2026-10-02 (bim-compiler-19 closeout, red1 shutting down)
SCOPE: where everything stands so a fresh session resumes without re-deriving. Every line points to the file that owns the detail. Read the owning file's log/§ before acting; do not trust this summary over it.

## 1. RUNNING WHEN THE MACHINE WENT DOWN
- Alt+C Hospital_silent full bake (`/tmp/wt-fastbake/cli_silent_bake.js`, 24 fps, queue per `prompts/ALTC_FOUNDATION.md` §1 RESUME). Shutdown kills it; check `/tmp/bake_Hospital_silent_2026-10-0*.log` tail for `§CLI_BAKE_WALL`/`§MAXQ_DONE`; if absent the bake must be restarted (~3 h plan). Read ALTC_FOUNDATION §1 before restarting.
- Alt+S (bim-compiler-db) and Alt+C (bim-compiler-20) sessions coordinate GPU/sidecars/merges directly (red1 standing OK, ALTC_FOUNDATION §0).

## 2. CONSOLIDATIONS DONE (red1-approved)
- `prompts/PHOTOREAL_STILL_RENDER.md` = 161-line state (Alt+S); history in `prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-08-11_to_2026-10-02.md`.
- `prompts/ALTC_FOUNDATION.md` = ~116-line state (Alt+C) + §1R reviewer take (HHS, Terminal film numbers); original in `prompts/archive/ALTC_FOUNDATION_full_history_2026-09-25_to_2026-10-02.md`.

## 3. FILM REVIEW (numbers only) — owner: ALTC_FOUNDATION §1R + §2 items 9-12
- HHS 1080p15 and Terminal 1080p15 films: clean on 0 black/0 frozen, §GI_FILM errFrames=0. Open FAILs: §CPE_REVEAL_LEAK (ARC leak 17 HHS / 74 Terminal), §HUD_OVERLAP_WORST pathmap x infopanel (every film), §CLI_BAKE_POSECHECK mismatch 75.85 m (Terminal, unproven), one §INTERIOR_LIGHTS_WITNESS 0/122 sample. Hospital review pending (checklist in §1R).
- red1 strategy (for the film): door = Mercedes-finish film, room = user guide, tagline 'No AI inside', stake the category early; proposed finish line §2 item 12 (red1 to confirm).

## 4. 'NO AI INSIDE' GUARANTEE — witness + guide
- Spec `prompts/NO_AI_INSIDE_WITNESS.md`; witness `viewer/tests/witness_no_ai_inside.js` on bim-ootb branch `test/no-ai-inside-witness` (@8d559bb8, PUSHED, no PR). Verdict PASS_WITH_DISCLOSED: 0 AI hosts, 0 canary leaks, deterministic; disclosed user-triggered calls: api.github.com (update check), tinyurl.com (share), api.qrserver.com (QR). GoatCounter removed from viewer/viewer.html (kept on landing page index.html only) — on that branch, NOT on main yet.
- `docs/USER_GUIDE.md` lines 9-16 reworded to match (UNCOMMITTED in bim-compiler; docs deploy only via scripts/safe_gh_deploy.sh by red1).
- OPEN: decide whether the QR service (sends the share URL's data to a third party) stays; add the witness to CI; merge the viewer.html tracker removal via PR.

## 5. IFC EXPORT SCHEMA FIX + TOOLKIT
- Findings/spec/results: `prompts/IFC_COMPLIANCE_SELFCHECK.md` (§EXPORTER_FIX). Both exporters were schema-invalid (ifcopenshell 682/134/329 errors, duplicate GlobalIds); fixed on bim-ootb branch `fix/ifc-export-schema` @05b1ac4f (PUSHED, no PR) -> 0 errors, witness `modeller/tests/witness_ifc_export_schema.js`. NOT merged. It also touches viewer/import.js (review before merge). Deferred: spaces/materials/psets/quantities not emitted; modeller header date fixed 1970-01-01.
- Dubai toolkit validity layer: spec `prompts/TOOLKIT_VALIDITY_LAYER.md`, code `prompts/dubai_validity_layer/`; APPLIED locally to ~/Projects/Dubai/plan/readiness (backup `plan/readiness.bak-2026-10-02`; Dubai is NOT a git repo; version.json not bumped). Grant caution (OpenBIM_v2.docx / Dubai PROMPT.md §THE GRANT): pilot/evaluation milestone 1 Oct, article 10 Oct -> version the instrument, keep wording 'indicative, not a certification', disclose that the benchmark platform's own exports are used if the appendix goes in the grant paper.
- Paper appendix draft: `prompts/PAPER_APPENDIX_TOOLKIT_IN_ACTION.md` (BEFORE/AFTER table A.5).
- Manual step for red1: run the free buildingSMART Validation Service on the fixed exports (selfcheck §7).

## 6. BIM POSITIONING RESEARCH
- `prompts/BIM_POSITIONING_RESEARCH.md` (sources in `research_notes/BIM app positioning research/`, untracked). Key conflicts with claims: perf claim (126K elements/2-3 s) unverified by anyone else; bare 'No AI' risky because code is AI-assisted -> 'No AI in the runtime, same input same output, verify in the open repo'; 'Mercedes Benz finishing' needs a trademark check; free 4D/5D exists (Bonsai, OpenConstructionERP, BEXEL); small-firm demand evidence thin.

## 7. ERP FIRST-SETUP (shipped to live)
- bim-ootb PRs #1808-#1814, #1818, #1819 MERGED; live version.json build v801 sha 7ab14b99. Journey witness `erp/tests/poc_erp_first_setup_live.js` on main = 27 VERIFIED / 2 GAP (S25b import windows, S26 backup button) / 0 INCONCLUSIVE. Details: `prompts/ERP_FIRST_SETUP_GUIDE.md`, `prompts/AGENT_QUEUE.md` §FS.4, `prompts/ERP_IDEMPIERE_UX_PARITY.md` §FS-BUILT-2.
- OPEN (next, small): a brand-new company's price list has no start date, so a product gets no price -> guide steps 16-22 still verified only in GardenWorld.
- OPEN hygiene: 5 witnesses red on main before and after these PRs (poc_critic_process_signed_live 5/18, poc_critic_odoo_process_live 4/7, poc_ad_folded_crud_live 7/14, poc_critic_create_live 4/12, poc_critic_crud_full_live 3/10); two genesis browser witnesses expect old seed numbers (§FS.3).
- UNCOMMITTED in bim-compiler (red1: push prompts only): docs/ERP_FirstSetup.md + 4 figs, mkdocs.yml, build/erp/{genesis,ad_callout}.js, scripts/poc_ad_process_live.js (FS-9 select-or-fill, meant to stay), docs/USER_GUIDE.md, research_notes/, reports/. Docs publish only via scripts/safe_gh_deploy.sh.

## 8. HOUSEKEEPING NOTES
- PROGRESS.md is 228 lines (budget 80): needs an archive pass. MEMORY.md must stay links-only.
- /tmp scratchpad (ext4, persists) holds the self-check logs/samples under /tmp/claude-1000/-home-red1-bim-compiler/ab4a76a3-.../scratchpad/; worktrees /tmp/wt-noai (branches above), /tmp/wt-erpguide (detached at main, clean).
- Agent model rule: Sonnet default; red1 explicitly allowed Opus for the ERP lane this session.
