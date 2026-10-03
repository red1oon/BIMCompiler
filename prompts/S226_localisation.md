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
   when `window.ErpI18n.lang` exists AND differs from `ErpI18n.BASE` (en_US). A Viewer locale also carries currency +
   rate book, so the ERP default must not override the Viewer user's saved locale (found in the first run: every
   launch carried `lang=en_US` → US rates in $). Nothing else in the URL changes. `§ZOOM-ACROSS launch` already prints
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

### §R1 RESULT — 2026-10-03
bim-ootb branch `feat/zoom-lang` (erp sw v812, viewer sw v1460). W-ZOOM-LANG `erp/tests/witness_zoom_lang.js` **PASS 14/0**:
(a) 8/8 chosen ERP languages ride in both Zoom Across URLs, none on base en_US; (b) Viewer picks the same language
9/9 (`§TRL_DETECT src=url-mapped req=ar code=ar_SA`); (b2) flag picker wins after reload; (c) control without §R1.2 →
8/9, fails on `ar`. Regression W-ZOOM-ACROSS 8/8. **Open, by design of the existing Viewer:** choosing a language there
also chooses its currency/rate book (S226 §Current Status) — German ERP → Viewer in EUR/DIN rates.

### §R2 SPEC — 2026-10-03 — Viewer strings as iDempiere AD_Message / AD_Message_Trl XML, language set on the landing page carries through (Witness: W-VIEWER-I18N)
**The ask (red1, 2026-10-03, verbatim):** "update the languages populating all labels and pop up or important most static
info as the rest may change and so can be later. This is to set language during Viewer main landing page and it should
carry thru." Format rule = §R2 FORMAT RULE above ("we follow idempiere convention where lingo/locales are stored in XML").
**Measured before (bim-ootb `4cd440ae`, viewer sw v1460):** 18 `viewer/locales/*.js`, 334 keys each = 308 label strings +
20 identity/currency/rate-attribution strings + 6 rate objects. The label translations are INCOMPLETE: keys equal to the
English in ms_MY 12, es_ES 28, zh_CN 29, fr_FR 33, de_DE 35, pt_BR 50, id_ID/ko_KR 53, th_TH 51, ja_JP 52, ar_SA/af_ZA 58,
bn_BD 59, bl_BD 88 (the whole "Phase 4" block `ui_index_ready…ui_no_elements_bld` + `mep_*` was copied as English into
every non-English pack). en_US differs from en_MY on 1 label (`t_lab_summary`), en_GB/en_AU on 0. Hardcoded English still
on screen: landing `index.html` (8 launcher names, hub headings/drop text/cards, confirm dialog, Morpheus tips, toast),
`viewer.html` (`Grid Bays`, `Share` with a `data-trl="ui_share"` key that does not exist, 6 titles, SW toast), the ⋯ pill
(38 action names via `PillBuilder` `btn.title`), `panels.js` role presets + settings panel, `main.js`/`tools.js`/
`navigate_find.js` status + title strings, `boq_charts.html` (h1, 5 titles, subtitle states, `Site Resources`, BOQ h2),
`clash_report.html` (~30: toolbar, stat cards, 7 chart h2, 8 table th, share dialog), `mep_report.html` (3 titles,
`Loading...`). `<html lang="en">` fixed on all 5 pages, no `dir`.

