# ⚠ DO NOT REMOVE
Scope: debug the legacy NinjaExcel / ExpenseReport plugin (`CustomisedReport_<client>`, XLS template → SQL → XLS/PDF) on the Laos client.
**Read the log after every run.** Exit code is not evidence. Spec before code. No invented values.
Source files: `~/Projects/LaosExpenseReport/source/` (customreport.txt = Java, excelreportlog.txt = iDempiere log, MOES_cashflow.xls = template).
Cannot run on vanilla iDempiere (Laos client AD_Client_ID=1000018, custom tables `LA_SourceFund`, view `v_docno`). Debug = read code + log, then witness on a stub.
⚠ customreport.txt line ~143 embeds a Spire licence key in plain text. Do not copy it into any doc/commit; rotate it.

## Prior art
No earlier prompt covers this (grep of prompts/ docs/, 2026-10-12). Related: `prompts/archive/NINJA_MODE_LANE.md`, Ninja source `~/Projects/org.idempiere.ninja` (`ExcelValidator`, `DynamicExcelTest`). The earlier "leak repair" was not found in any prompt: locate it before re-fixing (`git log -S` in the ninja repos).

## Measured from excelreportlog.txt (1122 lines, 09:26 → 13:16 = 3h50 span, several runs)
| # | Symptom | Evidence (line) |
|---|---|---|
| L1 | Hikari "Apparent connection leak" ×3 (09:26, 11:35, 13:16) | 82, 806, 1010; stack = `DB.getSQLArrayObjectsEx` ← `executeSQL` |
| L2 | `whiteband.png` FileNotFound, hardcoded `/home/nakarat/Documents/<client>/` (5 clients) | 19,155,499,588,897; `doPDF` :1340 |
| L3 | XLS template truncated: `Unable to read 512 bytes from 131584 in stream of length 131072` | 527; `HSSFWorkbook(file)` :149 |
| L4 | 34 of 34 SQLs `RETURNS NOTHING` in one run | 572-586 |
| L5 | `gl_journal_docno` duplicate key (documentno has Lao text) | 284 |
| L6 | WF `Update return 0 instead of 1` | 217-240 |
| L7 | 463 "Address is" lines + 29 CROSS TAB CANVAS lines = per-cell stdout logging | whole log |

## Hypotheses (UNVERIFIED — each needs a witness before a fix)
- H1 stall = one `DB.getSQLArrayObjectsEx` per cell/crosstab block (N+1) + stdout spam. Prove: add `§SQL_COUNT`/`§SQL_MS` per block; sum ms.
- H2 leak = `getSQLArrayObjectsEx(get_TrxName(),…)` opens a connection held >Hikari leak threshold because the process runs minutes. Same root as H1. Leak is a symptom of the stall.
- H3 `FileInputStream file` at :148 never closed (workbookClose closes wb only on one path :186). Check all exit paths incl. exceptions.
- H4 L4: `a.dateacct >= TO_DATE('2026-05-01…','YYYY-01-01')` — format string `YYYY-01-01` on a full timestamp looks wrong; and `BETWEEN … '2026-05-30'` drops 31 May. Verify against the template parameter, don't assume.
- H5 L3 is a bad upload/save of the XLS (file cut at 128 KB boundary), not a code bug. Check the 142,336-byte MOES_cashflow.xls opens in POI.

## Plan (witness-first)
1. W-XLS-OPEN: open MOES_cashflow.xls with POI HSSF; assert sheet/cell count (§XLS_CELLS). Proves/disproves H5.
2. W-SQL-COUNT: parse template's `@…@` tags (customreport.txt header lines 60-90 describe grammar) → count SQL statements the run will issue. Proves H1 offline, no DB.
3. W-LEAK: stub DB (SQLite/H2) + same `executeSQL`; run with Hikari leakDetectionThreshold; assert zero leak. Then batch per-block queries and re-assert.
4. W-DATE: render SQL for the May-2026 params; assert range = 1 May..31 May inclusive.
5. Fix in order: H3 (close), H1/H2 (batch/ cache), H4, L2 (path from AD_SysConfig, not hardcoded), L7 (log level).
Done = each row L1-L7 has a `§` line showing before/after. Mark `✅ DONE (witness)` here.

