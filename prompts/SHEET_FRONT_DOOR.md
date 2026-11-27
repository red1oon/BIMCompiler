# ⚠ DO NOT REMOVE — SHEET FRONT DOOR: the user's own spreadsheet is the way in to the ERP
# Scope: a menu added to Excel / WPS / LibreOffice / Google Sheets ("Prepare Invoice", "File it", "Run report", "Read supplier bill")
# that files REAL iDempiere documents from the user's own sheet layout. Spec first, witness first, EXTRACT ONLY.
# READ THE LOG after every run (§SHEET_DOOR / §SDOOR-* lines); the exit code is not evidence.
# Code: bim-ootb `erp/sheet_door.js` + `erp/tests/witness_sheet_door.js`. This file: findings, decisions, results (dated sections).

## ▶▶ RESUME HERE — call sign **'resume killer'** (2026-11-27)
**One package, one core, many doors** (owner agreed 2026-11-27: *"ok so we call this 'resume killer'"*). This file + `prompts/PDF_EDITOR.md`
are two halves of ONE lane. IN: a PDF report (reader), Excel/WPS/LibreOffice (menu), a blank page (editor). CORE: sheet + source map
(cell ↔ box on the page) + history (S9) + "does it add up" check (S1). OUT: the SAME PDF with numbers rewritten in place, a PDF in a
new layout (NinjaExcel), .xlsx, the ERP (File it). Shared pieces are built ONCE (history, check, cell map, pdf.js, SheetJS, menu).
**Build order:** (1) PDF_EDITOR P0 viewer + S10 report reader, proof = round trip of our own trial-balance PDF (21 accounts,
40,392.44); (2) numbers-only in-place write-back (narrow cut of PDF_EDITOR P4) with history; (3) S3 Excel menu; (4) the wider
editor phases P1/P2/P5 on the same core.
**Two stages, decided (owner 2026-11-27):** stage 1 = the user's own PDF / Excel with reading, the adds-up check, history and a copy back
out, **standalone, no ERP in sight**; stage 2 = "File it" into the ERP proper. Asked whether stage 1 should sit on the ERP's own Document /
PrintFormat layers, the owner ruled: *"yes standalone for now - borrowing the same code layer needed"*. So stage 1 takes ERP code only
where it needs it (as it already does: the kernel's journal format and `verifyJournal` for history, the ERP's SheetJS build); mapping a
user's layout to an iDempiere PrintFormat is a later, separate step, not a precondition.
The owner's name for it: *"sort of a sharding of pieces approach as it can pick from the entire ERP framework"* — each front-door
feature takes the single ERP piece it needs (a shard), never the whole; any piece of the framework may be picked later the same way.
**State:**
- **S1 DONE (witness) 2026-11-27:** engine `erp/sheet_door.js` + W-SHEET-DOOR 9/9 cases PASS (21 checks), mutants 5/5 killed
  (bim-ootb `feat/sheet-door`). Results + two legacy findings in §5.
- **S9 HISTORY DONE (witness) 2026-11-27** (owner: *"history is lacking in Excel. It is a missing killer... Proceed."*):
  `erp/sheet_history.js`, W-SHEET-HISTORY 8/8 cases PASS (20 checks), mutants 5/5 killed — §6.4.
