# ⚠ DO NOT REMOVE
Scope: **SPEC and phase ledger** for ONE vocabulary the CLI and the guides both read: a keyed message catalog and a help catalog over the Application Dictionary, with a short/long level and a locale. Read the log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE.
Background, measurements and prior art are in `prompts/DOCS_I18N.md` §4b-§4d (owner ideas of 2026-11-16: shared vocabulary for CLI and guides, a `Student` level = the long text, reuse the legacy element/message model, remove the copied Help). This file owns the BUILD; that file keeps the findings.

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
| P2 | `Msg` pass-through for CLI strings (no behavior change), then file by file; stable key per message; `explain <key>` | `common/door/*` | **P2a BUILT 2026-11-16** (`words_core.js`, W-MSG-CATALOG 4/0, see §3 RESULT); next file `door.js` (P2b) |
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
**Open for the owner:** whether the greeting or the short `help` should mention `level student`, since today a person has to know it exists. Either change alters today's bytes, so it is the owner's call.
**Not in P3a:** hint lines on refusals (P3b, needs P2b), Student text for groups and the overview, the ERP field Help (the P1 layer, separate), translations, and any mention of `level` in the greeting or the short help (that would change today's bytes; the owner decides).

## STATUS
2026-11-16: P1 built and witnessed (5/0), merged as bim-ootb #3079. P2a built and witnessed (W-MSG-CATALOG 4/0), merged as bim-ootb #3082. P3a built and witnessed (W-HELP-STUDENT 5/0), bim-ootb #3083. Depends on `prompts/DOCS_I18N.md`, `prompts/CLI_ERP_IVR.md` (CLI session owns), `prompts/ERP_UI_LOCALES.md`.