**R2.1 Files (iDempiere layout, under `bim-ootb/viewer/i18n/`).**
| file | role | edited by hand? |
|---|---|---|
| `ad_message_base.csv` | the AD_Message base rows: `ad_message_id,value,msgtext,msgtype` — the SAME four columns as the real iDempiere-12 export this repo already uses for the ERP (`~/.cache/erp_trl/ad_message_base.csv`, written by `erp/tools/fetch_i18n_packs.sh`). `value` = the existing `_TRL` key (unchanged, so the 22 `_TRL.*`/`_trl()` callers keep working), `msgtext` = the English shown today, byte-identical. IDs start at **1000000** (`MTable.MAX_OFFICIAL_ID`+1), assigned once in en_MY.js key order then appended; an ID is never renumbered (iDempiere's join key). `msgtype` I, or E for failure messages. | YES (add a row = add a string) |
| `AD_Message_Trl_<lang>.xml` ×17 (every locale except the base en_MY) | the translations, in the exact `org.compiere.install.Translation` export format copied from `~/.cache/erp_trl/gq/es_CO/AD_Message_Trl_es_CO.xml`: `<?xml … standalone="no"?>`, one provenance comment + the commented DTD line, `<idempiereTrl language="<lang>" table="AD_Message">`, `<row id="<id>" trl="Y|N">`, `<value column="MsgText" original="<English>">…</value>`, `<value column="MsgTip" original=""/>`. Every base id is present in every file; `trl="N"` = not translated (text = English, counted apart, never claimed), `trl="Y"` = a translation (also when the word is legitimately the same, e.g. de `Status`). The header comment names the source per id range: rows 1000000–1000307 `source=viewer/locales/<lang>.js (S225/S226 sessions, machine)`; new rows and gap fills `source=machine (Claude, 2026-10-03)` — the same labelling the ERP lane uses (ERP_UI_LOCALES.md §L2b). | YES — this is THE source |
| `<code>.json` ×18 | runtime labels, flat `{value: text}` (+ `_meta`: built-from, counts), BUILT by `viewer/tools/build_trl.js` = CSV ⋈ XML by id; a `trl="N"` row yields the English. Precached by `viewer/sw.js`. | NEVER |
| `viewer/tools/build_trl.js` | the builder (node, deterministic, prints `§TRL_BUILD lang=<l> rows=<n> trl=<y> same=<n> missing=<n>` per locale). Run after every XML/CSV edit. | — |
| `viewer/tools/trl_migrate_2026-10-03.js` | ONE-SHOT migration: extracts the 308 labels from the 18 `locales/*.js` into CSV + XML (no retranslation), appends the 2026-10-03 machine batch (new keys + gap fills), strips the label keys from `locales/*.js`. Refuses to run when `viewer/i18n/*.xml` already exist — the XML is the source from then on; this file is its birth record. | — |
| `viewer/locales/<code>.js` ×18 | keep ONLY `iso lang locale`, `cur cur2 cur_rate cur_name cur2_name`, the 12 `rate_*` attribution strings and the 6 rate objects — cost data, not language (S226 §DO NOT). | yes (rates) |

**Why the base English lives in a CSV, not an XML (decision + reason).** In iDempiere the base language has NO `_Trl` rows:
`Translation.exportTrl` on the base language emits a degenerate file (every row `trl="N"`, `original` == text) and carries no
`Value` column, so a `AD_Message_Trl_en_US.xml` could not even tell the runtime which key a row is — the ERP lane hit exactly
this and had to export `ad_message_base.csv` from the live iDempiere 12 to map id→Value (§L1 "Messages"). The base rows are the
AD_Message TABLE; the CSV is that table in the one export shape this repo already holds from a real iDempiere. Rejected: a
2Pack `PackOut.xml` (iDempiere's base-row distribution format — not in the cache, would have to be invented from memory,
breaks PRIME RULE), a `migration/*.sql` INSERT script (iDempiere's own delivery form, but the Viewer has no AD database to
run it against; the ERP keeps `ad_seed.db`, the Viewer does not).
**Why the page loads a BUILT JSON and not the XML (decision + reason).** The runtime needs Value→text; the XML keys rows by
id (iDempiere's rule, `TranslationHandler`), so a join with the CSV is required anyway — do it once, at build, as iDempiere
loads XML into `_Trl` tables once at import and never parses XML at request time. Same path as the ERP (`erp/i18n/<lang>.json`
from `build_i18n.py`). The JSON is 1 precacheable file per locale, no DOMParser on a 100-script page. Staleness is a
witness assertion, not a hope: W-VIEWER-I18N rebuilds in memory and FAILS if any shipped JSON ≠ CSV⋈XML.

**R2.2 Loading path (`viewer/locale_loader.js`).**
1. `detectLocale()` — unchanged §R1 order (url > url-mapped > saved `bim_ootb_config.locale` > browser > en_MY), `§TRL_DETECT`.
2. Labels: fetch `i18n/<code>.json` (localStorage cache key `bim_ootb_trl_<code>`, `LOCALE_VERSION` 6→7 invalidates the old
   per-code caches). Rates: fetch `locales/<code>.js` as today. Both resolved → `deepMerge(_TRL, labels)` then
   `deepMerge(_TRL, rates)` (the .js no longer carries labels; cost data wins only on cost keys), `applyRateOverrides`,
   `applyUrlOverrides`. Log `§TRL_LABELS locale=<code> keys=<n> src=cached|fetched|fallback` beside the existing `§TRL_LOADED`.
3. `applyTrlToDOM()` gains `data-trl-html` (innerHTML, for the few strings with inline markup) and sets
   `document.documentElement.lang = <iso-639 of the code>` + `dir="rtl"` for `ar_SA` (ltr otherwise) — on every page that
   loads the loader (landing + the 4 viewer pages). `window._trl(key, repl, dflt)` gains a 3rd arg = the English default,
   so JS-built UI shows English until the labels land, never the raw key.
4. JS-built UI (landing launchers/hub, the ⋯ pill, role presets) renders through `_trl()` and re-labels on `trl-ready`
   (`PillBuilder` re-`build()`), so a first visit without a label cache ends in the chosen language too.
5. The flag picker is unchanged (saves `bim_ootb_config.locale`, §R1.2b URL rewrite). That saved value is what every Viewer
   page reads → "set on the landing page, carries through". The landing `index.html` already loads the loader and already
   has the Language launcher (`openFlags()`); its own strings are now `data-trl`/`_trl()` so the landing itself is in the
   chosen language after the reload.

**R2.3 Scope (translated now) / skipped (may change, said so).**
IN: landing (Morpheus tips, blue-end quote + back, `choose your door`, `Live Stats`, hub heading/sub/drop text/cards/
`City buildings`/`Landmark buildings`/`Blank Viewer`/`Open your own .db file`/`loading…`/`reload`, 8 launcher names, `More`,
mobile toast, Clear-cache confirm, `No DB for`), `viewer.html` statics (`Grid Bays`, `Share`, `Min/Max`, `Menu`, `Previous/Next
phase`, bookmark titles, `Update ready — tap to refresh`, `Report Bug`), ⋯ pill 38 action names + 3 drawer masters, role
presets (5), settings panel (`5D Rate Pack`, `Cache Info`, `Reset Pill Icons`, `Defaults restored`), ground presets
(None/Grass/Earth/Paved), `Off`/`On — {n} fixtures`, Find panel (`Find`/`Ask`/`Save .xlsx`/`Clear`/`All Storeys`/`All Types`/
`View back`/`View forward`/`Expand`/`Voice not supported`), `main.js` status (`Loading Find…`, `Find failed to load`, GPU shader
lines, `OFFLINE`, wire the existing `ui_back_online`/`ui_offline_mode`/`ui_close_measure`), `boq_charts.html` (h1 suffix
`4D/5D Analytics`, 5 titles, `Loading...`, `Requesting data from viewer...`, `Waiting for DB to cache in main scene...`,
`Site Resources`, `5D — Bill of Quantities`, the existing `ui_tt_export_5d/4d`), `clash_report.html` (all ~30),
`mep_report.html` (`Copy shareable link`, `Back`, `Loading...`, share dialog). Plus the GAP FILL: every `trl="N"` row of the
308 existing keys gets a translation in all 17 non-English locales.
OUT (named): building names, IFC classes, discipline codes, numbers, user content (dynamic data); `<title>` brand strings
(`BIM / ERP OOTB`, `BIM OOTB v3 — DEV`); the ⋯ pill's `children` help descriptions and the F1 command palette (feature help
text under active change — "the rest may change"); Time Machine / Gantt editor / 4D window / CPE cinema / HBA / Pick-Walk
panel internals (lanes under active development, same reason); doc-mode pill titles (S266 niche); `Alt+S/P/C` cinema
titles; IFC class names, nD codes, BIM/BOQ/MEP/IFC/GPS/WBS/UOM/GUID/CSV/DXF acronyms, units, axis letters, the brand.

**R2.4 Witness W-VIEWER-I18N — `bim-ootb/viewer/tests/witness_viewer_i18n.js`** (Playwright chromium, `--disable-gpu` software
GL only, serves the worktree root on a local port; logs `viewer/tests/logs/witness_viewer_i18n.log` + `.page.log`).
ISSUE IT PROVES OR DISPROVES: *"a user who picks a language on the landing page still sees English on Viewer screens."*
1. CARRY-THROUGH — on `index.html` call the real `_TRL_LOADER.openFlagPicker()` and click the `<code>` button (the real
   handler saves `bim_ootb_config.locale` and reloads); then open `viewer/viewer.html?blank=1&ghost=1`, `boq_charts.html`,
   `clash_report.html`, `mep_report.html` in the same context: each must log `§TRL_DETECT src=saved req=- code=<code>` and
   `§TRL_LABELS locale=<code>`, and have `<html lang>` = the language (+ `dir=rtl` for ar_SA).
2. LEAK COUNT — per page, after `trl-ready` + pill built: collect every text node, `title`, `placeholder`, `<title>` under
   `<body>`/`<head>` (not script/style/svg). English baseline (en_MY) run first: a string that equals a base `msgtext` is a
   SLOT; a string that is none, after removing allow-listed tokens (acronyms, discipline codes, units, brand, key names,
   numbers, symbols; `.hub-card .nm` building names excluded) and still holds a Latin word ≥3 letters is UNCATALOGUED
   (printed once: `§TRL_UNCATALOGUED page=<p> n=<n> [strings]`). For locale X: leak = a slot whose on-screen text is still
   the English while X's XML row is `trl="Y"` with a different text (wiring leak) OR whose row is `trl="N"` and the English
   is not allow-listed (translation gap) — plus the uncatalogued count. Prints `§TRL_LEAK locale=<x> page=<p> leaks=<n> of
   <total> [strings]` and the per-locale sum `§TRL_LEAK locale=<x> leaks=<n> of <total>`. Target: 0 for the 9 ERP languages.
3. FORMAT — every `AD_Message_Trl_*.xml` parsed by Python `xml.etree` (an oracle independent of the Node builder): root
   `idempiereTrl`, `table="AD_Message"`, `language` == filename suffix, every `row` has `id`>999999 unique and `trl` ∈ {Y,N},
   `MsgText` `original` == the CSV `msgtext` for that id, `MsgTip` present with `original=""`, every CSV id present; the
   shipped `i18n/<code>.json` == CSV⋈XML (rebuilt in memory). Also every `data-trl*` element's static English in the 5 pages
   == CSV `msgtext` (so `original` stays true to the screen).
4. NEGATIVE CONTROL — with locale de_DE saved, the `i18n/de_DE.json` request is aborted (route) → the page falls back to
   English → the same counter must report leaks > 0 (`§TRL_LEAK_CONTROL leaks=<n> expected>0`). Proves (2) can fail.
5. Verdict `§W-VIEWER-I18N PASS|FAIL|INCONCLUSIVE pass=<n> fail=<n> slots=<n>` — INCONCLUSIVE whenever slots == 0 or no
   locale was judged. Read the log after every run; exit code is not evidence.
Regression: `node erp/tests/witness_zoom_lang.js` stays PASS (it drives the real loader in a vm sandbox); `node
tests/audit_sw_precache.js`, `node tests/audit_script_tags.js`, `npx eslint viewer` green.

**R2.5 Ship.** bim-ootb branch `feat/viewer-i18n-xml` → PR(s) against `main`, auto-squash, confirm merged + live
(`curl https://red1oon.github.io/bim-ootb/viewer/i18n/de_DE.json?x=<ts>`, `viewer/sw.js` version). `viewer/sw.js`
CACHE_VERSION v1460→v1461, 18 `i18n/*.json` added to PRECACHE_ASSETS; `locale_loader.js?v=9` on the 4 viewer pages +
`viewer/locale_loader.js?v=9` on the landing. Results → §R2 RESULT below.

### §R2 RESULT — 2026-10-03 (bim-ootb PR #1831 `feat/viewer-i18n-xml`, viewer sw v1460→v1461)
**Shipped.** `viewer/i18n/ad_message_base.csv` (493 AD_Message rows, ids 1000000–1000492: 309 extracted from the 18
`locales/*.js` packs @`4cd440ae`, 184 new for the screens that were still hardcoded) + `AD_Message_Trl_<lang>.xml` ×17 in
the exact `org.compiere.install.Translation` export format (Python `xml.etree` oracle PASS on every file: root/attrs,
ids > 999999 unique, `trl∈{Y,N}`, `original` == CSV msgtext, `MsgTip original=""`, full coverage) → `i18n/<code>.json` ×18
built by `viewer/tools/build_trl.js` (`--check` = 0 stale). 14 non-English locales 493/493 `trl="Y"`; en_US/en_GB/en_AU
carry only spelling rows (`center`, `Colour Studio`), the rest `trl="N"` (English IS their text — the witness treats an
English-prefix locale's `trl="N"` as its own text, not a gap). `locales/*.js` now hold cost data only (20 keys + 5 rate
objects). One-shot birth record `viewer/tools/trl_migrate_2026-10-03.js` + per-locale `trl_batch_2026-10-03_<lang>.js`
(machine, labelled); it refuses to run once the XML exists. `locale_loader.js` LOCALE_VERSION 7, `§TRL_LABELS`,
`§TRL_LANGDIR`, `<html lang dir>` (ar_SA rtl), `data-trl-html`/`data-trl-tip`, `_trl(key, repl, dflt)`.

**W-VIEWER-I18N** (`viewer/tests/witness_viewer_i18n.js`, headless `--disable-gpu`, `?blank=1`, logs
`viewer/tests/logs/witness_viewer_i18n.log` + `.page.log`): `§W-VIEWER-I18N PASS pass=51 fail=0 locales=18 slots=2368`.
| check | result |
|---|---|
| (1) carry-through | 18/18 locales: real `openFlagPicker()` click on `index.html` → `bim_ootb_config.locale` saved → `§TRL_DETECT src=saved req=- code=<x>` + `§TRL_LABELS locale=<x>` + `<html lang>` on landing, viewer, boq, clash, mep (`ar_SA` → `dir=rtl`, e.g. `§TRL_CARRY locale=ar_SA page=viewer detect=saved html.lang=ar dir=rtl`) |
| (2) leaks | BEFORE (first run, old code + empty batch): `de_DE leaks=137 of 186 wiring=2 gap=63 uncat=72`. AFTER: `§TRL_LEAK leaks=0 of 131–133` for ALL 17 non-English locales (ms_MY de_DE fr_FR es_ES zh_CN th_TH ja_JP ko_KR ar_SA pt_BR id_ID bn_BD bl_BD af_ZA + en_US/en_GB/en_AU 0 of 132); `§TRL_UNCATALOGUED n=0` on all 5 pages (baseline 132 slots). The 2 last wiring leaks (`#night-val` "Off", `#issue-d-share` "Share" without `data-trl`) were found by the run and fixed. |
| (3) format + staleness + screen==CSV | PASS: 17 files; `build_trl.js --check changed=0`; `(3b) checked=181` static `data-trl*` texts and in-code `_trl/_trlD/_lt/_t(..,'dflt')` defaults == CSV msgtext (`source_app` brand placeholder exempt, pre-existing). |
| (4) control | `de_DE` saved, `i18n/de_DE.json` route ABORTED → `§TRL_LABELS … src=fallback` → `§TRL_LEAK_CONTROL leaks=6 of 6 expected>0` PASS |
| dialog/toast | `landing_clear_confirm` captured via `window.confirm` == the locale's row, 18/18; locale toast suffix (`ui_locale_toast_hint`) 90/90 pages ok; 0 page errors |
Out of scope, PRINTED not judged (`§TRL_OUT_OF_SCOPE page=viewer n=53 container=#time-machine-panel`): the Time Machine /
Gantt / P6 drawer; also the ⋯ pill `children` help text + F1 palette, and the 5 NLP example chips (`count doors` …) kept
English because `nlp.js` parses English. `<title>` of `viewer.html`/`index.html` = brand, untouched. Regression:
`erp/tests/witness_zoom_lang.js` PASS 14/0 (loader still drives it); eslint viewer green (`_trl` added to
`eslint.globals.json`); `audit_sw_precache`, `audit_script_tags`, CI node tests green.
**Decided during implementation (addenda to R2.1/R2.4):** `source_app` (brand) counted UNIVERSAL (`trl="Y"` same text) with
WBS/UOM/GPS/GUID/ERP/OK/CSV/X-Ray/4D / 5D; the 25 `panels.js` ICONS `trl` keys that never had a row (`ui_tt_tm`, `ui_sun`,
…) got rows so `A.icon()`'s existing `_TRL[trl] || desc` path translates them; page `<title>`s keyed as
`title_boq/clash/mep` (brand prefix kept); `mep_report.html`'s older 2-arg `_t(k, fb)` fallbacks are exempt from (3b).
Merge sha + live check: appended below once auto-merge lands.
**MERGED + LIVE (2026-10-03 23:16):** bim-ootb PR #1831 squash-merged as `01f38710` (fast-checks + e2e-tests green, auto-merge).
Fetched, not inferred, from `https://red1oon.github.io/bim-ootb/` with cache-busting: `viewer/sw.js` `CACHE_VERSION = 'v1461'`;
`viewer/i18n/de_DE.json` and `ar_SA.json` served (`rows: 493, translated: 493, untranslated: 0`, `ui_tools` = "أدوات");
`viewer/locale_loader.js` carries `§TRL_LABELS`/`§TRL_LANGDIR`/`LOCALE_VERSION = 7`; `index.html` and `viewer/viewer.html`
serve the keyed markup (`data-trl="landing_hub_title"`, `locale_loader.js?v=9`); `viewer/i18n/AD_Message_Trl_de_DE.xml`
HTTP 200 (81,107 B). Worktree `/tmp/wt-viewer-i18n` removed.
**Open for the user (⛔ not blocking):** (a) should the ⋯ pill `children` help text + F1 palette and the Time Machine /
Gantt / P6 drawer (53 strings) be translated now or stay English until those lanes settle? (b) the base dictionary's
English is en_MY (British spelling: Storey/Labour/centre) — keep as the AD_Message base, or re-base on en_US as iDempiere
does? (c) all new translations are machine-made and labelled so; a native review pass per language is the next quality step.

### §R2c SPEC — 2026-10-04 — in-place language switch in the Viewer (Witness: W-VIEWER-LANG-INPLACE)
**Why:** the Viewer trailer (`prompts/FILM_NARRATION.md` §8, PLAYBOOK B rule 1) switches language every ~10 s inside one
continuous take. Today the flag picker (`toggleFlagPicker`) saves `bim_ootb_config.locale` and calls `location.reload()`
— on `viewer.html` that re-downloads/re-streams the building (Hospital) and loses camera, selection and open panels.
The ERP already switches in place (`prompts/ERP_UI_LOCALES.md` §L4 "in place (primary and only method)") — mirror it.
1. `_TRL_LOADER.setLocale(code)` → Promise: fetch that locale's built label JSON + cost pack, re-merge `_TRL` (labels
   AND cost), `applyTrlToDOM()`, `<html lang dir>`, persist `bim_ootb_config.locale` (+ rewrite a URL `lang=` as §R1.2b),
   then dispatch `trl-ready` again with `detail.inplace=true`. No reload.
