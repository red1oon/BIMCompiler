# S226 — BIM OOTB Localisation (Full Implementation)

# ⚠ DO NOT REMOVE
Scope: _TRL locale system across ALL viewer files + language selector + chart Excel quality.
Read the log after every run.

## Session Startup — Do This First

### 1. Verify rates.js refactor didn't break anything
The prior session (S225b) extracted shared rates from 3 files into `rates.js`.
Before writing new code, verify backward compatibility:
```bash
# Syntax check all refactored files
cd deploy/dev
node -e "var fs=require('fs'); ['rates.js','variation_order.js','nlp.js','boq_charts.html'].forEach(function(f){ try{ if(f.endsWith('.html')){var s=fs.readFileSync(f,'utf8'); var m=s.match(/<script>([\s\S]*?)<\/script>/); if(m) new Function(m[1]);} else new Function(fs.readFileSync(f,'utf8')); console.log('PASS '+f);} catch(e){ console.log('FAIL '+f+': '+e.message);} });"

# Run test harness — must be 65+ PASS, 0 FAIL
node test_all.js 2>&1 | tee /tmp/s226_startup.log
tail -1 /tmp/s226_startup.log  # expect: "XX PASS / 0 FAIL"
```
If any FAIL → fix before proceeding. Do not start locale work on a broken base.

### 2. Verify locale files load
```bash
node -e "var fs=require('fs'); fs.readdirSync('locales').filter(f=>f.endsWith('.js')).forEach(function(f){ try{ new Function(fs.readFileSync('locales/'+f,'utf8')); console.log('PASS '+f); } catch(e){ console.log('FAIL '+f); } });"
# Expect: 15/15 PASS
```

### 3. Read the architecture
- `rates.js` = global RATES/LABOR_RATES/etc. (loaded by all pages)
- `locales/{code}.js` = `_TRL_LOCALE` object (full override: labels + rates + currency)
- `locale_loader.js` = TODO (this session writes it) — merges locale over defaults at runtime
- `boq_charts.html` still has `_TRL_DEFAULTS` inline (Phase 4 extracts it)
- 15 locales: en_MY, en_US, en_GB, en_AU, ms_MY, de_DE, fr_FR, es_ES, zh_CN, th_TH, ja_JP, ko_KR, ar_SA, pt_BR, id_ID

### 4. Testing contract
Every change emits `§`-tagged log lines. The user should NEVER need to open F12 console
or test manually. Your code proves itself. See §DO — Testing & Logging at the bottom.

After EVERY code change:
1. Syntax check changed files
2. Run `node test_all.js` — no regressions
3. Read the log — exit code is not evidence
4. Deploy to OCI dev (one flow, never stop partway)
5. Smoke test via `curl` — verify `§` tags in response, not visual inspection

---

## Prior Session Issues (must fix first)

### Chart Excel quality — log evidence from last test
Last test logs: `~/Downloads/chart_test_5D_*.log`, `chart_test_4D_*.log`

**PIE_ROUND FAIL**: Canvas 1022×533 (ratio 1.917) — `prepareChartsForExcel()` sets `responsive:false` + `ch.resize(800,800)` but Chart.js isn't obeying. Root cause: `ch.resize()` alone doesn't force canvas pixel dimensions when the parent container constrains it. Fix: set `ch.canvas.width = w; ch.canvas.height = h;` directly before `ch.resize(w,h)`.

**LABELS_DARK borderline**: 0.5% threshold too tight — bar[1] scored exactly 0.5% = FAIL. Relax to 0.3%.

**RATIO_MATCH FAIL on all charts**: Image dimensions are now derived from actual canvas, but canvas itself isn't resizing. Same root cause as PIE_ROUND — fix the resize, ratios follow.

**Excel not downloading alongside log**: `_downloadLog()` has 1.5s delay to let Excel go first. Verify this works — if not, attach log as second sheet in Excel instead of separate file.

### Fix checklist
1. [ ] Fix `prepareChartsForExcel()` — set canvas.width/height directly
2. [ ] Relax LABELS_DARK threshold to 0.3%
3. [ ] Test: click 5D → get BOTH .xlsx AND .log → drop .log here
4. [ ] All §CHART_TEST PASS, all §MATHS_VERIFY PASS, all §TRL_VERIFY PASS

---

## Architecture

### _TRL = Project Locale (iDempiere pattern)
Not just language — bundles language + currency + rate source + attribution.

Same language, different locales:
- `en_MY` — English + CIDB rates + RM
- `en_AU` — English + Rawlinsons + AUD
- `en_US` — English + RS Means + USD
- `en_MY_JKR` — English + JKR Schedule of Rates + RM

Override priority (highest wins):
1. URL params — `?cur=USD&rate=4.45&h_labour=Labor`
2. Locale file — `locales/{lang}.js`
3. `_TRL_DEFAULTS` (en_GB base, always present)

### Current state
- `boq_charts.html` — **DONE**: 80+ _TRL keys, `§TRL_VERIFY` + `§MATHS_VERIFY` auto-log
- All other files — **TODO**: hardcoded English strings throughout

---

## Full Audit: Hardcoded Strings Per File

### File 1: `index.html` (viewer/landing — HIGHEST PRIORITY)

**Brand (add `_TRL.source_app`, `_TRL.tagline`):**
| Line | String | _TRL key |
|------|--------|----------|
| 9 | `<title>BIM OOTB v3</title>` | `source_app` |
| 288 | `BIM OOTB v3` (HUD panel) | `source_app` |
| 435 | `BIM OOTB` (splash) | `source_app` |
| 436 | `Frictionless BIM. Two DBs. One browser. Zero install.` | `tagline` |

**Panel titles (add `ui_*` keys):**
| Line | String | _TRL key |
|------|--------|----------|
| 303 | `Tools` | `ui_tools` |
| 333 | `Storeys` | `ui_storeys` |
| 340 | `Disciplines` | `ui_disciplines` |
| 304 | `Filter...` (placeholder) | `ui_filter` |

