# ⚠ DO NOT REMOVE — ERP UI LOCALES (in-browser Kernel-ERP, `bim-ootb/erp/idempiere.html`)
**Scope:** let a user switch the whole ERP UI between en_US, fr_FR, es_ES, de_DE, ar (RTL), zh_CN, ja_JP, ms_MY, th_TH —
on the login screen before anyone logs in, and in a running session without losing it. Translations are EXTRACTED from
published iDempiere / ADempiere language packs; anything not in a pack is labelled `machine` and counted apart.
**Read the log after every run** (`§I18N-BUILD`, `§I18N-FETCH`, `§I18N`, `§I18N-RERENDER`, `§W-ERP-I18N`). Exit code is
not evidence. No screenshots as proof: every claim below is a `§` value a witness asserts.
**Witness:** `W-ERP-I18N` = `bim-ootb/erp/tests/witness_erp_i18n.js` (log `erp/tests/witness_erp_i18n.log`).

---

## §L0 THE ASK (user, 2026-10-03, verbatim)
"a full 3 mins … demonstrative of its multi lingual capability.. even switching the UI to respective locales.. start
with English, then French, Spanish, German, Arabic, Mandarin, Japanese, Malay, Thai … UI reflects each locale. If not
in, set them up first." — "all played out in the same film clip, not going back and splice together".
Follow-ups (same day, via coordinator): language slices are ~10 s each, cycling the 9 languages repeatedly → the
switch must be **in place, ~1–2 s on screen**, keeping session + open window + record (relogin NOT acceptable). The
film opens on the **login screen** with a greeting round (one greeting every ~1.5–2 s) and the login card must
re-render in each language (titles, labels, buttons, tenant/user/role step texts, Arabic flips RTL) **before login**,
in ≤ ~1 s, and the chosen language carries into the session.

## §L0.1 Measured state before (bim-ootb `5f82edfd`)
`erp/ad_seed.db` has NO `AD_Language` and NO `AD_Menu_Trl`/`AD_Window_Trl`/`AD_Tab_Trl`/`AD_Field_Trl`/`AD_Element_Trl`/
`AD_Process_Trl`/`AD_Ref_List_Trl`/`AD_Message_Trl`; it has no `AD_Message` table at all. `idempiere.html` was
`<html lang="en">`, every chrome string a literal. Local iDempiere 12 (Postgres, release `2024-12-24`) has all 9
`AD_Language` rows but only `es_CO` translations loaded (AD_Message 2144 rows base).

## §L1 THE MODEL — iDempiere's own, ported (not invented)
* Base language = the AD tables themselves (`ad_seed.db` = en_US). A translation is a `<T>_Trl` row keyed by the base
  row's ID. Pack import rule = `org.compiere.install.TranslationHandler.endElement`: `UPDATE <T>_Trl … WHERE <T>_ID=<row id>`
  (by ID; the XML `original` attribute is not consulted). Text passes `Util.cleanAmp` (`Util.java:593`).
* Centrally-maintained names follow their source (`SynchronizeTerminology`, `org.adempiere.base.process`):
  a W menu → `AD_Window_Trl`, P/R → `AD_Process_Trl`, X → `AD_Form_Trl` (`IsCentrallyMaintained='Y'`); a central field →
  its column's `AD_Element_Trl` (PO_Name in an `IsSOTrx='N'` window; a button column's `AD_Process_Trl`); a non-central
  row uses its own `_Trl` row. iDempiere's pack export only writes non-central rows for these tables
  (`Translation.java:257 o.IsCentrallyMaintained='N'`) — which is why the modern packs carry ~49 menu rows and the
  page MUST resolve central names itself. `erp_i18n.js` `menuName`/`fieldName` are that rule.
* Messages: `Msg.getMsg` looks up by `AD_Message.Value`; packs key rows by ID → the build maps ID→Value from the live
  iDempiere 12 `AD_Message` (`ad_message_base.csv`).
* List values: `AD_Ref_List_Trl` by `AD_Ref_List_ID`, wired into `ad_data.js _listLabel` (FK/list label cache is
  keyed per locale).
* NOT translated (named, as in iDempiere without data packs): business data (product/BP names), process dialogs'
  parameter labels, report output, the info/credits lines on the login card, the System Monitor.