2. The flag picker calls `setLocale` instead of reloading. Modules that build text once must re-label on `trl-ready`
   (the ⋯ pill already does — #1831). Any panel that can't re-label is listed, not hidden.
3. Cost: currency/rates switch with the locale (existing bundle). Numbers already on screen that were computed from the
   old rates are recomputed by their owner on `trl-ready`, or listed as stale.
4. Log: `§TRL_SWITCH from=<a> to=<b> ms=<n> relabelled=<n> leaks=<n>` per switch.
5. Witness: on viewer.html with a small building loaded (SampleHouse, software GL), switch through all 18 locales in
   place: (a) no navigation event / reload, building + camera unchanged; (b) `§TRL_LEAK` 0 on the in-scope screens after
   each switch (same scope as W-VIEWER-I18N); (c) negative control: a module that does not listen to `trl-ready` shows
   ≥1 leak after a switch. INCONCLUSIVE if 0 strings judged.
6. **Info panel (red1, 2026-10-04: "Oh yes the info panels.. i forgot..")** — its static labels are keyed (#1831:
   `ui_class`, `h_storey`, …) but the blocks filled on pick are English: `#info-cost` (Planned→Committed, "⏱ View at this
   moment") and `#info-4d` (construction window), both written by `viewer/find_erp_push.js` (0 `_trl(` calls on origin/main
   01f38710), plus its status lines ("Folding Project Order…", "Project Order: … lines · contract …"). Key them in the
   same AD_Message CSV + XML, re-render on `trl-ready`, include in the leak scope (pick an element, then judge the panel).

### §R2b SPEC — 2026-10-04 — Time Machine / Gantt / What-if / Pull Back / P6 drawer joins the dictionary (Witness: W-VIEWER-I18N, extended)
**The ask (red1, 2026-10-04):** translate the Time Machine drawer now — it is in the upcoming trailer (Time Machine playback,
What-if slip, ⏪ Pull Back). §R2 RESULT had left it `§TRL_OUT_OF_SCOPE page=viewer n=53 container=#time-machine-panel` and asked
the user (open item (a)); this answers it. Conventions = §R2 FORMAT RULE + §R2 SPEC R2.1/R2.2 unchanged: CSV base rows,
`AD_Message_Trl_<lang>.xml` ×17 as THE source, JSON built by `build_trl.js`, English byte-identical, machine translations
labelled in every XML header.
**Measured before (bim-ootb `01f38710`, viewer sw v1461):** `witness_viewer_i18n.js --locales de_DE --pages viewer` →
`§TRL_OUT_OF_SCOPE page=viewer n=53` (9 of the 53 are glyphs/acronyms: 📊 ⎆ ⇄ P6/MSP 📋 ⚖ ◀◀ ■ ▶▶ DAY 0 | HR 0); the drawer's
runtime status/tip/popup strings (`tm-status`, `tm-gantt-tip`, `tm-gantt-lockmsg`, `tm-p6-out`, `tm-gantt-props`, the What-if
panel `#whatif-panel`) are all string literals in `viewer/time_machine.js` (buildPanel + ~60 message sites) and
`viewer/whatif_panel.js` (panel chrome + 6 status lines). Headless TM/Gantt witnesses on main before any change: 19/20 PASS;
`witness_gantt_props_epoch.js` FAILS on main (W-PE-5/6/7a/7b — the TM clock printed as a 1970 date; nothing to do with text).

**R2b.1 Scope.** IN (keyed, every locale): the drawer's static chrome (8 header titles, `4D Construction Playback`, DAY/HR/MIN,
5 transport titles, `Undo edit`/`Set Baseline`/`Pull Back` + titles, grips, lock button both states + both titles, ruler title,
`Import`/`Export`, `P6/MSP file`, `auto-bind`, 3 export titles, `Diff vs Model` + title, `Phase Progress`/`S-Curve`
(`Site Resources` + `Close` reuse `t_site_resources`/`ui_close`)); the runtime lines the drawer's actions print — playback status
(`{n} placed | {names}`, `idle`, DAY/HR counter composed from the mode keys), bar hover tip, every edit refusal/confirmation
(`Locked — click 🔒 Locked to enable editing`, `Not editable…`, `Blocked by…`, `Rejected:…`, `Move/Resize…`, `Shift whole
schedule…`, `Linked…`, `Refused — cycle`, `Nothing to undo`, `Undone…`, baseline 2, Pull Back 4 incl. `Compressed {n} task(s) —
project finish moved up {d} day(s)`), the exception tip + `Close other panels ({n})`, lock verify/breach lines, CPM legend +
title, props panel (`Start`/`Finish`/`Apply`/`Close`/`← after`/`→ before`/`CRITICAL PATH · zero float`/`Total float {n}d`),
dashboard (`Day {c} / {t} — {p}% complete`), variance head fragments, the `⊕ Now building · {n} item(s)` chip, P6 section
(import/export/diff — 16 lines), load statuses (`Loading timeline...`, `Setting up 4D construction timeline...`, `No elements
found in database`); `whatif_panel.js` (title, sub, legend, `Finish:`/`BAC:`/`PV @ finish:`/`(unchanged — same scope)`, track +
stepper titles, `Accept — re-baseline`/`Discard`, 4 status lines, `Project {id}`).
OUT (named, dynamic data): task/phase/storey/building names, dates (`tm-label` already uses `toLocaleDateString` — the
browser's locale, not the picker's; left as is), numbers, engine-produced reasons (`res.reason`, schedule_diff `flagMsg`,
`det.format`), file names, console `§` lines, the `MSP`/`PMXML`/`XER`/`P6`/`MSPDI`/`WBS`/`EPS` acronyms (ALLOW).