**Info panel labels:**
| Line | String | _TRL key |
|------|--------|----------|
| 327 | `Storey:` | `h_storey` (reuse) |
| 328 | `Discipline:` | `h_discipline` (reuse) |
| 329 | `Material:` | `h_material` (reuse) |

**Toolbar tooltips (add `ui_tt_*` keys):**
| Line | String | _TRL key |
|------|--------|----------|
| 307 | `X-Ray` | `ui_tt_xray` |
| 308 | `Screenshot` | `ui_tt_screenshot` |
| 309 | `Fullscreen` | `ui_tt_fullscreen` |
| 310 | `Light/Dark` | `ui_tt_theme` |
| 311 | `Fly Around` | `ui_tt_fly` |
| 313 | `4D/5D Export` | `ui_tt_export` |
| 314 | `Issues` | `ui_tt_issues` |
| 315 | `Measure` | `ui_tt_measure` |
| 316 | `Section Cut` | `ui_tt_section` |
| 343 | `Site Camera` | `ui_tt_sitecam` |
| 344 | `Walk Mode` | `ui_tt_walk` |
| 345 | `Voice Search` | `ui_tt_voice` |

**Walk Mode dialog:**
| Line | String | _TRL key |
|------|--------|----------|
| 347 | `Walk Mode` | `ui_walk_title` |
| 348 | `Stand at the building entrance and tap SET...` | `ui_walk_instructions` |
| 349 | `SET` | `ui_walk_set` |
| 350 | `Cancel` | `ui_cancel` |

**Issues panel:**
| Line | String | _TRL key |
|------|--------|----------|
| 353 | `Issues` | `ui_issues_title` |
| 355 | `Export Excel` | `ui_export_excel` |
| 356 | `Clear All` | `ui_clear_all` |
| 360 | `Back` | `ui_back` |
| 362-371 | `Class:`, `Name:`, `GUID:`, `Building:`, `Storey:`, etc. | reuse `h_*` keys |

**Site camera bar:**
| Line | String | _TRL key |
|------|--------|----------|
| 400 | `GPS: acquiring...` | `ui_gps_acquiring` |
| 409-412 | `Arrow`, `Circle`, `Draw`, `Text` | `ui_markup_*` |
| 419 | `Undo` | `ui_undo` |
| 423 | `Retake` | `ui_retake` |
| 424 | `Share → WhatsApp` | `ui_share_whatsapp` |
| 425 | `Save` | `ui_save` |

**Section cut labels:**
| Line | String | _TRL key |
|------|--------|----------|
| 380-382 | `Y ↕`, `X ↔`, `Z ↗` | keep as-is (axis letters are universal) |

---

### File 2: `sitecam.js`

| Line | String | _TRL key |
|------|--------|----------|
| 300 | `BIM OOTB — Site Inspection` | `ui_sitecam_watermark` |
| 43 | `GPS: unavailable` | `ui_gps_unavailable` |
| 99 | `GPS: {error}` | `ui_gps_error` |
| 103 | `GPS: not supported` | `ui_gps_unsupported` |
| 275 | `BIM Model View` | `ui_model_view` |
| 284 | `Bearing:` | `ui_bearing` |
| 113 | `['N','NE','E','SE','S','SW','W','NW']` | keep (compass directions are universal) |

---

### File 3: `walk.js`

| Line | String | _TRL key |
|------|--------|----------|
| 36 | `Walk Mode: No building data` | `ui_walk_no_data` |
| 172 | `Walk Mode: No GPS — orientation only` | `ui_walk_no_gps` |
| 184 | `Drive-Thru: Tap to walk, hold to glide` | `ui_drivethru_hint` |
| 336 | `Walk Mode stopped.` | `ui_walk_stopped` |
| 454 | `Drive-Thru: {n} steps ({m}m)` | `ui_drivethru_status` (template) |
| 553 | `Wall X-Ray: {n} MEP elements behind {name}` | `ui_xray_found` (template) |
| 555 | `Wall X-Ray: No MEP elements found behind {name}` | `ui_xray_none` (template) |

---

### File 4: `nlp.js`

| Line | String | _TRL key |
|------|--------|----------|
| 267 | `'RM ' + cost` | use `fmtCur()` |
| 270-271 | `'RM ' + totalCost + ' (USD ' + usd + ')'` | use `CUR`/`CUR2` |
| 341 | `Show in 3D` | `ui_show_3d` |
| 349 | `Details ({n})` | `ui_details` |
| 399 | `count doors, floor 1 walls, total cost...` (placeholder) | `ui_nlp_placeholder` |
| 428 | `Voice command` (tooltip) | `ui_tt_voice` (reuse) |
| 551 | `No speech detected — tap mic again` | `ui_no_speech` |

---

### File 5: `import.js`

| Line | String | _TRL key |
|------|--------|----------|
| 90 | `Reading file...` | `ui_reading_file` |
| 95 | `Very large file ({n}MB) — may take a few minutes` | `ui_large_file` |
| 123 | `Building databases...` | `ui_building_dbs` |
| 142 | `Imported {n} elements` | `ui_imported` |
| 288 | `Please drop an .ifc file` | `ui_drop_ifc` |

---

### File 6: `city.js`

| Line | String | _TRL key |
|------|--------|----------|
| 13 | `🗑 Clear` | `ui_clear` |
| 128 | `CITY MODE — {n} buildings, {m} elements. Click a building to load.` | `ui_city_mode` |
| 148 | `Flew to {name}` | `ui_flew_to` |
| 168 | `Downloading {name}...` | `ui_downloading` |
| 268 | `CLEARED — {n} meshes removed.` | `ui_cleared` |

---

### File 7: `variation_order.js`

