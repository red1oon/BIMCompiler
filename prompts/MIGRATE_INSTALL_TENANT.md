# ⚠ DO NOT REMOVE — MIGRATION ENGINE lane: move a company from another ERP into the browser ERP (Odoo 17 tested; SAP Business One and Business Central alpha; iDempiere by raw copy)
# SCOPE: the agent the user runs on his own system (reads only) · ONE engine with the mapping as a JSON template · the shared form loader (summary before Process, all or
#   nothing, "already there") · open balances at the cut-over (journal, open invoices, bank) checked against the source · the user guide (`docs/MigrationGuide.md`, master).
#   Code lives in `~/bim-ootb/erp` (`migrate/`, `plugins/*migrate*`, `plugins/open_balances.mjs`, `odoo_agent/`, `processes/Import*.js`); this file is its spec + state.
# READ THE LOG AFTER EVERY RUN — the exit code is not evidence; a verdict that judged nothing is INCONCLUSIVE, never PASS. Spec block here BEFORE code. Non-invent.
# TRIAGED 2026-11-10: 1,822 lines → this file. Nothing was deleted: the full history (2026-06-05 → 2026-11-10) is verbatim in
#   `prompts/archive/MIGRATE_INSTALL_TENANT_full_2026-06-05_to_2026-11-10.md`; §ARCHIVE-INDEX at the end maps every removed section to its line there.

### ▶ RESUME HERE (2026-11-10v) — NEW SESSION: REVIEW + HARDEN the migration feature and its user guide (owner: *"review and harden the migration feature and user guide to be highly resourceful and viable important feature of our project. Resume new session"*)
**Read in this order, nothing else first:** this block · `§LEDGER` (what shipped, with its witness) · `§FACTS` (legacy facts and rulings this lane paid for — do not
re-derive them) · `§B3-SCOUT` (the cut-over method) · `§ENGINE-SPEC` (the design; its stale parts are marked). Depth on any shipped piece = the archive, by `§ARCHIVE-INDEX`.
Guide: `docs/MigrationGuide.md` on **master** (not on this branch).
Memory to read before touching the guide: `feedback_user_guide_quality_bar.md`, `feedback_propose_before_editing_docs.md` (structure / tone = propose first; a factual
correction = just fix), `feedback_docs_deploy_landmine.md` (publish ONLY with `scripts/safe_gh_deploy.sh`, from a worktree off master, `docs/glassbowl_data.db` copied in).

