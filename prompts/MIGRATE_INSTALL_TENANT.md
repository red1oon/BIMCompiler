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

### §NINJA-DECISION (2026-11-09, owner) — the Ninja multi-sheet route is ADOPTED for all data migration
> *"Yes you got the Java class right. I do remember the apostrophe issue and thought i have solved it there. I am not sure why it
> has those 5 limits … This need no legacy as to prove it works is already in the Kernel ERP spine of AD data relationship and
> coherently appear when accessed thru the main menu … smaller abstract solution to all data migration. My concern is 3rd party
> such as Odoo, may miss certain mandatory table properties and intra table relationship ie _ID and <table>line for master detail
> control. Those should be there. If not u need to patch so."* · *"But if u can install the Ninja OSGi plugin (some upgrade version
> may be needed) at the legacy side it be good"*
**Code answers (read 2026-11-09):** apostrophe — SOLVED for the INSERT (values go through `po.set_ValueOfColumn` → `po.save`,
parameterised); STILL OPEN in the lookups (`WHERE Name='…'`, `WHERE DocumentNo='…'`, alt lookups) and UPDATE mode (only `"` is
stripped). The "5" — no comment / guide / technical note explains it: it is the array size `new String[5]` of `lookupAlt`/
`columnAlt`, and `cellcnt` is NOT reset per sheet → 5 `>` lookups per WORKBOOK; a 6th throws. Both fixed in the port.
**This supersedes** §B1's I_*/CSV-template file set and §B2a (GridTabCSVImporter) for master data; B2 Import processes stay only
where a document must be COMPLETED (opening stock / opening GL) — or the loader gains a DocAction step (owner to see the measure).

### §SHEET-CONTRACT — every exported sheet is complete against the AD dictionary (owner's concern, spec 2026-11-09)
Measured from `ad_seed.db` (origin/main): the mandatory columns of the 17 target tables. The exporter writes ONE workbook, sheets in
load order, sheet = TableName, header = AD ColumnName, and for each target table each mandatory column is ONE of:
1. **supplied** from an Odoo field (the mapping, §B1);
2. **defaulted by the dictionary** (`AD_Column.DefaultValue`, e.g. `M_Product.ProductType=I`, `M_Locator.PriorityNo=50`) or by the
   model class's constructor — the PO save applies these, the sheet leaves them out;
