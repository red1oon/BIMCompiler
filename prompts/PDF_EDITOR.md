# ⚠ DO NOT REMOVE — PDF EDITOR: a pure, browser-native PDF editor, clean-room, zero install
# Scope: a full PDF editor (view, organise, annotate, forms, edit text, redact, OCR, compare, export, secure, sign) that runs
# in any browser, offline, the file never leaving the device. Spec first, witness first, EXTRACT ONLY. READ THE LOG after every
# run (§PDFED-* lines); the exit code is not evidence. Code will live in bim-ootb (`pdf/` page + engine); this file is the lane record.

## ▶ RESUME HERE (2026-11-27) — call sign **'resume killer'**: start at the ▶▶ block of `prompts/SHEET_FRONT_DOOR.md` (one package, build order)
- **P0 VIEW DONE (witness) 2026-11-27** with the S10 report reader: bim-ootb `pdf/` (PR #3470), results §4.2. **1 of 14 groups** (G1) is in part at parity:
  open, pages on demand, find, outline, password and damaged files; NOT yet: the 5 view modes, tabs, split panes, clickable links.
- **Next = P4 cut narrow** (below), then P1 organise.
- P4 is cut narrow first: **numbers only**, written back into the box the source map names (no reflow; a digit missing from the embedded subset → stated substitution).
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
