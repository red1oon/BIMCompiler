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

### §IDEMPIERE-OPEN-SPEC (2026-11-10, lane: iDempiere legacy-GL cut-over; spec written BEFORE the reader, the template and the witness)
**Why:** a LEGACY iDempiere source carries old accounting. The target side (open sheets I_GLJournal / I_Invoice / C_Bank / C_BankAccount / I_BankStatement, `plugins/open_balances.mjs` §MIG-TB/CLEAR/OPEN/BANK) is ERP-neutral and built; only the SOURCE side is new.
Nothing in Odoo / SAP / BC changes. Code: `erp/idempiere_agent/open_reader.js` (read-only psql) → `idempiere_open.json` (`idempiere-open-json-v1`) → `erp/migrate/templates/idempiere-open.json` (engine) → the same sheets as `odoo-17.json`. Witness: `erp/tests/witness_idempiere_open.js` (`§IDO-*`).
**The three neutral facts, at cut-over date D, for one client and ONE accounting schema (`AD_ClientInfo.C_AcctSchema1_ID`, the primary):**
1. **Trial balance** — `Fact_Acct` (PostingType `A`, i.e. posted, `DateAcct <= D`, that client + schema) summed `AmtAcctDr - AmtAcctCr` per `C_ElementValue`. Each account is classed `AR` / `AP` / `BANK` / plain.
2. **Open items** — `C_Invoice` `DocStatus IN (CO,CL)`, `IsPaid='N'`, `DateAcct <= D`; amount = the legacy PG function `invoiceOpen(C_Invoice_ID, 0)` (GrandTotal x CM multiplier minus allocations, in invoice currency; credit memos come back negative; the sheet carries `abs()`, the document type carries the sign). Per partner, per document type (`DocBaseType` ARI/ARC/API/APC).
3. **Bank balances** — per active `C_BankAccount`: `CurrentBalance`. Cited: only `MBankStatement.completeIt` moves it (`MBankStatement.java:452`, reversed :542/:712), so it is the STATEMENT-reconciled balance; payments not yet on a statement are in the GL bank account but not in it.
**Account classes (which accounts are document-controlled):** AR = `C_Receivable_Acct` of `C_BP_Group_Acct` + `C_BP_Customer_Acct` + `C_AcctSchema_Default`; AP = `V_Liability_Acct` of `C_BP_Group_Acct` + `C_BP_Vendor_Acct` + `C_AcctSchema_Default`; BANK = `B_Asset_Acct` of `C_BankAccount_Acct` (via `C_ValidCombination.Account_ID`). An account in two classes = the reader refuses (problem), never guesses. Everything else is plain and is CARRIED in the opening journal under its own account value.
**Peculiarities, each CARRIED or a named rule (nothing silent). `left` = the amount that stays on that clearing account = TB(class) minus what the brought-in items take off it; the witness expects CLEAR == left exactly (0.00 when nothing is left):**
| # | peculiarity | rule | amount |
|---|---|---|---|
| P1 | several control accounts (e.g. 12110 AR Trade; 21100 AP Trade + 21101 Tree Farm Payable, per BP group) | every account of a class routes to that class's ONE clearing account; the twin's own control accounts take the postings | carried |
| P2 | unallocated payments / receipts (`B_UnallocatedCash`, 11130) and prepayments | plain accounts: CARRIED in the journal on their own account value. Partner-level detail of the payment is NOT brought in (named `unallocated-carried-on-account`) | carried (0 left) |
| P3 | invoice in another currency than the schema | `notBroughtIn` "foreign currency": the control account holds its CONVERTED amount (`Fact_Acct` of that invoice on the control account); no ImportInvoice currency conversion is ported | left on AR/AP clearing = that converted amount |
| P4 | completed invoice not Posted (`Posted<>'Y'`) | `notBroughtIn` "not posted": its amount is not in the TB, so it is neither in the journal nor taken off clearing | 0 (named) |
| P5 | open amount with the wrong sign for its type (over-allocated invoice / odd credit memo) | `notBroughtIn` "sign reversed" | left on clearing |
| P6 | a second accounting schema (the sample GardenWorld has 101 USD + 200000 EUR) | only the primary schema moves; the others are NAMED with their TB size in the manifest (`other_schemas`) | not moved |
| P7 | bank account in another currency / not a bank (cash book `C_CashBook`, `CB_Asset`) | foreign bank account: no statement, named. Cash books are NOT read yet (named), their asset account is plain, CARRIED | left on Bank clearing for foreign |
| P8 | GL bank account vs `CurrentBalance` (payments not yet on a statement) | statement amount = `CurrentBalance`; difference to the GL bank accounts stays on Bank Clearing, NAMED `bank-uncleared` (wiki: "payments not yet cleared" — not brought in yet) | left on Bank clearing |
| P9 | inventory / stock value (14120, 21190 Not invoiced receipts, 51400 Inventory Clearing) | plain: CARRIED as GL balances; quantities / M_Storage / cost are NOT brought in (named `stock-not-brought-in`; the opening-stock count is a separate sheet this reader does not fill) | carried |
| P10 | source activity after D (facts, invoices, allocations dated > D) | invoiceOpen has NO date parameter: open amounts are as of NOW. So the source must be frozen at D; the reader counts postings after D and raises a PROBLEM `source-not-frozen` with the counts — TB is still cut at D | problem |
| P11 | P&L accounts at a mid-year cut-over | carried as they are (the wiki says nothing about year-end close). **UNCLEAR: whether legacy expects P&L closed to retained earnings before the cut-over — not decided here.** | carried |
| P12 | payment terms with schedules (C_PaySchedule) | only `Value`/`NetDays` of the term is carried; schedules are named in the manifest. **UNCLEAR: how legacy ages an invoice with a split term in the open-item list** | note |
**Reader rules:** read-only (`default_transaction_read_only=on`, only SELECT), password via `PGPASSWORD` environment (never a flag, never logged), one JSON per run; `§IDO-READ` lines print counts. No source write, ever.
**Witness spec (`§IDO-*`; expected values come from independent SQL on the legacy DB or from a cited rule, never from the reader/template/loader):**
- `TB` reader TB == oracle SQL (different query path: per `C_ValidCombination` join, schema, date) per account; sum == 0; AND after the load into a born twin tenant, plain accounts == source exactly, AR/AP/BANK control + clearing == source class total.
- `CLEAR` each clearing account == its `left` (oracle: Fact_Acct of the foreign invoice, bank GL minus CurrentBalance) — 0.00 where nothing is left.
- `OPEN` per partner+side, the twin's open documents == `invoiceOpen` summed by an oracle query; each document keeps number/date/type.
- `BANK` twin bank account CurrentBalance == source `CurrentBalance`, asset account posting == it.
- `MUTANT` flip one amount in the reader's JSON, drop one open item, drop one TB account: each MUST make the matching check FAIL (a witness that cannot fail is no witness).
- `FROZEN` an earlier cut-over (before later postings) must produce problem `source-not-frozen` with counts equal to the oracle's.
- verdict `§IDO-VERDICT PASS judged=N failed=0`; `INCONCLUSIVE` when nothing was judged.

