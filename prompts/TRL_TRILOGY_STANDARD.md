# ⚠ DO NOT REMOVE
Scope: **SPEC and step ledger** for ONE translation standard across the Trilogy (ERP, BIM Viewer, Modeller): legacy iDempiere's Translation XML is the project's one format; a separate TERMINOLOGY category; one language choice that persists across the three apps. Built by an agent lane, separately from the message lane (`prompts/VOCAB_MESSAGE_CATALOG.md` §19.11-§19.13, which owns the ERP help packs). Read the log after every run (an exit code is not evidence). Spec first, a witness with a falsifier next, code last; honour until this file is marked DONE.

## ▶ RESUME HERE (written 2026-11-18; T1 built and merged, next = T2)
Start: (1) read this file top to bottom; (2) `git -C ~/bim-ootb fetch origin`; `git -C ~/bim-ootb worktree list` BEFORE any `git worktree add`, and reuse one that exists for your branch; (3) take the steps in order, T1 first. Each step: spec lines below → witness with a falsifier → code → logs read → RESULT written here → PR → merge (owner rule: merge your own verified PRs). Push is ON (CLAUDE.md §PUSH PAUSE lifted). No binary DB commits (CLAUDE.md §DB CHANGES). Never `git worktree remove --force`.

## 1. Owner decisions (verbatim, 2026-11-18, binding)
- *"Is it just Thai, or we can organise for all the language packs that legacy iDempiere already has? I assume such packs shape are important to build our part in OOTB too"*
- *"is it better we reenact those language packs as we have better capabilities with our AI here? Their translation xml schema is good enough to adopt as our project standard method to separate concern"*. Then, asked: **"Yes, as proposed"** to: *legacy's translation XML is the project's one translation format; AI-written rows live in their own lowest-priority source folder; published packs always win.*
- Languages: **"Finish the 18 first"**: the BIM chooser's 18 (`viewer/locale_loader.js` AVAILABLE_LOCALES) before any other language.
- *"spec out for our BIM and Modeller to follow such translation usage, in its prompts/# so u can use an agent to handle it separately. A separate category of terminology be added to them"*
- *"so that when any of the Trilogy chooses a language, it persists thru-out"*

## 2. Facts measured 2026-11-18 (bim-ootb main `ea604d7a`; cite them, do not re-derive)
- **The format.** iDempiere's Translation export (`org.compiere.install.Translation`): one file per table and language, `<Table>_Trl_<lang>.xml`, root `<idempiereTrl language= table=>`, `<row id=N>` with `<value column=X original="English">translated</value>`. Rows are keyed by the row's ID; `original` = the English the translator saw, so a stale row is detectable. Import rule (`TranslationHandler.endElement`): matched by ID only.
- **ERP** (`erp/`): screen packs `erp/i18n/<lang>.json` and help packs `erp/i18n/help/<lang>/` are BUILT from published legacy packs. The one source list is `erp/tools/i18n_sources.json` (sources + meta; VOCAB §19.11). 11 languages: en_US fr_FR es_ES de_DE ar zh_CN ja_JP ms_MY th_TH pt_BR id_ID. App-own strings: `erp/i18n/chrome.json` (ref = `msg:`/`el:` resolved from the pack, else `machine[locale]`, else English) and `erp/i18n/machine/<lang>.json` (`{English: text}`, labelled machine; ERP_UI_LOCALES.md §L2b). The machine text exists for the first 8 languages only, so 46 chrome keys show English in pt_BR / id_ID.
- **Viewer** (`viewer/`): ALREADY the legacy shape, for ONE table. `viewer/i18n/AD_Message_Trl_<locale>.xml` (17 files) + `ad_message_base.csv` (ID → Value), built to `viewer/i18n/<locale>.json` by `viewer/tools/build_trl.js` (+ `trl_common.js`). Rows are written by dated AI batch scripts `viewer/tools/trl_batch_<date>_<what>.js` (no published pack exists for the Viewer). IFC class names and definitions (`trl_batch_2026-11-17_ifccls*.js`, `_ifcdef*.js`), road standards, how-to headings and UI text all sit in that ONE `AD_Message` table: terminology and UI messages are mixed.
- **Modeller** (`modeller/`): no pack of its own. `modeller/modeller.html:321`: it translates through the Viewer's `viewer/i18n` dictionary by EXACT English text (W-MODELLER-I18N).
- **The language choice**, three keys, no shared one:
  - ERP: `localStorage['erp.lang']` (`erp/erp_i18n.js:31`, `_persist` :200). It hands the language to the Viewer only through `?lang=` on Zoom Across.
  - Viewer: `localStorage['bim_ootb_config'].locale` (`viewer/locale_loader.js:90`). Precedence: `?lang=` > saved > `navigator.language` > `en_MY`. `LOCALE_MAP` maps foreign codes (`'ar'` → `ar_SA`, :38).
  - Modeller: the Viewer's loader.
