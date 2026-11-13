# ⚠ DO NOT REMOVE
Scope: the film **"Command Line ERP"** (owner, 2026-11-11: *"Do the film 'Command Line ERP' - Light weight hands-on only ERP that talks to AI, Email, devices. Runs off Kernel ERP and legacy iDempiere."* then, on the question what to do about email and devices, which are not built: *"Just use that one page One Door diagram which explains the caveat. It is the concept that is important and this is a prototype poc."*). English only (owner: no Thai now). Read **every log under `scripts/film_command_line_erp/out/` after every run**; an exit code is not evidence. Spec first; the film is built only from real runs.

# FILM — Command Line ERP

## What it may and may not say (PRIME RULE: extract, do not invent)
- **Shown live, from real runs (every number and every answer on screen is read from `out/facts.json`, written by `facts.js`):** the person at a terminal (`mis.js` list, pointer, buttons, the one door line each key runs); a new record by form (the dry run asks only for what the engine cannot fill); an edit that sends only the changed column; a delete the engine refuses in its own words; a CSV preview and load; an AI's write held as a claim until a person confirms it; the same door asking legacy iDempiere (`legacy.status`, `erp.compare` of an order against the real one).
- **Email, phone, device:** NOT built. They appear only on the One Door page, which says "planned, not built" in the diagram's own words (`docs/figs/one_door.svg`: Mailbox, Phone, Device). The voice says so in one sentence, and the end card says "prototype". The film never shows an email, a phone or a device doing anything. (Contract §0.9: email as an actor is specified, not built; Teamwork's post box is a relay, not an actor.)
- **"Runs off Kernel ERP and legacy iDempiere":** the `mis.*` verbs run on the Kernel ERP (the twin). The same door also asks the legacy server (`legacy.status`, `erp.compare`, `legacy.query`). The film does NOT say a `mis.*` write goes to the legacy server.
- **No proof talk in the voice** (owner, 2026-11-10: say "check", never "witness"), no "first/novel", no private client name, no "JELAPANG".

## Beats (target 2:30 to 3:15; two voices as in "From AI to Human": F asks, M explains)
| id | picture | facts spoken (from facts.json) |
|---|---|---|
| title | "Command Line ERP", kicker, "a prototype" | – |
| intro | "Before windows there was a prompt." | – |
| list | a real `mis.js --plain` screen: rows, the pointer, the buttons | `list.total` (records of the kind) |
| keys | the line a key will run, printed on the screen | `keys.lines` (door lines the session ran) |
| new | form: asks only what the engine cannot fill; the one line; the engine's fill count | `new.mandatory`, `new.filled` |
| edit | Edit form; only the changed column is sent | `edit.changed` |
| delete | the engine refuses, in its words; a Y/N popup precedes any delete | – |
| load | CSV preview: rows, ok, rejected; `.ok.csv` loads | `load.rows`, `load.ok`, `load.rejected` |
| ai | `--actor ai mis.new …` → claim; a person confirms; it is written | `ai.status` |
| legacy | `legacy.status` UP; `erp.compare` twin order vs legacy order | `legacy.verdict`, `compare.match`, `compare.diff` |
| onedoor | the One Door page, with "planned, not built" kept | `onedoor.built`, `onedoor.planned` |
| light | measured: size of the screen core and the driver, no dependency, runs in a terminal | `light.coreLines`, `light.driverLines` |
| close | "A prompt, a pointer, one door. Prototype. Open source." + the guide URL | – |

