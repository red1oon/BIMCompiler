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
