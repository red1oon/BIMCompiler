# ⚠ DO NOT REMOVE
Scope: the JS port of the legacy NinjaExcel / ExpenseReport plugin (an XLS template with Input / Process / Output / BACKUP sheets → SQL → painted Output → PDF) and the witnesses that judge it against the **real legacy plugin's output**. **Read the log after every run** — exit code is not evidence. Spec-first. No invented values. Customer templates are never committed (see *Privacy*).

Legacy plugin source (public): https://sourceforge.net/projects/red1/files/ModuleCreator/ (`CustomisedReport.java`, `ExpenseReportMaker_*.jar`).
Cardinal rule (prompts/SQLiteIDEMPIERE.md): the SQLite twin must equal legacy — same results, same books, same look & feel. A difference is fixed on the twin side; it is never "accepted".

## What exists
| file | role |
|---|---|
| `build/erp/ninja_template.js` | engine: parity port of the legacy `clean / setAddress / makeFullSQLStatement / set / paint` (directions `S` `V` `>` `+`, row/column insertion with formula shifting, BACKUP→Output clone), PG-dialect adapter + dictionary-typed SQLite executor |
| `build/erp/ninja_template_xlsx.js` | styles-aware `.xlsx` host (ExcelJS): fonts, fills, borders, number formats, merges, widths, heights survive |
| `build/erp/ninja_calc.js` | formula evaluator (arithmetic, SUM, COUNT(A), MIN/MAX, ABS, ROUND, ROW, IF, CONCATENATE; unsupported → `#NAME?`, never a silent 0) |
| `build/erp/ninja_pdf.js` | own Excel→PDF renderer (pdfkit), replaces the commercial PDF converter |
| `scripts/ninja_template/` | witnesses, fixtures, frozen goldens, `run_all.sh` |
`ninja_excel.js` (the read-only RUN verb behind the "Excel Report" pill) is untouched; unify the two before they drift.

