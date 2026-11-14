# CAPEX UAT Guide — from 2D drawings to the dashboard

<div class="uat-noprint" markdown="0"><button type="button" class="md-button md-button--primary" onclick="window.print()">🖨 Print this guide / Save as PDF</button>
<span style="margin-left:.6em;font-size:.8em">Print it, tick the boxes by hand, sign the last page and hand it in. In the print dialog choose <b>Save as PDF</b> to keep a file.</span></div>
<style>
@media print {
  .md-header, .md-tabs, .md-sidebar, .md-footer, .md-top, .md-source, .uat-noprint, .md-content__button, .headerlink { display: none !important; }
  .md-main__inner, .md-content, .md-content__inner, .md-grid { margin: 0 !important; padding: 0 !important; max-width: none !important; }
  .md-typeset { font-size: 10.5pt; }
  .md-typeset table:not([class]) { display: table; width: 100%; font-size: 9pt; }
  .md-typeset table:not([class]) th, .md-typeset table:not([class]) td { border: 1px solid #555; padding: 3pt 5pt; }
  .md-typeset tr, .md-typeset img, .md-typeset figure { break-inside: avoid; page-break-inside: avoid; }
  .md-typeset h2 { break-before: page; page-break-before: always; }
  .md-typeset h3 { break-after: avoid; }
  .md-typeset img { max-width: 100%; max-height: 105mm; }
  a[href]::after { content: none !important; }
  @page { margin: 14mm 12mm; }
}
</style>

A hands-on test script for the testers of the pilot client (Sysnova). Each step says what to **do**, what you should **see**, and has a box to tick.
Work top to bottom: every chapter uses what the one before produced. Write anything that differs on the **Notes** line at the end of each chapter.

Dates in the test data are set for **13 November 2026**. Testing well after that day still works, but the colours on the dashboard (on time, late, over budget) drift with the calendar.

**What you need**

| Item | Where |
|---|---|
| A desktop browser (Chrome, Edge or Firefox) | — |
| The BIM apps | the public site [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/index.html), or your own copy (chapter A1) |
| Your iDempiere, with its **GardenWorld** client and a GardenWorld Admin login | your server |
| The test-data pack | [202611131200_GardenWorld_CAPEXTestData.zip](https://github.com/red1oon/bim-ootb/raw/main/capex/plugin/testdata_2pack/202611131200_GardenWorld_CAPEXTestData.zip) |
| The dashboard's scripts for iDempiere | listed in chapter A2, all in the [bim-ootb repository](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy) |
| The **Shed** drawing set: nine 2D sheets (.dxf) with their settings written in | the nine `…_marked.dxf` files supplied for this test, listed in chapter B1 |

**Who does what**

| Chapter | Who |
|---|---|
| A · Set up | your iDempiere administrator, once |
| B · BIM: drawings to a priced model | a BIM / QS tester |
| C · ERP: buying and issuing to site | an ERP tester, as GardenWorld Admin |
| D · The dashboard | everyone |

---

## A · Set up (administrator, once)

### A1 · The BIM apps on your own server (optional)

The Modeller, the Viewer, the Kernel ERP and the dashboard are plain web files: no application server and no database server. Use the public site, or serve your own copy.

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| A1.1 | Copy the repository: `git clone https://github.com/red1oon/bim-ootb` | A folder `bim-ootb` with `index.html`, `modeller/`, `erp/`, `capex/` | ☐ Pass ☐ Fail |
| A1.2 | Serve the folder with any static web server, for example `python3 -m http.server 8080` inside it | The server says it is listening | ☐ Pass ☐ Fail |
| A1.3 | Open `http://<your-server>:8080/index.html`. On a first visit the page is a picture with two pills: click the **red** one | Three doors appear under *choose your door*. Hold the pointer on each to read its name: **Buildings / IFC**, **BIM Modeller**, **ERP** | ☐ Pass ☐ Fail |
| A1.4 | Open `/capex/index.html` on your server | The dashboard opens on its built-in sample store (3 projects). The computed tiles read **no data (CAPEX PA rows not installed)**: that is correct until the page reads your iDempiere (chapter D) | ☐ Pass ☐ Fail |

The large building databases are not stored in the repository. To open the sample buildings from your own server, ask us for the files and place them as the [Viewer guide](BIMUserGuide.md#run-it-on-your-own-machine) says.

### A2 · Install the dashboard into your iDempiere

All scripts are iDempiere migration scripts (PostgreSQL), written for the **GardenWorld** client. Apply them with `psql` **in file-name order**, run `update_sequences()`, then **restart the server**: iDempiere keeps web-service types and measures in memory.

| Folder in the repository | Script(s) | What it adds |
|---|---|---|
| [`capex/legacy/ws/migration`](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy/ws/migration/iD13/postgresql) | `202611042300_CAPEX-WS-READ.sql` | Read-only web-service types for the dashboard's tables, and the role allowed to use them |
| [`capex/legacy/ws/q4`](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy/ws/q4/migration/iD13/postgresql) | `202611111400_CAPEX-WS-Q4.sql` | Reading purchase orders and project issues |
| [`capex/legacy/ws/chain`](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy/ws/chain/migration/iD13/postgresql) | `202611121700_CAPEX-WS-CHAIN.sql` | Reading receipts, vendor invoices and payments (the supply-chain view) |
| [`capex/legacy/ws/pacalc`](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy/ws/pacalc/migration/iD13/postgresql) | `202611131400_CAPEX-WS-PACALC.sql` | Reading the dashboard's own formulas (Performance Analysis measures) from your server |
| [`capex/legacy/migration`](https://github.com/red1oon/bim-ootb/tree/main/capex/legacy/migration/iD13/postgresql) | every script, in name order (`202611031900_CAPEX-R0.sql` … `202611141000_CAPEX-FORECAST-PROJECTS.sql`) | The dashboard's formulas as Performance Analysis measures, the Home tab goals, their targets and colours. Money goals show the currency of your login |
| BIM Document plugin | see [Installing it](CapexDashboardGuide.md#installing-it) | Drawings filed against projects (optional for this test) |

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| A2.1 | Apply the scripts above, run `update_sequences()`, restart iDempiere | Each script ends without an error; the server comes back | ☐ Pass ☐ Fail |
| A2.2 | Log in as GardenWorld Admin, open the **Home** tab | The Performance panel shows CAPEX goals, for example *CAPEX Total Projects*, *CAPEX Approved Budget* | ☐ Pass ☐ Fail |
| A2.3 | Open the window **Performance Measure Calculation** | Rows named *CAPEX …* are there; their SQL can be read and edited here. This is where the dashboard’s formulas live | ☐ Pass ☐ Fail |

Each script carries a **Restore** line at its top that removes what it adds.

### A3 · Load the test data (GardenWorld)

The pack holds **12 projects** (Value `TD_…`, names ending *(test data)*) with **42 phases**, **84 tasks**, **84 planned lines**, some phases already ticked complete, and **2 test products**. It holds **no documents**: you make the orders, receipts, invoices, payments and issues yourself in chapter C. The data can stay in GardenWorld after the test.

The pack goes to the client named in its file name (**GardenWorld**), and is packed in by that client's administrator.

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| A3.1 | Put the zip in an empty folder on the server and run `utils/RUN_ApplyPackInFromFolder.sh <folder>`, or use the **Pack In** window logged in as GardenWorld Admin | The run prints *Successful application of …CAPEXTestData.zip*, `Error=false` and ends with *Done*. The log also prints a `java.lang.Exception` trace for each planned line (*MProduct.loadPO: NO Data found*): these do not stop the run, and the rows are checked in A3.2 to A3.4 | ☐ Pass ☐ Fail |
| A3.2 | Open the **Project** window, search Value `TD_%` | 12 projects, for example *TD_RIVERSIDE – Riverside Tower (test data)* | ☐ Pass ☐ Fail |
| A3.3 | Open *TD_RIVERSIDE*, tab **Phase** | 5 phases with dates; the first 3 are ticked **Complete** | ☐ Pass ☐ Fail |
| A3.4 | Look at the project’s **Currency** | The currency of GardenWorld’s *Purchase* price list. The pack sets no currency: iDempiere takes it from the price list, so it follows your setup | ☐ Pass ☐ Fail |
| A3.5 | Pack the same zip in a second time | No new projects: still 12. The folder run says the pack is *already installed* and skips it | ☐ Pass ☐ Fail |

### A4 · ERP model setup, where needed

GardenWorld already has what the exercise needs. Check it before chapter C:

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| A4.1 | **Business Partner** window: find a vendor | At least one partner with *Vendor* ticked | ☐ Pass ☐ Fail |
| A4.2 | **Product** window: *Rake Bamboo* | It exists, is stocked, and has a price on the *Purchase* price list | ☐ Pass ☐ Fail |
| A4.3 | **Warehouse & Locators**: *HQ Warehouse* | It has the locator *Default HQ Locator*, where you receive and issue | ☐ Pass ☐ Fail |
| A4.4 | **Product** window: *Test material A (test data)* | The pack’s product exists, in category *TD Materials (test data)* | ☐ Pass ☐ Fail |

**Notes (chapter A):** ______________________________________________

---

## B · BIM: the Shed, from 2D drawings to a priced model

This chapter uses **your own Shed drawing set**: the single-storey farm shed, drawn as nine 2D sheets. You will see each drawing on its own first, then the nine arranged in place, then the 3D model built from them.

The pictures were taken from the real Modeller with these same nine files. The label at the top of each picture and the red ring around a button were added for this guide; in the canvas-only pictures the drawing lines are shown at full strength so that they print clearly.

**The nine sheets** (open the `…_marked.dxf` copies: they carry the levels, heights and layer meanings the Modeller needs)

| Sheet file | What it is | Role the Modeller shows |
|---|---|---|
| `0_FLOOR_PLAN_marked.dxf` | Floor plan | PLAN |
| `3_BEAM_LAYOUT_marked.dxf` | Beam layout | PLAN |
| `4_FOUNDATION_LAYOUT_marked.dxf` | Foundation layout | PLAN |
| `1N_ELEV_NORTH_marked.dxf` | North elevation | ELEV |
| `1S_ELEV_SOUTH_marked.dxf` | South elevation | ELEV |
| `2_ELEV_WEST_marked.dxf` | West elevation | ELEV |
| `7_ELEV_EAST_marked.dxf` | East elevation | ELEV |
| `8_SECTION_AA_TRUSS_marked.dxf` | Section A-A, the roof truss | SECTION |
| `5_DETAILS_marked.dxf` | Details and general notes | NOTES |

### B1 · Get to know the drawings: one sheet at a time

Open [the Modeller](https://red1oon.github.io/bim-ootb/modeller/modeller.html). The drawings are opened from **📂 Open → Open 2D drawings (.dxf)…**

![Where to click: Open, then Open 2D drawings (.dxf)](img/uat/uat_b1_open_menu.png)

*Picture B1-a · Modeller: Open ▸ Open 2D drawings (.dxf)*

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B1.1 | **📂 Open → Open 2D drawings (.dxf)…** and select **only** `0_FLOOR_PLAN_marked.dxf` | The Shed **floor plan** is drawn on the canvas, as in picture B1-b: the long rectangle of the shed with its grid lines and column marks. The badge in the **Drawing metadata** panel reads **Blocked** for one sheet on its own: that is expected, one sheet is not yet a building | ☐ Pass ☐ Fail |
| B1.2 | Fold the **2D Drawings** panel away (the fold button in its title bar) and close the **Drawing metadata** panel (✕) to see the whole drawing. Turn the mouse wheel to zoom, drag to move | You recognise your own floor plan | ☐ Pass ☐ Fail |

![Shed floor plan on its own](img/uat/uat_b1_sheet_0_floor_plan.png)

*Picture B1-b · **Shed · Floor plan** · sheet `0_FLOOR_PLAN.dxf`, on its own*

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B1.3 | Reload the page. Open **only** `3_BEAM_LAYOUT_marked.dxf` | The **beam layout** is drawn, as in picture B1-c | ☐ Pass ☐ Fail |
| B1.4 | Reload the page. Open **only** `4_FOUNDATION_LAYOUT_marked.dxf` | The **foundation layout** is drawn, as in picture B1-d | ☐ Pass ☐ Fail |

![Shed beam layout on its own](img/uat/uat_b1_sheet_3_beam_layout.png)

*Picture B1-c · **Shed · Beam layout** · sheet `3_BEAM_LAYOUT.dxf`, on its own*

![Shed foundation layout on its own](img/uat/uat_b1_sheet_4_foundation_layout.png)

*Picture B1-d · **Shed · Foundation layout** · sheet `4_FOUNDATION_LAYOUT.dxf`, on its own*

An elevation or the section opened on its own shows nothing: it has to stand on a plan. You will see them in the next step, standing in place.

### B2 · Open all nine sheets: the drawings arrange themselves

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B2.1 | Reload the page. **📂 Open → Open 2D drawings (.dxf)…** and select **all nine** `…_marked.dxf` files at once | The **2D Drawings** panel is titled **9 SHEETS** and lists each file with its role: three PLAN rows, four ELEV rows, the section and the NOTES sheet (picture B2-a) | ☐ Pass ☐ Fail |
| B2.2 | Read the top of the **Drawing metadata** panel | The green badge reads **Qualifies** | ☐ Pass ☐ Fail |
| B2.3 | Watch the sheets move into place. Press **Arrange** in the panel to play it again | The plans lie on the ground; each elevation stands on the side it shows; the section stands across the shed (picture B2-b) | ☐ Pass ☐ Fail |
| B2.4 | Fold the **2D Drawings** panel away, close the **Drawing metadata** panel (✕), and orbit with the mouse | You can see the floor plan you looked at in B1 lying flat, with the four elevations standing around it | ☐ Pass ☐ Fail |

![The nine Shed sheets opened: the 2D Drawings panel and the Drawing metadata panel](img/uat/uat_b1_nine_opened.png)

*Picture B2-a · **Shed · all nine sheets opened**: the list of sheets with their roles, and the verdict **Qualifies***

![The nine Shed sheets arranged in place](img/uat/uat_b1_arranged.png)

*Picture B2-b · **Shed · the nine 2D sheets arranged in place**: plans flat, elevations and section standing*

![The arranged Shed sheets seen from above](img/uat/uat_b1_arranged_top.png)

*Picture B2-c · **Shed · the arranged sheets seen from above**: the floor plan again, now with the other sheets around it*

### B2b · Convert the drawings to the 3D Shed

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B2.5 | Wait until the Arrange replay has ended (the panel's status line stops counting *Step n/46*), or press **Esc** to stop it. Unfold the **2D Drawings** panel and tick **Complete the building (floor slab, roof)** | The box is ticked | ☐ Pass ☐ Fail |
| B2.6 | Press **Convert** (ringed in picture B2-d) | The Shed is built in 3D: columns, walls, beams, the roof on its trusses, doors and fans (picture B2-e) | ☐ Pass ☐ Fail |
| B2.7 | Orbit around the model | It is the shed as these sheets draw it: one row of columns on each grid line of the floor plan (14 lines along the length, 4 across) | ☐ Pass ☐ Fail |
| B2.8 | **Export → Viewer database (.db)** (ringed in picture B2-f) | A `.db` file is downloaded | ☐ Pass ☐ Fail |
| B2.9 | Open the [front door](https://red1oon.github.io/bim-ootb/index.html), **Buildings / IFC**, then the card **Blank Viewer · Open your own .db file**. In the blank Viewer press **Ctrl+O** (Open Building) and choose the `.db` | The status line reads **DONE — SHED 511 elements**, the same count as the Convert; orbit with the mouse | ☐ Pass ☐ Fail |

![Tick Complete, then press Convert](img/uat/uat_b2_convert_button.png)

*Picture B2-d · **Shed · tick Complete, then press Convert**, in the 2D Drawings panel*

![The Shed converted to a 3D model](img/uat/uat_b2_converted.png)

*Picture B2-e · **Shed · converted to a 3D model** (511 parts when these pictures were taken)*

![Export, Viewer database](img/uat/uat_b2_export_menu.png)

*Picture B2-f · Modeller: Export ▸ Viewer database (.db)*

Full detail of every panel: [DXF2BIM guide](DXF2BIMGuide.md#step-by-step-in-the-modeller).

### B3 · Fit the 4D schedule and the 5D rates to your local scene

The schedule and the cost come from reference files the Viewer ships with. You edit your own copy in the browser. Full detail: [Your own 4D / 5D references](BIMUserGuide.md#your-own-4d-5d-references-rates-durations-sequence).

| Reference | Open it from | Example edit for this test |
|---|---|---|
| **5D Rate Pack** (the active pack, for example `cidb2024_my`) | **Settings → Edit Project JSON → 5D Rate Pack** | raise the rate of one material (for example walls) by 10 % |
| **4D Schedule Template** | **Settings → Edit Project JSON → 4D Schedule Template** | add waiting days after one phase: in **dependencies → within_level**, raise `lag_days` of the *superstructure* rows by 5. (A phase has no length of its own to type: its length is worked out from the parts and the crews) |
| **4D Sequence & Labour Rules** | **Settings → Edit Project JSON → 4D Sequence & Labour Rules** | change one trade’s crew size |

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B3.1 | Note the Viewer’s total cost (Find panel: `total cost`) and the schedule’s finish date (**Time Machine**, key **T**) | Write both down: ________ / ________ | ☐ Pass ☐ Fail |
| B3.2 | Make the rate edit and the lag edit above. Your copy is saved in this browser as you type | The form keeps your value; a list shown as JSON text must stay valid JSON | ☐ Pass ☐ Fail |
| B3.3 | **Reload the Viewer tab**, so it reads your copies | The building opens again | ☐ Pass ☐ Fail |
| B3.4 | Read the total cost again | It moved in the direction of your rate edit | ☐ Pass ☐ Fail |
| B3.5 | Open **Time Machine** (key **T**). Press **Jump to start**, then **Build** | The finish date moved by the days you added (5 on each edited row); the day counter and the *placed* count rise as the parts go up in order | ☐ Pass ☐ Fail |
| B3.6 | **⬇ Download** your edited files, then **Reset** them | You keep your copies as files; the Viewer is back on the shipped references | ☐ Pass ☐ Fail |

![The Inspect drawer: Measure, Clash, X-Ray, Section, Time Machine, 4D / 5D](img/viewer/pill-inspect-drawer.png)

### B4 · Send the model to the ERP as a Project Order

Do this in the **Viewer**, on the Shed you opened in B2.9. (In the Modeller, **ERP ▸ Project Order** prices a building that was *opened* from a database; for a model made from drawings it tells you to use this route.) Full detail: [Send it to ERP](ModellerGuide.md#send-it-to-erp-project-order-variant-vo).

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| B4.1 | Open the **Find** panel and click one group of parts in its list (for example a column type) | The panel shows the group's cost and the button **› ERP** | ☐ Pass ☐ Fail |
| B4.2 | Press **› ERP** | The status line reads *Project Order: 1 lines · contract …  (saved)* and a link **open ↗** appears | ☐ Pass ☐ Fail |
| B4.3 | Press **› ERP** again | *Project Order: 0 lines*: nothing new is added, the order is keyed by the model's name (**SHED**) | ☐ Pass ☐ Fail |
| B4.4 | Click **open ↗**. On the Kernel ERP sign-in page choose **GardenAdmin**, then **Log In** | The ERP opens on the project **SHED** (*BIM: SHED*) with its planned amount; its **Phase**, **Task** and **Project Line** tabs hold the rows from the model | ☐ Pass ☐ Fail |

**Notes (chapter B):** ______________________________________________

---

## C · ERP: the hands-on exercise (GardenWorld Admin)

Use the 12 test projects. The table says, per project, what to make. Use **Rake Bamboo** as the product, any GardenWorld vendor, the *Purchase* price list and *HQ Warehouse*. On each document, set **Project** to the test project (and the phase, where the window asks).

| Project | Name | Phases ticked (from the pack) | Purchase orders | How far the completed order goes | Issue to the project |
|---|---|---|---|---|---|
| TD_RIVERSIDE | Riverside Tower | 3 of 5 | complete: 40 × Rake Bamboo @ 50; leave in Draft: 10 × Rake Bamboo @ 50 | Paid in full | 30 × Rake Bamboo |
| TD_DEPOT | North Depot | 1 of 4 | leave in Draft: 12 × Rake Bamboo @ 70 | — | 10 × Rake Bamboo |
| TD_BRIDGE | Bridge Deck | 2 of 4 | complete: 20 × Rake Bamboo @ 120; leave in Draft: 30 × Rake Bamboo @ 120 | Half paid | 80 × Rake Bamboo |
| TD_CLINIC | Clinic Wing | 2 of 4 | — | — | 15 × Rake Bamboo |
| TD_DATAHALL | Data Hall | 1 of 3 | complete: 30 × Rake Bamboo @ 60; leave in Draft: 20 × Rake Bamboo @ 60 | Received | 25 × Rake Bamboo |
| TD_SUBSTATION | Substation | 1 of 3 | complete: 5 × Rake Bamboo @ 100 | Ordered only | — |
| TD_CARPARK | Car Park | 2 of 3 | — | — | 60 × Rake Bamboo |
| TD_SCHOOL | School Block | 3 of 4 | complete: 25 × Rake Bamboo @ 45 | Paid in full | 35 × Rake Bamboo |
| TD_PUMP | Pump Station | 1 of 3 | — | — | 5 × Rake Bamboo |
| TD_OFFICE | Office Fit-out | 0 of 3 | — | — | — |
| TD_WAREHOUSE | Warehouse 3 | 0 of 3 | leave in Draft: 8 × Rake Bamboo @ 80 | — | — |
| TD_PLAZA | Plaza | 3 of 3 | — | — | 12 × Rake Bamboo |

Buying *Rake Bamboo* at the table's prices raises its average cost. The issues in C4 are then costed well above its starting cost, and most test projects end **over budget** on the dashboard. With this table that is the expected picture.

### C1 · Purchase orders

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| C1.1 | **Purchase Order** window, new: a vendor, *Purchase* price list, *HQ Warehouse*, **Project** = the test project. Line: Rake Bamboo, quantity and price as in the table | The order total = quantity × price | ☐ Pass ☐ Fail |
| C1.2 | **Complete** the orders marked *complete*; leave the others **Drafted** | Status *Completed* / *Drafted* | ☐ Pass ☐ Fail |

### C2 · Material receipt

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| C2.1 | For each completed order that goes to *Received* or further: **Material Receipt** window, create from the order, locator *Default HQ Locator*, **Complete** | The receipt is *Completed*; the product’s on-hand quantity rose | ☐ Pass ☐ Fail |

### C3 · Vendor invoice and payment

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| C3.1 | For *Half paid* and *Paid in full*: **Invoice (Vendor)**, create from the order, **Complete** | The invoice is *Completed*, linked to the order and the project | ☐ Pass ☐ Fail |
| C3.2 | **Payment** window: pay the invoice in full (*Paid in full*) or half its total (*Half paid*), **Complete** | The invoice shows paid / partly paid | ☐ Pass ☐ Fail |

### C4 · Issue materials to site

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| C4.1 | **Project** window, the test project: issue the quantity in the last column from *Default HQ Locator* (**Issue to Project**), **Complete** | The issue is *Completed* | ☐ Pass ☐ Fail |
| C4.2 | Look at the project header | **Spent** (project balance) rose by the issued material’s cost | ☐ Pass ☐ Fail |

### C5 · Tick a phase

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| C5.1 | On a test project, tick one more phase **Complete** and save | The phase stays ticked; that project’s *Done* on the dashboard rises (chapter D) | ☐ Pass ☐ Fail |

**Notes (chapter C):** ______________________________________________

---

## D · The dashboard

The dashboard reads a file that a small read job writes from your iDempiere. Run the job first, and again whenever you want fresh figures (it needs Node.js; the full line with user, password, tenant and role is in the [Developer's note](CapexDashboardGuide.md#developers-note)):

```
BRIDGE_BASE=http://<your-idempiere>:<port> node capex/tools/legacy_snapshot.js
```

It ends with a line `§DASH_LEGACY_SNAPSHOT … projects=<n> … unavailable=[]`. Then open `/capex/index.html?source=legacy` on the server that holds that copy (see [How the dashboard connects to the data](CapexDashboardGuide.md#how-the-dashboard-connects-to-the-data)). Every tile is described in [The dashboard page](CapexDashboardGuide.md#the-dashboard-page).

![The dashboard](img/capex/capex_page_dashboard.png)

| # | Do | Confirm on screen | Result |
|---|---|---|---|
| D1 | Read **Total Projects** and **Active Projects** | The 12 test projects are counted (plus any of your own) | ☐ Pass ☐ Fail |
| D2 | Read **Approved Budget** | The sum of the planned amounts, per currency | ☐ Pass ☐ Fail |
| D3 | Read **Actual Cost** (Spent) | It rose by what you issued in C4 | ☐ Pass ☐ Fail |
| D4 | Open **Procurement Risks** in the left menu. Then open a test project's page (D5) and its **Procurement** tab | Left menu: *Open purchase orders* = the 5 you left Drafted, with their total. Project page: the **Supply chain** card shows that project's order at the stage you took it to (*TD_SUBSTATION* Ordered, *TD_DATAHALL* Received, *TD_BRIDGE* Invoiced, *TD_RIVERSIDE* and *TD_SCHOOL* Paid) and lists its receipt, invoice and payment | ☐ Pass ☐ Fail |
| D5 | Click a number on a tile | The drill panel lists the projects behind it; click a project to open its page | ☐ Pass ☐ Fail |
| D6 | On the project page of *TD_RIVERSIDE*, open the tabs | Overview: Approved **371.25**, 5 phases. The Schedule tab draws the 5 phase bars with the pack’s dates, the first 3 *Complete* | ☐ Pass ☐ Fail |
| D7 | Open **ƒ formula** under a tile | The formula is shown; it is the same Performance Analysis measure your iDempiere holds (A2.3) | ☐ Pass ☐ Fail |
| D8 | Change **Layout** and **Skin** | The look changes; the numbers do not | ☐ Pass ☐ Fail |
| D9 | Log in to iDempiere again and read the **Home** tab | The CAPEX goals show the same counts as the dashboard tiles, money in your login’s currency. A goal that has a target (for example *Health Green*, *Schedule On Time*, *Actual Cost*) shows its percentage of the target on the Home tab, not the count | ☐ Pass ☐ Fail |

**Notes (chapter D):** ______________________________________________

---

## Known limits (do not fail a step on these)

- **Proposed figures.** *Forecast*, *Procurement Risks* and *Handover* use definitions we proposed; they await your confirmation.
- **Postings in the Kernel ERP.** Project issues complete but are not yet posted to the books in the browser-based Kernel ERP; in your iDempiere they post as usual.
- **Task dates.** Task dates are kept by the BIM Document plugin; without it, the Schedule tab draws phases only.
- **This pack in the Kernel ERP.** Loading this test pack into the browser-based Kernel ERP (rather than into your iDempiere) is not available yet.

## Sign-off

| Chapter | Tester | Date | Passed / total | Signature |
|---|---|---|---|---|
| A · Set up | | | / 16 | |
| B · BIM | | | / 23 | |
| C · ERP | | | / 8 | |
| D · Dashboard | | | / 9 | |