| Line | String | _TRL key |
|------|--------|----------|
| 129 | `CIDB 2024` | `_TRL.rate_source` |
| 148-154 | `Status`, `GUID`, `IFC Class`, `Name`, `Storey`, `Discipline`, `Phase (4D)` | reuse `h_*` |
| 203 | `New element` | `ui_vo_new` |
| 224 | `Existed`, `— (demolished)` | `ui_vo_existed`, `ui_vo_demolished` |
| 278-298 | VO summary section titles and labels | add `vo_*` keys |

---

### File 8: `panels.js`

| Line | String | _TRL key |
|------|--------|----------|
| 26 | `All Storeys` | `ui_all_storeys` |
| 157 | `<> Swipe to show panels` | `ui_swipe_show` |
| 180 | `<> Swipe to hide panels` | `ui_swipe_hide` |

---

### File 9: `main.js`

| Line | String | _TRL key |
|------|--------|----------|
| 103 | `Δ Variance ({n})` | `ui_variance` |

---

### File 10: `boq_charts.html` (remaining items)

| Line | String | _TRL key |
|------|--------|----------|
| 5 | `<title>BIM OOTB — 4D/5D Analytics</title>` | `source_app` |
| 39 | `<h1>BIM OOTB — 4D/5D Analytics</h1>` | `source_app` |
| 580 | `Loading {url}...` | `ui_loading` |
| 601 | `No data.` | `ui_no_data` |
| 1330 | `Generating 5D Excel — preparing charts...` | `ui_gen_5d_prep` |
| 1334 | `Generating 5D Excel...` | `ui_gen_5d` |
| 1793 | `Generating 4D Excel — preparing charts...` | `ui_gen_4d_prep` |
| 1796 | `Generating 4D Excel...` | `ui_gen_4d` |

---

## New _TRL Keys Required

Add these to `_TRL_DEFAULTS` (total ~50 new keys on top of existing 80):

```js
// UI — viewer chrome
tagline:           'Frictionless BIM. Two DBs. One browser. Zero install.',
ui_tools:          'Tools',
ui_storeys:        'Storeys',
ui_disciplines:    'Disciplines',
ui_filter:         'Filter...',
ui_all_storeys:    'All Storeys',

// UI — tooltips
ui_tt_xray:        'X-Ray',
ui_tt_screenshot:  'Screenshot',
ui_tt_fullscreen:  'Fullscreen',
ui_tt_theme:       'Light/Dark',
ui_tt_fly:         'Fly Around',
ui_tt_export:      '4D/5D Export',
ui_tt_issues:      'Issues',
ui_tt_measure:     'Measure',
ui_tt_section:     'Section Cut',
ui_tt_sitecam:     'Site Camera',
ui_tt_walk:        'Walk Mode',
ui_tt_voice:       'Voice Search',

// UI — buttons
ui_cancel:         'Cancel',
ui_back:           'Back',
ui_save:           'Save',
ui_undo:           'Undo',
ui_retake:         'Retake',
ui_clear:          'Clear',
ui_clear_all:      'Clear All',
ui_export_excel:   'Export Excel',
ui_share_whatsapp: 'Share → WhatsApp',
ui_show_3d:        'Show in 3D',

// UI — walk mode
ui_walk_title:     'Walk Mode',
ui_walk_instructions: 'Stand at the building entrance and tap SET to anchor your GPS position to the model.',
ui_walk_set:       'SET',
ui_walk_no_data:   'Walk Mode: No building data',
ui_walk_no_gps:    'Walk Mode: No GPS — orientation only',
ui_walk_stopped:   'Walk Mode stopped.',
ui_drivethru_hint: 'Drive-Thru: Tap to walk, hold to glide',

// UI — site camera
ui_sitecam_watermark: 'BIM OOTB — Site Inspection',
ui_gps_acquiring:  'GPS: acquiring...',
ui_gps_unavailable:'GPS: unavailable',
ui_gps_unsupported:'GPS: not supported',
ui_model_view:     'BIM Model View',
ui_bearing:        'Bearing',
ui_markup_arrow:   'Arrow',
ui_markup_circle:  'Circle',
ui_markup_draw:    'Draw',
ui_markup_text:    'Text',

// UI — import
ui_reading_file:   'Reading file...',
ui_building_dbs:   'Building databases...',
ui_drop_ifc:       'Please drop an .ifc file',

// UI — city
ui_city_mode:      'CITY MODE',
ui_downloading:    'Downloading',
ui_cleared:        'CLEARED',

// UI — NLP
ui_nlp_placeholder:'count doors, floor 1 walls, total cost...',
ui_no_speech:      'No speech detected — tap mic again',

// UI — status
ui_loading:        'Loading',
ui_no_data:        'No data.',
ui_gen_5d:         'Generating 5D Excel...',
ui_gen_4d:         'Generating 4D Excel...',
ui_variance:       'Variance',

// UI — issues
ui_issues_title:   'Issues',

// UI — panels
ui_swipe_show:     'Swipe to show panels',
ui_swipe_hide:     'Swipe to hide panels',

// VO labels
ui_vo_new:         'New element',
ui_vo_existed:     'Existed',
ui_vo_demolished:  '— (demolished)',
```

---

## Implementation Plan

### Phase 0: DONE (S225 session) — Rate extraction + locale files
**Completed:**
- `deploy/dev/rates.js` — single source of truth for RATES, LABOR_RATES, EQUIPMENT_RATES,
  EQUIPMENT_ALLOCATION, SEQUENCE_RULES, DISC_COLORS, PHASE_COLORS, WORK_PACKAGES,
  calcLabor(), calcEquipment(), getRate(), getPhase(), getProductivity()
