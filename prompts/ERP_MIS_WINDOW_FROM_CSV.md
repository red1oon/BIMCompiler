# ⚠ DO NOT REMOVE
Scope: SPEC ONLY for "the ERP's AD framework as an MIS": one line adds a window from a CSV of table properties, and data goes in and out as natural CSV sheets. **Nothing here is built** (owner, 2026-11-10: *"don't do yet, spec out clearly first so they are well triaged and planned fully for next session"*). Read the log after every run of anything derived from this file. Honour until this file is marked DONE.

# ERP as MIS: `Add window = table.csv`, and CRUD by CSV

**Owner, 2026-11-10:**
- *"Spec out towards using the ERP AD framework as a MIS ie create new window (Ninja like) :excel.csv containing the table properties."*
- *"ie 'Add window = table.csv' and the code will fetch from table.csv in same folder and inject as Ninja would do its AD_Table, AD_Column, AD_Window, AD_Tab, AD_Menu etc."*
- *"even CRUD stuff because the Excel handling is already able to import data in natural CSV sheets. But spec those well first"*

**Parent lane:** `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` (the one door, the verb vocabulary; §R.V is the running work order). This file is that lane's item 8. Laws that bind: AD-LAYER LAW (one generic engine, zero per-window code, X of N), TWIN CARDINAL RULE, PRIMAL LAW (witness, never eyes), no paid model calls, NEURO §R.4 (worktrees, environment, hygiene).

## ▶ RESUME HERE (next session)
Start at §5 step M0 (read and measure, no code). Then M1 onward, top to bottom. Three questions for the owner are in §6, each with an advised answer: work on the advice unless overruled.

## 1. The idea in one paragraph
A person keeps a small table in a spreadsheet: assets, visitors, training records. Today they would need a developer to get a screen for it. Here they save the sheet's description as `asset.csv`, type one line, and the ERP gains a real window: menu entry, grid, form, find, export, roles, history. The same engine that runs Sales Order runs it, with no code written for it. Then they load their rows from a second CSV, and read them back as CSV. That is an MIS built by its user.