## RESULTS 2026-10-12 (witnesses in `~/Projects/LaosExpenseReport/witness/`, logs W1-W3.log)
- **W1 ✅** `MOES_cashflow.xls` opens in POI: 5 sheets (Input, Process, Reference, Output, BACKUP), 0 error cells, 0 #REF. File size 142,336 (mod 512 = 0). **H5 disproved for THIS file.** The L3 crash (stream 131,072) was a different, cut-off copy.
- **L3 root cause FOUND in code (customreport.txt:148 read, :1186 write):** the engine opens the template from `File_Directory` and **writes the result back to the same path** (`workbookWrite`). Template is overwritten each run; a crash/kill mid-write, or two users running at once, leaves a truncated XLS → next run dies `Block 256 not found`. Also `FileInputStream file` (:148) is never closed.
- **W2/W3 ✅** Process sheet = 58 SQL rows → ≥58 statements per run; only 45 distinct, **13 identical repeats** (rows 52/61/82/103 ×4, 67/70/76/79/97/100 ×6, …). 13 more statements have no output address (rows 6,53,54,57,64,66,69,75,78,87,90,96,99 — result goes nowhere). Each is a full fact_acct SUM+JOIN on the client. Offline minimum 58 vs 45 needed = 22% wasted; stall time itself NOT measured (needs server DB timing, §SQL_MS).
- **H4 not testable here:** `YYYY-01-01` is in neither the Java nor MOES xls — it comes from another client's template (LA_SourceFund report in the log). Need that XLS.
- **Open:** W-LEAK (needs DB stub), L2 path fix, L5/L6 (GL docno dup, WF) are data issues, not template.

## RESULTS 2 — comparison with working `MOES_sofp.xls` (2026-10-12, W5-W8 logs) — CORRECTS RESULTS 1
- **Retraction:** duplicate SQL rows and "no address" rows are NOT the Excel bug: the working sofp has MORE (77 statements, 22 repeats, 38 no-address) and runs clean. They are inefficiency only (and "no address" may be normal: crosstab/V rows). The first REVIEW copy flagged them — replaced.
- **Real Excel defect (W6/W7):** engine does `Output → "Test"`, clones `BACKUP → Output`, deletes old (customreport.txt:269-282). So **BACKUP must equal Output minus data**. sofp: 0 differences. cashflow: **45 formula mismatches + 12 cells only in BACKUP; Output 74 rows vs BACKUP 63**. e.g. E14 Output `=E15+E17+E24+E26` vs BACKUP `=E15+E17+E19+E21`; E32 `=E14-E23`; G36..G46 `=SUM(E:F)` missing in BACKUP. Every run rebuilds from the stale BACKUP → wrong totals / values in wrong rows. Process addresses (54, max row 39) all lie inside BACKUP, so no crash — silent wrong numbers.
- Review copy `~/Projects/LaosExpenseReport/MOES_cashflow_REVIEW.xls`: 57 BACKUP cells red-bordered + REVIEW sheet (0 cells changed vs original).
- **Code defect candidate (not Excel):** nothing validates BACKUP==Output. Add a pre-flight check in `doIt` that logs `§BACKUP_DRIFT n=` and fails fast with the cell list. Also still open: stream :148 not closed, template overwritten in place, 58-77 SQLs/run, connection leak (needs stub DB), stall unmeasured.