**R2b.2 Mechanism (no new convention).** Static markup in `buildPanel()` gets `data-trl`/`data-trl-title` (icons stay outside a
`<span data-trl>`), then `window._applyTrlToDOM()` runs once after `appendChild` (the loader's own `trl-ready` pass also covers
it). Runtime strings go through ONE module helper `_tmTrl(key, en, repl)` = the `_trlD` pattern panels.js already uses
(`typeof _trl === 'function' ? _trl(key, repl, en) : en`). The functions that witnesses SLICE OUT of the source and execute
alone in a vm sandbox (`wireGanttDrag`, `wireGanttRulerShift`, `commitGanttDrag`, `shiftGanttSchedule`, `commitGanttGroupShift`,
`generateGanttSchedule`, `_tmSayException`, `_tmEditLocked` — witness_gantt_edit_lock/group_move/ruler_shift_lock/
tm_edit_exception/tm_bake_lock/native_generate) cannot see a module helper, so each opens with a local guard
`var _L = (typeof _tmTrl === 'function') ? _tmTrl : function (k, en, r) {…substitute…}` and uses `_L(key, en, repl)` — English
in the sandbox, the locale in the page, one English literal per string. `whatif_panel.js` gets the same guard as `_wiTrl`.
The English default at every call site == the CSV `msgtext` — W-VIEWER-I18N (3b) is widened to read `_tmTrl`/`_L`/`_wiTrl`
and to un-escape `\'` in `.js` attribute titles before comparing.

