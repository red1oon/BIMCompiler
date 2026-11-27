# ⚠ DO NOT REMOVE — PDF EDITOR: a pure, browser-native PDF editor, clean-room, zero install
# Scope: a full PDF editor (view, organise, annotate, forms, edit text, redact, OCR, compare, export, secure, sign) that runs
# in any browser, offline, the file never leaving the device. Spec first, witness first, EXTRACT ONLY. READ THE LOG after every
# run (§PDFED-* lines); the exit code is not evidence. Code will live in bim-ootb (`pdf/` page + engine); this file is the lane record.

## ▶ RESUME HERE (2026-11-27) — call sign **'resume killer'**: start at the ▶▶ block of `prompts/SHEET_FRONT_DOOR.md` (one package, build order)
- **P0 VIEW DONE (witness) 2026-11-27** with the S10 report reader: bim-ootb `pdf/` (PR #3470), results §4.2. **1 of 14 groups** (G1) is in part at parity:
  open, pages on demand, find, outline, password and damaged files; NOT yet: the 5 view modes, tabs, split panes, clickable links.
- **P4 NARROW DONE (witness) 2026-11-27: numbers only**, rewritten in the box the source map names (bim-ootb #3477, #3478; spec §4.3,
  results §4.4): no reflow, right edge kept, the old run gone from the file, a digit missing from the embedded subset → refused or a
  STATED substitution. G4 parity is NOT claimed (numbers only; one-byte fonts, cross-reference streams and form text are named refusals).
  After it the reader names a stale row (`SHEET_FRONT_DOOR.md` §7.6), so the write-back witnesses expect F10 named after a D10 + D28 edit.
- **History inside the file DONE (witness) 2026-11-27** (bim-ootb #3481, #3482; spec §4.5, results §4.6); the sheet panel closes (#3485).
- **State 2026-11-28:** what is open for the PDF side is in the **▶ OPEN LIST** of `SHEET_FRONT_DOOR.md` (items 8, 13, 20, 21-24).
- **Next for the editor = P1 organise**, then P2; the lane's overall next step is in the ▶▶ block of `SHEET_FRONT_DOOR.md`.
- Sister lane: `prompts/SHEET_FRONT_DOOR.md` (the PDF→sheet report reader S10 and history S9 are the extras this editor gets for free).

## 0. Why (owner, 2026-11-27)
Owner: *"Someone has also reverse engineered the PDF to be edited for free. Any shortcomings in it, that we can redo better and thus be
our backdoor to editable PDFs with such killer features too. As most reports comes in PDF format that users need to reuse."* ·
*"Is his using JS and can run via browser like ours? Spec for it - to be a pure editor as his, but need not look at his code if you
already can reverse engineer from learning?"*

The reference product is **KillerPDF** by "Steve the Killer" (news: Neowin; GPLv3; v1.9.6 per its site, 2026-11-24; ~4.5k GitHub
stars). It is **C# / .NET / WPF, Windows only** (README: "needs Windows 10 or later"; Linux #9 and ARM64 #270 still open). It
cannot run in a browser, on a Mac, on Linux or on a phone. That is the opening.

## 1. CLEAN-ROOM RULE (non-negotiable)
- **Never read KillerPDF's source** (or any GPL PDF editor's source) for this lane: GPLv3 code cannot enter our MIT / GPL-2.0
  files, and a clean room is the only defensible way to match a product's behaviour.
- Allowed inputs: (1) its **public feature list and documentation** = WHAT to build (the denominator, §2); (2) the **PDF
  standard** ISO 32000-2:2020 (PDF 2.0), free from the PDF Association (sponsored edition, Errata Collection 2) = HOW; (3)
  permissively licensed libraries we load as separate files (§3); (4) our own measurements and witnesses.
- Its public bug reports are fair input as **named falsifiers** (what a correct editor must not do), e.g. #413 "editing texts
  shifts line, and keeps old texts parts".

## 2. DENOMINATOR — KillerPDF's public feature list (read 2026-11-27 from killerpdf.net + README), grouped
Claims in this lane are "X of N groups at parity", N from this table, never a hand-picked subset. Browser limits are stated, not hidden.

| # | Group (their public wording, condensed) | Browser can? |
|---|---|---|
| G1 | View: 5 view modes, tabs, split panes, search, outline, links; open password-protected and broken-xref PDFs | yes |
| G2 | Organise: merge, split, extract, reorder, rotate, crop, resize, straighten, page labels, bookmarks, TOC generation | yes |
| G3 | Annotate: text boxes, drawing, highlights, shapes, stamps, images, measurements, reusable signatures (drawn) | yes |
| G4 | Edit text in place by line or paragraph; find and replace across the document | yes (hardest, §4 P4) |
| G5 | Images: move, resize, extract | yes |
| G6 | Forms: create, fill, recognise fields, flatten, FDF/XFDF, XFA conversion | yes (XFA: partial, stated) |
| G7 | Redaction: by area, text search, pattern (email, phone, card, IBAN), content removed and verified before save | yes |
| G8 | OCR: page/region to clipboard, make scans searchable, scan words to editable text with uncertain-word review | yes (WASM OCR) |
| G9 | Compare two PDFs: difference regions + changed percentage | yes |
| G10 | Export: Word, Excel, PowerPoint, HTML, Markdown, text, JSON, EPUB 3, page images; DOCX/XLSX to PDF | yes (Office formats via JS writers) |
| G11 | Security: AES-256 passwords, certificate recipients | yes (needs own encryption layer, §3) |
| G12 | Signing: certificate (.pfx) signing, RFC 3161 timestamps, signature inspection; **Windows certificate store** | .pfx yes; **OS cert store NO**; timestamp needs a network call |
| G13 | Quality: preflight, PDF/UA-1/2 accessibility checks, print production, 300 DPI print, colour management | partly (checks yes; colour-managed print limited) |
| G14 | Automation: guided tasks, macros, watched folders, data merge, 73 command-line commands | partly (no CLI in a page; watched folders Chromium-only via File System Access; node CLI possible) |
| — | Reads EPUB and DjVu; TWAIN scanning; legacy DOC/XLS via installed Office | DjVu/EPUB possible; **TWAIN NO**; **installed Office NO** |

## 3. Architecture (decided 2026-11-27, owner delegated: "go with your best")
- **One page, one engine, all local.** `pdf/` page in bim-ootb, PWA-cached (sw.js), works offline; the file is read with the File
  API and never uploaded. Runs on Windows, Mac, Linux, ChromeOS, phones.
- **Read / render / text positions: pdf.js** (Mozilla, Apache-2.0) — ALREADY SHIPPED at `modeller/lib/pdfjs/` (2023 build) and
  already used by our own browser PDF reader `modeller/pdf2dxf/pdf_reader.js` (paths + words with boxes, PDF2BIM §41).
  Reuse it, don't add a second renderer.
- **Write / modify: pdf-lib** (MIT): pages, merge/split, annotations, AcroForm fill/flatten, incremental updates (fork). No
  native encryption (documented gap) → G11 needs our own layer (AES-256 per ISO 32000-2 §7.6), not an unvetted fork.
- **Own content-stream layer** for what no library does well: in-place text edit (G4) and true redaction (G7) rewrite the page's
  content-stream operators (text-showing `Tj/TJ`, positioning `Td/Tm`) per ISO 32000-2 §9; fonts per §9.6-9.10.
- **OCR:** a WASM build of the same open engine class (Tesseract via tesseract.js, Apache-2.0), models fetched on demand.
- **Licence hygiene:** our new files MIT; Apache-2.0 and MIT libraries are loaded as separate, unmodified files with their
  notices (the pattern the Modeller already uses for pdf.js). Never mixed into a GPL-2.0-only file.
- **PERF BUDGET (CLAUDE.md):** log heap per page and per open file (`§PDFED-COST`); render pages on demand, release off-screen.
- **Our extras (the "better", built in sister lanes):** every edit is a signed history entry (S9 engine: rewind, per-object story,
  tamper check, merge two copies); the report reader (S10) turns a report's tables into a checked spreadsheet and prints it back.

## 4. Phases — each with its witness claim BEFORE code (claim → the issue it exposes → falsifier)
| Phase | Groups | Claim | Falsifier |
|---|---|---|---|
| **P0 VIEW** | G1 | Opens the corpus (§5) with page count, text and outline equal to an independent reader (poppler `pdfinfo` / `pdftotext`) per file; a broken-xref file opens or is NAMED, never a blank page | a file reported "opened" with 0 pages; text differs |
| **P1 ORGANISE** | G2 | merge/split/reorder/rotate/extract: page count, per-page text and per-page rotation equal the operation's arithmetic, checked by re-reading the saved bytes | swap two pages silently |
| **P2 ANNOTATE + FORMS** | G3, G6 | an annotation or field value written, saved, reopened by an independent reader, is present with the same rect/value; flatten leaves no field and the value in the page text | annotation lost on save |
| **P3 IMAGES + COMPARE + EXPORT(text/md/json/html/images)** | G5, G9, G10 part | compare reports 0% on identical files and the exact changed page on a one-page edit; exports re-read equal to the source text | compare says 0% after an edit |
| **P4 EDIT TEXT IN PLACE** | G4 | after replacing a run: re-extracted text has the new string, **the old string is gone, no other run moved** (KillerPDF #413 as the named falsifier), font is the original when every glyph exists in its embedded subset, else a STATED substitution (`§PDFED-FONT-SUB`), never silent | old text left behind; neighbouring line shifted |
| **P5 REDACT** | G7 | after redaction: the text search finds 0 hits, the raw decompressed content streams contain 0 occurrences, any image under the area is cut, and the save is refused if any check fails | text hidden under a black box but still in the stream |
| **P6 OCR** | G8 | a scan of a known page → searchable PDF whose text matches the source within a stated character error rate, uncertain words listed | VACUOUS if no words found |
| **P7 SECURE + SIGN (.pfx)** | G11, G12 part | an AES-256 file we write opens in an independent reader with the password only; a signature we make verifies in an independent validator; a 1-byte change after signing is reported as broken | signature "valid" after tamper |
| **P8 OFFICE EXPORT / IMPORT** | G10 rest | DOCX/XLSX/PPTX written open in LibreOffice headless with text equal; XLSX tables via S10 with totals checked | — |
| **P9 QUALITY + AUTOMATION** | G13, G14 part | PDF/UA and preflight findings equal veraPDF's on the same files (veraPDF as oracle); a node CLI runs the same engine | — |

Order of value for our users (reports): P0 → P1 → P2 → P4 → P5 → S10 reader; P6-P9 after.

## 5. Corpus (to assemble, not yet checked)
- Our own: NinjaExcel trial-balance PDF (21 accounts, total 40,392.44), the TB-LKTN drawing PDF, ERP print formats.
- Public, licence to be confirmed per set before use: the pdf.js test corpus (Apache-2.0), the veraPDF corpus (PDF/A, PDF/UA),
  the PDF Association's sample sets. Record each file's source and licence in the corpus manifest; private client PDFs never.

## 6. Honest scale
KillerPDF reports ~145,000 lines of its own C# engine, 8,508 engine tests and a 47,024-file corpus (its own figures, not
verified). P0-P3 sit mostly on existing libraries. P4 (text edit), P5 (redaction), P7 (encryption + signing) and P9 (PDF/UA) are
the deep parts. Claims stay "X of 14 groups", each backed by its phase witness, never "parity" in general.

## 4.1 Phase P0 in detail (spec 2026-11-27, before code) — with `SHEET_FRONT_DOOR.md` §7 (S10)
Code (bim-ootb): `pdf/pdf_open.js` (open + describe, the one owner of "is this file open"), `pdf/index.html` (the page),
witness `pdf/tests/witness_pdfed_p0.js` (W-PDFED-P0). pdf.js is the copy already shipped at `modeller/lib/pdfjs/` (3.11.174).
- `PdfOpen.open(pdfjsLib, bytes, password?) -> { ok, pages, text:[per page], outline:[{title,depth}], items:[per page] }` or
  `{ ok:false, named:'not-a-pdf'|'empty'|'needs-password'|'wrong-password'|'damaged', message }`. `ok:true` with 0 pages cannot
  be returned. `items` are the text items in page points, y down: what S10 reads.
- **The page:** Open (file chooser or drop; File API, nothing uploaded), pages drawn on demand and released off screen, text
  search, outline, **Read as sheet** (S10: the table, the adds-up verdict, hover a cell to see its box on the page, download
  `.xlsx`). Logs `§PDFED-OPEN`, `§PDFED-COST` (heap, canvases alive), `§SHEET_READER`.
- **Corpus (in git, ours):** `trial_balance_th.pdf` (1 page, Thai + Latin) and `market_impact_report.pdf` (bim-compiler
  `docs/BIM_Compiler_Market_Impact_Report.pdf`, 12 pages, 23 outline entries). Made at run time from them, never committed: a
  copy with its cross-reference table cut off, a password copy (ghostscript), an empty file, a non-PDF. More files by `PDFED_EXTRA=<dir>`.

| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| V1 PAGES | per file, page count == poppler `pdfinfo` | pages lost | — |
| V2 TEXT | per page, the characters read (spaces removed, NFC) are the same multiset as poppler `pdftotext` gives | text lost or garbled | mutant: last item of each page dropped |
| V3 OUTLINE | outline titles in order == poppler `pdftohtml -xml` outline | bookmarks lost | mutant: nested entries dropped |
| V4 BROKEN / LOCKED | the cut-xref copy opens with the same page count and text, or is NAMED; the password copy without password is NAMED needs-password and opens with it; empty and non-PDF are NAMED | a blank page shown for a damaged or locked file | mutant: errors swallowed, "opened" with 0 pages |
| V5 PAGE (wiring, real page, real file chooser, headless) | the page logs `§PDFED-OPEN pages=N`; the first page's canvas holds ink (count of non-white pixels > 0, a number, no screenshot); Read as sheet logs `§SHEET_READER verdict=ADDS_UP cells=144` and the `.xlsx` it offers re-reads to 40,392.44 in D28; on the 12-page file, after scrolling to the end, canvases alive < pages | scripts not loaded, nothing drawn, memory never released | — |

Password files need pdf.js's own decryption only (reading); writing encrypted files stays in P7.

## 4.2 RESULTS — P0 (2026-11-27, bim-ootb `feat/pdf-p0-reader`, PR #3470)
Commands: `PDFED_MUTANTS=1 node pdf/tests/witness_pdfed_p0.js` · `node pdf/tests/witness_pdfed_page.js` (headless Chromium, `--disable-gpu`).
```
§PDFED-OPEN file=trial_balance_th.pdf pages=1 chars=1017 outline=0 runs=152 · file=market_impact_report.pdf pages=12 chars=16842 outline=23 runs=594
§PDFED-V1 PASS 2/2 · V2 PASS 2/2 · V3 PASS 1/1 · V4 PASS 7/7
§PDFED-MUTANTS killed=3/3  (first character dropped→V2, nested outline dropped→V3, errors swallowed "opened with 0 pages"→V4)
§PDFED-VERDICT PASS judged=13 failed=0
§PDFPG-INK {"canvas":true,"w":1100,"h":850,"ink":111350}
§PDFPG-RELEASE pages=12 aliveAtOpen=1 aliveAtEnd=2 renders=16 releases=13 heapMB=10
§PDFPG-VERDICT PASS judged=17 failed=0
```
- V4: the copy with its cross-reference table cut off OPENED with the same page and text (pdf.js rebuilt it); empty, non-PDF and
  header-over-garbage are NAMED; the ghostscript password copy is NAMED `needs-password`, `wrong-password`, then opens with the password.
- V5 (page): real file chooser; page 1 canvas holds 111,350 dark pixels; Read as sheet `verdict=ADDS_UP cells=144`; the box for D28
  sits on the source map's box (< 0.5 px); the `.xlsx` handed over re-reads to D28 = 40392.44 `=SUM(D6:D26)`; the outline's last entry goes
  to the page poppler names; Find "market" = 45 hits = poppler's count; 2 canvases alive of 12 after scrolling; with the network OFF
  the page reloads and reads the report (red control: cache bypassed + network off → no boot).

**Findings:**
1. **poppler's default text mode is not a fair oracle for reports:** `pdftotext` removes line-end hyphens, so a column of accounting
   dashes read 8 of 40 there. `pdftotext -raw` and pdfminer both give 40, as we do. V2 judges against `-raw`.
2. **Offline is network-first** (`pdf/sw.js`): online users always get the current files, so the page needs no cache-version bump per
   deploy (it stays out of the `sw.js` conflict class); offline users get the last copy seen.

**Not judged in P0:** V3 has ONE file with an outline (the trial balance has none in either reader). Corpus = 2 of our own files; the
public sets of §5 are not assembled. Heap per open file is logged, not budgeted.

## 4.3 Phase P4 narrow: numbers-only write-back (spec 2026-11-27, before code) — build-order step (2) of 'resume killer'
A user reads a PDF report as a sheet (§4.1, S10), changes a NUMBER in the sheet, and gets the SAME PDF back with that number
rewritten in place, in the box the source map names. No reflow, numbers only. Clean room (§1): ISO 32000-2 §7.5 (file
structure), §8.4 (graphics state), §9 (text) and our own measurements only.

### 4.3.1 Measured before the design (the proof file `pdf/corpus/trial_balance_th.pdf`, 74,945 bytes)
- 31 objects, ONE classic cross-reference table, no `/Prev`, not encrypted. The page's content is ONE stream (object 5,
  28,044 bytes, **not compressed**): 152 `BT..ET` blocks, 185 `TJ`, 185 `Tm`, 152 `Tf`, no `Tj`/`Td`. Each cell is drawn as
  `q <x y w h> re W n ... q 1 0 0 -1 0 526.5 cm BT 1 0 0 1 <x> <y> Tm /F4 9 Tf [<hex codes> 0] TJ ET Q Q` (its own clip box).
