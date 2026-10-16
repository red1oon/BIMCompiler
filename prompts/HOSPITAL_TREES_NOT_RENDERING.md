# ⚠ DO NOT REMOVE — Hospital's 20 real trees are detected but not visibly rendering
# SCOPE: this is a REAL-GEOMETRY RENDERING question (streaming.js / the element-streaming pipeline),
#   NOT a staffage-placement bug. It was DISCOVERED via Alt+P testing (spun off from
#   prompts/STAFFAGE_WALKABLE_PLACEMENT.md, which owns the staffage placement algorithm itself — read
#   that file only if the question turns out to be staffage-side after all, which three sessions of
#   evidence below say it is NOT). Read the log / §-witness after every run — do NOT browser-test by
#   hand without also reading the console, per this project's whitebox-first standing rule.

## THE PROBLEM (user, verbatim, across three separate sessions)
"Why Hospital has no trees when outside Alt-P?" / "Hospital still zero trees" — pressing Alt+P on the
Hospital building never shows any trees, on any press, in any camera framing tried so far.

## WHAT'S ALREADY RULED OUT (do not re-derive — three independent confirmations)
Every session that checked has found the SAME thing: **the real tree data exists, is correctly
detected, and the staffage system is correctly refraining from double-placing synthetic ones on top.**
This is NOT a detection bug and NOT a staffage-placement bug. Confirmed three times, most recently
today (2026-07-19) from the user's own live console paste:
```
§PHOTO_STAFFAGE thisPress(people=3 trees=0) cumulative(people=6 trees=0 cars=1) ...
  (realPeople=0 realTrees=20 realCars=0)
```
`realTrees=20` — `effects.js`'s own DB count (`SELECT COUNT(*) FROM elements_meta WHERE
lower(element_name) LIKE '%tree%'`) correctly finds 20 rows, so `_buildStaffage()`'s `if (realTrees ===
0)` gate correctly skips synthetic tree placement EVERY time, by design — cumulative `trees` will stay
0 forever regardless of how many times Alt+P is pressed, because the code believes (correctly, per the
data) that real trees already exist and shouldn't be duplicated.

**The actual open question is a different one: are those 20 real trees ever visibly rendering in the
3D scene at all?** Nobody has confirmed either way yet — this needs investigating in `streaming.js`
(the element-streaming/rendering pipeline), not `effects.js` (staffage).

## THE REAL TREE DATA (confirmed via direct DB query, both a local fixture AND the live production DB)
```sql
SELECT guid, element_name, center_x, center_y, center_z, bbox_x, bbox_y, bbox_z
FROM elements_meta em JOIN element_transforms et ON em.guid = et.guid
WHERE lower(element_name) LIKE '%tree%'
```
Sample rows (Hospital, `ifc_class = IfcBuildingElementProxy`):
```
M_RPC Tree - Deciduous:Japanese Cherry - 4.5 Meters:794254   center=(-9.4, 66.4, 179.48)  bbox=(3.3,3.9,4.5)
M_RPC Tree - Deciduous:Japanese Cherry - 4.5 Meters:794343   center=(26.0, 57.9, 179.48)  bbox=(3.3,3.9,4.5)
M_RPC Tree - Deciduous:Golden Chain - 5.5 Meters:794725      center=(-0.4, 63.3, 179.92)  bbox=(4.6,4.5,5.5)
```
Building's overall Z range (all elements): **165.19 to 203.22** (a ~38m-tall building). Ground-floor
slab Z (per `§GROUND_Y`, today's log): **165.36**. The trees sit at Z ≈ 179.5–180 — **~14m ABOVE the
ground floor**, roughly a third of the way up the building's total height. This is a NEW observation
this session (not previously flagged) and is the most promising concrete lead: **these may not be
street-level trees at all — they could be on an elevated courtyard, terrace, or podium-roof garden**,
which would explain why a typical ground-level Alt+P camera view never has them in frame even if they
ARE rendering correctly. Not confirmed — needs checking against the actual storey this Z corresponds to
(cross-reference `elements_meta.storey` for these guids, or `spatial_structure`, against the building's
storey list) before assuming this is the answer.

## WHY THIS WASN'T CONFIRMED YET — two failed attempts, both infrastructural, not conclusive
1. **Local fixture `modeller/Hospital_ARC.db` is invalid for this test.** It has element metadata
   (14,641 rows) but ZERO paired geometry library — every geometry-hash lookup logs `§BLOB_MISS`,
   `totalStreamed=0`, only 2 placeholder bboxes ever render. This fixture was built for the
   Modeller/Gantt tools, not the Viewer's real-geometry rendering path — don't use it for this
   investigation, it will never show real trees (or anything else) regardless of the actual bug.
2. **Real production data is genuinely large.** The real pair is `buildings/Hospital_extracted.db` +
   `buildings/Hospital_geo.db` on OCI (found via the bucket's public listing, see `viewer/config.js`
   `PROD_BASE`) — `Hospital_geo.db` alone is **123MB**, the building is **63,415 elements**. An
   automated Playwright test waited 2+ minutes and only reached `streamedCount=18500` (≈29%) before
   giving up — never got far enough to take a conclusive screenshot. This is a test-patience/timeout
   problem, not evidence either way about whether trees render once streaming actually finishes.

## FIRST STEPS FOR A FRESH SESSION
1. **Check the storey Z lead first** — cheapest, most likely to actually explain it. Query
   `elements_meta.storey` (or `spatial_structure`/`rel_contained_in_space`) for the tree guids above,
   compare against the building's storey list and their Z ranges. If the trees are on a named upper
   storey (a roof garden, terrace, courtyard level), that's the answer — the fix is either "this is
   correct, camera needs to go up there to see them" (not a bug) or "the storey Z is a data/extraction
   error" (a different, upstream problem, likely outside this repo's scope).
2. **If ground-level, get a real screenshot** — don't repeat the 2-minute-timeout mistake. Either:
   (a) let a Playwright script wait MUCH longer (10+ minutes, or poll `streamedCount >= totalElements`
   with no ceiling) before screenshotting, or (b) do it as a manual live-browser session instead of an
   automated one, since a human watching the load doesn't need a hard timeout.
3. Once actually loaded, check for the real trees at the CAMERA position that would put them in frame
   (their IFC XY is `(-9.4,66.4)`/`(26.0,57.9)`/`(-0.4,63.3)` roughly — well inside the building's
   overall XY bbox per the earlier bbox check, so they're not off in some disconnected site-plan area).
   If genuinely invisible at that vantage point with streaming complete, THEN start looking at
   `streaming.js`: is this specific `ifc_class`/`element_name` pattern hitting a material/geometry
   assignment path that fails silently? Is there a per-class or per-size culling/LOD gate that could be
   dropping small `IfcBuildingElementProxy` instances in a 63k-element building specifically? (Terminal
   also has a lot of MEP+proxy geometry and was NOT reported as missing trees — worth comparing what's
   different about Hospital's specific tree rows vs any other building's real RPC entourage that DOES
   render correctly, e.g. BimWhale's real people/car per `PHOTOREAL_STILL_RENDER.md`.)

## RELATED, NOT THIS FILE'S SCOPE
- Staffage placement algorithm itself (Alt+P behavior, candidate generation, clash-capping, formula) —
  `prompts/STAFFAGE_WALKABLE_PLACEMENT.md`, fully separate and already working correctly for Hospital
  (pax/car placement confirmed live today: `people=3 cars=1`, real evidence, no bug there).
- The M_RPC-prefix real-entourage detection/material system (`§ENTOURAGE`, `§RPC_M_PREFIX`) — already
  fixed and confirmed correct in an earlier session (`STAFFAGE_WALKABLE_PLACEMENT.md`, "SESSION RECORD"
  entries around 2026-07-17/18) — not the cause here, `realTrees=20` proves detection already works.

## SESSION 2026-07-19 (4th) — STOREY LEAD CONFIRMED: all 20 trees are on "Level 3" (terrace level)
First step from §FIRST STEPS run (read-only SQL against the local `deploy/buildings/
Hospital_extracted.db` — no DB touched, per user directive this session "not to touch DBs"):
```sql
SELECT storey, COUNT(*), MIN(center_z), MAX(center_z) FROM elements_meta em
JOIN element_transforms et ON em.guid=et.guid
WHERE lower(element_name) LIKE '%tree%' GROUP BY storey
→ Level 3 | 20 | 179.435 | 179.923      -- ALL twenty, one storey
```
Storey Z ranges for context: Level 1 starts ≈159.8, Level 3 spans ≈176.2–189.6, ground slab
§GROUND_Y=165.36. **The trees are landscape planting on the Level-3 terrace/podium (~14m above
street), exactly the hypothesis flagged last session — NOT street-level trees, and NOT a rendering
bug in the "missing geometry" sense.** A ground-level Alt+P camera framing never has them in frame
because they are three storeys up, by data, not by defect.

## USER-FACING SYMPTOM FIXED SAME SESSION (via the staffage side, PR #883)
The user's actual complaint ("Hospital still zero trees" on Alt+P) was killed by the zero-case
elimination spec in `STAFFAGE_WALKABLE_PLACEMENT.md` (SPEC 2026-07-19): the `realTrees===0` wholesale
gate is GONE — real entourage now dedups spatially instead of suppressing the whole kind. Witnessed
live on Hospital: one Alt+P press → `thisPress(people=3 trees=4)` + car, `§STAFFAGE_REAL_DEDUP n=20`.
Hospital now shows street trees on every press regardless of its terrace planting.

## RESOLVED 2026-07-19 — trees render correctly, and always did; this was a camera-framing question
Full-stream witness (local worktree server, headless Chrome, NO progress ceiling — the fix for the
2-minute-timeout dead end named above): Hospital streamed **63,182/63,182 in ~350s, `§BLOB_MISS`=0,
`§CONTRACT_CHECK guidMap=63182 orphans=0`**. Then, whitebox:
- **guidMap reverse-lookup, all 5 sampled tree guids: registered to VISIBLE rendered objects**
  (4× BatchedMesh, 1× InstancedMesh — which is also why an earlier `findMeshByGuid` probe returned
  false: that helper only scans standalone meshes with `userData.guid`, not batched/instanced slots;
  wrong instrument, not a missing tree).
- **Camera aimed at tree #1's DB position (Level-3 terrace, IFC (-9.4, 66.4, 179.5)): projects
  dead-centre (ndc 0.000, 0.000), and the screenshot shows the ENTIRE Level-3 podium roof garden
  rendering** — green terrace deck, all the RPC tree canopies, shrubs, planting beds. Saved:
  `~/Pictures/Screenshots/hospital_level3_terrace_trees_2026-07-19.png`.
**Verdict: NOT a streaming.js bug, NOT a staffage bug, NOT a data error. The 20 trees are a Level-3
terrace garden that renders correctly; no ground-level Alt+P framing ever had it in frame.** The
user-facing "zero trees" complaint was killed the same session by the staffage zero-case spec
(street trees now always placed — `STAFFAGE_WALKABLE_PLACEMENT.md` SPEC 2026-07-19, bim-ootb PR
#883, MERGED, live sw v802). **This file is DONE — nothing left to investigate.**
