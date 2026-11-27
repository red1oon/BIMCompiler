# ⚠ DO NOT REMOVE — SHEET FRONT DOOR: the user's own spreadsheet is the way in to the ERP
# Scope: a menu added to Excel / WPS / LibreOffice / Google Sheets ("Prepare Invoice", "File it", "Run report", "Read supplier bill")
# that files REAL iDempiere documents from the user's own sheet layout. Spec first, witness first, EXTRACT ONLY.
# READ THE LOG after every run (§SHEET_DOOR / §SDOOR-* lines); the exit code is not evidence.
# Code: bim-ootb `erp/sheet_door.js` + `erp/tests/witness_sheet_door.js`. This file: findings, decisions, results (dated sections).

## ▶ RESUME HERE (2026-11-27)
- **S1 DONE (witness) 2026-11-27:** engine `erp/sheet_door.js` + W-SHEET-DOOR 9/9 cases PASS (21 checks), mutants 5/5 killed
  (bim-ootb `feat/sheet-door`). Results + two legacy findings in §5.
- **Next: S3 (Excel add-in menu)**, then S4 WPS, S5 LibreOffice; S2 is reduced to "the host writes/reads the `_door_ledger` sheet"
  (the replay itself is already proven by D9).

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
