# PROGRESS — Current Development State

## ⚡ §RESUME_PROTOCOL — when an agent dies on a rate limit
A 429 terminates the agent but still fires a task-notification carrying the reset time. Parse it →
record the agent + its last finding in `prompts/AGENT_QUEUE.md` §MID-FLIGHT → schedule a wakeup just
past the reset → resume by `SendMessage` to the agent id (never re-dispatch fresh) → tell the user.
Full text and the reasoning: `prompts/AGENT_QUEUE.md` §RESUME_PROTOCOL.

## 🤝 Teamwork comm layer (no DB/app server, just a data relay) — POC done 2026-10-23; frame + 3 apps + 6 films 2026-10-24
**State 2026-10-26 (all live on bim-ootb main):** FL-8 G-4 complete — compile refusal (E1), every device refuses a non-executor's DocAction (E3, #2395), DocAction list honours Document Action Access + the executor map (E2, #2396); G-8 offline statement signer + `publishStatement` (#2401); G-7 translation rules judged by the keys at publish time (#2404); Team guide updated (#2404). G-6 decided (UPS plan BESIDE the office plan, chosen at founding), build spec §38.14. Full log + counts: `prompts/TEAMWORK_FRAMEWORK.md` §38.2–§38.14 (history §0–§37).
**2026-10-28:** Team Phase 2.1-2.4 + 2.6 + G-1..G-3 DONE + LIVE (bim-ootb #2412, #2420, sw v923): observe-only plugin grant, core conflict message, numbering left the comm engine, Team OUT on the bus, received rows fire replica rules, legacy Import Orders port — W-POS-CHAIN 13/0 (a till ticket becomes ONE completed order at head office and returns). **Next session:** agents A–G per `prompts/TEAMWORK_FRAMEWORK.md` §41 (Import Payment, W-HQ-CLERK, role executors, G-6, Micro Finance on GardenWorld §40, I_POSSales); POS = standalone Unicenta-style till + kitchen, spec `prompts/POS_PLUGIN_LOCAL_FIRST.md`.

## 📋 The live worklist is `prompts/AGENT_QUEUE.md` — not this file
## ▶ HYGIENE + POSTING-PARITY session (2026-11-03→04, closed) — RESUME HERE for this lane
Docs review live (BIMCompiler #311/#312, `prompts/DOCS_REVIEW_2026-11.md`); code hygiene (`prompts/CODE_HYGIENE_REVIEW_2026-11.md`
§3-§7: A1/A3/A4/D1/D2/C1/three.js/ERP dead UI + engine subset live); seam audit CLOSED (`prompts/SEAM_IDENTITY_AUDIT.md` PASS 2 +
waves 1-3 + close-out); legacy posting parity (`prompts/SQLiteIDEMPIERE.md` END: §POSTING-PARITY 1a-1d + steps 2+4 live, bim-ootb
#2593-#2598 — 42/42 seed docs == legacy, Preview == real posting). (1) alloc #101 724 residual CLOSED 2026-11-04 — not a defect
(legacy stores Cr 0.01, the "0.0" was the Dr column; W-POST-ALLOCATION A5 now judges AmtSource). **Open, in order:**
(2) retire doc_poster derive* — spec + progress `prompts/SQLiteIDEMPIERE.md` §POSTING-PARITY step 5 (2026-11-04: customer return receipts
now post, bim-ootb #2601; 5a+5c done; next 5d); pre-existing FAILs found there (asi_batchrev, post_error) — check #2597 fixture staleness first;
(3) Modeller kernel_ops copy + boot assertion (KERNEL_TIMEBOMB T5); (4) Viewer memory B-items. Lesson memory:
`feedback_rerun_recorded_proofs_before_defect_claim`.
## ▶ FILM "I vs AI" lane (2026-11-03, closed): 3 finished films in ~/Videos (EN 223 s · Malay v3 316 s · Mandarin 273 s); read `prompts/FILM_VS_AI_SLOP.md` ▶ RESUME HERE (rebuild commands, open items, lessons). Branch `film/vs-ai`; nobody has listened to the films yet.
It carries §LIVE (which agent owns which files), the waves, the ⛔USER decisions, and the standing
constraints. A session picking up work reads that; PROGRESS.md is state, not queue.

## ▶ CAPEX lane — TWO TASKS (2026-11-03 end of session): read bim-ootb `prompts/CAPEX_DASHBOARD.md` ▶ RESUME HERE. TASK 1 the dashboard, rebuilt ground-up on our SQLite WASM framework (PA rows → SQLite PA engine → renderer → generic editor, §5.13; next G1 `erp/pa_engine.js`). TASK 2 the iDempiere plugin `org.idempiere.bimootb` = BIM → Project Order only (`prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md` §8–§8.9; clean-instance install + viewer push PASS; next B3 the BIM tab in ZK). Sysnova PM: their dashboard is still a prototype → we proceed with ours.
## ▶ DXF2BIM lane (2026-11-03, session 18 closed): read bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` ▶ RESUME HERE (session 19). Done: P-X one converter (#2520: a raw IFC opened in the Modeller = the shared extractor → the residents' DB, W-IFC-OPEN-ONE), P-X2 element-level rel_aggregates (#2522), U8 W-VIEWERDB refreshed + in the runner (#2525), release check 49 authoring witnesses 44/4 pre-existing/1 ENV (#2536). Modeller items handed to MODELLER_MASTER (M-1..M-4, RC-1..4). Runner 109/9/1 of 119 (LT7). NEXT: owner picks among the open proposals (P-W1, P-K, P-V, P-E, P-L …), then the carried list (LT7 first).
## ▶ FRIENDLY-OPS + LIBERO lane (2026-10-22, session 9 CLOSED): distribution lane closed (Doc_Movement #2254, MMovementConfirm #2252, Replenish Report #2266, MInventory+Doc_Inventory #2274); new ASI lane AS-1..8 merged. RESUME: prompts/ERP_FRIENDLY_OPS_LENS.md §68 + prompts/ERP_PRODUCT_ATTRIBUTE_ASI.md §9.
## ▶ DEPTH lane (2026-10-13): cycle 1 DONE + merged (bim-ootb #1988; 10 SQLite-lane gaps repaired, 3 witnesses green, 4 films EN+TH). NEXT = §NEWCLIENT-DEPTH — read `prompts/ERP_DEPTH_FILM.md` ▶ RESUME HERE.
## ▶ DEPTH cycle 2 §NEWCLIENT-DEPTH (2026-10-13): NC-1..NC-4, NC-5a, NC-6/7/8, NC-9 (window access + new role) DONE vs LEGACY-MEASURED; PRs #1989-#1995 merged; W-MODEL-ORACLE re-run UNCONFIRMED (timeouts) - see RESUME HERE. Window sweep 204 of 332 OK. NEXT: re-run NC-10/11/12 on the new code, film chapters, MUser/new-role login — read `prompts/ERP_DEPTH_FILM.md` ▶ RESUME HERE.
## ▶ DEPTH lane 2026-10-15: dictionary census 65->78, 19/19 views, fact_acct parity, CU guard redesign, Dunning fix, 2 raw films in ~/Videos - NEXT/OPEN list in `prompts/ERP_DEPTH_FILM.md` §RESUME HERE FIRST (fourth wrap).

## ▶ ERP LARGE-CLIENT SHARDING lane (2026-10-14): PG→SQLite→phone proven on read path (11 GB bed, 41.3 M rows, fidelity 925/925, real phone cold 3.4 s vs 9.8 s). NEXT = reports/summary shards (§17). Read `prompts/ERP_LARGE_CLIENT_SHARDING.md` ▶ RESUME HERE; spec `docs/internal/ERP_SHARD_GENERATOR.md` §9–§16; scratch data `/home/red1/erp_shard_bed/`.

## ▶ SQLite⇄iDempiere parallel-run lane (2026-10-10): read `prompts/SQLiteIDEMPIERE.md` — CARDINAL RULE block + ▶ RESUME HERE at its top (SQLite must equal legacy incl. L&F; F4–F39 fixed + witnessed; bim-ootb port in progress as a DRAFT PR; method page docs/LegacyOracleAdapterSpec.md is live).

## ▶ LATEST HANDOFF — 2026-10-02: read `prompts/SESSION_HANDOFF_2026-10-02.md` first (films, No-AI witness, IFC export fix, Dubai validity layer, ERP first-setup live v801, local-only items).
## ▶ 2026-10-08 — OpenBIM schema + Dubai paper session (close)
- **Published `ootb-building` v1 target schema** — bim-ootb `schema/` (PR #1934 MERGED): spec + DDL + `migrate_v0_to_v1.py`.
  No live DB touched. W-SCHEMA-V1-MIGRATE on copies of 27 files: 22 + 5 pairs PASS, 0 rows lost, 4 zero-byte INCONCLUSIVE.
  Lane file: `prompts/SQLITE_SCHEMA_PUBLISH.md` (§8 decision, §9 DB-move plan + three.js r186 list). NEXT: §9 step 1 — both writers emit v1.
- **Certification route** — `prompts/BUILDINGSMART_IFC_CERTIFICATION.md` §2026-10-08: validator + IDS facts; P1 W-IFC-ROUNDTRIP still unbuilt.
- **Dubai paper** (outside repo): `~/Projects/Dubai/OpenBIM_Paper.docx` = IEEE format, conformed to abstract v4; log in `~/Projects/Dubai/PROMPT.md`.
- ⛔ user call: 4 zero-byte DBs in bim-ootb/buildings (`city_index`, `city_index_v2`, `Duplex_meta`, `SampleCastle_extracted`).

## Modeller lane — 2026-11-03: read `prompts/MODELLER_MASTER.md` §RESUME 2026-11-02 (START HERE). Done 2026-11-02: M-1 Walk ALL on an IFC open (bim-ootb #2526), M-3 walked shed reaches the Viewer with every class (#2527, #2531), M-4 Walk ALL skips present disciplines (#2535), red1's roof/stairs question answered, M-2 measured. NEXT: RC-1..RC-4 (pre-existing reds), export carries no colour/psets/storey for carried rows, then the §RESUME 2026-10-02 queue.

## Current State — 2026-11-03 (ERP Team lane) — ⚠ RESUME HERE: `prompts/TEAMWORK_FRAMEWORK.md` ▶ RESUME HERE (2026-11-03 close)
LIVE on bim-ootb main: §52.1 resume-as-it-was (#2519, W-RESUME-AS-IT-WAS 7/0, sw v960) · §45.14a per-request retry in ghPipe (#2521, 100 users 96/96 on lossy links, erp sw v961, modeller sw v205) · §S-SCHEMASET twin posting uses legacy's schema set (#2523, O2C 6/6 MATCH). MEASURED: §45.14 SME-100 (10→100 users over shaped links, fitted, cliffs: one shared GitHub account 10–17 users, one per person ≈ 520–585 — head office is the limit) · §45.15b apple-for-apple vs legacy (median of 3, twin on SQLite WASM: ≥ 1.1 s vs 0.03 s per document on mobile data). FILM recorded: `~/Videos/Network_ERP_without_an_Apps_and_Database_server_EN_rc7.mp4` + `…_ZH_rc2.mp4` (scripts/film_network_erp/, guard PASS). NEXT: see TEAMWORK ▶ RESUME HERE.

## Older states (2026-09-02 … 2026-09-08, incl. ⛔ OPEN + standing constraints of 2026-09-02/03) — moved verbatim to `prompts/archive/PROGRESS_DONE_ARCHIVE_pre_2026-11-03.md` (2026-11-03)
