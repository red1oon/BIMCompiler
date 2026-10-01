<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ERP FIRST SETUP — "set up a brand-new ERP from scratch", judged step by step against Odoo + iDempiere

```
# ⚠ DO NOT REMOVE
SCOPE: the in-browser Kernel-ERP (bim-ootb `erp/idempiere.html`) walked the way a first-time Odoo or
iDempiere user onboards: reach it, understand tenant/org/role, create a NEW company, set its masters,
run a first order-to-cash and procure-to-pay, look at the books, bring data in, save it. Every step is
EXECUTED headless (software rendering, `--disable-gpu`) by ONE witness, W-ERP-FIRST-SETUP
(bim-ootb `erp/tests/poc_erp_first_setup_live.js`), which prints one `§FIRST-SETUP` line per step.
The user-facing page is bim-compiler `docs/ERP_FirstSetup.md`; it may only claim what a `§FIRST-SETUP`
line says. Product gaps found here are queued in `ERP_IDEMPIERE_UX_PARITY.md §FS` + `AGENT_QUEUE.md §FS`.
RULES: EXTRACT/COMPILE ONLY, non-invent. Spec before code. READ THE LOG AFTER EVERY RUN — exit code is not
evidence; the witness log is `erp/tests/poc_erp_first_setup_live.log`. The owner's eyes are never the test
instrument: every verdict is a value (count, id, status text, §-line). A step whose population is empty
prints INCONCLUSIVE, never VERIFIED. No GPU, no push, no deploy from this lane.
```

## §FS0 — How this file was produced (2026-10-02, Opus 5.5 session for red1)
Read first: `CLAUDE.md`, `docs/ERPUserGuide.md` (the operating manual — its §Initial Tenant Setup and
§The standard flow), `docs/ModellerGuide.md` (quality bar: numbered steps, measured numbers, honest scope,
jargon defined at first use, big-download warning before the click), `AGENT_QUEUE.md §PAGES-SERVES-THE-BRANCH`
+ `§RESTART`, `ERP_IDEMPIERE_UX_PARITY.md §MEASURED` + `§IMPL-RESULT-F7`. Work tree: bim-ootb
`/tmp/wt-erpguide` (branch `docs/erp-first-setup`, cut from `origin/main` `55f54150`). iDempiere Java read
from `~/idempiere-dev-setup/idempiere` (the oracle); every Java citation below is file:line from there.
Doc URLs below were each fetched this session (HTTP 200; a bogus control page returned 404).

## §FS1 — The checklist (what a new Odoo / iDempiere user expects → what this ERP does)
Legend for **Expected verdict** (pinned in the witness as `EXPECT`; a change in either direction prints
`DRIFT`, so a fix or a regression cannot pass silently): **V** = VERIFIED, **G** = GAP, **I** = INCONCLUSIVE.

