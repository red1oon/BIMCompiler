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
