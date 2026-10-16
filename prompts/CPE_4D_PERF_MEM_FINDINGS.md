# ⚠ DO NOT REMOVE — findings + ranked refactor plan ONLY, produced by the study
# `prompts/CPE_4D_PERF_MEM_STUDY.md` (2026-08-12). NO code changes were made. Any lever below
# needs its own written spec section + user pick before implementation. Read the log after every
# run; every number here has a named source (file:line, §-tag, or the fresh-measurement log in
# this file's §2). Honour this block until the user disposes of the list.

# CPE (Alt+C) + 4D Schedule — consolidated perf/memory FINDINGS (2026-08-12)

**Method:** all 18 prompts files in the study list read in full (CINEMA_PATH_EDITOR.md 8,984 lines and
the 4D/GANTT/TM cluster via two exhaustive extraction passes, key claims re-verified directly against
the files and against `origin/main` code in `/tmp/wt-sandbox` @ `6b4eddf` #1302); the 4D lane's
3,941-line archive swept for perf numbers; live-measurement passes against **LTU_AHouse (new
2026-08-10 vintage, 125,698 `elements_meta` rows)** were started on the standing localhost:8399
sandbox and then STOPPED on the user's directive mid-study (a real Hospital bake was running on this
machine and is itself the field evidence) — the measurement passes still produced two hard findings
(§2d, R6's unstreamable-pair blocker) and the perf analysis pivoted to code (§2), per the user:
"You can analyse the code as this session is all about."

---

## §1 CORRECTIONS TO THE STUDY PROMPT'S OWN PREMISES — read before citing its numbers

1. **"Phase 2's delta-path win was never measured at LTU" is WRONG.** The user's own live LTU log
   (2026-07-20) is on record: `§PERF_TRAVERSE ms=2.0 skipped=16019/16092 mode=delta`
   (TM_INCREMENTAL_RENDER_PERF.md §0c-CLOSURE item 3, and §0a "same live LTU_AHouse retest").
   The delta path HOLDS at LTU. Root reason: **renderAtTime is O(scene objects), not O(elements)** —
   BatchedMesh consolidation puts LTU at ~16k scene objects (16,092) vs Hospital's 10,841, only 1.5×,
   not the 7.7× the element ratio suggests. The "16k vs 122k" framing conflates the two axes.
2. **The ~440MB sql.js floor is STALE.** LTU was re-extracted and went live on OCI 2026-08-10:
   meta 50MB (0 ghosts) + geo 160MB → **~210MB resident**, June pair backed up locally
   (4D archive `RESUME AFTER POWER-DOWN 2026-08-10`; files confirmed on disk: 52,633,600 +
   168,525,824 bytes, Aug 10). BUT the win does not reach returning users — see lever R6.
3. **The `§BVH_DEFERRED` 41–54s LTU stall is FIXED, not standing.** Root cause was the unmerged
   night-lighting ~200-light rebuild starving the BVH batch chain; after PRs #1255+#1259 the same
   busy-interaction run is **9.8s** (idle 8.8s) on real GPU (prompts/Viewer/FLY_TOUR_DLOD_SCALE.md
   §28). Do not cite 41–54s as a current cost.
4. **Element count of the new vintage is 125,698**, not 122,667/122,330 (both older-vintage numbers
   still quoted across the 4D files). Same building, different extract.

---

## §2 THE BAKE CPU PROFILE, READ FROM CODE (2026-08-12 — user directive mid-study: "you need not
## test further as the baking right now is demonstrating that it is heavy CPU usage than usual
## after the lighting and Sun shadow enhancement we just done. You can analyse the code")

Live field evidence at analysis time: the user's own Hospital bake, running in their Chrome,
visibly heavier CPU than pre-enhancement bakes. The code account of exactly where each frame's CPU
goes, traced through `origin/main` @ `6b4eddf` (#1302) — every claim is a read line, not a guess:

### 2a. The per-frame cycle (cinema_maxq.js bake loop, :1214-1330) — what runs 360-1186 times per film
1. `A.stopStillRefine(true)` (:1221) → `_teardownStillRefine` with NO `keepStaging` →
   **`_teardownPhotoStaging()` — full staging teardown, `_photoStagingOn=false`** (effects.js:3295-3298,
   teardown branch at the `if (!keepStaging)` line).
2. `_awaitVisible` + `_raf2` + **`_sleep(SETTLE_MS)` = a hard 250 ms sleep EVERY frame**
   (:1226; SETTLE_MS :409, "teardown→restage settle. Flicker fix" — without it staging captures
   mid-restore values). 820 frames × 250 ms = **3.4 min of pure sleep** inside the measured
   21.6-min Hospital bake.
3. Pose + `tmSetCursor` + ghost ground + day counter (the cheap part).
4. `A.startStillRefine()` (:1270) → **`_applyPhotoStaging()` runs IN FULL again** (its
   `_photoStagingOn` skip-guard was reset in step 1): `_wireGroundPuddleShader` +
   `_buildingBBoxIfc()` + `_buildGroundPuddles(...)` + ground-texture apply + fog save + HDRI
   envMap swap + `A.updateSky(...)` + sky-uniform staging (effects.js:3110-3204). The
   §SUN_ARC_STOMP_FIX comment (:1271-1279) states it outright: **"staging is torn down and rebuilt
   every frame, not once per bake."**
5. `_sunArcStep(_tn)` (:1280).
6. `_waitFoldDone(30000)` — the TAA still-refine cook (16 samples ≈ 850 ms) then SSGI phase or
   24-frame AO fold (≈ 670 ms), plus `_reassertPhotoShadowCoverage(true)` at finish
   (effects.js `_finishStillRefine`).
7. `_raf2` + **#1300's `§SHADOW_FRONTIER_AT_CAPTURE` full `A.scene.traverse`** (:1288-1314) with a
   guid-Set test per mesh AND a **linear scan of `A._batchMeta[o.id]`/`A._instanceMeta[o.id]` per
   batched/instanced object** — frontier is non-empty on essentially every buildup frame, so this
   is per-frame, and the batch-meta arrays are slot-count-sized (thousands of entries at LTU scale).
8. `_captureFrame` → webp → IDB.

**This decomposes §BAKE_FAST_PATH_COST's "~660 ms/frame unaccounted staging churn" (R1) into named
code:** 250 ms deliberate sleep + full photo-staging teardown/rebuild (incl. per-frame puddle
rebuild and sky/env update) + two rAF settles + (since 2026-08-12) the #1300 traverse.

### 2b. Why the CURRENT bake is heavier than the §BAKE_FAST_PATH_COST baseline — the enhancement's own cost, commit by commit
- **#1299 (`f9ecab3`): shadow map 2048→4096 on the bake path** — the diff's own comment: "4x
  memory/render cost for the shadow pass," deliberately scoped to the bake because it's not a
  per-nav-frame cost. But a bake frame is not ONE render: it's ~40+ (16 TAA samples + 24 AO frames
  + main), and every one pays the 4× shadow pass.
- **`e313fc5` (§SUN_ARC_STOMP_FIX): the per-frame sun arc now actually reaches the output.** Before
  this fix the #1284 arc was accidentally stomped back to a fixed dusk angle — lighting was
  effectively STATIC across frames. Now every frame has a unique sun elevation, so sky/env/shadow
  state can never be reused frame-to-frame even in principle. Correct behavior — but it converts
  what was accidentally-cacheable into unavoidable per-frame work.
- **#1300 (`a72feca`): the per-capture castShadow traverse** (2a step 7) — instrumentation added
  the same day as the user's "heavier than usual" observation.
- **#1293/#1295 (`800ad89`/`293c49b`): wider shadow frustum + building-aimed shadow camera** —
  more casters inside the frustum per shadow render (correctness fixes; they raise the per-render
  caster count).

### 2c. The consequence for R1's ranking
R1 is no longer a black box: the bake's per-frame cost is **structurally "tear the set down and
rebuild it for every photograph."** The obvious shape (needs its own spec + equivalence witness,
NO code in this pass): split `_applyPhotoStaging` into per-BAKE staging (ground/puddles/HDRI/fog —
invariant across frames) applied once, and per-FRAME deltas (sun elevation via `_sunArcStep`,
TAA reset) — which also removes most of the 250 ms settle's reason to exist (it guards against
capturing mid-restore values that a per-bake staging would never produce). The #1300 traverse can
keep its exact semantics at near-zero cost by indexing guid→object once per bake (the `_target`
index pattern TM Phase-1 already proved) instead of traversing per frame. Everything here must
keep §SUN_ARC's per-frame sun and the shipped visual output byte-identical — W-INCR-EQUIV-style
witness, not a speed witness.