## Checks that replace a human viewing (PRIMAL LAW; each can say NO-OP / VACUOUS / INCONCLUSIVE)
- **G guard** (`guard.js`): every spoken figure is in `facts.json` with that value and its word is in the beat's text; no proof talk. INCONCLUSIVE if nothing was judged.
- **H honesty** (`guard.js`): the narration never says an email, phone or device *does* something: the words email/mail/phone/device appear only in beat `onedoor`, and that beat's text contains "not built".
- **C cards** (`cards.js` log): no card overflows (`overflow_px=0`), the bottom 230 px stay free for captions (PLAYBOOK C).
- **S frames** (`record.js`): frames on the encoded file equal the frames planned (`§FILM_DONE … planned`).
- **A fit** (the fit log): every voice slice fits its beat (DETAIL ok, none WRONG).
- **L loudness** (mux log): two-pass loudnorm to the target, silences listed.
- **F facts live** (`facts.js`): every command ran with `status` as expected (a refusal where the beat shows a refusal); any other status stops the build.

## Build
`OOTB=<bim-ootb main> COMPILER=<this checkout> OUTMP4=~/Videos/Command_Line_ERP_EN_rc1.mp4 scripts/film_command_line_erp/build.sh` (CPU only, no GPU, no paid call; the voice is the local Kokoro). Needs the legacy stack UP (read only: this film never refreshes it; the shared test instance belongs to another session's work) and legacy order 50981 for the compare.

## STATUS
2026-11-11: **rc2 BUILT** (`~/Videos/Command_Line_ERP_EN_rc2.mp4`, 118.25 s, 1920x1080 24 fps). Logs `scripts/film_command_line_erp/logs_rc2/`. Evidence: G guard PASS facts=17 bad=0, H honesty PASS (mail/phone/device only in `onedoor`, which says "not built"; the figure says planned=Mailbox/Phone/Device, built=AI/Person); C cards 225 stills, overflow 0 on all 13 beats; S frames 2838 = 2838 planned = 2838 encoded; A fit: 12 slices DETAIL, 0 SHORT/WRONG, question tones 10 OK / 0 WRONG; L loudness -16.4 LUFS (LRA 3.9), the only silence over 2 s is the title card (3.9 s, no voice by design); captions 36 events, overlaps_left=0; F facts all live (legacy UP read only; compare 70 match / 4 differ against legacy order 50981; AI claim then person confirms ok). rc1 had two question tones measured WRONG ("Can an E R P still work that way?", "Who else can talk to it?"); both reworded and re-measured through the same fit script before rc2. Not done: the narration's one-line description of "runs off legacy" is only `legacy.status` and `erp.compare` (reads); no `mis.*` write goes to legacy, and the film says so by not showing it. A native listener has not judged the voice.

## FOLLOW-UP FILM — "A table of your own, in one line" (2026-11-14; **rc1 BUILT**, see its STATUS at the end of this section)
**Owner, 2026-11-14:** *"Enough new stuff to do a follow up film? What can be the highlights? Don't forget the cover 2 tone Chapter card and a last card on prior art learning."* On the proposal of a short film on the sheet, the one line, the first record, the refusals and the restart, with the role and the faulty sheet left for a third film: *"Yes, agree"*.
**▶ RESUME HERE for this film: rc1 is built (STATUS below); what is left is the owner's viewing and the decision to publish.** How it was built: Clone `scripts/film_command_line_erp/` (facts.js, cards.js, narr.js, guard.js, record.js, tsv.js, build.sh) to `scripts/film_table_of_your_own/`; the pipeline, the voice (local Kokoro), the checks and the "read every log" rule are the first film's. Needs bim-ootb main with #2936 (`mis.add_window`), #2942 (list values) and the stamp fix (PR from `fix/door-stamp-new-rows`: verify it is merged first). CPU only, no GPU, no paid call, no legacy server (this film asks legacy nothing).
**Target:** about 90 s, English only, two voices as the first film (F asks, M explains).
### What it may and may not say (PRIME RULE: extract, do not invent)
- **Shown live, from real runs (every figure from `out/facts.json`):** a properties CSV; `mis.add_window file=AST_Asset.csv` and its answer; `mis.js` on the new, empty kind; `+` and the first record; a refusal for the missing mandatory Name; a refusal for a list value outside the sheet's list, with the valid values; the record's Created, CreatedBy and UU; a second process that still has the window and the row.
- **NOT built, never shown or implied:** a detail tab (`master=`); loading a CSV as a role; the browser's Create face taking a CSV; a parallel run against a real Ninja on legacy; sign-in (the user is a stated default). The role filter and the faulty-sheet list are built but are kept for a third film (owner's choice of the short cut).
- **"No code":** true of the window (no code is written for it; the generic engine runs it). Do NOT say "no developer was involved in the product". Say "prototype" on the end card, as the first film.
- No proof talk in the voice ("check", never "witness"), no "first/novel", no private client name.
### Beats
| id | picture | facts spoken (from facts.json) |
|---|---|---|
| cover | **the two-tone chapter card, house typography** (`scripts/film_unicenta_till/cards.js` `chap()`, L67-70: kicker coral, line 1 off-white, line 2 coral, one sub line, plain `#0b0f17`, silent ~3.6 s): kicker "COMMAND LINE ERP · PART 2", line 1 "A table of your own,", line 2 "in one line", sub "a spreadsheet's columns become a working window" | – |
| sheet | the CSV as text: its heading line and the column lines | `sheet.columns` (how many the person wrote) |
| oneline | the line typed, then its answer: table, window, columns | `add.ops` (rows written), `add.standard` (columns added for you), `add.roles` (roles given access) |
| empty | `mis.js` on the new kind: "no record yet: press + to make one" | – |
| first | `+`, the form asks only for Name, the one line it will run, the saved row | `first.asked` (fields asked), `first.filled` (columns the engine filled) |
| refuse1 | `mis.new` without Name: refused, naming it | – |
| refuse2 | a condition outside the list: refused, the valid values listed | `refuse2.valid` |
| stamp | the record read back: Created, CreatedBy, the UU | – (say "who made it and when", not the values) |
| restart | a new process: the list still shows the row | `restart.total` |
| priorart | **the last card, "what this learned from"** (the pattern of `scripts/film_unicenta_till/cards.js` L108): only sources this lane READ, each with what was taken: (1) Compiere / iDempiere Application Dictionary: one generic engine runs any window from dictionary rows; (2) the owner's Ninja plugin (`org.red1.ninja`): the column grammar and the stager, and its own habit of reading a sheet's header; (3) iDempiere core `TabCreateFields`, `MWindow.afterSave`, `PO.set_Value`: which fields show, who gets access, how a list value is refused; (4) iDempiere's grid CSV importer: the idea of a rejected-rows file. The owner's remark may be quoted as his: the dictionary "was not fully exploited as a MIS maker". **Nothing else goes on this card without a source read first** (no product comparisons from memory; `reports/BIM AI verb prior art.md` is about AI verbs on BIM models, not this subject). |
| close | "One sheet, one line, a working window. Prototype. Open source." + the guide URL | – |
### Checks that replace a human viewing (as the first film: G guard, C cards, S frames, A fit, L loudness, F facts live), plus
- **N not-built** (`guard.js`): the narration and the cards hold none of: master, detail tab, sign in, browser, legacy Ninja run, role (kept for film 3).
- **P prior art** (`guard.js`): every line of the `priorart` card maps to an entry of a small `priorart.json` that names the file read (path and line) for it; a line with no entry fails the build.
- **F facts live:** `refuse1` and `refuse2` must come back `refused`, `restart` must be a separate process; any other status stops the build.
### Nearby tools on the last card (owner, 2026-11-14, while the film was being built: *"it be good to research if anyone else does such CLI MIS to say on the last card too"*)
A read-only web search was run on 2026-11-14 (generic technical queries, no names). The thing looked for has six parts: (1) defined from a CSV or sheet of column properties, (2) one command, (3) a terminal list/edit screen driven by keys, (4) validation and allowed-value lists from the definition, (5) role access and audit columns with no extra code, (6) on a real ERP's dictionary engine. **Result: in the pages fetched, no single tool had all six.** The closest three, each with the gap that remains, are the card's "nearby" lines (`scripts/film_table_of_your_own/priorart.json`, each with the URL fetched):
| Tool | Has | Gap |
|---|---|---|
| iDempiere "Create Window, Tab & Field from Table" (v8.2) | 6; makes window, tab and fields from a table | a web-client button, not a command; the table and columns are built by hand first; no CSV; no terminal screen |
| `frappe_commander` `new-doctype` (third-party app for Frappe) | 2, 6; one command makes a DocType (table, form, list) | fields are command flags, not a sheet; records are used in the web desk; no allowed-value lists; permissions fixed to one role (its own README) |
| `sqlite-utils` with VisiData (or a TUI such as deflatable) | 1, 2, 3 across separate tools | a bare SQLite file: no form, no lists, no roles, no audit, no ERP dictionary |
Also read and further away: Frappe "Create a DocType" (web Desk), ERPNext Data Import (rows only), Odoo Studio (web), Dolibarr ModuleBuilder (web, generates code), csvkit, PocketBase, Directus CLI, Hasura CLI, NocoDB, Rails scaffold, Django inspectdb + admin, JHipster JDL, schemaui, termdbms, PyLiteAdmin.
**Limits of the search, which the card states:** NOT searched: Compiere's own tooling, Tryton, Apache OFBiz, Supabase / Airtable / Baserow / Teable CLIs, Laravel generators, dBASE / FoxPro / Clipper browse screens. Three fetches failed (the iDempiere wiki tutorial 403, Tryton docs 404, one empty page). So the card says "In the pages we read, no single tool had all of it", never "nobody does this", and the voice says "we did not find them together in one tool, in the pages we read". `guard.js` refuses first / novel / unique / nobody else.
### Open, for the owner (one question; the advice stands meanwhile)
✅ ANSWERED 2026-11-14 (owner: *"Deploy the guide. Build the film"*): the guide was deployed that day (`scripts/safe_gh_deploy.sh`: guard PASS live=521 new=521, canaries 200; the live page shows "Make a table of your own" and "See and change records as a role"). Was: The guide URL on the close card points at a page that is NOT deployed with these sections yet (`CLI_ERP_IVR.md` RESUME, "Deploy the guide"). Advice: deploy the guide before the film is published, or show no URL.
### STATUS of the follow-up film
2026-11-14: **rc1 BUILT** (`~/Videos/Command_Line_ERP_Part2_A_Table_Of_Your_Own_EN_rc1.mp4`, 87.71 s, 1920x1080, 24 fps; not published). Scripts `scripts/film_table_of_your_own/` (facts.js, narr.js, guard.js, cards.js, priorart.json, build.sh; record.js and tsv.js are the first film's), logs `scripts/film_table_of_your_own/logs_rc1/`, all read. bim-ootb main `9c288d83`.
Evidence: **F facts live** all ten commands answered as the beat shows (two `refused` where a refusal is shown; the restart is a separate process). **G guard** PASS facts=7 bad=0 (5 sheet columns, 9 columns added, 12 roles, the form asks 1 field and the engine fills 6, 3 list values, 1 record after the restart). **N not-built** none named in the voice. **P prior art** 7 of 7 card lines have a source (4 local source files that exist at the cited line, 3 pages fetched). **C cards** 146 stills, overflow 0 on all 11 beats. **S frames** 2105 = 2105 planned = 2105 encoded. **A fit** 10 slices DETAIL, 0 SHORT, 0 WRONG; question tones 6 OK / 0 WRONG. **L loudness** -16.5 LUFS (LRA 4.6); the only silence over 2 s is the cover card (3.9 s, silent by design). Captions 25 events, overlaps_left=0.
The cover is the two-tone chapter card (kicker "COMMAND LINE ERP · PART 2", "A table of your own," off-white, "in one line" coral). The last card before the close is "Prior art: what this learned from": four sources read and used, three nearby tools with the page read, the sentence "In the pages we read, no single tool had all of it." and what was not searched.
**Not done:** no human has viewed it (the checks above replace a viewing for layout, timing and sound; whether it is a good film is the owner's call); no other language; not published anywhere.
