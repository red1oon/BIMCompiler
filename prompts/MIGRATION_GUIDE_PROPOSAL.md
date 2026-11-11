# ⚠ DO NOT REMOVE — PROPOSAL ONLY: new structure for docs/MigrationGuide.md (2026-11-11)
Scope: a structure for the owner to approve BEFORE any of it is applied (memory: feedback_propose_before_editing_docs). Nothing here is in the live guide. Part 1 (factual corrections, PR #582) is already applied and
keeps the old structure. Every claim below cites a witness or code read 2026-11-11; "read the log after every run" applies to the witnesses named.

## 0. Why restructure
The guide is organised by source (Odoo / BC / SAP), with the shared steps on top. A reader who asks "what will NOT come across?" or "it refused, what now?" must read four sections. Proposed: keep the source
sections (they hold the agent steps), add five shared blocks that answer those questions in one place.

## 1. Proposed outline
1. Choose your source (table kept; add the tested-on column from §2)
2. **What moves, what does not** (the table in §2)
3. The three steps (kept as is)
4. **Cut-over checklist** (§3)
5. Per-source Step 1: Odoo · iDempiere · SAP B1 (alpha) · Business Central (alpha) (kept; no duplicated limits, they point to §2)
6. **If it refuses** (§4, one table)
7. **For the iDempiere user** (box, §5)
8. **Make your own source (DIY template)** (§6, honest status)
9. Glossary (§7)

## 2. What moves / what does not
Cell = `moved` / `not yet` / `not planned`. Source for each cell in the last column. Tested-on columns: Odoo 17 demo, iDempiere GardenWorld, SAP B1 alpha, BC alpha. "T" = witnessed on real-shaped data, "A" = alpha (test-supplied rows only, never a real company), "-" = not moved.

| What | Odoo 17 | iDempiere | SAP B1 | BC | Evidence |
|---|---|---|---|---|---|
| Masters (customers, vendors, products, units, categories, terms, prices, accounts, warehouses) | moved, T | not via the opening-balances form; masters route is `migrate_agent.js --masters` (ERP guide §2) - state its test status before promising | moved, A | moved, A | guide Step 1 sections; witness_sap_migrate / witness_bc_migrate. OWNER QUESTION 1 |
| Opening stock quantity | moved, T | not yet | moved, A (stock now, not at date) | moved, A (item ledger to cut-over) | agent README; bc-w1 template |
| Stock value (unit cost) | moved, T (Cost Adjustment from `standard_price`) | not yet | not yet | not yet | witness_migration_trade `§TRD-COST` (21 of 21 costs equal) ; no SAP/BC cost mapping read |
| Trial balance (one opening journal) | moved, T | moved, T | moved, A | moved, A | witness_open_balances, witness_idempiere_open (45/45), witness_sapbc_open (97/97) |
| Open invoices / credit notes (unpaid amount) | moved, T | moved, T | moved, A | moved, A | same |
| Bank and cash balances (opening statement) | moved, T | moved, T | moved, A (house banks) | moved, A | same |
| Payments not matched to an invoice | not planned in this cut-over: stays on clearing, counted | same | same | same | open_balances / sapbc spec; SAP README "payments on account" |
| Open items in a foreign currency | not brought in, stays on clearing, counted | same | same | same | same |
| Open orders (sales/purchase) | not yet | not yet | not yet | not yet | no reader reads orders |
| Closed history (posted documents, old journals) | not yet | not yet | not yet | not yet | cut-over method is balances, not history |
| Lots / serial numbers, price breaks, instalment terms | not yet | not yet | not yet | not yet | Odoo section "Not moved yet" |

"A migrated company can trade" (paid migrated invoice, new sales cycle, AP payment): witnessed on the **Odoo** fixture only (`§TRD-VERDICT PASS judged=26`). State it for Odoo only.
Marking: SAP/BC rows carry "alpha: never run on a real company" in the table caption, not in a footnote.

## 3. Cut-over checklist (proposed text, each line checkable)
**Before**
- [ ] Freeze the old books at the cut-over date (iDempiere and SAP refuse otherwise: `source-not-frozen`; Odoo/BC read by date).
- [ ] Decide the one cut-over date; use it for the agent and the form.
- [ ] Node.js on the machine that reaches the old system (Odoo 16+, SAP 18+).
- [ ] A new company in the ERP (Initial Tenant Setup); plugins started; the cut-over period open (untick Automatic Period Control first on a new company).
- [ ] Back up the old system (the agents only read; this is hygiene, not a requirement).
**During**
- [ ] Run the agent; it must end PASS (Odoo) / list no missing field (SAP) / the package must hold every ledger table (BC).
- [ ] Pick the file, answer units, press Refresh, read the summary in full (counts, refused, "not in the file", clearing leftover).
- [ ] Process once. Do not close the tab mid-run.
**After - how do I know it worked**
- [ ] The form message says what was migrated and the books check passed (`§MIG-VERIFY`: accounts, open per partner, bank per account all match).
- [ ] AR, AP and Bank clearing accounts are 0.00 (or exactly the amount the summary said stays: foreign currency, unmatched payments).
- [ ] Trial balance in the ERP equals the old system's at the date (Trial Balance report, same date).
- [ ] Open Business Partner / Product / an open invoice from the menu.
- [ ] Pressing Process again says "Nothing to do".
Owner may want the clearing-leftover wording confirmed against a real summary screen.

## 4. If it refuses (troubleshooting table, one row per refusal text; collected with the grep in the task)
Texts are quoted from code (file:line at 2026-11-11). Proposed columns: text · what it means · what to do. Grouped by where it appears.

**In the export (Odoo agent, `odoo_agent/export.js`):** `FAIL auth` (:54) login/db/API key wrong -> check; `FAIL version` (:61) not Odoo 17 -> unsupported, nothing written; `FAIL company` (:67) unknown company id -> pick one it lists; `FAIL access` (:184) user cannot read a model -> use an administrator.
**In the iDempiere / SAP readers:** `source-not-frozen` (idempiere_agent/open_reader.js:80; SAP README) postings after the cut-over -> freeze/choose a later date; SAP "a field your server lacks" -> named, not guessed.
**In the form, before anything loads (`problems`):**
| Text (start) | Where | Means | Do |
|---|---|---|---|
| Pick odoo_export.json from your export folder... | odoo_migrate_form:44 | no usable file | pick the file |
| Pick manifest.json from the same folder | :45 | old workbook path without its manifest | pick both |
| odoo_export.json is not complete: ... Run the export again | :46 | a set is short of its counted rows | re-export |
| Start the plugin "Ninja data migration" first | :48 | engine plugin not started | Plugins & Releases -> Start |
| The manifest is for X, not Y / Sheet N has a rows; the manifest says b / Sheet is not in the manifest | :55-60 | files from different exports | pick from one export |
| ... is not from the same export as ... | :66 | db/cutover/company differ between files | same export |
| Answer the unit(s): ... | :121 | a unit has no ERP unit | pick or type New unit code |
| Open balances: log in with an organisation (not *) | open_balances:80 | opening journal needs an org | log in with an org |
| Open balances: this tenant has no accounting schema | :82 | company not set up | Initial Tenant Setup |
| Open balances: the source books are in X, this tenant's books are in Y | :83 | currency differs, not handled | new company in the source currency |
| Open balances: the export names no cut-over date | :84 | export without date | re-export with a cut-over |
| Open balances: the period of the cut-over date ... is not open | :86 | period closed | open it (text names the steps) |
| Open balances: the period of today ... is not open for GLJ | :90 | journal batch is dated today | open today's period |
| Open balances: this company already has an opening balance ... different cut-over | :93 | one company, one cut-over | new company |
| Open balances: N open document(s) name a document type this loader does not know | :95 | unknown doc kind | report it; not loadable |
| The open-balances file is cut at X but the cut-over date is Y | open_sources:cutoverProblem | two dates | use one |
| ... is not <the right file> ... Use the "Migrate from ..." form of that source | open_sources:wrongFile | another source's file in this form | use that source's form |
| Pick idempiere_open.json ... / Pick the sap_export.json ... / Pick the Excel file Business Central wrote | idempiere_form:19-20, sap_form:20, bc_form:20 | nothing picked | pick it |
| Set the cut-over date | sap_form:21, bc_form:21 | no date | set it |
| No sheet of this file is a Business Central table | bc_form:24 | wrong Excel | export a Configuration Package |
| table-missing: the package lacks ... | bc_open.mjs | a ledger table missing | add the tables (guide BC section) |
| local-currency-unknown / posting-group-unknown / unknown-account / account X is both A and B control | bc_open.mjs | the package is inconsistent; nothing guessed | fix the package |
**At Process (stage 1/2, `throw new Error`):**
| Text (start) | Where | Means | Do |
|---|---|---|---|
| Not migrated: ... | all forms | the problems above, joined | fix and Refresh |
| Nothing migrated: N row error(s) | ninja_migrate_process:120 | rows refused; nothing written | fix rows named in the message |
| No Reference for Column / Lookup within table not found / ** No Name in ID Lookup / No such column | ninja_migrate_process:142-201 | the workbook names a column or a lookup the ERP lacks (twin of legacy Ninja texts) | correct the sheet |
| Opening stock was not completed: ... | odoo_migrate_form:292 | Import Inventory refused rows | fix the named row |
| The stock lines carry a unit cost, but this company has no accounting schema / Standard Costing cost element / Cost Adjustment document type | :283 | company set-up incomplete | Initial Tenant Setup |
| The opening journal was not imported / imported but not Completed | open_balances:239,243,268 | stage 2 refused at the journal | fix, Process the corrected file again (resumes in place) |
| The open invoices were not imported / opening bank statements were not imported / ... not Completed | :250,258,261 | same | same |
| The open balances were loaded but the books do not match the source: account X by amount | :229,270 | the self-check failed | fix the source, re-export, Process again; or correct by hand |
| Open balances need Import X, which this host has not loaded | :232 | old build | reload the page (new sw) |
| Open balances: the clearing account ... is not there / the charge ... got no accounting row | :139,146 | company set-up incomplete | Initial Tenant Setup again |
Task-note: `export.js` has no `problems.push`/`throw new Error`; its refusals are the four `§ODOO-EXPORT FAIL` lines. SAP/iDempiere reader texts are in their own `open_reader.js` (inside the zips), not in the grep set; collect them at write time.

## 5. "For the iDempiere user" box (proposed content, 6 lines)
- Same engine: the opening journal is an I_GLJournal import, open invoices I_Invoice, banks I_BankStatement, stock cost an I_Inventory Cost Adjustment (IsUpdateCosting): the windows and processes you know.
- The ERP is a twin of iDempiere: Business Partner, Product, GL Journal, Invoice, Bank Statement windows look and behave the same.
- "Initial Tenant Setup" = Initial Client Setup; no sample invoice, like legacy.
- A failed second stage is resumed like legacy re-running an import: pending rows are reused, nothing doubles.
- Your own iDempiere is read only (Postgres, read-only SQL); the books are matched account by account.
- Source-side requirement: freeze the books first.
OWNER QUESTION 2: wording of "twin" for the user guide (CLAUDE.md twin rule is internal).

## 6. DIY template story (do NOT promise the screen)
Fact: the migration engine is driven by JSON templates (`erp/migrate/templates/*.json`: odoo-17, sap-b1-10, bc-w1, idempiere-*; a source is data, `open_sources.mjs`), and the user-adjustable template idea is §ENGINE-SPEC in MIGRATE_INSTALL_TENANT.md.
**The E5 DIY screen (a place in the ERP to edit a template) is NOT built.** Proposed text: "The mapping of each source is a small JSON file in the ERP's source (`erp/migrate/templates/`). A developer can copy one and adapt it for another system; there is no screen for this yet." State no date.
Do not describe how to run a custom template from the UI: not verified.

## 7. Glossary (proposed terms)
Cut-over date · Trial balance · Opening journal · Open invoice · Clearing account (AR / AP / Bank) · Dry run (the summary) · Stage 1 / stage 2 · Alpha report · Tenant (company) · Agent · Frozen books · Cost Adjustment · Import window (I_ tables) · Nothing to do.

## 8. Stale screenshots and films (mark honestly in the new guide)
- Every `img/odoo_migration/*.jpg` and `img/sap_migration/*.jpg` was taken before the v1049-v1053 changes (opening balances for four sources, no sample invoice, stock cost). Not re-verified; do not claim they match. Proposal: caption each "as of the first release; labels may differ", and re-shoot only after the owner approves the structure. Per CLAUDE.md the user is never the check; a re-shoot needs a witness-driven capture, not a look.
- Films ("How to escape from your Odoo / BC / SAP Business One"): listed in the source table; they predate the opening-balances forms. Say so; there is no film for iDempiere.
- The guide's remark "About -> DIY" download paths: verify the zips (idempiere_agent.zip, sap_agent.zip, odoo_agent.zip) are the ones at https://red1oon.github.io/bim-ootb/erp/ before the guide links them (the BC route needs no zip).

## 9. Owner questions (only these)
1. iDempiere masters: is `ad_masters.db` a tested migration route into a company (ERP guide §2), or a different feature? The proposed "what moves" cell is blank until answered.
2. Approve the structure in §1, and the "twin" wording in §5.
