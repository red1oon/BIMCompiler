# ⚠ DO NOT REMOVE — SHEET FRONT DOOR: the user's own spreadsheet is the way in to the ERP
# Scope: a menu added to Excel / WPS / LibreOffice / Google Sheets ("Prepare Invoice", "File it", "Run report", "Read supplier bill")
# that files REAL iDempiere documents from the user's own sheet layout. Spec first, witness first, EXTRACT ONLY.
# READ THE LOG after every run (§SHEET_DOOR / §SDOOR-* lines); the exit code is not evidence.
# Code: bim-ootb `erp/sheet_door.js` + `erp/tests/witness_sheet_door.js`. This file: findings, decisions, results (dated sections).

## ▶ RESUME HERE (2026-11-27)
- **S1 DONE (witness) 2026-11-27:** engine `erp/sheet_door.js` + W-SHEET-DOOR 9/9 cases PASS (21 checks), mutants 5/5 killed
  (bim-ootb `feat/sheet-door`). Results + two legacy findings in §5.
- **S9 HISTORY DONE (witness) 2026-11-27** (owner: *"history is lacking in Excel. It is a missing killer... Proceed."*):
  `erp/sheet_history.js`, W-SHEET-HISTORY 8/8 cases PASS (20 checks), mutants 5/5 killed — §6.4.
- **Next after S9: S3 (Excel add-in menu)**, then S4 WPS, S5 LibreOffice; S2 is reduced to "the host writes/reads the `_door_ledger` sheet"
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