- **One origin:** all three are served from `https://red1oon.github.io/bim-ootb/{erp,viewer,modeller}/`, so they share `localStorage`. Precedent: the Modeller reads the ERP's `localStorage.teamMode` (`modeller/modeller.html:362-367`).
- **Code sets differ:** ERP `ar` vs Viewer `ar_SA`; the Viewer has en_MY / en_GB / en_AU / ko_KR / bn_BD / bl_BD / af_ZA, which the ERP lacks.

## 3. The standard (what every app follows)
- **S-1 One format.** Every translatable text of every app is a row in a `<Table>_Trl_<lang>.xml` file of the legacy schema. A JSON file is a BUILD OUTPUT the page loads, never a source.
- **S-2 Three categories, as legacy separates them:**
  - **Message** = UI text (legacy `AD_Message`: buttons, labels, prompts, status lines). Key = a message Value.
  - **Terminology** = the names, descriptions and help of domain TERMS (legacy `AD_Element` is iDempiere's terminology; `SynchronizeTerminology` pushes it to fields). For the BIM apps, a new table **`BIM_Element`**: IFC classes and their definitions, element kinds, disciplines, units, standards (road, structural), BOM and 4D terms. Columns `Name`, `Description`, `Help` (same as `AD_Element`). Key = a stable numeric ID with a base CSV `bim_element_base.csv` (ID → Value, e.g. `IfcWall`), exactly as `ad_message_base.csv` is for messages.
  - **Dictionary** = the ERP's own AD tables (`AD_Window`, `AD_Process`, `AD_Ref_List`, …), ERP only, from the published packs.
  - A text belongs to ONE category; moving it is a move (deleted from the old table), never a copy.
- **S-3 Sources in priority order, per app** (the ERP's `i18n_sources.json` is the pattern): published legacy packs first (ERP only), then our own hand-checked rows, then **`machine/`**: the AI-written rows, same schema, lowest priority. A row from a higher source always wins. An AI row is never deleted when a published row arrives; it just stops being used, and the build log counts it as `shadowed`.
- **S-4 Provenance in the file, not in a comment:** the source FOLDER says who wrote a row (pack / own / machine). The build log prints per table and language: kept, shadowed, stale (`original` ≠ today's English), untranslated.
- **S-5 One language choice for the Trilogy.**
  - One shared key, `localStorage['bim.lang']`, holds the person's chosen code (the chooser's 18-code set).
  - One module, `common/i18n/lang_choice.js`, holds `get()`, `set(code)`, and `nearest(code, appCodes)` (the one mapping table, moved from the Viewer's `LOCALE_MAP`). Every app's picker calls `set`; every app's start calls `get`.
  - Precedence: `?lang=` > `bim.lang` > the app's old key (read once, then migrated) > `navigator.language` > the app's default.
  - An app that lacks a pack for the chosen code shows its `nearest` (e.g. ERP `bn_BD` → `en_US`) but NEVER overwrites `bim.lang`, so the choice survives to the next app that has it.

## 4. Steps (in order; each a PR)
### T1 One language choice across the Trilogy (S-5)
- **Issue:** a person who picks 日本語 in the ERP opens the Modeller in English, unless they came through Zoom Across; picking a language in the Viewer does not reach the ERP.
- **Change:** add `common/i18n/lang_choice.js`. Wire `erp/erp_i18n.js` (`_persist` / its start), `viewer/locale_loader.js` (`detectLocale`, its save) and the Modeller through it. Keep `?lang=` hand-overs working.
- **Witness W-TRILOGY-LANG** (headless chromium, `--disable-gpu`, the three real pages served from ONE origin):
  - L1: set in the ERP → the Viewer and the Modeller start in it;
  - L2: set in the Modeller → the ERP starts in it;
  - L3: a code the ERP lacks (`ko_KR` before T5): the ERP shows `nearest` and `bim.lang` is still `ko_KR`;
  - L4: an old saved `erp.lang` / `bim_ootb_config.locale` migrates once.
  - Red: `TRL_BREAK=ownkey` (each app reads only its own key) FAILs L1 and L2.
### T1 RESULT (2026-11-18) — DONE (witness), bim-ootb PR #3290, squash-merged as `9f4631af` (checks fast-checks + e2e-tests green)
- **Built** (bim-ootb, file:line as merged):
  - `common/i18n/lang_choice.js` (new, 91 lines): `canon` :38, `get` :51, `set` :73, `nearest` :80; the one `MAP` (moved verbatim from the Viewer's `LOCALE_MAP`) and the 18-code `CODES`. Key `bim.lang`. `get` precedence `?lang=` > `bim.lang` > old key (migrated once, logs `§LANG_MIGRATE old=… bim.lang=…`) > `navigator.language` > null (app default). `set` logs `§LANG_SET`. The red-control hook `window.__TRL_BREAK==='ownkey'` is at :49 (get() then ignores `bim.lang` and the URL).
  - `viewer/locale_loader.js` (+26 / −46, the `LOCALE_MAP` block deleted): `_LC()` :27 reads `window.BimLang` at call time (absent → logged `§LANG_CHOICE absent`, degrade to `?lang=` / old key / en_MY); `_saveLocale` :34 (bim.lang through `set`, plus the `bim_ootb_config.locale` mirror the first-run toast and `rates.js:989` still read), called from the flag picker :317 and the in-place `setLocale` :539; `detectLocale` :70 goes through `get({legacy:[bim_ootb_config.locale]})`. `§TRL_DETECT src=saved` is kept for both `bim.lang` and a migrated old key (W-VIEWER-I18N greps it).
  - `erp/erp_i18n.js` (+12 / −1): `LC` :205, `_codes` :207, `_persist` :208 (writes `bim.lang` only, no longer `erp.lang`), `initial` :209 (reads `get({legacy:[erp.lang]})`, SHOWS `nearest(code, ERP codes)` or the base, never writes; logs `§I18N initial choice=… src=… shows=…`). `noPersist` on the first `set` is unchanged, so the ERP boot never overwrites the choice. Without the module it keeps the old `erp.lang` path (logged).
  - The Modeller runs the Viewer's loader (`modeller/modeller.html:323`), so it needs only the tag: `modeller/modeller.html:319`. Tags also in `erp/idempiere.html:554`, `viewer/viewer.html:1013`, `boq_charts.html`, `mep_report.html`, `clash_report.html`, `index.html:179`.
  - Precache: `erp/sw.js:109`, `viewer/sw.js:1217`; the Modeller is written from its manifest, so `modeller/modules.json` (module :21, tag site :200, precache :434; sw.js regenerated by `gen_manifest.js --write modeller`). Bumps through `scripts/bump.js` (the parity gate ran: `§BUMP_PARITY … new=[] verdict=PASS`); `audit_sw_precache.js` 297/0 missing, 0 unlisted.
  - `?lang=` hand-over kept: `erp/idempiere.html` `_zoomLang()` untouched; `erp/tests/witness_zoom_lang.js` (+11 / −9) now loads `lang_choice.js` into its vm sandbox and its control strips the `'ar'` MAP rows instead of the old loader block.
- **Witness W-TRILOGY-LANG** `common/i18n/tests/witness_trilogy_lang.js` (169 lines; headless chromium `--disable-gpu`, the three REAL pages from ONE http origin and ONE browser context; language proven by `§TRL_DETECT` / `§I18N` / `§LANG_*` lines, `<html lang>`, `ErpI18n.lang`, `_TRL_LOADER.current()`). Log: `common/i18n/tests/logs/w_trilogy_lang.log`.
  - Green: `§WITNESS_TRILOGY_LANG pass=19 fail=0 inconclusive=0 verdict=PASS`. U1-U5 (nearest table 12/12, CODES = the loader's 18, MAP moved, canon of every ERP code); L1 ERP `ja_JP` → Viewer `ja_JP` (`src=saved`, html `ja`) and Modeller `ja_JP`; L1 ERP `ar` → both `ar_SA` (html `ar`); L2 Modeller `de_DE` → ERP `de_DE` (`§I18N initial choice=de_DE src=saved shows=de_DE`); L3 `ko_KR`: ERP `§I18N initial choice=ko_KR src=saved shows=en_US (no pack: nearest is the base)`, `bim.lang` still `ko_KR` after the ERP boot, the Viewer opened next is `ko_KR`; L4 `erp.lang=fr_FR` → `§LANG_MIGRATE old=fr_FR bim.lang=fr_FR`, a later `erp.lang=de_DE` ignored; `bim_ootb_config.locale=th_TH` the same, a later `ms_MY` ignored; `?lang=ja_JP` beats `bim.lang=th_TH` and leaves it untouched; `?lang=ar` → `src=url-mapped code=ar_SA`.
  - **Red control** `TRL_BREAK=ownkey` (log `…_break_ownkey.log`): `§WITNESS_TRILOGY_LANG pass=7 fail=12 inconclusive=0 verdict=FAIL TRL_BREAK=ownkey`. The failing lines: `FAIL L1 ERP ja_JP -> viewer opens in ja_JP (bim.lang=ja_JP)  got en_US … src=browser`, same for modeller; `FAIL L1 ERP ar -> viewer/modeller opens in ar_SA`; `FAIL L2 Modeller de_DE -> ERP opens in de_DE (bim.lang=de_DE)  got en_US … §I18N initial choice=en_US src=browser`. (L3 ERP-nearest and all L4 migrations fail too, as they should.)
- **Regressions** (logs read, not exit codes): `witness_erp_i18n.js` `pass=7 fail=4 ran=11`, the same 4 FAIL lines as before (no locale FAILs, every non-English PASSes, every label equals its oracle, session kept), per-language `WHY=session mismatches=3` identical to a run on an older main for the 9 shared languages; `witness_help_showcase.js` `pass=37 fail=0 verdict=PASS`; `witness_hq_box.js` `pass=8 fail=0 verdict=PASS`; `witness_zoom_lang.js` `pass=14 fail=0`; `witness_manifest_roundtrip.js --skip-c7 --skip-c9` `claims=13/13 red=12/12 order_check=PASS`; `witness_viewer_i18n.js` `pass=90 fail=1`, the one FAIL is `(3b)` UNKNOWN-KEY `viewer/tm_gantt_edit.js:tm_group_blocked,…` (a file this step does not touch); `witness_modeller_i18n.js` fails only on the LOD Upgrade pill (`§MDL_LEAK … uncat=3 [U:Upgrade — choose what to add (rebar, …) · U:Upgrade …]`, every non-en_MY locale, and (4) in-place/Help-panel), identical on a clean origin/main worktree (`--locales ms_MY` → `ms_MY:3/141`; `--locales de_DE` → the same three FAILs).
- **Decisions to confirm (owner):** (1) a person who explicitly picks `English` (en_US) in the ERP now stores `bim.lang=en_US`, so the Viewer opens en_US (USD rates) where before the ERP base never reached it; booting the ERP never writes it. (2) The ERP writes `bim.lang` only; `erp.lang` is no longer written (read once for migration). (3) The Viewer still writes the `bim_ootb_config.locale` mirror (toast + `rates.js`).
- **Not mine, found on main:** `tests/test_s284_packager.js` 23/4 (3.1, 9.1, 10.1, 10.2) on main and here; W-VIEWER-I18N `(3b)` unknown keys in `tm_gantt_edit.js`; W-MODELLER-I18N uncatalogued LOD Upgrade pill strings (above).

- **Owner decision (2026-11-18, verbatim):** *"yes, en_US pick saving for all three is fine"*: picking English in the ERP stores `bim.lang=en_US` for all three apps (the Viewer then opens en_US, USD rates). Booting the ERP without a pick writes nothing. Checked by the owner; not to be re-asked.
- **Verified by the lead session (2026-11-18):** W-TRILOGY-LANG re-run on main `pass=19 fail=0 verdict=PASS`; red `TRL_BREAK=ownkey` `pass=7 fail=12 verdict=FAIL`.

### T2 The terminology category in the Viewer (S-2)
- **Issue:** IFC class names and definitions, standards and other terms are messages, so a term cannot be shared or reviewed as a term.
- **Change:**
  - `viewer/i18n/BIM_Element_Trl_<locale>.xml` + `bim_element_base.csv`.
  - `build_trl.js` reads both tables and the page keeps one lookup.
  - MOVE the term rows (the ifccls / ifcdef / roadstd batches' keys, and any other row whose key names a term) out of `AD_Message`.
  - Write the list of moved keys into this file's RESULT.
- **Witness W-TRL-TERMS:**
  - every moved key is in `BIM_Element` and NOT in `AD_Message` (X of N, N = the batches' own key lists);
  - the built page text is byte-equal before and after for every locale (W-VIEWER-I18N stays 0 leaks);
  - red: a key left in both FAILs.
### T3 The Modeller reads the same two tables (S-1, S-2)
- **Change:** the Modeller's terms come from `BIM_Element` by key, not by exact English text. Its UI messages stay in the shared `AD_Message`.
- **Witness:** W-MODELLER-I18N stays green, plus a new check: a term shown in the Modeller equals the Viewer's for the same key and locale.
### T4 Provenance: the `machine/` folder in the BIM apps (S-3, S-4)
- **Change:** the Viewer's rows are all AI-written (no published pack), so they move into `viewer/i18n/machine/`. The build log prints kept / shadowed / stale / untranslated per table and locale.
- **Witness:** a row added to an `own/` file shadows its `machine/` row (count = 1), and the page shows the own row. Red: priority reversed FAILs.
### T5 The ERP's own strings in the same shape, and the 18 (S-1, S-3; owner "Finish the 18 first")
- **Change:**
  - `erp/i18n/chrome.json`'s machine text and `erp/i18n/machine/<lang>.json` become `machine/` XML rows of `AD_Message` / `AD_Element` (the ERP keeps its published packs first).
  - Fill the 46 chrome keys for pt_BR and id_ID.
  - The ERP gains the rest of the 18 by AI in `machine/`: ko_KR (no published pack is reachable: VOCAB §19.11 step 2 lists the channels searched), bn_BD, bl_BD, af_ZA, en_GB / en_AU / en_MY (English variants = the English base with the variant's spellings only).
  - Each new language is added to `i18n_sources.json` meta, so the screen, help and witnesses follow (VOCAB §19.11).
- **Witness:** VOCAB's help witnesses (SHOWCASE S0/T2, BOX B5, PROC-NAMES, LEGACY-SUPERSET) over the larger set; a published row is never shadowed by a machine row (count 0); W-TRILOGY-LANG L3 turns to the real pack.

## 5. Rules for the agent (read before the first edit)
- Spec before code: write each step's SPEC lines here first, if they need more detail than above.
- Witnesses: start from `bim-ootb/witness_kit/contract.js`. A verdict prints INCONCLUSIVE, never PASS, when nothing was judged. Each claim names the issue it proves or disproves, and has a falsifier.
- AI translations are written IN THIS SESSION (no paid API calls: MEMORY `feedback_no_paid_model_calls`). Each batch is a dated script in the app's tools folder, as the Viewer's `trl_batch_*.js` are, so a reviewer can re-run it.
- Never edit `deploy/live/`. Bump service workers through `scripts/bump.js` (it bumps `?v=` and `CACHE_VERSION`), then `node tests/audit_sw_precache.js`. On a `sw.js` conflict take max+1 and keep both precache additions.
- Shared checkout `~/bim-ootb` is blocked by a hook: work in a `/tmp/wt-*` worktree. Before `git worktree add`, run `git worktree list` and reuse any existing one for the branch.
- Report into this file's RESULT sections only, not `MEMORY.md`.

## STATUS
2026-11-18: SPEC written (owner decisions §1, facts §2, standard §3, steps T1-T5). **T1 DONE (witness): bim-ootb #3290, merge `9f4631af`; W-TRILOGY-LANG 19/19 PASS, red control TRL_BREAK=ownkey 7 pass / 12 FAIL (L1, L2 fail).** Next: T2. T3-T5 not started. Related: the ERP's help packs for 11 languages are merged (bim-ootb #3275, #3281, #3283; VOCAB §19.10-§19.11).
