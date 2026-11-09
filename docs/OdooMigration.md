# Moving from Odoo to the Kernel ERP — how it works and what is proven

> **Status: working draft, 2026-11-09 (updated).** The export, the loader and the in-ERP screen **"Migrate from Odoo"** are built and tested —
> the screen by a browser test that clicks through it on the real page, not yet by a user. Every number below was measured on the **Odoo 17 demo
> database** and a **local iDempiere 13 pilot**, not on a customer system. Limits are listed in §7. Full working record: `prompts/MIGRATE_INSTALL_TENANT.md`. **Step-by-step: [Migration User Guide → Odoo](MigrationGuide.md#odoo).**

## 1. The idea in one paragraph

Most Odoo users who move want to keep their **master data** — customers, suppliers, contacts, products, prices, chart of accounts,
warehouses — and their **opening stock**, and then carry on in a proper ERP convention. So the move is done the way an iDempiere
consultant moves a company in: one export file, loaded through the ERP's own rules, on the user's own machine. **The browser never
connects to Odoo**, and **nothing is invented**: every row comes from a real Odoo record, and where the ERP needs something Odoo does
not have, the gap is filled by the ERP's own rule and listed by name.

## 2. The three steps

| Step | Who | What happens |
|---|---|---|
| **1. Export** | the user, on the machine that has Odoo | Download `odoo_agent.zip`, unzip, run `node export.js` (no install step; it asks for the Odoo password). It reads Odoo (never writes) and writes **one workbook**, `odoo_migration.xlsx`, plus `manifest.json` (how many rows Odoo has of each kind) and `provenance.json` (each row → its Odoo record). |
| **2. Open "Migrate from Odoo"** | the user, in the ERP (menu *Data Import*) | Pick `odoo_migration.xlsx` and `manifest.json`. Type which ERP unit each Odoo unit is ("Units" → "Each"); units no product uses are left out. Press *Refresh*: a **summary** shows, for every sheet, how many rows will import and why any would be refused — **before anything is written**. Untick what you do not want; a sheet another ticked sheet needs stays ticked. |
| **3. Process** | the ERP | The same loader (the process **Migrate Excel Data**) loads the workbook into the tenant. Every row is saved exactly like a record typed into its window, so the ERP's defaults, checks and accounting rows apply. **All or nothing**: one bad row and nothing is kept; every refusal is listed. |

## 3. The workbook — one sheet per ERP table

The format is the one the owner's own iDempiere plugin uses (Ninja *MigrateExcelData*), so it works for any data model, not only Odoo:

- the **sheet name is the table** (`C_BPartner`, `M_Product` …), in load order — parents before children;
- **row 1 is the ERP column names**;
- a column ending `_ID` is looked up by name, or by another column written `Column>OtherColumn`
  (for example `M_Product_Category_ID>Value`);
- a detail line finds its header by document number (the Ninja `…Line` rule).

17 sheets: units, payment terms, product categories, chart of accounts, business partners, addresses, partner locations, contacts,
products, vendor prices, price list + version + prices, warehouses, locators, and the opening physical inventory with its lines.

**When Odoo has no value the ERP requires**, the cell asks the ERP for its *own* default, using the same rule the ERP's import uses —
for example the partner group is `C_BP_Group_ID>IsDefault = Y`, the rule of iDempiere's Import Business Partner. Every such cell
is listed in `manifest.json` → `patches`, with its rule and row count (11 on the demo data).

## 4. What is proven (tests, not opinions)

| Test | What it proves | Result on the Odoo demo |
|---|---|---|
| **W-SHEET-CONTRACT** | Every sheet is complete against the ERP dictionary: every mandatory column is given, defaulted by the ERP, or filled by a named rule; every lookup finds **exactly one** row; no sheet repeats a key the ERP keeps unique; row counts equal Odoo's own counts. | PASS — 17 sheets, 0 missing, 0 ambiguous, 15 unique keys checked. Three deliberately broken workbooks are each caught. |
| **W-NINJA-MIGRATE** | The workbook loads into a **freshly created tenant** through the ERP's model layer. | PASS 31/31 — the raw export (units not mapped) is refused whole; after mapping, all 17 tables gain exactly the sheet's rows (339 records); every lookup lands on the tenant's own rows; every parent–child link is set; no mandatory field empty; a second run adds nothing. |
| **W-ODOO-FORM** (+ **LIVE**) | The screen: the summary before OK is the loader's own dry run; what Process writes equals the summary; locks and unticking behave; a rerun is refused. The live test clicks through the real page. | PASS 16/16 and 12/12 — on the page: plugins started by the System Administrator, a tenant created on the page, its admin opens the menu entry, picks the files, types the units, *Refresh* predicts, *Process* commits one signed change set, and the tenant grows by exactly the prediction. |
| **W-ODOO-MESSY** | Real-world Odoo data, not the demo company: a copy of the demo with eight states Odoo itself accepts — a customer with a country and no street, two customers on one street, a contact of an archived company, a repeated product code, an archived product with stock, a second company, a delivery address on the parent's street, a repeated customer reference — exported and loaded into a new tenant. | PASS 10/10 (export) + 14/14 (load). The exporter before this fix crashed on the same data. Every record arrives linked; archived ones arrive inactive; repeated codes are renamed and listed. Also proven: https (Odoo.sh / Online), one company per export, a missing Odoo field stops the run before it reads. |
| **W-ROLE-ACCESS-UPDATE** | A company created *before* the plugins were started gets their screens after the legacy **Role Access Update** process. | PASS 9/9 — before: no access; after: the form and the process; a second run adds nothing; reset rebuilds from the dictionary. |
| **W-GENESIS-COMPLETE** | A tenant created in the ERP holds the same rows legacy iDempiere's Initial Client Setup writes. Compared with a real tenant made by that process on the pilot. | PASS 10/10 — no mandatory field empty in 42 tables; trees, client info and accounting defaults as legacy has them. |

Each test also runs at least one deliberate break and shows it is caught, so a pass means the test *can* fail.

## 5. What the tests found and fixed

Loading real data surfaced real defects. Each one was fixed on the new-ERP side, cited to the iDempiere Java source:

- **Odoo shapes the ERP refuses:** quantity price breaks per vendor, locations all at the same X/Y/Z, stock split by lot.
  The export now folds them the way iDempiere keeps them, and lists what was folded.
- **ERP-side gaps:** record defaults that iDempiere's model classes set were missing for ten tables; a newly created tenant had no
  default partner group, no trees and no client info. The defaults are now **extracted from the iDempiere source by a generator**
  (182 tables) rather than copied by hand, so the same gap cannot quietly return.

- **Real data the demo hides** (found by W-ODOO-MESSY, all fixed in the export): an address was matched by its street, so a
  customer with no street — common, since Odoo pre-fills the country — stopped the export; so did two customers on one street.
  Addresses now carry iDempiere's own migration key (`C_Location_UU`). A contact of an archived company crashed it; archived
  records now come along inactive. Odoo allows repeated codes and long location paths; iDempiere does not, so they are renamed
  (`-<odoo id>`, `~<odoo id>`) and listed. Without a company filter, Odoo returned **both** demo companies' data and the export
  merged two companies into one; it now moves one company per run and names the others.

## 6. What is not done yet

- A tenant with **several price-list discount schemas** (the GardenWorld demo has two) gets the price-list version refused as ambiguous: legacy picks the lowest id; the screen
  will offer the choice, like units. A newly created tenant has one and is not affected.
- Units can only be **mapped** to existing ERP units today, not created with a new code.
- A cross-check on legacy iDempiere running the same workbook through the owner's Ninja plugin.
- The user guide chapter and a short film.

## 7. Limits — what this does not move

- **Open documents and balances** beyond opening stock: open invoices, open orders, the trial balance at the cut-over date. Planned.
- **Closed history** (old orders, invoices, payments). Optional by design; the fold method already proves history can be replayed.
- Lots and serial numbers (stock is summed per product and location today), vendor price breaks, instalment payment terms —
  kept in `provenance.json` and named in the manifest notes, not loaded.
- Analytic accounts, print layouts, server actions, and Odoo apps outside trade and accounting (manufacturing, HR, POS …) —
  these arrive as plugins, like any other module.
- One Odoo version measured (17). Another version stops before reading, naming the field it lacks — supporting 16 and 18 is the
  next step, not a guess. Real customer data will show its own gaps; the tests are built to name them.
