---
description: Project history by the numbers — from the IfcOpenShell Federation branch (Oct 2025) to the Java compiler to the browser-native BIM+ERP engine, with dated milestones and a commit ledger.
---
# Project Chronology — Federation → Compiler → Browser

*How the tech was discovered, by the numbers. Every date traces to a git commit or a
cited doc; commit/fix counts are `git log` extractions on the dates shown. Nothing here
is estimated. Companion to the narrative in [`VibeProgramming.md`](VibeProgramming.md)
and the feature list in [`ROADMAP.md`](ROADMAP.md).*

Snapshot date: **2026-06-22**.

---

## The one-line story

A federation branch in IfcOpenShell proved IFC could become a queryable SQLite DB
**inside Blender** (Oct 2025). A Java compiler turned that into a repeatable
BOM→IFC pipeline with verification gates (Jan 2026). Then the realisation that *the
SQLite schema, not the Blender addon, was the portable part* moved the whole viewer into
a browser tab (Apr 2026) — and the browser engine outgrew its parent and split into its
own repo (May 2026), where the ERP kernel grew beside the BIM viewer.

Three runtimes were tried; **the data format survived all three.** That is the discovery.

---

## Milestones (dated, sourced)

| Date | Milestone | Where | Significance |
|------|-----------|-------|--------------|
| **2025-10-25** | "Fix critical scale bug (1000× error)" + coordinate offset fix | IfcOpenShell `feature/IFC4_DB` | The meters-vs-millimetres lesson — units/coords had to be pinned before anything rendered true. |
| **2025-10-30** | "Full IFC4 database extraction and loading — MILESTONE" | IfcOpenShell `feature/IFC4_DB` ([commit](https://github.com/red1oon/IfcOpenShell/commit/f410e32a13297355d8d5aed444ed176dd18e70a0)) | **True origin.** IFC → queryable SQLite, inside Bonsai/Blender. |
| **2025-11-01** | "Instant GPU bbox preview + two-button workflow (BREAKTHROUGH!)" | IfcOpenShell `feature/IFC4_DB` | Two-stage load (bbox preview → full geometry) — the first time large scenes felt instant. |
| **2025-12-18** | PDF Terrain + Federation GI database | IfcOpenShell `feature/IFC4_DB` ([commit](https://github.com/red1oon/IfcOpenShell/commit/bc76b7123ef8ebc73155fc20a4714f42eaec1029)) | DB-as-scene-data pushed past pure IFC — terrain + River IoT, run as *learning exercises*. |
| **2026-01-25** | BIM Compiler repo created (Phase 3+4 builders) | BIMCompiler `1702488d` | Work leaves Blender plugin → standalone Java/Maven compiler. |
| **2026-04-11** | Two-DB split born (BLOBs in `library.db`, hashes in `extracted.db`) | BIMCompiler `f116fdde` (S173) | Hash-addressed geometry dedup — survives every later runtime. |
| **2026-04-12** | Geometry Nodes halted | BIMCompiler `2bb9335e` (S175) | Blender's instancer hit a hard ceiling (~8 min/orbit at 500 trees). |
| **2026-04-18** | "Direct DB Streaming — no .blend files" | BIMCompiler `66fc9413` (S195) | **Bonsai out, browser in.** The schema was always the portable part. |
| **2026-04-20** | BIM OOTB: single HTML + two DBs + sql.js WASM | BIMCompiler `7a19d6e2` (S200) | 126K elements in a browser tab, zero install. |
| **2026-04-24** | IFC import in-browser via web-ifc WASM | BIMCompiler `788eb47c` (S220) | Round-trip closes: IFC → browser → same schema → viewer. |
| **2026-04-27** | InstancedMesh, 85% draw-call reduction | BIMCompiler `9cca45a3` (S231) | Hash-addressed schema pays off — instancing needed no schema change. |
| **2026-04-29** | `SQLite3D_Schema.md` published | docs | Schema formalised as a candidate open standard. |
| **2026-05-23** | bim-ootb split into its own repo | bim-ootb `69d1d63` | Browser engine outgrew the compiler parent. |
| **May–Jun 2026** | Kernel-ERP, DAGeVu modeller, Connect Scene, Genesis tenant, City Mode | bim-ootb | One continuous sprint; per-feature dates in PROGRESS.md / PR logs. |

---

## Performance, stated plainly (two different numbers, often confused)

These are two separate things — keep them apart:

- **1,065,130 elements (the sandbox city) → ~13 s** to draw as **GPU wireframe bounding
  boxes only**, zero mesh in RAM, then instant orbit. The full meshes are *not* loaded;
  exact IFC geometry streams on demand (<1 s per MESH press near the camera). Measured —
  see [`StressTest_1M.md`](StressTest_1M.md).
- **~126 K elements (LTU A-House) → ~10 s** to render the **full meshes to screen**
  (author's machine). This is real geometry, not bounding boxes.

So "a million in seconds" means *bounding-box preview*; "everything drawn" is the
six-figure, full-mesh number. Conflating the two would overstate the result — don't.

---

## By the numbers (commit counts are `git rev-list` / `git log` extractions)

### Phase ledger

| Phase | Span | Repo | Commits | Status |
|-------|------|------|--------:|--------|
| **Federation** (IFC-as-SQLite in Blender; Terrain, River IoT) | Oct 2025 – present | `red1oon/IfcOpenShell` `feature/IFC4_DB` | **414** authored by red1oon (316 touch the federation module) | 🔵 **Upstream / still live** — the federation branch remains available to the IfcOpenShell community. It was *not* dropped from the project; the author personally moved off the Blender renderer when migrating to browser-only SQLite WASM (S195). The SQLite schema carried forward. |
| **Java/Maven compiler** (IFCtoBOM, DAGCompiler 12-stage, RosettaStone G1–G6) | Jan 2026 – present | `red1oon/BIMCompiler` | **2,340** total | 🟡 **Maintenance / proof-only** — superseded as the *runtime*, retained as the round-trip *proof* (gates stable since May 2026) and as the ERP-engine source (`build/erp/`). |
| **Browser pivot → BIM OOTB** (Three.js + sql.js + web-ifc) | Apr 2026 | `red1oon/BIMCompiler` (S195–S271) | within the 2,340 above | ✅ Folded forward into bim-ootb. |
| **bim-ootb** (BIM viewer + Kernel-ERP, DAGeVu, Connect Scene) | May 2026 – present | `red1oon/bim-ootb` | **717** total | ✅ **Active / live** — the shipping product. |

### Monthly commit + fix activity

**`red1oon/IfcOpenShell` `feature/IFC4_DB`** — Federation (commits authored by red1oon)

| Month | Commits | Fix/bug commits | Feat/add commits |
|-------|--------:|----------------:|-----------------:|
| 2025-10 | 60 | 24 | 39 |
| 2025-11 | 161 | 75 | 68 |
| 2025-12 | 128 | 56 | 77 |
| 2026-01→03 | 13 | — | — |
| 2026-04 | 52 | — | — |
| **Total** | **414** | — | — |

**`red1oon/BIMCompiler`** (first commit 2026-01-25)

| Month | Commits | Fix/bug commits | Feat/add commits |
|-------|--------:|----------------:|-----------------:|
| 2026-01 | 30 | 7 | 9 |
| 2026-02 | 280 | 60 | 8 |
| 2026-03 | 717 | 99 | 44 |
| 2026-04 | 422 | 110 | 44 |
| 2026-05 | 521 | 195 | 223 |
| 2026-06 | 370 | 39 | 171 |
| **Total** | **2,340** | — | — |

**`red1oon/bim-ootb`** (first commit 2026-05-23)

| Month | Commits | Fix/bug commits | Feat/add commits |
|-------|--------:|----------------:|-----------------:|
| 2026-05 | 365 | 224 | 116 |
| 2026-06 | 352 | 89 | 224 |
| **Total** | **717** | — | — |

*Fix/feat counts are `git log --grep` matches on commit subjects (`fix|bug`, `feat|add`),
case-insensitive.*

**Do the fix + feat numbers add up to the "net real work"? No — read them as a texture, not a total.**
They are keyword matches on the commit *subject line*, so they (a) miss work whose subject said
`refactor`, `perf`, `optimize`, `docs`, `wire`, `bake`; (b) double-count nothing but also credit
nothing for size — a one-line typo fix and a 2,000-line feature each count as one; and (c) include
the occasional `Revert`/merge that is motion, not progress. The honest "net work done" signal is the
**total commit count** — each commit is one resolved, committed unit — with the fix/feat split telling
you *how the effort leaned that month* (e.g. Nov 2025 was fix-heavy = stabilising; May–Jun 2026 swung
feat-heavy = building). Lines-changed would be a finer measure, but commit-count is the one that
doesn't lie about effort.

---

## 2025 — the Federation year (where the hell was, and what it taught)

The whole idea was proven the hard way, inside Blender, across three intense months — **349 commits,
Oct–Dec 2025.** This is the part the later browser work stands on.

- **October (60 commits) — birth, and the unit war.** The federation module, BBox semantic geometry,
  a three-stage inference loader, material inference, GPU instancing, database-driven clash detection.
  The recurring enemy was coordinates: *"database uses meters not millimetres"*, *"Fix critical scale
  bug (1000× error)"*, multi-layer viewport offset fixes. Pinning units and the site offset was the
  precondition for anything to render true — a lesson that carried straight into the browser viewer.
  It culminates 2025-10-30 in *"Full IFC4 database extraction and loading — MILESTONE"*: IFC is now a
  queryable SQLite DB.

- **November (161 commits — the heaviest, hardest month) — stability and speed hell.** A
  *"template explosion crash"* in the loaders. A full week (Nov 2–3) wrestling gizmo click-crashes,
  registration, and context-menu handling. R-tree clash bugs. And a long string of brute
  optimisations — *"20-30× faster reload"*, *"5-10× speedup for routing and clash"* — fighting
  Blender's evaluation cost at scale. The reward came first, on **Nov 1**: *"Instant GPU bbox preview +
  two-button workflow (BREAKTHROUGH!)"* — the two-stage load (cheap bbox preview, then full geometry)
  that made big scenes feel instant. This month is *why* the eventual ceiling was recognised so
  quickly later: it was a month of finding exactly where Blender stopped scaling.

- **December (128 commits) — pushing the schema past IFC, as a learning exercise.** River IoT and PDF
  terrain were **deliberate exercises** — not a product line — run to learn how far the
  database-as-scene-data idea could stretch: OpenStreetMap river import, GPS/affine calibration,
  mangrove-islet monitoring, a carbon-credit/biochar pipeline, KML/Google-Earth export, terrain
  topology from PDF survey data. The takeaway wasn't the river; it was the confirmation that *anything
  spatial — geometry, sensors, terrain — folds into the same queryable DB*. That generalisation is
  what later made a building → procurement-order fold feel natural.

The through-line: 2025 proved the **schema** was the asset and Blender was only ever a renderer. Five
months of Blender ceilings made the April 2026 browser pivot obvious rather than risky.

---

## Status of each runtime — what changed, and why

- **Federation / Blender / Bonsai (🔵 upstream, still live — the *author* moved on, the
  work didn't die).** The federation branch lives in the IfcOpenShell community and remains
  usable. What changed was the author's *own* path: the original target was city-scale BIM
  federation *inside Blender*, and two hard ceilings made that the wrong runtime for him —
  Geometry Nodes hung the viewport at ~500 modifier trees (S175), and the `.blend`
  bake/save pipeline cost ~45 min per city and required every user to install and configure
  Blender. So at S195 (2026-04-18) he migrated to a browser-only SQLite WASM runtime.
  **What carried forward:** the SQLite geometry schema — the BLOB didn't care whether
  Python/Blender or JavaScript/browser deserialised it. Calling Federation "dropped" would
  be inaccurate; it's a handoff, not a death.

- **Java/Maven compiler (🟡 not dropped — demoted).** It is no longer the runtime, but it
  is *not* dead: the RosettaStone G1–G6 gates remain the authoritative proof that the
  pipeline round-trips IFC → BOM → compile → reconstruct losslessly, and `build/erp/` here
  is still the ERP-engine source of truth. Characterise it as **proven and in maintenance**,
  not deprecated. Do not reinvent its proofs in JS.

- **Everything browser-native (✅ active).** All current development is in `bim-ootb`.

---

## Sources

- `docs/VibeProgramming.md` — full narrative + the S165→S231 turning-point table
- `docs/ROADMAP.md` — shipped feature list (S200–S271)
- `bim-ootb/README.md` §history — the split-out account
- `git log` / `git rev-list` on both repos (run 2026-06-22) — all commit/fix counts
- IfcOpenShell `feature/IFC4_DB` branch commits — Federation origin dates