3. **PATCHED** — Odoo has no such property: the exporter fills it by a NAMED rule, written in `manifest.json` `patches[]` with the
   row count, and shown on the summary screen. Found by the measure (no Odoo field, no default): `C_BPartner.C_BP_Group_ID` (the
   tenant's default group), `C_ElementValue.C_Element_ID` (the tenant's account element), `M_Product.C_TaxCategory_ID` (default tax
   category), `C_Location.C_Country_ID` (from the Odoo country code), `M_Warehouse.C_Location_ID` (the Odoo warehouse's partner
   address), `M_Inventory.C_DocType_ID` (Material Physical Inventory), `M_PriceList.C_Currency_ID` (company currency),
   `M_PriceList_Version.M_DiscountSchema_ID` (the tenant's default schema), `C_UOM.X12DE355` (the UoM mapping step).
**Master–detail (the `_ID` / `<table>Line` control):** every detail sheet carries its parent's key column, taken from the AD tab
link (the child tab's link column to the parent tab), not guessed from names: `M_InventoryLine.M_Inventory_ID` (by DocumentNo —
also Ninja's own Line rule), `C_BPartner_Location.C_BPartner_ID`, `AD_User.C_BPartner_ID`, `M_Locator.M_Warehouse_ID`,
`M_ProductPrice.M_PriceList_Version_ID`, `M_Product_PO.M_Product_ID`. A parent row must come in an EARLIER sheet.
**Witness W-SHEET-CONTRACT:** for every sheet, every mandatory column of its table is supplied / defaulted / patched (0 missing),
every patch is listed with its count, every detail row's parent key resolves to a row of an earlier sheet; falsifier: drop the
`C_BP_Group_ID` patch ⇒ the C_BPartner sheet is reported incomplete.

### §NINJA-LEGACY-INSTALL plan (2026-11-09, owner asked; measured feasibility)
- Pilot = iDempiere **13** (`org.adempiere.base_13.0.0`), POI **5.2.2** as bundles; the old `org.red1.ninja` is 6.1-era. The NEWER
  `~/Projects/org.idempiere.ninja` already targets JavaSE-17 + imports POI packages → it is the upgrade vehicle: MigrateExcelData
  moves in as `org.idempiere.ninja.process.MigrateExcelData`.
- **Upgrade needed, measured:** compiling MigrateExcelData unchanged against the pilot's jars = 6 errors, ALL the POI 4+ cell-type
  enum (`HSSFCell.CELL_TYPE_FORMULA/NUMERIC/STRING` → `CellType.*`); every iDempiere API it uses compiles as is. With that fix:
  0 errors (scratch build, owner's repo untouched). Plus the owner-approved fixes: parameterised lookups (apostrophe), unlimited
  per-sheet alt lookups, `.xlsx` (WorkbookFactory), master-detail from the AD tab link (Ninja's Line/DocumentNo rule kept).
- **Run without touching the live server:** `RUN_Ninja.sh` = `./idempiere -application org.idempiere.ninja.NinjaApplication` — a
  separate headless JVM. Legacy run = a COPY of the pilot server folder pointed at a throwaway db copy (never `idempiere_pilot`,
  which other lanes use; the OSGi console on localhost:12612 is NOT needed). Registration of the process = an additive SQL
  migration in the plugin (as the CAPEX lane did).
- **Proof stays the owner's:** the ERP spine — migrated rows open coherently from the main menu windows (master + detail tabs,
  lookups resolved). The legacy run is a cross-check, not the gate.
**Order:** ✅ W-SHEET-CONTRACT + exporter v3 (workbook) DONE 2026-11-09 (§EXPORTER-V3 RESULT) → ✅ Ninja loader port in the twin (plugin) DONE 2026-11-09 (§NINJA-LOADER RESULT, bim-ootb #2734) → **NEXT** G1 genesis through PO.save → B4 form → legacy cross-check → guide → film.

### §EXPORTER-V3-SPEC — one workbook + the measured contract (2026-11-09, spec before code; resumes §SHEET-CONTRACT)
**Correction to §SHEET-CONTRACT rule 2 (read in source, not assumed):** legacy `PO.save` does NOT apply `AD_Column.DefaultValue`
(that is `GridField`, the UI only). A column a sheet leaves empty is filled, in this order, by: (a) `PO.setStandardDefaults`
(`PO.java:1973-2002`: key, Created/Updated(By), IsActive, AD_Client/Org, Processed, Processing, Posted); (b) the model class's
`setInitialDefaults()` (e.g. `MPaymentTerm.java:77-87`, `MUOM.java:207-213` — commented lines do not count); (c) the database column
DEFAULT, because `PO.buildInsertSQL` skips NULL values "allows Database defaults" (`PO.java:3735-3738`). Anything else left empty =
NOT NULL violation on legacy, or a red mandatory field in the window. The twin's SQLite DDL has NO defaults and no NOT NULL
(measured, `ad_seed.db` `C_BPartner`, `M_Locator`), so the twin loader (next item) must apply (a)+(b)+(c) itself — from the same
measured contract file, never a hand table.
**Required set per target table** = `AD_Column.IsMandatory='Y'` (ad_seed.db) ∪ pg `NOT NULL` (pilot `idempiere_pilot`, iDempiere 13),
minus the PO-standard columns and `<Table>_UU` (PO sets the UUID on save).
**Measurer** `scripts/sheet_contract_measure.js` → `build/erp/sheet_contract.json`: per table, each required column with its default
source (`po-standard` | `model:<Class>.java:<line>` | `db-default:<expr>` | `none`), plus the sha of every source read. Log
`build/erp/logs_migrate_2026-11-09/sheet_contract_measure.log`. Re-measured, not edited by hand.
**Patch rules are the legacy Import processes' own rules**, written as Ninja alt-lookups so the TENANT resolves them at load (the
exporter never knows the tenant's ids):
| Column | Sheet cell | Legacy rule copied |
|---|---|---|
| `C_BPartner.C_BP_Group_ID` | `C_BP_Group_ID>IsDefault` = `Y` | `ImportBPartner.java:129-132` (default group of the client) |
| `M_Product.C_TaxCategory_ID` | `C_TaxCategory_ID>IsDefault` = `Y` | `ImportProduct.java:415` |
| `M_PriceList_Version.M_DiscountSchema_ID` | `M_DiscountSchema_ID>DiscountType` = `P` | `ImportPriceList.java:97-98` (MIN id, DiscountType P) |
| `C_ElementValue.C_Element_ID` | `C_Element_ID>ElementType` = `A` | `ImportAccount.java:130-143` (the element the user names; the account element of the tenant) |
| `M_Inventory.C_DocType_ID` | `C_DocType_ID>DocBaseType` = `MMI` | `ImportInventory.java:207-208` |
| `C_UOM.X12DE355` | blank, filled by the B4 form's UoM mapping step | none in Odoo (§B1) |
Supplied, not patched: `C_Location.C_Country_ID>CountryCode` (Odoo country code), `M_PriceList.C_Currency_ID>ISO_Code` (company currency).
**Workbook** `odoo_export/odoo_migration.xlsx` (SheetJS 0.18.5, the twin's own vendored `erp/xlsx.mini.min.js`, bundled in the agent
zip — the agent stays npm-free), sheets in load order, sheet name = `NN` + TableName (Ninja's 2-char order prefix, `Processed=Y`),
row 1 = AD ColumnNames, lookups `Col>AltCol`. Order: C_UOM, C_PaymentTerm, M_Product_Category, C_ElementValue, C_BPartner, C_Location,
C_BPartner_Location, AD_User, M_Product, M_Product_PO, M_PriceList, M_PriceList_Version, M_ProductPrice, M_Warehouse, M_Locator,
M_Inventory, M_InventoryLine. Lookups use a UNIQUE key of an earlier sheet: Value where the target has one (categories by Value —
Odoo has two categories named "Saleable"); C_Location rows are referenced by `C_Location_ID>Address1` only when Address1 is unique
in the sheet (measured: 12 addresses, 0 duplicates) — else the witness fails it. Own-company / internal-user partners stay OUT of the
workbook and are listed in `manifest.json` `held[]` (decide in the summary screen, §B1). `manifest.json` gains `patches[]`
`{table, column, cell, rule, rows}`; `provenance.json` maps every sheet row → its Odoo record. CSV files are retired (superseded by
§NINJA-DECISION).
**Witness W-SHEET-CONTRACT** (`scripts/poc_sheet_contract.js`, live Odoo or the recorded fixture): for every sheet, every required
column of its table is supplied / defaulted (per the contract file) / patched-with-a-manifest-entry → `missing=0`; every lookup
header names a real AD column; every `>` lookup value resolves to exactly ONE row of an earlier sheet (or is a patch); detail sheets
carry their AD tab-link parent column; sheet rows == live `search_count` (non-invent); replay == live byte-for-byte on the sheets.
Verdict INCONCLUSIVE when no Odoo and no fixture, or when a sheet is empty. Falsifiers: drop the `C_BP_Group_ID` patch ⇒ the
C_BPartner sheet reports `missing=C_BP_Group_ID`; duplicate one Address1 ⇒ the lookup is reported ambiguous.

### §EXPORTER-V3 RESULT (2026-11-09) — bim-ootb #2732 (auto-merge), W-SHEET-CONTRACT 🟢 live + replay
- **Contract measured** `scripts/sheet_contract_measure.js` → `build/erp/sheet_contract.json`, log `logs_migrate_2026-11-09/sheet_contract_measure.log`:
  17/17 tables; default sources read from source = PO.setStandardDefaults (`PO.java:1973`), PO.saveNew DocumentNo/Value from the sequence
  (`PO.java:3564/3594`), the model's `setInitialDefaults()` (line per column), pg DEFAULT (pilot); **36 columns must be supplied** (were 44 before
  the saveNew rule was read — Value/DocumentNo are filled by legacy itself).
- **Exporter v3** writes `odoo_migration.xlsx` (17 sheets) + manifest (`patches[]` 10, `held[]` 8 internal partners) + provenance; CSVs retired.
- **W-SHEET-CONTRACT** `scripts/poc_sheet_contract.js`, logs `logs_migrate_2026-11-09/poc_sheet_contract.{log,out}` (live) and `poc_sheet_contract_replay.out`,
  fixture `build/erp/odoo_fixture/odoodemo_export_v3_2026-11-09.json` (30 answers; `SHEETC_MODE=replay` forces it): missing=0 on 17 sheets · 0 non-AD
  headers · 0 blank required · 0 ambiguous/unresolved lookups · parent links present · rows == live counts (partners 7 + contacts 23 + held 8 = 38) ·
  replay == live · deterministic · falsifier 1 (drop the group patch ⇒ `05C_BPartner: C_BP_Group_ID`) · falsifier 2 (dup Address1 ⇒ `→ 2 row(s)`).
  It caught 3 real defects on the first run (all fixed): a non-AD header `odoo_lot` (Ninja would stop: "No such column"), the witness's own
  dictionary read (sqlite returned `ad_ref_table`'s lower-case names → parent lookup unresolvable), and M_Product_PO 31 rows vs 30 sellers =
  one template-level seller on a 2-variant product (now judged per distinct seller, expansion reported `9×2`, pairs unique).
- **Fresh unzip** of `odoo_agent.zip` (SheetJS added by the build script), no npm install → 17 sheets (`logs_migrate_2026-11-09/zip_fresh_unzip_export.out`). CI W-AGENT-ZIP-SYNC required the zip == its folder → `xlsx.mini.min.js` is vendored INTO `erp/odoo_agent/` (re-copied by the build script, like erp_kernel.js), not staged.
- Retired (deletion budget): `scripts/poc_odoo_export.js` + its CSV fixture `odoodemo_export_2026-11-08.json` (W-ODOO-EXPORT → superseded by W-SHEET-CONTRACT).
- **Named, not hidden (for the summary screen / later items):** 16 stock lines carry an Odoo lot (in provenance, no ASI step yet); 1 negative
  quant (E-COM11 −7); 2 multi-installment payment terms (term only, installments in provenance); CoA flat (0 `account.group`); C_UOM rows will
  duplicate system UoMs unless the B4 mapping step maps them — the mapping step must REWRITE the C_UOM sheet + the `C_UOM_ID` cells, not just fill X12DE355.
- **For the next item (Ninja loader port in the twin):** the twin's SQLite has no DB defaults → the loader applies `sheet_contract.json`'s default
  sources (po-standard / po-savenew / model / db-default) itself; resolve `Col>Alt` with parameterised SQL and REFUSE an ambiguous match (falsifier 2's rule).

### §NINJA-LOADER-SPEC — MigrateExcelData in the twin, as a plugin (2026-11-09, spec before code)
**Read first (twin, bim-ootb `f73e8c3b`):** the twin already has the whole PO save path (`erp/model_layer.js`: newPO = PO.setStandardDefaults +
`MODEL[t].initialDefaults` (`model_master.js` MASTER registry), Trx.insert stamps `ad_ddl_default` (1,703 pg defaults, `patches/ad_seed.db.sql`),
saveNew DocumentNo/Value from the sequence, beforeSave → validators → afterSave, unique indexes from `ad_ddl_unique`). It has NO NOT NULL. A plugin
brings a process the POS way (`plugins/pos_integration.mjs` dictionary rows + hot chunk `defineProcess`, witness `tests/witness_pos_sales.js`).
A tenant is born by the ported Initial Client Setup (`genesis.js` birthTenant + mergeGenesisInto).
**Files:** `erp/plugins/ninja_migrate.mjs` (bundle `org.idempiere.ninja.migrate`, id band 9540001-9540999: AD_Process 9540001 "Migrate Excel Data"
class `org.idempiere.ninja.process.MigrateExcelData`, its 4 AD_Process_Para = exactly what prepare() reads — File_Directory, Processed, IsActive,
WhereClause; a menu leaf under Data Import (163); access for roles 0 and 102) + hot chunk `erp/plugins/ninja_migrate_process.mjs` (the class, and
`mapUom(book, answers)` for the B4 form). Host code: 0 lines (the INSTALL_ONLY list + sw.js precache are file names only).
**Kept from the Java (read, `org.red1.ninja/.../MigrateExcelData.java`):** sheet = AD_Table.TableName, case-insensitive; `Processed=Y` strips the
2-char order prefix; a sheet naming no table is skipped and logged; a header that is not an AD_Column of the table STOPS the run with the legacy text
"No such column. Check your Excel sheet+column:<Table>-<Column>"; one PO per row (`MTable.getPO(0)` = `ML.newRecord`) → set each cell → save;
value by AD reference (15/16 date, `' 00:00:00'` appended under 12 chars; 12/22/29/37 BigDecimal); `_ID` lookup: table = column minus `_ID`, else
the column's AD_Reference_Value_ID → AD_Ref_Table.AD_Key's table; `<Table>Line` finds its parent by DocumentNo; `Col>Alt` = match on Alt;
`X_ID>Y_ID` = one nested level; a lookup table with no Name column takes the integer as is; `IsActive=Y` = UPDATE mode keyed on the first two
columns (+ WhereClause); the answer "No worksheets : N" + "(<Table> = n records) " per sheet.
**Fixed (owner-approved 2026-11-09 or named here), each one a §-line:** F1 every lookup/update value is a bound parameter (apostrophe); F2 alt lookups
are per header, unlimited (legacy `String[5]` + a counter never reset per sheet); F3 a lookup is scoped to the login tenant first, then System (0) —
legacy alt lookups have NO client filter and would take another tenant's default group; F4 a lookup matching more than one row in the same tier is an
ERROR (legacy takes the first); F5 the lookup column's reference is read from THIS table's AD_Column (legacy: the first column of that name in any
table); F6 a blank cell sets nothing, so the PO default stands (legacy: `new BigDecimal("")` throws, a blank name lookup throws); F7 all-or-nothing:
any row error → nothing is committed and the answer lists every error (sheet, row, column, reason) — legacy postgres aborts the transaction at the
first failed statement, so a partial import is not legacy either; F8 a saved row with an empty AD-mandatory column is an error (legacy: the pg NOT
NULL at the INSERT; measured equal on the 17 tables — the only pg-only NOT NULL, `M_Product.UnitsPerPack`, has DB default 1); F9 the file is the
workbook the host hands in (the twin cannot open a server path) — the SheetJS workbook object, read cell by cell (no library inside the process).
**`mapUom(book, answers)`** (for B4, tested now): `answers[odooName] = {to: '<ERP UoM Name>'}` → that C_UOM row leaves the sheet and every
`C_UOM_ID` cell naming it is rewritten; `{x12de355: 'XXXX'}` → kept as a new UoM with that code; no answer and no product uses it → the row is
dropped (unchecked, §B0 3); no answer but used → mapUom refuses (the user must answer).
**Witness W-NINJA-MIGRATE** (`erp/tests/witness_ninja_migrate.js`; fixture = the W-SHEET-CONTRACT export, `erp/tests/fixtures/odoo_export_2026-11-09/`):
PLUG (loads, ACTIVE, class registered, paras 4 of 4) · TENANT (born by genesis) · RAW (the workbook as exported is REFUSED for C_UOM.X12DE355, 0 rows
committed, every error named) · RUN (with the witness standing in for the user on the UoM screen — Units→Each, Days→Day, Hours→Hour, 25 unused
unchecked; printed as the user's answers): committed; per sheet the tenant has exactly the sheet's rows; every lookup column points at a row of the
right table in the tenant or System; each patch resolved to the tenant's OWN default row (BP group IsDefault, tax category IsDefault, account element,
MMI doc type, discount schema); master-detail parents set (BP location/contact → BP, locator → warehouse, inventory line → its inventory); every
required column of every inserted row non-empty (a gap = a twin default missing → fixed on the twin side, CARDINAL RULE) · RERUN (a second run adds
0 rows) · FALSIFIERS (an apostrophe name loads; an ambiguous Name lookup is refused; a bad header stops with the legacy text) · INCONCLUSIVE when
nothing was judged. Window-level proof (open each migrated row from the main menu, grid rows + parent per tab) follows with the B4 form in the browser.

### §NINJA-LOADER RESULT (2026-11-09) — W-NINJA-MIGRATE 🟢 31/31, W-SHEET-CONTRACT 🟢 (now 15 unique indexes) — bim-ootb #2734 (auto-merge); regression 34 related witnesses = origin/main
- **Built:** `erp/plugins/ninja_migrate.mjs` (AD_Process 9540001 + 4 paras + menu + access, band 9540001-9540999) + `ninja_migrate_process.mjs`
  (`org.idempiere.ninja.process.MigrateExcelData`, F1–F11, `putFile` shelf, `mapUom`, `sheetRows`, `bookToWorkbook`); wiring = sw.js precache (v1009) +
  INSTALL_ONLY (file names). Witness `erp/tests/witness_ninja_migrate.js`, fixture `erp/tests/fixtures/odoo_export_2026-11-09/`, logs
  `build/erp/logs_migrate_2026-11-09/witness_ninja_migrate.run{1..5}.log` (run5 = PASS).
- **Measured on a born tenant (client 17, genesis):** RAW export refused whole (28 errors, all `C_UOM … x12de355 empty`, 0 rows kept) · RUN (witness answers the
  UoM screen Units→Each, Days→Day, Hours→Hour, 25 unused dropped) = 339 ops, every one of the 17 tables gained EXACTLY its sheet rows · SPINE 13/13: own default BP
  group, own default tax category, own account element, PI doc type, category parents = their path, 6 master-detail links all resolved, 0 empty mandatory on migrated
  rows · RERUN refused whole (unique Name/Value), tenant unchanged · FALS: apostrophe loads; ambiguous Name lookup refused; bad header stops with the legacy text; a
  partner without Name refused (F8); a partner without a group column takes the default group (legacy MBPartner.getBPGroup).
- **Twin-side defects the run found and FIXED (CARDINAL RULE, cited):** genesis Standard BP group not IsDefault/no Value (MSetup.java:1172-1176); model initial
  defaults missing for M_Product_Category, C_PaymentTerm, M_Warehouse, C_UOM, M_Locator, C_ElementValue, C_BPartner_Location, AD_User, M_Product_PO, M_PriceList
  (each `setInitialDefaults` line cited in `model_master.js`); MBPartnerLocation hooks treated a same-transaction C_Location (`#new:n`) as missing and read the location
  outside the transaction (`ad_modelval.js`, now through `ctx.trx`).
- **Export defects the run found and FIXED (export.js):** MMI matched 3 doc types → `C_DocType_ID>DocSubTypeInv=PI`; Odoo price breaks broke `m_product_po_vendorprodno`
  → one row per product+vendor (lowest min qty, breaks in provenance); Odoo posx/y/z all 0 broke `m_location_where` → Z = Odoo location id (named patch, 7 rows); lot
  quants broke `m_inventoryline_productlocattr` → summed per locator+product (36 quants → 26 lines, ids + lots in provenance). W-SHEET-CONTRACT was SCOPE-BLIND to all
  three (it never read the unique indexes) — the measurer now reads them from the pilot (15 over 17 tables) and the witness checks them (falsifier 3 bites).
- **NEW WORK ITEMS (WORK-TO-ZERO):** ⬜ G1 genesis rows are folded raw (not through PO.save): 116 AD-mandatory column gaps on a born tenant's OWN rows (Created/Updated
  stamps, C_ElementValue Post* ×311, payment term, category …; `§NM-GENESIS-GAPS` in run5) — a twin divergence from MSetup, which saves through the models.
  ⬜ L1 window-level proof in the browser (open each migrated row from the main menu: grid rows + parent per tab) — with B4. ⬜ L2 legacy cross-check
  (§NINJA-LEGACY-INSTALL). ⬜ lots → ASI, vendor price breaks, C_PaySchedule (named in manifest notes).

### §G1-SPEC — a born tenant's rows are what MSetup's PO saves write (2026-11-09, owner: "Proceed to fix newly created tenants")
**Measured defect:** `genesis.js` composes CREATE ops and the resident install merges them as raw `INSERT OR IGNORE` (`mergeGenesisInto`, called by
`idempiere.html installGenesis` :1058-1060). Legacy `MSetup` saves every row through `PO.save`. W-NINJA-MIGRATE run5 counted **116** AD-mandatory column gaps
on a born tenant's own rows in just 13 tables (Created/Updated/CreatedBy/UpdatedBy everywhere; C_ElementValue Post* ×311; flags of C_BPartner, M_Product,
AD_User, M_Locator X/Y/Z …).
**Legacy oracle (measured, pilot `idempiere_pilot`):** tenant 1000000 "ShopDay…" created by Initial Client Setup 2026-10-12 — every row of ad_org, ad_role,
c_acctschema, c_elementvalue, c_bp_group, m_product_category, m_warehouse, m_locator, c_doctype, ad_user has Created set and CreatedBy=100 (SuperUser, the
user running the process).
**Fix (generic, no table list):** `mergeGenesisInto(groups, db, opts)` fills, for each CREATE row, the columns the row does not carry, in PO order:
(1) `PO.setStandardDefaults` (PO.java:1973-2001): Created/Updated = `opts.now`, CreatedBy/UpdatedBy = `opts.user`, IsActive=Y, Processed/Processing/Posted = N
where the table has the column; (2) the model's `setInitialDefaults` = `opts.initialDefaults(table)` (the host passes `ModelLayer.MODEL[t].initialDefaults` — the
same registry the save path uses, one source); (3) the physical column DEFAULT = `ad_ddl_default` (pg defaults, already in the seed patch). The row's own values
always win. `opts` missing = today's behaviour (named, for the scratch fold of `genesis.html`, which has no dictionary). What is still empty after (1)-(3) is a value
MSetup sets explicitly → the genesis row gets it, cited to `MSetup.java:line`. The op-log hash chain is unchanged (the ops carry what genesis composed; the install
stamps them like `ws_kernel.commit` stamps a group — same design).
**Witness W-GENESIS-COMPLETE** (`erp/tests/witness_genesis_complete.js`): born via the production path (birthTenant → rebandGenesis → mergeGenesisInto with the
host's opts) → for EVERY table genesis writes (denominator from the ops), every AD-mandatory column is non-empty on every row of the tenant: gaps=0; CreatedBy=100
and Created set on every row (= the pilot oracle); for each flag column filled by (2)/(3), the twin's value is one the pilot tenant's rows carry for that column
(oracle values, recorded once into a fixture so CI needs no postgres); falsifier: the same merge WITHOUT opts reports gaps>0; INCONCLUSIVE if no table judged.

### §G1 RESULT (2026-11-09) — W-GENESIS-COMPLETE 🟢 10/10 — bim-ootb branch fix/genesis-complete-rows
- **Root cause (generic):** the twin's model registry carried `setInitialDefaults` for only the classes a lane had hand-copied. **Fix:** `scripts/gen_initial_defaults.js`
  EXTRACTS them from the iDempiere 13 source (`setInitialDefaults()` body, else the ctor `if (<Key>_ID == 0)` block; constants from X_/I_/PO/DocAction) →
  generated `erp/model_initial_defaults.js` (**182 tables, 896 columns, 32 clock columns**; 7 runtime-computed values left out, logged); `ModelLayer.newPO` applies it UNDER
  a hand entry (`setGeneratedDefaults`, `initialDefaultsOf`). Hand vs Java (`logs_migrate_2026-11-09/initdef_hand_vs_java.log`): 238 agree, **1 disagrees**
  (`C_Payment.IsOverUnderPayment` hand N vs MPayment.java:147 Y — the window path's AD default gives N; hand kept, named for the parity lane), 35 hand-only (Libero dd_order etc.).
- **Install fill:** `Genesis.mergeGenesisInto(groups, db, {now, user, initialDefaults})` = PO.setStandardDefaults + model defaults + `ad_ddl_default` + PO.insert_Accounting
  (accounting rows copy the schema default's Account columns); `idempiere.html installGenesis` passes the session user (100 at boot = the pilot oracle). Op-log untouched.
- **MSetup values genesis lacked (each cited in genesis.js):** OrgInfo DUNS/TaxID '?'; Value=Name='Standard' + IsDefault for BP / product category / warehouse / locator (+X/Y/Z 0);
  discount-schema ValidFrom; GL category Values from the sequence (1000000…); element IsNaturalAccount; combinations IsFullyQualified; AcctSchema_GL Yes-No = Y; NEW group
  **G7**: 8 trees (AD_Ref_List 120 via `Genesis.treeTypesFrom`, seed default) + root nodes, the schema's cost type, **AD_ClientInfo** (was absent — 19 twin readers), element → EV tree.
- **Witness** `erp/tests/witness_genesis_complete.js` + oracle fixture `erp/tests/fixtures/genesis_oracle_pilot_1000000.json` (pilot tenant 1000000, made by Initial Client
  Setup 2026-10-12; `GC_RECORD=1` re-records): GAPS 0 over 42 tables (the one empty, OrgInfo.ReceiptFooterMsg, is empty in legacy too) · STAMP CreatedBy=100 · ORACLE 114 flag
  columns all within legacy's values · TREES types = legacy's 8, roots, element tree, ClientInfo 22/22 columns + tree links · FALS raw merge = 322 gaps, op-log untouched.
  Logs `logs_migrate_2026-11-09/witness_genesis_complete.run{1..7}.log` (run7 PASS).
- **NEW ITEMS (not in this pass, named):** ⬜ G2 per-record tree nodes (legacy: OO/BP/PR/EV node per record via PO.insert_Tree; pilot EV 55 + root), C_AcctSchema_Element rows
  (legacy OO/AC mandatory, PR/BP), the material cost element (MAcctSchema.checkCosting); ⬜ G3 the client's DocumentNo_<Table> sequences (MSequence.checkClientSequences) so a
  born tenant numbers Values/DocumentNos like legacy; ⬜ G4 remaining MSetup names (product 'Standard Product' vs legacy 'Standard', schema name).

### §B4-IMPL-SPEC — "Migrate from Odoo" on the ONE generic form engine (2026-11-09, owner: "proceed with the B4 Migrate from Odoo form")
**Read first:** the twin has ONE generic AD_Form engine — `erp/ad_form_generic.js` (a bundle registers `{params, columns, rows(trx, params), run(trx, params, rows)}`
for an AD_Form classname) drawn by ONE host renderer (`idempiere.html renderGenericForm`); `rows()` runs in a READ Trx that is discarded, `run()` in ONE transaction
(`ModelLayer.run` timing PROCESS) committed as one signed group. So the §B0-4 "summary from the same import code on a throwaway copy" = the Ninja loader run inside
`rows()`'s Trx and dropped; OK = the same run inside `run()`, kept.
**Generic renderer extensions (AD-LAYER LAW: capabilities every form gets, no form-specific code):** (G-a) a `file` parameter (legacy FileName/FilePath editors):
`<input type=file multiple accept>`, read into `[{name, data}]` — `.xlsx` parsed with the vendored SheetJS (lazy `loadScript`), `.json` parsed, else bytes; (G-b) an editable
column of `type:'string'` is a text cell (today every editable cell is a number); (G-c) a row with `locked:true` draws its checkbox disabled (+ `lockedBy` text);
(G-d) `rows(trx, params, current)` — Refresh hands the grid as it stands (selections + edited cells), so answers survive a recompute.
**The plugin** `erp/plugins/odoo_migrate.mjs` (bundle `org.kernel.odoo.migrate`, band 9541001-9541999): AD_Form 9541001 classname `org.kernel.odoo.MigrateFromOdoo`,
menu leaf "Migrate from Odoo" (action X) under Data Import 163, AD_Form_Access for roles 0/102; hot chunk `odoo_migrate_form.mjs` registers the descriptor and drives
the Ninja loader (AD_Process 9540001 through `AdProcess.runInTrx`, the workbook handed over by `putFile`) — it needs `org.idempiere.ninja.migrate` started, and says so if not.
**The screen, top to bottom:** param *Files* (`odoo_migration.xlsx` + `manifest.json` from the export folder). Grid = one row per Odoo UNIT the products use (column
*ERP unit*, editable text; suggested only on an exact name match) then one row per SHEET (columns: Odoo rows · in file · will import · refused + first reason · needs ·
needed by · in this tenant now). A sheet is LOCKED (cannot be unchecked) while a selected sheet has a MANDATORY lookup into it (AD_Column.IsMandatory of the header's
column); an OPTIONAL lookup into an unchecked sheet is dropped from the child sheet (the stated effect). Refresh = re-run the dry run with the answers. *Process* = OK.
Refusals before anything runs: manifest files ≠ files given; a sheet's row count ≠ manifest's; a used unit without an answer; a selected sheet needing an unchecked one.
**Witness W-ODOO-FORM** (`erp/tests/witness_odoo_form.js`, node, the descriptor through `AdFormGeneric.read/execute` exactly as the renderer calls it; born tenant):
FORM row + menu + access X of N · units listed (3 used, 25 not shown) · no answers ⇒ summary predicts 0 imported and names X12DE355 · answers ⇒ predicted per sheet ==
sheet rows, refused 0 · uncheck a mandatory parent ⇒ locked + run refused · uncheck a leaf (M_Product_PO) ⇒ allowed, run imports without it · **W-MIGRATE-SUMMARY: tenant
gain per sheet after OK == the summary's prediction** · rerun ⇒ refused, unchanged · falsifier: a manifest count edited ⇒ refused before any run · INCONCLUSIVE when
nothing judged. Renderer extensions G-a..G-d: a live browser check (wiring only, Playwright) after the node witness is green.

### §B4 RESULT (2026-11-09) — "Migrate from Odoo" form: W-ODOO-FORM 🟢 16/16 + W-ODOO-FORM-LIVE 🟢 12/12 — bim-ootb #2743 (auto-merge)
- **Built:** `erp/plugins/odoo_migrate.mjs` (AD_Form 9541001 `org.kernel.odoo.MigrateFromOdoo`, menu leaf 9541001 under Data Import, form access 0/102) + `odoo_migrate_form.mjs`
  (descriptor: `plan` / `load` / `DESC`); generic renderer G-a file param, G-b text cells, G-c locked rows, G-d `rows(trx, params, current)` (idempiere.html renderGenericForm,
  ad_form_generic.js header); sw.js precache + INSTALL_ONLY. Witnesses `erp/tests/witness_odoo_form.js` (node, born tenant) + `witness_odoo_form_live.js` (headless Chromium).
- **Measured:** no files ⇒ two "pick" rows; a manifest count edited ⇒ refused before any dry run; 3 used units listed (none suggested), 25 unused not shown; unanswered ⇒ 0 predicted;
  answered ⇒ 17 sheets predicted = rows, refused 0, tenant untouched by the summary; M_Product_Category locked (needed by M_Product); unticking it does not stick; unticking
  M_Product_PO allowed ⇒ predicted 0; **Process gain == prediction on all 17 tables** (W-MIGRATE-SUMMARY); rerun refused, unchanged. LIVE: System Administrator starts both
  bundles via Plugins & Releases (restored after reload — a direct registry start does NOT persist; the instrument was corrected to the admin path); tenant born on the page via
  `idmpInstallGenesis`; its admin opens the leaf; files read (§AD-FORM-GENERIC file); 3 text cells + 13 locked rows; Refresh keeps the typed units, summary ok=true; Process ⇒
  339 ops, one group, verifyChain=ok; the TIP grew 7 BP / 48 products / 26 stock lines / 47 accounts (counting the raw bundle db showed 0 — the instrument was wrong, not the
  product: committed work lives in the op-log tip; read through `__crud.modelRun`). Logs `logs_migrate_2026-11-09/witness_odoo_form{,_live}.run*.log`.
- **Named limits:** a tenant with several DiscountType P schemas (GardenWorld: 2) gets the price-list version refused as ambiguous (legacy ImportPriceList takes MIN id) — next:
  the summary offers the choice like units, or the exporter names the schema; units can only be MAPPED to existing ERP units (no new-unit code yet); a born tenant's admin
  role gets the form only if the plugin was started BEFORE the tenant was born (grantFullAccess copies what exists) — plugin access for later tenants is a plugin-lane item.

### §LAG-SPEC — the same actions timed in Odoo and in the Kernel ERP (2026-11-09, owner: the film is about "the lag and $ … the freedom the long tail lost on TCO"; agreed: measure lag first)
**Question:** for the same everyday action, how long does a user wait in Odoo 17 vs the Kernel ERP, on the same machine — and what happens to that wait when the server
is in the cloud? Not "is Odoo bad": a measured pair, both run here, no number from elsewhere.
**Setup:** one machine; Odoo 17 community `odoodemo` in its docker (default config, one worker) at localhost:8069, logged in admin; the Kernel ERP served from the bim-ootb
`main` checkout, logged in GardenAdmin (GardenWorld). Headless Chromium, no GPU, one tab per app, warm (after login and one untimed run of each action). Same customer kind
(a company partner) in both.
**Actions (user-visible start → user-visible end):** A1 SAVE AN EDIT — change the customer's free-text field, press Save; ends when the app shows it saved (Odoo: `web_save`
answered and the form not dirty; Kernel: `§CRUD-PERSIST … verifyChain=ok` then the form redrawn `§CRUD-COMMIT-LIVE`). A2 NEXT RECORD — the form's next-record arrow; ends
when the next record is on screen (pager/status changed and the name field shows the new record). Timed IN the page (`performance.now()` at the click and at the end
signal), N=15 per action per app, report median and p90, and the number of network requests the action made.
**Two network conditions:** (L) localhost as is; (C) a cloud round trip emulated with Chrome's network conditions, latency 100 ms per request (a modest regional SaaS RTT;
stated, not measured from any vendor). The Kernel ERP is expected to make 0 requests per action, so (C) should not move it — the run shows whether that is true.
**Honest limits, printed with the result:** localhost favours Odoo (no real network); one demo database, small data; Odoo default config, not tuned; the Kernel's write is
durable when the signed log reaches a replica, not at the keystroke (the priced trade, DistributedERP.md §11) — the film must say so; no iDempiere number (not measured here).
**Tool:** `scripts/lag_odoo_vs_kernel.js` → `build/erp/lag_2026-11-09/lag.json` + `lag.log` (`§LAG` lines). Verdict line per action; INCONCLUSIVE if an app could not be
driven (never a number from a failed run).
**§LAG state (2026-11-09, PARKED by the owner's call: "release an early film first, then update often with the other killer points"):** Kernel side probed — Save on Business
Partner 114 makes **0 network requests**; stop signal = `§CRUD-PERSIST … verifyChain=ok` then `§CRUD-COMMIT-LIVE refold … view=form` (probe in the session scratchpad). Odoo side:
login works; Contacts opens as KANBAN in Odoo 17 (the probe waited for list rows → timeout) — next: open via the kanban card / the list view switcher, then time A1/A2.
This measurement becomes the film's first UPDATE.

### §FILM rc4 (2026-11-09) — "How to escape from your Odoo", early release — `~/Videos/How_to_escape_from_your_Odoo_EN_rc4.mp4` (171.6 s, EN)
- **Pipeline** `scripts/film_odoo_migration/`: `record.js` (headless Chromium, no GPU — the W-ODOO-FORM-LIVE flow on a new company "Escape Co" + Odoo's Customers screen + the
  offline save; every number a `§FILMREC FACT` → `out/rec/facts.json`) → `cards.sh` (PLAYBOOK C cards/composites, numbers read from the facts; refuses if the offline beat is not
  proven; `§CARDS_BAND_OK` caption band empty on all 14 narrated cards) → `build.py` (Kokoro F af_heart / M am_michael, local CPU; captions burnt; then +1.3 dB + limiter).
  Measured: −16.2 LUFS, peak −0.9 dBFS, 20 turns, longest silence 5.2 s. Narration text beside the mp4 (`…_narration.txt`).
- **Facts voiced (this run):** 7 customers · 48 products · 47 accounts · 26 stock lines (the form's own "Migrated from Odoo" line) · 394 records in one signed change set,
  verifyChain ok (was 339 before G1 — the generated model defaults add the accounting/child rows legacy's saves add) · offline save: navigator offline, `§CRUD-PERSIST … verifyChain=ok`,
  **0 network requests**. Team beat = the team guide's own Start-a-team screenshot (owner: "good enough"), pointing to the team film youtu.be/-LQwoPuQ1QU. Closing card = the NEURO
  §21.1 one-door diagram, "Specified, not built yet".
- **Found by making the film (all fixed, each its own PR):** bim-ootb **#2748** — the BIM Document plugin (#2746) and Migrate from Odoo shared id band 9541001 (menu leaf opened
  the wrong window; W-ODOO-FORM-LIVE red on main) → own band 9542001 + guard **W-PLUGIN-ID-BANDS**; **#2749** — the Find window's "Records = N" counted the bundle only (1 over a grid of
  8) → counted through the tip reader. Also seen, NOT ours: org.kernel.bim-document fails to start (`UNIQUE constraint failed: ad_window_access`) — for that plugin's lane.
- **Next updates of the film (owner: "release early, update often"):** the lag measurement next to Odoo (§LAG), books to the cent (B3/B5), a real user's run, other languages.

### ▶ RESUME HERE (2026-11-09, end of session) — the film's language versions + what is open
**Done:** EN `~/Videos/How_to_escape_from_your_Odoo_EN_rc5.mp4` (171.6 s, −16.2 LUFS; end card = the guide URL) · **ZH** `~/Videos/How_to_escape_from_your_Odoo_ZH_rc1.mp4`
(175.6 s, −16.3 LUFS, peak −0.8, 51 caption lines, diagram 26/26 labels translated; frames checked). User guide LIVE: https://red1oon.github.io/BIMCompiler/OdooMigrationGuide/
(BIMCompiler #449); method page https://red1oon.github.io/BIMCompiler/OdooMigration/ .
**Next session, in order:**
1. Send ZH to the owner's phone (remote control = SendUserFile card — the tool was NOT available in this session; owner asked for it).
2. **TH:** `cd scripts/film_odoo_migration && CUDA_VISIBLE_DEVICES="" ~/.local/share/film_narration/venv/bin/python build_lang.py th` (Loma font: Noto Sans Thai has no Latin;
   check frames as for ZH: title, trap, team, end diagram). 3. **MS:** same with `ms` (voice says E-R-P / A-I, captions keep ERP / AI — `voice_sub` in lang_text.py).
4. The film's first UPDATE = the lag measurement (§LAG-SPEC; Odoo side: customers are `base.action_partner_form`, kanban). 5. bim-ootb #2748 (Odoo form id band + W-PLUGIN-ID-BANDS)
   — confirm merged. 6. Report to the BIM Document plugin's lane: org.kernel.bim-document fails to start (`UNIQUE constraint failed: ad_window_access`).
**Pipeline facts:** `record.js` (needs a tree with the plugins on main; menu leaf 9542001) → `cards.sh` (EN) / `build_lang.py <lang>` (cards + voice + captions + loudness, all from
`out/rec/facts.json`) — `out/` is git-ignored, re-run record.js if it is gone (Odoo up: `docker start odoo-db odoo`). Edge voices = cloud (text sent to Microsoft; cached).

### §FILM-LANG RESULT (2026-11-09b) — ZH sent, TH + MS built and sent (SendUserFile cards)
- **TH** `~/Videos/How_to_escape_from_your_Odoo_TH_rc1.mp4` — `§BUILD_DONE … duration=151.8s integrated=-16.2 LUFS peak=-1.3 dBFS turns=20 caption_pieces=61` (`out/build_th_run.txt`);
  diagram 26/26 labels, font Loma; frames read (title, trap, proof, end diagram): Thai renders, no missing glyphs. Small: the end diagram's engine box text runs a few px past its right border.
- **MS** `~/Videos/How_to_escape_from_your_Odoo_MS_rc1.mp4` — `§BUILD_DONE … duration=201.8s integrated=-16.0 LUFS peak=-1.4 dBFS turns=20 caption_pieces=20` (`out/build_ms_run.txt`);
  frames read (trap, export, BP grid, proof): captions wrap to ≤3 lines inside the frame.
- **Defect found + fixed in `build_lang.py`:** Edge voice th-TH-PremwadeeNeural answers "No audio was received" INTERMITTENTLY (same text refused 3/3, then accepted a minute later; Niwat never
  refused). Old code tried 3 times then crashed on the missing mp3. Now: 8 tries with backoff (`§EDGE retry n`), then speak the line phrase by phrase at its spaces with a 0.18 s pause
  (`§EDGE_SPLIT`), refuse (`§EDGE_FAIL`) if it has no space. Final TH run: 1 retry, no split.
- ZH was sent to the owner's phone this session (RESUME item 1 closed). bim-ootb #2748 MERGED 2026-11-08T23:26Z (item 5 closed).
- **Still open, in order:** §LAG (the film's first update) · report the bim-document plugin start failure to its lane (item 6).

### §HARDEN-SPEC — real users' Odoo data, not the demo company (2026-11-09, owner: *"harden the migration process so that real users will find it easy"*)
**Measured first** (bim-ootb origin/main 16b3c205, worktree `/tmp/wt-odoo-harden`, logs `.h/e_M*.log`): a scratch copy `odoo_messy` of odoodemo (pg_dump, so the
recorded demo fixtures do not drift), then ONE real-world state at a time applied through Odoo's own ORM (`.h/messy.js`, every state is one Odoo itself accepts), export after each:
| case | state Odoo allows | export.js today |
|---|---|---|
| M1 | a customer with a country and no street (Odoo pre-fills the country) | 🔴 FAIL `C_Location_ID>Address1="" matches 0` — C_Location is keyed on the street text |
| M2 | two customers on the same street | 🔴 FAIL `Address1="1 Jalan Utama" matches 2` |
| M3 | a contact whose company is archived | 💥 crash `Cannot read properties of undefined (reading 'ref')` (export.js:139 `val(par)`, the parent is not read: active_test) |
| M4-M8 | duplicate product code · archived product with stock · a 2nd company · delivery address = parent's street · duplicate partner ref | not reached (M3 crashes first) |
Base (unmodified copy) = 🟢 PASS, 17 sheets. **So the first real user almost certainly hits M1.**
**Fixes, each generic (no per-record branch), each named in `manifest.patches`/`notes`:**
- **H1 address identity = iDempiere's migration key.** `C_Location` has `C_Location_UU` (pilot dictionary; 2Pack resolves records by the UU column). Each exported address
  gets `C_Location_UU` = UUIDv5(odoo namespace, `<db>/res.partner/<id>`) — deterministic, traceable to the Odoo row; `C_BPartner_Location` and `M_Warehouse` look it up with
  `C_Location_ID>C_Location_UU`. No visible field carries an id. The street can be blank or repeated.
- **H2 archived = inactive.** Odoo archive (`active=False`) is iDempiere's `IsActive=N`. Partners and products are read with `active_test:false`; archived ones are exported with
  `IsActive=N`, so a contact of an archived company (M3), stock of an archived product (M5) and a vendor price of an archived vendor keep their parent. Counts use the same domain.
- **H3 duplicate keys.** iDempiere refuses a repeated Value per tenant (`c_bpartner_value`, `m_product_value` unique indexes, pilot); Odoo does not. The lowest Odoo id keeps the
  code; every other row gets `<code>-<odoo id>` (a named patch listing each one); every sheet that points at it uses the same final Value.
- **H4 several companies.** With more than one `res.company` and no `--company`, the export stops BEFORE reading anything else and lists the companies (id, name) with the command
  to run per company. With `--company <id>` every call carries Odoo's own `allowed_company_ids=[id]` context (Odoo's record rules then show what that company's user sees).
- **H5 Odoo.sh / Odoo Online / any https server.** `--url https://mycompany.odoo.com` (or `--host` with a scheme): https via Node's `https`, default port 443. The password prompt
  says "password or API key" (Odoo with 2-factor login needs an API key for external calls). Witness over a local TLS proxy (self-signed, `NODE_EXTRA_CA_CERTS`).
- **H6 version check before reading.** `fields_get` on each model read; a field the export needs and the user's Odoo lacks ⇒ stop before anything is written:
  `§ODOO-EXPORT FAIL version: Odoo <v> has no <model>.<field>` (export.js reads Odoo 17 names; 16/18 are named, not guessed). Node < 16 ⇒ a one-line refusal.
- **H7 units from a list.** Generic renderer G-e: a string column may carry `options` ⇒ the text cell gets a `<datalist>` (legacy: a List/Table reference editor is a combobox).
  The Odoo form offers the tenant's active C_UOM names. Typed text still allowed and still checked.
- **H8 plugin started after the company was born.** Legacy: an admin runs **Role Access Update** (AD_Process 295, `RoleAccessUpdate.java` → `MRole.updateAccessRecords`).
  The twin has `updateAccessRecords` (model_master.js:330) but not the process ⇒ port it (generic: every role, or one; ResetAccess); the guide names it.
- **H9 guide:** `--url`, `--company`, API key, archived = inactive, renamed duplicates, Role Access Update.
**Witness W-ODOO-MESSY** (`erp/tests/witness_odoo_messy.js`, replays fixture `odoo_messy` recorded via the A-MOCK proxy so CI needs no Odoo): export PASS on M1-M8; M1 address
present with blank street; M2 two locations; M3 contact under an inactive BP; M4/M8 renamed rows listed in patches and every pointer uses the final Value; M5 stock line on an
inactive product; M6 refusal lists 2 companies, `--company 1` passes; then the workbook through the Odoo form on a born tenant: gain == prediction on every sheet, refused 0.
Falsifier: the origin/main exporter on the same fixture = the FAIL/crash above. INCONCLUSIVE when neither Odoo nor the fixture answers.

### §HARDEN RESULT (2026-11-09) — bim-ootb #2755 (auto-merge), W-ODOO-MESSY 🟢 10/0 + 14/0, W-ROLE-ACCESS-UPDATE 🟢 9/0
- **Export (H1-H6, `erp/odoo_agent/export.js` + `cli.js`):** all 8 states pass; **falsifier** = the 16b3c205 exporter on the same recording crashes (`reading 'ref'`).
  Also found by the run, not in the table above: (a) odoodemo ITSELF has 2 companies (SF + Chicago) and the old export merged Chicago's warehouse, 7 locations and 2 quants
  into the one tenant — now one company per run (login's own default), the others named with their command; (b) odoodemo has 2 location paths of 46 chars (ERP M_Locator.Value
  = 40; legacy PO.set_Value would cut both to the same 40 and break the stock lines) — cut once with `~<odoo id>`; (c) a contact is placed under Odoo's `commercial_partner_id`
  (an address under a person under a company). The demo export changed ON PURPOSE: W-ODOO-OWNDB hash fdbde73d → bf33a791, W-SHEET-CONTRACT fixture re-recorded (49 answers),
  its count keys read the "(archived too)" tag and falsifier 2 now duplicates a C_Location_UU.
- **Instrument fixed:** `poc_sheet_contract.js` judged "Odoo up" by `/web/login` = 200; with a 2nd database Odoo answers 303 (database chooser) and the witness silently fell back to
  replay. Now it asks the JSON-RPC `common.version`.
- **ERP:** G-e pick list (generic renderer), the Odoo form offers the tenant's units; **Role Access Update** (AD_Process 295) ported (`processes/RoleAccessUpdate.js`), the access
  logic is ONE function `ModelMaster.updateAccessRecords(trx, role, reset)` shared with a new role's afterSave (reset bug found by the witness: deletes are pending in the Trx, the
  re-insert must not read them as present). Menu path verified in the twin: System Admin → General Rules → Security → Role Access Update.
- **Witnesses:** bim-compiler `scripts/poc_odoo_messy.js` (export half: old vs new, `--company`, https over a TLS proxy, version falsifier; live + replay of
  `build/erp/odoo_fixture/odoo_messy_2026-11-09.json`); bim-ootb `erp/tests/witness_odoo_messy.js` (load half, fixture `erp/tests/fixtures/odoo_export_messy_2026-11-09/`,
  byte-identical workbook), `witness_role_access_update.js`. Regression: W-ODOO-FORM (+picklist) · W-ODOO-FORM-LIVE 13/0 · W-NINJA-MIGRATE · W-GENESIS-COMPLETE · W-PLUGIN-ID-BANDS ·
  W-AGENT-ZIP-SYNC · nc9 role UI live · quicksetup live · 14 more node witnesses green. Reds identical on origin/main: dict_census, packgen, nc6_setuprules, udp2_engine.
- **Scratch Odoo:** `scripts/odoo_mock/make_odoo_messy.sh` rebuilds db `odoo_messy` (pg_dump of odoodemo + `odoo_messy_states.js`); it never touches odoodemo. DROP it after a live run (`docker exec odoo-db dropdb -U odoo odoo_messy`): with 2 databases Odoo's /web/login redirects (303) to the database chooser, which breaks `film_odoo_migration/record.js` and `odoo_observe/*_flow.js`. Dropped 2026-11-09; the replay fixture needs no Odoo.
- **Named, not done:** Odoo 16 / 18 field names (the export refuses them cleanly today) · `agent.js` (the one-order check) is http only · units can only be MAPPED, not created ·
  the twin's `PO.set` does not cut over-long text like legacy PO.set_Value (the export guarantees it for migrated rows; a generic twin fix is its own item) · scale (10k+ rows) unmeasured.

### ▶ RESUME HERE (2026-11-09b) — hardening LIVE
bim-ootb #2755 MERGED (CI fast-checks + e2e green), Pages serves sw v1019, the downloadable `odoo_agent.zip` carries the hardened export (fetched back and checked),
`processes/RoleAccessUpdate.js` 200. Guide + method page LIVE (BIMCompiler #458, `safe_gh_deploy.sh` guard PASS, canaries 200; text fetched back).
**Next, in order:** Odoo 16 / 18 field names (needs those Odoo images to measure, not guess) · B3 opening balances / open invoices / open orders · units: create a new ERP
unit from the form · twin `PO.set` cut over-long text like legacy (generic, needs a sweep) · scale run (10k+ rows) · §LAG · bim-document plugin start failure → its lane.

### §BC-SPEC — "Migrate from Business Central", alpha stub from the published data model (2026-11-09, owner: *"infer 3rd party ERP data model … rather than need a live service … at least a stub ready for alpha testers feedback from WITNESS logging"* → *"Agree. Proceed."*)
**Why BC (measured):** Microsoft publishes the whole application source, MIT, at github.com/microsoft/BCApps (checked: LICENSE = MIT, `src/Layers/W1/BaseApp` = 1,546
`.Table.al` files, e.g. `table 18 Customer` / `Name: Text[100]`). Microsoft claims 50,000+ BC online customers (Nov 2025) / 55,000+ (2026). **No live BC here** — everything
below is read from that source, pinned to commit 616174f6; the first real file will come from an alpha tester.
**Door 1 = BC's own Excel export (RapidStart configuration package)** — no credentials, no Node, the user's own BC screen (Configuration Packages → Export to Excel).
Format read from `ConfigExcelExchange.Codeunit.al` (BaseApp/System/RapidStart): one sheet per table, name = caption (first sheet) or `<table id> <caption>` cut to 31
(:816-824); row 1 = A package code · B table caption · C **table id** (:662-684); row 3 = field captions (field name when the caption is blank, :592, GetTableColumnName); data
from row 4 (:450). Values (`ConfigXMLExchange.FormatFieldValue` :1900-1938, Excel mode): XML format (Format(v,0,9): ISO dates, `.` decimals, true/false); Option/Enum =
the option CAPTION in the user's language; a date in the package's language if the package sets one. ⇒ a sheet is identified by C1 (language-free); a header is matched to
the field by caption OR name from the model; an unmatched header is logged (`§BC-HEADER unknown`), never guessed.
**The model** `erp/plugins/bc_model.json` = `erp/tools/gen_bc_model.js` over the checkout: 14 tables (3 Payment Terms, 9 Country/Region, 14 Location, 15 G/L Account,
18 Customer, 23 Vendor, 27 Item, 32 Item Ledger Entry, 98 General Ledger Setup, 99 Item Vendor, 204 Unit of Measure, 222 Ship-to Address, 5722 Item Category, 7354 Bin):
id, name, caption, type, length, NotBlank, TableRelation, FieldClass, enum values — all from the .al files, 0 unresolved enums (§BC-MODEL log).
**The converter** `erp/plugins/bc_migrate_convert.mjs` (pure, browser + node): BC package → the SAME 17-sheet Ninja workbook + manifest the Odoo export writes, so the
form engine, the summary, the Ninja loader and W-SHEET-CONTRACT's rules apply unchanged (one implementation per responsibility). Mapping (each a named rule in code):
Unit of Measure→C_UOM (Code; units answered on the form, as Odoo) · Payment Terms→C_PaymentTerm (NetDays only from a plain `<nD>` formula, else named) · Item
Category→M_Product_Category (+Parent Category) · G/L Account→C_ElementValue (Account Category→A/L/O/R/E, Account Type ≠ Posting→IsSummary, flat) ·
Customer+Vendor→C_BPartner (same No. in both = renamed `-V`/`-C`? no: `<No.>-<table id>` named) + their address→C_Location (UU = UUIDv5 `bc/<table>/<key>`) +
C_BPartner_Location; Ship-to Address→more locations; the card's Contact/E-Mail/Phone→AD_User · Item→M_Product (Type Service→S, else I; Blocked→inactive) ·
Item Vendor (or the card's Vendor No.)→M_Product_PO (PricePO = Last Direct Cost, named) · Unit Price→one sale price list in General Ledger Setup's LCY Code · Location→
M_Warehouse (+its address) · Bin→M_Locator, else one locator per location · Item Ledger Entry→opening stock = Σ Quantity per item+location with Posting Date ≤ cutover.
Lengths: BC length vs ERP length (H3 rules: a key cut keeps `~<n>`, other text cut as PO.set_Value). A table the mapping needs and the package lacks ⇒ that sheet is
empty and the summary says which BC table to add; GL Setup missing ⇒ refused (the currency is not guessed).
**The screen:** bundle `org.kernel.bc.migrate` (own id band, W-PLUGIN-ID-BANDS), AD_Form "Migrate from Business Central" under Data Import; its descriptor = the converter
+ the Odoo form's own `plan`/`load` (imported, not copied). Labelled ALPHA on the screen.
**Alpha report (the WITNESS logging the owner asked for):** every run prints `§BC-ALPHA` lines and the result shows a report the tester can paste back: BC package tables
found (id, caption, rows), headers matched/unknown per table (captions only), rows mapped per sheet, refusals with their reason TEXT but every quoted value masked (`"…"`),
renamed/cut counts. **No customer value leaves in the report** — witness-checked.
**Witness W-BC-MIGRATE** (`erp/tests/witness_bc_migrate.js`): fixture = a package built in BC's own layout from Microsoft's Contoso demo data codeunits
(`src/Apps/W1/ContosoCoffeeDemoDataset`, values resolved from their Labels/exits, each row cited) — `erp/tests/fixtures/bc_package_contoso/`; checks: model == source
(field count, lengths of the mapped fields re-read from the .al); every sheet identified by C1; 0 unknown headers in the fixture, a renamed header ⇒ named unknown
(falsifier); converted workbook passes the loader with gain == prediction on a born tenant; the alpha report holds no fixture value (falsifier: a report built without masking
contains one); no live BC ⇒ the connection itself is INCONCLUSIVE, stated.

### §BC RESULT (2026-11-09) — bim-ootb #2765 (auto-merge), W-BC-MIGRATE 🟢 17/0 (CONN ⚪ INCONCLUSIVE by construction), W-BC-MIGRATE-LIVE 🟢 11/0
- **Extracted, not typed:** `erp/tools/gen_bc_model.js` → `erp/plugins/bc_model.mjs` (15 tables incl. 79 Company Information, 988 fields; the witness re-reads every field's
  id/name/length from the checkout: 0 differ). `erp/tools/gen_bc_contoso_fixture.js` → `erp/tests/fixtures/bc_package_contoso/rows.json`: 978 demo-helper calls resolved from
  the helpers' OWN `Validate(…)` lines (an overload that hands over to a sibling is followed; one parameter may fill several fields — Base/Sales/Purch. UoM), Labels, `exit(…)`,
  `AddAccountForLocalization` (name → no., last write wins: 301), setup `InitValue` (country GB), a port of `ContosoUtilities.AdjustDate` (demo installed 2026-11-09), item
  journal lines as posted ledger entries. Fixture rules named in the file: a record Microsoft defines twice (Common + Sales module) is merged; setup-dependent values stay empty
  (e.g. bins' location → the 78 bins are REFUSED as "location not in the package", the correct behaviour).
- **Loaded:** all 575 rows of Microsoft's demo company into a born tenant — 12 partners (5 vendor numbers renamed `(Vendor)`), 64 items, 284 accounts (276 typed by Account
  Category), 17 addresses (Adatum: own + 2 ship-to), 39 stock lines (Σ 12,100 = Σ ledger ≤ cutover), 736 ops one signed group; the same on the real page.
- **Found by the run, fixed:** (1) BC allows an item without Item Category, iDempiere refuses → legacy ImportProduct.java:213-221 default category (10 demo items);
  (2) **generic form renderer G-f** — Refresh repainted every parameter's default over what the user typed (the cut-over date was lost; the Odoo form never showed it, its only
  parameter is a file) → defaults fill only untouched parameters; (3) unit suggestion by international code (BC `EA` → ERP Each) in the Odoo plan, Odoo unaffected.
- **Alpha report:** `§BC-ALPHA` lines (tables, rows, headers matched/unknown, sheets, refusals, renamed, patches); the witness checks none of 916 package text values appears
  (token match; schema words excluded) + the mask falsifier. Guide for testers: docs/BusinessCentralMigrationGuide.md (BIMCompiler, BC page names read from ConfigPackageCard.Page.al).
- **Slip, recovered:** ran `git stash` in the worktree (shared stash — memory rule); popped stash@{0} (verified ours) at once, other sessions' stashes untouched.
- **Next for this lane:** a real tester's package (closes CONN) · BC cloud API door (OAuth app registration) · SQL Server door (on-prem) · price list lines / discounts ·
  variants and lots · balances and open documents (B3 for both sources).

### §FILM-BC rc1 (2026-11-09) — "How to escape from your Business Central" — `~/Videos/How_to_escape_from_your_Business_Central_EN_rc1.mp4` (238.8 s, EN, −16.3 LUFS, peak −0.5)
- Owner: *"Do a film, stating the licensing bit too, narrating as the previous Odoo run. Add whatever of importance."* Pipeline `scripts/film_bc_migration/` (storyboard `script_en.md`):
  `record.js` (headless, no GPU: runs W-BC-MIGRATE itself → model/alpha facts; then the live BC form flow on a born tenant; every number a `§FILMREC FACT` → `out/rec/facts.json`) →
  `cards.py` (refuses unless offline / model==source / PCS→Each / witness PASS / no leak are proven; caption band witness 15/15) → `build.py` (Kokoro F/M local CPU, captions burnt,
  "E. A." voiced / "EA" captioned) → +1 dB + limiter.
- Beats added beyond the Odoo film: the MIT licence (allows reading/copying/porting with the notice; NOT the platform, NOT the name — read from the repo's LICENSE + README),
  "read, not guessed" (a real Customer.Table.al excerpt, 15 tables · 988 fields · 0 differ), Microsoft's own demo company (575 rows from the demo source), BC's export layout,
  "found by running it" (item without category; Refresh lost a typed date), the masked alpha report (916 values, 0 appear), next steps (tester file, cloud API, SQL Server, balances).
- Facts voiced (this recording): 12 partners · 64 items · 284 accounts · 39 stock lines · 736 records one signed change set · verifyChain ok · offline save 0 requests.
- **ZH rc1** (owner: "Do the Mandarin version") `~/Videos/How_to_escape_from_your_Business_Central_ZH_rc1.mp4` — 235.2 s, −16.3 LUFS, peak −1.2, 70 caption pieces, end diagram 26/26 labels
  translated; `lang_text.py` (en + zh, every card string + turn) + `build_lang.py` (cards in Noto CJK, Edge zh voices cached/retried/split, captions packed by display width with a Latin
  word as one token — run 1 split "Busin|ess" and inside “…”, fixed). Known: a long Chinese line may still break between two characters of a word (no word segmentation).

### ▶ RESUME HERE (2026-11-09, end of session) — next: SAP (owner: "will do SAP next")
**Live now (all merged, fetched back from the live site):** Odoo hardening (bim-ootb #2755, §HARDEN) · Role Access Update port · "Migrate from Business Central (alpha)"
(bim-ootb #2765, §BC-SPEC/§BC RESULT, sw v1021) · guides: OdooMigrationGuide, BusinessCentralMigrationGuide (BIMCompiler #458, #470, deployed by safe_gh_deploy, guard PASS).
Films: Odoo EN rc5 / ZH / TH / MS; Business Central EN rc1 + ZH rc1 (`scripts/film_bc_migration/`, record.js → cards.py → build.py; build_lang.py for zh/th/ms).
**The pattern a third source follows (copy the BC lane, do not invent a new one):**
1. **Measure first what the vendor PUBLISHES** — licence + a machine-readable data model (BC: microsoft/BCApps, MIT, `.al` tables). Pin the commit; a generator writes
   `erp/plugins/<src>_model.mjs`; the witness re-reads every field from the checkout (0 differ) — INCONCLUSIVE without the checkout, said so.
2. **A door the user already has** (BC: its own RapidStart Excel export, format read from its source) → a converter to the SAME 17-sheet Ninja workbook + manifest →
   the Odoo form's plan/load (bindProcess), own AD_Form/menu band (W-PLUGIN-ID-BANDS), labelled ALPHA, `§<SRC>-ALPHA` report with values masked.
3. **Fixture = the vendor's own demo company extracted from its published source**, never typed; the live/connection case INCONCLUSIVE until a tester's file.
4. Witnesses: node (model, package, convert, load gain==prediction, alpha no-leak + falsifiers) + live page (Playwright wiring); regression of the Odoo/BC witnesses.
**SAP — open facts to MEASURE at the start (nothing below is verified yet):** which SAP product (memory: target = **SAP Business One**; tenant 14 "SAP Flights" in the
picker is only a /DMO/ flight PoC, not B1); is any B1 data model published under an open licence (SDK / DI API / Service Layer docs are SAP-licensed, the Service Layer
$metadata comes from a running server); what export the user already has (B1 "Export to Excel" of a grid? DTW templates — Data Transfer Workbench, B1's own migration tool, CSV
per object with header rows); is a demo company (OEC Computers) published anywhere usable. Decide the door from those facts; if no open model exists, say so — do not guess one.
**Housekeeping done:** worktrees /tmp/wt-odoo-harden, /tmp/wt-bc-migrate, /tmp/wt-erp-base, docs worktrees removed; scratch Odoo db odoo_messy dropped (rebuild:
`scripts/odoo_mock/make_odoo_messy.sh`, drop after); everything pushed (bim-compiler branch fable/meshdb-livewire, 0 ahead).
**Still open from earlier:** §LAG (Odoo timing) · Odoo 16/18 field names · B3 balances/open documents (both sources) · twin PO.set length cut (generic) · bim-document plugin start
failure (UNIQUE ad_window_access) → its lane.

### §SAP-MEASURE (2026-11-09c) — the open facts from ▶ RESUME, measured before choosing a door
- **Product:** SAP Business One (decided 2026-06, `prompts/archive/FRONTEND_LANE_MASTER_OUTSTANDING_drained_2026-06-20.md:897`). Tenant 14 `erp/14-sap.db` = the /DMO/ flight PoC, not B1.
- **Owner, 2026-11-09:** *"SAP DB was known to be open source long time ago."* — measured: SAP DB (ex-Adabas, bought from Software AG 1997) was GPL from Oct 2000, became MaxDB
  2003 (dual GPL/commercial with MySQL AB), **closed source from 7.6 (2007)**. It is the DATABASE ENGINE, not an application: its source holds no ERP tables. B1 runs on
  Microsoft SQL Server or SAP HANA, never on SAP DB/MaxDB. ⇒ it gives no B1 data model. (Sources: en.wikipedia.org/wiki/MaxDB; MySQL 5.1 ref guide §MaxDB history.)
- **Published B1 model under an open licence — NONE FOUND.** GitHub `SAP-archive` B1 repos (scp-b1, b1-xo, b1-smile, b1-assistant-lite, smb-assistant-bot: Apache-2.0)
  are integration samples, no schema. `SAP/ui-api-extension-for-sap-business-one-web-client` (Apache-2.0) = a VS Code extension. Third-party copies of the Service
  Layer `$metadata`: `Xaypanya/b1-api-cookbook` `schemas/metadata.xml` 1.6 MB — **no licence**, dumped from an SAP server; `operator-ita/b1sl-python` (MIT) — its
  `metadata_document.xml` is a 1.5 KB stub (2 EntityTypes), the 2.7 MB `service_layer_api_reference.html` is a copy of SAP's own reference. An MIT label from a
  third party does not relicense SAP's text. Unlike BC (Microsoft publishes the app source, MIT) there is nothing to pin.
- **The user's own export:** DTW (Data Transfer Workbench) templates + the demo company (OEC Computers) ship INSIDE the licensed B1 install; no public copy found.
  Header layout of a DTW file is described inconsistently by the sources found (row 1 = DI API property names, row 2 = description — SAP community) — to be read from a real template.
- **The model does exist on every B1 customer's own server:** Service Layer `GET /b1s/v1/$metadata` (OData). A tool the USER runs against THEIR licensed server reads the model
  and the data there (the Odoo agent pattern: `npm install && node agent.js`), so nothing SAP-licensed ships from us.
- ⇒ **The BC pattern's step 1 (pin a published model) and step 3 (fixture = the vendor's demo from its published source) cannot be done for B1.** ⛔ Door = owner's call (asked 2026-11-09c).

### §SAP-SPEC — "Migrate from SAP Business One (alpha)", door = an agent on the user's OWN Service Layer (2026-11-09c)
> Owner: door = *"Agent on their server"* · *"DB engine is powerful insight then to infer much"* · *"we doing a earnest effort POC, and not matching any production level. The
> community can improve it. Release early update often."*
**Scope = a POC, released early.** Masters only, current state (no history, no balances). What it cannot prove is said, not hidden.
**Where the model comes from:** the user's own server, at run time — `GET /b1s/v1/$metadata` (guide §3.3). The agent checks every field the mapping reads against THAT metadata;
a field the server lacks is named (`§SAP-FIELD missing`), never guessed. The field names in the mapping were read from SAP's published guide "Working with SAP Business One
Service Layer" v1.26 and a $metadata copy (scratch only, not committed: no licence) — each one re-checked on the user's server by the agent.
**DB-engine insight (owner):** the Service Layer is a layer over the company database tables (the guide prints its own SQL: `ORDR`, `OCRD`, `OITM`); its SQLQueries entity runs
read SQL on an allow-listed table set (`b1s_sqltable.conf`, guide §4). The Service Layer's account record carries no asset/liability/equity class (only AccountType
at_Revenues/at_Expenses/at_Other); the class lives in the account table. **POC: not read** (an SQLQuery is a saved object = a write on the customer's server, and the drawer numbers
have no published source here) — balance-sheet accounts get the ERP default type and the summary says so. Next step for the community: `--sql` reading `OACT` via SQLQueries.
**Agent** `erp/sap_agent/` (Node ≥18, no npm dependencies — built-in fetch): `node agent.js --url https://<server>:50000 --company <CompanyDB> --user <user>` (password asked, or
`SAP_PASSWORD`; `--insecure` for B1's self-signed certificate) → POST Login (guide §3.1, B1SESSION cookie) → `$metadata` → `$count` per entity set → pages with
`Prefer: odata.maxpagesize=100` following `odata.nextLink`/`@odata.nextLink` (guide §3.7) → `CompanyService_GetAdminInfo` (local currency, country) → Logout. Writes ONE file
`sap_export.json` = { manifest: { server version, metadata sha256, per set: $count + rows read + fields read/missing }, sets: { … rows … } }. Read only (GET + Login/Logout).
**Sets read:** UnitOfMeasurements · PaymentTermsTypes · ItemGroups · ChartOfAccounts · BusinessPartners (+BPAddresses, ContactEmployees) · Items (+ItemPrices,
ItemWarehouseInfoCollection) · PriceLists · Warehouses · BinLocations · AdminInfo.
**Converter** `erp/plugins/sap_migrate_convert.mjs` (pure) → the SAME 17-sheet Ninja workbook + manifest (imports BC's HEADERS/ORDER/uuid5/mask + a shared `finish()` for the
length cuts and the book, moved out of BC's convert — one implementation). Rules: UoM Code→C_UOM (X12DE355 = InternationalSymbol, units confirmed on the form) · PaymentTermsTypes
→C_PaymentTerm (NetDays = NumberOfAdditionalDays only when months = 0 and StartFrom = pdt_None, else named) · ItemGroups→M_Product_Category · ChartOfAccounts→C_ElementValue
(at_Revenues→R, at_Expenses→E, at_Other→ERP default, named; ActiveAccount tNO→summary) · BusinessPartners: cCustomer→IsCustomer, cSupplier→IsVendor, cLid (lead)→refused, named;
Frozen tYES / Valid tNO→inactive; BPAddresses→C_Location (UU = uuid5 `sap/bp/<CardCode>/<AddressType>/<AddressName>`) + C_BPartner_Location; ContactEmployees→AD_User ·
Items→M_Product (itLabor/itTravel→S, else I; a non-inventory item (InventoryItem tNO) stays I, counted in a note; itFixedAssets→refused, named) + Mainsupplier→M_Product_PO (SupplierCatalogNo) · one sale price list = the user's chosen
B1 PriceList (default: the first, named) in AdminInfo.LocalCurrency · Warehouses→M_Warehouse (+address, else AdminInfo country) · BinLocations→M_Locator, else one per warehouse ·
ItemWarehouseInfoCollection.InStock>0 → opening stock **as of the export** (Service Layer gives stock now, not at a date — named in the summary).
**Screen:** bundle `org.kernel.sap.migrate`, Id band 9544001-9544999, AD_Form "Migrate from SAP Business One (alpha)" under Data Import; drop `sap_export.json`; the Odoo form's
plan/load. `§SAP-ALPHA` report, values masked.
**Witness W-SAP-MIGRATE** (`erp/tests/witness_sap_migrate.js`): a local mock Service Layer (`erp/tests/sap_sl_mock.js`) serving a fixture made ONLY of the example records in SAP's
guide (customer c1, items i001/i002, warehouse 01 …, each row citing its guide line) — tiny by design. Cases: AGENT (login cookie, paging followed, $count == rows, read-only:
only GET + Login/Logout seen by the mock); FIELD (falsifier: the mock drops a field from its $metadata ⇒ named missing, column empty); CONVERT; LOAD (born tenant, gain ==
prediction); ALPHA (no fixture value, mask falsifier); WIRING; **CONN = INCONCLUSIVE** (no real B1 here — a tester's run closes it). Odoo/BC witnesses re-run (regression).

### §SAP RESULT (2026-11-09c) — bim-ootb #2774, W-SAP-MIGRATE 🟢 23/0 (10 rules ⚪ INCONCLUSIVE, CONN ⚪), W-SAP-MIGRATE-LIVE 🟢 11/0
- **Shipped:** `erp/sap_agent/` (+ `sap_agent.zip`, offered in About ▸ DIY as "SAP B1 (alpha)", was "soon") · `plugins/sap_migrate{,_form,_convert}.mjs` (band 9544001-9544999) ·
  `tests/sap_sl_mock.js` + `fixtures/sap_b1_guide/rows.json` (SAP guide examples only: customer c1, items i001/i002/i011, warehouse 01, one account — each cited §/page).
- **Found by the run, fixed:** (1) a B1 item with no InventoryUOM was refused (c_uom_id mandatory) and, through the all-or-nothing loader, stopped the WHOLE load → legacy
  ImportProduct.java:304-311 (client default unit): `C_UOM_ID>IsDefault` column added to the shared M_Product header (BC rows leave it blank); (2) a warehouse with no country and no
  readable company country → refused in the converter with its reason, not left to fail the load; (3) **generic:** rows a converter refuses BEFORE the load were invisible on the
  summary (BC's 78 bins too) → `odoo_migrate_form.withSourceRows()` adds them to their sheet row + converter notes as info rows; used by the BC and SAP forms.
- **Shared, not copied:** BC's length rules + book moved to `finishBook()` (bc_migrate_convert.mjs), used by both converters.
- Regression after the refactors and the merge of main: W-BC-MIGRATE 17/0, W-BC-MIGRATE-LIVE 11/0, W-ODOO-FORM 17/0, W-NINJA 31/0, W-PLUGIN-ID-BANDS 5/0, W-AGENT-ZIP-SYNC PASS,
  sw precache audit 0 missing. sw v1024 (merge of main's v1023).
- **INCONCLUSIVE, said so:** addresses, contacts, vendors/leads, payment terms, units by InternationalSymbol, item groups, price list + currency, bins, opening stock,
  AccountType R/E — SAP's guide prints no record for them. A tester's `sap_export.json` (or their §SAP lines) judges them.

### §FILM-SAP rc1 (2026-11-10) — "How to escape from your SAP Business One" — `~/Videos/How_to_escape_from_your_SAP_Business_One_EN_rc1.mp4` (197.8 s, EN, −16.3 LUFS, peak −0.8)
- Owner: *"Ready for film?"* (after #2774 merged + live: sap_agent.zip on Pages, content == source). Pipeline `scripts/film_sap_migration/` (storyboard `script_en.md`), copied from the BC lane:
  `record.js` (headless, no GPU: runs W-SAP-MIGRATE → verdict/INCONCLUSIVE/alpha facts; runs the agent against the mock → its own §SAP-AGENT lines; then the live form flow on a born
  tenant; `§FILMREC FACT` → `out/rec/facts.json`) → `cards.py` (refuses unless read_only / warehouse refusal shown / witness PASS / verifyChain / offline / no leak are proven;
  caption band 15/15) → `build.py` (Kokoro F/M local CPU) → gain +1.2 dB + limiter (`out/build.log §FINISH`).
- Beats beyond the BC film: "is the model open?" (BC = MIT source; B1 = none found; SAP DB = the engine, never B1's tables — sources on the card), "your own server publishes it"
  (the agent's own lines, 21 calls read only), the guide-example fixture shown as tiny on purpose, the refused warehouse on the summary, "found by running" (item without a unit
  stopped the whole load; converter refusals invisible on the summary, BC's too), "10 rules had no record to test against".
- Facts voiced (this recording): 1 customer · 3 items · 1 account · 12 records one signed change set · verifyChain ok · offline save 0 requests · 10 INCONCLUSIVE rules.
- Not done: other languages (owner asked for ZH/TH/MS on the earlier films — `build_lang.py` copies over when asked); the end card points at the agent download (no SAP guide page yet).

### §GUIDE-CONSOLIDATED + §FILM-SAP ZH (2026-11-10) — owner: *"Do we have a dedicated Migration User Guide? If there is, consolidate it into its own and link from the main. Do the Mandarin version"*
- **Measured first:** two separate step-by-step guides existed (OdooMigrationGuide, BusinessCentralMigrationGuide) + the explainer OdooMigration.md; the ERP User Guide §2 still said SAP /
  Dynamics "on the roadmap". **Now:** `docs/MigrationGuide.md` = ONE Migration User Guide: choose-your-source table (Odoo tested · BC alpha · SAP B1 alpha · iDempiere) → the shared
  three steps written once (company + plugins + Role Access Update, the form/summary/Process/check, offline + team, ERP-side refusals) → one section per source (SAP B1 new:
  agent, flags, read only, what it settles, limits, alpha report; 3 screenshots of the SAP run in docs/img/sap_migration). The two old pages are POINTER pages (films' end cards
  link to them; the guard refuses deletions). ERP User Guide §2 links it; its SAP/BC rows now say alpha + link. Nav: one entry. BIMCompiler #492 MERGED; deployed by
  `safe_gh_deploy.sh` (dry run: exactly the 2 pointer pages shrank → blessed by name with ALLOW_SHRINK paths=; guard PASS; canaries 200); live pages fetched back
  (MigrationGuide 200, its SAP section + sap_agent.zip link present, ERPUserGuide links it 4×, screenshot 200).
- **ZH film:** `~/Videos/How_to_escape_from_your_SAP_Business_One_ZH_rc1.mp4` — 204.9 s, −16.4 LUFS, peak −1.3, 57 caption pieces, end diagram 26/26 labels, caption band 15/15.
  `scripts/film_sap_migration/lang_text.py` (zh) + `build_lang.py` (derived from the BC one: Noto CJK cards, Edge zh voices — CLOUD, house choice for zh — cached, 18 calls, 0 splits).
  The films' end cards still point at the agent download / old guide URLs (pointer pages keep them working).

### §B3-SCOUT — how to bring transactions in (2026-11-10, owner: *"closing books, B/F, then do phantom purchasing / sales as Adaxa Australia first suggested … Or use again my multi table
Excel to bring in core Doc/Line master-detail? … scout for any documentation i have left around in the 2017~"* · *"we also need its consequences in Fact_Acct and material costing …
Steven Sackett from Adaxa Australia's idea … Close the books, start anew with balances b/f"*)
**Found (read, cited):**
- **The cut-over method is written down, in full:** iDempiere wiki *Establish Opening Balances* (archived 2017-06-04; same page on the ADempiere wiki, archived 2011-05-26, last edited
  2011-01-28; the archive does not show the author, so "Adaxa / Steven Sackett" is the owner's memory, not verified). Its method: pick the cut-over date → **import the trial balance as a
  GL Journal**, but route every *document-controlled* account to a CLEARING account (AR Clearing, AP Clearing, Inventory Clearing, Bank Clearing) → then clear them with
  **"a list of fake sales"** (open AR invoices, ONE line, charge *Opening Charge AR*, only the UNPAID amount) and **"a series of fake purchases"** (open AP invoices, charge *Opening
  Charge AP*) → unallocated receipts / prepayments as payments → payments not yet cleared by the bank as payments on the Opening Charge → an opening bank reconciliation →
  a **physical inventory count** for stock (product costs set first, never zero), its shrinkage cancelled against Inventory Clearing by a GL Journal → **proof: every clearing
  account ends at zero**. Unmatched material (received not invoiced / invoiced not received) is done FIRST. Invoices may carry their real dates for an accurate aging.
- **Owner's 2017 route** (red1.org forum t=1838 "Migrating Legacy Data", 2017-03-19, Rangsit): the Ninja CSV-zip importer extended "to handle master/detail documents"
  (screenshot `InvoiceMasterDetailCSVs.png`, not archived); 2017-03-21: it "moves directly into its named table in DB via UPDATE or INSERT … no other validation besides inherent
  DB constraints". 2019 *The Book of Ninja* ch. 8: raw legacy sheet → Master sheet → exact core-table sheets in queue order (C_Order / C_OrderLine named as core tables); t=1861
  (2019): Data Map plugin, SynchMaster, Make Migrate Sheet, update mode. **Neither document completes a migrated document or posts it.**
**Consequence (why it matters):** a document written straight into its table has no Fact_Acct and no cost detail — the books and the stock value would not follow. Replaying every
historical transaction through DocAction would create them, but the results would differ from the old system's books (other costing, rounding, tax, account map) and must then be
reconciled line by line. The cut-over method creates exactly the consequences needed (one journal + open items + one count), each through the ERP's own documents and posting.
**Proposed B3 (awaiting owner):** the cut-over method, carried in the SAME Ninja workbook (new sheets: GL Journal = trial balance with clearing accounts; open AR/AP invoices with
the Opening Charges; open payments; the physical inventory already exists) — loaded through the documents' own Complete + posting, never a bare INSERT. Witness: TB after ==
source TB at the cut-over; every clearing account == 0; AR/AP open items == the source's open list; stock value == the source's valuation. Odoo first (measurable here:
`account.move.line` balances at the date, `amount_residual` of open invoices). History stays optional/read-only.

### §ENGINE-SPEC — ONE migration engine for any ERP, driven by a JSON template the user adjusts (2026-11-10, owner: *"Spec an abstract engine that can migrate basically
any ERP system. Abstract out some JSON template that users can adjust some variable setting ie DB, field XX or adjust.."*; B3 = *"Proceed as you recommended"* folded in)
**Status: SPEC, awaiting the owner's read before any code** (design talk one detail at a time — the template shape is his to adjust).

**0. Measured before writing (2026-11-10):**
- Three sources today = three hand-written converters with the SAME target: Odoo (`erp/odoo_agent/export.js`, agent, XML-RPC), Business Central (`plugins/bc_migrate_convert.mjs`,
  RapidStart Excel, model from the published `.al`), SAP B1 (`erp/sap_agent/agent.js` + `plugins/sap_migrate_convert.mjs`, Service Layer OData). Already shared: the 17-sheet
  Ninja workbook (`HEADERS`/`ORDER`), `finishBook` (lengths), `mask`/alpha report, the Odoo form's plan/load, `withSourceRows`. What differs per source is ONLY: how rows are
  read, which source field feeds which target column, the value maps (CardType cCustomer→IsCustomer), and a handful of named rules.
- **DEFECT found (shipped):** the Ninja loader saves rows through the model but never runs a DocAction — like the owner's Java (`MigrateExcelData.java`, no processIt). So the
  "opening stock" every source loads stays a **Drafted** physical inventory: BC demo run probe = `m_inventory docstatus=DR`, `m_storageonhand=0`, `m_transaction=0`, `fact_acct=0`.
  Guides/films say "opening stock" — the document is there, the stock and its books are not. Legacy's own route completes it: `ImportInventory.java` DocAction parameter
  (:122, processIt :383/:461) + a Cost Adjustment document when the row carries a cost (:546-564). The twin HAS that port (`erp/processes/ImportInventory.js`, AD_Process 219,
  W-IMPORT-INVENTORY: "DocAction CO completes; storage moves"; "NODA → header stays Drafted").
- Legacy import processes in the seed: 194 BPartner · 196 Product · 197 Account · 206 Order · **207 Invoice** · 219 Inventory · **220 GLJournal** · 221 BankStatement · 343 Payment.
  Ported in the twin: 194 (ad_process.js), 196, 206, 219, 343 (`erp/processes/`). **Not ported: 207 ImportInvoice (815 lines), 220 ImportGLJournal (847), 197, 221.**
- The cut-over method (§B3-SCOUT, wiki *Establish Opening Balances*) needs exactly: a GL journal (220), open invoices on Opening Charges (207), payments (343), a physical
  inventory + cost adjustment (219) — all legacy import processes, each with its own DocAction.

**1. The engine = four parts, one implementation each.**
```
 SOURCE ──connector──▶ rows + the source's own model ──template (JSON)──▶ TARGET sheets ──loader──▶ tenant ──verifier──▶ §MIG lines + alpha report
```
- **Connector** (how rows are read — the only code that knows a vendor's protocol). Kinds: `odoo-xmlrpc` · `odata` (SAP Service Layer, BC cloud API, any OData) · `excel` (BC
  RapidStart, a user's own sheets, the owner's raw→Master→core layout) · `csv` · `sql` (postgres / mssql / hana / mysql, READ ONLY — the owner's "DB engine" door: the
  catalog gives tables, columns, types, lengths). Every connector does the same 3 things: `describe()` = the source's own model (fields_get / `$metadata` / information_schema /
  sheet headers / a pinned published model like `bc_model.mjs`), `count(entity)`, `rows(entity, fields, filter)` paged. Runs in the user's agent (node) or in the browser (excel/csv).
- **Template** (JSON, the user's to adjust — §2). Says WHAT to read and HOW it maps. No code in it.
- **Target** = the iDempiere import contract, unchanged for every source: the 17 master sheets (`HEADERS`) + the **open-items sheets** (§3).
- **Loader + verifier** = the twin's existing pieces: the Ninja loader for masters; the PORTED legacy import processes, run with **DocAction = CO**, for documents; then the
  checks of §4. The engine never INSERTs a document behind the model (the 2017 Ninja route's limit, §B3-SCOUT).

**2. The template (one file per source system/version; ships with the engine, the user copies and edits it).**
```json
{ "template": "sap-b1-10", "version": 1, "source": "SAP Business One 10 (Service Layer)",
  "connector": { "kind": "odata", "url": "${URL}", "login": { "CompanyDB": "${COMPANY}", "UserName": "${USER}", "Password": "${PASSWORD}" }, "pageSize": 100 },
  "variables": { "URL": "https://myserver:50000/b1s/v1", "COMPANY": "SBODEMOUS", "USER": "manager", "CUTOVER": "2026-12-31", "PRICE_LIST": "1",
                 "AR_CLEARING": "AR-CLEAR", "AP_CLEARING": "AP-CLEAR", "INV_CLEARING": "INV-CLEAR" },
  "valueMaps": { "bpRole": { "cCustomer": "C", "cSupplier": "V", "cLid": "@refuse:a lead, not a customer or vendor" },
                 "yes":    { "tYES": "Y", "tNO": "N" } },
  "entities": {
    "C_BPartner": { "from": "BusinessPartners", "key": "CardCode",
      "fields": { "Value": "$CardCode", "Name": { "first": ["$CardName", "$CardCode"] }, "TaxID": "$FederalTaxID",
                  "IsCustomer": { "eq": [{ "map": ["bpRole", "$CardType"] }, "C"] }, "IsVendor": { "eq": [{ "map": ["bpRole", "$CardType"] }, "V"] },
                  "IsActive": { "not": { "map": ["yes", "$Frozen"] } } },
      "rules": ["bp-default-group"] },
    "C_Location": { "from": "BusinessPartners.BPAddresses", "key": ["^CardCode", "AddressType", "AddressName"], "fields": { "Address1": "$Street", "City": "$City" } }
  },
  "openItems": { "trialBalance": { "from": "sql:OACT", "account": "$AcctCode", "balance": "$CurrTotal", "documentControlled": { "AR": "${AR_CLEARING}", "AP": "${AP_CLEARING}" } },
                 "arInvoices": { "from": "Invoices", "filter": "DocumentStatus eq 'bost_Open'", "partner": "$CardCode", "documentNo": "$DocNum",
                                 "date": "$DocDate", "openAmount": { "sub": ["$DocTotal", "$PaidToDate"] } } }
}
```
- **Variables** (`${NAME}`): connection (server, database, user — the PASSWORD is never stored: asked at run time, or an environment variable), cut-over date, clearing
  account values, which price list … The DIY screen fills them; the file keeps the rest.
- **Field expressions** — a closed, side-effect-free set, evaluated by ONE evaluator (no `eval`, no JS in a template; a template is data, it can be shared/reviewed/signed):
  `"$Field"` · `"^Field"` (the parent row's field) · literal · `first[]` (first non-empty) · `map[mapName, expr]` · `eq` / `not` / `and` / `or` · `concat[]` · `sub` / `add` / `mul` ·
  `date[expr, format]` · `lookup[entity, key]` (a row the template already produced) · `sum[entity, expr, groupBy]` (stock per item+warehouse). An unknown operator = the template
  is refused at load, naming it. `@refuse:<reason>` as a value = that row is refused with that reason (shown on the summary, as `withSourceRows` does).
- **Rules** = NAMED, implemented once in the engine, each citing the legacy line it copies (no rule invented in a template): `bp-default-group` (ImportBPartner.java:129-132),
  `product-default-category` (ImportProduct.java:213-221), `product-default-uom` (:304-311), `product-default-taxcategory` (:415), `vendor-product-no` (:393-394),
  `location-uu` (UUIDv5 of the source key), `key-cut` (`~<n>`), `po-set-cut` (PO.java:1079-1082), `locator-z` (m_location_where), `country-from-company`.
- **Field check:** before reading, every `$Field` a template uses is checked against `describe()` — a field the source lacks is NAMED (`§MIG-FIELD missing`) and its column
  stays empty (SAP's §SAP-FIELD, generalised). A template for the wrong version is caught here, not by a wrong load.
- **One template per source+version**, in `erp/migrate/templates/`: `odoo-17.json`, `bc-w1.json`, `sap-b1-10.json` first (the three converters re-expressed), then any ERP whose
  connector exists: e.g. a `sql` template for a home-grown system = the tables and columns typed by the user, nothing else.

**3. Open items = the cut-over method (§B3-SCOUT) as target sheets, loaded by the LEGACY import processes with DocAction CO.**
| sheet | legacy table → process | holds | DocAction |
|---|---|---|---|
| Opening journal | `I_GLJournal` → ImportGLJournal (220, **to port**) | the trial balance at the cut-over; document-controlled accounts (AR, AP, inventory, bank in transit) go to the CLEARING accounts | CO |
| Open AR invoices | `I_Invoice` → ImportInvoice (207, **to port**) | one line per invoice, charge *Opening Charge AR*, only the UNPAID amount, its own number/date (aging stays true), no tax | CO |
| Open AP invoices | `I_Invoice` → ImportInvoice | the same with *Opening Charge AP*; supplier credit notes = negative open items | CO |
| Open payments | `I_Payment` → ImportPayment (343, ported) | unallocated receipts / prepayments; not-yet-cleared payments on the Opening Charge | CO |
| Opening stock | `I_Inventory` → ImportInventory (219, ported) | product + locator + QtyCount + CurrentCostPrice (the cost adjustment first, never zero) | CO |
The engine creates (if absent) the four clearing accounts and the two Opening Charges from the template's variables, the way an implementer would by hand (prerequisites of
the wiki method), and lists them in the summary. Unmatched material (received-not-invoiced) is NAMED as not yet handled, not silently skipped.

**4. The verifier (built in; the same for every source; prints `§MIG-*` lines; PRIMAL LAW #4: INCONCLUSIVE when nothing was judged).**
- `COUNT` source `count()` == rows read == rows in the sheets + refused (non-invent, today's manifest).
- `TB` the tenant's trial balance at the cut-over (Fact_Acct) == the source trial balance, account by account (through the template's account map).
- `CLEAR` every clearing account's balance == 0 after all open items are completed. A non-zero clearing account names the difference — the method's own proof.
- `OPEN` the tenant's open AR / AP (C_Invoice not paid) == the source's open list, per partner and in total.
- `STOCK` on-hand per product+warehouse == the source quantities; stock value == the source valuation.
- `ALPHA` the report a tester sends back: counts, field names, refusals — every value masked (today's).

**5. Order of work (each step ends with a witness; nothing ships witness-less).**
- **E1 fix the shipped defect first:** opening stock through `I_Inventory` + ImportInventory DocAction CO (all three sources); witness: storage on hand == the sheet, Fact_Acct
  rows present, the films'/guides' "opening stock" claim becomes true (re-check the BC demo: m_storageonhand > 0).
- **E2 engine core:** template schema + validator (refuses unknown operators/fields), evaluator, rules registry, the excel/csv connector; **acceptance = the SAP B1 template
  re-produces `sap_migrate_convert.mjs`'s workbook cell for cell** on the guide fixture; then BC (`bc-w1.json` == today's BC workbook on the Contoso fixture, 575 rows), then
  Odoo (`odoo-17.json` == export.js on the recorded fixture). Deletion budget: each converter's mapping code is REMOVED once its template matches (lines −/+ stated).
- **E3 open items:** port ImportGLJournal (220) and ImportInvoice (207) verbatim (twin rule), the open-items sheets, the clearing accounts + Opening Charges; Odoo first
  (measurable here: `account.move.line` balances at the date, `amount_residual`), witnesses TB / CLEAR / OPEN / STOCK.
- **E4 the sql connector** (the owner's DB-engine door): read-only catalog + rows; first use = SAP B1's account class from `OACT` (the gap §SAP-MEASURE names) — needs a
  published source for the class numbers, else it stays a template VARIABLE the user fills.
- **E5 the DIY screen:** pick a template, fill its variables (form fields generated from `variables`), run, read the summary — the same plan/load screen as today.
**Not in scope:** closed history (optional, read-only, never posted), non-core modules (they arrive as plugins), writing to any source system.

**6. The common thread of the four exercises (owner: *"that are of common thread in the 3 exercises we done (4th if we consider iDempiere itself)"*) — measured, it is what the engine abstracts:**
| | Odoo 17 | Business Central | SAP Business One | iDempiere (itself) |
|---|---|---|---|---|
| where the MODEL is read | the live server (`fields_get`, export.js version check) | Microsoft's published `.al` source, pinned (MIT) | the user's server `$metadata` | its own dictionary (AD_Table / AD_Column) |
| the door the user already has | agent, XML-RPC | the user's own RapidStart Excel export | agent, Service Layer (OData) | agent, `psql COPY` (`erp/idempiere_agent/migrate_agent.js`) |
| connector kind | `odoo-xmlrpc` | `excel` | `odata` | `sql` |
| mapping today | hand code (export.js) | hand code (bc_migrate_convert) | hand code (sap_migrate_convert) | **identity** — same tables, PKs re-banded |
| target today | 17-sheet workbook → Ninja loader | same | same | **raw copy** into `ad_masters.db` (bypasses the workbook and the loader) |
| proof today | live `search_count` manifest + recorded replay | model == source (0 differ) + Microsoft's demo | `$count` == rows, read only, guide fixture | counts per table |
The thread, in six words each: **(1) the model is READ, never typed** (`describe()`); **(2) the user's OWN door**, read only; **(3) ONE target** (the iDempiere import
contract); **(4) the SAME named legacy rules**; **(5) counts prove nothing was dropped or made up** (+ the masked alpha report); **(6) all or nothing, summary == result**.
**iDempiere is the engine's best falsifier:** its template is the IDENTITY (every target column = the same source column), so iDempiere → engine → twin tenant must equal the
source tenant, table by table — a round trip any mapping error breaks. ⛔ Owner decision (E2): keep iDempiere's raw `psql COPY` fast path as is, or move it onto the identity
template through the same loader (one implementation, but slower) — both are stated; not decided here.

**7. Next session = parallel lanes (owner: *"once spec we resume in new session where u may launch agents to speed up"*).** Agents = Sonnet (memory rule), each in its OWN
`/tmp/wt-*` worktree off fresh `origin/main` (check `git worktree list` first; no `git stash`), each lane = spec § above + its witness, PR with auto-merge, lead session verifies
logs (Watchdog Protocol) before marking ✅:
- **Lane A — E1** opening stock via `I_Inventory` + ImportInventory DocAction CO, all three sources (small, ship first; it fixes a shipped claim).
- **Lane B — E3a** port ImportGLJournal (220) verbatim + `I_GLJournal` + W-IMPORT-GLJOURNAL (independent of everything else).
- **Lane C — E3b** port ImportInvoice (207) verbatim + `I_Invoice` + W-IMPORT-INVOICE (independent).
- **Lane D — E2** engine core: template schema + validator + evaluator + rules registry + excel/csv connector; acceptance = SAP B1 template == sap_migrate_convert output.
  (Lead session, not an agent: it is the design centre and the owner will adjust the template shape.)
- after A–D: BC + Odoo templates (equality witnesses, deletion budget), the open-items sheets + clearing accounts (E3c, Odoo first), then E4 sql connector, E5 DIY screen.

### ▶ (superseded by RESUME HERE 2026-11-10d at the END of the file) RESUME HERE (2026-11-10b) — lanes A–D DONE + all merged; next = E3c open items → Odoo onto the engine → iDempiere falsifier (no questions pending)
**On bim-ootb main @e2b6c92f, sw v1029:** #2784 engine + SAP template · #2787 E1 opening stock CO (Odoo/BC) · #2788 ImportInvoice 207 · #2789 ImportGLJournal 220 + GL Journal DocAction ·
#2790 BC template. Details + § lines: §ENGINE-D-SPEC and the A/B/C/D-BC blocks right after it (end of file). Witness to re-run first: `node erp/tests/witness_migrate_engine.js`
(`§MIGE verdict=PASS judged=30`).
**✅ DECIDED 2026-11-10 (owner: "answer those questions … so that Fable review right away without asking me" — the lead's recommendations, adopted):**
(1) **Odoo door = the agent ships RAW rows, the browser runs `templates/odoo-17.json`** (the SAP pattern). The agent keeps exactly its door duties: XML-RPC read only, version check,
`search_count` manifest per model, the `fields_get` model it read (= `describe()`), the recorded-replay fixture. Mapping leaves `export.js`. Acceptance = W-MIGRATE-ENGINE ODOO-*:
engine on the agent's raw rows == today's `export.js` workbook + manifest + provenance on the recorded fixture (`build/erp/logs_migrate_*`, the odoodemo replay), + a generated DIFF +
coverage + mutants, exactly as SAP/BC; `export.js`'s mapping half frozen as `tests/fixtures/odoo_convert_reference.*` (oracle), deleted from the shipped agent only after equality.
The old finished-workbook path keeps working until then (a user's already-downloaded agent must still load), and `odoo_agent.zip` is rebuilt by `erp/tools/build_odoo_agent_zip.sh`.
(2) **iDempiere = keep the raw `psql COPY` fast path as the production path; add the identity template as its FALSIFIER witness**, not a second loader: iDempiere → engine on an
identity template → compare with the raw copy table by table (rows, PKs after re-band, column values) on the pilot tenant. Retiring the fast path is a LATER, measured call (time
and memory per 10k rows on both), not done here. Reason: the copy is already the identity and proven by counts; the witness adds the column-level proof without slowing the user.
Order: E3c first (below), then Odoo (1), then the iDempiere falsifier (2).
**▶ 2026-11-10c: E3c is BUILT — §E3C-SPEC + §E3C BUILD STATUS at the end of the file (bim-ootb #2791 + #2792 + #2793 all MERGED, main @bf7cfe6d, sw v1032). `§MIGE verdict=PASS judged=51`, `§OB-VERDICT PASS judged=31`. NEXT = Odoo masters onto the engine, then the iDempiere falsifier; bank + payments = E3d.**
**Then, in order:** E3c open-items sheets (GL journal = TB with clearing accounts, open AR/AP on Opening Charges with DocTypeName, payments) on the merged 207/220 ports, Odoo first ·
the open items named under A/B/C (stock VALUE: no source carries a cost → port ImportInventory :546-564; commitEx seam; ws_kernel model_journal; §IINV tag collision; seed c_activity
and 2026 GL periods) · E4 sql connector · E5 DIY screen.

**▶ LEAD BRIEF for the next session (owner 2026-11-10: resume on Fable 5.2 as the lead — "can tackle this complexity"; dispatched agents stay Sonnet unless the owner declares a
free window, memory rule).** Read in this order, nothing else first: (1) this RESUME block · (2) §ENGINE-SPEC §0–§7 · (3) §ENGINE-D-SPEC + the A/B/C/D-BC result blocks after it ·
(4) `erp/migrate/engine.mjs` header + `templates/sap-b1-10.json` (the template language by example) · (5) §B3-SCOUT (the cut-over method). Then:
- **Turn 1: no owner questions are pending** (both decided above). Re-run the engine witness, write §E3C-SPEC, build E3c; then Odoo (1), then the iDempiere falsifier (2).
- **E3c spec (write it here FIRST, dated `### §E3C-SPEC`), then build:** new target sheets beside the 17 masters — Opening journal (`I_GLJournal`, TB at the cut-over, document-controlled
  accounts → AR/AP/Inventory/Bank CLEARING), Open AR / Open AP (`I_Invoice`, one line, charge Opening Charge AR/AP, unpaid amount only, own DocumentNo + date, **DocTypeName carried**
  — seed has no default ARI/API type), Open payments (`I_Payment`). Loaded in the form's stage 2 (`after(trx)`, the hook #2787 added) through ImportGLJournal 220 → batch Complete,
  ImportInvoice 207 DocAction CO, ImportPayment 343 CO. The engine creates the 4 clearing accounts + 2 Opening Charges if absent (named in the summary). **Odoo first** (measurable:
  `account.move.line` balances at the date, `amount_residual`). Witness claims (§ENGINE-SPEC §4): TB == source TB per account · every CLEARING account == 0 · OPEN AR/AP per partner ==
  source · INCONCLUSIVE when nothing judged. Before building: open the cut-over GL period in the test tenant (seed 2026 periods are "never opened", B open item 4).
- **How to work (what made this session land 5 PRs clean):** spec block here before code · each change in its own `/tmp/wt-*` worktree off fresh `origin/main` (`git worktree list`
  first; never `git stash` — a foreign stash exists) · a converter moves onto a template ONLY with W-MIGRATE-ENGINE proving equality to the frozen hand converter (oracle in
  `erp/tests/fixtures/*_convert_reference.mjs`, never edited to pass; a deliberate behaviour change goes in template AND oracle in the same commit, said in the PR) · new template
  constructs = closed, named, validated at load (no eval) · DIFF generator keeps primary keys filled · Watchdog: read every agent's § lines in its log before marking ✅ here.
- **Merge mechanics:** every PR bumps `erp/sw.js` CACHE_VERSION → after any sibling PR lands, `git merge origin/main`, keep BOTH precache additions, take max+1, re-run the witnesses,
  push (auto-merge `--squash`). `ad_import_tables.js` conflicts the same way (keep both tables, both `ensure*` calls, both API entries). Push timeout ~90 s, no retry loops.
- **Witness commands** (log to `/tmp/count_logs/`, read the log): `witness_migrate_engine.js` (`§MIGE verdict=PASS judged=30`) · `witness_sap_migrate.js` (24) · `witness_bc_migrate.js` (18) ·
  `witness_odoo_form.js` (18) · `witness_ninja_migrate.js` (31) · `witness_import_{invoice,gljournal,inventory,payment,order,product}.js` (56/45/23/54/44/15).
- **Public repos:** grep every diff/commit/PR body for the private names (memory `feedback_private_project_no_names_in_public`).

### ▶ (superseded) RESUME HERE (2026-11-10) — §ENGINE-SPEC is written; next session launches the lanes (§ENGINE-SPEC §7)
Live: SAP B1 alpha (bim-ootb #2774) · one Migration User Guide (BIMCompiler #492, #494, deployed) · films SAP EN + ZH rc1 · §B3-SCOUT (the cut-over / open-items method, sourced) ·
**§ENGINE-SPEC** (connector · JSON template · target · loader+verifier; the common thread §6; lanes §7). **First:** read §ENGINE-SPEC §0 (the measured DRAFTED-stock defect) and §6's
one open owner decision (iDempiere raw fast path vs identity template). Then launch lanes A, B, C as Sonnet agents in parallel; the lead session takes lane D.

### ▶ RESUME HERE (2026-11-09c) — SAP alpha out; what is next
**Live after #2774 merges** (check it landed; auto-merge on). Owner's frame: *"earnest effort POC … community can improve it. Release early update often."*
**Next for SAP, in order:** a tester's run (closes CONN + the 10 INCONCLUSIVE rules) · `--sql` door: read `OACT` (account class) through SQLQueries (owner's DB-engine
point; needs the drawer-number meaning from a source, not memory; an SQLQuery is a saved object = a write, so opt-in) · stock at a date · several price lists · film TH/MS when asked (EN + ZH rc1 done; guide = MigrationGuide.md §SAP, §GUIDE-CONSOLIDATED).
**Still open from earlier:** §LAG · Odoo 16/18 field names · B3 balances/open documents (all sources) · twin PO.set length cut (generic) · bim-document plugin start failure
(UNIQUE ad_window_access — seen again on the live page this session) → its lane.

### §ENGINE-D-SPEC — E2 engine core, the lead session's lane (2026-11-10; written before the code)
**Lanes A/B/C dispatched 2026-11-10 (Sonnet, own `/tmp/wt-lane{A,B,C}-*` worktrees, auto-merge PRs):** A = E1 opening stock via `I_Inventory` + ImportInventory CO · B = port ImportGLJournal 220 ·
C = port ImportInvoice 207. Their results are recorded here by the lead after the Watchdog read of their § lines — nothing is ✅ before that.
**What D builds (bim-ootb, `erp/migrate/`, pure ES module, browser + node, no I/O / clock / random):**
- `engine.mjs` — `load(template)` validates (unknown operator, unknown block key, a reference to a sheet not yet produced, a `${VAR}` not declared = REFUSED at load, named);
  `run(template, connector, variables)` → `{ book, manifest, provenance }` — the SAME triple the hand converters return, so the plan/load screen is untouched.
- `connectors/export_json.mjs` — kind `export-json`: reads a file an agent already wrote (today `sap_export.json`); `describe()` = the agent's own manifest (fields read / missing
  per set), `rows(set)`. The OData reading stays in the agent for now (it is the user's door, already witnessed); moving it into an `odata` connector is a later step, named.
- `templates/sap-b1-10.json` — the SAP converter re-expressed as data.
**Template shape — §ENGINE-SPEC §2, with three additions the SAP converter forces (each stated, the owner may adjust):**
1. `entities` stays keyed by the target table, but a value may be a LIST of blocks — one sheet fed from two sources (C_Location ← partner addresses AND warehouses; M_Locator ←
   warehouses AND bins; AD_User ← contact persons OR the card's own contact). Key order = evaluation order (JSON keeps it); a block reading a sheet later in the order is refused at load.
2. Block keys (closed set): `from` (a source set, or `{ "of": <sheet>, "each": <child list>, "first": bool, "ifNone": {...} }` = the children of the source rows ANOTHER block
   accepted — e.g. addresses only of partners that were not refused) · `where` (row not taken, uncounted — only where the converter skips silently today, e.g. an empty address)
   · `refuse` `[{ "when": expr, "why": text }]` (counted into `manifest.refused`) · `fields` · `unique` (a column: second row with the same value not added) · `group`
   `{ "by": [expr], "sort": true, "sum": { col: { "of": expr, "places": n } } }` · `pick` `{ "sortBy": expr, "prefer": expr }` (ONE row: the preferred, else the first) ·
   `prov` (the provenance record) · `patches` / `notes` / `problems` (each `{ when?, rows?: expr, ... }`, emitted after the block in evaluation order).
3. Expressions add `if[c,a,b]` · `in[x, [..]]` · `num` · `str` · `cut[x, n]` (JS slice) · `uuid5[x]` · `seq[name]` (a running counter, shared by name) · `exists[sheet, col, x]` ·
   `out[sheet, col]` / `src[sheet, field]` (the first produced row / its source row) · `count[sheet]` · `countWhere[sheet, expr]` · `@name` (an export-level scalar, e.g. the
   company's Country) · `%name` (a value the template computed once in `let`). Still no `eval`, no JS in a template.
**Acceptance (W-MIGRATE-ENGINE, `erp/tests/witness_migrate_engine.js`, §MIGE lines):**
- `LOAD` the template loads; each of 6 malformed templates (unknown op, unknown key, forward reference, undeclared variable, unknown sheet, bad `group`) is REFUSED with its name.
- `GUIDE` on the guide fixture (`fixtures/sap_b1_guide`, through the mock Service Layer + agent, as W-SAP-MIGRATE does): engine book == `sap_migrate_convert.convert` book cell
  for cell, AND manifest (patches, refused, notes, problems, sheets) and provenance equal.
- `DIFF` the guide fixture prints almost no record (1 partner, 3 items, no address, price or stock), so GUIDE alone is scope-blind: a seeded differential run feeds BOTH
  implementations the same N generated exports built only from the field names and SAP enum member names the converter itself reads (cLid, itFixedAssets, tYES, at_Other …)
  — a test input for equality of two implementations, never shown as business data — and prints per-rule coverage (which converter branches were hit, INCONCLUSIVE for a
  branch never hit). Every differing cell is printed (sheet, row, column, both values).
- `MUTANT` one rule changed in a COPY of the template (e.g. the lead refusal removed) → DIFF must report a difference; a DIFF that cannot fail is not a witness.
- **Only then** (deletion budget): `sap_migrate_convert.convert` becomes `run(template, exportJson(exp), opts)`; lines −/+ stated; W-SAP-MIGRATE re-run unchanged.
**D ✅ BUILT (witness) 2026-11-10 — bim-ootb PR #2784 (auto-merge), branch `feat/migrate-engine-core`.** `erp/migrate/engine.mjs` (213) + `connectors/export_json.mjs` (25) +
`template_loader.mjs` (10, fetch in the browser / file in node; precached, sw v1025) + `templates/sap-b1-10.json` (146). `plugins/sap_migrate_convert.mjs` −114/+11 = `run(TEMPLATE,
exportJson(exp), {CUTOVER, PRICE_LIST})`; the hand converter is kept ONLY as the test oracle `erp/tests/fixtures/sap_convert_reference.mjs` (frozen, never edited to pass a diff).
Log `/tmp/count_logs/migrate_engine.log`: `§MIGE-LOAD PASS judged=8` (6 malformed templates refused, each named) · `§MIGE-FIELD PASS` (30 `$Field`s ⊆ the agent's SETS) ·
`§MIGE-GUIDE PASS judged=3` (book cell for cell, manifest, provenance) · `§MIGE-DIFF cases=400 cells=72539 differing_cases=0` · `§MIGE-COVER hit=32/32` · `§MIGE-MUTANT PASS judged=5`
(each mutant caught) · `§MIGE verdict=PASS judged=18 failed=0`. W-SAP-MIGRATE log byte-identical before/after (`§SAPM-VERDICT PASS judged=23 failed=0 inconclusive=10`).
Browser wiring (Playwright, wiring only): `§MIGE-BROWSER template=sap-b1-10 bpRows=1 problems=0 pageErrors=0 verdict=PASS`.
**Named, found while re-expressing:** the hand converter splits its stock key on `|` (`k.split('|')`), so a warehouse or item code containing `|` would be cut — the template keys
the group by the two values (correct); the generator avoids `|` so the two still agree. Not a live risk for B1 codes seen so far; fixed for free when the oracle retires.
**Next (D continues):** `bc-w1.json` + an `excel` connector (BC RapidStart) == today's BC workbook on the Contoso fixture → delete bc_migrate_convert's mapping; then `odoo-17.json`.
**A ✅ (witness, Odoo + BC) / SAP INCONCLUSIVE — 2026-11-10, bim-ootb PR #2787 (auto-merge), Watchdog-read by the lead.** §E1-SPEC (lane's): the converters and the Ninja workbook are
UNCHANGED (M_Inventory + M_InventoryLine stay, the owner's format); the ONE shared loader (`odoo_migrate_form.mjs`, used by the Odoo, BC and SAP forms) rewrites the two sheets into
one `I_Inventory` sheet loaded with the masters; then a generic form hook `after(trx)` (`AdFormGeneric.executeAfter`, its own Trx, called by the host after the stage-1 commit) runs
ImportInventory 219 with DocAction=CO and throws, naming the reason, on any refused row or any document not CO. Cost: two commits instead of one (the process reads products/locators
by SQL, ImportInventory.java:221-298, which cannot see the masters still pending in stage 1).
BEFORE (origin/main): `§E1-STOCK-CHECK BC key=doc-CO FAIL got=[{"s":"DR","n":1}]` · `key=transaction FAIL m_transaction=0` · same for ODOO (2 DR). AFTER: BC `doc-CO OK` · `onhand OK
(39 keys == sheet QtyCount, nothing else on hand)` · `transaction OK (39)` · `§BCM-VERDICT PASS judged=18`; ODOO the same with 26 keys, `§OF-VERDICT PASS judged=18`; browser host path
`§OFL-VERDICT PASS judged=13`. Regressions: `§NM-VERDICT PASS judged=31`, `§IINV-ALL judged=23 failed=0 verdict=PASS`.
**Still open (named, not done):** (1) **SAP stock** never loaded+completed in a tenant — `§SAPM-STOCK verdict=INCONCLUSIVE judged=0` (the guide fixture has no stock); only a sheet
SHAPE check passes. (2) **Cost / Fact_Acct:** `§E1-COST … fact_acct rows now=0` — no source sheet carries a unit cost, so no cost adjustment and no books for the stock; the
IsUpdateCosting refusal stays (ImportInventory.java:546-564 not ported). The guides' "opening stock" claim is now true for QUANTITIES (Odoo, BC), not for stock VALUE.
**A MERGED** (#2787 on main @802d9514; the lead merged main into it after #2784 — sw v1026, every witness re-run PASS: `§MIGE PASS judged=18`, `§BCM-VERDICT PASS judged=18`, `§OF-VERDICT PASS judged=18`, `§NM-VERDICT PASS judged=31`).
**B ✅ (witness) — ImportGLJournal 220 ported, bim-ootb PR #2789 (auto-merge), Watchdog-read by the lead.** `erp/processes/ImportGLJournal.js` (:65-91 prepare, the whole SQL phase :98-575,
balance logs :577-614, Errors refusal :616-637, batch/journal/line loop :649-832, closing :834-844) + I_GLJournal (AD_Table 599, 70 cols) + **`erp/model_journal.js` NEW: the twin had
NO GL Journal DocAction** (`processIt(gl_journal,CO)` = "no DocAction class registered") — ported from MJournal.java / MJournalBatch.java: Prepare, Complete, Close, Void (journal),
Approve, Reject; Reverse + ReActivate NOT ported (engine answers "not implemented", named). Log `/tmp/count_logs/import_gljournal.log`: `§IGLJ-RESULT verdict=PASS judged=45 failed=0`
(CO: Fact_Acct DR==CR==1000 over 2 rows, per account == the import rows, a 2nd Complete does not double-post · ERR: 9 legacy texts + `WARN=Zero Source Balance,` · UNBAL refused
`@UnbalancedJornal@` · REFUSE: IsImportOnlyNoErrors=Y refuses the whole run). Mutants `§IGLJ-MUTANTS total=21 killed=21 survived=[]`. Regressions PASS: IMPORT-ORDER 44, IINV 23, IPAY 54,
IPROD 15, RECUR 36, WGLJ. Note: ImportGLJournal itself has no DocAction parameter in legacy — it creates Drafted documents; the cut-over method completes the batch after the import.
**Open on B (not accepted divergences — TWIN CARDINAL RULE, fix on the SQLite side):** (1) legacy commits the I_ErrorMsg marks (`commitEx` :616/:624) BEFORE refusing a run with
`@Errors@=n`; the twin's one-Trx host drops them (`§PROC-UNPORTED ImportGLJournal commitEx()…`) — the user would not see WHICH rows failed. Same seam for every ported import that
commits mid-run → a host-level fix (a process may commit its own Trx), not a per-process patch. (2) `model_journal` is not in `ws_kernel.js`'s core list → a WebServices-hosted
Complete of a GL journal fails (one-word add, after #2789 lands). (3) FX pair is legacy's own: the import takes MAX(MultiplyRate) incl. an inactive rate (:301-312, 124.90) while
posting uses active rates only (117.65) — both ports faithful (`§IGLJ-NOTE`); check against the real iDempiere before calling it a legacy bug. (4) Seed 2026 periods "never opened"
— the witness pins 2006-11; a real cut-over at 2026-12-31 needs its GL period opened first (the cut-over runbook must say so).
**C ✅ (witness) — ImportInvoice 207 ported, bim-ootb #2788 MERGED (main @5c29f602), Watchdog-read by the lead.** `erp/processes/ImportInvoice.js` (397): SQL phase :99-510, BP loop
:515-640, invoice loop :651-802, closing :804-813, prepare :63-83. NAMED unported: new BPartner :546-553, new Location :577-593, new Contact :616-626 (`§PROC-UNPORTED` + "ERR=Not ported"
then legacy's "ERR=No BPartner, "). Twin infrastructure it had to add: `MInvoice_beforeSaveNew` (MInvoice.beforeSave :1144-1283 for a process-saved header: currency, price list,
payment term, doc type target, FX gate; cash-plan-line step NOT ported) + Doc_Invoice ARI charge line → C_Charge_Acct.Ch_Expense_Acct (DocLine.getAccount :447-461; before this an
AR charge line answered "not ported", so open AR could not post at all). Log `/tmp/count_logs/import_invoice.log`: `§IINV-RESULT verdict=PASS judged=56 failed=0`; Opening Charge
AR + AP: Fact_Acct balanced 161.12, Posted=Y, IsPaid=N, open 161.12 by an independent allocation oracle, DocumentNo copied; mutants `§IINV-MUTANTS total=23 killed=23 survived=[]`.
**Open on C:** (1) the seed has NO default ARI/API doc type → a row without DocTypeName ends "ERR=No DocType, " — the open-items sheets MUST carry DocTypeName ('AR Invoice'/'AP
Invoice'). (2) DocAction has no "no processing" mode (empty → PR → the invoice is IP, not posted) — the cut-over runs it with CO. (3) twin seed has no `c_activity` table
(`§PROC-SQL-ERROR`, same as ImportPayment/GLJournal) — a seed gap. (4) **log-tag collision:** W-IMPORT-INVOICE prints `§IINV-*`, the SAME prefix as W-IMPORT-INVENTORY (`§IINV-ALL`) —
a grep over both logs cannot tell them apart; rename the invoice witness tag (e.g. `§IINVC-`). (5) no mutant exercises the Trx savepoint around [setDocAction+processIt+saveEx].
**B synced by the lead** after #2788: main merged into `feat/import-gljournal-220` (sw v1028, ad_import_tables keeps BOTH I_Invoice and I_GLJournal), re-run PASS: IGLJ 45 · IINV(invoice) 56
· IINV(inventory) 23 · IMPORT 44 · IPAY 54 · IPROD 15. #2789 auto-merge armed.
**D-BC ✅ BUILT (witness) 2026-11-10 — bim-ootb PR #2790 (auto-merge).** `bc_migrate_convert.mjs` −159/+10 = the engine on `templates/bc-w1.json` (198); reader + enumName moved
verbatim to `connectors/bc_package.mjs`, target contract to `migrate/workbook.mjs`; hand converter kept only as the oracle `tests/fixtures/bc_convert_reference.mjs`. Engine +76/−23:
block keys tag/sort/once/rename, refuse.silent, group.having; ops enum caption re replace trim gt lt len take any obj with lookup treeDepth row hasSet counter.
Log `/tmp/count_logs/migrate_engine_bc.log`: `§MIGE-BC-GUIDE` Contoso ×2 cutovers 0 differing of 3,734 cells · `§MIGE-BC-DIFF cases=300 cells=630421 differing_cases=0` · `§MIGE-BC-COVER hit=34/34`
· `§MIGE-BC-MUTANT judged=6 failed=0` · `§MIGE verdict=PASS judged=30`. The DIFF FOUND two real engine defects before passing (each fixed in the engine, not the oracle): refusals were counted
per block (the converters count one line per sheet + reason); the field check credited a lookup's key fields to the wrong table.
**Named:** the generator never blanks a primary key (`No.`, `Code`, `Customer No.`, `Item No.`): with a key missing the hand converter writes "undefined" into keys, the engine "" — not reachable
from a BC export. Line budget so far: converters −273, engine+connectors+loader+workbook +385, templates +344 → the shrink comes with Odoo (export.js 376 lines, the agent side).
**Next:** `odoo-17.json` (connector `odoo-xmlrpc` = export.js's reading half, runs in the agent) · then E3c open-items sheets on the merged 207/220 ports · E5 DIY screen (variables → form fields).

### §E3C-SPEC — open balances at the cut-over, Odoo first (2026-11-10c, lead session on Fable 5.2; written before any code)
**Re-run first:** `/tmp/count_logs/migrate_engine_resume.log` → `§MIGE verdict=PASS judged=30 failed=0` (bim-ootb main @e2b6c92f+).
**0. Measured before writing (2026-11-10; probes in the session scratchpad, read only):**
- **Source (live odoodemo, Odoo 17.0, company 1, USD only):** 103 posted `account.move.line`; trial balance over 9 of 47 accounts, **sum 0.00**: 101401 bank (`asset_cash`) 12,444.87 ·
  101402 −9,944.87 · 101403 12,842.50 · **121000 receivable 4,005.00** · 131000 1,749.15 · **211000 payable −13,410.15** · 251000 −2,197.50 · 400000 −17,150.00 · 600000 11,661.00.
  Open documents (`amount_residual != 0`): 6 customer invoices +147,180.00 · 5 customer credit notes −143,175.00 (net **4,005.00** == the receivable account) · 6 vendor bills −14,066.92 ·
  2 vendor credit notes +656.77 (net **−13,410.15** == the payable account). Per partner: AR Gemini 4,005 / Acme 0 (open invoices and credit notes that net to zero) / Azure 0; AP Azure −2,300 /
  Ready Mat −11,110.15. Payments: 4, all reconciled → **0 unallocated receipts** (nothing to judge for payments on this source). No inventory account carries a balance.
- **Target (a tenant born by the ported Initial Client Setup):** doc types GL Journal / AR Invoice / AR Credit Memo / AP Invoice / AP CreditMemo exist; GL category Manual exists; ONE tax
  (Standard 9 %, not exempt); **0 charges, 0 bank accounts, 0 document-controlled accounts** (311 accounts); schema `AutoPeriodControl=Y`, history/future 2 days; 12 periods for 2026 and
  **0 `C_PeriodControl` rows**. Legacy makes one period control per DocBaseType when a period is saved (MPeriod.afterSave, MPeriod.java:849-871; GardenWorld in the legacy DB: 10,464 rows
  over 360 periods) → **twin gap** (TWIN CARDINAL RULE: fixed on the SQLite side, step 0 below). The twin's period gate (`model_trade.js` periodOpen :59-76): with auto control a date
  must lie within today ± 2 days; without it the period control of that DocBaseType must be `O`. A cut-over in a past month is therefore refused until the user does what legacy asks:
  untick Automatic Period Control and open the period (Period Status, AD_Process 167, ported).
- **Engine:** the target contract is the fixed 17 sheets (`workbook.mjs` HEADERS/ORDER; SAP and BC are proven cell for cell against it, so it must not grow for them). `lookup` reads
  PRODUCED sheets only — Odoo's rows point at each other by id (many2one), so a template for Odoo needs a lookup into a raw source set. Amounts arrive as floats (4646.779999…).
**1. What E3c builds (five pieces, one implementation each).**
- **(a) the agent's door** (`erp/odoo_agent/export.js`, door duties only — no mapping): beside the workbook it writes `odoo_export.json` (format `odoo-export-json-v1`, the
  export-json connector's shape: `manifest.sets[set] = { count, fields_read, fields_missing, domain }`, `sets[set] = raw rows`). Sets: `account.account` (id, code, name, account_type,
  reconcile) · `tb` = `account.move.line` `read_group` by `account_id`, domain posted + `date <= CUTOVER` (the source's own totals; Σ`__count` must equal `search_count` of the domain) ·
  `open_lines` = `account.move.line`, posted, account type receivable/payable, `amount_residual != 0`, `date <= CUTOVER` (move_id, move_name, move_type, partner_id, account_id, date,
  invoice_date, date_maturity, balance, amount_residual, amount_residual_currency, currency_id, company_currency_id, payment_id, ref) · `res.currency` of the company (name,
  decimal_places) · `partner_keys` (id → the BP Value the workbook gave that partner's commercial partner, + held) — a **bridge** set: it exists only until the Odoo masters run on the
  engine (next step), then the template looks the partner up in its own C_BPartner sheet and the set is deleted. Every field is checked with `fields_get` first (H6, as today).
  The workbook, manifest.json and provenance.json are unchanged (a user's old download still loads).
- **(b) the engine** (`erp/migrate/`): **optional open sheets** `OPEN_HEADERS` = `I_GLJournal`, `I_Invoice` (numbered after the 17, emitted ONLY when a template has an entity for them —
  SAP/BC books stay byte-equal); new operators, closed and validated at load: `find[set, keyField, value, answerField]` (a row of a raw source set by key, indexed) and
  `round[x, places]`; `group.sum` already exists (one open item per move = the sum of its open lines).
- **(c) the template** `templates/odoo-17.json` — born with the open-items entities only (the 17 masters join it in the next step). Open items are ordinary `entities` blocks in the
  same closed language — §ENGINE-SPEC §2's separate `openItems` sketch is dropped (one language, stated change). Variables: `CUTOVER`, `AR_CLEARING`, `AP_CLEARING`, `BANK_CLEARING`,
  `INV_CLEARING` (account Values), `CHARGE_AR`, `CHARGE_AP`, `TAX_NONE`. valueMap `acctClass`: `asset_receivable`→AR, `liability_payable`→AP, `asset_cash`→BANK.
  - `I_GLJournal` ← `tb`, one row per account with a non-zero balance: AccountValue = the account's code, or the class's clearing account; AmtSourceDr / AmtSourceCr = the balance by
    sign, rounded to the currency's decimals; one batch + one journal (`OPEN-TB-<cutover>`), DocTypeName `GL Journal`, CategoryName `Manual`, PostingType `A`, DateAcct = CUTOVER.
  - `I_Invoice` ← `open_lines` grouped by move, for move types out_invoice / in_invoice / out_refund / in_refund: DocumentNo = the move's name, DocTypeName `AR Invoice` /
    `AP Invoice` / `AR Credit Memo` / `AP CreditMemo` (the document keeps its kind; legacy shows a credit memo's open amount negative by itself), BPartnerValue through `partner_keys`,
    DateInvoiced = the invoice's own date (aging stays true), **DateAcct = CUTOVER**, ONE line: ChargeName = Opening Charge AR/AP, QtyOrdered 1, PriceActual = |unpaid amount|,
    TaxIndicator = `${TAX_NONE}`. **Refused, counted and named** (never silently dropped): an open line of a move that is not an invoice (unallocated payment, manual entry on AR/AP),
    a partner that is held (own company / internal user), a foreign-currency item — their total is exactly what the AR/AP clearing account must then still show.
- **(d) the shared loader** (`plugins/odoo_migrate_form.mjs`, the ONE loader of every source form; nothing Odoo-specific):
  - **refused before anything runs** (summary problem row): the cut-over period is not open for GLJ / ARI / API / ARC / APC — the text says to untick Automatic Period Control and
    open the period (legacy's own step); the json and the workbook are not the same export (db, company, cut-over differ).
  - **stage 1** (the existing one transaction): masters + the I_ rows through the Ninja loader + the **prerequisites**, created through the model only when absent and each named in
    the summary: 4 clearing accounts (C_ElementValue) · tax category + tax *Opening Balance (no tax)* (0 %, exempt, TaxIndicator = `TAX_NONE`) · Opening Charge AR / AP on that
    category, their `C_Charge_Acct.Ch_Expense_Acct` = the valid combination of AR / AP Clearing. That last link is the whole proof: the journal debits AR Clearing with the receivable
    balance, each open invoice credits it through its charge → zero when everything came across.
  - **stage 2** (`after`, own transaction, as E1): opening stock (as today) → ImportGLJournal 220 → Complete of the batch → ImportInvoice 207 with DocAction CO. A refused row keeps
    its I_ErrorMsg and I_IsImported=N (legacy's own behaviour); the stage throws naming it; the masters stay.
  - **(e) the verifier** (end of stage 2, every source; `§MIG-*` lines; INCONCLUSIVE when nothing was judged): `TB` Fact_Acct at the cut-over per account == the journal sheet, and
    the receivable / payable classes == the tenant's own control accounts (the balance lands on the business partner group's receivable / payable account, not on the source's
    account number — the account map) · `CLEAR` AR Clearing == 0 and AP Clearing == 0 (or == the named refused total) · `OPEN` open amount per partner (C_Invoice, not paid) == the
    sheet · `BANK` / `INV` clearing reported with their amount and the state OPEN (below).
**2. Not built in this pass — named, with the measured reason:**
- **Bank:** the method clears Bank Clearing with an opening bank statement on a bank account. A born tenant has no bank account, no source sheet carries one, ImportBankStatement 221
  is not ported. So the bank balance stays on Bank Clearing, reported `§MIG-CLEAR bank=OPEN amount=<source bank balance>` (an asserted value, not a PASS). → E3d: C_Bank / C_BankAccount
  masters + 221 + the opening statement.
- **Open payments (`I_Payment`, 343):** needs a bank account (same gap) and the demo has 0 unallocated lines — a witness would judge nothing. The lines are counted and refused with
  their total (above), so the books still prove what is missing. → E3d with bank.
- **Stock value:** no source carries a cost yet (A open item 2); Inventory Clearing reports OPEN with the source inventory-account balance (0 on the demo → INCONCLUSIVE).
- **Foreign currency open items**, **due dates** where Odoo has a due date but no payment term (the ERP recomputes the due date from the term; counted in a note).
**3. Witnesses (claims first; each names the issue it proves).**
- `W-MIGRATE-ENGINE` cases `ODOO-OPEN-*` (issue: "the template maps the cut-over rows exactly"): on the RECORDED export (`fixtures/odoo_export_2026-11-10/`, written by the agent
  from the live demo): journal sheet Σ Dr == Σ Cr; per account == an oracle computed straight from the raw `tb` rows (not through the engine); invoice sheet per move == an oracle
  from the raw `open_lines`; refused == oracle; `find` / `round` / unknown-sheet malformed templates refused at load; mutants (class map entry removed, sign flipped, group removed,
  refusal removed) each caught; SAP + BC cases unchanged (judged 30 → 30 + new).
- `W-ODOO-FORM` case `OPENING` (issue: "the migrated tenant's books equal the source's at the cut-over"): tenant born, period opened the legacy way, Process → `TB` per account ==
  source · `CLEAR` AR == 0, AP == 0 · `OPEN` per partner == source (Gemini 4,005.00 …) · every imported invoice CO, Posted, IsPaid=N · batch CO · prerequisites present and named ·
  falsifiers: period not opened → refused before anything is written; one open line removed from the json → CLEAR names exactly that amount.
- `W-GENESIS-*` (step 0): a born tenant has one `C_PeriodControl` per period × distinct DocBaseType, status `N` (MPeriod.java:849-871); Period Status 167 then opens them.
**4. Order of work:** step 0 period controls (twin gap, own PR) · (a) agent + recorded fixture · (b)+(c) engine + template + W-MIGRATE-ENGINE · (d)+(e) loader + verifier + W-ODOO-FORM ·
then Odoo masters onto the engine (decision 1), then the iDempiere falsifier (decision 2).

**§E3C BUILD STATUS (2026-11-10c, lead session; every line below read from its log):**
- **Step 0 ✅ MERGED — bim-ootb #2791** (Sonnet agent, Watchdog-read): a born tenant gets its `C_PeriodControl` rows. **Correction to §E3C-SPEC 0:** legacy does NOT make them in
  MPeriod.afterSave at setup (the periods are saved before the doc types exist, MSetup.java:473-486 vs :710+); they come from the LAST step of createAccounting, process
  DocumentTypeVerify (MSetup.java:853-858 → DocumentTypeVerify.java:130-197). `/tmp/count_logs/period_control.1.log`: `§PC-TENANT … periods=12 distinctDocBaseTypes=27 controls=324` ·
  `§PC-PROC167 ok=true "Updated #27"` · `§PC-VERDICT PASS real=PASS mutant=FAIL` (BEFORE `controls=0`).
- **Second genesis gap, found by the first stage-2 run ✅ MERGED — bim-ootb #2792:** a born tenant had **0 `C_AcctSchema_Element`** rows → ImportGLJournal.java:398-408 answered
  "Invalid Account" for every row. Ported MSetup.java:556-660 (OO with Org_ID, AC with C_Element_ID + the DEFAULT_ACCT account, PR, BP = the legacy pilot tenant's 4 rows, read from
  `idempiere_pilot`). `§SE-VERDICT PASS real=PASS mutant=FAIL`; genesis oracle fixture re-recorded by the witness's own recorder (additions only); `§GC-VERDICT PASS judged=10`.
- **E3c (a)–(e) ✅ BUILT (witness) — bim-ootb PR #2793 (auto-merge armed), branch `feat/migrate-e3c-open-items`, sw v1032.** `erp/odoo_agent/export.js` +45 (raw door →
  `odoo_export.json`; zip rebuilt) · `migrate/engine.mjs` +14 (optional open sheets; `find` / `round` / `abs` / `sumSet`) · `migrate/templates/odoo-17.json` (75, open balances only) ·
  `plugins/odoo_migrate_convert.mjs` (22) · `plugins/open_balances.mjs` (150, every source form) · `plugins/odoo_migrate_form.mjs` +30.
  - `/tmp/count_logs/e3c_migrate_engine.log`: `§MIGE-ODOO-OPEN recorded: tb_rows=9 journal_lines=9 AR=4005.00 AP=-13410.15 BANK=12444.87 open_lines=21 documents=19 refused=2` ·
    `§MIGE-ODOO-GEN cases=300 differing_cases=0 cover=8/8` · `§MIGE-ODOO-OPEN-MUTANT verdict=PASS judged=10` · **`§MIGE verdict=PASS judged=51 failed=0`** (was 30; SAP/BC unchanged).
  - `/tmp/count_logs/e3c_open_balances.log` (W-OPEN-BALANCES, new; a separate witness, not a W-ODOO-FORM case — that one stays pinned to the 11-09 fixture): shipped
    `§MIG-TB accounts=9 differing=0 sum=0.00 PASS` · `§MIG-CLEAR AR … balance=0.00 PASS` · `§MIG-CLEAR AP … 0.00 PASS` · `§MIG-CLEAR BANK … balance=12444.87 state=OPEN` ·
    `§MIG-OPEN documents=19/19 partners=5 differing=0 AR=4005.00 AP=-13410.15 PASS` · `§MIG-VERIFY verdict=PASS judged=5`; witness oracle from the raw rows:
    `§OB-BOOKS accounts=11 plain=6 differing=0 control=["12110","21100"] AR_control=4005.00 AP_control=-13410.15 … sum=0.00` · falsifier `AR clearing AR-CLEAR is 2002.50, expected 0.00`
    · **`§OB-VERDICT PASS judged=31 failed=0`** (10 cases: PERIOD, SUMMARY, RUN, PREREQ, TB, CLEAR, OPEN, RERUN, FALSIFY, PERIOD-OPEN).
  - Regressions PASS: OF 18 · NM 31 · BCM 18 · SAPM 24 · IINV 56 · IGLJ 45 · IINV(inventory) 23 · GC 10 · browser `§OFL-VERDICT PASS judged=13` · agent zip sync.
- **Learned (legacy facts the form now states to the user):** (1) legacy dates the journal BATCH today (MJournalBatch.beforeSave :948-961) and Complete tests that period — a login
  later than the cut-over needs TODAY's period open for GLJ as well as the cut-over's, and a calendar year that has today (`PeriodNotFound` otherwise); the form refuses first, naming
  both. (2) ImportGLJournal's "WARN=Period Closed" reads C_PeriodControl directly and ignores Automatic Period Control — a warning only, the rows import. (3) the receivable / payable
  balance lands on the tenant's OWN control accounts (12110 / 21100, from the BP group), not on the source's account numbers — the TB claim is per class there.
- **Changed against §E3C-SPEC (stated):** no `CUTOVER` / `INV_CLEARING` variable — the cut-over is the date the agent read the balances at (`@manifest.cutover`), inventory has no
  class in Odoo's account types; the converter reports what it could not bring in as `manifest.left { AR, AP }` and the verifier expects exactly that on the clearing accounts.
- **Open, named (not accepted divergences):** (a) `model_layer.js` trailing-UPDATE of a row created in the same group drops `idCol` for a table without a single key column
  (C_Charge_Acct → "no such column c_charge_acct_id") when the value points at a LATER op — worked around by creating the valid combination first; fix generically. (b)
  `witness_odoo_messy.js` fails 2 checks on main since #2787 (it never runs stage 2: M_Inventory gain 0) — update it to call `executeAfter`. (c) E3d: bank (C_Bank / C_BankAccount
  masters, ImportBankStatement 221, the opening statement → Bank Clearing to zero) + unallocated payments (ImportPayment 343). (d) stock value (ImportInventory :546-564). (e) foreign
  currency open items; due dates without a payment term. (f) SAP / BC templates carry no open balances yet (the loader and verifier are source-neutral and ready).
- **Next:** Odoo masters onto the engine (decision 1: the agent ships raw rows for the 17 sheets too, `odoo-17.json` grows the 17 entities, equality to the frozen `export.js`
  mapping on the recorded fixture + DIFF + mutants; then `partner_keys` is deleted and the open items look the partner up in the template's own C_BPartner sheet) → the iDempiere
  falsifier (decision 2).

### §ODOO-ENGINE-SPEC — the Odoo masters onto the ONE engine (2026-11-10c; owner decision 1 of the RESUME block; written before any code)
**Today (measured):** `erp/odoo_agent/export.js` (≈420 lines) does two jobs in one loop — READS Odoo (XML-RPC, `fields_get` check, `search_count` per slice) and MAPS to the 17 sheets
(keys, held partners, addresses, vendor prices, locators, stock). Since E3c it also writes `odoo_export.json` with the raw open-balance sets + the bridge `partner_keys`.
**Target:** the agent ships RAW rows for the masters too; the browser maps them with `templates/odoo-17.json`; the mapping half leaves the shipped agent only after equality is proven.
**Three steps, each with its witness (W-MIGRATE-ENGINE cases `ODOO-*`):**
1. **O1 raw door + frozen oracle (mechanical; a Sonnet agent).** (a) `export.js` adds the master sets to `odoo_export.json`, raw as Odoo returned them (the E3c `flat()` rule:
   many2one → `<f>` id + `<f>__name`, `false` → null), one set per `slice()`/read it already does, each with its `search_count` and `fields_read`: `uom.uom`,
   `account.payment.term`, `account.payment.term.line`, `product.category`, `account.account` (already there), `account.group` (count only), `res.partner` (archived too),
   `res.users` (partner_id), `res.company` (all: partner_id; the chosen one: name, currency, country), `res.country`, `res.country.state`, `stock.warehouse`, `product.product`
   (archived too, + `product_tmpl_id`), `product.supplierinfo`, `stock.location`, `stock.quant`. Manifest scalars the mapping needs: db, cutover, currency, company id / name /
   country code, other companies, odoo_version, the command line for the other companies. The workbook, manifest.json, provenance.json stay byte-identical (a re-run on the live
   demo must reproduce the recorded fixture's three files). (b) the mapping half is MOVED verbatim into a pure function `erp/tests/fixtures/odoo_convert_reference.mjs`
   `convert(exp) → { book, manifest, provenance }` that reads ONLY `exp.sets` / `exp.manifest` (no RPC, no fs, no clock) — the ORACLE, never edited to pass. **Witness `ODOO-REF`:**
   `convert(recorded odoo_export.json)` == the recorded `odoo_migration.xlsx` cell for cell (17 sheets), `manifest.json` (all keys but `tool`) and `provenance.json`, on BOTH recorded
   exports (the demo and the messy one — the messy fixture must be re-recorded with the new agent from its own Odoo database if that database still exists; if not, named
   INCONCLUSIVE, never faked); falsifier: one mapping rule changed in a copy → the equality fails.
2. **O2 the template (lead session — the template language is the design centre).** `odoo-17.json` grows the 17 entities; new constructs only as the oracle forces, each closed,
   named, validated at load. **Witness `ODOO-GUIDE`** engine == oracle on both recorded exports (book, manifest, provenance) · **`ODOO-DIFF`** N seeded exports generated from the
   recorded rows (fields blanked, codes repeated, parents broken, archived flags flipped, quants split by lot, price breaks) with per-branch coverage · **`ODOO-MUTANT`**.
   Then the open-items entities look the partner up in the template's own `C_BPartner` sheet and the bridge set `partner_keys` is deleted from the agent and the template.
3. **O3 the cut (deletion budget).** The form builds the book from `odoo_export.json` alone (the workbook file becomes optional; an old download — workbook + manifest — still loads);
   `export.js` loses its mapping half (lines −/+ stated) and writes `odoo_export.json` (+ the workbook only behind a flag, or not at all — decided by what W-ODOO-FORM /
   W-NINJA-MIGRATE / W-ODOO-MESSY need; they move to the engine path in the same PR); `odoo_agent.zip` rebuilt; W-OPEN-BALANCES re-run unchanged (31).

### §PLUGIN-ROLE-ACCESS-SPEC — a started plugin's forms / processes reach every tenant's roles the legacy way (2026-11-10d; owner, after starting the migrate plugins on the live page: *"ok works.. proceed with the fixing of last reported issues"*)
**Issue (measured):** the four migrate bundles (`ninja_migrate`, `odoo_migrate`, `bc_migrate`, `sap_migrate`) each carry a HAND list `ROLES = [[0, 0], [102, 11]]` for their
`AD_Form_Access` / `AD_Process_Access` rows — System Administrator and GardenWorld Admin only. A tenant the user created himself has no row, so its admin never sees "Migrate from …"
— the very tenant a migration is for. A per-plugin role list is the AD-LAYER LAW defect (a hand list for behaviour the dictionary engine owns).
**Legacy mechanism (read):** a pack-in that brought a Form / Process / Window / Workflow / InfoWindow sets `element.requireRoleAccessUpdate` (FormElementHandler.java:75,
ProcessElementHandler.java:89, WindowElementHandler.java:98 …) and at its end `PackInHandler.updateRoleAccess` (PackInHandler.java:522-536) runs `MRole.updateAccessRecords(false)`
for every ACTIVE role with `IsManual='N'` (of the login client; all clients when it is System). The record's own afterSave gives the LOGIN role access (MForm.afterSave :131-137).
The twin already has the ONE port of `updateAccessRecords` (`model_master.js` :338-363, also behind Role Access Update, AD_Process 295 … `processes/RoleAccessUpdate.js`).
**Fix (generic layer, `erp/plugin_registry.js` stageDictionary — zero per-plugin code):** after a bundle's `manifest.dictionary` rows are staged, if any of them is an
`ad_form` / `ad_process` / `ad_window` / `ad_workflow` / `ad_infowindow` row, run the ported `updateAccessRecords` for every active non-manual role and stage — through the same
refcounted `dict.insert`, so Stop removes them — exactly the access rows it produces FOR THE BUNDLE'S OWN records (rows it would add for other records are not the bundle's to
stage: counted in the log, not written). Log `§PLUGIN-ROLE-ACCESS bundle=… roles=N rows=+n other=m`. **Deletion budget:** the `[102, 11]` hand rows leave the four bundles; the
role-0 row stays as MForm.afterSave's "login role" row (System Administrator starts the plugin; the level rule alone would not give a System-level role a Client+Org form).
**Witness `W-PLUGIN-ROLE-ACCESS` (`erp/tests/witness_plugin_role_access.js`, §PRA lines; denominator from the dictionary, not a hand route):** X of N — for each of the 4 bundles ×
every active non-manual role whose UserLevel admits the record's AccessLevel (the oracle rule written out in the witness from MRole.java, independent of the port): an access row
exists after Start; a MANUAL role and a role whose level does not admit it have none; a tenant born BEFORE the start has its admin row; a tenant born AFTER the start has it too
(or the gap is named with its cause); Stop removes every row the start added (counts back to the start); a second Start adds no duplicate; falsifier: the pass disabled → the born
tenant's admin has no row. Regressions: W-ODOO-FORM / W-BC-MIGRATE / W-SAP-MIGRATE / W-NINJA-MIGRATE (their "access rows for roles 0 and 102" checks restated as "role 0 and 102 have
access", since the count now follows the roles), W-OPEN-BALANCES, browser W-ODOO-FORM-LIVE.

**§2026-11-10d STATUS (lead session; logs read):**
- **O1 ✅ MERGED — bim-ootb #2794** (Sonnet agent, Watchdog-read): `export.js` writes the 16 raw master sets into `odoo_export.json`; oracle `erp/tests/fixtures/odoo_convert_reference.mjs`
  (296 lines, the mapping half moved verbatim). `/tmp/count_logs/o1_migrate_engine.log`: `§MIGE-ODOO-REF … sheets=17 rows=309 book_diffs=0 manifest_diffs=0 provenance_diffs=0` ·
  `§MIGE-ODOO-REF verdict=PASS judged=7` (3 falsifiers caught) · `§MIGE-ODOO-REF-MESSY verdict=INCONCLUSIVE (database not on this Odoo)` — the `odoo_messy` database was dropped
  2026-11-09, so the second recorded export cannot be re-recorded · `§MIGE verdict=PASS judged=58`. The re-run reproduced the three committed files byte for byte. Agent's notes for
  O2: each set read "archived too" carries `archived_too: true` in its manifest entry; `res.country` / `res.country.state` hold only the rows partners reference; the product read
  now carries `product_tmpl_id` (one RPC fewer — the old recorded replay of the messy database may no longer match the call set, untested).
- **§PLUGIN-ROLE-ACCESS ✅ BUILT (witness) — bim-ootb PR #2795 (auto-merge armed), branch `fix/plugin-role-access`, sw v1034.** `plugin_registry.js` stageRoleAccess (+30) + the
  hand `[102, 11]` rows out of the four migrate bundles. `/tmp/count_logs/plugin_role_access.log`: `§PRA-X-OF-N X=48 N=48 roles=16 (non-manual active=14) records=4 missing=0
  unexpected=0` · `§PRA-BORN after-start … records_at_birth=0/4 records_after_next_start=4/4` · `§PRA-VERDICT PASS judged=8 failed=0`. **Added to the spec while building:** a
  bundle that SHIPS access rows beyond the login role keeps its explicit list — found by W-POS-SALES, whose claim is "exactly the clerk's role" (`§POSS-RESULT PASS judged=43`
  after the rule). Regressions PASS (24 witnesses, list in the PR); `witness_team_releases` and `witness_pos_sales_live` hit the 400-500 s cap with no failure line — not concluded.
- **Live:** the site served sw `v1033` with `plugins/open_balances.mjs` = 200 (E3c + O1 deployed, fetched back). Plugins start only as System Administrator (role 0,
  `plugin_registry.js` mayWrite) — legacy's rule, confirmed with the owner on the live page ("ok works").

### ▶ (superseded by RESUME HERE 2026-11-10h at the END of the file) RESUME HERE (2026-11-10d)
1. **Check #2795 landed** (`gh pr view 2795`); then fetch the live page's `sw.js` (v1034) — a green pipeline is not a deployed feature.
2. **O2 (lead): the 17 master entities into `templates/odoo-17.json`** — §ODOO-ENGINE-SPEC step 2. Oracle = `tests/fixtures/odoo_convert_reference.mjs` (never edited to pass);
   witnesses ODOO-GUIDE / ODOO-DIFF / ODOO-MUTANT in `witness_migrate_engine.js` (now 58). Then delete the bridge set `partner_keys` (open items look the partner up in the
   template's own C_BPartner sheet). Then **O3** the cut (the form builds the book from `odoo_export.json`; `export.js` loses its mapping half), then the **iDempiere falsifier**.
3. Small named items, any order: `witness_odoo_messy.js` (2 fails on main since #2787 — make it run stage 2) · `model_layer.js` trailing-UPDATE without `idCol` on a table with
   no single key column · E3d bank + unallocated payments · stock value · a tenant born while bundles run gets its plugin access only at the next start.
Baselines: `§MIGE verdict=PASS judged=58` · `§OB-VERDICT PASS judged=31` · `§PRA-VERDICT PASS judged=8` · OF 18 · NM 31 · BCM 18 · SAPM 24.

**§2026-11-10e (lead, after the owner's "Go"):** #2795 MERGED and fetched back live (sw v1034, `plugin_registry.js` carries the pass, no hand role row in the Odoo bundle).
- **O2 DISPATCHED** to a Sonnet agent — worktree `/tmp/wt-odoo-o2`, branch `feat/odoo-template-masters`. The lead's definition of "equal" (the engine's HEADERS are a superset of
  the Odoo oracle's for some sheets, e.g. M_Product's two `…>IsDefault` columns): every oracle column present and cell-equal, row order equal, every engine-only column blank;
  manifest equal on sheets / source_counts / patches / renamed / held / notes / self_check_fails + the scalars; provenance equal. It opens a DRAFT PR if anything is not equal.
  Nothing is ✅ until the lead reads its `§MIGE-ODOO-GUIDE / -DIFF / -COVER / -MUTANT` lines and reviews every construct it added to `engine.mjs`.
- **Small items a + b ✅ BUILT (witness) — bim-ootb PR #2798 (auto-merge armed):** `Trx.groupOps` trailing UPDATE names `<table>_uu` for a table without a single key column —
  `/tmp/count_logs/sf_groupops.log` `§GOC-VERDICT PASS judged=4 failed=0` (falsifier throws the old "no such column: c_charge_acct_id"); `witness_odoo_messy.js` runs stage 2 —
  `/tmp/count_logs/sf_odoo_messy.log` `§OM-AFTER ok=true … Opening stock completed: 1 inventory document(s), 25 line(s)` · `§OM-VERDICT PASS judged=14 failed=0` (was FAIL 2).

### §IDEMPIERE-FALSIFIER-SPEC — iDempiere through the engine on an IDENTITY template, as the falsifier of engine + loader (2026-11-10e; owner decision 2; written before any code — build AFTER O2/O3, it touches `engine.mjs`)
**Decided (RESUME 2026-11-10b):** the raw `psql COPY` fast path (`erp/idempiere_agent/migrate_agent.js`) STAYS the production path; this adds a witness, not a second loader.
**Why it is a falsifier:** every other source is judged against an oracle we wrote (a hand converter). Here the oracle is the source itself — the target IS iDempiere, so
iDempiere → engine → Ninja loader → twin tenant must give back the source rows. A mapping, lookup, default or length error anywhere in engine or loader shows as a difference.
**Measured (2026-11-10, legacy postgres):** GardenWorld (`idempiere`, client 11): C_BPartner 18 · M_Product 55 · M_ProductPrice 114 · C_BPartner_Location 16 · M_InventoryLine 1.
Pilot (`idempiere_pilot`, client 1000000): C_ElementValue 55 · C_BPartner 6 · C_Location 8 · M_Product 5 · M_PriceList_Version 3 · M_ProductPrice 9 · M_Inventory 3 /
M_InventoryLine 5 · **C_UOM 0 · M_Product_PO 0** (a sheet with no source row judges nothing → INCONCLUSIVE for that sheet, named). GardenWorld is the richer source; both are run.
**Pieces:**
- **Connector `sqlite-tenant`** (test side only for now): `rows(table)` = the rows of ONE tenant from the agent's own output DB (`ad_masters_*.db`, the raw copy), `model` =
  its columns (PRAGMA). Read only. No new agent code: the falsifier reads what the production path already wrote.
- **Template `idempiere-identity.json`, GENERATED, not typed:** from `workbook.mjs` HEADERS — a plain column = `"$<column>"`; a lookup `X_ID>Alt` = `find[<table of X>, <key>, $X_ID,
  Alt]` (the table by the loader's own rule: column minus `_ID`, else the column's reference key table, read from the dictionary); the Line-finds-header-by-DocumentNo rule the
  same way. A generator script writes it; the witness regenerates and requires byte equality with the committed file (a hand edit is caught).
- **Run:** tenant born by the ported Initial Client Setup → engine(identity template, source rows) → the shared form loader (stage 1 + stage 2) → compare with the SOURCE rows.
**Witness `W-IDEMPIERE-FALSIFIER` (`erp/tests/witness_idempiere_falsifier.js`, §IDF lines), per sheet, X of N columns from HEADERS:** row count == source (minus rows the
summary refused, each named) · for every sheet column the loaded row's value == the source row's (a lookup compared by the looked-up key, not the re-banded id) · rows matched by
the sheet's natural key (Value / Name / DocumentNo / UU). **Expected, named differences are found by the run, not assumed** — e.g. units map to System units, a tenant's own
defaults (BP group, tax category, element) resolve to the BORN tenant's rows, opening stock becomes a Completed document. Each such class must be explained by a legacy rule or
it is a defect to fix on the engine / loader side. Falsifiers: one template field swapped → the witness names that column; one source row dropped → the count check names the sheet.
**Not in scope:** columns outside the 17 sheets (the fast path carries every column; the import contract does not), transactions, retiring the fast path (a later, measured call:
time and memory per 10k rows on both).

**§2026-11-10f (lead; logs read):**
- **#2798 MERGED** (groupOps `_uu` idCol + W-ODOO-MESSY stage 2).
- **O2 ✅ BUILT (witness) — bim-ootb PR #2802 (auto-merge armed; synced with main by the lead, sw v1037), Watchdog-read.** `odoo-17.json` carries the 17 master entities.
  `/tmp/count_logs/o2m_migrate_engine.log` (after the sync): **`§MIGE verdict=PASS judged=82 failed=0`**; agent's run `/tmp/count_logs/o2_final_engine.log`:
  `§MIGE-ODOO-GUIDE sheets=17 rows=309 diffs=0 self_check_fails=0 patches=13 notes=7 renamed=2 held=12` · `§MIGE-ODOO-DIFF cases=300 cells=565169 differing_cases=0 threw=0` ·
  `§MIGE-ODOO-COVER hit=69/69` · `§MIGE-ODOO-MUTANT verdict=PASS judged=18` · SAP `§MIGE-DIFF cases=400 … differing_cases=0` 32/32 · BC `§MIGE-BC-DIFF cases=300 … differing_cases=0`
  34/34 · `§MIGE-ODOO-REF-MESSY verdict=INCONCLUSIVE` (database gone). `§OB-VERDICT PASS judged=31` · `§OF-VERDICT PASS judged=18`. patches / renamed / held / notes equal IN ORDER.
  - **Engine grew +77/−21** (lead scanned the diff: no eval / I/O / clock; all in the closed sets, validated at load). Ops: `all` `findAll` `filter` `each` `sortBy` `at` `cat`
    `split` `log10` `fixed` `json` `dict` `meta` `tally` `key`. Block keys: `keys {col,id,raw,max,as,patch}` (the oracle's key rule: first keeps its code, a repeat gets
    `<code>-<id>`, too long is cut keeping `~<id>`; fills manifest.renamed) · `limit {id,cell,rule,cols}` (text cut + one patch naming the ids). Also `from.list`, `from.let` as a
    list, `group.within`, `#members`, patch flag `zero`. The connector gained `meta()`.
  - **For O3 (found by the agent):** provenance is keyed by TABLE in the engine and by SHEET NAME (`01C_UOM`) in the old files — map it where the form reads it · each manifest
    sheet's `source` text is the template's srcKey, not the Odoo domain text · manifest `format` is now `ninja-workbook-v3` for the whole run (the open-balance part used to say
    `ninja-open-balances-v1`; nothing read it) · `openBalances()` now evaluates the masters too and discards them · not generated by the DIFF: a null posx/posy/posz (oracle
    prints "null", engine "") and a missing primary key.
- **Next = O3 the cut (lead):** the form builds the whole book from `odoo_export.json` (workbook optional; an old download still loads), open items look the partner up in the
  template's own C_BPartner sheet and `partner_keys` goes, `export.js` loses its mapping half (−/+ stated), fixtures + W-ODOO-FORM / W-NINJA-MIGRATE / W-ODOO-MESSY move to the
  engine path, zip rebuilt. Then the iDempiere falsifier (§IDEMPIERE-FALSIFIER-SPEC).

**§2026-11-10g (lead; logs read):** #2802 (O2) MERGED (main @8d0cfe79).
- **O3a ✅ BUILT (witness) — bim-ootb PR #2806 (auto-merge armed), branch `feat/odoo-form-engine-path`, sw v1038.** `plugins/odoo_migrate_convert.mjs` `convert()` + `hasMasters()`;
  `odoo_migrate_form.mjs` plan(): `odoo_export.json` alone → the engine's book (a set shorter than Odoo's count is refused first); a workbook + manifest.json loads as before.
  `/tmp/count_logs/o3_open_balances.log`: `§OB-JSON-ONLY tables workbook_path={…} engine_path={…}` identical on 17 of 17 · `same-books OK` (11 accounts + open per partner) ·
  `§OB-VERDICT PASS judged=36 failed=0`. Regressions: OF 18 (empty-form check restated: one line names both ways) · OM 14 · NM 31 · BCM 18 · SAPM 24 · MIGE 82 · OFL 13.
- **O3b plan (next, in this order):** (1) template: `bpValue` = `key[bpKey, commercial partner of $partner_id]`, `held` = the template's own `pHeld` on that partner row; delete the
  set `partner_keys` from `export.js`, the fixture and the two witness oracles (they take the partner Value from the frozen reference converter's C_BPartner provenance instead;
  the "held" variant becomes "the partner is an internal user's" via `res.users`). (2) **O3c the agent cut:** `export.js` loses the mapping half and writes only
  `odoo_export.json` — USER-VISIBLE (one file to pick instead of two): the same PR set must update `docs/MigrationGuide.md` (bim-compiler, `scripts/safe_gh_deploy.sh`), the agent
  README and the form texts; the bim-compiler witnesses that run `export.js` for its workbook (`poc_sheet_contract.js`, the `harden_*` set) are superseded by ODOO-REF / ODOO-GUIDE
  and must be retired or repointed in the same change; the films still show two files (named, not redone).

**§2026-11-10h (lead; logs read):** #2806 (O3a) MERGED.
- **O3b ✅ BUILT (witness) — bim-ootb PR #2808 (auto-merge armed), branch `feat/odoo-drop-partner-keys`, sw v1039.** Template: `bpValue` / `held` from the template's own partner
  mapping (`oPartner` → `pBpKey` / `pHeld`); `partner_keys` gone from `export.js`, the fixture (live re-run byte-identical apart from that set; workbook / manifest / provenance
  unchanged) and both witness oracles (they read the frozen hand mapping). `/tmp/count_logs/o3b_migrate_engine.log` `§MIGE-ODOO-GEN cases=300 differing_cases=0 cover=8/8` ·
  `§MIGE-ODOO-OPEN-MUTANT verdict=PASS judged=10` · `§MIGE verdict=PASS judged=82`; `/tmp/count_logs/o3b_open_balances.log` `§OB-VERDICT PASS judged=36`. **Found by a surviving
  mutant:** with the lookup inside the template a held partner would still be refused but under "no business partner" — the oracle now checks the refusal REASON too.

### ▶ (superseded by RESUME HERE 2026-11-10l at the END of the file) RESUME HERE (2026-11-10h)
1. Check #2808 landed; fetch the live `sw.js` (v1039).
2. **O3c — the agent cut (USER-VISIBLE, do as ONE change set):** `export.js` loses its mapping half and writes only `odoo_export.json` (lines −/+ stated); agent README + form
   texts; `docs/MigrationGuide.md` §Odoo (bim-compiler → `scripts/safe_gh_deploy.sh`, never bare mkdocs): the user picks ONE file; retire or repoint the bim-compiler witnesses
   that run `export.js` for its workbook (`scripts/poc_sheet_contract.js`, the `harden_*` set — their claims live in ODOO-REF / ODOO-GUIDE / ODOO-DIFF now); the recorded 11-10
   workbook / manifest / provenance files STAY as the frozen record ODOO-REF judges against; W-ODOO-FORM / W-NINJA-MIGRATE keep the 11-09 workbook fixture = the "older download
   still loads" proof. The films still show two files — named, not redone.
3. **iDempiere falsifier** — §IDEMPIERE-FALSIFIER-SPEC (GardenWorld is the richer source).
4. Named, any order: E3d bank + unallocated payments · stock value (Odoo `standard_price` is in the raw rows now) · a tenant born while bundles run gets plugin access only
   at the next start · SAP / BC open balances · ODOO-REF-MESSY INCONCLUSIVE (database gone) · DIFF does not generate a null posx/posy/posz.
Baselines: `§MIGE verdict=PASS judged=82` · `§OB-VERDICT PASS judged=36` · `§PRA-VERDICT PASS judged=8` · `§GOC-VERDICT PASS judged=4` · OF 18 · OM 14 · NM 31 · BCM 18 · SAPM 24.

**§2026-11-10i (lead; logs read):** #2808 (O3b) MERGED.
- **O3c code ✅ BUILT (witness) — bim-ootb PR #2809 (auto-merge armed; Sonnet agent, Watchdog-read), branch `feat/odoo-agent-reads-only`, sw v1040.** `export.js` 441 → 178
  lines (+34 / −297): reads only, writes `odoo_export/odoo_export.json`. Acceptance: a live re-run on the demo is BYTE-IDENTICAL to the committed fixture
  (`…/scratchpad/acc/run.log`: `✓ every set read has as many rows as Odoo counted for it — 17 sets` · `🟢 ODOO-EXPORT PASS — odoo_export.json (19 sets, 344 rows)`; `tb` and
  `account.group` are exempt from the row==count door check — one row per account / count only). `xlsx.mini.min.js` left the agent; zip 121,712 → 33,685 bytes. Witnesses
  (`/tmp/count_logs/o3c_witness_*.log`): MIGE 82 · OB 36 · OF 18 · NM 31 · OM 14 · zip sync PASS. No witness in bim-ootb spawned `export.js`.
- **O3c guide — BIMCompiler PR #512 (docs/migration-guide-odoo-one-file, off master, worktree `/tmp/wt-bc-guide`):** Odoo steps 3–4 = one file; new paragraph on open balances
  (period to open, control accounts, `BANK-CLEAR`, what is not brought in). **NOT yet deployed:** publish with `scripts/safe_gh_deploy.sh` from that worktree only after #2809 is
  fetched back live (copy `docs/glassbowl_data.db` in first — DOCS_DEPLOY_POLICY known guard trip), then fetch the page back.
- **Still open from O3c:** the bim-compiler witnesses that run the old `export.js` for its workbook (`scripts/poc_sheet_contract.js`, `harden_*`) — not yet retired/repointed.

**§2026-11-10j — O3 CLOSED (lead; logs read, live fetched back):**
- **#2809 MERGED and LIVE:** the page serves sw `v1040`; the downloaded `odoo_agent.zip` (33,739 bytes, 9 files) holds the reads-only `export.js` (0 mentions of the workbook);
  `plugins/odoo_migrate_convert.mjs` live carries `hasMasters`; the live template has no `partner_keys`.
- **Guide ✅ PUBLISHED:** BIMCompiler #512 merged to master (its one check, `system-is-real`, was still pending — a docs-only change) and deployed with
  `scripts/safe_gh_deploy.sh` (`/tmp/count_logs/docs_deploy.log`: `§GUARD result=PASS` on the dry run, `§STEP6 all canaries 200`, `§DEPLOY-DONE`); the live
  `MigrationGuide/` page fetched back carries `odoo_export.json` and `BANK-CLEAR`.
- **bim-compiler witnesses of the old agent** (logs `build/erp/logs_migrate_2026-11-10/`): `poc_odoo_owndb.js` REPOINTED — `§G demo export files=["odoo_export.json"]
  byte-identical to the recorded fixture=true` · `🟢 W-ODOO-OWNDB PASS` (before: 2 ✗ on the workbook files). `poc_sheet_contract.js` and `poc_odoo_messy.js` print
  `verdict=INCONCLUSIVE — SUPERSEDED` (exit 3) against a reads-only agent, naming the witnesses that carry their claims now.
- **O3 line budget:** agent `export.js` 441 → 178 (−297 / +34); zip 121,712 → 33,685 bytes; engine +91 over O2/E3c; template 0 → 242 lines of data; the hand mapping survives only
  as the test oracle `erp/tests/fixtures/odoo_convert_reference.mjs`.
- **Not redone (named):** the Odoo films still show two files being picked.
**NEXT = the iDempiere falsifier (§IDEMPIERE-FALSIFIER-SPEC), then the named items of RESUME HERE 2026-11-10h point 4.**

**§2026-11-10k — iDempiere falsifier: first run ADJUDICATED (lead; `/tmp/count_logs/idf_run.log` read) — bim-ootb draft PR #2811, branch `feat/idempiere-falsifier`.**
Built by a Sonnet agent to §IDEMPIERE-FALSIFIER-SPEC: connector `tenant-rows`, GENERATED `idempiere-identity.json` (26 lookups resolved from the dictionary, `§IDF-GEN PASS`),
recorded fixtures for GardenWorld (128 KB) and the pilot (25 KB), `witness_idempiere_falsifier.js`. `§IDF-COUNT` PASS on both; two falsifiers caught (a template field swapped →
that column named; a source row dropped → the sheet named).
- **The falsification claim HOLDS:** on every row that loads, every column the 17-sheet contract carries equals the source — whole sheets equal: C_Location 33/33 (7 of 7
  columns), C_BPartner_Location 16/16, AD_User 6/6, M_PriceList_Version 6/6, M_Warehouse 11/11, M_Locator 11/11 (GardenWorld), C_ElementValue 55/55 (pilot); M_Product 13 of 13
  columns on its 49 loaded rows. **No engine defect and no loader defect found.**
- **What does NOT come across is the import CONTRACT's reach, not a mapping error — ruled per class:**
  | class | ruling | measured |
  |---|---|---|
  | `contract-default-only` | the sheet can only say "the tenant's default" group / tax category (generator: `Y` when the row is the default, else blank — accepted) | BP group: 14 of 17 GardenWorld partners land on the default group · pilot: 4 of 5 products REFUSED (non-default tax category → mandatory empty) |
  | `unit-not-carried` | FORM GAP: a source unit can only be mapped to an existing unit, never kept (`odoo_migrate_form.mjs` filters the C_UOM sheet; `mapUom` supports `x12de355` but the form offers no such answer) | 6 units, 6 products of 4 units with no twin unit |
  | `key-already-in-tenant` | LEGACY RULE (unique index): refusal is right; but the loader is all-or-nothing, so ONE such key refuses a real migration | 311 of 379 accounts, Immediate, Standard category / partner / price list; pilot also its warehouse + locator |
  | `import-inventory-renumbers` | LEGACY RULE (ImportInventory.java:392-398): the document gets its own number and description | 1 header |
  | `header-without-lines` | contract: the I_Inventory rewrite is one row per line | 2 headers |
  | `cascade` | a child of a refused parent | product prices / vendor rows / stock lines of the above |
- **Follow-up sent to the agent:** the witness reports two verdicts — `§IDF-COLUMNS` (the claim) and `§IDF-COVERAGE` (every row not loaded attributed to ONE class by a
  computed rule, the totals pinned; an unattributable loss = FAIL, with its own falsifier) — and merges only if `§IDF-VERDICT` is PASS under that.
- **New named items from the falsifier (for the generic "any ERP" engine):** (1) the form must be able to KEEP a source unit (code asked from the user); (2) a source key the
  tenant already holds — today it refuses the whole file: show it as "already there" and skip, or update? (owner's Ninja semantics: F7 all-or-nothing; a design call);
  (3) BP group / tax category beyond "default" need their own sheets in the contract.

**§2026-11-10l — iDempiere falsifier ✅ BUILT (witness) — bim-ootb PR #2811 ready, auto-merge armed (lead read `/tmp/count_logs/idf_final.log`):**
`§IDF-COLUMNS PASS sheets_judged=26 columns_judged=141 rows_compared=459` (only the ruled columns differ: BP group 14 rows; the Import Inventory number / description / line
header, 1 row each) · `§IDF-COVERAGE-VERDICT PASS` — every row not loaded attributed by a computed rule and PINNED: GardenWorld `key-already-in-tenant` 315 · `unit-not-carried`
12 · `cascade:unit-not-carried` 8 · `header-without-lines` 2; pilot `contract-default-only` 4 · `cascade:contract-default-only` 13 · `key-already-in-tenant` 6 · three
falsifiers caught (`§IDF-FALSIFY-COLUMN`, `-ROW`, `-UNATTRIBUTED`: a C_Location row dropped from the book → named as fitting no class, with its dependent row) ·
**`§IDF-VERDICT PASS columns=PASS coverage=PASS`**. Pilot C_UOM and M_Product_PO: INCONCLUSIVE (no source row). Test-side only (no shipped file, no sw bump).

### ▶ RESUME HERE (2026-11-10l) — supersedes 2026-11-10h. The three jobs dictated for 2026-11-10 are DONE: E3c · Odoo onto the engine (O1–O3) · the iDempiere falsifier.
1. Check bim-ootb #2811 landed (`gh pr view 2811`); prune `/tmp/wt-idf` when merged and clean.
2. **⛔ ONE owner decision (from the falsifier, class `key-already-in-tenant`):** a source row whose key the tenant already holds (e.g. a payment term "Immediate", a partner
   "Standard") is refused by the unique index, and because the loader is all-or-nothing (F7) the whole migration is refused. Options: (a) keep as is — the user unticks or
   renames in the source; (b) show such a row as "already there", skip it and load the rest (lead's recommendation: the summary already lists every refusal before Process);
   (c) update the existing row (the Ninja IsActive=Y update mode). Nothing is changed until he says.
3. Then, in order: the form KEEPS a source unit (asks its code; `mapUom` already supports it) · E3d bank (C_Bank / C_BankAccount masters, ImportBankStatement 221, the opening
   statement → Bank Clearing to zero) + unallocated payments (343) · stock value (Odoo `standard_price` is in the raw rows; ImportInventory.java:546-564 to port) · BP group /
   tax category sheets in the contract · SAP / BC open balances (the loader and verifier are source-neutral) · the older list: commitEx seam for imports, `model_journal` in
   `ws_kernel.js`, §IINV tag collision, seed `c_activity`, E4 sql connector, E5 DIY screen.
4. Known and named: a tenant born while bundles run gets plugin access at the next start · ODOO-REF-MESSY INCONCLUSIVE (database gone) · the Odoo films show two files.
Baselines: `§MIGE verdict=PASS judged=82` · `§OB-VERDICT PASS judged=36` · `§IDF-VERDICT PASS` (141 columns, 459 rows) · `§PRA-VERDICT PASS judged=8` · `§GOC-VERDICT PASS
judged=4` · OF 18 · OM 14 · NM 31 · BCM 18 · SAPM 24 · bim-compiler `🟢 W-ODOO-OWNDB PASS`. Live: bim-ootb sw v1040; guide published.

### §ALREADY-THERE-SPEC + §KEEP-UNIT-SPEC (2026-11-10m; owner: *"Explain again in simple from iDempiere POV what is 'key already in the tenant'? Proceed with your advice"* — option (b))
**A. A source row whose key the tenant already holds is SKIPPED as "already there", the rest loads.** iDempiere POV: Initial Client Setup gives a new client its chart of
accounts and the rows "Standard" (partner, category, price list, warehouse) and "Immediate" (payment term); each key is unique per client (a database unique index). A migrated
row with the same key is refused by that index — correctly — and because the Ninja loader is all-or-nothing (F7) the whole migration was refused (falsifier: 315 GardenWorld rows).
- **Where:** the shared form loader (`plugins/odoo_migrate_form.mjs`), NOT the Ninja process — its all-or-nothing rule stays for everything else.
- **How (no hand key list):** the model's own unique check (`model_layer.js` uniqueError, the dictionary's `ad_ddl_unique`) says who holds the key: one extra log line
  `§MODEL-UNIQUE table=… key=(…)=(…) held_by=tenant|this-load` beside the unchanged legacy error text. The form loads once inside a savepoint; rows refused ONLY for a key held
  by the TENANT are taken out of the book, the savepoint is rolled back and the load runs again. A key repeated inside the file itself (`held_by=this-load`) is still a refusal.
- **Seen by the user before Process:** the sheet's row says "n already in this tenant — kept as they are, not loaded" (column *Already there*); rows pointing at such a key
  (a product in category "Standard") use the tenant's row. **Not done:** comparing or updating the existing row (option c).
- Also fixed on the way: the form's refusal parser lost every refusal whose text has two lines (the unique error's "Detail:" line) — the sheet showed 0 refused.
**B. A source unit can be KEPT as a new unit.** The unit row gains an editable *New unit code* (the UoM's X12DE355 code, mandatory in legacy, up to 4 characters): filled and no
ERP unit chosen → the unit is created with that code (`mapUom` `{ x12de355 }`, already there) and its products use it; an ERP unit chosen wins; neither = the question stays.
**Witness:** W-IDEMPIERE-FALSIFIER re-pinned (the `key-already-in-tenant` rows become class `already-there`: skipped, existing row compared; the loader no longer needs the
harness to take them out) + W-ODOO-FORM cases `ALREADY` (a workbook whose payment term is renamed "Immediate": before = whole run refused; now = that one row shown as already
there, everything else loads, summary == result; a key repeated INSIDE the file is still refused) and `KEEP-UNIT` (a unit with no ERP equivalent + a code → the unit exists
with that code and its products point at it; without a code the run is still refused).

**§2026-11-10n (lead; logs read):** #2811 (falsifier) MERGED.
- **§ALREADY-THERE + §KEEP-UNIT ✅ BUILT (witness) — bim-ootb PR #2822 (auto-merge armed), branch `feat/migrate-already-there-keep-unit`, sw v1044.** `odoo_migrate_form.mjs`
  `load()` = `loadOnce` inside a savepoint + the already-there pass; `model_layer.js` uniqueError adds the log line `§MODEL-UNIQUE … held_by=tenant|this-load` (error text
  unchanged); unit rows gain *New unit code*. `/tmp/count_logs/at_already_there.log`: `§AT-ALREADY … C_PaymentTerm={"infile":11,"will":10,"already":1,"refused":0,…}` ·
  `run stage1=true stage2=true` · `§AT-REPEAT … "refused":1 … duplicate key … stage1=false` · `§AT-KEEP-UNIT … made=[{"name":"Units","c":"ZZ1"}] products_using_it=45` ·
  **`§AT-VERDICT PASS judged=9 failed=0`**. BEFORE (same witness, `AT_ERP=~/bim-ootb/erp` on main, `at_already_there.before.log`): `run stage1=false … Nothing migrated: 1 row
  error(s)` and the summary showed `"refused":0` — the refusal parser lost every two-line refusal (fixed). The payment term's unique key is its NAME (`c_paymentterm_name`).
  Regressions: OF 18 · OM 14 · OB 36 · NM 31 · BCM 18 · SAPM 24 · IDF PASS · IINV 56 · POSS 43 · GOC 4 · OFL 13 (unit check restated: 6 answer cells).
- **Follow-ups queued:** the falsifier re-pinned so the LOADER does the skipping (class `already-there`) and units without an ERP equivalent are kept with a code · the guide:
  two sentences (already there; new unit code) → `scripts/safe_gh_deploy.sh`. Then the E3d bank spec.

**§2026-11-10o (lead; live fetched back):** #2822 MERGED and LIVE (sw `v1044`; the live `odoo_migrate_form.mjs` carries the already-there pass and `newcode`). Guide: BIMCompiler
#529 merged + deployed (`/tmp/count_logs/docs_deploy2.log` `§GUARD result=PASS`, `§STEP6 all canaries 200`; the live page carries "New unit code" and "Already there"; the Role
Access Update step replaced by what the plugin start now does). Falsifier re-pin (the LOADER skips, units kept with their code): sent back to the Sonnet agent, result pending.

### §E3D-SPEC — the bank balance and unallocated payments at the cut-over (2026-11-10o; written before any code)
**Why:** after E3c the source's bank balance waits on `BANK-CLEAR` (demo: 12,444.87) and the books are not finished until someone clears it by hand; unallocated receipts and
payments are refused with their total left on the AR / AP clearing accounts. The cut-over method (§B3-SCOUT): unallocated receipts / prepayments = payments; the bank balance =
an OPENING BANK STATEMENT; proof = Bank Clearing ends at zero.
**0. Measured (2026-11-10):**
- **Source (live odoodemo):** `account.journal` — 1 bank journal *Bank* BNK1 (account 101401, balance 12,444.87; no `res.partner.bank` attached, no bank named) + 1 cash journal
  *Cash* CSH1 (101501, no balance); suspense 101402 (−9,944.87: 8 statement lines, all unreconciled); *Outstanding Receipts* 101403 (12,842.50 = 4 posted payments not yet
  matched to a statement line, all reconciled to invoices). 0 unallocated receipts (E3c measurement stands) → the payment half has NOTHING to judge on this source.
- **Target:** a born tenant has 0 `C_BankAccount`. The twin has the POSTING of a bank statement (`model_post.js` Doc_BankStatement, `witness_post_bankstatement.js`) and line
  helpers (`model_trade.js` :582-625) but **NO bank statement DocAction** (no `registerDocAction('c_bankstatement')`: a statement cannot be Completed) and **ImportBankStatement
  (AD_Process 221, 540 Java lines) is not ported**; `I_BankStatement` (AD_Table 600) is in the dictionary. ImportPayment 343 is ported. Legacy `MBankStatement.java` = 804 lines.
**1. Pieces (each its own witness; lanes can run in parallel):**
- **Lane BS — port the bank statement DocAction** (`MBankStatement.java` prepareIt / completeIt / voidIt / closeIt, + `MBankStatementLine` beforeSave/afterSave already partly in
  `model_trade.js`): `erp/model_bankstatement.js`, registered for `c_bankstatement`; W-BANKSTATEMENT (Complete posts through the existing Doc_BankStatement; a line with a
  CHARGE and no payment posts Dr bank asset / Cr the charge's account; period gate CMB; void; the legacy texts). Verbatim, citing Java lines; NAMED where not ported.
- **Lane IB — port ImportBankStatement 221** verbatim (`erp/processes/ImportBankStatement.js` + `I_BankStatement` physical table via `ad_import_tables.js`, as 207 / 220 were):
  W-IMPORT-BANKSTATEMENT (X of N process parameters, the SQL phase's legacy error texts, statement + lines made, payment / charge / BP resolution, rerun, delete-old, mutants).
- **Lane E3d (lead, after BS + IB land):** (a) masters: sheets `C_Bank` + `C_BankAccount` in the contract (from Odoo `account.journal` type bank/cash + `res.partner.bank` /
  `res.bank` when present; a journal without a bank → a bank row named after the journal, a named PATCH) — the agent ships the raw sets; (b) prerequisite: charge *Opening
  Charge Bank* whose account IS Bank Clearing; (c) open sheet `I_BankStatement`: ONE statement per bank account at the cut-over, ONE line = the account's balance on that charge
  → Complete: Dr the tenant's bank asset account / Cr Bank Clearing → `§MIG-CLEAR BANK … balance=0.00 verdict=PASS` replaces `state=OPEN`; (d) `I_Payment` for unallocated
  receipts / payments (343, DocAction CO) — judged only on a source that has some (the demo has 0: a seeded DIFF proves the template, the load stays INCONCLUSIVE, said so).
  The amounts Odoo holds on *Outstanding Receipts / Payments* and the suspense account stay plain accounts in the opening journal (E3c) — NAMED: payments in transit are not
  re-created as documents.
- **Witness W-OPEN-BALANCES gains case BANK:** Bank Clearing == 0.00; the tenant's bank asset account == the source bank balance per bank account; the statement Completed and
  Posted; falsifier: the bank journal's balance changed in the export → the clearing account names the difference.

**§2026-11-10p — in flight (three Sonnet agents; nothing below is ✅ until the lead reads their § lines):** falsifier re-pin (`/tmp/wt-idf2`, branch
`test/idempiere-falsifier-repin`) · Lane BS bank statement DocAction (`/tmp/wt-e3d-bs`, `feat/bankstatement-docaction`, W-BANKSTATEMENT) · Lane IB ImportBankStatement 221
(`/tmp/wt-e3d-ib`, `feat/import-bankstatement-221`, W-IMPORT-BANKSTATEMENT). Next for the lead once BS + IB are merged: Lane E3d of §E3D-SPEC (bank masters sheets, *Opening
Charge Bank*, the `I_BankStatement` open sheet, W-OPEN-BALANCES case BANK).

**§2026-11-10q — falsifier RE-PINNED ✅ (witness) — bim-ootb PR #2823 (auto-merge armed; lead read `/tmp/count_logs/idf_repin.log`):** the harness no longer removes anything —
the LOADER skips (`§IDF-ALREADY … loader_summary == witness_rule` on both tenants: 311 accounts + 4 on GardenWorld, 6 on the pilot) and keeps units with the source's own code
(Mililiter→ml, kilogram→Kg, litre→L, milligram→mg). `§IDF-REPIN GardenWorld already-there 315->315 · cascade:unit-not-carried 8->0 · header-without-lines 2->2 ·
unit-not-carried 12->2` (the 2 = units no product uses, which the form drops) · pilot unchanged · `§IDF-COLUMNS PASS sheets_judged=27 columns_judged=145 rows_compared=477`
(C_UOM now judged, 4 of 4 columns; all 55 products, 29 vendor rows, 114 prices of GardenWorld load) · three falsifiers caught · `§IDF-VERDICT PASS`.
- **Measured cost (named):** the run went 15 s → 2 m 20 s. Profile (`node --cpu-prof`): 140 s, of which ~70 % inside SQLite (wasm + its `read`), i.e. the loader's own per-row
  lookups — it now loads the 311 already-there accounts too, and a book with already-there rows is loaded TWICE (savepoint, roll back, load again), in the dry run and in the
  run. Not a defect; for a large source it doubles the load time when such rows exist. Cheaper design if it ever matters: find the held keys by one query per unique index
  before loading instead of loading to find them.

**§2026-11-10r (lead; logs read):** #2823 (falsifier re-pin) MERGED.
- **Lane BS ✅ BUILT (witness) — bim-ootb PR #2825 (auto-merge armed; Sonnet agent, Watchdog-read), branch `feat/bankstatement-docaction`, sw v1045.** `erp/model_bankstatement.js`
  (221): MBankStatement DocAction (prepareIt, completeIt incl. payments reconciled + `C_BankAccount.CurrentBalance`, voidIt, closeIt, reActivateIt, approve / reject; the two
  reverse actions answer false as the Java does) + the statement / line model hooks; loaded in `idempiere.html`, `sw.js`, `ws_kernel.js`. `/tmp/count_logs/bs_witness.log`:
  **`§BST-RESULT verdict=PASS judged=41 failed=0`** · `bs_witness_mut.log` `§BST-MUTANTS … total=25 killed=25 survived=[]`. The case the migration needs — `CHARGE`: one
  +1000.00 line on a charge, no payment → bank asset (508) Dr 1000 / the charge's account (702) Cr 1000, balanced per accounting schema, CurrentBalance +1000, a second Complete
  does not post again. Regressions: post_bankstatement 4/4 · IPAY 54 · IINV 56 · IGLJ 45 · OB 36 · POSS 43.
  - **Named, not ported / not witnessed:** unlockIt / invalidateIt (no such engine action) · deposit-batch branches (coded, the seed has no `C_DepositBatch`) · the
    `BANK_STATEMENT_POST_WITH_DATE_FROM_LINE` paths (coded, unwitnessed) · reverseCorrect / reverseAccrual answer false as legacy (no reversal exists) · getSummary unwitnessed.
  - **Twin corrected against the Java:** the statement line's period check also runs when DateAcct CHANGES (MBankStatementLine :174), not only on a new line.
  - **For lane E3d:** GardenWorld posts to TWO accounting schemas (101 and 200000, the second in another currency) — judge per schema; a born tenant has one.

**§2026-11-10s (lead; logs read):** #2825 (lane BS) MERGED.
- **Lane IB ✅ BUILT (witness) — bim-ootb PR #2826 (auto-merge armed; Sonnet agent, Watchdog-read), branch `feat/import-bankstatement-221`, sw v1046 (merged main with BS).**
  `erp/processes/ImportBankStatement.js` (243) + `I_BankStatement` physical table (`ad_import_tables.js`). `/tmp/count_logs/ib_main.log` **`§IBS-RESULT verdict=PASS judged=51
  failed=0`** · `ib_mutants.log` `§IBS-MUTANTS … total=36 killed=36 survived=[]`. Regressions: IGLJ 45 · IINV 56 · IPAY 54 · IINV(inventory) 23 · IMPORT 44 · OB 36.
  - **Legacy facts the migration must respect (asserted in the witness):** 221 does NOT resolve names — `ChargeName`, payment / invoice numbers, `BPartnerValue` are never read:
    the caller fills the IDs (`C_Charge_ID`, `C_BankAccount_ID` or `BankAccountNo`). No DocAction parameter: statements are created Drafted. Lines are numbered 10, 20 … by
    the process. A different StatementDate does not open a new statement when both Names are equal.
  - **The opening-balance row (witnessed, 12,444.87 on one charge line):** `I_IsImported=N`, the org, the account (`C_BankAccount_ID` or `BankAccountNo`), `StatementDate`,
    `StatementLineDate`, `StmtAmt = ChargeAmt = X`, `C_Charge_ID`; TrxAmt / InterestAmt left empty (the SQL makes them 0). Result: one Drafted statement, Beginning = the
    account's CurrentBalance, Difference = X.
  - **Duplicate to remove in lane E3d (one implementation per responsibility):** the port sets the statement's doc type (CMB) and ending balance INLINE (MBankStatement.beforeSave
    :258-273) because no hook was registered when it was written; lane BS has since registered that hook (`model_bankstatement.js`). The inline copy is guarded (only when the
    doc type is still empty) so nothing is double-set, but it must go.
  - Named: `commitEx()` :364 is a no-op in the one-transaction host (printed `§PROC-UNPORTED`); the amount comparison is rounded to 6 decimals (SQLite REAL).
- **Lane E3d plan (lead), concrete:** (1) agent: raw sets `account.journal` (bank / cash: name, code, type, default_account_id, bank_account_id, bank_id, currency_id) +
  `res.partner.bank` / `res.bank` of those journals; re-record the fixture. (2) contract: master sheets `C_Bank` (Name, RoutingNo) and `C_BankAccount` (C_Bank_ID>Name,
  AccountNo, Name?, C_Currency_ID>ISO_Code, BankAccountType, CurrentBalance 0) — a journal with no bank → a bank named after the company (a named PATCH); AccountNo = the
  journal's code when Odoo has no account number (named PATCH). (3) open sheet `I_BankStatement` (BankAccountNo, StatementDate = StatementLineDate = cut-over, StmtAmt =
  ChargeAmt = the journal account's trial-balance amount, `C_Charge_ID>Name` = *Opening Charge Bank*) for each bank / cash journal whose account has a balance. (4) loader:
  the prerequisites step must run BEFORE the Ninja load (the sheet looks the charge up by name), creates *Opening Charge Bank* → Bank Clearing; stage 2 runs 221, then
  Complete of each statement, then the verifier's BANK line becomes a judged check (`balance == 0.00`), and the tenant's bank asset account per bank account == the source.
  (5) the period gate also for `CMB`. (6) W-OPEN-BALANCES case BANK + ODOO-OPEN oracle / variants / mutants for the new entities. (7) remove the inline beforeSave copy from
  the 221 port. Unallocated payments (`I_Payment`): template + DIFF only; the load is INCONCLUSIVE on this source (0 rows).
