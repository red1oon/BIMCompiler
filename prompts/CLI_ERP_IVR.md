# ⚠ DO NOT REMOVE
Scope: **SPEC ONLY** for a CLI-based ERP front end ("IVR style": list records, pick one, press a key to Edit or Delete) and batch import from a CSV, on top of the door. **Nothing here is built.** Read the log after every run of anything derived from this file. Spec first, witness with a falsifier next, code last; honour until this file is marked DONE.

# CLI ERP, IVR style — list, pick, press a key

**Owner, 2026-11-11:** *"Now that we done the 'MIS' killer part of AD concept, ie ability to create new model on the fly, go further in more CRUD detail scripting, import batch records from a CSV. But I like to make it more smarter like an IVR. Where we first list a certain record/s and then given Edit or Delete keys … essentially is like going backward to my COBOL and MSDOS days where we have no UI, just CLI to work in — a CLI based ERP. What do you think?"*
**Owner of the verbs it needs:** `prompts/ERP_MIS_WINDOW_FROM_CSV.md` §3.4 (`erp.load`, `erp.update`, `erp.delete`) and NEURO `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §R.V items 2, 5, 6, 9. This file adds only the **session layer** above them.

## ▶ RESUME HERE (next session)
Read §0 (my view), then §2 (what exists, verified 2026-11-11), then build in the order of §6. Step V0 is measurement only. The verbs `erp.update`, `erp.delete`, `erp.load` are MIS steps M5/M6: if they are not merged yet, do those first (they are useful on their own and the IVR cannot exist without them). §R.4 of the NEURO contract binds every session.

## 0. What I think (the advice, with its reasons and risks)
**Yes, build it, and keep it thin.** Four reasons: (1) it costs almost nothing new: the door already turns one line into a journalled, claim-checked action, and the IVR is only a front end that compiles each key press into ONE door line, exactly as `dotted.js` does for the dotted form (no second engine: AD-LAYER LAW 5); (2) a line-mode terminal is the one front end that works everywhere: ssh, a serial console, a screen reader, a pipe, and an AI (the AI uses the door lines directly, the IVR is the person's way in); (3) it makes the batch jobs people dread (clean up 40 drafts, load a supplier list) a short, visible, repeatable session, and the session can be saved as a door script; (4) it is the honest "no UI" ERP the owner's COBOL/MSDOS history describes, and it needs no new engine, only the three missing verbs.
**Risks, each with its guard:** (a) *a second behaviour for edit and delete* (the classic drift): every key must call the same model-layer path the window calls (`GridTab.dataSave` L985, `dataDelete` L1196, `GridTable.setValueAt` L1360 in the iDempiere source); a witness diffs the CLI result with the window path (TWIN RULE); (b) *deleting what a window would not let you delete*: documents that are processed are not deleteable in the window (`GridTab.isReadOnly`, `dataDelete`), so the IVR offers Void or Reverse for them and never Delete; (c) *a cursor-control UI that breaks over ssh or a pipe*: no curses, no raw mode, plain lines of at most 80 columns; (d) *a long edit session that loses work*: nothing is written until the person presses Save, and the screen shows the exact door line first.
**Who it is for (owner, 2026-11-11: "fast keyboard data entry clerical work even by devs who want a fast backdoor to troubleshoot").** Two audiences, one screen: (1) clerks doing repetitive entry, where the keyboard beats the mouse (the lesson of keyboard-driven business screens that never went away); (2) developers and admins who want a quick, honest backdoor to look at and fix records without opening a window or writing SQL, and whose every action is still a journalled door line. The occasional user and the manager browsing dashboards stay on the windows. The POC's test of the idea is plain: can a person drive it without being told what to press, and is a repeated task faster (measure time and errors on one task, never opinions).
**What it is not:** not a replacement for the window UI, not a report writer, not a new query language.

## 1. The experience (plain lines; every screen prints the door line it will run)
```
$ node common/door/ivr.js kind=Order docstatus=DR
Orders (Draft)                          shown 1-5 of 6
  1  50000  Standard      2026-11-11   6.00
  2  50001  Standard      2026-11-11   120.00
  ...
[1-5] pick   [F] filter   [N] new   [X] next   [S] sort   [L] load a CSV   [Q] quit
> 2
Order 50001   Draft   Standard   2026-11-11   120.00
  actions offered by the engine: [C] Complete   [V] Void
  [E] Edit   [D] Delete   [B] back
