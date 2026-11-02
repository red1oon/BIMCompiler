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
It carries §LIVE (which agent owns which files), the waves, the ⛔USER decisions, and the standing
constraints. A session picking up work reads that; PROGRESS.md is state, not queue.

## ▶ CAPEX / PROJECT ORDER DASHBOARD lane (2026-11-03, session 77 closed): read bim-ootb `prompts/CAPEX_DASHBOARD.md` ▶ RESUME HERE (lean, rewritten; history archived). Done: shed + HHS pushed to the local pilot and twinned 121/121 + 160/160; 7 kernel/bridge defects fixed; films EN/ZH/MS v5. NEXT: R0 probe legacy PA dashboard rows (owner go) → R1 one schedule from 4D → PA engine as a true twin.
## ▶ DXF2BIM lane (2026-11-01, session 16 closed): read bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` ▶ RESUME HERE (session 17). Done: Measure impact (§D99 P2), Sheet view draws every dimension + NOTES chip (§D101), type marks cross-checked (§D102), analytical model export to STAAD (§D103) built ONLY from the IFC (§D105, byte-identical), Load Summary beam-width fix (§D104, −127 kN on the shed); guide + 4D5D docs deployed with screenshots. Film lane: bim-ootb `prompts/FILM_BIM_DO_ONCE_REUSE_FOREVER.md`. Runner 105/9/1 (LT7 only).
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

## Modeller lane — 2026-10-02 close: read `prompts/MODELLER_MASTER.md` §RESUME 2026-10-02 (START HERE).

## Current State — 2026-11-03 (ERP Team lane) — ⚠ RESUME HERE: `prompts/TEAMWORK_FRAMEWORK.md` ▶ RESUME HERE (2026-11-03 close)
LIVE on bim-ootb main: §52.1 resume-as-it-was (#2519, W-RESUME-AS-IT-WAS 7/0, sw v960) · §45.14a per-request retry in ghPipe (#2521, 100 users 96/96 on lossy links, erp sw v961, modeller sw v205) · §S-SCHEMASET twin posting uses legacy's schema set (#2523, O2C 6/6 MATCH). MEASURED: §45.14 SME-100 (10→100 users over shaped links, fitted, cliffs: one shared GitHub account 10–17 users, one per person ≈ 520–585 — head office is the limit) · §45.15b apple-for-apple vs legacy (median of 3, twin on SQLite WASM: ≥ 1.1 s vs 0.03 s per document on mobile data). FILM recorded: `~/Videos/Network_ERP_without_an_Apps_and_Database_server_EN_rc7.mp4` + `…_ZH_rc2.mp4` (scripts/film_network_erp/, guard PASS). NEXT: see TEAMWORK ▶ RESUME HERE.

## Older states (2026-09-02 … 2026-09-08, incl. ⛔ OPEN + standing constraints of 2026-09-02/03) — moved verbatim to `prompts/archive/PROGRESS_DONE_ARCHIVE_pre_2026-11-03.md` (2026-11-03)