## §L2 THE PACKS — sources, pins, coverage (2026-10-03)
Fetched by `erp/tools/fetch_i18n_packs.sh` into `~/.cache/erp_trl` (never into the repo); built by
`erp/tools/build_i18n.py` into `erp/i18n/<lang>.json` (one lazily-fetched file per locale; only the chosen language is
downloaded). Kept counts = rows written (ID present in ad_seed.db AND text ≠ English). `drift` = kept although the
English changed since the pack (iDempiere's rule). Two drops, both counted: `unofficial` (id > 999999 =
`MTable.MAX_OFFICIAL_ID`, the export's own bound, `Translation.java:266`) and `repurposed` (AD_Menu ONLY: old and new
English share no word, e.g. ar_TN 2008 menu 218 'Test' → today 'System Admin' — the one deliberate deviation from the
ID-only rule, limited to menus where re-use was found).

Sources (pinned in `fetch_i18n_packs.sh`):
| locale | source |
|---|---|
| fr_FR | github nmicoud/fr_FR@17bbc28b (iDempiere 12 export, WIP) + SF ADempiere `adempiere_fr_FR_352.tgz` (2008-10-01) fills the rows the WIP pack lacks |
| es_ES | github globalqss/globalqss-idempiere-lco@31b1442b **es_CO** — no es_ES pack is published; Colombian Spanish served for es_ES, labelled |
| de_DE | github bxservice/tbayen.translations@c88fe319 |
| ar | github djoudi/ar_DZ@d1c2c3dc (2020, AD_Element only) + SF `arabic_language_By_Najeh.rar` ar_TN (2008-02-05: Element/Menu/Message) — no Window/Tab/Field rows exist in either |
| zh_CN | SF ADempiere 3.5.2 `zh_CN.zip` (2008-08-20) — the current iDempiere zh_CN pack (gitee idchina/chinese-translation, "99%", 2023) is **private** (HTTP 403) |
| ja_JP | github JPiere/japanese-translation@b5547855 |
| ms_MY | SF `ms_MY.zip` "First Bahasa Release - Beta" (2008-11-25) — the only Malay pack found anywhere |
| th_TH | SF `th_TH.350.zip` (Saeree/Grandlinux, 2008-06-16) |

Kept rows per `_Trl` table (pack) + machine-supplement rows applied (2026-10-03 build):
| locale | Menu | Window | Tab | Field | Element | Process | Form | Ref_List | Message | machine (menu/win/tab/field) | KB |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fr_FR | 365 | 254 | 658 | 56 | 2556 | 316 | 28 | 746 | 1065 | 22/27/24/752 | 221 |
| es_ES | 48 | 365 | 1103 | 165 | 3833 | 471 | 45 | 1342 | 2054 | 5/1/0/0 | 341 |
| de_DE | 46 | 351 | 1064 | 163 | 3607 | 433 | 44 | 1272 | 2021 | 5/1/0/52 | 320 |
| ar | 190 | 0 | 0 | 0 | 1228 | 0 | 9 | 0 | 575 | 69/56/75/560 | 115 |
| zh_CN | 393 | 250 | 800 | 44 | 1481 | 119 | 26 | 430 | 918 | 26/29/26/329 | 139 |
| ja_JP | 43 | 289 | 846 | 104 | 2800 | 290 | 26 | 856 | 918 | 15/15/19/133 | 222 |
| ms_MY | 143 | 80 | 140 | 14 | 233 | 62 | 16 | 616 | 118 | 68/50/70/5740 | 154 |
| th_TH | 338 | 188 | 521 | 16 | 1866 | 201 | 16 | 515 | 802 | 37/32/29/236 | 269 |
(Modern packs carry few Menu/Field rows by design — central names come from Window/Element, §L1. ms_MY's 5740 machine
field rows are a handful of common English names — Name, Tenant, Organization, Active… — repeated across every tab.)

(Exact per-table kept/drift/repurposed/unofficial/same/absent counts: the `§I18N-BUILD` lines, also embedded in each
`i18n/<lang>.json` `detail`. Empty cells = see log; this table is the summary.) Searched and NOT found: any th_TH /
ms_MY pack on GitHub, Launchpad (`idempiere-localize` — strings untranslated), the iDempiere wiki Translations page
(lists de, it, zh_CN, ja, ko, pt_BR, sk, ru, fr, in_ID, ar_DZ, zh_TW, cs — no ms/th/es_ES).
One ms_MY file is malformed (`AD_Ref_List_Trl_ms_MY.xml` line 32, missing `>`) → read by a tolerant regex, logged
`§I18N-BUILD recovered-by-regex`.

