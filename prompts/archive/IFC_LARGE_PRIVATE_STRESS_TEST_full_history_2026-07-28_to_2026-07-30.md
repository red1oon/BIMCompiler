# IFC_LARGE_PRIVATE_STRESS_TEST.md — full history (2026-07-28 to 2026-07-30)

Archived verbatim 2026-08-13, per the established closed-lane trim pattern (same as
`prompts/archive/CINEMA_PATH_EDITOR_full_history_2026-07-26_to_2026-08-03.md` /
`prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md`). This lane
(the KUL070 2GB-private-IFC stress test) is fully closed — see the short status block left in
`prompts/IFC_LARGE_PRIVATE_STRESS_TEST.md` for the summary and PR references. Nothing below is
edited from the original — this is the removed content, verbatim, for reference.

---

# ⚠ DO NOT REMOVE
**Scope:** ONE benchmark question — are the existing IFC-open code paths (Modeller's
`str_walker_outliner.js#_openIfcFile` and Viewer's `import.js#importIFC`) fit to open 3 very large
private-project IFC files (KUL070-SWC-01, staged at `~/bim-ootb/IFC/KUL/`), and what would break.
**Not in scope:** no extraction, no actual open/import run, no code changes to the import pipeline.
This is a static code-read against the files' sizes/names — PRIME RULE (EXTRACT OR COMPILE ONLY)
means don't invent an outcome; report what the code as-written would do, and flag what's unverified
because it wasn't run.
**Read the log after every run.** N/A this session — no run happened, only a code read. If this
benchmark is ever actually executed, log via `§`-tagged console output per `feedback_whitebox_...md`
— screenshots/eyeballing are not proof (`feedback_log_not_visual_proof.md`).

## §FILES (staged 2026-07-28)
Copied from `~/Downloads/` to `~/bim-ootb/IFC/KUL/` (gitignored — see below, never committed):

| file | size | name hints |
|---|---|---|
| `KUL070-SWC-01-XX-3D-E-0001 - CONTAINMENT.ifc` | 57 MB | cable/duct containment — non-ARC |
| `KUL070-SWC-01-XX-3D-E-0001 - EQUIPMENT.ifc` | 1.4 GB | plant/equipment — mostly non-ARC |
| `KUL070-SWC-01-XX-3D-E-0001-OVERALL.ifc` | 2.0 GB | likely the full multi-discipline model |

For scale: the IFC/ folder's own convention (`IFC/README.md`) tops out at 49 MB
(`Ifc2x3_SampleCastle.ifc`, and even that needed a real ARC-extraction pass before it could be a
resident). The KUL set is 1–2 orders of magnitude past anything this pipeline has been fitted or
tested against.

`IFC/KUL/README.md` documents the set in-place; `IFC/ifc_preflight_stats.sh` (committed,
[bim-ootb#1076](https://github.com/red1oon/bim-ootb/pull/1076) +
[#1077](https://github.com/red1oon/bim-ootb/pull/1077)) is the reusable script that produced the
numbers below.

## §ELEMENT_COUNTS + DISCIPLINE BREAKDOWN (real, EXTRACTed — not from a run)
Produced by `IFC/ifc_preflight_stats.sh`: one `grep -oE '=IFC[A-Z0-9]+\('` pass + one `awk` tally
per file, classified against the **exact same** `PRODUCT_TYPES`/`DISC_MAP` table
`viewer/import_worker.js` uses in-browser — no wasm parse, no browser, seconds not minutes even at
2GB (see the script header for its documented parity gaps vs. the real in-browser parse — this is
an upper-bound estimate, not a witnessed app run).

| file | STEP entities | elements (PRODUCT_TYPES) | discipline breakdown | scan time |
|---|---|---|---|---|
| CONTAINMENT.ifc (57MB) | 774,041 | 21,009 | MEP=21,009 | 1.3s |
| EQUIPMENT.ifc (1.4GB) | 26,103,308 | **292** | ARC=292 | 32.6s |
| OVERALL.ifc (2.0GB) | 37,716,099 | 66,214 | ARC=39,254, MEP=26,960 | 47.7s |

**The EQUIPMENT.ifc number is the standout finding:** only 292 elements, but 6.88M `IFCPOLYLOOP` /
6.78M `IFCFACE` / 5.37M `IFCCARTESIANPOINT` — ~23,500 raw mesh faces per element on average. This
file's cost isn't element *count*, it's a small number of monstrously-detailed tessellated B-rep
meshes (looks like scanned/heavy-CAD equipment geometry, not authored parametric IFC). That's a
different stress shape than OVERALL/CONTAINMENT's more ordinary element-count-driven load, and it
specifically exercises the wasm32 memory ceiling and Three.js geometry-buffer building per element,
not the element classification/DB-row-count side of the pipeline.

OVERALL.ifc's ARC=39,254 (not present at all in CONTAINMENT or EQUIPMENT's counts) confirms it's a
genuinely broader multi-discipline merge, not a re-export of the other two files.

## §UNIQUE_MESH_INSTANCING vs PLACED ELEMENTS (2026-07-28, clarifying a real Q&A)
Three different numbers get conflated easily — worth stating precisely, because a BVH/R-tree spatial
index and a mesh-instancing renderer each care about a different one of them:

- **TOTAL_STEP_ENTITIES (37.7M for OVERALL.ifc)** — every record in the raw file: points, face
  loops, property sets, relationships. This is parse-time data volume, **not** something that
  becomes individual scene objects — almost all of it gets consumed into geometry buffers during
  mesh building, never becomes a BVH leaf.
- **ELEMENT_COUNT (66,214 for OVERALL.ifc)** — instances of `PRODUCT_TYPES` (walls, doors, flow
  segments, etc.) — the actual placed objects. **This is what a BVH/R-tree indexes** — one leaf
  (bounding volume) per element, roughly. 66K leaves is unremarkable scale for a spatial index —
  R-trees/BVHs handle millions routinely.
- **UNIQUE_SHAPE_DEFS (6,524 for OVERALL.ifc, via `IFCREPRESENTATIONMAP`)** — distinct geometry
  definitions, each reused an average **10.9×** via 71,355 `IFCMAPPEDITEM` placements (the script's
  new `AVG_REUSE_PER_SHAPE` line, added in
  [bim-ootb#1077](https://github.com/red1oon/bim-ootb/pull/1077)). **This is the real "how many
  meshes do we store" number for instanced rendering** — a mesh-instancing renderer stores ~6,524
  geometry buffers once, then 66,214 elements each carry a lightweight transform + a reference to
  one of them.
  - **Caveat, stated plainly:** 6,524 is a **floor**, not the final answer — it only counts
    *explicit* block-references the CAD export already encoded. It does NOT include
    `IFCEXTRUDEDAREASOLID` direct/parametric solids (22,105 of them in OVERALL.ifc — typically
    walls/slabs/straight runs), each of which is unique-per-element in the raw file but could still
    coincidentally share identical geometry with another element — that only a real **content-hash**
    dedup (comparing actual vertex/face data, not source-file block-reference structure) would catch.
    Nothing here does that; it needs a real parse.

**Real precedent for what content-hash dedup actually finds — LTU_AHouse** (already shipped,
measured in `project_ltu_ahouse_memory_architecture.md`, verified again this session against the
live DB): **122,667 elements → 104,340 unique geometry rows** (`geo.db`'s `component_geometries`,
SHA256-hashed by `tools/extract.py`) — only **1.18× reuse**, i.e. LTU is mostly bespoke/unique
architectural geometry, low duplication. That's the opposite shape from OVERALL.ifc's raw 10.9×
block-reference reuse — but the two numbers aren't fully apples-to-apples (LTU's is a true
post-content-hash count; OVERALL.ifc's 6,524 is a pre-parse floor-estimate) — flagged, not resolved,
without an actual `tools/extract.py` run against KUL.

**The element-count comparison that actually matters:** LTU_AHouse's 122,667 placed elements is
**already ~1.85× more than OVERALL.ifc's 66,214** — and LTU is live, shipped, and its earlier perf
investigation found the bottleneck was sql.js whole-file memory residency (440MB resident), not
element count or the render/draw-call path (DLOD+BatchedMesh already solved that, 8× draw-call
reduction). **By element count, KUL is not a bigger stress case than what's already in production.**

## §OFFLINE_EXTRACT_ALTERNATIVE — the actual answer to "how do we handle it"
Everything in §RISK FINDINGS (wasm32 4GB ceiling, IndexedDB ~1GB ceiling, main-thread DB-build
stall) is specific to the **live browser wasm import path** (`viewer/import_worker.js`,
`web-ifc@0.0.77`). LTU_AHouse never went through that path at this scale — it was built by
**`tools/extract.py`** (this repo, bim-compiler), which tessellates via **`ifcopenshell`** (a
mature native library, not wasm32-memory-bound) and does real SHA256 `geometry_hash` dedup
(`geometry_hash(vertices_blob, faces_blob)`, confirmed reading the script directly). That's the
same tool/pattern that produced LTU's working 122,667-element, 104,340-unique-geometry split DB.

**This reframes the whole benchmark:** routing KUL070 through `tools/extract.py` (offline,
server/CLI-side, once) — the same way LTU was built — sidesteps every browser-side risk in §RISK
FINDINGS entirely, and would produce the REAL content-hash-deduped unique-mesh count (not the
6,524 floor-estimate above) for a true KUL vs LTU comparison. The live-browser wasm import
(§TASK below) is still worth running as its own stress test of that specific code path, but it is
NOT the only — or even the proven — way to get KUL usable in the Viewer.

## §MESH_LIBRARY_ARCHITECTURE — geo.db vs mesh.db vs component_library.db (2026-07-29, real Q&A)
A live question surfaced a conflation worth pinning down precisely — verified by reading the actual
builder scripts, not assumed:

- **Per-building `geo.db`** — automatic on any extraction (either path in §OFFLINE_EXTRACT_ALTERNATIVE),
  SHA256 `geometry_hash` dedup **within that one building's own import only**.
- **`modeller/mesh.db`** — real cross-building dedup (global `geometry_hash` PRIMARY KEY, `INSERT OR
  IGNORE` gated by a `seen` set across buildings), but built by a **one-off manual Node script**,
  `prompts/Modeller/DISC_Walker/embed8_scripts/finalize_all_8.js` (this repo), run once 2026-07-09
  over 8 already-extracted residents. **Not a standing pipeline stage** — onboarding a 9th building
  (`Ifc4_Revit`) was deliberately left OUT of it (`RESUME_MESH_DEDUP_AND_ONBOARDING.md`). Its
  cross-building dedup payoff is documented as near-zero for 3 of the 8 current residents (unrelated
  buildings rarely share geometry by chance) — so simply adding KUL wouldn't automatically "pay off"
  either, without a real content-overlap check first.
- **`component_library.db`** (`library/component_library.db`, `deploy/component_library.db`) — the
  actual "deep indexing for reuse" system: `component_types`/`component_definitions` (attachment_face,
  orientation, default_rotation) + `placement_rules`, a genuine reusable-component catalog with
  placement metadata, not just raw geometry. **Belongs to a different, deliberately-separated
  pipeline** — bim-compiler's sandbox/City generator (`scripts/build_sandbox_1M.py` →
  `scripts/extract_per_building.py`) → Viewer's `deploy/buildings/*_library.db` catalog — NOT the
  Modeller's `mesh.db`. A prior session conflating the two was explicitly corrected ("STICK TO
  MODELLER ONLY", `RESUME_MESH_DEDUP_AND_ONBOARDING.md` §SCOPE-DRIFT WARNING). The only bridge
  between them is `scripts/project_device_meshes_to_meshdb.py`, a narrow 26-device patch tool.

**Implication for KUL:** extracting it produces `geo.db` automatically (per-building dedup, real).
Getting the resulting shapes into `mesh.db` OR `component_library.db` is a separate, currently
manual step that doesn't exist as a standing pipeline for any new building today — same pattern as
`finalize_all_8.js`/`project_device_meshes_to_meshdb.py` were each written to do once, by hand.
EQUIPMENT.ifc's ~194 unique detailed equipment shapes (§UNIQUE_MESH_INSTANCING) are the more
plausible target for `component_library.db` specifically — real vendor-detail LOD400 geometry is a
scarce input for that catalog today (most of it is from open datasets, not real equipment) — not
`mesh.db`, whose value is architectural-family reuse across buildings, less likely for MEP equipment.

## §CODE PATHS (as they exist today, unmodified)
Two independent open paths share the same worker/parser but diverge sharply in fitness:

**Modeller** — `modeller/str_walker_outliner.js#openIfcFile` (L225-257):
- Single-file `<input type=file accept=".db,.sqlite,.ifc">` picker (`modeller.html` L4724) — no
  `webkitdirectory`, no folder scan. `IFC/` entries only surface via a hand-maintained whitelist
  array (`ifcSources`, `modeller.html` L4695-4698) that currently lists only SampleHouse/Duplex —
  KUL is **not** wired in and won't appear in the Open chooser as-is.
- `_filterArc()` (L212-224) **always** drops every element whose discipline classifies as non-ARC
  before building the DB — a hard VISION-LOCK invariant (`docs/WalkerDoctrine.md`), not a toggle.

**Viewer** — `viewer/import.js#importIFC` (L143-263):
- Accepts any dropped/picked file, multi-discipline, no filter — this is the fit-for-purpose path
  for CONTAINMENT/EQUIPMENT/OVERALL, not the Modeller.
- Size-tier UI text only at 50 MB / 200 MB ("large file, please wait…") — no hard cap, no reject.
- `buildImportDBs()` runs **synchronously on the main thread** after the worker returns the parsed
  structure (worker only does the wasm parse) — a GB-scale parse result could stall the tab during
  DB build even though parsing itself is off-thread.
- IndexedDB save already carries a documented ceiling in-code (`§MULTI_DB_ERROR` comment, L190-192):
  "IndexedDB's ~1GB structured-clone limit" — meta+geo combined must stay under ~1GB or storage
  silently fails.

Both paths funnel through `viewer/import_worker.js`, which loads `web-ifc@0.0.77` — the local
`lib/web-ifc.wasm` is 1.3 MB, consistent with the standard single-threaded 32-bit build (wasm32
linear memory is architecturally capped at 4 GB; typical parse peak is a multiple of raw file size
because the raw bytes are copied at least 3× — `file.arrayBuffer()` on the main thread, the
transferred copy the worker receives, and the wasm heap's own internal copy — before geometry
buffers are even built).

## §RISK FINDINGS (score = how likely this breaks the KUL files specifically, 0-10)
9 — **wasm32 4GB ceiling vs 2.0GB OVERALL.ifc.** Raw bytes alone are half the wasm32 address space;
   parse-time geometry tessellation commonly multiplies working memory 2-3× the source size on
   web-ifc. A crash/OOM inside the worker, not a clean error, is the likely failure mode — unverified,
   nothing was run.
8 — **IndexedDB ~1GB structured-clone ceiling, already a known bug in this exact code path**
   (`§MULTI_DB_ERROR` comment). EQUIPMENT (1.4GB) and OVERALL (2.0GB) source files will very likely
   produce meta+geo DBs that individually or combined exceed 1GB, hitting a documented failure mode.
7 — **Modeller path is the wrong tool for 2 of the 3 files.** EQUIPMENT/CONTAINMENT are non-ARC by
   name — `_filterArc()` would burn the full multi-GB parse only to discard nearly all of it. Any
   real test must go through the Viewer's `importIFC`, not the Modeller's Open chooser.
6 — **No hard size cap or early reject anywhere in the pipeline.** The only signal at this scale is
   cosmetic UI text ("may take a few minutes") — there's no fast-fail for a file the pipeline
   structurally can't finish, so a bad run wastes full parse time before surfacing a failure.
5 — **Main-thread DB build after worker parse.** Even if the wasm parse survives, `buildImportDBs`
   running synchronously on the main thread against a GB-scale result risks a long tab freeze.
2 — **KUL not wired into any Open chooser.** Lowest risk, cheapest fix if ever pursued — Viewer opens
   arbitrary local files by design (drag-drop/file-input, no whitelist), so this only blocks the
   Modeller's curated chooser, which is the wrong path for these files anyway.

## §VERDICT
0/10 fit for the Modeller's Open path (ARC-only filter defeats the purpose for 2 of 3 files, and
KUL isn't in its whitelist regardless). 2/10 fit for the Viewer's Open/drag-drop path as the code
stands today — the path is architecturally correct (multi-discipline, no filter) but everything
downstream of the wasm parse (worker memory ceiling, IndexedDB storage ceiling, main-thread DB
build) is sized for the existing resident set (single-digit-to-double-digit MB), not GB-scale
private-project files. Nothing here was run — every number above is a static-code + file-size
inference, not a witnessed result. **These verdicts are scoped to the live-browser wasm path
specifically** — see §OFFLINE_EXTRACT_ALTERNATIVE for the other, likely more viable, route (the
one LTU_AHouse actually shipped through at a bigger element count).

## §TASK: PERF_SIZING_INVESTIGATION — ASSIGNED, OPEN (2026-07-28)
The static read above (§CODE PATHS, §RISK FINDINGS) and the real element/discipline counts
(§ELEMENT_COUNTS) are done. What's still open is the thing neither can answer: **does the Viewer's
`importIFC` actually survive loading+viewing these files, and what does it cost (time, memory,
where it breaks)?** That requires a real browser run — not attempted this session per the original
"do not extract, check the open folder code" instruction, which this task now supersedes for the
next session/pickup.

**Acceptance criteria (per file, log via `§`-tagged console output — numbers, not screenshots,
per `feedback_log_not_visual_proof.md`):**
- wall-clock time from file-pick to `§IMPORT_SAVED` (or the failure point, whichever comes first)
- peak tab memory (DevTools Performance/Memory panel or `performance.memory` if available)
- whether `§MULTI_DB_ERROR` / IndexedDB save failure fires (§RISK FINDINGS score 8)
- whether the worker OOMs/crashes before `done` (§RISK FINDINGS score 9) — for EQUIPMENT.ifc
  specifically, watch whether the 292-element/6.8M-face shape stresses geometry-buffer building
  differently than element count alone would predict
- whether the tab visibly stalls during the main-thread `buildImportDBs()` step (§RISK FINDINGS
  score 5) — measure it, don't eyeball it (e.g. time the gap between `done` and `§IMPORT_SAVED`)

**Run order (smallest/safest first, stop escalating on a hard failure rather than retry-looping):**
1. `CONTAINMENT.ifc` (57MB, 21,009 elements) — closest to the pipeline's tested range, expect this
   one to work; establishes the baseline log shape for the two below.
2. `OVERALL.ifc` (2.0GB, 66,214 elements) — ordinary element-count-driven load at GB scale.
3. `EQUIPMENT.ifc` (1.4GB, 292 elements / 6.8M faces) — the mesh-density stress case, test last
   since it's the one most likely to hit the wasm32 ceiling per §RISK FINDINGS score 9.

**Fix scope is explicitly OUT of this task** — if the ~1GB IndexedDB ceiling or the wasm32 memory
ceiling is hit, that's a real pipeline change (streaming/chunked parse, or a hard size-based reject
with a clear message), named as its own follow-on, not folded into this investigation.

## §TASK: OFFLINE_EXTRACT_TRIAL — IN PROGRESS (started 2026-07-29)
Correction: the right tool is **`DAGCompiler/python/extractIFCtoDB.py`**, not `tools/extract.py` —
`extract.py`'s `--to library`/`--to reference` modes build the component catalog / Rosetta
reference, not a full per-building elements+geometry DB. `extractIFCtoDB.py` is the "IFC → full
reference DB in one pass" tool (spatial structure + geometry + materials + transforms), same shape
as the LTU_AHouse-class residents. Run with `--dry-run` first each time, then for real, output to
scratchpad (not `library/component_library.db` — this is a stress test, not a real catalog
contribution until deliberately promoted per §MESH_LIBRARY_ARCHITECTURE).

**CONTAINMENT.ifc (57MB) — DONE, fully clean:**
- 21,009 elements, 0 failed, 7/7 proof checks PASS (SCALE, MESH_SCALE, DEDUP, ROT_TRUTH, FAIL_RATE,
  VOID_CONSUMED, MATERIALS) — matches the preflight-script element count exactly (cross-validates
  both tools).
- **Real content-hash dedup: 13,152 unique hashes / 21,009 instances = 1.6× reuse (37% savings)** —
  this replaces the §UNIQUE_MESH_INSTANCING floor-estimate (which only counted explicit
  `IFCMAPPEDITEM` block-refs, 4.8× for this file) with the true post-tessellation number; content-hash
  dedup catches real duplicates the raw file structure alone doesn't reveal.
- By class: IfcFlowSegment=11,441, IfcFlowFitting=9,568 (matches preflight exactly). MEP=21,009.
- 56.7MB IFC → 38.5MB extracted.db, **50.1s wall-clock total** (34.3s geometry iterate + dedup/proof/write).
- None of §RISK FINDINGS 8/9 (IndexedDB ceiling, wasm32 ceiling) apply — this path doesn't touch
  either.

**EQUIPMENT.ifc (1.4GB, the 292-element/6.8M-face stress shape) — DONE, succeeded but confirms the
predicted cost shape:**
- 292 elements, 0 failed, 7/7 proof checks PASS. All classified `IfcBuildingElementProxy` → ARC
  (matches the preflight prediction exactly).
- **The geometry iterator alone took 3,916s = 65.3 minutes for 292 elements** (`§ITER done: 292
  elements in 3916.0s (0 elem/s)` — the per-element rate is genuinely sub-1/s, not a rounding
  artifact). Sample mesh vertex counts up to 37,866 for a single element. **This is the real cost
  signal §RISK FINDINGS predicted: per-element mesh density, not element count, drives time.**
  292 elements here cost ~78× longer than CONTAINMENT's 21,009 elements (65.3min vs 34.3s iterate
  time) — a >47,000× worse elements/second rate.
- Real content-hash dedup: **151 unique hashes / 292 instances = 1.9× reuse** — lower unique-count
  than the raw-file floor-estimate (194 via `IFCREPRESENTATIONMAP`), confirming content-hash dedup
  finds MORE true duplicates than explicit block-references alone reveal.
- 1394.2MB IFC → 128.8MB extracted.db (~10.8× size reduction). Total wall-clock: **67m44s**.
- **Succeeded with zero failures** — ifcopenshell handled the dense-mesh shape the browser wasm
  path was flagged as most likely to crash on (§RISK FINDINGS score 9). The cost here is pure time,
  not a hard ceiling — a materially better failure mode than an OOM/crash, but 68 minutes for one
  file of a 3-file set is still a real cost to plan around, not a "just works" result.

**OVERALL.ifc (2.0GB, 66,214 elements) — ⛔ OOM-KILLED at 66% (44,000/66,214), see §CRASH below
for the root cause + the guarded relaunch recipe.** Was launched in background (after EQUIPMENT
completed, sequential for clean timing), log at `scratchpad/kul_extract/overall_real.log`. Its
per-element geometry density is far lower than EQUIPMENT's (9.6M polyloops ÷ 66,214 elements ≈ 146
polyloops/element average, vs EQUIPMENT's ~23,500/element) so it's expected to track closer to
CONTAINMENT's elements/second rate than EQUIPMENT's — but that is an expectation, not yet a
measured result.

## §CRASH — OVERALL.ifc run OOM-killed the whole terminal (2026-07-29 03:40:03, root-caused)
The OVERALL.ifc background run did NOT fail on its own — **`systemd-oomd` killed
`gnome-terminal-server.service`, all 18 processes in the unit**, taking the extraction AND every
terminal tab (including the live Claude session) with it. Evidence from `journalctl`, verbatim:

```
Jul 29 03:40:03 systemd-oomd: Path: .../app-org.gnome.Terminal.slice/vte-spawn-bd6c620e-....scope
Jul 29 03:40:03 systemd-oomd:       Current Memory Usage: 19.6G          ← the KUL OVERALL extraction
Jul 29 03:40:03 systemd-oomd: Killed .../gnome-terminal-server.service due to memory pressure for
                              /user.slice/user-1000.slice/user@1000.service being 63.70% > 50.00%
                              for > 20s with reclaim activity
Jul 29 03:40:03 systemd[1815]: gnome-terminal-server.service: systemd-oomd killed 18 process(es)
```
Co-resident at kill time: Chrome 3.9G, Firefox 1.4G, gnome-shell 181M. Machine is 29Gi RAM + 8Gi
swap (5Gi already used). **No kernel OOM-killer entry in `dmesg`** — this was userspace `oomd`
acting on *pressure*, not an allocation failure, which is why nothing in the extractor logged a
Python `MemoryError`; the process was SIGKILLed mid-write (a 2.1MB `-journal` was left behind,
rolled back cleanly on next open — DB `pragma quick_check` = ok).

**Why 19.6G — this is inherent, not a leak.** `extractIFCtoDB.py` already streams its DB writes
(periodic `conn.commit()`, L1482/L1518) — the memory is `ifcopenshell.open()` holding the entire
STEP model resident. Against §ELEMENT_COUNTS: OVERALL.ifc = 37.7M entities → 19.6G observed ≈
**520 bytes/entity**; EQUIPMENT.ifc = 26.1M entities → ~13.6G by the same ratio, which is why it
survived (68 min) on the same machine. **RAM scales with TOTAL_STEP_ENTITIES, not element count** —
the same distinction §UNIQUE_MESH_INSTANCING drew for the renderer applies to the extractor's RAM.
Projected peak for a *complete* OVERALL run: **~22–24G** (19.6G was reached at 44,000 / 66,214
elements = 66% through the iterate). It does not fit on this machine alongside a browser.

### §CRASH_MITIGATION — two independent fixes, both required
1. **Never run a multi-GB extraction as a plain child of the terminal.** oomd's kill unit is the
   *whole* `gnome-terminal-server.service`, so one runaway job takes down every unrelated tab. Run
   it in its own transient unit so oomd/kernel can only kill *it*, and so a terminal crash can't
   kill the job either:
   ```
   systemd-run --user --unit=kul-overall --same-dir \
     -p MemoryHigh=20G -p MemoryMax=24G -p MemorySwapMax=8G \
     python3 DAGCompiler/python/extractIFCtoDB.py <args>
   # follow: journalctl --user -u kul-overall -f
   ```
   (`--user` service, not `--scope`: detached from the terminal on both sides.)
2. **Free the browsers first.** 5.3G of Chrome+Firefox is the difference between ~22G fitting in
   29G and not. Close them before the run — do NOT `pkill` a shared Chrome
   (`feedback_dont_pkill_shared_chrome.md`), ask/close cleanly.

Even with both, a complete OVERALL run is **marginal** (~22–24G peak vs 29G total). If it OOMs
inside its own capped unit, that is a clean, contained failure — and the real answer becomes
splitting the file (extract per-discipline sub-models) or a bigger-RAM host, named here as its own
follow-on, not folded into this task.

## §RECOVERY (2026-07-29, post-crash) — what survived, and where the DBs are now
All three extracted DBs survived the kill and pass `pragma quick_check`:

| DB | elements_meta | base_geometries (unique hashes) | size | state |
|---|---|---|---|---|
| `KUL_CONTAINMENT_extracted.db` | 21,009 | 13,152 | 38.5MB | **COMPLETE** |
| `KUL_EQUIPMENT_extracted.db` | 292 | 151 | 128.8MB | **COMPLETE** |
| `KUL_OVERALL_partial_extracted.db` | **44,000** of 66,214 (66%) | 4,897 | 99MB | **PARTIAL** — killed mid-iterate; missing the `site_normalization` table (the extractor's last step), so treat placements as un-normalized |

Staged for opening (originals still in the crashed session's scratchpad,
`.../a932aabd-.../scratchpad/kul_extract/`):
- `~/bim-ootb/buildings/` — the canonical local copy.
- `/tmp/wt-sandbox/buildings/` — the standing localhost:8399 sandbox
  (`reference_bim_ootb_sandbox.md`); all three verified HTTP 200 on a Range request.

Viewer URLs (`?db=…&bld=…` convention):
```
http://localhost:8399/viewer/viewer.html?db=buildings/KUL_CONTAINMENT_extracted.db&bld=KUL_CONTAINMENT
http://localhost:8399/viewer/viewer.html?db=buildings/KUL_EQUIPMENT_extracted.db&bld=KUL_EQUIPMENT
http://localhost:8399/viewer/viewer.html?db=buildings/KUL_OVERALL_partial_extracted.db&bld=KUL_OVERALL_partial
```

## §KUL001 — the extractor omits `elements_meta.building`; every KUL DB rendered ZERO geometry
**Witnessed, not inferred** (headless viewer load of all three staged DBs, mesh/tri/vert counts
polled from real scene state — no screenshots): all three reached `§DB_LOADED` and then rendered
**`meshes=2 tris=14 verts=28` after 180s** — the ground + sky helpers only, no building geometry.

Root-cause chain, every link §-witnessed, **zero viewer code involved**:
```
§HELPERS_QUERY_ERR no such column: m.building        ← viewer/streaming.js:1946 centres query
§CENTRES_RESULT rows=0  →  [S192] §BOOTSTRAP centres=0
A.startStreaming() (streaming.js:25-37) loops Object.entries(A.buildingCentres);
   empty ⇒ nearest === null ⇒ bare `return` with NO log line
```
That silent early return is why the console goes dead after `§BBOX_PAINT_YIELD` and never reaches
`§DS_AUTO_START` — the symptom reads like a geometry/size failure and is neither.

**The real gap is upstream, in this repo:** `DAGCompiler/python/extractIFCtoDB.py` never writes
`elements_meta.building` (verified by reading the script — it has `building_type` for
`component_library`/rules rows, but no `elements_meta.building` write). The two existing residents
built on that SAME extractor schema (`id,guid,discipline,ifc_class,element_name,element_type,
storey,…`) DO carry the column, populated by a later pipeline step as `T0_<name>`:
`LTU_AHouse` → `T0_LTU_AHouse` ×125,698, `Terminal` → `T0_Terminal` ×48,428. KUL is simply the
first building opened straight from the extractor without that post-step. **Any future
`extractIFCtoDB.py` output will hit this identically** — the durable fix is in the extractor, named
here as its own follow-on (NOT done — needs the user's go, and it is a compiler change, not a
viewer one).

### §KUL001_FIX — self-heal patch (the sanctioned route; no `.db` binary edited, no viewer change)
Wrote `viewer/buildings/patches/KUL_{CONTAINMENT,EQUIPMENT,OVERALL_partial}_extracted.db.sql`
(bim-ootb) — the path `scene.js A._applyPendingPatch` was *already* probing, which is what the
`§PATCH_NONE … (404)` line in the pre-fix log actually was:
```sql
ALTER TABLE elements_meta ADD COLUMN building TEXT;
UPDATE elements_meta SET building = 'T0_KUL_CONTAINMENT';
```
Applied on every load against the RAW server bytes (the IDB cache stores unpatched bytes), so the
`ALTER` always meets a pristine copy — cache-proof, and a loader exec failure is swallowed rather
than blocking the open.

**Post-fix witness — all three render:**

| DB | §PATCH_APPLY | centres | queued elements | meshes | triangles | draw calls | load ms |
|---|---|---|---|---|---|---|---|
| CONTAINMENT | ✅ 1906 B | 1 | 21,009 | 531 | 378,626 | 43 (was 500) + 102 (was 2,509) | 22,436 |
| OVERALL_partial | ✅ 1939 B | 1 | 44,000 | 1,094 | 9,009,949 | 25 (was 500) + 47 (was 1,500) | 281,943 |
| EQUIPMENT | ✅ 1921 B | 1 | 292 | 35 | 8,799,960 | 33 (was 292) | 64,370 |

DLOD engages on the two big ones (`§DLOD_ENABLE count=21009/44000 mode=per_slot_frustum`;
`§DLOD_TICK ms_mean=0.90 / 4.90`) and correctly skips EQUIPMENT (`§DLOD_SKIP count=292 < 5000`).
**EQUIPMENT confirms §ELEMENT_COUNTS' thesis end-to-end in the renderer too: 292 elements carry
8.8M triangles — 30,137 tris/element, vs CONTAINMENT's 18.** Per-element mesh density, not element
count, is this dataset's cost driver at every stage (extract time, and now render).

### §KUL001_SITE_OFFSET — the partial OVERALL is NOT site-normalized (artifact of the crash)
`site_normalization` is the extractor's last step, so the OOM-killed OVERALL run never wrote it:
- CONTAINMENT: `offset_x=-2942.606 offset_y=-14421.428` → centres land at ~(0, 0, 7.0) ✅
- EQUIPMENT: `offset_x=-2952.522 offset_y=-14423.624` → centres ~(0, 0, 5.1) ✅
- OVERALL_partial: **table absent** → centres `(-2952.00, -14416.70, 71.26)`, i.e. ~14.7 km from
  origin — a float-precision/z-fighting risk, and it will not co-register with the other two.

Useful side-finding: CONTAINMENT's and EQUIPMENT's offsets agree to within ~10 m, so **the three
KUL files share one site coordinate system** — they are federatable once OVERALL completes.

## §KUL002 — why KUL renders TRANSLUCENT when no other building does (zero envelope classes)
User observation that forced this: *"I never seen translucent on other buildings as U said."* They
were right — an earlier claim in this session that Terminal/LTU/Hospital hit the same cap was
**WRONG** and is retracted here. The real cause is a data property of KUL, not a shared code cap.

`navigate_find.js:3645` — the Find-panel group-select branch:
```js
if (!_shell && (window._isMobile || _isLargeBuilding())) {          // large = >25,000 elements
  var _mg = _buildMergedGhost();
  if (_mg) { _mg.visible = true; _shell = true; ... §BBOX_SHELL_DEFAULT ... }
}
if (!_shell && !A.xrayOn && A.toggleXray) { A.toggleXray(); }        // ← x-ray path: rest → transparent
```
A large building is *supposed* to get the **bbox wireframe ghost** (`§BBOX_SHELL_DEFAULT Find→bbox
(no heavy x-ray)`), never the x-ray dim. `_buildMergedGhost()` builds that ghost from
**envelope classes only** — `_isEnvelope()` at line 1521 matches
`/^Ifc(Wall|Slab|Roof|CurtainWall|Covering|Plate)/`. KUL has **none of them**:

| building | total elements | envelope elements | Find group-select path |
|---|---|---|---|
| **KUL_OVERALL_partial** | 44,000 | **0** | ghost null → **x-ray dim (translucent)** |
| **KUL_CONTAINMENT** | 21,009 | **0** | (under 25k, x-ray anyway) |
| **KUL_EQUIPMENT** | 292 | **0** | (under 25k) |
| Terminal | 48,428 | 34,446 | bbox ghost ✅ |
| Hospital | 63,415 | 4,518 | bbox ghost ✅ |
| LTU_AHouse | 125,698 | 28,569 | bbox ghost ✅ |
| Clinic | 16,114 | 1,587 | (under 25k) |
| JKR | 8,985 | 1,087 | (under 25k) |

KUL070 is a pure MEP/plant datacentre model — `IfcBuildingElementProxy`=26,078,
`IfcFlowFitting`=7,249, `IfcMechanicalFastener`=6,689, `IfcFlowSegment`=3,984. No walls, no slabs,
no roof. So `[MG] §BBOX_GHOST_EMPTY rows=44000` fires, `_shell` stays false, and it falls through
to `§XRAY_DIM opacity=0.2`. **It is the first resident that is large AND envelope-less** — that
combination has never occurred in the fleet before, which is exactly why this was never seen.

**`_HL_CAP` is a SECOND, independent effect, not the reason it looks different from other
buildings.** `_HL_CAP = 4000` (`navigate_find.js:1394`, introduced 2026-06-04, PR
[bim-ootb#121](https://github.com/red1oon/bim-ootb/pull/121)) caps the *solid* re-draw of the
selection itself: `Architecture` focus=32,767 → solid=4,000; `MEP` focus=11,233 → solid=4,000;
`Hilti – Plastic, red` focus=20,048 → solid=4,000; while every selection ≤4,000 (`0.0 - G.F.L`=409,
`0.0 GF`=622, `0.5 - MEZZ F.L`=175) comes back 100% solid. Two notes on it:
- The constant was written for `_hlOverlay` (ONE InstancedMesh, one unit box per element — cost is
  linear in element count). `_buildShapeMeshes` arrived the NEXT day (2026-06-05, PR
  [#130](https://github.com/red1oon/bim-ootb/pull/130)) and reused the same constant, but that path
  is **instanced by geometry hash** (4,897 unique hashes for 44,000 elements here) — so the cap is
  measuring the wrong quantity for that path.
- Its own comment says *"no silent truncation — §-logged"*, but only the box path (line 1473) emits
  `CAPPED@`; the shape path (line 1954) truncates with **no log at all**. That is why this first
  read as a data problem.

**Not fixed — all three candidate fixes are core-Viewer changes and the user has explicitly reserved
that call:** (a) widen `_isEnvelope()` so a plant/MEP model can build a ghost from its own dominant
classes, (b) cap on unique hashes rather than element count in `_buildShapeMeshes`, (c) add the
missing `CAPPED@` log to the shape path. (a) is the one that actually explains KUL vs the fleet.

## §KUL003 — why OVERALL fails when LTU_AHouse (1.85× MORE elements) never did
**LTU was never one file.** `internal/UNMERGED/` holds it as **9 per-discipline IFCs** — ARC
172.9MB, PLB 69.6MB, HEAT 32.6MB, STR 30.9MB, COOL 30.8MB, SAN 25.7MB, AIR 24.2MB, VOID 24.1MB,
DUCT 8.0MB (419MB total, **largest single file 172.9MB**). `LTU_AHouse_ARC.ifc` is 3,527,143
entities ≈ **1.8GB resident** — **10.7× smaller than OVERALL.ifc's 37.7M / ~19-21GB**, despite LTU
having 122,667 elements vs OVERALL's 66,214.

**RAM tracks STEP ENTITIES, not elements** — the same distinction §UNIQUE_MESH_INSTANCING drew for
the renderer. LTU is parametric (extruded solids); KUL is explicit faceted B-rep, so KUL spends
~570 entities per element where LTU spends ~29.

And this is the fleet-wide pattern, not a one-off: **every resident was onboarded per-discipline.**
Hospital = 7 files (largest 76.6MB), Clinic = 5 (largest 53.2MB), Duplex, Ifc4_Revit, HHS likewise;
there is even a `merged_federation.ifc` at 205.9MB — an order of magnitude under OVERALL. **KUL
OVERALL.ifc is the first single merged federation file ever fed to this pipeline whole, and the only
one that has ever failed.** Its own siblings CONTAINMENT.ifc and EQUIPMENT.ifc ARE the
per-discipline files — both extracted clean. Nothing is broken; the input violated an unwritten
fleet convention, now written down here.

Second OOM (2026-07-29 06:22, `kul-overall2`, `MemoryMax=26G`, machine otherwise idle at 7.5GiB):
`Result=oom-kill` at **45,000/66,214**, and the rate had already collapsed — 40,000 elements in 45s
(898 elem/s) then 1,505s for the next 5,000 (**30 elem/s, a 30× fall**) as it went into swap thrash.
Even unlimited swap would take days, not hours. Brute force is settled: two runs, two ceilings.
**NOTE the first run's own mistake — `MemoryHigh=20G` was a THROTTLE, not a guard**: crossing it
triggers aggressive reclaim, which is why run 1 did 40,000 in 49s then sat at 20.5GB for 24 minutes
doing nothing. Use `MemoryMax` alone: full speed, hard stop.

**Projected full-DB size (two real data points, deliberately not narrowed further):**
44,000 elements → 4,897 hashes → 77.0MB blobs; 45,000 → 5,155 → 84.1MB. The marginal segment costs
**7.1 KB/element against a running average of 1.79 KB/element** (the tail is ~4× denser), so:
average-rate floor ≈ **150MB**, marginal-rate ceiling ≈ **280MB**, best estimate **~200MB** — an
ordinary size, between JKR (203MB) and Hospital (263MB), both already resident. The output was never
the problem; the fully-resident `ifcopenshell.open()` is.

## §KUL004 — `strip_ifc_nonessential.py` (STANDARD, reusable) + the preflight rule
`DAGCompiler/python/strip_ifc_nonessential.py` — streaming, 3-pass, two tiers, proven lossless.
(Supersedes and replaces the first-cut `strip_ifc_psets.py`, deleted — one script owns this topic.)

**What is "non-essential" is DERIVED from `extractIFCtoDB.py`, not guessed.** That script consumes
only: IfcProduct + geometry, IfcLocalPlacement, IfcMappedItem, IfcBooleanResult, the spatial chain,
materials, styles, IfcRelVoidsElement/IfcRelFillsElement, IfcRelDefinesByType. Two verified drops:
- **Property sets** — `extractIFCtoDB.py:1326` walks `elem.IsDefinedBy` but matches ONLY
  `IfcRelDefinesByType`; `IfcRelDefinesByProperties` is never touched and no properties table exists.
- **Ports** — `port_elements`/`port_connections` are CREATED but never INSERTed into (verified:
  all three KUL DBs report `port_elements=0 port_connections=0`), and `IfcDistributionPort` is in
  the extractor's own `NON_GEOMETRIC_CLASSES`.

**Measured on KUL CONTAINMENT.ifc:**

| tier | entities removed | file |
|---|---|---|
| `--tier meta` (psets/quantities) | 150,253 / 774,041 = **19.4%** | 56.7 → 43.7 MB (**-23.0%**) |
| `--tier model` (+ ports, classifications, documents, groups/systems/zones, presentation layers, annotations, space boundaries, element connections) | 255,774 / 774,041 = **33.0%** | 56.7 → **31.1 MB (-45.2%)** |

**Losslessness PROVEN, not asserted** — extracting the `--tier model` output vs the original DB:
`guid sets identical: True` · `geometry hash sets identical: True (13152 vs 13152)` ·
`material rows identical: True` · `transform centres identical: True` · 7/7 proof checks PASS.

Safety design: pass 2 rescues any candidate still referenced by a retained line (rescued 2 in the
meta tier, 1 in the model tier — the net is real, not decorative); `--sweep N` then retires pure
support entities (placements/points/directions/owner-history) only once nothing references them,
running to fixpoint.

**§PREFLIGHT RULE — run before extracting ANY unfamiliar IFC:**
```
strip_ifc_nonessential.py IN.ifc --stats-only     # histogram + RAM forecast @ 520 bytes/entity
```
  - `< 40%` of free RAM → extract directly
  - `40-70%` → strip first, if the histogram shows heavy psets/quantities/ports
  - `> 70%` → do NOT run whole; split per discipline (the fleet convention, §KUL003)

**Stripping only pays when the bloat IS metadata — check the histogram first:** CONTAINMENT psets
19.4% + ports 13.6% → a third of the file gone. **OVERALL psets 1.0% → -1.8%, pointless**, because
**95.6% of OVERALL is raw IFCPOLYLOOP (25.6%) / IFCFACEOUTERBOUND (25.4%) / IFCFACE (25.4%) /
IFCCARTESIANPOINT (19.2%) tessellation.** You cannot strip the geometry you came for.

## §KUL005 — RECORD: all four KUL IFCs parsed in ONE browser drop (2026-07-29, user-run)
**3.44 GB and 65,111,715 STEP entities, four files, one drop, one browser tab, one laptop.** Not a
CLI run — the live Viewer's `import_own.js` multi-merge on GitHub Pages.

| # | file | size | entities |
|---|---|---|---|
| 1 | `CONTAINMENT_model.ifc` (stripped) | 31.1 MB | 518,267 |
| 2 | `OVERALL.ifc` | 2045.2 MB | 37,716,099 |
| 3 | `CONTAINMENT.ifc` | 56.7 MB | 774,041 |
| 4 | `EQUIPMENT.ifc` | 1394.2 MB | 26,103,308 |
| | **total** | **3527.2 MB** | **65,111,715** |

**What this beats, measured against the fleet:**
- **Largest single IFC parsed in-browser: 2045.2 MB** — 12× the previous fleet maximum
  (`LTU_AHouse_ARC.ifc`, 172.9 MB). No file over ~250 MB had ever gone through this path.
- **Most entities in one session: 65.1 M.** Parse fidelity CONFIRMED, not assumed:
  `§EXTRACT_START totalLines=26103308` for EQUIPMENT matches the CLI histogram **exactly**, and
  `totalLines=518267` matches the stripped CONTAINMENT exactly.
- **Largest imported DB produced: 484.7 MB** (Hospital 263 MB, JKR 203 MB were the prior tops).
- The wasm32-4GB-ceiling prediction in §RISK FINDINGS (score 9) was **WRONG** — measured 10.8 GB
  RSS in the worker, so web-ifc is not confined to one linear memory. Recorded as a corrected
  prediction, not a passed one.

**Element count is NOT a record: 25,033 — 5th in the fleet** (LTU_AHouse 125,698, Hospital 63,415,
Terminal 48,428, KUL 25,033, Clinic 16,114). It is a THROUGHPUT record, not a completeness one, and
§KUL006 is why.

Two designs quietly did their job and should be kept: `import_db_builder.js:45` uses
`INSERT OR IGNORE INTO elements_meta`, so the SAME model dropped twice (files 1 and 3) collapsed on
GUID instead of doubling to 42,018; and the importer emitted a SPLIT meta/geo pair (9.2 MB + 475 MB)
rather than one blob, staying under the ~1 GB IndexedDB structured-clone ceiling that §RISK FINDINGS
scored 8.

**Saved DB** — `~/bim-ootb/IFC/KUL/KUL070-SWC-01-XX-3D-E-0001.db`, 484.7 MB, `pragma
integrity_check: ok`, `elements_meta.building` present (so NOT subject to §KUL001), `project_metadata`
carries `georef_offset=(0,-14420,0)`. Reopens directly, no patch, no re-import.

## §KUL006 — ⚠ CAUSE CLAIM SUPERSEDED BY §KUL007 (PoC disproved it at 37,866 verts)
**The composition numbers below are still good. The `.apply` cause claim is NOT — read §KUL007.**

The record run landed **25,033** elements, of which OVERALL contributed only **~3,728 of its 66,214
(5.6%)**. Final composition of the saved DB:
`IfcFlowSegment` 11,441 + `IfcFlowFitting` 9,568 = **21,009 = CONTAINMENT complete and exact**;
`IfcBuildingElementProxy` 4,015; `IfcWallStandardCase` **8**; `IfcSlab` **1**.

The cause is logged verbatim and is not memory, not the parse, not truncation:
```
§PARSE_OK  →  §EXTRACT_START totalLines=26103308  →  §ELEMENTS_FOUND count=292   (all correct)
§GEOM_SKIP guid=… class=IfcBuildingElementProxy err=Maximum call stack size exceeded
```
Parse and element discovery are perfect; **geometry building throws**. Suspected site —
`viewer/import_worker.js` lines 489-491 and 578-580:
```js
el._bboxX = Math.max.apply(null, bxs) - Math.min.apply(null, bxs);
```
`Function.apply` spreads the whole array onto the call stack **as arguments**; V8 caps that at
~65-125 k. These meshes carry **37,866 vertices each** (measured, §EQUIPMENT sample), so the limit is
exceeded and every dense element is skipped. Fix = a plain min/max loop; six lines, no behaviour
change. **NOT APPLIED — core Viewer code, user reserved that call.** Projected effect: the same drop
would land ~87,000 elements, i.e. 2nd in the fleet behind LTU_AHouse.

## §KUL007 — PoC RESULT: §KUL006's diagnosis is PARTLY WRONG (supersedes §KUL006's cause claim)
**Read this instead of §KUL006's "six lines of .apply explain the 62,500".** It does not. Measured,
not argued — `scratchpad/poc_apply_overflow.js`, binary-searched on this machine:

```
§POC_THRESHOLD max args that survive Math.max.apply(null, arr) = 125,570
§POC_APPLY n= 37,866  OK      ← the size §KUL006 blamed. Does NOT throw.
§POC_APPLY n=124,999  OK
§POC_LOOP  n=1,000,000 OK 7ms  ← proposed replacement, no arrays, no apply
```

Against the REAL vertex distribution (from our own CLI DBs):

| DB | max verts | geometries over 125,570 |
|---|---|---|
| KUL_EQUIPMENT | **248,782** | **5 of 151** |
| KUL_OVERALL_partial | 248,782 | **3 of 4,897** |
| KUL_CONTAINMENT | 312 | **0 of 13,152** |

**Verdict:** the `.apply` overflow is REAL but explains only a HANDFUL of elements (the 248,782-vertex
monsters, ~2× the limit) — the four `§GEOM_SKIP` lines actually observed. **It cannot explain 62,500
missing elements.** That bulk loss is UNEXPLAINED and must not be assumed solved. No second theory
was invented to cover it — see §NEXT_SESSION item 1 for the one measurement that would settle it.

### §KUL007_BBOX — `IfcBoundingBox` absence is NORMAL, not a defect (corrects §KUL006's framing)
`grep -c "=IFCBOUNDINGBOX("` returns **0** in both CONTAINMENT.ifc and EQUIPMENT.ifc. That is not a
bad export — **nothing in this pipeline has ever read that entity.** AABBs are derived from the
tessellated geometry pass and indexed in an R-tree, everywhere:
- `tools/federation_preprocessor.py` `extract_bboxes_from_merged()` — an EXACT COPY of
  `/home/red1/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/federation_preprocessor.py`
  (still present on this machine): `iterator = ifcopenshell.geom.iterator(...)` → `shape.geometry.verts`
  → AABB → spatial DB. Note it uses `USE_WORLD_COORDS=True` and a multicore iterator, unlike
  `extractIFCtoDB.py` which logs `§COORDS LOCAL (USE_WORLD_COORDS=False)`.
- `extractIFCtoDB.py:144` `CREATE VIRTUAL TABLE elements_rtree USING rtree(...)`; line 167 comment
  "AABB full extent (maxK-minK), same source as elements_rtree"; `rel_adjacency` reads it (888-908).
- `viewer/import_worker.js:573-580` — the same derivation in JS.

**Consequence for the fix:** site 2 is NOT a fallback, it is the **standard path for every model**;
site 1 (the 8-vertex `IfcBoundingBox` shortcut, lines 483-493) is the rare exception and is provably
safe (always 8 args). So the defect sits on the main path for ALL imports — it simply never fired
before because no prior resident approached 125,570 verts (CONTAINMENT's max is 312).

Also settled: the saved DB's `bbox_x/y/z` are **never null** (25,029 rows, 0 null, 0 zero) precisely
BECAUSE the derivation runs. "No IfcBoundingBox in the IFC" and "null bbox in the DB" are different
layers and must not be conflated.

## §NEXT_SESSION — ✅ ALL FIVE ITEMS CLOSED 2026-07-30 (written 2026-07-29)
**Nothing here is open. Do not re-walk this list.** Evidence lives in §KUL009 (the blocker),
§KUL010 (the corrected apply threshold), §KUL011 (the split), §KUL012 (the complete DB).
⚠ §KUL006 and §KUL007's cause claims are BOTH superseded — read §KUL009 before quoting either.

1. **✅ DONE (witness W-KUL-WHERE-DO-THEY-GO, 2026-07-29) — read §KUL009.** The number exists:
   **62,252 `§GEOM_SKIP` lines**, `err=` NOT identical (3 strings, one root cause), and **zero** of
   them are `Maximum call stack size exceeded`. Cause = the **wasm32 4GB ceiling** (`Cannot enlarge
   memory … limit is 4294901760 bytes` = 2³²−65536 exactly), hit at element #3,956; the wasm instance
   never recovers. Neither branch of the original fork was right: not a stack threshold, and not a
   silent drop either — it was always logged, just 62 k lines deep. **The "re-measure the apply
   threshold in a Web Worker" follow-up is MOOT — do not spend a session on it.**
2. **✅ DONE (2026-07-30) — shipped, merged with main, PR open.** The scalar min/max pass is in
   `viewer/import_worker.js:573-598`; site 1 (483-493) untouched. Code was written + witnessed live by
   the user in §KUL008 (so the reserved call was already made); this session merged `origin/main`
   (61 commits, only `sw.js` `CACHE_VERSION` conflicted → **v884**), re-ran the witnesses post-merge,
   pushed, and opened **[bim-ootb#1086](https://github.com/red1oon/bim-ootb/pull/1086)** with
   auto-merge + squash enabled. `fast-checks` pass, `e2e-tests` were still running at hand-off.
   **The threshold in the old witness claim was wrong — see §KUL010:** the real Chrome **Web Worker**
   limit is **63,608**, not 125,570, so the fix recovers ~4× more than estimated (21 of EQUIPMENT's
   151 geometries = 14% of that model; 12 in OVERALL_partial).
3. **✅ DONE (2026-07-30) — read §KUL011 + §KUL012.** Split run to true fixpoint (`--max-rounds 18`;
   the DEFAULT 12 is TOO LOW and its WARNING is real), all 8 parts extracted `7 PASS / 0 FAIL`, and
   merged into **`~/bim-ootb/IFC/KUL/KUL070-SWC-01-XX-3D-E-0001-OVERALL_complete.db` — 311 MB, 87,333 elements, zero
   orphans.** Beat the estimate: 87,333 rows (not 66,214 — the extractor walks 81 product types vs
   the viewer's 68) and all 66,214 viewer-class GUIDs present, MISSING=0. **From 3,955 to 87,333.**
4. **✅ DONE (2026-07-30) — spec lives in `prompts/LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`
   §SCENE_MERGE.** It was already written 2026-07-29; this session **re-verified every file:line in it
   against `origin/main` and they were stale** — there is no `viewer/import_own.js` (it is
   `viewer/import.js`), `§VERSION_MERGE` no longer exists anywhere in the tree, and the `scene.js`
   line numbers had all moved. Corrected in place, plus the measured wasm cap on step 5's "open source
   IFC". Recon points (a)-(e) all still hold. **Implementation not started — that is a separate task,
   and it belongs in that file, not this one.**
5. **✅ DONE (2026-07-30) — guide updated and made publishable; SENDING it is the user's call.**
   `docs/IFC_ExportGuide.md` gained **§"The hard wall nobody warns you about"** — the §KUL009 numbers
   turned into the argument that actually lands with an author: *it opens, it renders, it looks like a
   building, and 94% of it — every MEP element — is not there.* The file was committed but **absent
   from `mkdocs.yml` nav**, i.e. unpublished (live URL 404s); now added under Go Deeper, `mkdocs build`
   produces the page, and `DRY_RUN=1 scripts/safe_gh_deploy.sh` reports
   `§GUARD result=PASS — new build is a superset`. **The public docs deploy was deliberately NOT run**
   — it is outward-facing and beyond what "ship to the BIM author" asked. One command when wanted.
   Underlying fact unchanged: at 570 entities/element KUL is ~20× heavier than LTU's 29, purely from
   tessellated export; no downstream tool recovers that.
3. **Complete OVERALL DB via the 8-way split** (never run to completion). `split_ifc_by_discipline.py
   --parts 8` is written, dry-run verified (8 × 10,971 products, 36MB RAM). Discipline axis is the
   WRONG one here — measured ARC 1924MB/17.4GB vs MEP 76MB/0.6GB (§KUL003 tail). Then extract each
   part under `systemd-run --user -p MemoryMax=…` (MemoryMax ONLY — `MemoryHigh` is a throttle that
   stalled run 1 for 24 minutes). Expected result ~200MB DB, 66,214 elements.
4. **Scene-merge on File Open** — user's ask: opening a fresh IFC/DB should offer "merge into the
   current scene" instead of replacing. **Spec belongs in `prompts/LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`
   (a dated §SCENE_MERGE section), not here** — that file already owns `importMultiIFC` + Open Building.
   Recon done, do not redo: (a) today's `§VERSION_MERGE` is a VERSION merge — `_rec.versions.push()`
   then `_rec.metaDb = dbs.metaDb` OVERWRITES; it is not additive. (b) `importMultiIFC` merges only
   within ONE drop; nothing reads an existing DB and appends. (c) **The scene layer ALREADY federates**
   — `city.js:701` `A.cityBuildingDbs[archetype] = { db, libDb }` streams N buildings, each with its
   own DB pair, via `A.buildingCentres`/`A.buildingsRendered`/`A.streamBuilding()`. (d) The ONLY
   blocker is `scene.js:663` `_openDbBytes` → `location.assign('viewer.html?db=…')`, a full page
   navigation. (e) The saved DB is already shaped for it: `elements_meta.building` labels the source,
   `project_metadata.georef_offset=(0,-14420,0)` gives the shared frame.
5. **Ship `docs/IFC_ExportGuide.md` to the BIM author** — the upstream fix. At 570 entities/element
   KUL is ~20× heavier than LTU's 29 purely from tessellated export; no downstream tool recovers that.

## §KUL008 — SHIPPED to sandbox 2026-07-29: two viewer fixes, both witnessed live
⚠ **Two claims below are now superseded — do not quote them:** (a) the "NOT committed / detached HEAD"
status is stale — as of 2026-07-30 both fixes are on branch `fix/import-bbox-bigmesh-ghost-fallback`,
merged with `origin/main`, pushed, and open as
**[bim-ootb#1086](https://github.com/red1oon/bim-ootb/pull/1086)** (auto-merge armed); (b) the
threshold table's `n=125570 OLD=THROW` was a **main-thread** measurement — the real Chrome **Web
Worker** limit is **63,608**, see **§KUL010**. The fix and its direction are unchanged and correct.

**1. `import_worker.js:573` — bbox from vertices, scalar pass (Witness W-BBOX-BIGMESH).**
Was 3 arrays + 6 `Math.max/min.apply`. `apply` spreads the array onto the call stack AS ARGUMENTS.
Witness, real `Float32Array` data:
```
n=   312  OLD=ok    NEW=ok  identical=true
n= 37866  OLD=ok    NEW=ok  identical=true
n=125570  OLD=THROW(Maximum call stack size exceeded)  NEW=ok   [OLD lost this element]
n=248782  OLD=THROW(...)                               NEW=ok 1ms
```
KUL's biggest mesh is 248,782 verts. Site 1 (line 489, the 8-vertex `IfcBoundingBox` shortcut) left
alone — always 8 args, provably safe. Threshold measured LOWER with real Float32Array than with the
synthetic PoC's 125,570, so the in-worker limit is lower again — treat 125,570 as an upper bound.

**2. `navigate_find.js` `_buildMergedGhost` — §BBOX_GHOST_ALL fallback (Witness W-BBOX-GHOST-NOENVELOPE).**
`_isEnvelope()` matches only Wall|Slab|Roof|CurtainWall|Covering|Plate. KUL has **9** such elements
in 25,029 → Alt+Z's bbox state drew 9 boxes = visually nothing.
**FIRST ATTEMPT FAILED and the witness caught it:** the condition was "envelope is EMPTY". KUL's is
9, not 0, so it never fired — `boxes_AFTER=9`. Corrected to **empty OR (<2% of elements AND <200)**.
Do NOT widen `_isEnvelope` itself — for models that HAVE an envelope the filter is the point
(shell = far context); widening globally would take LTU from 28,569 to 122,667 boxes.
```
KUL070_merged   9 → 25,033   *** FALLBACK FIRES ***
Terminal    34,446   LTU 28,569   Hospital 4,518   JKR 1,087    all unchanged
```
Margin: KUL 0.04%, nearest real case Hospital 7.1%. Live confirmation from the user's own console:
`§BBOX_GHOST_ALL envelope=9/25029 (0.04%) … boxing ALL 25029 elements, discs=MEP,ARC`
→ `§SHELL_GHOST_BBOX boxes=25029 discs=2 build_ms=78` → `disp=bbox`.

Also: `panels.js:32` still labelled the box icon `key: 'Alt+X'` — corrected to `Alt+Z`. Alt+X was
retired 2026-07-06 (`tools.js:244`); Alt+Z is a 3-state cycle Off → X-Ray → Bbox → Off.

### §KUL008_CACHE — the step that nearly lost this twice, write it down
An edit to a **precached** `viewer/*.js` is INVISIBLE in the browser until the service worker is
bumped. Ctrl+Shift+R does NOT bypass it. Symptom: the code is correct, `curl` proves the server
returns the new file, and the console still shows the OLD behaviour with no error. Steps:
1. Edit the file.
2. Bump `sw.js` `CACHE_VERSION` (e.g. `v851` → `v852`). **This is the real cache-bust on
   GitHub-Pages-style serving** — browsers byte-check the SW script on navigation. See
   `feedback_sw_version.md` for why the `?v=` register params are allowed to drift on bim-ootb.
3. Bump the file's own `?v=` query where it is referenced (e.g. `navigate_find.js?v=56` → `?v=57`,
   referenced in `main.js`) — lazy-loaded modules are fetched by that URL.
4. Reload **twice**: first load installs the new SW, second serves the new JS.
5. Confirm with `§BUILD_VERSION vNNN (sw-controlled)` in the console — it must show the NEW number.
6. Still stale → DevTools → Application → Service Workers → Unregister → reload.

## §KUL009 — ⛔ BLOCKER CLOSED: the 62,500 are lost to the **wasm32 4GB ceiling**, not the stack
**Answers §NEXT_SESSION item 1. Supersedes every remaining cause claim in §KUL006/§KUL007.**
Witness **W-KUL-WHERE-DO-THEY-GO** · harness `scratchpad/kul_discovery_probe.js` · logs
`log_overall_discovery.log`, `log_overall_geom.log` (3 MB, 62,252 `§GEOM_SKIP` lines),
`log_containment_geom.log`. Run 2026-07-29 under `systemd-run --user -p MemoryMax=11G`.

### The measurement item 1 asked for
| | |
|---|---|
| `§ELEMENTS_FOUND` | **66,214** — discovery is PERFECT, identical to the preflight estimate |
| elements that tessellated | **3,955** |
| `§GEOM_SKIP` lines | **62,252** |
| `err=` identical on all? | **NO — three strings, one root cause** |
| `Aborted(native code called abort())` | 44,756 |
| `table index is out of bounds` | 17,380 |
| `memory access out of bounds` | 116 |
| `Maximum call stack size exceeded` | **0** |

`66,214 = 3,955 withGeom + 62,252 skips + 7 zero-geometry flatMeshes` — the census balances exactly,
nothing is unaccounted for.

### The cause, verbatim from the log
```
§GEOM_PROGRESS 2000/66214  withGeom=2000  skips=0
Cannot enlarge memory, requested 4294909952 bytes, but the limit is 4294901760 bytes!
bad_alloc was thrown in -fno-exceptions mode
Aborted(native code called abort())
§GEOM_SKIP guid=3NuhEOPtf7pOu$KoL0gvBx class=IfcBuildingElementProxy err=Aborted(native code called abort())
§GEOM_PROGRESS 4000/66214  withGeom=3955  skips=45     ← withGeom never rises again
…
§GEOM_PROGRESS 66000/66214 withGeom=3955  skips=62038
```
`4,294,901,760 = 2³² − 65,536` — **exactly the wasm32 address-space ceiling**, to the byte. Requests
land at 4,294,905,856 / 4,294,909,952 / 4,294,914,048, i.e. 4–12 KB over the wall.

**Shape of the failure: a one-way wall at element #3,956, then a corrupt module.** The first 3,955
elements tessellate cleanly; `GetFlatMesh` then can't grow the heap, `bad_alloc` → `abort()`, and the
wasm instance never recovers — the remaining 62,252 calls each throw into the same `catch`, degrading
from `Aborted(...)` to `table index is out of bounds` as the aborted runtime decays. The whole
post-abort tail burns ~3 s and emits 62,252 console lines.

### What this kills, and what it corrects
- **The `.apply` / call-stack theory explains ZERO of the 62,252.** Not one line says "Maximum call
  stack size exceeded". §NEXT_SESSION item 1's conditional — "re-measure the threshold in a Web
  Worker" — is **MOOT, do not spend a session on it.** (The `.apply` defect is still real and still
  worth its fix; it is simply a different, much smaller bug. See below.)
- **The "silent drop that logs nothing" fear is also wrong** — every one of the 62,252 IS logged as
  `§GEOM_SKIP`, plus `§GHOST_ADMISSION` and `§GEOM_SUMMARY` would have reported the totals. It was
  never invisible; 62 k lines simply flooded the console past what anyone pasted in-session.
- **§RISK FINDINGS' 9/10 call was right, and is now witnessed rather than inferred.** "wasm32 4GB
  ceiling vs 2.0GB OVERALL.ifc … a crash/OOM inside the worker" — that is precisely what happens.
  The one detail the inference got wrong: it is not a crash, it is a *silent-ish degradation* that
  still returns a plausible-looking 3,955-element building.
- **Field vs harness agree.** The record browser drop landed ~3,728 of OVERALL's elements; this run
  lands 3,955. Same wall, same magnitude.

### The regime gap is CLOSED — this Node run is faithful to the browser
Checked, not assumed: `viewer/import.js:391` `_parseOneIFC` creates **`new Worker(...)` per file** and
`worker.terminate()`s it on `done`. So the 4-file record drop was four *independent* wasm instances,
one model each — the same regime as this single-file Node run. The multi-file drop did **not** cause
this and single-file import will **not** avoid it.

### Harness ground truth verified BEFORE trusting it on OVERALL
`CONTAINMENT.ifc` through the identical harness: `§ELEMENTS_FOUND count=21009` →
`withGeom=21009 GEOM_SKIP_lines=0 maxVerts=628`. Exactly the preflight count, exactly the saved DB's
composition (11,441 `IfcFlowSegment` + 9,568 `IfcFlowFitting`), zero skips. The harness does not
manufacture skips.

Harness notes for reuse: the shipped `viewer/lib/web-ifc-api-iife.js` is the **web** emscripten build
— it throws "not compiled for this environment" the instant it sees `process.versions.node`. Run it
in a `vm` context with `process` **withheld**, `globalThis.WorkerGlobalScope` defined (the loader
guards on `window || WorkerGlobalScope`), and a `fetch` shim that reads `web-ifc.wasm` off disk.
`PARSE_OK` on the 2,045 MB file takes **17.3 s at 5.6 GB RSS** — parsing was never the problem.

### Losses by class (all 62,252)
`IfcBuildingElementProxy` 35,299 of 39,245 · `IfcFlowSegment` **14,583 of 14,583 (100%)** ·
`IfcFlowFitting` 12,354 of 12,361 · `IfcFlowController` 16 of 16. The wall falls mid-proxy (proxies
are enumerated before flow classes in `PRODUCT_TYPES`), so **every MEP element in OVERALL.ifc is
lost** — which is why the merged DB's flow counts are exactly CONTAINMENT's 11,441/9,568 and not one
element more.

### What actually fixes it (ranked — none of this is "tune a threshold")
1. **Split the source IFC so no single wasm instance holds >~1.3 GB of STEP.** OVERALL got 3,955
   elements out of a 2,045 MB file before the wall; CONTAINMENT (31–57 MB) does 21,009 with room to
   spare. This is §NEXT_SESSION item 3, and this measurement changes its justification: the split is
   not a convenience for the Python extractor, it is the **only** way the browser path can ever
   finish this file.
2. **Free geometry as you go.** `ifcApi.StreamAllMeshes` / per-element `ClearCache`-style disposal
   instead of letting web-ifc accumulate every tessellated shape for the model's lifetime. Untested —
   named as the real engineering fix, not claimed.
3. **Fail loudly.** `§RISK FINDINGS` item 6 ("no hard size cap or early reject") is now concrete: the
   import returns a *successful-looking* 3,955-element building with no error surfaced to the user.
   A `§WASM_CEILING` detection on the first `bad_alloc` that aborts the import with a real message
   costs a few lines and is worth more than any partial result.

## §KUL010 — the apply threshold, finally measured WHERE THE CODE RUNS (corrects §KUL007 + §KUL008)
Witness **W-APPLY-WORKER-THRESHOLD** · Chrome 150, real `Worker` on `localhost:8399` ·
`scratchpad/log_threshold_recheck.log`. Binary search on `Math.max.apply(null, arr)` arg count.

| context | max args before throw |
|---|---|
| Chrome **main thread** | 124,751 |
| Chrome **Web Worker** ← where `import_worker.js` actually runs | **63,608** |
| Node 18 main thread | 125,544 |
| Node 18 `worker_threads` | **496,877** |

Three things this settles, two of which were previously stated WRONG in this file:

1. **§KUL007's 125,570 was a Node MAIN-THREAD number** and it reproduces exactly (125,544 here). But
   `import_worker.js` runs in a **Web Worker**, where the real limit is **63,608 — about half.**
   §NEXT_SESSION item 1's hunch ("Worker stack is smaller than main thread") was **RIGHT**.
2. **§KUL008's line "the in-worker limit is lower again — treat 125,570 as an upper bound" was a
   guess that happened to point the right way. It is now a measurement: 63,608.** Also delete the
   claim that `n=125570 OLD=THROW` proves the worker case — that run was main-thread, where 125,570
   sits just above a 124,751 limit. Same conclusion, wrong evidence.
3. **Node `worker_threads` is NOT a valid stand-in for a browser Web Worker** — it measured 496,877,
   nearly 4× the browser main thread and ~8× the browser Worker, i.e. wrong in the *opposite*
   direction. A first pass at this witness used `worker_threads`, saw no throw at 248,782, and would
   have concluded the `.apply` bug never fires in the field. It does. **If a witness needs a browser
   stack limit, measure it in a browser.** (Threshold degrades with stack already consumed: at 1,000
   frames deep the Chrome Worker limit falls to 55,568.)

### Re-count at the REAL threshold — the fix is ~4× bigger than §KUL007 estimated
`SELECT COUNT(*) FROM base_geometries WHERE vertex_count > …` on the extracted DBs:

| DB | geometries | max verts | **over 63,608 (real)** | over 124,751 (§KUL007's figure) |
|---|---|---|---|---|
| KUL_EQUIPMENT | 151 | 248,782 | **21 — 14% of the whole file** | 5 |
| KUL_OVERALL_partial | 4,897 | 248,782 | **12** | 3 |
| KUL_CONTAINMENT | 13,152 | 312 | **0** | 0 |

§KUL007's verdict — "*real but explains only a HANDFUL*" — **stands for OVERALL** (12 elements, vs
62,252 lost to the wasm ceiling) but **understates EQUIPMENT.ifc**, where 21 of 151 elements is 14% of
the model. On a 151-element building that is not a handful.

**No contradiction with §KUL009.** §KUL009 found zero stack errors among OVERALL's 62,252 skips
because those elements never reached the bbox code — the wasm heap died at element #3,956 and
`GetFlatMesh` threw first. The two defects sit on either side of that wall, and the §KUL006 field log's
4 `Maximum call stack size exceeded` lines are the apply bug firing on elements that *did* get past it.

## §KUL011 — the 8-way split WORKS: 66,214 / 66,214 elements, zero skips, proven lossless
Witness **W-KUL-SPLIT-COMPLETE** (2026-07-30). Closes §NEXT_SESSION item 3's "never run to completion".
Logs: `/tmp/kul_split16/split.log`, `scratchpad/log_dump12.log`, `log_dump18.log`,
`scratchpad/dump18_KUL070_OVERALL_P*.csv`.

### Result
`split_ifc_by_discipline.py --parts 8` on OVERALL.ifc, then the §KUL009 probe on every part:

| part | source MB | entities | §ELEMENTS_FOUND | withGeom | §GEOM_SKIP | max verts | probe RSS |
|---|---|---|---|---|---|---|---|
| P00 | 406.7 | 7,592,074 | 8,935 | **8,935** | **0** | 1,182,257 | 1.2 GB |
| P01 | 310.1 | 5,801,504 | 8,919 | **8,919** | **0** | 507,090 | 1.0 GB |
| P02 | 277.7 | 5,160,372 | 8,954 | **8,954** | **0** | 611,216 | 0.9 GB |
| P03 | 254.4 | 4,809,639 | 8,942 | **8,942** | **0** | 571,952 | 0.8 GB |
| P04 | 313.3 | 5,908,857 | 8,924 | **8,924** | **0** | 571,952 | 1.0 GB |
| P05 | 461.0 | 8,651,917 | 8,941 | **8,941** | **0** | 1,182,257 | 1.4 GB |
| P06 | 311.2 | 5,829,750 | 8,913 | **8,913** | **0** | 1,182,257 | 1.0 GB |
| P07 | 405.5 | 7,623,425 | 8,999 | **8,999** | **0** | 1,182,257 | 1.3 GB |

**Union = 71,527 rows → 66,214 unique GUIDs = EXACTLY the source's `§ELEMENTS_FOUND`. 100 % recovery,
up from 3,955 (6.0 %).** The 5,313-row surplus is 759 GUIDs the closure pulled into more than one part;
`import_db_builder.js:45` `INSERT OR IGNORE INTO elements_meta` already collapses those (proven live —
CONTAINMENT dropped twice gives 21,009, not 42,018).

### Losslessness — proven against source truth, not asserted
For the 3,955 elements the whole 2 GB file *did* manage to tessellate before the 4 GB wall, per-GUID
vertex counts were compared whole-file vs union-of-parts:
```
§LOSSLESS_CHECK comparable_guids=3955  vertex_count_IDENTICAL=3955  DIFFERENT=0
§COVERAGE       guids_in_whole_but_absent_from_every_part=0
```
Every element the source could produce, the parts reproduce **to the vertex**.

### ⚠ `--max-rounds 12` (the DEFAULT) is TOO LOW for this file — raise it
The first run ended `§CLOSURE WARNING: hit --max-rounds=12 without fixpoint — parts may be incomplete`.
That warning was **not** cosmetic. Re-run at `--max-rounds 18`:
```
round=12 added=27,578   round=13 added=1,148   round=14 added=0   ← true fixpoint
```
The 1,148 entities round 13 recovered are **`IFCCARTESIANPOINT` (176 in P00, 106 in P05) and
`IFCDIRECTION` (9 each)** — the deepest leaves of the reference graph. Their absence silently changed
the geometry of **523 of 66,214 elements (0.79 %)**, with the incomplete run producing *more* vertices
(e.g. `3NuhEOPtf7pOu$KoL0gutX` 9,932 → 9,580). Direction of that delta is consistent with boolean/void
operands only resolving once their points are present (`USE_FAST_BOOLS: true`), **but that mechanism is
inferred, not proven** — all 523 fall outside the 3,955 where source truth exists, so they cannot be
adjudicated against the original. Both runs match source truth exactly on all 3,955 that can be.

**Rule: always run this splitter to `added=0`, never accept the WARNING.** Cost is ~85 s per extra
round; the 18-round run took 921 s total vs 782 s. Deterministic — rounds 1-12 produced byte-identical
counts across both runs.

### Sizing, as measured
Source 2,045.2 MB → 8 parts totalling **2,739.9 MB** (+34 %; shared entities are duplicated into every
part that needs them). Largest part 461 MB, forecast ~4.2 GB for `ifcopenshell`. Each part parses in
web-ifc in **2.5-4.2 s at 0.8-1.4 GB** — a fifth of the 4 GB wasm ceiling, with room for geometry that
the whole file never had.

**Practical consequence, and it needs no new code:** the 8 parts can be dropped into the Viewer in ONE
multi-file drop. `import.js:267` `importMultiIFC` already parses files sequentially in a fresh Worker
each (`:391`), pins one shared `§GEOREF_SESSION` frame from the first, and dedups by GUID on insert.
That path yields the complete 66,214-element KUL070 today.

**Note for the `.apply` fix (§KUL010):** the parts' largest mesh is **1,182,257 verts** — far above
anything the truncated whole-file import ever reached (187,134) and **18.6× the 63,608 Chrome-Worker
limit**. Without [#1086](https://github.com/red1oon/bim-ootb/pull/1086) merged, importing these parts
would `§GEOM_SKIP` every one of those. The two fixes are complementary and both are needed.

## §KUL012 — ✅ the complete OVERALL DB EXISTS: 87,333 elements, 311 MB, zero orphans
Witness **W-KUL-DB-MERGE** (2026-07-30). Closes §NEXT_SESSION item 3 outright.
Logs `/tmp/kul_db/extract_all.log` + `KUL070_OVERALL_P0*.log`; merge script `/tmp/kul_db/merge_parts.py`.

**Artifacts (local only, `.gitignore`d — never git/LFS, per the DB rule):**
- `~/bim-ootb/IFC/KUL/KUL070-SWC-01-XX-3D-E-0001-OVERALL_complete.db` — **311 MB, the whole building in one DB**
- `~/bim-ootb/IFC/KUL/parts/KUL070-SWC-01-XX-3D-E-0001-OVERALL_P0{0..7}.db` — the 8 per-part DBs, 492 MB total

### Extraction: 8/8 clean
Each fixpoint part through `extractIFCtoDB.py` under `systemd-run -p MemoryMax=12G`, sequentially,
~5-16 min each (67 min total, 25-55 elem/s):
```
§PROOF KUL070_OVERALL_P00..P07   elements=14,178-14,191   failed=0   void_consumed=0   bbox_fallback=0
§PROOF RESULT: 7 PASS, 0 FAIL     ×8      FAIL_RATE 0/14,1xx (0.00%)   ×8
```
⚠ **Do NOT pass `--library`** — it expects a pre-migrated `component_library.db` and dies with
`missing table 'component_geometries' — run schema migration first`. Omit it; mesh BLOBs go into the
main DB. (Cost me one wasted part-run.)

### The merge is NOT a plain `INSERT OR IGNORE` — that is silently wrong, twice
Both failure modes were hit and caught before shipping. **Anyone merging extracted DBs must read this:**
1. **`elements_meta.id` is `INTEGER PRIMARY KEY`, per-part sequential.** Ids collide, `OR IGNORE`
   silently DROPS the rows. First attempt produced `element_transforms=87,333` beside
   `elements_meta=14,191` — a DB that looks fine until you join it. Fix: omit `id`, let SQLite
   reassign, and rely on `guid UNIQUE` to dedup.
2. **`datum_plane.datum_id` is likewise per-part sequential and means a DIFFERENT coord in each
   part** (P00 `#1 = X -49.7916`, P01 `#1 = X -49.5647`). `rel_anchored` / `rel_spans` point at it.
   A naive merge keeps part 0's datums and silently re-points the other 7 parts' 500 k relations at
   the wrong planes. Fix: offset `datum_id` by a per-part base so each part's relations keep pointing
   at their own datums.
3. **`elements_rtree` must be REBUILT, not copied** — it is a virtual table keyed on
   `elements_meta.id` (verified in the source DBs: `rtree.id == elements_meta.id`, 14,183/14,183),
   so it has to be regenerated from the NEW ids. Never write its `_node`/`_parent`/`_rowid` shadows.

### Result — every referential check ZERO
```
elements_meta 87,333 = element_instances 87,333 = element_transforms 87,333 = elements_rtree 87,333
base_geometries 19,447  (4.5× instancing reuse)   datum_plane 27,385
rel_anchored 589,371    rel_spans 187,626   rel_adjacency 11,623   rel_aggregates 3,760
§INTEGRITY ok
§ORPHAN rel_anchored→datum_plane 0 · rel_spans→datum_plane 0 · element_instances→base_geometries 0
§ORPHAN element_transforms→meta 0 · meta→element_transforms 0
```
Disciplines ARC 60,373 / MEP 26,960. Top classes: `IfcBuildingElementProxy` 39,245,
`IfcMechanicalFastener` 19,733, `IfcFlowSegment` 14,583, `IfcFlowFitting` 12,361,
`IfcOpeningElement` 1,386, `IfcFlowController` 16.

### End-to-end: the browser probe and the DB agree exactly
```
§COVERAGE probe_guids_present_in_db = 66,214 / 66,214   MISSING = 0
```
The 21,119 extra rows are real, not noise: `extractIFCtoDB.py` walks **81** product types vs the
viewer's **68** (`IfcMechanicalFastener` 19,733 is the bulk). **From 3,955 to 87,333.**

### ⚠ One honest limitation — `datum_plane` is 8 partial derivations, not one whole-model one
27,385 datums for a building whose parts each derive ~3,400 is an **over-count**: cadence datums are
derived from element spacing *within one model*, so eight parts produce eight near-duplicate plane
sets (P00 `X -49.7916` vs P01 `X -49.5647` are separate derived planes, not the same plane twice).
The id-offset merge keeps every relation pointing at the datum it was actually derived against — so
the DB is **internally consistent and nothing is invented** — but this is NOT equivalent to running
the cadence derivation once over all 87,333 elements. **If a walker needs true whole-model datums,
re-derive them on the merged element set; do not trust the 27,385 as distinct physical planes.**
Everything else in the DB (elements, geometry, transforms, r-tree, adjacency, aggregates) is a clean
guid/hash-keyed union with no such caveat.


## §HOUSEKEEPING
- `~/bim-ootb/IFC/KUL/` added to `.gitignore` (PR
  [bim-ootb#1075](https://github.com/red1oon/bim-ootb/pull/1075), auto-merge enabled) — these are
  multi-GB private raw source files, local-only, never git/LFS per
  `feedback_db_change_via_sql_migration_not_binary.md`'s binary-commit ban.
- `IFC/KUL/README.md` + `IFC/ifc_preflight_stats.sh` committed (PR
  [bim-ootb#1076](https://github.com/red1oon/bim-ootb/pull/1076), auto-merge enabled) — the
  `.gitignore` carries a `!IFC/KUL/README.md` negation so the README tracks while the sibling
  `.ifc` sources stay local-only.

## §KUL013 — `element_transforms.center_*` is the PLACEMENT ORIGIN, not the element centre
**A defect I introduced in §KUL012's merge, found 2026-07-30 while verifying the cabling survey, now
fixed and the shipped DB regenerated.** Witness **W-RTREE-PRISTINE-AABB**.

### The fact, from the extractor's own source
`extractIFCtoDB.py` (geometry loop): `mat4 = …reshape(4,4).T` → **`center = mat4[:3, 3]`**. That is the
placement matrix's TRANSLATION — where the element's local origin sits — **not** the centre of its
geometry. `element_transforms.bbox_x/y/z` is only the EXTENT (`maxK-minK`; verified exact to 0.5 mm on
100% of rows). The true AABB *position* lives ONLY in `elements_rtree`, written from real vertices.

**How far apart they are — data-dependent, and sometimes enormous:**

| DB | rows | median ‖center − AABB centre‖ | within 10 mm |
|---|---|---|---|
| `KUL_CONTAINMENT_extracted.db` | 21,009 | **11.31 m** | 3.6% |
| `KUL070-…-OVERALL_P00.db` | 14,183 | 0.11 m | 23.9% |
| `KUL_EQUIPMENT_extracted.db` | 292 | 1.14 m | 0.0% |

Cable-ladder placements sit metres from their geometry. **This is fleet-wide behaviour of the
extractor, not a KUL quirk** — the code path is building-agnostic.

### What I got wrong
§KUL012's merge rebuilt `elements_rtree` as `center ± bbox/2`. Right SIZE, **wrong PLACE**:
```
§RTREE_DELTA old(center±bbox/2) vs pristine: n=87333 median=0.109m p90=31.01m max=86.43m
             wrong_by_over_10mm=62114 (71.1%)
```
**71% of boxes misplaced, 10% of them by >31 m.** Every r-tree consumer — adjacency derivation,
nearest-neighbour, spatial picking, `rel_adjacency` regeneration — silently reads corrupt boxes.

**And rendering stays perfect throughout**, because the renderer uses `center` + origin-relative
vertices. The screenshot at 85,947 elements looked right the whole time. **A correct render is NOT
evidence of a correct r-tree.** That is the transferable lesson.

### The fix
`prepare_large_ifc.py` `merge_part_dbs` now CARRIES each part's own `elements_rtree` rows across,
joined `src.elements_rtree → src.elements_meta.id → guid → dest.elements_meta.id` (ids are reassigned
by the merge, so the table still must be rebuilt — but from the pristine AABBs, never recomputed). It
warns if the row count ever falls short of `elements_meta`.

Shipped DB regenerated 2026-07-30 11:01 — `elements_meta 87,333 = elements_rtree 87,333`, renderable
85,947, `integrity ok`, zero null/zero bbox. The superseded copy is kept out of the way at
`/tmp/kul_db/superseded_rtree_wrong.db` — **do not put it back.**

### Consequence beyond this merge — flagged, NOT fixed
The cabling survey found the same column misused in shipped code: `disc_walker.routeChains` pairs
elements by `element_transforms.center_*` and scores **0.00% precision** on CONTAINMENT (2 of 9,568
fittings paired) versus **90.07%** with r-tree face geometry — same algorithm, only the column differs.
See `prompts/datacentre_cabling.md` §SUBSTRATE_LANDMINE. **Needs its own session; not touched here.**
