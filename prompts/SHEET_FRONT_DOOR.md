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
And the positioning: *"it is like ERP in Excel format, without some baggage of a serious multi user performance yet. This is a good back
door entry to the ERP when user choses"* — stage 1 makes no multi-user or performance claim; crossing to the ERP is the user's own choice.
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
- **Build order step (2) DONE (witness) 2026-11-27 — numbers-only PDF write-back** (bim-ootb #3477, #3478): a number changed in the
  Read-as-sheet grid is rewritten in the same PDF, in its own box; "Download PDF" hands it back; one S9 entry per rewrite.
  W-PDF-WRITE 67 checks PASS, mutants 6/6; page 22 PASS — `PDF_EDITOR.md` §4.3/§4.4. Limit: a digit the embedded font lacks is refused
  or written in the family's regular face, said in words.
- **Build order step (3) S3 Excel menu BUILT on a stand-in host 2026-11-27** (bim-ootb #3475, §8): File it / Stamp / Cell history /
  Check history; W-SHEET-ADDIN 59 checks PASS, mutants 11/11. **REAL EXCEL NOT RUN. "File it" is NOT-WIRED in the real pane:**
  `erp/ws_kernel.js` is node-only (reads files from disk), so the filing path has no browser runner yet (§8.3 finding 1).
- **Reader fix 2026-11-27 (bim-ootb #3479, §7.6):** a row left stale after a consistent column edit is now NAMED, not passed over.
- **Films (owner 2026-11-27):** `prompts/FILM_KILLER_FRONT_DOOR.md`. Film 1 "PDF and Excel are killer apps / So we open it up" = stage 1,
  English; Film 2 = the filed document in the real kernel ERP window, its books and a report ("ERP is now a utility...").
- **Next, in this order:** (a) **S3b: a browser runner for the filing path** so "File it" works in the pane and from a page — it is also
  what Film 2 needs; (b) run the add-in in REAL Excel (sideload) and record what differs from the stand-in; (c) reader: ruling lines
  and fills as grid evidence (§7.5 "Next"); (d) merge the report PDF engine from `origin/ninja-xtab2` / `feat/ninja-template-pill`
  (the "new layout" OUT, and the Thai SARA AM defect §7.5); (e) S4 WPS, S5 LibreOffice on the same shim. Open decision for the owner:
  where a PDF's history is kept (today it lives in the page's memory only, nothing travels with the downloaded file).

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

### 7.6 A stale row is named (2026-11-27, bim-ootb `fix/reader-row-rule-names-the-row`, PR #3479)
**Found by the write-back slice** (`PDF_EDITOR.md` §4.4 finding 2), a FALSE PASS: debit D10 and its total D28 changed together, the
row's closing balance F10 left as printed → the four sums agree, the row rule F = C + D - E fails on one row, and §7.2 item 6 ("holds
on EVERY row") made the reader stop reporting the rule: verdict ADDS_UP.
**Rule changed (§7.2 item 6):** a row rule may fail on a few rows and still be the rule (one row in a block of 5 or more, at most 5%);
each failing row is a check of its own (`ROWCELL`, cell, printed, computed, ok=false) and the verdict is DOES_NOT_ADD_UP.
```
§SHEET_READER verdict=DOES_NOT_ADD_UP ... reason="F10: printed 1018.16 != F = C + D - E gives 1019.16"
§SREAD-CHECK case=R3 key=stale-row OK   (rule still reported on 20 of 21 rows; D28's own SUM check ok)
§SREAD-MUTANTS killed=8/8  (+ M8 stale row passed over→R3)      §SREAD-VERDICT PASS judged=38 failed=0
§PDFWR-VERDICT PASS judged=67 failed=0 (mutants 6/6) · §PDFWP-VERDICT PASS judged=22 failed=0
```
Six write-back checks had RECORDED the false verdict (W1, W10, W11, page total / download / re-read); they now expect F10 named.

## 8. Slice S3 — the Excel menu (spec 2026-11-27, before code)
Build-order step (3). Code: bim-ootb `erp/sheet_addin/` (`host_shim.js`, `excel_host.js`, `taskpane.html`, `taskpane.js`, `manifest.xml`) + a small pure
`SheetDoor.tagCells(tpl)` added to `erp/sheet_door.js` (the engine owns which cells it reads; the menu must not guess). Witness
`erp/tests/witness_sheet_addin.js` (W-SHEET-ADDIN). §1 stands: the menu does three things only (read the tagged cells, apply `writes`, show the verdict).

### 8.1 Design
- **Host interface** (what a host must give the shim; all async): `readCells(sheet, addrs) -> {addr: value}` · `writeCells(sheet, [{cell,value}])` ·
  `readSheetValues(sheet) -> {addr:{v,f}}` (used range, snapshots) · `getHidden(name) -> rows` · `setHidden(name, rows)` (rows = arrays of strings; creates the
  sheet very-hidden) · `userName()`. Three additions the actions need, stated: `activeSheet()`, `visibleSheets()`, `selectedCell() -> {sheet, cell}`.
  A WPS / LibreOffice / Sheets host (S4, S5) implements the same interface; the shim does not change.
- **Shim** (`host_shim.js`, UMD): four actions. **File it** = read `_door_tags` (row 1, chunks joined) -> `SheetDoor.tagCells` -> `readCells` of exactly those ->
  `runner.file(tpl, cells, ledgerLines)` -> append the returned signed journal entry as ONE ROW of `_door_ledger` -> `writeCells` of the engine's `writes` only ->
  verdict text. **Stamp** = snapshot every visible sheet -> `SheetHistory.record` -> append one row of `_door_history`. **History of this cell** = the cell's story.
  **Check history** = `SheetHistory.verify` over `_door_history` AND `_door_ledger` (the kernel journal and the sheet history share one entry format, §6.2, so one
  verifier reads both). No invoice vocabulary and no cell address in the shim; a new layout is a new `_door_tags` entry.
- **The runner** is injected: `runner.file(tpl, cells, ledgerLines) -> { result, ledgerLine }` = "one Trx through the kernel, commit, hand back the journal entry".
  In node it is `ws_kernel.inTrx` over `SheetDoor.file` (what S1 D9 does). **Finding already known before code:** `ws_kernel.js` is node-only (`fs`, `require`);
  no browser build of the signed journal exists (the page commits through `erp_kernel` `commitGroup`, another format). So the task pane cannot run File it yet:
  it says so in plain words when no runner is present. Stamp / History / Check need no kernel (WebCrypto only) and work in the pane. Browser runner = slice S3b.
- **Cell limit (§6.4):** an Excel cell holds at most 32,767 characters. Every `_door_*` row is ONE journal entry; it is cut into chunks of at most 32,767 UTF-16
  units across columns, never between the two halves of a surrogate pair, and re-joined on read. Applies to `_door_ledger` too (a filing entry holds the books' rows).
- **Excel layer** (`excel_host.js`, Office.js, `Excel.run`): ranges are loaded before read; hidden sheets use `visibility = "VeryHidden"` (ExcelApi 1.2 to set);
  hidden rows are written with number format `@` first so a chunk that looks like a number or starts with `=` stays text; engine input: a date-formatted number
  cell is turned into an ISO day (Excel hands out serials), a number is rounded to Excel's own 15 significant digits (a formula's float noise must not reach the
  books); a written text that starts with `=` gets a leading apostrophe. Who = the name kept in the workbook settings (ExcelApi 1.4) — Office.js has no user-identity
  call without sign-in; stated, not claimed (§6.2).
- **Office.js names used (checked on Microsoft Learn 2026-11-27):** `Excel.run`; `workbook.worksheets` `.getItem` / `.getItemOrNullObject` (1.4) / `.add` / `.getActiveWorksheet`
  / `.load("items/name,items/visibility")`; `worksheet.visibility` (read 1.1, set 1.2; values Visible | Hidden | VeryHidden), `.getRange`, `.getRangeByIndexes`,
  `.getUsedRangeOrNullObject(valuesOnly)` (1.4); `range.address / values / formulas / numberFormat / rowIndex / columnIndex / rowCount / columnCount` (1.1), `range.clear()`;
  `workbook.getSelectedRange()` (1.1, throws on a multi-area selection); `workbook.settings.getItemOrNullObject / add` (1.4). Pages: learn.microsoft.com
  /javascript/api/excel/excel.worksheet, .workbook, .worksheetcollection, .range; /office/dev/add-ins/develop/create-addin-commands (manifest).
- **Manifest** (add-in only XML, VersionOverridesV1_0): one custom ribbon tab "Sheet Door", four buttons (File it, Stamp, Cell history, Check history), each
  `ShowTaskpane` to `https://red1oon.github.io/bim-ootb/erp/sheet_addin/taskpane.html?action=<id>`; the pane also carries the four buttons, so a second click needs no reload.
  Not yet verified on a real Excel (§8.3).

### 8.2 Claims (W-SHEET-ADDIN; verdict line `§SADDIN-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`; fake host = in-memory workbook that RECORDS every read and write)
| ID | Claim | Issue it exposes | Falsifier (mutant) |
|----|-------|------------------|--------------------|
| A1 READSET | File it reads on the visible sheet exactly the cells the template names (header: partner, date, docno, subtotal, grandtotal; lines: product, description, qty, price, amount x rows from..to; set built in the witness, not by `tagCells`); a decoy in every neighbour cell is never read; no used-range read | the menu reads more than it was told (privacy, layout creep) | M1 shim reads the whole sheet |
| A2 WRITESET | The writes applied == the engine's `writes` == {docno, status}; the whole workbook, compared cell by cell before and after, differs in exactly those cells | the menu writes outside its tags | M2 shim writes one extra cell |
| A3 EQUIV | Fingerprint (C_Invoice + lines + Fact_Acct, ids stripped) of the invoice filed through the shim == the engine called directly on the same cell values; `host_shim.js` holds no invoice word and no cell address | invoice logic (or a layout) hides in the menu (twin breach) | M6 shim rounds numeric cells |
| A4 REFUSED | Subtotal wrong: writes only the status cell ("Not filed: ..."), `_door_ledger` gains NO line, the kernel journal is unchanged | a refused sheet leaves a ledger trace or a docno | M4 ledger line added on refusal |
| A5 LEDGER | One filing = exactly one ledger row; it verifies (`SheetHistory.verify` and `ws_kernel.verifyJournal`); replays into a fresh kernel to the same fingerprint; one edited chunk is refused by Check history and by replay; after "reopen" (fresh kernel + replay of the ledger) a second filing chains: 2 rows verify, replay gives both invoices | the workbook cannot rebuild its books, or cannot be trusted to | M4 |
| A6 STAMP | An entry longer than 32,767 characters is split: every stored cell <= 32,767, re-joined it equals the entry byte for byte (an astral character at a cut point survives) and passes `ws_kernel.verifyJournal`; a second Stamp with no change is NO-OP and writes nothing; one edit then Stamp = one new row with exactly one CELL_SET; Stamp on a tampered history refuses and writes nothing | a long entry is truncated silently (Excel), a no-change Stamp grows the file, a broken history keeps growing | M3 no split; M5 NO-OP still writes |
| A7 STORY/CHECK | History of this cell lists every value with who and when; Check history: intact -> OK (history and ledger), one changed character in the LAST chunk of a split entry -> not OK, names the entry | the per-cell story is incomplete; tamper in a split entry slips through | — |
| A8 EXCEL | The same shim through `excel_host.js` on a fake Office.js (loaded-before-read enforced, writes queued until `sync`) gives the same verdict, same writes, same fingerprint as through the plain fake host; hidden sheets are VeryHidden; a date serial reaches the engine as its ISO day; 123.50000000000001 reaches it as 123.5; a text `=x` is written as text; no stored cell > 32,767 | the Excel layer adds, loses or reformats something | M7 hidden sheet left visible; M8 date conversion dropped |
| A9 MANIFEST | `manifest.xml` parses as XML (independent parser: python3 `xml.etree`); its ribbon action ids == the action ids in the code (both ways); every resid resolves; SourceLocation under the stated https URL; ids unique | a button that does nothing, or code no button reaches | M9 one action renamed in the manifest |
| A10 VACUOUS | No `_door_tags` sheet -> File it INCONCLUSIVE, no visible cell read, nothing written; Stamp on a workbook with no cells -> INCONCLUSIVE, nothing written | an empty workbook "passes" | — |

Not claimed (stated up front): real Excel (none on this machine; the witness proves the contract against a FAKE host and a FAKE Office.js written from Microsoft's
public API pages); Office on the IE11 engine (cannot run it, §1); the ribbon rendering and the `?action=` hand-over; a browser runner for File it (S3b); multi-user
co-authoring; sheet protection (a user can unhide a very-hidden sheet through the VBA editor, tampering is detected by the chain, not prevented).

### 8.3 RESULTS — S3 (2026-11-27, bim-ootb `feat/sheet-addin-excel`, PR #3475)
Command: `SADDIN_MUTANTS=1 node erp/tests/witness_sheet_addin.js` (GardenWorld seed via `ws_kernel.load`, one fresh kernel per scenario; a FAKE workbook that records
every cell read and write; a FAKE Office.js over the same workbook, written from the Microsoft pages named in §8.1, strict about load-before-read and about
queued writes). **REAL EXCEL WAS NOT RUN (no Excel on this machine). This proves the contract on a fake host only.**
```
§SADDIN-ORACLE direct ok=true verdict=FILED grandtotal=153.5 fingerprintBytes=660
§SADDIN-A1 PASS 5/5 · A2 PASS 4/4 · A3 PASS 2/2 · A4 PASS 3/3 · A5 PASS 8/8 · A6 PASS 7/7 · A7 PASS 7/7 · A8 PASS 14/14 · A9 PASS 7/7 · A10 PASS 2/2
§SADDIN-COST ledgerRowChars=11596 chunks=1 (one filing of 2 lines)
§SADDIN-COST stampGenesisChars=90979 cells=453 chunks=3 maxStoredCell=32767 bytesPerCell=201
§SADDIN-MUTANTS killed=11/11  (reads whole sheet→A1, extra cell written→A2, no split→A6, ledger line on refusal→A4, no-op stamp writes→A6, shim rounds numbers→A3,
   hidden sheet visible→A8, date conversion dropped→A8, ribbon action renamed→A9, Check skips ledger→A5, story first only→A7)
§SADDIN-VERDICT PASS judged=59 failed=0 (fake host + fake Office.js only; real Excel NOT run)
```
- A1/A2: the visible-sheet read set is exactly the 60 template cells (each read once, no decoy, no used-range read); the writes are exactly {F2, G24}; a cell-by-cell
  diff of the whole workbook shows only G24 changed. A3: fingerprint of the invoice filed through the shim == the engine called directly; `host_shim.js` (comments
  stripped) holds no invoice word and no cell address. A4: a wrong subtotal writes only the status cell, adds no ledger row, the kernel journal does not move.
- A5: one filing = one ledger row, verified by `SheetHistory.verify` AND `ws_kernel.verifyJournal`, replayed into a fresh kernel to the same books; "reopen" (fresh kernel
  replays the ledger, user changes the docno, files again) chains: 2 rows, seq 1 then 2, row 2 prev == row 1 hash, both replay; one edited field is caught by Check
  history (entry 1, payload) and refused by the kernel replay (digest).
- A6/A7: a 90,979-character history entry (453 cells, 201 bytes per cell) is stored as 3 chunks, none over 32,767, re-joined byte for byte (emoji cells included), accepted
  by `ws_kernel.verifyJournal`; a second Stamp is NO-OP with zero writes; one edit = one row with one CELL_SET; a one-character edit in the LAST chunk of the split entry
  is caught, and a broken history refuses Stamp and shows no story. A8: the same filing through `excel_host.js` on the fake Office.js gives the same writes, the same
  fingerprint, the same read set; the date arrives as a serial and is converted; 123.50000000000001 reaches the engine as 123.5; hidden sheets are VeryHidden and text-formatted.
- A9: `manifest.xml` parses with an independent parser (python3 `xml.etree`); 4 ShowTaskpane buttons whose action ids equal `SheetAddin.ACTIONS` both ways and each has its
  button in `taskpane.html` and a function in the shim; every resid resolves; ids unique; every URL https under the site.

**Findings (each from a failing check or a measurement):**
1. **No browser kernel for File it.** `ws_kernel.js` is node-only (`fs`, `require`); the signed journal exists nowhere in the browser (the page commits through
   `erp_kernel` `commitGroup`, another entry format). So the task pane cannot run File it today; it reports "books engine not loaded" in plain words (verdict `NOT-WIRED`).
   Stamp, Cell history and Check history need only WebCrypto and work in the pane. **Slice S3b = a browser runner** (`runner.file(tpl, cells, ledgerLines)`): load the
   ERP engine scripts + sql.js + `ad_seed.db` in the pane and give it the same one-Trx commit + journal entry. The shim and the Excel layer do not change.
2. **Excel hands out numbers, not the printed text.** A subtotal cell holding 153.5 reaches the engine as `153.5`, so the refusal text says "153.5 but the subtotal prints
   153.51", not "153.50" (S1's string cells did). The comparison is unchanged (exact decimals, trailing zeros irrelevant); only the wording loses a trailing zero. First run
   of A4 FAILed on exactly this expectation; the claim now names 153.5.
3. **Four things the Excel layer must do that the engine cannot know:** a date cell is a serial (converted by its date number format; M8 kills the version without it), a
   formula's float noise is cut to Excel's own 15 significant digits, hidden chunks are written text-formatted first (a digit-only or `=`-leading chunk would otherwise be
   coerced), and a written text that starts with `=` gets an apostrophe. Each is witnessed against a fake that coerces the way Excel does; none against real Excel.
4. **Witness defect found by its own mutant run:** a mutant whose damage cascaded into another case made a check THROW there; the first sweep counted that as a kill
   (M3). The sweep now counts a throw in the named case as CRASHED, not a kill, and a later check in a case reads the state defensively.
5. **A cell limit costs rows, not just cells:** one filing of two lines is already 11,596 characters of ledger; a 40-line invoice will pass 32,767 and splits across
   columns, which is why the ledger uses the same row-of-chunks writer as the history.
6. **Manifest governance:** the task pane's script tags made `erp/sheet_addin/taskpane.html` an owned erp page, so CI's W-MANIFEST-ROUNDTRIP (C10) failed on the first push
   (309 modules listed, 315 read). The page is now registered in `erp/modules.json` (6 modules + 1 page, all `precache:false`, marker pair + `?v=` codes written by
   `gen_manifest.js --write erp`); `sw.js` and `idempiere.html` are untouched (the tool's CACHE_VERSION step was reverted, nothing precaches these files). Any edit to those
   five scripts needs `node scripts/gen_manifest.js --write erp` again for the `?v=` codes. `--write` also showed two unrelated `uses` drifts in the list; not touched.

**Not yet (stated, not hidden):** real Excel (desktop Windows/Mac, Excel on the web); the ribbon rendering and whether the four buttons sharing one `TaskpaneId` re-navigate the
pane to the clicked `?action=` (the in-pane buttons cover it); the SourceLocation is not yet deployed (nothing is served from `https://red1oon.github.io/bim-ootb/erp/sheet_addin/`
until the next docs/site deploy; no sideload was attempted); a browser runner for File it (S3b, finding 1); who = a name typed in the pane and kept in the workbook settings
(Office.js has no user identity without sign-in); Stamp is on demand only (no save/close trigger yet: Excel `onChanged` events could record more often); a very large sheet's
Stamp reads the whole used range once (cost measured only at 453 cells); WPS / LibreOffice / Google Sheets hosts (S4, S5) implement the same host interface; the old-Office
IE11 limit stands (§1, stated in the pane); the witnesses are not wired into CI (same as S1, S9, S10).

## 9. Slice S3b — a browser runner for the filing path (spec 2026-11-27, before code)
"Next (a)" of the ▶▶ block and §8.3 finding 1. Code: bim-ootb `erp/ws_kernel.js` (restructured, ONE implementation), `erp/ws_kernel_web.js` (the browser shell),
`erp/sheet_addin/runner.js`, `erp/sheet_addin/xlsx_host.js`, `erp/sheet_addin/file_it.html` + `file_it.js`, `taskpane.html` / `taskpane.js` (wired).
Witness `erp/tests/witness_file_it.js` (W-FILE-IT). Laws that bind it: TWIN (same books as the node kernel), AD-LAYER rule 5 (one kernel, one journal
format, no per-window code), DB policy (no binary; `ad_seed.db` is the file the ERP page already serves), PERF BUDGET (boot ms, heap, bytes logged).

### 9.1 Measured before the design (2026-11-27)
- What makes `ws_kernel.js` node-only is its SHELL, not its logic: `fs` (seed, patch, the `processes/` folder), `require(...)` of sql.js and of its modules,
  node `crypto` (`createHash('sha256')`, `randomUUID`), `os`, `Date.now`. `build(db)` itself is plain JS over a sql.js database.
- A require trace of ONE filing through the node kernel (seed boot + `SheetDoor.file` + Import Invoice + complete + post): **44 files** of `erp/` are loaded when the
  only process is `processes/ImportInvoice.js` (108 with every process). Every one of the 44 is already UMD and already loaded by `erp/idempiere.html` as a script tag.
- The journal hash is computed synchronously inside `commit` (`journalOf`). WebCrypto is async only; making `commit` async would change every caller of the kernel
  (`ws_server`, `ws_adinterface`, 70+ witnesses). So the browser shell brings a synchronous SHA-256 (plain JS); the kernel keeps ONE code path and calls the shell.
- The ERP page uses its own sql.js build (`erp/lib/sql-wasm-fts5.js`); node witnesses use `tests/node_modules/sql.js`. Two SQLite builds: parity must be measured, not assumed.

### 9.2 Design
- **One kernel, two thin shells.** `ws_kernel.js` becomes UMD. Everything it did through node (`require`, `fs`, `crypto`, clock) goes through a SHELL object with
  the same few calls on both sides: `need(name)` (a module's API), `load(names)` / `processes()` (side-effect modules), `sha256(text)`, `uuid()`, `nowMs()`, `perfMs()`,
  and for the boot `sqljs()`, `seed()`, `patch()`, `extra(files)`. The node shell (inside `ws_kernel.js`) is today's `require` / `fs` / `crypto` lines moved, nothing
  else. The browser shell (`ws_kernel_web.js`) fetches `ad_seed.db` + `patches/ad_seed.db.sql`, loads the kernel's scripts from ONE ordered list (the 44 files, in the
  ERP page's own order, added lazily so a page that never files pays nothing), and gives the sync SHA-256. `load()`, `build(db)`, `commit`, `journalOf`, `replay`,
  `verifyJournal` are the SAME lines for both. No second kernel, no second journal format. `K.shell(over)` lets a witness fix the clock and the ids (both sides).
- **Shard, not the whole (owner ruling):** the browser gets the kernel's own model list and exactly ONE process (Import Invoice). No ERP window, no `erp_kernel`,
  no service worker change, `idempiere.html` untouched.
- **The runner** (`runner.js`, UMD, node + browser): `file(tpl, cells, ledgerLines) -> { result, ledgerLine, facts }` = one `kernel.inTrx` over `SheetDoor.file`
  (what S1 D9 and S3 A5 do in their witnesses). The workbook is the book: when the workbook's ledger is not the journal of the kernel in memory, a fresh kernel is
  booted and the ledger replayed first. `facts` = the filed document read back from the kernel DB (never from the sheet): DocumentNo, status, date, partner name,
  lines (product name, qty, price, net), totals, and the accounting entries (`Fact_Acct` rows: account, debit, credit). Session = the GardenWorld demo login the
  S1/S3 witnesses use (client 11, org 11, user 100, role 102); choosing a tenant/login is not in this slice.
- **`file_it.html`** (no Excel): the user opens their own `.xlsx` (File API; SheetJS `erp/xlsx.mini.min.js`); `xlsx_host.js` is the S3 HOST INTERFACE over that
  workbook in memory, so the SAME `host_shim.js` File it runs (read tagged cells, append the ledger row, apply `writes`); the page shows the verdict in plain words,
  the document and its books, and hands the workbook back as a download. Nothing is uploaded: the only requests are the page's own files. A "sample invoice"
  button builds a tagged workbook in the browser (the S1 witness invoice), since S7 "Mark my invoice" is not built.
- **Task pane:** `taskpane.js` makes the same runner (lazy: the engine and the 27 MB seed load on the first File it, not on Stamp); the NOT-WIRED text goes.

### 9.3 Claims (W-FILE-IT; headless Chromium on the real `file_it.html` over a local static server, real file chooser; verdict line
`§FILEIT-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`; INCONCLUSIVE when nothing was judged; a mutant that crashes is not a kill)
| ID | Claim | Issue it exposes | Falsifier (mutant) |
|----|-------|------------------|--------------------|
| F1 PARITY | The same workbook filed (a) in node through `runner.js` + the node kernel and (b) in the browser page gives the same verdict, the same writes and the same C_Invoice + lines + Fact_Acct fingerprint (ids stripped), and both equal the S1 oracle path (rows straight into I_Invoice + AD_Process 207) | the browser kernel is a different kernel (twin breach) | M6 date conversion dropped in the workbook host |
| F2 CROSS | The browser's ledger line verifies in node (`verifyJournal`) and replays into a fresh node kernel to the same fingerprint; the node line verifies in the browser and replays into a fresh browser kernel to the same fingerprint | two journal formats / two hashes | M1 browser SHA-256 differs |
| F3 SAME BYTES | With the shell's clock and ids fixed to the same values on both sides, the journal line of the same filing is the SAME STRING in node and in the browser; the browser's SHA-256 equals node `crypto` on the line's own hashed texts and on test strings (empty, ASCII, astral, 1 MB) | hashing or serialising differs by host | M1 |
| F4 REFUSED | A workbook whose subtotal is 0.01 high: the page shows "Not filed" with BOTH numbers; no document block; the kernel journal is empty; no C_Invoice; the offered workbook has NO `_door_ledger` row and only the status cell differs | a refused sheet leaves a ledger trace | M2 ledger line on refusal |
| F5 BOOKS | The document and books on screen are read from the page's DB: every shown entry row equals an independent SQL read of `Fact_Acct` in the page's DB (witness's own query), debits = credits > 0, the shown rows equal the node kernel's; the page shows the partner NAME and product NAMES (the sheet holds search keys) and the price the price list gave for a line whose price cell is blank | figures echoed from the sheet pass as "the books" | M3 document echoed from the sheet |
| F6 DOWNLOAD | The downloaded workbook re-read in node: exactly ONE new `_door_ledger` row that verifies and replays to the same fingerprint; docno + status cells written; every other cell of the visible sheet has the same value and formula; `_door_*` sheets very hidden. Reopened in a reloaded page with a new docno: 2 rows, chained, both replay. A different workbook opened after it starts its OWN chain (seq 1) | the workbook cannot rebuild its books; one workbook's chain leaks into another | M4 ledger not replayed on reopen; M5 one extra cell written; M7 kernel kept across workbooks |
| F7 OFFLINE | After the engine has booted, with the network OFF a filing still succeeds and no request is attempted. A page RELOAD offline is measured and reported, not claimed | "nothing is uploaded" / works offline is unproven | — |
| F8 COST | `§KRN-BROWSER-COST` scripts, bytes fetched, boot ms (fetch / seed+patch / build), file ms, JS heap MB | unmeasured weight (PERF BUDGET) | — |
| F9 VACUOUS | A workbook with no `_door_tags` → INCONCLUSIVE in plain words, nothing filed, no download offered | an untagged workbook "passes" | — |
| F10 PANE | In the real `taskpane.html` (Office.js request answered by a stub that only makes the page boot) the pane's own runner files the same cells: verdict FILED, same fingerprint; File it through the shim is no longer NOT-WIRED | the pane wiring is claimed, not run | M8 pane runner not created |
| F11 OLD WITNESSES | W-SHEET-DOOR (21), W-SHEET-ADDIN (59), W-SHEET-HISTORY (20) pass unchanged on the restructured kernel, and a named set of the existing `ws_kernel` witnesses gives the same verdict lines before and after | the restructure broke the node kernel | — |

Not claimed (stated up front): real Excel (the pane is run in Chromium with an Office.js stub; the Excel layer itself was proven only on S3's fake Office.js);
any tenant other than the GardenWorld demo seed; multi-user; a page reload offline; the workbook's cell STYLES surviving the download (SheetJS community build
writes values, formulas and number formats, not fonts / fills / widths — measured and reported in 9.x, not hidden).

### 9.4 Owner addition 2026-11-27: the filed document in the REAL ERP window (claim F12, specced before any code)
Owner: *"yes, show the document in the real ERP window too."* After a sheet is filed from `file_it.html`, the SAME invoice must open in the real ERP page
(`erp/idempiere.html`, its own Invoice window, through the generic AD engine, no per-window code) with its posting visible.

| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| F12 ERP WINDOW | After File it in `file_it.html`, the real `idempiere.html` (GardenWorld login) holds the same invoice: DocumentNo, grand total and the `Fact_Acct` rows read in the ERP page's DB equal those of the filing (and of the oracle), and the Invoice window's grid shows that row (grid rows + the record id per row, the AD-LAYER way); a reload keeps exactly one copy; a tampered ledger line is refused and nothing is added | the "document in the books" exists only inside the filing page | ledger applied twice; a tampered line accepted; the row in the DB but absent from the grid |

**Design to be built (ONE implementation):** the workbook's `_door_ledger` line is the hand-over. The ERP page takes the line(s) and runs the kernel's own
`verifyJournal` + `replay` on its database: no second apply, no second format. Rejected: writing the filing page's whole database over the ERP page's resident
cache (it would wipe what the user has in the ERP); feeding the ops through the page's op log (`crud_overlay` `applyOpGroup` + `commitGroup`: another entry
format and another id law, negative ids; the ledger's own record ids and its `Fact_Acct.Record_ID` links would not survive).
**Gate (coordinator's rule for this slice):** build it here only if `idempiere.html` needs no more than a minimal hook; otherwise specify the next slice exactly.

### 9.5 RESULTS — S3b (2026-11-27, bim-ootb `feat/file-it-browser`, PR #3483, merged `f2b4587a`)
Command: `env -u DBUS_SESSION_BUS_ADDRESS FILEIT_MUTANTS=1 node erp/tests/witness_file_it.js` (headless Chromium, puppeteer 24, on the REAL `erp/sheet_addin/file_it.html`
served by a local static server from the tree; real file chooser, real download; node side = the same `runner.js` over the node kernel).
**REAL EXCEL WAS NOT RUN.** The task pane was run in Chromium with an Office.js stub that only lets the page boot.
```
§FILEIT-ORACLE direct ok=true invoice={"grandtotal":153.5,"totallines":153.5,"docstatus":"CO"} fingerprintBytes=661
§FILEIT-NODE verdict=FILED text="Filed FILEIT-0001 (CO)" writes=[F2, G24] ledgerLineChars=11594
§FILEIT-F1 PASS 5/5 · F8 PASS 1/1 · F5 PASS 5/5 · F6 PASS 7/7 · F2 PASS 4/4 · F3 PASS 4/4 · F4 PASS 3/3 · F9 PASS 1/1 · F7 PASS 2/2 · F10 PASS 5/5 · F11 PASS 3/3
§KRN-BROWSER-COST scripts=45 kernelFiles=44 requests=58 bytesServed=33679065 seedAndPatchBytes=30440402 scriptsMs=69 bootMs=948 pageReadyMs=1112 fileMs=90 jsHeapMBAfterBoot=125 jsHeapMBAfterFiling=41
§FILEIT-OFFLINE-RELOAD (measured, not a claim) page reloaded with the network off: engine ready=N engineText="(no page)"
§FILEIT-OLD witness_sheet_door.js -> §SDOOR-VERDICT PASS judged=21 failed=0 · witness_sheet_addin.js -> §SADDIN-VERDICT PASS judged=59 failed=0 · witness_sheet_history.js -> §SHIST-VERDICT PASS judged=20 failed=0
§FILEIT-MUTANTS killed=9/9  (browser SHA differs→F3, ledger line on refusal→F4, document echoed from the sheet→F5, ledger not replayed on reopen→F6, one extra cell written→F6,
   date conversion dropped→F1, kernel kept across workbooks→F6, pane runner not created→F10, workbook sent out→F7; every child `threw=0`)
§FILEIT-VERDICT PASS judged=40 failed=0 (headless Chromium on the real page; real Excel NOT run)
```
- **One kernel (AD-LAYER rule 5).** `ws_kernel.js` +38 / −17: its body keeps its lines; `require` inside it is now the shell's module lookup, and `fs` / `crypto` / `Date.now`
  go through the shell. Deleted from the body: the direct `fs`, `path`, `os`, `crypto` use (4 hash calls, 2 uuid calls, the `processes/` folder listing, the seed and patch
  reads); they are the node shell now. No kernel logic was copied: `ws_kernel_web.js` (129 lines) holds fetch, the script list and a SHA-256, nothing else.
- F1/F2: the browser page's C_Invoice + lines + Fact_Acct fingerprint == node == the S1 oracle; each side's ledger line verifies and replays on the other side.
- **F3: with clock and ids fixed, the journal line of the same filing is the SAME 11,594-character string in node and in Chromium** (seq, actor, at, opsDigest, prev, hash and
  every op with its ids, stamps and uuids), across two different SQLite builds (node `sql.js`, the page's `sql-wasm-fts5`). Browser SHA-256 == node `crypto` on 9 texts incl. 1 MB.
- F4: subtotal 153.51 against lines 153.5: "Not filed" with both numbers, no document, journal empty, no `_door_ledger` row, only G24 differs in the workbook handed back.
- F5: the 6 entry rows on screen (two sets of books: 12110 Accounts Receivable debit 153.50 / 41000 Trade Revenue credits 123.50 + 30.00, and the second schema 130.48 /
  104.98 + 25.50) equal the witness's own SQL read of the page DB and the node kernel's rows; debits = credits; the page shows `C&W Construction`, `Oak Tree`, `Elm Tree`
  (the sheet holds `C&W`, `Oak`, `Elm`) and, for a blank price cell, the price-list price read from the DB.
- F6: the downloaded workbook has exactly one ledger row (the page kernel's line), 27 cells compared and only G24 differs, `_door_*` sheets very hidden; reopened in a
  reloaded page with a new number: 2 rows, chained, both replay in node; a different workbook starts its own chain at seq 1.
- F7: engine booted, network off: FILED, zero requests. Over the whole run the server saw only GETs and no request left for another host.
  **A page RELOAD offline does not come back** (no service worker covers these pages; nothing here is precached).
- F10: in the real `taskpane.html` the kernel is not loaded until File it; File it through the shim with the pane's own runner is FILED (not NOT-WIRED), oracle fingerprint.
- **Existing kernel witnesses:** all 67 test files that load `ws_kernel.js` (erp/tests, pdf/tests, capex/tests, devtools) were run on `origin/main` and on this branch;
  65 print the same last verdict line and exit code; the other 2 (`witness_docno`, `witness_help_peek`) timed out on the baseline run under machine load and PASS on the
  branch. 11 of the 67 exit non-zero on BOTH sides with identical lines (not caused here, not investigated). `gen_manifest --check` PASS; eslint clean; CI green.

**Findings (each from a failing check or a measurement):**
1. **Import Invoice has a dependency no `require` shows.** First browser run: `Not filed:` with an empty reason; the page log said `Cannot read properties of undefined
   (reading 'docgen')`. `processes/ImportInvoice.js` reaches `processes/support_docgen.js` through `AdProcess.PSUP.docgen`; node gets it only because the kernel lists the
   whole folder. The browser list is therefore 44 kernel files, not the 43 of the require trace.
2. **Four existing witnesses pin the SPELLING of `ws_kernel.js`** (`require('./ad_import_tables.js').ensure(db)`, `db_export_safe.js').registerCoreUdfs(db, A)`): the first
   restructure (calls renamed to a shell method) turned W-EXPORTSAFE, W-IMPORT-ORDER, W-IMPORT-GLJOURNAL and W-IMPORT-BANKSTATEMENT red. Fixed on my side, not theirs: the
   kernel body keeps `require(...)`, which inside the file is now the shell's lookup. The diff got smaller for it.
3. **Every `build(db)` adds its model-validation save hooks and never removes them** (`ad_modelval.registerValidator` pushes; the hooks close over that kernel's database).
   A later kernel in the same process still runs the earlier kernels' hooks against the earlier database. Found when the runner closed the previous database on opening
   another workbook: the next filing failed with `hook threw: out of memory` (a closed sql.js database). This is in the node kernel too (every witness that boots several
   kernels in one process). NOT fixed here: the runner leaves the earlier database open, so a page that opens K different workbooks holds K databases (~33 MB JS heap each
   before collection, measured 123 → 158 → 190 MB). Fix belongs in the kernel: hooks must read through the transaction in flight, or `build` must own and remove its hooks.
4. **`verifyJournal` in a browser needed a booted kernel** (the shell was installed only by `boot()`); now it is installed when the scripts load. Check F10 `verify-without-boot`.
5. **The task pane must not name the runner at load time:** the manifest tool counted `SheetRunner` / `WsKernelWeb` at top level as two new load-order edges that need an
   owner review; the pane now makes its runner inside its boot function. `--write` again proposed two unrelated `uses` drifts and a `CACHE_VERSION` step; not taken
   (nothing precached changed; `sw.js` and `idempiere.html` untouched). `xlsx.mini.min.js` is now a `boot` module in `erp/modules.json` because a page has it as a script tag.
6. **Three other hand-written SHA-256 copies already exist** (`teams/connectors.js`, `oplogpic/app.js`, `modeller/dxf2bim_import.js`), none exported for reuse; this slice adds
   a fourth in the browser shell (the kernel hashes synchronously, WebCrypto cannot). One shared file is a clean-up candidate.

**Not yet (stated, not hidden):** REAL EXCEL (desktop or web) is still not run; the Excel layer under the pane stands on S3's fake Office.js only. The books are the GardenWorld
demo seed with one fixed login (client 11, GardenAdmin): no tenant or user choice. Cell STYLES are not kept in the downloaded workbook (SheetJS community build writes values,
formulas and number formats; fonts, fills and widths are lost: not measured beyond values and formulas, 27 cells). A page reload offline fails. First load is 33.7 MB
(27.2 MB seed + 3.2 MB patch + scripts) and 125 MB of JS heap at boot; a phone was not tried. The seed is fetched again for each fresh kernel (HTTP cache), not kept in
memory. Stamp / history in `file_it.html` is not offered (File it only). W-FILE-IT is not wired into CI (same as S1, S3, S9).

**Deployed and fetched back (2026-11-27):** `https://red1oon.github.io/bim-ootb/erp/sheet_addin/file_it.html` is byte-identical to the merged file (sha256 `0d78a8c6fa51`);
the JS beside it is the deploy's minified build of the merged files. The live page was then run headless (sample invoice, File it):
```
§FILEIT-LIVE readyMs=2548 verdict=FILED text="Filed. AR Invoice 100001 for C&W Construction is in the books (Completed)." grand=153.5 status=CO
   fact=[[518,153.5,0],[758,0,123.5],[758,0,30],[518,130.48,0],[758,0,104.98],[758,0,25.5]] ledger line verifies; bootMs=1927 bytes=30440402 pageErrors=0
   requests elsewhere or not GET: 1 = the browser's own GET https://red1oon.github.io/favicon.ico
```
The six entries are the oracle's. One live run, not a witness in the tree.

### 9.6 F12 (the document in the real ERP window) — NOT BUILT in this slice; what the next slice needs
Gate result: it cannot be done with a minimal hook in `idempiere.html`. Measured first (probe, not shipped; `§PROBE` lines of this session): a ledger line made by the
node kernel was taken into the REAL `idempiere.html` in headless Chromium through `window.__idmpDb`.
```
§PROBE erp-page before: invoices=20 fact_acct=600 max c_invoice_id=1300109 i_invoice table present; verifyJournal ok entries=1
§PROBE erp-page applied: 12 inserts + 2 updates (c_invoice, c_invoiceline, c_invoicetax, fact_acct, c_bpartner, c_acctschema); 4 i_invoice updates failed in the probe's own apply
§PROBE erp-page after: c_invoice PROBE-1 153.5 CO posted=Y; Fact_Acct 6 rows 153.5/0, 0/123.5, 0/30, 130.48/0, 0/104.98, 0/25.5 == the filing's rows
```
So the data side works: the ERP page's database takes the ledger's rows at the ledger's own ids (1300110 was free) and reads back the same invoice and the same six entries.
The window grid was NOT judged. What stands between this and F12, each a decision or a piece of work the next slice must do:
1. **A replay that does not need `build(db)`.** `replay` lives inside `build`, and `build` on the ERP page's database would add a second set of save hooks to the live page
   (finding 3). The kernel needs a hook-free `replayInto(db, text)` (verify, digest check, apply) factored out of `build`: ONE implementation, used by `build` too.
2. **The hand-over.** Both pages are same-origin: `file_it.html` can leave the ledger lines in browser storage and link to
   `idempiere.html?window=<Invoice window>&record=<C_Invoice_ID>` (the page already has `?window=` / `?record=` deep links, lines 1296-1297, 1595-1599).
3. **The hook in `idempiere.html`:** two script tags (`ws_kernel.js` + the SHA-256), a few lines after the boot overlays (near line 1266), and therefore two `sw.js`
   precache entries and a `CACHE_VERSION` step (every `idempiere.html` script is precached). Small in lines, but it is the production page and the conflict magnet.
4. **Idempotence and persistence (owner-level decision):** the page writes its whole database to its resident cache (`_persistBundle`) on installs; a ledger replayed at
   every boot would meet its own rows. Options: mark applied entry hashes in a table, or treat the ledger as an install (apply once, persist, like `installShard`).
5. **Two id laws:** rows the ERP page makes itself get negative ids through its op log; the ledger's rows are positive base rows. They do not collide, but the page's
   history / undo / team sync see the ledger's rows as base data, not as ops. Acceptable for "show it", to be stated; a real two-way bridge is a larger design.
6. **The witness:** GardenWorld login in the real page, the Invoice window opened by deep link, grid rows + record id per row counted, the posting view read, a reload,
   a tampered line refused; mutants: applied twice, tamper accepted, row in the DB but not in the grid.

## 10. Slice S3c — the filed document in the real ERP window (spec 2026-11-27, before code)
Claim F12 of §9.4, built on the list of §9.6. Owner, 2026-11-27, verbatim: *"yes, show the document in the real ERP window too."* On the open questions of §9.6 the
owner said: *"decide for me"*. **Decision taken for this slice:** the hand-over is IDEMPOTENT BY ENTRY HASH. The ERP page records which ledger entry hashes it has
applied and applies each entry at most once; re-opening the same workbook or reloading the page never files twice. (Not a one-time install.)
Code: bim-ootb `erp/ws_kernel.js` (`replayInto`, `dispose`), `erp/ws_kernel_web.js` (shell without a boot), `erp/door_handover.js` (new, both pages),
`erp/sheet_addin/file_it.html` + `file_it.js` + `runner.js` (the link), `erp/idempiere.html` (the hook), `erp/sw.js`, `erp/modules.json`.
Witness `erp/tests/witness_door_erp.js` (W-DOOR-ERP). Laws that bind it: TWIN, AD-LAYER (the window shows the document through the ONE generic engine: no
per-window code, no table-name branch, no second master-detail engine), DB policy (no binary), PERF BUDGET (cost logged), `sw.js` conflict rule.

### 10.1 Measured before the design (2026-11-27)
- One filing of the sample invoice is ONE journal entry of 18 ops: 2 `i_invoice` creates, 1 `c_invoice`, 2 `c_invoiceline`, 1 `c_invoicetax`, 6 `fact_acct`, 2 updates
  that carry the value they started from (`c_acctschema.c_period_id` old 200104, `c_bpartner` credit used / open balance old 161.12 → new 314.62), 4 `i_invoice` updates.
  Record ids come from the filing kernel (`c_invoice` 1300110, `fact_acct` 2300300-305, `i_invoice` 1000001-2): every workbook starts from the same seed, so two
  DIFFERENT workbooks mint the SAME ids.
- The seed's tables have NO primary key (`CREATE TABLE "C_Invoice" ("C_Invoice_ID" NUMERIC, ...)`): a second insert of the same row does not fail, it DUPLICATES.
  So "apply once" cannot lean on the database; it must be decided before the insert.
- `ad_table` gives the window of a document the way legacy zoom does: `C_Invoice` → `AD_Window_ID` 167 (Invoice (Customer)), `PO_Window_ID` 183 when `IsSOTrx='N'`.
- The ERP page's Posted button already reads `Fact_Acct` of the record (`_factPostings`, first accounting schema, with a note when more schemas posted); the grid row
  carries `data-ad-table` + `data-ad-record`; `?window=&record=` is a zoom to that record after login. Nothing in the window layer needs to change.
- The door files invoices only today (`sheet_door.js` refuses any template that is not `kind: "invoice"`; the browser kernel loads ONE process, Import Invoice).

### 10.2 Design
1. **`replayInto(db, text, opts)` in `ws_kernel.js`, outside `build`** (ONE implementation; `build`'s `replay` calls it): verify the chain (`verifyJournal`), check every
   payload against its digest, then apply the op groups in order with the kernel's one `apply` (moved out of `build` unchanged; `build` passes its own id counters and
   composite undo). It needs a database and the shell's hash only: no model layer, no save hooks, no kernel. Options used by the ERP page:
   `skip(entry)` (entries already applied), `guard: true` (below), `atomic: true` (one SQL transaction: all new entries of the text or none).
   **Guard (needed because the target is not a fresh seed):** before an entry is applied (a) every record key it creates (`<table>_id`, else `<table>_uu`) must be
   FREE, (b) every row it updates must exist and still hold the `old` value the entry recorded, where it recorded one. Otherwise the entry is refused with the table,
   the key and both values, and nothing of that text is applied. No table is named in the code: the rule reads the op.
2. **Finding 3 of §9.5 (save hooks never removed):** `build` remembers the validators it registered and the kernel gets `dispose()` that removes exactly those.
   `runner.js` disposes the kernel it leaves and closes its database (it could not before). Opt-in: nothing changes for a caller that never calls `dispose()`.
3. **Hand-over (`erp/door_handover.js`, one file for both pages, no table name in it).** `offer(name, lines)`: the page that filed verifies the workbook's whole
   ledger (`verifyJournal`) and keeps it in same-origin `localStorage` (`door_handover_v1`, one record per workbook chain, keyed by the hash of its first entry).
   `take(db, env)`: the ERP page verifies each kept ledger, runs `replayInto` with `skip` = "hash already in `door_ledger_applied`", `guard` and `atomic`, writes the
   applied hashes into the table `door_ledger_applied (hash, book, seq, ops, applied)` INSIDE the same database and the same transaction, and persists the database
   the page's own way (`_persistBundle`, as `installShard` does). The kept record is NOT deleted: it is the hand-over; the table decides. Nothing leaves the device.
   Log: `§DOOR-HANDOVER applied=N skipped=M refused=K`, one `§DOOR-HANDOVER-REFUSED book=... why="..."` per refusal, `§DOOR-HANDOVER-COST`.
   A refusal is also shown to the user in plain words in the page's status line and on the login card.
4. **The link.** After a filing `file_it.html` shows "Open in the ERP": `../idempiere.html?window=<W>&record=<id>`, W read from `ad_table` in the filing kernel's
   dictionary by legacy's zoom rule (PO window when the record's `IsSOTrx` is `N`), id = the filed record. The click calls `offer` first. No login is put in the link.
5. **The hook in `idempiere.html`:** one block after the boot overlays and before the login: if `localStorage` holds a hand-over, load `door_handover.js` (which loads
   `ws_kernel.js` + `ws_kernel_web.js` for the verifier, nothing else) and call `take`. A page with no hand-over loads no script and runs no query.
6. **How these rows relate to the page's own op log and id law (§9.6 item 5), stated:** they are BASE rows at the ledger's own positive ids, like seed rows; they are
   not ops in the page's signed op log. The page's own history, undo and Team sync do not see them as changes; a later edit of such a row by the user is an ordinary
   op on a base row. They live in the page's resident database (IndexedDB bundle), so they survive what the bundle survives and are lost when it is reset: then the
   kept hand-over applies again at the next boot.

### 10.3 Claims (W-DOOR-ERP; headless Chromium on the real `file_it.html` and the real `idempiere.html` over a local static server, real file chooser, the page's own
login card; verdict line `§DOORERP-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M threw=T`; INCONCLUSIVE when nothing was judged; a mutant that crashes is not a kill)
| ID | Claim | Issue it exposes | Falsifier (mutant) |
|----|-------|------------------|--------------------|
| E1 BOOKS | The sample invoice filed on `file_it.html`, then the page's own "Open in the ERP" link followed: after login the ERP page's DB holds that invoice once: DocumentNo, partner, grand total, DocStatus, posted and the `Fact_Acct` rows equal the filing page's (and the fingerprint equals the node oracle's); debits = credits > 0; the page logged `§DOOR-HANDOVER applied=1 skipped=0 refused=0` | the document exists only inside the filing page | M1 hand-over not offered by the link |
| E2 WINDOW | What the user sees: the link lands in the Invoice window (window id from the dictionary) on that record: grid rows counted, record id per row == the filed id, DocumentNo / partner / total cells as in the DB; the Invoice Line tab shows the 2 lines WITHOUT Save; the Posted view shows the `Fact_Acct` rows of the page DB for that record, balanced; back on the parent tab the same row is there. The same window opened from the MENU (no zoom) lists the record exactly once | the row is in the DB but the window does not show it | M2 grid row faked without the DB row (the witness reads both) |
| E3 GENERIC | A ledger entry of ANOTHER document kind (a Sales Order saved through the node kernel's model layer) handed over the same way is applied by the SAME hook with zero new code and opens in ITS window (id from the dictionary) with its line; `door_handover.js` and the hook hold no table name; the existing W-WINDOW-SWEEP (X of N AD windows) gives the same lines before and after, also on a page that took a hand-over | the hook is per-document code | M3 hook applies only one table |
| E4 ONCE | Reload the ERP page: `applied=0 skipped=1`, still exactly one invoice, 6 `Fact_Acct` rows. The same workbook filed again with a new number (2 ledger entries, chained) and its link followed: `applied=1 skipped=1`, exactly one invoice of each number | a reload or a re-open files twice (no primary key stops it) | M4 applied hash not recorded |
| E5 REFUSED | (a) one character changed in a kept ledger line, (b) a line that is not a journal entry, (c) a different workbook whose record ids are already used in these books, (d) a ledger whose updated row no longer holds the value it started from: each REFUSED, named in the log and in plain words on the page, and the DB is unchanged (row counts of every touched table) | a tampered or colliding line is applied, or half applied | M5 tampered line applied; M6 used ids not checked |
| E6 KEPT | After the page's own persist and a reload the boot reads the resident bundle (`db=idb_cache`) and the invoice with its posting is there (`applied=0 skipped=1`); after a normal save made in the page (a new record through the toolbar) and another reload both are there | the hand-over lives in memory only | M7 no persist after applying |
| E7 HOOKS | The hand-over adds no save hook: `AdModelVal.registeredCount()` on a page that took a hand-over == on a page that took none (same steps, > 0). Node: `replayInto` on a bare seed database == `build().replay` (same fingerprint), `replay` still passes its old witnesses, and `dispose()` returns the validator count to what it was before `build` | a second set of save hooks on the live page | M8 hand-over installs save hooks |
| E8 COST | `§DOOR-HANDOVER-COST` ms (scripts / verify / apply / persist), entries, ops applied, bundle bytes; and a page with NO hand-over requests none of the door's scripts | unmeasured weight; every user pays for the door | — |
| E9 NOTHING LEAVES | Across the run every request is a GET to the page's own server | the ledger is sent somewhere | — |
| E10 OLD | W-FILE-IT 40, W-SHEET-ADDIN 59, W-SHEET-DOOR 21, W-SHEET-HISTORY 20 print their verdict lines unchanged; W-MANIFEST-ROUNDTRIP as on main; a named set of the witnesses that load `ws_kernel.js` gives the same last verdict line before and after | the kernel restructure broke something | — |

Not claimed (stated up front): real Excel; any tenant other than the GardenWorld demo; two different workbooks in ONE ERP book (they mint the same record ids:
the second is refused, E5c, not merged); a hand-over into books the user has since changed in the same rows (refused, E5d); the page's own op-log edits of the
same rows (tip-shadowed, not judged); undo / history / Team sync of handed-over rows (they are base rows, §10.2 item 6); the Posted view showing more than the first
accounting schema (it is the page's existing behaviour).