- 4 fonts, all Type0 / Identity-H / CIDFontType2 subsets with a ToUnicode map and a `/W` width table:
  F4 LiberationSans (regular, the body numbers) carries all ten digits and `. , ( ) -`;
  **F2 LiberationSans-Bold (the total row, 10 pt) carries only the digits 0 2 3 4 9** (and `. ,`): 1 5 6 7 8 are not in the subset.
- D10 `498.09` is one `TJ` in F4 9 pt; D28 and E28 `40,392.44` are one `TJ` each in F2 10 pt. `498.09` is printed once,
  `40,392.44` twice (D28 and E28), so "the old string is gone" is a COUNT (one fewer), never "absent".

### 4.3.2 Design (owner delegated; decided here)
Code (bim-ootb): `pdf/pdf_write.js` (UMD, browser + node, MIT, no library: Flate through the platform's own
`DecompressionStream` / `CompressionStream`), witnesses `pdf/tests/witness_pdf_write.js` (W-PDF-WRITE, node) and
`pdf/tests/witness_pdf_write_page.js` (W-PDF-WRITE-PAGE, the real page, headless).
- `PdfWrite.rewriteNumbers(bytes, edits, opts?) -> Promise<{ ok, bytes, changes:[...], refused:[...] }>`; an edit =
  `{ page, box:[x0,y0,x1,y1], oldText, newText, cell?, align? }` taken from the reader's source map (page points, y down).
  **All or nothing:** if ANY edit is refused, `ok:false`, `bytes` is the input unchanged and every refusal is named.