## RESULTS 3 — patch written (2026-10-12, after reboot; W9 log `witness/W9.log`)
`~/Projects/LaosExpenseReport/patched/CustomisedReport.java` (diff vs `.orig`: 40 lines, CRLF kept). NOT yet deployed/compiled in iDempiere (no Laos server here).
- **H3 ✅** template `FileInputStream` closed right after `new HSSFWorkbook` (try/finally).
- **L3 ✅(code)** `workbookWrite()` writes `<file>.tmp` then ATOMIC_MOVE → a crash can no longer leave a truncated XLS. Concurrent-run overwrite still open.
- **§BACKUP_DRIFT ✅ (witness W9, same method body)** sofp → `n=0 rows 119/119` PASS; cashflow → `n=45 rows 74/63` fail-fast with first cells `E14 F14 C19 H19…`. Matches W7's 45.
- Still open: W-LEAK (needs DB stub), L2 hardcoded whiteband path, L7 per-cell stdout logging, H4 (needs the other client's XLS), stall unmeasured (§SQL_MS), 22% duplicate SQL.

## RESULTS 4 — SourceForge repo compared (2026-10-12; files in `~/Projects/LaosExpenseReport/sourceforge/`)
Source: https://sourceforge.net/projects/red1/files/ModuleCreator/ — newest `CustomisedReport.java` = 12 Dec 2022 (1213 lines, pkg `org.my.process`, iText7 PDF, no Spire). Also `expensereportmaker.zip` (OSGi plugin src, 26 Nov 2022), `MOESReport.xls`, `ExpenseReportMaker_3.1.0.202210180852.jar`.
- **Laos file = later FORK** (`org.my.process_tvcsap`, `CustomisedReport_tvcsap`, "nakarat 11 Feb 23" edits): Spire PDF + lowagie stamper, col limit 42→255, null-row create, empty-direction check, `processUI.download(xls)`.
- **CORRECTION to L2:** `whiteband.png` is NOT a hardcoded path in code. It is `<dir of File_Directory>/whiteband.png` (fork line ~1239). `/home/nakarat/Documents/<client>/` is just where the template XLS lives. Fix = put the PNG next to the XLS, or skip the stamp when missing (also the `finally` does `stamper.close()` on null → NPE when PdfReader fails).
- **Same defects in upstream (SourceForge) version:** stream `file` (:133) never closed; `workbookWrite` in place; `getSQLArrayObjectsEx(get_TrxName(),…)` (:434) — so the leak/stall are original design, not a Laos-fork regression. No "leak repair" exists in the SF copy.
- Patch (RESULTS 3) applies to the fork; same hunks would apply upstream.

## RESULTS 5 — CORRECTION: Output is NOT proven the right layout (W10, `witness/W10.log`, 2026-10-12)
- RESULTS 2 mislabelled E32: `=E14-E23` is in **BACKUP**; **Output** E32 is a stored number (3.985409E9) and E32 is not a Process address. E23: Output blank, BACKUP `=E24+E26+E28+E30`. E14: Output `=E15+E17+E24+E26`, BACKUP `=E15+E17+E19+E21`.
- E28: Process writes data there, yet Output holds formula `=E29+E35+E39+E41` (BACKUP blank) → Output itself conflicts with Process.
- So neither sheet is demonstrably correct; cannot auto-build a fixed XLS without the accountant's intended cashflow layout (which cells are totals vs SQL data). Candidate-file generation PARKED. `TELL_LAOS_USER.md` step 2 ("copy Output into BACKUP") is therefore unsafe as written — must be reworded to "confirm which sheet is right".

## RESULTS 6 — user's recollection CONFIRMED; docs check (2026-10-12; `witness/W11.log`)
- No written user guide covers BACKUP. Code header says "see notes in FACTACCTREPORT.XLS" (SourceForge copy has sheets Input/Process/Output/**original**, no notes text); `TheBookOfNinja.pdf` is the module-generator book, not the report engine. Only doc = code comment at `clean()`: "clone complete sheet from BACKUP Sheet(4)".
- **Mechanism (code, clean() :269-282): Output is wiped each run and rebuilt from BACKUP → BACKUP is the only template; Output content never matters.** So Output ≠ truth (RESULTS 5 stands, sharpened): the cashflow Output diffs are most likely hand edits made to Output that are discarded every run. That is the Laos fault. BACKUP-vs-Output difference is still the right alarm (`§BACKUP_DRIFT`), but the fix is "redo wanted edits in BACKUP", not "copy Output to BACKUP".
- `TELL_LAOS_USER.md` What-is-wrong / What-to-do REWRITTEN accordingly (unsent).

## SPEC S1 — fatal-op handling with a clear log (2026-10-12; hold on all non-fatal changes still stands)
Rule: a fatal failure must (a) stop the run, (b) print ONE `§REPORT_FATAL` line: phase, file, bytes, SQL#, cause, (c) throw an AdempiereException whose text tells the user what to do. No behaviour change on a healthy run.
| Phase | Failure today | Required message |
|---|---|---|
| LOAD_TEMPLATE | raw POI "Block 256 not found" / "Unable to read 512 bytes" | `§TEMPLATE_UNREADABLE <path> bytes=<n> (<n%512>) — file truncated/corrupt, restore spare copy` ; missing file → `§TEMPLATE_MISSING` |
| CHECK_SHEETS | NPE when Input/Process/Output/BACKUP absent | `§SHEET_MISSING <name> — present: [..]` |
| SQL #n | AdempiereException w/o which Process statement | prefix `§SQL_FAIL statement #n (Process row r)` |
| WRITE | IOException raw | `§WRITE_FAIL <path>` (temp file kept, template untouched) |
| PDF | NPE in finally masks the real error; stack trace only | null-guard; one-line `§PDF_STAMP_SKIPPED <reason>` (non-fatal) |
Witness W12: truncated copy (131072 B) of cashflow → TEMPLATE_UNREADABLE; copy with BACKUP sheet removed → SHEET_MISSING BACKUP; nonexistent path → TEMPLATE_MISSING; good sofp → PASS (no message). `§BACKUP_DRIFT` stays out of S1 (not fatal-by-definition).
- **S1 ✅ DONE (witness W12, `witness/W12.log`)**: truncated→`§TEMPLATE_UNREADABLE … bytes=131072`, BACKUP removed→`§SHEET_MISSING BACKUP … present:[…]`, absent→`§TEMPLATE_MISSING`, good sofp→PASS. Wired in patched file: `doIt` wrapper emits `§REPORT_FATAL phase= file= sql#= cause=`; `phase` set per stage; PDF null-guard + `§PDF_STAMP_SKIPPED`. Whole file javac syntax-checked (no iDempiere jars → only symbol errors). Not compiled against iDempiere, not deployed. `clean(FileInputStream)` param dropped (unused).

## WHY IT EXISTS + IMPROVEMENT PROPOSALS (2026-10-12; from code/template reading — comparisons to other tools are general knowledge, NOT tested)
**Differentiators (evidence = code header, Process-sheet grammar, `clean()`, `setForceFormulaRecalculation`):**
1. The report IS the Excel layout — the accountant owns formulas, colours, merges; the engine only places SQL results.
2. Fixed-form statutory reports (cashflow, SOFP): Process sheet maps each SQL → cell ADDRESS + Direction (`S` single, `V` down, `>` right); formulas recalc on open.
3. Cell-driven queries: WHERE can read another Output cell via `[C8]` tags.
4. Cross-tab into a pre-formatted grid; formulas + conditional formatting copied as rows grow.
5. New report = new XLS (edit Process sheet); no Java/deploy. Same engine served 5 Laos clients (log).
6. Runs inside iDempiere on live SQL; emits XLS + PDF.

**Improvements — PROPOSED, all ON HOLD (non-fatal) until the Laos Excel fix is run and its log read:**
| # | Change | Evidence it is needed | Witness to write first |
|---|---|---|---|
| I1 | Stop using BACKUP as a separate hand-kept sheet: clone Output, clear the cells named by Process addresses | Whole Laos fault = BACKUP/Output drift; hand edits to Output are discarded every run | clone-and-clear on sofp must equal today's output cell-for-cell |
| I2 | Never overwrite the template: write result to a new file (per-run name) | L3 truncated XLS; two users overwrite each other | two parallel runs → both files intact |
| I3 | Run each distinct SQL once per run (cache by statement text) and time each (`§SQL_MS`) | 13 repeats of 45 distinct in cashflow, 22 of 77 in sofp; stall unmeasured | count statements issued before/after on the same template |
| I4 | Template lint on upload/first run: sheets present, Process addresses inside Output, Direction filled, BACKUP drift | RESULTS 1–6; today these surface as silent wrong numbers | lint(cashflow) lists 45 drift cells, lint(sofp) clean |
| I5 | Replace per-cell `System.out.println` with log levels | 463 "Address is" lines in one log | line count per run |
| I6 | Move the Spire licence key out of source (AD_SysConfig / env) and rotate it | key sits in plain text in the file | grep source = 0 matches |
| I7 | Logo path from AD_SysConfig with skip-if-missing (partly done: `§PDF_STAMP_SKIPPED`) | `whiteband.png` FileNotFound on 5 clients | missing file → PDF still produced |
| I8 | One shared connection/trx for the run, closed in `finally` | Hikari leak ×3 | W-LEAK on stub DB (not yet built) |
Order if released: I4 → I2 → I3 → I1 → I5/I6/I7 → I8.

## RESULTS 7 — LEGACY STONE running locally (2026-10-12 ~20:50; user mandate "improve to zero"; both stones = legacy plugin + SQLite JS twin)
- Read `prompts/SQLiteIDEMPIERE.md` CARDINAL RULE: legacy is the oracle, twin must equal it with no accepted divergence → the JS equivalent of this report engine (stone 2) is judged cell-for-cell against the legacy plugin output (stone 1).
- **Stone 1 setup:** throwaway server `~/idempiere-laos/server` (copy of pilot server, ports 8098/8454), DB `idempiere_laos` (= copy of `idempiere_pilot`), plugin `ExpenseReportMaker_3.1.0.202210180852.jar` (SourceForge) installed via Felix console (`/osgi/system/console`, SuperUser/System). Process `1300001` + WS type `Bridge_RunProcess_ExpenseReport` in `legacy/ws_expensereport.sql`; runner `ad_client.runProcess` with `BRIDGE_BASE=http://localhost:8098`. Stand-in `v_docno` view (Laos original unknown): `legacy/v_docno_standin.sql`.
- **First run ✅:** `FactAcctReport.xls` → `ok=true "0 Records. Time Elapsed: 2.182 secs"` + XLS + `FactAcctReport.pdf` + `FactAcctReportSpire.pdf` (the 2022 jar already contains a Spire PDF path). 0 records = the sample template filters client 1000012, absent in GardenWorld data.
- **REAL DEFECT FOUND (fatal-path, in both SF 2022 jar line 397 and Laos fork):** `formatException()` throws `StringIndexOutOfBoundsException: begin 374, end -1` and MASKS the real SQL error (`relation "v_docno" does not exist`). Only found because Postgres log showed the statement. → add to S1: formatException wrapped in try/catch, fallback = raw exception + SQL.
- ⚠ **INCIDENT (mine, reported):** the cloned server's `utils/myEnvironment.sh` hardcodes `IDEMPIERE_HOME=/home/red1/idempiere-pilot/server`, so my first start (20:38) ran against `idempiere_pilot` and its 2Pack wrote 2 menus/1 process/3 params/package_imp rows into the PILOT. Reverted in one transaction (`legacy/revert_pilot_2pack.sql`, 0 remaining 2Pack rows). NOT reverted (the sequence reset was blocked by the permission system; left as is): `ad_sequence.currentnext` bumped for AD_Menu (1000003→1000005), AD_Process, AD_Process_Para, AD_Attachment, AD_Package_Exp/_Exp_Detail/_Imp*; plus startup churn (role-access rows re-created, ad_session, scheduler logs) which a normal pilot start also produces. Clone fixed (IDEMPIERE_HOME → clone); `pg_stat_activity` confirms clone connects only to `idempiere_laos`. Lesson: grep a copied server for the ORIGINAL path before first start.

## RESULTS 8 — oracle capture + STONE 2 GAP SPEC (2026-10-12 ~20:55)
**Stone 1 (legacy plugin, local clone) — what runs:** SF jar (2022, NOT the Laos fork: fork needs `com.lowagie` + the commercial Spire licence, not buildable here). `legacy/parity_fixture.xls` = SourceForge `FactAcctReport.xls` with ONE edit (client literal 1000012→11, `witness/W15.log`). Run `DateFrom=2006-12-15 DateTo=2006-12-16` → `ok=true "16 Records"`, real GardenWorld fact_acct rows joined to invoice/payment, values written to the Process sheet VALUES columns (Process 117→249 cells, `witness/W17`). Oracle file `legacy/parity_fixture.ORACLE_2006-12-15.xls`, cell dump `legacy/oracle_cells.tsv`.
**Found, not yet cleared:** Output sheet is UNCHANGED (117 cells == sample) and the log says `Nothing was painted. Do INPUT sheet again` → the Input-token ↔ Process-annotation match failed: Process col A is `=CONCATENATE("@",C,"@",G)` whose CACHED text POI does not recalc (the exact §6.3 problem of NinjaExcelAdaptation). Real Excel-saved templates carry fresh caches; my POI-rewritten fixture does not. Next: regenerate caches (LibreOffice headless recalc, or write the cache strings from geometry) → re-run → Output painted → that is the oracle.
**Stone 2 = `build/erp/ninja_excel.js` (298 lines, live as the "Excel Report" pill, bim-ootb #279/#282; spec `internal/NinjaExcelAdaptation.md`). Gap vs legacy plugin (read from code, not yet witnessed):**
| # | Legacy plugin | JS twin today |
|---|---|---|
| G1 | Direction `S` (single), `V` (down), `>` (right) | gate refuses everything but `>` ("write-back phase 2") |
| G2 | ONE multi-row statement: SELECT cols from many rows, TABLE/JOIN/WHERE rows accumulate until next statement (makeFullSQLStatement) | one scalar query per Process row |
| G3 | BACKUP→Output clone per run, Output wiped | no clone step; no BACKUP-drift concept |
| G4 | `[C8]` bracket tags, CROSSTAB block, `#n` binds from params | `#n` binds only |
| G5 | result set written in Process VALUES cols then `paint()` to Output by ADDRESS, formulas copied/shifted per row | cell write-back of scalars |
| G6 | PDF export + logo, image tags | none |
| G7 | error text: raw / garbled (formatException bug) | explicit REFUSE messages (better) |
Parity witness W-PARITY (to write BEFORE code, per Spec-First): same fixture + same DB (`idempiere_laos` ⇄ SQLite twin of pilot) → legacy oracle cells vs JS cells, per-cell diff = 0, plus `INCONCLUSIVE` when oracle painted 0 cells (not-vacuous gate). Cardinal Rule: any diff is fixed on the JS side; no exemption without the user's own words.
S1 addition: wrap `formatException` in try/catch → fall back to raw exception text + SQL (G7 root: StringIndexOutOfBounds masked `relation "v_docno" does not exist`).

## RESULTS 9 — REAL LAOS FORK RUNNING + SIMILARITY of ninja_excel.js (2026-10-13; user: "check its similarity with the original so it process the Excel the same")
- **Pilot sequences reset (user "yes")** — 6 UPDATEs, each matched exactly 1 row (`legacy/revert_pilot_2pack.sql` tail). Pilot 2Pack incident fully reverted.
- **Stone 1 is now the REAL Laos fork** (`legacy/forkbuild/build_fork.sh` compiles `source/customreport.txt` as OSGi bundle `ExpenseReportFork` against the clone's iDempiere/POI/OpenPDF + Spire from the SF jar; licence key stripped from the BUILD copy only; process 1300002, WS type `Bridge_RunProcess_ExpenseReportFork`, `legacy/ws_expensereport_fork.sql`, runner `legacy/run_er.js`). Ran MOES_sofp + MOES_cashflow: SQL executes, `Address is` writes sofp 90 / cashflow 101, `RETURNS NOTHING` 37 / 19 (no Laos data), XLS rewritten. Oracle dumps: `legacy/oracle_fork_MOES_{sofp,cashflow}.tsv`.
- **Measured on the real fork (not read-only inference):** cashflow Output went **74 rows → 63 rows** (= BACKUP's row count) and 172 of 173 Output cells differ from the input Output: the run REBUILDS Output from the stale BACKUP and drops 11 rows. sofp: stale last-run data in Output (Lao ministry names, `01/01/2025 - 31/12/2025`, 3.67E11 figures) is wiped and replaced from BACKUP + painted values. This is the Laos fault, witnessed.
- **PDF NPE reproduced on the real fork:** `Cannot invoke PdfStamper.close() because "<local4>" is null` (PdfReader throws first → `finally` NPE masks it) — patch S1's null-guard is correct; in my build it triggers because Spire runs unlicensed (eval PDF invalid), on Laos' server it triggers whenever the first PDF is bad.
- **SIMILARITY ledger, `witness/W19.log` (`ninja_excel.js` readManifest+gate on the same files):** MOES_sofp gateOk=**false** (179 errors: 72 `S`, 11 `V`, 8 crosstab-style `A21+` directions, 44 empty ADDRESS, 43 empty SELECT); MOES_cashflow gateOk=**false** (142 errors: 51 `V`, 19 `S`, 22 empty SELECT/ADDRESS, 16 empty TABLE, `C22+`-style crosstab); the 2022 SF sample (older column layout: no ROW col, ADDRESS in B / Direction in G) unreadable (bad ADDRESS ">"). **Verdict: ninja_excel.js does NOT process the Laos Excel like the original — it refuses both templates. Similarity today = 0 of 2.** Causes (code-read, each now measured): (1) rows with empty SELECT/TABLE/ADDRESS are CONTINUATION rows (JOIN/WHERE/extra columns) of one multi-row statement in the original, the twin treats every row as a standalone scalar query; (2) Directions S/V/`X#+`; (3) no BACKUP→Output clone; (4) column layout = Laos v2 (ROW col at B) which the twin already matches, the 2022 v1 layout it does not.
- **PORT PLAN (witness-first, each step judged cell-for-cell against `oracle_fork_*.tsv`, Cardinal Rule: diffs are fixed on the JS side):** P1 statement assembly = port `makeFullSQLStatement` (rows accumulate SELECT/TABLE/JOIN/WHERE until the next row that starts a new statement); P2 `set`+`paint` for `S`/`V`/`>` incl. row insertion + formula shift (`copyover`, `copyFormula`); P3 BACKUP→Output clone (`clean`) + `§BACKUP_DRIFT`; P4 `X#+` crosstab (`crosstab`, `parseBracketTag`); P5 bracket tags `[C8]`; P6 `#n`/date binds + `AD_Org_ID`/`AccountGroup` params; P7 XLS output file (write via SheetJS biff8; PDF = out of scope until Spire question settled). Data parity needs the same tables in the SQLite twin: Laos stand-ins (`legacy/laos_standin_schema.sql`, `v_docno_standin.sql`) mirrored there, same rows.

## RESULTS 10 — JS PORT P1–P3 AT PARITY (2026-10-13) — `build/erp/ninja_template.js` (new module, keeps `ninja_excel.js` + its W-NINJA witnesses untouched)
Ports of `clean` (BACKUP→Output), `setAddress`, `makeFullSQLStatement`, `executeSQL` result rule, `set/setReturnValues`, `paint` for directions **S / V / >**, `pushRowDown` (row insert + `shiftRows` formula shift), `pushColumnsRight`/`shiftOneColumnRight`/`copyover`, `copyFormula`. Quirks kept on purpose: `S` keeps the last record; `setAddress` last Input match wins; statement boundary = TABLE ending `" a"`; Java dangling-if appends WHERE even when the cell is empty.
**Witness `witness/W20_Parity.js`** (JS engine vs the REAL Laos fork run on the clone; executor `witness/pg_exec.py` = psycopg2 against `idempiere_laos`, read-only; SQL dialect parity is NOT in scope here, it is stone 2b):
| fixture | statements | cells compared | diffs | log lines | verdict |
|---|---|---|---|---|---|
| MOES_sofp (Laos) | 42 | 903 | 0 | 90 identical | PASS (weak: oracle painted 3 cells, no Laos data) |
| MOES_cashflow (Laos) | 36 | 761 | 0 | 101 identical | PASS (weak, same reason) |
| `legacy/parity_v2.xls` (POI-built fixture over REAL GardenWorld rows; V list + row insert, > + column insert, S) | 3 | **1427** | **0** | **1361 identical** (589 `Address is` + 772 `>>formula>>`) | **PASS** — Output 596→796 cells (insertions fired) |
**Negative controls (witness can say NO):** wrong client → 1385 diffs FAIL; dropped first row → 1561 diffs FAIL. A date-range change did NOT fail (the fixture's lists are date-independent) — recorded, not claimed as a control.
**Fixture lesson:** SheetJS cannot write formulas into .xls (my first fixture had none, so insertion never fired = vacuous PASS, caught by checking the oracle log for `>>formula>>`). Fixture is now `witness/MakeParityV2.java` (POI + commons-math3 for cached results).
**Honest non-identical item:** diagnostic line `This row is null : n` — oracle 579 vs JS 1737. Cell data identical; POI keeps two empty row objects (Output rows 198,199 0-based) that SheetJS has no concept of. It is a System.out diagnostic, not a result; excluded from the identity check and printed as `§ROWNULL_DIAG`. Cardinal Rule note: not a user-visible divergence, but listed here so it is a decision of record, not a silent exclusion.
**Perf:** first JS run did not finish in 5 min (row lookups rescanned all cells); per-sheet incremental row index → 3.7 s.
**Still to port:** P4 cross-tab `X#+` (`crosstab`, matrix canvas), P5 bracket tags `[C8]` (`parseBracketTag`), image tag (`putImage`), org/AccountGroup params already wired; P7 write the XLS file out; stone 2b = run the same statements on the SQLite twin (PG→SQLite dialect: CONCAT, to_char, DATE, `ISNULL`, casts) — `ninja_template.js` takes `exec(sql)` so only the executor changes.

## RESULTS 11 — P4 cross-tab `X+` PORTED + AT PARITY (2026-10-13)
`plusMatrix()` (paint's `+` branch: axis row → X/Y matrix → canvas laid on Output), `crosstab()` (`#?…;` statements) and `parseBracketTag()` added to `ninja_template.js`. Real Laos usage (measured): `+` directions: sofp 8 rows, cashflow 12 rows, all single-axis (`A21+`, `C31+`); `#?` WHERE rows: 0 in both; bracket `[C8]` rows: 0 in both.
Fixture `legacy/parity_xtab.xls` (`witness/MakeParityXtab.java`; shaped like MOES_cashflow rows 51-58: axis row `a.value >` → label row `el.value as acctno` → amount row `sum(...)` with JOIN+GROUP BY in the same row and Direction `C3+`; REAL GardenWorld Dec-2006 postings for 4 accounts). Oracle: `4 CROSS TAB CANVAS: @sum(...) as amt@4C3+`. **W20: PASS, 55 cells, 0 diffs, 13 log lines identical** (incl. the CANVAS line). Two fixture traps caught by reading the oracle log, not by trusting a green PASS: (1) amount landed on a SELECT-less JOIN row; (2) Input token row number (`@…@5`) no longer matched after I moved the row (`@…@4`) → nothing painted on either side = vacuous PASS until the CANVAS line was required.
**Not witnessed (ported from the Java, untested because neither Laos template nor any fixture uses them):** two-axis `A+B` matrix, `#?…;` cross-tab SQL, `[C8]` bracket tags, date-formatted bracket values (POI `dd-MMM-yyyy` text), `putImage`. Do not claim parity for these.
**Output format decision (flag):** SheetJS (0.18.5) cannot WRITE formulas into .xls (BIFF8) — it silently drops them. The twin must therefore emit .xlsx (formulas kept) or the engine returns the mutated workbook for the host to write. Laos users currently open .xls; confirm acceptable before P7.

## RESULTS 12 — STONE 2b: the same statements on the SQLite twin (2026-10-13; gate `witness/run_all.sh` → 10/10 expected verdicts)
Dialect adapter in `ninja_template.js`: `registerPgBuiltins` (`left`, `right`, `to_char`), `pgToSqlite` (`DATE '…'`, `CAST(x AS TIMESTAMP|DATE)`, `EXTRACT(YEAR|MONTH|DAY FROM x)`, balanced-paren and string-literal aware), `typedFromSqlite` (REAL → shortest 12-digit decimal). Data = `legacy/twin_snapshot.db` (`witness/pg_to_sqlite.py`: 13+2 tables of the clone copied row-for-row, numerics as REAL = the twin's own amount convention; `v_docno` stand-in mirrored).
**Before the adapter (W23):** 77 of 83 Laos statements did not even PREPARE on the twin (33 `left()`, 30 missing `v_docno`, 7 `DATE '…'/to_char`, 5 Laos tables, plus `EXTRACT`/`CAST AS TIMESTAMP`). **After (W24, PG result vs SQLite result, same rows):** sofp 42/42 run, cashflow 36/36, fixtures 5/5.
| gate | statements | judged (PG returned rows) | SAME | verdict |
|---|---|---|---|---|
| parity_xtab | 2 | 2 | 2 (incl. REAL SUM = `445.85`) | PASS |
| MOES_sofp | 42 | 5 | 5 | PASS (37 NOT-JUDGED: no Laos data in GardenWorld) |
| MOES_cashflow | 36 | 18 | 18 | PASS (18 NOT-JUDGED) |
| parity_v2 | 3 | 3 | 2 | **FAIL — D1** |
**D1 (OPEN, real divergence, found by the witness):** PG returns `SUM(…)` as `numeric` `0.00` (BigDecimal, scale kept); SQLite REAL returns `0`. The original's rule `obj.toString().equals("[0.00]")` ⇒ "RETURNS NOTHING ⇒ paint nothing" fires on legacy but NOT on the twin, which would paint a `0`. A user-visible difference (Cardinal Rule: fixed on the SQLite side, never exempted). Cause = the twin stores amounts as REAL, so NUMERIC scale is lost. Candidate fixes (need a decision on where the twin's money lives, not a one-line patch): (a) amounts as exact-decimal TEXT + an exact `sum` aggregate UDF carrying max scale, (b) scale from AD_Column per field. Until then the 5+18 judged-SAME rows are the only numeric proof and NOT-JUDGED rows prove nothing about values.
**Honest limits:** parity is proven on ENGINE behaviour and statement results over the clone's GardenWorld rows; the Laos Excel itself still returns almost nothing here (no Laos data), so the Laos reports are not value-verified end to end. Output format (.xlsx vs .xls), PDF, `putImage`, UI pill wiring and the bim-ootb port are NOT done.
