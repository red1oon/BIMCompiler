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
| **P1** | **Help read layer** over the dictionary: resolve Help/Description by level through element → column → field, derive a tip where none is written | new files in bim-ootb `erp/` only | this file, §2; spec first, then built |
| P2 | `Msg` pass-through for CLI strings (no behavior change), then file by file; stable key per message; `explain <key>` | `common/door/*` | WAITS: freeze after `feat/mis-lookup` merges |
| P3 | `tip` + worked example per word in `words.json`; hint lines on the most-hit refusals (person's terminal, level set) | `words.json`, door render | after P2 starts |
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

## STATUS
2026-11-16: spec written; P1 witness and module in bim-ootb next. Depends on `prompts/DOCS_I18N.md`, `prompts/CLI_ERP_IVR.md` (CLI session owns), `prompts/ERP_UI_LOCALES.md`.
