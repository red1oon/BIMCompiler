# ⚠ DO NOT REMOVE — SHEET FRONT DOOR: the user's own spreadsheet is the way in to the ERP
# Scope: a menu added to Excel / WPS / LibreOffice / Google Sheets ("Prepare Invoice", "File it", "Run report", "Read supplier bill")
# that files REAL iDempiere documents from the user's own sheet layout. Spec first, witness first, EXTRACT ONLY.
# READ THE LOG after every run (§SHEET_DOOR / §SDOOR-* lines); the exit code is not evidence.
# Code: bim-ootb `erp/sheet_door.js` + `erp/tests/witness_sheet_door.js`. This file: findings, decisions, results (dated sections).

## ▶▶ RESUME HERE — call sign **'resume killer'** (state as of 2026-11-28; go to **▶ OPEN LIST** below after reading this block)
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
- **History travels inside the file 2026-11-27** (owner: *"wouldn't history be cheap and has to be in the file anyway?"*; bim-ootb #3481,
  #3482): the downloaded PDF carries it as an attachment, the `.xlsx` in `_door_history`; reopening verifies it, binds it to the printed
  numbers and continues the chain — `PDF_EDITOR.md` §4.5/§4.6. Not noticed: a REMOVED history (needs signing).
- **S3b "File it" in a browser DONE (witness) 2026-11-27** (bim-ootb #3483, §9): ONE kernel for node and browser; plain page
  `erp/sheet_addin/file_it.html`; the pane's File it wired.
- **S3c the filed document in the REAL ERP window DONE (witness) 2026-11-27** (bim-ootb #3484, §10; owner: *"show the document in the real
  ERP window too"*): "Open in the ERP" → the Invoice window, lines and posting; applied once per entry hash; no per-window code.
- **S4 WPS 2026-11-27** (bim-ootb #3486, §11): the menu for WPS on the same shim, proven on a stand-in. **Real WPS on this machine**
  (snap 10.1.0.6757, §13, #3487): its WRITER keeps hidden sheets, chunks, formula results and files the same invoice; its MENU cannot run
  (no add-in fetched in a 50 s probe). Mobile: no add-in path found for phones → phones use our URLs with the user's file (§11.4).
- **A check that cannot run says so 2026-11-27** (bim-ootb #3488, §12): a total holding a formula with no saved result is REFUSED and
  named; every verdict lists which checks ran; stored history/ledger lines are ASCII-escaped.
- **Sheet panel closable** (bim-ootb #3485, owner request).
- **The history page 2026-11-28** (bim-ootb #3489, §14): `erp/sheet_addin/history.html` gives ANY spreadsheet file a memory with no add-in:
  Stamp, a cell's story, rewind + download that version, merge two copies with the clash shown. 95 KB on the wire, no kernel.
- **Posting view = legacy's Account Viewer 2026-11-28** (owner: *"fix the posting view to show all 6 entries"*; bim-ootb #3490;
  record in `prompts/ERP_IDEMPIERE_UX_PARITY.md` §ACCT-VIEWER): legacy opens on the first schema with a selector + Refresh, so the page
  does too: 3 entries as it opens, the other 3 after picking the second schema (6 of 6 reachable); a missing tenant filter fixed.
- **Films** (`prompts/FILM_KILLER_FRONT_DOOR.md`; files in `~/Videos/`, never pushed): Film 1 `..._PART1_EN_rc2.mp4` (owner: *"Film 1 is
  good"*), Film 2 `..._PART2_EN_rc1.mp4` (owner 2026-11-28: *"Film 2 poated"*), Film 3 `..._PART3_EN_rc1.mp4` (the memory; sent to the
  owner, not yet answered).

### ▶ OPEN LIST — work it top to bottom (WORK-TO-ZERO); written at the 2026-11-28 wrap-up (owner: *"wrap up, update context well so new session will 'resume killer' and resolve all above"*)
Each item names where its evidence is. Mark `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>` here as you go.

**A. Waiting on the owner (ask once, together; do not block the rest on them)**
1. Film 2 cover wording: "PART 2 · THE BOOKS" / "PDF and Excel are killer apps" / "ERP is now a utility" / "from your own file, into the books".
2. Film 3 cover wording: "PART 3 · THE MEMORY" / "PDF and Excel are killer apps" / "History is the missing killer" / "your own file, with a memory inside it".
3. Licence line on the credits cards of Films 2 and 3: "Open source: MIT licence, except 39 ERP files under GPL-2.0-only." Film 1's card
   says only "Open source, MIT licence": make it match?
4. Film 2's posting shot shows the OLD view (3 entries + a "more schemas" note). The film is already posted. Redo the shot with the
   selector (both schemas), or leave it?
5. Does Film 3 go out as it is (rc1)?

**B. Guide and films (small)**
6. `docs/PdfPageGuide.md` covers view + Read as sheet only. Add: change a number / Download PDF, the history inside the file, the
   filing page (`file_it.html`), "Open in the ERP", and the history page (`history.html`). Film 3's closing card dropped its guide link
   for this reason (film RESULT). Deploy ONLY with `scripts/safe_gh_deploy.sh`; a fresh checkout lacks `docs/glassbowl_data.db` (git-ignored,
   live on the site) and the guard aborts: restore it with `git show origin/gh-pages:glassbowl_data.db > docs/glassbowl_data.db` first.
   That trap needs a permanent answer (where that file should live) — one line to the owner if it is not obvious.
7. After 6 (and the answers to A), one rebuild per film that needs it: guide links on the closing cards; Film 1's last card still
   links the app.

**C. False passes / correctness (do these before new features)**
8. The PDF page's `.xlsx` after a real WPS re-save: totals C28 / F28 come back as float residue (4.77e-15, 2.41e-13) where 0 was written
   (§13). Judge the PDF-side checks on a WPS-saved file; compare to the cent, never to exactly 0.
9. History: the TIME of an entry is outside the hash (edited → still verifies; §14 finding 1; the ERP journal has the same shape).
   Decide with the kernel's owner section whether `at` joins the hashed fields (it changes the journal format: a twin / ONE-format
   question, so spec it first and keep one verifier).
10. The kernel's `verifyJournal` accepts a changed "value before" and does not check a merge entry's carried entries (PDF_EDITOR §4.6
    finding 3; §14 finding 2). Today only `SheetHistory.verify` catches both. One verifier should.
11. Re-merging the same other copy after more stamps re-opens clashes already settled as "mine" (§14 finding 5): needs a merge base.
12. A file re-saved by a writer that stores no formula results makes every formula cell read as "changed" on the history page (§14
    finding 4): true but noisy; say why on the page, or do not list result-only differences.
13. Excel/WPS Stamp would record the PDF page's `_door_break` cell and a second page's sheet as cleared (PDF_EDITOR §4.6 finding 5): not judged.
14. An emoji typed into a VISIBLE cell and re-saved as an inline string is misread by the vendored SheetJS (§12 "Not fixed").

**D. Real applications (nothing below has ever run in the real app)**
15. REAL EXCEL: sideload `erp/sheet_addin/manifest.xml`; first question = does the pane load and get the workbook; then File it, Stamp,
    Cell history, Check history; then what Excel's own writer does to `_door_*` sheets. No Excel on this machine: ⛔ until the owner
    names a machine, unless Excel on the web is reachable.
16. WPS: this machine's snap `wps-office 10.1.0.6757` saves our files correctly (§13) but its MENU cannot load (no add-in fetched in a
    50 s probe; `libkso.so` does contain `KJSPlugin` strings, so another install path is not excluded). Needs a WPS build that takes
    add-ins; first question = does a pane served from our https URL receive `window.Application`.
17. WPS writes the local OS user name into `docProps/core.xml` `lastModifiedBy` (§13): tell the user in the guide; never commit such files.
18. S5 LibreOffice menu on the same shim: LibreOffice Calc is NOT installed here (`soffice` has Writer/Math/Base only).
19. A real phone: `file_it.html` loads 33.7 MB / 123 MB heap (§9, §11.4); `history.html` and the PDF page are light. Device emulation only so far.
20. Viewers: the rewritten PDF and its attachment are judged in poppler and pdf.js only (no Acrobat / Preview / Chrome panel).

**E. Reader and PDF depth**
21. Reader: the page's ruling lines and cell fills as grid evidence (§7.5 "Next"): showcase 7 of 41, geometry 14 of 18, the
    204-column stress sheet 585 of 796. Multi-page tables, scans: not started.
22. Merge the report PDF engine from bim-compiler `origin/ninja-xtab2` / bim-ootb `origin/feat/ninja-template-pill` (the "new layout" OUT
    of the ▶▶ block; the user manual already describes its PDF download) and fix its Thai SARA AM defect (`จำนวน` printed as `จำานวน`, §7.5).
23. PDF write-back limits (`PDF_EDITOR.md` §4.4): a digit missing from the embedded subset (3 cells stay refused), one-byte fonts,
    cross-reference streams, form text. Then the editor's own next phase P1 organise.
24. §6.1's prior-art table records no source per row ("sources in that session's reply" are gone): re-source it before any film or
    page quotes it. No prior-art search exists yet for the PDF / spreadsheet front door itself.

**F. ERP side**
25. Account Viewer, what is still unlike legacy (`ERP_IDEMPIERE_UX_PARITY.md` §ACCT-VIEWER "Not done"): the other columns, the query
    tab's filters, sort / group, Re-Post, Export, Zoom, and "Post now?" on a record with Posted ≠ Y. Twin rule: these are open, not accepted.
26. Two different workbooks into ONE set of books are refused (§10 finding 2: both mint the same record ids from the seed).
27. Signing: who wrote an entry; a removed history; any same-origin page can write a hand-over (§10 finding 4).
28. Demo books only (GardenWorld, one fixed login): no tenant or user choice on `file_it.html` (§9).
29. `file_it.html` does not come back on an offline RELOAD (no service worker covers `erp/sheet_addin/`, §9).
30. The ERP page makes one outside request, `GET https://www.idempiere.org/short-donate/`, from a context-help row (§10 finding 8): trace it.
31. Witnesses that load `ws_kernel.js` and are red on main before and after this lane's work (9 to 11 files, §9.5 / §10.4), plus
    `poc_posted_column_live`, `poc_critic_post_live`, `poc_critic_lensswap_live`, `poc_preview_demo` and W-MANIFEST-ROUNDTRIP C9 locally:
    never investigated. Triage: which are real.
32. A fourth hand-written SHA-256 now exists (§9.5 finding 6): one shared file.

**G. Housekeeping**
33. None of this lane's witnesses is wired into CI (bim-ootb `.github/workflows/ci.yml`): W-SHEET-DOOR, -HISTORY, -ADDIN, W-FILE-IT,
    W-DOOR-ERP, W-SHEET-WPS (+page, +real), W-HISTORY-PAGE, W-ACCT-VIEWER, and `pdf/tests/*`. The node-only ones are cheap: wire them first.
34. History page: inserted rows / columns are not understood as such; the grid draws at most 200 x 40 cells; cell styles are not kept in
    any download (SheetJS community build).

**How to run things (so the next session does not rediscover them)**
- Witnesses (bim-ootb, from a `/tmp/wt-*` worktree off `origin/main`, never the shared checkout): `node pdf/tests/witness_sheet_reader.js`
  (`SREAD_MUTANTS=1`), `witness_pdfed_p0.js`, `witness_pdf_write.js`, `witness_pdf_history.js`; `node erp/tests/witness_sheet_door.js`,
  `witness_sheet_history.js`, `witness_sheet_addin.js`, `witness_sheet_wps.js`; page witnesses need
  `env -u DBUS_SESSION_BUS_ADDRESS node <file>` (headless, `--disable-gpu`): `pdf/tests/witness_pdfed_page.js`, `witness_pdf_write_page.js`,
  `witness_pdf_history_page.js`, `erp/tests/witness_file_it.js`, `witness_door_erp*.js`, `witness_history_page.js`, `witness_acct_viewer.js`,
  `witness_sheet_wps_page.js`, `witness_sheet_wps_real.js` (real WPS under Xvfb). Read the log, not the exit code.
- Live pages: `https://red1oon.github.io/bim-ootb/pdf/` · `.../erp/sheet_addin/file_it.html` · `.../erp/sheet_addin/history.html` ·
  WPS add-in base `.../erp/sheet_addin/wps/` · Excel manifest `.../erp/sheet_addin/manifest.xml` · guide `https://red1oon.github.io/BIMCompiler/PdfPageGuide/`.
- Agents were used for every slice on 2026-11-27/28 (owner: *"Use agents to speed up work"*): one bounded slice each, own worktrees,
  spec appended as its own numbered section here, results under it. Keep that shape.

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
