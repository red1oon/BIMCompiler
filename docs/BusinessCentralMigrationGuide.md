# Move from Dynamics 365 Business Central — alpha tester guide

> **Alpha.** This route was built without a running Business Central. Everything it knows about Business Central was read from Microsoft's own
> published source code ([microsoft/BCApps](https://github.com/microsoft/BCApps), MIT licence): every table, field, length and option it reads, and
> the exact layout of Business Central's Excel export. It has been tested on Microsoft's own demo company (the Contoso / CRONUS data from that
> source, all 575 rows loaded), **not yet on a file exported by a real Business Central**. That is what alpha testers are for. Every run prints an
> *alpha report* you can send back: it holds counts and field names only, never your data.

## What moves

Customers and vendors (with their address, ship-to addresses and contact), items, item categories, units of measure, payment terms, the chart of
accounts, locations and bins, the sale price of each item, vendor items, and opening stock (the item ledger up to the cut-over date).
**Not yet:** balances, open documents, price list lines and discounts, item variants and lot numbers, dimensions.

## Step 1 — In Business Central: one configuration package, exported to Excel

No extension to install, no credentials, no API: this is Business Central's own **RapidStart** tool.

1. Search for **Configuration Packages** → **New**. Give it a code (for example `TO-KERNEL`). Leave **Language ID** empty (English captions and
   plain ISO dates read best).
2. In **Tables**, add these **Table ID**s (or use **Get Tables**):

   | Table ID | Table | Needed for |
   |---|---|---|
   | 18 | Customer | customers |
   | 23 | Vendor | vendors |
   | 222 | Ship-to Address | extra customer addresses |
   | 27 | Item | items and their sale price |
   | 5722 | Item Category | item categories |
   | 204 | Unit of Measure | units |
   | 99 | Item Vendor | vendor item numbers |
   | 3 | Payment Terms | payment terms |
   | 15 | G/L Account | chart of accounts |
   | 14 | Location | warehouses |
   | 7354 | Bin | bins |
   | 32 | Item Ledger Entry | opening stock |
   | 79 | Company Information | the country of addresses that have none, the address of locations that have none |
   | 98 | General Ledger Setup | the currency (**required**) |

3. Choose **Export to Excel**. Keep the file.

## Step 2 — In the Kernel ERP

1. As **System**, open **Plugins & Releases** and **Start** both **Ninja data migration (Migrate Excel Data)** and **Migrate from Business Central (alpha)**.
   Create your company with **Initial Tenant Setup** after that (or, if it already exists, run **Role Access Update** with *Reset Access* = No).
2. Log in as your company's administrator → **Data Import → Migrate from Business Central (alpha)**.
3. Pick the Excel file and set the **cut-over date** (opening stock is counted up to it).
4. **Units:** a unit whose Business Central *International Standard Code* matches an ERP unit is suggested (for example `PCS`, code `EA` → **Each**).
   Pick the others from the list.
5. **Refresh** shows the summary: per table how many rows will import and why any would be refused. Nothing is written yet.
6. **Process** writes everything in one signed change set, or nothing.

## What the migration settles for you (listed in the summary, nothing hidden)

- A Business Central customer and vendor can share a number; the vendor becomes `<No.> (Vendor)`.
- An address with no country is the company's country (Business Central's own convention for a domestic address).
- A location with no address gets the company address; the ERP needs one per warehouse.
- An item with no category gets your company's default category, as iDempiere's own product import does.
- Text longer than the ERP field is cut the way iDempiere cuts it; a cut code keeps a `~<n>` ending so nothing collides.
- Stock with no location goes into a warehouse named `BC-NOLOC`.

## The alpha report — please send it

Each run writes lines starting with `§BC-ALPHA` to the browser console (F12 → Console): the Business Central tables your file held and their row
counts, which column headers were recognised, which were **not** (for example a non-English caption), how many rows each ERP table got, what was
refused and why — with every value masked as `"…"`. Copy those lines and send them; they are what turns this alpha into a tested route.

[How the Odoo route works and what is proven](OdooMigration.md) — the Business Central route loads through the same summary and the same loader.