**R2b.3 Files.** `viewer/tools/trl_batch_2026-10-04_tm.js` — the batch: `NEW` (value → English, byte-identical) + `TRL` per
locale, machine translation (Claude, 2026-10-04), labelled so; en_US gets only spelling rows (`programme`→`program`),
en_GB/en_AU none (`trl="N"` = the English is their text). `viewer/tools/trl_add_batch.js <batch>` — the reusable applier the
migration did not leave behind: appends the NEW rows to `ad_message_base.csv` (ids continue at 1000493, never renumbering),
appends one `<row>` per new id to every XML (`trl="Y"` when the batch has the text, else `trl="N"` with the English), adds the
batch's source line to each XML header comment, REFUSES to touch an existing id/value or a key whose English differs, exits
non-zero on any problem, prints `§TRL_ADD lang=<l> added=<n> trlY=<y> trlN=<n>`; then `build_trl.js` (`--check` clean).
`viewer/tests/witness_viewer_i18n.js`: `OUT_OF_SCOPE` removed — the drawer is judged like the rest; prints
`§TRL_SCOPE page=viewer drawer=#time-machine-panel n=<strings>` and FAILS when n < 40 (anti-vacuous: a drawer that is not in
the DOM must not pass by absence); opens the real What-if panel on the viewer page when it can (`initSqlJs` from `lib/`, the
panel's own `_loadDb()` → `erp/ad_seed.db` C_Project 990000, 7 phases) and judges `#whatif-panel` too — `§TRL_WHATIF
locale=<x> open=yes|no strings=<n>`; `open=no` is printed and counted as NOT judged, never as pass. ALLOW += MSP PMXML XER P6
MSPDI EPS. Negative control (4) unchanged.

**R2b.4 Regression (English unchanged ⇒ these must stay exactly as on main).** Re-run after the change, read the logs:
gantt_edit_coherence, gantt_lock_integrity, tm_edit_exception, gantt_reschedule_asap, gantt_edit_undo, gantt_baseline,
tm_p6_interop_fold, whatif_authored_sync, gantt_gesture_wiring, gantt_native_generate, tm_bake_lock, gantt_edit_lock,
gantt_retime_resync_wiring, gantt_edit_persist, gantt_group_move, gantt_ruler_shift_lock, gantt_refold_yield,
gantt_bars_in_rect, gantt_cpm_annotate (all PASS on main) + gantt_props_epoch (FAIL on main, must not get worse); `eslint
viewer`, `tests/audit_sw_precache.js`, `tests/audit_script_tags.js`, `erp/tests/witness_zoom_lang.js`. Software GL only
(`--disable-gpu`), `?blank=1`, never a bake.

**R2b.5 Ship.** bim-ootb branch `feat/viewer-i18n-tm` → PR to `main`, auto-squash; `viewer/sw.js` v1461→v1462; no new precached
file (the 18 JSON are already listed; CSV/XML are build sources, never fetched); `time_machine.js?v=80`, `whatif_panel.js?v=5`
on `viewer.html`. Live check = curl `viewer/i18n/de_DE.json` (`rows` > 493) + `viewer/sw.js` with cache-busting. Results →
§R2b RESULT below.

### §R2b RESULT — 2026-10-04 (bim-ootb PR #1832 `feat/viewer-i18n-tm`, viewer sw v1461→v1462)
**Shipped.** 163 new `AD_Message` rows, ids 1000493–1000655 (dictionary 493→656 rows): the whole `#time-machine-panel` chrome
+ its runtime status/tip/popup lines (playback, Gantt edit refusals/confirmations, lock verify/breach, CPM legend + title, props
panel, dashboard, Budget-vs-Actual, P6/MSP import/export/diff, load statuses), the What-if popup (`whatif_panel.js`, 19 keys)
and `ui_downloading_pct` (the `#status` cachedFetch progress line a What-if open puts up while `erp/ad_seed.db` streams).
14 non-English locales 163/163 `trl="Y"`; en_US 2 spelling rows (programme→program), en_GB/en_AU `trl="N"`. Batch =
`viewer/tools/trl_batch_2026-10-04_tm.js` (machine, labelled in every XML header: `rows 1000493-1000655 source=machine
(Claude, Anthropic, 2026-10-04) — viewer/tools/trl_batch_2026-10-04_tm.js`), applied by the NEW reusable
`viewer/tools/trl_add_batch.js` (`§TRL_ADD lang=<l> rows=656 added=163 trlY=163 trlN=0` ×14; refuses an existing id/value
or a translation for a key not in NEW; existing rows re-serialized byte-identically — asserted, not assumed);
`build_trl.js --check changed=0`.
**Code.** `time_machine.js`: 39 `data-trl*` attributes in `buildPanel()` + `_applyTrlToDOM()` after `appendChild`; 112 runtime
call sites. Decision widened from R2b.2: not only the 8 known-sliced functions but EVERY touched module-level function (19 —
`_updatePinpoint updateStatus buildPanel drawVariance _tmCpmLegend undoLastGanttEdit setGanttBaseline rescheduleGanttAsap
linkGanttBars openGanttProps toggleP6Drawer tmImportForeign tmExportMSProject _tmExportP6 tmDiffVsModel drawGanttMini
drawDashboard activate _activateAsync` + `wireGanttRulerShift _tmSayException commitGanttDrag shiftGanttSchedule
commitGanttGroupShift generateGanttSchedule wireGanttDrag`) opens with the local `var _L = (typeof _tmTrl === 'function') ?
_tmTrl : <English fallback>` guard and calls `_L(key, en, repl)` — MEASURED reason: with `_tmTrl` called directly,
`witness_gantt_edit_undo` (9→3 PASS) and `witness_tm_p6_interop_fold` (43→32 PASS, 1 FAIL) died with `ReferenceError:
_tmTrl is not defined` in their vm sandboxes (they slice `undoLastGanttEdit` / the P6 functions, not in my grep of
`sliceFn` names). Any TM function may be sliced by a future witness; the guard is the uniform contract.
`whatif_panel.js`: `_wiTrl` guard, 19 sites. **Found + fixed by the witness (pre-existing):** `_fmt(ds)` called
`WhatIf._date(ds)` on a date STRING (`'2026-06-13 00:00:00'`) → `NaN-NaN-Na` in every What-if track tooltip
(`drag to slip · official NaN-NaN-Na→NaN-NaN-Na` printed as `§TRL_UNCATALOGUED` on the first run); now
`(typeof ds === 'number' ? _date(ds) : String(ds)).slice(0, 10)`. `scene.js:1655` → `_TRL.ui_downloading_pct`.
`viewer.html`: `time_machine.js?v=80`, `whatif_panel.js?v=5`; `sw.js` v1462, no new precache entry (18 JSON already listed).
**W-VIEWER-I18N** (`viewer/tests/witness_viewer_i18n.js`, headless `--disable-gpu`, `?blank=1`, log
`viewer/tests/logs/witness_viewer_i18n.log` + `.page.log`): `§W-VIEWER-I18N PASS pass=87 fail=0 locales=18 erp9=8 slots=3442`.
| check | before (`01f38710`, old witness) | after |
|---|---|---|
| drawer | `§TRL_OUT_OF_SCOPE page=viewer n=53` — printed, never judged | `§TRL_SCOPE locale=<x> page=viewer drawer=#time-machine-panel n=58 whatif=#whatif-panel n=24 open=yes` ×18; `(2b) … 58 strings inside #time-machine-panel (min 40)` PASS ×18 — a drawer absent from the DOM FAILS |
| What-if popup | never opened | opened for real on every locale (`initSqlJs` from `lib/` + the panel's own `_loadDb()` → `erp/ad_seed.db` C_Project 990000, 7 phases, `§WHATIF-UI open project=990000 "BIM: Hospital" phases=7`); `(2b) … 24 strings inside #whatif-panel` PASS ×18 |
| leaks | first run of the NEW witness before any translation: `de_DE leaks=1 of 137` (the download line) + baseline `§TRL_UNCATALOGUED page=viewer n=2` (download line, NaN tooltip) | `§TRL_LEAK locale=<x> leaks=0 of 190–192 wiring=0 gap=0 uncat=0 pages=5` for ALL 17 non-English locales; `§TRL_UNCATALOGUED n=0` on all 5 pages (viewer baseline slots 85→145) |
| template slots | a filled-in `{placeholder}` string could only be UNCATALOGUED | judged by its template's static prefix (`EN_TPL`, prefix ≥ 4 chars): English prefix = slot; locale counts it translated only when the string starts with ITS template prefix (text ≠ English) or affirms the same text |
| (3b) | `checked=181` | `checked=376` — `_tmTrl`/`_L`/`_wiTrl` defaults + `\'` un-escaped in `.js` attribute titles, all == CSV msgtext |
| (4) control | `leaks=6 of 6 expected>0` | unchanged — `de_DE` saved, `i18n/de_DE.json` aborted → `src=fallback` → `§TRL_LEAK_CONTROL leaks=6 of 6 expected>0` PASS |
**Regression (logs read, before vs after identical):** gantt_edit_coherence, gantt_lock_integrity 21/0, tm_edit_exception 23/0,
gantt_reschedule_asap 27/0, gantt_edit_undo 9/0, gantt_baseline 11/0, tm_p6_interop_fold 43/0, whatif_authored_sync 9/9,
gantt_gesture_wiring 17/0, gantt_native_generate 5/0, tm_bake_lock 17/0, gantt_edit_lock 5/0, gantt_retime_resync_wiring 7/0,
gantt_edit_persist 19/0, gantt_group_move 9/0, gantt_ruler_shift_lock 4/0, gantt_refold_yield 7/0, gantt_bars_in_rect 5/0,
gantt_cpm_annotate 28/0 — all PASS exactly as on main; `gantt_props_epoch` 17 PASS / 5 FAIL on main AND after (W-PE-5/6/7a/7b,
TM clock printed as a 1970 date — not this lane's). `eslint viewer` 0 errors (1 pre-existing warning in
`witness_reveal_arch_hold.js`); `audit_sw_precache` 158 precached 0 unlisted; `audit_script_tags` 191/0 missing;
`erp/tests/witness_zoom_lang.js` PASS 14/0. Never a GPU run, never a bake.
**Out of scope, named:** task/phase/storey names, dates (`tm-label` uses the browser's `toLocaleDateString`, not the picker's
locale), engine reasons (`res.reason`, schedule_diff `flagMsg`), the ⋯ pill `children` help + F1 palette (§R2 open item (a)
second half — still open), `<title>` brand. **Open for the user (⛔ not blocking):** the 163 translations are machine-made
and labelled so — a native review per language is the quality step; `gantt_props_epoch` is red on main independently of this.
Merge sha + live check: appended below once auto-merge lands.
