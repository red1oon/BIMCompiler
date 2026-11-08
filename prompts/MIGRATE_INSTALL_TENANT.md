# ⚠ DO NOT REMOVE — Migrate ACTUALLY installs a loadable tenant (Client 12 Odoo + 13 iDempiere)
# STATUS: STALE HEADER — P0/P1/P2 Odoo done 2026-06-05→06; P1-iDempiere, said BLOCKED below, was actually
#   UNBLOCKED+SHIPPED (PK re-band 2026-06-11 + idempiere_agent.zip via a DIFFERENT lane, ABOUT_BOX_CONSOLIDATE.md,
#   by 2026-06-19) — this file was never updated to say so. See `§2026-07-22 AUDIT` at the bottom for current
#   state + the REAL remaining gaps (offline/network dependency of the install flow, doc coverage). Originally
#   captured 2026-06-05 as PLAN/not-started (stale, kept for history below).
# SCOPE: today the Migrate dialogs are real VERIFY/PREVIEW flows, not INSTALL flows — going through them
#   does NOT leave you with logged-in Client 12 (Odoo) + Client 13 (iDempiere). Close that gap.
#   Spec-first · §-log first · NON-INVENT · delegate-to-install (browser never touches the source DB).

## ▶ THE GAP (observed by user, verified 2026-06-05)
The optics imply "migrate → tenant"; the wiring stops at "migrate → verified fold / master-data preview".
- **Odoo flow** (`erp_picker.js` Odoo sub-flow): download `odoo_agent.js` → it pulls SO S00023 LIVE, folds
  the O2C chain, emits `odoo_chain.json`; browser RE-FOLDS → `§ODOO-MIGRATE-BROWSER mapped=5/5 newVerbs=[]
  glDr==glCr chainOk`. **Verifies a transaction fold. Does NOT install a Client-12 tenant.**
- **iDempiere flow** (`migrate_showme.js` MigrateShowMe): points a local agent at the user's iDempiere
  Docker Postgres (`db=idempiere user=adempiere`, PG :5432) — **master/metadata BROWSE only. No Client 13.**
- **Client 12 "Odoo" exists only as a PRE-BAKED shard** (`gen_ad_odoo.js` → `12-odoo.db`) loaded via the URL
  `?shard=12-odoo.db` — NOT produced by clicking the dialog. **Client 13 does not exist anywhere.**
- Default login shows only **Client 11 (GardenWorld)** (base `ad_seed.db`).

## ▶ THE TARGET
Going through Migrate(Odoo) and Migrate(iDempiere) leaves the user with **Client 11 GardenWorld + 12 Odoo +
13 iDempiere** as real, loadable tenants in the login/client switcher — each its own AD frame + data, all
NON-INVENT (every row a recorded source row), delegate-to-install (the browser never connects to the source).

## ▶ NAMED DEPENDENCY — POSTING CONFIG (discovered 2026-06-10, → `prompts/MIGRATE_POSTING_CONFIG.md`)
A migrated tenant must carry RESOLVABLE POSTING CONFIG or every GL view (the Posting-Preview drawer,
Accts-Posted panel) renders `coverage:absent`. **Proven gap:** `12-odoo.db` (Client 12) has docs (`c_order=27`,
`c_invoice=1`) but NO posting config — `c_bp_customer_acct`/`m_product_category_acct`/`c_validcombination`/
`c_elementvalue` ALL ABSENT. iDempiere (13) = extract must pull them (easy); Odoo (12) = the Odoo-fold must MAP its
CoA + partner/product account properties (real work). Owns its own resume card; feeds `prompts/POSTING_PREVIEW_PANEL.md`.
**↑ NOW SUBSUMED by the full-frame card →** `prompts/MIGRATE_FULL_MODEL_FRAME.md` (2026-06-10): posting config is
1 of 4 frame items. The accounting view is AD-gated as of #235 (v628) — surfaces only where the AD `Posted` Button
field (ref 28) exists — so a migrated tenant must ALSO carry the AD posting-document frame (the `Posted` field) +
doc-types, not just the config. ACCEPTANCE BAR for THIS install: a migrated Client 12/13 fits frame items 1–4 and
the DEPLOYED AD-gated view renders `coverage:complete` + balanced (`§FRAME-FIT`).

## ▶ RESUME (2026-06-10) — "migrate must pull Odoo data IN FULL; list the gap to tackle later" (user directive)
**Directive:** we welcome Odoo users → Install/Migrate must get their data **in full**; wherever it can't, that IS the
GAP — enumerate it and list to tackle later. Today migrate pulls only **one** SO chain (S00023 O2C); P2 persists
Client 12 with `products=35 orders=27` (`poc_odoo_records_show.js`) — far short of "in full."

**Live source (how to bring it up):** Odoo 17 `odoodemo` @ `localhost:8069` (admin/admin, JSON-RPC `/jsonrpc`). It is a
**stopped docker pair** — `docker start odoo-db odoo` (db first), then poll `curl -s -o/dev/null -w '%{http_code}'
localhost:8069/web/login` until `200` (~10s). Survey via `execute_kw` — copy the rpc helper from
`~/bim-ootb/erp/odoo_agent/agent.js` (READ-ONLY; ~/bim-ootb is hook-blocked).

