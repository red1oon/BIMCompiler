# ⚠ DO NOT REMOVE
Scope: **SPEC** for translated guides and a language chooser on https://red1oon.github.io/BIMCompiler/ . V1 + V2 deployed (§6e): the chooser and the CLI user guide in six languages. Read the build log and the witness log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE. Publishing stays under `prompts/DOCS_DEPLOY_POLICY.md` and `prompts/DOCS_DEPLOY_GUARD.md`: deploy ONLY via `scripts/safe_gh_deploy.sh`, never bare `mkdocs gh-deploy`, never `ALLOW_SHRINK` to get past this work.

## 0. Owner decisions (2026-11-16) — binding
> *"Perhaps we do guide translations then? Can ours at github.io have a language chooser? Would this be a next killer as certain locales are very innate to their own languages."*
- **Languages (6):** Indonesian `id`, Simplified Chinese `zh-CN`, French `fr`, Japanese `ja`, Spanish `es-419` (neutral Latin American, not the Spain variant: *"Latin America as a whole is a larger community"*), German `de`. English stays the source and the default.
- **Dropped by the owner:** Malay (*"Indonesia alone is enough"*), Arabic (replaced by French, a possibly larger audience for now), Brazilian Portuguese (*"close to Spanish"*). Adding one later is one more folder; it needs no design change. Right-to-left is therefore NOT in scope now.
- **Why it is only a bet:** translation widens the audience; it does not create buyers, and language quality cannot be witnessed the way the engine can. Treat the first language as a pilot and measure use before translating all six (§6).

## 1. What is translated, and what never is
**Tier A (first):** `docs/index.md`, `docs/USER_GUIDE.md`, `docs/FastScriptGuide.md` (1327 lines). **Tier B:** other pages of the 73 in `mkdocs.yml` `nav`, only on the owner's pick, one page at a time. English pages keep their current URLs.
**Never translated (byte-identical to English, checked by §5):** every fenced block (bash/text, including every `<!-- run: id -->` block pasted from a real run), every inline code span (verbs such as `mis.list`, `viewer.clashes`, keys, file names), the words `red1`, `mis`, `erp`, `bim` where they are commands, every `§` tag, product and standard names (iDempiere, IFC, IfcOpenShell), and every number inside a block. Commands are English everywhere; only the prose around them changes.
**UI labels:** the guide names windows and buttons as the UI shows them. The ERP UI has locales (`ERP_UI_LOCALES.md`: en, fr, es_ES, de, ar, zh_CN, ja, ms_MY, th) from published iDempiere packs; **Indonesian and `es-419` are NOT in the UI** (its Spanish is the Spain pack). Rule: quote the label as the UI shows it in that locale where the UI has it; else the English label once, with the translation in brackets. Never invent a UI string.

## 2. Design (to be MEASURED in V0, not assumed)
- Plugin: **`mkdocs-static-i18n`** (one site per language) with Material's `extra.alternate` for the header chooser; GH Pages is static, so no server is needed. `mkdocs.yml` has no `plugins:` key today. Pin the exact plugin version when built (not chosen here).
- **Layout: suffix files** (`FastScriptGuide.ja.md` beside `FastScriptGuide.md`), English URLs unchanged. The English default must NOT move into a subfolder: that would change every live URL and trip the deploy guard (and break links already shared).
- An untranslated page in a language falls back to the English page with a visible "not translated yet" notice; the chooser lists only the languages that have that page (§5 I8).
- Search: Material's search must be told the language; Japanese and Chinese need a language setting to tokenize. V0 measures whether search finds a known word on a built `ja` and `zh-CN` page. Not assumed.
- Translation is drafted **in a session by hand**, never by a scripted API call (no paid model calls from scripts). A draft is marked `review: machine` until a person signs it.

## 3. Review banner and staleness
Each translated page's front matter: `review: native | machine | unreviewed` and `source_sha: <hash of the English page text it was made from>`. A page that is not `native` shows a visible banner (what it is, link to the English page). A page whose `source_sha` differs from the English page's current hash shows "out of date". A status table (generated, not hand-kept) lists per language: pages, native / machine / stale counts. **Reviewer names stay out of this public file;** the table shows a role and a date only.

## 4. Glossary
`docs/i18n_glossary.yml`: one row per project term (door, witness, twin, MIS, chip, op-log, falsifier …) with `en`, a per-language rendering or `keep`, and a one-line reason. Decided once, used by every page; the owner or a reviewer settles a term, a session never improvises it. Terms marked `keep` appear verbatim.

