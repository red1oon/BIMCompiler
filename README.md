> **This repo is the compiler backend, giving way to a PWA now active at → [bim-ootb](https://github.com/red1oon/bim-ootb)**

<div align="center">

# BIM Intent Compiler

**[Construction is manufacturing. A building IS its Bill of Materials.](https://red1oon.github.io/BIMCompiler/)**
**BIM and ERP on one substrate — [a signed operation log, folded in the browser](https://red1oon.github.io/BIMCompiler/OpLogERP/).**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![BIM OOTB](https://img.shields.io/badge/BIM_OOTB-Browser_Native-4fc3f7.svg)](#bim-ootb--browser-native-bim-viewer)
[![Op-Log ERP](https://img.shields.io/badge/Op--Log_ERP-Browser_Native-9c6ade.svg)](#op-log-erp--browser-native-erp-engine)
[![Java 17+](https://img.shields.io/badge/Java-17+-orange.svg)](https://openjdk.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-382_PASS_%2F_94_intentional_RED-brightgreen.svg)](#project-stats)
[![Docs](https://img.shields.io/badge/Docs-50_specs-8CA1AF.svg)](https://red1oon.github.io/BIMCompiler/)

### [Try It Live — drop IFC or OBJ in your browser, zero install](https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html)

### [▶ Watch the film — BIM and ERP, one engine](https://youtu.be/hnLYNcRihzs) · [Explore the ERP engine as data — Glassbowl](https://red1oon.github.io/BIMCompiler/glassbowl.html)

</div>

---

<img align="right" src="docs/assets/images/GeneralTall.png" alt="Multi-storey building compiled from BOM — 6 disciplines colour-coded in Blender/Bonsai viewport" width="260">

What started as a deterministic BIM compiler has grown into something bigger. The compiler still proves every output through 6 mathematical gates — but the project's centre of gravity has shifted to the browser, where anyone with a phone can open a building model, run clash detection, and share findings on WhatsApp. No install. No server. No login.

**Three threads, one engine:**
1. **BIM OOTB** — Browser-native BIM viewer and collaboration tool. Drop any 3D file (IFC, OBJ, DAE, GLB, FBX, STL). Get storey filtering, discipline toggles, clash detection, 5D costing, 2D floor plans, walk mode with GPS, and site camera — all from a single HTML page and a SQLite database.
2. **BIM Intent Compiler** — Deterministic spatial compilation pipeline. 48K elements to 700 BOM lines. 6 mathematical gates prove every output. ERP-native data model.
3. **Op-Log ERP** — A browser-native ERP kernel forked from the iDempiere lineage (Compiere → ADempiere → iDempiere). State is a deterministic fold over a signed operation log; iDempiere's Application Dictionary (≈925 tables) is re-expressed as five relations plus verbs, so the *same* operation log that drives the BIM model also folds a building into a procurement order. A proven kernel and architecture, not a shipped product.

The [film](https://youtu.be/hnLYNcRihzs) shows the two halves as one.

| | |
|:---|:---|
| **35 buildings** compiled (126K elements largest) | **90K lines** of browser code (JS + HTML) |
| **1M elements** federated in browser | **6 mathematical gates** prove every output |
| **Multi-format import** — IFC, OBJ, DAE, GLB, FBX, STL | **Auto-classifies** mesh names to IFC schema |
| **Clash detection** — R-tree spatial index, per-pair analysis | **18 languages** — localized from day one |
| **Zero infrastructure** — no server, no API, no account | **Works offline** — service worker + IndexedDB |

<br clear="right"/>

---

## BIM OOTB — Browser-Native BIM Viewer

The pivot to browser happened at session S195. The Blender/Bonsai desktop pipeline was proven and working — but it needed Python, Blender, and a desktop machine. The question was: *what if the same data could stream directly in a browser?*

The answer turned out to be yes. A single `index.html`, a SQLite database loaded via WebAssembly, and Three.js for rendering. The same geometry hashing and spatial ordering that made the Blender pipeline fast translates directly to the browser. Today BIM OOTB is a complete site-to-office collaboration tool:

- **3D viewer** — stream building geometry from SQLite BLOBs via sql.js WASM + Three.js
- **Clash detection** — R-tree spatial index, discipline matrix, severity classification, HTML reports with Chart.js
- **2D floor plans** — dynamic section cuts, grid overlays, dimension chains, DXF export
- **Walk mode** — GPS blue dot, compass orientation, step detection, wall X-ray
- **Site camera** — snap photos with BIM overlay, GPS coordinates, share via WhatsApp/Email
- **Multi-format import** — drop IFC, OBJ, DAE, GLB, FBX, or STL; auto-classify to IFC schema
- **Offline-capable** — service worker caches all JS/WASM; buildings cached in IndexedDB
- **18 languages** — iDempiere-style `_TRL` locale system
- **4D/5D analytics** — schedule, cost, discipline breakdown (9 charts matching Excel output)

**No server. No database server. No API. No account. No install.**
One HTML page. One SQLite file. One browser tab.

```
https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html
```

---

## BIM Intent Compiler — Deterministic Pipeline

The original compiler remains the backbone for verified BIM data production:

```
IFC file → extract → classify.yaml → IFCtoBOM → BOM.db → compile → output.db → gates
           (once)    (human intent)    (once)     (recipe)   (repeat)  (elements)   (proof)
```

**Three speed secrets:**

1. **Geometry hashing** — 1M elements compress to 50K unique meshes. A hospital
   has 10,000 doors but only 15 unique door shapes.

2. **Spatial ordering** — walls and slabs stream first (`ORDER BY bbox volume DESC`).
   The building looks complete after 5% of elements are placed.

3. **No format conversion** — IFC is tessellated once at extraction. After that,
   streaming is binary unpack into GPU buffers — both in Blender and the browser.

| Metric | Value |
|:---|:---|
| Time to first geometry (browser) | **2-3s** |
| InstancedMesh draw call reduction | **85%** |
| Geometry deduplication | **95%** (1M to 50K meshes) |
| Data footprint per building | **0.1-173 MB** (single SQLite file) |
| Server required | **None** |

See [RTree.md](docs/RTree.md) for architecture, [CHANGELOG.md](CHANGELOG.md) for release history.

### nD Analysis (4D-8D)

Template-driven engine generates schedules (4D), cost estimates (5D), carbon (6D),
lifecycle (7D), and safety plans (8D) from the same compiled database. 37 buildings +
1M sandbox costed at MYR 1.59B. See [4D5DAnalysis.md](docs/4D5DAnalysis.md).

---

## Op-Log ERP — Browser-Native ERP Engine

A companion line of work forks the iDempiere lineage into the browser. State is a *deterministic fold over an append-only, signed operation log* — a fact is computed by replaying the log, never stored as a guarded scalar — so an accounting kernel runs serverless, over SQLite, and keeps working while offline.

- **AD → five relations** — iDempiere's Application Dictionary (≈925 tables) reduces to *documents, lines, journal, containers, items* plus a small verb set, validated by diffing the kernel's projection against iDempiere's executed records (the GardenWorld dataset).
- **One substrate** — the same operation log drives the BIM model; a building folds into a Project Order through the same kernel.
- **Witnessed, not asserted** — op-group atomicity, period-close checkpointing (compaction as balance-carried-forward), and a single compare-and-set class for the one shared resource are proven by `§`-tagged POCs (`scripts/poc_showstopper.js`, `poc_volume.js`, `diff_oracle.js`).

This is a proven kernel and architecture, not a finished ERP. The constituent techniques are established — event sourcing / Datomic, hash-chained ledgers / QLDB / immudb, single-writer-at-the-edge / Durable Objects, local-first / CRDT — and the contribution is their composition under ERP semantics together with the BIM↔ERP unification. No head-to-head benchmark against iDempiere is claimed.

**Read** the [technical abstract](https://red1oon.github.io/BIMCompiler/OpLogERP/) · **explore** the [engine as data — Glassbowl](https://red1oon.github.io/BIMCompiler/glassbowl.html) · **specs:** [AD-in-Browser](https://red1oon.github.io/BIMCompiler/ERP/), [The Holy Grail](https://red1oon.github.io/BIMCompiler/HolyGrail/), [Distributed ERP](https://red1oon.github.io/BIMCompiler/DistributedERP/).

---

## Live & Online

| Link | What |
|:---|:---|
| [BIM OOTB viewer](https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html) | Drop IFC/OBJ in the browser, zero install |
| [Glassbowl](https://red1oon.github.io/BIMCompiler/glassbowl.html) | The ERP engine rendered from its own data |
| [Op-Log ERP abstract](https://red1oon.github.io/BIMCompiler/OpLogERP/) | The fold-over-a-signed-log engine, technical |
| [Documentation](https://red1oon.github.io/BIMCompiler/) | 50 specs, full-text search |
| [The film](https://youtu.be/hnLYNcRihzs) | BIM and ERP, one engine |
| [Viewer source (bim-ootb)](https://github.com/red1oon/bim-ootb) | The browser viewer code repository |
| [Pair-programming walkthrough](https://youtu.be/bOcwiILBVUE) | How the Creator pairs with Claude |

## Quick Start

**Browser (BIM OOTB):**
```
Open the live link above. Drop any IFC/OBJ file. Done.
```

**Compiler (Java pipeline):**
```bash
# Prerequisites: Java 17+, Maven 3.8+, SQLite3
git clone https://github.com/red1oon/BIMCompiler.git && cd bim-compiler

mvn compile -q                                        # Compile all modules
./scripts/run_RosettaStones.sh classify_sh.yaml       # Compile Sample House + verify gates
./scripts/run_tests.sh                                # Full test gate (382 PASS / 94 intentional RED / 1 SKIP — see script header)
```

## Documentation

**https://red1oon.github.io/BIMCompiler/**

50 specs with full-text search, dark mode, and sidebar navigation. Live demos and the film are in [Live & Online](#live--online) above.

## Project Structure

```
bim-compiler/
├── deploy/
│   ├── dev/               # BIM OOTB working copy (53 JS + 6 HTML modules)
│   ├── live/              # Production snapshot (promoted from dev)
│   └── buildings/         # Per-building SQLite databases
├── DAGCompiler/           # 11-stage compilation pipeline (G1-G6 gates; steps numbered 1-12, Step 3 retired)
├── BIM_COBOL/             # 77 domain verbs, witness engine
├── BIMEyes/               # Geometric comprehension: 28 shape proofs
├── IFCtoBOM/              # IFC extraction → BOM database pipeline
├── BonsaiBIMDesigner/     # GUI server + validation (TCP :9876)
├── BIMBackOffice/         # ERP reporting + portfolio (HTTP :9877)
├── orm-core/              # Base ORM, BIMLogger, shared utilities
├── library/               # SQLite databases (product catalog, BOMs)
├── migration/             # SQL migration scripts (append-only)
├── scripts/               # Build, test, docs, audit — and the op-log ERP POCs (poc_*.js, erp_kernel.js)
├── build/erp/             # Glassbowl (engine-as-data explorer) + GardenWorld oracle (ad_full.db)
└── docs/                  # 50 specifications (mkdocs site source)
```

## About

**Redhuan D. Oon** ([red1](mailto:red1org@gmail.com)) — Kuala Lumpur, Malaysia.
Led [ADempiere](https://www.adempierebr.com/User:Red1) (2006), paved the way for
[iDempiere](https://idempiere.org/) (2010), authored
*[Open Source ERP](https://www.amazon.com/Open-Source-ERP-Redhuan-Oon/dp/9673490228)*
(Pearson Malaysia, 2010). Two decades of ERP manufacturing BOM expertise applied to construction — and the iDempiere model now extracted back into the browser as an operation-log engine.

## Project Stats

| | |
|:---|:---|
| **BIM OOTB (Browser)** | 331 files, ~311K lines (JS + HTML), 53 Playwright spec files |
| **Java Compiler** | 1,207 files, 278K lines across 10 Maven modules |
| **Java Tests** | 201 test classes; gate baseline 382 PASS / 94 intentional RED / 1 SKIP |
| **SQL** | 178 migration scripts (append-only) |
| **Databases** | 35 per-building single DBs (0.1-173 MB each) |
| **Specifications** | 50 docs, governed by SystemContract.md |
| **Buildings** | 35 compiled (34 extracted + 1 generative) |
| **Scale** | 1,063,563 elements federated, 35 buildings, 6 disciplines |

---

<div align="center">

**Alpha v1.0** — May 2026

Code: MIT

Copyright (c) 2025-2026 Redhuan D. Oon. All rights reserved.

</div>