| # | Step (the user's words) | Odoo expectation | iDempiere expectation | This ERP — what the witness judges | Exp. |
|---|---|---|---|---|---|
| S01 | Open the app (first load) | log in to a hosted DB ([users](https://www.odoo.com/documentation/17.0/applications/general/users.html)) | server + ZK web client | `idempiere.html` boots from the network; `ad_seed.db` content-length (bytes) + `§IDEMPIERE boot db=network ms=` | V |
| S02 | Understand company / branch / role | companies + users + access rights ([multi-company](https://www.odoo.com/documentation/17.0/applications/general/companies/multi_company.html), [access rights](https://www.odoo.com/documentation/17.0/applications/general/users/access_rights.html)) | Tenant → Organization → Role at login ([Tenant](https://wiki.idempiere.org/en/Tenant_(Window_ID-109)), [Organization](https://wiki.idempiere.org/en/Organization_(Window_ID-110)), [Role](https://wiki.idempiere.org/en/Role_(Window_ID-111))) | login step 0 (tenant) → 1 (user) → 2 (role/org) all render; tenant count ≥ 2 | V |
| S03 | Create a new company | create a company ([companies](https://www.odoo.com/documentation/17.0/applications/general/companies.html)) | System login → **Initial Client Setup** ([Process 53161](https://wiki.idempiere.org/en/Initial_Client_Setup_(Process_ID-53161))) | System → menu "Initial Tenant Setup" → name + admin → Create → a new AD_Client id ≥ 17, Enter lists its admin | V |
| S04 | Pick the company currency | any currency ([multi-currency](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/multi_currency.html)) | any currency in the setup form ([Currency](https://wiki.idempiere.org/en/Currency_(Window_ID-115))) | wizard currency `<select>` option count | G (1 = USD only) |
| S05 | Chart of accounts | localisation package ([chart of accounts](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/chart_of_accounts.html), [fiscal localizations](https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations.html)) | default CoA or your own CSV file ([Account Element](https://wiki.idempiere.org/en/Account_Element_(Chart_of_Accounts)_(Window_ID-118))) | `C_ElementValue` rows for the new client == 311 | V |
| S06 | Calendar / fiscal periods | fiscal year + lock dates ([year-end](https://www.odoo.com/documentation/17.0/applications/finance/accounting/reporting/year_end.html)) | current year, 12 monthly periods (`MYear.java:250` loops `month < 12`; [Calendar](https://wiki.idempiere.org/en/Calendar_Year_and_Period_(Window_ID-117))) | `C_Period` count for the new client and its year | G (1 period, year 2024) |
| S07 | Document types exist | journals/sequences pre-made | ~all doc types made by MSetup (`MSetup.java` creates them; [Document Type](https://wiki.idempiere.org/en/Document_Type_(Window_ID-135))) | `C_DocType` rows for the new client by DocBaseType | G (ARI only) |
| S08 | My own organization is offered on a new record | company is preselected | `#AD_Org_ID` context default, org picker lists it | org picker on Business Partner → New contains the new tenant's HQ | G → **FIX-A** |
| S09 | The defaults setup made are visible in their own windows | yes | yes (MSetup writes `AD_Org_ID=0`, `MSetup.java:179`) | Business Partner / Price List / Calendar grids for the new tenant show ≥ 1 record each | G → **FIX-A** |
| S10 | Create a customer | Contacts ([sales](https://www.odoo.com/documentation/17.0/applications/sales/sales.html)) | [Business Partner](https://wiki.idempiere.org/en/Business_Partner_(Window_ID-123)) | New → Search Key + Name + group + Customer ✓ → Save → `§CRUD validate … ok` + `§CRUD-PERSIST` + grid count +1 | V |
| S11 | Create a vendor | same, as vendor | same window, Vendor ✓ | as S10 with Vendor ✓ | V |
| S11b | Right after a 2nd New+Save the list shows each record once | yes | yes | grid `data-ad-record` ids after the vendor save have no duplicate (found executing S11: `[-1,-1,-2]`, reload shows 2) | G |
| S12 | Create a product (needs a tax category) | product form ([pricing](https://www.odoo.com/documentation/17.0/applications/sales/sales/products_prices/prices/pricing.html)) | [Product](https://wiki.idempiere.org/en/Product_(Window_ID-140)) + [Tax Category](https://wiki.idempiere.org/en/Tax_Category_(Window_ID-138)) made by MSetup (`MSetup.java:1252` uses `C_TaxCategory_ID`) | Product → New: the Tax Category picker offers ≥ 1 row OF THIS tenant | G |
| S13 | Payment terms | ([payment terms](https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices/payment_terms.html)) | MSetup inserts one (`MSetup.java:1418-1426`; [Payment Term](https://wiki.idempiere.org/en/Payment_Term_(Window_ID-141))) | `C_PaymentTerm` rows for the new client | G (0) |
| S14 | Pickers only show MY company's data | yes (company rules) | role access SQL on every lookup (client + org) | Sales Order → New in the new tenant: BP picker rows whose AD_Client_ID ∉ {0, mine} | G (leak) |
| S15 | Sales order in the new company | ([sales](https://www.odoo.com/documentation/17.0/applications/sales/sales.html)) | [Sales Order](https://wiki.idempiere.org/en/Sales_Order_(Window_ID-143)) | Sales Order → New: Target Document Type picker option count | G (0 — blocked by S07) |
| S16 | Sales order header (demo company GardenWorld) | — | as above | New → BP + "Standard Order" → Save → `§CRUD-PERSIST key=c_order` | V |
| S17 | Product on the line fills price / UOM / tax | yes (pricelist) | CalloutOrder.product → price, UOM, tax | `§CRUD-CALLOUT … col=m_product_id … derived={}` on a NEW order's line | G |
| S18 | Line saved when user types UOM, tax and price | — | — | `§CRUD validate key=c_orderline verb=create ok` | V |
| S19 | Complete the order | Confirm | DocAction Complete | `[data-doc-action=CO]` → `§CRUD process committed … to=CO verifyChain=ok` | V |
| S20 | Completing makes shipment / invoice / journal | delivery + invoice ([invoices](https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices.html)) | Generate Shipments / Invoices; POS/Warehouse order auto-generate ([Shipment](https://wiki.idempiere.org/en/Shipment_(Customer)_(Window_ID-169)), [Invoice](https://wiki.idempiere.org/en/Invoice_(Customer)_(Window_ID-167)), [Payment](https://wiki.idempiere.org/en/Payment_and_Receipt_(Window_ID-195))) | `§SO-COMPLETE fan-out gated: order <id> not in bundle → status-only` present? | G |
| S21 | The completed order survives a reload | yes | yes | reload → `readTip('c_order', id) == 'CO'` | V |
| S22 | Purchase order create + complete (demo company) | ([purchase](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html)) | [Purchase Order](https://wiki.idempiere.org/en/Purchase_Order_(Window_ID-181)) → [Material Receipt](https://wiki.idempiere.org/en/Material_Receipt_(Window_ID-184)) | header + line + Complete → `to=CO verifyChain=ok` | V |
| S23 | See the journal a document posts | journal items ([cheat sheet](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/cheat_sheet.html)) | Posted button → Accounting facts | Sales Invoice (demo) → Posted button → `§PREVIEW-LIVE … coverage=complete balanced=true` | V |
| S24 | Trial balance shows MY company's books in the schema I chose | ([reporting](https://www.odoo.com/documentation/17.0/applications/finance/accounting/reporting.html)) | [Trial Balance](https://wiki.idempiere.org/en/Trial_Balance_(Report_ID-310)): `TrialBalance.java:161` `C_AcctSchema_ID=<param>`, `:400` `Fact_Acct WHERE AD_Client_ID=<client>` | `?process=310` → schema id → Run → result table (rows, ΣDr, ΣCr) == oracle `GROUP BY` over `fact_acct` for (client 11, schema 101) | G → **FIX-B** |
| S24b | The Accounting Schema parameter is a dropdown | — | TableDir lookup (AD_Reference 19) | `[data-proc-param=C_AcctSchema_ID]` tag is SELECT | G |
| S25 | Import data (CSV / import loader) | ([import/export](https://www.odoo.com/documentation/17.0/applications/general/export_import_data.html)) | Import loader windows ([Import Business Partner](https://wiki.idempiere.org/en/Import_Business_Partner_(Window_ID-172))) | (a) Help → DIY tab offers agent downloads; (b) Import Business Partner window renders a table | a V · b G |
| S26 | Save / back up my company | DB manager backup | DB dump | `window.ErpPersist` (signed backup) present on `idempiere.html`? | G |

## §FS2 — FIX-A spec (the only fix built in this lane; bounded, extracted)
**Gap (S08, S09).** Measured before the fix (`/tmp/wt-erpguide` @ `55f54150`, probe logs):
`§VALRULE col=ad_org_id vr=130 … after=20` — the new tenant's own HQ is NOT among the 20; and every born
master other than `m_warehouse` is invisible in its own window (`Business Partner · 0 records`,
`Price List · 0 records`, `Calendar · 0 records`) although the rows exist (`C_BPartner=1, M_PriceList=1,
C_Calendar=1` for client 17). **Two root causes, both measured:**
1. born rows carry **no `AD_Org_ID`** → the window's session clause `AD_Org_ID IN (0,<org>)`
   (`idempiere.html:1836`) drops a NULL. iDempiere writes `AD_Org_ID=0` for every setup row:
   `MSetup.java:179` `m_stdValues = AD_Client_ID + ",0,'Y',…"` and `bpg/bp/pc/tax/product/pl/plv.setAD_Org_ID(0)`
   (`MSetup.java:1173,1184,1215,1253,1263,1334,1349`). The locator inherits its warehouse org
   (`MLocator.java:290` `setClientOrg(warehouse)`).
2. born `AD_Org` and `C_BPartner` carry **no `IsSummary`** → val rule 130 (`AD_Org.IsSummary='N'`) and 230
   (`C_BPartner.IsSummary='N'`) exclude them. iDempiere sets it in the model constructors:
   `MOrg.java:146` `setIsSummary (false)`, `MBPartner.java:286` `setIsSummary (false)`.
**Fix (genesis.js `birthTenant`, bim-ootb `erp/`):** the `create()` helper stamps `ad_org_id: 0` on any row
that does not set its own org (`m_warehouse` keeps HQ; `m_locator` gets HQ, extracted from MLocator); the
`ad_org` and `c_bpartner` rows carry `issummary: 'N'`. Nothing else. Script tag `genesis.js?v=2→3`,
`sw.js CACHE_VERSION` bumped in the same commit.
**Witness:** W-ERP-FIRST-SETUP steps S08 + S09 flip G → V (RED on `origin/main` first, then GREEN);
regression: W-GENESIS-SYSADMIN-LIVE, W-GENESIS-RESIDENT-LIVE, W-GENESIS-WIZARD-LIVE unchanged verdict
counts vs. their pre-fix run; bim-compiler `scripts/poc_genesis_minimal.js` + `poc_genesis_resident.js`
run against the FIXED file (temp copy — the bim-compiler `build/erp/genesis.js` twin is NOT edited here).
**Twin handover (mandatory after merge, same precedent as `ERP_IDEMPIERE_UX_PARITY.md §P8-TWIN-HANDOVER`):**
copy the merged `erp/genesis.js` to bim-compiler `build/erp/genesis.js`, re-run both genesis scripts.

## §FS2b — FIX-B spec (found while executing S24, 2026-10-02; written before the code)
**Gap (S24), measured:** Trial Balance for GardenWorld, schema 101 (US/A/USD) dispatched `rows=42`; the
result table summed **458.80 Dr / 185.00 Cr** on account 11100, while `fact_acct` for (client 11, schema 101)
holds **248.00 / 100.00** and (client 11, schema 200000 EUR) **210.80 / 85.00** — the report ADDS dollars to
euros, and lists every account twice (client 13, the iDempiere demo tenant, carries an identical ledger).
Whole-ledger oracle for (11, 101): **20 accounts, ΣDr = ΣCr = 25,175.69**; the shipped report folds
**42 lines, 93,149.94** (all clients, both schemas). `balanced=true` still prints, because a sum of balanced
ledgers is balanced — the check that is supposed to prove the report cannot see this.
**Root cause:** `idempiere.html` `_procCtx().fetchFacts` = `SELECT account_id, amtacctdr, amtacctcr FROM fact_acct`
— no client, no schema, `info.params` ignored.
**Fix:** `fetchFacts(info)` appends `WHERE AD_Client_ID=<logged-in client>` (TrialBalance.java:400) and, when the
`C_AcctSchema_ID` parameter is supplied (it is mandatory), `AND C_AcctSchema_ID=<param>` (TrialBalance.java:161).
Marked `FS2 FIX-B` in the source. `idempiere.html` only; `sw.js CACHE_VERSION` bump in the same commit.
**Witness:** W-ERP-FIRST-SETUP S24 G → V (rows/ΣDr/ΣCr equal the oracle). Regression: bim-compiler
`scripts/poc_ad_process_live.js` (asserts dispatch + rows>0 for 310) run against the fixed tree.
Out of scope, queued: S24b (param control is a text box), date/period/org filters of TrialBalance.java:150-200.

## §FS3 — Results
(Filled from the witness log only — see §FS3 entries appended below.)

### §FS3.1 — 2026-10-02 · runs, logs read (Log Mandate)
All runs headless Chromium with `--disable-gpu` (software rendering). Work tree bim-ootb `/tmp/wt-erpguide`,
branch `docs/erp-first-setup`. Logs: `erp/tests/poc_erp_first_setup_live.log` (verdicts) +
`…live.page.log` (every page console line); copies of the pre-fix and post-fix logs were kept in the
session scratchpad.

| run | tree | result line |
|---|---|---|
| pre-fix | `origin/main` `55f54150` (sw `v793`) | `steps=29 VERIFIED=13 GAP=16 INCONCLUSIVE=0 pageErrors=0` — 🟢 PASS vs §FS1 pins |
| post-fix | `cd7dd887` (FIX-A + FIX-B, sw `v794`) | `steps=29 VERIFIED=16 GAP=13 INCONCLUSIVE=0 pageErrors=0` — 🟢 PASS vs §FS1 pins (S08/S09/S24 re-pinned V by the FIX markers) |

**RED → GREEN, by value (not by the pin):**
- S08 `HQ=1700002 inOrgPicker=false orgOptions=22` → `inOrgPicker=true`.
- S09 `gridRecords={"PriceList":0,"Calendar":0,"Warehouse":1,"BPartner":2}` → `{"PriceList":1,"Calendar":1,"Warehouse":1,"BPartner":3}`.
- S24 `shown={"n":42,"dr":93149.94,"cr":93149.94}` vs `oracle(client=11,schema=101)={"n":20,"dr":25175.69,"cr":25175.69}` → `shown == oracle`.

**Regression, same session, logs read** (`node -r nogpu-preload` wraps `chromium.launch` with
`--disable-gpu`; no witness file edited):
| witness | pre-fix | post-fix | note |
|---|---|---|---|
| W-GENESIS-SYSADMIN-LIVE | 13 PASS / 3 FAIL | 13 PASS / 3 FAIL, ✓/✗ lines identical | the 3 FAILs are pre-existing stale contracts, not this change: expects `§SYSTEM-TENANT ensure rows=7` (log: `rows=2` + 5 `insert-fail UNIQUE` — the seed now carries those rows), "5 demo tenants" (they are now resident, `demos=[]`), "18 GardenWorld BPartners" (seed has 24) |
| W-GENESIS-RESIDENT-LIVE | 12 / 1 | 12 / 1, identical | same stale `18 BPartners` contract |
| W-GENESIS-WIZARD-LIVE | 7 / 0 | 7 / 0 | — |
| W-GENESIS-MINIMAL (bim-compiler, judged against the FIXED genesis.js via a require-redirect preload) | 16 / 0 | 16 / 0 | head `fee08da3…` → `005844e9…` proves the fixed file was judged; invoice still posts to the cent |
| W-GENESIS-RESIDENT (bim-compiler, same redirect) | 15 / 0 | 15 / 0 | — |
| W-AD-PROC-LIVE (bim-compiler, `ERP_ROOT=`) | PASS | PASS | proc 310 `rows=42` → `rows=20` |

**Findings NOT in the checklist when it was written** (each found by executing a step, now pinned):
S11b duplicate grid row after a 2nd create (`gridIds=[-1,-1,-2]`); S24 trial-balance scope (FIX-B);
S24b param control is `INPUT:number` for a TableDir (ref 19) parameter.

**INCONCLUSIVE, named:** (1) a Material Receipt *against the user's own PO* — the receipt window's
`c_order_id` picker came back with 0 options after `selectOption(c_bpartner_id=114)` failed in the probe;
not pursued, because S20 already shows the PO's fan-out is status-only. Not a guide claim. (2) The Glass
page's signed Backup/Restore (`erp_persist_ui.js`) was not executed; the guide says so.
**Twin handover (open, after merge):** copy `erp/genesis.js` → bim-compiler `build/erp/genesis.js`.