> E
Description  [Rush job]  > Rush job, deliver Friday
Sales Rep *  [101]       >
Payment Term [105]       > ?              (? = the dictionary's help for the column)
Payment Term [105]       > 1) Immediate  2) 30 days  3) 60 days   > 2
2 changes:  Description, C_PaymentTerm_ID                          [S] save   [C] cancel
→ erp.update kind=Order number=50001 description="Rush job, deliver Friday" c_paymentterm_id=106
> S
saved.   Order 50001  Draft
> D
Delete Order 50001? It is a Draft. Type DELETE to confirm >
→ erp.delete kind=Order number=50001
```
Rules: numbers pick a row, single letters are actions; Enter keeps a value, `-` clears it, `?` shows the column's help, a mandatory column is marked `*`, a lookup column takes a name (or a number from the match list it prints; an ambiguous name is refused with the matches, as `erp.new` does). The actions offered for a document are the engine's own legal ones (`erp.actions`), never a fixed set.
**Batch (`[L]` or the line `erp.load file=suppliers.csv table=C_BPartner dry=Y`):** a **preview** first: `120 rows: 114 ok, 6 rejected` with the row number and reason of each rejection; `[C] commit (only at 0 rejected)  [Q] quit`; the rejected rows are written to `suppliers.rejected.csv` (never silently dropped); commit is offered only at 0 rejects (the loader is all-or-nothing, §8.3); the good rows are also written to `suppliers.ok.csv` for a second, clean load. A loaded file is the same shape `erp.list --csv` writes (round trip, MIS W-MIS-ROUNDTRIP).
**Every session is a script:** `ivr.js … > session.door` records the lines it ran; running that file with `door.js --script` repeats the session and an AI can read it. `--dry` prints the lines and runs nothing. `!help` works on every screen.

## 1a. The terminal screen: a grid cursor with colored action chips (owner, 2026-11-11, two messages; supersedes the key-letter style of §1 on a terminal, §1 stays as the line mode)
> *"i prefer UDC to be on the right as colored codes so the user can >><> to each and enter for ease without remembering which or what to do next."* · *"The idea is always similar to WASM local first, minimalist, simple, safe, and now MIS as the killer angle which Compiere AD first debut overlooked."* · and before it: *"it lists and gives a pointer where Up/Down keys can traverse it … D (to delete, a popup for Y/N) and C (to insert, where the user tabs through and types). The mandatory fields are hidden and managed in the backend."*
```
Business Partners                                  shown 1-6 of 42      [ + New ]
   Value     Name              Group        Credit                    
 > 100001    Standard          Customers      0.00                 [U Edit] [D Delete] [C Copy]
   100002    Joe Block         Customers    250.00                 [U Edit] [D Delete] [C Copy]
   100003    Seed Farm Inc.    Vendors        0.00                 [U Edit] [D Delete] [C Copy]
   ...
 ↑↓ row   ←→ chip   Enter run   Esc back          the line it will run: erp.update kind=BPartner number=100001 …
