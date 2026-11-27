# ⚠ DO NOT REMOVE — PDF EDITOR: a pure, browser-native PDF editor, clean-room, zero install
# Scope: a full PDF editor (view, organise, annotate, forms, edit text, redact, OCR, compare, export, secure, sign) that runs
# in any browser, offline, the file never leaving the device. Spec first, witness first, EXTRACT ONLY. READ THE LOG after every
# run (§PDFED-* lines); the exit code is not evidence. Code will live in bim-ootb (`pdf/` page + engine); this file is the lane record.

## ▶ RESUME HERE (2026-11-27) — call sign **'resume killer'**: start at the ▶▶ block of `prompts/SHEET_FRONT_DOOR.md` (one package, build order)
- **Spec only.** Nothing built. Next = phase P0 (§4) together with the S10 report reader: a bare `pdf/` page on the already-shipped pdf.js, witness W-PDFED-P0.
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