- `boq_charts.html` — removed ~150 lines of duplicated constants, loads `rates.js`
- `variation_order.js` — removed VO_RATES/VO_PHASES/VO_PRODUCTIVITY (65 lines), uses shared
- `nlp.js` — removed COST_RATES, uses shared getRate()
- `index.html` — loads `rates.js` before nlp.js/diff.js/variation_order.js
- 15 full locale files in `deploy/dev/locales/`:
  `en_MY` (base), `en_US`, `en_GB`, `en_AU`, `ms_MY`, `de_DE`, `fr_FR`, `es_ES`,
  `zh_CN`, `th_TH`, `ja_JP`, `ko_KR`, `ar_SA`, `pt_BR`, `id_ID`
- Each locale = FULL package: labels + currency + rates + labor + equipment + sequences
  (iDempiere AD_Window_Trl pattern — user copies one file, edits what differs)
- ISO 3166-1 `iso` field drives flag emoji at runtime
- Project-level override: copy locale → `MyProject_TRL.js` → edit rates for project

**Architecture:**
```
rates.js              = _RATES_DEFAULTS (runtime globals, loaded by all pages)
locales/{code}.js     = _TRL_LOCALE (full override: labels + rates + currency)
                        loaded by locale_loader, deep-merged over defaults
```

**Override priority (highest wins):**
1. URL params — `?cur=USD&rate=4.45&h_labour=Labor`
2. Project locale — `MyProject_TRL.js`
3. Country locale — `locales/{code}.js`
4. `_TRL_DEFAULTS` (en_MY base in `rates.js`)

### Phase 1: DONE (S226a session) — Locale loader + flag selector + rate JSONs
**Completed:**
- `locale_loader.js` — detects locale (URL param > localStorage > browser lang),
  fetches ONE locale file (lazy load), deep-merges over `_TRL_DEFAULTS`,
  overrides RATES/LABOR_RATES/EQUIPMENT_RATES, caches in localStorage 7 days
- Flag picker popup — 18 locales, current flag highlighted, click=reload
- `data-trl`, `data-trl-title`, `data-trl-placeholder` DOM binding
- `_trl(key, {var})` template string helper
- `bim_ootb_config` localStorage persistence
- 16 country rate JSONs in `deploy/dev/rates/`:
  cidb2024_my, bcis2024_uk, rsmeans2024_us, rawlinsons2024_au, bki2024_de,
  untec2024_fr, cype2024_es, gb50500_cn, dpt2024_th, jbci2024_jp,
  kict2024_kr, aramco2024_sa, sinapi2024_br, sni2024_id, asaqs2024_za, pwd2024_bd
  (each: 50 IFC materials, 10 trades, 6 equipment, sequence, work_packages, provisions)
- `LOCALE_RATE_MAP` in rates.js — maps locale code → rate JSON (auto-loads correct rates)
- `initRateTemplate()` priority: ?rates= > locale mapping > cidb2024_my
- `_syncCur()` — CUR/CUR2/CUR_RATE as `var` (not const) so locale overrides take effect
- Test spec: `26-locale-currency.spec.js` — 6 tests, all PASS
- 🏠 Home + 🌐 Flag buttons on all 4 standalone pages:
  boq_charts.html, mep_report.html, clash_report.html, 2d.html

**Architecture (final):**
```
rates.js              = hardcoded CIDB fallback + LOCALE_RATE_MAP + initRateTemplate()
rates/{region}.json   = full rate template per country (materials+labor+equipment+sequence)
locales/{code}.js     = _TRL_LOCALE (labels + currency + rates + attribution)
locale_loader.js      = detects locale, fetches ONE locale, deep-merges, fires trl-ready
```

### Phase 2: DONE — boq_charts.html (4D/5D)
**Completed:**
- All chart titles, axis labels, legend labels → `_TRL.*`
- BOQ table headers (Disc, IFC Class, Storey, Qty, etc.) → `_TRL.*`
- Summary footer (Building, Elements, Material/Labour/Equipment, Grand Total, Duration) → `_TRL.*`
- Info bar → `_TRL.*`
- Gantt chart height dynamic (scales with task count)
- Waits for `trl-ready` before `init()` — locale merged before render
- MEP button → charts-first layout
- Dual currency display retained in Excel (CUR2 column) for professional BOQ export

### Phase 3: DONE — mep_report.html
**Completed:**
- All labels translated via `_t(key, fallback)` helper
- Chart titles, legend labels, stat cards, table headers, summary rows → `_TRL.*`
- Charts moved above tables (first thing user sees)
- Uses `initRateTemplate()` (locale-aware)
- Waits for `trl-ready` before rendering
- locale_loader.js loaded

### Phase 4: TODO — Viewer JS modules (~30 new _TRL keys needed)
Priority files with remaining hardcoded English strings:
1. **measure.js** — ~15 strings (clash matrix status, measure hints, report generation)
2. **city.js** — ~7 strings (building loaded, unknown building, no DB, etc.)
3. **import.js** — ~5 strings (alert messages: building not found, no DB data)
4. **main.js** — ~4 strings (2D desktop-only, close measure, back online, offline mode)
5. **tools.js** — ~3 strings (select building first, screenshot saved, analytics opened)
6. **walk.js** — DONE (all use _TRL)
7. **nlp.js** — DONE (all use _TRL)
8. **sitecam.js** — mostly done
9. **panels.js** — needs 3 strings
10. **variation_order.js** — mostly done

### Phase 5: TODO — Verify end-to-end
- Load each locale via flag picker on OCI dev
- Verify: currency symbol correct, chart labels translated, rates match country
- Run `26-locale-currency.spec.js` + existing test suite
- No English leaks in non-English locale (leak detection test)
- Rate override: `?lang=en_US` → USD rates in Excel, $ in charts

---

## Landing Page Flag Selector

