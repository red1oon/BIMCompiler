# ⚠ DO NOT REMOVE — SHEET FRONT DOOR ('resume killer'): the user's own PDF or spreadsheet is the way in to the ERP
# Scope: three browser pages (PDF one-page editor, Sheet history, File it) + thin Excel/WPS menus over ONE engine: read, check, edit, remember, and — when the user
# chooses — file REAL iDempiere documents. Spec first (a numbered section here BEFORE code), witness first, EXTRACT ONLY.
# READ THE LOG after every run (§-tagged lines); the exit code is not evidence.
# Code: bim-ootb `pdf/`, `erp/sheet_door.js`, `erp/sheet_history.js`, `erp/sheet_addin/`. This file: the resume block, then dated spec + results sections.

## ▶▶ RESUME HERE — call sign **'resume killer'** (consolidated 2026-11-28; read this block, then the section it points to)

### ✅ The review the owner asked for (2026-11-28) is DONE for the editor and the pages: §20
**Read §20.1 (the table of findings) and §20.7 (results).** A cold read of the 2026-11-28 code, three readers, every finding reproduced before it was believed.
Fixed and LIVE (bim-ootb #3509 `a16077a4`, live run `§EDSHEET-VERDICT PASS judged=55 failed=0`): hidden scan text was editable unseen; a glyph a subset font lacks was
written at width 0; a page offered runs the writer refused; every edit re-read every page (1.3 s at 600 pages); undo memory had no limit; two opens that overlap
mixed two files; a turned phone drew every page; a text edit outside the table made Sheet history list 37 changes nobody made; a drag off the page broke the next drag.
**The report engine (§20.6) is fixed and LIVE too (§20.8): bim-compiler #1386, bim-ootb #3510** - a number too wide for its column printed as a different,
smaller number (now `####`); the font was parsed again for every cell (1,800 cells: 7,300 ms -> 150 ms); no page break (now cut at rows, 14,400 pt a page);
text in a script with no font vanished silently (now counted and said on the pill).
**Delegation (owner, 2026-11-28, verbatim: "tell it to assign well scoped Sonnet agents if needed to do easier tasks"):** the Fable session keeps the judgment —
the review, the design calls, the specs — and hands EASIER, well-scoped work to **Sonnet** agents (Agent tool, `model: sonnet`). One bounded task per agent, its own
`/tmp/wt-*` worktree, the spec section to read named in the brief, the rules of "How to run things" restated (a fresh agent has no memory), and the coordinator
re-runs the agent's witness itself before believing its report.
**▶ NEXT (2026-11-28 late; read §26 first):** (1) the owner watches FILM v2 rc1 and confirms the cover; beat 7 is re-shot (File it now stops at a draft). (2) §24 Part B
waits on five owner decisions (§26.5). (3) §25 (ERP drafted / ERP posted, Unlock = void) waits on one detail: Unlock with the network off - wait, or free with a void
pending (coordinator: wait). (4) TURNED PAGES are now the largest lock on real files (19 of 128): the next unlock. (5) §23 designer overlay (picture, page, column).
Done the same day: §21 number cells, plain words, the guide (live), §22 PDF 1.5+ with two real-file defects fixed (§26.2-26.3), §24 Part A (live).
**Left open by the review (each small, none started):** ⛔ the report takes the LOWEST client id - can the live page's database hold more than one tenant? (§20.6);
the `_door_text` tab is visible in the .xlsx (hiding it = the Sheet-history reader, three hosts); the undo limit (128 MB) is chosen, not measured on a phone;
the link row / download helper / 760 px breakpoint are each written 3-4 times; `witness_pdf_mobile.js` rests three gates on the one multi-page corpus file;
four "plausible, not reproduced" items at the end of §20.5.

### What this lane is (one paragraph)
**Start from the user's own file, not from an ERP window.** A PDF report or a spreadsheet the user already has is opened in our browser pages, read, checked
("does it add up"), edited, given a memory (history inside the file), and — only when the user chooses — filed into the ERP's books. Nothing is uploaded,
nothing is installed, it runs on a phone. Owner's words: a harmless "Trojan horse" (*"the entry point as simple as their own Excel"*), *"ERP in Excel format,
without some baggage"*, *"a good back door entry to the ERP when user choses"*; stage 1 is standalone and borrows single ERP pieces (*"sharding of pieces"*).
Sister files: `prompts/PDF_EDITOR.md` (the PDF side: clean-room rule, KillerPDF's 14 feature groups as the yardstick), `prompts/FILM_KILLER_FRONT_DOOR.md`
(the film), `prompts/ERP_IDEMPIERE_UX_PARITY.md` §ACCT-VIEWER (the posting view).

### Where it stands (live on https://red1oon.github.io/bim-ootb/)
| Page (short address) | Does today | Spec / results |
|---|---|---|
| **PDF** `/pdf` | view, find, outline, password; Read as sheet with the adds-up check; change a NUMBER in place in the same PDF; history inside the PDF and the .xlsx; a sample report; works offline; on a phone: page 1 in ≤ 2.4 s on 25 real PDFs (2,499 pages: 1.3 s), ≤ 5 pages drawn, the page on screen is the page read | §7, PDF_EDITOR §4.2-4.6, §16, §17 |
| **Sheet history** `/history` | any .xlsx gets a memory: Stamp, a cell's story, rewind, merge two copies; a sample with 3 stamps | §14, §16 |
| **File it** `/file-it` | files a marked invoice workbook into the demo books (GardenWorld), hands the workbook back with a signed ledger line; Open in the ERP (Invoice window + posting) | §9, §10, §16 |
| Excel / WPS menu | built and witnessed on stand-in hosts only; real Excel never run, real WPS menu cannot load here | §8, §11, §13 |
The three pages link to each other (row PDF · Sheet history · File it). User guide: https://red1oon.github.io/BIMCompiler/PdfPageGuide/ (§15-§16 state).

### Done at the 2026-11-28 close (both verified by the coordinating session itself, live, logs read) — and what the film still waits for
1. ✅ **§18 slice A, the one-page editor** — bim-ootb #3500 `4a38ab58`; results §18.4. Re-run by the coordinator on the LIVE page:
   `§EDSHEET-VERDICT PASS judged=46 failed=0`; locally with mutants `§EDSHEET-MUTANTS killed=7/7`. Edit layer over writable runs (trial balance: 139 writable,
   46 locked Thai), live totals on the page, closest font + red box (Helvetica for a sans run), undo/redo byte-identical, untouched objects + images byte-identical.
2. ✅ **§19 the report engine in the live app** — bim-compiler #1375 `614583fe`, bim-ootb #3501 `03f67130` + #3502 `8537a5be`; results §19.1 and the end of
   `prompts/NINJAEXCEL_TEMPLATE_ENGINE.md` (now on master). Re-run by the coordinator LIVE: `§NINJAPDF-VERDICT PASS N1..N3,N5,N6=PASS judged=21 failed=0`
   (N4 = the lane's `run_all.sh`, local only: the builder reports 54 gates ok). The ERP's "Excel Report" pill prints the trial balance as a PDF that reads back
   144/144 and adds up; Thai SARA AM right (`จำนวนเอกสาร`); that PDF edits on the one page; PDFKit + 6 fonts in `common/pdfwriter/` (slice B will reuse them).
3. **FILM v2 "ONE PAGE"** (`FILM_KILLER_FRONT_DOOR.md`, last section): prerequisites (1) ✅ (2) ✅; **(3) the guide is NOT yet updated** for the one-page editor and
   the ERP report print — do that, then shoot. Old Parts 1-3 are scrubbed.
**Biggest next levers found today (numbers in §18.4):** only 9 of the owner's 24 openable PDFs have writable text on page 1, decided by FILE STRUCTURE — 8
cross-reference streams (PDF 1.5+), 1 encrypted, 4 turned pages, 1 text in a form XObject, 1 scan. Cross-reference-stream support is the single largest unlock.
Thai stays locked until an embedded font (slice B, the PDFKit fonts are in place). Layer covers page 1 only; drag-sum is mouse-only; Times/Courier/bold/italic
substitution coded, not witnessed; prose edits (outside tables) sit in `_door_text`, which the open-time binding check skips. bim-compiler branch `ninja-xtab2`
is fully contained in master (deletable by its lane's owner rule). Overlay report files are not precached (offline report run not claimed).

### Owner rulings that still bind (dated, verbatim where short)
- Two stages: standalone first, the ERP when the user chooses (2026-11-27). History belongs in the file (*"has to be in the file anyway"*).
- The films delivered the idea; focus on usability (2026-11-28). Old films scrubbed; ONE new film, own-file first, the ERP closes the loop (2026-11-28).
- One page, edit where understood, keep the original around it; substitute the closest font with a red "font not same" box and Ctrl-Z rather than lock (2026-11-28).
- Novelty: the general idea is NOT new (Word PDF Reflow since 2013; Acrobat edits text without touching images and warns on font substitution). Say "may be new
  as a combination" only; **no novelty claim until a prior-art search is done** (§18.1, item P8 below).
- Privacy: the owner's PDFs on this machine are measured by number only; no name, path or content in any commit, log, PR, film or card (§17).
- Clean-room: never read KillerPDF's (GPLv3) source.

### Pending, in the order a user meets it (WORK-TO-ZERO; mark `✅ DONE (witness)` or `⛔ BLOCKED: <question>`; `OL-n` = the 2026-11-28 list number it replaces)
- **P1 File it files only the sample** — marking one's own invoice layout (S7 "Mark my invoice", §4) is not built. First wall a real user hits. (§16.4-1)
- **P2 The reader judges few outside layouts** — of 16 table PDFs on this machine: 2 add up, 3 "do NOT add up" (two look like misreads), 9 not judged. Widen it on
  real statements/reports: running-balance column, tables over several pages, ruling lines as grid evidence. The users' top wish (§17.5). (OL-21)
- **P3 Free organise and sign** — merge / split / reorder / fill / sign without a paywall: high demand, cheap with pdf-lib (PDF_EDITOR P1/P2). (§17.5)
- **P4 File it weight and offline** — 11.3 MB first visit; no offline reload (no service worker over `erp/sheet_addin/`); never on a real phone. (OL-29, OL-19)
- **P5 Open file across pages** — owner's call: it keeps a copy in browser storage (§15.2-3).
- **P6 Real applications** — real Excel never run (needs a machine or Excel on the web) (OL-15); a WPS build that loads add-ins (OL-16); LibreOffice Calc not
  installed (OL-18); viewers beyond poppler and pdf.js (OL-20).
- **P7 Plain words** — font names in edit messages; File it's engine still says "_door_tags" (§16.4-5).
- **P8 Prior-art search** for the front door / one-page editor (OL-24; §18.1) before any film card or page says "new".
- **P9 Correctness under the hood** — entry time outside the hash (OL-9); one verifier, not kernel + SheetHistory (OL-10); merge base (OL-11); noisy formula results
  from writers that store none (OL-12); `_door_break` stamped as cleared (OL-13); emoji in an inline string (OL-14).
- **P10 ERP side** — Account Viewer parity gaps (OL-25); two workbooks into one set of books refused (OL-26); signing / removed history / same-origin hand-over
  (OL-27); demo books only (OL-28); the outside request to idempiere.org (OL-30); red ERP witnesses never triaged (OL-31); one shared SHA-256 (OL-32).
- **P11 CI** — none of this lane's witnesses run in CI; node ones first (OL-33). **P12** history-page grid limits and styles (OL-34). **P13** PDF write-back
  limits: missing digit in a subset, one-byte fonts, xref streams, forms (OL-23) — largely absorbed by §18. **P14** WPS writes the OS user name into files:
  told in the guide ✅; never commit such files (OL-17).
- **Docs deploy trap:** a fresh checkout lacks git-ignored `docs/glassbowl_data.db` (live on the site) and the seatbelt aborts: restore it with
  `git show origin/gh-pages:glassbowl_data.db > docs/glassbowl_data.db` first; a permanent home for it is still undecided.

### How to run things
- Witnesses (bim-ootb, from a `/tmp/wt-*` worktree off `origin/main`, never the shared checkout; deps by git-ignored symlinks
  `ln -sfn ~/bim-ootb/node_modules node_modules; ln -sfn ~/bim-ootb/tests/node_modules tests/node_modules`; puppeteer from `~/bim-compiler/node_modules`):
  node: `pdf/tests/witness_sheet_reader.js` (`SREAD_MUTANTS=1`), `witness_pdfed_p0.js`, `witness_pdf_write.js`, `witness_pdf_history.js`;
  `erp/tests/witness_sheet_door.js`, `witness_sheet_history.js`, `witness_sheet_addin.js`, `witness_sheet_wps.js`, `witness_door_urls.js`.
  Browser (`env -u DBUS_SESSION_BUS_ADDRESS node <file>`, headless): `pdf/tests/witness_pdfed_page.js`, `witness_pdf_write_page.js`, `witness_pdf_history_page.js`,
  `witness_pdf_mobile.js` (`PDFM_LIST=<file>` for local PDFs, `PDFM_URL=` for the live page), `erp/tests/witness_file_it.js`, `witness_door_erp*.js`,
  `witness_history_page.js`, `witness_acct_viewer.js`, `witness_sheet_wps_page.js`, `witness_sheet_wps_real.js` (real WPS under Xvfb),
  `witness_killer_usability.js` (`USE_URL=` live), `witness_door_urls_page.js` (`DOORURL_URL=` live). Read the log, not the exit code.
- Changed `erp/` JS needs `node scripts/bump.js <file> --write` (runs the legacy-parity gate first, ~10 min; run it in the background) and
  `node scripts/gen_manifest.js --check` PASS. `pdf/` is network-first (no version to bump).
- Independent PDF readers here: poppler (`pdfinfo`, `pdftotext -raw` — default mode drops accounting dashes, `pdfdetach`, `pdftoppm`), ghostscript, pdfminer.
  WPS is a snap (`/snap/bin/wps-office.et`), fixtures under `$HOME`; LibreOffice Calc is not installed.
- Live: `https://red1oon.github.io/bim-ootb/pdf/` · `/history/` · `/file-it/` · WPS add-in base `/erp/sheet_addin/wps/` · Excel manifest
  `/erp/sheet_addin/manifest.xml` · guide `https://red1oon.github.io/BIMCompiler/PdfPageGuide/`. Docs publish only with `scripts/safe_gh_deploy.sh`.
- Way of working (owner: *"Use agents to speed up work"*): one bounded slice per agent, own worktree, spec appended as its own numbered section here BEFORE
  code, results under it; the owner's PDFs only through `PDFM_LIST`. The full 34-item list of 2026-11-28 morning is in git history of this file (before PR "consolidate").

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

### 10.4 RESULTS — S3c (2026-11-27, bim-ootb `feat/door-handover-erp`, PR #3484, merged `c848fdec`)
Command: `env -u DBUS_SESSION_BUS_ADDRESS DOORERP_MUTANTS=1 node erp/tests/witness_door_erp.js` (headless Chromium, puppeteer 24, `--no-sandbox --disable-gpu`, on the REAL
`erp/sheet_addin/file_it.html` and `erp/idempiere.html` served from the tree; real file chooser, real download, the ERP page's own login card: GardenWorld, GardenAdmin;
one browser context per scenario; the page's service worker left on). **REAL EXCEL WAS NOT RUN.**
```
§DOORERP-ORACLE direct ok=true fingerprintBytes=662 node door verdict=FILED sameFingerprint=true ledgerLineChars=11603
§DOORERP-E1 PASS 8/8 · E2 PASS 6/6 · E4 PASS 5/5 · E6 PASS 2/2 · E3 PASS 4/4 · E5 PASS 10/10 · E7 PASS 4/4 · E8 PASS 2/2 · E9 PASS 2/2 · E10 PASS 4/4     (every case threw=0)
  page: §DOOR-HANDOVER applied=1 skipped=0 refused=0 books=1 ops=18 persisted=Y          (first visit through the link; §IDEMPIERE boot db=network)
  page: §DOOR-HANDOVER-COST ms=24 scriptsMs=4 applyMs=5 persistMs=14 entries=1 ops=18 saveHooks=6->6      §PROJ-SNAPSHOT ... bytes=32841728
  page: §POSTED-FACTS table=C_Invoice rec=1300110 schema=101 lines=3 schemas=2 dr=153.5 cr=153.5 balanced=true
  page: §DOOR-HANDOVER applied=0 skipped=1 refused=0 books=1 ops=0 persisted=-           (reload; boot db=idb_cache)
  page: §DOOR-HANDOVER applied=1 skipped=1 refused=0 books=1 ops=17 persisted=Y          (the workbook filed again: 2 chained entries)
  page: §DOOR-HANDOVER applied=0 skipped=2 refused=0 books=1 ops=0 persisted=-           (after a normal save in the page and a reload; boot db=idb_cache)
  page: §DOOR-HANDOVER applied=1 skipped=0 refused=0 books=1 ops=15 persisted=Y          (the Sales Order's entry)
  page: §DOOR-HANDOVER applied=0 skipped=0 refused=3 books=3 ops=0 persisted=-
  page: §DOOR-HANDOVER-REFUSED book="payload-changed.xlsx" why="journal payload of seq 1 does not match its digest"
  page: §DOOR-HANDOVER-REFUSED book="header-changed.xlsx" why="journal does not verify: broken at line 1 (content)"
  page: §DOOR-HANDOVER-REFUSED book="not-a-ledger.xlsx" why="journal does not verify: broken at line 1 (unparseable)"
  page: §DOOR-HANDOVER applied=0 skipped=1 refused=3 books=4 ops=0 persisted=-
  page: §DOOR-HANDOVER-REFUSED book="other-workbook.xlsx" why="entry 1: i_invoice 1000001 is already in these books"
  page: §DOOR-HANDOVER-REFUSED book="moved-on.xlsx" why="entry 1: c_bpartner 117 so_creditused is 314.62 in these books, the ledger started from 161.12"
  page: §DOOR-HANDOVER-REFUSED book="two-entries.xlsx" why="entry 2: c_bpartner 117 so_creditused is 314.62 in these books, the ledger started from 161.12"
§DOORERP-NET serverRequests=5006 notGET=0 pageRequestsToOtherHosts=1 ["GET https://www.idempiere.org/short-donate/"]
§DOORERP-OLD witness_sheet_door.js -> §SDOOR-VERDICT PASS judged=21 failed=0 · witness_sheet_addin.js -> §SADDIN-VERDICT PASS judged=59 failed=0 ·
   witness_sheet_history.js -> §SHIST-VERDICT PASS judged=20 failed=0 · witness_file_it.js -> §FILEIT-VERDICT PASS judged=40 failed=0   (W-FILE-IT run alone with its mutants: 9/9)
§DOORERP-MUTANTS killed=13/13
§DOORERP-VERDICT PASS judged=47 failed=0 (headless Chromium on the real file_it.html and idempiere.html; real Excel NOT run)
```
- **E1 / E2.** The link the filing page offers is `../idempiere.html?window=167&record=1300110`: 167 is what the ERP page's own `AD_Table` gives for `C_Invoice`. After it is
  followed the ERP page DB holds the invoice once: id, DocumentNo, partner, 153.50, CO, posted, and the 6 `Fact_Acct` rows equal the filing page's row for row; fingerprint ==
  the node oracle's; a page that took no hand-over holds none. The window shows it through the generic engine: the dictionary's 5 tabs, form on Record 1 of 1, grid 1 row with
  `data-ad-record` 1300110 and the partner by name, "Invoice Line" 2 rows (their ids the DB's, parent of each == the invoice) with no save on the page, the Posted button's view
  = the 3 rows of accounting schema 101 (12110 debit 153.50, 41000 credits 123.50 + 30.00, balanced) with its note that 1 more schema posted, back to the parent row intact; from
  the MENU the window lists the record once (legacy's only-current-rows filter leaves the 20 seed invoices out, so it is the only row).
- **E3.** The door files invoices only today. A Sales Order made by iDempiere's Import Order (206) in the node kernel (one entry, 15 ops: `c_order`, 2 `c_orderline`,
  `c_ordertax`, 2 storage reservations, `i_order`) went through the SAME hook: `applied=1`, the order and its 2 lines equal the node kernel's, window 143 (the dictionary's)
  shows 1 row and "Order Line" 2 rows. `door_handover.js` and the 3-line hook name none of the dictionary's 1,004 tables.
- **E4 / E6.** Reload: `applied=0 skipped=1`, one invoice, 2 lines, 1 tax row, 6 entries, and the boot read the resident bundle (`db=idb_cache`): the page kept it, it was not
  applied again. The downloaded workbook filed again with a new number (2 chained entries): `applied=1 skipped=1`, one invoice of each number, 12 entries, the customer's open
  balance equal to the filing page's. Then a new Greeting saved through the toolbar (the page's own op log, record id -3) and another reload: `applied=0 skipped=2`, both
  invoices with the oracle fingerprint, the Greeting in its window, the Invoice window listing both.
- **E5.** The door's own offer refuses a ledger with a broken chain. Six refusals on the ERP page, each named in the log and in plain words on the page ("Not taken into these books: ... Nothing was changed."): a changed payload character, a changed
  header, a non-entry (the books then equal a page that took no hand-over: 8 table counts, the customer's balances, the schema's period, no applied-hash table); a different
  workbook (same record ids), an update of a row that moved on, and a 2-entry ledger whose second entry is refused (its first entry's record is NOT left behind): the books stay
  exactly as after the first, good, ledger.
- **E7 / E8.** Validators registered on the live page: 6 with a hand-over, 6 without, 6 -> 6 across it. A page with no hand-over loads none of the door's scripts (265 script
  elements, no `DoorHandover`, no `WsKernel`); one with a hand-over loads exactly `door_handover.js`, `ws_kernel_web.js`, `ws_kernel.js`. Cost of one hand-over: 24-41 ms
  (scripts 3-6, apply 5-12, persist 14-24), the persisted bundle is 32.8 MB (it is the page's whole database, as for `installShard`).
- **Mutants (each a rewritten served file, a child run, threw=0 required):** link does not hand over→E1 · grid row faked without the DB row→E2 · row in the DB not in the
  grid→E2 · hook applies one table only→E3 · entry applied twice→E4 · applied hash not recorded→E4 · tampered line applied→E5 · used ids not checked→E5 · moved-on row
  overwritten→E5 · refusal not atomic→E5 · no persist after applying→E6 · hand-over installs save hooks→E7 · every page loads the door→E8.

**Lines (AD-LAYER rule 4, stated).** `erp/idempiere.html` +4 / −0: one hook block in the boot, before the login. The window layer (grid, tabs, master-detail, Posted) got 0
lines: no per-window code, no table-name branch, no second master-detail engine; nothing there was a special case to delete. `erp/ws_kernel.js` +88 / −40: `replay`'s body
(14 lines) is deleted from `build` in favour of the one `replayInto`; `apply` moved out of `build` (same lines). `runner.js`: the "leave the database open" workaround of §9.5
finding 3 is deleted. Whole PR: 11 files, +770 / −59 (witness 521, `door_handover.js` 101).

**Other runs, before (origin/main `f2b4587a`) and after:**
- *X of N windows.* The dictionary-wide engine sweeps give identical §-lines before and after: W-GRIDTAB-CONTRACT `windows=130 tabs=282 PASS 265 INCONCLUSIVE 17` (287 lines),
  W-GRID-COLS `PASS 1126/1126 tabs` (1,131 lines), W-WINDOW-LENS `PASS judged=8` over every active window (13 lines).
- *W-WINDOW-SWEEP (`poc_window_sweep_live.js`, the live page, playwright).* A full run (332 windows with a menu leaf) is not feasible here: on `main` one window took 12 to 20
  minutes (User 739 s, Business Partner about 20 min) and many tabs come back `NOFORM` (INCONCLUSIVE). Run on 9 trade-cycle windows instead (143 Sales Order,
  162, 167 Sales Invoice, 168, 169, 170, 178, 181, 183), three ways (5 more were cut off by the time limit and judge nothing):
  before == after, line for line, all 9 (`windows_ok 1 of 3 · tabs form-complete 6 of 12 · dictionary fields missing 0 of 101` on 143 / 167 / 178; the other 6 the same
  GAP / INCONCLUSIVE lines as `main`); on a page that had TAKEN a hand-over 8 of the 9 lines are again the same and the Invoice window gets MORE tabs judged
  (form-complete 3 of 5 instead of 1 of 5, since its line and schedule tabs now have a parent row; dictionary fields missing 0 of 131).
- *Kernel witnesses.* The 69 test files that load `ws_kernel.js` (erp/tests, pdf/tests, capex/tests, devtools; W-FILE-IT and this witness apart): 66 print the same exit code and
  last verdict line on both sides (9 of them non-zero on BOTH sides with identical lines: not caused here, not investigated). The other 3 (`witness_branch_day_close`,
  `witness_idempiere_open`, `witness_sapbc_open`) FAIL on the baseline and PASS on the branch for a reason of the baseline, not of the change: the baseline ran from a file copy
  of `origin/main` with no git, and these three compare files with `origin/main` through git (re-run on the copy: same failure).
- W-MANIFEST-ROUNDTRIP (CI flags `--skip-c7 --skip-c9`): `claims=47/47 red=31/31 verdict=PASS`; `gen_manifest --check` PASS; eslint clean; CI green (fast-checks, e2e-tests, live-json-editor).

**Findings (each from a failing check or a measurement):**
1. **The seed's tables have no primary key**, so applying an entry twice does not fail, it duplicates (mutant M5: 2 invoices). "Once" is decided before the insert: the applied
   hashes are rows of `door_ledger_applied` in the same database and the same SQL transaction as the entry's rows, and the guard refuses a key that is already there.
2. **Two different workbooks cannot share one ERP book today.** Each workbook's books start from the same seed, so the second mints the same record ids (`c_invoice` 1300110,
   `i_invoice` 1000001); it is refused, named, nothing applied. One workbook, any number of filings, works. Merging two needs the ids re-banded (as a born tenant's are): a larger design.
3. **A ledger's updates are absolute values** (the customer's credit used: old 161.12, new 314.62). Applied to books that have moved on they would overwrite; the guard compares
   the recorded `old` value and refuses (mutant M9: the balance became 999).
4. **§9.5 finding 3 fixed at its root, opt-in.** `build()` remembers the validators it registered; `dispose()` removes exactly those; the runner disposes and closes the kernel
   it leaves. Measured in `file_it.html` over 5 different workbooks: validators 71 / 137 / 203 / 269 / 335 and JS heap 39 / 158 / 190 / 224 / 257 MB before; 71 every time and at
   most 125 MB after. Nothing changes for a caller that never calls `dispose()`: this witness's own node process held 533 validators after 8 kernels (shown by E7).
5. **The offer checks the chain, the ERP page checks the payload too.** `verifyJournal` does not read payloads, so `offer` keeps a ledger whose payload was edited; the ERP page's
   replay refuses it (digest). And a hash chain proves the ledger was not edited, not WHO wrote it: any page of this origin can write a hand-over (as it can write the bundle
   itself). Signing (W-SIGN) is still not wired (§6.2).
6. **Three witness defects found by its own failing checks:** puppeteer's `request` event does not report what the service worker answers and the resource-timing buffer stops at
   250 entries (the "exactly these 3 scripts" check now reads the document's script elements); the "no table named" check fired on `.test(` because the dictionary has a table
   named `Test` (the code lost its `.test(`, the check stayed strict); E10 first took W-FILE-IT's first verdict line, which is a child's.
7. **The Posted view shows the first accounting schema only** (3 of the 6 entries, with a note). It is the page's existing behaviour, not touched; legacy's Account Viewer lets
   the user pick the schema: a look-and-feel gap for the ERP UX lane.
8. **One request to another host in the whole run:** an ERP page asked for `GET https://www.idempiere.org/short-donate/` (no body; the URL is in the dictionary's context help rows,
   not in the door's code); blocked by the witness, reported, not traced further.
9. **Governance:** `gen_manifest --write` sees a new file only once it is added to git; a lazy list must be an array literal for the manifest reader; `ws_kernel.js` and
   `ws_kernel_web.js` are now precached (the ERP page may load them). The tool again proposed unrelated `uses` drift (2 modules) and a second `CACHE_VERSION` step; not taken (v1151, one step).

**Deployed and fetched back (2026-11-27):** `erp/idempiere.html` and `erp/sheet_addin/file_it.html` on `https://red1oon.github.io/bim-ootb/` are byte-identical to the merged
files (sha256 `391218a9b33e`, `0147f5f616ec`); the JS is the deploy's minified build; the live `sw.js` carries `v1151` and `door_handover.js`. The hand-over was run once on the LIVE site, headless:
```
§DOORLIVE-FILED readyMs=2896 text="Filed. AR Invoice 100001 for C&W Construction is in the books (Completed)." link=../idempiere.html?window=167&record=1300110 id=1300110
  live page: §DOOR-HANDOVER applied=1 skipped=0 refused=0 books=1 ops=19 persisted=Y
  live page: §DOOR-HANDOVER-COST ms=24 scriptsMs=2 applyMs=7 persistMs=15 entries=1 ops=19 saveHooks=6->6
§DOORLIVE-DB invoice=[[1300110,"100001",153.5,"CO","Y"]] fact=[[518,153.5,0],[758,0,123.5],[758,0,30],[518,130.48,0],[758,0,104.98],[758,0,25.5]] factEqualsFilingPage=true
  live page: §ZOOM window=167 C_Invoice.C_Invoice_ID=1300110 rows=1 landed=true from=deeplink
§DOORLIVE-WINDOW gridRows=[["C_Invoice","1300110","100001"]] pageErrors=0 requestsElsewhereOrNotGET=1 ["GET https://red1oon.github.io/favicon.ico"]
§DOORLIVE-VERDICT PASS (one live run, not a witness in the tree)
```
(19 ops: the page's sample has a blank number, so the entry also moves the document sequence; the guard checked that row too.)

**Not yet (stated, not hidden):** REAL EXCEL is still not run. The books are the GardenWorld demo with the page's own login; no tenant choice in the door. Two different workbooks
in one ERP book (finding 2). A hand-over into books changed in the same rows is refused, not merged (finding 3); the page's OWN op-log edits of those rows are tip-shadowed over
the base rows and were not judged. Handed-over rows are base rows: the page's history, undo and Team sync do not see them as changes (§10.2 item 6). A workbook reopened
WITHOUT filing offers no link (the link appears after a filing). The kept hand-over is never pruned from `localStorage` (about 12 KB per filing; a full store is said in words,
not witnessed). The note on the page is English only. The door files invoices only; the order path was shown at the hook, not at the door. W-WINDOW-SWEEP was run on
9 of 332 windows. W-DOOR-ERP is not wired into CI (same as S1, S3, S3b, S9). A phone was not tried.

## 11. Slice S4 — WPS: the menu on it, the file with it, and mobile (spec 2026-11-27, before code)
Owner, 2026-11-27: *"Make it work on or with WPS, the Chinese clone of MSExcel. In mobile can it work with the mobile version? Or we just use it as now as served by our URLs?"*
Three answers, each proven as far as this machine can: (1) **ON** WPS desktop = a WPSJS add-in on the same host interface (§8.1); (2) **WITH** WPS on any device = the
no-add-in path of §9 (a workbook WPS saves, opened in `file_it.html`; the PDF page's `.xlsx` opened back in WPS); (3) **mobile** = what the sources say, with UNKNOWN where
they are silent. **WPS is NOT installed here (only LibreOffice at `/usr/bin/soffice`) and no software is installed for this slice: real WPS is NOT run.** Everything
under (1) is proven against a FAKE WPS object model written only from the API names cited below, exactly as S3 did for Excel; (2) uses LibreOffice as a STAND-IN for
"saved by another office suite" (WPS's own writer is NOT run); (3) uses headless Chromium device emulation, which is not a phone.
Code (bim-ootb): `erp/sheet_addin/wps_host.js`, `erp/sheet_addin/wps/{ribbon.xml, index.html, main.js, ribbon.js, jsplugins.xml, images/}`, `taskpane.js`/`taskpane.html`
(host chosen by what exists), `excel_host.js` (two helpers exported, no change of behaviour). Witnesses `erp/tests/witness_sheet_wps.js` (node, W-SHEET-WPS) and
`erp/tests/witness_sheet_wps_page.js` (headless Chromium, W-SHEET-WPS-PAGE); the fake WPS object model is `erp/tests/fake_wps.js`.

### 11.1 Sources (EXTRACT, never invent; every WPS name used must be on this list, read 2026-11-27)
**Finding 0 (stated first): the WPS developer documentation site is not readable by a fetch tool.** `open.wps.cn/documents/...` is a client-rendered single-page app: the
server returns an empty shell (`<div id="root">`, 609 bytes); `solution.wps.cn/docs/client/api/...` is the WPS *WebOffice* (server/web SDK) product, a different object model, NOT used.
What WAS read are WPS's own published toolkit packages on npm (same maintainer account for both; the scaffold of one depends on the other), which are the add-in's real
file layout and the ET object model as typings. Where the doc site would say more, this section says UNKNOWN.
- **[S-A] `wpsjs` 2.2.3** (WPS add-in toolkit; npmjs.com/package/wpsjs; tarball registry.npmjs.org/wpsjs/-/wpsjs-2.2.3.tgz). Its spreadsheet scaffold `packages/@wps-jsapi/et/`
  is the layout a WPSJS spreadsheet add-in has: `ribbon.xml` (`<customUI xmlns="http://schemas.microsoft.com/office/2006/01/customui" onLoad="OnAddinLoad">`, `ribbon/tabs/tab/group/button`,
  callbacks `onAction`, `getImage`, `getLabel`, `getEnabled`, `getVisible`), `index.html` (comment: the add-in's entry file, WPS loads it at startup; it loads `main.js`), `main.js`
  (`document.write` of `js/ribbon.js`), `js/ribbon.js` (global functions `OnAddinLoad(ribbonUI)`, `OnAction(control)` with `control.Id`, `GetImage(control)`; calls
  `window.Application.ActiveWorkbook`, `.PluginStorage.setItem/getItem`, `.CreateTaskPane(url)` -> `.ID` / `.Visible`, `.GetTaskPane(id)`, `.ShowDialog(url, title, w, h, modal)`),
  `js/taskpane.js` (a pane page reads `window.Application.ActiveSheet.Cells.Item(1, 1).Formula`: Item is 1-based), `manifest.xml` (only for custom functions, not needed here).
  **Install / deploy** from `src/lib/publish.js`, `debug_xmlplugin.js`, `debug_publish.js`: *online mode* = a server directory whose `ribbon.xml` is reachable (the tool says the
  address must end with `/` and `<address>ribbon.xml` must open as text starting `<customUI`); the user's WPS learns of it from `<jsplugins><jspluginonline name type url .../></jsplugins>` with
  `type` = `et` for a spreadsheet add-in (`debug_xmlplugin.js`: `addonType ... "et"`); `publish.xml` lives at `%APPDATA%/kingsoft/wps/jsaddons/publish.xml` (Windows),
  `~/Library/Containers/com.kingsoft.wpsoffice.mac/Data/.kingsoft/wps/jsaddons/publish.xml` (macOS), `~/.local/share/Kingsoft/wps/jsaddons/publish.xml` (Linux) (`debug_publish.js GetPublistXmlPath`);
  the user-facing install page (`res/publish.html`) talks to a local service of the desktop client, `http://localhost:58890/deployaddons/runParams` (HTTP 58890, HTTPS 58891).
  **Platform evidence in the same package** (README release notes): "v1.4.6 fixes debug failing under linux", "v1.4.10 ... error on linux" , "v2.1.8 added PC HarmonyOS (鸿蒙) adaptation code",
  "v2.2.0 added Mac adaptation code"; its platform branches are `win32`, `darwin`, else Linux; **no Android or iOS branch anywhere**.
- **[S-B] `et-jsapi-declare` 2.5.0** (npmjs.com/package/et-jsapi-declare; the scaffold's `devDependencies`; file header "Copyright @ 2012-2019, Kingsoft office"; its licence forbids
  modification or sale, so NOTHING of it is copied into the repo: names only). `index.d.ts`: `window.Application` is the recommended global; **`EtApplication` is marked `@deprecated`**
  ("use the global Application object") — so the task's `wps.EtApplication()` is not used; `CreateTaskPane(url, title?)` (comment: set `Visible = true` to show), `GetTaskPane(id)`,
  `CustomTaskpane { Delete(), DockPosition, ID, Visible, Navigate(url), Width... }`, `PluginStorage { setItem(key, number|boolean|string), getItem(key): string }` (not persisted, shared between the
  pages of one add-in), `RibbonUi { Invalidate, InvalidateControl, ... }`. `lib.et.d.ts`: `Application { ActiveSheet, ActiveWorkbook, ActiveCell: Range, UserName: string, Workbooks }`;
  `Workbook { Name, Worksheets: Sheets, Sheets, ActiveSheet, Save() }`; `Sheets { Add(Before?, After?, Count?, Type?): Worksheet, Count, Item(Index: string|number) }`;
  `Worksheet { Name, Visible: XlSheetVisibility, Cells: Range, Range(Cell1, Cell2?), UsedRange: Range, Activate(), Delete() }`; `enum XlSheetVisibility { xlSheetVisible = -1, xlSheetHidden = 0,
  xlSheetVeryHidden = 2 }`; `Range { Value2: string|Array, Formula: string, NumberFormat: string, Row, Column, Rows, Columns, Count, Cells, Item(RowIndex, ColumnIndex?), Worksheet, Clear(), Address(...) }`.
  **These are typings: they give names and shapes, not behaviour** (what a date cell's `Value2` holds, whether a missing sheet's `Item` throws, 0 or 1 based `Sheets.Item`, whether `Sheets.Add`
  activates the new sheet): all UNKNOWN until real WPS runs, and each is a stated assumption in 11.2.
- **[S-C]** `forum.wps.cn/topic/86364` (WPS developer forum, 2026-04-25; WPS staff reply 2026-04-29): in a `toggleButton`, `onAction` receives `(pressed, control)` in WPS but `(control, pressed)` in the
  VBA ribbon standard; WPS replied it will consider compatibility, no date. **Our ribbon uses `button` only** (`onAction(control)`, as the scaffold does), so the difference does not touch this slice.
  `forum.wps.cn/topic/47510` (2024-12-26): on macOS the in-app install did not work for the poster (the 58890 connection failed); a hand-edited `publish.xml` did.
- **[S-D] Microsoft** `learn.microsoft.com/en-us/office/dev/add-ins/overview/office-add-in-availability` (`ms.date` 2026-08-13): the Excel rows are Office on the web, Windows (365, 2021 retail, 2024 / 2021
  volume), Mac, and **Office on iPad (Microsoft 365)** (task pane and content add-ins, ExcelApi 1.1 to 1.21). Excel on iPhone and Excel on Android are **not in the table** (the phone footnotes there belong to Outlook).
- **[S-E] discounted:** `bbs.wps.cn/topic/82371` (a community post, 2026-02-11, titled as a DeepSeek comparison) claims WPS add-ins cover "Win/Mac/Linux/Android/iOS/Web"; its author's own comment says it is "mainly based on
  the situation in 2021", it cites nothing, and it contradicts [S-A]. Not relied on.

### 11.2 Design
- **`wps_host.js`** = the SAME host interface as §8.1 (`readCells`, `writeCells`, `readSheetValues`, `getHidden`, `setHidden`, `userName`, `activeSheet`, `visibleSheets`, `selectedCell`), over the WPS
  `Application` object. `create(app, deps)`; `deps.ex` = the Excel layer's two value rules (`engineValue`: a date-formatted number as its ISO day, 15 significant digits; `textForCell`: a written text
  starting `=` gets an apostrophe) — ONE rule, not a copy (AD-LAYER rule 5); `host_shim.js` does not change; the host holds no invoice word, no cell address, no logic. Mapping, every name from [S-B]:
  sheet by name = walk `Workbook.Worksheets` with `Count` and `Item(i)` (1-based, as `Cells.Item` is in [S-A]) comparing `.Name`; a cell = `Worksheet.Range("B3")` then `.Value2`, `.NumberFormat`; **never a
  multi-cell `Value2`** (the shape of an array result is UNKNOWN): a used range is walked cell by cell with `UsedRange.Row/Column/Rows.Count/Columns.Count` and `Cells.Item(r, c)`; formula = `.Formula`
  starting `=`; a hidden sheet = `Sheets.Add()`, `.Name = n`, `.Visible = 2` (xlSheetVeryHidden), then the previously active sheet `.Activate()`d again (assumption: `Add` activates, as Excel's does); its cells
  are written one by one with `NumberFormat = "@"` BEFORE `Value2` (a chunk of digits, or one starting `=`, stays text; assumption: WPS honours `@` as Excel does); rewrite = `UsedRange.Clear()`;
  who = `Application.UserName` (WPS's own user name, unlike Excel's workbook-setting; the pane's name box is therefore read-only there); selected cell = `ActiveCell` with `.Worksheet.Name`, `.Row`, `.Column`.
- **The add-in files** `erp/sheet_addin/wps/`, laid out as [S-A]'s scaffold: `ribbon.xml` (one tab "Sheet Door", one group, four `button`s: `btnFileIt`, `btnStamp`, `btnCellHistory`, `btnCheckHistory`),
  `index.html` -> `main.js` -> `ribbon.js` (`OnAddinLoad`, `OnAction`, `GetImage`; an id -> action table `{btnFileIt: fileit, ...}`, nothing else), `images/door.svg`, and `jsplugins.xml`
  (`<jspluginonline name="SheetDoor" type="et" url="https://red1oon.github.io/bim-ootb/erp/sheet_addin/wps/"/>`, the attributes the tool itself writes for an online add-in). `OnAction` opens the pane:
  first click `CreateTaskPane(<taskpane.html?action=..>)`, `.Visible = true`, its `ID` kept in `PluginStorage`; later clicks `GetTaskPane(id)`, `.Navigate(<url>)`, `.Visible = true` (a pane that no longer
  exists: create anew). The pane URL is resolved from the entry page's own address (`../taskpane.html`, the scaffold's `GetUrlPath()` way), so a debug copy works too.
- **ONE pane, not two.** `taskpane.html` / `taskpane.js` / `runner.js` are reused; `taskpane.js` picks the host by what exists (`window.Application.PluginStorage` -> WPS host; else Office.js -> Excel host). Two changes
  follow from WPS: the Office.js `<script>` is written only when no WPS `Application` exists (a pane in WPS must not wait on a Microsoft CDN), and the name box is read-only when the host cannot set a name.
  **Whether a pane served from a remote https address receives `window.Application` at all is UNKNOWN** ([S-A]'s pane is a local file and calls it directly): if it does not, the pane says so in words and the
  four actions stay on the page route (§9). This is the first thing a real-WPS run must settle.
- **WITH (no add-in):** §9's `file_it.html` + the PDF page's `.xlsx`. What is measured here: a workbook re-saved by LibreOffice (stand-in) and what it loses; both pages at a phone viewport.

### 11.3 Claims (W-SHEET-WPS `§SWPS-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`; W-SHEET-WPS-PAGE `§SWPP-<case> ...`; INCONCLUSIVE when nothing was judged; a mutant that crashes is not a kill)
| ID | Claim | Issue it exposes | Falsifier (mutant) |
|----|-------|------------------|--------------------|
| P1 SAME | The one shim, driven through `wps_host.js` on the fake WPS object model, gives the same verdict, the same writes, the same read set (exactly the template's cells, built by hand in the witness), the same C_Invoice + lines + Fact_Acct fingerprint, and (clock and ids fixed) the same ledger line BYTE FOR BYTE as through the plain fake host and through `excel_host.js` on the fake Office.js; no decoy cell is read or written | the WPS layer adds, loses or reformats something (twin breach) | M1 host reads the whole sheet; M6 date conversion dropped |
| P2 WRITESET | Visible writes == the engine's `writes` == {docno, status}; a cell-by-cell diff of the whole workbook shows only the status cell changed; a wrong subtotal (153.51) writes only the status cell ("Not filed: ..."), adds no ledger row, the kernel journal does not move | the menu writes outside its tags; a refusal leaves a trace | M2 host writes one extra cell |
| P3 LONG | A history entry of >32,767 characters (453 cells incl. emoji) is split across chunks, none truncated by the fake (it truncates like the real limit), re-joined byte for byte, `ws_kernel.verifyJournal` accepts it; a second Stamp is NO-OP and writes nothing; one edit then Stamp = one row, one CELL_SET; one character changed in the LAST chunk is caught by Check history, a broken history refuses Stamp | a long entry is truncated silently; tamper in a split entry slips through | M7 text format skipped (a digit-only chunk is coerced) |
| P4 HIDDEN | `_door_*` sheets are created `Visible = 2`; rows written come back identical (digit-only, `=`-leading, padded text, ragged rows); a rewrite leaves no stale cell; the user's active sheet is the same after the sheet was added | a hidden sheet shows, or its text is coerced by the host | M5 hidden sheet left visible; M7 |
| P5 VALUES | A date serial with a date `NumberFormat` reaches the engine as its ISO day; 123.50000000000001 as 123.5; blank as null; text stays text; a written `=1+1` stays text; `ActiveCell` on a quoted sheet name parses to {sheet, cell}; the user's name is `Application.UserName` | the engine is fed WPS's raw values | M6 |
| P6 CITED | The fake WPS object model THROWS on any member not in its cited list (each name carries its [S-x] in the fake's source); every member name `wps_host.js` and `ribbon.js` use is on that list or is a plain JS name; a name off the list fails | an API name invented, not extracted | M10 host uses a name not on the list |
| P7 RIBBON | `ribbon.xml` parses with an independent parser (python3 `xml.etree`) and is `<customUI>` in the Office customUI namespace; its button ids == the `OnAction` table's ids both ways; every callback it names (`onLoad`, `onAction`, `getImage`) is a global function in `ribbon.js`; the table's actions == `SheetAddin.ACTIONS` both ways; every `getImage` target exists; `index.html` loads `main.js` and `main.js` loads `ribbon.js`; the pane URL resolved from the entry address is `taskpane.html` under `https://red1oon.github.io/bim-ootb/erp/sheet_addin/`, and so is `jsplugins.xml`'s url (ends `/`); ids unique; no `toggleButton` (the [S-C] difference) | a button that does nothing, or code no button reaches | M3 a ribbon button without a handler; M9 a handler id renamed |
| Q1 PANE | The REAL `taskpane.html`, with a fake WPS `Application` injected before the page loads and no Office.js: it chooses the WPS host; Stamp RECORDED (cells from the fake workbook); File it FILED with the oracle fingerprint through the pane's own runner; the name box is read-only and shows `UserName`; no request goes to a Microsoft host | the pane is Excel-only, or waits on a CDN | M12 pane always picks the Excel host |
| Q2 RESAVE | The lane's sample workbook, filed (one `_door_ledger` row), stamped (a history entry > 32,767 chars) and re-saved through LibreOffice headless (`soffice --convert-to xlsx`; STAND-IN, WPS's writer not run): measured per attribute (the `_door_*` hidden state, ledger and history chunk text byte for byte, formulas, date number format, cell values), then opened in the real `file_it.html`: `_door_tags` read, FILED, the ledger line replays (2 rows chained), same fingerprint as the original; the `.xlsx` of the PDF page (its history sheets) through the same re-save; any `_door_*` sheet visible after the re-save fails the claim | the file does not survive another suite; the loss is unmeasured | M4 the re-save step makes `_door_tags` visible (not detected = FAIL) |
| Q3 MOBILE | `file_it.html` and `pdf/index.html` at 390 x 844 (device pixel ratio 3, mobile and touch emulation): `scrollWidth <= innerWidth` (no horizontal scroll) on load and after a result is shown; the file control accepts a file; a sample invoice files (FILED) and a PDF opens (`§PDFED-OPEN ok=true`); logged `§DOOR-MOBILE` = first-load bytes, boot ms, JS heap MB after boot and after filing | the pages only work on a desktop width; the phone cost is unmeasured | M13 the page forced wide |
**Not claimed (up front):** real WPS (desktop, any OS) and WPS mobile; whether a remote https pane receives `window.Application`; WPS's real `Value2` / `Sheets.Item` / `Sheets.Add` / `@`-format behaviour
(all assumptions above); the ribbon's rendering; the install flow (`publish.xml`, port 58890) — written from the tool's source, not run; WPS's own xlsx writer (LibreOffice is only a stand-in); a real phone
(Chromium emulation sets viewport, pixel ratio, touch and user agent, not the phone's memory, CPU or WebView); WPS mobile and Excel mobile add-ins; CI wiring.

### 11.4 RESULTS — S4 (2026-11-27, bim-ootb `feat/sheet-addin-wps`, PR #3486)
Commands: `SWPS_MUTANTS=1 node erp/tests/witness_sheet_wps.js` and `env -u DBUS_SESSION_BUS_ADDRESS SWPP_MUTANTS=1 node erp/tests/witness_sheet_wps_page.js`. **REAL WPS WAS NOT RUN** (not installed here, nothing installed for this slice):
every WPS claim below is against the FAKE object model `erp/tests/fake_wps.js`, which is built only from the names in §11.1 and THROWS on any other (its 9 behavioural assumptions are printed as `§SWPS-FAKE-ASSUMES`).
```
§SWPS-P1 PASS 8/8 · P2 PASS 6/6 · P3 PASS 11/11 · P4 PASS 6/6 · P5 PASS 6/6 · P6 PASS 5/5 · P7 PASS 13/13
§SWPS-CITED wps_host.js uses 23 WPS names: Activate ActiveCell ActiveSheet ActiveWorkbook Add Cells Clear Column Columns Count Formula Item Name NumberFormat Range Row Rows UsedRange UserName Value2 Visible Worksheet Worksheets
§SWPS-COST stampGenesisChars=90979 cells=453 chunks=3
§SWPS-MUTANTS killed=8/8  (reads whole sheet→P1, extra cell written→P2, hidden sheet left visible→P4, date conversion dropped→P5, text format skipped→P4, a name off the list→P6, ribbon button without handler→P7, handler id renamed→P7)
§SWPS-VERDICT PASS judged=55 failed=0 cases=["PASS","PASS","PASS","PASS","PASS","PASS","PASS"] (fake WPS object model; real WPS NOT run)
§SWPP-Q1 PASS 4/4 · Q2 PASS 15/15 · Q3 PASS 8/8
§SWPP-MUTANTS killed=3/3  (pane always picks the Excel host→Q1, page forced wide→Q3, the re-save un-hides the _door_ sheets→Q2)
§SWPP-VERDICT PASS judged=27 failed=0 cases=["PASS","PASS","PASS"] (headless Chromium; fake WPS Application; openpyxl stand-in for the re-save; device emulation; real WPS NOT run)
```
Old witnesses on the touched files: W-SHEET-ADDIN still `PASS judged=59`, mutants 11/11 (its fake hosts moved to `erp/tests/sheet_fakes.js`: that file −136 lines, the shared module +146, `fake_wps.js` and the two new witnesses are additions);
W-FILE-IT `PASS judged=40`, mutants 9/9 (its pane case F10 and mutant M8 run against the changed `taskpane.js`); W-SHEET-DOOR 21 and W-SHEET-HISTORY 20 unchanged. `gen_manifest --check` PASS; eslint clean on everything touched.
- **P1 SAME:** the one shim through `wps_host.js` on the fake WPS gives the same verdict, writes, read set (exactly the 60 template cells, each once, no decoy), C_Invoice + lines + Fact_Acct fingerprint and — clock and ids fixed — the same
  11,594-character ledger line byte for byte as the plain host and `excel_host.js` on the fake Office.js. P2: writes == {docno, status}; a wrong subtotal writes only the status cell, no ledger row, journal unmoved. P3: a 90,979-character history
  entry (453 cells) stored as 3 chunks, re-joined byte for byte, `verifyJournal` accepts it; NO-OP stamp writes nothing; one edit = one CELL_SET; a changed character in the LAST chunk is caught and refuses Stamp. P4: hidden sheets created
  `Visible = 2`, digit-only / `=`-leading / padded rows come back identical, the user's active sheet unchanged. P5: date serial -> ISO day, 15 digits, blank -> null, `=1+1` written as text, `ActiveCell` and `UserName`.
  P7: `ribbon.xml` parses (python `xml.etree`), 4 plain `button`s (no `toggleButton`), ids == the `OnAction` table both ways, actions == `SheetAddin.ACTIONS`, every callback is a global function, and `ribbon.js` RUN on the fake WPS creates the pane once, then
  `Navigate`s it to `…/erp/sheet_addin/taskpane.html?action=<id>` for each button; `jsplugins.xml` is the https base ending `/`, type `et`.
- **Q1 PANE:** the real `taskpane.html` with the fake `window.Application` injected and no Office.js: Stamp RECORDED through the WPS host into a very hidden sheet; File it FILED with the engine's own fingerprint; the name box is read-only and shows `UserName`;
  no request to a Microsoft host. **Q2** and **Q3** below.

**Q2 — the file re-saved by another writer (stand-in). LibreOffice CALC IS NOT INSTALLED here** (deviation from §11.3: `soffice` exists but with Writer / Math / Base only; `§SWPP-STANDIN soffice=/usr/bin/soffice converts_csv_to_xlsx=NO said="... Error: source file could not be loaded"`).
The stand-in is **openpyxl 3.1.5** (an independent xlsx reader + writer in Python, not an office suite and not WPS). What the re-save of a filed + stamped workbook (one ledger row, a 93,556-character history entry in 3 chunks, 451 text cells) measured:
```
§SWPP-LOSS hidden-state (SheetJS Hidden: 0 visible, 1 hidden, 2 very hidden): _door_tags hidden 2->2 | _door_ledger hidden 2->2 | _door_history hidden 2->2
§SWPP-LOSS chunks _door_ledger: rows 1->1 joined lines 1->1 chars 11567->11567 · _door_history chars 93556->93556 cells per row [3]->[3] · _door_tags 308->308
§SWPP-LIMIT formula-cells ["G8","G9","G20"]: after the re-save our reader (SheetJS) sees 3 of them as EMPTY cells; the saved file still holds the formulas for openpyxl itself: {"G8":"=D8*E8","G9":"=D9*E9","G20":"=SUM(G8:G18)"}
§SWPP-LIMIT add-up-check subtotal cell G20 reaches the engine as null and amount G8 as null after this re-save: with a blank printed subtotal the engine runs NO adds-up check, so the file is filed unchecked
§SWPP-LIMIT astral-character original=[... 1f600 ...] after-resave-read-by-SheetJS=[... f600 ...] after-resave-read-by-openpyxl=[... 1f600 ...]
§SWPP-LIMIT pdf-page formula-cells ["C28","D28","E28","F28"] (the totals): empty after the re-save for the same reason; the other 140 report cells are unchanged
```
Kept (judged): every `_door_*` sheet still hidden (very hidden stayed very hidden; the mutant that un-hides them is killed); the ledger and history lines byte for byte, and both still verify (`SheetHistory.verify` and `ws_kernel.verifyJournal`); the 28 - 3 plain cells of the sheet and the 451 text cells
(accents, a CJK character); the date cell still reaches the engine as `2026-11-20`. The re-saved workbook opened in the REAL `file_it.html` is FILED, its ledger replays, the chain is 2 entries (seq 1, 2, the second linked to the first) and the new invoice has the fingerprint the ORIGINAL file gives
in node. The PDF page's own `.xlsx` (Report + hidden `_door_source` + very hidden `_door_history`): hidden flags kept, history line identical and verifying, 140 of 144 report cells unchanged.
**Two findings from the loss table (neither fixed here; both are the READER's):** (1) a writer that does not calculate (openpyxl) saves a formula with no cached result; `erp/xlsx.mini.min.js` then yields NO cell, so the amount cells and the printed subtotal vanish and File it files with its
adds-up check silently off (the S1 rule: a blank subtotal is not checked). Excel, WPS and LibreOffice are expected to keep cached results (UNKNOWN until WPS runs); the hazard is a workbook whose formula results are missing, which the engine cannot tell from one that never printed a subtotal.
(2) a character beyond U+FFFF (an emoji) stored by another writer as an INLINE string is read by the vendored SheetJS as U+F600 (the writer is right: openpyxl reads its own file back as U+1F600; SheetJS reads its OWN shared-string files right). A cell of the user's text holding an emoji would
then make the next Check history report the sheet history as edited. Excel and LibreOffice write shared strings; WPS UNKNOWN. A fix belongs in the vendored reader or a pre-pass, a separate slice.

**Q3 — both pages at a phone viewport (headless Chromium EMULATION: 390 x 844, pixel ratio 3, mobile flag, touch events; no user agent was set; NOT a phone: no phone memory, CPU or WebView):**
```
§DOOR-MOBILE page=file_it.html viewport=390x844 dpr=3 touch=true emulated=true requests=59 firstLoadBytes=33695207 (to the engine ready; the page alone was 2041322) bootMs=887 fileMs=126 jsHeapMBAfterBoot=123 jsHeapMBAfterFiling=42 scrollW=390 innerW=390 (device emulation, not a phone)
§DOOR-MOBILE page=pdf/index.html viewport=390x844 dpr=3 touch=true emulated=true requests=9 firstLoadBytes=753851 openMs=276 jsHeapMBAfterLoad=4 jsHeapMBAfterRead=6 scrollW=390 innerW=390 (device emulation, not a phone)
```
Both pages: `scrollWidth == innerWidth` (no horizontal scroll) on load and with the document, its books (file_it) or the read-as-sheet grid (PDF page) on screen; the file control opened a file by TAP through a real chooser; the workbook filed (FILED) and the trial-balance PDF opened and read (ADDS_UP, 144 cells).
Weight: file_it.html is 33.7 MB to first use (the seed) and 123 MB of JS heap at boot on desktop Chromium; whether a phone tab survives that is UNKNOWN (§9.5; the PERF BUDGET puts a phone near 0.6 GB per tab, unverified). The PDF page is 0.75 MB and 6 MB of heap.

**The mobile answer, from sources (§11.1):**
1. **WPS mobile (Android / iOS) running WPSJS add-ins: UNKNOWN.** No WPS page that says so was readable (the docs site is a script-rendered page that returns an empty shell); the official toolkit `wpsjs` 2.2.3 has install and debug branches for Windows, macOS, Linux and PC HarmonyOS and none for Android or iOS, and its install page talks to a local service of the
   desktop client on port 58890; one uncited community post (self-described as 2021 information) claims all platforms and is not relied on. **Excel mobile running Office add-ins:** Microsoft's availability table (`ms.date` 2026-08-13) lists Excel on **iPad** (Microsoft 365, task pane) and does not list Excel on iPhone or Android.
2. **Recommendation that follows:** desktop = the menu inside the app (Excel add-in, WPS add-in); phones = our URLs with the user's own file, no add-in: `file_it.html` and the PDF page fit a 390-px width and work by touch in emulation, with the 33.7 MB first load of `file_it.html` as the open cost; a user on an iPad with Microsoft 365 could also load the Excel add-in (not tried).
3. **What this does NOT settle:** a real phone, WPS mobile's own capabilities, and whether a WPS-saved workbook behaves as the stand-in did (WPS's writer was not run).

**Findings (each from a check or a measurement):**
0. **The WPS docs site cannot be read by a fetch tool; the add-in layout and the object-model names came from WPS's own published packages `wpsjs` and `et-jsapi-declare`** (names and shapes, not behaviour). 1. **`EtApplication` is `@deprecated`** in those typings in favour of the global `Application`; the task's `wps.EtApplication()` is not used.
2. **`CustomTaskpane.Navigate(url)` exists**: the Excel add-in's open question (does a second button re-navigate the pane to its `?action=`) has a documented WPS answer on paper: `GetTaskPane(id).Navigate(url)` (P7 runs it on the fake). 3. **The shim did not change; the Excel layer exported two helpers** (`textForCell`, `strRow`) so the WPS layer reuses one value rule.
4. **Pane choice by what exists:** `taskpane.js` picks the WPS host when `window.Application.PluginStorage` exists and writes the Office.js `<script>` only otherwise (a WPS pane must not wait on a Microsoft CDN); the manifest tool needed `wps_host.js` and `wps/main.js` registered, its Office.js tag entry removed, and wrote a `CACHE_VERSION` bump in `erp/sw.js` and an unrelated `uses` change that were both reverted
   (`sw.js`, `idempiere.html`, `ws_kernel.js` untouched). 5. **Witness defects found by running it:** the first page run showed LibreOffice cannot load a spreadsheet here (a would-be PASS never ran); a P7 check failed after the manifest tool added `?v=` to `index.html`'s script tag (the check now accepts it).

**Not yet (stated, not hidden):** REAL WPS (desktop on Windows / Linux / macOS) and WPS mobile are not run. In particular UNKNOWN until WPS runs: whether a pane served from `https://red1oon.github.io/…` receives `window.Application` at all (the scaffold's pane is a local file); a date cell's `Value2`; whether `Sheets.Item` is 1-based and
`Sheets.Add()` activates the new sheet; whether the `@` text format is honoured; the ribbon rendering; the install flow (`publish.xml`, port 58890 — written from the tool's source, not run; the macOS in-app install is reported broken by one forum poster, §11.1 [S-C]); WPS's own xlsx writer (openpyxl only); a real phone; the two reader findings above (cached formula results, astral inline strings) are open;
the witnesses are not wired into CI.

**Merged and deployed (2026-11-27):** bim-ootb PR #3486 merged as `9561b7ce` (CI fast-checks, e2e-tests, live-json-editor green; the deploy to GitHub Pages ran on that commit). Fetched back: `https://red1oon.github.io/bim-ootb/erp/sheet_addin/wps/ribbon.xml` 200, byte-identical to the merged file (825 bytes, `<customUI ...>`), so is `wps/jsplugins.xml` (134 bytes);
`wps/index.html`, `wps/main.js`, `wps/ribbon.js` (the deploy's minified build, the global handler names `OnAddinLoad`, `OnAction`, `GetImage` and the table `ACTION_OF` intact), `wps_host.js` and `taskpane.html` all 200. Nothing was installed into a WPS (none here): the URL WPS would be given is `https://red1oon.github.io/bim-ootb/erp/sheet_addin/wps/`.

## 12. A check that cannot run must say so (fix) — spec 2026-11-27, before code
**Defect (found by the WPS slice, §11.5 findings 1 and 2).** A workbook re-saved by a writer that stores NO cached result for a formula (openpyxl stand-in) is read with
those cells EMPTY. `G8`/`G9` (line amounts) and `G20` (subtotal) of the sample invoice reached the engine as blank, so "File it" filed the invoice with D3's adds-up check silently
OFF: a blank subtotal is "not checked" (§2), and the engine could not tell "no subtotal printed" from "a subtotal whose result is missing". Same class on the PDF page's `.xlsx`
totals (`C28`-`F28`) if they were ever read back. A check that silently does not run is a false pass. Second, smaller defect: a character beyond U+FFFF stored as an INLINE string
is read by the vendored SheetJS as U+F600, so Check history would report an untouched history as edited (the entry's payload digest no longer matches).

**Rule 1 — formula without a value is not blank (D10 NO-SAVED-RESULT).** A tagged cell the engine READS that holds a formula but no saved result is refused, never treated as empty.
- Which cells: every header cell the engine reads (`partner`, `date`, `docno`, `subtotal`, `grandtotal`) and, for a row that is filled (a product or charge printed, or the
  product/charge cell itself is a formula without a result), every line column. The unfilled rows of the range are not read (§2: a row with no product and no charge is empty).
- Verdict `REFUSED`, nothing declared, zero ledger lines, the status cell says (cells named: header cells first, then the rows in order):
  *"Not filed: cell G20 holds a formula with no saved result; open and save the file in your spreadsheet program, or type the figure"* (several: *"cells G20, G8 and G9 hold formulas with no saved result; ...or type the figures"*).
- Option (b), the engine computing the formula itself, is REJECTED: the engine never parses formulas (it would be a second spreadsheet), and a SUM over tagged cells is exactly the
  case where being wrong files a wrong invoice. The user's own program computes it; one open-and-save fixes the file.
- How the engine knows: the engine never parses a file format (§1), so the HOST says it. Host interface, ONE optional addition: `noSavedResult(sheet, addrs) -> [addrs]` = the
  addresses among `addrs` that hold a formula and no saved result. `host_shim.js` asks it right after `readCells` (when the host has it) and hands the list to the runner as a 4th
  argument `file(tpl, cells, ledgerLines, noSavedResult)`, which hands it to the engine as `opts.noSavedResult`. `xlsx_host.js` implements it: the workbook must be read with
  `sheetStubs: true` (added to `READ`) because without it SheetJS DROPS a formula cell that has no `<v>` (measured: `r.xlsx` G8 `undefined`; with stubs `{t:'z', f:'D8*E8'}`),
  so the formula is not even visible. Excel and WPS live hosts: a formula cell ALWAYS has a value (the program calculates), so they have no such method and the list is empty.

**Rule 2 — a blank is blank, and the verdict says which checks ran (D11 CHECKS-RAN).** A tagged `subtotal` / `grandtotal` whose cell is truly EMPTY (no value, no formula) still means
"the sheet prints none": the check is not made and the filing proceeds. It is no longer silent. Every verdict carries `ran` and `checksLine`:
`checks: line=ran subtotal=ran grandtotal=absent linenet=ran`. States: `ran` (compared), `absent` (nothing printed to compare: cell empty, or the template does not tag it),
`no-saved-result` (Rule 1 refused on it), `not-reached` (an earlier refusal stopped first). `line` = qty x price == printed amount; `linenet` = printed amount == the filed line net after the import.
It is in the `§SHEET_DOOR` log line, the shim result, the pane and `file_it.html`. When a check is `absent` although the template TAGS its cell (the user may believe it ran), the status
cell adds *"; not checked: subtotal (none printed)"*; a template that never tagged it adds nothing there. The TWIN rule holds: no invoice logic is added, only the door's own sheet checks.

**Rule 3 — no astral character in a hidden cell (H-ASTRAL).** The loss is in the VENDORED reader (inline string, 4-byte UTF-8); `erp/xlsx.mini.min.js` is not patched. The class is removed
at the writer: every line the shim appends to `_door_history` / `_door_ledger` is ASCII-escaped for characters beyond U+FFFF (`😀`; a JSON string, so `JSON.parse` returns the SAME text and
every digest is computed on parsed values, never on the line text). Old workbooks (raw astral characters in a line) verify unchanged and are normalised to the escaped form the next time a
line is appended. Limit that stays: an emoji typed into a VISIBLE cell and re-saved by an inline-string writer is read back as U+F600 by this reader (Stamp would record a change);
it is a reader limit named here, not fixed. Check history on an already damaged history says "edited" as before (a hint on lone surrogate / private-use characters was considered and NOT built: it would name a cause it cannot prove).

**Claims.** Each names the issue it exposes and can fail:
| ID | Claim | Issue exposed | Falsifier (mutant) |
|----|-------|---------------|--------------------|
| D10 | the openpyxl re-saved sample (G8, G9, G20 without results) is REFUSED, the reason names those cells and says why, status cell the same, zero `_door_ledger` rows, zero journal entries | the adds-up check silently off | formula-without-value treated as blank |
| D10b | the engine alone: `opts.noSavedResult` naming a header total / a filled line amount refuses; naming an unfilled row's amount does not | the rule over-refuses or under-refuses | unfilled-row exemption dropped; flagged list ignored |
| D11 | a normal workbook files as before (same invoice fingerprint) and says `checks: line=ran subtotal=ran grandtotal=ran linenet=ran`; a template without `subtotal` files and says `subtotal=absent`; a tagged but empty subtotal says `subtotal=absent` and the status cell adds the not-checked note | a check that does not run is invisible | the checks list not reported |
| H-ASTRAL | a history entry holding U+1F600 survives the openpyxl re-save and verifies; the stored text holds no character beyond U+FFFF; an old (raw) workbook verifies and is normalised on the next append | Check history calls an untouched history edited | escape dropped |
| HOST | a re-saved file read WITHOUT `sheetStubs` cannot see the formula (so `READ` must carry it) | the host silently loses the fact | `sheetStubs` dropped from READ |

**PDF page side.** Answered by reading the code, recorded in RESULTS below.

### 12.1 RESULTS (2026-11-27, bim-ootb `fix/door-check-must-run`, PR #3488)
Built as specified; logs read (`§SDOOR-*`, `§SADDIN-*`, `§FILEIT-*`, `§SWPP-*`). Verdict lines:
```
§SDOOR-VERDICT PASS judged=33 failed=0 (D10 7, D11 5)        §SDOOR-MUTANTS killed=11/11
§SADDIN-VERDICT PASS judged=63 failed=0 (A11 4, A6/A8 re-stated) §SADDIN-MUTANTS killed=14/14
§FILEIT-VERDICT PASS judged=53 failed=0 (F12 9, F13 4)       §FILEIT-MUTANTS killed=9/9  §FILEIT-NODE-MUTANTS killed=6/6
§DOORERP-VERDICT PASS judged=47 failed=0                     §DOORERP-MUTANTS killed=13/13
§SWPS-VERDICT PASS judged=55 failed=0                        §SWPS-MUTANTS killed=8/8
§SWPP-VERDICT PASS judged=28 failed=0 (was 27; +page-refuses)  §SWPP-MUTANTS killed=3/3
§SHIST-VERDICT PASS judged=20 failed=0                       §SHIST-MUTANTS killed=5/5
§NOSAVED (F12) verdict=REFUSED text="Not filed: cells G20, G8 and G9 hold formulas with no saved result; open and save the file in your spreadsheet program, or type the figures" checks: line=no-saved-result subtotal=no-saved-result grandtotal=not-reached linenet=no-saved-result
```
Existing counts moved only where I added checks (door 21 to 33, addin 59 to 63, file_it 40 to 53, wps page 27 to 28); the three witnesses that quote them (W-FILE-IT F11, W-DOOR-ERP E10) were updated to the new numbers.
- **D10.** The openpyxl re-saved sample is REFUSED naming G20, G8, G9; zero ledger rows, zero journal entries, no invoice, only G24 written. The remedy the message offers works: the same file with the three figures typed is FILED, every check ran. An unfilled row's flagged amount (G12) does not refuse (mutant: exemption dropped, killed).
- **Reader fact (measured).** SheetJS 1.2.1 as vendored DROPS a formula cell that has no `<v>` unless read with `sheetStubs: true`; then it is `{t:'z', f:'D8*E8', v:0}`. The `v:0` is NOT a saved result: `xlsx_host.js` treats `t:'z'` as no value (mutant N3 reads it as 0, killed; mutant N1 drops `sheetStubs` from READ, killed).
- **D11.** Normal workbook: same invoice fingerprint as the oracle, `checks: line=ran subtotal=ran grandtotal=ran linenet=ran`, status cell unchanged. A template without a subtotal tag: FILED, `subtotal=absent`, status unchanged. A tagged but empty subtotal: FILED, `subtotal=absent`, status `...; not checked: subtotal (none printed)`.
- **H-ASTRAL.** The misread is in the vendored reader (inline string, openpyxl's writer). After the fix a stamped history holding U+1F600 is stored as `\ud83d\ude00`, survives the openpyxl re-save and `Check history` says OK; an old workbook with a raw emoji line verifies, and the next Stamp normalises it (mutants: escape dropped N5, old lines not normalised N6, both killed). Still open, a reader limit not fixed: an emoji typed into a VISIBLE cell and re-saved by an inline-string writer reads back as U+F600, so a later Stamp would record a change in that cell; and an already damaged history still says "edited" (no hint added: the escape removes the class for new entries, and a heuristic on private-use characters would claim a cause it cannot prove).
- **WPS page witness (27 to 28).** Its Q2 used to open the re-saved workbook in the real `file_it.html` and expect FILED: that was the false pass. It now expects REFUSED naming the cells, then FILED with the figures typed in (ledger replays, chain of 2, same books). Its `§SWPP-LIMIT` lines were reworded to say the door now refuses.
- **PDF page (item 5).** `pdf/` only WRITES an `.xlsx` (`pdf_history.js` `xlsxBytes`, `report_reader.js` `toWorkbook`); no code in it reads one back. The only path that reads an `.xlsx` back is `xlsx_host.js` (File it / Stamp), now covered; the PDF page's total cells `C28`-`F28`, if tagged by a template, are refused the same way.
- **Not done / stated:** real Excel and WPS not run (a live formula cell always has a value, so `noSavedResult` is absent there; unverified on WPS until it runs); `READ` must carry `sheetStubs` for any other caller that reads a workbook file for the door (only `file_it.js` does).

## 13. Real WPS on this machine: its writer judged, its menu impossible here (spec + results)
Owner brief 2026-11-27: run the REAL WPS Spreadsheets that is installed here against the front-door workbooks, replacing the §11.4 stand-in (openpyxl) with WPS's own xlsx writer.
Code (bim-ootb): `erp/tests/witness_sheet_wps_real.js` (node, W-SHEET-WPS-REAL); it is the §11.3 Q2 judgement re-run with the real writer. Spec written before the code (this block); results are appended below under 13.4.

### 13.1 Facts the brief started from (verified 2026-11-27, before any run)
WPS = snap `wps-office 10.1.0.6757` (launchers `/snap/bin/wps-office.et` Spreadsheets, `.wps`, `.wpp`); `xvfb-run`, `Xvfb`, `xdotool`, `xprop` exist. Every WPS launch is inside its own Xvfb display, `env -u DBUS_SESSION_BUS_ADDRESS`,
`LIBGL_ALWAYS_SOFTWARE=1`, killed at the end (only the PIDs the witness started); the owner's real screen is never used. The snap sandbox cannot read `/tmp`: fixtures live in a non-hidden directory under `$HOME`, made and deleted by the witness.

### 13.2 Claims (verdict lines `§WPSR-<case> verdict=PASS|FINDINGS|FAIL|INCONCLUSIVE judged=N findings=M failed=K`)
A FINDING = a measured difference between the WPS-saved file and the file WPS was given: reported, never patched here. FAIL = the harness itself is wrong (a control not detected). INCONCLUSIVE = WPS, Xvfb or xdotool missing, or WPS did not write the file (nothing to judge).
| ID | Claim | Issue it exposes | Falsifier (red control) |
|----|-------|------------------|-------------------------|
| W1 WROTE | WPS opened the lane's filed + stamped sample invoice workbook (hidden `_door_tags` / `_door_ledger` / `_door_history`, a >32,767-char history entry in chunks, one emoji, accents, one CJK cell) and the PDF page's trial-balance `.xlsx`, saved each as .xlsx with its own writer: output bytes differ from input, and the file carries a WPS signature (the `www.wps.cn` namespace in its sheet XML). `§WPS-RESAVE file= app="..." bytesIn= bytesOut= ms=` | a "re-save" that never happened passes every later check | C1: the same launch with the save step skipped must read NOT-WRITTEN (bytes equal, no signature); C2: the un-saved original must not carry the signature |
| W2 KEEP | Per attribute, WPS-saved vs given: each `_door_*` sheet's hidden state (0 visible / 1 hidden / 2 very hidden); ledger, history and tags chunk text byte for byte and still verifying (`SheetHistory.verify`, `ws_kernel.verifyJournal`); formulas G8 G9 G20 and their cached values as the vendored SheetJS reads them; the date cell as the engine sees it; the plain cells; the emoji cell; the 450 text cells; PDF page: hidden flags, history, formula cells C28-F28 and the other 140 | a writer that drops the hidden state, a chunk character, a cached result or an astral character | measured, not mutated: each attribute prints given and got |
| W3 FILE | The WPS-saved invoice workbook opened in the real `file_it.html` (headless Chromium, `--no-sandbox --disable-gpu`): the verdict, the chain (2 entries, the second linked to the first) and the C_Invoice + lines + Fact_Acct fingerprint equal the original file's in node | the front door files differently (or not at all) a workbook WPS saved | the original's fingerprint is computed in node by the same code |
| W4 MENU | Whether the WPSJS menu can run in this build: static evidence (the add-in runtime files the toolkit expects, strings of the add-in manager) and, opt-in `WPSR_MENU_PROBE=1`, a registration probe (a `publish.xml` and `jsplugins.xml` pointing at a local server in the snap's own data dir, removed afterwards; a request for `ribbon.xml` would mean the add-in was loaded). Stated as evidence, never as a verdict on WPS in general | the menu slice (§11) assumed WPS could host it | none: a probe; the witness prints what it saw |
Verdict line ends: `(real WPS <version> writer under Xvfb; the WPS menu NOT run: this build has no JS add-in runtime)`.
**Not claimed:** WPS on Windows / macOS / mobile; WPS's menu (W4 is only about this build); that a differing attribute is "wrong" (it is reported as a FINDING for the owner of the reader / writer).
Privacy: a WPS-saved file carries WPS's own user name in `docProps` (checked, redacted in logs); no WPS-saved workbook is committed.

### 13.3 Method notes (what the driving needed; all text evidence, no screenshot is evidence)
Open: `/snap/bin/wps-office.et <file>` in a private `Xvfb`; the document window title ends `Spreadsheets` (`xdotool search --name`). A modal **"System Check"** window (WPS's own font check: "Problems below are detected in the system ... Do not report again ... Close") appears a few seconds later on every launch; it is closed by a click on its Close button at the dialog's lower right corner (no account, EULA or login dialog appeared at any point; the snap had been run before, first-run state existed). Save: focus the window, click a cell, `Ctrl+S`: **no "keep format" dialog** appeared (title goes `x.xlsx * - Spreadsheets` -> `x.xlsx - Spreadsheets`, a window titled `Form` (a cloud-save notice) opens and is ignored); the output file's bytes change in place. Close: `Ctrl+Q`, then SIGTERM/SIGKILL of the PIDs this run started. Windows seen are logged as titles.
Two dead ends, stated: `strace` cannot wrap the snap (`snap-confine ... cap_dac_override not found`), and running the snap's wrapper outside confinement fails on its own environment, so file-open events of WPS could not be traced; the menu evidence is therefore static strings plus a registration probe (13.4, W4).

### 13.4 RESULTS (2026-11-27, bim-ootb `test/wps-real-writer`, PR #3487; WPS 10.1.0.6757, three launches per run, ~13-16 s each)
Commands: `env -u DBUS_SESSION_BUS_ADDRESS node erp/tests/witness_sheet_wps_real.js` (add `WPSR_MENU_PROBE=1` for the W4 registration probe). Log read, not the exit code. **REAL WPS RAN; its writer is no longer UNKNOWN.**
```
§WPS-RESAVE file=wps_filed_stamped.xlsx app="SheetJS" bytesIn=37365 bytesOut=24278 ms=13030 wpsNamespace=true zipDates=["2012-07-02"] customProps=true lastModifiedBy=<local OS user: redacted> appGiven="SheetJS" handled=["System Check: Close clicked"]
§WPS-RESAVE file=pdf_page.xlsx app="SheetJS" bytesIn=32255 bytesOut=19877 ms=16232 wpsNamespace=true ... appGiven="SheetJS"
§WPS-RESAVE file=control_nosave.xlsx(save skipped) bytesIn=37365 bytesOut=37365 wpsNamespace=false verdict=NOT-WRITTEN          <- red control C1
§WPSR-W1 FINDINGS judged=7 findings=3 · §WPSR-W2 FINDINGS judged=18 findings=1 · §WPSR-W3 PASS judged=3 · §WPSR-W4 PASS judged=2 (probe on)
§WPSR-VERDICT FINDINGS judged=30 findings=4 failed=0 (real WPS 10.1.0.6757 writer under Xvfb; the WPS menu NOT run: this build has no JS add-in runtime)
```
**What WPS's writer KEPT (each judged, same checks as the openpyxl stand-in in §11.4):**
- All three `_door_*` sheets keep their hidden state: `_door_tags`, `_door_ledger`, `_door_history` very hidden 2 -> 2 (the stand-in also kept it); the PDF page's `_door_source` hidden 1 -> 1 and `_door_history` 2 -> 2.
- Ledger (11,567 chars), tags (308), history (93,658 chars in 3 chunks of one row): byte for byte; `SheetHistory.verify` and `ws_kernel.verifyJournal` accept the saved history AND ledger. The 32,767-character cell limit did not truncate anything (WPS wrote 3 cells per row as given).
- **Formulas WITH their cached results** (the stand-in dropped the result, §11.4 finding 1): G8 `D8*E8` = 123.5, G9 = 30, G20 `SUM(G8:G18)` = 153.5 read by the vendored SheetJS; the engine reads G20, G8, G9 and the date F3 (`2026-11-20`) identically from the WPS-saved file, so the add-up check still runs. The §11.4 "formula with no saved result" hazard does not arise from WPS.
- The 25 non-formula cells of the Invoice sheet, the 451 text cells of `Data` (accents, a CJK character), and **the emoji cell U+1F600 intact** through the vendored reader (the stand-in's inline-string writer broke it to U+F600; WPS writes shared strings, §11.4 finding 2 does not arise from WPS). PDF page: the 140 non-formula report cells unchanged, history line identical and verifying.
- **W3: the WPS-saved invoice workbook FILED in the real `file_it.html`**: verdict FILED ("Filed. AR Invoice WPS-0002 ... (Completed)"), chain of 2 (seq 1, 2; second linked to first), and the C_Invoice + lines + Fact_Acct fingerprint (658 bytes) is identical to the original file's second filing in node.
**What it CHANGED or LEFT (findings 1-3 are the witness's 4 FINDING check lines: app x2 files, user name, residue; item 4 is a note; none patched here):**
1. **Producer metadata does not name WPS.** `docProps/app.xml` `<Application>` is the GIVEN file's own ("SheetJS") on both files; WPS keeps it. A reader cannot tell a WPS-saved file from that field. What does show it: the `www.wps.cn/officeDocument/2017/etCustomData` namespace declared in every sheet's XML, a `docProps/custom.xml` part, and every zip entry dated 2012-07-02 (the witness uses the namespace as the signature).
2. **WPS writes the local OS user name into `docProps/core.xml` `<cp:lastModifiedBy>`** of both files (`creator` is the given file's). A workbook that is filed or sent on carries that name. A reader-side or export-side scrub is a separate slice.
3. **WPS recalculates on load and stores its own cached results**: on the PDF page's trial-balance workbook the totals C28 and F28 were saved as `4.76528538850829e-15` and `2.41234116016287e-13` where the page had written `0` (D28, E28 = 40392.44 identical). The formulas are kept; only float residue differs, but a check that compares a printed total to exactly 0 (or to the page's rounded sums) sees a difference after a WPS re-save. The Invoice sheet (G8, G9, G20) showed no residue.
4. Number format of the date cell F3: `yyyy-mm-dd` -> `yyyy\-mm\-dd` (same display, escaped text); the engine still reads `2026-11-20`. (Printed in `§WPSR-LOSS ... number-format-diffs`; not a check line.)
**Compared with the stand-in:** the stand-in lost the cached formula results and the emoji; WPS keeps both and adds the residue and the user-name finding. The stand-in's "very hidden stays very hidden" and "chunks byte for byte" hold for WPS too.

**W4 - the WPS menu cannot run in this build (evidence, stated as such):**
- Static: `office6/` has 131 files and none is named jsapi / jsplugin / jsaddon / cef / wpsjs / v8 / chromium; the add-ons dir holds `docpermission, homepage, kfeedback, kfeedbackcmds, kwpsartstyleborder, officespace, qing` only; the web stack shipped is QtWebKit 4.9 on Qt 4.7. **Correction to the brief's premise:** `libkso.so` DOES contain the client-side classes `KJSPlugin` / `KJSPluginManager` (download, cache-load) and the strings `jsplugins.xml`, `/wps/jsaddons/` and `PluginStorage`; so "no trace of an add-in manager" is false, "no add-in runtime files" is true.
- Dynamic (`WPSR_MENU_PROBE=1`, the only non-passive step, reversible): `publish.xml` and `jsplugins.xml` naming an online add-in (`type="et"`, the §11.1 format) at a local http server were placed in the snap's own `~/snap/wps-office/1/.local/share/Kingsoft/wps/jsaddons/` (the Linux path of §11.1 [S-A] under the snap's HOME), WPS was opened on a workbook and watched for 50 s: **0 requests reached the server** (so no `ribbon.xml` fetch), the window titles show no add-in window, and the directory was removed afterwards (it did not exist before). A different path the manager might read cannot be excluded: it is NOT a proof for all WPS builds.
So the §11 WPSJS menu is still proven only against the fake object model; the question "does a remote https pane receive `window.Application`" stays UNKNOWN and needs a WPS build that loads the registration (Windows/macOS desktop). The no-add-in route (this section: WPS-saved file -> `file_it.html`) is now proven with the real writer.

**Not claimed:** WPS on Windows / macOS / mobile; any WPS version other than 10.1.0.6757; that the residue (finding 3) breaks the PDF page's own checks (not run: the page's reader of an uploaded workbook is not part of this slice); anything about the ribbon. No WPS-saved workbook is committed (they carry the local user name); the witness regenerates them in a run directory under `$HOME` and deletes it. Cleanup after each run is logged (`§WPSR-CLEANUP ... stillRunning=none`).

## 14. The history page — any spreadsheet file gets a memory, no add-in (spec)
Spec 2026-11-28, before code. Owner, 2026-11-27: *"history is lacking in Excel. It is a missing killer... Proceed."* Owner, 2026-11-28:
*"Film 2 poated. So next can be 3rd film with history feature also?"*
**The hole this closes.** The history ENGINE (§6) is witnessed: record, verify, as-of replay, cell story, merge of two copies. A user reaches
only part of it: the PDF page shows entries and a cell's story; Stamp / Cell history exist only in the Excel / WPS menus, which have never
run in a real app (§8.3, §13 W4); **as-of (rewind) and merge have no screen at all**. Stage 1 (▶▶ block: standalone, no ERP in sight).

### 14.1 Design
- **One plain page**, bim-ootb `erp/sheet_addin/history.html` + `history.js`: the user opens their own `.xlsx` with the browser's file
  control (File API; nothing is uploaded), and gets the workbook back by download. Model: `file_it.html` (§9).
- **One implementation per responsibility.** Entries are made, verified, replayed, storied and merged by `erp/sheet_history.js`; they are
  stored by `host_shim.js` (one entry = one row of chunks in the very hidden sheet `_door_history`, ASCII-escaped, §8 / §12); the workbook
  file is read and written through `xlsx_host.js`. Stamp IS the shim's `stamp()`, the story IS the shim's `cellHistory()`. The page holds
  no hashing, no diff, no chunking and no merge rule of its own. Two small additions to shared code, each the inverse of something already
  there: `xlsx_host.writeSheetValues(sheet, cells)` (the inverse of `readSheetValues`: a rewound or merged sheet put back into the
  workbook) and `shim.history` (`lines()`, `append(line)`, `keep(n)`: the shim's own private row writer, exposed, so no second chunk writer exists).
- **No kernel, no seed.** The page loads SheetJS, the history engine, the shim, the file host and its own script. Verification on the
  page is the engine's own `verify` (WebCrypto); the kernel's `verifyJournal` is NOT loaded there. The witness runs `verifyJournal` in node
  on every downloaded file, so the "one format with the ERP journal" claim (H2) is still judged on what the page writes.
- **Open.** No `_door_history` → the page says so and offers Stamp (genesis = every non-empty cell of the visible sheets). History present
  → verified, then BOUND to the cells now in the file (replay to the last entry, `diff` against the sheet):
  `intact` · `changes since the last stamp` (each cell listed with before → now; this is not an error, it is exactly what the next Stamp
  records) · `edited history` (the entry named, with the engine's reason).
- **Who.** A name the user types. It is written into every entry they stamp, so it is kept in the workbook; the field is pre-filled from the
  name this browser last used, else from the workbook's last entry (said next to the field, so a copy received from someone else does
  not silently stamp under the sender's name). The page says in words that it is a typed name, **not a signature**.
- **Stamp** = one entry for all changes since the last stamp, `typedOverFormula` shown per cell, NO-OP when nothing changed (nothing written).
- **A broken history: Stamp REFUSES (decided).** The shim's `stamp()` already refuses a history that does not verify; the page keeps that
  one behaviour rather than add the PDF page's "new history that records the break" (`PDF_EDITOR.md` §4.6), because here the user still
  holds the file and can go back to an untampered copy. On a broken history the page shows the named entry and nothing else: no story, no
  rewind, no merge, no download of a "stamped" file.
- **Cell story.** Click (or tap) a cell in a plain grid of the sheet: every value it had, who, when.
- **Rewind.** Pick an entry N → the grid shows the sheet as recorded after entry N (`asOf`), the cells that entry changed are marked.
  "Download this version" = a separate file `<name>_as_of_step_N.xlsx`: the visible sheets hold the step-N cells, `_door_history` holds
  entries 1..N only (it re-opens as intact at step N). A sheet that did not exist at step N is left in the file, empty.
- **Merge two copies.** Open a second `.xlsx`. Refused in words when: it has no history; its history does not verify (entry named); it shares
  no first entry with the open file; either copy holds changes that were never stamped (cells named: stamp that copy first, the merge works
  on recorded history only). Otherwise the engine's `merge` gives `applied` and `conflicts`; each conflict is shown with BOTH values and who
  made each (the last entry of each side that set the cell) plus the value before both; nothing is written until every conflict has a
  pick (mine / theirs / the value before both).
- **How a merged history is stored (engine extension, minimal).** The engine could not express a persisted merge: `merge` returns a
  snapshot, not an entry. New `SheetHistory.mergeEntry(a, b, picks, actor, at)` → ONE entry appended to the open file's own chain:
  its `ops` are the cells that change in the open file (the other copy's edits plus the picks), `meta.merge = { fork, other, otherEntries,
  picks }` where `other` is the other copy's head hash (meta is inside the entry hash, so the merge is tamper-evident), and
  `payload.theirs` = the other copy's entries after the fork, carried whole. `verify` checks a merge entry's carried entries: the shared
  prefix + `theirs` must itself verify and end at `meta.merge.other`. `cellStory` shows the carried entries (who and when on the other
  side) before the merge entry's own line. The chain stays linear, so the kernel's `verifyJournal`, `asOf`, Stamp and the Excel shim read
  a merged history with no change. A copy already merged (its head is some entry's `meta.merge.other`) is a NO-OP.
- **Limits said on the page:** cell styles (colours, widths, borders) are not kept in the downloaded file (SheetJS community build, §9.5);
  edits between two stamps fold into one step (§6.2); a removed `_door_history` is not noticed (needs signing).
- Grid: at most 200 rows x 40 columns of a sheet are drawn (said when cut); history and merge always work on every cell.
- Logs `§SHIST-PAGE-OPEN / -BIND / -STAMP / -STORY / -REWIND / -MERGE / -DOWNLOAD / -COST` (cost: requests, bytes, ms, heap).

### 14.2 Claims (W-HISTORY-PAGE `erp/tests/witness_history_page.js`; verdict line `§HPAGE-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M threw=K`)
Headless Chromium on the real page over a local static server, real file chooser, real downloads; every downloaded file re-read in node.
What is judged on the page is what the user SEES (the DOM), compared with the engine run in node on the same file. A mutant that makes its
case throw is CRASHED, not a kill. No browser → the browser cases judge nothing → INCONCLUSIVE.
| ID | Claim | Issue it exposes | Mutant |
|----|-------|------------------|--------|
| P1 DAY | Real `erp/ninja_sample.xlsx`: no history → said, Stamp writes genesis (every non-empty cell). The file edited OUTSIDE (node, as another program would: B6 changed, a note added, 600 typed over the SUM in B9), reopened: the page lists exactly those cells as "changes since the last stamp". Stamp → entry 2 holds exactly those cells, B9 flagged `typedOverFormula`. Stamp again → NO-OP, `_door_history` cell text unchanged | outside edits missed or invented; an empty stamp grows the file | outside changes not listed; NO-OP writes an entry |
| P2 FILE | Every downloaded workbook re-read in node: `SheetHistory.verify` AND the kernel's `verifyJournal` accept it; visible cells and formulas equal the input except the cells the user changed; `_door_history` very hidden; the Excel shim's own reader (`host_shim` Check history / Cell history) reads the same entries | a second format; the page damages the user's sheet | a stray cell written on download |
| P3 STORY | The story shown for a clicked cell equals the engine's `cellStory` (every value, who, when, formula typed over), for a cell with 3 values, a cell never changed and an empty cell | a partial or wrong per-cell history | story of the wrong cell |
| P4 REWIND | For EVERY step N the grid equals `asOf(N)` cell for cell and the marked cells equal entry N's cells; "Download this version" re-opens (page and node) as exactly that state with N entries that verify | time travel wrong; a rewound file that lies about its past | rewind off by one; rewound file keeps the full history |
| P5 MERGE | Two copies forked from one stamped file, each stamped by another name: different cells combine; the same cell set to 11 and 22 is ONE conflict showing both values and both names, and until picked nothing is written (Finish disabled, the workbook unchanged); same value on both sides is not a conflict; after the pick the merged file verifies (engine + kernel), holds the picked value and both sides' other edits, and its story names both people. Refused in words: an unrelated file; a copy with a hand-edited history (entry named); a copy with unstamped changes (cells named) | silent overwrite; a merge nobody can check afterwards | side B wins silently; unstamped copy merged anyway |
| P6 TAMPER | One recorded value edited inside `_door_history`: the page names that entry; Stamp is refused and the file's history is left as it was; no story, no rewind | an edited history accepted and built upon | tampered entry accepted |
| P7 LIGHT | The page loads no kernel and no seed: requests and bytes counted by the server, **ceiling 8 requests and 400,000 bytes** (the vendored SheetJS is 250,826 of them); no request other than GET, none leaving the origin, through open, stamp, merge and download | "nothing is uploaded" unproven; the ERP's 30 MB dragged in | kernel loaded |
| P8 PHONE | 390 x 844, touch: `scrollWidth <= innerWidth` on load, after open, after a stamp, with the story open and with a conflict shown; a Stamp made by tap records | the page is unusable on a phone | — |
| P9 WPS | A stamped workbook saved by the real WPS writer (§13 method; no WPS → INCONCLUSIVE for this case only): the history verifies, the page lists what WPS itself changed (if anything) as changes since the last stamp, and a Stamp after a further edit chains on | the history dies in the first real program | — |
| P10 COST | `§SHIST-PAGE-COST` requests, bytes, ms to ready, open ms, stamp ms, heap | unmeasured weight | — |
| E1 MERGE-ENTRY | Engine, node: `mergeEntry` refuses while a conflict has no pick; the entry it makes verifies (engine + kernel), `asOf` of it equals merged + picks; an edit inside the carried entries is caught at the merge entry; `cellStory` shows the other side's name; merging the same copy again is a NO-OP; W-SHEET-HISTORY (20 checks) unchanged | a merge that cannot be audited; a second merge logic in the page | carried entries not verified; picks ignored |
**Not claimed:** real Excel (NOT RUN: the page needs no Excel, and what Excel's own writer does to `_door_history` is unmeasured; WPS's is,
§13); cell styles in the download; a signed identity; rows / columns inserted (seen as many cell changes, §6.1 blind spot shared with a
snapshot diff); a real phone (device emulation only); files beyond what a browser tab holds.

### 14.3 RESULTS (2026-11-28, bim-ootb `feat/sheet-history-page`, PR #3489, merged `9c9578dd`)
Command: `HPAGE_MUTANTS=1 env -u DBUS_SESSION_BUS_ADDRESS node erp/tests/witness_history_page.js` (headless Chromium on the real page, real file
chooser, real downloads, real WPS 10.1.0.6757 writer for P9). Log read, not the exit code. **REAL EXCEL NOT RUN.**
```
§HPAGE-FIXTURE workbook=ninja_sample.xlsx sheets=3 cells=114 BACKUP!B9={"v":541.02,"f":"SUM(B5:B8)"} B6=100.7 B7=161.12 real=true
§HPAGE-P1 PASS 13 · P2 PASS 18 · P3 PASS 6 · P4 PASS 10 · P5 PASS 17 · P6 PASS 4 · P7 PASS 5 · P8 PASS 5 · P10 PASS 1 · P9 PASS 3 · E1 PASS 9   (threw=0 on every case)
§HPAGE-LOADED requests=6 bytes=313465 files=[history.html, xlsx.mini.min.js, sheet_history.js, host_shim.js, xlsx_host.js, history.js]
  page: §SHIST-PAGE-COST requests=6 bytes=313465 readyMs=50 heapMB=2 kernelLoaded=false scripts=5
  page: §SHIST-PAGE-STAMP verdict=RECORDED entry=1 cells=114 chunks=1 typedOverFormula=[] lineChars=14084 ms=3 heapMB=3
  page: §SHIST-PAGE-STAMP verdict=RECORDED entry=2 cells=3 chunks=1 typedOverFormula=["BACKUP!B9"] lineChars=706 ms=2 heapMB=4
  page: §SHIST-PAGE-MERGE verdict=CONFLICTS other=copy_b_edit.xlsx fork=1 mine=1 theirs=1 applied=["BACKUP!C5:a","BACKUP!C6:b","BACKUP!B8:both"] conflicts=["BACKUP!B7"]
  page: §SHIST-PAGE-MERGE verdict=RECORDED entry=3 ops=1 fork=1 otherEntries=1 otherHead=f06a6bdd51e9 picks=["BACKUP!B7:a"] lineChars=1285
§HPAGE-PHONE viewport=390x844 dpr=3 touch=true emulated=true load 390/390 open 390/390 stamp 390/390 story 390/390 rewind 390/390 conflict 390/390 merged 390/390 (device emulation, not a phone)
§HPAGE-COST pageRequests=6 pageBytes=313465 fileBytes: source=24938 stamped1=19533 stamped3=20385 merged=20790 historyChars: genesis=14084 all3=15356
§HPAGE-WPS-RESAVE wps=10.1.0.6757 ok=true bytesIn=19987 bytesOut=14025 ms=13206 wpsNamespace=true handled=["System Check: Close clicked"]
§HPAGE-WPS-BIND state=pending changedByWps=["Process!A2: =CONCATENATE(\"@\",C2,\"@\",B2) (@STALE_MOVED_ROW@99) → =CONCATENATE(\"@\",C2,\"@\",B2) (@i.documentno@2)"]
§HPAGE-NOTE openpyxl re-save (no formula results stored): history verifies=true hidden=2 page state=pending listed=20 of which formula cells whose value is gone=20 (formula cells in the workbook=20)
§HPAGE-NOTE the kernel's verifyJournal on the forged carried entry: ok=true (it checks the chain; the carried entries are the engine's verify to check)
§HPAGE-MUTANTS killed=15/15
§HPAGE-VERDICT PASS judged=91 failed=0 cases=[P1,P2,P3,P4,P5,P6,P7,P8,P10,P9,E1] all PASS (headless Chromium on the real page; P9 real WPS 10.1.0.6757 writer RAN; real Excel NOT run)
```
Mutants (12 served to the browser, 3 engine copies in node; a crash is not a kill, all `threw=0`): outside changes not listed→P1, NO-OP writes an
entry→P1, a stray cell on download→P2, story of the wrong cell→P3, rewind off by one→P4, rewound file keeps the full history→P4, conflict resolved
silently (side B wins)→P5, unstamped copy merged anyway→P5, Finish allowed before a pick→P5, tampered entry accepted→P6, kernel loaded→P7, page
forced wide→P8, carried entries not verified→E1, picks ignored→E1, merge entry made with a conflict open→E1.
Older witnesses re-run and read, unchanged: W-SHEET-HISTORY 20 (5/5), W-SHEET-ADDIN 63 (14/14), W-SHEET-DOOR 33, W-FILE-IT 53 (9/9 + 6/6),
W-SHEET-WPS 55 (8/8), W-SHEET-WPS-PAGE 28 (3/3), W-DOOR-ERP 47, W-PDF-HISTORY 57 (10/10) + page 19, W-SHEET-WPS-REAL FINDINGS judged=29 findings=4
failed=0 (the same four findings as §13.4; its WPS driver now lives in `erp/tests/wps_driver.js`, shared with P9: that witness +5 / −56 lines).
`gen_manifest --check` verdict=PASS; `erp/sw.js` CACHE_VERSION not bumped (the page is not precached). Diff: +1097 / −68.

**What was shown**
- **P1** a day on the real sample: no history → said; Stamp = 114 cells; the file edited by another writer (B6 100.7→200.7, a note in F2, 600 typed over
  `=SUM(B5:B8)`); reopened: exactly `F2, B6, B9` listed as changes since the last stamp and marked in the grid; Stamp = exactly those, B9 flagged; a
  further Stamp = NO-OP with the stored rows byte for byte unchanged. A Stamp with no name typed records nothing and asks for the name.
- **P2** each download: engine `verify` AND kernel `verifyJournal` pass; 0 of 114-115 visible cells differ from the file given; `_door_history` very hidden; the
  Excel shim's Check history / Cell history read the same entries (one format).
- **P4** 343 cells judged over 3 steps x 3 sheets: grid = `asOf(N)`; each "Download this version" holds that state and entries 1..N, and re-opens as intact.
- **P5** C6 (Ben) combined, B7 11-vs-22 ONE conflict with both values, both names and the earlier value; no choice pre-selected, Finish disabled, workbook
  unchanged; after the pick: 3 entries, verifies, B7 = 11, C5 + C6 present, B7's story names both people; the other direction (taking theirs) gives the
  same visible cells; refusals worded: unrelated, no history, hand-edited (entry 2 of 2), unstamped copy (BACKUP!D5), own unstamped change (BACKUP!D6),
  same copy twice.
- **How a merged history is stored** (E1): one entry on the open copy's linear chain; `ops` = what changes in the open copy; `meta.merge = { fork, other
  (the other copy's head hash, inside the entry hash), otherEntries, picks }`; `payload.theirs` = the other copy's entries after the fork. Engine `verify`
  re-verifies shared start + carried entries up to that head hash (a forged value or name inside them, two merges deep too, breaks at the merge entry).
- **P7** 6 requests, 313,465 bytes (ceiling 8 / 400,000), no kernel / SQL / seed; the server saw no request after a page was ready; only GETs.

**Findings**
1. **The time of an entry is not protected.** The shared entry hash covers `seq, actor, meta, opsDigest`, not `at` (measured: `at` edited → `verify` ok).
   Same in the ERP journal. Consequence also measured: the same cells stamped under the same name at two different times give the SAME genesis hash, so
   two such files count as copies of one sheet. Not changed here (one format with the kernel).
2. **The kernel's `verifyJournal` does not look inside a merge entry's carried entries** (forged carried value → kernel ok, engine broken at the entry). The
   page uses the engine's `verify`; a kernel-side reader of a merged sheet history would need the same check.
3. **Real WPS recalculates on open:** one formula cell whose saved result was stale in the sample (`Process!A2`) came back with a new value; the page
   lists it as a change since the last stamp and the next Stamp records it (as designed; the history itself survived byte for byte, very hidden).
4. **A writer that stores no formula results (openpyxl):** all 20 formula cells read as changed (value gone). True, but noisy: a user would stamp 20
   "changes" nobody made. The §12 hazard seen from the history side.
5. Witness slips fixed, not product defects: a tamper text `"v":22` also matched `228.85` in the genesis entry; on a too-wide phone page the browser shrinks
   the page instead of scrolling (window reads 1216 wide), so the fit check also requires the window to stay 390.
6. A second merge with the same other copy after more stamps re-opens earlier conflicts where the pick was "mine" (the fork stays the shared start).

**Not yet:** real Excel (not run: neither the page beside Excel's own writer nor the menus); a real phone; styles in the download; signing (a typed name;
a removed `_door_history` unnoticed; finding 1); merge-base tracking (finding 6); inserted rows / columns as such; grids beyond 200 x 40 drawn; three-way
merge of more than two copies in one step; W-HISTORY-PAGE is not wired into CI (like the lane's other witnesses).

**Merged and deployed (2026-11-28):** bim-ootb PR #3489 merged as `9c9578dd`; CI, release-please and "Deploy to GitHub Pages" all success on that commit.
Fetched back: `https://red1oon.github.io/bim-ootb/erp/sheet_addin/history.html` 200, 8,307 bytes, byte-identical to the merged file (the deploy serves the
scripts minified: `history.js` 20,115 bytes live vs 26,007 in the tree). One stamp + one merge against the LIVE page, headless
(`HPAGE_URL=<that url> node erp/tests/witness_history_page.js`), log read:
```
  §HPAGE-CHECK case=LIVE key=loaded OK  ({"requests":6,"bytes":95489,"readyMs":370,"heapMB":2,"kernel":false})      <- 95 KB on the wire (compressed), 6 requests, no kernel
  §HPAGE-CHECK case=LIVE key=stamp OK     a Stamp on the live page records the genesis (114 cells) and the downloaded file verifies (engine + kernel)
  §HPAGE-CHECK case=LIVE key=conflict OK  ONE conflict on BACKUP!B7 with both values (11, 22) and both names, Finish disabled
  §HPAGE-CHECK case=LIVE key=merge OK     the merged file verifies (engine + kernel), is 3 entries, keeps B7 = 11 and holds C5 and C6
  §HPAGE-CHECK case=LIVE key=nothing-sent OK  every request of the live run was a GET to the page's own origin
  page: §SHIST-PAGE-MERGE verdict=RECORDED entry=3 ops=1 fork=1 otherEntries=1 otherHead=b542f851d59e picks=["BACKUP!B7:a"] lineChars=1176
§HPAGE-VERDICT PASS judged=5 failed=0 cases=["LIVE"] (headless Chromium on the DEPLOYED page; real Excel NOT run)
```

## 15. Short addresses and one way round the three pages (spec 2026-11-28, before code)
Owner, 2026-11-28, verbatim: *"resume killer. Make apps URLs relatable for user easy usage continuity. Update user guide,"* (the guide part is OPEN LIST item 6).

### 15.1 Measured before the design
- The three stage-1 pages live at `red1oon.github.io/bim-ootb/pdf/`, `.../erp/sheet_addin/history.html`, `.../erp/sheet_addin/file_it.html`. Only the first is a
  name a person can say; the other two carry the repo's folder layout (`erp/sheet_addin/`) and a file suffix.
- None of the three links to the others (grep of `pdf/index.html`, `history.html`, `file_it.html` for each other's names: 0 hits). `file_it.html` links one
  page only: "Open in the ERP" (`../idempiere.html`). A user who downloads the `.xlsx` from the PDF page has no way on to the history page except typing its address.
- No `history/` or `file-it/` folder exists at the bim-ootb root (no clash). The old addresses are printed on Film 1-3 cards and used by the Excel/WPS hand-over
  (`taskpane.js`, `door_handover.js`), the witnesses and `PDF_EDITOR.md`: they must keep working.
- `pdf/sw.js` is network-first (no version to bump for an `index.html` change); `erp/sw.js` does not cover `erp/sheet_addin/` (OPEN LIST item 29, unchanged here).

### 15.2 Design (owner delegated the shape: "relatable")
1. **Short addresses, one word each:** `/bim-ootb/pdf/` (as it is), `/bim-ootb/history/`, `/bim-ootb/file-it/`. Each new one is a ONE-file door
   (`history/index.html`, `file-it/index.html`) that forwards to the real page with `location.replace`, carrying `?query` and `#hash` unchanged; a
   `<meta http-equiv="refresh">` and a plain link cover a browser without script. The real pages do NOT move: one implementation each, every old address still works.
2. **One way round:** each of the three pages carries the same small row **PDF · Sheet history · File it**; the page you are on is marked (`aria-current="page"`),
   not linked; the other two link the real pages directly (no forwarding hop). Each link says in its title what you would take there
   (PDF → the report; history → the `.xlsx`; File it → an invoice workbook), because the file does not travel by itself.
3. **Not in this slice (stated):** carrying the OPEN file from one page to the next without re-opening it. That keeps a copy of the user's file in this
   origin's browser storage: a privacy line the pages now promise against in words ("not uploaded anywhere" stays true, but "nothing kept" would change). Owner's call.
4. **Guide:** `docs/PdfPageGuide.md` (URL kept: it is live) becomes the guide of all three pages: the short addresses first, then change a number + Download PDF,
   the history inside the file, the history page, File it, Open in the ERP, and the WPS user-name note (OPEN LIST item 17). Every fact taken from §7-§14 and
   `PDF_EDITOR.md` §4.2-§4.6 results, nothing new claimed.

### 15.3 Claims (W-DOOR-URLS, `erp/tests/witness_door_urls.js`, node; verdict `§DOORURL-VERDICT PASS|FAIL|INCONCLUSIVE judged=N failed=M`)
- **U1 the doors forward right:** each door's script, run in a `vm` with a stand-in `location` (`?a=1#b`), calls `replace` exactly once with its target plus
  `?a=1#b`; the target file exists in the tree; the meta refresh and the fallback link name the same target. Exposes: a door to a moved/missing page, a
  door that drops the query or hash (a hand-over or deep link lost).
- **U2 one way round:** each of the 3 pages has exactly one row; it names all 3 pages in the same order; the current one is `aria-current` and not a link;
  each of the other two hrefs resolves, relative to the page, to an existing file that is the right page. Exposes: a dead link, a page that links itself.
- **U3 denominator:** the pages judged = the pages named in the row (3) and the doors judged = 2; zero found prints INCONCLUSIVE, never PASS.
- **Mutants (`DOORURL_MUTANTS=1`):** a door that drops the hash → U1; a door to a missing page → U1; a row link to a missing file → U2; the current page
  linked → U2. Each must be killed.
- **Live, after deploy:** the two short addresses return 200 and name their target; read back, not assumed.

### 15.4 RESULTS (2026-11-28, bim-ootb PR #3493 `feat/killer-urls`, merged as `ac9243c1`; guide published by `scripts/safe_gh_deploy.sh`)
Code: `history/index.html`, `file-it/index.html` (new, 15 lines each), the row in `pdf/index.html` (it replaces the bare "PDF" title), `history.html`, `file_it.html`
(+2 lines each); witnesses `erp/tests/witness_door_urls.js` (node) and `erp/tests/witness_door_urls_page.js` (headless Chromium, local tree or `DOORURL_URL=` live).
bim-ootb diff: 7 files, +206 / −1 (witnesses +170). Add-only by nature: no special case superseded.
```
§DOORURL-U1 door=/history/ target=erp/sheet_addin/history.html PASS · door=/file-it/ target=erp/sheet_addin/file_it.html PASS
§DOORURL-U2 page=pdf/index.html items=3 PASS · erp/sheet_addin/history.html items=3 PASS · erp/sheet_addin/file_it.html items=3 PASS
§DOORURL-U3 doorsJudged+pagesJudged=5 of 5
§DOORURL-MUTANT "door drops the hash" KILLED by U1 · "door to a missing page" KILLED by U1 · "row link to a missing file" KILLED by U2 · "current page linked" KILLED by U2
§DOORURL-VERDICT PASS judged=5 failed=0 mutants=4/4
§DOORURL-BROWSER-SITE https://red1oon.github.io/bim-ootb/                                    (after the Pages deploy of ac9243c1)
§DOORURL-BROWSER-BASE historyLength of a direct visit=2 (a door that adds no Back entry reads the same)
§DOORURL-BROWSER typed=/bim-ootb/history/?a=1#b landed=/bim-ootb/erp/sheet_addin/history.html?a=1#b current="Sheet history" historyLength=2 PASS
§DOORURL-BROWSER typed=/bim-ootb/file-it landed=/bim-ootb/erp/sheet_addin/file_it.html current="File it" historyLength=2 PASS
§DOORURL-BROWSER typed=/bim-ootb/pdf/ landed=/bim-ootb/pdf/ current="PDF" historyLength=2 PASS
§DOORURL-BROWSER-ROW clicked="Sheet history" PASS · clicked="File it" PASS · clicked="PDF" PASS
§DOORURL-BROWSER-VERDICT PASS judged=6 failed=0 site=LIVE
```
- Live by curl: `/history/` and `/file-it/` 200 and byte-identical to the merged files; `/history` and `/file-it` (no slash) answer 301 to the slash form.
- Regression, same tree before merge: `§PDFPG-VERDICT PASS judged=19` · `§PDFWP-VERDICT PASS judged=22` · `§PDFHP-VERDICT PASS judged=19` · `§FILEIT-VERDICT PASS judged=53` ·
  `§HPAGE-VERDICT PASS judged=91` (P9 real WPS writer ran) · eslint on both witnesses exit 0. CI on #3493: fast-checks, e2e-tests, live-json-editor pass.
  `node scripts/gen_manifest.js --check` did NOT run here (`§NEED_DEPS espree is not installed`); no script tag was touched.
- **Guide:** `docs/PdfPageGuide.md` now covers the three pages (short addresses table, the row, change a number + Download PDF, history inside the file, Sheet
  history, File it + Open in the ERP, the WPS user-name note); every fact taken from §7-§14 / `PDF_EDITOR.md` §4.2-§4.6, the refusal wording from `pdf/pdf_write.js`
  (`too-many-decimals`: "more decimals than the column prints"). Nav label renamed in `mkdocs.yml`. Seatbelt: `§GUARD result=PASS` live=999 new=999, `§STEP6 all
  canaries 200`. Read back live: `https://red1oon.github.io/BIMCompiler/PdfPageGuide/` 200, 67,233 bytes, title "PDF, Sheet history and File it: your own files",
  all three short addresses present. `docs/glassbowl_data.db` restored from `origin/gh-pages` first (the trap of item 6, still without a permanent home).
- **Witness slip, fixed before the claim:** the browser leg first expected `history.length` 1; a fresh tab starts at `about:blank`, so a direct visit reads 2. The
  check now compares the door against a direct visit of the real page.

**Not done (stated):** the open file does not travel between pages (§15.2 point 3, owner's call); the Excel/WPS menus do not show the row (they are panes,
not these pages); W-DOOR-URLS is not wired into CI (OPEN LIST 33, like the lane's other witnesses); the film cards still print the long addresses (OPEN LIST 7, waits on A).

## 16. Usability of the three pages, judged as a newcomer on the LIVE site (spec 2026-11-28, before code)
Owner, 2026-11-28, verbatim: *"Films has delivered the idea. Focus on its usability. If it checks out, suggest what is pending."* Group A of the OPEN LIST
(film covers, licence line, Film 2 redo, Film 3 release) is therefore CLOSED by the owner: the films stand as made.

**Question:** can a person with no help, starting from a short address, do each page's job and go on to the next page with what it handed them?
Every existing page witness judges ONE page from a fixture the witness supplies; none walks the user's path ACROSS pages, none starts with no file, none at phone width.

**Witness W-KILLER-USE** (`erp/tests/witness_killer_usability.js`, headless Chromium; `USE_URL=` the deployed site, default the local tree). Verdict line
`§USE-VERDICT PASS|FAIL|INCONCLUSIVE judged=N failed=M`; each claim prints `§USE-<id> PASS|FAIL <measured>`. Two viewports: desktop 1280x800 and phone
390x844 touch. A FAIL here is a usability finding to fix or to state, not a witness error.
- **N1 a newcomer with no file can try it:** on first visit each page offers a way to try it without a file of one's own (a sample), reachable in one press.
  Exposes: an empty page whose only action needs a file the visitor does not have.
- **N2 the first screen says what to do:** the page's main action (open / sample) is inside the first screen (no scroll) at both viewports.
- **N3 phone fit:** no sideways scroll at 390 px (document width ≤ window width); every button/link/input at least 24 x 24 CSS px (WCAG 2.2 target size, AA).
- **J1 PDF job:** open the trial balance (the page's own corpus file) → Read as sheet → "adds up" → change D10 → "does NOT add up", naming D28 →
  change D28 to match → "adds up" → Download PDF and Download .xlsx both arrive as files.
- **J2 on to Sheet history with what PDF gave:** follow the row link, open the downloaded `.xlsx`: the page recognises the history it carries (entries > 0,
  verified), a cell's story of D10 shows both values, Stamp is possible after a name is typed.
- **J3 on to File it with that same file:** File it refuses a workbook without marked invoice cells IN WORDS that say what to do (no stuck page, no
  console error); then the sample files, and "Open in the ERP" appears.
- **J4 messages are words:** a non-PDF given to the PDF page and a non-workbook given to the other two are refused in a sentence, not a stack trace.
- **C cost:** bytes on the wire and ms to ready per page, at first visit (from the CDP network log). Stated, not judged.
Denominator: 3 pages x the claims above; a claim whose control was not found prints FAIL with "not found", never PASS.

### 16.1 First run on the LIVE site (before any fix) and the fixes decided (2026-11-28)
`USE_URL=https://red1oon.github.io/bim-ootb/ node erp/tests/witness_killer_usability.js`: **the jobs work end to end at both widths** (J1 read → edit bites →
consistent edits add up → both downloads; J2 the row → the .xlsx recognised, D10's story 2 values; J3 refused in words → the sample FILED, Open in the ERP; J4;
0 page errors). Cost at first visit: PDF 238 KB / 1.6 s, Sheet history 98 KB / 1.2 s, File it **11.3 MB / 2.9 s** (on this machine's line). Findings:
1. **N1:** PDF and Sheet history offer nothing to a visitor without a file (File it has its sample).
2. **N3:** on the phone the row's links are 20-21 px high (under 24 x 24) on all three pages; no page scrolls sideways.
3. **J2-no-phantom (added after the first run showed "2 cells have changed"):** the .xlsx the PDF page hands over, opened on Sheet history straight away, lists
   `Report!D28: 40393.44 → =SUM(D6:D26)` and `F28` as changes nobody made. Cause (`pdf/index.html` `download()`): the export takes each total's formula from the
   LATEST re-read of the PDF (`report_reader.js:149` sets `f` when the column adds up), while the history inside the same file records the user's typed total
   with `f: null` (`pdf_write.js` `record`). Two owners of one cell's state. The other direction exists too: a total left alone while a row changes keeps `f` in the
   history and loses it in the export.
4. **J3:** File it given a workbook without marked cells answers "this workbook has no _door_tags sheet (no template to read)": true, but in the code's words, and
   it does not say what the user can do (marking one's own layout, S7, is not built).

**Fixes (owner delegated "focus on its usability"):**
- F1 PDF page: a **Try a sample report** button that opens the page's own proof file (`pdf/corpus/trial_balance_th.pdf`, already served).
- F2 Sheet history: a **Try a sample workbook** button: a small workbook built in the page with three stamps by two names (so steps, a cell's story and
  rewind show at once); nothing is uploaded, nothing new is loaded (XLSX + the page's own stamp path).
- F3 the row: each link padded to at least 24 px high.
- F4 **one owner:** when the file carries a history, the .xlsx export writes each cell's formula AS THE HISTORY HOLDS IT (the history is the record of what was
  done; a typed total is a number, an untouched total stays a SUM). Claim J2-no-phantom: 0 listed changes on arrival.
- F5 File it: on opening a workbook without marked cells, say it in plain words at once (what is missing, that marking one's own layout is not built yet, and
  to try the sample). The engine's own verdict text is not changed (the Excel/WPS menus share it).

### 16.2 F4 refined after the regression run: the history records what the re-read sees (2026-11-28)
F4 as first written (the export follows the history) made a corrected total a plain number in the .xlsx: W-PDF-WRITE-PAGE `xlsx-after` FAILED, rightly — it
asks for D28 = 40393.44 WITH `=SUM(D6:D26)`, and the guide promises "where the report printed a total, the file holds a real sum formula". The phantom
had two sides; both are now closed with ONE owner (the history) that agrees with the reader:
- **Record (`pdf/index.html` applyEdit → `pdf_write.js` record):** an edited cell is recorded with the formula the RE-READ still finds there. A typed total that
  still adds up its column stays a SUM and is NOT flagged typed-over; a typed total that breaks its sum is recorded as a number and flagged (S9 H7, node W8).
- **Export (`download()`):** each cell's formula is the one the history holds (so a total left alone keeps its SUM when a row changes).
Witness expectations changed with it, each naming this section: W-PDF-WRITE-PAGE `history-2` (D28 now `typedOverFormula=false`) and W-PDF-HISTORY-PAGE
`story-clicked` (D28's story no longer marked "typed over a total"). The log tag is `§PDFXLSX-FORMULAS` (the first name, `§PDFHIST-XLSX-F`, was caught by a
witness waiting on the prefix `§PDFHIST-XLSX`).
Not witnessed on the page: a typed total that BREAKS its sum (flag set) — node W8 and S9 H7 cover the rule.

### 16.3 RESULTS (2026-11-28, bim-ootb PR #3494 `feat/killer-usability`, merged as `1b7a91eb`, deployed; guide republished)
bim-ootb diff: 11 files, +227 / −11 (W-KILLER-USE 150 lines; shipped code ~45 lines; `erp/sw.js` + `modules.json` by `scripts/bump.js`, parity gate run, PASS).
```
§USE-SITE https://red1oon.github.io/bim-ootb/ (LIVE)                                       (after the Pages deploy of 1b7a91eb)
§USE-N1 / N1-works  desktop+phone  PDF "Try a sample report" → "Page 1 adds up: 4 totals agree with their rows."   PASS
§USE-N1 / N1-works  desktop+phone  Sheet history "Try a sample workbook" → steps=4, D5 story 3 values, visitorNameKept=true   PASS
§USE-N3-targets phone PDF 0 of 10 · Sheet history 0 of 6 · File it 0 of 5 controls under 24x24   PASS (was 2 each)
§USE-J1 read · edit bites (names D28, F10) · consistent edits add up · both downloads   desktop (double-click) + phone (tap)   PASS
§USE-J2-no-phantom desktop+phone: opened straight from the PDF page, 0 changes nobody made   PASS (was 2: D28, F28)
§USE-J3-refused-in-words: "... Its invoice cells are not marked, so this page cannot file it yet: marking your own layout is not built yet. To see filing work,
   press Get a sample invoice."   PASS ; J3-sample-files FILED + Open in the ERP   PASS ; J4 "This file is not a PDF."   PASS ; pageErrors=0 both widths
§USE-COST desktop PDF 314,250 B / 1.1 s · Sheet history 98,464 B / 1.1 s · File it 11,330,012 B / 3.2 s (first visit, this line; phone run reused the cache)
§USE-VERDICT PASS judged=44 failed=0
```
Regression before merge (same tree): PDFWR 67 (mutants 6/6), PDFHIST 57 (10/10), SREAD 38, SHIST 20, SADDIN 63, DOORURL 5 (4/4) + browser 6, PDFPG 19,
PDFWP 22, PDFHP 19, FILEIT 53, HPAGE 91 (real WPS writer ran); `gen_manifest --check` PASS; eslint 0. CI on #3494: `live-json-editor` (the viewer's settings
panel, no file of this PR) timed out once at 180 s and passed on re-run (1 m 46 s) — a flaky job, recorded, not this lane's.
Guide: the samples, "a corrected total stays a live sum formula", File it on unmarked workbooks; republished by the seatbelt.

### 16.4 What is pending, ordered by what a USER meets first (2026-11-28; replaces the group order of the ▶ OPEN LIST for the next session)
1. **File it files only the sample.** A person's own invoice cannot be filed: marking the cells of one's own layout (S7 "Mark my invoice", §4) is not built.
   This is now the first wall a real user hits; the page says so in words (§16.1 F5). Biggest usability gap.
2. **File it weighs 11.3 MB on first visit** (3.2 s here) and does not come back on an offline reload (OPEN LIST 29); never run on a real phone (19).
3. **The open file does not follow you between pages** (§15.2 point 3): owner's call, it keeps a copy in browser storage.
4. **Real Excel never run** (15): the menu, File it, Stamp in Excel itself; needs a machine with Excel or Excel on the web.
5. **Words a user should not need:** an edit that falls back to another face says "written in LiberationSans because the font LiberationSans-Bold in this PDF
   has no "5"" (font names); File it's engine verdict still says "_door_tags". Plain-words pass over the messages.
6. **Correctness under the hood (C, 9-14):** an entry's time outside its hash; one verifier (kernel vs SheetHistory); merge base; noisy formula results from
   writers that store none; emoji in an inline string.
7. **CI (33):** none of the lane's witnesses run in CI; the node ones are cheap; W-KILLER-USE needs a browser (the CI already installs puppeteer for others).
8. **Depth (21-23, 25-28, 30-32, 34):** reader grid evidence, NinjaExcel layout OUT + Thai SARA AM, write-back limits, Account Viewer parity, two workbooks into
   one books, signing, tenant/user choice, the outside request, red ERP witnesses, one SHA-256, history-page grid limits.

## 17. The PDF page on a phone, with the PDFs found on this machine (spec 2026-11-28, before code)
Owner, 2026-11-28, verbatim: *"Proceed with any PDF sample in this machine. Emulate a mobile phone to see its perf, and better UI for user experience."*
**Privacy:** the PDFs are the owner's own files (client sets among them). They are read locally in a headless browser; nothing leaves the machine. No file name,
path or content goes into a commit, log kept in git, PR or this file: each PDF is named by a number and its measured traits only (bytes, pages, text or scan,
money-figure count on page 1, locked or not). The list lives in the session scratchpad only.

**Sample (measured 2026-11-28):** 227 PDF files over 10 KB under the home folder (not caches/node_modules/.git/snap), 158 distinct by size, all readable by
poppler: 35 under 100 KB, 63 under 1 MB, 48 under 10 MB, 12 over 10 MB; 12 scans (no text on page 1), 16 with a table of money figures on page 1 (≥ 10 numbers
like `1,234.56`), 3 locked, 20 over 50 pages. Judged set: those 16 tables + 2 scans + the 3 largest + the 2 longest + the 3 locked + 2 ordinary (≈ 28).

**Phone emulation:** 390 x 844 CSS px, DPR 3, touch, mobile user agent; CPU slowed 4x (the Lighthouse mobile setting); the FIRST page load on "slow 4G"
(150 ms RTT, 1.6 Mbit/s down). Witness `pdf/tests/witness_pdf_mobile.js` (W-PDF-MOBILE; `PDFM_LIST=<file of paths>`, default the page's own corpus so it
runs anywhere). Verdict `§PDFM-VERDICT PASS|FAIL|INCONCLUSIVE judged=N failed=M`; one `§PDFM-FILE n=<k> ...` line per PDF with its numbers.
- **M1 first page fast:** from choosing the file to page 1 painted, ≤ 3 s at 4x CPU for files ≤ 10 MB (stated for bigger). Exposes: open work that grows with
  the whole file before anything is shown.
- **M2 memory bounded:** canvases alive ≤ 6 right after open AND after scrolling to the end; peak JS heap stated. Exposes: drawing every page at once on a
  phone (PERF BUDGET: release what is off screen).
- **M3 read as sheet:** the time and verdict per table PDF (stated; FAIL only on a page error).
- **M4 first visit:** bytes and ms until the page can open a file, on slow 4G (stated).
- **U1 the document is what you see:** after open, the page 1 canvas covers ≥ 50% of the first screen.
- **U2 the toolbar stays small:** the header is ≤ 2 rows (≤ 100 px) before and after a file is open.
- **U3 the verdict is seen:** after Read as sheet, the verdict line is on screen without scrolling.
- **U4 nothing wider than the phone:** document width ≤ 390; every control ≥ 24 x 24.
- **U5 no page errors, refusals in words** (scan: "no text"; locked: asks a password).
A FAIL is a finding: the fixes are specced in §17.1 after the first run, with the numbers.

### 17.1 First run (before any fix) and the fixes decided (2026-11-28)
Run: `PDFM_LIST=<scratchpad list> node pdf/tests/witness_pdf_mobile.js` on the local tree = main `1b7a91eb` (25 of the owner's PDFs, phone emulation of §17).
`§PDFM-VERDICT FAIL judged=135 failed=76`. First visit on slow 4G: 763,201 bytes, usable after 4.2 s. Per file (n, bytes, pages → open ms / page 1 painted ms
/ canvases alive / peak JS heap):
```
small, 1-4 pages (n 1-9, 13, 15, 22, 25)   open 160-490 ms, page 1 painted 0.24-2.9 s, canvases = pages, heap 3-65 MB          M1 PASS
n=11  430 KB    38 p   open   368 ms   page 1  1.97 s   canvases   38   heap  11 MB
n=12  1.2 MB    69 p   open   902 ms   page 1  5.72 s   canvases   69   heap 135 MB                                        M1 FAIL
n=14  2.0 MB   126 p   open 1,356 ms   page 1  9.47 s   canvases  126   heap 200 MB                                        M1 FAIL
n=16  6.3 MB     4 p   open   818 ms   page 1  8.14 s   canvases    4   heap 106 MB   (image-heavy pages; 50 long tasks)    M1 FAIL
n=23  8.3 MB    79 p   open   601 ms   page 1  3.50 s   canvases   79                                                    M1 FAIL
n=19  79 MB     80 p   open 6,494 ms   page 1  7.74 s   canvases   80
n=20  60 MB  2,464 p   open 7,776 ms   page 1 19.58 s   canvases 2,464  heap 267 MB
n=21  47 MB  2,499 p   open 9,199 ms   page 1 21.89 s   canvases 2,499  heap 261 MB
n=17 not a PDF → "This file is not a PDF." · n=18 scan → "11 pages, no text (a scan)" · n=22-24 locked (owner password only) open normally.
```
**Findings (code read, file:line in `pdf/index.html` at `1b7a91eb`):**
1. **M2 every page drawn on a phone.** `layout()` observes the pages with `root: #pages`. At ≤ 760 px `main` is `height: auto`, so `#pages` never scrolls:
   it is as tall as the whole document and every page "intersects" → `draw()` for all pages at once (2,499 canvases). The window scrolls instead.
2. **Read as sheet reads the MIDDLE page on a phone.** `track()` takes `#pages.scrollTop + clientHeight / 2`; with `#pages` full height that is the middle of the
   document: page 7 of 12, 20 of 38, 35 of 69, 1233 of 2464 were read, never the page on screen. `go()` (outline, Find hits) sets `#pages.scrollTop`: on a phone
   it moves nothing. Correctness, not only comfort.
3. **M1 page 1 waits for the whole file.** `PdfOpen.open` (`pdf/pdf_open.js:44`) reads every page's text before it returns (7.8-9.2 s for 2,500 pages), and
   page 1 then competes with every other page's drawing (finding 1).
4. **U2** the toolbar wraps to 205 px (9 controls + the status line). **U1** the outline / found / history panel (30 vh) sits ABOVE the document: page 1
   covers 18-44%. **U3** after Read as sheet the verdict is below every page (top at 814-824 px of 844, or further).

**Fixes:**
- F1 the pages are observed against the viewport when `#pages` does not scroll itself (phone), against `#pages` when it does (desktop); `track()` and `go()`
  work from the pages' positions on screen (`getBoundingClientRect`, `scrollIntoView`), so both layouts read and jump to the page on screen.
- F2 open in two steps: `PdfOpen.open(..., { textLater: true })` returns after the page sizes; page 1 is laid out and drawn; then the text is read (progress
  in the status line). Find, Read as sheet and the history check wait for it; `§PDFED-OPEN` is still printed once everything is read (no witness changes).
  Without the option the opener is unchanged (node witnesses).
- F3 phone layout: the document first, then the sheet / outline / history; Read as sheet SHOWS the sheet in place of the pages (verdict at the top), Close goes
  back; the toolbar uses short labels on a phone (Open · Sheet · .xlsx · PDF) and Find behind a button; the sample button hides once a file is open.
- **U1 restated (a fact of geometry, not a loosening):** a landscape page cannot cover half a portrait screen at full width; U1 passes when page 1 covers
  ≥ 50% of the first screen OR is wholly on it.
- **U6 new:** scrolled so page k is in the middle of the screen, Read as sheet reads page k (finding 2).

### 17.2 Found while fixing (2026-11-28, before the after-run)
- **The toolbar scrolled away on a phone.** `html, body { height: 100% }` makes body one screen tall; a `position: sticky` header cannot stick past its
  parent, so after one screen of scrolling the toolbar was gone: a user on page 3 had to scroll back to the top to reach *Sheet*, which moved the page that
  is read. Fix: on a phone `html, body { height: auto; min-height: 100% }`. **Claim U7 (new):** scrolled to the end of a multi-page file, the Sheet button
  is on screen and is the element under its own centre.
- **Witness slip:** `page.tap()` scrolls its target into view before tapping (it moved the window under the sticky toolbar: page 3 → 2). The witness taps
  the screen where the button IS (`touchscreen.tap(x, y)`), as a thumb does.
- Toolbar measured 101 px with 6 px padding → 5 px: 99 px.

### 17.3 RESULTS (2026-11-28, bim-ootb PR #3498 `feat/pdf-mobile`, merged as `ef08a10e`, deployed)
Code: `pdf/index.html` (two-step open, observer against what scrolls, `track()`/`go()` from the screen, one page drawn at a time, phone layout + short labels +
Find button, sheet in place of the pages, toolbar that stays), `pdf/pdf_open.js` (`textLater`, opt-in), `pdf/tests/witness_pdf_mobile.js` (new).
The 25 PDFs, phone emulation, **against the LIVE page**: `§PDFM-VERDICT PASS judged=162 failed=0` (before, local main `1b7a91eb`: judged=135 failed=76).
```
§PDFM-FIRSTVISIT bytes=235719 msToUsable=1692 net=slow4G cpu=4x        (live, minified; the local tree serves 769 KB unminified, 4.1 s)
page 1 painted, before → after (local, same machine; A/B back to back for n=9,10,16):
  2,499 p 21.9 s → 1.3 s · 2,464 p 19.6 s → 1.5 s · 126 p 9.5 s → 0.4 s · 69 p 5.7 s → 0.4 s · image-heavy 4 p 8.3 s → 2.4 s · 1-page files 0.24-0.5 s, unchanged
canvases alive: every page (up to 2,499) → at most 5 · peak JS heap 2,464 p: 267 MB → 74 MB · toolbar 205 → 99 px · U6 the page on screen is read · U7 toolbar stays
all text read (Find / Read as sheet ready): 2,499 p 10.2 s, 126 p 1.9 s, ≤ 12 p under 0.5 s; the status line counts the pages meanwhile
```
Regression, same tree: PDFPG 19, PDFWP 22, PDFHP 19, W-KILLER-USE 44, SWPP 28 (WPS phone page), PDFWR 67 (6/6), PDFHIST 57 (10/10), SREAD 38 (8/8), PDFED 13 (3/3);
eslint 0; CI pass. Privacy: the diff was checked against the 25 file names (only generic words like "Report" matched); no path, no name in any commit.
**What the run also showed (not fixed here, the reader's own lane, OPEN LIST 21):** of the 16 table PDFs, the reader JUDGED few. Ours (the trial balance) and one
outside file add up; 3 outside files "do NOT add up" (not checked whether the misread is ours or a real difference: two print `360.00` against a rows sum
`885.00`, which looks like a misread); 9 are "not judged: no total row found". The core promise works on our layout and seldom yet on other people's.

### 17.4 Where it sits for a user, against KillerPDF (the C# desktop program studied first, §2 of PDF_EDITOR.md) and Adobe Acrobat (2026-11-28)
Against KillerPDF's 14 public feature groups (PDF_EDITOR §2, the denominator): ours covers **G1 in part** (view, find, outline, password; no view modes, tabs,
split panes), a **narrow slice of G4** (numbers only, not text), a **narrow slice of G10** (.xlsx only). **0 of the other 11 groups** (organise, annotate, images,
forms, redaction, OCR, compare, security, signing, quality, automation). KillerPDF is a Windows desktop program by its own list (Windows certificate store,
TWAIN scanning, installed Office); nothing in our record of it runs in a phone browser.
Adobe Acrobat on a phone, by Adobe's own help pages (read 2026-11-28): free = view, comment, fill, sign, share; editing text, OCR, export, organising pages need
a paid mobile subscription (Reader Plus / Premium); its online converters upload the file to Adobe's cloud, have a free quota and a 100 MB cap.
Ours that neither gives as measured here: free, no install, no upload, offline after one visit, on any phone browser; a report read back as a sheet WITH an
"adds up" check; a number changed in place in the same PDF; the history inside the file. NOT measured: KillerPDF's or Acrobat's speed on the same 25 files, or
Acrobat's PDF→Excel accuracy on them. Sources: helpx.adobe.com/acrobat/mobile/subscription-refunds/about-subscriptions.html ·
helpx.adobe.com/document-cloud/faq/free-online-pdf.html · adobe.com/acrobat/online/pdf-to-excel.

### 17.5 The users' wish list out there, weighed (web read 2026-11-28; vendor and review pages, no formal survey found — anecdotal, said so)
| Wish (theme, source kind) | Ours today | Weight for this lane |
|---|---|---|
| Basic tasks truly free, no "pay after you edited" (complaint sites, Trustpilot, Product Hunt) | free, no account | HIGH: keep it, say it on the page |
| Do not upload my documents (iLovePDF app-review analysis, free-editor roundups) | nothing leaves the device | HIGH: our strongest edge, already said |
| Edit existing TEXT offline (free-editor roundups: PDFgear, PDF-XChange, PDF24 recommended for it) | numbers only | MEDIUM-HIGH: P4 wide (G4) |
| Merge / split / reorder / sign without a paywall (Product Hunt, complaint sites) | none | HIGH and CHEAP: P1 organise + fill/sign (pdf-lib already chosen, §3) |
| Bank statements / reports → Excel that is RIGHT: columns not merged, running balance, totals reconciled to the printed balances (accounting vendor pages) | our adds-up check IS that reconciliation, but it judges few outside layouts (§17.3) | HIGHEST fit: widen the reader (running-balance column, multi-page, ruling lines = OPEN LIST 21) on real statements |
| Scans (OCR) | refused in words | MEDIUM: 12 of 158 PDFs on this machine are scans; G8 |
Sources: sikayetvar.com (PDF Guru complaint) · trustpilot.com/review/pdf.net · kimola.com iLovePDF feedback report · producthunt.com/products/desidocs ·
techrepublic.com best free PDF editors 2026 · dev.to / hashnode bank-statement converter articles · cpapracticeadvisor.com 2024-02-28.

## 18. "Edit as a sheet": the report becomes OUR editable page, exported back to PDF or Excel (spec 2026-11-28, before code)
Owner, 2026-11-28, verbatim: *"since we are in our own browser and we already load a PDF content, what is stopping us of swapping it outright to our own editor
that can then export back to PDF or Excel?"* — then, on the two-mode proposal (sheet by default where a table is found, the original otherwise): *"Go with you"*.
Earlier the same day: *"Can we merge Excel table features right into our PDF space instead of it opening as a separate panel?"* — this section answers both.

### 18.0 THE CURRENT SPEC (consolidated 2026-11-28 from 18.2, 18.3, 18.5, 18.6 — read this; those sections are kept as the record of how it got here)
**One page. Edit where we understand; keep the original everywhere else.**
- **The page:** the ORIGINAL PDF page is drawn by pdf.js as the base — images, drawings, every font, untouched. On top sits an **edit layer**, only over runs
  we can write back. Tap / double-click a word or number to edit it where it stands; nothing else on the page moves (the old run's box is masked on screen).
- **Table features on the page, no side panel:** totals the reader found are live `SUM`s, recomputed on every edit and marked on the page (adds up / does not,
  with the gap); drag across numbers → sum and count; tap a total → its formula and its rows lit. The old side grid stays behind a **Show grid** button.
- **Fonts, in this order:** (1) the run's own embedded font when it holds every glyph; (2) another face of the same family in the file; (3) the closest
  standard PDF font (Helvetica / Times / Courier ± bold / italic) from the font's own description, best width fit. Any substitution shows a **red on-screen
  box "font not same: <from> → <to>"** until the user accepts it or undoes it; the box is never written into the PDF; the export lists every substitution.
  **Locked** only what no font can show (e.g. Thai: the standard fonts have no Thai glyphs; an embedded font comes in slice B), images, vector art, and text
  that is part of a picture — a tap says why.
- **Undo / redo:** Ctrl-Z / Cmd-Z, Ctrl-Shift-Z, and Undo / Redo buttons for phones. An undo is its own history entry (the inverse edit), so the history in the
  file stays true and verifying.
- **Export:** PDF = **the original file with only the edited runs changed**, by the one in-place engine (`pdf/pdf_write.js`, widened from numbers to any text
  run); every other object byte-identical, image streams never re-encoded. `.xlsx` as before (SUM formulas, the history sheet). No second PDF writer.
- **Still true, said plainly:** any change breaks a digital signature; adding / deleting rows and sorting re-lay a table's region (slice B: that region is
  redrawn by us, the rest stays original); several pages in one sheet, embedded fonts and OCR come later.
- **Claims (W-EDIT-SHEET, `pdf/tests/witness_edit_sheet.js`, verdict `§EDSHEET-VERDICT`):** **H1** the edit layer covers every writable run of page 1 and no
  locked one, each locked run names why · **H2** text and number edits round-trip (our reader and poppler read the new text at the same boxes; the old text is
  gone) · **H3 integrity:** every object not holding an edited run byte-identical, every image stream byte-identical, a poppler raster changes 0 pixels outside
  the edited boxes · **H4/H5** a missing glyph → substituted by the order above with the red box and a `§EDSHEET-FONT` line, or locked — never written wrong;
  the box absent from the exported PDF · **H6** edit → undo → the export equals the original run, all else byte-identical; redo re-applies; the history verifies
  · **H7** accept removes the box, keeps the substitution · **E3** live totals (D10 +1 → its total marked with gap 1.00; consistent edits → adds up), one S9
  entry per edit · **E5** the .xlsx re-reads to the same cells with SUM formulas and a verifying history · **E7** phone: fits 390 px, a cell tap edits without
  scrolling the page, W-PDF-MOBILE still all PASS on the corpus and on the owner's PDFs. **Mutants:** a run dropped from the layer → H1; total not recomputed →
  E3; an untouched object rewritten → H3; the red box written into the PDF → H5; undo not recorded → H6.

### 18.1 Novelty, stated honestly (the owner asked "my idea is novel isn't it?")
The GENERAL idea is not new: Microsoft Word has opened a PDF as an editable copy and saved it back as PDF since Word 2013 ("PDF Reflow", a converter that makes
a copy; complex layouts break; scans are not editable — support.microsoft.com/word/opening-pdfs-in-word, microsoft.com/en-us/microsoft-365/blog/?p=836);
Acrobat exports PDF to Excel/Word. What MAY be new is the combination: in the browser with nothing uploaded; the rebuilt table is CHECKED against the page's own
printed totals before it is trusted; every cell is traced to its box on the original page; the history travels inside the file; two modes chosen per document;
the result can be filed into the ERP. **No claim of novelty is made until a prior-art search is done** (OPEN LIST 24).

### 18.2 Design (owner delegated: "Go with you") — SUPERSEDED by 18.0 (two modes and a fresh PDF writer were dropped, 18.5)
- **Two modes, one page.** After the text is read, the reader looks at page 1. A table found (cells ≥ 12 in ≥ 3 columns, any verdict) → the file opens in
  **Edit as a sheet**; otherwise in **Keep the original** (today's viewer + numbers-only in-place write-back, unchanged). A switch at the top flips between them;
  the choice and why are said in the status line ("Opened as a sheet: a table of 144 cells was found on page 1").
- **Our page (Edit as a sheet):** the page is drawn FROM OUR MODEL, not by pdf.js: every word at its box (`pdf_open.js` items), the ruling lines and boxes
  (`modeller/pdf2dxf/pdf_reader.js` paths — one reader, reused, not a second one), scaled to the screen width. Any word is editable where it stands (tap / double-click);
  table cells behave like a spreadsheet: totals the reader found are live `SUM`s, recomputed on every edit, each total marked on the page (adds up / does not +
  the gap); drag across numbers → sum and count; tap a total → its formula and rows lit. This IS the "Excel features in the PDF space": no separate panel.
- **Export:** `.xlsx` (existing `ReportReader.toWorkbook` + the history sheet) and **a fresh PDF in the same layout**, written by OUR writer in the browser:
  words at their boxes, lines and rectangles, standard PDF fonts (Helvetica family, WinAnsi). Text the standard fonts cannot show (Thai, CJK, ...) is REFUSED by
  name in slice A, not silently dropped (an embedded font is slice B). The PDF Keep-the-original writes is untouched.
- **History:** every edit is an S9 entry (`SheetHistory`), carried inside both exports as today.
- **Not in slice A (stated):** images, shading, annotations, forms, signatures on the page (said on screen: "this page has N images that the sheet copy leaves
  out" — counted from the page, never silently lost); add / delete rows, sort (slice B); more than one page in the sheet (slice B); embedded fonts (slice B);
  scans (OCR, later).

### 18.3 Claims for slice A — SUPERSEDED in part by 18.0 (E1, E2, E4, E6 replaced by H1-H7) (W-EDIT-SHEET, `pdf/tests/witness_edit_sheet.js`; verdict `§EDSHEET-VERDICT PASS|FAIL|INCONCLUSIVE judged=N failed=M`)
- **E1 mode chosen right:** the trial balance opens as a sheet ("144 cells"); a text-only corpus PDF (market report, page 1) opens as the original; the switch flips both ways.
- **E2 our page is faithful:** every word of page 1 is drawn, at its box within 0.5 pt (from the model); every ruling line pdf_reader finds is drawn. Exposes: dropped words.
- **E3 edit anywhere:** a text cell (an account name) and a number cell changed in place; the totals recompute; D10 +1 → its total marked "does not add up" with
  the gap 1.00; the consistent edits → "adds up". Each edit one S9 entry.
- **E4 PDF round trip:** the exported PDF, re-read by OUR reader → the same sheet (all cells at the same addresses, the edited values); poppler `pdftotext -raw`
  contains every word of the model; `pdfinfo` clean. Exposes: an export that looks right but reads back wrong.
- **E5 Excel export** re-reads to the same cells with SUM formulas on the totals and the history verifying (existing checks reused).
- **E6 refused in words:** a Thai word in the model makes the PDF export refuse with the word named (slice A has no embedded font); the .xlsx still exports.
- **E7 phone:** at 390 px, CPU 4x: the sheet page fits the width, a cell tap opens its editor without scrolling the page, W-PDF-MOBILE still 162/162 on the
  owner's PDFs (`PDFM_LIST`, names never printed) and on the corpus.
- **Mutants (`EDSHEET_MUTANTS=1`):** a word dropped from the drawn page → E2; total not recomputed → E3; a cell written at the wrong box in the PDF → E4;
  a Thai word silently dropped → E6. Each must be killed.

### 18.5 AMENDMENT (owner's design, 2026-11-28, supersedes the two-mode split and the "fresh PDF" writer of 18.2/18.3 for slice A)
Owner, verbatim: *"So it kinda two in one mode? Where there is common font text and table, they appear as editable such? Where there are images and special
font text we stay out and retain its integrity while edit can happen all around it?"* — adopted: **one page, edit where understood, the original kept everywhere else.**
- **The page:** the ORIGINAL page is drawn by pdf.js as the base (images, drawings, every font). On top, an edit layer over the runs we can write back: text in a
  font whose embedded glyphs cover the new text, or that takes a stated standard-font substitution (WinAnsi); table cells get the spreadsheet behaviour (live
  totals marked on the page, drag-sum, a total's formula). **Locked, never touched:** images, vector art, text in a font we cannot write (Thai in a subset that lacks
  the glyphs, symbol fonts, ...): a tap says why it is locked. Text that is part of a picture is pixels: not editable, said so.
- **On edit:** the screen masks the old run's box and shows the new text in place; nothing else on the page moves.
- **Export PDF = the original file with only the edited runs changed** — the in-place engine of `pdf/pdf_write.js` (§4.3-4.4 of PDF_EDITOR.md) widened from
  numbers to any text run: same font where its glyphs exist, else a standard font added to the page's resources and STATED per cell. Every object not edited
  stays byte-identical; image streams are never decoded or re-encoded. One engine: no second PDF writer is added in slice A.
- **Excel export** as before. The old side grid stays behind a **Show grid** button (owner agreed the page is the main place to work, earlier the same day).
- **Still true:** any change breaks a digital signature (the file is a new revision); adding rows / sorting a table re-lays that table's region (slice B: the region is
  redrawn by us, the rest stays original).
- **Claims replacing 18.3 E1/E2/E4/E6 (W-EDIT-SHEET):** **H1** the edit layer covers every writable run of page 1 and no locked one; each locked run names why.
  **H2** text and number edits round-trip: our reader and poppler read the new text at the same boxes, the old text is gone. **H3 integrity:** every PDF object
  not holding an edited run is byte-identical to the original; every image stream byte-identical; a poppler raster changes 0 pixels outside the edited boxes.
  **H4** a font without the needed glyph → the run is either substituted (stated) or locked, never written wrong. E3 (live totals), E5 (Excel), E7 (phone) and the
  mutants stand; add mutant "an untouched object rewritten" → H3.

### 18.6 AMENDMENT (owner, 2026-11-28): closest font, a red "font not same" box, and undo (refines H4)
Owner, verbatim: *"And we prompt the user when we can swap a closest font or display a red box warning 'font not same' where user can ctl-z undo. This gives our
editor more cleaner space control?"* — adopted: **substitute and FLAG instead of lock**, the user decides.
- **Closest font, in order:** (1) the run's own embedded font when it holds every glyph; (2) another face of the SAME family embedded in the file (today's
  regular-for-bold rule); (3) the closest standard PDF font by the font's own description (FontDescriptor flags serif / fixed-pitch / italic, weight from the
  name or `/FontWeight`) → Helvetica / Times / Courier, regular / bold / italic; among those, the one whose widths fit the run's box best. The choice is logged
  `§EDSHEET-FONT cell=.. from=.. to=.. why=..`.
- **On screen:** a substituted run gets a red box with "font not same: <from> → <to>" until the user accepts it (box goes away) or undoes it. The red box is on
  the screen only, NEVER written into the PDF; the export summary lists every substituted run.
- **Undo:** Ctrl-Z (Cmd-Z on a Mac) and an Undo button (phones have no keyboard) reverse the last edit, repeatedly; Ctrl-Shift-Z / Redo re-applies. An undo is a
  history entry of its own (the inverse edit, actor "you", marked undo): the history inside the file stays a true record and keeps verifying; the PDF and the
  sheet return to the earlier text; the integrity claim H3 holds after any undo sequence.
- **Locked only when no font can show it** (e.g. Thai: the standard PDF fonts have no Thai glyphs) — said in words; an embedded font is slice B.
- **Claims added (W-EDIT-SHEET):** **H5** a run whose font lacks a glyph → substituted by the order above, red box shown with both names, logged, absent from the
  exported PDF's drawing; **H6** edit → undo → the exported PDF's edited-run text equals the original and every other object is byte-identical; redo re-applies;
  the history verifies with the undo entries; **H7** accept removes the red box and keeps the substitution. Mutants: red box written into the PDF → H5;
  undo not recorded in history → H6.

### 18.4 RESULTS — slice A (2026-11-28, bim-ootb PR #3500 `feat/edit-as-sheet`, merged as `4a38ab58`, deployed)
**The scope changed mid-build, per §18.5 then §18.6.** The build started on the two-mode design of 18.2/18.3. Only measurements and the standard-font width tables
had been written when §18.5 arrived, and no "fresh PDF" writer was ever written. The tables went into the one engine for the §18.6 closest-font step. What
shipped is §18.0. The 18.3 claims E1, E2, E4 and E6 are superseded, so they were not judged; H1-H7, E3, E5 and E7 were.
Code (bim-ootb): `pdf/edit_layer.js` (new, 135 lines: the targets, the totals marked on the page, the formula with its rows lit, a mouse drag giving sum and
count, the red box, the editor). `pdf/pdf_write.js` (+`rewriteText` = the same in-place engine for any text run; one-byte TrueType/Type1 fonts through ToUnicode
or WinAnsi; `lockOf` = the one owner of "writable"; the closest standard font from the FontDescriptor flags plus a width fit, added to the page's `/Font`
dictionary). `pdf/index.html` (the layer is built on open, edits are made on the page, Undo/Redo by Ctrl/Cmd+Z and buttons, "Show grid" = the old side grid,
the export lists substitutions). `modeller/pdf2dxf/pdf_reader.js` (`pagePaths` also returns `imageBoxes`; `read()` output is byte-identical to main on 7 PDFs).
`pdf/sw.js` ASSETS (+2). `pdf/tests/witness_edit_sheet.js` (new). `witness_pdf_mobile.js` (+1 stated line `§PDFM-LAYER`). Diff: 7 files, +759 / −47.
Command: `EDSHEET_MUTANTS=1 env -u DBUS_SESSION_BUS_ADDRESS node pdf/tests/witness_edit_sheet.js` (`EDSHEET_URL=<live page>` runs it against the deployed page,
without mutants).
```
§EDSHEET-H1 PASS judged=5 failed=0 writableRuns=139 lockedRuns=46 writableTargets=139 lockedTargets=46 uncovered=0 wronglyOffered=0   (+ picture page: the image locked, "Locked: a picture ...")
§EDSHEET-E3 PASS judged=8 failed=0 D28 gap=1 computed=40393.44 lit=21 entries=6 marksOk=4/4   (D10 +1 -> D28 "rows 40,393.44, gap 1.00"; the consistent four -> all marks add up; drag D6..D9 = sum, count 4)
§EDSHEET-H2 PASS judged=10 failed=0 cells=144 B10dx=0.000 D10dr=0.000 verdict=ADDS_UP   (text B10, B12, a run inside the mixed cell A1, numbers; poppler agrees; the 12-page report's one-byte font)
§EDSHEET-H3 PASS judged=5 failed=0 changed=5,6 added=32 of 31 objects; raster inside=696 outside=0   (picture page: the image object byte-identical, raster 149 inside / 0 outside)
§EDSHEET-H4 PASS judged=2 failed=0 thai:script-not-supported · arrow:glyph-missing ("the standard PDF fonts cannot show "→""), bytes unchanged both times
§EDSHEET-H5 PASS judged=5 failed=0 cell=B12 from=LiberationSans to=Helvetica standard=true why="no face of LiberationSans in this file holds them; closest standard PDF font: described as sans-serif, old text width 1.00 of the original"
§EDSHEET-H6 PASS judged=4 failed=0 undo=byte-identical redo=byte-identical entries=5 verify=true actors=report-reader|you|you (undo)|you (redo)|you (undo)
§EDSHEET-H7 PASS judged=1 failed=0 redBoxes=0, "Quiz Zebra" still drawn in Helvetica
§EDSHEET-E5 PASS judged=3 failed=0 cells=144 sums=4 history=OK/9   (host_shim.js's own reader)
§EDSHEET-E7 PASS judged=3 failed=0 layerMs=407 doc=390px header=99px scrolled=0 input=16px
§EDSHEET-MUTANTS killed=7/7   (target dropped->H1, totals stale->E3, wrong place->H2, Thai dropped->H4, untouched object rewritten->H3, red box written->H5, undo not recorded->H6)
§EDSHEET-VERDICT PASS judged=46 failed=0 mutants=7/7            LIVE (deployed page): §EDSHEET-VERDICT PASS judged=46 failed=0
§EDSHEET-COST layerBuilds=19 layerMsMax=29 (trial balance, desktop) · phone 4x CPU: 56-65 ms · the owner's PDFs: 24-2,228 ms (the slowest are files refused at file level)
§PDFM-VERDICT PASS judged=162 failed=0 (the owner's 25 PDFs, names withheld; local)   · corpus §PDFM-VERDICT PASS judged=36 failed=0   · LIVE: §PDFM-VERDICT PASS judged=162 failed=0, §PDFM-FIRSTVISIT bytes=253744 msToUsable=1714 (was 235,719 / 1,692 in §17.3)
```
Regression on the same tree: §PDFWR 67 (6/6) · §PDFHIST 57 (10/10) · §SREAD 38 (8/8) · §PDFED 13 (3/3) · §PDFPG 19 · §PDFWP 22 · §PDFHP 19 · §USE 44 · §SWPP 28 ·
§DOORURL 5 · `eslint pdf` exit 0 · CI pass. **No existing witness expectation was changed.**

**Findings:**
1. **18.3 E6 / E4 were wrong for the proof file (dated 2026-11-28, before §18.5 superseded them).** The trial balance is not Latin-only: 46 of its 185 runs on page 1 are
   Thai (13 words: title, header row, "รวม", the difference row). E6 ("a Thai word in the model makes the PDF export refuse") would have fired on the unedited
   file, so E4's round trip could not have been judged on it. §18.5's "export = the original file with only the edited runs changed" removes the problem: the Thai
   runs stay untouched and locked.
2. **Thai arrives in pieces.** The 13 Thai words are 46 runs, split at the glyph clusters, and the vowel marks are runs of ZERO width (e.g. at x = 70.90). A cell that
   mixes Thai and Latin (A1 "งบทดลอง (Trial Balance)") offers its Latin run alone; the Thai runs are locked with the reason "Thai text: its letters are shaped by
   the font ...". Two geometry rules were needed, found by H1's own failing checks. (a) A run's box is drawn in by 0.6 pt at each side, so a zero-width mark touching
   " : " does not fall into it. (b) The box handed to the writer is the run's baseline band (±0.3 pt), not its glyph box: the glyph box of a 10 pt run reached the
   14 pt title's baseline on the line above, and the engine would have refused the edit.
3. **The PDFKit title already overflows its own clip.** "(Trial Balance)" is clipped to 63 pt but is wider than that. A WIDER new text is refused `does-not-fit`
   (named, as §4.3 wants); a text no wider than the old is written. The witness edits it to "(Trial 2003)".
4. **Outside files: the file structure decides, not the fonts.** On the owner's 24 openable PDFs (phone run, counts only), page 1 of **9 has writable text**.
   Refused at file level: **8 by cross-reference streams (PDF 1.5+)** and 1 encrypted. Also 4 turned pages (`/Rotate`), 1 with all its text inside a form XObject,
   and 1 scan. Each is locked with its reason. The biggest next lever for "edit any PDF" is cross-reference streams (8 of 24), then turned pages (4).
   Rotation was found in this run: the first owner run said "rotated-text" on every run of those 4 files (true in the writer's unturned frame, but misleading to a
   user who sees upright text). It now says "this page is turned (/Rotate 90)".
5. **A finger's tap closed its own editor.** After a touch the browser moves the focus, which blurred the new field at once (E7's first run: editor logged, field
   gone). The editor now opens on `touchend` with `preventDefault`. Measured after: scrollY 0 → 0, a 16 px field on screen.
6. **Undo is exact.** It puts back the earlier bytes, so after edit → undo the PDF is the original byte for byte, and the downloaded copy differs only in the history
   objects (1 changed, 2 added). Each undo or redo is an S9 entry ("you (undo)" / "you (redo)"; S9 fixes `meta`, so the mark is in the hashed actor), and the history verifies.
7. **One reader of page 1 per purpose.** The layer reads page 1 when a file opens. That read is kept apart from the grid's `S.read`, so the P0 page witness's
   "opening another file clears the previous sheet" holds unchanged. Download .xlsx uses the grid's sheet when it is open, else the page's own.

**Not done (stated):**
- The layer is on **page 1 only** (as §18.3 scoped).
- Cross-reference streams, turned pages and text inside form XObjects are locked, not edited.
- Drag-sum works with a mouse only; a finger scrolls.
- "Masks the old run's box on screen" is done by redrawing the page from the rewritten bytes (pixels outside the edited boxes unchanged, H3). There is no separate mask.
- Substitution judged on the page: sans regular → Helvetica only. The Times and Courier, bold and italic choices are coded, not witnessed. The same-family step
  is judged by the engine (W7), not on the page.
- Edits outside a table are recorded under the sheet `_door_text` (cell `A<run>`). The open-time binding check skips `_door_` sheets, so a file whose prose was
  changed outside the editor is not detected.
- The Modeller's W-PD2 witness was not run (it needs an outside oracle, VACUOUS without it). The `read()` equivalence on 7 PDFs stands in for it.
- Real Excel, Acrobat and Preview were not run. The new witness is not wired into CI.
- Privacy: the diff was checked against the 25 file names before the PR. One stem matched, and it is treated as the generic word that §17.3 found. It was not
  inspected further, because the list may be used only through the mobile witness.

## 19. The report engine in the live app: "a report printed by our ERP" (spec 2026-11-28, before code)
Owner, 2026-11-28: agreed to merge the NinjaExcel report PDF engine first (OPEN LIST 22) so the new film (FILM_KILLER_FRONT_DOOR "FILM v2") can show a report
printed by our ERP, edited on the one page and filed back. Owner, verbatim: *"Go with your suggestions."*
**Measured before the design:** the engine is NOT on bim-ootb main. bim-ootb `origin/feat/ninja-template-pill` (last `cdf7ec8c`, sw v845; main is at v1154) adds
`erp/ninja_template.js`, `ninja_template_xlsx.js`, `ninja_report.js`, pill changes, vendored `erp/vendor/pdfkit.standalone.js` (~53k lines, MIT) + `exceljs.min.js`
(MIT), two sample workbooks; bim-compiler `origin/ninja-xtab2` holds `build/erp/ninja_pdf.js` (134 lines, own sheet → PDF renderer, pdfkit injected) and
the lane file `prompts/NINJAEXCEL_TEMPLATE_ENGINE.md`, whose RESUME blocks list an open ⛔ ("re-home the pill port into `erp/overlay/ninja/`") and the unopened
PRs. Known defect: Thai SARA AM printed wrong (`จำนวน` → `จำานวน`, §7.5). The ERP's own toolbar **Print** (`idempiere.html` ~2070, `__report.printRecord`)
folds a receipt from the record; it is not AD_PrintFormat-driven and writes no PDF file itself — not in scope here.
**Design:** bring the engine to bim-ootb main by the NINJAEXCEL lane's OWN plan (its RESUME blocks, its ⛔ respected: if re-homing needs an owner ruling, stop
and say so); ONE copy of the engine (fold the two copies the lane names); pdfkit is the one PDF writer for NEW pages we draw (it embeds TTF fonts — the
same mechanism slice B of §18 will use for Thai, no second writer); the user reaches it from the NinjaExcel pill ("Run report" → "Download PDF") as the
manual describes. Fix SARA AM in the engine, not in the font.
**Claims (W-NINJA-PDF; verdict `§NINJAPDF-VERDICT ...`):** **N1** the trial-balance sample prints a PDF in the browser that OUR reader (`pdf/report_reader.js`)
reads back to the same cells and "adds up" (the round trip this film beat needs); **N2** the Thai labels extract with poppler `pdftotext -raw` equal to the source
strings (SARA AM right: `จำนวน`); **N3** that PDF opens on the one page (§18) and a number edit round-trips (H2/H3); **N4** the lane's existing witnesses
(W40/W41/W42, W44 Xtab2, W47 replay — as its file names them) stay green; **N5** cost logged (bytes added to the first visit of the ERP page; pdfkit loads only when
a PDF is asked for). Mutants: SARA AM fix removed → N2; a cell dropped from the PDF → N1.

### 19.1 RESULTS (2026-11-28; bim-compiler #1375 merge `614583fe`, bim-ootb #3501 merge `03f67130`, witness follow-up #3502 merge `8537a5be`)
**How it was done:** the NINJAEXCEL lane's own plan, step 1 ("re-home the pill port into `erp/overlay/ninja/`, open the bim-ootb PR, merge `ninja-xtab2`"). Its ⛔ needed
no owner ruling: the law's rules are written (ERP_DEPTH_FILM.md §EXTENSION-LAYER LAW), and "ask the #2009 session before touching `overlay/boot.js`" did not arise -
boot.js is not touched (other sessions have edited it since, #2431 #2592; editing it now would also change its `?v=` code in `idempiere.html` and break CU2).
- **bim-compiler #1375** (`ninja-xtab2` + 4 commits, master merged in: PROGRESS.md master's, the NinjaExcel manual the branch's wording): `build/erp` stays the one
  source of truth. `ninja_pdf.js` SARA AM fix; `ninja_report.js` = the pill-sync host (pre-flight, SELECT-only guard, SQL timing) + `opts.paths` + `opts.pdf=false`/`toPdf()`;
  `ninja_pill.js` back to master (the report flow is the overlay's now); W40/W41/W48/run_usecases/probe_uc1/run_all.sh follow the bim-ootb layout.
- **bim-ootb #3501** - NO core file changed (W-CORE-UNTOUCHED: "core files differing ... none"): `erp/overlay/ninja/` = 6 byte copies of `build/erp` + `report_pill.js`
  (wraps `NinjaPill.open`/`handleBuffer`: two sample report links, a workbook with Input+Process+Output+BACKUP goes to the report flow, any other to the core unchanged)
  + `samples/` (the lane's two templates, 7.8 + 7.5 KB, copied: its generator is Java/POI `MakeParityTB/Reg.java` + `Xls2Xlsx`, main had no equivalent);
  `erp/overlay/pills.js` +3 lines loads it; the old core `crud_overlay.js withTipDb` edit is replaced by the published `__crud.withTipQuery` (the raw connection is used
  inside it); `common/pdfwriter/` = PDFKit 0.15.2 standalone (MIT) + 6 OFL fonts, the one writer for new pages (§18 slice B can load the same; not `common/lib`, that is
  W-ONE-LIB-FOLDER's mirrored set: putting it there added 4 L3 MISSING lines); ExcelJS = the existing `viewer/lib/exceljs.min.js` (byte-identical, no second copy).
  The pill shows "Run report" -> preview + `.xlsx` + **Download PDF** (the PDF is drawn on that click), as the manual describes.
- **SARA AM, in the engine:** the font (Noto Sans Thai, OpenType ccmp) draws ำ as NIKHAHIT + SARA AA; the AA glyph is shared with every real า, and a ToUnicode entry
  belongs to a glyph, so readers got an extra า. A glyph remap cannot cure it (an empty entry reads as U+0002 in pdf.js and as a space in poppler - both measured).
  Cure: a cluster holding SARA AM (Thai U+0E33 / Lao U+0EB3) is DRAWN as its shaped outlines and WRITTEN as transparent text shaped without ccmp (the font's own
  single ำ glyph); fontkit's glyph cache is primed so a decomposed AA never poisons a real one (found: the first fix turned `เอกสาร` into `เอกส ร`). Drawing unchanged:
  600 dpi cross-correlation old vs new best offset 0 px. Before/after, `pdftotext -raw` of the sales-register PDF: **`จำานวนเอกสาร (ใบ) 1`** -> **`จำนวนเอกสาร (ใบ) 4`**
  (also `น้ำ ต่ำ`, `กำไร` exact, both PDFKit builds; Lao ຳ needed nothing - its font does not decompose).
```
§NINJAPDF-N1 PASS   read=144 sameAddressAndText=144 extra=0 verdict=ADDS_UP reason="4 totals agree with their rows"   (trial balance 2003, from the pill, real download)
§NINJAPDF-N2 PASS   trial-balance Thai cells 11/11, sales-register 9/9, poppler -raw and pdf.js; saraAmLine="จำนวนเอกสาร (ใบ) 4"
§NINJAPDF-N3 PASS   pdf/index.html (§18, #3500): C6 273.80 -> 274.80 typed, §EDSHEET-EDIT ok=true, reader C6="274.80" othersChanged=0 rightEdgeMoved=0.000pt,
                    poppler new=1 old 2->1, verdict=DOES_NOT_ADD_UP reason="C28: printed 0.00 != rows sum 1.00; F6: printed 273.80 != F = C + D - E gives 274.80"
§NINJAPDF-N4 PASS   run_all.sh gatesOk=54 (W40 B2_browser_run, W41 B2_pill_end_to_end 21 accounts debit=credit=40,392.44, W42 R_register_*, W44 X_xtab2 cells=12 diffs=0,
                    W47 R_replay_MOES_sofp 49/49 152/152 + cashflow, W48 W_pill_preflight 8/8, every negative control FAIL as it must)
§NINJAPDF-N5 PASS   first visit: one new request, report_pill.js; bytesAdded=12,152 (11,609 + pills.js 543); Run report fetches ExcelJS + engine 1,025,580 B and NOT the
                    writer; the first Download PDF fetches PDFKit + ninja_pdf.js + 6 fonts 3,667,677 B (fonts 964,452); a second report fetches nothing again
§NINJAPDF-N6 PASS   erp/overlay/ninja engine files == bim-compiler origin/master:build/erp (6 of 6)
§NINJAPDF-MUTANTS killed=2/2   M1 SARA AM fix removed -> N2 FAIL (register 8 of 9); M2 a cell dropped -> N1 FAIL (143 of 144)
§NINJAPDF-VERDICT PASS N1=PASS N2=PASS N3=PASS N4=PASS N5=PASS N6=PASS judged=23 failed=0
LIVE (https://red1oon.github.io/bim-ootb/, after the Pages deploy of 03f67130): §NINJAPDF-VERDICT PASS ... judged=23 failed=0 (N1 144 of 144 ADDS_UP)
```
**Regression (logs read):** W-FILE-IT PASS 53/0 · W-DOOR-ERP PASS 48/0 · W-HISTORY-PAGE PASS 91/0 · W-KILLER-USE PASS 44/0 · W-SHEET-DOOR PASS 33/0 · W-SHEET-ADDIN PASS
63/0 · gen_manifest --check verdict=PASS · bump.js --changed: nothing to bump (no changed file is loaded with `?v=`) · eslint clean on the touched files.
**Findings:**
1. **W41 had been red since bim-ootb #2083** (the Excel Report pill became a plugin bundle): its server sent `.mjs` as octet-stream, the bundle never loaded, `#pill-ninja`
   never appeared. Fixed in W41 (serve `.mjs` as JavaScript, wait for the pill).
2. **`U_usecases` is BAD on pristine bim-ootb main too** (`scripts/erp_usecases` UC-1 POS sale: `[data-doc-action="CO"]` never appears; probe run on a `git archive` of
   origin/main, no NinjaExcel code involved). The DEPTH-lane gestures it borrows have drifted. Not N4's list; named, not fixed here.
3. **W-CORE-UNTOUCHED CU4 fails on main itself since #3373:** `erp/modules.json` names `erp/overlay/boot.js` (the manifest owns the seam's `?v=` code). The law's owner
   decides whether the manifest counts as a reference; CU1-CU3 pass for this work.
4. The witness's first LIVE run FAILED N1-N3 for its own reason (a slower sample fetch let it press the previous Run button; Chrome's same-name download overwrote the
   first PDF) - fixed in #3502, live then 6/6. A green local run had not exercised that timing.
**Not done:** the overlay's report files are not precached (offline report run not claimed - adding them to `PRECACHE_ASSETS` would edit core `sw.js` beyond
CACHE_VERSION, CU3); the slow-statement guard is still not called by the pill host; `ninja_excel.js` (old scalar binder) and the template engine are still two engines
(AD-LAYER LAW 5, lane item 4); the manual's "designer section" draft is not merged into the live manual; the film beat itself is not recorded.
**The `ninja-xtab2` branch** is fully contained in master (#1375 squashed it with the 4 commits above); it holds nothing master lacks and can be deleted.

## 20. Review of the 2026-11-28 code: what it found, the fixes (spec 2026-11-28, before code)
The ▶ FIRST task of the resume block. The code was read cold (not the results prose); each finding below was reproduced before it was believed
(`§REVIEW-R1..R4`, a throw-away script over hand-built PDFs; numbers quoted are from its log). Scope of this section's fixes: bim-ootb `pdf/`.
Findings of the two parallel reads (§19 report engine; #3493 / #3494 / #3498 pages and witnesses) are in §20.6-20.7.

### 20.1 Findings in the one-page editor (`pdf/pdf_write.js`, `pdf/edit_layer.js`, `pdf/index.html`, `pdf/pdf_open.js`)
| # | Finding (file:line at bim-ootb `a3faf543`) | Reproduced | Kind |
|---|---|---|---|
| R1 | **Invisible text is offered and "edited".** The interpreter (`pdf_write.js:256-321`) never reads the `Tr` operator, so the hidden text layer of a scan (render mode 3) is a writable run. The edit succeeds and the page looks exactly as before: the picture on top is untouched. | `lock=null rewriteOk=true` | correctness |
| R2 | **A glyph the subset does not hold is written at width 0.** A one-byte font read through WinAnsiEncoding (`pdf_write.js:235`) is given EVERY WinAnsi character as "carried", whatever `/Widths` says. `/Widths [278 0 556 556 556 556 0 0]` from code 46: typing a `7` (beyond LastChar) or a `4` (width 0, how a subsetter marks an unused code) is accepted with no substitution, the number comes out 6.68 pt narrower (36.70 -> 30.02). | `ok=true fontSub=null` twice | correctness |
| R3 | **Offered, then refused.** `listRuns` (`pdf_write.js:559-568`) and `rewriteNumbers` (`:418-429`) each build "this page's runs" on their own; only the writer knows `shared-content` (two pages, one content stream) and the page's rotation is checked a third time in `index.html:311`. The layer offers a run the writer refuses. | `offeredLock=null refused=shared-content` | one owner (§18.5 H1) |
| R4 | **Every edit, undo and redo re-reads the text of EVERY page.** `swapTo` (`index.html:298`) reopens without `textLater`. 600 pages: 1,288 ms per edit against 64 ms for the sizes and 20 ms for the rewrite itself. | measured | perf budget |
| R5 | **Undo keeps one whole copy of the file per edit**, without limit (`index.html:306`, `before` / `after`). 2.5 MB each on the 600-page file; a 50 MB PDF and ten edits is 550 MB, above a phone tab. | by reading (N+1 buffers for N edits) | perf budget |
| R6 | "Is this run in that box" is written three times: `pdf_write.js:361` (plan), `:479` (applyToItems), `edit_layer.js:20` with its own copy of the 0.5 pt tolerance and the comment "the writer's own rule". | by reading | one owner |
| R7 | A mouse drag that ends outside the page leaves the sum-box on the page and the next click is taken as the end of that drag (`edit_layer.js:96-106`: no `pointercancel` / leave). | by reading | correctness, small |
Reviewed, no change needed: the lexer and object reader; the full rewrite (`build`) and its cross-reference table; the kerning arithmetic of `plan` (lead / tail keep
the pen); font substitution choice and the red box staying on screen; `embedFile`; `formatLike` / `alignOf`; the open flow's `S.opens` guards in the edit path.
`witness_edit_sheet.js` and `witness_pdf_write.js` can fail (7/7 and their own mutants; W13 sweeps every number cell of the corpus, not a picked one).
Their blind spot is the corpus: no scan, no one-byte subset font, no shared content stream, one page - which is why R1-R4 passed green.

### 20.2 The fixes (each in the generic place, none per file or per PDF)
- **R1** `interpret` keeps the text render mode (`Tr`, part of the graphics state, so `q`/`Q` restore it); `lockOf` locks mode 3 and 7 by name:
  `invisible-text` - "this text is not drawn (the hidden text of a scanned page): changing it would not change what the page shows".
- **R2** a one-byte font carries a character only if its code has a `/Widths` entry above 0. Anything else is "missing" and takes the path already there:
  another face of the family, else the closest standard font with the red box (owner ruling 2026-11-28), else a named refusal.
- **R3** ONE function turns a page into `{ lock, runs, fonts, streams }` and both `listRuns` and `rewriteNumbers` call it. A page-level refusal (turned page,
  shared content) reaches the layer as `runs.pageLock`; `index.html` drops its own rotation check. `runs.rotate` stays (the phone witness counts it).
- **R4** `PdfOpen.reopen(pdfjsLib, bytes, prev, page)`: sizes for all pages, the text of `page` only, every other page's text and runs carried over from `prev`
  (an edit touches one page). Falls back to a full read when the page count differs. `swapTo` uses it; a `§PDFED-REOPEN pagesRead= of= ms=` line states the cost.
- **R5** the undo stack holds at most `UNDO_BYTES` of earlier copies (128 MB: a fifth of the ~0.6 GB a phone tab has, CLAUDE.md PERF BUDGET; a bound chosen here,
  not measured). Beyond it the OLDEST steps lose their bytes, never their record (the font list of the export stays whole); undo then stops there and says so.
  `§EDSHEET-UNDO-MEM steps= heldMB= dropped=` after every push.
- **R6** `PdfWrite.inBox(cx, y, box)` is the one rule; `plan`, `applyToItems` and the layer call it. `edit_layer.js` loses its copy and its tolerance.
- **R7** a drag is ended by `pointercancel` and by the pointer leaving the layer: the box is removed, nothing is summed.
Deletion budget: stated with the results (lines + / −).

### 20.3 Witness (the corpus gap is closed in the witness, with PDFs made in it - no new binary in git)
W-PDF-WRITE gains case **W14 REVIEW** over four PDFs built in the witness itself (poppler must open each: an invalid fixture judges nothing):
- `invisible` a mode-3 run: `listRuns` locks it `invisible-text`; `rewriteText` refuses by the same name; bytes unchanged. A visible run on the same page stays writable.
- `subset` the `/Widths` font above: `7` and `4` are written in a standard font, `fontSub` stated, and the new text is as wide as that font says (not narrower
  by a glyph); `5` (carried) is written in the font itself with no substitution.
- `shared` two pages on one content stream: `listRuns(…).pageLock.reason === 'shared-content'` and the writer refuses by the same name (offered == writable).
- `reopen` 40 pages, one edit on page 7: `reopen` reads 1 page; its text and runs for ALL 40 pages equal a full fresh open of the new bytes; the edited
  page shows the new text. (The equality is the point: a carried page that was in fact changed would fail it.)
Mutants (each must turn W14 FAIL): `MUT-TR` (the lock for mode 3 dropped), `MUT-WIDTHS` (the width rule dropped), `MUT-PAGELOCK` (listRuns ignores the page lock),
`MUT-CARRY` (reopen carries the edited page too). W-EDIT-SHEET (browser) gains H8: with the budget set to one file's size, three edits leave one step with
bytes, `§EDSHEET-UNDO-MEM dropped=2`, one undo works byte-identically and the next says it cannot; and R7: a drag released outside the page leaves no box.
Every existing case of W-PDF-WRITE, W-EDIT-SHEET, W-PDF-HISTORY, W-PDFED-P0 and the page witnesses stays green.

### 20.4 Found by the new witness itself (added to the fix list before it could pass)
- **R8** a mouse drag that leaves the page starts a browser TEXT SELECTION; the next drag on the page is then a native drag-and-drop (`pointercancel`), so the
  sum-box never comes. Measured in the headless page (`pointerdown` then `pointercancel`, no `§EDSHEET-SELECT`). Fix: the layer is `user-select: none`
  (the editor's input keeps `text`). H8 `drag-left-the-page` asserts the drag AFTER the escaped one sums 4 cells.

### 20.5 The pages around the editor (#3493 / #3494 / #3498): findings of the second read, each reproduced on the local page
| # | Finding (`pdf/index.html` at `a3faf543`) | Reproduced |
|---|---|---|
| D1 | **Two opens that overlap leave one file's bytes with the other file's document.** `o = S.opens` is taken after `await PdfOpen.open` (`:136`), so neither call backs off; the loser's document is never destroyed. A drop during a slow open, or a double tap on the sample. An edit from there writes one file's boxes into the other's bytes. | `S.name` = the 1-page file, `S.info` = the 12-page one |
| D2 | **No resize / rotation handling.** `layout()` runs once per open: widths are fixed px and the observer root is chosen once. Phone landscape -> portrait: 12 of 12 canvases alive, page 580 px in 390. The §17 "every page drawn" defect back through a rotate. | canvases 1 -> 12 |
| D3 | **A prose edit still makes Sheet history list changes nobody made.** An edit outside a table skips `startPage`, so the history's only sheet is `_door_text`, which the .xlsx does not carry: "37 cells have changed since the last stamp". #3494's fix, defeated by #3500. `witness_killer_usability.js` J2 edits number cells only and cannot see it. | pending = 37 |
| D4 | A failed open after a good one keeps `body.open`: the sample button stays hidden, Undo stays visible, under a message that says to open a PDF. | `bodyOpen=true` |
Fixes: **D1** the open's own number is taken right after `closeDoc()` and checked after EVERY await of `openBytes`; a document that lost is destroyed. **D2** one
debounced `resize` listener: when the panel's width or "which element scrolls" changed, the observer is dropped, `layout()` runs again, the page that was on
screen is brought back and the edit layer re-mounted. **D3** ONE rule at the export: the workbook and its history hold the SAME sheets. (1) A history that never saw this page's sheet gets it at Download
.xlsx, as first read. (2) Every other sheet the history holds - another page read as a sheet, the texts changed outside a table (`_door_text`) - goes into
the workbook as the history holds it. These sheets are VISIBLE: the Sheet history page compares the visible sheets only (`history.js:34`), a hidden one would
again read as cleared. (A hidden `_door_text` needs the reader to read history-named hidden sheets, in `erp/`, three hosts: not done here.)
**D4** `closeDoc()` removes `body.open`.
Witness: W-EDIT-SHEET **H9** - (a) the 12-page report and the trial balance opened without waiting: bytes, document and page count are all the LAST file's;
(b) after a good file, a non-PDF: `body.open` is gone; (c) the 12-page report at 844 px wide then 390: canvases alive <= 6 and every page <= the window's width;
(d) a prose edit beside a table, Download .xlsx, read by `SheetHistory`: 0 pending changes. Mutants: `MUT-OPENRACE` (the check after the open dropped),
`MUT-NORESIZE` (the listener does nothing), `MUT-ONESHEET` (the workbook carries its own page only). Plausible, not reproduced, left as notes: a page that leaves during `getPage` keeps its canvas until it returns;
a text read that fails on the open file leaves "Reading ..." with no words; `go()` on a phone lands under the sticky header; the history sample restores
the visitor's name without try/finally. Owned three or four times, not merged here (P7-sized, listed in the resume block): the link row markup + CSS (three
pages), the download-a-blob helper (four), the 760 px breakpoint (CSS and `phone()`); `witness_pdf_mobile.js` rests M2 / U6 / U7 on the one multi-page corpus file.

### 20.6 The report engine in the live app (§19, #3501 / #3502): findings of the third read
Engine files are bim-compiler `build/erp` first, copied out (N6 byte-identity). Reproduced in node (pdfkit + poppler):
| # | Finding | Reproduced |
|---|---|---|
| C1 | **A number wider than its column prints as a different, smaller number**: right-aligned then clipped (`ninja_pdf.js:157-159`), only the tail digits show. Poppler still extracts the whole number, so N1 / N2 cannot see it. | 1234567.89 in a 5-char column: text starts 34 pt left of its clip |
| C2 | **The font is parsed again on every `doc.font(bytes)`** (`ninja_pdf.js:145-149,162`), ~3.3 times per cell. | 1,800 cells: 8,583 ms against 118 ms with each font registered once |
| C3 | **No page break**: one page as tall as the sheet (`:90-91`). PDF's limit is 14,400 pt, about 1,100 default rows. | 5,000 rows: one page of 63,894 pt |
| C4 | **Text in a script with no font here is dropped without a word** (`runsOf :31` sends everything not Thai / Lao to Liberation Sans). | Chinese, Arabic, the rupee sign: absent from the PDF, no log line |
| C5 | N2 judges SARA AM on ONE word; the tone-mark branch (`:45`), AM at a run's start and Lao are never judged (the code is right: 10 of 11 variants exact through poppler). | a mutant deleting `:45` would survive |
| C6 | Dead: `hasLao` (`ninja_pdf.js:27`), `_fonts` (`ninja_report.js:10,44,48`), N3's `git log | grep` gate (INCONCLUSIVE on a shallow clone). | by reading |
| P-R1 | A second "Download PDF" click while the first runs gives two downloads (`report_pill.js:76-83`); a PDF failure wipes the finished report (`:82` -> `fail()` sets `innerHTML`). | by reading |
| P-R3 | The printed-text rule (`numFmt || z || 'General'` through SSF) is written three times, the third in the witness: N1 compares the PDF with a copy of the rule. | by reading |
| P-R4 | The verdict word is PASS while a claim is INCONCLUSIVE (the recorded LIVE run: N4 not judged, "PASS"); N3 skips four checks when its bytes are null. | by reading |
Fixes (one bounded builder task, spec = this table): **C2** each font registered once per document, used by name. **C1** a number that does not fit prints as
`#` fill, as Excel does, counted in `§NINJA_PDF overflowNumbers=`. **C3** pages: the sheet is cut at ROW boundaries so no page is taller than 14,400 pt (the
header row is not repeated: no evidence for it in the template). **C4** code points no loaded font holds are counted, returned as `missingGlyphs`, logged in
`§NINJA_REPORT_PDF`, and said in one line on the pill. **C6** deleted. **P-R1** one in-flight promise per result; the error goes in its own node. **P-R3** one
exported `cellText(c, styles, fmt)`, used by the renderer, the pill and the witness. **P-R4** the verdict word is `PASS` only when every claim is judged, else
`PASS-PARTIAL notJudged=...`. **C5** witness N2b (node only): the word list through the renderer and poppler; mutant M3 on the tone-mark loop. Each of C1-C4
gets a node case that fails before and passes after; `renderMs` and `heapMB` join `§NINJA_REPORT_PDF`.
**⛔ Not fixed, needs one fact:** the report takes the LOWEST `ad_client_id > 0` (`ninja_report.js:76-78`) and the pill passes no client; `ad_seed.db` holds six
clients. Whether the live page's database can hold more than one tenant at once decides if this is a defect (other overlays take the client from the session).

### 20.7 RESULTS (2026-11-28) - bim-ootb #3509 (`fix/killer-review-20`), the editor and the pages (§20.1-20.5)
All of R1-R8 and D1-D4 fixed as specified, with two changes of plan found while building, both stated in §20.4 / §20.5 before the code:
R8 (the text selection) was found by the new drag check itself; D3 became ONE rule at the export, and its sheets are visible.
| Witness (logs read, local tree) | Verdict |
|---|---|
| W-PDF-WRITE (node) | `§PDFWR-VERDICT PASS judged=77 failed=0`, `§PDFWR-MUTANTS killed=10/10` (W14: 10 checks; M7-M10 new) |
| W-EDIT-SHEET (browser) | `§EDSHEET-VERDICT PASS judged=55 failed=0`, mutants 12/12 (H8: 5 checks, H9: 4; five new mutants) |
| W-PDFED-P0 12 · W-SHEET-READER 37 · W-PDF-HISTORY 56 · PDFPG 19 · PDFWP 22 · PDFHP 19 · phone PDFM 36 · usability USE 44 | all PASS, 0 failed |
Evidence lines: `§REVIEW-R1 lock=null rewriteOk=true` -> `lock=invisible-text rewriteOk=false`; `§REVIEW-R2 ... fontSub=null widthAfter=30.02` ->
`fontSub Arial -> Helvetica, widthAfter=36.70`; W14 `reopen pages=40 pagesRead=1 pagesDifferentFromFreshOpen=[]`; `§EDSHEET-UNDO-MEM steps=3 withBytes=1
heldMB=0.07 budgetMB=0.07 dropped=1`; `§PDFED-RELAYOUT width=580->366 phone=true page=1 pages=12` (3 canvases alive, widest page 366 of 390 px);
`§PDFXLSX-SHEETS page="Report" alsoFromHistory=["_door_text:1"]` then on the history page `§SHIST-PAGE-BIND state=intact entries=2 cells=37 pending=0`
(was 37 pending); with the `open-race` mutant the overlap check reads `name=small1.pdf pages=12` - the defect itself.
A lesson for the witness: the first overlap check (two opens in one tick) could NOT fail on the missing guard after the read - the mutant survived (11/12).
The check now also asks for the second file 4 ms into the first one's read; then the mutant dies. A guard needs a check timed to the await it protects.
Lines: `pdf_write.js` +41 −24, `index.html` +58 −15, `pdf_open.js` +17 −2, `edit_layer.js` +5 −3; witnesses +148 −9. Deleted: the second "page -> runs"
(listRuns' own copy), the page's own rotation check, two copies of the in-box rule and one of its tolerance.
**Not done / stated limits:** the undo budget (128 MB) is a bound chosen, not measured on a phone; a `_door_text` tab is visible in the .xlsx (hiding it
needs the Sheet-history reader, `erp/`, three hosts); the "plausible" items of §20.5 are not reproduced and not fixed; the copies named at the end of §20.5
(link row, download helper, breakpoint) are not merged; the editor still covers page 1 only.
**LIVE (2026-11-28, after #3509 `a16077a4` reached GitHub Pages):** `EDSHEET_URL=https://red1oon.github.io/bim-ootb/pdf/` ->
`§EDSHEET-H8 PASS judged=5`, `§EDSHEET-H9 PASS judged=4 ... opens=small1.pdf/1p · turned alive=3 widest=366/390 · prose 0 pending`, `§EDSHEET-VERDICT PASS judged=55 failed=0`.

### 20.8 RESULTS (2026-11-28) - the report engine (§20.6): bim-compiler #1386 `c9ae739e`, bim-ootb #3510 `bd635644`
Built by a Sonnet builder from §20.6; its witness re-run by the coordinator before the merge (log read), then on the LIVE site.
| Run | Verdict |
|---|---|
| local, mutants, with the lane's `run_all.sh` log | `§NINJAPDF-VERDICT PASS N1..N7, N2b, C1..C4, P3 = PASS judged=50 failed=0`, `§NINJAPDF-MUTANTS killed=7/7` (M3-M7 new) |
| the new cases against the OLD engine | `C1=FAIL C2=FAIL C3=FAIL C4=FAIL P3=FAIL judged=18 failed=12` (N2b passes: that code was right) |
| LIVE `NINJAPDF_LIVE=https://red1oon.github.io/bim-ootb/` | `§NINJAPDF-VERDICT PASS-PARTIAL notJudged=N4 ... judged=48 failed=0` (N4 is local only, and now SAYS so) |
Facts: C1 `cellA1 word="####" x=38.00..60.25 cellBounds=36.00..63.00 overflowNumbers=1` (before: `1,234,567.89` from x=1.86, clipped); C2 `cells=1800
fontParses=3 ms=128` (before 6,001 parses, 7,300 ms); C3 `rows=2500 pdfinfoPages=3 tallest=14398.5pt rowsOnPage1=1118`, a merge over a cut moves whole to
the next page; C4 `{"count":7,"distinct":6,"cells":2}`, on the pill "2 characters in 1 cell (中文) have no font in this PDF and are left blank."; N7 three
clicks = 1 PDF run, a failed PDF keeps the finished report; `§NINJA_REPORT_PDF ... renderMs=77 heapMB=64.7 overflowNumbers=0 missingGlyphs=0` on the live page.
Lines: `ninja_pdf.js` +63 −16, `ninja_report.js` +11 −8, `report_pill.js` +13 −13, witness +192 −19. Deleted: `hasLao`, `_fonts`, N3's `git log | grep` gate,
two copies of the printed-text rule.
**Where §20.6 was wrong, found by the builder:** poppler cannot see the tone-mark mutant (the hidden text is the same, the DRAWING differs): N2b judges the
glyph clusters too, and only that kills M3. **Changes of behaviour to know:** `cellText` lives in `ninja_pdf.js`, so that file (16 KB) now loads at Run report,
not at Download PDF (PDFKit and the fonts still load only at Download PDF; N5 reworded); a NUMBER cell never wraps now; `#` fill is for numbers only.
**Not done:** the ⛔ tenant question; no header row repeated on later pages; a merge taller than a page is still split; N7 has no "fails before" run;
N4 still trusts any `run_all.sh` log it is handed (needs `OOTB_WT` set, or W40 / W41 read as missing).

## 21. A number cell on the page takes a number only (owner 2026-11-28: "Yes"; spec before code)
Found while the guide was checked against the page: the GRID refuses a non-number typed into a number cell ("is not a number"), the PAGE wrote it as text
(`index.html` `layerEdit`: `else if (f.reason !== 'not-a-number') return refuse(...)`). The common case is a slip (`12O.50` with a letter O): the column's total
then stops adding up or is no longer judged. **Rule: one answer for both ways of working - a cell the reader holds as a number takes a number; anything else is
refused in words, the bytes unchanged.** A cell that is text stays freely editable; a dash for zero is still written where the column prints dashes (`formatLike`).
Witness: W-EDIT-SHEET H4 gains `number-cell-takes-number`: `12O.50` typed into D10 on the page -> `§EDSHEET-EDIT ... ok=false reason=not-a-number`, the status says
`D10 was not changed: "12O.50" is not a number.`, bytes identical. Mutant `text-into-number` (the old exemption back) must turn H4 FAIL.
**RESULT (2026-11-28):** bim-ootb #3516. `§EDSHEET-CHECK case=H4 key=number-cell-takes-number OK`, `§EDSHEET-VERDICT PASS judged=56 failed=0`; with the mutant
`text-into-number` the page writes `new="12O.50"` and H4 is FAIL. Also the same day: #3515 plain words (no "slice B" / "in this cut" / "phase P7" in any message
the page shows; W-PDF-WRITE W14 `plain-words`, 15 found before, 0 after, 78 judged) and the guide rewritten for the one-page editor and the ERP print
(bim-compiler #1390, live): FILM v2's third prerequisite is met. Guide corrected after the film builder's check: the sample's total is `SUM(D6:D26)`.

## 22. Files with a cross-reference STREAM become writable (PDF 1.5+) - spec 2026-11-28, before code (owner: "yes")
**Why first:** of the owner's 24 openable PDFs 9 are writable on page 1 and 8 of the other 15 fail for this one reason (§18.4). It is the largest single unlock;
a designer feature (move a picture, shift a page, move a column - §24) is no use on a file the page cannot write back.
**Today:** `pdf_write.js` `PdfFile.load` throws `xref-stream` when `startxref` points at an object, and when a classic trailer has `/XRefStm` (hybrid).
**ISO 32000-2:** §7.5.8 cross-reference streams (`/Type /XRef`, `/W [a b c]`, `/Index`, `/Prev`; entry type 0 free, 1 = offset + generation, 2 = object stream
number + index in it), §7.5.7 object streams (`/Type /ObjStm`, `/N`, `/First`; no stream object and no generation other than 0 inside one), §7.5.8.4 hybrid
files, §7.4.4.4 predictors (PNG predictors 10-15 are the usual filter of an xref stream: `/DecodeParms << /Predictor 12 /Columns n >>`).
### 22.1 Read
- `load` becomes async (one more await for its callers): it follows `startxref` through classic tables AND xref streams (any mix, `/Prev`, `/XRefStm`), newest
  entry wins as today. Flate with PNG predictors 10-15 (and none) is decoded for xref and object streams; any other predictor is a named refusal.
- Every object stream that a live type-2 entry names is decoded once at load; `obj(n)` stays synchronous and answers from it. An object inside an object stream
  is parsed from the decoded bytes; its raw bytes are kept (22.2).
- Still refused, by name: encrypted files; an object stream that extends another (`/Extends`, rare) if it cannot be followed.
### 22.2 Write: the file keeps its own structure (decided here)
**Every object that need not change keeps its bytes, object streams included.** The output is: the original bytes of every live type-1 object, in place order
(as today); the object streams UNTOUCHED; each replaced or new object as an ordinary object (`n g obj ... endobj`), also when its old copy lives inside an
object stream (that copy is then dead data inside the untouched stream - never page content, which cannot be in an object stream); then ONE new cross-reference:
a classic table when the file has no type-2 entry left to describe, else ONE xref stream (`/W [1 4 2]`, no predictor, Flate) holding types 0, 1 and 2, with the
trailer keys (`/Root /Info /ID /Size`, never `/Prev`, `/XRefStm`). Not done: unpacking object streams into ordinary objects (the file would grow and every packed
object would lose its place); writing new object streams.
`lockOf`, `pageOf`, `plan`, the font and content code do not change: they sit above `PdfFile`.
### 22.3 Witness - W-PDF-WRITE case W15 (node), fixtures MADE IN THE WITNESS by code that is not the engine
No tool here writes such files (no qpdf, mutool, pikepdf): the witness holds its own small converter (its own xref / object reading, node zlib): a corpus PDF ->
the same objects with the non-stream ones packed in object streams and an xref stream with Predictor 12. If this machine's ghostscript writes xref streams at
`-dCompatibilityLevel=1.7`, that file is a second, independent fixture (else that is stated, not skipped silently).
- `fixture-valid` poppler (`pdfinfo`, `pdftotext`), pdf.js and ghostscript open each converted file and read the same text as the original. An invalid fixture judges nothing.
- `reads` `listRuns` on the converted file equals `listRuns` on the original (same runs, boxes, locks) for every corpus file.
- `sweep` the W13 sweep on the converted corpus: every number cell round-trips in both readers or is refused by name with the bytes unchanged, 0 wrong, and
  the SAME count of round-trips as on the classic corpus (the unlock must not be a weaker engine).
- `structure` after an edit: every object stream byte-identical; every untouched type-1 object byte-identical; exactly one cross-reference, a stream; poppler,
  pdf.js and ghostscript open the result without a message; `/Length` and every offset exact (the witness's own reader).
- `hybrid` a classic table with `/XRefStm`: read and written.
- `history` `embedFile` on a converted file: the history is inside, read back by pdf.js, replaced in place on a second save.
- `refused` a predictor this cut does not know, an encrypted xref-stream file: named, bytes unchanged.
Mutants (each turns W15 FAIL): the predictor not undone; type-2 entries read as type 1; an object stream rewritten; the new xref stream's offsets not updated.
W-EDIT-SHEET gains one browser check: a converted trial balance opens with `§EDSHEET-LAYER ... file=writable`, an edit applies, undo is byte-identical.
Cost: `§PDF_WRITE` gains `xref=table|stream objStreams=n decodedKB=` (PERF BUDGET: decoded object streams are held once, released with the file).
**The measure that matters, taken by the coordinator after the merge:** writable PDFs among the owner's 24 (by number only, §17 privacy), against 9 today.

## 23. Owner direction 2026-11-28: how a PDF feeds the ERP, and what the page may become (ideas recorded, NOT specced, nothing built)
Verbatim: *"That if it is fast, is novel enough. Been light, easy, air-gap ops."* · *"Editable where text is."* · *"Offline File it can be so - when we provide user
option to install it somehow."* · *"Can we drag any images in it around? Readjust margins, column borders etc. I reckon if it gets heavy then some sort of lazy
load or an 'advanced' button for designer overlay can come on and shed of when off. Playing with ideas."* · on the ERP: *"it can only do so as an unposted source
doc ie as Create or Update them. It follows same rules as if user is doing so in Kernel ERP proper. It can appear in the unprocessed items under the Activity
panel of the opening screen. And even as a Request on Calendar so user login in formally is made aware and can be tracked to avoid confusion. This way, is a
convenient way user begins with a given PDF from customer/supplier and semi-OCR in a way without more steps. Such convenience killers is what attracts me."*
What follows from it (the coordinator's reading, to be confirmed one detail at a time before any spec):
- **Selling point = measured speed, lightness, ease, network off** - not novelty. The film carries it as numbers (§P of FILM_KILLER_FRONT_DOOR).
- **The page's rule:** an edit changes a number already in the file (a text, a place, a size), never re-lays the page. Inside the rule: move / resize a picture;
  shift a page's content or its box; move a table column with its lines. Outside it: re-wrapping text to a margin or a column width. A "Design" button loads
  that overlay on demand and drops it when off. Order after §22: picture, page, column.
- **Into the ERP = an UNPOSTED source document, created or updated by the same generic rules as a user in the window** (AD-layer law: no door-only logic), seen
  under Activity (unprocessed items) and as a Request (R_Request is core) on the calendar. **This differs from File it today, which COMPLETES the invoice through
  Import Invoice** - the one question to settle first (below). "Semi-OCR" = P1 "Mark my invoice": mark the fields once per supplier layout, the next PDF from
  that supplier fills itself.
- **Install for offline File it** = P4 (a service worker + install prompt over the books engine).

## 24. File it stops at an UNPOSTED document; the ERP tells its user (owner 2026-11-28: "Yes agree"; spec before code)
**Rule (owner, §23):** what comes through the door is an unposted source document, created or updated by the same rules as a user in the ERP window; a
logged-in user is made aware of it and can track it. A document that arrives from a file gets a human look before it reaches the ledger.
**Today:** `erp/sheet_door.js:170` runs Import Invoice (AD_Process 207) with `DocAction: tpl.docAction || 'CO'` - the door's OWN override: the invoice is
completed and posted in one press. iDempiere's own default for that parameter is `PR` (Prepare; `ImportInvoice.js:40,62`, AD_Process_Para default): the twin
of what a user gets when running Import Invoice from the menu.
### 24.1 Part A - the door stops overriding (small)
The door passes NO DocAction of its own: the process takes its dictionary default (PR): the invoice is prepared (In Progress), not completed, not posted.
A template may no longer ask for `CO` (a `docAction` in `_door_tags` other than empty / `PR` is refused in words: "this page files a document for review; complete
it in the ERP"). The page's words change from "Filed ... (Completed)" to the document's real status, and "Open in the ERP" lands on the invoice where the user
presses Complete. The signed ledger line in the workbook, replay and "never filed twice" are unchanged in kind (they record what was done: a prepared invoice).
Completing in the ERP afterwards is the ERP's own action, by its own rules - not the door's.
### 24.2 Part B - the user is made aware (needs a READ of the ERP first; no design is fixed here)
To be answered from the code and from real iDempiere (the oracle: `~/idempiere-dev-setup/idempiere/`, the `idempiere` postgres DB) BEFORE any build:
(1) what legacy shows under the home screen's Activities for an In-Progress invoice (PA_DocumentStatus "unprocessed documents"?), and whether our ERP's home
shows the same from the same dictionary rows - if it already does, Part B(1) is a witness, not code; (2) how a Request tied to a record is created by a user
(R_Request with AD_Table_ID / Record_ID, RequestType, SalesRep, DateNextAction) and how it reaches the Calendar; whether one generic kernel call can create it
exactly as the window would (AD-layer law: no door-only logic, no `if table===`). The door then asks for that Request through the generic path; nothing is
invented. Each answer cites file:line (legacy and ours).
### 24.3 Witness
W-FILE-IT / W-SHEET-DOOR / W-DOOR-ERP re-stated: after File it the invoice's DocStatus is the one legacy gives for PR, `posted` is not set, no Fact_Acct row
exists for it; Open in the ERP shows it; pressing Complete there (the window's own button) completes and posts it, the same entries as before this change;
a `CO` template is refused in words; replay and file-twice are unchanged. Part B: the home screen's unprocessed count rises by one after File it and falls
after Complete; the Request exists, points at the invoice, and is on the calendar - each read from the page a user sees, not from a table alone. Mutant: the
door passes `CO` again -> FAIL. The parallel run (`scripts/bridge/run_all.sh`) stays green: this REMOVES a divergence (the door's own DocAction), it adds none.

## 25. Owner direction 2026-11-28 (later): the file knows its ERP state - 'ERP drafted', 'ERP posted' (idea recorded, NOT specced, nothing built)
Verbatim: *"We can even pass the history to Request-Update/History model and mark as 'ERP drafted' on the PDF/Excel side, so that users do not overwrite event
consequence other than formatting. THus we have to segregate and isolate 'event' info to be locked when in ERP. And unlock will synch back a draft. A processed
document cannot be edited and marked as 'posted to ERP'"* · then, on the name: *"or 'ERP posted' to be consistent"* -> the two marks are **ERP drafted** and **ERP posted**.
The coordinator's reading (put to the owner, not yet confirmed):
| State on the file | Event fields (partner, date, lines, amounts) | Formatting | Ends by |
|---|---|---|---|
| free | editable | editable | File it -> ERP drafted |
| **ERP drafted** | locked | editable | Unlock -> the edits go back as an UPDATE of the same draft |
| **ERP posted** | locked for good | editable | never |
Already there: the event / formatting split is the template (`_door_tags` names the event cells); the mark can ride on the signed ledger line; a processed
document refuses changes by the ERP's own rules; the Request has its own update log (one summary entry per sync, not one per cell). Limits to state plainly:
a file is a copy - "locked" means locked in our pages, a change made elsewhere is DETECTED (the history's binding check), not prevented; an offline file learns
"ERP posted" only when it next meets the ERP. Proposed first rule: the ERP is the authority when file and ERP disagree.
**✅ Answered by the owner (2026-11-28, verbatim): *"it can be unlocked if its link to ERP is marked inactive or void as rules permit"*.** So the unlock is
governed from the ERP side, by the ERP's own rules: when the linked document is voided or made inactive (where its status and the rules allow it), the file's
event fields are free again and it can be filed anew. Nobody unlocks from the file alone. This replaces the coordinator's recommendation ("anyone holding the
file") and narrows the table above: from **ERP drafted** the way out is the ERP voiding / inactivating the link, not an Unlock button on the page; whether an
edit of a still-linked draft may go back as an UPDATE (the owner's earlier "unlock will synch back a draft") is the next detail to confirm. A file that is
offline learns of the void, as of "ERP posted", when it next meets the ERP.
**Owner, a moment later (2026-11-28, verbatim): *"it can be from paper side, if notified 'Unlock will mark document as void'"*.** So there IS an Unlock on the
file side, and it is the same act: pressing it tells the user, in those words, that the linked ERP document will be marked void, and on a yes asks the ERP to
void it by the ERP's own rules; when the ERP has done so the event fields are free. The two readings join: the unlock always goes THROUGH the ERP's void (or
inactive) - it may be started from the ERP window or from the file. Still to confirm, one at a time: (1) with the network off, does Unlock wait until the file
meets the ERP, or free the file at once and carry a pending void? (2) is Unlock offered only on **ERP drafted** (the owner: a processed document "cannot be
edited")? (3) may an edit of a still-linked draft go back as an UPDATE without a void?

## 26. RESULTS 2026-11-28 (late): §22 PDF 1.5+, two defects only REAL files showed, §24 Part A, FILM v2 rc1
### 26.1 §22 cross-reference streams - bim-ootb #3518 `8924c4d8` (Sonnet builder; **merged by the repo's auto-merge bot before the coordinator's hold**)
Coordinator's re-run: `§PDFWR-VERDICT PASS judged=88 failed=0`, `§PDFWR-MUTANTS killed=14/14` (W15: 10 checks, M11-M14). Builder's logs: W15 on the old engine
`verdict=FAIL judged=10 failed=9`; W-EDIT-SHEET 59 judged, 13/13 mutants (H10: a converted file opens `file=writable`, edit, undo byte-identical). Ghostscript
10.02.1 here writes a classic table at 1.7: **every fixture came from the witness's own converter - no independent writer.** That gap is what 26.2 is about.
### 26.2 The measure on REAL files (counts only; no name, path or content printed) - and what it found
128 PDFs under the home folder, each read by the engine before #3518 and after: **32 had a cross-reference stream; 18 are now writable (67 -> 85 of 128), 12 are
turned pages, 2 encrypted.** Other locks in the 128: 13 with no writable text, 7 turned (classic), 1 filter, 7 not PDFs. **Turned pages (19 of 128) are now the
largest single lock.** A second set (139 PDFs from program folders): 31 with a stream -> 17 writable, 12 turned, 1 no text, 1 refused (below).
Each newly writable file then had ONE word shortened by a letter and was read by poppler and ghostscript. **Two defects, neither visible to any made fixture:**
- **A real hybrid file was written WITHOUT its header and without 13,844 packed objects** (`§REAL-WRONG ... popplerErr="May not be a PDF file" gs="Error ... in obj"`).
  Its shape: ONE table listing all 18,712 objects, 15,988 of them FREE (generation 65535, a free list), and an `/XRefStm` that is a FULL index (type 2 for the
  packed ones, plus 273 rows "type 1 at offset 0"). The engine let the table's free entry win, and took offset 0 for an object boundary. The builder's hybrid
  fixture had the packed objects ABSENT from the table - a shape poppler accepts but real writers do not use.
- **Word gaps drawn as spacing closed up** (pre-existing, any file): a justified run `[(Hello) -300 (big) ...] TJ` with no space glyph read as ONE word, and a
  rewrite wrote one string - the words ran together (poppler text 4 and 2 letters shorter for a 1-letter edit).
**A flaw in the coordinator's own first measure, stated:** the "old engine" was read from `origin/main` AFTER the bot had merged #3518, so new was compared with
new and showed "no change"; the first sample of 40 files held no stream file at all. Redone against `8924c4d8^`. A comparison must pin the commit of its baseline.
### 26.3 The fixes - bim-ootb #3521 `fix/pdf-real-files`, #3523 `fix/pdf-word-gaps`
- §22.4 (#3521): in a hybrid section a table entry marked FREE yields to the stream's live entry; a type-1 row at offset 0 is no object and no boundary; `sound()`
  - the last word before a file is handed back - refuses a file that does not begin byte for byte as the input does. W15 `zero-offset-rows`,
  `hybrid-free-in-table`; mutants M15, M16; `§PDFWR-VERDICT PASS judged=90`, 16/16. The real hybrid is now REFUSED by name ("object stream 2652 is missing"),
  not written wrong - why its object stream is not found is not understood (open).
- §22.5 (#3523): a move right of at least half the font's space (150/1000 em when it has none - a bound chosen here) between two glyphs reads as a space; a
  space typed into such a run is written as the run's own gap (median). W14 `word-gaps-kept` (`[<48656c6c6f> -300 <6e6577> -300 <776f726c64> 520] TJ`, poppler
  "Hello new world"), mutant M17; `judged=92`, 17/17; W-EDIT-SHEET 59, pages 22 / 19, history 56, reader 37.
- Real files after both: second set `edited=12 popplerOpensSamePages=12 popplerTextOneLetterShorter=12 ghostscriptNoNewMessage=12 wrong=0`; home set 12 / 12 / 11 / 12,
  the one flag being the check's own artifact (the removed letter's place reads as a space: same length).
- **Not done:** the `hybrid-free-in-table` fixture's INPUT is refused by poppler and ghostscript (the real free list was not reproduced), so only the engine's
  output is judged there; no witness in git holds a real hybrid; the pre-existing U6 failure on two real multi-page files ("page 3 on screen, Read as sheet
  read page 2") seen in `witness_pdf_mobile.js` with a list, on old and new alike, is NOT investigated.
### 26.4 §24 Part A, File it stops at an unposted document - bim-ootb #3520 `9280770f` (Sonnet builder), live
Coordinator's re-run: `§SDOOR-VERDICT PASS judged=44`, `§SDOOR-MUTANTS killed=14/14`; `§FILEIT-VERDICT PASS judged=57`; `§DOORERP-VERDICT PASS judged=51`
(`§DOORERP-ORACLE direct(default DocAction) ... status={"docstatus":"IP","posted":"N"} ... oldOnePress(CO) factRows=6 sameFingerprint=true`). The door sends no
DocAction: Import Invoice takes its dictionary default PR (legacy `ImportInvoice.java:53`, `MInvoice.java:1811-1814` -> In Progress), nothing is posted, the
window's own Complete posts the same 6 entries as the old one-press flow. A `CO` template is refused: "this page files a document for review; complete it in the ERP".
Known after it: a workbook saved from the OLD sample carries `docAction:"CO"` and is now refused; right after Complete the row still says "Not Posted" until
Refresh (the window's behaviour, twin L&F not checked); `door_handover.js:72` still says "is now in these books"; the bridge `run_all.sh` was not run (only the
bump's scoped gate).
### 26.5 §24 Part B - investigated, NOT built. What the read found (file:line in the builder's report, scratchpad `door/`)
- **Activities already works from the dictionary:** legacy `PA_DocumentStatus` 200005 "Unprocessed Documents" (`RV_Unprocessed`, DocStatus not CO/CL/VO/RE,
  `CreatedBy=@#AD_User_ID@`); ours shows the same from the same rows (`erp/overlay/dashboard_docstatus.js`, `home.js:149`). **Blocker: the door files as user 100
  (SuperUser) and the ERP login is GardenAdmin 101, so the count stays 0** (probe: filed by 101 -> 0 before, 1 after).
- **A Request tied to the record can be made by ONE generic call** (`ML.save` on `r_request`, as `request_email.js:250-262` does; the model rules are ported).
  **Not ported: the Calendar gadget (`DPCalendar`, `§DASH-UNPORTED id=50004`) and the window's "Requests" toolbar button.**
- **⛔ Decisions for the owner before a spec:** (1) which user the door acts as - the page asks, or the demo identity becomes GardenAdmin; (2) which request type
  (GardenWorld has Request for Quotation, Service Request, Warranty; a "Document review" type is a dictionary patch); (3) DateNextAction today or empty; (4) does
  the Request close when the invoice is completed (legacy does nothing); (5) is porting the Calendar in this lane.
### 26.6 FILM v2 "ONE PAGE" rc1 - bim-compiler #1402; file `~/Videos/PDF_and_Excel_are_killer_apps_ONE_PAGE_EN_rc1.mp4` (2:36, never pushed)
All build checks PASS (facts 55, voice guard 38, card guard 370, K2, keys 367/367, Z 22 steps, links, film check 17 beats); result section in
`FILM_KILLER_FRONT_DOOR.md`. Cover "ONE PAGE / Editable where text is." (owner confirms). Light / fast / easy / network off as measured facts (257,309 bytes;
an edit in 6 ms; `§FILM_OFFLINE reloadOk=true openOk=true editOk=true`, PDF page only). **To re-shoot: beat 7 (it shows the one-press filing, gone since #3520).**
The phone time is load-sensitive (median 1,896 ms of five; 1,554 ms in an earlier run). The live site changed DURING the shoot (#3518 deployed 07:27 UTC, the
last live stage ended 07:29): the phone beat does not edit, so no fact is affected, but the build's `LIVE_EQ_MAIN` was taken at its start only.

## 27. Owner direction 2026-11-28 (after watching FILM v2 rc1): no scaffolding - the user sees the PDF sheet or the iDempiere model (ideas, NOT specced)
Verbatim, in order: *"Also the ERP side, reflect how to make it more seamless or transparent its shape, ie at 1.44, such UI may demand some learning curve, so that
user is dealing it as i did for Ninja Excel, without needing to see any scaffolding. It only sees PDF sheet or iDempiere model. May need to brainstorm a bit"* ·
(to the coordinator's "two doors" idea) *"Are we importing a PDF or Excel into iDempiere? I don't see the question of door to ERP which is to remain as legacy twin.
PDF is to be only door inside. Or i missing something?"* · *"If we are to drop a qualified PDF/Excel sheet in ie sanitized to be our ERP doc model, then it can be so
too but right away converted to our UI shape."*
At 1:44 the film shows the **File it page**: a third page with steps, "Books engine ready: 45 program files and 29.0 MB", a Result panel, a signed ledger line -
the machinery, shown. The coordinator's reading (put to the owner, to be confirmed one detail at a time):
- **Two places only: the document (the PDF page, with its sheet view) and the ERP window. Filing is an action, not a place.** The File it page retires; its
  engine talk, result panel and ledger text are not shown (the ledger line and history stay inside the file, seen under History on request).
- **The PDF page is the door.** Any file - a supplier's PDF, a workbook - is read, checked and made to fit our ERP document model THERE (the one teaching step:
  point once at the number, date, partner, lines of a new layout). "Send to ERP" hands the event data to the ERP's own import; a draft appears (§24).
- **The ERP stays the legacy twin.** It gains no viewer and no foreign screen. A file may be dropped on the ERP ONLY when it is already QUALIFIED - sanitized to
  our document model - and then it is converted at once to our own UI shape: the standard window with the draft record, nothing else on screen.
- **To settle first: what "qualified" means.** Proposed: the file carries our marks (which field is which), every required field is present, its totals add up,
  and its history verifies - all judged by the PDF page's own checks, so a file can only become qualified by passing through that page (or by being printed
  by our ERP in the first place).
Also from the owner on rc1: *"from 0:37 sec onwards the sheet seems blank"* (confirmed: two stills taken before the page redrew; the live page measured never
blank) and *"The first sec doesn't show how it arrived or load the PDF excel"* - both in the rc2 brief, with a new INK check on every PDF-page still.

## 28. The sheet is never shown blank after an edit, undo or redo (found by the owner in FILM v2 rc1; spec + result 2026-11-28)
The film's cause, found by its builder: after an edit or undo `swapTo` removed the page's canvas and drew again; a still taken in that gap showed a white sheet
(0:37-0:47 of rc1; the coordinator's frame scan: 21 of 313 samples). Measured on the live page frame by frame: **60-78 ms of white after each edit and undo.**
Fix (bim-ootb #3527): the old canvas is marked stale and STAYS until the changed page is fully drawn off screen, then it is swapped. W-EDIT-SHEET H11 watches
every frame through an edit, an undo and a redo: `§EDSHEET-BLANK frames=186 edit: notShownMs=0 undo: 0 redo: 0`; mutant `blank-flash`: 6 frames, FAIL. 62 judged.
FILM v2 **rc2** (bim-compiler #1407; `~/Videos/..._ONE_PAGE_EN_rc2.mp4`, 2:51): new INK check on every PDF-page still (`§INK_VERDICT PASS stills=18 bad=0`; run
over rc1 it reports 7 blank), the arrival shown in beat 1 and beat 4, beat 7 on the draft flow, `LIVE_EQ_MAIN` taken at both ends. Coordinator's own scan of
rc2: 0 blank sheets but the deliberate empty browser at 0:04. **Beat 7 is to be shot again when §29 exists (owner: "Yes reshoot that").**

## 29. SAVE on the PDF page, DRAG INTO iDempiere: the File it page retires (owner 2026-11-28; spec before code - READ-FIRST investigation, then build)
Owner, verbatim, in order: *"Otherwise it opens the / pdf URL for it to handle to get it sanitized"* · *"or it can remain separate ie save instead of file it. Then
in iDempiere just drag the file into it. Give your take. This way it is more hassle free in learning curve as it gets intuitive"* · *"Yes reshoot that. It allows
the PDF handler to spin off as a killer on its own with the ERP drop in as another killer method. While in PDF handling it already has ERP sanitizing handling
behind it"*. With §27: two products that meet through a FILE - the PDF handler (alone, light, network off) and the ERP drop-in.
### 29.1 The shape (decided by the owner; the coordinator's additions marked †)
- **The PDF page never talks to the ERP.** It reads, checks, marks, edits and SAVES. What it saves is a QUALIFIED file: sanitized to our ERP document model.
- **The ERP has one gesture: a file dragged onto it.** Qualified -> a DRAFT in the standard window, at once, by the same rules as a user entering it (§24: the
  import's own default, nothing posted; AD-layer law: generic, the template names the table and columns, no `if table===`). Not qualified -> the ERP opens
  `/pdf` with that file, to be sanitized there; save; drag again.
- **File it and "Send to ERP" do not exist.** `erp/sheet_addin/file_it.*`, `/file-it`, the Result panel, the engine talk and the hand-over between tabs are
  deleted (deletion budget) once the drop covers their witnesses.
- † **The dropped file is attached to the draft record** (iDempiere's own Attachment) as its evidence. With it the ERP answers §25 at the drop: the same file
  again -> "already drafted as <DocumentNo>", never twice; an edited copy of a still-unprocessed draft -> offered as an UPDATE of that draft; a completed
  document -> refused. The ERP is the authority; the file needs no lock of its own.
- † **Qualified** = the file carries our marks (which field is which), every required field is present, its totals add up, its history verifies - the PDF
  page's own checks, run again by the ERP on the drop (never trusted from the file's say-so).
- The drop is an add-on OVER the ERP (an overlay, like the report pill); the windows stay the legacy twin and gain no viewer.
### 29.2 To be READ and answered with file:line before any build (legacy source and ours)
(1) What does a PDF hold today that could carry the marks? (the workbook has `_door_tags`; a PDF has the embedded-file slot used for its history, §PDF_EDITOR 4.5)
- propose the ONE format for both. (2) Where can an overlay receive a file drop over `erp/idempiere.html` without host code (how `report_pill.js` and the
other overlays mount), and how does it know the window / table in front? (3) How does legacy attach a file to a record (AD_Attachment, MAttachment, the
toolbar's Attachment dialog incl. its drag-and-drop) and is that ported here (model, storage in the SQLite books, the toolbar button)? (4) Can `sheet_door.js`
run unchanged on values read from a qualified PDF (it takes values of tagged cells, never a file format)? (5) What of `witness_file_it.js` /
`witness_door_erp*.js` / `witness_sheet_door.js` carries over to the drop, and what dies with the page. (6) "Mark my invoice" on the PDF page (P1): the
smallest marking UI that makes ONE supplier layout qualified - click a text, pick the field from the window's own field list. Each answer ends with a
proposed slice order; nothing is built until the coordinator has put the open choices to the owner.
### 29.3 Witness (shape; details with the build spec)
Seen from the user's side only: a qualified sample saved by the PDF page, dropped on the ERP -> the standard window holds ONE new draft with those values, the
file attached, nothing posted; the same file dropped again -> no second draft; an unqualified file dropped -> the PDF page opens with it; an edited copy of the
draft's file -> update offered; after Complete -> refused. Sweep: every window a template exists for, not one hand-picked route. Mutants for each.

### 29.4 What the read found (2026-11-28; the investigator's report with file:line is in the session scratchpad `drop/`; a real headless probe on `erp/idempiere.html`)
- **The whole path already works inside the ERP page, with no host code** (probe): `window.__crud.withModelTrx` -> `SheetDoor.file(...)` UNCHANGED -> FILED,
  In Progress, one group of 11 ops -> `__crud.applyOpGroup` `committed=true verifyChain=ok`; `docstatus=IP posted=N`, 0 Fact_Acct rows, 2 lines. The same path
  as the page's own Import menu entry (`idempiere.html:5310-5320`).
- **Attachment IS ported** (`erp/ad_attachment.js`, W-ATTACH; toolbar button wired; seam `window.__idmpAttach`; 16 MB in the books, the OPFS store beyond):
  an overlay attaches with zero host code (probe: saved, read back). Not ported: the dialog's own drag-and-drop (legacy `WAttachment.java:264-266`) - a twin gap.
- **Overlays mount from one list** (`erp/overlay/boot.js:37-48`); nothing in the host handles `dragover` / `drop`; the six existing drop zones are element-local
  and call `preventDefault`, so a window-level listener guarded by `!e.defaultPrevented` cannot break them.
- **The session's user files the draft** (`createdby=101`), so Activities' "Unprocessed Documents" will count it: §26.5 decision (1) is gone.
- **To handle:** org `*` at login -> legacy's own `ERR=Invalid Org` (HQ files); a duplicate DocumentNo is refused by legacy's unique index with an EMPTY reason
  (the words are only in `§IMPORT_INVOICE_COLLISION`); with no printed DocumentNo the same lines file twice - the file needs an identity (the first hash of its
  history chain, kept on the attachment); the engine is invoice-only today (`sheet_door.js:24,112,181,186`), so "every window a template exists for" is ONE
  window until it is generalised (legacy's generic form: `AD_ImpFormat` / `AD_ImpFormat_Row`).
- **For a PDF:** marks need page BOXES, not cell addresses (addresses shift with the line count); the mark carries the date format and the decimal style
  (legacy `ImpFormatRow`); Import Invoice matches a partner by Value, a PDF prints a name; the grand total with tax can only be judged by the books (at the
  drop); a saved PDF has no history unless one is forced at Save; "open /pdf with the file" needs same-origin storage and a popup from a drop may be blocked
  (not testable headless).
### 29.5 BUILD SPEC, slice 1 + 2 (spec before code): a tagged workbook dropped on the ERP becomes a draft with the file attached
**Slice 1 - `erp/overlay/door_drop.js`** (one overlay, one line in `boot.js`'s list, its `modules.json` entry; NO host code):
- A `window` listener for `dragover` / `drop` in the bubble phase, acting only when the event is not already handled and carries files; it stays out while
  the Attachment dialog is open. Everything it needs is loaded on the first drop, nothing before (a page with no drop loads none of it).
- For each dropped `.xlsx` that carries `_door_tags`: read the tagged cells (the existing `xlsx_host` / `host_shim` readers), run `SheetDoor.file` inside
  `__crud.withModelTrx`, commit with `__crud.applyOpGroup`, attach the file's bytes to the new record through `__idmpAttach`, then show the record in its
  standard window (`IdmpHost.zoom`). One line of plain words tells the result ("Drafted: AR Invoice <DocumentNo>, In Progress. Open it and press Complete.").
- Refusals, each in plain words and with NOTHING committed (no ops, no attachment): not logged in ("Log in first, then drop the file"); organisation `*`
  ("Choose an organisation at login: a document cannot be filed under *" - the twin's own rule, said in words); the engine's own refusals (does not add up,
  unknown partner / product, a `CO` template); a duplicate DocumentNo (the words taken from the collision line); a file with no marks ("This file is not
  marked for the ERP yet" - the hand-off to `/pdf` is slice 6). Several files = each judged on its own.
- No per-window code: the table, the window to show and the key come from the template and the dictionary.
**Slice 2 - engine hygiene** (`erp/sheet_door.js`): the pure checks become one callable `check(tpl, cells)` (moved, not rewritten) so the PDF page and the ERP
judge by the same code; a duplicate's reason is no longer empty. W-SHEET-DOOR D1-D12 unchanged.
**Witness W-DOOR-DROP** (headless, the REAL `erp/idempiere.html`, a synthetic `DragEvent` carrying a File; legacy facts cited where a rule is legacy's):
D1 one draft: after the drop the books hold ONE new invoice, In Progress, not posted, 0 Fact_Acct rows, its lines and totals equal the node oracle's
fingerprint; D2 the window: the standard Invoice window is in front on that record (grid row + record id read from the page, not a table alone), its line tab
shows the lines WITHOUT Save, the window's own Complete completes and posts the same entries as §24's oracle; D3 the file is attached (the Attachment dialog's
own list names it; bytes read back equal the dropped bytes); D4 refusals: each of the cases above -> its words on screen, 0 ops, 0 attachment, books
unchanged; D5 nothing loaded before a drop (requests recorded), and what a first drop costs (bytes, ms, heap in a `§` line); D6 the six existing drop zones
still work with the overlay listening (each exercised); D7 reload: the draft and its attachment are still there; D8 Activities: "Unprocessed Documents" on
the home screen rises by one after the drop and falls after Complete (read from the page). A claim with nothing judged says INCONCLUSIVE. Mutants: the drop
does nothing; a second draft per drop; the draft completed by the drop; the attachment skipped; a refusal that commits.
**Not in this slice:** PDFs (slices 3-4), same-file-again / update / completed-refused (5), the `/pdf` hand-off (6), deleting the File it page (7), the
Attachment dialog's own drag-and-drop, the Request.
**Owner, 2026-11-28 (to "does the Excel / WPS menu's File it action go too?" - coordinator: remove it): *"Yes if you agree"*.** So at the deletion slice the menus
keep HISTORY only; the one way into the ERP is a file dragged onto it. Deleted with the File it page: the menus' File it action, `runner.js`, `ws_kernel_web.js`,
the `taskpane` filing parts and `host_shim.js`'s fileIt / ledger parts (about 400 lines, on top of the ~1,500 of §29.4's list), and W-SHEET-DOOR D9 (the signed
ledger line in the workbook) unless the drop keeps a ledger of its own. `sample_invoice.js` stays (it builds the tagged sample).

### 29.6 Owner direction 2026-11-28: the file is sanitized twice; missing master data is created at the drop, after an OK (recorded; slice NOT yet specced in full)
Verbatim: *"But in such separation, it still gets 'sanitized' by our ERP?"* · *"It can also create those data on the fly during drop, ie new BPartner, Product
(Std Category)"* · *"perhaps a dialog box to OK that"*.
- **Sanitized twice, by the same rules.** On the PDF page before Save, with a small extract the page carries (the window's own field list, ~1 KB from the
  dictionary, and the engine's `check()`): required fields marked and present, lines = subtotal, the history verifies. In the ERP at the drop, again and never
  on the file's say-so, plus what only the books can judge (partner / product exist, grand total with tax, the document number, the organisation). The extract
  is GENERATED from the dictionary and a witness fails when the two drift.
- **Master data on the fly = legacy's own rules, nothing invented.** A partner that does not exist: legacy's Import Invoice creates it with its location and
  contact (`ImportInvoice.java:512-626`); our port names that branch as NOT ported (`erp/processes/ImportInvoice.js` header (1)-(3)), which is why the drop says
  "No BPartner" today. Porting it closes a twin gap. A product that does not exist: legacy's Import Invoice refuses it (`:462` "Invalid Product"); legacy's way
  is its Import Product process (ported: `erp/processes/ImportProduct.js`; the default product category and unit when none is given, `ImportProduct.java:215-226,
  307-315`) - run at the drop BEFORE Import Invoice for the unknown items.
- **A dialog first (owner).** The drop pauses before anything is written: "This document needs 1 new Business Partner (<name>) and 2 new Products (...).
  Create them and draft the invoice?" OK -> created by the two imports, then the draft; Cancel -> NOTHING written (no partner, no product, no draft, no
  attachment). Nothing new needed -> no dialog. The dialog is the overlay's, the windows stay the twin.
- Coordinator's additions, to confirm: the result line names what was created; next after it, the dialog offers "use existing: <closest name>" beside
  "create new" (a PDF's spelling becomes master data: "Acme Sdn Bhd" / "ACME Sdn. Bhd." would be two partners); a supplier layout's mark may pin the partner.
- Slice order with this: 1+2 the tagged workbook (built, §29.7 when merged); **2b master data at the drop with its dialog**; 3 PDF marks; 4 the ERP reads a
  dropped PDF; 5 same file again / update / completed; 6 unqualified -> `/pdf`; 7 deletion (File it page, the hand-over, the menus' File it action).
