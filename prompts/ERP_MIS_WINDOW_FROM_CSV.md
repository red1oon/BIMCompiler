# ⚠ DO NOT REMOVE
Scope: SPEC ONLY for "the ERP's AD framework as an MIS": one line adds a window from a CSV of table properties, and data goes in and out as natural CSV sheets. **Nothing here is built** (owner, 2026-11-10: *"don't do yet, spec out clearly first so they are well triaged and planned fully for next session"*). Read the log after every run of anything derived from this file. Honour until this file is marked DONE.

# ERP as MIS: `Add window = table.csv`, and CRUD by CSV

**Owner, 2026-11-10:**
- *"Spec out towards using the ERP AD framework as a MIS ie create new window (Ninja like) :excel.csv containing the table properties."*
- *"ie 'Add window = table.csv' and the code will fetch from table.csv in same folder and inject as Ninja would do its AD_Table, AD_Column, AD_Window, AD_Tab, AD_Menu etc."*
- *"even CRUD stuff because the Excel handling is already able to import data in natural CSV sheets. But spec those well first"*

**Parent lane:** `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` (the one door, the verb vocabulary; §R.V is the running work order). This file is that lane's item 8. Laws that bind: AD-LAYER LAW (one generic engine, zero per-window code, X of N), TWIN CARDINAL RULE, PRIMAL LAW (witness, never eyes), no paid model calls, NEURO §R.4 (worktrees, environment, hygiene).

## ▶ RESUME HERE (next session)
**Naming (owner, 2026-11-11):** the verbs of this lane are offered under the **`mis.` prefix** (`mis.add_window`, `mis.load`, `mis.update`, `mis.delete`; read verbs as aliases of the `erp.*` originals), so the audience meets the light MIS concept first; one engine, one implementation. Rule and alias mechanism: `prompts/CLI_ERP_IVR.md` §1c. Where this file says `erp.add_window`, `erp.load`, `erp.update`, `erp.delete`, read `mis.*`.
**M0 is done (2026-11-13): read §7 and §8, the four consequences at the end of §8 first.** Start at M1, then onward top to bottom; M2 must stage the columns §8 (a) lists, not only what `stageModels` writes today. Three questions for the owner are in §6, each with an advised answer: work on the advice unless overruled. Place in the whole lane's order: NEURO §TRIAGE item A3.

## 1. The idea in one paragraph
A person keeps a small table in a spreadsheet: assets, visitors, training records. Today they would need a developer to get a screen for it. Here they save the sheet's description as `asset.csv`, type one line, and the ERP gains a real window: menu entry, grid, form, find, export, roles, history. The same engine that runs Sales Order runs it, with no code written for it. Then they load their rows from a second CSV, and read them back as CSV. That is an MIS built by its user.