Top-right toolbar, same row as existing buttons:
```html
<div class="lang-selector">
  <span data-lang="en_GB" title="English (UK)">🇬🇧</span>
  <span data-lang="en_US" title="English (US)">🇺🇸</span>
  <span data-lang="ms_MY" title="Bahasa Melayu">🇲🇾</span>
  <span data-lang="zh_CN" title="简体中文">🇨🇳</span>
  <span data-lang="th_TH" title="ภาษาไทย">🇹🇭</span>
  <span data-lang="de_DE" title="Deutsch">🇩🇪</span>
  <span data-lang="fr_FR" title="Français">🇫🇷</span>
  <span data-lang="es_ES" title="Español">🇪🇸</span>
</div>
```

Click handler:
```js
document.querySelectorAll('.lang-selector span').forEach(function(el) {
  el.onclick = function() {
    localStorage.setItem('bim_ootb_lang', el.dataset.lang);
    location.reload();
  };
});
```
Active flag: `border: 2px solid #4fc3f7; border-radius: 4px;`

---

## Target Locales

### _TRL = Project Locale (not just language)
| Code | Language | Flag | Currency | Rate Source |
|------|----------|------|----------|-------------|
| `en_GB` | English (UK) | 🇬🇧 | RM / USD | CIDB Malaysia 2024 (base) |
| `en_US` | English (US) | 🇺🇸 | USD / RM | RS Means 2024 |
| `ms_MY` | Bahasa Melayu | 🇲🇾 | RM / USD | CIDB Malaysia 2024 |
| `zh_CN` | 简体中文 | 🇨🇳 | ¥ / USD | GB/T 50500-2013 |
| `th_TH` | ภาษาไทย | 🇹🇭 | ฿ / USD | BOQ Thailand Standard |
| `de_DE` | Deutsch | 🇩🇪 | € / USD | DIN 276 / BKI |
| `fr_FR` | Français | 🇫🇷 | € / USD | Bordereau UNTEC |
| `es_ES` | Español | 🇪🇸 | € / USD | Base de Precios CYPE |

### Future
| `ja_JP` | 日本語 | 🇯🇵 | ¥ / USD | JBCI Cost Index |
| `ko_KR` | 한국어 | 🇰🇷 | ₩ / USD | KICT Standard |
| `ar_SA` | العربية | 🇸🇦 | ﷼ / USD | Saudi Aramco Rates |
| `pt_BR` | Português | 🇧🇷 | R$ / USD | SINAPI/TCPO |
| `id_ID` | Bahasa Indonesia | 🇮🇩 | Rp / USD | SNI BOQ Standard |
| `en_AU` | English (AU) | 🇦🇺 | AUD / USD | Rawlinsons 2024 |
| `en_MY_JKR` | English (MY-JKR) | 🇲🇾 | RM / USD | JKR Schedule of Rates |

---

## Sample Locale: `ms_MY.js`

```js
var _TRL_LOCALE = {
  cur: 'RM', cur2: 'USD', cur_rate: 4.45,
  cur_name: 'Ringgit Malaysia', cur2_name: 'Dolar AS',
  rate_source: 'CIDB Malaysia 2024 / Buku Kos BCISM',
  rate_mat_source: 'Pusat Kos Pembinaan Kebangsaan CIDB (N3C) 2024',
  rate_lab_source: 'Kaji Selidik Upah Buruh MBAM-CIDB 2024',
  rate_eq_source: 'Kadar Sewa Jentera CIDB N3C 2024',

  h_discipline: 'Disiplin', h_ifc_class: 'Kelas IFC',
  h_quantity: 'Kuantiti', h_uom: 'Unit', h_description: 'Penerangan',
  h_storey: 'Tingkat', h_phase: 'Fasa', h_item: 'Item',
  h_material: 'Bahan', h_labour: 'Buruh', h_equipment: 'Peralatan',
  h_total: 'Jumlah', h_unit_rate: 'Kadar Unit',
  h_grand_total: 'JUMLAH BESAR', h_subtotal: 'SUBJUMLAH',
  h_trade: 'Tred', h_crew_size: 'Saiz Kru',
  h_man_days: 'Hari-Orang', h_duration: 'Tempoh (hari)',
  h_task_name: 'Nama Tugas', h_start_date: 'Tarikh Mula',
  h_finish_date: 'Tarikh Siap', h_status: 'Status',

  t_cost_by_disc: '5D — Kos Mengikut Disiplin',
  t_cost_components: 'Komponen Kos Mengikut Disiplin',
  t_phase_duration: '4D — Tempoh Fasa (Jumlah Hari)',
  t_milestone: '4D — Garis Masa Pencapaian',
  t_gantt: '4D — Garis Masa Gantt (Tugas Strategik)',

  s_cover: 'Muka Depan', s_exec_summary: 'Ringkasan Eksekutif',
  s_material: 'Ringkasan Bahan', s_labour: 'Ringkasan Buruh',

  not_started: 'Belum Dimulakan',

  // UI
  tagline: 'BIM Tanpa Geseran. Dua DB. Satu Pelayar. Tanpa Pemasangan.',
  ui_tools: 'Alatan', ui_storeys: 'Tingkat', ui_disciplines: 'Disiplin',
  ui_filter: 'Tapis...', ui_all_storeys: 'Semua Tingkat',
  ui_cancel: 'Batal', ui_back: 'Kembali', ui_save: 'Simpan',
  ui_clear_all: 'Padam Semua', ui_export_excel: 'Eksport Excel',
  ui_walk_title: 'Mod Jalan', ui_walk_stopped: 'Mod Jalan dihentikan.',
  ui_drop_ifc: 'Sila lepaskan fail .ifc',
  ui_loading: 'Memuatkan', ui_no_data: 'Tiada data.',
};
```

---