**0. Nothing is in flight.** Every PR of 2026-11-10 is merged; the live page was fetched at sw `v1047` with `plugins/open_balances.mjs` carrying `§MIG-BANK`; the guide's bank
sentence was corrected (BIMCompiler #537, deployed through the guard — re-fetch the page once to confirm it is served: it must say "opening bank statements"). All
`/tmp/wt-*` worktrees of this lane are pruned. Start by re-running the baselines of §1 (the exit code is not evidence; read the § lines).

**1. Where the feature stands (all LIVE, bim-ootb sw v1047):**
| piece | state | proof (re-run before trusting) |
|---|---|---|
| ONE engine, mapping as data — SAP B1, Business Central, Odoo 17 | live; SAP + BC alpha (never run on a real company) | `witness_migrate_engine.js` `§MIGE verdict=PASS judged=89` |
| Odoo agent reads only → `odoo_export.json`, one file to pick | live | live re-run byte-identical to the fixture; bim-compiler `scripts/poc_odoo_owndb.js` `🟢 W-ODOO-OWNDB PASS` |
| Open balances at the cut-over (Odoo): opening journal + open invoices, books checked against the source | live | `witness_open_balances.js` `§OB-VERDICT PASS judged=43` |
| "Already there" rows skipped; a source unit kept with a code | live | `witness_already_there.js` `§AT-VERDICT PASS judged=9` |
| A started plugin reaches every tenant's roles | live | `witness_plugin_role_access.js` `§PRA-VERDICT PASS judged=8` |
| iDempiere identity falsifier (engine + loader vs the source rows) | merged, test-side | `witness_idempiere_falsifier.js` `§IDF-VERDICT PASS` (145 columns, 477 rows; ~2.5 min) |
| Bank statement Complete + ImportBankStatement 221 | merged | `§BST-RESULT PASS judged=41` · `§IBS-RESULT PASS judged=51` |
| Bank balance at the cut-over: bank + bank-account masters, one opening statement per journal, Bank Clearing → 0 | live (#2829) | `§OB-VERDICT PASS judged=43` · `§MIGE verdict=PASS judged=89` |
Other baselines: OF 18 · OM 14 · NM 31 · BCM 18 · SAPM 24 · IINV 56 · IGLJ 45 · IPAY 54 · GOC 4 · OFL 13 (browser wiring).

**2. THE REVIEW (do this before any new build; write the findings HERE as a dated `§REVIEW-<date>` block: each finding = what was measured, the evidence line, the fix or the
question). The owner wants the feature "resourceful and viable" — judge it as a stranger who must move a real company, not as its author.**
- **R1 — the whole journey on the LIVE page, by a witness, not by eyes (PRIMAL LAW):** System starts the plugins → Initial Tenant Setup → log in as the new company's admin →
  the menu leaf is there → pick `odoo_export.json` → units → summary → Process → stage 2 → the books. Today `witness_odoo_form_live.js` proves WIRING on the older two-file
  path only. Missing: a live-page witness of the one-file path with open balances that reads the tenant's rows back (counts, `§MIG-VERIFY`), and of the period-gate refusal.
  X of N: N = the steps of the guide's "same three steps"; each step either has a witness line or is named as unwitnessed.
- **R2 — a second run and a failed run:** what does a user do after stage 2 refuses (the masters are loaded, the documents are not)? Is "run Import GL Journal / Import
  Invoice again" reachable for that tenant's role, and does it finish the job, or is the tenant stuck half-migrated? A second Process on the same file; a second file for the
  same tenant (a later cut-over, or the other Odoo company); the already-there pass on a re-run. Witness each; state the rule in the guide.
- **R3 — size and time (memory `feedback_erp_perf_claims.md`: measured, never guessed):** the loader's per-row cost and the DOUBLE load when already-there rows exist
  (§FACTS "Costs measured": 15 s → 2 m 20 s on 379 accounts). Measure rows/second and heap at 1k / 10k / 50k source rows (generated from the recorded rows, as ODOO-DIFF does), in node and
  in the browser; say where it stops being usable; fix the cheap things (find the held keys by one query per unique index before loading; one dry run reused by Process).
- **R4 — sources we have never seen:** SAP B1 and Business Central are ALPHA — no run on a real company (`CONN` INCONCLUSIVE by construction). Odoo 16 / 18 field names.
  Odoo with several companies, a foreign-currency company, lots / serials, multi-step payment terms. The messy scratch database was dropped (ODOO-REF-MESSY INCONCLUSIVE):
  rebuild it on the local Odoo and re-record, so the messy cases are judged on rows Odoo really returned and not only on generated variants. Each = a row in a
  "tested on / not tested on" table that the guide shows honestly.
- **R5 — the books, end to end:** the cut-over method still lacks unallocated payments (343), stock VALUE (Odoo `standard_price` is in the raw rows; ImportInventory
  :546-564), foreign-currency open items, and open balances for SAP / BC. After a migration can the tenant actually TRADE — complete a sales order, invoice it, receive the
  payment against a migrated open invoice, and do the books still balance? One witness that does exactly that on a migrated tenant (the migrated open invoice gets allocated,
  the partner's open amount goes to zero) proves the migration is usable, not only loadable.
- **R6 — the contract's reach (from the falsifier, §FACTS "Rulings"):** partner group and tax category beyond "default" (a non-default tax category REFUSES the product), unused
  units dropped, opening-stock headers without lines, document numbers. Decide per item: carry it (new sheet / column), or say plainly in the guide that it is not carried.
- **R7 — refusal texts and the summary:** every refusal a user can meet (collect them: `grep -n "problems.push\|throw new Error" erp/plugins/odoo_migrate_form.mjs
  erp/plugins/open_balances.mjs erp/plugins/*migrate*.mjs erp/odoo_agent/export.js`) says what happened AND what to do, in plain words, and each has a witness line that
  triggers it. X of N over that list. The refusal parser already lost two-line refusals once (§FACTS "Defect classes met") — look for the same class elsewhere.
- **R8 — privacy and safety claims the guide makes:** the password is never a flag, never stored; the browser never reaches the source system; nothing is written to the source;
  the alpha report masks every value. Each claim → the witness that proves it, or it is removed from the guide.
- **R9 — witness hygiene:** one command that runs the migration lane's witnesses and prints one line each (the list in §1 + the import ports + `poc_agent_zip_sync.js`), with
  logs under `/tmp/count_logs/`; the slow ones (falsifier 2.5 min) flagged. Any witness that passes without judging (INCONCLUSIVE counted as PASS) is a defect.

**3. THE GUIDE (`docs/MigrationGuide.md`, master) — PROPOSE the structure to the owner first, then write:** it is correct today for the one-file Odoo flow, open balances,
already-there rows, new unit code, role access. What a "resourceful" guide still lacks, to propose:
- a **"what moves / what does not" table per source** (masters · opening stock quantities · stock value · trial balance · open invoices · bank · unallocated payments · open
  orders · history), each cell = moved / not yet / not planned, with the tested-on column of R4;
- a **cut-over checklist** — before (close the period in the old system, pick the date, who has the logins), during (the three steps), after (open the period, enter the opening
  bank statement or see it done, check the clearing accounts, first documents) — and **"how do I know it worked"**: the checks the form already runs, in the user's words;
- **troubleshooting**: one row per refusal text of R7 → what it means → what to do;
- **screenshots and films are stale**: they show two files being picked and no open balances — retake by the documented capture path, never by hand-editing; say which are stale
  until then;
- a short **"for the iDempiere user"** box: what Initial Client Setup already put in the company (why rows are "already there"), periods, clearing accounts, Opening Charges —
  and a **glossary** for the reader who has never seen iDempiere;
- the DIY template story (the owner's original ask, §ENGINE-SPEC: *"JSON template that users can adjust"*): how to copy a template, change a variable or a field, and what the
  engine refuses — E5 (the DIY screen) is not built; the guide must not promise it.

**4. Named and still open (carry forward; none is an accepted divergence):** the bank patches (routing number = a dash, account number = the journal code: the user corrects them; two journals on one
account and a bank journal on a non-cash account are unwitnessed) · `C_Bank.IsOwnBank` dictionary default not applied by the twin (written in the sheet — check the default
engine) · unallocated payments · stock value · foreign-currency open items · SAP / BC open balances · BP
group / tax category sheets · a tenant born while bundles run gets plugin access at the next start · the already-there double load (R3) · `commitEx` seam for imports ·
`model_journal` in `ws_kernel.js`'s core list · the §IINV log-tag collision (invoice vs inventory witnesses) · seed `c_activity` · E4 sql connector · E5 DIY screen · option (c)
"update the existing row" was NOT built (the owner chose skip).

**5. How to work (what kept this lane clean):** spec block here before code · each change in its own `/tmp/wt-*` worktree off fresh `origin/main` (`git worktree list` first,
never `git stash`) · agents = Sonnet, briefed with the oracle rule ("expected values from the raw rows or a cited legacy rule, never from the code under test"), DRAFT PR when
the result needs adjudication · the lead reads every agent's § lines before marking ✅ · `sw.js` conflicts: keep both notes, max + 1 · after a merge FETCH THE LIVE PAGE
(`sw.js` version, the changed file) — Pages lags by minutes and has shown transient "Page build failed" · bim-compiler pushes go to this branch
(`fable/meshdb-livewire`); the guide goes to master through a PR + the guarded deploy.

### §LEDGER — what shipped, with its witness (2026-11-08 → 2026-11-10; one line each; the full spec + result of every row is in the archive, see §ARCHIVE-INDEX)
| when | piece | bim-ootb PR | witness line (re-run before trusting) |
|---|---|---|---|
| 11-08/09 | Odoo agent the user runs on his own Odoo; own-DB flags; hardening on messy data | #2715 #2723 #2732 #2755 | bim-compiler `scripts/poc_odoo_owndb.js` `🟢 W-ODOO-OWNDB PASS` |
| 11-09 | Ninja multi-sheet loader (the owner's MigrateExcelData) as a plugin | #2734 | `witness_ninja_migrate.js` `§NM-VERDICT PASS judged=31` |
| 11-09 | "Migrate from Odoo" form on the ONE generic form engine: summary before Process, locks, units | #2743 | `witness_odoo_form.js` `§OF-VERDICT PASS judged=18` · browser `witness_odoo_form_live.js` `§OFL 13` |
| 11-09 | Business Central (alpha, from Microsoft's published model) · SAP Business One (alpha, agent on the user's Service Layer) | #2765 · #2774 | `§BCM-VERDICT PASS judged=18` · `§SAPM-VERDICT PASS judged=24` (10 rules INCONCLUSIVE; CONN INCONCLUSIVE by construction) |
| 11-10 | ONE engine, mapping as data: SAP + BC templates equal to their hand converters; opening stock Completed (E1); ImportInvoice 207, ImportGLJournal 220 + GL Journal DocAction | #2784 #2787 #2788 #2789 #2790 | `§MIGE` (see below) · `§IINV-RESULT 56` · `§IGLJ-RESULT 45` |
| 11-10 | Genesis twin gaps: a born tenant's period controls; its accounting-schema elements | #2791 · #2792 | `witness_period_control.js` `§PC-VERDICT PASS` · `witness_schema_elements.js` `§SE-VERDICT PASS` |
| 11-10 | E3c open balances at the cut-over (Odoo): opening journal + open invoices / credit notes, books checked against the source | #2793 | `witness_open_balances.js` (now 43, see bank) |
| 11-10 | A started plugin's forms reach every tenant's non-manual roles (legacy pack-in rule) | #2795 | `witness_plugin_role_access.js` `§PRA-VERDICT PASS judged=8` (X=48 of N=48) |
| 11-10 | Odoo onto the engine: raw door + frozen oracle (O1) · 17 master entities (O2) · form loads `odoo_export.json` alone (O3a) · bridge set removed (O3b) · agent reads only, 441 → 178 lines (O3c) | #2794 · #2802 · #2806 · #2808 · #2809 | `witness_migrate_engine.js` ODOO-REF / -GUIDE / -DIFF (300 cases, 69/69 branches) / -MUTANT |
| 11-10 | groupOps trailing UPDATE on a table without a single key column; W-ODOO-MESSY runs stage 2 | #2798 | `witness_groupops_composite.js` `§GOC-VERDICT PASS judged=4` · `§OM-VERDICT PASS judged=14` |
| 11-10 | iDempiere identity falsifier (engine + loader vs the SOURCE rows; GardenWorld + pilot) and its re-pin | #2811 · #2823 | `witness_idempiere_falsifier.js` `§IDF-VERDICT PASS` — 145 columns, 477 rows, 3 falsifiers; ~2.5 min |
| 11-10 | "Already there" rows skipped instead of refusing the run; a source unit kept with a code | #2822 | `witness_already_there.js` `§AT-VERDICT PASS judged=9` |
| 11-10 | Bank statement DocAction (MBankStatement) · ImportBankStatement 221 | #2825 · #2826 | `§BST-RESULT PASS judged=41` (25/25 mutants) · `§IBS-RESULT PASS judged=51` (36/36) |
| 11-10 | E3d bank balance at the cut-over: bank + bank-account masters, one opening statement per journal, Bank Clearing → 0.00 | #2829 | **`§OB-VERDICT PASS judged=43`** · **`§MIGE verdict=PASS judged=89`** |
| 11-10 | Guide (`docs/MigrationGuide.md`, master, guarded deploy): one file to pick; open balances; already there + new unit code; role access at plugin start; bank | BIMCompiler #512 #529 #537 | the live page fetched back after each deploy |
Films (EN / ZH / TH / MS for Odoo, EN + ZH for BC and SAP) were cut on 11-09/10 and are now STALE: they show two files being picked and no open balances.

### §FACTS — legacy facts and rulings this lane paid for (each was measured; do not re-derive, do not contradict without re-measuring)
**Legacy iDempiere, as the twin now does it:**
- A new client's `C_PeriodControl` rows come from the LAST step of Initial Client Setup (MSetup.java:853-858 → DocumentTypeVerify.java:130-197), not from MPeriod.afterSave (the
  periods are saved before the doc types exist). Its `C_AcctSchema_Element` rows: MSetup.java:556-660 (OO, AC, PR, BP on the pilot). Both were missing in the twin and are fixed.
- The period gate: Automatic Period Control = today ± history/future days; otherwise the period control of that DocBaseType must be `O`. Legacy dates a GL journal BATCH today
  (MJournalBatch.beforeSave :948-961) and Complete tests that period too — a migration later than the cut-over needs TODAY's period open as well as the cut-over's, and a
  calendar year that contains today. ImportGLJournal's "WARN=Period Closed" reads the control rows directly and is only a warning.
- ImportGLJournal has no DocAction (Drafted; the batch is Completed after). ImportInvoice's DocAction has no "do nothing" value (run it with CO). ImportBankStatement resolves NO
  names (the row carries `C_Charge_ID` and the account), finds the account by AccountNo AND the own bank's RoutingNo / SwiftCode, creates Drafted statements, numbers lines 10, 20.
- A payment term's unique key is its NAME (`c_paymentterm_name`), not its Value. A unique-index refusal is correct; it is the loader's all-or-nothing that made it fatal.
- Role access for a packed-in form: PackInHandler.updateRoleAccess (:522-536) → MRole.updateAccessRecords for every active role with IsManual='N'; the record's own afterSave
  gives the login role. Only the System Administrator (AD_Role_ID 0) starts plugins (`plugin_registry.js` mayWrite).
- The open-balance arithmetic: the journal puts the receivable / payable / bank balance on a CLEARING account; each open document (or opening statement) takes it off through a
  charge whose account IS that clearing account → zero when everything came across. Receivables / payables land on the tenant's OWN control accounts (12110 / 21100 from the
  partner group), the bank on its bank asset account (11100) — the trial-balance claim is per class there, per account everywhere else.
**Rulings (owner or lead, dated):**
- 11-10 owner: Odoo = the agent ships RAW rows, the browser maps (`odoo-17.json`). iDempiere = the raw `psql COPY` path stays production; the identity template is its falsifier.
- 11-10 owner: a source row whose key the tenant already holds is SKIPPED as "already there" (not updated, not fatal). A key repeated inside the file is still refused.
- 11-10 lead, from the falsifier (classes computed by rule, totals PINNED in the witness): `already-there` (GardenWorld 315, pilot 6) · `contract-default-only` — the 17-sheet
  contract can only say "the tenant's default" partner group / tax category (14 of 17 partners land on the default group; a non-default tax category REFUSES the product:
  pilot 4 + 13 cascade) · `unit-not-carried` (2 units no product uses) · `header-without-lines` (2) · `import-inventory-renumbers` (the document gets its own number).
  **No engine or loader mapping defect was found.**
- A plugin that SHIPS access rows beyond the login role keeps its explicit list (the POS integration: the clerk's role only).
- A witness oracle takes its expected values from the RAW rows or a cited legacy rule, never from the code under test; a hand converter kept as an oracle is never edited to pass.
**Costs measured:** a book with already-there rows is loaded TWICE (savepoint, roll back, load again), in the summary and in the run: the falsifier went 15 s → 2 m 20 s on 379
accounts, ~70 % inside SQLite. GitHub Pages lags a merge by minutes and has shown transient "Page build failed" — always fetch the live file.
**Defect classes met (look for siblings in the review):** a refusal with two lines of text was lost by the form's parser (summary showed 0 refused) · a witness that never ran
stage 2 kept "passing" its other checks · a mutant that survived because a refusal changed its REASON but not its count · a hand role list per plugin.

> **Stale parts of the two reference sections below (kept verbatim; read them with this note):** §ENGINE-SPEC's status line ("awaiting the owner's read") — it was adopted and
> built; its §2 `openItems` sketch — dropped: open balances are ordinary `entities` (`OPEN_HEADERS` in `workbook.mjs`); §0's "Not ported: 207, 220 … 221" — all three are
> ported; §3's table — the bank row is built (`I_BankStatement`), payments are not; §5 E1–E3 and §7 lanes A–D — done; §6's owner decision — decided (raw copy stays, identity =
> falsifier). Still ahead from it: E4 the sql connector, E5 the DIY screen, stock value, the STOCK check of §4.

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

### §ARCHIVE-INDEX — everything removed from this file on 2026-11-10 is verbatim in `prompts/archive/MIGRATE_INSTALL_TENANT_full_2026-06-05_to_2026-11-10.md` (line numbers of that file)
§2026-07-22 AUDIT :149 · §2026-11-08 PLAN :200 · §B0-SPEC :265 · §A-MOCK spec :302 · §B1-SPEC :316 · §B2a-SPEC :342 · §A3-LEDGER :364 · §PANEL-LINK :385 · §OWN-DB-SPEC :395 · §OWN-DB RESULT :414 · §B4-SPEC :430 · §NINJA-MIGRATE study :449 · §NINJA-DECISION :478 · §SHEET-CONTRACT :492 · §NINJA-LEGACY-INSTALL plan :512 · §EXPORTER-V3-SPEC :528 · §EXPORTER-V3 RESULT :570 · §NINJA-LOADER-SPEC :591 · §NINJA-LOADER RESULT :630 · §G1-SPEC :653 · §G1 RESULT :673 · §B4-IMPL-SPEC :692 · §B4 RESULT :715 · §LAG-SPEC :730 · §FILM rc4 :751 · §FILM-LANG RESULT :778 · §HARDEN-SPEC :789 · §HARDEN RESULT :823 · §BC-SPEC :849 · §BC RESULT :883 · §FILM-BC rc1 :901 · §SAP-MEASURE :934 · §SAP-SPEC :950 · §SAP RESULT :982 · §FILM-SAP rc1 :995 · §GUIDE-CONSOLIDATED + §FILM-SAP ZH :1006 · §B3-SCOUT :1018 · §ENGINE-SPEC :1041 · §ENGINE-D-SPEC :1216 · §E3C-SPEC :1303 · §ODOO-ENGINE-SPEC :1408 · §PLUGIN-ROLE-ACCESS-SPEC :1432 · §2026-11-10d STATUS (lead session; logs read): :1452 · §2026-11-10e (lead, after the owner's "Go"): #2795 MERGED and fetched  :1476 · §IDEMPIERE-FALSIFIER-SPEC :1485 · §2026-11-10f (lead; logs read): :1507 · §2026-11-10g (lead; logs read): #2802 (O2) MERGED (main @8d0cfe79). :1526 · §2026-11-10h (lead; logs read): #2806 (O3a) MERGED. :1538 · §2026-11-10i (lead; logs read): #2808 (O3b) MERGED. :1557 · §2026-11-10j :1568 · §2026-11-10k :1582 · §2026-11-10l :1604 · §ALREADY-THERE-SPEC + §KEEP-UNIT-SPEC :1625 · §2026-11-10n (lead; logs read): #2811 (falsifier) MERGED. :1643 · §2026-11-10o (lead; live fetched back): #2822 MERGED and LIVE (sw `v10 :1654 · §E3D-SPEC :1658 · §2026-11-10p :1685 · §2026-11-10q :1690 · §2026-11-10r (lead; logs read): #2823 (falsifier re-pin) MERGED. :1700 · §2026-11-10s (lead; logs read): #2825 (lane BS) MERGED. :1712 · §2026-11-10t :1736

### §REVIEW-2026-11-10 (session v)
- **R9 DONE:** `erp/tests/run_migration_lane.sh` (bim-ootb #2833) — 17 witnesses, all PASS on main (MIGE 89, OB 43, AT 9, PRA 8, SAPM 24, BCM 18, OF 18, OM 14, IPROD 15, IINV 56, IPAY 54, IMPORT 44, IGLJ 45, IBS 51, BST 41, WBST 4). `SLOW=1` adds the falsifier. Logs `/tmp/count_logs/mig_*.log`.
- **GAP (owner, 2026-11-10):** a LEGACY iDempiere source also carries old accounting/GL. It must be migrated by the §B3-SCOUT cut-over method (Adaxa phantom sales/purchases: opening TB journal via clearing accounts + single-line open AR/AP invoices + unallocated payments + bank + count). The iDempiere agent today copies masters only; open balances exist for Odoo only. NEXT BUILD after R1/R2: iDempiere (then SAP/BC) open-balances readers feeding the same open-items sheets, witnessed vs the source's `Fact_Acct` / open-item views.
- **Sequel film "Migrating Legacy Accounting"** (all ERPs, common screens rotated per stage): material sufficient for Odoo; iDempiere/SAP/BC need the open-balances readers above first. Chapter list awaits owner approval.
