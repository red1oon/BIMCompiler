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
**Batch (`[L]` or the line `erp.load file=suppliers.csv table=C_BPartner dry=Y`):** a **preview** first: `120 rows: 114 ok, 6 rejected` with the row number and reason of each rejection; `[C] commit  [Q] quit`; the rejected rows are written to `suppliers.rejected.csv` (never silently dropped); commit loads the 114 and prints their keys. A loaded file is the same shape `erp.list --csv` writes (round trip, MIS W-MIS-ROUNDTRIP).
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
3. **Edit = one `erp.update`** with only the changed columns (model save: callouts and checks run as in the window; the raw-UPDATE mode of the Java loader is NOT offered here: MIS question 3, advice stands). **Delete = one `erp.delete`** (the model layer's delete, as the toolbar's Delete): masters and drafts only; processed documents get Void/Reverse.
4. **Load = `erp.load` with a dry-run preview** that writes nothing, then commit. Reads CSV with SheetJS `raw: true` (007 stays 007).
5. **Plain terminal:** no cursor control, no color needed (`--plain`), 80 columns, works over ssh and a pipe; keys are lines (Enter ends them).
6. **Roles (A6):** with a role given, columns and rows the role may not see are not listed and not editable; without a role nothing is filtered, and the first screen says so.

## 4. Witness claims (written first; each names its issue; each can say NO-OP, VACUOUS, INCONCLUSIVE). The witness drives the IVR through stdin; no human looks at a screen (PRIMAL LAW)
- **I1 one line per key, nothing else runs.** The door journal's lines for a session = the `→` lines the screens printed, in order. Issue: the IVR doing work the screen did not show.
- **I2 pick maps to the right record.** Pick row n → the record number of row n of the same `erp.list` (a list with a duplicate description, so a wrong mapping shows). 
- **I3 the edit screen equals the dictionary.** The editable columns shown = `erp.describe`'s updateable+displayed set; the `*` marks = the mandatory set; pressing Enter on every prompt writes nothing (no-op reported).
- **I4 save = the window path.** After an IVR edit the stored row equals the row `erp.update` alone produces, and equals the row the window's save path produces for the same change (callouts fire: change the partner and the price list follows). 
- **I5 delete.** A draft is deleted only after the confirm word; a completed document is not offered Delete (Void/Reverse instead); deleting a master referenced elsewhere is refused with the reason, nothing written.
- **I6 batch.** The dry-run counts: ok + rejected = the CSV's rows; the rejects file holds exactly the bad rows with their reasons; commit inserts exactly the ok rows; nothing is written by the dry-run (op count unchanged); a round trip (`erp.list --csv` then `erp.load`) reproduces the rows.
- **I7 a session replays.** `session.door` run through `door.js --script` on a fresh copy reaches the same final rows.
- **I8 role.** With a role, a column the role may not read never appears in the list or the edit screen.
- **I9 a pipe works.** The same session fed from a file with no terminal gives the same lines (the property that lets the witness exist).
- **Falsifiers (each must make the witness FAIL):** IVR skips the confirm word (I5); IVR writes on a dry-run (I6); IVR pick off by one (I2); IVR edits a read-only column (I3).

## 5. Open questions for the owner (one at a time; the advice stands until overruled)
1. **Name and place.** Advice: `common/door/ivr.js`, a front end beside `dotted.js`; `door.js --ivr` is the same thing by another door and is not needed.
2. **Delete scope.** Advice: masters and drafts only, never a processed document (as the window); everything else by Void or Reverse. 
3. **Key style.** Advice: numbers pick a row, letters act (as COBOL and DOS screens did), both shown on the key line; no function keys (they are terminal-specific).
4. **First kinds.** Advice: start generic (any kind) and prove it on three: Sales Order (documents: complete/void), Business Partner (a master: edit/delete/load), and a MIS table made by `erp.add_window` (the "new model on the fly" part, so the owner's whole chain is one demo).
5. ✅ **C on a row: DECIDED by the owner's delegation (2026-11-11: "answer for me as u know my direction").** C is "Copy": a new record that starts from the pointed row's values; `[ + New ]` at the header is the blank form with only the backend's defaults. Both open the same Tab-through form. Why: it keeps one meaning per chip, it matches the owner's "insert where the user tabs through and types", it makes the per-row chip useful (a copy beats retyping a similar partner), and the window has both (`dataNew(copy)`). Revisit after the first real use.
6. ✅ **Undo: DECIDED the same way: no undo chip in v1.** Delete already asks Y/N and every write is a journalled op; a `[ Z Undo last ]` can follow once the op-log's history is shown to be safe to rewind. 

**Stance (owner, 2026-11-11): this is still a POC; we see how it goes as we progress.** Success of the POC = the §1a spike works end to end on one kind with T1-T3, and the owner can drive it without being told what to press. Nothing here is a promise beyond that.

## 6. Work order (spec line first, witness with falsifier, one PR per step)
- **V0 Measure, no code.** Which columns `erp.describe` lacks that the edit screen needs (display logic, read-only logic, the lookup list for a reference); what `GridTab.dataDelete` refuses, from the source; what the Migrate Excel Data loader reports per rejected row (for the preview).
- **V1 The missing verbs** (MIS M5/M6): `erp.update`, `erp.delete`, `erp.load` with `dry=Y`; their witnesses; guide section.
- **V2 The list screen with the grid cursor and chips** (the spike of §1a first: T1-T3; then I1, I2, I9). The state machine is written before any renderer.
- **V3 Edit and delete** (I3, I4, I5; the twin comparison against the window path).
- **V4 Batch** (I6) and the saved session (I7).
- **V5 Role** (I8; needs A6).
- **V6 Guide and film.** A guide section "Work at the terminal, IVR style" generated from real runs; a film "ERP at the command line" only on the owner's go.
**Not in scope without the owner's go:** curses or a full-screen UI, a mouse, themes, workflow approval screens, reports, translations, the email actor, the GPU.

## STATUS
2026-11-11: spec written, nothing built; §1b (the browser gets the CLI too: renderer-agnostic core) and §1a (grid cursor, colored chips, hidden-mandatory via dry run, local-first doctrine, MIS demo) added the same day after the owner's two refinements. Depends on MIS M5/M6 and NEURO A6.
