# ⚠ DO NOT REMOVE
Scope: **SPEC and phase ledger** for ONE vocabulary the CLI and the guides both read: a keyed message catalog and a help catalog over the Application Dictionary, with a short/long level and a locale. Read the log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE.
Background, measurements and prior art are in `prompts/DOCS_I18N.md` §4b-§4d (owner ideas of 2026-11-16: shared vocabulary for CLI and guides, a `Student` level = the long text, reuse the legacy element/message model, remove the copied Help). This file owns the BUILD; that file keeps the findings.

## ▶ RESUME HERE (2026-11-16, end of session bim-compiler-75; the next "resume message" session starts here)
**Owner, 2026-11-16 (verbatim):** *"New session 'resume message' will continue organise Help and tooltip content, but see if it can be in a help-pack_(language).zip loaded during login choice to lazy load its large content. Then we can pack lots of useful content. Note that in legacy the Help is on the right panel thus in twin it shold be so too. Look at improving the search function in it perhaps combination of words or a sentence ie 'How do i close a Sales Order?' it should give more useful info, auto hyperlink to jump more easily."*
**DECIDED by the owner, 2026-11-16 (verbatim, binding):** *"Yes i agree not to fold into first loaded ad_seed.db but a separate upon login or lazy and cached or on machine. For app languges we already set a number as in BIM chooser, let's stick to that, but for initial pilot poc, accept as u said of the 4 already with guide and ERP screen. We do it in kernel ERP twin not legacy to avoid confusion when we need to compare with original. Extra how-to will be your lane's big task as HELP is major boost."*
- **D1 Storage:** §9 is accepted. Help content is NOT in `ad_seed.db`. It is a separate store, loaded at login or lazily, then cached or kept on the machine.
  - It goes through the ERP screen's ONE language loader, `ErpI18n.loadPack` (`erp/erp_i18n.js:49-52`, fetches `erp/i18n/<code>.json`), extended to `erp/i18n/help/<code>/…`. No second loader.
- **D2 Languages:**
  - Target = the BIM Viewer chooser's set (`viewer/locale_loader.js` `AVAILABLE_LOCALES`, 18): en_MY, en_US, en_GB, en_AU, ms_MY, de_DE, fr_FR, es_ES, zh_CN, th_TH, ja_JP, ko_KR, ar_SA, pt_BR, id_ID, bn_BD, bl_BD, af_ZA.
  - **Pilot PoC = 4: fr_FR, de_DE, ja_JP, zh_CN.** Each already has a translated guide and an ERP screen pack.
- **D3 Twin kernel only, never legacy:** help packs and the extra content live in the ERP twin's kernel only. They are never installed into the legacy iDempiere, which stays the untouched original for parity comparisons.
  - This is the owner's own exemption: the twin may show MORE help than legacy.
  - The SHAPE stays legacy's: tooltip = Description (§7), and the extra content appears in the right panel where legacy shows Context Help.
  - It supersedes the "ship it to a real iDempiere as a 2Pack" lines in §8 and §9.