- **S10 REPORT READER + PDF P0 DONE (witness) 2026-11-27** = build order step (1): bim-ootb `pdf/` (PR #3470). Our trial-balance PDF reads
  back to the sheet that printed it, 144 of 144 cells at the same address, debit = credit = 40,392.44 found by arithmetic — §7.4;
  the page (view, find, outline, Read as sheet, .xlsx, offline) — `PDF_EDITOR.md` §4.2.
- **Reader denominator widened 2026-11-27 (bim-ootb #3472, §7.5):** 3 of 5 layouts rebuilt (trial balance, sales register, cross-tab);
  2 are measured LIMITS (merged / centred / wrapped cells; columns that nearly touch). Next for the reader = the page's ruling lines
  and fills as grid evidence (§7.5 "Next").
- **In flight 2026-11-27 (two workers, own sections):** build order step (2) numbers-only write-back → `PDF_EDITOR.md` §4.3/§4.4; S3 Excel
  menu → §8 below. Read those sections' RESULTS for their state.
- **Next = build order step (2):** numbers-only in-place write-back (narrow cut of PDF_EDITOR P4) into the box the source map names,
  each change an S9 history entry. Then S3 Excel,
  S4 WPS, S5 LibreOffice; S2 is reduced to "the host writes/reads the `_door_ledger` sheet" (the replay itself is already proven by D9).

## 0. Why (owner, 2026-11-27)
The owner wants a harmless "Trojan horse": users start from what they already use, their own Excel or PDF, with a simple
promise like *Prepare an Invoice*, not from an ERP window. Owner: *"the entry point as simple as their own Excel, and they
install a script from us that extends their menu to begin work"* · *"Even to work on Libre Office or the Chinese clone of
MS Office. Even the Excel Ninja will be just a menu action bar."* · *"The AI extract info part can be a narrow OCR that feeds
such info into our ready template."* · *"Go with your best idea/s."*

Market read (sources in the 2026-11-27 session): free invoice makers (Zoho Invoice, Wave, Invoice Ninja), the free LHDN
MyInvois portal / e-POS, bill readers (Dext, AutoEntry, Hubdoc) and progress-claim tools (Payapps, Siteline) each own ONE
document and hand off. None ties the document to stock, purchasing, project and building in one user-owned file. In
Malaysia "prepare an invoice" alone is not a hook (MyInvois is free); the hook is *your own layout, offline, linked*.

## 1. Architecture (decided 2026-11-27, owner delegated the choice)
**The workbook is the contract. The engine is ONE program. Each spreadsheet host gets a THIN menu.**
- **Workbook:** the user's own sheets, plus hidden sheets `_door_tags` (the template: which cell is what, JSON) and
  `_door_ledger` (the signed op groups this workbook filed). Every host keeps hidden sheets, `.xlsx` and `.ods` alike.
- **Engine** (`erp/sheet_door.js`, browser + node, UMD): input = the template + the VALUES of the tagged cells only
  (`{ "B3": "JoeBlock", ... }`); output = `{ ok, verdict, reason, writes: [{cell, value}], checks, invoice }`. The engine
  never parses a file format and never touches a cell the template does not name. **The ledger is the host's:** after the
  commit it appends the kernel's signed journal entry (`ws_kernel` journalOf: hash-chained, digest-checked, `replay`-able) as one
  line to `_door_ledger` (the uncommitted op group is not the ledger: the commit assigns the record keys, §5).
- **Thin menu per host** does three things only: read the tagged cells, apply `writes`, show the verdict.

| Host | Menu mechanism | Engine runs |
|---|---|---|
| Microsoft Excel (Win/Mac/web) | Office web add-in (manifest + ribbon commands) | inside the add-in's web pane |
| WPS Office | WPSJS add-in (Chromium/CEF pane, `ribbon.xml` in Office customUI schema) | inside its web pane |
| LibreOffice | `.oxt` extension, menu in `Addons.xcu`, shim in LibreOffice's own bundled Python | **option (a):** the `.oxt` carries the engine's web files, its Python serves them on localhost, File it opens a browser tab, the result comes back as `writes` |
| Google Sheets | Apps Script add-on, HTML sidebar | inside the sidebar |

Rejected: VBA `.xlam` (Office blocks macros from the internet by default on Windows; cannot run the JS kernel);
a Python re-write of the engine for LibreOffice (a second implementation; one owner per responsibility).

**Twin + AD-layer law:** the door adds NO invoice logic. It fills `I_Invoice` rows and runs iDempiere's own
**Import Invoice** (AD_Process 207, `erp/processes/ImportInvoice.js`, verbatim port, W-IMPORT-INVOICE). Orders the same way
through Import Order (206). A template is data; a new layout is a new `_door_tags` entry, never code.

**Known limits (facts, not guesses):** Office on Windows runs add-ins on the old IE11 engine unless Office ≥ 16.0.13530 AND
the WebView2 runtime is installed; our kernel will not run there (fallback: open the workbook in the browser engine page).
How many Malaysian SMEs run such old Office is UNKNOWN — to be measured before any claim. MyInvois stays behind its research gate
(`RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md` Thread 3); the door makes no e-invoice compliance claim.

## 2. Template format (`_door_tags`, JSON) — S1
```
{ "kind": "invoice", "docAction": "CO",
  "fixed":  { "issotrx": "Y", "doctypename": "AR Invoice", "iso_code": "USD" },      // constants of this template
  "header": { "partner": "B3", "date": "F3", "docno": "F2", "subtotal": "F20", "grandtotal": "F22", "status": "F24" },
  "lines":  { "from": 8, "to": 18, "cols": { "product": "B", "charge": "C", "description": "D", "qty": "E", "price": "F", "amount": "G" } } }
```
- `partner` → `I_Invoice.BPartnerValue`; `date` → DateInvoiced + DateAcct; `docno` → DocumentNo (blank = legacy mints one);
  line `product` → ProductValue, `charge` → ChargeName, `qty` → QtyOrdered, `price` → PriceActual (blank = the process prices
  it from the price list, legacy `line.setPrice()`), `description` → Description. A line row with no product and no charge is empty.
- `subtotal`: printed sum of the line amounts (pre-tax). `grandtotal`: printed total after tax. `status`: where the verdict goes.
- Write-back cells: `docno` (the filed DocumentNo) and `status` only.

## 3. Slice S1 — the engine (witness W-SHEET-DOOR, `erp/tests/witness_sheet_door.js`, node over the shipped seed)
Claims, written before code; each names the issue it exposes and can fail:

| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| D1 EQUIV | An invoice filed through the door gives the SAME C_Invoice + lines + Fact_Acct fingerprint (ids/timestamps stripped) as the same rows declared straight into I_Invoice and imported by AD_Process 207 | the door adds or loses invoice logic (twin breach) | mutant: swap qty/price columns |
| D2 LAYOUT | The same invoice in two different layouts (two templates, cells in other places) gives an identical fingerprint | the engine depends on a layout (template is not data) | mutant: one cell address hardcoded |
| D3 SUBTOTAL | Printed subtotal ≠ Σ line amounts (or a line's qty × price ≠ its printed amount) → refused, zero journal entries, the verdict names both numbers | a wrong sheet is filed silently | mutant: subtotal check skipped |
| D4 GRANDTOTAL | Printed grand total ≠ the ERP's computed grand total (tax by the twin) → refused, the transaction dropped, both numbers named | the sheet's tax and the books' tax disagree, unseen | mutant: grand total check skipped |
| D5 WRITE-BACK | `writes` touches only the `docno` and `status` cells; docno value == the filed C_Invoice.DocumentNo; a blank docno gets the minted one back | the door writes outside its tags or returns a wrong number | mutant: write docno to the wrong cell |
| D6 VACUOUS | No filled line rows → INCONCLUSIVE, no invoice, no journal | an empty sheet "passes" | — |
| D7 LEGACY ERROR | A partner that does not exist → no invoice, the status cell carries legacy's own I_ErrorMsg text | errors are swallowed or reworded | — |
| D8 FOREIGN ROWS | Pending I_Invoice rows not made by this filing exist → refused and named (legacy Import Invoice would sweep them in) | the door files someone else's import | — |
| D9 LEDGER | A filing is ONE signed journal entry; that entry as a workbook ledger line verifies, replays into a fresh kernel to the same fingerprint, and a hand-edited line is refused | the workbook cannot rebuild (or be trusted to rebuild) its books | tamper one field |

Verdict line per case: `§SDOOR-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`. Mutants (`SDOOR_MUTANTS=1`) must
turn their named check FAIL in a child run; a crash is not a kill.

## 4. Later slices (specced, not built)
- **S2 LEDGER IN THE WORKBOOK:** `_door_ledger` holds the op groups; opening the workbook folds them into a fresh seed DB and
  reproduces the same C_Invoice fingerprint (claim: replay == original; falsifier: drop one op). The workbook becomes the project file.
- **S3 EXCEL SHIM:** Office web add-in manifest + ribbon (Mark my invoice / File it / Register / Run report). Witness: the shim
  only reads tagged cells and applies `writes` (a fake Office.js host in node), no other cell touched.
- **S4 WPS SHIM:** WPSJS ribbon; same fake-host witness. Note the reported ToggleButton argument-order difference.
- **S5 LIBREOFFICE SHIM:** `.oxt`, `Addons.xcu`, Python serves the engine page on localhost; same `writes` contract.
- **S6 NINJAEXCEL AS A MENU ACTION:** "Run report" runs the existing NinjaExcel engine and returns its figures as `writes`.
- **S7 MARK MY INVOICE:** the user clicks their own cells once to build `_door_tags` (no code per layout).
- **S8 NARROW READER (supplier bills):** known layouts only; each field carries its source box; the bill's printed
  sums must agree (same rule as D3/D4); for a purchase the price comes from the PO line (iDempiere CreateFromInvoice copies
  price, only qty is free), a differing printed price is flagged. Fixed text reader, no generative model at runtime.

## 5. RESULTS — S1 (2026-11-27, bim-ootb `feat/sheet-door`)
Command: `SDOOR_MUTANTS=1 node erp/tests/witness_sheet_door.js` (GardenWorld seed via `ws_kernel.load`, a fresh kernel per scenario).
Invoice used: customer C&W, Oak 2 x 61.75 = 123.50, Elm 3 x 10.00 = 30.00, subtotal 153.50; the oracle path (rows straight into
I_Invoice + AD_Process 207) filed it CO with grand total 153.5 (`§SDOOR-ORACLE direct ok=true journal=1`).
```
§SDOOR-D1 PASS 3/3 · D2 PASS 2/2 · D3 PASS 3/3 · D4 PASS 1/1 · D5 PASS 4/4 · D6 PASS 1/1 · D7 PASS 1/1 · D8 PASS 1/1 · D9 PASS 5/5
§SDOOR-MUTANTS killed=5/5   (M1 qty/price swapped→D1, M2 line start hardcoded→D2, M3 subtotal skipped→D3, M4 grand total skipped→D4, M5 docno to wrong cell→D5)
§SDOOR-VERDICT PASS judged=21 failed=0
```
Shipped log samples: `§SHEET_DOOR verdict=FILED ok=true writes=["F2","G24"]` · layout B `writes=["C4","A60"]` ·
`reason="subtotal: lines 153.50 != printed 153.51"` · `reason="grandtotal: filed 153.5 != printed 153.51"` ·
`reason="Import Invoice:  ERR=Invalid Country, ERR=No BPartner, "` (legacy's own texts reach the status cell).

**Findings (each found by a failing check, fixed on the door side, legacy cited):**
1. **Blank document number split the invoice.** Declaring the rows with the model save (= `PO.saveNew`) minted a DocumentNo
   for EACH I_Invoice row (`PO.java:3563-3584`), so legacy Import Invoice broke the sheet into one invoice per line
   (`ImportInvoice.java:674-680`). Legacy's spreadsheet path is the **Import Loader**, `ImpFormat.updateDB`
   (`ImpFormat.java:640-680`): a raw INSERT of the standard fields + UPDATE of the mapped columns, no `PO.saveNew`, DocumentNo
   stays NULL, all lines group into ONE invoice that `MInvoice` numbers. The door now inserts rows the Import Loader's way
   (`trx.insert`). Check D5 `minted-one` holds it.
2. **The ledger is the committed journal entry, not the op group.** The commit assigns `i_invoice_id` / `_uu` into the op
   fields, so the engine's pre-commit group differed from what was journalled. The engine no longer returns a ledger; the host
   keeps the signed journal entry. D9 proves that entry verifies, replays to the same books in a fresh kernel, and that a
   one-field hand edit is refused (`journal payload ... does not match its digest`).
3. **Witness blind spot caught by its own mutant:** M2 (line start hardcoded to row 8) first SURVIVED because layout B's range
   covered row 8. Fixed by moving layout B to rows 30-45 and putting a decoy cell just above every line range.

**Not yet:** no host menu exists (S3-S5), so `sheet_door.js` is not loaded by any page and has no sw.js entry yet; wiring
comes with the first shim. The status text is legacy's raw `ERR=` text; a plain-language wrapper must still show legacy's text
(twin L&F) — decide with S3. Old-Office share in Malaysian SMEs still unmeasured (§1).

## 6. Slice S9 — HISTORY: the spreadsheet's memory (spec 2026-11-27, before code)

### 6.1 Prior art (searched 2026-11-27; sources in that session's reply)
| Who | What it does | Where it stops |
|---|---|---|
| Excel **Show Changes** (365) | per-cell edits, who / when / before | **cloud-saved files only**; Microsoft says 365 days (older pages: 60); gaps in the timeline; not formats / charts / pivots / filters; edits by VBA or Office Scripts not logged; a reset on the web clears it for everyone; "save a copy" / replace the file empties it |
| Excel **Version History** | whole-file snapshots | cloud only, file-level, no per-cell story, no merge |
| Legacy **Track Changes / Shared Workbook** | old review mode | retired in favour of co-authoring |
| **Google Sheets** "Show edit history" (2019) | per-cell prior values back to creation | online only; skips added/deleted rows and columns, format changes and **changes made by formulas** |
| **LibreOffice** Track Changes | records value edits with an auto comment | **turning recording off accepts and erases them**; no formats; cannot be printed or exported to PDF |
| Spreadsheet Compare (Office Pro Plus), xlCompare, SheetDelta | diff two files | two files at a time, no running history, no proof |
| xltrail, "Git for Excel" | git-backed workbook versions | needs git / a server, developer audience |
| ClusterSeven-class EUC control platforms | enterprise spreadsheet change monitoring | regulated-enterprise products, server-side |

**The gap no one fills:** a history that lives **inside the file**, works **offline in every spreadsheet program**, cannot be
edited unnoticed (hash chain), can **replay the sheet to any moment**, and **merges two emailed copies** showing conflicts instead
of overwriting.

### 6.2 Design (decided 2026-11-27, owner delegated)
- **Snapshot diff, not keystroke events.** The host gives the engine the sheet's cells (value + formula) at each recording point
  (save, close, or the user's "Stamp" button); the engine diffs against the last recorded state. Every host can read its cells;
  event APIs differ per host. A diff also catches changes made by macros, paste and formulas (the blind spots in 6.1).
  Cost: edits between two recording points fold into one step (stated limit). A host with good events (Excel) may record more
  often; the entry format is the same.
- **One entry format with the ERP journal.** Each entry = the kernel journal shape (`seq, actor, at, meta, ops, opsDigest,
  prev, hash, payload.ops`), hashed the same way, so the kernel's own `verifyJournal` verifies a sheet history. Ops are
  `CELL_SET { sheet, cell, before:{v,f}|null, after:{v,f}|null }`. Kept in the hidden sheet `_door_history` (separate from
  `_door_ledger`, which only the ERP replays).
- **Entry 1 = the genesis snapshot** (every non-empty cell), so any moment can be rebuilt from the file alone.
- **Who:** the name the host reports. Not a signed identity until the kernel's signing (W-SIGN) is wired. Stated, not claimed.

### 6.3 Claims (W-SHEET-HISTORY, `erp/tests/witness_sheet_history.js`, real workbook `erp/ninja_sample.xlsx`)
| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| H1 RECORD | An entry lists exactly the changed cells (value or formula, added, cleared) with before/after; unchanged cells absent; no change → NO-OP, no entry | history misses or invents edits | mutant: cleared cells dropped |
| H2 FORMAT | Every history line passes the kernel's own `verifyJournal` (one verifier for ERP + sheet history) | a second, divergent log format | — |
| H3 TAMPER | A hand-edited before/after is caught (payload digest); a deleted entry is caught (chain) | history can be rewritten unseen | mutant: digest check skipped |
| H4 AS-OF | Replaying the first N entries gives exactly the sheet as it was at step N, for every N | time travel is wrong | mutant: off by one |
| H5 CELL STORY | A cell's story lists every value it had, in order, with who and when | per-cell history incomplete | — |
| H6 MERGE | Two copies forked from one history: edits on different cells combine; the same cell changed differently on both sides is a CONFLICT showing both values, neither overwritten; the same change on both sides is not a conflict | version chaos, silent overwrite | mutant: side B wins silently |
| H7 TYPED-OVER | A formula replaced by a typed number is flagged (`typedOverFormula`) — the most common "sheet doesn't add up" cause | the checker misses hardcoded overrides | mutant: diff ignores formulas |
| H8 COST | Genesis and per-step time and history bytes are logged (§ line) on the real workbook | unmeasured weight (PERF BUDGET) | — |

### 6.4 RESULTS — S9 (2026-11-27, bim-ootb `feat/sheet-history`)
Command: `SHIST_MUTANTS=1 node erp/tests/witness_sheet_history.js` on the real `erp/ninja_sample.xlsx` (3 sheets, 114 cells,
BACKUP!B9 = SUM(B5:B8) = 541.02), read with the ERP's own SheetJS build.
```
§SHIST-H1 PASS 5/5 · H2 PASS 2/2 · H3 PASS 3/3 · H4 PASS 1/1 · H5 PASS 2/2 · H6 PASS 5/5 · H7 PASS 1/1 · H8 PASS 1/1
§SHIST-MUTANTS killed=5/5  (cleared cells dropped→H1, digest unchecked→H3, as-of off by one→H4, side B wins→H6, formulas ignored→H7)
§SHIST-COST cells=114 genesisMs=5 stepMs=[0,0,0] historyBytes=15579 genesisBytes=14084 fileBytes=24938 heapMB=7
§SHIST-VERDICT PASS judged=20 failed=0
```
- H2: the kernel's own `ws_kernel.verifyJournal` verifies the sheet history: ONE verifier for ERP journal and sheet history.
- H3: a changed before-value, a removed entry and a changed "who" are each caught at the exact entry.
- H6: two copies of one history merged: C5 (copy A) + C6 (copy B) combined, B8 changed to the same value on both = no
  conflict, B7 changed to 11 vs 22 = ONE conflict showing both, merged sheet keeps the base value; unrelated files refused.
- H7: the one formula overwritten by a typed number (B9: =SUM → 600) is flagged, nothing else.
- Witness slip found and fixed (not an engine defect): the first run's "add a note in D2" was wrong, D2 already held a date;
  the engine reported it truthfully. Moved to F2 (outside the used range) with a check that it was empty.

**Cost and the host limits it implies (for S3-S5):** ~123 bytes per cell for the genesis entry (14,084 B / 114 cells), so a
100,000-cell sheet's genesis is in the order of 12 MB (extrapolated, NOT measured). An Excel cell holds at most 32,767
characters, so the `_door_history` writer must split one entry across cells (one entry per row, chunks across columns) — a
shim-side requirement, to be witnessed with the first host. A step costs only its changed cells (3 steps here: 1.5 KB total).

## 7. Slice S10 — REPORT READER: a PDF report becomes a checked sheet (spec 2026-11-27, before code)
Build-order step (1) of the ▶▶ block, together with `PDF_EDITOR.md` §4.1 (P0). Code: bim-ootb `pdf/report_reader.js`, witness
`pdf/tests/witness_sheet_reader.js` (W-SHEET-READER).

### 7.1 Measured before the design (2026-11-27)
- **The proof file** is the NinjaExcel trial balance: `parity_tb.xlsx` run by the report engine on the GardenWorld twin for
  2003-01-01..2003-12-31 and printed by `ninja_pdf.js` (PDFKit). That engine lives on bim-compiler `origin/ninja-xtab2` and bim-ootb
  `origin/feat/ninja-template-pill`; **neither is merged**, so the "one-page PDF" download the user manual describes is not on
  bim-ootb `main` today (finding, not fixed in this slice). Re-run this session: `§TB_DEMO accounts=21 totalDebit=40392.44
  totalCredit=40392.44 proofDrMinusCr=0.00 · §PDF_CONTENT cells=144 missingFromPdf=0`. One page, 681 x 526.5 pt, 74,945 bytes.
- **The oracle** is the sheet that printed the PDF, dumped from that same run: 144 cells (address, type, value, printed text,
  formula), no merged cells, blank rows 4, 27, 29. Kept beside the PDF as `pdf/corpus/trial_balance_th.cells.json`.
- **What pdf.js (3.11.174, already shipped at `modeller/lib/pdfjs/`) gives for it:** 302 text items. One printed cell arrives as
  several items (Thai and Latin runs are separate, with baselines up to 2.2 pt apart inside one row); the gap between two cells
  arrives as a space item as wide as the gap (39 to 190 pt), a real space is 2.8 to 3.9 pt. Row pitch 12.75 pt; a blank sheet row
  shows as a double pitch.

### 7.2 Design
Pure function, host-neutral, no file format inside: `read(pages) -> { ok, verdict, reason, sheet, map, checks, stats }`, where
`pages` = the text items of each page in page points, y down (the page's own reader hands them in; the engine never calls pdf.js).
1. **Lines:** items whose baselines differ by at most 0.3 of the smaller font height are one line.
2. **Cells:** in a line, neighbours closer than 0.6 of the font height are one cell (stated limit: a report whose columns sit
   closer than that merges cells; the adds-up check then fails loudly, it does not pass).
3. **Columns:** from the lines that hold 3 or more cells (the table), the vertical bands no cell crosses are the gutters. A cell
   of any other line goes to the column its left edge falls in.
4. **Rows:** lines top to bottom; a gap of about two pitches (median pitch of the table lines) is one blank row, so the read
   sheet keeps the source's row numbers.
5. **Types, as printed:** a column whose cells share a right edge is a number column; there `1,373.65` is a number,
   `(1,466.15)` is negative and a lone `-` is 0. A left-aligned column stays text (an account code `11100` is not a number).
6. **Does it add up (the S1 rule, found not declared):** the first row after the block of number rows is tried as a total: per
   number column, printed vs sum of the block. Half or more columns agree → it IS a total row and every column is reported
   (`SUM`, cell, range, printed, computed, ok). Across the block, a row rule with coefficients -1/0/+1 over the other number
   columns that holds on EVERY row (and on 3 or more rows with two non-zero terms) is reported (`ROW`, e.g. F = C + D - E).
   Verdict `ADDS_UP` | `DOES_NOT_ADD_UP` (cell and both numbers named) | `INCONCLUSIVE` (no text, no table, or no total found:
   never PASS on nothing judged).
7. **Source map:** every cell carries `{ page, box:[x0,y0,x1,y1] }` in page points, y down: the box the numbers-only
   write-back (build-order step 2) will rewrite.
8. **Out:** the sheet as SheetJS cells (values; a proven total carries its `SUM` formula) and as an S9 snapshot
   (`{ sheet: { A1: { v, f } } }`) so the history engine records it with no adapter.

### 7.3 Claims (each names the issue it exposes; verdict line `§SREAD-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`)
| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| R1 CELLS | All 144 oracle cells are read at the SAME address with the same text (outer spaces trimmed); no extra cell | cells lost, merged, split or shifted when a report is read | mutant: blank rows dropped |
| R2 NUMBERS | Every oracle number equals the read value within 0.005; brackets are negative; a dash is 0; codes in the text column stay text | wrong signs, codes turned into numbers | mutant: brackets not negative |
| R3 ADDS UP | Row 28 is found as the total by arithmetic, 4 of 4 columns agree (debit = credit = 40,392.44), the row rule holds on 21 of 21 rows, verdict ADDS_UP. With ONE printed digit changed in the input the verdict is DOES_NOT_ADD_UP and names the cell and both numbers | a report that does not add up is accepted | mutant: sums not compared |
| R4 SOURCE MAP | Against poppler `pdftotext -bbox` (independent reader): every word's centre lies inside exactly one cell box and that cell's text holds the word; every cell box holds a word | the box a later write-back would rewrite is the wrong place | mutant: boxes shifted one row |
| R5 VACUOUS | A page with no text → INCONCLUSIVE, no sheet. Text with no table → INCONCLUSIVE, named | an empty or prose page "passes" | — |
| R6 XLSX | The sheet written by the ERP's own SheetJS build and read back: same values at the same addresses; the four total cells carry SUM formulas | the hand-off file differs from what was read | mutant: one column dropped on write |
| R7 HISTORY | The read sheet as an S9 genesis entry passes the kernel's `verifyJournal`; one later edit records exactly one CELL_SET | the reader needs an adapter to the shared history (two cores) | — |
| R8 COST | read ms, cells, items, heap logged (`§SREAD-COST`) | unmeasured weight | — |

Not claimed: any PDF other than this one (a second report layout is the next denominator step), scans (P6), multi-page tables.

### 7.4 RESULTS — S10 (2026-11-27, bim-ootb `feat/pdf-p0-reader`, PR #3470)
Command: `SREAD_MUTANTS=1 node pdf/tests/witness_sheet_reader.js` (pdf.js 3.11.174 in node; oracle = `pdf/corpus/trial_balance_th.cells.json`).
```
§SHEET_READER verdict=ADDS_UP ok=true page=1 items=152 lines=27 cols=6 cells=144 blankRows=3 boxesTrimmed=18 collisions=0 checks=5
§SREAD-R1 PASS 4/4 · R2 PASS 4/4 · R3 PASS 7/7 · R4 PASS 4/4 · R5 PASS 2/2 · R6 PASS 3/3 · R7 PASS 3/3 · R8 PASS 1/1
§SREAD-MUTANTS killed=5/5  (blank rows dropped→R1, brackets not negative→R2, sums not compared→R3, boxes shifted a row→R4, column dropped on write→R6)
§SREAD-COST items=152 lines=27 cells=144 readMs=5 pdfBytes=74945 heapMB=16
§SREAD-VERDICT PASS judged=29 failed=0
```
- R1: 144 of 144 oracle cells at the SAME address with the same text, no extra cell, blank rows 4/27/29 kept.
- R3: total row 28 found by arithmetic, `D28 = SUM(D6:D26) = 40,392.44 = E28`; row rule `F = C + D - E` on 21 of 21 rows. One printed
  digit changed (D10 498.09 → 499.09): `verdict=DOES_NOT_ADD_UP reason="D28: printed 40392.44 != rows sum 40393.44"`.
- R4: 188 poppler word centres, each inside exactly one cell box whose text holds the word; every one of the 144 boxes holds a word.
- R6: the `.xlsx` re-reads to the same 144 cells; the four totals carry `SUM` formulas; the hidden sheet `_door_source` lists cell, page, box.
- R7: the read sheet is one S9 genesis entry the kernel's own `verifyJournal` accepts; one later edit = one `CELL_SET`. No adapter.

**Findings (each from a failing check):**
1. **A tall title's box reached into the row under it** (R4 first run FAIL: the centres of `บริษัท`, `:` and `GardenWorld` lay in two
   boxes; A2 and B2 held no word of their own). Font boxes of neighbouring lines really overlap (poppler's do too). Fixed in the
   engine: where two neighbouring lines' boxes overlap, both stop at the middle of the overlap (`boxesTrimmed=18` on this file).
   This matters for step (2): a write-back into an overlapping box would have painted over the neighbour.
2. **The report PDF engine is not on `main`** (§7.1): the trial balance PDF had to be made from bim-compiler `origin/ninja-xtab2`.
   Not fixed here; it is the missing half of "print it back in a new layout" in the ▶▶ block.

**Not yet (stated, not hidden):** ONE layout is proven (denominator 1 of 1). The cell-gap and pitch rules (§7.2 items 2 and 4) are
measured on this file only; a second and third report layout must be judged before any general claim. No multi-page table, no
scan. `Read as sheet` reads the page on screen, one page at a time. The witnesses are not wired into CI (same as S1 and S9).

### 7.5 More layouts (2026-11-27, bim-ootb `feat/reader-more-layouts`, PR #3472)
**How this was done (stated plainly):** four more PDFs were made with the same report engine and judged against the sheets that
printed them BEFORE any rule changed. The failures below are the spec for the changes; each change is held by a check and a mutant.

| Layout (corpus file) | First run, §7.2 rules as built | Cause |
|---|---|---|
| Sales register, 1,444 rows (not in git, 1.1 MB) | 4,331 of 5,777 cells at their address | the customer header stands to the right of every customer name: its own column band, 5 columns for a 4-column sheet |
| Sales register, 1 row (`sales_register_th.pdf`) | "no table" | only 2 lines hold 3+ cells; row pitch taken from too few gaps; a total over ONE row not tried |
| Cross-tab (`crosstab.pdf`) | "no table" | 2 table lines; signed figures in 2-cell columns not typed as numbers |
| Geometry fixture (`geometry_fixture.pdf`) | "no table" | cells 3.5 pt apart at 9 pt merged into one |
| Showcase (`showcase.pdf`) | 1 of 41 | merged, centred and wrapped cells; an empty first column |

**Rules added to §7.2** (same numbering): (2b) inside a cell, a gap of 0.35 of the font height or more where the next run starts on,
or the last run ends on, a cell edge that ANOTHER line shows → the cell is split there. (3) a table is 2 or more lines of 3+ cells;
when there are more bands than any line has cells, the band the fewest lines use joins the neighbour it never shares a line with.
(4) row pitch = the gap two or more neighbouring table lines agree on; with fewer, the smallest gap beside a table line.
(5) a column is typed from ALL its cells (shared right edge or centre); outside a number column only a figure printed AS a figure
(decimals, separators, sign, brackets) is a number, bare digits stay a code. (6) a total over one row is tried.

**Claim R9 LAYOUTS** (issue: one layout passes, the next silently breaks):
```
§SREAD-LAYOUT file=sales_register_th cells=17 sameAddressAndText=16 differsAsThePdfItselfReads=1 extra=0 cols=4 bandsMerged=2 verdict=ADDS_UP
§SREAD-LAYOUT file=crosstab cells=12 sameOrder=12 sameAddress=1 read=12 verdict=INCONCLUSIVE
§SREAD-LIMIT file=showcase (merged, centred, wrapped cells) cells=41 sameOrder=7 sameAddress=1 read=36 collisions=6 verdict=INCONCLUSIVE
§SREAD-LIMIT file=geometry_fixture (columns that nearly touch, a merged cell, a wrapped cell) cells=18 sameOrder=14 sameAddress=12 read=19 edgeSplits=2 verdict=INCONCLUSIVE
§SREAD-R9 verdict=PASS judged=8 failed=0
§SREAD-MUTANTS killed=7/7   (+ M6 apart header not joined→R9, M7 touching columns not split→R9)
§SREAD-VERDICT PASS judged=37 failed=0          (trial balance unchanged: 144 of 144, R1-R8 as §7.4)
```
- **Denominator: 3 of 5 layouts rebuilt.** Trial balance: same address, 144 of 144. Sales register: same address 17 of 17, total
  `D8 = SUM(D6:D6) = 228.85`. Cross-tab: same ORDER 12 of 12, `-1,023.98` and `-633.41` read as numbers, verdict INCONCLUSIVE (it has no total).
- The 1,444-row register (measured this session, file not in git): 5,776 of 5,777 at their address, `D1448 = SUM` agrees, read in 83-145 ms.
- **Two LIMIT layouts are measured, not passed** (a floor check only stops them getting worse unseen; neither is reported as ADDS_UP).

**Findings:**
1. **The PDF carries one Thai word differently from the sheet:** the sheet's `จำนวน` is in the PDF as `จำานวน` (an extra `า` after
   SARA AM). poppler reads the same, so it is the PDF maker (`ninja_pdf.js` / PDFKit text mapping), not the reader. Counted as "differs as
   the PDF itself reads", never hidden. A defect to fix where that engine lives (`origin/ninja-xtab2`).
2. **An empty sheet column leaves no trace on the page** (cross-tab column B): cells to its right shift one column. Order is kept;
   the address is not recoverable from text alone.
3. **Witness slip caught by its own check:** `crosstab-minus` first FAILED: a 2-cell column (header + figure) cannot be typed by
   alignment. Fixed by rule (5) above.

**Not yet / Next:** merged, centred and wrapped cells (showcase 7 of 41 in order) and overflowing text beside touching columns (a
204-column stress sheet: 585 of 796) need more than text positions. The page's own **ruling lines and cell fills** are the missing
evidence (`modeller/pdf2dxf/pdf_reader.js` already reads paths); that is the next reader step, with these two files as its denominator.
