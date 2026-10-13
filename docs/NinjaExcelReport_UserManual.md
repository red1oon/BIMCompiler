# NinjaExcel Report — User Manual

*For accountants and report authors. No programming needed beyond writing a SELECT.*
*Every number and claim below was produced by a gate in `scripts/ninja_template/run_all.sh` (gate names in brackets). Anything not built yet is under **Planned**, never stated as fact.*

---

## 1. What it is

You design a report **in Excel**, exactly the way you want it to look. You tell the sheet where each number comes from with a short SQL query. NinjaExcel runs the queries against the ERP data, paints the results into your layout, makes the formulas follow, and gives you an `.xlsx` and a one-page PDF.

You keep full control of fonts, colours, borders, number formats and column widths. The engine only fills in and grows what you marked.

Everything runs on free open-source code (ExcelJS and PDFKit, both MIT licence). No PDF-conversion subscription is used.

## 2. Quick start — the Trial Balance example

The example in this manual is a Thai trial balance (`งบทดลอง`) over the GardenWorld demo company: for each account, the **opening balance**, the **debit and credit movement** in the period, and the **closing balance**, with totals and a proof line. It works **by accounting period**, like the ERP's own trial balance: a period counts by its start date.

**In the ERP:** open the **Excel Report** pill → **sample report template** → set **From** `2003-01-01` and **To** `2003-12-31` → **Run report**. The panel shows the painted report, with two downloads: the `.xlsx` and a one-page PDF.