**In progress (2026-06-10):** a FULL live survey → **`build/erp/odoo_survey.{js,log,json}`** = the authoritative Odoo
data inventory (real `search_count` per model) + the migrate-coverage GAP (split **extraction-gap** = pullable-but-not-
pulled vs **fold-gap** = engine-can't-fold-yet) + a prioritized tackle-later list. The gap list is being consolidated
into `docs/MigrateComparisonPaper.md ## GAP ANALYSIS` (3-col capability map **iDempiere | Odoo | OOTB**) + cross-ref
`docs/ERP_COVERAGE_MATRIX.md`.

**NEXT (resume HERE):**
1. Read `build/erp/odoo_survey.json` (the gap inventory) — start from the top of the prioritized list.
2. Extend the Odoo extractor (`odoo_agent`) from one-SO-chain → **FULL pull**: master data (partners / products / COA /
   taxes / journals) + **all** documents (every SO/PO/invoice/payment/picking/journal entry) + accounting
   (`account.move`/`account.move.line`). Delegate-to-install stays — the browser never touches Odoo; the agent emits the file.
3. Every added extraction = a §-witness: **records pulled == live `search_count`** (non-invent proof).
4. **Fold-gaps** (capability our engine can't yet fold even if pulled) route to the ERP coverage matrix / FOLD lane —
   NOT the extractor.
**GUARDRAIL:** NON-INVENT — every migrated row traces to a real Odoo record; never synthesize rows to "fill" the tenant.

## ✅ P0 — DONE (2026-06-05, bim-ootb PR #154, auto-merge). Witnesses: fresh-dir `§ODOO-AGENT PASS`
##   (unzip→npm install→node agent.js vs live odoodemo→odoo_chain.json) + browser `§ERP-PICKER PASS` /
##   `§MIGRATE-INSTR clear=Y selfsufficient=Y design=staged` / `§PICKER-STAGED lock=Y steps=3 dl=odoo_agent.zip
##   drop=Y` / `§ODOO-MIGRATE-BROWSER mapped=5/5 chainOk=Y` (0 pageErrors). Box screenshot = staged panel.
##   Shipped: `erp/odoo_agent.zip` (self-sufficient bundle) + `erp/tools/build_odoo_agent_zip.sh` + redesigned
##   `_renderOdoo` (🔒 banner + 3 staged steps + copy-cmd + validating drop-zone); removed broken lone odoo_agent.js.
##   ⛔ NOTE iDempiere sub-flow (migrate_showme.js) was ALREADY staged (4 steps, copy-cmd, file stream) — P0's
##   self-sufficiency fix targets only the Odoo agent. migrate_agent.js still ships lone (npm install
##   better-sqlite3) — apply the same bundle pattern if/when iDempiere P1 is unblocked.
## ▶ P0 — QUICK WIN (do FIRST; small, ships alone): the dialog INSTRUCTIONS must be unmistakable
User feedback (2026-06-05): *"browser cannot touch the docker, so it has to be run by the user natively —
instructions should have been clear."* Today the Migrate copy half-says it and the download is unrunnable.
Fix the COPY + the artifact so a fresh user succeeds without the repo:
- **State the doctrine up front, in the dialog:** "🔒 The browser cannot reach your Docker/Postgres/Odoo.
  YOU run the agent **natively** on that machine; it writes a file you then load back here." (Both Odoo and
  iDempiere sub-flows.)
- **Ship a SELF-SUFFICIENT artifact**, not a lone `odoo_agent.js` that `require`s 3 missing siblings
  (`sql.js`, `./erp_kernel`, `./odoo_adapter`) → today `node odoo_agent.js` from ~/Downloads ERRORS. Options:
  a folder/zip (`agent.js` + `package.json` + vendored adapter) with `npm i && node agent.js`, OR an inlined
  single-file agent. Exact, copy-pasteable: prereqs, `npm i`, the run command, the produced file path.
- **For iDempiere:** the agent is **Node + `pg`** against the user's iDempiere Postgres (`:5432 db=idempiere`)
  — state creds are entered/kept locally; the browser never connects.
- **Redesign the box itself** (user: *"that box should be more well designed too"*). Today it's plain
  stacked text + a green button + a bare `Browse…`. Make it a proper guided panel: a clear title + the 🔒
  doctrine banner; **numbered steps as visual stages** (1 download · 2 run natively · 3 load back) with state
  (pending/done check per step); the run command in a copy-button code block; a real drop-zone/file-picker for
  the produced file with validation feedback (✓ parsed N events / ✗ wrong file); consistent with the pill/
  overlay design language (it's reached from the ⬇ Install / 🔌 Migrate pills). Keep it honest — show what
  loaded (client, tables, rows) after a successful load.
- Witness `§MIGRATE-INSTR clear=Y selfsufficient=Y design=staged` (fresh-dir run succeeds; box shows staged steps).

## ▶ P0-IMPL (spec, 2026-06-05) — what shipped
**Self-sufficient artifact = a ZIP bundle.** Replace the lone broken `odoo_agent.js` download (fails fresh-dir:
`Cannot find module 'sql.js'` then `./erp_kernel`/`./odoo_adapter`) with `bim-ootb/erp/odoo_agent.zip`, built from
source folder `bim-ootb/erp/odoo_agent/` (committed, readable): `agent.js` (OUT→`./odoo_chain.json` in cwd, not the
repo build dir) + vendored `erp_kernel.js` + `odoo_adapter.js` (both already self-contained — no sibling requires,
only `sql.js` external) + `package.json` (`sql.js ^1.14.1`, `start: node agent.js`) + `README.md` (🔒 doctrine + steps).
Run = `npm install && node agent.js`. Rebuild via `bim-ootb/erp/tools/build_odoo_agent_zip.sh`.
**Box redesign (`_renderOdoo`):** 🔒 doctrine banner up front + 3 numbered staged steps with per-step done-state
(① download bundle · ② run natively, copy-button command · ③ drop `odoo_chain.json`, parse feedback ✓N events/✗wrong file),
in the pill/overlay language. Then the existing ERPKernel re-fold table.
**Witness:** `§MIGRATE-INSTR clear=Y selfsufficient=Y design=staged` (dialog open) + fresh-dir `§ODOO-AGENT PASS`
(zip → npm i → node agent.js → odoo_chain.json vs live odoodemo) + browser `§ODOO-MIGRATE-BROWSER` round-trip.

## ✅ P2 (Odoo) — DONE (2026-06-06, bim-ootb PR #156, merged, sw v585). INSTALL now PERSISTS the merged tenant:
##   `idempiere.html` writes the shard-in result back to IDB (`idbPut('ad_seed_v13', db.export().buffer)`) when rows
##   merged + seed is the real ad_seed.db → Odoo **Client 12 survives a plain reload with NO `?shard=` param**.
##   Witnesses: `tests/poc_client12_resident.js` BEFORE resident=N → AFTER `§C12-RESIDENT persistedToIDB=Y
##   survivesReload=Y resident=Y` (0 pageErrors); `tests/poc_odoo_records_show.js §ODOO-RECORDS products=35 orders=27
##   showable=Y` (real records render in AD UI). STILL OPEN: P2 driven from the dialog success-path (today persist
##   fires on shard-in load); P3 login client-switcher (list 11/12, pick→role-scoped login); P1-iDempiere emitter
##   (exists as `migrate_pg_to_sqlite.js`, GW-pull default). SAP target = **B1** (see FRONTEND_LANE_MASTER session state).

## ▶ THREE PIECES (phased; each ends with a §-witness)
1. **A tenant-shard EMITTER per source** (parallel to `gen_ad_odoo.js`/`odoo_agent.js`):
   - Odoo: already have it — `gen_ad_odoo.js` → `12-odoo.db` (Client 12, 7-field, 35 products + 26 orders).
   - **iDempiere: NEW `idempiere_agent.js`** (Node + `pg`) the user runs against their iDempiere PG (:5432,
     `db=idempiere`) → emits **`13-idempiere.db`** = their tenant re-keyed to Client 13 (System(0) frame +
     AD client/org/role/user/access + master/trx), 7-field enforced. Witness `§GEN-AD-IDMP PASS client13.* …`.
   - Decision (user owns): WHICH iDempiere tenant → Client 13 (GardenWorld is Client 11 already; pick the
     user's own tenant, or re-key GW as a 2nd copy). Needs PG creds (user-supplied; delegate-to-install).
2. **Migrate flow INSTALLS the shard** (not just verifies): on `Browse…`/agent-done, merge the shard into the
   live db (the existing `?shard=` SHARD-IN path) AND persist it (IDB) so it survives reload + register the
   new `AD_Client`. Witness `§MIGRATE-INSTALL client=<n> tables=… rows=… persisted=Y`.
3. **Login CLIENT SWITCHER** lists all installed tenants (11/12/13) → pick → role-scoped login. (A switcher
   existed in `ad_ui.js showMenu` but was removed in the pill-registry cleanup; re-add as a proper picker.)
   Witness `§CLIENT-SWITCH clients=[11,12,13] pick=13 login=ok`.

## ▶ GUARDRAILS / NOTES
- **Delegate-to-install:** browser can't reach Postgres (no PG driver/CORS) — iDempiere migration MUST be a
  local agent the user runs (like `odoo_agent.js`), emitting a file the browser loads. NON-INVENT.
- iDempiere IS the AD reference (GardenWorld = its own demo = Client 11) — "migrating iDempiere" = re-keying
  a real iDempiere tenant to a free client id (13) so it coexists. Reuse `gen_ad_odoo.js` stamp7/clone/ins.
- Sequence honestly: P1 (emitter) → P2 (install+persist) → P3 (switcher). Each shippable alone.
- **Honesty:** "tenant installed + loadable" ≠ "all of iDempiere migrated" — state the table/row coverage.

## ▶ DEPENDENCY (user-owned, blocks P1 for iDempiere)
iDempiere PG connection (host/port/db/user/password) + which tenant → Client 13. Until then P1-Odoo is done,
P1-iDempiere is BLOCKED. P2/P3 can proceed on Odoo (Client 12) alone as the proof.

## §2026-07-22 AUDIT — user asked "how is the installer now, does ERPUserGuide document it running offline"

**Correcting the stale header above:** iDempiere P1 did ship. `erp/idempiere_agent.zip` (Node + Docker-CLI `psql`
+ better-sqlite3, mirrors `odoo_agent.zip`) exists, is precached, and has its own dialog→persist witness
(`W-INSTALL-IDMP`, `erp/tests/poc_install_idmp.js` — reload survives 8/8 orders, guarded re-install, preview
balanced — see [[project_new_client_mgmt]]). PK-collision root cause (un-banded GardenWorld ids silently dropped
by `INSERT OR IGNORE`) was fixed via a 13-family `CL*100000` re-band in `gen_ad_idmp.sh`. So: **P0/P1/P2 done for
BOTH Odoo (12) and iDempiere (13)**, P3 switcher done (`project_new_client_mgmt` "P3 LOGIN CLIENT SWITCHER").
Treat this file's earlier "PLAN/BLOCKED" framing as historical, not current.

**Three DIFFERENT "install" concepts exist in this codebase — don't conflate them in future work:**
1. **This one** — migrate a legacy Odoo/iDempiere/SAP/Oracle/Dynamics tenant into the app (delegate-agent zip
   run natively → produces a `.db` shard → browser `fetch()`s + merges + persists it to IndexedDB).
2. **Genesis** ("birth a new tenant from scratch", `prompts/SYSTEM_ADMIN_LANE.md`) — pure in-memory op-log fold,
   no network fetch needed. Already offline-capable by construction. Not this lane's concern.
3. **Self-host installer** (`common/about_diy.js`, generates `bim-ootb-install.sh`/`.bat`) — installs the WHOLE
   APP on a fresh machine (git zip + `python -m http.server`). Unrelated to tenant install; don't merge scope.

**ERPUserGuide.md (docs/ERPUserGuide.md) coverage of this flow, as it reads today:**
- §"Initial Tenant Setup" (lines 99-122) documents Genesis (concept 2 above), marked (LIVE).
- §2 "Bring your data in — the DIY box" (lines 140-224) documents THIS flow (concept 1): describes the
  delegate-to-install doctrine ("the browser never connects to your database") and the 5-tenant table
  (12 Odoo real / 13 iDempiere real / 14-16 SAP/Oracle/Dynamics marked PoC, agents "on the roadmap").
- **Gap found: nowhere does the guide state whether this flow works offline-after-download.** The guide's
  "runs fully offline"/"offline-first" claims (lines 5-6, 51, 227-253) are scoped to the general engine and to
  the initial app-boot seed load (§11) — not to fetching a tenant shard `.db` or downloading an agent zip. It
  neither claims nor disclaims offline behavior for this specific flow — a silent gap, not a wrong claim.
- **Code-confirmed reality (the gap the guide should state honestly):** `sw.js` (bim-ootb/erp/) deliberately
  excludes ALL `.db` files from the service worker (`if (url.endsWith('.db')) return;`, ~line 182) — so
  `12-odoo.db`/`13-idempiere.db`/etc. always hit the network, no offline fallback. The agent `.zip`s are not in
  `PRECACHE_ASSETS` either — first download needs network (subsequent ones may hit the browser HTTP cache, but
  the app does nothing to guarantee it). By contrast the app shell + Genesis + the base demo tenant (GardenWorld)
  ARE fully offline-capable once cached. **So: the "install a migrated tenant" flow is NOT offline-capable
  today, unlike the rest of the app — and nothing in code or docs currently says so either way.**

**NEXT TASK for a future session (spec, not yet built):**
1. Confirm intent with user: should shard-`.db` fetch + agent-`.zip` first-download be made offline-capable
   (add both to `sw.js` PRECACHE_ASSETS — cheap, since the 5 shard files + 2 zips are static and small), or is
   "needs network once to install a new tenant, offline after" an acceptable/intended line to hold? Either
   answer is fine — the bug is that neither is currently written down anywhere.
2. Once decided, update `docs/ERPUserGuide.md` §2 with an explicit, honest line (e.g. "downloading a tenant
   shard or agent needs a network connection once; after that, the installed tenant works fully offline like
   the rest of the app" — verify that second half against `installShard()`'s IndexedDB persistence before
   asserting it).
3. `docs/LegacyMigrationJourney.md`, named in the OLD `archive/NEW_CLIENT_MGMT.md` STOP CONDITION as "the
   one-page direction," **does not exist** (confirmed by search, 2026-07-22) — either write it or strike the
   requirement; don't let a future session assume it exists because an old backlog card names it.
4. Not urgent, but worth a look while in this area: `TRILOGY_STALE_CODE_AUDIT.md` flags `erp/idempiere_agent.zip`
   as a tracked BINARY duplicating the tracked SOURCE dir `erp/idempiere_agent/` (same pattern as `odoo_agent.zip`)
   — a DB/binary-distribution-policy flag already on record there, not new, just adjacent to this area.

## §2026-11-08 PLAN — "a proper migration tool the user runs, that localises the ERP to their machine" (owner directive)
> Owner, 2026-11-08: *"most Odoo users want at least to salvage all master data and use whatever proper Kernel ERP
> convention to continue business … like it to be a proper one that users runs and then localise the ERP to their
> machine. A user guide will be to show how, and a film too in the end."* · *"there are stale ERP testing, all will
> be your session to manage."*

### Measured state today (read, not assumed)
- **What a user can run** — `bim-ootb/erp/odoo_agent.zip` → `agent.js` pulls ONE sale order (`S00023`) and its chain
  (`erp/odoo_agent/agent.js:51-61`). No master data. `extract_model.js` pulls the dictionary slice for renderer #2, not data.
- **What the developer runs** — `build/erp/gen_ad_odoo.js` (dev only, needs `build/erp/ad_full.db`) writes `12-odoo.db`
  rows DIRECTLY: 38 partners, 47 accounts, 2 taxes, 35 products, 27 orders / 56 lines (`build/erp/poc_p4_masters.log`,
  `poc_odoo_full_pull.log`, 2026-10-12). It skips iDempiere's own import checks, and no user can run it on their Odoo.
- **The proper legacy route already exists in iDempiere:** 19 `I_*` import tables + `Import*.java` processes
  (`I_ElementValue`, `I_BPartner`, `I_Product`, `I_PriceList`, `I_Inventory`, `I_GLJournal`, `I_Invoice`, `I_Order`,
  `I_Payment`, `I_BankStatement` …). The twin has the Import File Loader + **ImportBPartner only** (FS-16,
  `erp/ad_process.js:734-822`, `ERP_FIRST_SETUP_GUIDE.md §FS2n`).
- **Gap inventory** — 36 areas, `build/erp/odoo_survey.json` (2026-06-10; partly closed since by the dev generator).
- **Witness honesty defect (PRIMAL LAW #4):** `scripts/poc_p4_masters.js`, `poc_odoo_full_pull.js`,
  `poc_migrate_postcfg.js`, `poc_migrate_postcfg_odoo.js` print 🟢 PASS while the live Odoo is DOWN and the
  non-invent check was SKIPPED. That must print INCONCLUSIVE.
- Odoo docker pair `odoo` / `odoo-db` stopped since ~2026-10-18; the iDempiere `postgres` is up.

### The route (recommended, awaiting owner GO on B0)
**Odoo → iDempiere import files → the twin's own Import processes**, at a CUTOVER DATE: masters + opening balances +
open documents. This is how iDempiere consultants move a company in, so it is the twin's convention (CARDINAL RULE),
and the user ends with a normal tenant on their own machine (browser IndexedDB), not a pre-baked demo shard.
Closed history is OPTIONAL (the fold already proves it: `MIGRATION_CAMPAIGN_RESUME.md`).

### WORK LIST (WORK-TO-ZERO, top to bottom)
**A — Test truth first (stale tests)**
- ✅ A1 DONE (witness) 2026-11-08 — `poc_p4_masters` / `poc_odoo_full_pull` now print ⚪ INCONCLUSIVE exit 3 with no Odoo (`§NO-ODOO … exit=3 inconclusive=Y`). The two postcfg pocs fall back to a RECORDED oracle, so they still judge — left as is.
- ✅ A2 DONE (witness) 2026-11-08 — live run, logs `build/erp/logs_migrate_2026-11-08/*.live.log`: full_pull 🟢, postcfg 🟢, postcfg_odoo 🟢, **p4_masters 🔴 `35==48` products = SOURCE DRIFT, not an extractor defect**: 13 sale products created 2026-10-14 by the `mrp` install (`product_product.create_date`; `ir_module_module mrp write_date 2026-10-14`). The June shard predates them. Closes when B1 (agent v2) replaces the dev-built shard; until then this RED is attributed, not hidden.
- ✅ A-MOCK DONE (witness) 2026-11-08 — `scripts/odoo_mock/odoo_rpc_mock.js` + fixture `build/erp/odoo_fixture/odoodemo_2026-11-08.json` (11 answers, sha256 039562a2f2db3b3c) + `ODOO_PORT` on the 4 pocs and `gen_ad_odoo.js`. W-ODOO-MOCK-FIDELITY 🟢 (`scripts/poc_odoo_mock_fidelity.js`, log `build/erp/logs_migrate_2026-11-08/fidelity_run1.out`): replay == live on all 4 (MISS=0), no-Odoo ⇒ INCONCLUSIVE, falsifier `res.partner.search_count 38→39` changes the p4 result. **Replay: `node scripts/odoo_mock/odoo_rpc_mock.js replay build/erp/odoo_fixture/odoodemo_2026-11-08.json & ODOO_PORT=8070 node scripts/poc_X.js`.** B1's agent v2 must be recorded the same way (re-record = start Odoo, `record` mode, run).
- 🟡 A3 SWEEP RUN 2026-11-08 — see §A3-LEDGER below (first pass 188/232 GREEN; 16 instruments fixed in 6 PRs; pilot drift found; re-run of 29 in progress).
- (original A3 text) Full ERP sweep, ONCE, persisted: bim-ootb `erp/tests` = 232 `witness_*.js` + 153 `poc_*.js` vs fresh
  origin/main, headless software rendering (no GPU), ≤3 in parallel. Ledger: GREEN / RED-product / RED-stale-instrument /
  INCONCLUSIVE. Stale instrument → fix the witness. Product defect → fix the SQLite side (CARDINAL RULE).
**B — Core gaps: the migration tool**
- ✅ B0 Route AGREED by owner 2026-11-08; spec = §B0-SPEC below (adds: summary report before OK, uncheck what nothing depends on, iDempiere normalisation).
- 🟡 B1 MASTERS PART DONE (witness) 2026-11-08 — bim-ootb #2709 `erp/odoo_agent/export.js` (auto-merge set; verify it landed). W-ODOO-EXPORT 🟢 (`scripts/poc_odoo_export.js`, log `build/erp/logs_migrate_2026-11-08/poc_odoo_export.out`, fixture `build/erp/odoo_fixture/odoodemo_export_2026-11-08.json` 30 answers): 11 files, 38/38 partners (12 + 26 contacts), 48/48 products (+31 vendor rows), 0 dangling refs, replay byte-identical sha 892fddb2b43010d7, falsifier names 71 rows. Still to add: opening GL / open invoices / open orders (B3). UoM code mapping = summary screen (X12DE355 has no Odoo source).
- (original B1 text) Agent v2 (user runs it natively, zip, `npm install && node agent.js`): writes `odoo_export/` = one CSV per
  `I_*` table in iDempiere's loader format + `manifest.json` (live `search_count` per Odoo model = the non-invent proof).
  Masters: CoA, partners + contacts + addresses, product categories, products, UoM, price lists, taxes, payment terms,
  warehouses/locators, currency.
- ⬜ B2a Port `GridTabCSVImporter` (window CSV import, generic) — carries categories, groups, UoM, tax, payment terms, warehouses.
- ⬜ B2 Port the missing Import processes verbatim (cite Java file:line), one per PR, ImportBPartner as the pattern:
  ImportAccount → ImportProduct → ImportPriceList → ImportInventory → ImportGLJournal → ImportInvoice → ImportOrder →
  ImportPayment → ImportBankStatement. Each judged vs legacy iDempiere running the SAME file (parallel run,
  `scripts/bridge/run_all.sh`).
- ⬜ B3 Opening balances: on-hand (`stock.quant` → `I_Inventory`), trial balance at cutover (→ `I_GLJournal`), open
  AR/AP (unpaid invoices → `I_Invoice`), open SO/PO (→ `I_Order`).
- ⬜ B4 "Localise": in the browser ERP, one guided flow — create the tenant with the Odoo CoA (Initial Tenant Setup),
  run the loaders in order, persist to IndexedDB. State the offline line honestly (§2026-07-22 AUDIT item 1).
- ⬜ B5 Proof witness: every imported count == manifest count; trial balance at cutover == Odoo's to the cent;
  stock on hand == Odoo's per product/location; falsifier (drop one file ⇒ RED).
- ⬜ B6 Named NOT-migrated list in the guide: closed history (optional), analytic, QWeb print layouts, server actions,
  non-core Odoo apps (MRP, HR, POS … arrive as plugins, AD-LAYER LAW §6).
**C — UI gaps for Odoo users** (owner lane: `ERP_FRIENDLY_OPS_LENS.md`; opt-in plugin, books unchanged)
- Done there: FO-A1 inline lines, FO-A2 next step, FO-A4 receive payment, FO-B related counts, FO-M1/M4/M5.
- ⬜ C1 Measure then build, in this order (what a migrant hits on day one): FO-E bank reconciliation, FO-D saved
  filters / group-by, FO-C quick-create in a field, FO-H pivot/graph, FO-F activity log, FO-G defaults.
**D — Guide + film** (only after B5 is green)
- ⬜ D1 `docs/ERPUserGuide.md` §2 "Move from Odoo": claims only what a `§` line proves.
- ⬜ D2 Film per `prompts/FILM_NARRATION.md` PLAYBOOK.

### §B0-SPEC (2026-11-08, owner: *"agreed, and it should show a pre-migrate summary report first before the OK button. There can be selection where the user may uncheck any master data that is not dependent upon. Some data model i assume will follow the normalisation as iDempiere ie Category or Parent extraction."*)
**1. Normalisation = iDempiere's, checked in its source (not assumed):**
| Odoo source | iDempiere target | Legacy rule it must satisfy (file:line) |
|---|---|---|
| `product.category` (has `parent_id`) | `M_Product_Category` + parent | must EXIST before products: `ImportProduct.java:224-226` looks up by Value, `:294-297` rejects `ERR=Invalid ProdCategory`. No `I_` table → loaded first by the window CSV import (`org.adempiere.impexp.GridTabCSVImporter`) |
| (none in Odoo) | `C_BP_Group` | `ImportBPartner.java:130-132` blank GroupValue → the tenant's DEFAULT group (legacy behaviour, not invented); `:144-147` rejects an unknown group |
| `res.partner` company row | `C_BPartner` (`I_BPartner`) | — |
| `res.partner` child (`parent_id` set) | `AD_User` contact under its parent BP | one `I_BPartner` row per contact, same BP Value |
| address fields on `res.partner` | `C_Location` + `C_BPartner_Location` | same row's Address1/City/Country |
| `product.product` (variant) | `M_Product` (`I_Product`) | template attributes → name/ASI; UoM must exist (`C_UOM_ID` lookup) |
| `account.account` (+ `account.group` if the localisation has rows) | `C_ElementValue` tree (`I_ElementValue`) | parent extracted IN the import: `ImportAccount.java:350-360` ParentValue → ParentElementValue_ID. Groups become summary accounts only if real `account.group` rows exist; else flat |
| `uom.uom`, `account.tax`, `account.payment.term`, `stock.warehouse`/`stock.location` | `C_UOM`, `C_Tax`(+`C_TaxCategory`), `C_PaymentTerm`, `M_Warehouse`/`M_Locator` | no `I_` table → window CSV import, before the masters that point at them |

**2. Load order** = the dependency order of the targets, read from the AD dictionary (FK columns of each target
table), never a hand list (AD-LAYER LAW §1): reference data → categories/groups/CoA → partners/products →
price lists → opening stock / opening GL / open invoices + orders.

**3. Selection (uncheck).** Each master is a row with a checkbox. Dependencies come from `AD_Column.IsMandatory` on
the FK in the target table:
- **mandatory FK** (e.g. product → category): the parent CANNOT be unchecked while a checked item needs it; its box is
  locked and says which items need it.
- **optional FK** (e.g. partner → payment term): may be unchecked; the summary states the effect ("38 partners get no
  payment term, legacy default applies").
Unchecking the item that depends (products) frees its parents again.

**4. Summary report before OK.** One row per master: Odoo count (from the agent's `manifest.json`) · will import ·
will be rejected + legacy reason text (`I_ErrorMsg`) · depends on · needed by; plus cutover totals (trial balance,
stock value, open AR/AP). The numbers come from running the SAME ported import code on a throwaway copy that is
discarded (where legacy has `IsValidateOnly`, ImportBPartner/ImportGLJournal, that is the legacy path itself). OK runs
the real import. This screen is a friendly-ops addition (writes nothing, books unchanged — `ERP_FRIENDLY_OPS_LENS.md §8`).
**Witness W-MIGRATE-SUMMARY:** summary counts == counts after OK, per master; uncheck a mandatory parent ⇒ refused;
uncheck an optional one ⇒ the stated effect appears in the imported rows; Odoo down / empty manifest ⇒ INCONCLUSIVE.

**5. New port needed (found while specifying):** the twin has the CSV Import toolbar ICON only
(`erp/ad_toolbar.js:20`), not the engine. Port `GridTabCSVImporter` (generic, every window, AD-LAYER LAW) → work item B2a,
before ImportProduct.

### §A-MOCK spec (2026-11-08, owner: *"We may run the normal Odoo server, but such free domain info can be obtained and mocked here"*)
**Issue it fixes (measured today):** the migrate witnesses talk to a LIVE Odoo that (a) is often stopped → they used to
print PASS with the non-invent check skipped, and (b) DRIFTS → `poc_p4_masters` went RED `35==48` products because the
`mrp` install on 2026-10-14 added 13 sale products (`product_product.create_date`), not because the extractor lost any.
**Design:** run the real Odoo ONCE, record every JSON-RPC answer, replay it from a file.
- `scripts/odoo_mock/odoo_rpc_mock.js record|replay [fixture]` — an HTTP server on `:8070`. **record** forwards each
  `/jsonrpc` POST to the real Odoo `:8069` and stores `{key: result}` (key = sha256 of `params` with the password masked);
  **replay** answers from the fixture only. An unrecorded call returns a JSON-RPC ERROR + `§ODOO-MOCK MISS` — never a made-up answer.
- Fixture `build/erp/odoo_fixture/odoodemo_<date>.json` + its sha256 in the header; every answer is a real recorded row.
- Callers take `ODOO_PORT` (default 8069) — the 4 migrate pocs + `gen_ad_odoo.js` + the agent (already env-driven).
- Verdicts: real Odoo or fixture reachable → judged; neither → `INCONCLUSIVE`, exit 3 (A1).
**Witness W-ODOO-MOCK-FIDELITY** (`scripts/poc_odoo_mock_fidelity.js`): each poc run live and on replay gives the same
`§`/✓/✗ lines; replay has 0 MISS; falsifier = one recorded count edited in a temp copy ⇒ that poc's verdict changes.

### §B1-SPEC — agent v2: the export the user runs (2026-11-08; facts `build/erp/logs_migrate_2026-11-08/odoo_fields_b1.log`, legacy formats read from the iDempiere `ad_impformat*` tables)
**Output** `odoo_export/` (cwd), one CSV per target, header row = the iDempiere column names, comma, `"…"` quoting
(what `ImpFormat.parseFlexFormat` reads) + `manifest.json` = `{odoo_version, db, cutover, files:[{file, target, rows}],
source_counts:{model: search_count}}`. The import formats ship as a 2Pack ("Odoo Migration" `AD_ImpFormat` + rows)
loaded by the twin's Pack In (`ERP_FRIENDLY_OPS_LENS.md §20.A`), so the File Loader can read the files with no hand setup.
Legacy ships only minimal examples (`Example BPartner` 9 cols, `Example Product` 6, `Accounting - Accounts` 9) — ours are wider, but every column is a real `I_*` column.
**Files, in load order** (live odoodemo counts 2026-11-08):
| # | file → target | Odoo source (verified field names) | rows |
|---|---|---|---|
| 1 | `uom.csv` → C_UOM (window CSV import, B2a) | `uom.uom` name, category, factor | 28 |
| 2 | `payment_terms.csv` → C_PaymentTerm (B2a) | `account.payment.term` name, lines | 11 |
| 3 | `product_categories.csv` → M_Product_Category (B2a) | `product.category` name + `parent_id` (3 levels deep) | 9 |
| 4 | `accounts.csv` → I_ElementValue | `account.account` code→Value, name, `account_type`→AccountType/Sign, `reconcile`; ParentValue blank (`account.group`=0 here → flat) | 47 |
| 5 | `bpartners.csv` → I_BPartner | `res.partner` with no parent: ref/id→Value, name, vat→TaxID, customer_rank/supplier_rank→IsCustomer/IsVendor, street/street2/city/zip/state/country code→Address1/2, City, Postal, RegionName, CountryCode; GroupValue blank → legacy default group | 12 BP (9 companies + 3 single people) |
| 5b | (same file) contacts | `res.partner` with `parent_id`: one row per contact, Value of the parent, ContactName/EMail/Phone | 26 |
| 6 | `products.csv` → I_Product | `product.product` default_code→Value, name, categ→ProductCategory_Value, uom→X12DE355, detailed_type→ProductType (consu/product→I, service→S), barcode→UPC, weight, volume, list_price→PriceList, standard_price→PricePO | 48 |
| 7 | `onhand.csv` → I_Inventory | `stock.quant` in internal locations: product→Value, location→LocatorValue, quantity→QtyCount, MovementDate = cutover | 36 |
| 8 | `opening_gl.csv` → I_GLJournal | trial balance per account at cutover (`account.move.line` posted, date ≤ cutover) → one balanced journal | (B3) |
| 9 | `open_invoices.csv`, `open_orders.csv` → I_Invoice, I_Order | unpaid posted invoices; confirmed orders not fully delivered/invoiced | (B3) |
**Open details to settle against the legacy oracle (not decided here):** the user's own company partner and the internal
users' partners (Odoo keeps them in `res.partner`) — legacy keeps them as Organization / AD_User, not customers;
variant attributes → name suffix vs ASI; the Value when Odoo `ref`/`default_code` is blank (Odoo id is the only real key).
**Witness W-ODOO-EXPORT** (recorded via the mock, §A-MOCK): rows per file == the Odoo count for that slice; every
Value unique; every reference (category, UoM, parent BP) found in an earlier file; falsifier = drop a category ⇒ the
products that need it are named.

### §B2a-SPEC — port the window CSV Import, generic (2026-11-08, read from iDempiere source before code)
**Legacy mechanism (file:line):** toolbar CSV Import is ENABLED only if `isNewEnabled() && gridTab.hasTemplate()`
(`AbstractADWindowContent.java:2284`, `GridTab.java:2255`) → `CSVImportAction` → `GridTabCSVImporter.fileImport(gridTab,
childs, stream, charset, importMode)` (`GridTabCSVImporter.java:132-306`). A template is an `AD_ImportTemplate` row per
tab: `CSVHeader` / `AliasCSVHeader`, allowed modes per role via `AD_ImportTemplateAccess` (`MImportTemplate.getTemplates
:165`, `isAllowed:201`); the file's first line MUST equal CSVHeader or the alias, else `WrongCSVHeader` (`validateFile:239-270`).
Header syntax (`getColumnName:873-905`, `mapCSVHeader:354`): `Col` plain · `Col[KeyCol]` = look up the referenced record
by that column (`resolveForeign:1645`, region-by-country `:1717`) · `Col/K` = key column for update/merge. Modes insert /
update / merge (`:850-862`). Per row: `preprocessRow:960` → `validateSpecialFields:1056` → `proccessRow:1152` (fills the
GridTab, so the tab's own defaults/callouts apply, then saves) → `processDocAction:832` when the tab is a document; detail
tabs via `mapCSVDetail:410`. Output = the input file plus a per-row result column.
**Twin port:** ONE generic module over the twin's existing GridTab save path (no table names in code, AD-LAYER LAW);
toolbar enablement read from `AD_ImportTemplate`. **Seed gap:** `ad_importtemplate` + `ad_importtemplateaccess` do not
exist in `ad_seed.db` → add the tables by a patch SQL + the self-heal loader (DB rule), never a binary. The pilot has 0
template rows, so the "Odoo Migration" 2Pack carries the templates for: UoM, Payment Term, Product Category, Warehouse + Locator.
**Oracle:** the same CSV through the pilot's own ZK window CSV Import (headless, `localhost:8088`), then compare the
created rows column by column. **Witness W-CSV-IMPORT:** denominator = every tab with a template in the pack; created
rows == legacy's; a header that differs from CSVHeader is refused with legacy's message; an unknown `[Key]` value fails
that row only, with legacy's text.
**B1 follow-up found here:** the export's headers must EQUAL the template CSVHeader, so the `odoo_*` provenance
columns move to a sidecar `provenance.json` (row → Odoo model + id); the summary screen reads it.

### §A3-LEDGER — ERP witness sweep 2026-11-08 (bim-ootb origin/main 59d9a323, `/tmp/wt-erp-sweep`, nice 19 / ionice idle / 3 parallel / 420 s)
Results: `build/erp/erp_sweep_2026-11-08/witness/results.tsv` + `logs/`; re-run (2 parallel, 1500 s): `…/rerun/`. Runner = the
scratch `erp_sweep.sh` (load guard: waits while loadavg ≥ 14 — the machine is shared with other sessions + the owner's Firefox).
**First pass: 232 run → 188 exit 0, 29 exit 1, 7 timeout, 5 exit 2, 3 exit 3.** Classified:
| Class | Witnesses | Outcome |
|---|---|---|
| STALE INSTRUMENT — sql.js JS 1.14.1 (node_modules) + shipped wasm (another build) → `TypeError: y is not a function` | changelog_rule, dashboard_dict/docstatus/performance/select, dict_census, goal_engine, quicksetup, setup_lens, window_lens | ✅ bim-ootb #2714 merged; all PASS, dict_census judges again = RED BY DESIGN (gap census 85/198, was 78) |
| STALE INSTRUMENT — deleted file | local_time (`pos_lens.js`, deleted #2585) | ✅ #2714, PASS 3/3 |
| STALE INSTRUMENT — host refactors | master_save_rules (`_modelAfterSaveGo`/`_modelDeleteGo`/`_sideTables`, `withSidecar`, `_modelSession`), erp_engine_subset (`taxLookup` caller → till_core.js) | ✅ #2720 merged; 21/21 PASS, engine_subset PASS |
| WRONG EXPECTATION | gridtab_live Asset Group (expected insert_Accounting; legacy MAssetGroup.afterSave copies the default group's rows = 0) | ✅ #2719 merged; 128 windows GAP=0. Named non-core gap: twin has no MAssetGroup.afterSave port |
| GUARD FALSE POSITIVE | core_untouched CU4 (overlay module named in a COMMENT in plugins/mf_lens.mjs:5) | #2721 auto-merge; PASS, falsifier (real import) still fails |
| STALE ORACLE — clock | fn_parity sql-converter 8 cases (SYSDATE recorded 2026-10-15) | #2722 auto-merge (stale clock cases reported, not judged) + oracle re-recorded today (read-only): 48/48 PASS |
| **PILOT DRIFT** (legacy baseline moved; twin unchanged) | ws_diff_read (2 `WS Write One B` BPs, created 2026-10-21), movement_diff (product 124 @101: pilot 0 + a 2026-11-04 layer of 6, seed/pilot_snap 15) — likely also views_parity, post_*_diff, inventory_diff (re-run pending) | ✅ DECIDED 2026-11-08 — owner: restore *only if backward compatible*. Measured: schema + dictionary IDENTICAL (1086 tables, 30979 columns, 83 functions, AD unchanged since 2026-01-28), but 119 tables differ in rows and the pilot carries LIVE work of other lanes since the snapshot (10 CAPEX migrations 2026-11-02..04, +53 WS types / +173 WS params, the CAPEX projects twinned 121/121 + 160/160, +3 roles, +2 doctypes, +2 UoM, +24 products) → a restore is NOT backward compatible → NOT done. These witnesses need a baseline that starts equal to the seed; next step = a SEPARATE baseline db (pilot_snap + the same migrations), never the live pilot. Was: `pilot_snap` = the clean baseline (qty 15, 0 WS BPs, last inout 2026-10-13). Restoring `idempiere_pilot` from it is destructive on a SHARED db the ERP session + the running iDempiere server use |
| NEEDS INPUT (not standalone) | pos_chain, pos_plan, team_floor (PC_LINES/FL_LINES fixture never committed — POS_PLUGIN_LOCAL_FIRST.md:295,759), team_keys (KW_OLD) | known to their lanes; not suite members as written |
| NOT A WITNESS | acct_processor_mutants (a data module, `module.exports = [...]`) | exits 0 silently — rename or exclude from the glob |
| ENV | udp2_engine, udp3_find_engine, udp1_pinstance (`better-sqlite3`, lives in bim-compiler/node_modules) | in the re-run with that NODE_PATH |
| RE-RUN 2026-11-08 (2 parallel, 1500 s, `…/rerun/results.tsv`) — **were only slow or env** | inventory_diff 125/125, team_releases 37 + 15/15 mutants, team_ui_pos 20/0, team_versions 29/0 (first-pass timeouts) · udp1_pinstance 52/52, udp2_engine, udp3_find_engine (better-sqlite3 on NODE_PATH) · views_parity 20/21 (was 12/21 under 3-parallel load) | GREEN, no change needed |
| HANG AT EXIT (every step green, never exits in 1500 s) | hq_clerk (H1..H12 🟢), pos_sales_live (POSL1..8 🟢), attach_live (first pass: `§W-ATTACH HARNESS-ERROR browser.newContext: … has been closed`, then IGNORED `timeout`'s SIGTERM for 4 h 52 min until killed — its lane is active in another session) | an open handle keeps node alive — instrument, next session |
| DEAD UI — witness of a panel no user can open | `erp/tests/poc_erp_picker.js` clicks `#pill-migrate` (retired #339); `erp_picker.js` `_renderOdoo` is reachable only via `openMigrateFor`/`erp_pills._picker`, which nothing calls | the live door is `common/about_diy.js`; retire the poc or repoint it (B4 decides where the load-back lives) |
| OPEN — next session | packgen (plugin install now SysAdmin-only, witness session has no role), packout O6, view_window_first (window 255 "Record 1 of 198" but 0 grid rows), mf_seed (B2), team_executors (10 of 18), movementconfirm_ui, erp_i18n, views_parity (1 of 21), udp_order 160/162 + udp4 61/62 (still red solo), post_invoice_diff / post_matchinv_diff / shopday_model_path INCONCLUSIVE | same result solo → not load flakes; each needs its own read |

### §PANEL-LINK (2026-11-08, owner: *"Is the Odoo migration linked to the early days migration panel or it overwritten that?"*)
**Measured on bim-ootb origin/main:** NOT overwritten, NOT yet linked. The early panel is the About/DIY "Bring your data in"
box (`common/about_diy.js:204`, Odoo row) + the staged Odoo box in `erp/erp_picker.js` (① download `odoo_agent.zip`
② `npm install && node agent.js` ③ drop `odoo_chain.json` → re-fold one sales order, §ODOO-MIGRATE-BROWSER). The new
`export.js` rides in the SAME zip (#2709) but no panel mentions it or reads `odoo_export/`.
**Rule for B4 (one implementation per responsibility, AD-LAYER LAW §5):** extend THAT panel, do not add a second door —
step ② gains `node export.js`, step ③ accepts the `odoo_export/` files → the §B0 summary report (with the uncheck list) → OK
runs the imports. The one-order fold stays as the books-to-the-cent check. `docs/migrate_status_panel.html` (the docs status
map) is updated when B4 ships, not before (it may only claim what a § line proves).

### §OWN-DB-SPEC (2026-11-08, owner: *"older lets a demo Odoo migration, thus user has option to point to own DB?"* → "proceed")
**Measured:** `agent.js:21-23` + `export.js` read `ODOO_HOST/PORT/DB/LOGIN/PASSWORD` (default `odoodemo` @ localhost:8069,
admin/admin); the panel says only "override creds via env (see the bundle README)" (`erp_picker.js:324`); `agent.js`
defaults to demo order `S00023`, which a real Odoo does not have. Env-prefix syntax is POSIX-only (fails in Windows cmd).
**Build:**
1. Bundle `cli.js` (shared by agent.js + export.js): flags `--host --port --db --login --so --cutover` (any shell), env still honoured,
   flag wins. **Password never in the browser and never on the command line:** if `ODOO_PASSWORD` is unset and the target is not the
   demo (db≠odoodemo or login≠admin), the agent asks for it in the terminal (hidden on a TTY, one stdin line otherwise).
2. `agent.js` on a non-demo DB with no `--so`: picks the most recent sale order that has a posted customer invoice
   (`date_order desc, id desc`), prints which one (`§ODOO-AGENT so=… picked=latest-invoiced`); none → says so and exits 1.
3. Panel step ② (`erp_picker.js` `_renderOdoo`): four fields — host, port, database, login — pre-filled with the demo; the command
   below rebuilds as you type: demo = `node agent.js && node export.js`; own = the same with `--host … --db … --login …`. No password
   field. `§MIGRATE-OWN-DB fields=4 demo=Y|N password_field=N cmd=<…>`.
**Witnesses:** W-ODOO-OWNDB (bim-compiler `scripts/poc_odoo_owndb.js`, via the §A-MOCK replay): flags reach the RPC
(the login call carries the db/login given), password read from stdin when not in env, demo path still needs no prompt,
non-demo with no `--so` picks the latest invoiced order (== the RPC answer), wrong password → exit 1 with Odoo's refusal, no
`odoo_*` change to the export bytes. Panel: `poc_erp_picker.js` reads `§MIGRATE-OWN-DB` — typing a db changes the command,
no `<input type=password>` exists.

### §OWN-DB RESULT (2026-11-08) — bim-ootb #2723 (auto-merge), W-ODOO-OWNDB 🟢
`erp/odoo_agent/cli.js`: `--host --port --db --login --so|latest --cutover` (any shell), env still works, flag wins, no flags = demo.
Password: never a flag (refused), never the browser; asked in the terminal for a non-demo target, or `ODOO_PASSWORD`.
`agent.js` on your Odoo / `--so latest` → your newest order with a posted customer invoice. `export.js` is atomic
(`odoo_export.partial/` → renamed on success); a login without read rights → plain refusal naming the record type, exit 1,
nothing left. Witness `scripts/poc_odoo_owndb.js` (log `build/erp/logs_migrate_2026-11-08/poc_odoo_owndb.out`): demo
unchanged · demo user by flag + prompt logs in · `--so latest` S00030 == oracle of 4 · wrong password exit 1 · `--password`
refused · env password no prompt · `--port` routes all 30 calls · no-rights login refused, nothing written · demo export
byte-identical fdbde73d75c0d07b.
**Panel finding (changes §PANEL-LINK):** the staged Odoo box (`erp_picker.js _renderOdoo`) is DEAD UI since #339 — the live
door is the About/DIY modal, whose own doctrine (`about_diy.js:14-16`) is "hand the download, point at the README, never
re-author commands". So the fields were NOT added (reverted before the PR); the README + DIY note carry the flags.
**✅ ANSWERED 2026-11-08 — owner: "agree B" (inside the ERP, the File Loader way). Was ⛔ owner question for B4:** the summary-before-OK screen needs a page that LOADS `odoo_export/`. The About/DIY modal is
download-only by design. Put the load-back + summary (a) in the About/DIY modal (changes its doctrine), or (b) as an ERP
window/form inside the tenant (the File Loader way: legacy loads import files from a form, VFileImport)?

### §B4-SPEC — the "Odoo Migration" form inside the ERP (2026-11-08, owner chose B)
**Shape, following legacy:** legacy loads import files from a FORM (`AD_Form 101 org.compiere.apps.form.VFileImport`, ported as
FS-16) and then runs the Import processes. Odoo migration is NOT core (AD-LAYER LAW §6), so it arrives as a **plugin bundle**
(the Ninja/plugin path, `ERP_FRIENDLY_OPS_LENS.md §20-27`): a 2Pack carrying (1) the `AD_ImpFormat` rows for the `I_*` files,
(2) the `AD_ImportTemplate` rows for the window-CSV files (B2a), (3) one `AD_Form` + menu entry "Migrate from Odoo".
Zero host code: the form is generic plugin UI that drives the EXISTING engines (window CSV Import, File Loader, Import processes).
**The form, in order:**
1. Pick the `odoo_export/` files (multi-file input; the browser reads them locally, nothing is uploaded) → validates
   `manifest.json` (files listed == files given, row counts == file rows) and `provenance.json`.
2. **UoM mapping step:** each Odoo UoM → an iDempiere UoM (suggested only on an exact name match; the user confirms the rest).
3. **Summary report (before OK)** per §B0-SPEC §4: one row per master — Odoo count · will import · will reject (+ legacy reason) ·
   depends on · needed by; checkboxes with the mandatory-FK locks; cutover totals. Numbers = the same import code run on a
   throwaway copy (§B0 4).
4. **OK** → runs, in load order, window CSV Import (UoM, payment terms, categories, warehouses, locators) then File Loader +
   ImportAccount / ImportBPartner / ImportProduct / ImportPriceList / ImportInventory (+ B3 later); one signed op group per step.
5. **Result** = the summary again with the real counts beside the predicted ones (they must be equal — W-MIGRATE-SUMMARY).
**Panel link:** the About/DIY Odoo note gets one more sentence: "then, in the ERP, open *Migrate from Odoo*" (it stays download-only).
**Order of work:** B2a (window CSV Import) → B2 (Import processes) → this form → B5 proof → guide → film.

### §NINJA-MIGRATE study (2026-11-08, owner: *"investigate from my Ninja legacy has data migration which is multi sheet and follows an abstract AD model so that it can apply to any data model"*)
**Source:** `~/Projects/red1_plugins/org.red1.ninja/src/org/ninja/process/MigrateExcelData.java` (SvrProcess, the owner's own
iDempiere plugin; registered in `PLUGIN.txt`). The newer `~/Projects/org.idempiere.ninja` `NinjaProcessor.processDataSheet` (:1315)
is a thinner variant (raw SQL INSERT, headers by column *display name*, no lookups, no PO) — the rich one is MigrateExcelData.
**What it does (read from the code):**
- **One workbook, one sheet per TABLE:** sheet name = `AD_Table.TableName` (case-insensitive); a sheet naming no table is skipped.
  Param `Processed=Y` strips a 2-char prefix from the sheet name, so sheets can be ordered (`01C_BPartner`, `02…`).
- **Row 1 = AD column names**; each must be an `AD_Column` of that table, else the run stops ("No such column").
- **`_ID` columns are given as human values, resolved through the dictionary:** the referenced table = column name minus `_ID`,
  else via the column's `AD_Reference_Value_ID` → `AD_Ref_Table.AD_Key` (so `M_Product_Category_Parent_ID` resolves to
  `M_Product_Category`); match on **Name**, System client first, then the tenant. Header `Col>AltCol` matches on another column
  (`C_Location_ID>Address1`), one nested level (`C_BPartner_Location_ID>C_BPartner_ID`). A `…Line` table finds its parent by
  `DocumentNo`. A lookup table without a Name column takes an integer as-is.
- **Every row is saved through the table's own model class** (`MTable.getPO(0)` → `set_ValueOfColumn` → `po.save`), so the
  model's defaults, beforeSave/afterSave and validators run (e.g. BP → acct rows, tree node). Values converted by AD reference
  (dates 15/16, numbers 12/22/29/37). Client/User/Org from the login. One process run = one transaction (all or nothing).
- `IsActive=Y` = UPDATE mode keyed on the first TWO columns (+ an optional `WhereClause`).
**Why it fits the migration (AD-LAYER LAW, "any data model"):** no per-table code at all — the dictionary decides columns,
lookups and types, and the model class decides behaviour. The normalisation the owner asked for is just more sheets
(`M_Product_Category` before `M_Product`, `C_BPartner` → `C_Location` → `C_BPartner_Location` → `AD_User`), and the §B0
summary/uncheck maps one-to-one onto sheets (a sheet's FKs = its dependencies).
**Limits seen in the code (to fix or state, not hide):** SQL by string concatenation in lookups (`WHERE Name='…'` — an apostrophe
breaks it); Name is not unique (Odoo has two categories named "Saleable" → needs `>Value`); at most 5 alternate lookups per sheet
(`String[5]`); update mode keys on columns 1+2 only; no DocAction, so documents (opening stock, opening journal) are saved
Drafted, not completed; old POI API (`HSSFCell.CELL_TYPE_*`) — the plugin is not installed on the pilot, so no live oracle yet.
**Consequence for the plan (owner decision):** porting MigrateExcelData (≈250 lines, one generic loader, a plugin) could
REPLACE B2a (`GridTabCSVImporter`, 1,856 lines) + most of B2 for MASTER data; the `I_*` Import processes would stay only where
legacy business logic matters (Import Inventory / GL Journal complete their documents) — or a DocAction step is added.
