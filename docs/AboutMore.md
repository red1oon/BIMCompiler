# BIM OOTB — Technical Overview
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


## About (Settings Panel)

**BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.**

Release 1.84.0 (31 October 2026)
Creator: Redhuan D. Oon <red1org@gmail.com>
Tickets: github.com/red1oon/bim-ootb/issues
License: MIT

**Probably the lightest BIM app ever made.** See [Feature Comparison](FeatureComparison.md) for a technical breakdown and industry comparison.

Browser-native BIM viewer. Drop an IFC file or pick a building — geometry streams
from SQLite databases directly to the GPU via Three.js. No server, no plugins,
no build step. Works on desktop and mobile.

~150K lines of vanilla JavaScript in the Viewer alone (231 modules) — no framework, no build step, no bundler.
~4MB total download (cached after first visit). Static files only — zero server-side code.
Compare typical web BIM viewers at 100K–500K+ lines with Node backends and heavy frameworks.

- ~150K lines of JavaScript in the Viewer (231 modules), plus the Modeller and Kernel-ERP
- 18 languages, locale-aware currency
- 30 Playwright test suites
- GitHub Pages (free hosting)

### Third-Party Libraries (not modified)

| Library | Version | License | What it does |
|---------|---------|---------|--------------|
| [Three.js](https://threejs.org/) | r184 | MIT | WebGL/WebGPU 3D rendering. [Release notes](https://github.com/mrdoob/three.js/releases). Upgraded from r160→r184 (24 releases, Dec 2023→Apr 2025). WebGPU-ready architecture with WebGL fallback — see [Three.js WebGPU guide](https://threejs.org/docs/#manual/en/introduction/Installation). |
| [sql.js](https://github.com/sql-js/sql.js) | 1.10.3 | MIT | WASM SQLite in browser |
| [web-ifc](https://github.com/ThatOpenCompany/engine_web-ifc) | 0.0.77 | MPL-2.0 | IFC2x3 + IFC4 parsing/tessellation |
| [SheetJS](https://github.com/SheetJS/sheetjs) | 0.20.3 | Apache-2.0 | Excel export |
| [ExcelJS](https://github.com/exceljs/exceljs) | 4.4.0 | MIT | Excel workbook generation |
| [Chart.js](https://github.com/chartjs/Chart.js) | 4.4.1 | MIT | BOQ charts |
| [dxf-parser](https://github.com/gdsestimating/dxf-parser) | — | MIT | DXF file parsing (vendored) |
| [GoatCounter](https://www.goatcounter.com/) | — | EUPL | Privacy-friendly analytics |

None of these are modified. They are called via their public APIs.

### Original BIM OOTB Scripts (by Redhuan D. Oon, MIT)

| Script | What it does | Novelty |
|--------|-------------|---------|
| `streaming.js` | DB BLOBs → Float32Array → Three.js GPU | **The core innovation** — no intermediate format |
| `import_worker.js` | Calls web-ifc API → 4×4 transform, Y→Z-up, centroid re-centre, discipline classify, dedup | The extraction pipeline |
| `import_db_builder.js` | Raw data → 10-table SQLite schema | The schema design |
| `picking.js` | Raycast → GUID → SQL → highlight | Click-to-identify from DB |
| `scene_to_db.js` | Three.js scene → write back to DB | Reverse pipeline |
| `ifc_export_worker.js` | DB → IFC STEP text file | Pure text generation, no web-ifc |
| `section_cut.js` | Clipping plane from DB geometry | Section cut from DB |
| `navigate.js` | Storey/discipline filter, search | SQL-driven navigation |
| `diff.js` | Compare two DBs | Variation order from SQL |
| `walk.js` | First-person walk mode | Camera + collision from DB |
| `sitecam.js` | GPS/compass/AR mobile overlay | Real-world BIM overlay |
| + 70 more modules | UI, i18n, city mode, BOQ, wizard, NLP, etc. | All original |

### The Innovation Boundary

web-ifc, sql.js, and Three.js each solve one problem. **No existing project combines them
into a serverless BIM pipeline.** The original contribution is:

1. **Schema design** — 10 tables that hold an entire building as queryable data
2. **Extraction pipeline** — IFC entities → classified, instanced, centroid-recentred DB records
3. **DB-to-GPU streaming** — SQLite BLOB → Float32Array → BufferGeometry with zero conversion
4. **Round-trip** — browser edits → DB → IFC export, closing the loop without a server

### Language and Currency

18 languages with local currency and exchange rates. Click the flag to switch.

**Locale files:** `viewer/locales/*.js` — one file per country.
Each file contains all UI translations and currency settings (`cur`, `cur2`, `cur_rate`).

To customise your own:

1. Copy `locales/en_US.js` → `locales/my_project.js`
2. Edit the translations, currency symbol, and exchange rate
3. Add your locale to the `AVAILABLE_LOCALES` array in `locale_loader.js`

Source: [viewer/locales/](https://github.com/red1oon/bim-ootb/tree/main/viewer/locales)

> **Note:** Language and currency/rates are currently bundled per country flag (POC).
> A future version will separate language preference from currency/rate selection —
> e.g. English UI with Malaysian Ringgit rates.

### Browser Compatibility
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Mobile: iOS Safari 15+, Chrome Android
- Requires: WebAssembly, WebGL 2, Web Workers

### Stages

**Stage 1 (current) — Pure Browser**
Everything runs in the browser. No server, no APIs, no backend.
IFC/mesh files are parsed client-side via Web Workers, stored in IndexedDB,
streamed to the GPU. The SQLite database IS the application.
Static HTML + JS files served from GitHub Pages.

**Stage 2 (planned) — DAGCompiler Backend**
Java-based BOM compilation engine. Reads IFC, builds recursive Bill of Materials
(building → floor → room → furniture → leaf), runs validation rules, produces
4D–8D output databases. Currently 2.1M lines of Java + 2.7M lines of Python
(Blender extraction) + 644K lines of SQL (migration rules). Not yet connected
to the browser app — the databases it produces are the same two-DB format the
browser already consumes. Stage 2 adds server-side compilation, not a new viewer.

### Hosting Requirements
- Static file server only — no CPU/RAM server needed
- All computation runs in the browser (client-side)
- OCI Always Free: 10GB storage, 10TB/mo egress
- Client: 2GB+ RAM, any modern CPU with WebGL 2

---

## DIY Self-Host

Run BIM OOTB on your own machine. Libraries are cached offline by the Service Worker.

1. Download the repo from [GitHub](https://github.com/red1oon/bim-ootb) (the `main` branch ZIP)
2. Run `python3 -m http.server 8080` in the unzipped folder
3. Open `http://localhost:8080` — drop any IFC file

Or use the **DIY Downloader** in the About box of the [live viewer](https://red1oon.github.io/bim-ootb/) — it generates an install script for your platform (Windows/Mac/Linux) that handles prerequisites automatically.

### What gets installed

The script installs to:

- **Windows:** `C:\Users\{you}\bim-ootb\`
- **Mac/Linux:** `~/bim-ootb/`

Includes everything needed to run:

- All viewer JS modules (~30 files)
- 14 DXF templates (floor plans, elevations, roof)
- Cost rates and exchange rate data (`rates.js`)
- 18 language packs with local currency (`viewer/locales/`)
- Service worker for offline caching (`sw.js`)

No databases are bundled — buildings load from OCI cloud via the manifest,
and Drop IFC builds your own databases locally in the browser.

### Customisation

- **Landing page:** Edit `index.html` — plain HTML/CSS/JS, no framework
- **Viewer behaviour:** Edit `config.js` — colours, default views, discipline mapping
- **Branding:** Edit the header, logo, and About panel in `index.html`
- **Add buildings:** Drop IFC → Save `.db` → host on your server → link via `?db=` URL

See [4D/5D Analysis](https://red1oon.github.io/BIMCompiler/4D5DAnalysis/) for editing rates, cost templates, and nD configuration.

---

## Architecture

```
Browser
  index.html          ← viewer shell (Three.js canvas + UI panels)
  landing2.html       ← building picker (manifest-driven cards)
  boq_charts.html     ← 4D/5D BOQ analytics (ExcelJS)
  2d.html             ← DXF 2D plan viewer (Canvas2D)

  ┌─ Core ─────────────────────────────────────┐
  │ streaming.js      DB BLOBs → Float32 → GPU │
  │ scene.js          Three.js scene setup      │
  │ main.js           Boot, DB open, module init│
  │ picking.js        Element selection + info   │
  │ panels.js         Storey/disc filters, HUD  │
  └─────────────────────────────────────────────┘

  ┌─ Features ──────────────────────────────────┐
  │ navigate.js       Find/fly-to/search (1.8K) │
  │ nlp.js            Natural language queries   │
  │ walk.js           Walk mode + GPS compass    │
  │ sitecam.js        Mobile site camera + markup│
  │ section_cut.js    Section cut planes         │
  │ elevation.js      Elevation views            │
  │ grid_dims.js      Grid + dimension overlays  │
  │ diff.js           Model diff / compare       │
  │ city.js           Multi-building city mode   │
  │ issues.js         Issue log + Excel export   │
  │ variation_order.js  Change order tracking    │
  │ rates.js          Cost rate lookups          │
  └─────────────────────────────────────────────┘

  ┌─ Import / Export ───────────────────────────┐
  │ import.js         IFC/mesh import controller │
  │ import_worker.js  Web Worker: IFC parsing    │
  │ import_db_builder.js  Build extracted.db     │
  │ mesh_import_worker.js  OBJ/DAE/3DS import   │
  │ semantic_enrichment.js  Classify elements    │
  │ scene_to_db.js    Three.js scene → DB        │
  │ wizard.js         Step-by-step import wizard │
  │ ifc_export_worker.js  Export to IFC          │
  │ dxf_export.js     Export to DXF              │
  │ dxf-parser.js     Third-party DXF parser     │
  └─────────────────────────────────────────────┘

  ┌─ i18n ──────────────────────────────────────┐
  │ locale_loader.js  Detect locale, settings UI │
  │ locales/*.js      18 language packs          │
  └─────────────────────────────────────────────┘

  ┌─ Infrastructure ────────────────────────────┐
  │ sw.js             Service worker (offline)   │
  │ test/*.html       Manual test harnesses      │
  │ tests/            Playwright E2E suite       │
  └─────────────────────────────────────────────┘
```

## Data Flow

```
IFC / OBJ / DAE / 3DS
        │
        ▼
  [Web Worker]  ──→  extracted.db  (metadata, transforms, hierarchy, geometry BLOBs)
        ▼
  [IndexedDB cache]
        │
        ▼
  sql.js (WASM)  ──→  SQL queries  ──→  Float32Array
        │
        ▼
  Three.js BufferGeometry  ──→  GPU
```

One SQLite database per building. `_extracted.db` holds element metadata,
spatial transforms, BOM hierarchy, and geometry BLOBs (pre-tessellated
vertices and face indices). Large buildings (15K+ elements) split into
`_meta.db` (metadata) and `_geo.db` (geometry) for streaming performance.
The viewer streams BLOBs into `Float32Array` buffers and pushes them to
Three.js `BufferGeometry` — no intermediate mesh formats.

## Folder Layout

```
deploy/
  dev/                 Active development (NEVER in production directly)
    *.js, *.html       Viewer modules + pages
    locales/           18 language packs (3.8K lines)
    tests/             Playwright E2E suite (30 files, ~6K lines)
    test/              Manual test harnesses
    test-results/      Playwright artifacts (gitignored)
  live/               Production mirror (promote from dev, never edit)
    *.js, *.html       Prod JS + viewer HTML
    landing.html       Prod landing (generated from landing2.html)
  landing2.html        Landing page SOURCE (dev markers, sed-stripped for prod)
  rates.js             Exchange rate data
  buildings/           Per-building DB pairs (not in git)
```

## Deployment

Deployed via GitHub Pages. Building databases hosted on OCI `bim-ootb` bucket.

| Target | Role |
|--------|------|
| `red1oon.github.io/bim-ootb/` | Production — code via GitHub Pages |
| OCI `bim-ootb` bucket | Building databases only |

Deploy SOP: `git push` → live. No build step. No server.

## Size

| Component | Files | Lines |
|-----------|------:|------:|
| Viewer JS modules | 92 | 49,000 |
| Viewer HTML pages | 4 | 3,200 |
| Playwright tests | 30 | ~6,000 |
| Locale packs | 18 | ~4,500 |
| Landing page | 1 | 1,200 |
| **Total** | **~145** | **~64,000** |

---

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
*Supported by [SYSNOVA Information Systems Limited](https://www.sysnova.co.uk)*
