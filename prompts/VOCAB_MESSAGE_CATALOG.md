# ⚠ DO NOT REMOVE
Scope: **SPEC and phase ledger** for ONE vocabulary the CLI and the guides both read: a keyed message catalog and a help catalog over the Application Dictionary, with a short/long level and a locale. Read the log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE.
Background, measurements and prior art are in `prompts/DOCS_I18N.md` §4b-§4d (owner ideas of 2026-11-16: shared vocabulary for CLI and guides, a `Student` level = the long text, reuse the legacy element/message model, remove the copied Help). This file owns the BUILD; that file keeps the findings.

## ▶▶ RESUME HERE FIRST (updated 2026-11-17 at session close; the next "resume message" session starts here)
**Owner, 2026-11-16 (verbatim, binding):** *"Agree. Update prompt to resume new session. We check (a) and agree your b and c."*
**Next task: the BIM help panel (Viewer + Modeller), §14.** Spec before code; the design below is AGREED, the one open item is (a).
**STATE 2026-11-17 (read first):**
- (a) decided: bSI's official bSDD text, verbatim (§14 (a) DECIDED).
- Step 1 'This element' was already built in `#info-panel` (§14 FINDING).
- Step 3, class text in the info panel: BUILT and live, bim-ootb #3150, W-CLASS-HELP PASS (§14.1 RESULT).
- Step 2, How To in the `?` palette: BUILT, bim-ootb #3156, W-HOWTO PASS (§14.3 RESULT).
- The help panel itself (left, stays open, amber, draggable, reopens as left): BUILT, bim-ootb #3160, W-HELP-DOCK PASS (§14.4 RESULT).
- §14.5 step 1 (shared panel + drag helper in `common/`): BUILT, bim-ootb #3165.
- §14.5 step 2, the Modeller adapter: BUILT, bim-ootb #3171, W-HELP-DOCK-M PASS (§14.5 RESULT step 2).
- §17 film: **v3 MADE 2026-11-17** (`~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4`, framed bigger, new Jakob Nielsen quote, §17.3 RESULT; v2 kept). Other languages on the owner's word.
- **W-HOWTO H1 failure on main FIXED 2026-11-17** (bim-ootb #3172 merged, §14.3.2 RESULT): a tie in the guide-link choice now goes to the heading sharing a word with the tool, not the first section in the page.
- BIM User Guide: a basic Help section (Viewer, Modeller, and what the command line does and does not have) added 2026-11-17 (BIMCompiler docs/bim-help-basic).
- **NEXT:** (1) DONE 2026-11-17: the Modeller guide titles are in the dictionary (§14.5.1 RESULT, bim-ootb #3173); open from it: the 10 older uncatalogued Modeller strings (one more batch, W-MODELLER-I18N (2)) and the guide PARAGRAPHS (owner's call, ~830 translations); then the prefixes, box side (§16 item 7: owner agreed `?` / `#<number>`; the CLI session specs the shell side as CLI_ERP_IVR §41).
- The three §14.1 owner items were ANSWERED in §14.2 (ISO note kept; type classes via their cited occurrence class; our sentence in 15 languages, all built, #3152).
- **Open owner question:** 8 Viewer tools have no section in the BIM User Guide (§14.3 RESULT), so they get no guide link until the guide has a section.
- **Waiting on the CLI session (no action here):** §42 S3, the short-name limit fix in `assist_core.nearest()` (§16 item 1). It will message when merged. After that, the help box calls `nearest()` (no second edit-distance function).
- **Known gap:** §14.5 step 1 dragged only 2 of the 13 `A._makeDraggable` callers in a witness (§14.5 RESULT step 1).
- **Research kept:** §16. The licence copies and the bSDD fetch live in `~/bim-compiler/build/bim_help_prior/` (not tracked).
1. **(a) CHECKED 2026-11-17, see §14 (a) RESULT:** CC BY-ND 4.0. Verbatim English with attribution is usable. A translation needs bSI's written consent. **DECIDED 2026-11-17: use bSI's own official translations from bSDD, verbatim; coverage measured, see §14 (a) DECIDED.** Original task: may buildingSMART's IFC class definitions (the IFC4 / IFC4.3 documentation text) be shown, translated and redistributed inside our pages?
   - Read the actual licence or terms on buildingSMART's own site, save the copy into the session's prior folder, and cite the clause.
   - If the terms are unclear, say "not usable yet". Never assume.
2. **AGREED (b):** our own small element dictionary: a Description and a Help per IFC class / element kind, written once and owned by us.
   - Translated through the Viewer's existing 18-locale AD_Message pipeline (`viewer/i18n/`, `locale_loader.js`), never a second loader.
   - Shaped like the ERP's AD rows, so the same `field_help.js` reads it.
3. **AGREED (c):** what we already know per element, with no prose: its rule, its source (sheet / IFC / LOD), its cost line. Shown in the panel's "This element" part. Ready today from existing data.

**The agreed design (owner "Agree" to the proposal in this session):**
- **Where:** open it from the EXISTING `?` pill (Viewer `{id:'help', key:'F1'}`, `viewer/panels.js:1355`; Modeller `#m-help`), NOT the Find panel. An answer may OFFER a Find query as a link.
- **Parts, as the ERP panel:**
  - **This element:** on select / hover, from (b) + (c).
  - **How To:** for the current tool / pill, from `common/door/verbs.json` descriptions + examples and the BIM guide sections.
  - **The question box:** the existing command palette (`showCommandPalette`, `viewer/scene.js:2907`) becomes it. One search, not two.
- **One shared module:** move `erp/field_help.js` and `erp/help_search.js` to `common/help/`, with one adapter per app (ERP: its dictionary; Viewer: pills + verbs + classes; Modeller: tools + verbs + rules).
  - The Modeller's two hard-coded overlays (`#m-help-panel` and `#m-guide-panel`) merge into it.
  - `ask` at the CLI covers every app.
- **Layout:** a right dock on desktop; a full-height sheet on mobile (the Viewer's right side is tight; the Modeller has no mobile layout).
- **Facts already surveyed (do not redo):** see §14 below.

---

## ▶ RESUME HERE (2026-11-16, end of session bim-compiler-75; DONE since: P1b, §10-§13; kept for its decisions D1-D4)
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

### §11 RESULT, German cut (2026-11-16): `~/Videos/Help_that_answers_ERP_DE_AFTER_2026-11-16_v1.mp4` (132.3 s, 3,176 frames, −16.3 LUFS), sent to the owner's phone
- **Owner:** *"Do a German version"*.
  - Deutsch from login; Edge TTS de-DE Katja / Conrad; German captions with the English line under each (one event per turn; each German turn is one line, ≤ 68 characters).
  - Questions: *Wie kann ich einen Auftrag schließen?* → Auftrag / Schließen / Fertiggestellt, Zurückgehaltene Zahlung; *Wie kann ich eine Rechnung fertigstellen?* → Rechnung (Kunde) / Fertigstellen.
  - The Sales Order how-to in German; the Description field in German, both lines translated.
  - The red1 beat `cd Order; ask "Wie kann ich einen Auftrag schließen?"` gives the real German card (LANG=de_DE).
- **App side first** (bim-ootb #3138): the de_DE how-to rows, German card labels, the German question set in both witnesses.
  - W-HELP-SHOWCASE 23/0 (S6de 5/5, S7de); W-ERP-ASK 11/0 (A2de 5/5).
  - A translated row links a window name only as a whole bold term, in every language.
  - #3137 made the panel's own words come from the pack's AD_Message_Trl, so the idle line reads *Setzen Sie den Mauszeiger in ein Feld auf dem Bildschirm*.
- **Witnessed on the tree the film shows (main `f869e430`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 23/0, W-ERP-ASK 11/0. Credentials: #3126 #3128 #3133 #3136 #3138, all MERGED.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS |
  | K2 | PASS, 3 typed beats |
  | keys | PASS |
  | gloss | PASS |
  | ass_noverlap | 0 left |
  | check C | 31/31 |
  | frames | 3,176/3,176 |

- **Heap of a German session with the pack: +1.29 MB** (forced GC, one run). The pack now also carries names and how-to rows; the earlier +629 KB was before those.
- **Pipeline:** `gloss.js` serves any non-English cut (`FILM_LANG`); `build.sh` runs gloss → ass_noverlap for it; `cards.js` has a de string table; `priorart.json` has `does_de` / `took_de`; a CLI question with spaces is quoted.

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

## 14. The BIM help panel (Viewer + Modeller): SPEC STUB, owner-agreed design, (a) to check (2026-11-16)
**Issue it removes:** the ERP now has field help, How To, a question box and languages (§7, §10-§13). The BIM apps have only:
- a pill palette (Viewer);
- an English-only toolbar sheet and a hard-coded English guide overlay (Modeller);
- no description of any element class at all.

**Surveyed facts (read-only survey of bim-ootb origin/main, 2026-11-16; cite, do not re-derive):**
- **Viewer:**
  - Help pill `{id:'help', key:'F1'}` (`viewer/panels.js:1355`) opens the command palette (`viewer/scene.js:2907`), a search over pill actions (`_mainPillActions` about `scene.js:2985`) with a guide link (`scene.js:2952`). F1 and `?` both open it (`scene.js:3635`, `:3734`).
  - Pill bullets `children:[{name}]` (`panels.js:1340-1365`), translated as `pillc_<id>_<n>` (`panels.js:1580-1583`).
  - Tooltips `data-trl-title` (`viewer.html:576-586`, keys `ui_tt_*`).
  - `#info-panel` shows the selection: class, name, GUID, storey, discipline, material (`viewer.html:515-535`, filled by `nf_panel_search.js:680`). It sits at bottom 50px / right 70px; on mobile it is 120-180 px wide (`viewer.html:157-166`, `:408`, `:461`).
  - `viewer/hover_name.js`: an opt-in hover label (`'` key).
  - 18 locales (`viewer/locale_loader.js` `AVAILABLE_LOCALES`), labels in `viewer/i18n/<code>.json`, built from AD_Message base + `AD_Message_Trl_<lang>.xml`; `window._trl`.
- **Modeller:**
  - `#m-help` / `#m-help-panel` (`modeller.html:74-87`, `:6571-6617`): the toolbar registry + hard-coded `SHORTCUTS` (`:6572`).
  - `#b-guide` / `#m-guide-panel` (`:181`, `:6365-6420`): about 11 hard-coded `SECTIONS`.
  - `modeller/props_panel.js` `#pp-panel` shows the selection.
  - Hover fires `dagevu:hover {fid}` (`modeller.html:1723-1731`); its only consumer is `edit_delta_ui.js:82`.
  - The right side is crowded (`right:70px`: pp-panel, help, guide, hist). No mobile media queries.
  - Translates by exact-string match through the Viewer's dictionary (`modeller.html:325-326`, `locale_loader.js:439+`), no `_trl()` calls.
- **No help-grade element / class description data exists** in viewer/, modeller/, common/ or erp/ (`dagevu_catalog.json` has labels only).
  - Real descriptions exist only in: `common/door/verbs.json` (title, description, input descriptions, examples), `vocab/words.json`, `modeller/element_defaults.json` labels and notes, and the pill bullets.
- **Reuse:**
  - `erp/field_help.js` (`window.FieldHelp`, no deps; `attach(el, f)` is generic, `attachIn` is ERP-crud markup) and `erp/help_search.js` (`makeIndex` / `indexFrom`, no DOM) are portable logic.
  - The panel DOM, pack loading and card rendering live in `erp/idempiere.html` and would be extracted.
  - A new JS file must be added to `viewer/sw.js` and `modeller/sw.js` shell lists.

**(a) RESULT, licence checked 2026-11-17 (reported to the owner; nothing built on it yet):**
- **The terms.** buildingSMART's own IFC documentation cover page (`content/cover.md` in `buildingSMART/IFC4.x-development`, last changed 2026-10-01, `23bea5e6d0`; same text on the IFC4.3 HTML cover page): *"The Industry Foundation Classes are published under Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)."* and *"Prior written consent is required if you want to use IFC and/or the documentation in situations that are not covered by the CC BY-ND 4.0 license."* The IFC4.3 repo README says the same for the formal releases.
- **CC BY-ND 4.0, the clauses that decide it:** §1(a) *"Adapted Material … in which the Licensed Material is **translated**, altered, arranged, transformed, or otherwise modified"*; §2(a)(1) we may *"reproduce and Share the Licensed Material, in whole or in part; and produce and reproduce, but **not Share, Adapted Material**"*; §3 *"You do not have permission under this Public License to Share Adapted Material."*
- **Verdict:**
  - **Shown in English, word for word, in whole or in part: USABLE**, with attribution (buildingSMART International, CC BY-ND 4.0, licence link, link to the source page; IFC™ credited as a trademark).
  - **Translated into any of our languages: NOT USABLE** without buildingSMART's prior written consent (contact@buildingsmart.org). A translation is Adapted Material, and we may not share it.
  - **Reworded or shortened into our own sentences: NOT USABLE** as their text. That is (b): we write our own.
  - **Not covered:** the parts the cover page marks as based on other standards are outside buildingSMART's copyright; their own terms apply.
- **Not read (gap, said plainly):** the bSI IP Policy PDF the cover page refers to. The CDN gave 403 and the web archive gave 429. The verdict rests on the licence text alone; read the IP Policy before relying on anything beyond verbatim English.
- **What it means for the design (an owner choice, not decided):** (b) is the only route to a translated class text. (a) can at most be an English-only "IFC definition" quote, or just a link to the class's bSI page. A link is always allowed.
- **Saved copies:** `~/bim-compiler/build/bim_help_prior/` (not tracked): the cover page in two copies (repo `cover.md` + archived IFC4.3 HTML), the dev repo's LICENSE.md + README, the CC BY-ND 4.0 legal code (html + txt), and `fetched_at.txt`.

**(a) DECIDED (owner, 2026-11-17, verbatim):** *"We proceed with community licensed IFC info as we are a FOSS non commercial prototype. https://forums.buildingsmart.org/t/proper-way-to-access-translations-of-ifc-entities/4092"*
- **The thread's answer** (post 4, buildingSMART 2022-02-09): official translations are made on `translations.buildingsmart.org` and published on GitHub, in bSDD and through an API. We therefore COPY buildingSMART's own published translations, word for word. We never translate IFC text ourselves. This keeps both the Prime Rule (extract) and ND (we share their material, not an adaptation).
- **Source = bSDD IFC 4.3**, `https://identifier.buildingsmart.org/uri/buildingsmart/ifc/4.3`, licence `CC BY-ND 4.0` per the API, status `Preview`, released 2024-01-11. It lists 18 languages: EN de-DE es-ES ja-JP nl-NL no-NO pt-PT ru-RU zh-CN it-IT pl-PL da-DK cs-CZ pt-BR sv-SE hr-HR is-IS tr-TR. Fetch: `GET api.bsdd.buildingsmart.org/api/Class/v1?Uri=…/class/<IfcClass>&languageCode=<code>`. A missing language comes back as the English text, so "translated" = it differs from EN.
- **MEASURED 2026-11-17** (`build/bim_help_prior/bsdd_cov.log`, data `bsdd_ifc43_shipped_classes.json`; population = 51 distinct `ifc_class` over the 11 shipped `viewer/buildings/*_extracted.db`, list in `shipped_ifc_classes_distinct.txt`):
  - In bSDD 4.3: 48/51. Missing: `IfcWallStandardCase` (removed from IFC 4.3), plus `IfcFlowInstrumentType` and `IfcSensorType`. **Corrected 2026-11-17:** those two are not old names; bSDD leaves out every `…Type` class (`IfcWallType`, `IfcBeamType` and `IfcSensorType` all return 400; `IfcSensor` and `IfcFlowInstrument` return 200). Mapping a type to its occurrence class needs a cited rule, never a guess.
  - Definition translated, of 48: **pt-BR 46, es-ES 31, de-DE 9, ja-JP 9, zh-CN 0, fr-FR 0** (fr is not in bSDD's list; zh-CN is listed but empty for all 48).
  - Viewer locales that bSDD covers at all: de, es, zh, ja, pt_BR. Not covered: fr, ms, th, ko, ar, id, bn, bl, af.
- **Consequence for the panel:** the class text shows in the chosen language where bSI has it; otherwise in English, with a visible "English (no official translation)" label. It is never machine-translated. Attribution line on every card. (b) stays for our own Help, the things IFC does not say.
- **Next to spec:** the cached pack (the bSDD rows written once into a file per language at build time, never fetched live by the page); the label rule; the witness (X of N shipped classes with a text; per language: X translated; falsifier = a zh-CN card that claims to be translated).

**Build order (owner "Agree", 2026-11-17):** 1 "This element" (c) → 2 How To → 3 class text = our own (b) on top, bSI's official (a) beneath (chosen language where bSI has it, else English labelled).
**FINDING 2026-11-17: step 1 (c) is ALREADY BUILT, in the Viewer's `#info-panel` (bim-ootb `origin/main` `ed092608`). Do not build a second one.**
- Base rows: class, name, GUID, building, storey, discipline, material (`viewer.html:521-527`), plus a `· provisional` mark (`ProvTotals`, `nf_panel_search.js:687`, `picking.js:628`).
- Sibling blocks, each with ONE renderer that both picks call, and each hidden when there is no row:
  - `#info-cost`: the cost line (`NF._showClassCost`, §FIND_INFO_COST);
  - `#info-4d`: the 4D task window (`info_4d_panel.js` via `NF._show4DWindow`);
  - `#info-dxf2bim`: drawing provenance drawn / derived / assumed, source sheet and handle, size basis (`info_dxf2bim.js`; callers `picking.js:652`, `find_erp_push.js:248`).
- So (c) = this panel. A help-dock "This element" part that copied it would be a second implementation of one responsibility.
- **Proposed instead (for the owner):** the class text (b)+(a) becomes one more sibling block, `#info-class-help`, with its renderer in the `info_dxf2bim.js` convention (dual-mode, both picks delegate, hidden when there is no row). The `?` dock keeps How To + the question box and refers to the selection instead of repeating it.

**Decisions:** the design in RESUME HERE FIRST (owner "Agree", 2026-11-16).
- (b) our own element dictionary — AGREED;
- (c) per-element provenance — AGREED;
- (a) IFC documentation text — CHECK THE LICENCE FIRST and report.

**To spec next (before code):**
- the element dictionary's shape (rows keyed by IFC class, PredefinedType where it matters; Description, Help; source per row; written once);
- its first content (the classes the shipped buildings actually hold, counted from their DBs);
- the adapters;
- the move to `common/help/` without changing the ERP's witnessed behaviour (W-FIELD-HELP 13/0, W-HELP-SHOWCASE 23/0, W-ERP-ASK 11/0 must stay green);
- the witness: X of N pills with How To text; X of N element classes in the shipped buildings with a (b) entry; (c) shown for a sample of selected elements; the question set per app; the mobile sheet.

## 14.1 SPEC: the class-text block in the Viewer info panel (owner 2026-11-17: chose "Info panel" for the class text)
**Issue it removes:** clicking an element tells you WHERE it is, WHAT it costs and WHEN it is built (`#info-panel`, §14 FINDING), but never what this KIND of element is. No class description exists anywhere in viewer/, modeller/, common/ or erp/ (§14 survey).

**Where:** a new sibling block `#info-class-help` in `#info-panel`, right under the base rows. ONE renderer `viewer/info_class_help.js`, in the `info_dxf2bim.js` convention:
- dual-mode (browser global `InfoClassHelp` + `require()`);
- called by BOTH picks, next to `InfoDxf2Bim.render` (`picking.js:652`, `find_erp_push.js:248`);
- hidden when the class has no row, never an empty box.
- Viewer only. The Modeller has no info panel; it comes with the `?` dock.

**Data: rows in the ONE existing label pipeline, no second loader, no loader change.** Rows are added with `viewer/tools/trl_add_batch.js` to `ad_message_base.csv` + `AD_Message_Trl_<lang>.xml`, then `build_trl.js` builds the packs. Per IFC class `<C>`:
| key | text | translated rows (`trl="Y"`) |
|---|---|---|
| `ifccls_<C>` | (b) OUR one or two plain sentences: what this kind of element is, for a site or office user | pilot fr_FR de_DE ja_JP zh_CN (machine, Claude, labelled in the XML header as every Viewer batch is); other locales `trl="N"` = English, counted |
| `ifcdef_<C>` | (a) buildingSMART's definition, VERBATIM from bSDD IFC 4.3 | ONLY where bSDD has an official text differing from EN (measured: de 9, es 31, ja 9, pt_BR 46, zh 0, fr 0); every other locale `trl="N"` |
| `ifcdef_<C>_lang` | the bSDD language code of the shown (a) text: base `EN`; `de-DE` etc. where the official text is used | same rows as `ifcdef_<C>` |

UI words (ours, translated like any label): the heading for (b), the heading "IFC definition", the line "English: no official translation in your language", the credit line "buildingSMART IFC 4.3 (bSDD), CC BY-ND 4.0" with the class's bSDD link.

**Population:** the 51 distinct `ifc_class` of the 11 shipped `viewer/buildings/*_extracted.db` (`build/bim_help_prior/shipped_ifc_classes_distinct.txt`). (a) exists for 48: `IfcWallStandardCase`, `IfcFlowInstrumentType` and `IfcSensorType` are not in bSDD 4.3 and get (b) only. A class outside the 51 (an imported IFC) gets no block and logs `skip reason=no_row`.

**The label rule (one place, in the renderer):**
- (a) is shown with the "English: no official translation…" line iff `_trl('ifcdef_<C>_lang')` is `EN` and the chosen locale is not English.
- The credit line is always shown under (a).
- (a) is never reworded, shortened or machine-translated.

**Size:** (a) English is 10.8 kB for 48 classes (longest 588 chars). It goes into each label pack, about 45 kB today.

**Log:** `§CLASS_HELP guid=… class=… ours=Y|N ifc=Y|N ifc_lang=<code> locale=<code>`, one line per render.

**Witness W-CLASS-HELP (`viewer/tests/witness_class_help.js`), each check naming the issue it proves:**
1. **Coverage:** X of N shipped classes have `ifccls_` (expect 51/51) and `ifcdef_` (expect 48/51). N is counted from the DBs at run time, never typed in. N = 0 → INCONCLUSIVE.
2. **Verbatim (a):** every `ifcdef_<C>` text in every pack equals bSDD's text for that class and language, byte for byte. Oracle: `bsdd_ifc43_shipped_classes.json`, copied into the repo as the batch's source. Falsifier: change one character and the check must FAIL.
3. **Honest coverage:** per locale, the count of `trl="Y"` `ifcdef_` rows equals the bSDD measured count.
4. **Label rule, rendered in node with a fake DOM:**
   - IfcWall in de_DE → German text, no fallback line;
   - IfcWall in zh_CN → English text + the fallback line;
   - IfcWallStandardCase → (b) only, no (a);
   - an unknown class → hidden.
   - Falsifier: a zh card without the fallback line must FAIL.
5. **Both picks call the renderer:** the two call sites are present, and a live page pick logs `§CLASS_HELP`.
6. **No regression:** `build_trl.js --check` and W-VIEWER-I18N stay green.

### 14.1 RESULT (2026-11-17): BUILT, bim-ootb #3150 (`feat/class-help-info`)
- **Files:**
  - `viewer/info_class_help.js` (renderer, `model()` / `html()` exported for the witness);
  - `#info-class-help` in `viewer.html`;
  - calls in `picking.js` and `find_erp_push.js`;
  - batches `viewer/tools/trl_batch_2026-11-17_ifcdef.js` (generated from `ifc_class_help/bsdd_ifc43_shipped_classes.json`, the bSDD copy, which is also the witness's oracle) and `trl_batch_2026-11-17_ifccls.js` (our 51 sentences, fr/de/ja/zh + 3 panel words in 14 languages);
  - LOCALE_VERSION 8→9, sw v1715→v1716.
- **(a) is folded** (`<details>`, closed): the bSI texts run up to 588 chars, and the info panel is 120-180 px wide on mobile.
- **W-CLASS-HELP PASS** (`viewer/tests/witness_class_help.js`):
  - contract kit 7/0 over 918 rows (51 classes × 18 packs), red control caught (one character changed in the German IfcWall text; a zh card without its fallback line);
  - `§CLASS_HELP_COV`: de 9 official / 39 fallback, es 31/17, ja 9/39, pt_BR 46/2, zh 0/48, fr 0/48;
  - C4a-d named cases;
  - C5 real Find pick on Duplex: de_DE shows the German bSI text, no fallback line; zh_CN shows our Chinese sentence + English bSI text + fallback line. Credit is shown in both.
  - The pick loop clicks results until `#info-class` reads `IfcWall`, because the Find list mixes in IfcWallStandardCase.
- **Found on main, fixed in the same PR:** bim-ootb #1937 added 4 `pill_roadstd` rows to `ad_message_base.csv` but to no `AD_Message_Trl_*.xml`, so `build_trl.js` threw on main since 2026-10-07. They were added as `trl="N"`.
- **W-VIEWER-I18N** (de_DE, zh_CN): clean main fail=5, branch fail=3. Leaks are unchanged (23/308, 23/310). The 3 left pre-exist and are other lanes':
  - (3b) unknown keys `ui_export_bcf`, `wi_store_changed`;
  - (3c) `pillc_lod400_*` not in the CSV;
  - erp9-zero-leaks (roadstd untranslated + 19 uncatalogued).
- **Open (owner):**
  - (i) The German bSI IfcWall text cites ISO 6707-1 (1 of 48 × 6 languages mentions ISO). The cover page's Copyright Exclusion Notice says such parts sit outside bSI's copyright. Shown verbatim for now.
  - (ii) Type classes (`IfcSensorType`, `IfcFlowInstrumentType`): map to their occurrence class only with a cited rule.
  - (iii) (b) in the 13 non-pilot languages: on the owner's word.
- **Next in the agreed order:** step 2, How To in the `?` panel.

## 14.2 SPEC + RESULT: type classes and the other 10 languages (owner 2026-11-17: *"Your advice on all 3."* then *"proceed"*)
**Owner answers on the three §14.1 open items:**
- (i) The ISO 6707-1 note in the German IfcWall text: KEEP, verbatim. No change.
- (ii) Type classes: borrow the occurrence class's bSDD text, and SAY SO on screen.
- (iii) Our sentence in the other languages: translate now, machine, no human review (the guides rule).

The written spec follows the agreement made in chat and comes before the merge; it records what was agreed.

**(ii) Type classes.**
- **Rule (cited, not guessed):** each type's own IFC 4.3 page says *"Occurrences of **IfcSensorType** are represented by instances of _IfcSensor_"*, and the same for `IfcFlowInstrumentType` → `IfcFlowInstrument` (`docs/schemas/domain/IfcBuildingControlsDomain/Entities/<Type>.md` in buildingSMART/IFC4.3.x-development, copies saved in `viewer/tools/ifc_class_help/`).
- The mapping lives in `type_of.json`: type → occurrence class + cited sentence + saved file. The batch refuses to build if the sentence is missing from the saved page.
- **Rows:** `ifcdef_<Type>` = the occurrence class's bSDD text, verbatim (`bsdd_ifc43_type_of_classes.json`). `ifcdef_<Type>_lang` = its language. `ifcdef_<Type>_of` = the occurrence class.
- **Panel:** the heading is "IFC definition of {cls}" (new word `ui_cls_ifcdef_of`, 14 languages), and the bSDD link goes to the occurrence class.
- **bSDD measured:** IfcSensor and IfcFlowInstrument are official in pt-BR only.
- `IfcWallStandardCase` stays (b) only: it was removed from IFC 4.3 and bSDD has no row for it.

**(iii) Ten more languages.** ms_MY es_ES th_TH ko_KR ar_SA pt_BR id_ID bn_BD bl_BD af_ZA, one Sonnet agent per language.
- The agents read the English, looked up building words in each language's existing Viewer XML, and wrote JSON verified at 51/51 keys.
- English synonym pairs such as "lift (elevator)" are not carried into translations.
- **New tool `viewer/tools/trl_fill_batch.js`:** it fills `trl="N"` rows of EXISTING keys. `trl_add_batch.js` only adds new keys. The fill tool:
  - is idempotent;
  - REFUSES to overwrite an existing translation (edit the XML for that);
  - keeps untouched rows byte-identical;
  - adds a source line to the XML header.

**Witness W-CLASS-HELP, extended:**
- C1-C3 are type-aware.
- **C6:** a type shows its cited occurrence class, named in the heading and the link.
- **C7:** `ifccls_` rows are trl=Y for all shipped classes in every non-English XML, and in none of the en_* XMLs.
- **C8:** a fill re-run fills 0, and an overwrite is REFUSED with every XML hash unchanged.
- Red control: also a type card hiding its source class.

**RESULT 2026-11-17 (bim-ootb `feat/class-help-types-langs`):**
- **W-CLASS-HELP PASS:** contract 8/0 over 918 rows, red control caught; C4a-d, C6a, C7, C8 pass; C5 real Find pick de_DE + zh_CN.
- **Coverage:**
  - `§CLASS_HELP_COV`: (a) 50/51 (was 48); official: pt_BR 48, es 31, de 9, ja 9, zh 0, fr 0.
  - `§CLASS_HELP_TRL`: our sentence 51/51 in all 15 non-English locales.
- **W-VIEWER-I18N** (th_TH, pt_BR): fail=3, the same 3 that pre-exist on main (§14.1 RESULT). Format passes. Leaks 23/309 and 23/312.
- **Pack sizes** (`§TRL_PACK_SIZE`, owner asked 2026-11-17):

  | locale | raw | gzip |
  |---|---|---|
  | en_MY | 63.6 kB | 20.7 kB |
  | de_DE | 68.6 kB | 23.2 kB |
  | th_TH | 102 kB | 24.5 kB |
  | bn_BD | 104 kB | 25.0 kB |

  - Before §14.1 a pack was about 42-50 kB raw and 15-17 kB gzip.
  - The site serves gzip (live de_DE content-length 23302).
  - A pack is fetched once per language, then cached 7 days + by the SW.
  - Negligible beside a building's MB of DBs. A lazy class-text file would need a second loader (ruled out).
- LOCALE_VERSION 9→10, sw v1716→v1717.

## 14.3 SPEC: step 2, How To in the Viewer's `?` palette (owner 2026-11-17: *"Proceed"*)
**Issue it removes:** the `?` / F1 palette (`viewer/scene.js` `showCommandPalette`) lists every pill with its key and its short bullets (`children`, translated `pillc_*`). It links only to the WHOLE user guide (`#cmd-docs`). It never says where in the guide a tool is explained, or what the same answer is at the CLI. Its search matches only names and keys, so a word that is only in a bullet ("distance") finds nothing.

**Slice (the dock is later):** the palette IS the agreed question box (§14 design). This slice adds the How To content INSIDE each palette entry. The right dock / mobile sheet and the move to `common/help/` come later and are not part of this slice.

**Data, generated, never hand-typed: `viewer/help/howto.json`, built by `viewer/tools/build_howto.js`:**
- **Guide link:** for each pill in `panels.js` (`{ id, name }` of the main pill actions, 38 today), the BIM User Guide section (h2-h4 of the LIVE page `red1oon.github.io/BIMCompiler/BIMUserGuide/`, the page the palette already links) whose body names the pill's English name most often; ties go to the first.
  - Measured 2026-11-17: 31/38 have one.
  - No section names `lod400`, `sanity`, `egress`, `sched4d`, `dlodnav` or `issues`. These are guide gaps, listed, not linked.
  - `walk` (the mobile Walk pill) only matches the FILM's walk-mode sections. That is a different feature, so it is excluded, with the reason stored in the file.
- **CLI lines:** a door verb attaches to a pill only by a phrase quoted from the verb's OWN `description` in `common/door/verbs.json`:
  - `find` ← `viewer.counts`, `viewer.clashes` ("the same answer the Viewer's Find panel gives"), `viewer.cost` ("as the Viewer's Find panel does");
  - `tm` ← `viewer.schedule_at` ("the Time Machine scrubber").
  - The line is `<verb> <required input>=<input>`, the ERP help's form (`erp/help_search.js`). Verbs and lines stay English (§0 rule).
  - The tool refuses to build if a quoted phrase is missing.
- **Size:** a few kB. Fetched once when the palette first opens. `verbs.json` (154 kB) is never loaded by the page.

**Palette (`scene.js`):**
- An entry with a How To record becomes expandable (the existing +/− child block). Under its bullets it shows:
  - "Guide" + the section link (labelled "(English)" on a non-English page, since the guide is English only);
  - "Same at the CLI" + the line(s).
- The search also matches bullet text and verb titles.
- New words `ui_howto_guide`, `ui_howto_guide_en`, `ui_howto_cli`, translated in the 14 non-English languages (machine, labelled).
- Log: `§HOWTO_PALETTE entries=… guide=… cli=… filter="…"`.

**Witness W-HOWTO (`viewer/tests/witness_howto.js`), each check naming the issue it proves:**
1. **H1 drift:** `howto.json` == the generator's output on today's inputs (live guide, `panels.js`, `verbs.json`). A guide edit that moves a section fails here. Live guide unreachable → INCONCLUSIVE, not PASS.
2. **H2 links are true:** every anchor exists on the live guide, and its section names the pill. Falsifier: a made-up anchor, or a section that does not name the pill, must FAIL.
3. **H3 CLI lines are true:**
   - each quoted phrase is in that verb's description;
   - the line's inputs are exactly the verb's required inputs.
   - Falsifier: a phrase that is not there.
4. **H4 page:** on `viewer.html` + Duplex, F1 opens the palette:
   - X of N entries have a guide link (N = the page's own `_mainPillActions`, compared with the file's pill count);
   - typing a word that appears only in a bullet finds that pill;
   - the `find` entry shows the 3 CLI lines;
   - in de_DE the bullets are German and the guide label says it is English.
5. **Coverage printed:** guide X/N, CLI pills, guide gaps by id.

### 14.3 RESULT (2026-11-17): BUILT, bim-ootb #3156 (`feat/howto-palette`)
- **Coverage** (`§HOWTO_BUILD`): 44 pills (the spec said 38: the first pattern missed ids with capitals or hyphens, `roleFilter` `cam-reset` …; W-HOWTO H4a caught it).
  - 35/44 have a guide link.
  - **Guide gaps** (no section names them): `lod400`, `hbaFM` (the section says "HR_BIM_Asset", not "Human-Asset"), `sanity`, `egress`, `sched4d`, `gi-preview`, `dlodnav`, `issues`.
  - `walk` is excluded.
  - CLI on 2 pills (find: 3 lines, tm: 1). `howto.json` is 11 kB.
- **Rule refined while building:** a section whose HEADING names the pill wins; otherwise the body with most mentions. Body-only counting sent "Settings" to the 4D-rates section and missed "Pick Walk".
- **W-HOWTO PASS** (`viewer/tests/witness_howto.js`):
  - H1 `--check` same;
  - H2/H3 contract 5/0 over 44 rows, red control caught;
  - H4a: page pill list == file pill list (44);
  - H4b: 35 guide links shown, hrefs into the live guide;
  - H4c: "native" (only in a Save bullet) finds Save, opened;
  - H4d: Find shows its 3 CLI lines;
  - H4e: de_DE label "Handbuch (Englisch)", bullets German.
- **W-VIEWER-I18N** (de_DE): fail=3, the same 3 that pre-exist on main. Leaks 23/310, unchanged.
  - The first run counted 8 new leaks: the 4 CLI lines and their 4 English verb titles. The CLI line is a pinned command, English by the §0 rule; it gets its own class `cmd-howto-cli-line`, added to the witness's skip list with that reason.
  - The English verb titles were dropped from the page.
- **Owner items (guide content, not this lane's code):** the 8 tools above have no guide section. Adding sections to `docs/BIMUserGuide.md` would raise the count; `build_howto.js` picks them up on its next run (W-HOWTO H1 fails until it is re-run, by design).
- **Next:** the dock (right panel on desktop, sheet on mobile) + the move of `field_help.js` / `help_search.js` to `common/help/` (§14 design), or the Modeller's two overlays.

### 14.3.2 SPEC: the How To guide link, tie rule (2026-11-17, owner: *"proceed on open item"*; found while making the §17.3 film)
**Issue it removes:** W-HOWTO H1 FAILS on clean bim-ootb `main` (`2989f8f5`, log `scripts/film_help_viewer/out/witness_howto_main.log`): the live BIM User Guide gained "Help — F1, the info panel, and the command line (LIVE)", and `build_howto.js` (`score = heading match 1e6 + mentions`, strict `>`, so a tie goes to the FIRST section in the page) now links **Save Building and Open Building to that Help section** instead of "Save & Open a building" (each is named once in both). The same rule would send any future tie to whatever section happens to come first.
**Rule (change):** `score = (name in heading ? 1e6 : 0) + mentions x 1000 + shared`, where `shared` = the number of words (3+ letters, case-folded, split on non-letters/digits) that are in BOTH the section heading and the pill's English name. Mentions still dominate (`shared` is always < 1000), a heading that holds the whole name still wins; only EQUAL-mention ties change. A tie that also shares no word keeps the old order (first in the page). No section text is invented: the choice stays a count over the live page.
**Claims (W-HOWTO H5, new, offline, no guide fetch):**
- H5a a synthetic page with two sections naming a pill once each, the SECOND sharing a word with the pill's name, links the second;
- H5b the same page with the sections swapped still links the sharing section (order does not decide);
- H5c a section naming the pill twice beats a sharing section naming it once (mentions dominate);
- H5d two ties with no shared word keep the first in the page (the old behaviour, written down);
- red control: the OLD rule (re-implemented inline in the witness, `1e6 + n`, first wins) must FAIL H5a, or H5 proves nothing.
**Expected diff of `howto.json` on today's guide** (checked against the generator's own `--check` before and after): Save Building and Open Building back to `save-open-a-building`; the `Help` pill to the new Help section (`in_heading: true`, it is named there). Any other pill moving = stop and read why.
**Then:** H1 PASS again on a clean `main` run; the rest of W-HOWTO unchanged.

### 14.3.2 RESULT (2026-11-17): BUILT, bim-ootb #3172 MERGED (`a62d401b`)
- `build_howto.js`: `score = heading 1e6 + mentions x 1000 + shared words`; **one thing the spec did not foresee, found by its own "any other pill moving = stop" clause:** the first cut gave two pills with ZERO mentions (`hbaFM`, `gi-preview`) a link, because a shared word alone made the score positive. Fixed: a section must name the pill (heading or body) to be a candidate; claim H5f pins it. Final `howto.json` diff on today's guide = only the `Help` pill (now its own Help section, `in_heading: true`); Save Building and Open Building stay on `save-open-a-building`; 35 guide links, as before.
- Witnessed on the branch (read in the logs, not the exit code): **W-HOWTO PASS** incl. `§PASS H1 howto.json == generator output on today's inputs` and the new `H5a`-`H5f` (H5-red: the old rule picks `help` where the new one picks `save-open`, so H5a can fail); **W-HELP-DOCK PASS** (its D4 count of guide links in the panel == `howto.json` still holds).
- The §17.3 film's card says "W-HOWTO H2 H3 H4a-H4e PASS" because H1 failed the day it was made; a future film on a tree with #3172 can say "W-HOWTO PASS".

## 14.4 SPEC: the help panel's place, look and drag (owner 2026-11-17)
**Owner, verbatim:**
- *"Discuss how best to position that extra help panel?"* → *"Agree to all."* (left side, stays open, phone = full sheet);
- *"May i add for aesthetic feel, that a different colored translucent feel when it is used? But only if u agree it is attractive to users"* → amber, measured contrast: *"Agreed."*;
- *"If it is draggable, the user can move it to proper contrasting spot to read output clearly."*

This REPLACES the §14 design's "right dock".

**Measured layout (bim-ootb origin/main):**
- The Viewer's right edge is the tool rail. The column beside it holds Find (`top:54px; right:70px`), Issues (`top:60px; right:70px; width:340px`) and `#info-panel` (`bottom:50px; right:70px`).
- The left holds only `#hud` (`top:16px; left:16px`).
- The Modeller's right is fuller still (pp-panel, its two help overlays, history).
- Phone (`max-width:600px`): Find takes the top half; info is a 180 px box bottom-right.

**Decisions:**
1. **Place:**
   - Desktop: a column on the LEFT, below `#hud`, about 320 px wide, with a close button.
   - It never covers Find / Issues / info, so help and the selected element are read side by side.
   - Phone: a full-screen sheet with a close button, not draggable.
   - The Modeller uses the same side, and its two right-side overlays move into it (later step).
2. **Behaviour:** the `?` / F1 popup BECOMES this panel: same search box, same entries with How To (§14.3), same `renderList`.
   - F1 / `?` toggle it.
   - It STAYS OPEN while the user works: a click in the 3D view does not close it. Esc or × closes it.
3. **Look:**
   - The same frosted glass as the other panels, tinted warm AMBER (the data panels are cool blue), so help reads as guidance, not model data.
   - Amber headings/links, white text.
   - Less see-through than `#info-panel` (0.50), because it holds paragraphs.
4. **Drag:** by its header, through the Viewer's ONE drag helper `A._makeDraggable` (`viewer/measure.js`; also used by Issues, Clash Matrix, CPE, grid, HBA). The helper today neither remembers a position nor keeps a panel on screen. It gains two OPT-IN switches beside its existing `el._dragStrip`:
   - `el._dragRemember = '<key>'`: save left/top on drop (browser storage, a per-viewer convenience; read in try/catch);
   - `el._dragClamp = true`: keep the WHOLE panel inside the window when it fits (else its top-left at 0,0), on drop and on resize. Built first as "the header inside"; W-HELP-DOCK showed that a panel pushed to the corner then hung its list below the window, so it was changed.
   - Panels that do not set them behave exactly as today.

**Witness W-HELP-DOCK (`viewer/tests/witness_help_dock.js`):**
1. **D1 place:** on a 1600×900 page, F1 opens `#help-dock`. Its box is left of the centre and does not overlap `#find-panel`, `#issues-panel` or `#info-panel` (each shown first). A click on the 3D canvas leaves it open; Esc closes it.
2. **D2 contrast** (the readability standard, WCAG 2.x contrast ratio ≥ 4.5:1 for body text):
   - the panel's text colour against its effective background, composited from its rgba over the page's dark AND light background colours (the Background toggle's two values, read from the page), both ≥ 4.5;
   - falsifier: the same maths on a 0.10-alpha copy must FAIL on the light background.
3. **D3 drag:**
   - a pointer drag on the header by (+200, +120) px moves the panel by that amount ±1 px;
   - the position is saved; after a reload + F1 it opens there;
   - a drag far off-screen ends with the header fully inside the window;
   - a panel WITHOUT the switches (Issues) is not saved (no key written).
4. **D4 content:** the How To entries are the same as the §14.3 palette (W-HOWTO H4 assertions re-run against `#help-dock`).
5. **D5 phone** (390×844, mobile flag): the panel fills the width and height, and does not move when dragged.
7. **D6 reopen as left** (owner 2026-11-17: no Back/Forward, no recent list, no timeline entries; *"Agreed"*): an entry the user opened by hand, and the typed search text, are both back after × + F1, within the page session.
6. **Regression:** W-HOWTO, W-CLASS-HELP and W-VIEWER-I18N (no new leaks) stay as they are.

### 14.4 RESULT (2026-11-17): BUILT, bim-ootb #3160 (`feat/help-dock`)
- **What changed:** `#cmd-palette` (scene.js) is now:
  - a left column below `#hud` (desktop; 320 px wide, the window's height less margins), or a full-screen sheet on a phone;
  - open until Esc / F1 / ? / × (new `#cmd-close`). A 3D click no longer closes it, and running a tool from it keeps it open.
- **Keyboard:** the viewer's shortcuts now work beside it. `§KBD_ROUTE` passes keys to the panel only while focus is INSIDE it. Before, every shortcut was off whenever the popup existed.
- **Look:** amber glass `rgba(48,30,6,0.85)`; text #e0e0e0 / #d0d0d0; links #ffb74d. 85% is the lowest of the alphas computed (0.50 / 0.72 / 0.80 / 0.85) at which white text passes 4.5:1 over the white background; #aaa / #888 fail on white even at 0.85.
- **Drag:** `measure.js` `A._makeDraggable` gained `_dragRemember` / `_dragClamp` (logs `§DRAG_SAVE`, `§DRAG_RESTORE`, `§DRAG_CLAMP`).
- **Reopen state:** module memory `_helpState { filter, open }`.
- **W-HELP-DOCK PASS 14/14** (`viewer/tests/witness_help_dock.js`):
  - D1a: left 16, 320×868, overlaps none of Find, info, Issues. D1b: stays open after a 3D click. D1c: Esc closes.
  - D2: min contrast 6.31 dark / 5.26 white over 90 text nodes. Falsifier at alpha 0.10: 1.01.
  - D3a: (+200, +16); 16 is the clamp room, since the panel is nearly full height.
  - D3b: `#info-panel` dragged −120 px, no key written.
  - D3c: clamped at (1280, 32)–(1600, 900).
  - D3d: dragged back to 300; it reopens there after a reload.
  - D4: 35 guide links. D5: phone 390×844, does not move. D6a / D6b: reopens as left.
- **Witness finding (not a product change):** `A._makeDraggable` arms on pointerdown but captures the pointer only on its first ≥4 px move seen ON the element, so a tap still reaches header controls. A drag whose first step lands off the panel is lost. A hand stays on it; the witness's coarse 98-px first step did not, and "D3d" passed vacuously until the drag was made hand-like and a D3d-move check was added.
- **Regressions:** W-HOWTO PASS, W-CLASS-HELP PASS, W-ABOUT-HELP-RESTORE 9/9. W-VIEWER-I18N de_DE fail=3 (the same 3 as main), leaks 23/310. Lint 0 errors. sw v1719.
- **CI note (merged as `9f7e88c6`):** the first CI run failed W-X0-APPDEF (the code-design lane's X0 Navigator). It samples `internal/APP_SURFACE.md` "written at" lines, and the scene.js / measure.js edits shifted two of them. The fix was a regenerate, not a hand edit: `node scripts/gen_app_surface.js`, then verdict=PASS. The index had last been generated on 2026-11-14 (3251 files; 3374 now). Any edit that moves lines in a viewer file holding `A.x =` writes can trip this gate the same way.
- **Next:** the Modeller gets the same panel (its `#m-help-panel` + `#m-guide-panel` merge into it), and the help code moves to `common/help/` (§14 design). Spec first.

## 14.5 SPEC: the same help panel in the Modeller (owner 2026-11-17)
**Owner, verbatim:**
- *"u proceed with your lane"*;
- on where to put it: *"I think collapsing another temporarily can be considered if the user does not need to pay attnetion to others while seeking Help or querying. But why not let its panel be draggable so user decides?"*

**Correction recorded:** §14.4 said the Modeller's left is free. MEASURED, it is not (bim-ootb origin/main):
- **Left:** `#bonsai-outliner` (`bonsai_outliner.js:108`, `position:fixed; left:0; width:240px; height:100vh`, collapsible via `body.ol-collapsed`). Beside it at `left:252px`: `#bar` (`modeller.html:14`), `#ins-panel` (`top:60px`, 244 px wide) and `#stat`.
- **Right:** the rail; `#pp-panel` (`props_panel.js:85`, `top:60px; right:70px; width:300px`); `#hist`; and the two help overlays (`#m-help-panel` `modeller.html:75`, and `#m-guide-panel`).

**Decision (the owner's two ideas together):**
1. Help opens by default IN THE OUTLINER'S PLACE (left edge), and the outliner collapses while it is open.
2. The panel is draggable and remembered (the §14.4 switches). Dragged off the outliner's strip (its left edge ≥ 240 px), the outliner comes back. Dragged back onto it, the outliner collapses again.
3. Closing help restores the outliner's OWN prior state (a user who had collapsed it keeps it collapsed).
4. Phone: full-screen sheet (the Modeller has no phone layout yet; the sheet does not depend on one).

**Build: one panel, two apps (§14 "one shared module"):**
- **`common/help/help_panel.js`**, moved out of `viewer/scene.js` `showCommandPalette`. It owns:
  - the dock (amber glass, stays open, × / Esc, reopen-as-left state, search over names + bullets + CLI titles, How To blocks);
  - and NOTHING app-specific.
  - Each app gives an adapter: `entries()`, `howto` (optional), placement, drag function, storage key.
  - The Viewer keeps `#cmd-palette` and every id, so W-HELP-DOCK and W-HOWTO run unchanged.
- **The drag helper moves to `common/drag.js`**, from `viewer/measure.js` `A._makeDraggable`. The Viewer's `A._makeDraggable` becomes that same function, so there is ONE implementation; its 13 viewer callers are unchanged. The Modeller has no drag helper today.
- **Modeller adapter:**
  - entries = the live `#bar` buttons (icon, name, `SHORTCUTS`) + the keyboard-only rows that `buildHelp()` lists today;
  - the 11 guide `SECTIONS` become How To text under their entries, or a "Guide" group. They stay English until translated, like any untranslated row (the Modeller translates by exact string through the Viewer dictionary).
  - `#m-help-panel` and `#m-guide-panel` are deleted; `?` and `#b-guide` open the new panel.
  - The PR states its lines +/−.

**Witness:**
- **W-HELP-DOCK-M** (`modeller/tests/witness_help_dock_m.js`):
  - M1: `?` opens it at the left, outliner collapsed, `#pp-panel` not covered;
  - M2: drag right past 240 px → outliner back; drag back → collapsed;
  - M3: close → the outliner's prior state (both cases: it was open; it was collapsed by the user);
  - M4: contrast ≥ 4.5 on the Modeller's background(s), with the 0.10 falsifier;
  - M5: every `#bar` tool and every keyboard row that `buildHelp()` listed is in the panel (X of N, N from the live `#bar`);
  - M6: the 11 guide sections are present;
  - M7: position remembered across a reload;
  - M8: phone sheet.
- **Regression:** W-HELP-DOCK, W-HOWTO, W-CLASS-HELP and W-VIEWER-I18N unchanged. Every viewer caller of `A._makeDraggable` still drags: a sweep drags each one that the witness can open and reports X of N. W-X0-APPDEF: regenerate `APP_SURFACE.md`.

### 14.5 RESULT step 1 (2026-11-17): shared panel + drag helper, bim-ootb #3165 (`feat/help-panel-common`)
- **`common/drag.js`:** `A._makeDraggable` moved VERBATIM. The viewer name delegates, so its 13 callers are unchanged. It gains the opt-in `_dragOnDrop(rect)`.
- **`common/help/help_panel.js`:** the dock moved out of `viewer/scene.js` (`HelpPanel.toggle(cfg)`). It adds a `howto.text` block for in-app guide paragraphs.
- **`scene.js` `showCommandPalette`** is now the Viewer adapter: same ids (`#cmd-palette` …), same log lines.
- **Size:** 5 files, +144 / −404 lines, plus the two new common files.
- **Witnesses on the moved code:**
  - W-HELP-DOCK 14/14, W-HOWTO PASS, W-ABOUT-HELP-RESTORE 9/9;
  - W-X0 appdef / isolation / lens PASS (`APP_SURFACE.md` regenerated);
  - W-VIEWER-I18N de_DE: the same 3 failures as main, leaks 23/310;
  - lint 0 errors.
- **Drag-caller sweep:** 2 of 13 callers were judged (the help panel; `#info-panel` in W-HELP-DOCK D3b). The other 11 run the same moved function, but were NOT individually dragged by a witness.

**▶ STEP 2 for the next session (the Modeller), facts already measured:**
- **`modeller/modeller.html`:**
  - the `?` overlay is built at about lines 6580-6617 (`const help` … `hpanel` … `buildHelp()` … outside-click close);
  - the keyboard rows are Undo Ctrl+Z, Redo Ctrl+⇧Z, Cancel current mode Esc, Copy Ctrl+C, Paste (click to place) Ctrl+V, Drawing metadata Shift+D, This help ?, Snap-to-geometry on/off (while moving) G, Arm rotate ring (turn, in Move) T, Arm scale cubes (in Move) S;
  - the guide is `initGuide()` (`#b-guide`, 11 `SECTIONS` as [title, html]).
  - Load `../common/drag.js` + `../common/help/help_panel.js`.
- **Adapter:**
  - entries = live `#bar` buttons (icon `.ic` outerHTML, name span, `SHORTCUTS[id]`, action = button click) + the 10 keyboard rows + the 11 guide sections as entries with `howto.text`;
  - place = the outliner's strip `{ left: 0, top: 0, width: 240, height: innerHeight }`. 240 so it does not cover `#bar` at `left: 252px`.
  - **HIDE the outliner with `visibility: hidden`, NOT `body.ol-collapsed`:** that class also moves `#hist`, `#stat`, `#ins-panel` and `#dim-row` to `left: 12px` (`modeller.html` about line 104), under the panel.
  - `onDrop(rect)`: left ≥ 240 → outliner visible, else hidden. `onOpen`: the same test on the restored position. `onClose`: visible.
  - Background `#14161c` (`modeller.html:459`).
- **Six tests read the old overlays and must move to the new panel** (selectors only, claims unchanged):
  - `modeller/tests/witness_modeller_pill_verbs.js:66-75` (D5: the guide count == the source `SECTIONS` count);
  - `modeller/tests/witness_clipboard_keys.js:118` (`#m-help-panel .hp-row` Copy / Paste);
  - `modeller/tests/pill_declutter_live.js:47`;
  - `modeller/tests/witness_dxf_panel_pill.js:59` (`?` → `#m-help-panel` `display === 'block'`; the new panel is `display: flex`);
  - `modeller/tests/witness_guide_text_updates.js:36` (`#m-guide-panel` innerHTML);
  - `viewer/tests/witness_modeller_i18n.js:148` (judges `#m-help-panel` in de_DE).
- Then W-HELP-DOCK-M as specced (M1-M8), and the PR states lines +/−.

### 14.5 RESULT step 2 (2026-11-17): the Modeller adapter, bim-ootb #3171 (`feat/help-panel-modeller`)
- **Built as specced:** `?` and the Guide pill open `common/help/help_panel.js` (`#cmd-palette`) on the outliner's strip (0–240 px, width − its 1 px border). Entries = live `#bar` pills + the 10 keyboard rows + the 11 guide `SECTIONS`. Outliner hidden with `visibility` (never `ol-collapsed`); dragged off the strip it returns; closing restores the user's own state. `#m-help-panel`, `#m-guide-panel` and their CSS deleted. +116 −94 in 12 files + the witness.
- **Two decisions made while building (each witnessed):**
  - `cfg.noAutoFocus` (opt-in, shared panel): the Viewer focuses the search box on open; in the Modeller that swallowed `?` / `O` / `E` / `D` (W-DXF-PANEL-PILL P6c went red). With it, `?` toggles as before and a click in the box searches. Typing `?` IN the box stays possible, so the agreed `?` prefix (§16 item 7) is not blocked. W-HELP-DOCK-M M9.
  - A folded guide section is its title row alone; its paragraph enters the page only when opened or searched (W-HELP-DOCK-M M6d). Without it, W-MODELLER-I18N counted 60 hidden English paragraphs as leaks (10 → 70).
  - Search also reads `howto.text` (M6c: "turns green" finds only 3D Grid; falsifier finds 0).
- **Witnesses (logs read):** W-HELP-DOCK-M PASS (M0–M9, 20 checks) · W-UX-VERBS 9/0 · W-GUIDE-TEXT-UPDATES 5/0 · W-DXF-PANEL-PILL 18/0 · W-HELP-DOCK, W-HOWTO, W-CLASS-HELP PASS · W-ABOUT-HELP-RESTORE 9/9 · W-X0 appdef/isolation/lens PASS · eslint 0 errors (the repo's eslint; `npx eslint` pulls v10, which crashes on Node 18 — a tool error, not a result).
- **Same as main, not this change:** W-CLIPBOARD-KEYS K1 "no empty ground point in view" (so its K7 help check is never reached; M5b covers Copy/Paste); `pill_declutter_live` "initSqlJs is not a function".
- **Open (named, not hidden):** W-MODELLER-I18N de_DE was FAIL on main (10 leaks); now 16. The +6 are guide section titles not in the Viewer dictionary: "2D drawings → model", "Outliner — ARC leads, ONE Disc tab", "Disc = walker", "Conformity Gate", "Author", "Move & Manipulate". Translating them (and the paragraphs) is the next item for this panel.

### 14.5.1 SPEC: the Modeller guide titles into the dictionary (2026-11-17, owner: *"go"* to the advised order, item 1)
**Issue it removes:** W-MODELLER-I18N de_DE FAILS on clean bim-ootb `main` (`a62d401b`) with 16 uncatalogued English strings on the trailer screens (log read 2026-11-17: `§MDL_LEAK locale=de_DE leaks=16 slots=124 translated=117 wiring=0 gap=0 uncat=16`); it was 10 before #3171. The +6 are the Modeller help panel's guide section TITLES (a new offline witness, W-MODELLER-GUIDE-TITLES, then found TWO MORE the leak witness never walks: *3D Grid* and *Save / Export*, so the batch holds 8), which the panel now shows and the dictionary does not hold: *2D drawings → model*, *Outliner — ARC leads, ONE Disc tab*, *Disc = walker*, *Conformity Gate*, *Author*, *Move & Manipulate*. The other 10 (*Rules*, *2D Drawings: show or hide the panel (D)*, *Team — click to start or join a team*, *Walker rules (JSON)…*, *Copy*, *Paste (click to place)*, *Drawing metadata*, *This help*, *Open 2D drawings (.dxf)…*, *Open 2D drawings from PDF drawing (.pdf)…*) were already uncatalogued before #3171 and are NOT this item.
**Change:** one batch file `viewer/tools/trl_batch_2026-11-17_modeller_guide_titles.js` in the established form (`NEW` keys `mdl_m_guide_title_*` + `TRL` for the 14 non-English locales, machine translations by Claude, labelled), applied by `trl_add_batch.js` then `build_trl.js`. The Modeller already translates by exact on-screen English (`__TRL_DICT_PAGE`), so no Modeller code changes.
**Claims (the witness, read in its log):**
- T1 de_DE `§MDL_LEAK` goes 16 → 10, and the 6 titles are NOT in its uncatalogued list (the other 10 still are, named);
- T2 W-MODELLER-GUIDE-TITLES (`viewer/tests/witness_modeller_guide_titles.js`, offline, N read from the live `SECTIONS`): G1 every guide title has a base row; G2 every title x the 14 non-English locales is a `trl="Y"` row with text (11 x 14 = 154); red control: a title with no row and a `trl="N"` row must FAIL;
- T3 the existing control (de_DE with its json aborted must count leaks > 0) still PASSES, so the counter can still fail;
- no other base row, id or translation changes (ids append above 1001027; `trl_add_batch.js` itself refuses to touch existing rows).
**Not in this item (named):** the guide PARAGRAPHS. Measured: 11 sections, 59 text nodes, 5,648 characters (`2D drawings → model` alone is 41 nodes of list steps, `Teams` 9); each node would be a key x 14 locales and the paragraphs only appear when a section is opened (W-HELP-DOCK-M M6d), so they are not in the leak count. Written up as the next step; the owner's call whether the Modeller guide body is worth ~830 machine translations.

### 14.5.1 RESULT (2026-11-17): BUILT, bim-ootb #3173 MERGED (`fa00554e`)
- **Batch:** `viewer/tools/trl_batch_2026-11-17_modeller_guide_titles.js`: 8 titles (the 6 named + *3D Grid*, *Save / Export*) x 14 locales, ids 1001028-1001035, append-only, machine translations by Claude (labelled in each XML header; NO speaker review). Terms kept as the product's tokens: ARC, Disc, walker. No Modeller code changed.
- **Witnessed (logs read):** W-MODELLER-GUIDE-TITLES PASS 5/0 (`G1`, `G2` 154 rows, red control detected; before the 2 extra titles it FAILED G1 on *3D Grid | Save / Export*, which is how they were found). W-MODELLER-I18N: de_DE leaks **16 → 10**, ja_JP 10; the uncatalogued list is exactly the 10 pre-#3171 strings and none of the 8 titles; "Help built after the switch" leaks 11 → 5 (translated 26 → 34). W-VIEWER-I18N unchanged (de_DE 23/310, as main).
- **Still FAILS on main, not this item (named):** W-MODELLER-I18N (2) de_DE/ja_JP 10 leaks each: *Rules*, *2D Drawings: show or hide the panel (D)*, *Team — click to start or join a team*, *Walker rules (JSON)…*, *Copy*, *Paste (click to place)*, *Drawing metadata*, *This help*, *Open 2D drawings (.dxf)…*, *Open 2D drawings from PDF drawing (.pdf)…*; and (4) the in-place flag switch (leaks=4, `retranslated=-1`). Same mechanism (batch + XML), so a single follow-up batch of 10 strings x 14 would turn (2) green; (4) needs a look at the in-place switch first.
- **Paragraphs (the second half of the RESUME item):** NOT done, a decision for the owner: 59 text nodes, 5,648 characters, ~830 machine translations, not in the leak count (they appear only when a section is opened).

## 15. NOT URGENT, to think about (owner 2026-11-16: *"You mean we can mis.<translated verb>? Note in prompt then we shall think about it not urgent."*)
Two terminal ideas. Neither is built and nothing is decided.
1. **Field help at the terminal.** The browser's per-field tooltip / Tool Tip panel has no terminal equivalent: today only `mis.describe` (a kind's fields) and `help <word>` exist.
   - Idea: the field's own Description / Help answered from the SAME help pack in the chosen language (`lang_rule.js`).
   - E.g. `erp.ask` given a column, or `help <column>` inside `cd Order`.
   - Spec it here when picked up.
   - **How it would work in CLI form** (owner 2026-11-16: *"How would it work in CLI form? Note in prompt."*). There is no panel; the same text comes up where the browser shows it:
     - **(i) Asking about a field, by the LEVEL the CLI already has (§0: Student is a level beside the language; owner: *"i thot longer msg is 'student' mode?"*).**
       - default (`short`): `cd Order; help DocumentNo` prints the header and the Description, the tooltip;
       - `level student` adds the Help and the dictionary facts (mandatory, type, list values), the Tool Tip panel, with `HelpController`'s blank-line rules.
       - It is the field of the kind's window header tab, its own text as AD_Field_v (no inheritance, §7 F4), translated from the help pack.
     - **(ii) Being asked for a value.** When red1 prompts for a column (`new`, `run` parameters, the `"ask": "params"` forms), the field's Description shows as the one-line hint under the prompt (short level). In student level the Help shows too. `?` typed at that prompt prints the full Help at any level.
     - **(iii) Optional:** `mis.describe` adds each property's Description, read only.
   - **Why it is a small step:**
     - the data exists: AD_Field description / help, already read by `ad_parser.getFields`;
     - the translations exist: `erp/i18n/help/<lang>/help.json` `fields`;
     - the language rule exists: `common/door/lang_rule.js`;
     - the label rule exists: `erp_cli.js ask`'s `T()`.

     Only the read subcommand and the prompt hint are new.
   - **Witness idea:** for N fields of the shipped windows, the CLI's text equals the browser panel's (W-FIELD-HELP's oracle, so the terminal is a third reader of the same row), in en and one pack language. Falsifier: the column's text used instead of the field's.
   - **Ownership:** `help <word>` and the prompts are the CLI session's (`words_core.js`, `red1.js`). Agree the word with it first; `help <column>` must not collide with `help <word>` (a column name vs a word name).
2. **Verbs / words in the person's own language** (the question asked: "mis.<translated verb>"). Today every verb and red1 word is English; only the answers translate.
   - The idea is already a STUB in the CLI session's `prompts/CLI_ERP_IVR.md` (line ~78: "red1 words in the person's own language … a localized word expands to the SAME printed door line").
   - The door verbs themselves (`mis.describe`, …) stay English: they are the envelope and the journal, pinned for AI and scripts (§0 rule).
   - What could be translated is the red1 WORD a person types. The CLI session owns `words.json` and decides; this lane would supply the names from the packs.
   - Open questions: where the localized word lives (a per-language word table vs the help pack), and whether a word may collide with a dictionary name.

## 16. RESEARCH: help and search methods to learn from (owner 2026-11-17, relayed by the CLI session bim-compiler-ef)
**Owner, verbatim (in the CLI session):** *"research if there are cutting edge search and help methods to learn from"*, then *"help and search belongs to another session. So pose to it there to segregate."*
**Split agreed with the CLI session:** this lane = help and search (`erp.ask`, `erp/help_search.js`, `help_catalog.js`, help text, the `?` panels). The CLI lane = type assist (whole-line completion, next-command / intent prediction; `CLI_ERP_IVR.md` §1d). So fish/zsh autosuggest, PowerShell predictors, Warp/Fig specs and atuin/McFly are NOT judged here. Anything on the line (a did-you-mean that hands over to help) is agreed with the CLI session first.

**Judged against:** (1) no AI inside; (2) offline; (3) pure SQLite; (4) nothing new in the browser; (5) vocabulary from the dictionary; (6) the 6 guide languages, with CJK / Thai.

**Measured here first (2026-11-17):**
- The BROWSER's SQLite (`common/lib/sql-wasm.wasm`, sql.js) is 3.38.5 with `ENABLE_FTS3`, `FTS3_PARENTHESIS`, `RTREE`. **FTS4 yes, FTS5 NO** ("no such module: fts5"), so no trigram tokenizer.
- The CLI's Node SQLite (better-sqlite3) is 3.53.1, with FTS5 + trigram.
- So any SQLite-FTS answer would differ between the CLI and the browser.
- `Intl.Segmenter` (built into Node and the browsers, no model, ICU dictionaries) splits words with no spaces:
  - Thai: `ผนังรับน้ำหนัก` → `ผนัง|รับ|น้ำ|หนัก`;
  - Chinese: `如何创建销售订单` → `如何|创建|销售|订单`.
- Today `help_search.js` reads CJK as characters / character pairs (§12) and ranks how-to rows "BM25-like" by shared words.

| Method (source) | What it does | Verdict here |
|---|---|---|
| **Did-you-mean by edit distance** (git `help.autocorrect`: weighted edit distance, suggest / prompt / never; SymSpell: precomputed DELETES of dictionary terms, Damerau / OSA distance) | A mistyped word suggests the nearest dictionary word | **ADOPT.** All 6 pass: the deletes are built from the dictionary's own names at build time into the help pack; the lookup is plain JS. Suggest, never auto-run (git's `prompt`, not its timer). Write our own from the algorithm (SymSpell code is LGPL-3.0). Where the CLI hands an unknown word to help, agree it with the CLI session. |
| **Example-first help** (tldr pages: a one-line description, then a few concrete runnable examples with `{{placeholders}}`; a linter enforces the shape) | The answer leads with the line to type | **ADOPT** for the card shape: the CLI line + what it does first, then the reference. Examples only from `verbs.json` `examples` and the how-to rows (never written for the card). A witness can lint the shape (tldr-lint idea). |
| **Search names + descriptions + search terms** (nushell `help --find`: matches command names, descriptions and "search terms") | Finds a command by what it does, not only its name | **ADOPT.** Index the AD Description / Help and the verb descriptions too, not only names. Search terms = the element's names in all 6 languages (AD_Element_Trl), so a word typed in one language finds the entry. |
| **One box for everything** (Frappe Awesome Bar: type a DocType → its list, a record name → the record, "new task" → create, shown only with create permission) | Navigate, open a record and act from one search | **ADOPT, in steps.** The card already gives window + action. Next: a document number opens that record, and "new <window>" creates, both through the existing role access gate. The witness counts X of N windows. |
| **Typed prefixes** (Odoo Ctrl+K palette: `/` menus/apps, `@` users, `#` channels, `?` knowledge articles) | One character says what kind of thing you want | **ASK OWNER.** Deterministic and cheap, but it is a UI choice. A proposal: `?` help, `/` windows/menus, `#` document number. |
| **Word segmentation without a model** (`Intl.Segmenter`: Baseline 2024, Firefox 125+, Safari 14.1+, Chromium 87+) | Real words for zh / ja / th | **ADOPT, with a guard.** It is built in (nothing new loaded). Risk: different browsers ship different ICU dictionaries, so the same text may split differently. Plan: segment the DICTIONARY terms once at build time (Node, pinned) and keep the character-pair match as the fallback; the witness pins the expected splits. Thai is measured in Node only; Firefox Thai is unverified. |
| **Proper BM25** (FTS4 `matchinfo(t,'pcnalx')` + a ranking function, k1 = 1.2, b = 0.75) | Better ranking of the how-to rows | **ADOPT the formula, not SQLite FTS.** FTS4 exists in both, but its tokenizers cannot split CJK / Thai, and FTS5 exists only in the CLI. One JS BM25 over our own tokens (field weights: name > description > help) gives the browser and the CLI the SAME answer (one implementation). The corpus is small (thousands of rows): an in-memory index is enough. |
| **SQLite FTS5 trigram** (substring search, LIKE/GLOB acceleration, since about 3.34) | Substring search | **REJECT here:** CLI-only (the browser build has no FTS5), so the two would answer differently. |
| **MiniSearch / Lunr / Pagefind** (client search libraries / static indexes) | Ready-made search | **REJECT:** each is a new library in the browser. (The MkDocs guides keep their own built-in search; that is not this box.) |

**Proposed order (for the owner; nothing is built):**
1. Did-you-mean over the dictionary, ERP box + BIM panel. **ON HOLD (CLI session, 2026-11-17):** the shell already has its own typo policy (`CLI_ERP_IVR.md` §25 D14, `words_core.js`). Two indexes for one job would break AD-LAYER LAW 5, so it must be ONE suggester over ONE name index, used by both the shell and help. This lane's design (built at build time, suggest only, never auto-run) matches the shell's rule and may become the shared one. The CLI session puts the choice to the owner and messages the answer. Build neither until then.
   - **DECIDED (owner "Agree on all", 2026-11-17, via the CLI session):** ONE suggester, the existing `common/door/assist_core.js` `nearest(typed, names, n)` (CLI_ERP_IVR §42, BIMCompiler #866). The help box passes its own names (help pack windows / actions / statuses for the language) and shows the top n. There is no second edit-distance function in erp/.
   - **Checked 2026-11-17 on the packs** (a one-character substitution mid-name):
     - names of 3+ characters: top-1 de 354/354, zh 214/216, ja 292/293; mean 1.1-1.6 suggestions; `rule` never fires (names have no `_`). No segmenter is needed for names: an IME homophone slip is a one-character substitution.
     - **2-character names:** lim = 2 matches every short name (zh: mean 51 suggestions; ja: 15). Top-1 is still right (46/49, 14/15), but the rest is noise.
     - Proposed to the CLI session: lim = min(max(2, ⌊len/3⌋), len−1). Its change, its witness. Thai not tested (no th pack).
2. The index also covers descriptions and the 6-language names (cross-language find).
3. `Intl.Segmenter` terms at build time + character-pair fallback.
4. One exact BM25 with field weights.
5. The example-first card shape, with a shape linter.
6. Awesome-bar steps (open a document number; "new <window>").
7. Prefixes. **OWNER AGREED 2026-11-17:** *"Agree with the leading char idea. Wonder if it is applicable to CLI too?"*
   - **Shell facts (bim-ootb origin/main):**
     - `?` already means help at the start of a red1 line (`common/door/red1.js:40`, `/^\s*(help|\?)/`), the same meaning as proposed;
     - `#` has no meaning in red1, but is a bash comment in an unquoted `red1 '…'` one-liner;
     - `/` already separates location segments (`erp/Order/…`, `building/kind`, `words_core.js:30-31`), so a leading `/` may read as a path;
     - `@` is unused.
   - **Rule proposed:** one character, one meaning, in the help panel, the ERP box and the shell, defined ONCE in the shared vocabulary.
   - The shell line is the CLI session's: it decides `/` and `#` there. Sent to bim-compiler-ef 2026-11-17.
   - Spec the box side (W-PREFIX, with falsifiers) when picked up.

Every step gets a witness with a falsifier (e.g. did-you-mean: N misspellings derived from dictionary names, each must return its source word; a made-up word must return nothing).

**Sources:**
- [Frappe Awesomebar](https://docs.frappe.io/erpnext/awesomebar-global-search), [Frappe Desk](https://docs.frappe.io/framework/user/en/desk)
- [Odoo 17 keyboard shortcuts / command palette](https://www.odoo.com/documentation/17.0/applications/essentials/keyboard_shortcuts.html)
- [SymSpell](https://github.com/tablesmit/symspell), [symspell_rs (OSA vs Damerau)](https://docs.rs/symspell_rs)
- [tldr style guide](https://github.com/jvns/tldr/blob/main/contributing-guides/style-guide.md), [tldr client spec](https://github.com/tldr-pages/tldr/blob/v1.3/CLIENT-SPECIFICATION.md)
- [sqlite-fts4 BM25 over matchinfo](https://github.com/simonw/sqlite-fts4)
- [Intl.Segmenter Baseline](https://web.dev/blog/intl-segmenter), [MDN Intl.Segmenter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- [nushell help](https://www.nushell.sh/commands/docs/help.html), [nushell help commands](https://www.nushell.sh/commands/docs/help_commands.html)
- [git autocorrect](https://adamj.eu/tech/2022/10/26/git-how-to-enable-autocorrect/), [help.autocorrect=prompt patch](https://code.googlesource.com/git/+/dc66e3c799cd5d8f3e664e26899bca200ffdfd7b%5E%21/)
- [SQLite trigram forum](https://sqlite.org/forum/forumpost/76b444bebe?t=c)

## 17. FILM STUB: "Help that answers" sequel, in the Viewer (EN) (owner 2026-11-17: *"before exiting sufficient to make a EN flim sequel to show Help in Viewer?"* → outline → *"ok"* to note it)
**Not made yet; make it in a fresh session.** Everything shown is live and witnessed (§14.1-§14.5).

**Story** (about 2 min, house style per feedback memory: split screen, typed terminal strip above + the real Viewer below, REAL key sounds, voice after the return key):
1. Click a wall (Duplex). The info panel shows "What this is" and the folded IFC definition with the bSI credit (W-CLASS-HELP C5).
2. Switch to de_DE: the official German bSI text. Switch to zh_CN: our Chinese sentence + the English bSI text + the "no official translation" line (the honesty beat).
3. F1: the amber panel on the left, beside the info panel. Type "native": Save is found from a bullet word, opened (W-HOWTO H4c).
4. Open Find: its Guide link (the exact section), and "Same at the CLI" `viewer.counts building=<building>`, typed and run in the terminal strip. This is the CLI beat.
5. Drag the panel to a darker spot, close, reopen: it comes back as left (W-HELP-DOCK D3 / D6).

**Make it from:**
- **`scripts/film_cli_in_action/`** (house style; real samples only, `~/.local/share/film_narration/keys_eklee/`, credit on the end card; check K2 must pass).
- **The shot / caption checks of `scripts/film_help_showcase/`** (`capcheck.py`; keep turns ≤ about 95 chars). Its `shots.js` drives only `erp/idempiere.html`: new shots are needed for `viewer.html?db=…`, captured on the CPU (swiftshader, as the witnesses do), never the GPU.
- **Opening / closing cards** as §11 (credentials; the McKinsey quote may be reused or replaced, on the owner's word).

**Rules:**
- Leave out what is not built: the Modeller help, the `?` / `#` prefixes, did-you-mean, and the 8 tools with no guide section.
- EN only; other languages on the owner's word.
- The film is never pushed, only its scripts.
- Read `prompts/FILM_NARRATION.md` ▶ PLAYBOOK first.

### 17.1 BUILD SPEC (2026-11-17, owner: *"proceed as you plan"* — the plan said: finish §14.5 step 2, then make the §17 film in this session)
**Issue it removes:** the Viewer's help (§14.1-§14.4) is live and witnessed, but nothing shows it; the first film (§11) is ERP only.
**Pipeline:** `scripts/film_help_viewer/`, copied from `scripts/film_help_showcase/` (same build.sh steps: shots → facts → guard → cards → voice measure → beat lengths → silent picture → fit → two-pass mux → key sounds → K2 → C). Work folder `~/Videos/help_viewer_film_work/out` (never in git). EN only, Kokoro voice (local CPU).
**Pictures (`shots.js`):** the REAL `viewer/viewer.html?db=…Duplex…` from a bim-ootb `origin/main` tree, headless Chromium on the CPU (swiftshader, as the witnesses), 1280x720 at device scale 1.5. Every rectangle the cards crop is read from the page (`getBoundingClientRect`), never placed by hand. The same steps the witnesses use: Find `IfcWall` and click results until `#info-class` reads IfcWall (W-CLASS-HELP C5); F1 (W-HELP-DOCK); the search box filled (W-HOWTO H4c); the header dragged (W-HELP-DOCK D3).
**Beats (narr.js; F asks, M answers, short):**
| id | top strip (real lines only) | lower frame | facts the voice speaks |
|---|---|---|---|
| cover | — | title card | — |
| quote | — | the §11 McKinsey card, same saved copies | `quote.found` |
| klass | the page's `§CLASS_HELP guid=… class=IfcWall ours=Y ifc=Y` line | info panel, `#info-class-help` opened | our sentence shown; bSI text + credit shown |
| lang | `§TRL_LABELS locale=de_DE` + `§CLASS_HELP` lines of both sessions | de_DE block, then zh_CN block | German text is bSDD's de-DE (byte-equal to the saved `bsdd_IfcWall_de-DE.json`); zh shows the fallback line |
| ask | `native` TYPED into the help box (key sounds), then `§HOWTO_PALETTE … filter="native"` | the panel before, then Save Building opened | the word is in no pill name; the entry found is Save |
| cli | `viewer.counts building=Duplex` TYPED at the `red1 ❯` prompt, then its real envelope (total, per discipline) | the panel's Find entry opened: its Guide link + "Same at the CLI" lines | the count = the envelope's number; the CLI line in the panel = `howto.json`'s |
| dock | the page's `§DRAG_SAVE` / `§KBD_HELP close` / `§HELP_DOCK open` lines | moved, closed, reopened in the same place | reopen place == saved place (±1 px) |
| close | — | cost (measured), prior art (only sources this lane read), credentials (PRs + verdict lines run on the same tree), the bSI attribution (CC BY-ND 4.0, §14 (a)), key-sound credit | — |
**Guard (`guard.js`, fails the build):** every `says` fact resolved from facts.json / the witness logs / saved copies; no page error; every picture present; every PR on the card MERGED; the verdicts on the card are PASS lines of W-CLASS-HELP, W-HOWTO, W-HELP-DOCK run on the same tree; prior-art rows' text found where cited (check P); **not-said list:** live/real-time, faster/speed, first/novel/unique, the Modeller, prefixes, did-you-mean, any language but German and Chinese.
**Checks after the mux (numbers, not a viewing):** K2 (no voice over typing, keys audible), C (captions in the bottom 170 px), frames = the silent picture's, longest silence ≤ ~7 s, ≈ −16 LUFS. Output `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v1.mp4`, never overwritten; not pushed.

### 17.1 RESULT (2026-11-17): `~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v2.mp4` (111.4 s, 2,674 frames, −16.6 LUFS; not pushed, films stay on the machine)
- **Pictures and facts:** `shots.js` on bim-ootb main `d68e0f71` (after #3171) drove the real Viewer + Duplex headless on the CPU, 0 page errors. `red1 'viewer.counts building=Duplex'` answered `1193 elements: MEP 809, ARC 270, ELEC 81, STR 19, PLB 14` (10.8 s). `facts.js` VERDICT PASS.
- **Witnessed on that same tree:** W-CLASS-HELP PASS, W-HOWTO PASS, W-HELP-DOCK PASS (logs in `scripts/film_help_viewer/out/`).
- **Checks of the build** (logs in `out/`):

  | Check | Result |
  |---|---|
  | guard (25 spoken facts, 7 musts incl. a planted-count red control, 3 prior-art rows, 7 not-said) | PASS |
  | cards (no overflow) | 48 stills, 0 too tall |
  | voice fit | 6/6 DETAIL, 6/6 question tones OK |
  | K2 (no voice over the typing, keys audible) | PASS, keys 18.6 dB under the voice |
  | keys | 35/35 typed + 2/2 returns |
  | frames | planned = encoded (2,674) |
  | C, captions in the bottom 170 px | PASS 22/22; falsifier `CAP_Y=960` FAILs 21/22 |
  | silences ≥ 4 s | the silent cover 4.8 s and the silent end card 19.1 s only (the §11 film's end card measures the same 19.1 s) |

- **Defects found and fixed while building (each a rule for the next film):**
  - (1) "native" finds TWO entries (Save Building and Open Building, W-HOWTO H4c `rows=2`): the voice names both, and the guard checks the rows shown are exactly the entries holding the word;
  - (2) at 1280×720 the Find panel covers the info panel's top, so the class text was hidden in the crop. Shot at the witnesses' 1600×900 (scale 1.2, still 1920×1080 pixels); the guard checks Find covers neither the info panel nor the help panel's place;
  - (3) a WH question rose ("What if I do not know what a tool is called?", §NARR_TONE WRONG): reworded as a yes/no question;
  - (4) the card overflow check counted a crop's clipped picture as overflow: a crop is judged by its box only.
- **Observed, not this lane's (Find panel lane):** at 1280×720 a mouse drag inside the Find panel's 64 px drag strip (`nf_ui_history.js:268`) did not move it, while the same drag moves `#info-panel` (W-HELP-DOCK D3b). Its `pointerdown` handler stops propagation (`:271`). Not diagnosed further; not claimed as a bug.
- v1 (same day) had defect (3); kept on the machine, superseded by v2.

### 17.2 REDO SPEC (owner 2026-11-17, for a NEW session): frame it bigger
**Owner, verbatim:** *"The film update the prompt in new session to redo because the canvas for Duplex is not large enough. Both building on canvas and the left panel should zoom in and fill up much empty space on sides to frame visibly."*
**Issue:** in v2 the subject is small. Measured from `scripts/film_help_viewer/cards.js` + `out/shots.log`:
- the lower band shows the WHOLE page scaled to 620 px tall (1,102 px wide, x 30–1132), with a crop on the right (at most 718 px wide); below 1,080 px, only the bottom 170 px are for captions;
- the Duplex sits small in the middle of the 3D canvas (shot as the page opens, no framing step);
- the help panel crop is reduced 0.76× (palette 576 px wide, top 760 px); the info-panel crops 1.03–1.49×.
**Redo (v3), keep everything else** (beats, voice TSV, guard, K2, C, the main tree rule):
1. **The building fills its canvas:** before each shot, frame the model with the Viewer's OWN fit/zoom (find the call in the next session; never hand-placed camera numbers). Log, per shot, the model's projected box height / canvas height and the box's left/right edges against the open panels.
2. **The panel and the building fill the frame:** drop the "whole page small + crop" layout. Each still = ONE cropped region of the page (the panel + the building beside it, or the info panel + the building), scaled to fill the 1920 width and the band height, with no wide empty side margins.
3. **Witness it with numbers, not a look:** per still, (a) the share of the lower band that is page pixels (not the `#0f172a` background) and (b) the building's box height / band height. Set the two bars from a first measurement of v2 vs a v3 trial, print both, and FAIL a still below the bar. Text in the crop must stay ≥ the §11 film's smallest legible glyph (measure it).
4. Output `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v3.mp4`; v2 stays on the machine.
5. **A new opening quote (owner, verbatim):** *"need not use the 20% stats in start of film, try another quote perhaps from media expert of forum feedback about need for good Help in apps"*.
   - Drop the McKinsey 20 % card (and its `quote` beat's words).
   - Find ONE real quote on why good in-app help matters: from a recognised UX / media expert, or real user feedback in a public forum. Fetch the page, save the copy in `out/prior/` (as §11 did), and keep the exact words, the author, the date and the URL.
   - `facts.js` must find the quote verbatim in the saved copy, or the build fails. Never paraphrase, never write one. If no fetched source holds a usable sentence, say so and ask the owner; no card is made up.
   - The narration beat and the end card's credit change with it (the guard's `quote.*` facts too).

### 17.3 BUILD SPEC v3 (2026-11-17, new session, owner order: *"resume message, do film only"* = do §17.2)
**Issue it removes:** v2's subject is small (§17.2 Issue). **Claims to prove (each a log line, never a look):**
- **F1 the model fills its canvas.** Every still's page picture is taken after the Viewer's OWN fit (the `Home` key, `scene.js _homeFillFrame`, "§ROOM_HOME reset=cycle+frame"); no camera number is typed by hand. Per shot `shots.js` logs `§FILM_FRAME name= canvas= box= box_h/canvas_h= box_x= panels_x=`: the model's projected box (every visible mesh's AABB corners through `A.camera`) against the canvas and against each open panel's left/right edge.
- **F2 one crop per still, full-bleed.** A card's lower band (1920 x 620, y 290-910, bottom 170 px stay for captions) is ONE region of the page: the union of its subject rectangles (panel and/or info panel, plus the model's box), scaled up by `z` (band px per CSS px) = min(ZMAX, 1920/union.w, 620/union.h), centred on the union. No whole-page thumbnail, no side margins. Pictures are shot at device scale 2.4 so that the zoom stays sharp.
- **F3 numbers.** `cards.js` measures the PNG it wrote: (a) share of the band's pixels that are not the film background `#0f172a` (bar: 99 %), (b) the model's box height inside the band / band height, (c) share of the band's width spanned by the subject (panel and model box, x-extents united), (d) the smallest font size of the visible text in the subject x z. The same four are measured on a v2-layout render of the same shots (function `lowerV2`, kept only to calibrate) and the bars are set below, from that first measurement; a still under a bar FAILS the build (`§FRAME_BAR`, `TOO-SMALL`).
- **F4 the opening quote** (owner, 2026-11-17) is Jakob Nielsen's heuristic 10 'Help and documentation', two sentences, verbatim in the saved copy of nngroup.com/articles/ten-usability-heuristics/ (fetched 2026-11-17, `~/Videos/help_viewer_film_work/prior/`, copied to `out/prior/`); `facts.js` fails if the sentences are not in it; the McKinsey card, its words and its end-card credit are gone; the guard's `quote.*` facts follow.
**Output:** `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v3.mp4`; v2 stays. The film is not pushed, only its scripts and the logs of `out/`.

### 17.3 RESULT (2026-11-17): `~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4` (113.0 s, 2,711 frames, −16.6 LUFS; not pushed, films stay on the machine; v2 kept)
- **Tree and pictures:** bim-ootb `main` `2989f8f5`, real Viewer + Duplex, headless on the CPU at device scale 2.4, 0 page errors. `red1 'viewer.counts building=Duplex'` again `1193 elements: MEP 809, ARC 270, ELEC 81, STR 19, PLB 14`. Pipeline `scripts/film_help_viewer/` (logs in `out/`).
- **F4, the quote:** Jakob Nielsen, heuristic 10 "Help and documentation", *"Help and documentation content should be easy to search and focused on the user's task. Keep it concise, and list concrete steps that need to be carried out."* — nngroup.com/articles/ten-usability-heuristics/, page dated April 24, 1994, last reviewed Jan. 30, 2024, copy fetched 2026-11-17 (`~/Videos/help_viewer_film_work/prior/`). `facts.js` found both sentences verbatim, the title and the dates on the same copy, and heuristic 10 as their heading. McKinsey card, its words and credit removed; narration beat and guard facts (`quote.source/h10/found/steps`) follow. The owner asked for "a media expert or forum feedback": this is the expert; no forum quote was searched.
- **F1, the model fills its canvas** — the Viewer's own `Home` fit alone is NOT enough: `§ROOM_HOME` has an 80 m floor, so Duplex (9x22x8 m) stayed at box 235x198 of the 1600x900 canvas (0.22 high). The framing is the user's own gestures, measured: mouse wheel (OrbitControls dolly) and a right-button drag (pan), looped until the projected box (all 91 meshes' AABB through `A.camera`, waiting for the damped camera to stop) hit the target; every step is a `§FILM_FIT` line. Class-text stills: box 545,394,461x446 (0.50 of canvas height) beside the info panel. Help stills: box 486,37,578x439 (0.49), top inside the canvas, level with the help panel's first rows.
- **F3, numbers** (`framecheck.py`, `out/framecheck.log`; bars set from the v2 measurement, listed in the file):

  | metric | v2 (measured) | v3 (45 band stills) | bar |
  |---|---|---|---|
  | (a) band pixels that are page, not film background | 0.57-0.82 (frames of the v2 mp4 at 18-90 s) | 1.00 | 0.99 |
  | (b) model box height / band height | 0.19 (box 169 of 900 css px at page open, probe) | 0.86-0.99 | 0.80 |
  | (c) subject width / band width | 0.57 (a 1102 px page thumbnail) | 0.62-1.00 | 0.60 |
  | (d) smallest text, band px | 8.2 (9 css px x 0.76 x 1.2) | 11.0-13.6 | 10.5 |

  Zoom z (band px per css px): 1.22-1.40 (v2: 0.69 thumbnail, 0.91 panel crop). Red controls: an empty band FAILS 45/45; v2's own numbers FAIL all four bars (`framecheck_v2.log`).
- **Honest limits:** (c) is only 0.62-0.70 on the three class-text stills: the model fills the band's height, so the width cannot grow without cutting the model; ~30-38 % of their width is empty canvas (the help stills 0.81-1.00). (d) glyphs are the Viewer's own 9-10 css px text enlarged 1.2-1.4x; the §11 film's smallest glyph was not re-measured, so "≥ §11" is NOT claimed. The dock drag is now +200 px (was +560, which would have covered the larger model); the guard's moved-by threshold went 300 → 150 px.
- **Other checks** (logs in `out/`): guard 46 OK / VERDICT PASS (25+ spoken facts incl. the 4 quote facts, a red control, 3 prior-art rows, 7 not-said); cards 48 stills, 0 too tall; voice fit 6/6 DETAIL, all question tones OK (the opening question is yes/no); K2 PASS (keys 18.6 dB under the voice); keys 35/35 + 2/2; frames planned = encoded (2,711); C captions PASS 23/23, falsifier `CAP_Y=960` FAILs 22/23; silences ≥ 4 s: the cover 4.8 s and the end card 19.2 s only; −16.6 LUFS.
- **Found on `main`, not fixed here (film only): W-HOWTO H1 FAILS on clean main 2026-11-17** — `viewer/help/howto.json` ≠ `build_howto.js` run on today's live guide. The BIM User Guide gained a "Help — F1, the info panel, and the command line (LIVE)" section; the generator rule "most mentions, ties: first in the page" now sends **Save Building and Open Building to that Help section instead of "Save & Open a building"** (a wrong link; the `Help` pill's own link moved there correctly). The film shows neither link, so its card names the checks it uses (`W-HOWTO H2 H3 H4a-H4e PASS`), never "W-HOWTO PASS". Fix = the generator's tie rule (prefer a heading sharing a word with the pill name), then regenerate; a separate bim-ootb PR.
- **Rules learnt:** (1) a build script's `grep` of its own log matched a progress line (`§FRAME_BARS_RECORDED` vs `§FRAME_BAR`) and killed a good build: match the full tag plus a space; (2) the Viewer's `Home` is not a fit for a small model, and `BOX` over only the *visible* meshes flickers with DLOD: measure all meshes and wait until the box stops; (3) a Find panel stays open and sits over the info panel's header once the class text opens (19 px): the guard now checks it against the class text, measured at the shot.

## STATUS
2026-11-17 (tie rule): bim-ootb #3172 merged, W-HOWTO H1 passes again (§14.3.2 RESULT).
2026-11-17 (film v3): `Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4` made, framed bigger, new Nielsen quote (§17.3 RESULT). Found: W-HOWTO H1 fails on main (guide's new Help section wins the Save/Open tie). Next unchanged: the 6 Modeller guide titles, then prefixes.
2026-11-17 (close): BIM User Guide Help section added; §17.2 film REDO specced for a new session (owner: frame the building and the panel bigger).
2026-11-17: §14.5 step 2 (Modeller help in the shared panel) built + merged, bim-ootb #3171 (W-HELP-DOCK-M PASS). §17 film made: `Help_that_answers_Viewer_EN_AFTER_2026-11-17_v2.mp4` (§17.1 RESULT), pipeline `scripts/film_help_viewer/`. Next: the 6 Modeller guide titles into the dictionary, then the prefixes (box side).
2026-11-16 (session bim-compiler-41): P1b, §10-§13 built and merged; films EN v4 / ZH v5 / DE v1 made (not pushed); ERP User Guide help section LIVE. Next: §14 (BIM help panel), check (a) first.
2026-11-16: P1 built and witnessed (5/0), merged as bim-ootb #3079. P2a built and witnessed (W-MSG-CATALOG 4/0), merged as bim-ootb #3082. P3a built and witnessed (W-HELP-STUDENT 5/0), merged as bim-ootb #3083. P3a-1 (help footer + opening tip, `red1 --fast`), bim-ootb #3084. P2b (W-MSG-DOOR 5/0) #3108. P1b (W-FIELD-HELP 13/0) #3126. Depends on `prompts/DOCS_I18N.md`, `prompts/CLI_ERP_IVR.md` (CLI session owns), `prompts/ERP_UI_LOCALES.md`.

## Note from the code-design lane (2026-11-16): `msg_keys.scan` also reads calls inside comments
Found while building F-19 (`prompts/CODE_ARCHITECTURE_DESIGN.md` §F.28, bim-ootb #3103). `scan()` matched `M('key', …)` written in a
header COMMENT and reported a use of the key `key`. That gave a false unknown-key once the file was tracked. X0 now blanks comments
first with the repo's one tokenizer, `scripts/lib/js_scan.js` (`scan(src).code`, same length and lines), and only then calls `scan`. **No
effect on W-MSG-CATALOG M3 today:** it scans only `words_core.js` and `red1.js`, which have no such comments. If M3's file list widens,
the same `js_scan` step keeps it from counting prose. Left for this lane to decide; nothing in `common/door` was changed.
2026-11-16 (P2b closed): bim-ootb #3108 merged (`f18ae08c`). The guides list the six-file download in 7 languages + ProposerGuide (#798, deployed, all 8 pages checked live). W-MSG-DOOR baseline moved to the `main` it merged (`304a30a0`); D4 treats `say()` as the § log. Merges with the CLI session's work were unions of `messages.json` only. W-RED1-WORDS R1 / W-HELP-STUDENT S4 on `status@erp` fail on clean main since #3117 (reported to the CLI session). Locale (login language from `AD_Preference`, then LANG, then the System client) handed to the CLI session (`CLI_ERP_IVR.md`). Next: P1b (§7).
