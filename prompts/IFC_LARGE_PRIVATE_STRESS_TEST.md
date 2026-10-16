# ⚠ DO NOT REMOVE
**Scope:** ONE benchmark question — are the existing IFC-open code paths fit to open 3 very large
private-project IFC files (KUL070-SWC-01, `~/bim-ootb/IFC/KUL/`), and what would break. **CLOSED
2026-07-30** — see the status block below. Read the log after every run if this lane is ever
resumed.

## 🏁 LANE CLOSED 2026-07-30 — full history archived verbatim, nothing lost
`prompts/archive/IFC_LARGE_PRIVATE_STRESS_TEST_full_history_2026-07-28_to_2026-07-30.md`

**What shipped / what was found (all in the archive, with full §-tagged measurements):**
- **Static-code read + real element/discipline counts** for all three source files
  (CONTAINMENT.ifc 57MB/21,009 elements, EQUIPMENT.ifc 1.4GB/292 elements, OVERALL.ifc 2.0GB/
  66,214 elements) via the committed `IFC/ifc_preflight_stats.sh`
  ([bim-ootb#1076](https://github.com/red1oon/bim-ootb/pull/1076) +
  [#1077](https://github.com/red1oon/bim-ootb/pull/1077)).
- **Offline extraction via `extractIFCtoDB.py`** (not the live-browser wasm path) proved the real
  route to usability: CONTAINMENT and EQUIPMENT extracted clean (0 failed, 7/7 proof checks);
  OVERALL OOM-killed on a single whole-file run (RAM tracks STEP entities, not element count) —
  root-caused, then recovered by an 8-way per-region split (`split_ifc_by_discipline.py`) run to
  true fixpoint, proven **lossless** (100% GUID recovery, vertex-identical on every comparable
  element).
- **Complete merged DB built and shipped**: `KUL070-...-OVERALL_complete.db`, 311MB, **87,333
  elements, zero orphans**, all 66,214 viewer-class GUIDs present. Merge pitfalls found and fixed
  in-session (`id` collision on `OR IGNORE`, `datum_plane` id collisions, `elements_rtree` needing
  a rebuild not a copy) — the last of these (§KUL013) was a self-introduced defect in the merge
  script, found and fixed before the DB shipped (`elements_rtree` must carry each part's own
  pristine AABBs, not `center ± bbox/2` — `element_transforms.center` is a placement ORIGIN, not
  the geometric centre, sometimes 10+ m off).
- **Two live-browser viewer bugs found and fixed**, both merged
  ([bim-ootb#1086](https://github.com/red1oon/bim-ootb/pull/1086)): `import_worker.js`'s bbox
  computation via `Math.max/min.apply()` overflowing the call stack on dense meshes (scalar
  min/max loop instead), and `navigate_find.js`'s bbox-ghost fallback never firing for an
  envelope-less (pure MEP/plant) building (`_isEnvelope()` widened with an empty-OR-tiny-fraction
  fallback).
- **Root cause of the browser import's ~62,500-element loss found**: the wasm32 4GB linear-memory
  ceiling (`Cannot enlarge memory ... limit is 4294901760 bytes` — exactly `2³²−65536`), not the
  `.apply` call-stack theory first suspected — that theory was real but explained only a handful of
  elements, separately fixed. The `.apply` threshold itself was re-measured in the environment that
  actually matters (a real Chrome Web Worker: 63,608, not Node main-thread's 125,570).
- **`docs/IFC_ExportGuide.md`** gained a new section aimed at the BIM author, ready to publish
  (deploy guard PASS, not yet pushed live — that send is the user's call).
- One item was deliberately **redirected to another file's scope, not left dangling here**: the
  "merge into scene on Open" ask belongs to
  `prompts/LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md` §SCENE_MERGE (spec written there, not
  implemented — that file owns it now).
- One item was flagged for a **separate future session, out of this lane's scope**: the
  `element_transforms.center` misuse found in §KUL013 also affects shipped code elsewhere
  (`disc_walker.routeChains`, 0.00% vs 90.07% precision depending on which column it reads) — see
  `prompts/datacentre_cabling.md` §SUBSTRATE_LANDMINE for that thread.
