# ⚠ DO NOT REMOVE
Scope: storyboard + narration for **Film 3 — "Your Excel, your design"** (NinjaExcel report engine). SPEC ONLY until red1 says go to record. **Read the log after every run.** Every spoken number must come from a `§…` line of a real run (no invented values). GardenWorld data only. Audience: accountants / report authors (user, 2026-10-14). Recorder to write: `scripts/film_ninja_excel.js` pattern per `prompts/FILM_NARRATION.md ## ▶ PLAYBOOK`. English first. No bake beside a live user tab.

**Why this film (user, 2026-10-14):** film 2 ("report grows as you sell") is "a bit tame"; this is more what the pitch should be. Point to land: *Excel is the killer app — here is where we reuse it and integrate it, with nothing new to learn.* Do not name or disparage other tools in the track (no tested comparison exists); the claim is only what the witnesses prove.

**Assets (made 2026-10-14, `~/Projects/ninja-template-data/showcase/`):** `showcase_template.xlsx` (built by `scripts/ninja_template/MakeShowcase.js`), `showcase_output.xlsx`, `showcase_output.pdf`. Input cells are real Excel links (`=Process!A9`), not typed text.
Facts already measured: `§TWIN_RUN statements=5 addressLines=31`; `§CALC Output formulas=8 errors=0`; `§PDF_RENDER page=696.75x519.75`; `§PDF_CONTENT cells=57 missingFromPdf=0`; KPI 48 / 2,361.14 / 2,606.27; grid 4x3 with 5 filled, 7 empty (`§XTAB2_VERDICT PASS cells=12 diffs=0`, same engine path).

**Positioning line (user, 2026-10-14):** *"mine is more domain specific, embedded rather than a 3rd party integration."* Say it as what it is, from the repo: the engine is inside the ERP kernel, reads the ERP's own ledger through the dictionary, scopes every statement to the company, and arrives as a plug-in extension — no connector, no separate server, no second tool to learn. Claims about other products stay out of the track (not tested).

## How the machine works (verified in `build/erp/ninja_template.js`: `clean` L95, `setAddress` L117, `paint`, `plusMatrix`)
1. **BACKUP is the design.** Each run the Output sheet is thrown away and re-cloned from BACKUP (so never type in Output). Colours, bands, boxes, merges, number formats, formulas all live here.
2. **Process sheet = the rules.** One row per question. Columns: ANNOTATION · ROW · SELECT · TABLE · JOIN · WHERE · ADDRESS · Direction · VALUES.
   - ROW is `=ROW()`. ANNOTATION is the formula `=CONCATENATE("@",C2,"@",B2)` → the SELECT text wrapped in `@…@` plus its row number, e.g. `@count(*)@4`. That text is the row's unique name.
   - A row with no TABLE continues the statement above it (11 rows → 5 SQL statements).
   - Direction says where the answer goes: `S` one value into one cell · `V` a list downward · `>` a list to the right · `C10+B12` a two-way grid (x-axis row at C10, y-axis row at B12).
3. **Input sheet = where the answers land, wired by Excel links.** In the cell where a number should appear, type `=Process!A4` — a plain Excel link. The cell now *displays* that row's name `@count(*)@4`. Nothing else to configure.
4. **The run:** (a) clear ADDRESS and VALUES, rebuild Output from BACKUP; (b) for every Process row find the Input cell whose text equals the row's annotation and write that cell's address into ADDRESS (`§… Address is …` log lines: 31 for this template); (c) assemble the SQL from the rows, add the dates `#1`/`#2` and the company scope, run it; (d) paint each result at its ADDRESS in Output by Direction; (e) Excel formulas (totals) are recalculated; (f) own PDF renderer writes the page.
5. **Why links matter (the beat to dwell on):** move the cell in Input and the ADDRESS follows on the next run; reword a SELECT in Process and the Input cell updates itself (it is a link); no cell coordinates are typed anywhere by hand. Mismatch = the cell stays blank (found live while building this template: a mistyped tag painted nothing, silently → candidate for the template pre-flight check).