- **D4 Extra how-to content = this lane's big task** ("HELP is major boost"). Writing it is this lane's job, not an open question.
**State (2026-11-16, session after bim-compiler-75):** P2b DONE (§6). **Film "Help that answers" EN v4 made (§11 RESULT).** **§10 showcase slice BUILT, W-HELP-SHOWCASE 13/0** (bim-ootb #3128: help pack per language, question search, auto-links, 4 how-to rows; §10 RESULT). **P1b BUILT, W-FIELD-HELP 13/0** (bim-ootb #3126 `feat/field-help-twin`, §7 RESULT): tooltip = the field's own Description, one setter `erp/field_help.js`, the East Tool Tip panel. **Next = the help pack format and loader (step 5 below)**, through `ErpI18n.loadPack` (D1), pilot fr/de/ja/zh (D2).
**Facts measured this session (cite them, do not re-derive):**
- Legacy tooltip = Description (`WEditor.java:247/333/339-340`). Help goes to the RIGHT panel on focus (`ADTabpanel.java:840`, `GridTabRowRenderer.java:637-641`, `HelpController.renderToolTip:186-230`).
- Live `adempiere.ad_field_v` = `f.name, f.description, f.help` (the field's own text only).
- Legacy DBs (docker `postgres`, schema `adempiere`): `idempiere`/`_pilot`/`_test` have 21,432 fields; `ad_field_trl` 21,432 rows, system language `es_CO`. The twin seed has 20,988 fields (it also has plugin ids) and NO `_trl` rows.
- **Legacy already has the content store this asks for:** `AD_CtxHelp` (bound to tab / process / form / info window / workflow / task / table; `ctxtype`) → `AD_CtxHelpMsg` (the text) → `AD_CtxHelpMsg_Trl` (per language), plus `AD_CtxHelpSuggestion` (a user's proposed text). `HelpController.renderCtxHelp` shows it in the same right panel (`HelpController.java:169`, the Home help).
  - The local legacy holds 1 row of each, so the store exists and is nearly empty.
**Design to take forward (this session's analysis; the owner asked for it to be discussed, not built):**
1. **Help pack = Context Help rows, per language, lazy.**
   - `help-pack_<lang>.zip` carries:
     - (a) the dictionary's own translations (`AD_Field_Trl`, `AD_Element_Trl`, `AD_Process_Para_Trl`), from published iDempiere language packs;
     - (b) the "lots of useful content" as `AD_CtxHelp` + `AD_CtxHelpMsg(_Trl)` rows;
     - (c) a prebuilt search index.
   - It is fetched once, after the login has chosen the language. The language rule is the CLI session's (`CLI_ERP_IVR.md`): `AD_Preference` 'Language' → LANG / browser → System client.
   - The pack is cached by the service worker and applied as a READ overlay, like the patches. The seed is never rewritten.
   - Context Help gives the content legacy's own shape and place (the right panel). D3: it lives in the twin kernel only. (Superseded by D3: twin kernel only, never installed into legacy.)
   - Help text that is not a legacy record would be a divergence (CARDINAL rule), so it never goes there.
2. **The right panel in the twin** = a port of `HelpController`: field help on focus, plus the Context Help of the tab, window or process in view. One panel, generic (AD-LAYER LAW), witnessed X of N windows.
3. **Search ("How do I close a Sales Order?") is knowledge retrieval, deterministic, with no AI inside** (positioning rule):
   - **Parse:** lowercase, drop the stop words ("how do i … ?"). Match phrases against dictionary names longest-first: window "Sales Order", document action "Close" = `CL` from the DocAction list, process names, field names, plus guide headings.
   - **Rank:** an inverted index (BM25-like) over Context Help text, field help, window and process descriptions, guide sections, and `words.json` / `verbs.json`, built when the pack is made.
   - **Answer card**, each part extracted, not written:
     - "Sales Order" → open the window (zoom link);
     - "Close" → the document action, with its preconditions from the doc-action table (`ad_docfsm`);
     - the CLI line: `erp.close kind=Order number=<n>`;
     - the guide section anchor.
   - **Auto-hyperlink:** inside any help text, a term equal to a window, process or field name becomes a link (window → open, field → its help, guide term → its section). One linker, run when the pack is built, not at display time.
   - **Witness:** a question set of real phrasings (EN + each pack language) → expected top hit (X of N). A falsifier drops the phrase matcher and must FAIL.
4. **Research §8 (what leading apps do) is the input for the open question below; read it before speccing the content. §9 is the storage advice (text sources per language, a separate in-browser help DB, legacy table shapes; not folded into the seed).**
5. **Order of work:** ~~finish P1b~~ DONE (§7 RESULT). Next: the pack format and loader. Then the search index and linker. The content itself comes last, and it is just data.
**Owned elsewhere, don't redo:**
- The locale/login rule: the CLI session.
- The FastScriptGuide translations: the CLI session; the rule is in DOCS_I18N §6g.
- The ERP order blocks that need their own op-log: the CLI session.
- The status@erp witness failures on main: reported to the CLI session.

## 0. Rules (owner, 2026-11-16; binding)
- **Student is a LEVEL beside the language** (`ja` + student), not a language value. Short text = `AD_Message.MsgText` / `AD_Element.Description`; long = `MsgTip` / `Help` (legacy `Msg.java` L169-232, L375-398).
- **English is byte-identical by default.** The door's envelope, journal, `verbs.json` and what an AI or script receives never change; only text meant for a person is looked up, and only when a level or locale is set.
- **AD tables are never changed** (TWIN rule). The catalog is a READ layer: text lives once on the element; a column or field resolves to it unless it stores its own override.
- **Never invent.** A tip is the written text, or a tip DERIVED only from dictionary facts and labelled `derived`; where there is neither, the answer is empty and counted.
- **No collision with the CLI session:** nothing here edits `common/door/*` or `words.json` until the CLI session's `feat/mis-lookup` has merged (§P2 freeze). `tip` goes into `words.json` as a NEW key per word, no existing key rewritten.

## 1. Phases (one PR each; WORK-TO-ZERO)
| Phase | What | Touches | Status |
|---|---|---|---|
| P0 | Inventory and measurement (CLI strings ~235 in 10 files; Help duplication; derived-tip candidates) | docs only | DONE 2026-11-16, DOCS_I18N §4b-§4c |
| **P1** | **Help read layer** over the dictionary: resolve Help/Description by level through element → column → field, derive a tip where none is written | new files in bim-ootb `erp/` only | BUILT 2026-11-16, W-HELP-CATALOG 5/0 (bim-ootb `feat/help-catalog`), see P1 RESULT |
| P1b | Field tooltips + the Help panel in twin windows = legacy (`WEditor`, `HelpController`, `AD_Field_v`); one setter, one panel | `erp/field_help.js`, the field-render paths | **BUILT 2026-11-16**, W-FIELD-HELP 13/0, bim-ootb #3126 (§7 RESULT) |
| P2 | `Msg` pass-through for CLI strings (no behavior change), then file by file; stable key per message; `explain <key>` | `common/door/*` | **P2a BUILT 2026-11-16** (`words_core.js`, W-MSG-CATALOG 4/0, §3); **P2b DONE 2026-11-16** (`door.js`, W-MSG-DOOR 5/0, §6; MERGED bim-ootb #3108 `f18ae08c` after the guides listed six files, bim-compiler #798, deployed) |
| P3 | Student level for `help <word>` from the vocabulary (P3a); hint lines on the most-hit refusals (person's terminal, level set) (P3b) | `words_core.js`, `red1.js`, door render | **P3a BUILT 2026-11-16** (W-HELP-STUDENT 5/0, §4 RESULT; no `words.json` edit was needed); P3b after P2b |
| P4 | Guides pull terms from the same keys at build time | `docs/`, MkDocs | after P2 |
| P5 | Translations (six languages, `DOCS_I18N.md`), reviewer banner | catalog + docs | after P4 |

## 2. P1 spec: the Help read layer (module `erp/help_catalog.js`, witness `erp/tests/witness_help_catalog.js` in bim-ootb)
**Issue it removes:** the seed stores the same Help text on the element, again on each column, again on each field (measured, DOCS_I18N §4b: 18,617 of 18,639 column Helps and 15,735 of 16,062 field Helps are copies; removing the copies from a throwaway copy made the file 23% smaller raw, 18% gzipped), and 2,857 of 16,144 displayed fields have no Help at any level.
**API (pure; it takes a `q(sql) -> rows` function, so the door, the page and a test can each supply their own handle):**
- `makeResolver(q)` → `{ help(level, {fieldId|columnId|elementId}) -> {text, source, derived} }` with `level` `short` (Description chain) or `student` (Help chain, then the Description chain, then a derived tip); `source` is `field | column | element | derived | none`.
- The chain is field → column → element; the first NON-BLANK stored text wins (blank = NULL or whitespace). `derived` is built only when no written text exists at any level, only from the column's own dictionary facts (type name; Required; the list's values with their names; the table a lookup refers to; the default), and only when at least one fact beyond the type exists; otherwise `none`.
**Claims (witness W-HELP-CATALOG; each names its issue; each can say VACUOUS / INCONCLUSIVE; falsifier `HELP_BREAK=`):**
- **H1 lossless.** Issue: removing copies loses text. On a throwaway copy where every field/column Help and Description equal to its parent's is set NULL, the resolver returns for EVERY column and field with a written text exactly the ORIGINAL stored string (X of N, stated per kind: column help, field help, column description, field description). Falsifier `dropoverride` (the copy also drops one real override): H1 FAILS naming the count.
- **H2 the copies really went.** Issue: a no-op that proves nothing. The throwaway copy stores fewer help bytes than the original (stated); VACUOUS if equal. The log reports raw and gzip sizes; not pass/fail.
- **H3 the levels.** `short` returns the Description chain; `student` the Help chain, else the Description chain, else derived; a field with an override returns its own text; `source` names the level it came from. Independent SQL decides the expected text. Falsifier `swaplevel` FAILS it.
- **H4 derived tips are facts.** Issue: an invented tip. For every field whose written text is absent at every level, a derived tip is built; each fact in it equals an independent query (list values with names, lookup table, mandatory, default), none is built where written text exists, and every one is labelled `derived`. Falsifier `derivealways` (derive even when text exists) FAILS it. VACUOUS if no field qualifies.
- **H5 population stated, nothing hidden.** Of the displayed fields (N): written / derived / still empty, three counts summing to N; the still-empty ones are listed by name in the log, not counted as a pass. A field that GAINS a text it did not have before (original blank, parent written) is counted and named, not hidden (it is a change in what a person sees; the twin's window path is not touched by P1).
**Not in P1:** the door and `words.json` (frozen, §0); translations; the `Msg` class; any change to `ad_seed.db`. The throwaway copy is never shipped.

**P1 RESULT (2026-11-16, bim-ootb branch `feat/help-catalog`, log read; the seed is the worktree's `erp/ad_seed.db`):** W-HELP-CATALOG **5 pass / 0 fail**. H1 lossless: column Help 18,639 of 18,639, field Help 16,059 of 16,059, column Description 20,381 of 20,381, field Description 17,641 of 17,641 resolve to the exact stored text from the copy-free database. H2: help characters stored in column+field 4,567,967 -> 50,575; file raw 27,193,344 -> 20,819,968 (-23%), gzip 7,132,779 -> 5,787,118 (-19%). H3: 14,518 of 14,518 displayed fields with written text answer as an independent CHAIN query says. H4: 997 derived tips, all match independent queries; none built for a field that has written text. H5: of 16,144 displayed fields 14,518 written + 997 derived + 629 still empty. Falsifiers: `swaplevel` FAILs H1 and H3; `derivealways` FAILs H1, H3 and H4 (10,306 fields got a derived tip over written text); `dropoverride` FAILs H1 (16,058 of 16,059).
**Instrument errors found by reading the log (not data defects), fixed:** (1) SQLite `trim()` strips only spaces, JS `trim()` strips newlines; three fields ("Set Project Type", ids 6548, 7401, 7676) store a lone newline as Help, so the two disagreed on "blank". One definition now: blank = the whitespace JS trims, and the SQL passes `char(32,9,10,11,12,13)`. (2) the H4 check expected a list sentence for 18 columns typed List or Search that name no list or table in the dictionary; the layer correctly states nothing there. (3) the first `dropoverride` dropped a one-character whitespace "override", so the falsifier was VACUOUS and did not fail H1; it now picks a real text override.
**Findings for the owner:** 18 displayed fields have a List or Search column with no reference value in the dictionary (e.g. Auction Type, Package Imp., Context Help); 94 displayed fields have no Help of their own but resolve to their column's or element's (named in the log); 629 displayed fields still have no text and no derivable fact (e.g. Is MPS, Group1, Process Now). The throwaway copy is not shipped; P1 changes no AD row.
**Not done in P1:** the door and `words.json` (frozen until `feat/mis-lookup` merges), translations, the CLI `Msg` class (P2).

## 3. P2a spec: the pass-through message catalog, first file `words_core.js` (bim-ootb `feat/msg-passthrough`)
**Freeze lifted 2026-11-16:** `feat/mis-lookup` merged as bim-ootb #3080 (`1cc4f2cd`). The CLI session (`bim-compiler-06`) was told which files this touches. It agreed not to edit `words_core.js` text until this merges; its next items are in `assist_core.js`, `erp_cli.js` and the assist/report parts of `red1.js`.
**Issue it removes:** the text a person reads lives as literals inside code, so the CLI cannot get a Student level or a language, and the guides cannot share the words (DOCS_I18N §4b). P2a moves the literals of ONE file to a keyed catalog and changes no byte that a person, a script or an AI sees. **Why `words_core.js` first:** it is the red1 shell's screen text (meant for a person, never the envelope). It is PURE and already takes its table (`words.json`) as data. It is not in the door's flat download (`door.js`, `verbs.json`, `bim_mcp.js`), so that contract is not touched. `door.js` comes later and needs the download list extended. That is a separate step.
**Files:**
- new `common/door/msg_core.js`: PURE, the same shape as `words_core.js` (no require, process or fs; runs unchanged in Node and in the page).
- new `common/door/vocab/messages.json`, beside `words.json` (the store DOCS_I18N §4b recommends).
- `words_core.js` takes `o.msg`, a created `MsgCore` (a pure file cannot require one; it is handed in the same way as `menuCore`). `create()` throws if it is missing: no built-in English kept as a silent fallback.
- the five `create()` callers hand it in: `red1.js` three times (one helper, `msgCore()`), `witness_red1_words.js`, `witness_red1_help.js`.
**API:** `MsgCore.create(catalog)` returns `{ t(key, ...args), keys(), used() }`.
- A template uses legacy `MessageFormat` positions, `{0}`, `{1}` … (`Msg.java` L436-462).
- A literal `{` or `}` is not allowed in a template.
- `t` of an unknown key throws `msg: no message <key>`. A placeholder with no argument also throws. A wrong key is never printed blank.
- P2a has no level or locale: it is English only. `used()` counts the keys used, for the witness.
**Catalog shape:** `{ "_": "<what this file is>", "messages": { "<file>.<name>": { "en": "…" } } }`.
- Where the code prints a whole sentence, the key holds the whole sentence.
- A conditional tail is a second whole-sentence key (`words.cd_unknown`, `words.cd_unknown_buildings`), never a fragment glued on.
- Fragments that code joins into a list (the place names) are their own keys and say so in the name (`words.place.kind`).
- Data passed through untouched (an envelope's `why`, a word's `help` from `words.json`, menu lines) is NOT a message and stays as it is.
**Claims, witness W-MSG-CATALOG (`common/door/tests/witness_msg_catalog.js`; falsifier `MSG_BREAK=`):**
- **M1 byte-identical.** Issue: moving text changes what a person sees or what a replay prints. The pre-change `words_core.js` (from git, pinned `MSG_BASE`, default `1cc4f2cd`) and the new one get the SAME corpus of states and inputs. Every screen line, effect, error and `helpText` output must match byte for byte (X of N steps). Git cannot give the baseline → INCONCLUSIVE. Falsifier `edittemplate` (one character changed in one template, in a copy of the catalog) → M1 FAILS naming the key. Scope: a migration claim. After this merges, the existing message witnesses (W-RED1-WORDS/-CD/-HELP/-RUN/-MENU) pin the bytes. `MSG_BASE` moves when the next file converts.
- **M2 every key reached.** Issue: a key the corpus never reached was not proven byte-identical. Keys reached: X of N. Any unreached key → INCONCLUSIVE naming it, never PASS.
- **M3 keys both ways.** Issue: a key renamed in code alone throws at a person's terminal. Every `M('…')` key in `words_core.js` is in the catalog, and every `words.*` catalog key is used in code (X of N both ways). Every template's placeholders are `{0}..{n-1}` with no gap. Falsifier `renamekey` (one key renamed in a code copy only) → FAIL.
- **M4 no literal left (deletion budget).** Issue: half-moved text. Counts the person-facing literals in `words_core.js` (`screen.push('…`, `error: '…`, the `helpText` sentences), before and after. After must be 0. A literal left over → FAIL naming the line.
- The witnesses that assert this text are run and their logs read, unchanged: W-RED1-WORDS, W-RED1-CD, W-RED1-HELP, W-RED1-RUN, W-RED1-MENU, W-RED1-SHELL.
**Not in P2a:** `door.js`, `erp_cli.js`, the other cores, `words.json`, `verbs.json`, a level, a locale, `explain <key>`, and `match(text)` (finding a key from the English `why` of an envelope; it comes with the first envelope-text file so the envelope never needs a new field).

**P2a RESULT (2026-11-16, bim-ootb #3082 `feat/msg-passthrough`; logs read: `common/door/tests/logs/msg_catalog*.log`):** W-MSG-CATALOG **4 pass / 0 fail**.
- M1: the pre-change `words_core.js` (`1cc4f2cd`) and the new one answer 2,185 of 2,185 corpus steps byte for byte. 96 of the steps are `helpText`. Three core variants: with buildings, without, interactive.
- M2: 59 of 59 `words.*` keys reached.
- M3: 59 of 59 keys both ways. No template has a gap or a stray brace. No call passes an argument that its template drops.
- M4: person-facing literals 28 before, 0 after. The log lists every two-word literal still in the file: `use strict`, the create() guard and a W-RED1-HELP falsifier string. The guard is a named exemption because it is thrown when the catalog itself is missing.
- Falsifiers: `edittemplate` FAILs M1 and prints the changed text (`cd; no building…` against `cd: no building…`). `renamekey` FAILs M1 (`THROW msg: no message words.not_donee`) and M3 (58 of 59 both ways); M2 says INCONCLUSIVE for the unreached key.
- Unchanged witnesses, run after merging `origin/main` (#3081), logs read: W-RED1-API/-ASSIST/-CD/-DRAW/-HELP/-LS/-MENU/-PAGE/-REPORT/-RUN/-SHELL/-WARM/-WELCOME/-WORDS, W-DOOR-HELP and W-MIS-LOOKUP all PASS.
- **Instrument errors found by reading the log, fixed:**
  1. One key was built at run time (`works_place.` + a place). M3 reads literal keys only, so the four keys became literal.
  2. M4 first flagged the create() guard. That is a developer's wiring error and cannot come from a missing catalog, so it is now a named exemption.
  3. The reader's literal list used a broken regex escape and matched across lines. It now pulls out whole string literals.
  4. The first M1 DIFF line was cut off before the change, so the falsifier did not show the text. It now prints the first place that differs.
- Found on the way, not this lane: W-RED1-RUN R5 and W-RED1-REPORT P1-P4 failed on main. #3078 had ported Close Project, the process they used as the one with no port. The CLI session had already fixed this in #3081.
- Deletion budget: `words_core.js` + `red1.js` +43/-37 lines; 59 English literals moved from the code to `vocab/messages.json`.
**Next (P2b):** `door.js`, which holds the most-hit refusals: missing input, `is not key=value`, unknown verb.
- `msg_core.js` and `messages.json` must join the door's flat download: `FILES`, `bim_mcp.js` `DL`, W-MCP-DOWNLOAD.
- It also needs `match(text)`, so a person's terminal can find the key from the envelope's English `why` without a new envelope field.

## 4. P3a spec: a Student level for `help <word>`, built from the vocabulary (bim-ootb `feat/help-student`)
**Owner order 2026-11-16:** "Proceed" on the item ranked first in §4c: a tip and a worked example per word.
**Issue it removes:** `help clash` gives one dry line (`clash: clash two disciplines …`) and a bare verb name. A learner is not told what the word does, what to type, what is taken from where they are, or which full line it becomes.
**Source, never invented:** every fact in the Student block is already in the vocabulary.
- `verbs.json` holds the verb's `description` and each input's `description`. It is the same text the AI connector reads, so a person and an AI get one vocabulary.
- The word's own example (`ex` in `words.json`) is expanded by the expander itself into the line it runs. W-RED1-HELP H3 already runs every example.
- Only the labels are new, and they go in the catalog as `words.student.*` keys.
- No word, verb or input text is written by this lane, and `words.json` and `verbs.json` are not edited. The tip per word that §4c proposed as a new `words.json` key is NOT needed: the verb's description is the tip.
**What a person sees at the Student level** (`help <word>` only; groups, the overview and the door's help are unchanged). After each form line of the short help, four lines are added:
```
clash: <the short help, unchanged>
  in a building: clash ARC MEP   → viewer.clashes
    what it does: <the verb's description from verbs.json>
    you type: discA (<its description>) · discB (<its description>)
    taken from where you are: building
    e.g. in Duplex: viewer.clashes building=Duplex discA=ARC discB=MEP
```
- **"you type"** lists the form's own values in order. A form that needs none says so (a catalog key).
- **"taken from where you are"** lists the inputs the place fills (building, kind, role), as the expander puts them on the line. Nothing → the line is left out.
- **The sample place** is the one W-RED1-HELP already uses: Duplex for a building, Duplex/Element for a kind, Order for an ERP kind, none for anywhere.
- **The worked line** is the example expanded in that place without a session. That needs one new option, `expand(st, toks, {plain: true})`, which skips the interactive pick and ask branches. An example the expander refuses gets no worked line and is counted.
**The level is a person's setting, beside the language (§0):**
- In a session, `level student` and `level short` (or `level` alone) set it. It is handled like `role` and kept in the session state. The prompt is unchanged.
- `level xyz` is refused, with the legal values named.
- One shot: `red1 --level student help clash`.
- With no level set, every byte is as today. Help never goes through the door, so the envelope and the journal are untouched.
**Files:** `words_core.js` (`helpText(topic, level)`, the `level` setting, the `plain` expand option), `vocab/messages.json` (new keys), `red1.js` (`helpOf` passes the level; the `--level` flag).
**Claims, witness W-HELP-STUDENT (`common/door/tests/witness_help_student.js`; falsifier `STUDENT_BREAK=`):**
- **S1 short unchanged.** Issue: the new level leaks into the default. For every topic (the overview, each group, each word, an unknown word), `helpText(t)` and `helpText(t, 'short')` equal the pre-change core (pinned `MSG_BASE`) byte for byte. W-RED1-HELP stays green unchanged.
- **S2 every fact is sourced.** Issue: an invented or wrong tip. For every word form, recomputed independently from `verbs.json`:
  - "what it does" is exactly the description of the verb the example expands to;
  - "you type" names the form's values in order, each with exactly its input description;
  - "taken from where you are" is exactly the verb's inputs among building, kind and role that the sample place supplies.
  - Falsifier `swapdesc` (another verb's description) FAILS it.
- **S3 the worked line replays.** Issue: an example that does not run. Each worked line passes the door's own validator and equals the line the session prints (`→ …`) for the same example in the same place. Falsifier `dropctx` (the building left off) FAILS it.
- **S4 coverage stated.** X of N word forms have a block. Any form with no example, no description, or an example the expander refuses is named in the log, never counted as a pass. VACUOUS if N = 0.
- **S5 the setting.** Issue: the level does not reach the person, or sticks. In one session, `level student`, `help clash`, `level`, `help clash` print the Student block and then the short text. A one-shot `--level student help clash` prints the same bytes as the session's Student block. `level xyz` is refused.
**P3a RESULT (2026-11-16, bim-ootb #3083 `feat/help-student`; logs read):** W-HELP-STUDENT **5 pass / 0 fail**.
- S1: default and `short` help equal the pre-change core (`78aa51b6`) on 30 of 30 topics.
- S2: every fact of the 31 Student blocks equals `verbs.json`, recomputed apart from the core.
- S3: 31 of 31 worked lines pass the door's validator and equal the line the shell prints for that example in that place.
- S4: 31 of 31 forms have a block.
- S5: `level student` then `help clash` in a session prints the one-shot `--level student` bytes (891 against 104 short); `level` goes back; `level xyz` is refused in the session and in a one shot (exit 2).
- Falsifiers: `swapdesc` FAILs S2 (31 of 31 wrong); `dropctx` FAILs S2 and S3 (19 of 31).
- Also green after merging `origin/main`: W-MSG-CATALOG 4/0, W-RED1-API/-ASSIST/-CD/-DRAW/-HELP/-LS/-MENU/-PAGE/-REPORT/-RUN/-SHELL/-WARM/-WELCOME/-WORDS and W-DOOR-HELP.
- **Found by reading the logs, fixed:**
  1. The `new` word's example is a placeholder, `new <Column>=<value>`, which the expander refuses as too many values. W-RED1-HELP H3 already rewrites such placeholders before running them. The rule now: a pair `<Key>=<value>` is read as `Key=value`, the shape the word's own help line shows (`new Column=value …`). The witness applies the same rule apart from the core.
  2. W-MSG-CATALOG M3 caught `M(cond ? 'a' : 'b')`, where a key was chosen by a ternary and was invisible to the literal check. It is now two literal calls.
  3. W-MSG-CATALOG M2 counted the 12 new keys as unreached. M2's scope is the P2a move, so the `words.level_*` and `words.student.*` keys are now named as handed to W-HELP-STUDENT.
- Deletion budget: `words_core.js` + `red1.js` +38/-13. No literal was added, and `words.json` and `verbs.json` are untouched.
- The CLI session cleared `red1.js` (help, argv) and `words_core.js` before the edit.
**Decided by the owner, 2026-11-16 (P3a-1):** asked whether the greeting or the help should mention `level student`, the owner said *"Yes it should"*.
- **What changes:** one catalog entry, `words.help_footer`, the last line of `help`. `… · help <word> for one word · …` becomes `… · help <word> for one word (level student first for the full explanation) · …`. No code changes.
- **What does not change:** the greeting (`words.json` `welcome`) and the `everywhere` line. Both are the CLI session's data in `words.json`, and no existing `words.json` key is rewritten (§0). The footer is enough to make `level student` visible.
- **The witness rule for a deliberate wording change:** W-MSG-CATALOG M1 proves the CODE is byte-identical. From now on it runs the new core with the catalog as it was at P2a: today's catalog with each ledgered change reverted. A ledger in the witness names each deliberate change (key, old text, new text, the owner's words, date).
- **New claim M5 (the ledger is the only drift):** the live catalog differs from the P2a catalog only in ledgered keys, and each ledgered key holds exactly its new text. Falsifier `unledgered` (a second key changed in a copy of the catalog, with no ledger entry) → M5 FAILS naming it.
- W-HELP-STUDENT S1 is not affected: its old and new cores read the same live catalog.
- **The opening tip, with the usual don't-repeat convention.** The owner added mid-turn: *"with a 'do not repeat' usual convention ie when opening 'red1' with a 'fast' flag"*.
  - On opening a terminal session, one tip line follows the greeting: new key `words.tip_level`, `Tip: type level student for fuller help on each word (red1 --fast opens without tips).`
  - `red1 --fast` opens without tips. The greeting itself stays, because it is the CLI session's §26.
  - A pipe, a one-shot line and `-f` never show the greeting, so they never show the tip either.
  - **A flag, not "shown once, then remembered":** remembering needs a state file and makes the opening differ from one run to the next. A flag keeps every run deterministic.
  - `red1 -h` names `--fast` and `--level student`.
  - New claim **W-HELP-STUDENT S6:** on a terminal (a `script` pseudo-terminal, the W-RED1-WELCOME method), the tip follows the greeting and comes before the prompt. `--fast` drops the tip and keeps the greeting. A pipe shows no tip.
- **P3a-1 RESULT (2026-11-16, bim-ootb #3084 `feat/help-footer-level`; logs read):**
  - W-MSG-CATALOG 5/0: M1 2,185 of 2,185 steps on the P2a wording. M5 shows no drift from the P2a catalog (`78aa51b6`) beyond the one ledgered change, and 13 keys added since, which are additions.
  - W-HELP-STUDENT 6/0: S6 found the tip after the greeting and before the prompt; with `--fast` the tip is gone and the greeting is kept; a pipe shows no tip.
  - Falsifiers: `unledgered` FAILs M5, `edittemplate` FAILs M1, `renamekey` FAILs M1 and M3.
  - W-RED1-* (14), W-DOOR-HELP and W-RED1-WELCOME are green after merging `origin/main`.
  - **Found by reading the log, fixed:** M3 scanned `words_core.js` only, so the tip key (read in `red1.js`) looked unused. M3 now reads `red1.js` `.t('…')` calls too, and M2 hands `words.tip_*` to S6 by name.
**Not in P3a:** hint lines on refusals (P3b, needs P2b), Student text for groups and the overview, the ERP field Help (the P1 layer, separate), translations, and any mention of `level` in the greeting or the short help (that would change today's bytes; the owner decides).

## 5. P2a-1 spec: ONE key scanner, `common/door/msg_keys.js` (2026-11-16)
**Why:** the owner approved F-19, the X0 Navigator. It is a dev-side hover, jump and check on message keys in `CODE_ARCHITECTURE_DESIGN.md` (code-design session, `bim-compiler-2c`). It must read keys through THIS lane's scanner, not a copy. Until now, W-MSG-CATALOG M3 held the scan inline.
**Module (pure: no require, fs or process; it runs in Node, the witness and the VS Code extension):**
- `scan(sourceText, fileRel)` → `[{ key, line, col, args, file }]` for every call `M('key', …)` or `.t('key', …)`.
  - The key must be a literal string; a computed key is reported as `key: null` with its line, never skipped.
  - `args` is the number of top-level arguments after the key, counted through nested brackets and strings.
- `check(catalog, uses, opts)` → `findings[]`, each `{ kind, key, file, line, col, detail }`:
  - `unknown-key`: used, not in the catalog.
  - `unused-key`: in the catalog under the scanned prefixes, never used.
  - `template`: a placeholder gap or a stray brace.
  - `arg-count`: the call passes a different number of arguments than the template takes. This is now a static check; before, only a missing argument threw, at run time.
  - `computed-key`: a key that is not a literal string.
**W-MSG-CATALOG M3 uses it,** with the same verdicts as before, plus the static `arg-count`. New falsifiers:
- `MSG_BREAK=extraarg`: one call passes one argument too many. M3 must FAIL with `arg-count`.
- `MSG_BREAK=computedkey`: one key is built at run time. M3 must FAIL with `computed-key`.
**P2a-1 RESULT (2026-11-16, bim-ootb #3097; logs read):**
- `msg_keys.js` on the real code: 73 uses (`words_core.js` + `red1.js`), 72 keys, 0 findings.
- W-MSG-CATALOG 5/0: M1 2,260 of 2,260 steps, and M3 through the module.
- Falsifiers:
  - `extraarg` FAILs M3: `arg-count words.not_done words_core.js:142 passes 2, the template takes 1`.
  - `computedkey` FAILs M3: `computed-key words_core.js:153`.
  - `renamekey`, `unledgered` and `edittemplate` still FAIL their claims.
- W-HELP-STUDENT 6/0, W-RED1-HELP 5/0 and W-RED1-WORDS 3/0 stay green.
- The code-design session (X0 Navigator, F-19) requires it unchanged.

## 6. P2b spec: `door.js` to the catalog (bim-ootb `feat/msg-door`, 2026-11-16; owner: "do message for door.js to catalog only this session")
**Scope of this session: the move only.** `match(text)`, a level, a locale and the P3b hint lines are NOT in P2b; they are the next items.
**Issue it removes:** the door's refusals (missing input, `is not key=value`, unknown verb, the claim and confirm answers, the `{expr}` errors) are literals in `door.js`. A person's terminal cannot show them at a level or in a language. These are the most-read refusals of the CLI.
**What moves (person-facing text):** every literal sentence that reaches a person or an AI as an ANSWER:
- the envelope's `why` (validator, line grammar, `{expr}`, `decide`, `composed`, `engineResult`, confirm),
- the `question` text of a line that is not a command,
- the `what` words of the input types,
- the `verbs.json:` load errors (the vocabulary author reads them),
- the usage line, the `--dry` refusal and the three `§DOOR FAIL` sentences: the sentence moves, the `§DOOR FAIL` tag stays in the code.
- Fallback words (`no output`, `refused`, `none`, `the app`, `field`, `never answered`, `nothing was judged`) are keys too.
**What stays in code, by rule:** the `§DOOR <event> key=value` log lines (the witness instrument, grepped by W-DOOR-*). Also the regexes that read other programs' stderr (they read data), the punctuation that joins lists (`, ` `; ` ` > `) and the `curl -O` lines (commands).
**The envelope stays English, always.** The door's catalog reader is pinned to `en`, now and after a locale exists. Translating a `why` is the person's terminal's job, through `match(text)`, so the envelope, the journal and what an AI receives never change (§0).
**Braces:** a template may not hold `{` or `}` (`msg_core.js`). Where the text shows the person's own expression (`in {a+b}`) or the `{` character itself, the brace is DATA and is passed as an argument.
**Conditional tails:** each is a second whole-sentence key (§3 rule). Example: `door.plain_number`, `_unit`, `_hint`, `_unit_hint`.
**Loading, no silent fallback:** `door.js` reads `msg_core.js` and `messages.json` through its ONE resolver (`locate`): beside `door.js` first, then the repo layout. `FILES` gains `msg_core.js` (`common/door/msg_core.js`) and `messages.json` (`common/door/vocab/messages.json`). The catalog is read once, on the first message. When either file is missing:
- the CLI stops at start and names the file with its `curl` line (the `render.js` pattern);
- `bim_mcp.js` adds both to `DL` and to its start check;
- the one literal left is the guard that says the catalog is missing. It is a named exemption, as in P2a.
**Public download consequence (needs the owner):** the guides' "four files" (FastScriptGuide in 7 languages, ProposerGuide) become six. Both files are already served live (P2a), so updating the guides first is harmless. W-MCP-DOWNLOAD `LISTED` and its D3 loop, and `gen_fast_script_guide.js` `FLAT`, gain the two files.
**Claims, witness W-MSG-DOOR (`common/door/tests/witness_msg_door.js`; falsifier `MSG_BREAK=`):**
- **D1 byte-identical.** Issue: moving text changes an envelope, the journal or a replay. The pre-change `door.js` (git `DOOR_BASE`, the `origin/main` this branch starts from) and the new one, sibling copies in `common/door/`, get the SAME corpus. Every result must match byte for byte (X of N steps), with `ms` and the request ids normalised:
  - the exported `validate`, `coerce`, `parseLine`, `tokenize` and `evalExpr` over typed and bad inputs;
  - `createDoor().runLine` and `confirm` with stub programs, for every `decide` and `engineResult` branch;
  - `loadVocab` and `checkComposed` on broken vocabularies;
  - the CLI usage and `--dry` refusal, spawned.
  - No baseline from git → INCONCLUSIVE.
  - Falsifier `edittemplate`: one character changed in one `door.*` template in a catalog copy → D1 FAILS, naming the key.
- **D2 every key reached.** `door.*` keys reached X of N; an unreached key → INCONCLUSIVE naming it.
- **D3 keys both ways** through `msg_keys.js` (prefix `door.`): unknown, unused, template, arg-count and computed-key findings all 0. Falsifier `renamekey`: one key renamed in a copy of `door.js` only → D3 FAILS.
- **D4 no literal left (deletion budget).** The person-facing literal patterns (`why:` sentences, `throw new Error('…`, `return '…`, `what: '…`, `question: '…`, `fail('…`, `|| '…` fallbacks, `usage:`) counted before and after; after = 0 except the named guard. The `§DOOR` log sentences left by rule are listed in the log, not counted.
- **D5 the flat download.** A folder holding only the listed files (now six) runs a door line. With `msg_core.js` or `messages.json` removed, `door.js` exits 1 and names the file with its `curl` line. (W-MCP-DOWNLOAD `--local` D1-D3 run as well.)
- Unchanged witnesses run and logs read: W-DOOR-* (all), W-DSL, W-REPLY-HONEST, W-MSG-CATALOG, W-HELP-STUDENT, W-RED1-*, W-ERP-VERBS-DOOR, W-VOCAB-COMPOSE, W-X0-CATALOG.

**P2b RESULT (2026-11-16, bim-ootb `feat/msg-door` @ `9272d6c3`; logs read: `common/door/tests/logs/msg_door*.log`, `p2b_*.log`, `cmp_*.log`):** W-MSG-DOOR **5 pass / 0 fail**.
- D1: the pre-change `door.js` (`f541cde7`) and the new one answer 151 of 151 steps byte for byte. The steps cover the functions, broken vocabularies, every engine branch, confirm, the journal, the § say lines and 10 CLI runs from a flat folder.
- D2: 85 of 85 `door.*` keys reached. D3: 101 uses, 0 findings. D4: person-facing literals 98 before, 0 after. The guard `catalogMissing` is named; 16 `§DOOR` log lines stay by rule.
- D5: the 6-file folder runs a line, and the connector lists its 4 tools. Without `msg_core.js` or `messages.json`, `door.js` and `bim_mcp.js` each exit 1 and print that file's curl line.
- Falsifiers: `edittemplate` FAILs D1 (`given twice` against `given twise`, 4 steps). `renamekey` FAILs D1 and D3 (`unknown-key door.input_twicee`, `unused-key door.input_twice`).
- **Instrument errors found by reading the log, fixed:**
  1. Claim timestamps (`t`) were not normalised.
  2. D4 counted the status code `'error'` and the actor id `'human'` as words. Codes are now excluded.
  3. The spawned CLI exits inside its main, so a key-count hook appended at the file's end never registered. It now sits at the top.
  4. `--dry` alone reaches usage first, and a script needs `render.js` first. So the CLI corpus has a second flat folder with `render.js`.
- Unchanged witnesses green: W-DOOR-CONFIRM/-HELP/-LIST/-OUT/-PLUGINS/-ROWS/-SCRIPT/-STAMP/-DUP/-HONEST/-SAME/-STATIC, W-DSL 21/0, W-MCP-DOWNLOAD `--local` 7/0 (now 5 D3 files), W-ERP-VERBS-DOOR 46/0, W-VOCAB-COMPOSE, W-MSG-CATALOG 5/0, W-HELP-STUDENT 6/0, W-RED1-*, W-MIS-LOOKUP, W-X0-CATALOG (174 key hovers).
- **Failing on `main` too, not this lane** (base `f541cde7` and branch give identical failing lines):
  - W-LEGACY-PLUGIN P5b: the in-server witness is 12/0, the check wants 8/0.
  - W-MIS-TAB P1: C_ProjectPhase/C_ProjectTask displayed fields 22/19 and 20/14.
  - W-MIS-TAB P3: `object_cli.js:85` orders tabs beside `tabsOf`.
  - W-NINJA-EXEC E11a: tab placement in the Business Partner window.
- **Run environment:** a fresh worktree has no `node_modules`. Witnesses ran with `NODE_PATH=~/bim-ootb/node_modules:~/bim-compiler/node_modules`, because puppeteer is installed only in bim-compiler. Without that path, 3 witnesses crash with `puppeteer not found` / `sql.js` not found. That is not a defect.
- **Found, not fixed (flat-download hole, older than P2b):** `validate` requires `./assist_core.js` when a missing input has a near-miss key. `assist_core.js` is not in the download, so that case throws `Cannot find module` in a flat folder.
- **Open (⛔ owner):** the guides' "four files" become six (FastScriptGuide ×7 languages, ProposerGuide). Hold the bim-ootb merge until the guides list the six, or merge first. Both files are already live (200), so updating the guides first is harmless.
**Next:** `match(text)` (envelope `why` → key) and P3b hint lines.

## 7. P1b spec: field tooltips and the Help panel in the twin windows, the same as legacy (owner 2026-11-16: *"Your focus is more on the bad HELP tool tip construct to improve further"*)
**Issue it removes (measured on bim-ootb `origin/main`, read against the local iDempiere source):** the twin's field help is a developer construct, not legacy's. That breaks the TWIN rule (look and feel included).
1. **Read-only form:** each value's tooltip is `ColumnName · referenceType` (`erp/idempiere.html:5323`).
   - Legacy shows the field's **Description** on both the label and the editor (`WEditor.java:247`, `:333`, `:339-340`).
2. **Inline editor:** the editing surface (`erp/crud_overlay.js` `renderInline` `:1553`) sets **no** tooltip at all.
3. **Process parameters:** the tooltip is `ColumnName · type · mandatory` (`erp/idempiere.html:4829`).
   - Legacy builds each parameter with the same `WEditor` (`ProcessParameterPanel.java:443`), so it also shows its Description.
4. **No Help panel.** Legacy fills its Help panel when a field gets focus, in the form (`ADTabpanel.java:840`) and in the grid (`GridTabRowRenderer.java:637-641`).
   - It shows the header, the Description and the Help, each line only when not blank (`HelpController.renderToolTip`, `HelpController.java:186-230`).
   - The entity type is shown only when "show technical info on help" is on.
   - With no field focused it shows the message `PlaceCursorIntoField`.
5. **The P1 resolver does not answer legacy's rule.** P1 falls back field → column → element.
   - Legacy reads the FIELD's own text only: `AD_Field_v` selects `f.description, f.help` (`migration/i8.2/postgresql/202106031340_IDEMPIERE-4479.sql:84-85`).
   - In another language it reads `AD_Field_Trl` (`:166-167`).
   - So the 94 displayed fields P1 found with no Help of their own (§2 RESULT) show nothing in legacy, and P1 would show the column's text.
- **Already the same as legacy, keep:** the grid's row indicator says `Edit Record` (`idempiere.html:3185` = `GridTabRowRenderer.java:608`). A grid cell's tooltip is its full text only when it is cut short (`GridTabRowRenderer.setLabelText` `:431-441`); this is to be checked, not assumed.
**Fix (AD-LAYER LAW: one generic implementation, no per-window code):**
- `erp/help_catalog.js` gains the level `legacy` for a field. It returns `{header, description, help}` exactly as `AD_Field_v` gives them: the field's own columns, no fallback.
  - When the UI language is not the base language, they come from `AD_Field_Trl`. When the seed has no `_Trl` rows (measured: it has none), it falls back to the base text, as legacy does.
  - `short` and `student` (the inheritance and the derived tips) stay for the CLI and the guides only.
- **One tooltip setter** used by every field-render path: the read-only form, the inline editor, process parameters, and the grid editors on focus.
  - It sets `title` = the Description, or no `title` when the Description is blank.
  - The two developer strings are DELETED (deletion budget).
- **One Help panel** (a port of `HelpController`), filled when a field gets focus. Same rules: header, description, help, each only when not blank; entity type only with "show technical info"; `PlaceCursorIntoField` when nothing is focused.
- The developer's view of `ColumnName · referenceType` moves to the § log line (`§FIELD_HELP`), never to the person's tooltip.
- **Not in P1b:** rewriting any Help text, or showing derived tips or a Student level in a twin window. A twin window shows exactly legacy's text. Better text reaches people through the CLI (`help <word>`, level student) and the guides, never by changing an AD row.
**Claims, witness W-FIELD-HELP (bim-ootb `erp/tests/witness_field_help.js`; X of N, with N from `ad_seed.db`; falsifier `FH_BREAK=`):**
- **F1 the tooltip is the Description.** For every displayed field of every window the role can open, the label's and the editor's tooltip equals `AD_Field.Description`, and there is none when it is blank.
  - Rendered headless through the real form and inline-editor paths. X of N fields; N = the displayed fields counted from the dictionary.
  - VACUOUS if no field is rendered.
- **F2 no developer tooltip left.** 0 rendered tooltips have the form `<ColumnName> · …`, across form, inline editor, process parameters and grid. Falsifier `devtitle` (the old string restored) FAILS F1 and F2.
- **F3 the Help panel answers like `HelpController`.** On focus of each rendered field the panel shows header / description / help with the blank-line rules, and `PlaceCursorIntoField` with no focus. Falsifier `nohelp` FAILS F3.
- **F4 the legacy oracle.** For every displayed field, the twin resolver's `{description, help}` equals the real iDempiere `AD_Field_v` row, read from the local legacy postgres. X of N.
  - INCONCLUSIVE when legacy is not running, never PASS.
  - Falsifier `fallback` (field → column inheritance in the window) FAILS F4, naming the count (about 94 Help fields).
- **F5 process parameters.** Every parameter of every process the role can run has the tooltip `AD_Process_Para.Description` (X of N).

### §7 RESULT (2026-11-16, bim-ootb #3126 `feat/field-help-twin`; log `erp/tests/logs/witness_field_help.log`)
**W-FIELD-HELP 13 pass / 0 fail / 0 inconclusive** (GardenAdmin, real page, the real render functions through `window.__idmpFieldHelp`):
- **F4:** 15,849 of 15,849 displayed fields (1,120 tabs) have description AND help equal to the live legacy `adempiere.ad_field_v` (docker `postgres`). 0 twin-only ids among displayed fields.
- **F1:**
  - read-only form: 11,052 of 11,052 displayed non-key fields over 294 menu windows / 745 tabs, label and value; rendered = the dictionary count;
  - inline editor (`renderInline`, windows 143/169/167/195): 234 of 234 rows, editor and label.
- **F3:** idle panel = `(Place your cursor into a field on the screen)` from AD_Message, panel titled `Tool Tip`, shown (HelpCollapsed default N). Focus → panel = HelpController markup: 11,052 of 11,052 form fields, 88 of 88 focusable inline editors.
- **F5:** 545 of 545 parameters of 131 menu processes with parameters (137 on the menu), editor and label.
- **F2:** 0 developer tooltips out of 21,280 seen.
- **Falsifiers, each FAILs as claimed:** `devtitle` F1+F2 (0/11052, 23,662 of 23,662 developer tooltips); `nohelp` F3 (0/11052, 0/88, idle); `fallback` F4 (help 93 wrong, description 56 wrong; the spec guessed about 94).

**Built:** `erp/field_help.js` (tooltip setter + HelpController port), wired into `_appendReadonlyFields`, `renderProcParamForm`, `crud_overlay.renderInline` and `editCell` (through `opts.fieldFor` → the tab's AD field model), the East `<aside id="idmp-help">`. `ad_parser.getFields` now reads `f.Help, f.EntityType`; `ad_process.readProcess` reads the parameter's `description, help, entitytype`. sw v1088.
**Deleted (budget +364 / −13):** `ColumnName · referenceType`, `ColumnName · type · mandatory`, and `derived — read-only` tooltips.
**Changed from the spec, with the reason:** no `help_catalog` level `legacy` / `legacyField`. `ad_parser.getFields` already IS the twin window's `AD_Field_v` reader (field's own Description, now Help). A second reader would break AD-LAYER LAW rule 5. The WIP commit's `legacyField` was dropped. F4 judges the window's own reader, and its falsifier mutates a throwaway in-memory copy (as W-HELP-CATALOG's `dropoverride` does), not the code.
**Measured facts:**
- Legacy writes panel text RAW (`HelpController.java:136-150`), so does the twin; 372 field Helps contain `<`, e.g. `DocumentNo_<TableName>`, which the browser swallows in both.
- Inline-row labels differ from `AD_Field.Name` on 5 of 234 rows (a curated crud label); the panel header follows legacy (`GridField.getHeader` = the field name).
**Open, named (not claimed):**
- (a) The grid cell editor (`editCell`) is wired to the same setter but W-FIELD-HELP does not drive it yet.
- (b) The twin's read-only inline editors are `disabled` (47 of 234 rows), so they take no focus and the panel cannot follow them. Legacy's read-only Textbox is `readonly` and still focusable; combos are disabled in both. A divergence to close on the crud side (TWIN rule), not here.
- (c) QuickInfo and HowTo (Context Help) panels of the legacy East region: HowTo is the help-pack step.
- (d) Already failing on main, unchanged by this PR (run on main `bbb7dfb2`): `poc_parity_fieldset_live` (timeout opening the c_invoice row), `witness_erp_i18n` 7/4, `poc_ad_folded_crud` 27/29.

## 8. Help as knowledge: what leading apps do, and what we take (research 2026-11-16, 9 web searches; owner: *"Exlore what powerful help function advanced apps have that we can learn from"*; the open question below is the one the owner wants this prompt to spec and tackle)
**What the leaders do** (vendor docs unless marked; vendor-marketing claims excluded):
| App | Help function | The idea worth taking |
|---|---|---|
| Microsoft Office "Tell me" / Search | type what you want to do, get the matching commands and run one from the list; also "Get Help on <phrase>" | a search box that **does**, not only finds |
| macOS Help menu | search lists menu items AND help topics; hovering a menu item opens the menu and **points an arrow at the command** | **show me where** it is, on the real UI |
| JetBrains Find Action / Search Everywhere | one box over actions, settings, files and symbols; **synonyms** ("toggle presentation mode" finds Enter Presentation Mode); `/` scopes to settings | synonyms + scopes, one box |
| SAP Fiori Web Assistant (now SAP Companion) | **hotspots** mark elements that have help; context help + **guided tours**; content kept apart, tied to the app by metadata; SAP's own rule: help is not a crutch for a weak screen | help keyed to elements, stored apart from the app |
| Business Central | each tooltip ends with **Learn more** → the Help pane on this page's topic; Ctrl+F1; **teaching tips** and tours (a tour = a sequence of tips); rule: a tip says the **outcome**, not the steps; falls back to a landing page when no mapping exists | tooltip → deeper help in one key; outcome-first wording |
| Dynamics 365 custom help panes | a side pane per app, entity, form and **language**; balloons / coach marks point at elements; known weakness: they break when the page changes | per-language panes, and a lesson: anchor by a stable key, not by position |
| Salesforce In-App Guidance | prompts and walkthroughs (up to 10 steps) per page, user and time; the Help menu takes your own links; **completion metrics** | measure whether help is used |
| Oracle Guided Learning | **Smart Tips** on fields and buttons, process guides, beacons; views and drop-off reporting | per-field tips beside the process view |
| Odoo | technical tooltip (field name, type, model, relation) in **debug mode** only | the developer view is separate from the person's |
**What we already have that maps onto these, and where each can live without breaking the TWIN rule (look and feel = legacy):**
- **Content store = legacy Context Help** (`AD_CtxHelp` per tab, process, form, info window, workflow, task or table; `AD_CtxHelpMsg` + `_Trl`). It is shown by legacy's own right panel (`HelpController.renderCtxHelp`). This is SAP's "content kept apart, tied by metadata" and Dynamics' "pane per form and language", and legacy already has it.
- **Feedback loop = legacy `AD_CtxHelpSuggestion`** (a user proposes help text; an admin accepts it). That is the authoring answer Salesforce and Oracle sell as a separate product.
- **Developer view apart:** Odoo's debug tooltip = legacy's "show technical info on help" (entity type in the panel) + our `§FIELD_HELP` log line. The person's tooltip stays the Description (§7).
- **Stable anchors:** our hooks are keyed (`data-ad-table` / `data-ad-column`, `help_overlay.js` "attaches by KEY"), so Dynamics' "balloons break when the page changes" does not apply.
- **Proven examples:** every worked example can be a door line replayed by a witness, as W-HELP-STUDENT S3 already does. Help that cannot go stale is something none of the leaders above claim.
- **Show me / tours:** `help_overlay.js` (ReadMe / ShowMe: reveal, pulse, steps from a keyed store) is an opt-in overlay. When it is off, the twin is byte for byte the legacy screen.
**Search ("How do I close a Sales Order?"):** the leaders combine (1) phrase → action matching with synonyms, (2) show-where, and (3) run-it. Ours, deterministic, no AI:
- Match dictionary names (window "Sales Order"; document action "Close" = `CL`) plus a synonym table kept as data.
- The answer card carries:
  - open the window;
  - **show where**: pulse the document-action button, via ShowMe;
  - **when it is allowed**: preconditions from `ad_docfsm`;
  - **do it from the CLI**: `erp.close kind=Order number=<n>`;
  - **learn more**: the guide anchor.
- **Open design point (the next session reads the legacy source first, then decides):** where the search box lives.
  - Legacy has a global search (menus and documents) but no how-to search.
  - A how-to box in the twin's chrome would differ from legacy. Answers shown as Context Help content in the right panel would not.
**THE OPEN QUESTION this prompt is to spec and tackle (owner): who writes the extra help content, and in which languages first.** Facts for the decision:
- **Writable with no author (extract, never invent):**
  - (a) legacy's own text, plus the published iDempiere language packs for `AD_*_Trl` (the seed has none today; the legacy DB holds 21,432 field translations for `es_CO`);
  - (b) derived tips from dictionary facts (P1: 997 fields);
  - (c) worked examples from witness-replayed door lines;
  - (d) links to the existing guide sections (7 languages live).
- **Needs a person:** outcome-first "what is this window for" texts, and how-to answers that no table holds. Legacy's own channel for that is `AD_CtxHelpSuggestion` → accepted → `AD_CtxHelpMsg`.
- **Languages already paid for:** the guides (en, id, zh, fr, ja, es-419, de) and the ERP UI packs (en, fr, es_ES, de, ar, zh_CN, ja, ms_MY, th). The overlap is fr, de, ja, zh (+ es variants).
- **Decided 2026-11-16 (D2, D4 in ▶ RESUME HERE):** this lane writes the content; pilot languages fr_FR, de_DE, ja_JP, zh_CN; target = the BIM chooser's 18.
Sources: [SAP Web Assistant](https://www.sap.com/design-system/fiori-design-web/v1-96/foundations/writing-and-wording/web-assistant) · [Office Tell Me](https://support.microsoft.com/en-au/office/d6b60e8f-0530-43bf-b688-e99d36cf5663) · [macOS Help menu](https://support.apple.com/en-asia/guide/mac-help/hlpvw003/10.15/mac) · [JetBrains Search Everywhere](https://jetbrains.com/help/idea/searching-everywhere.html) · [Business Central user assistance](https://learn.microsoft.com/id-id/dynamics365/business-central/dev-itpro/user-assistance) · [BC teaching tips](https://learn.microsoft.com/en-ca/dynamics365/business-central/dev-itpro/administration/onboarding-teaching-tips-tours) · [Dynamics 365 guided help](https://learn.microsoft.com/en-us/powerapps/maker/data-platform/create-custom-help-pages) · [Salesforce In-App Guidance](https://trailhead.salesforce.com/content/learn/modules/user-engagement/create-in-app-prompts) · [Oracle Guided Learning](https://docs.oracle.com/en/education/customer-success/guided-learning/user-guide/introduction-overview-oracle-guided-learning.html) · [Odoo debug tooltip (3rd party)](https://deploymonkey.com/blog/odoo-debug-developer-mode-guide)

## 9. Storage: how help content grows without breaking the DB and NO-LFS rules (advice 2026-11-16; owner: *"as we grow will it be 'folded' into (same or new SQLite DB) as migration scripts and organised without breaking the LFS rule in GIthub? Do advice if u have better idea how the DB is organised."*)
**Measured:**
- One language's field translations in legacy (`es_CO`): 21,432 rows, **2,860,334 characters**; element translations: 6,026 rows, 411,933 characters. About **3.3 MB of text per language**, before any Context Help.
- The seed `ad_seed.db` is 27 MB (P1, §2).
- Pages for bim-ootb publishes the **tracked** files; a merge made by the CI token starts only the branch build (`deploy-pages.yml` comment). So anything a browser fetches must be a committed file, not a deploy-time build product.
**Advice: do NOT fold help content into `ad_seed.db`, and do not ship it as ledger migrations.**
- Folding it in grows the one DB every user downloads by about 3.3 MB per language, plus Context Help.
- Ledger migrations (append-only) would replay every past edit of every text forever.
- Help is content that is regenerated and translated, like the guides. It is not schema.
**Instead (text sources in git, a separate per-language DB in the browser, legacy table shapes):**
1. **Source of truth = text, one record per line, in git** (no binary, so NO-LFS is untouched):
   - `erp/help/<lang>/ad_field_trl.jsonl`, `ad_element_trl.jsonl`, `ad_process_para_trl.jsonl`, `ad_ctxhelp.jsonl`, `ad_ctxhelpmsg.jsonl`;
   - sorted by the record's UU (stable key), so a change is a small reviewable diff.
   - English Context Help lives under `erp/help/en/`. Each translated record carries the `source_sha` of the English it was made from, so staleness shows. This is the i18n_sync idea (DOCS_I18N §6f) applied to records, not lines.
2. **Legacy table names and columns,** so the twin reads them the way legacy does. They are never installed into legacy (D3: the original stays untouched for comparison). Origin: the published iDempiere language packs for `*_Trl` (extracted, never typed). Context Help comes from accepted suggestions and owner-approved text.
3. **A separate DB in the browser, not the seed:**
   - After the login has chosen the language (CLI session's rule), the page fetches that language's files once. They are compressed on the wire by the web server, so a zip adds nothing: the "help-pack" is one folder per language.
   - The page loads them into its own `help_<lang>` SQLite (in-browser storage) and `ATTACH`es it beside the seed. The seed is never rewritten.
   - The service worker caches the folder. A `manifest.json` per language (file list + sha) lets the client refetch only what changed: the same self-heal idea as `patches/*.sql`.
4. **The search index is built from the same sources and committed** (`erp/help/<lang>/index.json`), and a witness checks it equals a rebuild. This is the rule the guide's verb table follows (generated, committed, checked).
5. **Writes by users** (a help suggestion) go through the door as `AD_CtxHelpSuggestion` ops in the op-log, like any record. Accepting one is the step that copies it into `erp/help/<lang>/ad_ctxhelpmsg.jsonl` (a reviewed PR).
6. **The CLI reads the same files** (Node, no browser): `help <word>` and the how-to search use one index, one loader.
**Why this is better than one growing DB:**
- The download is per language and only on demand.
- Every change is a text diff.
- No binary is ever committed.
- Translations show their staleness.
- Legacy and the twin read the same records.
- Help content can never corrupt the business data.
**Decided (owner, 2026-11-16):** D1-D4 in ▶ RESUME HERE. Storage accepted; pilot languages fr_FR, de_DE, ja_JP, zh_CN; twin kernel only; the how-to content is this lane's task.

## 10. Help showcase: a thin slice of all four (owner 2026-11-16: *"Try to do all 4 at least a thin slice just to showcase"*)
**Issue it removes:** P1b made the twin's help equal to legacy's, but there is nothing to show beyond that. The four pieces the RESUME HERE design names (help pack per language, question search, auto-links, how-to content) do not exist, so a film has no story. This slice builds each one end to end, small, on real data, so it can be shown and witnessed. It is not the full build; the full build stays in RESUME HERE order.
**Sources (extracted, never invented):**
- Translated field help: the published language packs already used by `erp/tools/build_i18n.py` (cache `~/.cache/erp_trl`, same pinned SOURCES).
  - Measured 2026-11-16, translated element Description / Help (text present and not equal to the English original): de_DE 2,528 / 1,690; fr_FR 1,939 / 1,482 (ADempiere 3.5.2 pack) + 354 / 247 (iDempiere 12 pack); zh_CN 754 / 222; ja_JP 17 / 23.
  - Field resolution = legacy's: a centrally maintained field takes its column's AD_Element translation (SynchronizeTerminology, the rule `erp_i18n.js` already applies to names); otherwise its own AD_Field_Trl row. A field whose translation is missing shows the English text, as legacy does.
- How-to text: `docs/ERPUserGuide.md` "The standard flow" §1-§4 (Sales Order, Shipment, Customer Invoice, Receipt), the sentences copied, the proof asides left out, each row carrying its guide section link.
- Document actions: AD_Ref_List 135 (name, description); statuses: AD_Ref_List 131; when an action is allowed: `AdDocFsm.TRANSITION[action]` (the DocumentEngine port); the CLI line: `common/door/verbs.json`, the verb whose description says `Runs DocAction <code>`, with its own input names.
**What is built (bim-ootb):**
- **H1 help pack + loader.** `erp/tools/build_help_pack.js` writes `erp/i18n/help/<lang>/help.json` for the pilot languages (fr_FR, de_DE, ja_JP, zh_CN) and `en_US` (the how-to rows). Loaded through `ErpI18n` (one loader, D1): `ErpI18n.loadHelp(lang)` when the language is chosen, cached by the service worker. `ErpI18n.applyWindow` puts the translated Description/Help on each field model, keeping the English on `_enDesc`/`_enHelp`, so the P1b setter and panel show them unchanged.
- **H2 question search.** `erp/help_search.js` (pure, page + node): lowercase, drop stop words, match phrases longest-first against the menu's window names and the DocAction names, then rank the how-to rows by term overlap (BM25-like). Answer card: open the window (link), the action (name, description, "allowed when the document is …" from the FSM), the CLI line, the guide section, the best how-to.
- **H3 auto-links.** At pack build time, a window name in how-to text becomes a link to that window (longest name first, whole words). One linker. Legacy dictionary text in the Tool Tip panel is NOT linked (it stays legacy's).
- **H4 how-to content.** `AD_CtxHelp`-shaped rows (`ctxtype` W, `ad_window_id`, name, text, source) for the four trade-cycle windows (143 Sales Order, 169 Shipment, 167 Invoice, 195 Payment). Shown in a second East widget titled AD_Message `HowTo`, where legacy shows Context Help (`HelpController.renderCtxHelp`), for the window in view; the question box sits at its top (a twin extra, allowed by D3). English only in this slice: another language shows the English row marked as English.
**Claims, witness W-HELP-SHOWCASE (bim-ootb `erp/tests/witness_help_showcase.js`; falsifier `HS_BREAK=`):**
- **S1 the pack is extracted.** Every translated text in every pilot pack equals the source pack's text for that row, re-read from the XML by the witness (X of N per language). VACUOUS if a pack is empty. Falsifier `tamper` (one pack value changed in memory) FAILS S1.
- **S2 the language reaches the help.** In the real page, after switching to de_DE, each field of the Sales Order header tab that has a German pack entry shows the German Description as tooltip and in the Tool Tip panel (X of N); a field without one shows the English text. Back to English: byte-identical to before.
- **S3 the search answers.** A fixed question set of real phrasings (e.g. "How do I close a Sales Order?", "complete an invoice", "void a payment") → expected window and action (X of N). Falsifier `nophrase` (no phrase matching) FAILS S3.
- **S4 the links work.** Every link in the how-to text points at a window on the role's menu (X of N); clicking the answer card's window link opens that window (`§IDEMPIERE window=` log). Falsifier `deadlink` FAILS S4.
- **S5 the how-to text is traceable.** Each how-to row names its source, and its guide sentences occur in the guide file (X of N rows).
### §10 RESULT (2026-11-16, bim-ootb #3128 `feat/help-showcase`; logs `erp/tests/logs/witness_help_showcase*.log`, `build_help_pack.log`)
**W-HELP-SHOWCASE 13 pass / 0 fail / 0 inconclusive** (real page served from the repo root, GardenAdmin, 0 page errors):
- **S1:** every pack text found in the published XML by the witness's own reader: de_DE 28,176/28,176 · fr_FR 26,208/26,208 · zh_CN 12,336/12,336 · ja_JP 3,656/3,656.
- **S2:** de_DE on the Sales Order header (tab 186, 60 fields): tooltip 54/54 and Tool Tip panel 54/54 German; 6/6 without a German text show English; back to English byte-identical (60 fields).
- **S3:** 8/8 questions → expected window + action. E.g. "How do I close a Sales Order?" → 143 / CL / `erp.close kind=Order number=<Document No>`; "complete an invoice" → 167 / CO, CLI note "erp.complete is offered for Order (C_Order), not for Invoice".
- **S4:** 9/9 rendered links on the role's menu. Clicking the card link opens window 195 (`§IDEMPIERE window=Payment and Receipt(195)`), and the How To widget follows it (`§HELP_CTX window=195 howto=4`).
- **S5:** 4/4 how-to rows = their guide section word for word.
- **Falsifiers FAIL as claimed:** `tamper` S1 in all 4 languages; `nophrase` S3 0/8 (and S4); `deadlink` S4 4/9.
- **Regressions:** W-FIELD-HELP still 13/0; W-ERP-I18N 7/4, identical to main before this PR.

**Pack (`build_help_pack.log`):**

| Language | Fields with a translation | Distinct texts | Bytes | Stale English original |
|---|---|---|---|---|
| de_DE | 14,961 of 18,153 | 3,374 | 523 KB | 251 |
| fr_FR | 14,262 | 2,860 | 452 KB | 3,494 |
| zh_CN | 9,315 | 835 | 189 KB | 3,256 |
| ja_JP | 3,537 | 81 | 60 KB | 2,020 |

- en_US: 4 how-to rows, 5 links, 13 actions.
- Each text is stored once (the first format was 6.5 MB).
- "Stale English original" = the pack's English source differs from today's English. The translation is applied by id, as legacy does. French and Chinese packs are old (3.5.2), so many are stale.

**Measured / decided while building:**
- `sqlite3 -json` keeps a column's own case when an alias equals the column name (`name` came back as `Name`): use distinct aliases.
- The linker is case-sensitive: lowercase "menu"/"product"/"customer" are words, not windows. A table term links only as a whole bold/code guide term, never to a System-only table ("Process" button ≠ AD_Process).
- Search: several window phrases → the LAST wins (English head noun: "customer payment"); "Re-activate" also matches "reactivate" (hyphen dropped, no synonym); "reverse" names both Reverse actions.
- **Film:** de_DE is the strongest pilot (2,528 element Descriptions). Japanese is too thin.

**Not in this slice (named):** process-parameter translations; the prebuilt search index (built at load here, small); how-to text in other languages; how-to beyond the four windows; Japanese is too thin to film (17 Descriptions).

## 11. Film: "Help that answers" (owner 2026-11-16: *"Do the film, if in foreign language, give English subtitles. Remember the closing card credentials"* · *"Closing card also give a citation how important good Help screens are in an app"* · *"Or as opening card, single quote, cite with stats be good, perhaps from a McKinsey level"*)
**Issue it removes:** the help work of §7 and §10 is live but nobody can see it without being walked through it. A short film shows each piece once, on the real page, with nothing claimed that a log does not say.
**Form:**
- House style (prompts/FILM_NARRATION.md):
  - two frames: above, the typed line and the page's own § log lines; below, the REAL ERP page (headless on the CPU) with the help panel cut from the same pixels, enlarged and labelled;
  - real key sounds on the typing, the voice after the return key (K2);
  - English voice (Kokoro, local), English subtitles.
  - The German screen text is shown beside its English original from the dictionary, so a viewer without German reads both.
- Pipeline: `scripts/film_help_showcase/` (copied from `film_immersive_software`). `shots.js` takes the pictures and the facts from bim-ootb main; `guard.js` fails the build if a spoken fact, a picture or a cited source is not as stated. Films are never pushed; the scripts and logs are.
**Beats:**
1. Cover.
2. **Opening card, one quote with a statistic:** McKinsey Global Institute, *The social economy* (July 2012), *"The average interaction worker spends an estimated 28 percent of the workweek managing e-mail and nearly 20 percent looking for internal information or tracking down colleagues who can help with specific tasks."* The words are checked in the copy fetched from mckinsey.com (Wayback, `out/prior/`); the year is shown.
3. Before → after: the old tooltip line (`ColumnName · referenceType`, from git), then the field's own Description and the Tool Tip panel (W-FIELD-HELP F4 15,849/15,849).
4. Typed question "How do I close a Sales Order?" → the answer card (`§HELP_SEARCH`).
5. The card's window link opens Sales Order with its how-to beside it (`§HELP_LINK`, `§HELP_CTX`).
6. Typed question "How can I void a payment?" → Payment, Void, and the honest CLI note.
7. Deutsch: the same field's Description in German (`§HELP_PACK loaded lang=de_DE fields=14961`), its longer Help still English where the pack has none.
8. **Last card** (HOUSE STYLE):
   - prior art read (legacy `WEditor.java:333`, `HelpController.java:146`, `SynchronizeTerminology.java:166`, the published de_DE pack, the McKinsey report);
   - credentials (#3126, #3128 merged, W-FIELD-HELP 13/0 and W-HELP-SHOWCASE 13/0 on main, MIT, the paper's priority date);
   - measured cost (help pack bytes; heap with / without the German pack after a forced GC);
   - the key-sound credit.
**Not said:** no "AI", "live", "faster", "every language"; Japanese is not shown (too thin).
### §11 RESULT (2026-11-16): `~/Videos/Help_that_answers_ERP_EN_AFTER_2026-11-16_v4.mp4` (117.2 s, 2,813 frames, −16.6 LUFS; not pushed, films stay on the machine)
- **Pictures and facts:** `shots.js` on bim-ootb main `216a3607` drove the real page headless (CPU, 1280×720 at 1.5× scale), 0 page errors; `facts.js` VERDICT PASS (the quote found in the saved McKinsey page; title, authors and date on the saved report's title pages; #3126 and #3128 MERGED; MIT; paper priority date 2026-03-30).
- **Witnessed on that tree:** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 13/0 (logs in `scripts/film_help_showcase/out/`).
- **Checks of the build** (logs in `out/`):

  | Check | Result |
  |---|---|
  | guard (18 spoken facts, 6 musts, 5 prior-art rows, 4 not-said) | PASS |
  | cards (no overflow) | 0 too tall |
  | voice fit | 6/6 question tones OK, 0 SHORT / SKIP |
  | K2 (no voice over the typing, keys audible) | PASS, keys 19 dB under the voice |
  | keys | 54/54 typed + 2/2 returns |
  | frames | planned = encoded |
  | **C, captions stay in the bottom 170 px** (`capcheck.py`) | PASS 24/24 cues; falsifier `CAP_Y=960` FAILs 23/24 |

- **Measured cost on the last card:** heap of a German session with the help pack 47.1 MB vs 46.5 MB without (+629 KB, forced GC, one run each).
- **Defects found and fixed while building (each a rule for the next film):**
  - (1) a *wh*-question rose at its end (§NARR_TONE WRONG): reworded;
  - (2) the voice's letter-spelling ("A I", "E R P") showed in the subtitles: `written.js` writes the caption as "AI" / "ERP", times untouched;
  - (3) a long answer became a four-line subtitle over the picture: every turn ≤ about 95 characters (two lines at 46 px), and check C added;
  - (4) `performance.memory` is rounded to the same bucket without `--enable-precise-memory-info` (both sessions read 50,400,000).


### §11 RESULT, Mandarin cut (2026-11-16): `~/Videos/Help_that_answers_ERP_ZH_AFTER_2026-11-16_v4.mp4` (119.3 s, 2,864 frames, −16.6 LUFS), sent to the owner's phone (Remote Control file card)
- **Form:**
  - Mandarin voice (Edge TTS, zh-CN Xiaoxiao / Yunxi; the text goes to Microsoft, free, cached);
  - Chinese subtitles with the English line under each (owner: *"if in foreign language, give English subtitles"*);
  - the language beat is 中文 (zh_CN) on the Sales Order **Description** field: the pack has its description and its help. Document No has no Chinese text and is shown falling back to English (measured, guard `lb.fallback`).
- **The same pipeline serves both cuts:** `LB_LANG` / `LB_COL` / `OUTD` / `FILM_LANG`. The cards carry a string table (Chinese labels, source names and code unchanged); prior-art rows carry `does_zh` / `took_zh`, and a `lang` row per language pack. The last card says the Chinese words are the build session's, not a native speaker's.
- **Witnessed on the tree the film shows (main `bd5b543c`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 13/0.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS (the English cut's guard re-run after the refactor: PASS) |
  | K2 | PASS |
  | keys | 54/54 + 2/2 |
  | gloss | 23/23 turns carry their English |
  | ass_noverlap | 27 events clamped, 0 overlaps left |
  | check C | 34/34; falsifier `CAP_Y=960` FAILs 33/34 |
  | heap | +682 KB with the zh_CN pack |

- **Defects found and fixed (rules for the next cut):**
  - (1) a Chinese line and its English as TWO events: libass stacks overlapping events and one lands on the picture (C failed 24, then 39 cues). One event per piece, `中文\N{\fs26}English`, fixes it.
  - (2) the fitter's turns overlap by up to 0.13 s, and libass keeps a pushed-up event there for its whole life. The Mandarin path now runs `ass_noverlap.py` like the English one.
  - (3) the guard compared raw dictionary text with the panel. The panel shows it as the browser does (`<TableName>` dropped, whitespace collapsed), so the guard compares after that same step (`asShown`).
  - (4) the narration named Document No as 单据号, but the screen says 文档号: the voice now uses the on-screen name.

## 12. The help in the chosen language: names, questions, how-to (owner 2026-11-16: *"Isn't there a Mandarin version of the Help content? The Mandarin should show in Mandarin on the app too"*)
**Issue it removes:** with the screen in 中文, the field help is Chinese (§10), but the How To widget is not:
- the question box matches English names only, and a Chinese question finds nothing;
- the answer card's labels and the how-to rows are English.

**Sources (extracted):**
- the same published packs as §10: AD_Window_Trl, AD_Table_Trl, AD_Ref_List_Trl (DocAction 135, DocStatus 131), names only;
- the descriptions in the zh_CN pack are untranslated English (measured: the Close row's Description equals its original), so the English description shows, as legacy shows it;
- labels: the dictionary's own element names where one exists (AD_Window_ID 窗口, DocAction 文档动作), otherwise a labelled machine entry in `i18n/chrome.json` (the existing convention).

**Measured pack quality, said and not hidden:**
- the zh_CN pack (ADempiere 3.5.2, 2008) names Close 结束, Void 空白, Post 职位, Prepare 程序, Reverse-Correct untranslated;
- its statuses are Closed 关闭, Completed 完成, Voided 空虚.

These are legacy's own words in that language; the twin shows them unchanged.

**Built (bim-ootb):**
- **H1b, per-language names in the help pack:**
  - `names.windows`, `names.tables`, `names.actions` (code → name), `names.statuses` (code → name), each from that language's XML;
  - `howto` rows for zh_CN: the four §10 rows translated by the build session (source `erp/tools/help_howto_zh_CN.json`, each row `translated: build session, not reviewed`, its English source sentences kept), window names linked by the same linker with the Chinese names.
- **H2b, the search in the screen language:**
  - the index takes the language's names beside the English ones;
  - a question containing CJK text is matched on characters (phrase = substring, longest first), not on spaces;
  - a status name also finds the action that reaches it (`AdDocFsm.TRANSITION`: Closed ← Close, Voided ← Void, Completed ← Complete), a dictionary relation, not a synonym list;
  - no exact window phrase: the window sharing the most character pairs (ties as before).
- **H4b:** the How To widget shows the screen language's how-to row when the pack has one, otherwise the English row marked "(English)". The card's labels follow the language. The index is rebuilt when the language changes.

**Claims, W-HELP-SHOWCASE S6-S7 (falsifier `HS_BREAK=nocjk` → S6 FAILs):**
- **S6:** a fixed set of Chinese questions → expected window + action (X of N).
- **S7:** with zh_CN chosen, the How To widget of Sales Order shows the zh_CN row, and every link in it points at a window on the menu.
- **S1 extended:** every name in a pack occurs in its published XML.

### §11 RESULT, Mandarin cut v2 (2026-11-16): `~/Videos/Help_that_answers_ERP_ZH_AFTER_2026-11-16_v5.mp4` (119.2 s, 2,861 frames, −16.5 LUFS), sent to the owner's phone
- **Owner's corrections it answers:** *"The Mandarin should show in Mandarin on the app too"* · *"can its CLI also asks in Mandarin"*.
  - The screen is 中文 from login (`UI_LANG=zh_CN`). The questions are typed in Chinese: 「如何关闭销售订单？」 → 销售订单 / 结束 / 完成, 等候付款; 「怎样完成一张发票？」 → 发票(客户/公司) / 完成.
  - The Sales Order how-to is the zh_CN row, with its translated-by-the-build note.
  - The before beat is the Description field in Chinese.
  - A new last beat types `cd Order; ask 如何关闭销售订单？` at the red1 prompt. Its output is red1's own real answer (LANG=zh_CN, by=LANG): the Chinese card.
- **Witnessed on the tree the film shows (main `f79058ee`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 20/0, W-ERP-ASK 10/0.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS (CLI facts: window 143, CL, zh_CN/LANG, harm read) |
  | K2 | PASS, 3 typed beats |
  | keys | PASS |
  | gloss | PASS |
  | ass_noverlap | 0 left |
  | check C | 33/33 |
  | frames | 2,861/2,861 |
  | heap with the zh_CN pack | +835 KB |

- **Seen on the frame, fixed after:** the panel's own words (Tool Tip, How To, the idle *Place your cursor…*) were English. The zh_CN pack holds none of the three, so the film is legacy-faithful. But the de/fr packs DO hold *Place your cursor…*, and the page ignored them; fixed in bim-ootb #3137 (S2c, falsifier `nomsgtrl`).
- **Measured cost of the language immersion** (owner: *"is this costly to do"*), this machine (i5-13500HX), the page's own code on an in-memory seed:

  | Measure | Value |
  |---|---|
  | download, the chosen language once, then cached (gzip) | de 152 KB, fr 133 KB, zh 60 KB, ja 19 KB, en how-to 2 KB |
  | heap after a forced GC | +0.6–0.8 MB on ~48 MB |
  | parse + index build on a switch | 4–8 ms |
  | one question | median 0.3–0.8 ms, p95 ≤ 2.1 ms |
  | `erp.ask` at the terminal | ~1 s, the engine boot |

  The cost that remains is content: how-to translations per language, and old packs' words.

### §12 RESULT (2026-11-16, bim-ootb #3133 MERGED): W-HELP-SHOWCASE 20/0
- **Names per language, from each language's XML:** fr 254 windows / 453 tables / 13 actions / 12 statuses; de 349 / 0 / 13 / 12; ja 288 / 0 / 13 / 12; zh 250 / 5 / 11 / 12.
- **S1 extended to names:** fr 732/732, de 374/374, ja 313/313, zh 278/278.
- **zh_CN how-to:** 4 rows (`erp/tools/help_howto_zh_CN.json`), each marked as the build session's translation, with 4 links, all bold window names.
- **S6** 7/7 Chinese questions (one English question asked with 中文 chosen). **S7** the Sales Order row in zh_CN, links 1/1.
- **Falsifiers:** `nocjk` FAILs S6 (1/7); `tamper` FAILs S1 and the names in all 4 languages; `nophrase` and `deadlink` FAIL as before.
- **Regressions:** W-FIELD-HELP 13/0; W-ERP-I18N 7/4, the same failures and numbers as main.

**Measured / decided:**
- CJK has no case, so a CJK window name links only as a whole bold term. 菜单 ('menu') and 产品 ('product') are words; they matched the Menu and Product windows before this rule.
- A status name finds the action that reaches it through `AdDocFsm.TRANSITION`: 关闭 (the status Closed) → Close, whose pack name is 结束. This is the dictionary's own relation, not a synonym.
- The zh_CN pack's action descriptions are untranslated English, so the English shows, as legacy shows it.
- **Known gap, not hidden:** the zh_CN pack has no word for "void" (Void = 空白, Voided = 空虚). 「作废」 finds the window but no action; it is left out of the fixture.

## 13. The CLI asks in the chosen language: `erp.ask` (owner 2026-11-16: *"can its CLI also asks in Mandarin or local chosen language?"* · *"u can take it on after informing the CLI session, as it be resting"*)
**Issue it removes:** the question box exists only in the page; a person at the terminal (or `red1`) cannot ask "How do I close a Sales Order?" or 「如何关闭销售订单？」.
**Design:**
- the door gets one read verb, `erp.ask question=<text>`, that calls the SAME `erp/help_search.js` over the same dictionary and the same help pack of the CLI's chosen language;
- the language follows the CLI's own rule (owned by the CLI session, `CLI_ERP_IVR.md`: AD_Preference Language → LANG → System);
- the answer prints the card as lines: window, action and when it is allowed, the CLI line, the guide link, the how-to text (tags stripped);
- English output stays byte-identical for every other verb.

**Coordination:** the CLI session owns `common/door`. It is resting (not running, 2026-11-16), so it is informed by a dated note in its own prompt file `prompts/CLI_ERP_IVR.md` before any door file is touched (owner's instruction above).
**Claims, witness W-ERP-ASK:**
- A1: the English question set gives the same window and action as the page's S3;
- A2: the Chinese set (LANG=zh_CN) gives S6's answers;
- A3: verbs.json lists the verb and the door's download includes help_search.js.
- Falsifier `ASK_BREAK=nolang` (the pack's names ignored): A2 FAILs.

### §13 RESULT (2026-11-16, bim-ootb #3136): W-ERP-ASK 10/0
- **Built:** `erp_cli.js ask` over `help_search.js indexFrom` (the page's own index builder); `common/door/lang_rule.js`, the §30 order written once.
  - Measured: the seed has no client 0 row, so step (3) falls to the role's client, then en_US, and the answer names the step.
  - `erp.ask` lives in `vocab/hand.json`; `verbs.json` is composed from it (compose `--check`: CURRENT).
  - The red1 word `ask` is in the ERP context (W-RED1-WORDS R2: an anywhere-word reaches only model/ninja), used as `red1 'cd Order; ask …'`.
  - The answer's `summary` is the card red1 prints, with the page's `help.*` labels resolved as `ErpI18n.t` resolves them.
- **Checks:**
  - A1 8/8 English questions through the door; A2 7/7 Chinese; the L order (flag, LANG, fallback, preference on the rule); A4 the zh/en cards; A3 a read, an AI gets the answer.
  - Falsifier `ERP_BREAK=nolang` FAILs A2 and L (named `ERP_BREAK`, not `ASK_BREAK`: `erp_cli`'s one falsifier switch).
  - Corrected claim: the door's flat download does NOT need `help_search.js`, because `erp_cli` already runs from the repo (it loads the ERP engine). A3 checks the verb's harm and actors instead.
- **Door witnesses on the branch:**
  - pass: W-ERP-VERBS 46/0 (its explicit verb list and subcommand regex gain `erp.ask` / `ask`, as each new verb does), W-RED1-WORDS 3/0, W-VOCAB-COMPOSE 7/0, door static / honest / help, msg-door, red1 api / help / shell / welcome / post, help-student, msg-catalog, W-HELP-SHOWCASE 20/0;
  - fail identically on main `14ade155` (local setup): W-MCP-DOWNLOAD (puppeteer), W-RED1-REPORT (`sql.js`).
- **Defect found and fixed:** a JSON rewrite of `words.json` reflowed the CLI session's hand-aligned file (+572 / −71). It was reverted, and the entry inserted as text in the file's own style (+3 / −1).

## STATUS
2026-11-16: P1 built and witnessed (5/0), merged as bim-ootb #3079. P2a built and witnessed (W-MSG-CATALOG 4/0), merged as bim-ootb #3082. P3a built and witnessed (W-HELP-STUDENT 5/0), merged as bim-ootb #3083. P3a-1 (help footer + opening tip, `red1 --fast`), bim-ootb #3084. P2b (W-MSG-DOOR 5/0) #3108. P1b (W-FIELD-HELP 13/0) #3126. Depends on `prompts/DOCS_I18N.md`, `prompts/CLI_ERP_IVR.md` (CLI session owns), `prompts/ERP_UI_LOCALES.md`.

## Note from the code-design lane (2026-11-16): `msg_keys.scan` also reads calls inside comments
Found while building F-19 (`prompts/CODE_ARCHITECTURE_DESIGN.md` §F.28, bim-ootb #3103). `scan()` matched `M('key', …)` written in a
header COMMENT and reported a use of the key `key`. That gave a false unknown-key once the file was tracked. X0 now blanks comments
first with the repo's one tokenizer, `scripts/lib/js_scan.js` (`scan(src).code`, same length and lines), and only then calls `scan`. **No
effect on W-MSG-CATALOG M3 today:** it scans only `words_core.js` and `red1.js`, which have no such comments. If M3's file list widens,
the same `js_scan` step keeps it from counting prose. Left for this lane to decide; nothing in `common/door` was changed.
2026-11-16 (P2b closed): bim-ootb #3108 merged (`f18ae08c`). The guides list the six-file download in 7 languages + ProposerGuide (#798, deployed, all 8 pages checked live). W-MSG-DOOR baseline moved to the `main` it merged (`304a30a0`); D4 treats `say()` as the § log. Merges with the CLI session's work were unions of `messages.json` only. W-RED1-WORDS R1 / W-HELP-STUDENT S4 on `status@erp` fail on clean main since #3117 (reported to the CLI session). Locale (login language from `AD_Preference`, then LANG, then the System client) handed to the CLI session (`CLI_ERP_IVR.md`). Next: P1b (§7).