### §L2b Labelled machine supplement (`source=machine`)
Packs leave the film surface partly English (ms_MY: 113 of 172 visible top-two-level menu nodes; ar: no Window/Tab
rows at all). Per the ask's option 2, `erp/i18n/machine/<lang>.json` = `{English: translation}` written for this app by
Claude (Anthropic) — **not** a language pack — for the strings missing on the measured film surface (BP + Sales Order
windows' tabs/header+line fields, the role-scoped menu's top two levels): fr 58, es 5, de 7, ar 161, zh 80, ja 35,
ms 211, th 88 entries. The build applies an entry ONLY where every pack rule left the label untranslated (same
resolution as the page), into separate `<T>_Trl_m` maps; the page counts it as `src=machine`. Rows applied per locale:
`machineCounts` in the build log / `index.json`.

## §L3 CHROME CATALOGUE (`erp/i18n/chrome.json`, 41 keys)
Per key: `ref` = `msg:<AD_Message.Value>` or `el:<AD_Element_ID>` → resolved from that locale's pack (src=pack),
optional `fmt`; else `machine[locale]` (src=machine); else English. `en` = the exact English the page shows today, and
the English page is byte-identical (titles the existing witnesses select on, e.g. `title^="New record"`, unchanged).
Toolbar = iDempiere `ADWindowToolbar` messages (`New`, `Copy`, `Save`, `SaveCreate`, `Delete`, `Ignore`, `Refresh`,
`Process`, `Print`, `ZoomAcross`, `First/Previous/Next/Last`, `Record`, `of`, `Records`); login = `Login`, elements
`AD_Role_ID`/`AD_Client_ID`/`AD_Org_ID`/`AD_Language`; app-own strings (tenant/user step texts, demo tags, search
placeholders, Grid/Form) are machine entries.

## §L4 THE SWITCH — in place (primary and only method)
* Pickers: login card **`#idmp-login-lang`** (a `<select>`, top-right of the card) and header **`#idmp-lang`** (a
  `<select>` left of the log-out button). Both mirror the current language. Programmatic: `ErpI18n.set('<code>')`
  returns `{lang, dir, ms}`. URL `?lang=<code>` sets the start language; the choice persists in `localStorage['erp.lang']`.
* `ErpI18n.set` loads `i18n/<code>.json` (cached in memory after first use; `ErpI18n.preload()` warms all 8), flips
  `<html lang dir>`, then the host `_i18nRerender` relabels in place: static `[data-i18n*]` markup, the login step on
  screen (step 0/1 re-rendered, step 2 labels), the menu tree (rebuilt, open folders / active leaf / scroll / filter
  restored), every open window's window/tab/field names on the SAME objects, toolbar, tab strip, body. Session, open
  windows, active tab, record index and grid/form mode are kept. A form with unsaved edits is not rebuilt (labels
  rewritten in place; `body=kept-dirty`).
* Every switch logs `§I18N lang=<code> labels=<translated>/<total> dir=<ltr|rtl> ms=<n> menu=a/b window=… tab=… field=…
  chrome=… src=pack:<n>,machine:<n>` and `§I18N-RERENDER … session=kept openWindows=… rec=…`.

## §L5 RTL + FONTS
`dir="rtl"` on `<html>` for `ar`; the flex layout mirrors (menu on the right). CSS `[dir=rtl]` rules move the menu border,
active-row bar, grid/result text alignment, mandatory bars and the desktop collapse direction. Font stack adds
Noto Arabic/Thai/CJK + Windows/macOS equivalents, with `:lang(ja|zh|th|ar)` preferring the script's own face. The
witness reads the fonts Chromium actually used for a label (CDP `CSS.getPlatformFontsForNode`), by value.

## §L6 DELIVERY
DB rule: no ad_seed.db change at all — translations ride beside it as `i18n/*.json` (presentation data, extracted,
regenerable by the two tools). `sw.js`: precache `erp_i18n.js` + `i18n/chrome.json` + `i18n/index.json`; locale packs
are cache-first on first fetch. PR slices: (1) core = this whole lane (module, packs, catalogue, pickers, RTL,
witness) — one coherent slice, since any subset leaves a half-translated page.

---
## §L7 RESULTS
(appended below by the implementing session — PR, merge sha, witness lines, live check)