### 4b. One vocabulary for the CLI and the guides (owner, 2026-11-16: *"can we make that CLI picks out responses from a vocab dictionary that the guides also uses? I am thinking from those XML book projects days"*) — SPEC STUB, nothing built
**Idea.** A single-sourced term and message catalog (the DocBook entity / glossary habit): the CLI's human-facing text (`help` lines, group names, refusals, notes) and the guides' prose both read ONE keyed file, so a term is defined and translated once. Today the English strings live in code (`erp_cli.js`, `red1.js`, `words_core.js`) and in the guide prose, apart.
**Measured 2026-11-16:** the local `bim-ootb/erp/ad_seed.db` (dated Sep 18, may be stale) holds `ad_element` (6024 rows) but NO `ad_message` or `*_trl` table, so the iDempiere message/translation tables are not a ready store here; the UI's translations come from the build in `ERP_UI_LOCALES.md`. Whether an AD-shaped store (AD-LAYER LAW: port the mechanism) or a flat data file is right is the open design question; the recommendation is a flat keyed data file first (`vocab/messages.json` beside `words.json`, which is already data), shaped so it can later load from AD rows.
**Rules (each is a witness claim when built):**
- **English stays byte-identical by default.** The door's envelope, journal and `verbs.json` are English and replayable; only text meant for a person is looked up, and only when a locale is set. AI actors and scripts always get the English/stable text. (Witnesses such as W-DOOR-SHAPE and the guide's exact-match blocks pin English bytes.)
- **A key per message; no string left in code** (deletion budget: each moved string is a deleted literal). Claim: every message key used in code exists in the catalog, and every catalog key is used (X of N both ways); falsifier: a key renamed in code only.
- **The guide pulls from the same keys** (a build-time substitution, in the XML days an entity): a term defined in the catalog is not retyped in prose. Claim: every guide term reference resolves; falsifier: delete a key.
- **Translations live in the catalog, the §4 glossary becomes a view of it** (one file, not two). Reviewer status per language as in §3.
- **Run blocks are never in the catalog:** they remain pasted from real runs (§1).
**Student level (owner, 2026-11-16): the longer text.** Short = `AD_Message.MsgText` / `AD_Element.Description`; long = `MsgTip` / `Help` (iDempiere's own split: `Msg.java` L169-232, L375-398; `X_AD_Element` Description/Help). The level is a separate axis from the language (`ja` + student), not a language value, so one row carries both texts per language.
**Measured 2026-11-16 on the local `bim-ootb/erp/ad_seed.db` (dated Sep 18, may be stale; no `_trl` tables in it):** the repetition is in the COPIES, not the wording. 6,024 elements, 1,801 with Help (1,683 distinct texts; only 50 texts are shared by more than one element), 4,223 with no Help (3,446 have neither Help nor Description). But 18,617 of 18,639 columns with Help carry the SAME text as their element, 15,735 of 16,062 fields carry the same as their column, 20,342 columns copy the element's Description. Help stored: 194 KB in elements, 2.29 MB in columns, 2.28 MB in fields (about 23 times the unique text). Genuine overrides: 22 columns and 171 fields. iDempiere's own `Synchronize Terminology` process (`migration/processes_post_migration/postgresql/02_SynchronizeTerminology.sql`) is what pushes element text down to columns and fields: the copies are by design, not an accident.
**What can be done (recommendation, not decided):** keep the AD tables exactly as they are (TWIN rule), and build the catalog as a read layer: text keyed on the element, a column or field resolving to its element's text unless it carries a stored override (22 + 171 known). Translate the 1,801 element texts once instead of about 34,700 copies. Claim: the resolved text of EVERY column and field equals its stored text (X of N, lossless); falsifier: drop one override. The 4,223 elements with no Help are a content gap that must NOT be invented: either authored by the owner for the elements the guides use, or derived only from dictionary facts (type, mandatory, list values, validation rule) and labelled `derived` (§3 banner), never passed as written text.
**Measured file size (2026-11-16, on a THROWAWAY copy of the seed, original untouched):** setting a field's Help/Description to NULL where it equals its column's, and a column's where it equals its element's, then `VACUUM`: raw 27,193,344 -> 20,819,968 bytes (23% smaller); gzip -9 7,129,934 -> 5,824,211 bytes (18% smaller). Not checked: which code reads those columns directly (the window path, `describe`), so a read layer must resolve them first; resolution equality (X of N) is the claim that makes it safe.
**Regex / template objects (owner, 2026-11-16: *"combine it with the messaging model to use regex objs"*), measured:** legacy messages already take parameters: `Msg.getMsg(ctx, key, Object[] args)` formats with `java.text.MessageFormat` (`Msg.java` L23, L436-462). Masking each element's own name inside its Help as `{n}` cuts the distinct Help texts only from 1,667 to 1,659: the wording across elements is almost all unique, so templating the element text would save almost nothing. The redundancy is the copies (previous paragraph), fixed by inheritance, not by regex. Where templates DO pay: (1) the CLI's own messages (`missing input: {0}`, `no property {0}; its properties are: {1}`): one parametrised message in place of many near-identical literals; (2) the 4,223 elements with no Help: a tip built from a pattern over dictionary facts (`A list. One of: {values}.`, `Required.`, `Refers to {table}.`) labelled `derived`; (3) the 20-times repeated account-segment texts: one shared text, keyed once. A regex is for MATCHING and validating a parameter, not for storing prose.
**Not decided:** the store (flat file vs AD rows), the substitution mechanism for MkDocs, and who owns the English wording (the CLI session owns `CLI_ERP_IVR.md`; this file only records the idea until that session takes it).

### 4c. Review of the CLI's messages and the dictionary's Help (owner, 2026-11-16: *"many messages maybe lacking, as my earlier complaint of dryness, review all help content and msgs to suggest what can be of high value and low impact"*) — FINDINGS, nothing changed
**CLI messages (read from `origin/main` `common/door/*.js`, 3,577 lines; extraction by pattern, so it is a sample of about 235 message strings, not a complete census):** `erp_cli.js` 106, `door.js` 35, `object_cli.js` 35, `ops_cli.js` 19, `legacy_cli.js` 16, `words_core.js` 8, `mis_core.js` 7, `draw_core.js` 4, others 3. What they are: precise, honest, and written for a developer. Three kinds of dryness: (1) a bare fact with no remedy (`" is not key=value`, `has unknown type`, `no rows in this answer`, `cancelled: nothing was run`, `cd: no building, kind or ERP window is named "X"`); (2) source and legacy references in the person's face (`GridField.isEditable L455`, `AD_Window_Access.IsReadWrite=N`, `legacy Ninja: "HAS DATA! DELETE THEM FIRST"`), right for a developer and wrong for a clerk; (3) the same tail copied about 35 times (`Nothing was written.`). Known wording bug: `erp.actions` says "name one with --id" where the door writes `id=`.
**Dictionary Help (the local seed, Sep 18):** for the DISPLAYED fields (16,144) 2,857 (17.7%) have no Help at any level; in the core windows 10-17% (Sales Order 23 of 141, Business Partner 17 of 169, Project 14 of 146, Product 36 of 265). So my earlier "4,223 of 6,024 elements have no Help" (§4b) is mostly elements no window shows; the real gap is the 17.7%. 1,231 of those 2,857 do have a Description. The Help that exists is dry in a typical way: 557 of 1,801 (31%) begin `The <the field's own name> ...` (`Primary: The Primary checkbox indicates if this budget is the primary budget.`), 1,678 of 1,801 (93%) hold no example, 241 are under 40 characters.
**High value, low impact, in this order (each is additive and OFF by default, so English stays byte-identical and the 40 witnesses that assert message text stay green):**
1. **`help <word>` gets a `tip` and one worked example per word in `words.json`** (data only; about 23 words; the examples are already validated by W-RED1-HELP H3). Highest value for the learning curve, no code path changes.
2. **A hint line on the most-hit refusals, rendered only at a person's terminal, only when a level is set:** missing input (list the legal values and a typed example: `clash ARC MEP`), `is not key=value` (show the line, mark the offender, give `mis.list kind=Project`), unknown word or verb (the nearest names, `assist_core.nearest` exists), `cd` of an unknown name (the nearest names; §1d.1 lists this as not built), empty list (say what to remove or try). **Already built, do not respec (CLI session, 2026-11-16, bim-ootb #3075):** a wrong KEY gets `nearest: Value` (or the full list when nothing is close) as a refusal, exit 3, through `assist_core.nearest` (the one reader); `colum=` and `C-B…=` have their own words; grey suggestions at the prompt.
3. **Student level for Help:** the long text where present, else the Description, else a DERIVED tip built only from dictionary facts (type, mandatory, the list's values with their names, the lookup's table, the default, the read-only rule), labelled `derived`. This is the one that can add what the written Help never has (the values, an example) for the 2,857 gaps, and it is a read layer: no AD row is changed (TWIN rule). The stock `The X indicates ...` sentences are NOT rewritten (they are the legacy text); the derived facts follow them.
4. **A `next:` line after a document action** (`Completed. You can now: Void (VO), Close (CL), Reverse (RC)`), from `erp.actions`, the IVR's own "no need to remember what to do next".
5. **Plain text first, source reference second:** the person sees what and what to do; the legacy line reference moves to the `§` log line and the developer level. A refusal that cites a source today keeps citing it there.
6. **One helper for the shared tail** (`Nothing was written.`) and the `--id` wording fix: code changes, so they belong to the migration window (§4b), not before.
**In flight, not pushed (CLI session, bim-ootb `feat/mis-lookup`):** §27 `mis.lookup`, §28 `report` (a gap line and a reporter-shape builder), §26 greeting already data in `words.json`; they add English strings the count above does not include. **Collision rule:** `words.json` is shared; add `tip` (and the example) as a NEW key per word and never rewrite an existing key; the `next:` line after `do` is accepted as additive.
**Not done:** no message or Help was rewritten; these are findings. Wording of any message is the CLI session's to take (it owns `CLI_ERP_IVR.md` and the `common/door` files).

### 4d. Prior art: who else has this challenge (research 2026-11-16, 4 web searches; secondary sources are marked; Cobra/clap doc generation, Odoo/Frappe field help and Weblate/Crowdin were NOT searched)
No project found that combines all of it (one catalog for CLI and guides, a verbosity level, a locale, and inheritance from a data dictionary); each piece exists elsewhere, which is a statement about 4 searches, not a survey.
- **Rust: short message + stable code + long `--explain`.** Each error that earns a code has a long explanation reached by `rustc --explain`, with an example that triggers it and the fix; a code is assigned only when the explanation says more than the short message; every code must have one and the online index is generated from the same sources (rustc-dev-guide `diagnostics`, RFC 1567). This is `MsgText` / `MsgTip` with a key. **Take:** every message gets a stable key; Student level = `explain <key>`; a refusal with a key and no tip is a defect a witness can count.
- **Elm: "compilers as assistants".** Errors give context, a hint, a worked example and a link, in the first person; a public catalogue of confusing programs drives the next improvement (elm-lang.org `compilers-as-assistants`, `compiler-errors-for-humans`). **Take:** keep a corpus of the lines people actually mistyped (the §1d.1 typo set is the start) and make each one a witness case.
- **SAP data dictionary: the element carries the text, fields inherit it.** A data element has short, medium, long and heading labels plus its own documentation, which shows as F1 help in EVERY field that refers to the element; deleting a custom documentation falls back to the original (SAP help `data element` pages; the length limits differ between sources, not relied on). **Take:** this is the model proposed in §4b; iDempiere copies the element text down (Synchronize Terminology) where SAP refers to it. Inheritance with override-and-fall-back is a proven design.
- **Fluent vs gettext vs ICU MessageFormat (secondary sources only).** gettext and MessageFormat map one source string to one translation; Fluent lets each locale have its own grammar (plurals, gender, selectors) and carries translator comments; Unicode MessageFormat 2 is in development. **Take:** legacy `Msg.java` already uses `MessageFormat` arguments, so keep that for twin familiarity; reconsider selectors only when a message must agree with a count in French or Spanish (`{n} clashes`); Chinese and Japanese have no plural forms. Not decided.
- **tldr pages: examples first.** Community pages of copy-pasteable examples in plain Markdown, accepted because they beat exhaustive man pages; not suited to edge cases. **Take:** the `tip` per word is an example-first page; keep it short and run it (W-RED1-HELP H3 already runs every example).

## 5. Witness W-DOCS-I18N (claims written first; each names its issue; each can say VACUOUS / INCONCLUSIVE; a falsifier FAILS it)
Reads the BUILT site and the sources; no human looks at a page. Populations are stated per language as X of N pages.
- **I1 English URLs unchanged.** Issue: the plugin moves English into a subfolder and breaks live links. Claim: every path live on `gh-pages` is present in the new build, and every English page's bytes-size is within `SHRINK_TOL` of live. Falsifier: configure the English default inside a subfolder: I1 FAILS and so does the guard.
- **I2 fenced blocks identical.** Issue: a translator edits a command or a pasted result. Claim: for each translated page, the ordered list of fenced blocks (and `<!-- run: id -->` ids) equals the English page's, byte for byte. A page with zero blocks is INCONCLUSIVE for I2, counted. Falsifier: change one digit inside a block.
- **I3 inline code and tokens identical.** Claim: the multiset of inline code spans and of `§` tags equals English's; the `keep` glossary terms appear verbatim wherever English has them. Falsifier: translate a verb name.
- **I4 numbers preserved.** Issue: a figure in the prose changes in translation (`291` becomes `219`). Claim: the multiset of digit runs (separators stripped) in prose equals English's, minus a short allow-list of locale date formats. Falsifier: swap two digits.
- **I5 structure parity and links.** Claim: same heading count per level; every internal link resolves in that language's build (no 404). Falsifier: drop a heading; point a link at a missing page.
- **I6 banner honesty.** Claim: every non-English page has `review` and `source_sha`; a page that is not `native` renders the banner; a stale page renders "out of date"; `native` needs a dated sign-off in the status table. Falsifier: remove `review` from one page.
- **I7 chooser correct.** Claim: every page's HTML has an alternate link for each language that has that page and none for a language that lacks it (no link to a 404); `hreflang` is present. Falsifier: add a language with no pages.
- **I8 deploy evidence.** Claim: a real run of `scripts/safe_gh_deploy.sh` passes the guard with NO `ALLOW_SHRINK`, the post-deploy canary set and each language's front page return HTTP 200 (fetch the URL; a green pipeline is not a deployed feature), and `build/docs_deploy.log` is read.
- **I9 English source untouched.** Claim: `gen_fast_script_guide.js --refresh` (bim-ootb `common/door/tools/`) writes only the English file, and W-FAST-SCRIPT-GUIDE (bim-ootb `common/door/tests/witness_fast_script_guide.js`) is no worse than before the change. Falsifier: point `--refresh` at a translated file.
Proposed location: a node script in this repo reading the built site; decided when built, spec and location recorded here.

## 6. Work order (one PR per step; WORK-TO-ZERO)
- **V0 measure, no content:** build with the plugin on a branch; confirm I1; confirm the chooser renders; measure `ja`/`zh-CN` search; count the Tier A pages and fenced blocks per page (the I2 population).
- **V1 plugin + chooser, English only** (I1, I7, I8).
- **V2 pilot:** ONE page (`index.md`) in ONE language. Recommended `es-419` (largest audience by the owner's reasoning); the owner picks. Witness I2-I6 on it. Measure real use (page views per language from whatever the site can report) before going on.
- **V3 glossary** (§4), then **V4 `USER_GUIDE.md`** and **`FastScriptGuide.md`** per language, run order suggestion: ja, es-419, de (owner can review or find a reviewer), then zh-CN, id, fr.
- **V5 Tier B** by the owner's pick.
Cost of each English edit is now up to six translations: the staleness check (§3) is what stops silent drift, so it is part of V2, not a later extra.

## 6b. Owner decisions 2026-11-16 (second set; supersede §3's reviewer step and §6's pilot)
- **No human review:** *"No language review as you are good enough"*.
  - Pages are drafted in the session, with `review: machine` in their front matter.
  - The §3 banner becomes ONE plain line: "Translated from the English page; the English page is the reference", linking to it. This is disclosure, not a review step.
  - The out-of-date check (`source_sha`) stays.
- **The pilot page is the CLI user guide:** *"Do it only for the CLI User guide for a start"*. That is `docs/FastScriptGuide.md` ("Fast Script User Guide").
  - Size: 1,328 lines; 630 fence lines in 77 blocks; 73 `<!-- run: -->` blocks; 426 prose lines, about 9,400 words outside code; 39 headings.
  - It is GENERATED by bim-ootb `common/door/tools/gen_fast_script_guide.js --refresh`, so a translation is a separate suffix file (`FastScriptGuide.es.md`) that the generator never writes (I9).
- **En bloc, progressively:** *"if u can solve en bloc many words that be good progressively. Otherwise think of what is important page to translate"*. A whole page is translated in one pass per language, made safe by the witness (§5 I2-I6 check every block, code span, number, heading and link mechanically). Languages follow one another; each is gated by the witness.
- **Search in the local language finds English pages:** *"perhaps allowing search in local language to return pages that may not be local still English?"* New §6c.

## 6c. Cross-language search: a translated vocabulary on the English pages (spec)
**Issue it removes:** a reader who searches in their own language finds nothing on the 90 pages that exist only in English.
**Measured 2026-11-16:** Material's search worker (9.7.6, `assets/javascripts/workers/search.*.min.js`) queries the fields `title`, `text` and `tags`, and shows an entry's `tags` in its result. The i18n plugin keeps ONE root `search/search_index.json` for every language and deduplicates it (V0: 1,722 → 1,724 entries with two test pages; fallback copies add nothing).
**Design:**
- One vocabulary, `docs/i18n_glossary.yml` (§4): `en` plus each language's word.
- At build time, a hook adds to each English entry of the search index, as `tags`, the local words of the vocabulary terms that the entry's text contains.
- A search for `factura` or `請求書` then returns the English page, with the matched word shown as a tag.
- Words are translated once and cover the whole site in all six languages. No page needs translating for this.
**Where the words come from (never invented):**
- **ERP terms:** the AD element names that the pages use, with the published iDempiere language packs' translations where a pack exists. Those are fr, es_ES, de, zh_CN and ja (the same packs as the UI, `ERP_UI_LOCALES.md`).
- **`id` and `es-419`:** no pack exists, so they are drafted in the session and marked `machine`.
- **Project terms (door, witness, twin …):** the §4 glossary rows.
- **Claim, W-DOCS-I18N I10:** every tag added to an entry is the vocabulary translation of a term that the entry's English text contains (X of N entries). No tag is added where no term occurs. Falsifier `tagall` (tags on every entry) FAILS it.

## 6d. V0 RESULT (2026-11-16, measured on a branch build; nothing deployed; logs read)
**Build:** mkdocs 1.6.1, Material 9.7.6, `mkdocs-static-i18n==1.3.1`, pinned in a throwaway venv.
- Baseline: 91 HTML pages, 116 MB, 0 warnings.
- With the plugin (en default, plus ja and zh test pages): 235 HTML pages, 132 MB, 0 warnings. Each language gets a full fallback copy of the site under `/<lang>/`; images are not copied per language.
**I1, English URLs unchanged:**
- Baseline → plugin build: 0 deletes and 0 shrinks, read by the REAL guard (`scripts/safe_gh_deploy.sh` `GUARD_ONLY=1`). The English file list is identical apart from the new `/ja/` and `/zh/` trees.
- **Found:** live `gh-pages` → baseline already fails the guard on 3 files that are on live but not produced by a master build: `CapexUATGuide.pdf` (4.7 MB), `glassbowl_data.db`, `.nojekyll`. This is pre-existing, not caused by i18n, and a real V1 deploy must resolve it first.
**Defects of the plugin's defaults, found and to be fixed in V1:**
1. Without `site_url`, the chooser links on index pages are root-absolute (`href="/ja/"`). On the live site that is `red1oon.github.io/ja/`, a 404. Measured fix: `site_url: https://red1oon.github.io/BIMCompiler/` makes them `/BIMCompiler/ja/`, with the guard still at 0/0.
2. An untranslated page offers every language in the chooser and serves an English copy with no notice (breaks I7). The plugin exposes what a template needs: on a fallback, `page.file.alternates[lang].locale` is still the default `en`.
   - V1 adds an override that lists a language only when the page really has it.
   - On a fallback copy, the override adds a "not translated yet" line, `noindex`, and a canonical link to the English page.
**Search:** one shared index; the test words `建設` and `建筑` find their own pages. The index separator is `[\s\-]+`, and the Python `jieba` segmenter is not installed. So Japanese and Chinese words inside a sentence without spaces are NOT yet proven searchable. That measurement waits for the ja and zh pages (INCONCLUSIVE, not a pass).
**Size of a language:** building a language only when it has at least one page keeps the site from growing with empty copies (each full fallback copy is about 72 HTML pages and about 8 MB).

## 6e. V1 + V2 RESULT (2026-11-16; logs read; deployed through `scripts/safe_gh_deploy.sh` only)
**Built:**
- `site_url`, and the pinned plugin in `mkdocs.yml`. Locale `es` stands for Latin-American Spanish: the plugin rejects `es-419`, because it takes ISO 639-1 or a country code only.
- `hooks/i18n_pages.py` runs at `event_priority(-100)`, after the plugin. Measured: at the default priority it ran first and was overwritten. The plugin sets `config.extra.alternate` as an attribute, so `.get()` read an empty key.
- `hooks/i18n_ui.yml`: the three lines per language.
- `overrides/main.html`: `noindex` and the line.
- `scripts/guide/witness_docs_i18n.js`.
- The plugin is pinned in `docs.yml`, `serve_docs.sh` and `edit_paper.sh`. `safe_gh_deploy.sh` aborts early, naming the fix, when the plugin is missing. W-DEPLOY-GUARD 4/0.
- The plugin is installed for the user's mkdocs (`pip install --user --break-system-packages mkdocs-static-i18n==1.3.1`, the same place as mkdocs itself).
**The CLI user guide in all six languages:** `FastScriptGuide.{es,fr,de,id,ja,zh}.md`, `review: machine`, `source_sha 276f5bede717d2ac`.
- One helper agent per language drafted each page from the English and assembled it with a script that copies every fenced block and comment verbatim.
- The session read a sample of every language.
**W-DOCS-I18N 7/0 on the six pages:**
- I1: the real guard, live → build. Its only offenders are files the deploy itself adds.
- I2: 77/77 blocks and 76/76 comments per page.
- I3: 817/817 code spans and 2/2 § tags.
- I4: 77/77 numbers.
- I5: 39 headings and 50 links resolve per page.
- I6: 426 fallback copies.
- I7: 504 pages, the chooser on exactly the 7 guide pages.
- Falsifiers `blockdigit`, `codespan`, `swapdigits`, `dropheading`, `noreview` and `addalt` each FAIL their claim.
- **Defect found by the witness, fixed:** the Japanese page wrote "row 1" as 一行目, a kanji digit. I4 FAILED with "1" en=8 tr=7; the page now reads `1 行目`.
- **Instrument error, fixed:** the witness read `hooks/i18n_ui.yml` with a line parser that kept the YAML `''` escape (French `n''est`). It now unescapes.
**I8, deploy evidence:**
- Spanish was published first: guard PASS 549 → 621 files, no `ALLOW_SHRINK`, canaries 200.
- Fetched: `/es/FastScriptGuide/` returns 200 with `lang="es"`, the Spanish title and the "Traducida…" line. The English guide carries `hreflang="es"`. `/es/MANIFESTO/` shows "aún no está traducida", `noindex`, and no chooser.
- **All six, second publish (2026-11-16, 23:29Z):** guard PASS 621 → 981 files, no `ALLOW_SHRINK`, canaries 200, `CapexUATGuide.pdf` live equals the checked print.
  - GitHub Pages served the new tree about 30 s after the push. The first fetch, straight after the publish, still saw the old tree (404 on `/fr/`): a fetch right after a deploy is not evidence either way.
  - Fetched each `/<lang>/FastScriptGuide/` for es, fr, de, id, ja and zh: HTTP 200, the right `<html lang>`, the translated title, 7 `hreflang` alternates, and the language's own "translated" line.
  - The English guide lists all 7 `hreflang`.
  - `/ja/MANIFESTO/` returns 200 with the Japanese "not translated yet" line, `noindex` and no chooser.
**Found for the CLI session, not a translation issue:** the Indonesian draft notes that English line 441 says `erp.read` does not fill in the order's own lines, while the run block under it shows a `children` list.
**Next:** §6c, the cross-language search vocabulary.

## 6f. Keeping translations in step when the English changes (spec; owner 2026-11-16: *"think also about when changes are made how to make them traverse easily without redoing the translations"*)
**Issue it removes:** today any edit of an English page marks every translation of it "out of date" (`source_sha`, §3), and the only remedy would be a full retranslation.
- `FastScriptGuide.md` is regenerated from real runs (`gen_fast_script_guide.js --refresh`), so it changes often.
- **Measured** on its last real edit (`93611da3b` → `89a01313d`, 143 lines inserted): 78 of the new lines are inside code blocks, which are never translated, and only 34 are prose.
**The rule that makes it possible (new witness claim I11):** a translated page keeps the English page's LINE STRUCTURE. The body has the same number of lines; fence, comment and blank lines sit at the same positions; one English line becomes one translated line. All six `FastScriptGuide` pages already do (1,327 body lines each).
**Tool: `scripts/guide/i18n_sync.js <Page> [--apply]`.** Per translated page:
1. Recover the OLD English: the git version of `docs/<Page>.md` whose sha256 prefix equals the page's `source_sha`. Not found → it refuses, naming the hash; it never guesses.
2. Diff old English → new English line by line (longest common subsequence).
3. Classify each NEW English line:
   - **kept:** unchanged, so the translated line at its old position is reused byte for byte;
   - **carried:** a fence, code, comment or blank line, copied from the new English verbatim (no translation exists for it);
   - **patched:** a changed prose line whose only difference is in code spans or numbers (same text once they are masked). The old→new tokens are substituted inside the translated line when each old token occurs in it exactly as often as in the old English line; otherwise the line is to-do;
   - **to-do:** changed or new prose. The new English line is written in its place, and the line number, old English, new English and old translation go to `<Page>.<lang>.todo.json`.
4. With `--apply` it writes the page. `source_sha` moves to the new English hash ONLY when there are 0 to-do lines; otherwise the page keeps its old hash, so it shows "out of date" until the to-do lines are translated (one small job, the lines only) and `--apply` runs again.
**Claims, W-I18N-SYNC (`scripts/guide/witness_i18n_sync.js`, real git versions as fixtures; falsifier `SYNC_BREAK=`):**
- **Y1 kept:** every line the diff marks unchanged carries its translation byte for byte (X of N).
- **Y2 carried:** every fence, code, comment and blank line of the result equals the new English.
- **Y3 patched:** each patched line has exactly the new English line's code spans and numbers.
- **Y4 to-do is honest:** every changed prose line that is not token-only is listed and not silently kept. Falsifier `keepstale` (reuse the old translation for a changed line) FAILS it.
- **Y5 the result is a valid page:** with the to-do lines still in English, the result passes W-DOCS-I18N I2-I5 and I11 against the NEW English.
- **Y6 no work lost:** the to-do count is at most the number of changed prose lines, and stated (the saving against a full retranslation, X of N lines).

**§6f RESULT (2026-11-16; logs read):** `scripts/guide/i18n_lines.js` is the one line reader, used by both the sync tool and the witness. Alongside it: `i18n_sync.js` and `witness_i18n_sync.js`.
**W-I18N-SYNC 6/0**, on real git versions: the six `FastScriptGuide` translations (made from `276f5bede717d2ac`) synced to `93611da3b`, a real 143-line edit. Per language, 1,291 lines:
- 949 carried, 321 kept, 5 patched (tokens swapped inside the translation), and 16 to translate.
- In total, 96 of 7,746 lines are left to translate: **1.2% of a full retranslation**.
- Falsifier `keepstale` FAILS Y4 and Y5.
**I11 added to W-DOCS-I18N** (same line structure as the English). Falsifier `joinlines` FAILS it.
**Found by the logs, fixed:**
1. The one blank line after a translated page's front matter was counted as body line 1. The reader now treats it as part of the front matter, and the sync writes it back.
2. `USER_GUIDE.es`/`.de` had joined two wrapped lines of the privacy admonition (107 against 108). They are split again at the same place; a wrapped line renders the same.
3. `index.es`/`USER_GUIDE.es` had an unquoted `: ` in `description:`, so MkDocs silently dropped the whole front matter and the page showed "out of date". I6 caught it through the built page. The values are now quoted, and I6 also parses every translated front matter with Python `yaml`.
4. Instrument errors in the witness: it looked for the home page at `<lang>/index/index.html` instead of `<lang>/index.html`, and it did not resolve site-absolute `/BIMCompiler/…` alternates.
**More pages (owner: *"we use our intuition"*):** the home page `index.md` and `USER_GUIDE.md` in all six languages. These two put the chooser where every visitor arrives.
**W-DOCS-I18N 8/0 on 18 translated pages** (3 pages × 6 languages). 414 fallback copies; 504 built pages, 21 with a chooser. Each of the 7 falsifiers FAILS its claim.
**How an English edit reaches the translations now:**
1. `node scripts/guide/i18n_sync.js <Page> --apply`
2. Translate only the lines listed in `docs/<Page>.<lang>.todo.json`, one small job per language.
3. Run `--apply` again: `source_sha` moves on and the "out of date" line goes. (After an edit that adds lines, step 3 is `i18n_sync.js <Page> --old-english docs/<Page>.md --apply`, see §6f FIX.)

**§6f FIX (2026-11-16, found by W-DOCS-I18N I4 while syncing the FastScriptGuide six-file edit, VOCAB_MESSAGE_CATALOG.md §6):**
- **Issue:** a PATCHED line swapped its numbers as SUBSTRINGS, one after another. A number inside another number was changed too, and a later swap re-changed text an earlier swap had written.
  - Measured on the coverage line, all six languages: old `59 64 5 1157 6 14` became `72 74 7 1177 7 15`. The English is `62 64 6 1158 7 15`.
  - W-I18N-SYNC Y3 passed anyway: its one fixture (`93611da3b`) never has one number inside another.
- **Fix in `i18n_sync.js`:**
  - A number token matches only as a whole digit run (no digit before or after it).
  - Every swap is done in ONE pass (one combined pattern, longest token first), so text that was just written is never scanned again.
  - The "occurs exactly as often" test counts the same whole-run way.
  - Code spans are matched as before.
- **New claim, W-I18N-SYNC Y7 (nested numbers):** a synthetic case. English `59 a 5 b 1157 c 6 d 14` changes to `62 a 6 b 1158 c 7 d 15`, against a translation holding the same numbers in another order. The patched line must hold exactly the new numbers.
  - Falsifier `SYNC_BREAK=substring` (the old swap) must FAIL Y7.
- **Also found:** the step "run `--apply` again" (step 3 below) is REFUSED after an edit that adds lines. The translation then has the new line count, while its `source_sha` still names the old English. The working second step is `i18n_sync.js <Page> --old-english docs/<Page>.md --apply`: every line pairs with itself, 0 to-do, and `source_sha` moves on.

## 6g. Rule: whoever touches an English page owns its translations (owner, 2026-11-16, binding)
> *"once those pages are touched, translations automatically done, without your session been active. Responsibility belongs to whichever session touches them."*
- Any session that changes an English page that has translations (`docs/<Page>.md` beside `docs/<Page>.<lang>.md`; today `FastScriptGuide`, `index`, `USER_GUIDE`) brings every translation of it up to date **in the same change**: the same PR and the same docs deploy. It does not wait for, ask, or hand off to the session that made the translations.
- **How:**
  1. `node scripts/guide/i18n_sync.js <Page> --apply`
  2. translate only the lines in `docs/<Page>.<lang>.todo.json`
  3. `node scripts/guide/i18n_sync.js <Page> --old-english docs/<Page>.md --apply`
  4. W-DOCS-I18N green on a fresh `mkdocs build`
- **Done means:** every translated page's `source_sha` is the new English hash, no `.todo.json` is left, and W-DOCS-I18N passes.
- This applies to generated edits too (`gen_fast_script_guide.js --refresh` rewrites the English page).
- A translated page left "out of date" is a defect of the change that caused it, not of the translation lane.

## 7. Open, one question at a time (owner)
1. ~~Reviewers~~: decided, none (§6b).
2. ~~Pilot~~: decided, the CLI user guide `FastScriptGuide.md`, every language progressively (§6b).
3. **UI parity:** build an Indonesian pack for the ERP UI, and an `es-419` one, so UI and guide match? (The UI's Malay, Arabic and Thai stay, with no guide.)
4. **Tier B list:** which pages after Tier A.

## STATUS
2026-11-16: spec written; V0 measured (§6d); owner decisions §6b; V1 + V2 built and deployed, the CLI guide in six languages (§6e); §6c search vocabulary next. Related: `prompts/ERP_UI_LOCALES.md` (UI locales), `prompts/CLI_ERP_IVR.md` §22 (localized `red1` words, a separate idea and not part of this file), `docs/FastScriptGuide.md`.
