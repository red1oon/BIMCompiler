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
| S04 | Pick the company currency | any currency ([multi-currency](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/multi_currency.html)) | any currency in the setup form ([Currency](https://wiki.idempiere.org/en/Currency_(Window_ID-115))) | wizard currency `<select>` option count == active C_Currency; the pick (MYR) is the schema + price-list currency | ~~G (1 = USD only)~~ → **V (FS-3, §FS2g)** |
| S05 | Chart of accounts | localisation package ([chart of accounts](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/chart_of_accounts.html), [fiscal localizations](https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations.html)) | default CoA or your own CSV file ([Account Element](https://wiki.idempiere.org/en/Account_Element_(Chart_of_Accounts)_(Window_ID-118))) | `C_ElementValue` rows for the new client == 311 | V |
| S06 | Calendar / fiscal periods | fiscal year + lock dates ([year-end](https://www.odoo.com/documentation/17.0/applications/finance/accounting/reporting/year_end.html)) | current year, 12 monthly periods (`MYear.java:250` loops `month < 12`; [Calendar](https://wiki.idempiere.org/en/Calendar_Year_and_Period_(Window_ID-117))) | `C_Period` count for the new client and its year; first/last period names + dates | ~~G (1 period, year 2024)~~ → **V (FS-2, §FS2g)** |
| S07 | Document types exist | journals/sequences pre-made | ~all doc types made by MSetup (`MSetup.java` creates them; [Document Type](https://wiki.idempiere.org/en/Document_Type_(Window_ID-135))) | `C_DocType` rows for the new client by DocBaseType == 42 | ~~G (ARI only)~~ → **V (FS-1, §FS2c)** |
| S08 | My own organization is offered on a new record | company is preselected | `#AD_Org_ID` context default, org picker lists it | org picker on Business Partner → New contains the new tenant's HQ | G → **FIX-A** |
| S09 | The defaults setup made are visible in their own windows | yes | yes (MSetup writes `AD_Org_ID=0`, `MSetup.java:179`) | Business Partner / Price List / Calendar grids for the new tenant show ≥ 1 record each | G → **FIX-A** |
| S10 | Create a customer | Contacts ([sales](https://www.odoo.com/documentation/17.0/applications/sales/sales.html)) | [Business Partner](https://wiki.idempiere.org/en/Business_Partner_(Window_ID-123)) | New → Search Key + Name + group + Customer ✓ → Save → `§CRUD validate … ok` + `§CRUD-PERSIST` + grid count +1 | V |
| S11 | Create a vendor | same, as vendor | same window, Vendor ✓ | as S10 with Vendor ✓ | V |
| S11b | Right after a 2nd New+Save the list shows each record once | yes | yes | grid `data-ad-record` ids after the vendor save have no duplicate (found executing S11: `[-1,-1,-2]`, reload shows 2); == the reload count | ~~G~~ → **V (FS-8, §FS2h)** |
| S12 | Create a product (needs a tax category) | product form ([pricing](https://www.odoo.com/documentation/17.0/applications/sales/sales/products_prices/prices/pricing.html)) | [Product](https://wiki.idempiere.org/en/Product_(Window_ID-140)) + [Tax Category](https://wiki.idempiere.org/en/Tax_Category_(Window_ID-138)) made by MSetup (`MSetup.java:1252` uses `C_TaxCategory_ID`) | Product → New: the Tax Category picker offers ≥ 1 row OF THIS tenant, and it is the setup product's | ~~G~~ → **V (FS-4, §FS2g)** |
| S13 | Payment terms | ([payment terms](https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices/payment_terms.html)) | MSetup inserts one (`MSetup.java:1418-1426`; [Payment Term](https://wiki.idempiere.org/en/Payment_Term_(Window_ID-141))) | `C_PaymentTerm` rows for the new client: one Immediate/0/IsDefault | ~~G (0)~~ → **V (FS-4, §FS2g)** |
| S14 | Pickers only show MY company's data | yes (company rules) | role access SQL on every lookup (client + org) | Sales Order → New in the new tenant: BP picker rows whose AD_Client_ID ∉ {0, mine} == 0, own ≥ 1 | ~~G (leak)~~ → **V (FS-5, §FS2d)** |
| S15 | Sales order in the new company | ([sales](https://www.odoo.com/documentation/17.0/applications/sales/sales.html)) | [Sales Order](https://wiki.idempiere.org/en/Sales_Order_(Window_ID-143)) | Sales Order → New: Target Document Type picker option count == val-rule-133 SQL count, 0 foreign | ~~G (0 — blocked by S07)~~ → **V (FS-1, §FS2c)** |
| S16 | Sales order header (demo company GardenWorld) | — | as above | New → BP + "Standard Order" → Save → `§CRUD-PERSIST key=c_order` | V |
| S17 | Product on the line fills price / UOM / tax | yes (pricelist) | CalloutOrder.product → price, UOM, tax | derived PriceEntered / C_UOM_ID / C_Tax_ID on a NEW order's line == SQL oracle; no-price product derives none | ~~G~~ → **V (FS-6, §FS2e)** |
| S18 | Line saved when user types UOM, tax and price | — | — | `§CRUD validate key=c_orderline verb=create ok` | V |
| S19 | Complete the order | Confirm | DocAction Complete | `[data-doc-action=CO]` → `§CRUD process committed … to=CO verifyChain=ok` | V |
| S20 | Completing makes shipment / invoice / journal | delivery + invoice ([invoices](https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices.html)) | Generate Shipments / Invoices; POS/Warehouse order auto-generate ([Shipment](https://wiki.idempiere.org/en/Shipment_(Customer)_(Window_ID-169)), [Invoice](https://wiki.idempiere.org/en/Invoice_(Customer)_(Window_ID-167)), [Payment](https://wiki.idempiere.org/en/Payment_and_Receipt_(Window_ID-195))) | session-typed Standard Order → 0 docs; POS Order → shipment + invoice (counts from the doc type row) | ~~G~~ → **V (FS-7, §FS2f)** |
| S21 | The completed order survives a reload | yes | yes | reload → `readTip('c_order', id) == 'CO'` | V |
| S22 | Purchase order create + complete (demo company) | ([purchase](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html)) | [Purchase Order](https://wiki.idempiere.org/en/Purchase_Order_(Window_ID-181)) → [Material Receipt](https://wiki.idempiere.org/en/Material_Receipt_(Window_ID-184)) | header + line + Complete → `to=CO verifyChain=ok` | V |
| S23 | See the journal a document posts | journal items ([cheat sheet](https://www.odoo.com/documentation/17.0/applications/finance/accounting/get_started/cheat_sheet.html)) | Posted button → Accounting facts | Sales Invoice (demo) → Posted button → `§PREVIEW-LIVE … coverage=complete balanced=true` | V |
| S24 | Trial balance shows MY company's books in the schema I chose | ([reporting](https://www.odoo.com/documentation/17.0/applications/finance/accounting/reporting.html)) | [Trial Balance](https://wiki.idempiere.org/en/Trial_Balance_(Report_ID-310)): `TrialBalance.java:161` `C_AcctSchema_ID=<param>`, `:400` `Fact_Acct WHERE AD_Client_ID=<client>` | `?process=310` → schema id → Run → result table (rows, ΣDr, ΣCr) == oracle `GROUP BY` over `fact_acct` for (client 11, schema 101) | G → **FIX-B** |
| S24b | The Accounting Schema parameter is a dropdown | — | TableDir lookup (AD_Reference 19) | `[data-proc-param=C_AcctSchema_ID]` is SELECT, options == SQL, 0 foreign | ~~G~~ → **V (FS-9, §FS2i)** |
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

## §FS2c — FS-1 spec: a born tenant gets iDempiere's standard document types (2026-10-02, written before the code)
**Issue this proves/disproves (S07, S15):** a company made by Initial Tenant Setup cannot type a sales or
purchase order, because genesis G5 births ONE doc type (AR Invoice). Measured on `origin/main` `04a42a0b`:
`§FIRST-SETUP step=S07 … docTypes=1 [ARI] missing=[SOO,POO,MMS,MMR,API,ARR,APP,GLJ]` and
`step=S15 … targetDocTypeOptions=0` (val rule 133 = `DocBaseType IN ('SOO','POO') AND IsSOTrx=@IsSOTrx@ AND
DocSubTypeSO<>'RM' AND AD_Client_ID=@#AD_Client_ID@` — already client-scoped, so 0 is exactly "this tenant has none").
**Oracle (extract, iDempiere `org.adempiere.base/src/org/compiere/model/`):**
- 12 GL categories, `MSetup.java:696-707` (name, CategoryType M/D, IsDefault only on "Standard"); `createGLCategory`
  `:944-958` sets `AD_Org_ID=0`.
- 42 doc types, the `createDocType(...)` calls `MSetup.java:710-831` (name, print name, DocBaseType, DocSubTypeSO /
  DocSubTypeInv, shipment + invoice doc-type links, StartNo, GL category, isReturnTrx), as a data table.
  `createDocType` `:973-1026`: a sequence only when StartNo≠0 (`MSequence(ctx,client,name,StartNo)`
  `MSequence.java:986-995`: Description=Name, CurrentNext=StartNo, CurrentNextSys=StartNo/10; IncrementNo=1,
  IsAutoSequence=Y from `setInitialDefaults` `:941-950`); `IsDocNoControlled` = (sequence exists);
  `DocSubTypeInv` instead of `DocSubTypeSO` when DocBaseType=MMI; `IsSOTrx` per `MDocType.setIsSOTrx()` `:244-250`
  (SOO, MMS or `AR*`), inverted when isReturnTrx. `MDocType.beforeSave` `:340-348`: IsAutoGenerateInout =
  DocSubTypeSO ∈ {WR,WI,WP}, IsAutoGenerateInvoice = ∈ {WR,WI} (`:310-320`), Prepay untouched (X_ default N).
- Print names: `Msg.getElement` = AD_Element Name, PO_Name when !isSOTrx and non-empty (`Msg.java:556-600`), read
  from the seed's AD_Element (`C_Order_ID` PO_Name "Purchase Order"; `C_BankStatemet_ID` is a typo in MSetup → ""
  → PrintName defaults to Name). `Msg.getMsg("CreditMemo")`: AD_Message is not in the seed → the iDempiere demo
  row's own PrintName "Credit Memo" (`C_DocType` 118 in `ad_seed.db`).
- NOT ported (named, not dropped): `createPreference("C_DocTypeTarget_ID", POS, 143)` (`:833`, the SO window's
  default target doc type — AD_Preference is a separate item) and the `DocumentTypeVerify` process run.
**Fix:** `genesis.js` G5 becomes the table above (refs keep `doctypeAriId` = "AR Invoice"; adds `refs.doctypes`
name→id). Script tag `genesis.js?v=` bump, `sw.js CACHE_VERSION` +1.
**Witness:** W-ERP-FIRST-SETUP S07 G→V asserts BY VALUE `docTypes == 42` (the MSetup call count) and the nine
base types present; S15 G→V asserts the SO picker's option count == an independent SQL count of val rule 133 over
the new client's C_DocType (expected 7: OB, ON, PR, SO, WI, WP, WR) AND **negative control**: 0 options whose
C_DocType.AD_Client_ID ≠ the new client (the picker must not "pass" by borrowing GardenWorld's types).
Regression: the 3 genesis browser witnesses + W-AD-PROC-LIVE unchanged; bim-compiler W-GENESIS-MINIMAL /
-RESIDENT judged against the changed file (invoice still posts to the cent).

## §FS2d — FS-5 spec: FK pickers are tenant-scoped like iDempiere's lookups (2026-10-02, written before the code)
**Issue this proves/disproves (S14):** a new company's Sales Order → New offers other companies' business
partners. Measured on `origin/main` `04a42a0b`: `step=S14 … BP picker n=45 byClient={"11":24,"13":18,"17":1,"":2}
foreign=42`. The grid already scopes (`idempiere.html` session clause `AD_Client_ID IN (0,<client>)`); the picker
(`crud_overlay.js` fk branch, the offered SELECT + the admitted set) does not.
**Oracle:** every table lookup's query goes through `MRole.addAccessSQL` (`MLookupFactory.java:270`, also `:626`,
`:902` for the direct query) which appends `getClientWhere(rw=false)` (`MRole.java:2120-2124`); for a role with
all-org access that is `AD_Client_ID IN (0,<client>)`, or `AD_Client_ID=0` when the login client is 0
(`MRole.java:1110-1117`). Org access (`getOrgWhere`, only when `!isAccessAllOrgs`) is NOT ported here — named.
**Fix:** `crud_overlay.js` fk picker: when the looked-up table has `AD_Client_ID` and the session client
(`APP.clientId`) is known, AND that clause onto BOTH the offered SELECT and the admitted id-set (so §P3.6 "offered ==
admitted by construction" holds, and validateField rejects a foreign id typed past the picker). Rows created in the
session carry `ad_client_id` (`crud_core.js:434` §STD-DEFAULTS) so the fold source keeps them. One `§FK-ACCESS` line
per picker (table, client, before, after). Marked `FS-5` in source; `sw.js CACHE_VERSION` +1.
**Witness:** S14 G→V by value: BP picker `foreign == 0` AND **non-vacuous** `own ≥ 1` (the tenant's own setup BP
must still be offered — a filter that empties the picker must not pass). Negative control in the same run: S16
(GardenWorld) still selects BP 118 and saves (a too-tight filter would break it). Regression: W-PARITY-VALRULE,
-REFTABLE, -MANDATORY re-run before/after — their `before=`/`after=` counts may drop; each change explained, never re-pinned blindly.

## §FS2e — FS-6 spec: choosing a product on a NEW order's line fills price, UOM and tax (2026-10-02, before code)
**Issue this proves/disproves (S17):** on an order typed in this session (synthetic id, lives only in the signed
op-log), `CalloutOrder.product` derives nothing: `§CRUD-CALLOUT table=c_orderline col=m_product_id … derived={}`,
`autoFilled={"priceentered":"0","c_uom_id":"","c_tax_id":""}`. Root cause (read, `crud_overlay.js` ctx
`productPrice`): it joins the PARENT through the raw bundle `c_order` only — a session-created header is not there,
so it returns null — and the engine handler (`ad_callout.js` productHandler) never derives UOM or tax at all.
**Oracle (`org.adempiere.base.callout/.../CalloutOrder.java`):** `product()` `:749-855` reads `M_PriceList_ID` and
`DateOrdered` from the WINDOW context (the header), picks the newest price-list version with `ValidFrom <=
DateOrdered` (`:783-797`), sets PriceList / PriceLimit / PriceActual / PriceEntered from `MProductPricing`
(M_ProductPrice for that version) and `C_UOM_ID = pp.getC_UOM_ID()` (= the product's UOM, `MProductPricing.java:208`),
then calls `tax()` `:925-985`: `Tax.get` → `Tax.getProduct` (`Tax.java:475-560`: product's C_TaxCategory_ID; BP
IsTaxExempt / IsPOTaxExempt → `getExemptTax`; bill-from = AD_OrgInfo location, bill-to = the BP location; swapped
for !IsSOTrx) → `Tax.get` (`Tax.java:740-854`): over `MTax.getAll` (own client, active, ORDER BY
C_CountryGroupFrom_ID, C_Country_ID, C_Region_ID, C_CountryGroupTo_ID, To_Country_ID, To_Region_ID, ValidFrom
DESC — Postgres NULLS LAST, `MTax.java:78-82`) the first tax of the category, not a child (Parent_Tax_ID=0), SOPOType
compatible, whose from/to country+region match (0 = wildcard) and ValidFrom ≤ bill date; else the first IsDefault
one. Not ported (named): country GROUPS (seed C_Tax has none set), postal taxes (seed C_Tax has no IsPostal
column), Discount / C_Currency_ID / QtyOrdered copy, the inventory-availability popup.
**Fix:** (a) `crud_overlay.js` ctx `productPrice` takes the header from the raw bundle OR, for a session-created
parent, from the window context (`APP._winCtx`, the folded parent row — `idempiere.html _winCtxFor`), and picks the
version by DateOrdered; returns `{priceStd, priceList, priceLimit, uomId}`. New ctx `taxFor(pid, record)` = the Tax.get
port above, header values from the same source. (b) `ad_callout.js` productHandler additionally derives `PriceLimit`,
`C_UOM_ID` when the accessor supplies it, and `C_Tax_ID` when a `ctx.taxFor` exists (W-CALLOUT's own ctx supplies
neither, so its pins cannot move). Marked `FS-6`; sw +1.
**Witness:** S17 G→V BY VALUE: the derived `PriceEntered`, `C_UOM_ID`, `C_Tax_ID` on the new GardenWorld order's line
equal an oracle computed in the witness by SQL (PLV of the order's price list valid today → M_ProductPrice.PriceStd;
M_Product.C_UOM_ID; the tax rule as one ORDER BY … NULLS LAST query). **Negative control:** a product with NO price
in that version must derive no price (never a guessed one). Regression: bim-compiler W-CALLOUT against the changed
`ad_callout.js`; the journey's S18 still saves the line.

## §FS2f — FS-7 spec: Complete on an order typed this session runs iDempiere's completeIt fan-out (2026-10-02, before code)
**Issue this proves/disproves (S20):** `§SO-COMPLETE fan-out gated: order -3 not in bundle → status-only` — a
session-created order (synthetic id, signed op-log only) never reaches the fan-out, because
`crud_overlay.js completeFanoutOrder` reads the header/lines with a raw-bundle `SELECT`. Its sibling
`completeFanoutReceipt` already folds bundle + sidecar via `CORE.listTip` — the same read is ported, not re-invented.
**What iDempiere does on Complete (decided from source, not assumed):** `MOrder.completeIt` creates a shipment only
when `evalAutoGenerateInOutRule` (`MOrder.java:2178`, rule `:2254-2259`): DocSubTypeSO ∈ {WI On-Credit, WP Warehouse,
WR POS} or (PR Prepay AND IsAutoGenerateInout); and an invoice only for WR / WI or (PR AND IsAutoGenerateInvoice)
(`:2198-2200`). **A Standard Order (SO) generates NOTHING on Complete** — its shipment/invoice come later from
*Generate Shipments / Invoices*. So for the journey's Standard Order the faithful outcome is "fan-out evaluated,
0 documents", not a shipment. The fan-out decision for a doc type: the extracted `crud_ops.json __meta.docPolicy`
row when present (seed doc types), else the SAME flags read from that doc type's own `C_DocType` row through the
MOrder rule above (a born tenant's doc types are minted at run time, so they cannot be in a static table).
**Bounded scope (named):** shipment + invoice CREATE ops as the existing engine (`ERPEngine.completeOrder` →
`buildDoc`) emits them; GL posting stays gated exactly as today (`glGate`), POS payments (`createPOSPayments`),
counter documents, reservation/over-receipt updates are NOT ported here.
**Fix:** `completeFanoutOrder` reads order + lines through `CORE.listTip` (bundle base + sidecar), as the receipt does;
policy = docPolicy row, else the doc-type-row rule. Marked `FS-7`; sw +1.
**Witness:** S20 G→V, two arms BY VALUE, both on orders typed in the session: (a) **Standard Order** →
`§SO-FANOUT … policy(io,inv)=N,N … engineOps=0` (the negative control: a fan-out that invents a shipment for SO
fails); (b) **POS Order** (WR) with 1 line → `policy(io,inv)=Y,Y engineOps=4` (M_InOut + 1 line, C_Invoice + 1 line)
and the commit carries `ops = 1 + 4`; expected counts computed in the witness from the doc type row by SQL.

## §FS2g — FS-2 / FS-3 / FS-4 spec: the setup's calendar, currency, tax category and payment term (2026-10-02, before code)
**Issues this proves/disproves:** S04 `currencyOptions=1 [USD]` (seed carries 163 active C_Currency); S06
`year=2024 (today 2026) periods=1 ["Jan-2024","2024-01-01","2024-12-31"]` — the wizard hard-codes
`dateAcct:'2024-01-15'` and G2 births one whole-year period; S12 `C_TaxCategory(rows for client)=0`; S13
`C_PaymentTerm=0`. One owner (genesis G2/G6 + the wizard in `idempiere.html renderGenesisWizard`), one PR.
**Oracle (`org.adempiere.base/src/org/compiere/model/`):**
- Calendar: `MSetup.java:473-485` `new MCalendar(client)` + `createYear(locale)` (`MCalendar.java:193-202`) → `MYear`
  for the CURRENT year (`MYear.java:110-115`, the clock) → `createStdPeriods` (`MYear.java:209-283`): 12 periods,
  `month 0..11`, name `SimpleDateFormat("MMM-yy")` (en: `Jan-26`), StartDate = 1st, EndDate = last day of month,
  PeriodNo = month+1 (`MPeriod.java:564-574`). genesis stays clock-free: the WIZARD supplies today as `dateAcct`
  (the explicit-input contract of genesis.js), genesis derives year + 12 periods from it.
- Currency: `MSetup.java:542` `new MAcctSchema(client, currency)` — the schema currency is the setup input; the price
  list takes the same currency. The wizard lists `C_Currency WHERE IsActive='Y'` (ISO + description,
  `StdPrecision` as `data-prec`), USD preselected (the current default, so nothing changes unless the user picks).
- Tax category: `MSetup.java:1227-1236` one `C_TaxCategory` (Name 'Sales Tax' when country US else
  `Msg.translate("Standard")`; genesis has no country input → 'Standard'), IsDefault='Y'; the setup tax is created
  IN that category (`:1251` `new MTax(ctx,"Standard",0,C_TaxCategory_ID)`, IsDefault=Y) and the product uses it
  (`:1263-1275`). Named deviation kept: genesis' tax rate stays 9 (W-GENESIS-MINIMAL's posting oracle), MSetup's is 0.
- Payment term: `MSetup.java:1418-1426` `Value='Immediate', Name='Immediate', NetDays=0, GraceDays=0, DiscountDays=0,
  Discount=0, DiscountDays2=0, Discount2=0, IsDefault='Y'`.
- Not ported, named: C_PeriodControl rows (MPeriod.afterSave), *_Trl translation rows.
**Fix:** genesis G2 = calendar + year(dateAcct's year) + 12 periods; G6 adds C_TaxCategory + C_PaymentTerm and links
c_tax/m_product to the category; schema name carries the chosen ISO (default 'USD' → unchanged); the wizard
folds the currency list and passes today's date. genesis default `dateAcct` stays `2024-01-15` for headless callers.
**Witness (W-ERP-FIRST-SETUP, by value):** S04 option count == SQL `COUNT(C_Currency WHERE IsActive='Y')` AND the
journey PICKS a non-USD currency (MYR) and asserts the new client's `C_AcctSchema.C_Currency_ID` and
`M_PriceList.C_Currency_ID` == MYR's id (a list that ignores the choice fails); S06 12 periods, year == today's,
first `Jan-yy 01-01..01-31`, last `Dec-yy 12-01..12-31`; S12 the tax-category picker offers ≥1 row of this tenant AND
the born product's C_TaxCategory_ID is that row; S13 exactly one `Immediate` term, NetDays 0, IsDefault Y.
Regression: genesis 3 browser + bim-compiler W-GENESIS-MINIMAL/-RESIDENT (posting to the cent unchanged).

## §FS2h — FS-8 spec: the list shows each record once after a second New+Save (2026-10-02, root cause before code)
**Issue (S11b):** `gridIds=[1700403,-1,-1,-2] duplicates=[-1] statusCount=4`; a reload shows 3.
**Root cause, measured (page log of the journey):** the Business Partner window opens with `rows=2` — the bundle row
plus the session's first created row `-1`, already folded in by `_overlayListTip` at load. The second Save fires
`§CRUD-COMMIT-LIVE refold`, which calls `CORE.listTip(sdb, table, pk, _records, …)` with `_records` — a base that
ALREADY contains `-1`. `crud_core.js listTip` CREATE branch does `byId[synth] = nr; rows.push(nr)` without looking
at `byId`, so `-1` is appended a second time (`§CRUD-CREATE-SEL … id=-2 recIdx=3` = a 4-row list).
**Fix:** make the fold idempotent: when the base already carries a row with that synthetic pk, the CREATE op
REPLACES it in place (later UPDATE ops in the same pass then re-apply on top, latest-wins as before) instead of
appending. Any base without synthetic rows (every bundle SELECT) behaves exactly as before. Marked `FS-8`; sw +1.
**Witness:** S11b G→V by value: after the second New+Save, `gridIds` has no duplicate AND its length equals the record
count a fresh reload of the window shows (the reload is the oracle; before the fix 4 vs 3).

## §FS2i — FS-9 spec: a TableDir process parameter is a picker (2026-10-02, before code)
**Issue (S24b):** Trial Balance's mandatory `C_AcctSchema_ID` parameter (ad_process_para ref **19** TableDir) renders
as `INPUT:number`; the user must know the raw id (the guide told them to type `101`).
**Oracle:** `MLookupFactory.getLookup_TableDir` (`MLookupFactory.java:812-905`): key = the column, display = the
table's identifier columns (`getDisplayColumn`, AD_Column IsIdentifier='Y' by SeqNo, joined with '_'), `ORDER BY` the
display (`:894`), and the role's client clause via `MRole.addAccessSQL` (`:902`, the same clause FS-5 ported:
`AD_Client_ID IN (0,<client>)`, `=0` for System).
**Fix (`idempiere.html renderProcParamForm`):** a ref-19 parameter WITHOUT an AD_Val_Rule renders a `<select>` (blank
first, then the rows above; IsActive='Y'); the Run path is unchanged (`inp.value`). NOT ported, named: ref 18 (Table,
AD_Ref_Table) and 30 (Search) params, and ref-19 params that carry a val rule (e.g. AD_Org_ID vr 202 on this
process) keep their text box — a picker without its val rule would offer rows iDempiere excludes. `readProcess`
carries `ad_val_rule_id` to make that test. Marked `FS-9`; sw +1.
**Witness:** S24b G→V: the control is `SELECT`; its non-blank options == the SQL count of `C_AcctSchema` (active,
`AD_Client_ID IN (0,11)`) for GardenWorld AND 0 options of another client (negative control); S24 then picks schema
101 from the list and its oracle comparison must still hold (rows/ΣDr/ΣCr).

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

### §FS3.2 — 2026-10-02 · items FS-1..FS-9 shipped (each its own PR, merged, served bytes == minify(origin/main))
| item | steps G→V | PR → merge | sw |
|---|---|---|---|
| FS-1 doc types §FS2c | S07, S15 | #1809 → 379662d6 | v795 |
| FS-5 picker scope §FS2d | S14 | #1810 → 826a576d | v796 |
| FS-6 product defaults §FS2e | S17 | #1811 → e189c35a | v797 |
| FS-7 complete fan-out §FS2f | S20 | #1813 → 5a5fb269 | v798 |
| FS-2/3/4 setup §FS2g | S04, S06, S12, S13 | #1814 → 7e08fdbd | v799 |
| FS-8 grid dup §FS2h | S11b | #1818 → 563c6f1b | v800 |
| FS-9 param picker §FS2i | S24b | #1819 → 7ab14b99 | v801 |
Journey on `7ab14b99`: **27 VERIFIED / 2 GAP / 0 INCONCLUSIVE / 0 page errors**. Remaining GAP pins: **S25b** (FS-10,
I_* import tables) and **S26** (FS-11, backup on idempiere.html) — queued, no owner question. Verification instrument:
live Pages now serves the esbuild-minified artifact (deploy-pages.yml), so the check rebuilds `minify(origin/main)` with
`scripts/minify_pages.js` + esbuild 0.23.0 and `cmp`s; `erp/version.json` live confirms build/sha/pr.
Where S16–S22 are witnessed: GardenWorld (session-typed orders). In a NEW tenant the journey verifies S03–S15; an order
walk-through there is not yet measured (born price-list version has no ValidFrom → no price, named).
