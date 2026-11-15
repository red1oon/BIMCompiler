# ⚠ DO NOT REMOVE
Scope: **SPEC** for translated guides and a language chooser on https://red1oon.github.io/BIMCompiler/ . Nothing here is built. Read the build log and the witness log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE. Publishing stays under `prompts/DOCS_DEPLOY_POLICY.md` and `prompts/DOCS_DEPLOY_GUARD.md`: deploy ONLY via `scripts/safe_gh_deploy.sh`, never bare `mkdocs gh-deploy`, never `ALLOW_SHRINK` to get past this work.

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
**Not decided:** the store (flat file vs AD rows), the substitution mechanism for MkDocs, and who owns the English wording (the CLI session owns `CLI_ERP_IVR.md`; this file only records the idea until that session takes it).

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

## 7. Open, one question at a time (owner)
1. **Reviewers:** who can sign off each language (role only here)? A language with none ships as `unreviewed`, or does not ship.
2. **Pilot:** which page and language (default above).
3. **UI parity:** build an Indonesian pack for the ERP UI, and an `es-419` one, so UI and guide match? (The UI's Malay, Arabic and Thai stay, with no guide.)
4. **Tier B list:** which pages after Tier A.

## STATUS
2026-11-16: spec written; nothing built; V0 not run. Related: `prompts/ERP_UI_LOCALES.md` (UI locales), `prompts/CLI_ERP_IVR.md` §22 (localized `red1` words, a separate idea and not part of this file), `docs/FastScriptGuide.md`.
