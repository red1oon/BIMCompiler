# Moving from Odoo to the Kernel ERP — how it works and what is proven

> **Status: working draft, 2026-11-09.** The export and the loader are built and tested. The in-ERP screen that a user clicks through
> ("Migrate from Odoo": pick the file, map the units, see a summary, press OK) is **not built yet** — today the load is proven by a
> headless test, not by a user. Every number below was measured on the **Odoo 17 demo database** and a **local iDempiere 13 pilot**,
> not on a customer system. Limits are listed in §7. Full working record: `prompts/MIGRATE_INSTALL_TENANT.md`.

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
| **2. Map the units** | the user | Odoo's units of measure have no ERP code. The user says which ERP unit each one is ("Units" → "Each"); units no product uses can be left out. |
| **3. Load** | the ERP | The process **Migrate Excel Data** loads the workbook into the tenant. Every row is saved exactly like a record typed into its window, so the ERP's defaults, checks and accounting rows apply. **All or nothing**: one bad row and nothing is kept; every refusal is listed. |

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
| **W-GENESIS-COMPLETE** | A tenant created in the ERP holds the same rows legacy iDempiere's Initial Client Setup writes. Compared with a real tenant made by that process on the pilot. | PASS 10/10 — no mandatory field empty in 42 tables; trees, client info and accounting defaults as legacy has them. *(Being merged; see §6.)* |

Each test also runs at least one deliberate break and shows it is caught, so a pass means the test *can* fail.

## 5. What the tests found and fixed

Loading real data surfaced real defects. Each one was fixed on the new-ERP side, cited to the iDempiere Java source:

- **Odoo shapes the ERP refuses:** quantity price breaks per vendor, locations all at the same X/Y/Z, stock split by lot.
  The export now folds them the way iDempiere keeps them, and lists what was folded.
- **ERP-side gaps:** record defaults that iDempiere's model classes set were missing for ten tables; a newly created tenant had no
  default partner group, no trees and no client info. The defaults are now **extracted from the iDempiere source by a generator**
  (182 tables) rather than copied by hand, so the same gap cannot quietly return.

## 6. What is not done yet

- **The in-ERP screen** (§2 steps 2–3 as clicks, with a summary before OK and the option to leave out masters nothing depends on). Next.
- Opening each migrated record from the main menu, checked by a test in the browser — comes with the screen.
- A cross-check on legacy iDempiere running the same workbook through the owner's Ninja plugin.
- The new-tenant fix (W-GENESIS-COMPLETE) is passing and being merged after a full regression run.

## 7. Limits — what this does not move

- **Open documents and balances** beyond opening stock: open invoices, open orders, the trial balance at the cut-over date. Planned.
- **Closed history** (old orders, invoices, payments). Optional by design; the fold method already proves history can be replayed.
- Lots and serial numbers (stock is summed per product and location today), vendor price breaks, instalment payment terms —
  kept in `provenance.json` and named in the manifest notes, not loaded.
- Analytic accounts, print layouts, server actions, and Odoo apps outside trade and accounting (manufacturing, HR, POS …) —
  these arrive as plugins, like any other module.
- One Odoo version measured (17, demo data). Other versions and real customer data will show their own gaps; the tests are built
  to name them.