## 2. What exists today (read from bim-ootb main `612c6102`, 2026-11-10; do not re-derive)
| Piece | Where | What it does | Limit that matters here |
|---|---|---|---|
| Ninja model parser | `erp/ninja_model.js` | Reads the Ninja workbook (`2_RO_ModelMaker`: one row per table, a `ColumnSet` cell of comma-separated column tokens; or the columnar sheet). Grammar ported from `NinjaProcessor.java` `addColumnFromDef`: prefix `S# Q# A# Y# D# d# T# L#`, auto `Is*` = YesNo, `*_ID` = lookup. Unknown prefix = String + a warning | Input is a workbook object, not a CSV. No "mandatory", no field length, no default, no help text in the grammar |
| Ninja staging | `erp/ninja_stage.js` `stageModels(db, model, ts)` | Writes AD_Table, AD_Column, AD_Window, AD_Tab, AD_Field, AD_Menu, AD_TreeNodeMM and creates the data table; a detail table becomes a tab inside its master's window (`IsParent`); ids from 7,000,000 by position, shifted to a free slot; `rollbackModel` sets IsActive='N' and keeps the rows | Writes a **short list of AD columns** per row (its header comment names them). Whether the generic window engine, roles and the model layer need more than that list is not measured (M0) |
| Ninja bundle + Create face | `erp/ninja_bundle.js`, `ninja_create.js`, `plugins/ninja_create.mjs`, `plugin_overlay.js` | In the browser: drop a `.xlsx`, preview, "Emit & Install" as a plugin bundle | Browser only. Takes `.xlsx` |
| Data loader | `erp/plugins/ninja_migrate.mjs` + `ninja_migrate_process.mjs` (AD_Process 9540001 "Migrate Excel Data", port of the owner's `MigrateExcelData.java`) | One sheet per table, sheet name = table name, row 1 = column names, each row saved through the model layer's own save (defaults, checks, callouts); `_ID` cells looked up by Name or `Column>OtherColumn`; lines find their header by Document No; **all or nothing**, every refusal listed; update mode keyed on the first two columns | Runs as a process in the page / kernel host. Update mode is a raw UPDATE without model events (as the Java). No delete |
| Role access for plugin rows | `erp/plugin_registry.js` §PLUGIN-ROLE-ACCESS | A window brought by a bundle's `manifest.dictionary` gets access rows for every active non-manual role | Ninja bundles stage through `activate()` → `stageModels`, not `manifest.dictionary`, and `ninja_stage.js` writes no access row: **a Ninja-staged window gets none** (§7 b). A gap to close in M3 |
| The door | `common/door/door.js`, `verbs.json`, `erp_cli.js` | `erp.find/actions/describe/read/complete/void/close/reverse`; an AI's write is held as a claim | `erp_cli.js` boots seed + patches + its op-log. It loads **no plugin** and its op-log has **no DDL op**: a new table cannot be replayed today |
| CSV | `erp/xlsx.mini.min.js` (SheetJS) is what reads workbooks; the window toolbar has a `CSVImport` button entry (`ad_toolbar.js:20`); record export to CSV exists in the page (`idempiere.html` `_exportRecordsCsv`) | | The mini SheetJS build reads and writes CSV, **only safe with `raw: true`** (§7 c). The toolbar's `CSVImport` is a button image only; a third loader exists, the File Import form with AD_ImpFormat (§7 d) |
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
| Read | `erp.read`, `erp.list … --csv` | object layer, the kept image | read by number: done (bim-ootb #2830); list and CSV: R.V item 5 |
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
- **M0 Measure, no code.** (a) Which AD columns does `stageModels` leave empty that the window engine, `ad_access.js`, the model layer or team replication read? List them per table, from the code. (b) ✅ answered, §7: no. (c) ✅ answered, §7. (d) ✅ half answered, §7: still to read, what `GridTabCSVImporter.java` and the File Import form do that `MigrateExcelData` does not, so that **one** loader is offered at the door and the other two are named as its legacy siblings, not rebuilt. (e) What do `ImportModel.java` and `DeleteModel.java` do beyond what `ninja_stage.js` ported? (f) Ids: staging gives ids by position from 7,000,000; two people adding different CSVs in a different order get different ids. Does team replication (`prompts/TEAMWORK_FRAMEWORK.md`) key these rows by id or by `_UU`? Write the answers into §7 here before M1.
- **M1 CSV → model.** The reader of §3.2, over SheetJS with `raw: true` (no new CSV parser; the same library writes the CSV of NEURO §R.V item 5, so read and write share one module and one round-trip witness); W-MIS-CSV-MODEL, W-MIS-CSV-REFUSE.
- **M2 Stage at the door.** `erp.add_window` (generated into `verbs.json`); dictionary rows as ops; the generic boot table step, retiring the hand DDL it supersedes; W-MIS-STAGE, W-MIS-REPLAY, W-MIS-SAME.
- **M3 Twin and access.** Close the gaps M0(a,b,e) found; W-MIS-ORACLE, W-MIS-ACCESS, W-MIS-WINDOW (the sweep, X of N).
- **M4 Browser.** `.csv` on the Create face; the emitted bundle; the same rows as the door (extend W-MIS-STAGE).
- **M5 Load.** `erp.load` over the Migrate Excel Data process, one CSV = one sheet; the update-mode decision; W-MIS-LOAD.
- **M6 The rest of CRUD.** `erp.update`, `erp.delete`; with R.V items 2 and 5 landed: W-MIS-ROUNDTRIP. `erp.remove_window`; W-MIS-REMOVE.
- **M7 Guide.** A section "Your own tables" in `docs/FastScriptGuide.md`, generated and witnessed on the served page (W-MIS-GUIDE); a film only on the owner's go.
**Depends on:** NEURO §R.V item 1 (done), item 2 (`erp.new`) for M6, item 5 (list and CSV) for M6 and the round trip. M1 to M5 need none of them.
**Not in scope without the owner's go:** workflow nodes and approval for `workflow=Y` tables beyond Ninja's column set; reports and print formats; translation tables; callout code (a CSV may name a callout that a bundle ships, it never carries code); kanban; the email actor; anything on the GPU.

## 6. Questions for the owner (one at a time; the advice stands until overruled)
1. **The sheet's shape.** Advice: §3.2, one row per column, because the owner's words are "containing the table properties" and nothing is guessed from data. The alternative is a natural sheet whose headings carry Ninja prefixes (`A#Cost`, `D#PurchaseDate`) and whose rows are the data, so one file is both the window and its first load. It is shorter for a user and can be added later as a second reader onto the same model. Which first?
2. **The oracle.** Advice: the owner's Ninja (`ImportModel`) decides which rows exist and their shape, as the owner said "as Ninja would do"; where Ninja leaves an AD column to core defaults, core's `CreateTable` / `CreateWindowFromTable` / `ColumnSync` decide the value. Is that the intended split?
3. **Update by sheet.** The loader's update mode is a raw UPDATE with no model checks, as the Java. Advice: at the door, route updates through the model's save (checks run, slower), and keep the raw mode only inside the process as legacy has it. Agree?

## 7. M0 findings (2026-11-10: b, c, d answered from the code and one run; a, e, f still open)
- **(b) Role access: none.** `ninja_stage.js`, `ninja_bundle.js` and `ninja_create.js` contain no access write (grep `window_access`, `updateAccessRecords`: 0 hits). The host's §PLUGIN-ROLE-ACCESS step acts only on rows a bundle ships in `manifest.dictionary` (`plugin_registry.js` `stageDictionary`, L337-377). A Ninja-staged window therefore has no AD_Window_Access row. Read from code, not run: M3 must show it on a role-enforced open before fixing it (the fix that fits the law: the Ninja bundle ships its rows as `manifest.dictionary`, so the host's one access step covers it, and no second access writer is added).
- **(c) CSV reading: SheetJS does it, with one trap.** Run on `erp/xlsx.mini.min.js` in Node: `XLSX.read(text, {type:'string'})` gives `§CSV_READ sheets=Sheet1 ref=A1:C4`, a quoted cell with commas and a quoted cell with a newline and doubled quotes both read whole. By default it **coerces**: `007` → number 7, `1e5` → 100000, `2026-11-10` → a date serial (`§CSV_COERCE`). With `raw: true` every cell stays text (`§CSV_RAW A2="007" A3="1e5" A4="2026-11-10"`). `XLSX.utils.sheet_to_csv` exists. So: no new parser; `raw: true` always; W-MIS-CSV-REFUSE gains a row (a value `007` must arrive as `007`). Not run in the page.
- **(d) CSV import in the window: not wired; a third loader exists.** `ad_toolbar.js:20` lists `CSVImport` and `FileImport` as button images only (grep finds no handler). `idempiere.html:4188-4226` registers the legacy form `org.compiere.apps.form.VFileImport` (pick an AD_ImpFormat, load a file, preview, save as one group of creates). So three import paths exist in legacy and two are ported: Migrate Excel Data (process) and File Import (form); the grid's CSV import (`GridTabCSVImporter`) is not.
- **(a), (e), (f), rest of (d): ANSWERED 2026-11-13, see §8.** (The line that said "open" is superseded.)

## 8. M0 findings, second half (2026-11-13; read from bim-ootb `origin/main` and the legacy sources by a read-only helper; the lines marked ✔ were re-read by the coordinator; nothing built)
**(a) What `stageModels` writes, and what the engine then finds empty.** ✔ `erp/ninja_stage.js` inserts: AD_Window (id, Name, Description, WindowType, IsActive, L171); AD_Table (id, TableName, Name, Description, AD_Window_ID, IsActive, L179); AD_Tab (id, window, Name, table, TabLevel, SeqNo, IsActive, L188); AD_Column (id, table, ColumnName, Name, Description, reference, FieldLength, **IsMandatory always 'N'**, IsKey, IsParent, IsIdentifier, Callout, DefaultValue, IsActive, L212-216); AD_Field (id, tab, column, Name, SeqNo, IsDisplayed 'Y', IsReadOnly 'N', IsActive, L223); AD_Menu and AD_TreeNodeMM. **Never written: any `_UU`, AD_Client_ID, AD_Org_ID, EntityType, AccessLevel, IsDeleteable, IsUpdateable, IsAllowCopy, IsSingleRow, FKConstraintType, AD_Reference_Value_ID; no AD_Window_Access row; no AD_Element; no AD_Reference/AD_Ref_List for a List column.** The seed's tables give those columns no default, so they are NULL. What that does at the door (reader, file:line at origin/main):
| Empty on a staged window | Reader | Effect |
|---|---|---|
| `AD_Column.IsUpdateable` | `object_cli.js` `shape` L239, `describe` L169; `mis_core.js` `editable` | `describe` says every column is not updateable, so **the Edit form is empty**; yet `erp_cli.js` `notEditable` L338-341 tests `=== 'N'` and lets `mis.update` through: the two disagree |
| `AD_Column.IsMandatory` = 'N' always | `describe`, `mis.new` | a CSV `Mandatory=Y` cannot be honoured |
| `AD_Column.IsAllowCopy` | `model_layer.js` L281-283 (`!== 'Y'`); `mis_core.js` `copyable` | copy-record copies nothing |
| `AD_Table.AccessLevel` | `ad_access.js` `isTableAccessLevel` L145-154 | under a role (§17 of the CLI file) a non-System role's `canUpdate` is refused: **no write under `role=`** |
| no `AD_Window_Access` row | `object_cli.js` `roleFor` | under `role=` the kind is refused: "not granted a window" (the same fact as §7 b, now reachable at the door) |
| `AD_Table.IsDeleteable`, `AD_Tab.IsReadOnly` | `erp_cli.js` `deleteRecord` L392-394 | NULL passes: delete is allowed (legacy Ninja sets IsDeleteable true: same outcome) |
| `AD_Column.FKConstraintType` | `model_layer.js` L530-538 | blank becomes NoAction: deleting a master that has detail rows is refused |
| `AD_Table.AD_Table_UU` | `object_cli.js` `kindOf` L67 | the staged kind is missing from the "known kinds" list of an unknown-kind error |
| `ad_ddl_notnull` / `ad_ddl_unique` / `ad_ddl_default` side tables | `model_layer.js` L83, L363, L398 | no NOT NULL, unique or default check runs on a staged table |
**(d) What the grid's CSV import does that the ported loader does not** (`GridTabCSVImporter.java`): key columns in the header (`Column/K`, `/KT` = one transaction for the file, L384, L873-885); `Column[Foreign]` lookups (L385); master and detail rows in ONE file (`Child>Column`, L410-418); Insert / Update / Merge modes (L92-94); an `_err.csv` and a `_log.csv` (L90-91); a validating pre-pass (L197-199); one transaction per master with its details (L252-255); it runs through the window's tab, so a column not on the tab is refused (L1000-1006); it starts the document action after the save (L564-575). **Decision carried (§5 d): `mis.load` stays the one loader at the door; this one is named as its legacy sibling, not rebuilt.** Note the overlap: `mis.load`'s `.rejected.csv` / `.ok.csv` are this importer's `_err.csv` idea.
**(e) What the owner's Ninja does that the port does not** (`ImportModel.java` L16 wraps `utils/HandleCSVImport.java`, `model/MRO_ModelMaker.java`, `utils/NewEmptyTable.java`, `utils/AddTable.java`): table AccessLevel "3" and IsDeleteable (`MRO_ModelMaker.java` L120-130); `IsUpdateable=true` on every column, EntityType (`NewEmptyTable.java` L170, L244); the `_UU` column and AD_Element rows (L57-92); a List column's AD_Reference + AD_Ref_List (L196-226); the tab's link columns for a detail (`MRO_ModelMaker.java` L906-910); window access for every non-manual role, which comes from core `MWindow.afterSave` L233-246 when the window is saved (Ninja writes none itself); **the ColumnSet inferred from a CSV's header by name when it is empty, and the same CSV's rows loaded** (`HandleCSVImport.java`: this is the "natural sheet" of §6 question 1, already the owner's own behaviour); the workflow set with AD_Workflow, nodes and AD_Process (L159-181, L399-428); InfoWindow, Kanban, PrintFormat (out of scope, §5). `DeleteModel.java` L17: refuses when the table HAS DATA, refuses Dictionary-entity rows, really deletes (menu node, menu, window, tabs, fields, columns, table), works on ONE model, has a test mode; `rollbackModel` ✔ (`ninja_stage.js` L270) sets `IsActive='N'` on EVERY row with id >= 7,000,000: **all staged models at once, no data check**.
**(f) Ids and UUs.** ✔ Ids are by position from 7,000,000 (`ninja_stage.js` L30, sub-ranges +100,000 per class), shifted to a free slot; the shipped seed already holds `AD_Table 7000000 = C_Attendance (inactive)`, so the first staged model lands on slot 1. Staged dictionary rows carry **no `_UU`** (✔ one mention of `_UU` in the file, no insert). Team replication addresses a row by its `<table>_uu` only; "a seeded row with no `<table>_uu` cannot be addressed" (✔ `team_sync.js` L17-23). So: two people staging different CSVs get the SAME numeric ids for DIFFERENT tables, and a staged window cannot be shared by the team layer at all today.
**NOT verified (the helper's own list):** whether the boot patches add defaults over the seed for the columns above; whether `ninja_bundle.js` / the plugin host adds ids or UUs around `stageModels`; whether `table.delete` in DeleteModel drops the physical table; how a receiving device applies an op whose uu it lacks.
**What M0 changes in the work order (advice; nothing below is decided for the owner):**
1. **M2 cannot be "write `stageModels`' rows as ops" unchanged.** The rows it writes do not make a working window at the door: the Edit form is empty and nothing works under a role. M2 must stage the columns of the table above too, each with the value the owner's Ninja or core gives (AccessLevel 3, IsDeleteable Y, IsUpdateable Y, IsAllowCopy as core's default, EntityType, window access for non-manual roles). That is M3's "close the gaps" pulled forward, because without it W-MIS-STAGE would pass on a window nobody can edit.
2. **Deterministic `_UU`** from the names (`uuidV5(table / column name)`, the pattern the BIM Document bundle already uses) answers (f): the same CSV gives the same UUs on every machine, and the team layer can address the rows. Numeric ids stay positional and local.
3. **`mis.remove_window` must not be `rollbackModel`** as it stands (it deactivates every staged model and checks no data): one model, refuse when the table has rows, as DeleteModel does.
4. **Question 1 of §6 has a fact behind it now:** the owner's Ninja already infers the columns from a natural sheet's header. The advice (properties sheet first) stands, but the second reader has a legacy owner to port from, not to invent.

## STATUS
2026-11-13: M0 COMPLETE (§8: a, d, e, f answered; four consequences for M1-M3 listed). Next: M1 (CSV to model). 2026-11-10: spec written, reviewed once, M0 half answered (§7). Nothing built.