## Storyboard (silent video + dialogue F: = asks, M: = explains)
| # | beat | on screen | spoken facts from |
|---|---|---|---|
| 0 | hook | the finished PDF alone, 3 s | `§PDF_RENDER page=` |
| 1 | the designer | BACKUP sheet: title band, KPI boxes, zebra grid, totals, signature boxes — "this is Excel, you already know it" | count of merges/fills read from the file (`§FILM3_FACT design.merges= fills=`) |
| 2 | the rules | Process sheet, row by row: annotation formula, SELECT/TABLE/WHERE, Direction codes | `§FILM3_FACT process.rows=11 statements=5` |
| 3 | the link | click Input!B7: formula bar shows `=Process!A4`; cell displays `@count(*)@4`; then show Process!A4 is the CONCATENATE | formula text read from the file |
| 4 | edit proof (no-repeat-typing) | change a Process WHERE (one account) → Input needs no change → re-run → grid changes | before/after `§FILM3_FACT` of the changed cell |
| 5 | run | Excel Report pill, dates 01/12/2006–31/12/2006 | `§TWIN_RUN statements=5 addressLines=31 ms=` |
| 6 | where each part came from | PDF regions highlighted one by one: org band ← client table; period ← the two dates; KPI boxes ← three SQL values; grid ← the `C10+B12` rule; totals ← Excel SUM | KPI 48 / 2,361.14 / 2,606.27; grid 5 filled / 7 empty |
| 7 | the empty cells | "no posting, so blank — not a made-up zero" | `§XTAB2 empty=7` |
| 8 | trust | grid equals an independent SQL check; every printed cell present in the PDF | `§XTAB2_VERDICT PASS cells=12 diffs=0`; `§PDF_CONTENT missingFromPdf=0` |
| 9 | close | "Your Excel. Your design. Our data." | — |

## Before recording (all CPU, no GPU)
- [ ] Beat 4 needs a witnessed second run (edited WHERE) → add `W38_ShowcaseEdit.js` first; the beat is cut if it does not PASS.
- [ ] `§FILM3_FACT` emitter (design counts, process rows, link formula text) so every number has a line.
- [ ] Decide `318.0` labels (twin has no `ad_table`; cosmetic — either fix in the template with a dictionary-derived name or leave and say "source table id").
- [ ] Sheets shown as images rendered by our own code (not a live Excel window) — red1 to confirm.
- [ ] Narration: write EN dialogue TSV in `prompts/ninjaexcel_series/` (film2 format), voices per PLAYBOOK; witness the track.

## ▶ RESULT (2026-10-14, v2 after red1's screenshot) — raw + English narrated film built
Files: `~/Videos/NinjaExcelReport_film/film3/NinjaExcel_designer_EN.mp4` (4:29), `_raw.mp4`, `film3.log` (all `§FILM3_*`), `film3_en.tsv`, `f3.fit.log`. Index folder: `~/Projects/NinjaExcel/`. Recorder `scripts/film_ninja_designer.js` (+ `scripts/film_sheet_html.js`), TSV builder `prompts/ninjaexcel_series/film3_make_tsv.js` (aborts if a spoken number differs from its `§FILM3_FACT`).
**v2 changes (user, 2026-10-14):** the Process sheet was cut off on the right (ADDRESS / Direction / VALUES not visible) -> widths fixed, sheet pans right; new beat `cross` = the killer feature Direction `Add1+Add2` (`C10+B12`): x-axis address, y-axis address, the grid they build; run beat now shows the Process sheet AFTER the run (ADDRESS found through Input links; VALUES = white boxes = the exact values each SQL returned). Process view is Excel-light so VALUES boxes are white like the real sheet.
Re-record: `BEAT_SCALE='{"design":1.75,"rules":2.5,"cross":1.8,"link":2.4,"sources":2.1,"run":1.3,"edit":1.0}' BEAT_MIN='{"hook":7,"empty":8,"edit":21,"trust":15,"close":6}' RING_PRE='{"a merged":1.6,"SELECT":1.6}' RING_POST='{"three boxes ←":5.5,"ADDRESS":2.2,"VALUES":2.6}' node scripts/film_ninja_designer.js <outDir>`, then `node prompts/ninjaexcel_series/film3_make_tsv.js <outDir>/film3.log > film3_en.tsv`, then PLAYBOOK steps 3-5.
Witness: `§FILM3_RINGS 30 ok=30` (every highlighted cell lies inside the visible area — a clipped cell fails the run); `§FILM3_FIT screens=12 clipped=0` (no screen's panels extend past the frame); `§NARR_FIT` 36/36 DETAIL, 0 SKIP, 0 `WRONG` tone; frames raw 6468 = narrated 6468; I = -17.1 LUFS; longest silence 4.7 s; 15 spoken numbers checked against `§FILM3_FACT`.
**Not in the film:** the Excel Report pill inside the ERP (port to bim-ootb not done) — the run beat shows the engine's real log. No Jasper/PALO/PivotTable comparison (untested). Sheets are rendered by our own code from the real files, not a live Excel window. The `318.0` table labels appear as-is.
Open: other languages; a native-listener check; the pill-in-ERP version once ported.