### §L7.1 — 2026-10-03 · SHIPPED (Opus 5.5 worker)
| PR | merge sha | sw | what |
|---|---|---|---|
| bim-ootb **#1827** | `d37c743c` | v809 | the whole lane: `erp/erp_i18n.js`, `erp/i18n/*.json` (8 packs + `chrome.json` + `index.json` + `machine/*`), pickers, in-place rerender, RTL/fonts, `ad_data` list labels, `crud_overlay` inline labels/verb bar, `tools/build_i18n.py` + `tools/fetch_i18n_packs.sh` + `tools/unrar.mjs`, witness |
| bim-ootb **#1828** | `53e706ec` | v810 | a machine catalogue entry now takes the key's `fmt` like a pack hit — found ONLY by fetching the live page: de_DE/ms_MY login title read "Anmelden"/"Log Masuk" without "Kernel-ERP — " (their packs lack AD_Message `Login`). The witness oracle mirrored the same rule, so it was blind to it (scope-blind, PRIMAL LAW §4) — both fixed |

**W-ERP-I18N** (`erp/tests/witness_erp_i18n.js`, local, headless `--disable-gpu`), after #1828 — all 9 `PASS`, `§WITNESS_ERP_I18N pass=11 fail=0 ran=9`:
```
lang   login strings  session labels  fields  menu     dir  ms(login,session)
en_US  0/17           0/594           0/63    0/522    ltr  3,91 (+157 round-trip; baseline exact)
fr_FR  17/17          473/594         62/63   402/522  ltr  14,99
es_ES  17/17          565/594         62/63   494/522  ltr  14,87
de_DE  17/17          556/594         62/63   485/522  ltr  15,91
ar     17/17          316/594         62/63   245/522  rtl  8,100
zh_CN  17/17          470/594         62/63   399/522  ltr  9,117
ja_JP  17/17          484/594         63/63   412/522  ltr  10,134
ms_MY  17/17          298/594         62/63   227/522  ltr  8,89
th_TH  17/17          430/594         62/63   359/522  ltr  9,123
carry-over PASS (picked de_DE on the login card → session de_DE, menu 485/522, 0 mismatches) · pageErrors=0
fonts (CDP): ar Noto Sans Arabic · zh Noto Sans CJK SC · ja Noto Sans CJK JP · th Noto Sans Thai
```
Every count is "label == oracle" (0 mismatches in all 9); untranslated remainder = English shown honestly (pack gaps,
language-neutral words like Logo/URL). **RED first:** run 1 FAILED all 9 — curated inline-form labels (crud_ops.json
"Price List (ID)") stayed English, and the record nav blanked after a switch (`renderBody` before `renderToolbar`).
**No regression:** `W-ERP-FIRST-SETUP` 34 VERIFIED / 0 GAP / 0 INCONCLUSIVE / 0 page errors (English).
**LIVE (fetched, not inferred):** `https://red1oon.github.io/bim-ootb/erp/` serves `sw.js` v810, `erp_i18n.js` with the
#1828 fix, `i18n/fr_FR.json` 225,849 B, `i18n/ar.json` 117,371 B. Headless probe on the live page: login title in all
9 languages ("Kernel-ERP — Anmelden", "… ログイン", "… ล็อกอิน", ar `dir=rtl`), session SO tabs "Entêtes|Ligne(s)",
"الطلب|بند الطلب" (rtl), "ใบสั่งสินค้า|รายการสินค้า", back to "Order|Order Line". Live FIRST switch per locale = 267–503 ms
(network fetch of the pack); cached ≈ 45 ms → the recorder should call `ErpI18n.preload()` once after load.
Side observation (not this lane): after #1828 the live `erp/version.json` is 404 and `erp_i18n.js` is served
un-minified — the legacy `pages build and deployment` run published after `Deploy to GitHub Pages` (the §PZ race);
#1827's deploy served version.json `build=v809 sha=d37c743c`.

### §L7.2 Named, not done
* Process dialogs (parameter labels, process title), report output, info windows, grid lead "Status"/"Posted" headers,
  the System Monitor and the login card's credits/info lines stay English.
* A dirty form switched back to English gets AD English labels (not the curated ones) until it is saved/ignored.
* Deeper menus / other windows than the film surface keep the packs' gaps (ms_MY menu 227/522 visible, ar 245/522).
  Extend `i18n/machine/<lang>.json` (labelled) and rebuild if the film needs more.
* zh_CN uses the 2008 ADempiere pack; the current "99%" iDempiere zh_CN pack (gitee idchina) is private — swap it in
  `fetch_i18n_packs.sh`/`build_i18n.py` SOURCES if access is granted.
