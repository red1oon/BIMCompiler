# NinjaExcel Report — manual section to merge: "The designer's view" (drafted 2026-10-14)
*Ready to paste into `docs/NinjaExcelReport_UserManual.md` by the docs session (branch `docs/ninja-excel-report-manual`). Every claim names its witness; the film is "Your Excel, your design" (EN/TH, `~/Videos/NinjaExcelReport_film/film3/`).*

## How a cell knows where its answer goes — the Excel link
In **Input**, the cell where a number should appear holds a plain Excel link, for example `=Process!A4`. The cell then *shows the rule's name*: the rule's SELECT text between `@` signs plus its row number, e.g. `@count(*)@4`. Column A of **Process** builds that name with a formula, `=CONCATENATE("@",C4,"@",B4)`. On every run the engine finds the Input cell whose text equals the rule's name and writes that cell's address into Process column **ADDRESS** (G). Nothing is typed twice: reword a rule and the Input cell follows; move the cell and the address follows on the next run.
[`showcase` template; `W47_Replay` re-derives 49/49 and 55/55 saved addresses of two real workbooks from their Input links]

## Direction: where the answer goes
| Direction | Meaning |
|---|---|
| `S` | one value into one cell |
| `V` | a list downward (new rows are inserted, formulas below shift) |
| `>` | a list to the right |
| `Add1+Add2` e.g. `C10+B12` | **a whole grid.** The first address (`C10`, an `>` row) says where the *accounts* start and they run across; the second (`B12`, a `V` row) says where the *source tables* start and they run down; each answer lands where its account and its table cross. Empty where nothing was posted — never a made-up zero. |
[`W44_Xtab2`: 12 grid cells equal an independent SQL sum for each (account, table) pair; negative control fails]

## VALUES = the proof
After a run the **Process** sheet shows its work: **ADDRESS** (where each answer went) and **VALUES** (the exact values each SQL returned), in cells that copy the look of the Output cell they fed. Read it to see what each query dumped.
[`W47_Replay`: replaying the saved VALUES of the Laos `MOES_sofp` / `MOES_cashflow` workbooks regenerates every saved Output cell — 152/152 and 173/173; this does **not** test the SQL itself]

## What the engine now refuses (template check and read-only guard)
| You did | You get |
|---|---|
| mistyped an Input tag so it matches no Process row | `TEMPLATE CHECK FAILED: UNMATCHED_TAG Input!B2 "@…@99" matches no Process row annotation - the cell would stay blank` (before: a silent blank cell) |
| left Direction empty on a linked row, or a sheet is missing | `EMPTY_DIRECTION …` / `SHEET_MISSING …` |
| hand-edited a formula in Output (same size as BACKUP) | warning `BACKUP_DRIFT … make layout changes in BACKUP only` — Output is rebuilt from BACKUP every run. (When rows were inserted by an earlier run the sheets differ legitimately and the warning is `DRIFT_NOT_CHECKABLE`.) |
| put anything but one SELECT in Process | `§SQL_REFUSED only SELECT is allowed in a template` |
Every run logs `§PREFLIGHT … §PREFLIGHT_SUMMARY errors= warnings=`.
[`W45_Preflight` 11 cases incl. negatives; `W48_PillPreflight` the same refusals inside the real ERP page — **only on the branch `ninja-pill-sync`, not yet in the live pill**]

## Planned (not built — do not state as fact)
Template grammar versioning ("v1"); dictionary-derived NUMERIC scale in the browser; a legacy-server parity run of the Laos reports (awaiting test-server access).