## Translation Rules
- Technical terms (IFC, BIM, WBS, BOQ, BOM, GPS, MEP) stay in English — ISO standards
- `5D —` and `4D —` prefixes stay — nD dimension codes, not English
- Currency symbols and rates change per locale
- Rate source must reference the actual local rate book for that country
- Phase names (Substructure, Superstructure, etc.) translate
- `source_app` stays as `BIM OOTB — Frictionless BIM` (brand name, untranslated)
- Compass directions (N, S, E, W) stay — universal
- Axis labels (X, Y, Z) stay — universal

## DO — Testing & Logging

All test output goes to `deploy/dev/tests/log/` with timestamped filenames.
```bash
mkdir -p deploy/dev/tests/log
npx playwright test --reporter=line 2>&1 | tee deploy/dev/tests/log/pw_$(date +%Y%m%d_%H%M%S).log
node deploy/dev/test_all.js 2>&1 | tee deploy/dev/tests/log/test_all_$(date +%Y%m%d_%H%M%S).log
```

### Layer 1: Static hardcode scan (test_all.js §16 — no browser)

Grep source files for known English strings that must be `_TRL.*` keys.
Runs at commit time, instant, zero false positives.

Add to `deploy/dev/test_all.js` as §16:
```javascript
// ═══ 16. Localisation — Hardcoded String Scan ═══
// Issue: every user-visible string must use _TRL.*, not hardcoded English
console.log('\n═══ 16. Localisation — Hardcoded String Scan ═══');

// Strings that MUST be _TRL keys (from S226 audit).
// Each entry: [regex, files to scan, _TRL key it should use]
const HARDCODED = [
  // Panel titles (index.html)
  [/>Tools</, ['index.html'], 'ui_tools'],
  [/>Storeys</, ['index.html'], 'ui_storeys'],
  [/>Disciplines</, ['index.html'], 'ui_disciplines'],
  [/placeholder="Filter/, ['index.html'], 'ui_filter'],
  [/>All Storeys</, ['panels.js'], 'ui_all_storeys'],
  // Buttons
  [/>Export Excel</, ['index.html'], 'ui_export_excel'],
  [/>Clear All</, ['index.html'], 'ui_clear_all'],
  [/>Back</, ['index.html'], 'ui_back'],
  [/>Save</, ['index.html'], 'ui_save'],
  [/>Undo</, ['index.html'], 'ui_undo'],
  // Walk mode
  [/'Walk Mode: No building data'/, ['walk.js'], 'ui_walk_no_data'],
  [/'Walk Mode stopped/, ['walk.js'], 'ui_walk_stopped'],
  // Site camera
  [/'GPS: acquiring/, ['index.html','sitecam.js'], 'ui_gps_acquiring'],
  [/'GPS: unavailable/, ['sitecam.js'], 'ui_gps_unavailable'],
  // NLP
  [/'RM '/, ['nlp.js'], 'use fmtCur()'],
  // Import
  [/'Reading file/, ['import.js'], 'ui_reading_file'],
  [/'Building databases/, ['import.js'], 'ui_building_dbs'],
  // City
  [/'CITY MODE/, ['city.js'], 'ui_city_mode'],
  [/'CLEARED/, ['city.js'], 'ui_cleared'],
];

let trlPass = 0, trlFail = 0;
for (const [regex, files, key] of HARDCODED) {
  for (const f of files) {
    const fp = path.join(DIR, f);
    if (!fs.existsSync(fp)) continue;
    const src = fs.readFileSync(fp, 'utf8');
    const found = regex.test(src);
    if (found) {
      trlFail++;
      console.log(`  ✗ ${f}: hardcoded ${regex} — should be _TRL.${key}`);
    } else {
      trlPass++;
    }
  }
}
ok(`hardcode scan: ${trlPass} clean`, trlFail === 0,
   `${trlFail} hardcoded strings remain (see above)`);

// Verify all locale files parse
const localeDir = path.join(DIR, 'locales');
if (fs.existsSync(localeDir)) {
  const locales = fs.readdirSync(localeDir).filter(f => f.endsWith('.js'));
  for (const lf of locales) {
    try {
      new Function(fs.readFileSync(path.join(localeDir, lf), 'utf8'));
      ok(`locale ${lf} syntax`, true);
    } catch(e) {
      ok(`locale ${lf} syntax`, false, e.message);
    }
  }
  ok(`locale file count (${locales.length})`, locales.length >= 15,
     `expected 15+, got ${locales.length}`);
} else {
  ok('locales/ directory', false, 'not found');
}

// Verify _TRL key coverage: locale files should define all ui_* keys
// that _TRL_DEFAULTS defines
if (fs.existsSync(path.join(DIR, 'rates.js'))) {
  const ratesSrc = fs.readFileSync(path.join(DIR, 'rates.js'), 'utf8');
  const defaultKeys = (ratesSrc.match(/\b(ui_\w+|h_\w+|t_\w+|s_\w+)\s*:/g) || [])
    .map(k => k.replace(/\s*:/, ''));
  if (defaultKeys.length > 0) {
    console.log(`  _TRL_DEFAULTS defines ${defaultKeys.length} translatable keys`);
    // Spot-check one non-English locale for coverage
    const msPath = path.join(localeDir, 'ms_MY.js');
    if (fs.existsSync(msPath)) {
      const msSrc = fs.readFileSync(msPath, 'utf8');
      const msKeys = (msSrc.match(/\b(ui_\w+|h_\w+|t_\w+|s_\w+)\s*:/g) || [])
        .map(k => k.replace(/\s*:/, ''));
      const missing = defaultKeys.filter(k => !msKeys.includes(k));
      ok(`ms_MY covers ${msKeys.length}/${defaultKeys.length} keys`,
         missing.length === 0,
         `missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
    }
  }
}
```

This section is the **gate**: until hardcoded strings are replaced with `_TRL.*`,
§16 FAIL count shows exactly how many remain. As each file is localised, the
count drops. Zero = done.

### Layer 2: Runtime locale swap (Playwright `11-localisation.spec.js`)

Requires `locale_loader.js` to exist (Phase 1). Tests:

| Test | What | §-tag |
|------|------|-------|
| 11.1 Locale loader exists | `locale_loader.js` loaded by viewer | `§PW_TRL_LOADER` |
| 11.2 Default locale (en) renders | Load viewer, verify English labels present | `§PW_TRL_DEFAULT` |
| 11.3 Malay locale swap | `?lang=ms_MY` → panel titles in Malay, no "Tools"/"Storeys" | `§PW_TRL_MS_MY` |
| 11.4 Currency follows locale | `?lang=en_US` → boq_charts shows `$` not `RM` | `§PW_TRL_CUR` |
| 11.5 No English leak in non-English locale | `?lang=de_DE` → scan visible text for leaked English panel/button labels | `§PW_TRL_NO_LEAK` |
| 11.6 _TRL key coverage | Count `_TRL.*` accesses in JS vs keys in locale file | `§PW_TRL_COVERAGE` |
| 11.7 URL param override | `?lang=ms_MY&cur=USD` → currency overrides locale | `§PW_TRL_OVERRIDE` |
| 11.8 localStorage persistence | Set lang, reload, verify same locale loads | `§PW_TRL_PERSIST` |
| 11.9 Flag selector visible | Toolbar shows flag emoji selector | `§PW_TRL_FLAGS` |

**Leak detection (11.5)** — the money test:
```javascript
// Known English strings that MUST NOT appear when locale != en_*
const ENGLISH_LEAKS = [
  'Tools', 'Storeys', 'Disciplines', 'Filter...', 'All Storeys',
  'Export Excel', 'Clear All', 'Walk Mode', 'Site Camera',
  'Voice Search', 'Screenshot', 'Fullscreen', 'Light/Dark',
  'Fly Around', 'Section Cut', 'Issues', 'Measure',
  'GPS: acquiring', 'Reading file', 'Building databases',
];
// Scan all visible text nodes
const leaked = await page.evaluate((leaks) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const found = [];
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent.trim();
    const p = walker.currentNode.parentElement;
    if (!p || getComputedStyle(p).display === 'none') continue;
    for (const leak of leaks) {
      if (t.includes(leak)) found.push({ text: t.substring(0,40), leak });
    }
  }
  return found;
}, ENGLISH_LEAKS);
```

### Relationship between layers

| | Static (§16) | Runtime (Playwright §11) |
|---|---|---|
| **When** | Every commit, no browser | After locale_loader exists |
| **Catches** | Hardcoded strings in source | Dynamically built text, innerHTML |
| **Speed** | <1s | ~30s per locale |
| **Gate** | Blocks localisation "done" claim | Blocks deploy of locale feature |

Static scan runs first. When §16 shows 0 hardcoded strings, runtime tests
verify the replacement actually works at render time.

### `§` tags for this section
- **`§TRL_VERIFY`** — after locale load: TRL_COMPLETE (all keys present), TRL_CUR_MATCH (currency matches locale), TRL_RATE_SOURCE (attribution matches), TRL_NO_HARDCODE (no RM/USD leaks)
- **`§MATHS_VERIFY`** — after Excel save: MATHS_MAT_SUM, MATHS_GRAND, MATHS_CUR_CONV (currency conversion correct)
- **`§TRL_LOADED`** — when locale_loader merges a locale file (code, key count)
- **`§TRL_STATIC_SCAN`** — test_all.js §16 result: `clean=N fail=M`
- **Run `node -e "new Function(fs.readFileSync(f,'utf8'))"` syntax check** on every changed .js file
- **Run existing test harness** (`node test_all.js`) — 65 PASS minimum, no regressions
- **White-box results go in `deploy/dev/tests/log/`**, not in the user's browser console. If a `§` tag is missing for a claim, add the tag first, rerun, then claim.
- **Deploy flow is ONE flow**: edit → syntax check → verify `§` tags → save log → upload to dev → smoke test → confirm. Never stop partway or ask user to check.

## DO NOT
- Do not translate IFC class names (IfcWall, IfcBeam) — ISO 16739
- Do not change rate VALUES — rates are engineering data, not translation
- Do not change RATES, LABOR_RATES, EQUIPMENT_RATES objects in rates.js directly — locale overrides at runtime
- Do not create one huge file — one small .js per locale, override only what differs
- Do not touch `_TRL_DEFAULTS` when adding languages — it is the base
- Do not hardcode any user-visible string directly in HTML or JS — always `_TRL.*`
- Do not ask the user to test manually — your code must emit `§`-tagged proof
- Do not claim something works without a log line proving it
- Do not write test output to `/tmp/` — use `deploy/dev/tests/log/` with timestamps

---

## §RESUME 2026-10-03 — reopened (was wrongly filed under `prompts/done/`)

**Why:** the ERP tech trailer (`prompts/FILM_NARRATION.md` §7) switches to English when it reaches the Viewer
("Viewer i18n incomplete"). Phase 4 and Phase 5 above were never done. The code now lives in **bim-ootb `viewer/`**
(not `deploy/dev/`); every path below is bim-ootb.

### §R0 Measured state (bim-ootb origin/main `90eb2bf8`, sw v811)
- 18 locales in `viewer/locales/*.js`, 334 keys each (en_MY, ms_MY, zh_CN, ar_SA counted).
- `locale_loader.js` (LOCALE_VERSION 6) is loaded by `viewer/viewer.html`, `viewer/boq_charts.html`,
  `viewer/clash_report.html`, `viewer/mep_report.html`, landing `index.html`.
- 22 of 513 viewer JS files reference `_TRL` (city, clash_matrix, clash_report, clash_snag, diff, export_4d,
  export_5d, find_ask, import, locale_loader, main, measure, navigate_engine, navigate_find, nlp, panels, rates,
  sitecam, streaming, tools, variation_order, walk).
- **Two disconnected language systems.** The ERP (`erp/erp_i18n.js`, `ErpI18n.lang`, 9 codes: en_US fr_FR es_ES
  de_DE ar zh_CN ja_JP ms_MY th_TH) keeps its choice under its own localStorage key. The Viewer reads `?lang=` →
  `bim_ootb_config.locale` → `navigator.language`. **Zoom Across (`erp/idempiere.html` launch for `viewer` and
  `timemachine`) passes no language**, so the Viewer opens in its own default whatever the ERP shows.
- `detectLocale()` accepts `?lang=` only as an EXACT Viewer code. ERP `ar` is not one (Viewer has `ar_SA`), so even
  a passed `ar` would be ignored. The other 8 ERP codes match Viewer codes exactly.

### §R1 SPEC — the ERP language carries into the Viewer (Witness: W-ZOOM-LANG)
1. **ERP side** (`erp/idempiere.html`, both Zoom Across launches): append `&lang=<ErpI18n.lang>` to the Viewer URL
   when `window.ErpI18n` and its `lang` exist. Nothing else in the URL changes. `§ZOOM-ACROSS launch` already prints
   the URL, so the code appears in the existing log line.
2. **Viewer side** (`viewer/locale_loader.js` `detectLocale()`): a `?lang=` that is not an exact Viewer code is
   resolved through the loader's OWN existing `LOCALE_MAP` (try `code` with `_`→`-`, then the language prefix).
   No new mapping table — `ar` → `ar_SA` is already in `LOCALE_MAP`. An unresolvable code falls through to the old
   order (saved → browser → fallback), as before.
2b. **The Viewer's own picker keeps working** (red1, 2026-10-03: "Viewer has its main pages able to change languages").
   The flag grid (`toggleFlagPicker`, opened from landing `index.html` `openFlags()`, `boq_charts.html`/`clash_report.html`
   `#header-flag-btn`) saves `bim_ootb_config.locale` and reloads. A URL `?lang=` outranks the saved choice, so in a tab
   opened by Zoom Across the click would reload into the ERP language again — dead button. Fix: the click also rewrites
   `lang=` in the URL to the picked code (`history.replaceState`) before the reload. The ERP code is NOT written into
   `bim_ootb_config` — it rides in the URL for that tab only; the user's saved Viewer choice is untouched.
3. **Log:** `§TRL_DETECT src=url|url-mapped|saved|browser|fallback req=<raw ?lang or -> code=<chosen>` once per load.
4. **Witness W-ZOOM-LANG** (`erp/tests/witness_zoom_lang.js`, no browser — the two pieces are pure functions):
   - Issue it proves: *"the Viewer opens in a different language from the ERP that launched it."*
   - (a) For each of the 9 codes in `erp/i18n/index.json`, the launch URL built by `idempiere.html` contains
     `lang=<code>` — read from the real source, the URL-building lines exercised with a stub `ErpI18n`.
   - (b) For each of the 9 codes, the real `locale_loader.js` `detectLocale()` (run in a stubbed window with
     `?lang=<code>`) picks a Viewer locale whose language prefix equals the ERP code's, with `src=url` or `url-mapped`.
   - (b2) Picker: with `?lang=ar` in the URL, a flag click for `de_DE` leaves the URL at `lang=de_DE` and the next
     `detectLocale()` returns `de_DE` — proves the picker is not overridden by the ERP hand-off.
   - (c) Negative control: with the §R1.2 change reverted (exact-match only) `ar` must FAIL — proves (b) can fail.
   - Verdict prints INCONCLUSIVE if 0 codes were read from `index.json`.
5. **Not in §R1:** translating Viewer strings (that is §R2). After §R1 the Viewer's *existing* `_TRL` labels follow the
   ERP; the hardcoded English stays until §R2.

### §R2 NEXT — leak scan on the trailer's Viewer screens, then translate those only
Count hardcoded English on the screens the tech trailer shows (Viewer open on Hospital with `find=IfcWall`, Find
panel, cost line). Translate for the 9 ERP languages; witness = 0 English leaks on those screens per language.
**§R2 FORMAT RULE — iDempiere convention (red1, 2026-10-03: "we follow idempiere convention where lingo/locales are
stored in XML. Maintain the same original format. Been idempiere like is vital where applicable").**
- The Viewer's translatable strings are **AD_Message** entries: `Value` = the key, `MsgText` = the English shown today.
- Each language's translations are kept as **`AD_Message_Trl_<lang>.xml` in the exact `org.compiere.install.Translation`
  export format**, copied from a real pack (`~/.cache/erp_trl/gq/es_CO/AD_Message_Trl_es_CO.xml`):
  `<idempiereTrl language="<lang>" table="AD_Message">` → `<row id="<AD_Message_ID>" trl="Y">` →
  `<value column="MsgText" original="<English>">…</value>` + `<value column="MsgTip" original=""/>`.
  Ids for app-own messages sit above 999999 (`MTable.MAX_OFFICIAL_ID`, the export's own bound for non-official rows).
- The XML is the source that gets edited and versioned. Anything the page loads at runtime (JSON, as the ERP does today)
  is BUILT from it, the way iDempiere loads XML into its `_Trl` tables — never hand-edited.
- The existing 18 `viewer/locales/*.js` packs hold labels + rates + currency together. §R2 moves only the LABELS to the
  XML; rates/currency stay where they are (they are cost data, not language — S226 §DO NOT).
- Note on the ERP lane (not changed here): it reads iDempiere XML packs but its labelled machine supplement
  `erp/i18n/machine/<lang>.json` is a flat `{English: translation}` JSON, not the XML format. Bringing it into the same
  XML form belongs to `prompts/ERP_UI_LOCALES.md`.
### §R3 LATER — Phase 4 file list above (measure/city/import/main/tools/panels), Phase 5, open issues I-1, I-5.