**§IDEMPIERE-OPEN RESULT (2026-11-10; bim-ootb draft PR #2837, branch feat/idempiere-open-balances; log /tmp/count_logs/idempiere_open.log read):** `§IDO-VERDICT PASS judged=31 failed=0` (SOURCE 3, READER 8, FROZEN 1, SHEETS 8, LOAD 4, MUTANT 7). GardenWorld client 11, schema 101: TB 20 accounts sums 0; AR 430.36 = 161.12 brought in + 269.24 foreign-currency invoice 100000 (EUR) left on AR-CLEAR (P3, named refusal); AP -6949.00 and Bank 148.00 clear to 0.00; loader `§MIG-VERIFY PASS judged=9`. Mutants (flip amount, drop item, drop account, wrong class) fail the comparators; flip/drop run through a REAL load pass the loader (self-consistent) but are caught by the oracle (AP-CLEAR -200.00 / 7.00). Coverage gaps (specified, not witnessed): credit memos, partly paid invoices, foreign bank account, cash books. UNCLEAR (not guessed): P11 P&L close before cut-over; P12 split payment terms; whether CurrentBalance is maintained on every legacy path (only MBankStatement.java:452/542/712 write it). Template also needs C_Location/C_BPartner_Location (ImportInvoice "No BP Location") and a sales M_PriceList (ImportInvoice "No PriceList") from the source invoices. Not yet wired to a form / sw.js.

### §REVIEW-R1R2 (2026-11-10, session w) — R1 (the whole journey on the live page) + R2 (second / failed run), by assertion
Witness: bim-ootb `erp/tests/witness_migration_journey.js` (draft PR, branch `feat/migration-journey-witness`), added to `erp/tests/run_migration_lane.sh` under `SLOW=1` (~6 min). Real `idempiere.html`, headless Chromium, no
screenshots, page clock fixed to the cut-over day (`2026-11-10`). Expected values come from the raw rows of `odoo_export.json` (trial balance, open_lines) and the legacy rules cited in each check. Log: `/tmp/count_logs/mig_migration_journey.log`.
Verdict `§JRN-VERDICT FAIL judged=30 failed=2` — the 2 failures are finding F1 (a real defect, not a flaky check).
**R1, X of N (N=12 = the guide's "same three steps", Step 2 and 3 split into their numbered actions):** 10 WITNESSED, 2 `UNWITNESSED`: S1 (the agent reading Odoo — witnessed elsewhere: `poc_odoo_owndb`, byte-identical live re-run) and S3.6
(opening the Business Partner / Product windows from the menu; the ROWS are asserted, the window is not driven). Read back from the tenant: accounts +47 +3 clearing; 9 trial-balance lines → 6 plain accounts equal the raw balances, books sum 0.00; AR/AP/Bank Clearing 0.00;
19 open documents, all Completed + Posted + unpaid; open amount AR 4,005.00 / AP 13,410.15 = the raw `amount_residual` net; `§MIG-VERIFY PASS`. Period gate on the page: a company whose year is not the cut-over's gets ONE problem row, Process says "Not migrated", 12 row counts unchanged.
**Findings (each = measured, evidence line, fix or question):**
- **F1 (BLOCKER — the guide's own path is broken after a reload).** Phase 1 (no reload) completes stage 2. Phase 2 reloads the page (the guide asks for a reload when the company is created with the plugins running; a user returning on any later day does the same) and the same file is refused:
  `The opening journal was not imported: 9 row(s) refused (ERR=Invalid CurrencyType, ERR=No ConversionType, WARN=Period Closed)`. Evidence: `§PROC-SQL-ERROR ... more than one row returned by a subquery used as an expression :: ImportGLJournal Set CurrencyType from Value`; `§JRN-DUP`: after the reload
  16 System tables hold every row TWICE (`c_conversiontype 8/4`, `ad_message 4198/2099`, `ad_infowindow`, `ad_workflow`, `m_costqueue` …; fresh page: none). Cause read, not fixed: `patches/ad_seed.db.sql:584` creates `c_conversiontype` with NO primary key, `:849` fills it with `INSERT OR IGNORE` (dedups nothing without a key);
  `idempiere.html` (~:1161) re-applies the patch on EVERY load, cache hit included; a born company persists the patched DB to the cache (`_persistBundle`), so the next load doubles the rows. Probe `/tmp/count_logs/dup_probe.js`: 4 → birth → reload → 8. Reach is wider than migration: any scalar subquery on those tables. Question for the fix owner: add the PKs/unique indexes in the patch, or guard the patch with a "already applied" marker.
  Also: the refusal text blames the Period ("Period Closed") although the cause is the duplicate seed row — the message misleads (R7).
- **F2 (the refused stage 2 leaves the tenant half-migrated and the way out is not the one the text names).** Falsifier (one open invoice missing, agent count also 20): stage 1 commits, stage 2 is refused and NAMES `2002.50` on AR Clearing (guide claim witnessed), journal/invoice/Fact_Acct = 0, masters stay, the 9/18/1/25 import rows stay pending, the admin role holds process 220/207/221 + their windows + menu leaves.
  Running Import GL Journal + Import Invoice by hand DOES import (18 invoices, journal batch left Drafted `DR`) but nothing re-runs the cut-over check: AR Clearing stays −2002.50 and nothing says so. Processing the CORRECTED file on that tenant is refused whole (see F3). The only clean way out is a new company; neither the refusal text nor the guide says so. Question: should Process on a tenant with pending I_ rows resume (import only the rows not yet imported, then verify)?
- **F3 (a repeated Process / second file is refused whole, tenant unchanged — but the text is unreadable).** (b) second Process, same file: `Nothing migrated: 10 row error(s). 07C_BPartner_Location row 2 C_Location_ID>C_Location_UU: 2 C_Location rows have C_Location_UU=… (ambiguous)`; 12 table counts identical before/after, books untouched (witnessed). Not "already migrated".
  (d) the re-run SUMMARY: `ok=false`, already=216, will=0, refused=12 — "already there" is counted, but the refused rows are the ambiguous C_Location/C_Bank lookups, so the summary also never says "nothing to do". (c) a second file for the same company (the other Odoo company, new partners/products/documents, same chart): refused whole the same way (8 row errors). So "each other company becomes its own ERP company" (guide) is the ONLY supported route and a second file into one tenant (a later cut-over) is not; the guide should say it.
- **F4 (a demo invoice in every new company).** Initial Tenant Setup (`renderGenesisWizard`) appends a "G7 sample invoice" (Completed, unpaid, 109.00) to every company; legacy Initial Client Setup makes none. It sits in the migrated company's invoice window beside the real open items (`§JRN-STRAY`).
- **F5 (UI quirk, headless).** The Plugins & Releases pane stays floating over the next screen until its × is pressed (it intercepted clicks on the wizard and on log-out). A user can close it; noted because it blocks a scripted guide walk.
**Guide wording to fix (from F1–F3):** after "reload once" say that a reload currently breaks Open balances (until F1 is fixed); "A second Process is refused" → say a second file for the same company is not supported yet and a refused stage 2 means a new company.

### §RECOVER (2026-11-10, session x) — a failed / repeated cut-over is recoverable, twin-faithful (F2 F3 F4 of §REVIEW-R1R2)
Code: bim-ootb `feat/migrate-recover` (DRAFT PR), worktree `/tmp/wt-recover`. Witness: `erp/tests/witness_migration_recover.js` (node, ~25 s; `ERP_DIR=<old checkout>` = the mutant) + the R2 cases of `witness_migration_journey.js` rewritten to assert the new behaviour. Logs `/tmp/count_logs/mig_migration_recover.log`, `recover_step0.log` (before), `recover_step1.log`.
**STEP 0 (measured on main `ee41d86d`, before any change):** F1 fixed (`§JRN-DUP after the reload: 0`). F3 REMAINS and was NOT a downstream symptom: second Process -> `C_Location_UU: 2 C_Location rows have ...` (the C_Location sheet is loaded again: the twin had no unique index on `c_location_uu`). F2 REMAINS (corrected file refused whole; hand-finished tenant: journal `DR`, AR Clearing -2002.50, silent). F4 REMAINS (`§JRN-STRAY` 109.00).
**Legacy oracle (read, not guessed):** `pg_indexes` on `idempiere_test`: `c_location_uu_idx`, `c_bpartner_location_uu_idx` ... are UNIQUE (901 `<table>_uu_idx`); `ad_ddl_unique` carried none (a hashed base file, so not edited: the `import_invoice` base-hash check fails if it is). `MSetup.java` has 0 `MInvoice` (it makes doc types only). Import* act on `I_IsImported='N'` rows only (ImportInvoice / ImportGLJournal).
**What changed (generic, no per-window branch):**
- `model_layer.js uniqueError`: the `<table>_uu` column is a unique key (derived from the column, not the hashed list). GLOBAL, as legacy (coordinator ruling 2026-11-10: no per-client scope). The loader salts every `*_UU` value of a file with the target client (`saltUU` in odoo_migrate_form.mjs): same tenant = same UUs (a repeat matches), another tenant = distinct; case MULTI of witness_migration_recover (20 judged).
- `plugins/open_balances.mjs`: `heldState` / `resume` — pending (N) staging rows of an earlier refused run are REPLACED by the file now processed; imported (Y) rows = already there (a file whose every document number is already imported loads only the rest); a DIFFERENT cut-over file is refused in the summary and on Process in plain words naming cause + action ("already has an opening balance ... different cut-over ... migrate this file into a new company"). `complete()` with nothing pending re-checks the books of what is imported (Completes a Drafted journal, `verify`), so a hand-finished tenant is REPORTED. Refusal text now says "Process the corrected file again (the pending import rows are replaced) or finish by hand and Process again".
- `plugins/odoo_migrate_form.mjs load()`: `heldByIdentifier` — a master row whose AD identifier columns (`AD_Column.IsIdentifier`) the sheet supplies, plus every resolvable lookup, equal exactly ONE row of the tenant is "already there" (C_Bank, C_BankAccount, C_BPartner_Location have no unique index); opening stock (I_Inventory) by count; run says "Nothing to do: all N rows ... already in this company".
- `idempiere.html renderGenesisWizard`: the appended G7 sample invoice is removed (-9 +3 lines).
- Guards: `witness_open_balances` RERUN now expects "Nothing to do"; `witness_sapbc_open` / `witness_idempiere_open` PR-time `git diff origin/main` guards no longer list `open_balances.mjs`.
**Evidence:** `§REC-VERDICT PASS judged=17` (NOSAMPLE 2, REPEAT 5, SECOND 2, RESUME 5, HANDFIN 3). MUTANT (`ERP_DIR=~/bim-ootb/erp`, old code): `§REC-VERDICT FAIL judged=17 failed=10`, all five cases FAIL. Journey `§JRN-VERDICT PASS judged=34` (R2 cases rewritten); lane (SLOW=1) all PASS except `sapbc_open` MODEL (stale PR-time guard, fails on main too); `idempiere_falsifier` PASS with NODE_PATH=~/bim-ootb/node_modules (sql.js not in a fresh worktree); `poc_genesis_sysadmin_live` 4 FAIL identical on main (plugin_registry/semver_strict load order, pre-existing). Host: `idempiere.html` form Process now runs stage 2 even when stage 1 wrote nothing (repeat re-verifies).
**RESOLVED:** the BLOCKED per-client question was answered (global index, salt per tenant); the falsifier / messy / idempiere_open / sapbc_open witnesses compare through `saltUUValue`.
**Remaining / not done:** (1) two-file workbook path (`witness_odoo_form` RERUN, `§OF-GAP`): a repeat re-loads 2 C_Location rows - stored C_Location_UU there is not the sheet's, cause unread;  `witness_sapbc_open` MODEL `old-tables-unchanged` fails on main too (a PR-time guard of the BC lane: demands "ledger tables added"); the guide wording (second Process / refused stage 2 / reload) still to be changed on master `docs/MigrationGuide.md`; `genesis.html` (standalone page) still appends its own sample invoice (its posting witness `witness_genesis_real_poster` depends on it; separate decision).

## §TRADE-SPEC (2026-11-11) — R5: a MIGRATED tenant can TRADE (witness `erp/tests/witness_migration_trade.js`, bim-ootb branch feat/migrate-trade)
**ISSUE it proves/disproves:** the Odoo one-file fixture loads (journey/recover witnesses) — but can the migrated company then receive a payment against a MIGRATED open invoice, complete a NEW order->shipment->invoice->payment with the migrated products/partners/price list, and pay a migrated open vendor bill, with the books still balancing? Shipped document-action paths only (`ML.newPO/save/processIt`, `MPayment.allocateIt`); no bare INSERTs. Harness copied from `witness_migration_recover.js` (birth -> Process both stages on the fixture).
**Expected values come from the fixture raw rows + legacy rules, never from the code under test:**
- Raw `open_moves.amount_residual`: Gemini Furniture INV/2026/00006 = 2002.50 and INV/2026/00007 = 2002.50 (partner open 4005.00); Acme INV/2026/00004 = 22137.50; Ready Mat BILL/2026/06/0002 = 6596.40 and BILL/2026/10/0002 = 4513.75 (vendor open 11110.15); Office Chair `list_price` 70, `standard_price` 55; opening on-hand per quant.
- Legacy posting (Doc_Payment.java createFacts :121-175; Doc_AllocationHdr.java :293-360, :731-757): AR receipt = Dr BankInTransit / Cr UnallocatedCash; allocation of that payment to an invoice = Dr UnallocatedCash / Cr C_Receivable (no discount/writeoff) => NET Dr BankInTransit X, Cr Receivable X, UnallocatedCash 0. AP payment = Dr PaymentSelect / Cr BankInTransit, allocation Dr V_Liability / Cr PaymentSelect => NET Dr Liability X, Cr BankInTransit X. Invoice (Doc_Invoice) ARI: Dr Receivable grand, Cr Revenue lines, Cr TaxDue tax. Account ids are read from the tenant's own config rows (c_bp_group_acct, c_bankaccount_acct, m_product_acct) - the lookup is data, the amounts are the assertion.
- Open amount (invoice) = GrandTotal - sum(completed allocation lines) re-derived by SQL; IsPaid per MInvoice.testAllocation (open = 0).
**Cases (every check prints `§TRD-CHECK case=.. key=.. OK|FAIL`, verdict `§TRD-VERDICT PASS judged=N failed=0`, INCONCLUSIVE if judged=0):**
- ARPAY: pay Gemini INV/00006 in full -> invoice IsPaid=Y, open 0; partner open 4005.00 -> 2002.50; net Fact_Acct delta: Receivable -2002.50, BankInTransit +2002.50, UnallocatedCash 0; trial balance sum 0.00 per schema. PARTIAL: pay 1000.00 on Acme INV/00004 -> open 21137.50, IsPaid=N.
- SALES: a NEW standard order (Odoo list price list, Office Chair x3, Gemini) -> complete -> shipment (on-hand 3 lower) -> invoice -> payment; line net = 3 x 70.00 = 210.00 (raw list_price), invoice Dr Receivable = grand, Cr revenue = 210.00; payment allocated (IsPaid=Y); trial balance 0.00 per schema before and after.
- APPAY: pay Ready Mat BILL/06/0002 in full via AP payment -> open 0, vendor open -11110.15 -> -4513.75 (raw BILL/10/0002), net Dr Liability / Cr BankInTransit 6596.40, TB 0.
- MUTANT: `MUT=wronginv` allocates the Gemini payment to the other invoice (INV/00007) and `MUT=unbal` drops one fact leg; both must FAIL ARPAY/TB. Nothing judged -> INCONCLUSIVE.
If a step refuses: report what refuses (file:line), fix generically + legacy-faithfully if small (AD-LAYER LAW), else BLOCKED with the one question.
**RESULT (2026-11-11, bim-ootb draft PR #2848):** `§TRD-VERDICT PASS judged=23 failed=0 blocked=1` (SETUP 2, ARPAY 9, SALES 7, APPAY 5). Mutants: `MUT=wronginv` FAIL 2, `MUT=unbal` FAIL 5, old `model_post.js` FAIL APPAY.
- ARPAY/SALES/APPAY all work on the migrated tenant through the shipped paths (payment saved Draft, then DocAction CO -> allocateIt -> allocation CO; Generate Shipments 118 / Generate Invoices 119). Gemini 4005.00 -> 2002.50, Ready Mat -11110.15 -> -4513.75, new invoice 47.40 + 4.27 tax from raw list_price 15.80, on-hand 18 -> 15.
- DEFECT FIXED (generic, legacy-faithful): `model_post.js` c_payment AP leg posted Dr UnallocatedCash; Doc_Payment.java:144-166 posts Dr PaymentSelect (and the allocation clears through PaymentSelect, Doc_AllocationHdr :731-757), so every allocated vendor payment left Dr Unallocated / Cr PaymentSelect standing. Hidden in GardenWorld because both accounts are one combination. sw v1050.
- ⛔ BLOCKED (`§TRD-BLOCKED case=COST`): the shipment of a migrated stocked item completes but posts E "No Costs for Storage Box" (legacy Doc_InOut gives the same): the cut-over loads no M_Cost / cost element (born tenant has none; raw `standard_price` 14.00 unused). QUESTION: may the migration create the Standard-costing M_Cost rows from standard_price (Costing Inventory document, ImportInventory.java:524-572, IsUpdateCosting currently named not-ported), or is stock value out of R5 scope? Once fixed the check becomes an ordinary judged one (COGS 3 x 14.00 = 42.00).
- Observations, not fixed: (1) born tenant has no C_BP_Group_Acct (MBPGroup.afterSave) so migrated partners get no C_BP_Customer/Vendor_Acct; posting still works via model_post `vc()` falling back to C_AcctSchema_Default; adding the rows to genesis.js makes `witness_genesis_real_poster` G4 stale (genesis_dict regen needed). (2) A payment created and completed in ONE Trx cannot post its allocation ("account not resolvable": the poster reads the payment by SQL and a new row is not yet stored); the UI saves then completes, the witness does the same. (3) migrated payment terms carry no C_PaySchedule rows (all `sched=0`). (4) Order created by `ML.newPO` needs C_PaymentTerm_ID and Bill_BPartner_ID set (the window callouts do this).