## ▶ RESUME HERE (rewritten 2026-10-13 at session close, after the user's correction — start with this block)
**What this is, and what it is NOT (user, 2026-10-13):** this is the user's OWN add-on — the *reporting* NinjaExcel (Excel template → SQL → painted report; the "Excel Report" pill, `ninja_excel.js`, spec `internal/NinjaExcelAdaptation.md`, bim-ootb #279/#282). It is **not** a conventional iDempiere process. The parallel-run / oracle lane (`prompts/SQLiteIDEMPIERE.md`, `scripts/bridge/run_all.sh`, another session) owns parity for *conventional* iDempiere processes (docs, posting, costing, period close …). **Do not extend a second parity framework here, and do not duplicate that lane.** `scripts/ninja_template/run_all.sh` stays as this add-on's own regression suite (19 gates on public fixtures, no Postgres/legacy server) — it is finished; treat it as a safety net, not the next task. If a legacy-oracle comparison of the add-on is ever wanted *inside* the bridge, add it there as ONE scenario using the bridge's stock-WebService `run_process` pattern, and **ask the session working that lane first** (`ListAgents`; do not edit `scripts/bridge/` blind).
Do not confuse with the *authoring* Ninja (`prompts/NINJA_MODE_LANE.md`: Excel defines a MODEL → AD tables → `.foldbundle`; shipped, PR #301). Different concern; reuse only sheet reading.

**State:** PR #175 (draft, `ninja-template-generic`) holds the engine, styles-aware xlsx host, formula evaluator, own PDF renderer and the witnesses; nothing deployed; `deploy/live` untouched. Known gaps: *Honest limits*.

**Next, in order:**
1. **Port into bim-ootb as the RUN verb of the NinjaExcel pill** (zero host code beyond the pill — AD-LAYER LAW §6: the add-on arrives like any extension). Fresh worktree off `origin/main` (`git worktree list` first; `~/bim-ootb` is a shared checkout, synced 2026-10-13). Add `exceljs` and `pdfkit` (≤0.15, CJS) to bim-ootb `package.json`; engine under `erp/`; `build/erp/` stays source of truth. **Unify with `ninja_excel.js`** — one engine per responsibility (its read-only scalar RUN and gate are a subset of the template grammar).
2. **FILM — narrate the steps (new, user 2026-10-13).** Read `prompts/FILM_NARRATION.md` `## ▶ PLAYBOOK` first, then `§5 §ERP-FILM` (headless-browser recorder pattern: `scripts/film_erp_first_setup.js`, CPU only, CDP screencast → 24 fps mp4, `§ERP_FILM_BEAT` / `§ERP_FILM_FACT` / `§ERP_FILM_DONE`, English first, Kokoro voices). **Rules that bind:** plan first, build only after red1 approves the plan; every spoken number must have a `§…_FACT` line from a real run (no invented numbers); a witness proves the track, not a listen-through; no bake beside a live user tab; **use only generic GardenWorld material — never a customer template.**
   ⛔ **Ask red1 first (one question, undecidable from the repo):** is the film for *users* ("how to get a formatted report out of an Excel template") or for *developers* ("how the engine was built and proven")? Draft for the user film — beats and the log line that supplies each number:
   | beat | on screen | spoken numbers come from |
   |---|---|---|
   | 1 template | the accountant's Excel: Input / Process / Output / BACKUP, layout owned by the user | template fixture (sheet + Process-row counts) |
   | 2 run | ERP → Excel Report pill → pick template + dates | — |
   | 3 painted | Output filled from the live in-browser DB, rows inserted, formulas recalculated | `§TWIN_RUN statements= addressLines= ms=` |
   | 4 formatting intact | fonts, fills, borders, number formats, merges kept | `W32 §GOLDEN_STYLE cells= mismatches={}` |
   | 5 PDF | one page, no commercial converter | `§PDF_RENDER page= range=` + `W36 §PDF_CONTENT missingFromPdf=0` |
   | 6 trust | same as the original plugin, cell for cell | `W30 §CELL_PARITY cells= diffs=0` (one beat, brief) |
   Needs a human-friendly generic demo template (e.g. a GardenWorld trial-balance / account list with totals) — build it as a new fixture in `scripts/ninja_template/` (`MakeParity*.java` pattern), witnessed before it is filmed. Recorder to write: `scripts/film_ninja_excel.js` (copy the §ERP-FILM structure). A developer-audience film would instead walk: oracle → engine → host → PDF, numbers from `scripts/ninja_template/logs/`.
3. **Calibrate the PDF column-width profile** — needs 2–3 PDFs produced by the customer's own server with its converter + the Lao font files (cannot be extracted from the repo). Until then profile `excel` is the default; `spire-local` only reproduces the build host.
4. **Unwitnessed features** (list in *Honest limits*) — add a fixture per feature BEFORE claiming support. Optional: pinned deviation D2.
**Lessons worth keeping:** (a) when cloning an iDempiere server dir, grep it for the ORIGINAL path before the first start — `utils/myEnvironment.sh` hard-codes `IDEMPIERE_HOME`, so the clone silently ran against the pilot database and its 2Pack wrote rows there (reverted, never repeat); (b) SheetJS CE cannot write `.xls` formulas and drops fonts/fills/borders — use ExcelJS for `.xlsx`; (c) a green witness over a fixture that never exercises the path is vacuous — read the oracle log for the feature's own marker line before trusting PASS; (d) CI `system-is-real` (browser `test_all.js`) was already red on `master`, unrelated; (e) the repo is PUBLIC — never commit customer templates, goldens or schema (they live in `$NT_PRIVATE`).
**Private context** (never in git): `$NT_PRIVATE` (default `~/Projects/ninja-template-data/private`) — `cases.txt`, `golden/`, `env.sh`, the full 16-section debug log and its own `RESUME.md`.

## Run the gates
`scripts/ninja_template/run_all.sh` — default run needs **no Postgres and no legacy server** (frozen text goldens of the legacy plugin's output in `golden/`). `PG=1` adds live-Postgres statement comparisons. Inputs live under `$NT_DATA` (default `~/Projects/ninja-template-data`): source templates, migrated `.xlsx` templates, the twin snapshot db (`pg_to_sqlite.py`). Public cases = the GardenWorld fixtures built by `MakeParity*.java`. Verdict lines: `PASS` / `FAIL` / `INCONCLUSIVE` (a witness that judged nothing says so). Every positive gate has a negative control that must FAIL.

## Measured results (fixtures over real GardenWorld rows; legacy plugin run on a local iDempiere clone as oracle)
- **Engine:** cells + log identical to the legacy plugin on all fixtures (e.g. 1,427 cells / 1,361 log lines on the row+column-insertion fixture); scale-blind executor fails as it should.
- **SQLite twin:** the PG-dialect statements run; `NUMERIC` scale is reproduced from dictionary side tables so the legacy `[0.00] ⇒ "returns nothing"` rule behaves identically (Java sees `BigDecimal` scale, SQLite REAL does not — closed with the twin's own `bigdecimal.js`).
- **Formatting:** `.xls`→`.xlsx` template migration (`Xls2Xlsx.java`, POI) keeps fonts/fills/borders/formats/merges/widths/heights; twin output vs the legacy output: 50,600 cells, 0 style differences (two-way). Library quirks caught and gated: ExcelJS stamps the merge-master style onto merged cells, leaves stale cell styles after row removal, rewrites the default font.
- **PDF (own renderer) vs the commercial converter's output (reference geometry goldens):** page = (36 + Σcol + 36) × (72 + Σrow + 72) pt (one page, not A4); row px = floor(pt·96/72); text inset 2 pt; thin border = hairline, medium 2 pt, double = two 1.334 pt lines + white gap. Small fixtures PASS; the 200×204 fixture matches page size, fills and 1,134/1,134 words; **known deviation D2, pinned (21+4 of 622 edge runs: the reference omits some shared vertical borders; the "neighbour decides" hypothesis was tested and rejected)**.
- **PDF content without a reference:** every visible cell's text must appear in the extracted PDF text (caught a real bug: a Lao-script font without ASCII punctuation silently dropped `/ . ( ) •` → per-run font fallback).

## Honest limits
Customer templates return little data on a GardenWorld clone, so they are weak evidence; the strong evidence is the fixtures. The reference converter's column-width rule is host-font dependent (profiles `excel` / `spire-local`); a reference PDF from the customer's own server is needed to calibrate. Fonts for Lao script are stand-ins. Not witnessed: two-axis cross-tab, `#?` statements, `[C8]` tags, date bracket values, images, formula shifting beyond simple relative refs/ranges. No page breaks (one page per sheet, as the legacy flow). `exceljs` / `pdfkit` are not yet in `package.json`.

## Maintainability verdict — the JS version is easier to maintain, on conditions
580 + 104 lines vs 1,258 for the Java class (not like for like: no image code yet); one command / ~45 s vs an OSGi bundle on a running server; every behaviour pinned by an oracle. Counter-weights: it re-implements POI semantics and wraps two libraries with real quirks (contained in the 104-line host and gated). Conditions: keep goldens as text; extend `run_all.sh` for every new function; claim nothing unwitnessed; keep one engine.

## Privacy
Customer templates, their goldens, schema stand-ins and the legacy fork builder are **private**: `$NT_PRIVATE` (default `$NT_DATA/private`: `cases.txt`, `golden/`, `env.sh`) — optional, never committed. `run_all.sh` picks private cases up automatically when present.