```
**How it moves.** Up/Down moves the row pointer; Left/Right (or Tab) moves the highlight along that row's chips; Enter runs the highlighted chip; Esc backs out. There is nothing to remember: the chips are on screen, in the row. A header chip `[ + New ]` starts a blank record.
**The chips are the engine's, not a fixed set.** For a master record: U, D, C. For a document the chips come from `erp.actions` (a draft: `[C Complete] [V Void] [D Delete]`; a completed order: `[V Void] [R Reverse]` and no Delete): the screen shows only what is legal now, an illegal one is dimmed, never hidden-and-forgotten. This is how "without remembering what to do next" is kept honest.
**Colors are never the only signal** (colorblind users, monochrome terminals, a pipe): each chip carries its letter and its word, and the highlight is reverse video. `--plain` gives the line mode of §1 with no color at all.
**C is "Copy", per row, and `[ + New ]` is the blank form:** the iDempiere window has both (`GridTab.dataNew(boolean copy)`, L1151): copy takes the row's values, blank takes only the defaults. (Open question 5.)
**Forms (U, C, + New): Tab goes field to field, Enter on the last field saves after a one-line summary; Esc cancels everything, nothing was written.** A lookup field is a type-ahead list (the heaviest part of the build; V3).
**Mandatory fields are hidden only when the backend can fill them.** Today `erp.new` on an order is given 4 columns and the engine defaults 52 more (defaults, callouts, the Document No), but a mandatory column with no default (the sales rep of a partner that has none) is refused by name. So the form asks a **dry run** first (`erp.new … dry=Y`, new in V1: "what is still empty after your defaults and callouts?") and shows ONLY those fields; every other column sits behind a `[ More ]` chip; after the save the screen says what the backend filled (`52 filled by the engine: …`), so nothing is magic and the journal shows it.
**Local first, minimalist, safe (the same doctrine as the WASM twin).** The same engine runs in the page and at the terminal (Node and sql.js already do), so the terminal ERP needs no server and works offline; data lives in the local op-log; nothing is written until a chip is run, a delete needs its Y/N popup (or the word DELETE in line mode), every write is one journalled door line; **zero dependencies** (Node's own raw key input and ANSI codes; no library) is the advice and keeps the door's rule. 
**The MIS chain is the demo:** one line adds a window from a sheet (`erp.add_window`, MIS M2), and the new table is immediately listed with its own U / D / C chips and a CSV load: a person makes a table in a minute and works it with no developer, which is the end-user reach the owner says the first Application Dictionary (Compiere's debut) did not give (the owner's observation, not a claim measured here).
**How it is built so it can be proved (PRIMAL LAW: no human looks at a screen).** One pure state machine: `(state, key) -> (state, door line or none, screen lines)`. The witness feeds key sequences (`Down Down Right Right Enter`), asserts the screen text (cursor row, highlighted chip) and the ONE door line produced, and runs one real pseudo-terminal smoke (the ANSI bytes). The line mode of §1 uses the same machine with a different renderer, so an AI and a pipe get the same lines. Added claims: **T1** Right-Right-Enter on row n runs the third chip of row n and nothing else; **T2** the chips shown equal the engine's legal actions for that row (a completed order has no Delete chip); **T3** Esc anywhere writes nothing (op count unchanged); **T4** a form shows exactly the mandatory-without-default columns (dry run) and no others; **T5** the screen after a save lists the columns the backend filled, equal to the answer's `defaulted` set; **T6** the same key sequence gives the same door lines in line mode. Falsifiers: Enter runs the chip left of the highlight (T1); a completed order shows Delete (T2); Esc saves (T3); a defaulted column is asked (T4).
**First spike (the smallest thing that settles the tech, one session):** the list screen over `erp.list` with the row pointer, the three chips and the Y/N popup for D, driven by the state machine and T1-T3; no forms yet.

## 1b. Strategy and the one constraint it adds: the browser gets the CLI too (owner, 2026-11-11)
> *"This can be our big quantum leap after Bonsai to WASM, where even the Browser is given a CLI alternative."*
The step after moving the engine into the browser (WASM) is to give the **browser a CLI front end as well**: the same ERP, a terminal-style pane beside (or instead of) the windows. This is the reason the screen logic must be built as **one pure state machine with no Node-only calls**:
- **Core** (`state, key -> state, door line, screen`): plain JavaScript, no `fs`, no `process`, no `child_process`, no terminal escape codes; it runs unchanged in Node and in the page.
- **Renderers** are thin and replaceable: (a) the terminal renderer (ANSI, raw key input), (b) the browser renderer (a `<pre>`/canvas grid in the page, keys from the keyboard), (c) the line renderer of §1 (pipes, screen readers, the AI). Each takes the screen as a grid of cells (character + style) and returns key names (`Up`, `Right`, `Enter`, `Esc`, `Tab`, a character).
- **The door line** is the only way the core acts: in Node it goes to `door.js`; in the page it goes to the same door logic over the page's engine (the twin already runs in both places).
- **Witness:** T1-T6 run against the core with key names, so the same witness proves the terminal and the browser panes; one smoke per renderer.
This keeps the doctrine (local first, minimal, safe, zero dependencies) and costs nothing now except discipline: **the first review of the spike checks that the core imports nothing from Node.**

## 1c. Naming: the prefix is MIS, not ERP (owner, 2026-11-11)
> *"and the prefix for such can be MIS. instead of ERP. This is to introduce the audience to the MIS concept in our AD rather than the heavy ERP."*
**Rule.** What a person does with their own records at the terminal is called **MIS**: the front end is `common/door/mis.js` (it replaces the working name `ivr.js` used in this file), and the verbs are `mis.*`. **ERP** stays the word for a document's life (complete, void, close, reverse) and for the legacy tools. A person meets "MIS" first (a table of my own, listed, edited, loaded) and reaches "ERP" only when they need a document with a workflow: the light concept first, the heavy one later, on the same engine.
| `mis.*` (records) | what it is | same engine call as |
|---|---|---|
| `mis.add_window` | a window and table from a sheet (MIS M2) | its own verb (was `erp.add_window` in the MIS file) |
| `mis.list` `mis.read` `mis.describe` `mis.sum` `mis.group` | look | `erp.list` `erp.read` `erp.describe` `erp.sum` `erp.group` |
| `mis.new` `mis.update` `mis.delete` | change one record | `erp.new`; `erp.update`, `erp.delete` (MIS M6) |
| `mis.load` | many records from a CSV, with `dry=Y` | `erp.load` (MIS M5) |
| `erp.complete` `erp.void` `erp.close` `erp.reverse` `erp.actions` | a document's life | stay `erp.*` |
**One implementation, two names (AD-LAYER LAW 5: no second engine).** The new verbs are born as `mis.*`; for the verbs that already exist as `erp.*` the vocabulary gets an **alias entry**: `{"verb":"mis.list","alias":"erp.list"}`. The door resolves the alias to the same program call, harm class and actors (an alias may not change any of them: the door refuses a vocabulary where it does), the journal records the line as typed, `!help` shows both names ("`mis.list` (same as `erp.list`)"), the guide table lists the alias in the row of its original, and the AI connector menu is unchanged. Witness **W-DOOR-ALIAS** (V1a): an alias line and its original give the same answer (envelope equal but for `verb`); an AI's write through the alias is a claim exactly as through the original; a vocabulary whose alias differs in harm or inputs fails to load; falsifier: an alias that skips the claim for an AI.
**Where it shows.** The guide's section is "Your own tables: MIS at the terminal"; the film, if the owner wants one, is about MIS ("make a table in a minute"), not ERP; the screen header of §1a reads `MIS`, and a document kind opened from it shows its ERP chips (Complete, Void, Reverse) only because the engine says they are legal. The word ERP does not disappear: it is the engine's name, the legacy twin's, and the document verbs'.

## 1d. Type assist from the AD (owner, 2026-11-11)
> *"add into specs also about type assist from the AD, this can be reused on the browser Find panel help, ie when typing C_ it gives the common or constrained children of the model to choose from"*
**The idea.** While a person types a name, the screen offers what the **Application Dictionary** says can come next: type `C_` and get the tables of the model that start with it (the common ones first); type `c_order.` or pick a kind and get its columns; in a lookup field get the **constrained** values (a partner's own locations, the price lists valid for this document type: the column's validation rule decides, not a free list). One function, many places: the terminal list's filter and form fields, the line mode (Tab completes, as a shell does), the door's own refusals (today an unknown column already answers "no property X; its properties are: …", which is the same data as a list of suggestions), and the **browser's Find panel**, whose field help gets the same suggestions.
**One pure function, no engine of its own.** `assist(context, prefix) -> candidates[]` in the renderer-agnostic core of §1b (no Node calls, runs in the page and in the terminal). Its sources are only dictionary reads, never a hand list and never a guess:
| Context | Candidates come from | Ordering |
|---|---|---|
| a kind / table name | `AD_Table` (name, tablename) filtered by prefix; for a window the tabs of its tables | tables with a window and rows first, then alphabetical |
| a column of a kind | `AD_Column` of that table (`erp.describe` / `erp.column` already read it), updateable and displayed first | the kind's identifier columns, mandatory ones, then alphabetical |
| a value of a list column | `AD_Ref_List` of the column's reference | the list's own sequence |
| a value of a lookup (table-direct, table, search) | the referenced table's identifier columns, **restricted by the column's validation rule** (`AD_Val_Rule`, evaluated with the record's other values as the window does) and by access (role, A6) | recently used (the journal), then alphabetical |
| a document action | `erp.actions` (the engine's legal list) | the engine's order |
Each candidate carries its **reason** (`table`, `column`, `list value`, `lookup: filtered by <rule>`), shown dim beside it, so a person sees why it is offered (and a "constrained" list says what constrains it).
**Rules.** (1) No candidate that the dictionary does not hold; an empty answer is "no match" with the nearest names (edit distance) marked as such, never a made-up value. (2) A constrained list is never wider than the window's own list for the same record (the twin rule: a person must not be offered what the window would refuse). (3) Same prefix + same state = same candidates in the same order (deterministic; recency comes from the journal, which is data). (4) The list is capped and says `shown 8 of 41`.
**Witness claims (each can say INCONCLUSIVE; the witness feeds prefixes through the pure function, no human looks at a screen).** **TA1** for a prefix, the candidates equal an independent dictionary query (SQL on the seed) for the same prefix, in the stated order; **TA2** a lookup with a validation rule offers exactly the rows the rule allows for that record (an independent query for a partner's locations; a different partner gives a different list); **TA3** nothing outside the dictionary is ever offered (a prefix with no match returns no candidate, marked "nearest" if suggestions are given); **TA4** the terminal, the line mode and the browser panel give the same candidates for the same context (one function, three renderers); **TA5** with a role, a candidate the role may not see is not offered. Falsifiers: assist ignores the validation rule (TA2); assist adds a hand-listed name (TA3); the browser panel keeps its own list (TA4).
**Work order.** **V0 (measure, no code):** where the browser Find panel gets its field list and help today (read the page's code before claiming anything), and which validation rules the dictionary actually carries for the common lookups (count them from the seed). **V2a** after the list screen (V2): the pure `assist` for kinds and columns (TA1, TA3), then values (TA2), then wire it to the terminal's filter prompt and the Find panel.

## 2. What exists (read 2026-11-11 from bim-ootb main; do not re-derive)
| Need | Today |
|---|---|
| List with columns, filter, sort, paging, CSV | `erp.list` (`columns sort limit offset`, `--list/--csv/--out`), `erp.sum`, `erp.group`: done |
| Record card, legal actions, dictionary | `erp.read`, `erp.actions`, `erp.describe`, `erp.column` (who fills a column): done |
| Create one | `erp.new` (window path: defaults, callouts, mandatory, Document No): done, twin-checked |
| Document actions | `erp.complete/void/close/reverse` for Sales Order only (X = 4 of 1,157) |
| Update one / Delete one / Load many | **not built**: `erp.update`, `erp.delete`, `erp.load` (MIS §3.4, steps M5/M6). `object.update` exists for the model only |
| Roles on lists | **not built** (NEURO A6) |
| The front end | **not built**: `common/door/ivr.js` (beside `dotted.js`, the model for "a front end that compiles to door lines") |

## 3. Design
1. **One front end, one line per key.** `ivr.js` reads lines from stdin (a terminal or a pipe), keeps only the session state (kind, filter, page, the picked row, the draft edit), and for every action builds ONE door line, prints it, and sends it to the door (journal, claims and harm classes apply; an AI that runs the IVR gets claims for writes). It never calls an engine file directly.
2. **Screens come from the dictionary.** Columns of the list = the kind's identifier columns plus status (what `erp.list` defaults to); fields of the edit screen = `erp.describe`: updateable, displayed, mandatory, reference, validation rule, help; nothing is named per table (W-ERP-VERBS V5 style check).
3. **Edit = one `erp.update`** with only the changed columns (model save: callouts and checks run as in the window; the raw-UPDATE mode of the Java loader is NOT offered here: MIS question 3, advice stands). **Delete = one `erp.delete`** (the model layer's delete, as the toolbar's Delete): whatever the window allows (`GridTable.dataDelete`: not `Processed=Y`, §8.2); processed documents get Void/Reverse.
4. **Load = `erp.load` with a dry-run preview** that writes nothing, then commit. Reads CSV with SheetJS `raw: true` (007 stays 007).
5. **Plain terminal:** no cursor control, no color needed (`--plain`), 80 columns, works over ssh and a pipe; keys are lines (Enter ends them).
6. **Roles (A6):** with a role given, columns and rows the role may not see are not listed and not editable; without a role nothing is filtered, and the first screen says so.

## 4. Witness claims (written first; each names its issue; each can say NO-OP, VACUOUS, INCONCLUSIVE). The witness drives the IVR through stdin; no human looks at a screen (PRIMAL LAW)
- **I1 one line per key, nothing else runs.** The door journal's lines for a session = the `→` lines the screens printed, in order. Issue: the IVR doing work the screen did not show.
- **I2 pick maps to the right record.** Pick row n → the record number of row n of the same `erp.list` (a list with a duplicate description, so a wrong mapping shows). 
- **I3 the edit screen equals the dictionary.** The editable columns shown = `erp.describe`'s updateable+displayed set; the `*` marks = the mandatory set; pressing Enter on every prompt writes nothing (no-op reported).
- **I4 save = the window path.** After an IVR edit the stored row equals the row `erp.update` alone produces, and equals the row the window's save path produces for the same change (callouts fire: change the partner and the price list follows). 
- **I5 delete.** A draft is deleted only after the confirm word; a completed document is not offered Delete (Void/Reverse instead); deleting a master referenced elsewhere is refused with the reason, nothing written.
- **I6 batch.** The dry-run counts: ok + rejected = the CSV's rows; the rejects file holds exactly the bad rows with their reasons; commit is refused while any row is rejected, and loading `*.ok.csv` inserts exactly its rows; nothing is written by the dry-run (op count unchanged); a round trip (`erp.list --csv` then `erp.load`) reproduces the rows.
- **I7 a session replays.** `session.door` run through `door.js --script` on a fresh copy reaches the same final rows.
- **I8 role.** With a role, a column the role may not read never appears in the list or the edit screen.
- **I9 a pipe works.** The same session fed from a file with no terminal gives the same lines (the property that lets the witness exist).
- **Falsifiers (each must make the witness FAIL):** IVR skips the confirm word (I5); IVR writes on a dry-run (I6); IVR pick off by one (I2); IVR edits a read-only column (I3).

## 5. Open questions for the owner (one at a time; the advice stands until overruled)
1. **Name and place.** Advice: `common/door/mis.js` (the MIS naming of §1c; first called `ivr.js`), a front end beside `dotted.js`; `door.js --ivr` is the same thing by another door and is not needed.
2. **Delete scope.** Advice: masters and drafts only, never a processed document (as the window); everything else by Void or Reverse. 
3. **Key style.** Advice: numbers pick a row, letters act (as COBOL and DOS screens did), both shown on the key line; no function keys (they are terminal-specific).
4. **First kinds.** Advice: start generic (any kind) and prove it on three: Sales Order (documents: complete/void), Business Partner (a master: edit/delete/load), and a MIS table made by `erp.add_window` (the "new model on the fly" part, so the owner's whole chain is one demo).
5. ✅ **C on a row: DECIDED by the owner's delegation (2026-11-11: "answer for me as u know my direction").** C is "Copy": a new record that starts from the pointed row's values; `[ + New ]` at the header is the blank form with only the backend's defaults. Both open the same Tab-through form. Why: it keeps one meaning per chip, it matches the owner's "insert where the user tabs through and types", it makes the per-row chip useful (a copy beats retyping a similar partner), and the window has both (`dataNew(copy)`). Revisit after the first real use.
6. ✅ **Undo: DECIDED the same way: no undo chip in v1.** Delete already asks Y/N and every write is a journalled op; a `[ Z Undo last ]` can follow once the op-log's history is shown to be safe to rewind. 

**Stance (owner, 2026-11-11): this is still a POC; we see how it goes as we progress.** Success of the POC = the §1a spike works end to end on one kind with T1-T3, and the owner can drive it without being told what to press. Nothing here is a promise beyond that.

## 6. Work order (spec line first, witness with falsifier, one PR per step)
- **V0 Measure, no code.** Which columns `erp.describe` lacks that the edit screen needs (display logic, read-only logic, the lookup list for a reference); what `GridTab.dataDelete` refuses, from the source; what the Migrate Excel Data loader reports per rejected row (for the preview).
- **V1 The missing verbs** (first extend `mis.describe` with §8.1's columns; then MIS M5/M6), born under the MIS prefix: `mis.update`, `mis.delete`, `mis.load` with `dry=Y`; **V1a the alias mechanism** (`mis.list`, `mis.read`, `mis.describe`, `mis.sum`, `mis.group`, `mis.new` as aliases of their `erp.*` originals; W-DOOR-ALIAS); their witnesses; guide section "Your own tables: MIS at the terminal".
- **V2 The list screen with the grid cursor and chips** (the spike of §1a first: T1-T3; then I1, I2, I9). The state machine is written before any renderer.
- **V3 Edit and delete** (I3, I4, I5; the twin comparison against the window path).
- **V4 Batch** (I6) and the saved session (I7).
- **V5 Role** (I8; needs A6).
- **V6 Guide and film.** A guide section "Work at the terminal, IVR style" generated from real runs; a film "ERP at the command line" only on the owner's go.
**Not in scope without the owner's go:** curses or a full-screen UI, a mouse, themes, workflow approval screens, reports, translations, the email actor, the GPU.

## 8. V0 findings (2026-11-11, measured from code; no code written; sources cited; verbs named per §1c)
**State check:** bim-ootb `origin/main` `beec0b75`: `erp.update`, `erp.delete`, `erp.load` (born as `mis.update/delete/load`), the alias mechanism and `common/door/mis.js` do not exist (grep of `common/door`). MIS M1-M4 are not built either (`prompts/ERP_MIS_WINDOW_FROM_CSV.md` STATUS). V1 therefore starts with M5/M6; V2 onward waits for V1.
1. **What `mis.describe` (= `erp.describe`) lacks for the edit screen and type assist.** It returns, per column (`common/door/object_cli.js:85-88`): name, label, type, mandatory, updateable, key, parent, length, min, max, list values (ref 17 only). Missing, all existing AD columns: **displayed** (`AD_Field.IsDisplayed`; I3 needs "updateable + displayed"), **display logic** and **read-only logic** (`AD_Field.DisplayLogic`, `AD_Column.ReadOnlyLogic`, evaluated per record by `Evaluator.evaluateLogic`), **validation rule** (`AD_Column.AD_Val_Rule_ID`), **help** (`AD_Column.Help`, the `?` key), **always-updateable**, **field sequence**, and **the lookup list for table/search references**. Fix in the generic describe, not in `mis.js` (AD-LAYER LAW 1); §1d type assist reads the same.
2. **What the window refuses to delete** (`GridTable.dataDelete`, iDempiere `org.adempiere.base/src/org/compiere/model/GridTable.java:2163-2231`), in order: (a) tab read-only -> AccessCannotDelete; (b) record not deleteable (`m_deleteable`) -> AccessNotDeleteable; (c) table has a `Processed` column, row is `Processed='Y'`, table is not `I_*` -> CannotDeleteTrx; (d) role cannot update that client/org -> AccessCannotDelete; (e) `po.delete(false)` fails (model checks, FK) -> the logged error text. The test is the **`Processed` flag, not DocStatus**: §3 item 3's "processed documents" means that. `mis.delete` uses the same flag and prints the engine's reason on refusal. `GridTab.isReadOnly` (L1517) also makes a detail tab read-only while the parent is unsaved.
3. **What the loader reports per rejected row** (`erp/plugins/ninja_migrate_process.mjs` header F1-F11, L14-20, L117-120): errors name sheet/row/column (`§NINJA-ERR`); **F7: all or nothing, any row error keeps nothing**. **This contradicts §1's batch paragraph and I6** ("114 ok, 6 rejected, commit loads the 114"). TWIN RULE: `mis.load` keeps F7. Resolution with no divergence: the preview lists every error (`120 rows: 6 rejected`), writes `*.rejected.csv` and `*.ok.csv`; **commit is offered only at 0 rejected**; the good rows are loaded by loading `*.ok.csv`, a separate all-or-nothing load. I6 reads: ok.csv + rejected.csv = the input rows; commit refused while any reject; loading ok.csv inserts exactly its rows. (Applied in §1 and §4 above.)
4. **Edits applied:** §1 batch paragraph, §3 item 3, §4 I6, §6 V1 (extend `mis.describe` first), STATUS.

## 9. V1-a spec: `describe` carries the edit-screen columns (2026-11-11, written before the code and its witness)
**Issue it removes:** the edit screen (I3) and type assist (§1d) would have to read AD tables themselves, a second dictionary reader (AD-LAYER LAW 5). The one reader is `object_cli.js describe` (`erp.describe`/`mis.describe`); it adds, per property, only what the dictionary holds:
`displayed` (the AD_Field of the kind's FIRST tab, as `childTabs` picks it: lowest tablevel, seqno; no field = false), `seq` (that field's SeqNo), `displayLogic`, `readOnlyLogic` (column's, else field's), `fieldReadOnly` (AD_Field.IsReadOnly), `alwaysUpdateable`, `help` (column's, else field's), `valRule` `{id, code}` (AD_Val_Rule), `lookup` `{table, key, display}` for references 18/19/30 (AD_Ref_Table; 19 = the column name minus `_ID`). Values the dictionary leaves empty are omitted, never defaulted (PRIME RULE). Existing keys unchanged (the O1 count and the kept-image check stay valid).
**Claims (witness W-ERP-VERBS-DOOR, section D; each names its issue; falsifier `ERP_BREAK=descfield`):**
- **D1 displayed = the dictionary.** For `kind=Order` the count of properties with `displayed:true` equals an independent `sqlite3` count of the first tab's active AD_Field rows with IsDisplayed='Y'. Issue: edit screen shows hidden or misses shown columns. VACUOUS if the count is 0.
- **D2 logic carried.** Every column whose AD_Column.ReadOnlyLogic is non-empty has that exact string as `readOnlyLogic`; the number of such columns equals the SQL count. VACUOUS if 0.
- **D3 rule and lookup.** The number of properties with `valRule` equals the SQL count of active columns of the table with AD_Val_Rule_ID set, and each `code` equals AD_Val_Rule.Code; every ref-18/30 property has a `lookup.table` equal to its AD_Ref_Table's table name. VACUOUS if 0.
- **D4 nothing invented.** A property whose dictionary cell is empty has no such key. Falsifier `ERP_BREAK=descfield` (describe fills the keys with defaults) must make D4 FAIL.

## 10. Owner decision, 2026-11-11: MIS is the base, ERP gives way (supersedes the alias DIRECTION of §1c)
> *"if erp.list is similar to mis.list, then it gives way to mis. MIS is a general basic concept which AD owns but was not fully exploited as a MIS maker."*
- **`mis.*` is canonical** for every operation that is the same on any AD table, document or not: `mis.find list read describe sum group new update delete load add_window` (+ `column`, see question). One source: the dictionary. `erp.list/read/describe/sum/group/new/find` become **deprecated aliases of the `mis.*` verb** (the direction of §1c reversed): old scripts, journals, films and the guide keep working; `!help` and the connector menu show the `mis` name first and mark the `erp` one "old name".
- **`erp.*` keeps only what exists because a table is a DOCUMENT:** `actions complete void close reverse` (a DocAction column and a workflow). The light concept first, the heavy one on top of it: ERP is MIS plus document life.
- **Vocabulary design (replaces the "generator owns app:erp" rule that broke, see the 2026-11-11 study):** `verbs.json` is a composed output. Each source declares the verbs it owns (AD record operations -> `mis.*`; AD document actions -> `erp.*`; hand-written ops; aliases); one composer merges them, refuses a name claimed twice, refuses an alias that differs in harm or inputs (W-DOOR-ALIAS), keeps a stable order, and `--check` composes and compares. No source writes into another's entries.
- **Open (one question):** the four hand verbs filed under `erp.`: `erp.column` (who fills a column), `erp.compare` (twin vs legacy), `erp.pack` (workbook to 2Pack), `erp.legacy_plugin`. None is document life. Advice: `mis.column`, `legacy.compare`, `mis.pack`, `legacy.plugin`, each with the old name as an alias.

## 11. V1b spec: the composed vocabulary (2026-11-11, before the code; implements §10, owner "yes" to the rename map)
**Issue it removes:** the generator that wrote `app:'erp'` entries deleted four hand verbs (study 2026-11-11), and the MIS aliases would have been deleted the same way.
- **Sources** (each declares what it owns; no source writes into another's): `hand` = `common/door/vocab/hand.json` (every entry not derived from the dictionary); `ad-documents` = from the dictionary: `erp.find`, `erp.actions` and one verb per offered DocAction (`erp.complete/void/close/reverse`); `ad-records` = from the dictionary: `mis.describe/read/list/sum/group/new`. **Aliases** = the old names as full cloned entries: `erp.describe/read/list/sum/group/new` -> `mis.*`; the four hand verbs are renamed `erp.column`->`mis.column`, `erp.compare`->`legacy.compare`, `erp.pack`->`mis.pack`, `erp.legacy_plugin`->`legacy.plugin` with the old name an alias. (`erp.find` stays: it is by design a DOCUMENT finder and refuses a non-document, witness Fb; `mis.read` finds any record by number or name.)
- **Composer** `scripts/compose_door_verbs.js` writes `common/door/verbs.json`; `--check` composes and compares (the old `gen_erp_door_verbs.js --check` calls it). It refuses a verb name claimed twice. An alias entry is the canonical entry cloned with `alias_of`, `deprecated: true`, no `mcp_name` (the connector menu is unchanged); so every reader of verbs.json sees an ordinary verb.
- **Door:** `loadVocab` refuses a vocabulary in which an alias differs from its canonical entry in harm, inputs, calls, actors or witness; `!help` marks the old name.
- **Claims (witness W-VOCAB-COMPOSE, each names its issue; falsifiers named):** **C1** composed == verbs.json (issue: a hand edit or a stale generated file). **C2** a name claimed by two sources is refused (falsifier `COMPOSE_BREAK=nodup`). **C3** the four renamed hand verbs and every hand entry survive a regeneration, in the same order (issue: the wipe). **C4** a tampered alias (harm changed) makes the door refuse to load (falsifier `DOOR_BREAK=noaliascheck`). **C5** `erp.describe kind=Order` and `mis.describe kind=Order` give the same envelope but for `verb`; an AI's `erp.new` and `mis.new` are both claims/held alike. **C6** populations stated: aliases N, hand M, generated K; VACUOUS if any is 0.


## 12. V1c spec: `mis.update` and `mis.delete` (2026-11-11, before the code; M6 of the MIS file)
**Lines:** `mis.update kind=K (id=|number=) column=value ...` and `mis.delete kind=K (id=|number=)`. Both are `writes`, generated from the dictionary like `mis.new` (no table named). Each runs the WINDOW's path, never a raw UPDATE/DELETE.
- **Update** = open the kind's own tab, load the record, apply each given column as an edit in the order given (callouts fire, `GridTab.setValue` / `processCallout`), refuse a column the window would not let a person edit (`GridField.isEditable` L443-L585: tab or field read-only; not `IsUpdateable` on a saved record; the tab's link column; `ReadOnlyLogic`; a `Processed='Y'` record unless `IsAlwaysUpdateable`), refuse a mandatory column left empty, then `ML.save(tx, table, row, changes)` with the changed columns (the edits plus what their callouts derived), persisted as ONE group. No change at all = NO-OP, said so, nothing written (PO.save `!is_Changed`, model_layer L392).
- **Delete** = the window's Delete: the tab must allow it (tab not read-only, table deleteable), then `ML.run(.., {timing:'DELETE', id})` (GridTable.dataDelete L2163-2231: refuses `Processed='Y'` with CannotDeleteTrx, model/validator vetoes, dependent records `fkOnDelete`, cascades per the dictionary FK rule), persisted as one group. The refusal carries the engine's own reason text.
**Claims (witness W-MIS-CRUD; each names its issue; each can say NO-OP / VACUOUS; falsifiers `MIS_BREAK=`):**
- **U1 only the named columns change.** After `mis.update` of a Draft order's Description, the stored row equals the row before except Description, Updated, UpdatedBy. Issue: an edit that touches other columns.
- **U2 callouts fire as in the window.** `mis.update c_bpartner_id=<other>` on a Draft order moves the same derived columns (price list, bill-to) that `mis.new` with that partner derives (same engine, independent path). Falsifier `MIS_BREAK=nocallouts` must FAIL it.
- **U3 a column the window would not edit is refused** naming the column and the rule, nothing written (op count unchanged): a not-updateable column, and any column of a Completed document. Falsifier `MIS_BREAK=noeditcheck` must FAIL it.
- **U4 mandatory cleared is refused,** nothing written.
- **U5 no change = NO-OP,** said so, op count unchanged.
- **D1 a Draft document is deleted** with its lines (cascade per the dictionary): row and child rows gone, one CRUD_DELETE group.
- **D2 a Completed document is not deleted:** refused with the engine's text (CannotDeleteTrx), nothing written. Falsifier `MIS_BREAK=noprocessed` must FAIL it.
- **D3 a referenced master is refused with the reason,** nothing written (the partner of a document).
- **D4 the vocabulary:** `mis.update`/`mis.delete` are generated entries, harm `writes`, actors human+ai; an ai's line is a claim exactly as `mis.new`'s; no table named in `erp_cli.js` (V5).


## STATUS
2026-11-11: spec written; V0 measured (§8), nothing built, next V1 = extend `mis.describe` then M5/M6; §1d (type assist from the AD, shared with the browser Find panel); §1c (the prefix is MIS, aliases over one engine); §1b (the browser gets the CLI too: renderer-agnostic core) and §1a (grid cursor, colored chips, hidden-mandatory via dry run, local-first doctrine, MIS demo) added the same day after the owner's two refinements. Depends on MIS M5/M6 and NEURO A6.