### 2d. What the abandoned live-measurement attempts still established (record, not re-walk)
- Headless measurement on this shared machine competes with real bakes for CPU (my swiftshader
  Chrome hit ~1300% CPU and was killed for exactly that reason) — future LTU measurement passes
  belong on an idle machine or the user's own §-log, per the standing real-hardware rule.
- The scaffolded stream run DID prove the new-vintage pair streams once `building` is supplied
  (`§DS_QUEUED bld=LTU_AHouse elements=122330` after an in-page `ALTER TABLE`) — the R6 blocker is
  purely the missing column, not deeper schema drift. Partial log kept at
  `scratchpad/ltu_perf_log_run3_partial.txt` (timings contention-tainted, do not cite).
- New-vintage LTU counts: 125,698 `elements_meta` rows, 122,330 with geometry (streamable).

---

## §3 RANKED LEVERS — refactor/consolidation opportunities, measured before-number each

### R1 — MaxQ bake staging churn: ~660 ms/frame unaccounted ≈ 9 min of a 21.6-min bake
**Before-number:** `§BAKE_FAST_PATH_COST` (CINEMA_PATH_EDITOR.md:5053-5065, measured not estimated):
820 frames → 1,297,897 ms wall (21.6 min) for 54.7 s of film; tail rate 2,184 ms/frame of which
still-refine ~850 ms + photo-AO ~670 ms are accounted and **~660 ms/frame is unattributed staging
churn** (46% of a light frame). Encode is 1.3% — not the cost. **This study decomposed the churn into named code — see
§2a/§2c:** a hard 250 ms `SETTLE_MS` sleep per frame + full photo-staging teardown/rebuild per
frame (`stopStillRefine(true)` → `_teardownPhotoStaging()` → `_applyPhotoStaging()` again next
frame — puddles, ground texture, HDRI, `updateSky`) + the new #1300 per-frame scene traverse; and
the 2026-08 lighting/sun-shadow enhancement multiplied the ACCOUNTED slices too (4096² shadow on
~40 renders/frame, per-frame-unique sun). **Touches:** `viewer/cinema_maxq.js` (bake loop
:1214-1330, `SETTLE_MS` :409), `viewer/effects.js` (`_applyPhotoStaging` :3110,
`_teardownStillRefine`'s `keepStaging` branch). **Shape (§2c):** per-bake staging vs per-frame
deltas split + guid→object index for the #1300 check, gated on a byte-identical-output equivalence
witness. The largest measured bake cost in the corpus, now with a named mechanism.

### R2 — Land the already-built injectGantt chunk-yield (`fix/gantt-refold-hang`)
**Before-number:** `§WRITE_LOOP_TIMING ms=2044.9` on LTU, live user log 2026-08-10 (4D archive §RESUME
AFTER POWER-DOWN) — a ~2s synchronous main-thread freeze in the kernel_ops write loop, the
"refold-hang freeze class". **State:** branch `fix/gantt-refold-hang` @ `eb1340f` has the complete fix
(`_ogSupportGuard()` + `_writeScheduledChunked()` extracted, `_TM_CHUNK=2500` yields, per-chunk txns,
`injectGantt` async, 3 call sites awaited) — **26 commits behind main, commit says DO NOT MERGE until
4 witnesses green** (refold_yield, og_grid_perf, gantt_lock, tm_geo_order_cycles). 4D_SCHEDULE_
PERFECTION.md OPEN THREADS 7 already warns a naive rebase won't survive the drift. **Shape:** fresh
worktree, real sync against main, run the 4 witnesses, ship. Cheapest 2s win on the bake path because
the code already exists.

### R3 — Replan recompute redundancy: ~550 ms × every edit + the same plan 3× at open
**Before-numbers:** `§CPE_REPLAN_SLOW ms=600-1000` per edit on Terminal 48k with the expensive
prefix (`§CINEMA_PLAN_MS ~550`: fanRays=32, spaceCands=52, exitCands=135) **byte-identical across 8
consecutive drags** (CINEMA_PATH_EDITOR.md:3891-3894); Hospital replan 291→1218 ms (§CPE_REPLAN_SLOW,
hallway witness 975/1160/1474 ms); Alt+C open runs the full plan **3× identically ≈560 ms**
(`§CINEMA_PLAN_MS 291+133+135`, CINEMA_PATH_EDITOR.md:8982); LTU number in §2. **Touches:**
`viewer/effects.js` `_cinemaPathPlan` (:4572 — the invariant prefix runs BEFORE the `if (_cpeBands…)`
block), `viewer/cinema_path_editor.js` `_replanFilm` (:313-353). **Shape: already fully spec'd as
§CPE_REPLAN_LAZY** (CINEMA_DELIGHT_BATCH.md:40-66): cache the prefix (basis is pinned by
§CPE_PREVIEW_DIVERGENCE so the key is stable for the whole session), add a "re-derive entry" control,
gate on W-REPLAN-CACHE pose-equivalence (≤1e-6 m) not speed, log `§CPE_REPLAN_LAZY hit/miss/savedMs`.
The spec's own verdict: "MEDIUM, and it pays for every other item in this file. Do it first."
Fold the 3×-at-open dedupe (§CPE_PANEL_PERF item 2) into the same change — same cache, same witness.

### R4 — TM activation on the CPE click path: pre-arm + stop rebuilding the x-ray cache every activation
**Before-numbers:** first ▶ Play with buildup = **2,052 ms freeze on Hospital**
(`§CPE_PREVIEW_BUILDUP setupMs=2052` = tmActivateForBake cold init: `§XRAY_CACHE_BUILD 435 ms` +
timeline activation + ghost-ground scan; CINEMA_PATH_EDITOR.md:8979-8981); the x-ray support-edge
cache (74,942 edges, ~0.7 s on Hospital) **rebuilds on EVERY TM activation, deliberately including
the `§GANTT_CACHE_HIT` fast path where injectGantt never runs** (GANTT_ACCURACY.md:1343-1344;
`time_machine.js` `_buildXraySupportCache` :3603, `§XRAY_CACHE_BUILD` :3706); LTU activation number
in §2. Also on this path: `activate()`'s `§TM_UNMERGE` branch (time_machine.js:7097) silently
**re-streams the entire building** when merged meshes are active — an activation cost that scales
with building size and is invisible in any witness that pre-streams unmerged. **Shape:** (a) pre-arm
TM at editor open on idle (§CPE_PANEL_PERF item 1's own named candidate); (b) persist/key the x-ray
edge cache alongside the gantt cache instead of per-activation rebuild; (c) surface `§TM_UNMERGE` in
the §-log with a duration so it can't hide inside "first Play felt slow".

### R5 — Coalesce the streaming-time TM index rebuild (open spec, one page, never picked up)
**Before-number:** TM on while a big building streams → every batch bumps `_metaGen` → full
`_tmBuildEventIndex()` rebuild: **10+ cycles of `§PERF_INCR_INDEX ms=50-159` + forced `mode=full`
traverses ≈ 0.5–2 s stacked main-thread cost per load** (LTU live, 2026-07-20;
TM_STREAM_REBUILD_COALESCE.md — the ONE unfixed item from the retired TM perf lane). **Touches:**
`viewer/time_machine.js` `_tmSceneSig`/`_tmBuildEventIndex`. **Shape (already named):** debounce
~500 ms after last bump, or defer until `!APP.streaming` (mirror `_dlodEngaged`'s gate). Equivalence
witness (`mismatch=0`) gates, same as Phases 1-3.

### R6 — Memory: cache revalidation first, then the OPFS/sqlite-wasm paging spec
**Before-numbers:** sql.js loads whole files into WASM memory (verified current:
`streaming.js:1987` meta + `:2048` geo) — LTU floor now ~210MB (was 440MB pre-re-extract); live user
heap observed **2.6GB on the OLD vintage** because the building cache is **cache-first with NO
revalidation** — returning users never fetch a re-uploaded DB (4D archive 2026-08-10 item 1, "gates
the whole mem win reaching users"). CPE/4D's own additions on top of that floor are element-sized but
small relative to it: `_wpSched.ends` Float64Array (1 ts/op), `_bkState.ops` (~63k Hospital),
`_tmXraySolidifyTs` guid→ms map (~16.7k), support-edge cache 74,942–81,722 edges, MaxQ frames IDB
store (588–1186 webp blobs, wholesale-deleted next bake) — measured deltas in §2. **Shape:** (a) the
already-named revalidation path (HEAD etag/Content-Length compare on cache-hit, or a bucket version
stamp) — small, unblocks the 230MB win for every returning LTU user; (b) THEN the structural lever:
`@sqlite.org/sqlite-wasm` + OPFS VFS paging, named twice (project_ltu_ahouse_memory_architecture,
4D archive "still to be scoped") and still unscoped. A CPE/4D-internal refactor cannot move this
floor — rank (a) high because it's cheap, treat (b) as its own lane.
**⚠ NEW BLOCKER FOUND BY THIS STUDY (measured, not assumed): revalidation alone will NOT deliver the
win — the new-vintage pair is UNSTREAMABLE on a plain `?db=` load.** The new `LTU_AHouse_meta.db`'s
`elements_meta` has NO `building` column (verified by PRAGMA: `id, guid, discipline, ifc_class,
element_name, element_type, storey, material_name, material_rgba` — the old vintage and Hospital both
carry `building`), so the centres bootstrap logs `§HELPERS_QUERY_ERR no such column: m.building` →
`§CENTRES_RESULT rows=0` → `A.startStreaming()` finds no building and returns silently — geo loads
(`§SPLIT_GEO_LOADED size=161MB ms=808`) but ZERO meshes ever stream (witnessed on the sandbox @
#1302, full log `scratchpad/ltu_perf_log.txt` run 2). Every `streamBuilding` path filters
`WHERE m.building = ?`, and the S260 replicate insert assumes the OLD 5-column shape — both break on
the new schema. Live users today only escape this because the stale IDB cache serves them the OLD
vintage. Fix belongs WITH the revalidation work: either re-extract with the `building` column (or a
code-side single-building fallback when centres=0), or revalidation will hand every returning user a
building that never streams.

**✅ R6 fully done as of 2026-08-17, both halves — see `CPE_4D_PERF_MEM_STUDY.md` §RESUME for the
current record, not re-derived here to avoid duplicating a moving log.** (b) the blocker above was
fixed by an earlier, separately-motivated PR (bim-ootb#1328, `§SINGLE_BLD_FALLBACK` in
`streaming.js`) that this file never got updated to reflect. (a) cache revalidation itself shipped
bim-ootb#1418 — `A.cachedFetch` now HEAD-compares ETag/Content-Length on every cache hit before
trusting it, fails open on any uncertainty. (b) THEN (a)'s original blocking order is why this
took two sessions apart — (a) alone, before (b), would have handed every returning LTU user a
freshly-revalidated but completely unstreamable building.

### R7 — One support predicate + one x-ray element build (consolidation with a perf edge)
**Before-numbers:** the repo's own register `witness_wall_carrier_scope_all_copies.js:1-22`
documents **4 independently-written copies** of "does T rest on S" (schedule_gate.js
`auditFloating`, time_machine.js `_buildXraySupportCache`, `_ogIsCarrier`, boq_charts.html
`generateSchedule` — three fixed separately in ONE session, 2026-08-04); `_buildXrayElements()` is a
**self-described "DELIBERATE COPY of the geometry+seq build inside injectGantt()"**
(time_machine.js:3495) — the geometry+seq scan runs twice per activation-generation cycle.
§STRUCT_POOL_UNGATED (4D_SCHEDULE_PERFECTION.md) is the same story at the gate layer: class-scoped
copies each with their own blind spot, closed only by the display-layer §MIDAIR_REPAIR. **Shape:**
extract ONE shared contact/support predicate module + ONE element-build feeding both injectGantt and
the x-ray cache; the witness register already exists as the equivalence gate. Perf win is secondary
(one scan instead of two per activation); the primary win is ending the fix-it-N-times pattern the
witness file itself documents.

### R8 — Date-layout cursor: four independent implementations (consolidation, correctness-first)
**Before-number:** the 407d-vs-229d split-brain (GANTT_ACCURACY.md:22-35) came from
`schedule_author_ui.js applyDates` silently re-serializing what `materializeDefault`/
`scheduleContiguous` laid out. Live today: `cursor +=` at `schedule_author.js:542`, `:715`,
`schedule_author_ui.js:206`, plus `boq_charts.html generateSchedule()` as a fourth layout owner.
GANTT_ACCURACY's own standing rule: "grep for `cursor +=` across `viewer/schedule_author*.js`
first." **Shape:** one layout function, three callers. No bake-time win claimed — this is the
consolidation the study's "a landmine mentioned in 3 files is a refactor candidate" heuristic points
at on the authoring side.

### R9 — DLOD flip-storm (standing landmine — keep last, but the file count now argues for it)
**Before-number:** continuously-moving vfCam defeats the idle skip → full InstancedMesh pass +
flip storms, `flips_mean=2671, FPS→53` (§CPE_PANEL_PERF item 3). Named independently in
CINEMA_PATH_EDITOR.md, CPE_POV_WALK_PATHING.md (open thread 2 + walk-seam study §4), and
project_dlod_geometry_swap_landmine — three lanes, same verdict "smallest lever, touch last".
Per the study's own heuristic that recurrence makes it a refactor candidate: it stays ranked, but
LAST, and any attempt inherits the §26 generation-race lesson (dlod_nav drain races) plus the
equivalence-witness discipline. Also on record (agent-verified, CINEMA_PATH_EDITOR.md:300-304 +
dlod_nav.js:307): while the CPE editor is open, `A._maxqActive` **disengages DLOD entirely** — a
five-minute editing session on a large building runs full detail with a wake lock. Deliberate for
film quality; worth an explicit ruling on whether *editing* (not baking) should keep DLOD.

---

## §3b EXECUTION LEDGER (same session, 2026-08-12 — user: "proceed to do the fixes here then")

- **R5 ✅ MERGED — bim-ootb PR #1306** (`§PERF_INCR_DEFER`): no TM event-index rebuilds while a
  building streams; witness 4/4 (A/B: 0 builds vs baseline 5 during simulated streaming; settle=1;
  visible-set mismatch=0 over 1,140 entries via `__tmSnapshotVisible`).
- **R3 ✅ MERGED — bim-ootb PR #1305** (`§CPE_REPLAN_LAZY`): prefix cached per session; witness
  5/5, blocking W-REPLAN-CACHE bar at pose delta 0.0 across band-edit variants; editor open = 1
  prefix miss + 2 hits. First cut FAILED the equivalence gate at 0.098m — the suffix reads
  `odx/odz` (Beat-3/4 outward push); the witness caught exactly the bug class its spec predicted.
  ⛔ user decision, deliberately not shipped: a visible "re-derive entry" panel button
  (protect-#cpe-panel rule) — the engine (`A.cinemaPrefixInvalidate`) is live.
- **R2 ✅ PR #1304, auto-merge armed** (`§GANTT_REFOLD_HANG` synced): chunked kernel_ops writer
  lands; the branch's `_ogSupportGuard` DROPPED as superseded by main's `_ogSupportSweep`.
  Witnesses: refold_yield 6/6 (rows byte-identical; maxSpan 58-65ms) · gantt_lock 19/0 ·
  tm_geo_order_cycles 5/0 · tier_serial 57/0. Witness-fixture lesson: the fixture lacked
  `idx_kernel_ops_guid` (real injectGantt creates it) — the span gate measured the missing index
  (O(n²), 454s) until fixed.
- **R1 ✅ MERGED — bim-ootb PR #1307** (`§MAXQ_STAGE_KEEP`): keepStaging through
  the per-frame refine stop, SETTLE_MS sleep only when staging is actually down, `_metaGen`-keyed
  guid→object index for #1300's frontier check. A/B witness on Duplex 28-frame bakes:
  staging applied 2× total (pre-phase + once per bake) vs baseline 29×; "(staging kept)" 27/28
  frames; §SUN_ARC spread preserved (55°→6°); §SHADOW_FRONTIER_AT_CAPTURE lines byte-identical;
  scene restore clean. Witness re-run 7/7 after gate recalibration (the pre-bake still phase
  legitimately applies staging once — contract is "the FRAME LOOP applies once", ≤2 total).
  Post-merge smoke on top of #1304-#1306: 4-frame scripted bake, stagingApplied=2, R3's lazy line
  fires, 0 page errors. ⚠ swiftshader wall-time is NOISE (32-38s/frame software render swamps the
  saved slice) — the real before/after is the user's next real-GPU bake's `§MAXQ_FRAME elapsedMs`
  tail rate vs the recorded 2,184 ms/frame.
- **R4 ⛔→✅ UNBLOCKED AND IMPLEMENTED — user ruled both halves 2026-08-12.** Was: (a) pre-arm TM
  at editor open collides with G-CPE-SOLE-OWNER ("only a real Play opens Time Machine" — a
  drag/open must not silently arm TM); (b) persisting the x-ray cache across activations collides
  with `time_machine.js:7585`'s §Z_STACK_XRAY_STAGING invariant ("nothing may survive TM being
  switched off") AND GANTT_ACCURACY.md:1343's record that the per-activation rebuild is DELIBERATE.
  **Rulings: (a) "warm data only, never activate"; (b) "memoize on an input key, keep the reset."**
  Both = the recommended option. Spec written to §3c above BEFORE any code (Spec-First); shipped as
  §XRAY_CACHE_MEMO + §TM_WARM + the §TM_UNMERGE duration line. Branch `fix/r4-tm-warm-xray-memo`
  @ `2b002f5`, sw v996→**v997**. Witness W-XRAY-MEMO **Duplex 6/6**. Two things the witness caught
  that the spec had wrong, both fixed in the CODE not the gate: the memo needed **2 slots** (single
  slot made the MAXQ/Alt-C derived-order round trip miss both ways — `G-XM-KEY restore->MISS`), and
  Duplex's staged population is **legitimately 0** so the equivalence bar had to shift an `end_ts`
  to create a real defect population or it would have passed vacuously. Also corrected pre-commit:
  a warm guard referenced `app._bakeActive`, which **does not exist on APP** — replaced with the
  real busy flags `dlod_nav.js:53` already names (`_maxqActive`/`_cinemaOrbitActive`/
  `_stillRefineActive`). **Honest scope: this does NOT zero the 2.05s first Play.** Warm removes
  the elements-build slice from the click path; the memo removes the whole rebuild from every
  activation AFTER the first. `_ops` is not warmable (both `_activateAsync` load paths have side
  effects the ruling forbids), so the 74,942-edge pass still runs on the first Play of a session.
- **sw.js sequencing note:** #1305+#1306 both landed as v994 (identical hunks fused); #1304
  re-bumped to v995; R1 must take v996 — a shared CACHE_VERSION across two deploys ships stale
  files to anyone who cached between them. **R4 takes v997.** ⚠ Live confirmation of exactly why
  this rule exists: mid-session on 2026-08-12 the user reported "TM is out of synch bad" while
  testing, and a plain browser refresh cleared it — the stale-SW mixed-file signature (some v99x
  files served from the old cache alongside new ones), not a code defect in #1304-#1307. No code
  change was made in response; recorded so a future session doesn't chase it as a TM bug.

---

## §3c R4 SPEC — user ruling received 2026-08-12, both halves ruled, now UNBLOCKED

**The two rulings (verbatim intent, both the recommended option):**
- **R4(a) = "warm data only, never activate."** At CPE open, on idle, precompute the derived data
  into memo storage. `activate()` is NOT called — TM stays off: no panel, no visibility takeover,
  no `§TM_UNMERGE` re-stream, no `_ops` mutation, **no DB writes**. G-CPE-SOLE-OWNER holds by its
  letter: nothing "opens" TM. First ▶ Play reads the memo.
- **R4(b) = "memoize on an input key, keep the reset."** Runtime staging state
  (`_tmXraySolidifiedN`, per-object `_tm_xrayStaged`) still resets on TM-off exactly as today —
  `§Z_STACK_XRAY_STAGING`'s invariant is untouched. The pure-function part (guid→solidify-ms,
  derived only from geometry + `_ops`) is memoized on `_metaGen` + an `_ops` signature; identical
  inputs restore, any change misses and rebuilds. **Gate on equivalence, not speed.**

### §XRAY_CACHE_MEMO — what is actually memoizable, and the honest split
`_tmRebuildXrayCache()` (time_machine.js:3714) is TWO halves with different dependencies — this
split is what makes (a) implementable at all, and it bounds what (a) can claim:
1. `_buildXrayElements()` (:3525) — **pure function of `app.db`** (one SELECT over
   `elements_meta`+transforms → map → `_promoteRoofLoadPath`). **Does NOT read `_ops`.** Warmable
   with zero TM state and zero DB writes. → memo `_xrayElemMemo`, key `activeBuilding|_metaGen`.
2. `_buildXraySupportCache(elements, schedMap)` (:3622, the 74,942-edge pass) — **needs `_ops`**
   for `schedMap`. → memo `_xrayCacheMemo`, key `_metaGen|opsSig`.

**`_ops` is NOT warmable and must not be warmed.** Both load paths in `_activateAsync` (:7441)
have side effects the ruling forbids: the `§GANTT_CACHE_HIT` branch **writes kernel_ops**
(`DELETE`+`INSERT`+`COMMIT`, :7475-7489), and the cold branch runs the full `injectGantt`
recompute. So warm does half 1 only; half 2 is memoized for every activation after the first.
Consequence stated plainly, not hidden: **warm alone does not zero the first-Play freeze** — it
removes the elements-build slice from the click path, and (b) removes the whole rebuild from every
activation after the first. Anyone reading the ruling's mockup as "first Play = 0 ms" is reading
more than this delivers.

**Instrumentation is part of the spec, not a nicety:** `§XRAY_CACHE_BUILD` currently logs only
`total_ms` — which half dominates has never been measured. Split it:
`§XRAY_CACHE_BUILD elemMs=… edgeMs=… total_ms=… elemMemo=hit|miss edgeMemo=hit|miss`.
Without this line the win is unmeasurable and the claim would be invention.

**Key construction.** `opsSig` = `_ops.length` + a rolling hash over `(guid, end_ts)`, computed
inside the loop that already builds `_xrSched` — no extra pass. `_metaGen` is included per the
ruling; it over-invalidates (it bumps on streaming/eviction, which cannot change a DB-derived
elements list) and over-invalidating is the safe direction — a miss costs a rebuild, a false hit
is a wrong-render bug.

**⚠ CORRECTED BY THE WITNESS (first run, 2026-08-12) — the memo is TWO SLOTS, not one.** The
paragraph below originally claimed `tmRestoreDerivedOrder` would get a "legitimate hit on the map
that was correct for that order". With a single slot that is FALSE and the witness proved it
(`G-XM-KEY restore->MISS`): the derived re-key evicts the real-order map, then restoring evicts the
derived one — the MAXQ/Alt-C round trip misses in BOTH directions and gains nothing. Fixed in the
code, not in the gate: `_xrayCacheMemo` is a 2-entry most-recent-first list, so the
derived↔real alternation the cinema bake walks hits both ways. Re-run: `G-XM-KEY restore->HIT`.
This is the one place R4 actually touches the other session's TM↔Alt-C lane, and it now helps it.

**Correctness the key gives for free (do not add special cases for these):**
- `tmApplyDerivedOrder` (:8035, MAXQ camera-path re-key) re-writes op timestamps → `opsSig`
  changes → forced miss. Its existing explicit clear at :8042 stays untouched.
- `_tmResyncAfterRetime` (:6058, every drag/ruler/group/undo commit) → timestamps moved → miss.
- `tmRestoreDerivedOrder` (:8254) → back to real order → `opsSig` returns to its earlier value →
  legitimate hit on the map that was correct for that order.
- `deactivate()` (:7631) reassigns `_tmXraySolidifyTs = {}` (reassign, never mutate) so the memo is
  unaffected by it — and the memo is only ever *read into* the live var, never written through.
  Verified: the only writes to `_tmXraySolidifyTs[...]` are inside `_buildXraySupportCache`.

### §TM_WARM — the (a) surface
`window.tmWarmXrayElements()` — idle-callback safe, returns synchronously-ish, logs
`§TM_WARM elements=N ms=… (TM not activated)`. Called from `cinema_path_editor.js open()` inside
`requestIdleCallback`. **Hard contract: it must not set `_active`, must not touch `_ops`, must not
run a DB write, must not show the panel.** The witness asserts all four.

**⚠ BASELINE-PERF GUARD (user directive, 2026-08-12, mid-implementation: "it is performing very
well now! Thus do take care not to disturb that baseline perf").** `_buildXrayElements()` is ONE
synchronous chunk (a SELECT + a map over up to 125k rows) — once started it cannot yield, so an
ill-timed warm is a long task = a visible hitch while the user is editing bands. That is precisely
the baseline this directive protects. Therefore warm is **pure-idle and fully skippable**:
- `requestIdleCallback` with **NO `timeout`** — never forced to run. If the browser never goes
  idle, warm simply never happens and nothing is worse than today. A `timeout` would convert this
  from an opportunistic win into a guaranteed hitch; do not add one.
- Skipped entirely when `app.streaming`, when TM is already `_active`, when a bake/play is running,
  or when the memo is already populated — mirrors `_dlodEngaged`'s `!app.streaming` gate.
- If `requestIdleCallback` is unavailable, **do nothing** — no `setTimeout` fallback. A fallback
  timer is exactly the "runs at a bad moment" case this guard exists to prevent.

The same directive governs the whole of R4: every change here is **strictly additive** — a memo
consulted before work that otherwise runs verbatim, an idle-only precompute, and one log line. No
existing code path is reordered, removed, or made to run more often. The W-XRAY-MEMO equivalence
bar (mismatch=0) is what proves the render output is untouched; anything that cannot clear it does
not ship.

### §TM_UNMERGE duration (R4 part (c) — never blocked, just never done)
`activate()`:7417 logs the re-stream start but nothing measures it; a whole-building re-stream
hides inside "first Play felt slow". Add elapsed ms at the point the `_reWait` poll clears:
`§TM_UNMERGE done bld=… ms=…`.

### Witness — W-XRAY-MEMO (equivalence-gated, blocking)
`viewer/tests/witness_xray_cache_memo.js`, the same shape as R3/R5's:
1. **Equivalence (the blocking bar):** build the cache fresh, snapshot `_tmXraySolidifyTs`; force a
   memo hit; the restored map must be **byte-identical** (same key count, same value per key) —
   `mismatch=0`. This is the gate, not the timing.
   ⚠ **Fixture fact found by the first run: Duplex's staged population is legitimately 0** — no
   element there has a carrier finishing after its own reveal, so the naive version of this gate
   compared two EMPTY maps and would have passed vacuously. The witness now shifts one op's
   `end_ts` until `staged > 0` (a real "carrier finishes late" condition, which is the exact thing
   the feature exists for) before comparing — Duplex reaches `staged=3` at a 1-day shift. Any
   future re-use of this witness on a new building must keep that non-empty precondition.
2. **Key discipline:** mutate one op's `end_ts` → must MISS and rebuild; restore it → hit.
3. **Warm contract:** call `tmWarmXrayElements()` with TM off → `_active` still false, `_ops` still
   empty, no panel, kernel_ops row count unchanged.
4. **Invariant intact:** after `deactivate()`, `_tmXraySolidifyTs` is `{}` and the counters are 0
   (§Z_STACK_XRAY_STAGING unchanged) — the memo surviving is not the same as state surviving.

## §4 DUPLICATED-MACHINERY REGISTER (beyond the ranked levers)

CINEMA_PATH_EDITOR.md alone documents ~21 two-of-one-thing incidents; the load-bearing ones not
already ranked above, kept here so the next session doesn't re-derive them:
- **Three clocks paint the canvas:** `main.js animate()` rAF, `_previewFly()`'s own rAF chain, and
  TM's `setTimeout` `_playTimer` — the §CPE_VF_BUILDUP_BLANK race (coverage 60%→160% fix) and the
  §DLOD_VF_MATRIX_STALE stale-frustum bug (PR #1209) were both cross-clock bugs. Any future "one
  scheduler" refactor should start from this list, not from scratch.
- **Two DLOD systems** (`viewer/dlod.js` per-instance culling vs time_machine.js box-proxy DLOD) —
  needed two independent camera-resolution fix rounds (#1206/#1209, #1212).
- **Two buildup-mode selection sites** — already collapsed into ONE shared verb `tmFollowTimeline()`
  ("one shared verb cannot disagree with itself") — the PATTERN to copy for any remaining pair.
- **Schedule-truth silos** (rates.js `SEQUENCE_RULES`/`LABOR_RATES` + `rates/*.json` +
  `templates/4D_phases.json`): TM_SCHEDULE_EDITOR.md's unify mandate is **unimplemented** —
  `injectGantt` still reads `window.SEQUENCE_RULES`/`LABOR_RATES` (time_machine.js:3510/:4376-4377);
  `json_registry.js`/`construction_schedule.json`/`tm_schedule` do not exist in the tree. Data-model
  consolidation, zero bake-time impact — its own lane, not a perf lever.
- **Stranded built-but-unlanded work** (check before ANY new work in these areas):
  `fix/gantt-refold-hang` (R2); `fix/cpe-gaze-bulk` (`viewer/cinema_gaze.js` §CPE_GAZE_SOC module —
  built, UNWIRED, never merged); `fix/roof-host-wall` (measured zero effect on all 7 buildings,
  4D file says retire unless a measured case appears).

---

## §5 INVESTIGATED, NOT A LEVER (do not re-walk)

- **renderAtTime per-tick cost at LTU** — delta path holds: 2.0 ms, skipped 16,019/16,092 (user's
  live LTU log). O(scene objects) ~16k, not O(elements) 125k. Fresh confirmation in §2.
- **`§BVH_DEFERRED` 41-54s** — fixed (#1255+#1259), now ~9s on real GPU. See §1.3.
- **`_ogSupportGuard` XY-cell stacking** (Hospital 1695ms / LTU 2175ms / Terminal 4636ms) — already
  fixed by (x,y,z) bucketing in the #1193-era work; the numbers are pre-fix history, not live costs.
- **§MIDAIR_REPAIR generation cost** — one-time 1,829 ms on LTU (5,024 moved/5 sweeps), 464 ms
  Terminal, 813 ms Hospital (witness_midair_zero 22/22). Acceptable one-time cost, already shipped
  (#1301); not worth optimizing before R1/R2 land.
- **GANTT_ACCURACY.md as a perf source** — it's the accuracy lane; exactly one perf-budget line in
  1,656 (verified by sweep). Nothing to mine there.
- **Shopfloor/PP cluster** (TM_S4_SHOPFLOOR_BUILD / TM_SHOPFLOOR_COSTING_SPEC / PP_ORDER_ZOOM_TM_SPEC)
  — settled: an ERP-side overlay that CONSUMES injectGantt output and the TM cursor
  (`tmJumpToOrder`), Node/seed-side generation, zero viewer per-frame or bake-path presence
  (grep-verified: no rAF/intervals/pointer listeners in schedule_gate/author/diff). Not a lever.
- **CPE idle cost** — zero by construction (event-driven, main loop parks at 0 frames; §CPE_WALK_SEAM
  frame-loop truth). The editor's costs are all event-shaped (replan, open, first-Play) — R3/R4.
- **MaxQ frame pacing/starvation** — measured flat 36.15-36.30 elements/frame on Hospital, no
  starvation at 588 or 1186 frames; per-frame cost is R1's staging churn, not pacing.
- **ERP twin fetch per tick** — already negative-cached (`§PERF_NEG_CACHE`, was 25.8MB/tick pre-fix).
- **Walk/gamepad/XR lanes** — input-device work; zero cost when unused (gated on `_active`/connect
  flags), no per-element structures. XR stub renders nothing until a session opens.
- **`witness_cpe_buildup_schedule.js`** cannot run locally (LFS stubs) — environment fact, not perf.

---

## §6 ENVIRONMENT NOTES FOR ANY FOLLOW-UP MEASUREMENT

Headless swiftshader on this shared machine is (a) GPU-blind and (b) a CPU hog that competes with
real bakes (~1300% CPU observed streaming LTU — this study killed its own run for that reason).

**⚠ NOW MEASURED, not just asserted (2026-08-12, R4's witness run): Hospital cannot be witnessed
headless on this machine at all, and the number is `§FPS_MODE mean=14544.6 max=14544.6` — 14.5
SECONDS per frame, ~0.07 FPS.** Staged probe: `goto 0.4s → APP ready 1.8s → element_transforms
33.1s → DIED 224.0s` on the `!APP.streaming` settle wait ("Waiting failed", no ms suffix — the poll
cannot even execute inside that frame budget). So Hospital LOADS fine; it is the render loop that
crawls, which is why the failure looks like a load timeout and isn't one. **Do not re-attempt a
Hospital/LTU-scale headless witness and do not "fix" it by raising timeouts — the first R4 attempt
burned two runs doing exactly that.** Witness equivalence bars on Duplex (structural properties
hold at any n) and take scale numbers from the user's real-GPU §-log. R4's own W-XRAY-MEMO is
`LOAD_MS`/`SETTLE_MS`-configurable because of this, but configurability was not the cure.
TM_INCREMENTAL_RENDER_PERF.md §0's hard rule ("never validate a perf change only headless") applies
to every lever above: before/after ship-gates need the real-GPU §-log confirmation loop the lanes
already use (user's own machine, `window.__tmTrav`, `§MAXQ_FRAME elapsedMs`, `§BAKE_FAST_PATH_COST`-
style accounting), scheduled when no real bake is running. The bake loop already logs everything R1
needs (`§MAXQ_FRAME i/N elapsedMs`, `§STILL_REFINE done elapsedMs`, `§PHOTO_AO done`) — one fresh
`§`-line between fold-done and capture would complete the per-frame ledger with zero new harness.

---

## §7 R10 — a live-session log (2026-08-27, post-R1) found 3 candidates; 1 real, 2 are NOT levers

User pasted a real-GPU MaxQ bake log and asked whether the Alt+C lane could still cut memory/perf
waste post-R1. Code-read (not log-read alone) against current `origin/main` (`e63fa5d`, R1-R6 all
live) settles all three:

**NOT a lever — `§NIGHT_STILL_LIGHTS` reapplied every bake frame.** `A._nightUpdateLights`
(`tools.js:1545`) frustum-culls the light set against `A.camera.projectionMatrix` /
`matrixWorldInverse` (`§NIGHT_STILL_FRUSTUM`) — genuinely camera-pose-dependent. A MaxQ bake frame
is a new camera pose every time, so this is real per-frame work, not churn. Leave it.

**NOT a lever — the `§STILL_REFINE cancelled (interaction)` line every frame looked like wasted
mid-compute work; it is not.** `A.stopStillRefine(force, keepStaging)` (`effects.js:4731`) is called
by the bake loop itself (`cinema_maxq.js:1269`, `A.stopStillRefine(true, true)`) only AFTER
`_waitFoldDone` (cinema_maxq.js:1337) has already confirmed the TAA+AO fold genuinely converged —
"(interaction)" is just the generic reason string `_teardownStillRefine` logs on every exit path, a
naming artifact, not a real-input misdetection. The occasional 13–26s `elapsedMs`/`§TRIPLANAR_PERF`
spikes in the pasted log correlate with `§IDLE_GATE park`/`wake` immediately before them — tab
backgrounding/rAF-throttle wall-clock, not stalled GPU work. **Correction to my own prior-turn
claim in this conversation** — I said this was wasted work before reading the call site; it isn't.

**REAL lever — `§GLOW_LENS_QUAD` (and only the lens quad) rebuilds from scratch every bake frame for
no reason.** `_glowLensOn()` (`effects.js:4480`) builds its `InstancedMesh` geometry purely from
`A._nightFixtureWorldPositions()` + the TM-visibility filter (`p.__guid == null ||
A._tmIsVisible(p.__guid)`) — **it never reads `A.camera` anywhere in the function.** Unlike the round
glow sprite (`_glowOn`, camera-dependent eye-offset nudge, genuinely needs the per-pose recompute)
and the night lights (camera-frustum-dependent, same), the lens quad's world matrices are IDENTICAL
across two bake frames unless the TM buildup has placed a new fixture in between. Yet
`_teardownStillRefine` (`effects.js:4063-4064`) tears it down **unconditionally** — outside the
`if (!keepStaging)` gate R1 added at :4098 — and `startStillRefine` (`effects.js:4623`) rebuilds it
unconditionally every frame. This is the exact shape R1 already fixed for ground/puddle/HDRI/sky,
just not extended to this one piece: dispose+reallocate two `InstancedMesh`es (geometry, two
materials, matrix/color arrays sized to the full fixture count) every frame, for output that is
almost always byte-identical to the previous frame.

### §R10 SPEC — extend R1's `keepStaging` contract to the lens quad, Spec-First before implementing

**Mechanism:** add a module-scope `_glowLensStagedCount = -1` next to the existing
`_glowStagedCount` (effects.js:4281) — same role, new owner. Factor the visible-fixture-count loop
that `A._tmVisSubscribe`'s round-sprite restage callback already runs (effects.js:4420-4424) into a
small shared helper (e.g. `_glowVisibleFixtureCount()`) so the lens quad's gate uses the identical
predicate as the round sprite's, not a second hand-copied one. In `_teardownStillRefine`, replace
the unconditional `_glowLensOff();` at :4064 with: **always tear down when `!keepStaging`** (real
interaction/selection/cinema-handoff exit — unchanged behavior, protects the "still-only content
never survives into navigation" invariant `§GLOW_LENS_QUAD`'s own header comment states); **when
`keepStaging` is true, tear down only if `_glowVisibleFixtureCount() !== _glowLensStagedCount`**
(a buildup placed/removed a fixture since the last stage) — otherwise skip, leaving the existing
`InstancedMesh`es exactly as they are. `_glowLensOn()` already no-ops when
`_glowLensMeshRect || _glowLensMeshRound` is truthy (:4481), so skipping the teardown is sufficient
to skip the rebuild too — no change needed inside `_glowLensOn` itself beyond setting
`_glowLensStagedCount = pos.length` where `_glowStagedCount` is already set for the round sprite's
own count (its filtered set differs — round sprite's `_glowOn` in the bake path is called with
`filterFn = p.__exit`, exit-signs-only, while the lens quad handles everything else — so the lens
quad's own count must come from ITS OWN filtered `pos`, not reuse `_glowStagedCount` verbatim).

**Logging:** `§GLOW_LENS_QUAD skip (count unchanged N)` on the skip path — the FUNDAMENTAL LAW
requires a witness-visible line proving the skip actually fires, not an inferred absence of
`staged`/`removed` lines.

**Explicitly NOT in scope:** the round glow sprite's per-frame dispose+recreate (camera-dependent
eye-offset — genuinely needs recomputing every pose; a lower-risk in-place buffer update instead of
full dispose/recreate is a real idea but separate surgery, not bundled here) and
`§NIGHT_STILL_LIGHTS` (camera-frustum-dependent, real work, see above).

**Witness — same rigor as R1's `witness_maxq_stage_keep.js` (repo root, bim-ootb):** two-source
falsification, shipped `origin/main` vs. the working tree, on a scripted multi-frame bake (Duplex,
small building, buildup ON so the visibility-gate path is actually exercised): (1) N consecutive
frames with an UNCHANGED placed-fixture count must show `§GLOW_LENS_QUAD staged`/`removed` exactly
ONCE (the pre-bake still-phase stage), not once per frame — shipped main must show the baseline
count (roughly one full stage/unstage pair per frame, matching `§MAXQ_STAGE_KEEP`'s own R1 baseline
shape) so the RED case actually reproduces; (2) a frame where the buildup DOES place a new fixture
between two bake frames must still show a real `staged rect=… round=…` line with the new count —
proving the skip never starves a legitimate buildup update; (3) rect/round instance matrices
byte-identical between two skipped frames (no silent drift from stale data); (4) a real end-of-bake
`stopStillRefine` (no `keepStaging`) still fully tears the lens quad down — the navigation-safety
invariant unchanged. Gate on scene-content equivalence (matrix/color buffers), not speed — same
discipline as R1's `witness_maxq_stage_keep.js`.

**sw.js:** bump `CACHE_VERSION` in the same PR (learned twice already — R1/R4's own note above,
PR #1409's miss) and record the mechanism in a version comment, same convention as every prior
`§MAXQ_STAGE_KEEP`/`§R6a` entry.