- **Own layers.** (1) File: classic cross-reference table(s), objects, page tree, the page's content stream(s) (none or
  one FlateDecode filter). (2) Content: an interpreter of the graphics and text state (`q Q cm`, `BT ET Tf Tm Td TD T* Tc Tw Tz TL Ts`,
  `Tj TJ ' "`, rectangular clips `re W n`) that lists every text run with its font, glyph codes, decoded text and its
  extent in page points. (3) Fonts: Type0 Identity-H with ToUnicode (`bfchar`, `bfrange`) and `/W` / `/DW` widths.
- **Finding the run:** the runs whose centre lies in the edit's box; their decoded text (spaces squashed) must equal `oldText`.
  A number drawn as SEVERAL runs (same font, size and line) is one cell: the new glyphs go into the run that holds the kept edge
  (the last one for a right-aligned number), the other runs keep their pen advance and lose their glyphs. Mixed fonts: REFUSED `several-fonts`.
- **Replacing:** the run's operand and operator are replaced by ONE `TJ` holding the new glyph codes plus a spacing number
  that makes up the width difference, placed BEFORE the glyphs for a right-aligned number (the reader types a cell as a
  number only in a column whose cells share a right edge). The text position after the run is therefore exactly what it was:
  no later run can move. Every other byte of the stream is copied as it was (no re-serialisation of the stream).
- **Alignment is evidence, not a guess (added 2026-11-27, before its code: the reader now also types CENTRED number columns,
  bim-ootb #3472):** `PdfWrite.alignOf(readResult, cell)` reads the cell's column from the source map: the edge (right, centre
  or left, within 1 pt) that the most number cells of the column share is the alignment; a tie goes right, then centre, and is
  reported `decided:false`. The page passes it as `edit.align` and logs it. `right` keeps the right edge, `left` the left edge,
  `center` the middle; the spacing number goes before, after, or on both sides of the glyphs.
- **Saving:** a true rewrite, not an incremental update (an appended revision would leave the old number in the file):
  the content-stream object is replaced, every other object is copied byte for byte, one new cross-reference table.
- **Glyphs:** new text is encoded through the run's own font (reverse ToUnicode). A character the embedded subset lacks:
  REFUSED `glyph-missing` (font and characters named) by default; with `opts.substitute` the run is written in another
  font of the SAME family already on the page that holds every needed glyph, the original font restored after the run,
  logged `§PDFED-FONT-SUB` and returned in the change (`fontSub`). Never silent, never across families.
- **Fit:** a new number whose extent leaves the run's rectangular clip, or reaches into another run on the same line, is
  REFUSED `does-not-fit` (a write-back never clips a number nor paints over its neighbour).
- **Named refusals:** `not-a-number` (old or new text is not a number as the reader types one: one grammar,
  `ReportReader.parseNum`), `no-text-in-box`, `old-text-not-in-box`, `glyph-missing`, `does-not-fit`, `duplicate-edit`,
  `no-such-page`; and for the file: `not-a-pdf`, `xref-stream` (PDF 1.5 cross-reference streams: not in this cut),
  `encrypted`, `filter-not-supported`, `font-not-supported`, `rotated-text`, `rotated-page`, `shared-content`, `damaged`.
- **The sheet side, one owner:** `PdfWrite.applyToItems(pages, edits)` applies the same edits to the reader's input so
  the reader's own adds-up rule judges the EDITED SHEET before a byte is written; `PdfWrite.formatLike(columnTexts, typedText)`
  prints a typed number the way its column is printed (decimals, grouping, brackets, dash for zero: read from the column's own
  texts), on the digits as typed, with no float arithmetic; more decimals than the column prints is REFUSED `too-many-decimals` (no silent rounding).
- **History (S9, no second format):** `PdfWrite.record(SheetHistory, history, snapshot, changes, actor, at)` = one journal
  entry per rewrite, one `CELL_SET` per applied change; a refused rewrite records nothing.
- **The page:** in the Read-as-sheet grid a NUMBER cell is edited by double-click; on Enter the page judges the edited sheet,
  rewrites the PDF in memory (`substitute` on, said in words), re-opens and re-reads the rewritten bytes, redraws, logs
  both verdicts (`§PDFWR-SHEET`, `§PDFWR-REREAD`) and records the history entry. **Download PDF** hands back those bytes.
  A refusal is said in words and the cell goes back. `pdf_write.js` and `erp/sheet_history.js` join `pdf/sw.js` ASSETS.