Result for that period [`B2_pill_end_to_end`, run in a real headless browser on the ERP's own GardenWorld data]: **21 accounts**, total debit **40,392.44** = total credit **40,392.44**, proof line **0.00**, every account row equal to an independent query, a valid `.xlsx`, and a **one-page PDF**; 3 queries in about 35 ms.

Without the ERP, the same engine runs from a command line (developer use):

```
FROM="2003-01-01 00:00:00.0" TO="2003-12-31 00:00:00.0" \
  node scripts/ninja_template/W29_TwinXlsx.js parity_tb.xlsx my_report.xlsx
```

## 3. Anatomy of a template

An `.xlsx` with these sheets:

| Sheet | You put here |
|---|---|
| **Input** | The layout *with tags*. A tag is text like `@el.value@3` — "put the values of this query here; the query is on Process row 3". |
| **Process** | One row per query piece (§4). |
| **Reference** | Anything you like (notes, a sample result). Not used by the engine. |
| **Output** | The sheet the report is painted on. **Rebuilt on every run from BACKUP.** |
| **BACKUP** | The master copy of Output. **Make all layout edits here.** |

### The Process sheet columns

| Column | Meaning |
|---|---|
| ANNOTATION, ROW | Helper formulas; they show the tag name and row number. |
| **SELECT** | What to read, e.g. `el.value`, `SUM(a.amtacctdr)`. |
| **TABLE** | The first table of a query must end with the alias ` a` (e.g. `fact_acct a`). Later rows may add `INNER JOIN …` here. |
| **JOIN** | Extra conditions (optional). |
| **WHERE** | Filters, `GROUP BY`, `ORDER BY`. |
| **Direction** | `S`, `V`, `>` or `+` (§5). |
| **VALUES** | Filled by the engine with the query results. Put `END` after the last row. |

Rules the engine applies for you:

- **Client scoping is automatic.** Every query is limited to the current client; you never type it.
- **Rows that continue a query** (empty TABLE) add their SELECT to the query above them.

## 4. The worked example — Process rows

| # | SELECT | TABLE | WHERE | Dir |
|---|---|---|---|---|
| 1 | `a.name` | `ad_client a` | | S |
| 2 | `CONCAT(to_char(DATE #1,'DD/MM/YYYY'),' - ',to_char(DATE #2,'DD/MM/YYYY'))` | `ad_org a` | | S |
| 3 | `el.value` | `fact_acct a` | `a.postingtype='A' AND SUBSTR(p.startdate,1,10) <= SUBSTR(#2,1,10) GROUP BY el.value, el.name ORDER BY el.value` | V |
| 4 | `el.name` | `INNER JOIN c_elementvalue el ON el.c_elementvalue_id=a.account_id` | | V |
| 5 | `SUM(CASE WHEN SUBSTR(p.startdate,1,10) < SUBSTR(#1,1,10) THEN a.amtacctdr-a.amtacctcr ELSE 0 END)` | `INNER JOIN c_period p ON p.c_period_id=a.c_period_id` | | V |
| 6 | `SUM(CASE WHEN SUBSTR(p.startdate,1,10) >= SUBSTR(#1,1,10) THEN a.amtacctdr ELSE 0 END)` | | | V |
| 7 | `SUM(CASE WHEN SUBSTR(p.startdate,1,10) >= SUBSTR(#1,1,10) THEN a.amtacctcr ELSE 0 END)` | | | V |

**The trick of this report:** *opening* is every period that starts **before** `#1`, *movement* is the periods that start **inside** the range. One query, three `CASE` columns. Row 1 is the company name and row 2 the period text, both painted into the heading.

## 5. Directions — how results are painted

| Dir | Meaning | Example in this manual |
|---|---|---|
| **S** | One value into one cell (scalar). | Row 1: the period text `01/12/2006 - 31/12/2006` into the heading. |
| **V** | A **list downward**; the sheet grows one row per result, formulas below are pushed down and copied. | Rows 2–6: one line per account. 21 results → 21 rows. |
| **>** | A **list to the right**; columns are inserted and formulas to the right follow. | Used in the `parity_v2` fixture [`A_engine_parity_v2`]. |
| **+** | A **cross-tab**: one list across, one down, amounts at the crossings (written as `C3+`, pointing at the axis row). | The `parity_xtab` fixture: four accounts across [`A_engine_parity_xtab`]. |

### Date binds

`#1` is the **From** date, `#2` the **To** date, `#3` the account-group parameter. They are replaced with quoted values before the query runs.

## 6. How rows grow and formulas follow

After the last list row there must be a **spacer row**: a row with a formula in the cell under every tag column (the trial balance uses `=""`). That formula tells the engine "the list ends here"; the list grows into it.

**Totals must include the spacer row.** The template's totals are `=SUM(C6:C7)` where row 6 is the first account and row 7 the spacer. After 21 accounts were painted they became `=SUM(C6:C27)` automatically [`T_trialbalance` checks the range].

A range that stops *above* the spacer, such as `=SUM(C6:C6)`, **does not grow** — the gate catches this on purpose [`T_NEG_range`].

The closing-balance formula in each row (`=C6+D6-E6`) is copied down for every new row, with its references moved one row each time.

> **Formulas supported:** arithmetic, `SUM`, `COUNT`, `COUNTA`, `MIN`, `MAX`, `ABS`, `ROUND`, `ROW`, `IF`, `CONCATENATE`. Other functions show `#NAME?` (§8).

## 7. Getting the files

- **The `.xlsx`** keeps your fonts, fills, borders, number formats, merged cells, column widths and row heights [`B_conv_style_*`, `B_host_roundtrip_*`, `C_style_*`].
- **The PDF** is one page sized to the sheet. Every visible cell's text must be present in the PDF [`T_pdf_content`: 144 of 144 cells for the trial balance].
- **Thai (and Lao) text** is placed with a script-appropriate font so no letters drop out. This was a real defect found by that gate and fixed.
- Your template file is **never changed** by a run — the report is written to a different file [`T_manual_claims` → `CLAIM_NO_OVERWRITE`].

## 8. Troubleshooting — real messages

| You see | Meaning | Do |
|---|---|---|
| Your hand-typed text in Output is gone after a run | **Output is rebuilt from BACKUP every run.** [`CLAIM_BACKUP_RULE`] | Make every layout/text edit in **BACKUP**. |
| `§SHEET_MISSING BACKUP` | The template has no BACKUP sheet. | Copy your finished Output sheet and name it BACKUP. |
| `ROW NO. n .. CHECK >> Direction (Column 8) of Process Sheet is Empty. Fill with S, V or >` | A Process row has no Direction. | Fill column Direction with S, V, > or +. |
| `NO NAME IN SELECT ROW OF PROCESS SHEET` | A row has no SELECT. | Fill SELECT. |
| `NO ' FROM' IN ORIGINAL SQL …` | The statement has no table. | The first row of a query needs a TABLE ending in ` a`. |
| A cell shows `#NAME?` | The formula uses a function the engine does not support. It is shown as an error, **never as a silent 0** [`CLAIM_NAME_ERROR`]. | Use a supported function (§6) or compute it in the SQL. |
| A total did not include all rows | The range stops above the spacer row. | Make the range end on the spacer row (§6). |
| A query returns no data | The cell stays empty and the run notes `RETURNS NOTHING`. | Check the dates and filters. |

## 9. Limits

- One page per sheet; no page breaks.
- Formula shifting is verified for **relative references and simple ranges** only. Absolute references (`$A$1`), cross-sheet references, whole-column references (`A:A`) and named ranges are **not yet verified** — avoid them in grown areas.
- Images are not supported.
- The PDF layout was measured against a commercial converter's output on three reference sheets: **about 98.6 % of 1,833 checked items (page size, fills, border lines, words) match**; the single known deviation is a few shared vertical borders on the largest sheet [`D_geom_geom`, `D_geom_xtab`, `D_geom_v2`]. This figure is **for those reference sheets**; the trial balance has no commercial reference PDF.
- The example works by accounting **period** (a period counts by its start date), not by individual posting date, because the ERP's own database stores the period on each posting.
- Thai labels in the example are a hand translation.

## 10. How this improves over the legacy plugin

Each line cites the gate that proves it. The first column says what the user gets.

| Improvement | Evidence |
|---|---|
| **No server needed.** The legacy plugin ran inside a running iDempiere/OSGi server; the default gate run needs no server and no Postgres. | `scripts/ninja_template/run_all.sh` header; all gates run on a local SQLite copy of the data. |
| **No commercial PDF converter.** The PDF is produced by free code (PDFKit, MIT). | `T_pdf_content`, `D_geom_*`. |
| **Your template is never overwritten.** The legacy plugin rewrote the template file in place (a truncated file was a real customer fault). | `T_manual_claims` → `CLAIM_NO_OVERWRITE`. |
| **Wrong functions are visible.** An unsupported formula shows `#NAME?`, not a silent 0. | `CLAIM_NAME_ERROR`. |
| **Formatting survives growth.** Fonts, fills, borders, number formats, merges, widths and heights kept after rows/columns are inserted. | `B_conv_style_*`, `C_style_*` (earlier two-way check: 50,600 cells, 0 differences). |
| **PDF text is checked cell by cell.** | `T_pdf_content`: missing cells = 0. |
| **Thai and Lao script render.** | `T_pdf_content` (found and fixed a real drop-out). |
| **Totals that don't grow are caught.** | `T_NEG_range`. |
| **Runs inside the ERP, in the browser.** Pill → template → dates → Run, with `.xlsx` and PDF downloads, no server round trip. | `B2_browser_run`, `B2_pill_end_to_end` (21 accounts, 0 differences, one-page PDF). |
| **Proof built into the demo.** Debits equal credits, checked against an independent calculation. | `T_trialbalance`. |

### Planned (not built — no claim made)

- **Template check** before running: missing sheets, Process addresses outside Output, empty Direction, and Output-vs-BACKUP drift (a hand edit in Output is discarded today; this would warn first).
- **SELECT-only guard**: a template's SQL is refused unless it is a read-only SELECT.
- **Per-run SQL de-duplication with timings.**
- **Quiet logging.**
- **Calibrated PDF column widths** from a reference PDF.