## 2. What exists today (read from bim-ootb main `612c6102`, 2026-11-10; do not re-derive)
| Piece | Where | What it does | Limit that matters here |
|---|---|---|---|
| Ninja model parser | `erp/ninja_model.js` | Reads the Ninja workbook (`2_RO_ModelMaker`: one row per table, a `ColumnSet` cell of comma-separated column tokens; or the columnar sheet). Grammar ported from `NinjaProcessor.java` `addColumnFromDef`: prefix `S# Q# A# Y# D# d# T# L#`, auto `Is*` = YesNo, `*_ID` = lookup. Unknown prefix = String + a warning | Input is a workbook object, not a CSV. No "mandatory", no field length, no default, no help text in the grammar |
| Ninja staging | `erp/ninja_stage.js` `stageModels(db, model, ts)` | Writes AD_Table, AD_Column, AD_Window, AD_Tab, AD_Field, AD_Menu, AD_TreeNodeMM and creates the data table; a detail table becomes a tab inside its master's window (`IsParent`); ids from 7,000,000 by position, shifted to a free slot; `rollbackModel` sets IsActive='N' and keeps the rows | Writes a **short list of AD columns** per row (its header comment names them). Whether the generic window engine, roles and the model layer need more than that list is not measured (M0) |
| Ninja bundle + Create face | `erp/ninja_bundle.js`, `ninja_create.js`, `plugins/ninja_create.mjs`, `plugin_overlay.js` | In the browser: drop a `.xlsx`, preview, "Emit & Install" as a plugin bundle | Browser only. Takes `.xlsx` |
| Data loader | `erp/plugins/ninja_migrate.mjs` + `ninja_migrate_process.mjs` (AD_Process 9540001 "Migrate Excel Data", port of the owner's `MigrateExcelData.java`) | One sheet per table, sheet name = table name, row 1 = column names, each row saved through the model layer's own save (defaults, checks, callouts); `_ID` cells looked up by Name or `Column>OtherColumn`; lines find their header by Document No; **all or nothing**, every refusal listed; update mode keyed on the first two columns | Runs as a process in the page / kernel host. Update mode is a raw UPDATE without model events (as the Java). No delete |
| Role access for plugin rows | `erp/plugin_registry.js` §PLUGIN-ROLE-ACCESS | A window brought by a bundle's `manifest.dictionary` gets access rows for every active non-manual role | Ninja bundles stage through `activate()` → `stageModels`, not `manifest.dictionary`: whether their windows get access rows is not measured (M0) |
| The door | `common/door/door.js`, `verbs.json`, `erp_cli.js` | `erp.find/actions/describe/read/complete/void/close/reverse`; an AI's write is held as a claim | `erp_cli.js` boots seed + patches + its op-log. It loads **no plugin** and its op-log has **no DDL op**: a new table cannot be replayed today |
| CSV | `erp/xlsx.mini.min.js` (SheetJS) is what reads workbooks; the window toolbar has a `CSVImport` button entry (`ad_toolbar.js:20`); record export to CSV exists in the page (`idempiere.html` `_exportRecordsCsv`) | | Whether the mini SheetJS build reads CSV text, and whether the toolbar's CSV import is wired, are not measured (M0) |
| Legacy owners (the oracle) | `~/idempiere-dev-setup/idempiere/org.adempiere.base.process/src/`: `org/idempiere/process/CreateTable.java`, `org/compiere/process/CreateWindowFromTable.java`, `ColumnSync.java`, `TabCreateFields.java`; `org.adempiere.base/src/org/adempiere/impexp/GridTabCSVImporter.java`. Ninja: `~/Projects/red1_plugins/org.red1.ninja/src/org/ninja/process/ImportModel.java`, `DeleteModel.java`, `MigrateExcelData.java`; `~/Projects/org.idempiere.ninja/` | | Read before any behaviour is decided (AD-LAYER LAW 1 and 7) |

## 3. The design (advised; §6 holds the three points the owner may overrule)
### 3.1 The lines a person types
```
erp.add_window file=asset.csv                 -- the owner's "Add window = asset.csv"
erp.add_window file=maintenance.csv master=AST_Asset
erp.load file=asset_rows.csv table=AST_Asset  -- create rows from a natural sheet
erp.load file=asset_rows.csv table=AST_Asset update=Y
erp.list kind=AST_Asset --csv --out assets.csv   -- NEURO §R.V item 5
erp.remove_window table=AST_Asset
```
- A file name without a path is looked for **in the folder of the script being run** (a single typed line: the current folder). A path that leaves that folder is refused. The door journals the file's sha256 with the line, so a replay with a changed file is detected and refused.
- The table name is the file name without `.csv`, unless `table=` is given. It must carry a prefix that is not a core one (Ninja's rule: a 2 to 4 letter module prefix and `_`); a name that matches an existing core table is refused.
- Harm: `erp.add_window` and `erp.remove_window` change the dictionary: harm `writes`, plus a new flag `"dictionary": true` in the vocabulary entry so an AI's call is always held as a claim and the role must hold the System Administrator's grant (as legacy: these are System-level windows). `erp.load` is `writes`. `erp.list` is `read`.

### 3.2 The properties CSV (one file = one table; one row = one column)
Header row, then one row per column. Only `Column` is required; an empty cell takes the Ninja default.
```
Column,Type,Length,Mandatory,Identifier,Default,List,Lookup,Callout,Help
Name,String,60,Y,Y,,,,,
PurchaseDate,Date,,,,,,,,When it was bought
Cost,Amount,,,,,,,,
Condition,List,,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",,,
C_BPartner_ID,,,,,,,,,Supplier
IsInsured,,,,,,,,,
```
- `Type` takes the Ninja words (String, Quantity, Amount, YesNo, Date, DateTime, Text, List) or their one-letter prefix. Empty: Ninja's own rule by name (`Is*` = YesNo, `*_ID` = lookup, else String). An unknown word is **refused naming it** (the parser's "String + warning" is kept for workbooks, but a typed CSV fails loudly).
- The standard columns (`<Table>_ID`, `_UU`, client, org, IsActive, Created/By, Updated/By) are added as Ninja adds them and must not be listed; listing one is refused.
- `Length`, `Mandatory`, `Identifier`, `Default`, `Help` are AD_Column's own properties, which the Ninja grammar has no token for. They are dictionary data, not new behaviour: the model layer and the window already read them. Each one is offered only after M0 proves the engine honours it on a staged table.
- Table-level facts are inputs on the line, not rows: `master=` (the table becomes a detail tab of that window), `workflow=Y` (Ninja's DocStatus / DocAction / Processed / DocumentNo / IsApproved set), `name=` (the window's label; default: the table name with `_` as spaces), `menu=` (parent menu node; default: one summary node named after the prefix).
- One reader turns the CSV into **the same model object `ninja_model.parseSheet` returns**; from there the path is Ninja's own (`stageModels`). No second staging engine (AD-LAYER LAW 5).

### 3.3 Where the new window lives
- **At the door (CLI, AI):** the dictionary rows are written as op-log ops through `persistGroup` (the path `erp.complete` already uses), so they replay on every boot. The data table is not an op: a generic boot step creates the physical table for any active AD_Table that has none, from its AD_Column rows (the rule `ad_import_tables.js` applies by hand for four `I_*` tables; the generic step can then retire that hand-kept DDL, counted in the deletion budget).
- **In the browser:** the same model is emitted as a `.foldbundle` (`ninja_bundle.emitBundleSource`) next to the CSV, and the Create face accepts `.csv` as it accepts `.xlsx`. One model, two hosts, compared by a witness.
- The CLI's op-log and the browser's store are two stores today. This file does not merge them; it makes both reach the same rows from the same CSV and proves it.

### 3.4 CRUD on any window, including the new one
| Need | Line | Runs | State |
|---|---|---|---|
| Create many | `erp.load file= table=` | the Migrate Excel Data process, one CSV = one sheet | process exists; the verb and a CSV reader do not |
| Create one | `erp.new kind= column=value …` | model layer save | NEURO §R.V item 2 |
| Read | `erp.read`, `erp.list … --csv` | object layer, the kept image | read by number: R.V item 1 (in review); list/CSV: R.V item 5 |
| Update many | `erp.load … update=Y` | the process's update mode | exists; **raw UPDATE, no model events** (the Java's behaviour): the guide must say so, and M5 decides with the owner whether the door offers it or routes updates through save |
| Update one | `erp.update kind= number= column=value` | model layer save | `object.update` exists for models; the ERP form is not built |
| Delete one | `erp.delete kind= number=` | the model layer's delete, as the toolbar's Delete (bim-ootb #2816) | not a verb yet |
| Delete many | not offered | | no legacy counterpart in the loader; a list of numbers through `erp.delete` in a script covers it |
- **Round trip is the contract:** the CSV `erp.list --csv` writes must be a file `erp.load` reads (same header names, same lookups by name). Witness W-MIS-ROUNDTRIP below.
- **Where results go** (owner, 2026-11-10: *"results may return as CLI list in terminal … or > store.txt"*): a list on the terminal (`--list`), or into a file with `> store.txt` / `> rows.csv` at the end of a script line. Specified once, in NEURO §R.V item 9; `!help` (item 10) lists these lines with ready-to-run examples.
- Every verb above is generic over kinds. None may name a table (W-ERP-VERBS-DOOR V5 already checks this for `erp_cli.js`).

## 4. Witness claims (written first; each names the issue it proves; each must be able to say INCONCLUSIVE)
| Witness | Issue | Claim |
|---|---|---|
| W-MIS-CSV-MODEL | a CSV means something else than the same table in a Ninja workbook | the model from `asset.csv` equals `parseSheet` of the equivalent `2_RO_ModelMaker` row, field for field. Falsifier: a reader that drops the List values |
| W-MIS-CSV-REFUSE | a bad sheet is half-applied | unknown type word, a listed standard column, a duplicate column, a core table name, a file outside the folder: each refused naming the cell, and the op-log and dictionary counts are unchanged |
| W-MIS-STAGE | the door stages something else than Ninja does | rows written by `erp.add_window` = rows `stageModels` writes for the same model in the browser host, table by table, column by column. Falsifier: skip AD_Field |
| W-MIS-ORACLE | the staged window differs from what legacy Ninja makes | against the Java oracle (`ImportModel` on the pilot, or its PackOut.xml as W-NINJA-MODEL already does for parsing): every AD row class compared, differences listed by column. A difference is fixed on our side (TWIN RULE) |
| W-MIS-WINDOW | a staged window is not a real window (the AD-LAYER LAW defect class) | the dictionary sweep counts it: **X of N windows pass the generic-engine invariant, N grows by one and X with it**: grid rows, new record, save, find, tab switch without save, master to detail with the parent id on every detail row, reopen. Run on the user-visible path, not a happy-path script |
| W-MIS-ACCESS | a new window is visible to nobody, or to everybody | every active non-manual role gets its access row as legacy pack-in does; a role without it cannot open, read or load the kind, on every actor alike |
| W-MIS-REPLAY | the window is gone after a restart | a fresh process with the same op-log has the window, the table and the rows. Falsifier: skip the boot table step |
| W-MIS-LOAD | a load is partly kept, or bypasses the model | one bad row in 50: nothing kept, every refusal listed; a good file: row count = file rows, defaults and callouts applied (a column the sheet left empty holds its default) |
| W-MIS-ROUNDTRIP | what we export cannot be loaded back | list as CSV, load into a fresh tenant, list again: equal cell for cell, including a comma, a quote, a newline, a lookup by name and a date |
| W-MIS-REMOVE | removing a window loses data or leaves it reachable | after `erp.remove_window`: menu, window, tab inactive; rows kept; `erp.add_window` of the same file brings it back with its rows; a detail's master cannot be removed first |
| W-MIS-SAME | an actor changes the result | the same line by person, AI and script gives the same envelope; an AI's `add_window` is a claim and nothing is written |
| W-MIS-GUIDE | the guide shows a result nobody ran | every block of the guide's MIS section is re-run and every number checked (the W-FAST-SCRIPT-GUIDE pattern) |
**Denominator, stated every time:** windows passing the generic invariant X of N (N from `ad_seed.db` plus staged); CSV property columns honoured X of 10 (§3.2 header); CRUD lines offered X of 7 (§3.4).

## 5. Work order (top to bottom; spec line first, witness with a falsifier, coordinator re-runs before reporting; one PR per step)
- **M0 Measure, no code.** (a) Which AD columns does `stageModels` leave empty that the window engine, `ad_access.js`, the model layer or team replication read? List them per table, from the code. (b) Does a Ninja-staged window get role access rows today? (c) Does `xlsx.mini.min.js` read CSV text in Node and in the page? If not, one small RFC 4180 reader, shared with the CSV writer of NEURO §R.V item 5 (one module, read and write, one round-trip witness). (d) Is the toolbar's `CSVImport` wired to anything; what does `GridTabCSVImporter.java` do that `MigrateExcelData` does not? (e) What do `ImportModel.java` and `DeleteModel.java` do beyond what `ninja_stage.js` ported? (f) Ids: staging gives ids by position from 7,000,000; two people adding different CSVs in a different order get different ids. Does team replication (`prompts/TEAMWORK_FRAMEWORK.md`) key these rows by id or by `_UU`? Write the answers into §7 here before M1.
- **M1 CSV → model.** The reader of §3.2; W-MIS-CSV-MODEL, W-MIS-CSV-REFUSE.
- **M2 Stage at the door.** `erp.add_window` (generated into `verbs.json`); dictionary rows as ops; the generic boot table step, retiring the hand DDL it supersedes; W-MIS-STAGE, W-MIS-REPLAY, W-MIS-SAME.
- **M3 Twin and access.** Close the gaps M0(a,b,e) found; W-MIS-ORACLE, W-MIS-ACCESS, W-MIS-WINDOW (the sweep, X of N).
- **M4 Browser.** `.csv` on the Create face; the emitted bundle; the same rows as the door (extend W-MIS-STAGE).
- **M5 Load.** `erp.load` over the Migrate Excel Data process, one CSV = one sheet; the update-mode decision; W-MIS-LOAD.
- **M6 The rest of CRUD.** `erp.update`, `erp.delete`; with R.V items 2 and 5 landed: W-MIS-ROUNDTRIP. `erp.remove_window`; W-MIS-REMOVE.
- **M7 Guide.** A section "Your own tables" in `docs/FastScriptGuide.md`, generated and witnessed on the served page (W-MIS-GUIDE); a film only on the owner's go.
**Depends on:** NEURO §R.V item 1 (done, in review), item 2 (`erp.new`) for M6, item 5 (list and CSV) for M6 and the round trip. M1 to M5 need none of them.
**Not in scope without the owner's go:** workflow nodes and approval for `workflow=Y` tables beyond Ninja's column set; reports and print formats; translation tables; callout code (a CSV may name a callout that a bundle ships, it never carries code); kanban; the email actor; anything on the GPU.

## 6. Questions for the owner (one at a time; the advice stands until overruled)
1. **The sheet's shape.** Advice: §3.2, one row per column, because the owner's words are "containing the table properties" and nothing is guessed from data. The alternative is a natural sheet whose headings carry Ninja prefixes (`A#Cost`, `D#PurchaseDate`) and whose rows are the data, so one file is both the window and its first load. It is shorter for a user and can be added later as a second reader onto the same model. Which first?
2. **The oracle.** Advice: the owner's Ninja (`ImportModel`) decides which rows exist and their shape, as the owner said "as Ninja would do"; where Ninja leaves an AD column to core defaults, core's `CreateTable` / `CreateWindowFromTable` / `ColumnSync` decide the value. Is that the intended split?
3. **Update by sheet.** The loader's update mode is a raw UPDATE with no model checks, as the Java. Advice: at the door, route updates through the model's save (checks run, slower), and keep the raw mode only inside the process as legacy has it. Agree?

## 7. M0 findings (empty; the next session fills this before any code)

## STATUS
2026-11-10: spec written. Nothing built.