### 4.3.3 Claims (W-PDF-WRITE; verdict line `§PDFWR-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`)
| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| W1 ROUND TRIP | D10 498.09→499.09 and D28 40,392.44→40,393.44: the SAVED bytes re-read with `pdf_open` + `report_reader` give the new values at the same addresses, 144 cells, every other cell's text unchanged, verdict ADDS_UP. A fully consistent edit (D10 500.09, F10 1,020.16, D28 40,394.44, F28 2.00) re-reads with all 5 checks (4 sums + the row rule on 21 of 21 rows) | the number is written to the wrong cell or not at all | mutant: the box is ignored (last run with that text is rewritten) |
| W2 INDEPENDENT | poppler `pdftotext -raw` on the saved bytes holds the new strings and one FEWER of each old string; `pdftotext -bbox` holds a word with the new text where the old one stood | our own reader agrees with our own writer only | — (INCONCLUSIVE without poppler) |
| W3 OLD GONE | in the saved file's content stream (inflated by the witness, not the engine) the old run's line is gone, exactly one line changed per edit, the counts of every other operator are unchanged; the file is one revision (one `%%EOF`, no `/Prev`) and the old line occurs nowhere in the saved bytes | old text left behind, hidden or kept in an earlier revision (KillerPDF #413) | mutant: old run kept, new run added |
| W4 NOTHING MOVED | every other cell: same text and box within 0.01 pt (reader map); every other poppler word: same bbox within 0.01 pt; the edited cells' RIGHT edge unchanged within 0.01 pt in both readers; a width-changing edit (D10 498.09→1,498.09) keeps the right edge and moves the LEFT edge by the font's own widths of `1,` (7.51 pt at 9 pt) within 0.01 pt; with `align` left / centre (498.09→98.09) the left edge / the middle is kept instead, in both readers; every object but the content stream is byte-identical; rendered by poppler (`pdftoppm`, grey, 100 dpi) 0 pixels differ outside the edited boxes and more than 0 inside | a neighbouring run shifted; alignment lost | mutant: no spacing number (left edge kept instead of right) |
| W5 STILL BITES | only D10 rewritten (total left stale): the re-read verdict is DOES_NOT_ADD_UP naming D28 and both numbers | the check goes blind after an edit | — |
| W6 REFUSED | each is refused BY NAME with the input bytes returned unchanged: a non-number new text; a text cell; an old text that is not what is in the box; a box with no text; a glyph the subset lacks (D28→40,395.44: `glyph-missing`, font and `5` named); a number too wide for its cell (`does-not-fit`); two edits on one box; and one bad edit in a batch refuses the whole batch | a wrong or damaged write passes silently | mutants: glyph check skipped; fit check skipped |
| W7 STATED SUBSTITUTION | with `substitute`, D28→40,395.44 is written in LiberationSans (regular), `§PDFED-FONT-SUB` names from / to / missing, the change carries `fontSub`; both readers read the new value; right edge kept within 0.01 pt; E28 (bold, next to it) unchanged | a silent font change, or a refusal the user cannot get past | — |
| W8 HISTORY | genesis + ONE entry per rewrite holding one `CELL_SET` per applied change with before/after; the kernel's `verifyJournal` accepts it; a refused rewrite records nothing; the history replayed (`asOf`) holds the same VALUE at every address as the re-read PDF | history and file disagree; a second log format | — |
| W9 VALID FILE | poppler `pdfinfo`: exit 0, no message, same page count; every cross-reference entry points at its `N G obj`; `/Length` equals the stream's real length; size delta, ms and heap logged (`§PDFWR-COST`) | a file only our own reader can open | mutant: offsets not updated |
| W10 VARIANTS | the same file with its content stream Flate-compressed (made at run time by the witness, checked equal by poppler first): the W1 edit round-trips, the saved stream is still FlateDecode and inflates (node zlib) to a stream without the old line. A copy where D10 is drawn as TWO runs (made the same way): the edit round-trips, right edge kept, both readers read 1,498.09 once | only uncompressed streams, or one run per number, work | — |
| W11 SECOND WRITER | a ghostscript re-distilled copy (made at run time: other operators, other font packaging): the W1 edit either round-trips with W1/W2's checks or is REFUSED by name; measured and reported, never a silent wrong write | the engine fits one generator's style only | — (INCONCLUSIVE without ghostscript) |
| W12 SHEET SIDE | `applyToItems` + the reader give, for three edit sets (D10 only; D10 + D28; the consistent four), the SAME verdict and reason as the re-read rewritten PDF; `formatLike` prints `40393.44` as `40,393.44`, `-1466.15` as `(1,466.15)` and `0` as `-` from column D's and F's own texts, and refuses `499.091`; `alignOf` says right for column D (every number cell shares the right edge) and centre / left for boxes that share those | the sheet says one thing, the PDF another | — |
| W13 CORPUS SWEEP (added 2026-11-27 after bim-ootb #3472 brought four more report PDFs into `pdf/corpus/`, before its code) | over EVERY number cell the reader finds on every page of every corpus PDF (N from the corpus, not a hand-picked cell), one edit each (last digit d → d+1 mod 10; a dash → `0.00`): it either round-trips (our reader: that cell reads the new text, right edge within 0.01 pt, every other cell same text and box, same cell count; poppler: the words inside the cell's box read the new text) or is REFUSED by name with the bytes unchanged. Wrong writes = 0. Counts per file and per refusal reason logged (`§PDFWR-SWEEP`), with and without `substitute` | the two hand-picked cells are the only ones that work | — (INCONCLUSIVE if no number cell is found) |

Mutants (`PDFWR_MUTANTS=1`): each must turn its named case FAIL in a child run; a crash is not a kill.
W-PDF-WRITE-PAGE (wiring, real page, headless, `§PDFWP-*`): a number cell is edited with real key presses → both verdict
lines; the canvas pixels inside the cell's box change; Download PDF hands bytes that poppler and the node reader read as
the new values; a non-number is refused in words and nothing changes; a text cell opens no editor; history = genesis + one
entry per applied edit, verified. The P0 page witness (`witness_pdfed_page.js`) stays green.

Not claimed in this cut: text other than numbers; reflow; cross-reference streams and object streams (PDF 1.5+: named
refusal); encrypted files; simple (one-byte) fonts and the standard 14 without widths; text inside form XObjects; vertical
or rotated text; kerning pairs of the new digits; any report layout other than the proof file (denominator 1 of 1).

## 4.4 RESULTS — P4 narrow, numbers-only write-back (2026-11-27, bim-ootb PR #3477 `feat/pdf-write-numbers` + follow-up PR #3478 `feat/pdf-write-align`)
Code: `pdf/pdf_write.js` (417 lines, no library), page wiring in `pdf/index.html`, `pdf/sw.js` ASSETS (+ `pdf_write.js`,
`../erp/sheet_history.js`). bim-ootb diff vs `main`: #3477 5 files, +929 / −13; #3478 (alignment from the column's evidence) 4 files,
+23 / −5 (add-only by nature: a new layer, nothing it supersedes).
Commands: `PDFWR_MUTANTS=1 node pdf/tests/witness_pdf_write.js` · `env -u DBUS_SESSION_BUS_ADDRESS node pdf/tests/witness_pdf_write_page.js`
(headless Chromium, `--disable-gpu`). Run after merging `main` with the sister slice's reader change (#3472).
```
§PDF_WRITE ok=true edits=2 applied=2 refused=0 bytesIn=74945 bytesOut=74937 ms=21 cells=D10:"498.09"->"499.09",D28:"40,392.44"->"40,393.44"
§PDFWR-W1 PASS 5/5 · W2 PASS 4/4 · W3 PASS 4/4 · W4 PASS 8/8 · W5 PASS 2/2 · W6 PASS 12/12 · W7 PASS 5/5 · W8 PASS 5/5 · W9 PASS 4/4 · W10 PASS 5/5 · W11 PASS 3/3 · W12 PASS 6/6 · W13 PASS 3/3
§PDFWR-NOTE W3 changed lines: "[<0029002b001500140004002b> 0] TJ" -> "[<0029002b002b00140004002b>] TJ" ; "[<000f000d0010001100120013000e000f000f> 0] TJ" -> "[<000f000d0010001100120011000e000f000f>] TJ"
§PDFWR-NOTE W4 width edit D10 498.09 -> 1,498.09: /W of "1" = 556.152344, of "," = 277.832031 -> the number grows by 7.5059 pt at 9 pt; change={"x0Before":447.473,"x0After":439.967,"x1Before":475,"x1After":475}
§PDFWR-RASTER renderer=pdftoppm dpi=100 size=946x732 pixelsChangedInsideEditedBoxes=115 outside=0
§PDFED-FONT-SUB cell=D28 page=1 from=LiberationSans-Bold to=LiberationSans missing="5" new="40,395.44" stated=true
§PDFWR-COST edits=2 bytesIn=74945 bytesOut=74937 delta=-8 contentBytesIn=28044 contentBytesOut=28040 rewriteMs=13 heapDeltaKB=3274 heapMB=18
§PDFWR-NOTE W11 ghostscript copy: bytes=35822 objects=38 content flate=true 3126 bytes, Tj=123 TJ=35 Td=14 runs=158 ... outcome=ROUND-TRIP bytesIn=35822 bytesOut=35862
§PDFWR-SWEEP total corpusFiles=6 filesWithNumbers=6 numberCells=110 roundTrip=102 refused=8 ofThoseRoundTripWithSubstitute=4 wrong=0 poppler=true
§PDFWR-MUTANTS killed=6/6  (old run kept→W3, right edge not kept→W4, box ignored→W1, missing glyph not refused→W6, fit not checked→W6, xref offsets not updated→W9)
§PDFWR-VERDICT PASS judged=67 failed=0
§PDFWR-EDIT cell=D10 ok=true old="498.09" new="499.09" sheetVerdict=DOES_NOT_ADD_UP pdfVerdict=DOES_NOT_ADD_UP agree=true fontSub=none align=right bytes=74939 edits=1
§PDFWR-HISTORY entries=3 ops=1 cell=D28 before=40392.44 after=40393.44 typedOverFormula=true
§PDFWR-DOWNLOAD file="trial_balance_th_edited.pdf" bytes=74937 edits=2 historyEntries=3 verdict=ADDS_UP
§PDFWP-CANVAS {"same":true,"w":1100,"h":850,"inside":69,"outside":0}
§PDFWP-VERDICT PASS judged=22 failed=0
```
Regression, same tree: `§PDFPG-VERDICT PASS judged=17` · `§PDFED-VERDICT PASS judged=13` (3/3) · `§SREAD-VERDICT PASS judged=37` (7/7) · `npx eslint pdf` exit 0.

- **W1/W2:** the saved bytes re-read to D10 = 499.09 and D28 = 40,393.44 at the same addresses, 144 cells, only those two differ, ADDS_UP.
  poppler: 499.09 once, 40,393.44 once, 498.09 gone, 40,392.44 once (E28 untouched); the new words stand in the old boxes.
- **W3 (the #413 falsifier):** 2 of 2,456 content lines changed, both a `TJ`; operator counts identical; the old `Tm + Tf + TJ` block
  occurs nowhere in the saved file; ONE revision (one `%%EOF`, no `/Prev`).
- **W4:** the other 142 cells and 186 poppler words keep text and box within 0.01 pt; 30 of 31 objects byte-identical; a
  width-changing edit keeps the right edge and moves the left edge by the font's own widths (7.5059 pt) in both readers; rendered
  by poppler, 115 pixels change inside the two edited boxes and 0 outside. With `align` left / centre (498.09 → 98.09, 5.01 pt
  narrower) the left edge / the middle is kept instead, in both readers; `alignOf` reads column D as right (all 23 number cells
  share the right edge), boxes of one width as right with `decided:false`.
- **W5:** only D10 rewritten → `DOES_NOT_ADD_UP "D28: printed 40392.44 != rows sum 40393.44"`. The check still bites after an edit.
- **W6:** 12 refusals, each named, each handing back the input bytes: `not-a-number` (x3, incl. a text cell), `old-text-not-in-box`,
  `no-text-in-box`, `glyph-missing` (font and `5` named), `does-not-fit` ("needs 97.59 pt, its cell is clipped to 84.00 pt"),
  `duplicate-edit`, `no-such-page`, a whole batch for one bad edit, `not-a-pdf`, `encrypted` (a ghostscript password copy).
- **W8:** one journal entry per rewrite, one `CELL_SET` per change, accepted by the kernel's `verifyJournal`; a total typed over a
  found SUM is flagged `typedOverFormula`; the history replayed holds the re-read PDF's value at all 144 addresses.
- **W10/W11:** the same edit round-trips on a Flate-compressed copy (stream still FlateDecode, inflated by node zlib), on a copy
  where D10 is drawn as two runs, and on a ghostscript re-distilled copy (literal strings, `Tj`/`Td`, `/Length` by reference).
- **W13 (denominator):** every number cell of every corpus PDF, one edit each: **110 cells in 6 files, 102 round-trip in both readers,
  8 refused by name, 0 wrong writes.** With `substitute` 4 of the 8 pass (the trial balance's bold totals).
- **The page:** real double-click and key presses; both verdict lines agree; the canvas redrawn from the rewritten PDF changes 69
  pixels inside D10's box and 0 elsewhere; Download PDF saves a file byte-equal to the page's bytes, which poppler and the node
  reader read as the new values; `abc`, `1.234` (no silent rounding) and a too-wide number are refused in words; Escape cancels;
  a text cell opens no editor; with the network OFF the page reloads and still edits.

**Findings:**
1. **Embedded subsets are the real limit of "numbers only".** The trial balance's bold font carries the digits 0 2 3 4 9 only, so
   most new totals cannot be written in bold; the stated substitution (regular face of the same family) gets all 4 such cells
   through. In `sales_register_th.pdf` and `geometry_fixture.pdf` the ONLY font of the family lacks the digit (`6`, `9`): 3 cells stay
   refused `glyph-missing` even with substitution. Getting past that needs a glyph ADDED to the embedded font (or a font embedded):
   a later cut, not attempted.
2. **The reader's row rule vanishes instead of failing** (reader finding, NOT fixed here: `report_reader.js` is the sister slice's).
   After D10 + D28 are edited the re-read says ADDS_UP with 4 checks, not 5: F10 is stale, so `F = C + D - E` no longer holds on
   every row and the reader stops reporting the rule (`rowRuleAfter=null`). A broken row rule should be a named failure. With the
   consistent four edits (D10, F10, D28, F28) all 5 checks hold again (W1 `consistent-four`).
3. **One-byte fonts are the next step for the writer's denominator:** `market_impact_report.pdf` (simple TrueType) is refused
   `font-not-supported`. The five other corpus PDFs come from ONE generator (PDFKit); the ghostscript copy is the only second writer judged.
4. **Found by a failing check, fixed:** the first page run failed `canvas` (1100 px before, 606 px after): the edit re-laid the
   page out. The page now redraws the visible pages in place, same size, no jump.
5. **Ship slip, no loss:** #3477 squash-merged (auto-merge) while the alignment commit was being pushed; the commit went out on a
   fresh branch off `main` as #3478 (the `feedback_followup_fresh_branch` rule). Auto-merge was switched off too late to hold it.
6. **Cost:** 2 edits on the 75 KB file: 13-39 ms over the runs, the file 8 bytes smaller (two `0` spacing numbers gone, a shorter dictionary).

**Not proven (stated, not hidden):**
- Parity group G4 (edit text in place) is NOT claimed: this is numbers only. Groups at parity stay "G1 in part" (§4.2).
- Code paths no corpus file exercises, so NOT judged: the `xref-stream` refusal, several cross-reference sections (`/Prev`),
  a page with several content streams, the operators `'` and `"`, non-zero `Tc`/`Tw`/`Tz`,
  non-rectangular clips (the fit check is then not made, the change says `clip:"unjudged"`), and the font being put back after a
  substituted run (in this corpus every cell sets its own font, so W7's neighbour check would pass either way).
- Viewers: poppler and pdf.js only. Acrobat, Preview and Chrome's own PDF viewer were not judged.
- The new digits carry no kerning pairs; the file's `/ID` is left as it was.
- **History is in the page's memory only.** Where a PDF's history lives (inside the PDF, or a file beside it) is an open decision;
  nothing is persisted with the downloaded PDF yet.
- The touch path (tap to edit on a coarse pointer) is coded, not witnessed. The witnesses are not wired into CI (as S1, S9, S10).

## 4.5 History inside the file (spec 2026-11-27, before code)
**Owner decision (2026-11-27).** Asked where a PDF's history is kept, the owner said: *"decide for me, but wouldn't history be cheap
and has to be in the file anyway?"* Decision taken: **YES, the history is kept INSIDE the downloaded PDF (and inside the downloaded
.xlsx), so the file alone carries its own tamper-evident memory.** This closes §4.4 "Not proven: history is in the page's memory only".
Clean room (§1): ISO 32000-2 §7.11.3 (file specification), §7.11.4 (embedded file streams), §7.9.6 (name trees), §7.7.2 (catalog
`/Names`) and our own measurements only.

### 4.5.1 Measured before the design
- The five PDFKit corpus files say `%PDF-1.3`; their catalog is `<< /Type /Catalog /Pages 1 0 R /Names 2 0 R >>` and object 2 is
  `<< /Dests << /Names [ ] >> >>`: `/Names` is ALREADY there, as an indirect object, without `/EmbeddedFiles`. `market_impact_report.pdf`
  (1.7) has a catalog without `/Names`. So the writer must handle `/Names` absent, inline and by reference.
- The history engine (S9) fixes an entry's `meta`, and `at` is not in the hash: the only hashed places a note can live are `actor` and the cells.
- The kernel's `verifyJournal` checks the chain only; `SheetHistory.verify` also checks each payload against its digest. Both are run.

### 4.5.2 Design (owner delegated; decided here)
Code (bim-ootb): `pdf/pdf_write.js` (+ `embedFile`, the writer's own object / cross-reference machinery, no library),
`pdf/pdf_open.js` (+ attachments), new `pdf/pdf_history.js` (UMD, MIT: the one owner of "the history of this file"),
`pdf/index.html`, `pdf/sw.js`. Nothing under `erp/` is edited: `host_shim.js` already exports `splitLine`, `CELL_LIMIT`, `HISTORY`.
- **In the PDF.** The lines (genesis + one per rewrite, `\n` after each, UTF-8) are ONE embedded file stream named
  `_door_history.jsonl` (`/Type /EmbeddedFile`, Flate through the platform's `CompressionStream`, `/Params << /Size >>`), held by a
  file specification (`/Type /Filespec /F /UF /EF`) listed in the catalog's `/Names /EmbeddedFiles` name tree (keys kept sorted).
  `PdfWrite.embedFile(bytes, name, data) -> Promise<{ ok, bytes, replaced, refused }>`.
- **Full rewrite, not an incremental update (decided).** Same reason as §4.3.2: an appended revision would keep every earlier copy
  of the history (and of the numbers) in the file, and the file would stop being ONE revision. Every object that does not have to
  change is copied byte for byte, so **the page content streams of a history-only save are byte-identical**; changed objects: the one
  that holds the name tree (the `/Names` object when it is indirect, else the catalog) and the two new ones. Saving again REPLACES the
  stream object in place (same object numbers, no second attachment, nothing else touched). A `%PDF-1.0..1.3` header becomes
  `%PDF-1.4` (one byte: `/EmbeddedFiles` is PDF 1.4). No date is written: the same lines give the same bytes.
  Named refusals: `not-a-pdf`, `encrypted`, `xref-stream`, `damaged` (as §4.3), `names-tree-not-supported` (a name tree split into
  `/Kids`), `bad-name`. All or nothing: a refusal hands back the input bytes.
- **On open.** `PdfOpen.open` (the one owner of opening) returns `attachments` (name → bytes, read by pdf.js, NOT by our writer) and
  `history` = the lines of `_door_history.jsonl`, or null. `PdfHistory.check(SheetHistory, ReportReader, lines, items)` gives ONE state:
  `none` (no history: the file opens exactly as before) · `ok` · `broken` (the S9 engine names the entry and why) · `mismatch`.
- **Honest binding of history to content.** A history that verifies but belongs to other numbers is worthless. The history is
  replayed to its latest state (`asOf`) and compared with what the reader reads from the pages NOW: every cell the history says was
  set must be printed with the same value, and every cell printed must be in the history (values, not found formulas). A difference
  = `mismatch`, with the FIRST differing cell (sheet order: row, then column), both values, `differ` of `of` cells, and a kind by
  structure, not by a threshold: `other-file` when the two sides do not hold the same cell addresses, `changed-outside` when the
  addresses agree and a value differs. Said in plain words. Limit stated: the binding covers the cells the reader reads, not every byte.
- **Continue, or restart in the open.** `ok` → the chain CONTINUES: the next edit is entry N+1 with `prev` = entry N's hash; nothing is
  recorded on open. `broken` / `mismatch` → the chain is NOT continued: the next recording is a NEW genesis (seq 1) that carries the
  break as a recorded cell, `_door_break!A1` = what was found (the entry or the cell, both values, how many entries the carried
  history had and its last hash). It is in the payload, so it is digest-protected and shows in a replay.
- **Sheets.** One chain per file. Page 1's sheet is `Report` (as the .xlsx names it), page N's is `Report pN`; a page first read
  later is an ordinary entry that adds its cells. `PdfWrite.record` takes the sheet name (default `Report`).
- **In the .xlsx.** The same lines go to the hidden sheet `_door_history` with the Excel menu's convention (SHEET_FRONT_DOOR §8.1):
  one entry per ROW, cut by `SheetAddin.splitLine` into chunks of at most 32,767 characters across columns, text cells, sheet very
  hidden. So the Excel menu's "Check history" and "Cell history" read what the PDF page wrote.
- **The page.** A **History** block in the side panel: how many entries, verified or not in plain words, where it is kept; a cell's
  story on request (type an address, or click a cell: `SheetHistory.cellStory`). Download PDF embeds the lines; Download .xlsx
  adds the hidden sheet. Logs `§PDFHIST-OPEN`, `§PDFHIST-STATE`, `§PDFHIST-SAVE`, `§PDFHIST-XLSX`, `§PDFHIST-STORY`.
  `pdf_history.js` and `../erp/sheet_addin/host_shim.js` join `pdf/sw.js` ASSETS.

### 4.5.3 Claims (W-PDF-HISTORY `pdf/tests/witness_pdf_history.js`; verdict line `§PDFHIST-<case> verdict=PASS|FAIL|INCONCLUSIVE judged=N failed=M`)
| ID | Claim | Issue it exposes | Falsifier |
|----|-------|------------------|-----------|
| H1 TRAVELS | D10 and D28 edited and recorded, saved; from the SAVED bytes alone (a fresh `open`): the history is found, its lines equal the recorded ones byte for byte, `SheetHistory.verify` AND `ws_kernel.verifyJournal` accept it, 3 entries, entries 2 and 3 hold one `CELL_SET` each (D10, D28); state `ok`, 144 of 144 cells bound | the history is lost on download | mutants: history not written; the opener drops attachments |
| H2 CONTINUES | a second session (only the saved bytes) edits F10: the new entry is seq 4 with `prev` = entry 3's hash, no second genesis; saved again the file holds ONE `_door_history.jsonl` (4 lines), same object count as after the first save; both verifiers accept | a second session restarts the chain, or attachments pile up | mutants: chain restarted; attachment added, not replaced |
| H3 INDEPENDENT | poppler `pdfdetach -list` names `_door_history.jsonl`; `pdfdetach -save` gives bytes equal to the lines; `pdfinfo` exit 0, no message, same page count; `pdftotext -raw` and `pdftotext -bbox` (every word box) identical to the same save WITHOUT history | only our own reader sees it; the attachment changes something visible | — (INCONCLUSIVE without poppler) |
| H4 UNTOUCHED | history-only save of the unedited file (objects read by the witness's own cross-reference reader, not the engine): every content stream and every object but the one holding the name tree is byte-identical; exactly 2 objects are new; one revision (one `%%EOF`, no `/Prev`); every cross-reference entry points at its object; the same lines saved twice give the same bytes; poppler raster (`pdftoppm`) 0 pixels differ | a history-only save rewrites the page | — |
| H5 TAMPERED HISTORY | one recorded value changed inside the PDF's history (entry 2) → `broken`, entry 2 named, why = payload; an entry removed → named at that entry; the chain is not continued: the next recording is a genesis (seq 1) whose `_door_break!A1` names entry 2; the new chain verifies | a rewritten history is accepted and built upon | mutants: tampered entry accepted; break not recorded |
| H6 CHANGED OUTSIDE | a number rewritten by the writer WITHOUT recording (D12) → the history still verifies, the binding says `mismatch` / `changed-outside`, names D12 with both values, 1 of 144; not continued | history and numbers drift apart unseen | mutant: binding check skipped |
| H7 OTHER FILE | the sales register's (verifying) history put into the trial balance → `mismatch` / `other-file`, refused as not this file's, first cell named | a pasted history lends its proof to other numbers | mutant: binding check skipped |
| H8 NO HISTORY, AND P0 TERMS | every corpus PDF as shipped: state `none`, `history` null, no word of tampering (N = corpus); every corpus PDF given a history: page count == `pdfinfo`, text multiset == `pdftotext -raw`, outline unchanged (P0's V1-V3 terms) | a plain PDF is called tampered; a history-carrying PDF opens worse | — |
| H9 XLSX | the .xlsx built from the read sheet + the lines, read back with SheetJS and handed to `host_shim.js`'s OWN reader (`SheetAddin.create(host).checkHistory()` / `.cellHistory()`): OK with the same entry count; D10's story = the values recorded; the sheet is very hidden; with a small cell limit every stored chunk is within it and the re-joined rows equal the lines; one changed character in a stored chunk → BROKEN at that entry | the Excel menu cannot read what the page wrote; a second convention | mutant: history sheet not written |
| H10 COST | `§PDFHIST-COST` per file (trial balance, sales register): genesis and per-entry bytes, as lines and as stored in the PDF (file size delta), ms | unmeasured weight (PERF BUDGET) | — |
| H11 SECOND WRITER, TWO PAGES | a ghostscript copy holding the trial balance on TWO pages (made at run time): an edit on page 1 and one on page 2 are ONE chain with two sheets (`Report`, `Report p2`); saved and reopened: state `ok`, both pages bound; pdfdetach sees the lines | one generator's catalog only; a second page's history silently lost | — (INCONCLUSIVE without ghostscript) |
| H12 REFUSED | not a PDF, an encrypted copy, a bad name: refused BY NAME, bytes unchanged | a damaged file written anyway | — |

Mutants (`PDFHIST_MUTANTS=1`): each must turn its named case FAIL in a child run; a crash is not a kill.
**W-PDF-HISTORY-PAGE** (`pdf/tests/witness_pdf_history_page.js`, the real page, headless, `§PDFHP-*`): edit → Download PDF → the file
on disk carries the lines (pdfdetach) → the SAME file opened through the real file chooser: `§PDFHIST-OPEN state=ok`, the History block
says the count and "verified", Read as sheet records NO second genesis, a further edit is entry N+1, a cell's story is shown on request,
Download .xlsx re-read through `host_shim.js` verifies; a tampered copy and an outside-edited copy are named in words and the next
history starts with the break. The four older witnesses stay green.

Not claimed in this cut: a signed identity (who = a name, §6.2 of the sister file); files with cross-reference streams (named
refusal: the history cannot be put in, said in words, the PDF is still handed back); name trees with `/Kids`; the embedded file's
`/CheckSum`, `/ModDate` and `/AFRelationship`; binding of anything but the cells the reader reads; real Excel (the .xlsx is judged
through the shim's reader on a stand-in host); merging two downloaded copies (`SheetHistory.merge` exists, not wired here).

### 4.5.4 Addition (2026-11-27, after #3481 merged, before its code): the .xlsx is written compressed
Measured on the merged slice: the page writes its .xlsx with SheetJS's default (ZIP "stored", no deflate), so two history lines of
15,048 bytes made the .xlsx 31,794 bytes larger (each `"` of the JSON is stored as `&quot;`); with `compression: true` the same
file grows by 7,283 bytes and the whole workbook falls from 54,802 to 25,248 bytes. **Change:** one owner of the .xlsx bytes,
`PdfHistory.xlsxBytes(XLSX, wb)` (deflate on), used by the page's Download .xlsx. **Claim H10 widened:** `§PDFHIST-COST` also carries the
.xlsx bytes with and without the history; the history must add FEWER bytes than its own lines, and the compressed file must re-read
through `host_shim.js`'s reader to the same lines (H9 runs on those bytes). Issue exposed: a history that doubles the size of the sheet it
travels in. The older page witnesses (which re-read the downloaded .xlsx) stay green.

## 4.6 RESULTS — history inside the file (2026-11-27, bim-ootb PR #3481 `feat/pdf-history-in-file` + follow-up #3482 `feat/pdf-history-xlsx-compressed`)
Code: `pdf/pdf_history.js` (new, 97 lines: check / adopt / start / save / toWorkbook / xlsxBytes / story), `pdf/pdf_write.js` (+ `embedFile`,
`build` takes new objects, `record` takes the sheet name), `pdf/pdf_open.js` (+ `attachments`, `history`), `pdf/index.html` (History block,
both downloads), `pdf/sw.js` ASSETS (+ `pdf_history.js`, `../erp/sheet_addin/host_shim.js`). Nothing under `erp/` edited. bim-ootb diff vs `main`:
#3481 7 files +609 / −32 (shipped code +209 / −32, witnesses +400); #3482 3 files +12 / −4. The page's old "one history per page read,
reset on the next" block is the part deleted: one chain per file replaces it.
Commands: `PDFHIST_MUTANTS=1 node pdf/tests/witness_pdf_history.js` · `env -u DBUS_SESSION_BUS_ADDRESS node pdf/tests/witness_pdf_history_page.js`
(headless Chromium, `--no-sandbox --disable-gpu`). poppler 24 (`pdfdetach`, `pdfinfo`, `pdftotext`, `pdftoppm`) and ghostscript present.
```
§PDFHIST-SAVE ok=true entries=3 lineBytes=15744 bytesIn=74937 bytesOut=77193 added=2256 replaced=false
§PDF_EMBED ok=true name=_door_history.jsonl bytesIn=74937 bytesOut=77193 data=15744 stored=1884 replaced=false
§PDFHIST-H1 PASS 5/5 · H2 PASS 5/5 · H3 PASS 5/5 · H4 PASS 8/8 · H5 PASS 7/7 · H6 PASS 4/4 · H7 PASS 3/3 · H8 PASS 3/3 · H9 PASS 5/5 · H10 PASS 2/2 · H11 PASS 6/6 · H12 PASS 3/3
§PDFHIST-NOTE H3 pdfinfo PDF version: with history 1.4, without 1.3 (the header says 1.4 once /EmbeddedFiles is used)
§PDFHIST-RASTER renderer=pdftoppm dpi=100 size=946x732 pixelsChanged=0
§PDFHIST-NOTE H8 crosstab.pdf:...history=own(12 cells),added=787 · geometry_fixture.pdf:...own(19 cells),added=858 · market_impact_report.pdf:pages=12,outline=23,history=payload-only,added=2004 · sales_register_th.pdf:...own(17 cells),added=982 · showcase.pdf:...own(36 cells),added=1171 · trial_balance_th.pdf:...own(144 cells),added=1972
§PDFHIST-XLSX-CHUNKS limit=1000 rows=3 chunks=17 longestStoredCell=1000 longestLine=14586 realLimit=32767
§PDFHIST-COST file=trial_balance_th.pdf cells=144 fileBytes=74945 genesisLineBytes=14586 genesisAddedToPdf=1972 perCellInPdf=13.7 entryLineBytes=462,499 entryAddedToPdf=147,137 ms=190 heapMB=36
§PDFHIST-COST file=sales_register_th.pdf cells=17 fileBytes=43522 genesisLineBytes=2114 genesisAddedToPdf=982 perCellInPdf=57.8 entryLineBytes=452 entryAddedToPdf=131 ms=25 heapMB=36
§PDFHIST-COST-XLSX file=trial_balance_th.pdf entries=3 lineBytes=15744 xlsxWithout=25258 xlsxWith=32826 added=7568 compressed=true
§PDFHIST-COST-XLSX file=sales_register_th.pdf entries=2 lineBytes=2720 xlsxWithout=11740 xlsxWith=13972 added=2232 compressed=true
§PDFHIST-NOTE H11 ghostscript copy: bytes=39373 objects=43 pages=2 catalogHasNames=false
§PDFHIST-MUTANTS killed=10/10  (history not written→H1, opener drops the attachment→H1, chain restarted→H2, attachment added not replaced→H2,
   tampered entry accepted→H5, break not recorded→H5, binding skipped→H6, the same mutation→H7, .xlsx sheet not written→H9, .xlsx stored not compressed→H10)
§PDFHIST-VERDICT PASS judged=57 failed=0
§PDFHIST-OPEN state=ok entries=2 cells=144 differ=0 pages=1 continued=true                                   (the page, the downloaded file reopened)
§PDFWR-HISTORY entries=3 ops=1 cell=D28 before=40392.44 after=40393.44 typedOverFormula=true                 (entry 3 chained to the carried entry 2)
§PDFHIST-STORY cell=D10 sheet="Report" values=2 text="#1 2026-11-27 09:14 report-reader: (empty) -> 498.09 | #2 2026-11-27 09:14 you: 498.09 -> 499.09"
§PDFHIST-SAVE ok=true entries=3 lineBytes=15744 bytesIn=77069 bytesOut=77210 added=141 replaced=true        (second download: replaced in place)
§PDFHIST-OPEN state=broken entries=3 brokenAt=2 why="payload (a recorded cell value was edited)" continued=false
§PDFWR-HISTORY entries=1 ops=145 genesis=true page=1 afterBreak=true
§PDFHIST-OPEN state=mismatch entries=3 cells=144 differ=1 pages=1 kind=changed-outside first=D12 printed=15816.66 history=15815.66 continued=false
§PDFHP-VERDICT PASS judged=19 failed=0
```
Regression, same tree (after #3482): `§PDFWR-VERDICT PASS judged=67` (6/6) · `§PDFWP-VERDICT PASS judged=22` · `§PDFPG-VERDICT PASS judged=17` ·
`§PDFED-VERDICT PASS judged=13` (3/3) · `§SREAD-VERDICT PASS judged=38` (8/8) · `npx eslint pdf` exit 0.

- **H1/H2:** from the saved bytes alone the 3 lines come back equal, accepted by `SheetHistory.verify` and `ws_kernel.verifyJournal`; 144 of
  144 cells bound. A second session with only those bytes records nothing on Read as sheet and its edit is seq 4 with `prev` = entry 3's
  hash; the second save holds ONE embedded file, ONE file specification and the same 33 objects.
- **H3 (independent):** `pdfdetach -list` names `_door_history.jsonl`; `pdfdetach -save` gives the 15,744 bytes of the lines; `pdfinfo` clean,
  1 page; `pdftotext -raw` and every `-bbox` word box identical to the same save without history.
- **H4:** history-only save of the unedited file: the content stream (object 5, 28,097 bytes as an object) byte-identical; exactly ONE of the 31 objects
  differs (object 2, the `/Names` dictionary: the catalog itself is untouched); 2 new objects; one revision; the stream inflates (node
  zlib) to the lines; the same lines saved twice, or saved again into the saved file, give the same bytes; poppler raster 0 pixels differ.
- **H5-H7:** a value changed in the carried history (by the witness's own deflate and cross-reference table) → `broken`, entry 2,
  payload; an entry removed → entry 2, prev-hash; a number rewritten without recording → `mismatch / changed-outside`, D12 with both
  values, 1 of 144; the sales register's verifying history in the trial balance → `mismatch / other-file`. None is continued; the next
  recording is a genesis (seq 1) whose `_door_break!A1` says what was found, and that restarted history travels and re-binds too.
- **H8:** 6 of 6 corpus PDFs as shipped: `none`, no word of tampering. 6 of 6 given a history open with the same pages, text, outline
  and text items as without it; poppler agrees. The 12-page report (catalog without `/Names`, 735 objects) takes the catalog path.
- **H9:** the .xlsx read back and handed to `host_shim.js`'s own reader: Check history OK with 3 entries, Cell history of D10 = 2 values;
  the sheet is very hidden; with a 1,000-character limit 17 chunks, none over it, rows re-joined equal the lines; a changed digit in the
  second chunk of the split genesis → BROKEN at entry 1, in row 2 → BROKEN at entry 2.
- **H11:** a ghostscript two-page copy (other catalog, `/Length` by reference): ONE chain of 4 entries over two sheets (`Report`,
  `Report p2`), 288 of 288 cells bound after reopening; a number changed on page 2 without recording is named "D28 on page 2".
- **The page:** real file chooser and real downloads. The file ON DISK carries the lines (poppler and node agree); opened again it is
  taken up, Read as sheet adds no genesis, the next edit chains; a cell's story is shown typed or by a click; the second download
  replaces the history inside; the .xlsx verifies through the menu's reader; a hand-edited history and an outside-edited PDF are named
  in words in the warning colour; a plain PDF afterwards shows nothing left over; with the network OFF the page still takes a history up.

**Findings:**
1. **The owner was right, with numbers: it is cheap in the PDF.** The genesis of 144 cells is a 14,586-byte line but adds 1,972 bytes to
   the 74,945-byte PDF (2.6%, 13.7 bytes per cell, Flate); a later entry adds 137-147 bytes. Small sheets cost more per cell (57.8).
2. **It was NOT cheap in the .xlsx until measured.** SheetJS writes "stored" by default and each `"` becomes `&quot;`: two lines of
   15,048 bytes made the .xlsx 31,794 bytes larger. With deflate (#3482) three lines of 15,744 bytes add 7,568; the whole workbook
   fell from 54,802 to 25,258 bytes. Still about four times the PDF's cost for the same lines.
3. **The kernel's verifier alone would not have caught H5's tamper.** `ws_kernel.verifyJournal` re-derives the chain, not the payload:
   on a changed "value before" it says ok=true (run, not read), and a "before" value never shows in a replay, so the binding check is
   blind to it too. Only `SheetHistory.verify`'s payload digest names it. Both are run; the S9 one decides.
4. **PDFKit's files already have `/Names` as an object of its own**, so the catalog is not even rewritten there; ghostscript's and the
   12-page report's catalog is. Both paths are judged. The header moves from 1.3 to 1.4 (one byte), which `pdfinfo` reports.
5. **A break can only be recorded as a cell.** S9 fixes an entry's `meta` and does not hash `at`, so the note lives in `_door_break!A1`
   (digest-protected). Side effect, not judged: the Excel menu's Stamp sees only visible sheets and would record that cell (and any
   second page's sheet) as cleared.
6. **Witness defect found by its own failing check:** H9's tamper first aimed at row 2, column B, which does not exist (entry 2 is one
   chunk), so the "tampered" sheet verified. It now changes a chunk that is there, in two places, and names both entries.
7. **Ship:** #3481 merged with its head equal to the local commit (nothing orphaned); the compression change went on a fresh branch.

**Not proven (stated, not hidden):**
- **Removal and roll-back are invisible from the file alone.** A PDF whose attachment was deleted opens as "no history yet"; a history cut
  back to an earlier entry together with the numbers put back verifies and binds. Detecting either needs an anchor outside the file (a
  signed head, the kernel's W-SIGN, or a filed copy): not in this cut. "Who" is a name, and `at` is not in the hash (S9 as built).
- **The binding covers the cells the reader reads, not every byte:** text outside the table, images and layout can change unseen; a
  page the reader cannot read as a table carries no binding at all.
- Paths no corpus file exercises: `xref-stream` files (the history cannot be put in; said in words, the PDF handed back without it:
  coded, not witnessed), a name tree with `/Kids`, a file that already holds OTHER attachments, an inline `/Names` dictionary.
- Two pages: judged on one ghostscript copy in node only; on the page, and the .xlsx of a page after the first (sheet `Report pN`): coded, not witnessed.
- Viewers: poppler and pdf.js only. Acrobat's, Preview's and Chrome's attachment panels were not judged. Real Excel was not run:
  the .xlsx is judged through `host_shim.js` on a stand-in host (as §8.3 of the sister file).
- Merging two downloaded copies (`SheetHistory.merge`) is not wired; the witnesses are not wired into CI; the story's times are UTC.
