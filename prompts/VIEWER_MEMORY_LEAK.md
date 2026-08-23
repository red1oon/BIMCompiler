<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — VIEWER_MEMORY_LEAK: Chrome memory growth investigation, PMREM leak found+fixed+shipped

**Target repo/code: `bim-ootb` (`viewer/scene.js`, `viewer/streaming.js`) — NOT this repo.** This doc lives
in `bim-compiler` per this project's cross-repo convention (findings/prompts land here even when the fix
ships in the sibling viewer repo). Read the log after every run.

## ⚠ REOPENED 2026-08-15, NARROWED SAME DAY — PR #1360's 3 leads shipped+verified 2026-08-14, then a
## NEW unmeasured 83%-mem event happened live 2026-08-15. Same-day work converged on: the render
## pipeline is CLEAR of any Lead#1-class leak (full static code trace, §"Deep code trace 2026-08-15",
## + empirical confirmation on the real target building — Hospital, real 198-200 night-light count,
## 2 completed bake frames — §"Confirmatory Hospital run 2026-08-15" — `renderer.info.memory` never
## climbs). Still open: the eventual crash/memory-pressure is unexplained by any tracked GPU/render
## counter; most concrete remaining lead is IndexedDB frame-blob accumulation during a long bake
## (named, not yet measured — see that section's "Next session"). Not a rendering-pipeline bug anymore
## — if this recurs, look at IDB/storage growth, not AO/night/triplanar disposal again.

## Trigger
User reported Chrome memory growth over time while running the viewer, no exact repro named. Investigated
broadly, starting from 3 grounded leads already read in-session (a live `_matCache` key-widening change,
PR #1356, plus known three.js/three-mesh-bvh disposal footguns).

## Method (doctrine: measure, never eyeball — `docs/archive/TestArchitecture.md` §Browser Testing)
Headless Chromium via Playwright (reused `bim-ootb/tests/node_modules`, symlinked into a fresh worktree),
driven via CDP. Two numeric instruments, no screenshots:
- `renderer.info.memory.{textures,geometries}` — three.js's own live GPU-resource counters. This is ground
  truth for WebGL leaks: unlike JS heap, browser GC never reaches into a WebGL context — an undisposed
  texture/render-target/geometry stays allocated on the GPU forever, so a monotonic climb here with no
  matching drop is unambiguous proof, not noise.
- `page.evaluate` reads of `A._matCache`/`A.meshCache` sizes + `geometry.boundsTree` presence, before/after
  `A.clearStreamed()`, to check disposal-on-eviction actually works.
- JS heap (`performance.memory.usedJSHeapSize` via CDP `HeapProfiler.collectGarbage` + Chrome launched with
  `--js-flags=--expose-gc --enable-precise-memory-info`) was tried but **discarded as unreliable** — a
  control run (same page, same wait, no `clearStreamed()` call at all) showed the exact same ~50MB jump
  between snapshots as the "real" run, tracing the jump to the launch-flag combination itself, not app
  behavior. Recorded here so a future session doesn't re-chase the same red herring.

## Findings

### Lead #1 — CONFIRMED REAL LEAK, FIXED. `scene.js` `A.updateSky()` → PMREM render target
`THREE.PMREMGenerator.fromScene()` allocates a brand-new `WebGLRenderTarget` (texture + framebuffer) on
every call — it is not pooled/reused internally, and three.js never garbage-collects WebGL resources.
Every one of the 3 call sites in `scene.js` did `A._envMap = envRT.texture` with no reference kept to
`envRT` itself, so the previous render target was silently orphaned on the GPU every time.

**Measured (headless, `blank=1` fast boot, 8x `A.updateSky()` calls 2000ms apart — matches the real
throttle in `A._envMapThrottle`):**
```
§BASELINE {"i":0,"textures":2,"geometries":11}
§SNAP {"i":1,"textures":3, ...}   §SNAP {"i":2,"textures":4, ...}   §SNAP {"i":3,"textures":5, ...}
§SNAP {"i":4,"textures":6, ...}   §SNAP {"i":5,"textures":7, ...}   §SNAP {"i":6,"textures":8, ...}
§SNAP {"i":7,"textures":9, ...}   §SNAP {"i":8,"textures":10, ...}
§RESULT iterations=8 textures_first=2 textures_last=10 delta_textures=8 (geometries flat)
```
+1 leaked GPU texture per call, linear, unbounded. `A.updateSky()` is called every frame the sun moves
during a CPE cinema bake (`effects.js` `_sunArcStep`, called "every frame the sun moves" per its own
comment) — a bake or repeated Alt+S/day-night cycling leaks continuously and is the most likely source of
the user-observed growth, since (unlike Leads #2/#3 below) it is NOT bounded by dataset size — it grows
with wall-clock time the sky is active, indefinitely.

**Fix** (`viewer/scene.js`): a closure-scoped `_envRT` tracks the currently-live render target; a new
`_setEnvMap(newRT)` helper disposes the previous one (`_envRT.dispose()`) before assigning the new texture
to `A._envMap`. Wired into all 3 `fromScene()` sites (throttled regen, initial sync generation, no-Sky
fallback gradient).

**Re-measured post-fix, same 8-call loop:**
```
§RESULT iterations=8 textures_first=2 textures_last=2 delta_textures=0
```
Flat. Leak gone.

### Lead #2 — INVESTIGATED, NOT A LEAK. `streaming.js` `A._matCache` key widening (PR #1356)
PR #1356 (this session, `discipline`+`mepHint.code` added to the cache key) increases the number of
distinct materials that CAN exist for a building, but:
- Cache-hit dedup (`if (A._matCache[cacheKey]) return A._matCache[cacheKey];`) means revisiting/re-rendering
  already-seen content never recreates materials — no per-navigation leak.
- `A.clearStreamed()`'s existing dispose loop (disposes every mesh's material, then resets `A._matCache =
  {}`) correctly frees everything when it runs. Measured on `HHS_Office_Federated` (63K+ elements,
  real production-scale building): `matCacheEntries` 26 → 0 after `clearStreamed()`.

Not fixed — nothing to fix. The widened key is real (more distinct materials at peak for a given building)
but bounded, deduped, and disposed correctly. Honest negative result.

### Lead #3 — REAL GAP FOUND (defensive fix), not proven to be an active leak
`A.clearStreamed()` disposed cached `BufferGeometry` via `geometry.dispose()` without first calling
`geometry.disposeBoundsTree()`. three-mesh-bvh's `boundsTree` is a monkey-patched property (wired in
`loader.js`) that sits outside `BufferGeometry`'s own native dispose chain — plain `.dispose()` does not
free it. Fixed by adding `disposeBoundsTree()` before `dispose()` at both disposal sites (in-scene meshes
in the `toRemove` loop, and `A.meshCache` values).

**Caveat, stated honestly:** could not prove this was an *active* leak via heap measurement — a control run
(no `disposeBoundsTree()` fix, but also no other references retained after `A.meshCache = {}`) showed the
BVH structures becoming JS-heap-unreachable and presumably GC-eligible regardless, since nothing else in
the codebase was found holding a stray reference to those geometries after clear. This is shipped as a
correctness fix matching three-mesh-bvh's documented disposal contract (cheap, safe, right thing to do),
not as a proven-leak fix the way Lead #1 is. Verified safe at scale: `HHS_Office_Federated`, 3269
BVH-bearing geometries, all correctly zeroed post-clear (`bvhCount` 3269 → 0, `rendererGeometries` 364 →
11), no errors.

### Separate observation, not fixed — flagged for a future session if wanted
`A.clearStreamed()` has exactly one call site in the whole app (`time_machine.js:7810`, a Time-Machine
scrub-close path). Normal building-to-building navigation (`A.streamBuilding()`) never calls it — buildings
accumulate in `A.meshCache`/`A._matCache`/`A.buildingsRendered` for the rest of the session once streamed,
with no distance-based unload. This is very likely **intentional** (the `A.savedStreams`/`buildingsRendered`
pattern exists specifically so revisiting an already-streamed building is instant, not re-fetched) and is
bounded by the finite building count in a given DB/session — walking a fixed campus does not grow without
limit once every building has been visited once, unlike Lead #1's genuinely unbounded per-tick leak. Not
changed here since it wasn't proven pathological and would be a real design decision (when/how to unload a
building that's fallen far out of view) rather than a bug fix — naming it here so it isn't re-discovered
from scratch if the user reports growth on a very large multi-building site after this fix ships.

## Shipped
- **PR #1360** (`bim-ootb`, branch `fix/memleak-investigate`) — `viewer/scene.js` (PMREM dispose, Lead #1)
  + `viewer/streaming.js` (BVH dispose on clear, Lead #3). Auto-merge (squash) enabled same session.
  https://github.com/red1oon/bim-ootb/pull/1360
- Both changed files `node --check`-clean. Both fixes verified at production scale
  (`HHS_Office_Federated_extracted.db`, 63K+ elements) with no regressions or console errors, in addition
  to the isolated before/after measurements above.

## Resume block (if reopened)
- If the user reports the leak persists after this ships: check whether they're on a workflow this
  investigation didn't cover (Time Machine's own sun-cycle tick, `time_machine.js` `applySunCycle()`, was
  checked and does NOT call `A.updateSky()` per-tick — it mutates `_sky.material.uniforms`/`app.sun.position`
  directly, so it was ruled out as a driver of Lead #1; if that turns out wrong, re-verify with the same
  `renderer.info.memory.textures` method used here).
- If a future session wants to pursue the "buildings never unload" observation above: that needs a product
  decision (unload threshold, whether `A.savedStreams` should evict LRU-style) before any code, per this
  project's Spec-First rule — not a quick follow-up patch.

## ⚠ OPEN 2026-08-15 — live session hit 83% system memory mid-bake, tab killed before it could be measured
User ran a real Hospital Alt+C bake in the tab confirmed running `§BUILD_VERSION v1029` (post-#1360, the
PMREM fix WAS active) for an extended period (bake reached frame ~249/1728 before being reported as
sluggish). System-wide memory hit 83%, unresponsive enough that the user had Chrome killed outright
(`pkill -f -i chrome`, confirmed clean — 16 Chrome processes → 0, system freed back to ~7.1GB used /
21GB available). **No `renderer.info.memory`/`§MEM_CHECK` reading was taken before the kill** — the
console line was handed to the user to paste (`console.log('§MEM_CHECK', JSON.stringify(APP.renderer
.info.memory), 'matCacheKeys=' + Object.keys(APP._matCache||{}).length, ...)`) but the tab was closed
before anyone ran it. **Genuinely unknown, not assumed either way:** whether this was (a) legitimate
memory load for a long-running 63K-element bake with AO/shadow/staging/triplanar all active
simultaneously (this is a real, heavy combination — §PHOTO_AO alone runs 24 frames × denoise per still,
§TRIPLANAR_PERF logged 48 materials, `§NIGHT_STILL_LIGHTS raised to 200 lights` — none of that is cheap,
and none of it was audited by the #1360 investigation, which only checked 3 specific leads: PMREM env-map,
`_matCache`, BVH-on-clear), or (b) a residual leak in a code path #1360 never looked at (e.g. AO/denoise
render targets, night-mode glow materials/lights, staging's own texture swaps — none of these were on
this session's lead list at all).

**Next session, if this recurs:** run the `§MEM_CHECK` line above every few minutes during a comparable
bake (AO+night+triplanar all active) and watch `renderer.info.memory.textures` specifically — if it
climbs roughly linearly with elapsed time/frame count the way Lead #1 did before its fix, that's the
same class of bug in a different subsystem (most likely AO/denoise render targets or night-glow
materials, per the log tags above, since those are the heaviest per-frame allocators this bake exercises
that #1360 never checked). If it stays flat/bounded, 83% was legitimate load for this
building+settings combination, not a leak — a real but separate finding (this bake's memory FOOTPRINT is
just large) from "memory GROWS without bound" (what #1360 was scoped to and fixed).

## Reference — how GPU/WebGL memory management works in this codebase (general, for future sessions)
Captured here since it came up live and is genuinely useful background, not specific to any one bug:

**The core fact:** WebGL/GPU resources — geometries, materials, textures, render targets, compiled shader
programs — are NOT covered by JavaScript's garbage collector. They live on the GPU; JS only holds a
handle. Dropping the JS reference without calling `.dispose()` first orphans the GPU-side memory
permanently — nothing reclaims it later, no matter how aggressively JS GC runs (this is why the JS-heap
measurement in this investigation's own Method section was discarded as unreliable/irrelevant — `perfor
mance.memory` only sees the JS side, never the GPU side where the real leaks in this app live).

**The three failure patterns found/checked in this codebase, as a reusable checklist:**
1. **Reassignment without disposal** — a variable holding a GPU resource gets pointed at a new one before
   the old one is disposed. This was Lead #1 exactly (`A._envMap = envRT.texture` every ~2s, old render
   target never freed). Rule: anywhere a `THREE.Texture`/`WebGLRenderTarget`/`BufferGeometry`/`Material`
   gets reassigned, dispose the previous value first.
2. **Missing a layer in a cleanup path** — `clearStreamed()` disposed geometries but skipped
   `disposeBoundsTree()` first (Lead #3); three-mesh-bvh's structure sits outside `BufferGeometry`'s
   native dispose chain. Rule: cleanup paths need to dispose every layer a resource has, not just the
   outermost/obvious one.
3. **Unbounded caching without eviction** — `A._matCache` (Lead #2) grows with every distinct material
   key; currently safe only because cache-hit dedup + `clearStreamed()`'s existing dispose loop both
   still cover it. Rule: any future change that widens a cache key (like #1356 did) needs to re-check the
   eviction path still empties the WHOLE widened key space, not just re-use the old assumption.

**Practical habit:** a full Alt+C bake is the best stress test available for this class of bug — it
cycles sky/lighting/staging/AO state every frame in a tight loop, so any future disposal gap shows up
fastest there via `renderer.info.memory`, not in casual navigation. The open item above is exactly this
kind of test surfacing something real — whether it's a new leak or just genuine heavy-scene footprint is
the open question, not whether the test was worth running.

## Follow-up 2026-08-15 (same day) — headless repro attempted, partial/inconclusive, real signal found

**Setup:** `/tmp/wt-sandbox` worktree recreated at `origin/main` (`3de6b49`, includes PR #1363's
sun-shadow-graze fix), Hospital DB symlinked, static server on `:8399`. 3 headless Puppeteer runs against
`viewer.html?db=buildings/Hospital_extracted.db`, each driving `window.APP.startMaxQualityOrbit(...)`
directly (the real Alt+C entry point, `viewer/cinema_maxq.js` `start()`), polling
`renderer.info.memory` + `_matCache`/`meshCache`/`_nightLights` sizes via CDP every 4-5s. Same instrument
class as the original PR #1360 investigation, just live-polled instead of a fixed iteration count.

**Run 1** (swiftshader, viewport 1280x800, `frames:40`): streaming alone took ~336s and accounted for
essentially all the growth seen (`textures` 275→2573, `meshCacheKeys` 3905→20609+) — this is legitimate
first-time content load for a 63K+-element building, not a leak (matches Lead #2's own methodology: cache
population on first view is expected). `§MAXQ_START` fired at ~346s. From there, `textures`/`geometries`
held flat at **2737/2801** for the ~154s further observed before the headless browser session died
(`TargetCloseError: Session closed`) — no `§MAXQ_FRAME` ever completed (frame 0's AO/TAA still-refine
phase alone outlasted the observation window).

**Run 2** (GPU-backed headless — `--enable-gpu --use-angle=gl`, matching the user's real hardware path
instead of software rendering): crashed within seconds of launch. **This sandbox has no working
off-screen GPU context for headless Chrome** — swiftshader is the only viable headless path here, so a
byte-for-byte repro of the user's real (GPU-backed, foreground) crash is not possible via this harness.
Per [[feedback_no_interactive_chrome_tool]] the user's real foreground Chrome is off-limits for automated
driving, so there is currently no available path to a fully faithful automated repro.

**Run 3** (swiftshader, viewport shrunk to 640x400 to cut AO/denoise cost, ~28min budget): streaming
settled ~154s in, `§MAXQ_START frames=10 fps=15 path=cinema` confirmed fired. `textures`/`geometries`
then held **exactly flat at 2737/2801 for over 18 straight minutes** (329 samples, elapsedMs 346k→1409k)
— same plateau value as Run 1, independently, on a different viewport — before the same
`Session closed` disconnect. Again zero `§MAXQ_FRAME` completions. `nightLights` stayed 0 the entire run
in both attempts — `§NIGHT_STILL_LIGHTS` never fired, meaning staging's night-light-boost path (one of
the two named suspects below) was **never actually exercised** by either repro attempt. That's a real gap,
not a negative result on that suspect.

**Source check — AO is NOT the Lead #1 leak pattern:** read `effects.js` `_buildStillAO()`/
`_ensureStillAO()` (~3444-3735). `N8AOPass`, `aoScratchRT` (the `THREE.WebGLRenderTarget` at line 3598),
and `shadowRestoreMat`/`shadowRestoreQuad` are all built **exactly once per page session** — memoized
behind `_stillAOPromise`, reused across every AO phase via `ao.adapter.enabled` toggling and
`ao.pass.firstFrame()` accumulation resets, never reallocated per call. This is the opposite shape of
Lead #1's PMREM bug (fresh `WebGLRenderTarget` every call, old one orphaned) — ruled out as written today.

**Honest verdict — inconclusive, not closed either way:**
- **Against a Lead#1-class leak:** `renderer.info.memory` showed zero growth signature across 18-23min of
  real AO/TAA/triplanar work in two independent runs (different viewports), and the AO source itself
  doesn't have the reallocate-without-dispose shape. This is real evidence, not nothing.
- **Not a full answer:** neither run ever completed a single `§MAXQ_FRAME` (frame 0 alone outlasted both
  attempts), so the specific question the resume block asked — does memory climb *across* repeated frames
  the way Lead #1 did — was never actually tested. The real incident reached frame ~249/1728; this
  sandbox's software-rendering path couldn't reach frame 1 in ~40min combined.
- **The crash itself is unexplained by the tracked counters** — textures/geometries were dead flat right
  up to disconnect in both runs, and `dmesg`/`free -h` showed no host-level OOM or memory pressure either
  during or after (system sat at 11Gi/29Gi used post-crash). Two live, unconfirmed hypotheses, neither
  ruled in or out: (a) something outside three.js's tracked Texture/Geometry accounting is the real
  consumer (raw pixel readback, JS heap churn from the AO RAF loop, browser-internal buffers) — would need
  JS-heap or `ps -o rss=` process-level instrumentation, which this run didn't capture; (b) Chrome's own
  hang-detection self-terminating the renderer under a long synchronous software-rendered RAF loop,
  unrelated to any app leak — plausible given headless+swiftshader is inherently much slower than the
  user's real GPU, but also unconfirmed.

**Next session, if picked up again:**
1. Add `ps -o rss= -p <chromePID>` polling alongside `renderer.info.memory` — the one instrument gap this
   run exposed (app counters can stay flat while something else grows).
2. Check why `§NIGHT_STILL_LIGHTS` never fired in a from-scratch load — if it needs a prior manual
   night-mode interaction to populate `A._nightLights`, that's a real repro gap for testing that suspect.
3. A byte-for-byte repro needs real GPU-backed rendering (this sandbox can't do headless GPU, and the
   user's real Chrome is off-limits to automation) — no clean automated path exists right now; may need to
   accept live-session `§MEM_CHECK` capture (user pastes the console line, as was attempted and missed
   2026-08-15) as the only faithful instrument until that gap is resolved.

**⚠ SUPERSEDED FINDING (see "Deep code trace" below):** the "frame 0 never completes" behavior described
above turned out to be a harness bug, not an app issue — `startMaxQualityOrbit()` was called without
`editor: false`, which opens an interactive Cinema Path Editor UI (`§CPE_LOCKS released for editing`,
`cinema_maxq.js:1049-1052`) and `await`s a user closing it. Nothing in headless ever does, so the bake sat
parked indefinitely — that's what both runs' "flat memory for 18-23min then crash" actually was, not a
leak signature or a real crash investigation. `ps -o rss=` polling was added and used below to real effect
once this was fixed. Left the mistaken run data above rather than deleting it — the AO-source finding
(memoized, not reallocated) that came out of it is still correct and still cited below.

## Deep code trace 2026-08-15 (same day, third pass) — full per-frame lifecycle read, no leak found in
## the render pipeline; real candidate named outside `renderer.info.memory`'s visibility

**Trigger for this pass:** user correction — testing was thrashing between configs (viewport size, GPU vs
swiftshader, RSS polling) without first reading the code, which is exactly why the harness bug above (missing
`editor: false`) went undiagnosed for 3 runs. Switched to a full static trace of every allocate/dispose in
the bake's per-frame path before running anything else.

**Harness fix confirmed empirically first:** with `editor: false, preview: false` added, a 6-frame Duplex
bake completed end-to-end (`§MAXQ_DONE`) in 78s. `renderer.info.memory`: textures 123→145, geometries
90→143 — but ALL of that growth landed during frame 0's one-time setup (AO pass init, 15 triplanar
materials, shadow-restore RT); frames 1-5 were flat (143→145 textures over 5 more frames, 143→143
geometries). No per-frame climb once past first-time setup — the opposite of Lead #1's signature.

**Then traced every create/dispose in the full per-frame path by reading the source, not by more testing:**
- `cinema_maxq.js` per-frame loop (~1246-1465): `A.stopStillRefine(true, true)` then `A.startStillRefine()`
  every iteration — `keepStaging=true` is the second arg both times, by design (`§MAXQ_STAGE_KEEP`).
- `effects.js` `_applyPhotoStaging()` (3121-3313, called from `startStillRefine` every frame): has an
  early-return guard (`if (_photoStagingOn) { ...skip...; return; }`, line 3137) — with `keepStaging=true`
  never clearing `_photoStagingOn`, this means the ENTIRE staging setup (ground/puddles/HDRI/sky/
  `A.updateSky()`/CAM_LIGHT) runs exactly ONCE per bake (frame 0), not every frame, despite an older code
  comment nearby (`§SUN_ARC_STOMP_FIX`) that reads as if it re-runs every frame — the comment describes the
  bug that motivated a fix, not current behavior; the guard is what's live. Verified by reading the guard,
  not by trusting the comment.
- `scene.js` `A.updateSky()`/`_setEnvMap()` (194-330): the one non-staging per-frame caller is
  `_sunArcStep()` (called every frame per `cinema_maxq.js:1327`). Its PMREM regen path is triple-gated: (1)
  `_pmrem.fromScene()` only fires inside a `!A._envMapThrottle` 2000ms-throttle callback, (2) that callback
  itself no-ops (`§ENVMAP_STOMP_GUARD`) whenever `A._envMapHdriActive` is true — which staging sets once at
  frame 0 and never clears — so the PMREM branch effectively never fires again during a bake, and (3) even
  when it does fire, `_setEnvMap()` disposes the previous render target unconditionally before assigning
  the new one (this is PR #1360's Lead #1 fix, living in the shared helper, not per-caller — so it protects
  every caller uniformly, not just the ones audited in that PR).
- `effects.js` `_setTriplanarActive()` (136-138): as currently written, this is a **no-op stub** —
  `function _setTriplanarActive(active) { return (A._triplanarMaterials || []).length; }`. It ignores its
  `active` argument entirely; `A._triplanarMaterials` is populated once during streaming
  (`streaming.js:735-736`), not per-frame. Not a leak — genuinely nothing to leak, it's dead code as an
  on/off toggle (kept only for its count, used in the `§TRIPLANAR_PERF` log line).
- `tools.js` `A._nightUpdateLights()` (1453-1567, called every frame both raising to still-budget and
  lowering back to nav-budget): a proper memoized diff — `A._nightLightByPos` Map keyed by stable fixture
  position reference, reuses existing `PointLight`s (just updates intensity) for fixtures still wanted, and
  for ones no longer wanted: `A.scene.remove(light)` + shadow-map dispose + `light.dispose()` +
  `Map.delete()`. Complete disposal chain, no dangling refs. (`§NIGHT_LIGHT_CHURN_FIX`, 2026-08-08 —
  already fixed a *different* problem, whole-set rebuild thrash, but the fix happens to also be exactly the
  right shape to prevent a leak here.)
- `effects.js` `_buildStillAO()`/`_ensureStillAO()` (already found in the prior pass, re-confirmed): N8AOPass
  + `aoScratchRT` + shadow-restore material/quad are memoized behind a single `_stillAOPromise`, built once
  per session, reused every AO phase via enable/disable + accumulation reset. Not reallocated per frame.

**Verdict on the render pipeline: clean.** Every per-frame-called path that allocates anything either (a)
only actually allocates once per bake behind a correct guard, (b) is memoized and reused with proper
dispose-on-eviction, or (c) is a no-op. No Lead#1-class (allocate-without-dispose) bug found anywhere in
this trace, and unlike the earlier inconclusive attempts, this was a full static read, not a probe that
timed out before reaching a conclusion.

**The real candidate, found by asking "what's invisible to `renderer.info.memory`" instead of re-testing
the same instrument:** `renderer.info.memory` only tracks three.js-owned WebGL textures/geometries. Two
things in the bake pipeline live entirely outside that:
1. **`cinema_maxq.js` `_captureFrame()` → `_idbPut()`** (line ~689-703, called every frame in the main
   loop): each frame is rasterized to a `<canvas>`, converted to a `webp` Blob at quality 0.92, and written
   to IndexedDB. **Nothing frees these until the whole bake finishes and the frames are read back for
   stitching** — by design, since the stitch step needs every frame. On a 1728-frame Hospital bake (the
   real incident's scale), that's 1728 blobs' worth of image data accumulating for the ENTIRE bake
   duration, growing linearly with frame count, and completely invisible to the metric both the original
   #1360 investigation and this session's headless attempts were watching.
2. **`_stitchMp4()`** (line 718-817, post-bake only): every encoded H.264 chunk is pushed into one `chunks`
   array (line 756) and held until the final `MP4Mux.mux()` call — `ImageBitmap`/`VideoFrame` objects ARE
   correctly `.close()`d immediately after each use (lines 781, 784 — this part is clean, textbook
   WebCodecs hygiene), but the encoded output itself accumulates for the whole video. Rough scale check:
   Hospital's likely canvas size × 15fps × the code's own bitrate formula (`ew*eh*fps*0.2`, clamped
   2-50Mbps) over 1728 frames (115s of footage) lands around tens of MB, not gigabytes — probably not
   the dominant driver on its own, but real and same blind spot. This phase also only runs at the END of
   the bake, so it can't explain a mid-bake (frame 249) event on its own — item 1 is the stronger candidate
   for that.

**Not yet measured, not yet claimed as confirmed** — this is a code-grounded hypothesis, not a proven
cause. Neither is a "leak" in the disposal-bug sense (nothing here is unreachable-but-retained; it's
deliberately referenced, working-as-coded accumulation) — it's a real, uncapped, growing-with-bake-length
memory cost the code was never designed to bound, which is a different (and arguably more actionable)
finding than "there's a bug to fix": the fix, if wanted, would be a product/architecture decision (stream
frames to the encoder incrementally instead of buffering all of them, or cap/warn on bake length) not a
one-line dispose fix.

**Next session, concrete verification (measure, don't re-probe blind):**
1. During a real (or headless, now that the harness works) bake, poll `navigator.storage.estimate()` or
   count/sum blob sizes in the bake's IndexedDB store at intervals — if usage climbs roughly linearly with
   frame count matching image-size × frames-so-far, that confirms candidate 1 quantitatively.
2. Cross-check against `ps -o rss= -p <chromePID>` (added to the harness this session) sampled the same
   way — IDB writes may be process-memory-resident before Chrome flushes to disk, which would show up in
   RSS even though it's invisible in `renderer.info.memory`.
3. If confirmed, the fix is a design change, not a bugfix: e.g. feed the encoder incrementally per-frame
   during the bake (already have `VideoEncoder`/`_stitchMp4`'s machinery, just needs restructuring so
   encoding happens inline in the capture loop instead of after it, dropping the need to hold all raw
   frames in IDB at once) — a real scoping decision, not something to implement speculatively here.

## Confirmatory Hospital run 2026-08-15 (same day, with the harness fix) — real target building, real
## night-light count, converges the "does it climb across frames" question

With `editor: false` fixed, ran the actual target building (`Hospital_extracted.db`, the real incident's
building) at the real incident's configuration — night lights raised to **198-200** (matches the original
report's "raised to 200 lights" exactly), AO+triplanar (48 materials) all active, swiftshader headless,
640x400 viewport, `frames: 15`.

**Result:** 2 full bake frames completed cleanly (`§MAXQ_FRAME i=0/15 elapsedMs=127433`,
`i=1/15 elapsedMs=344094` — ~127s and ~172s per frame respectively, consistent with the code's own
documented real-hardware figure of 1.6-1.8s/frame scaled up ~70-100x for swiftshader software rendering),
then a 3rd frame's cook ran for another ~450s before the browser disconnected unprompted at
`totalElapsedMs=793383` (13.2min), short of my 45min budget — not a timeout.

**`renderer.info.memory` across all of it: `textures=2758 geometries=2842`, dead flat, from right after
frame 0's one-time setup cost through the entire rest of the run** — both completed frames and the long
stretch into the 3rd. `matCacheKeys`/`meshCacheKeys` flat too (94/20609). This is the same flat signature
seen on Duplex, now confirmed on the real building with the real night-light count, across multiple
completed real bake frames (not just "stuck before frame 0" like the pre-fix runs) — **this directly
answers the resume block's original question: no, `renderer.info.memory` does not climb across repeated
real frames.** Interesting secondary data point: `rendererRssKB` (summed real Chrome renderer-process RSS)
actually *dropped* partway through (~5.2M → ~2.3M KB) alongside `rendererProcs` dropping 8→4 — the opposite
of a leak signature; looks like Chrome itself released/consolidated subprocess memory, not grew it.

**The disconnect itself is still unexplained by any tracked metric** (same as the earlier flawed runs, but
this time it happened AFTER real completed work, not while parked in a UI). Two live candidates, still
unconfirmed: the IDB-blob-accumulation hypothesis above (2 completed frames' worth of webp blobs alone
is small, so this alone doesn't obviously explain a 13-min disconnect — would need more frames to test at
scale), or an environment-specific swiftshare/headless fragility unrelated to the app (same caveat as
before — this sandbox cannot do headless-GPU, so a byte-for-byte match to the user's real crash isn't
available here regardless).

**Converged verdict for this session:** the render pipeline is clean (code trace + 2 independent empirical
confirmations, one on the actual target building at the actual incident's light count). The remaining open
question is narrower than at session start — not "is there a leak in AO/night/triplanar" (no), but
"what causes the eventual crash/memory-pressure, given the tracked GPU/render counters stay flat through
it" — and the IDB-frame-blob hypothesis is the most concrete, measurable next lead, not yet confirmed.

## ✅ §ALTS_MEM_HOG — DONE (witness) 2026-08-16, PR bim-ootb#1391 (auto-merge armed)
Same bug class as §MEMLEAK_PMREM_DISPOSE above, confirmed: `_teardownPhotoStaging()`
(viewer/effects.js) called `_showPhotoProps(false)`, which only toggled `.visible=false` on the
photo-prop lights/skyline (and did nothing at all for the window-glint sparkles) — never disposed
anything. The whole photo-prop tree (~30 PointLights, 40 skyline-box meshes, 1 sparkle Points
cloud, ~24 glint sprites) survived every real Alt+S exit, freed only on a building switch. Headless
measured (HHS_Office_Federated, swiftshader — Hospital's real 200-PL/63,917-element scale wasn't
reachable in this sandbox within a practical time budget, same documented headless-GPU caveat as
the rest of this file; leak mechanism is building-size-independent): before fix, a single
startStillRefine→stopStillRefine(true,false) cycle left 42 scene objects + 22 textures + 52
geometries + 36 programs above the pre-staging baseline; after fix, 0 leftover objects and
geometries/programs both return fully to baseline. 2 cycles back-to-back post-fix: cycle-2-exit
vs cycle-1-exit delta = 0 on every `renderer.info` counter — no per-cycle growth, the leak is
closed (remaining one-time cost is legitimate singleton HDRI/N8AO lazy-init). Fix: call
`_disposePhotoProps()` on real exit instead of the hide-only `_showPhotoProps(false)`. Full
write-up: PHOTOREAL_STILL_RENDER.md ▶RESUME §OPEN TASKS item 3.

**Rechecked 2026-08-16 (same day, later), user ask "check again if the latest code changes hog
back mem again":** re-ran the identical 2-cycle probe against current `main` (`b3e9da4`, includes
the whole Gantt-shape-refactor lane merged after the fix, bim-ootb PRs #1395-#1405) — numbers
byte-identical to the immediate post-fix verification: baseline 364 geometries/12 programs/388
scene objects, cycle-1 exit 380/44/388, cycle-2-exit vs cycle-1-exit delta = 0 on every counter.
`_disposePhotoProps()` call confirmed still present in `_teardownPhotoStaging()`. No regression —
nothing shipped since touched the photo-staging teardown path.

## 2026-08-23 — sql.js instance leaks + staffage texture cache (§SQLJS_CLOSE / §STAFFAGE_TEX_CAP)

New resource class for this file's checklist: **sql.js `SQL.Database` WASM-heap instances** — like WebGL
resources, they are NOT freed by JS GC on reference drop; an orphaned instance keeps its entire DB copy
(100-250MB for geo/mesh DBs) alive on the WASM heap until `.close()` or page death. Failure pattern #1
from this file's own reference checklist (reassignment without disposal), in a heap `renderer.info` can't
see and JS-heap tooling under-reports.

**Sites audited (bim-ootb, line numbers at `bc17bb6`):** `A.db = new SQL.Database(...)` streaming.js:2292
(split meta) / :2447 (single-DB); `A.libDb = new SQL.Database(...)` streaming.js:2361 (geo) / :2375
(extracted fallback); the three `A.libDb = A.db` alias reassignments streaming.js:2294/:2382/:2624;
`A.cityDb = new SQL.Database(...)` city.js:318. (The spec's scene.js:1420 site turned out to be a
comment, not code — scene.js's real temp DBs, import/merge/patch paths :787/:980/:987/:1410, already
close correctly and were the pattern copied.)

**Reachability verdict — DORMANT, not an active leak (traced, not assumed):** every A.db/A.libDb site
lives inside `A.init()` (streaming.js:2157), called exactly once per page life (main.js:942). All
"load another building" paths checked: Ctrl+O replace → `location.assign` full navigation
(scene.js:1073); Open-merge → `A._mergeDbIntoScene` folds into the LIVE A.db, never reassigns (its temp
`src` closes correctly); city-mode switches (city.js:707/744/796/950) swap between instances CACHED in
`A.cityBuildingDbs` — references, not constructions, and not discards (must never be closed);
`A.initCity` reached once (A.init once, or `loadCityManual` early-returns on `A.cityDb`). No user can
fire any site twice today. Claim shipped as "leak hardened, trigger not currently reachable."

**The aliasing trap (why naive close-before-reassign would have been a live-DB-killing bug):** in split
mode `A.libDb === A.db` from :2294 until the geo instance lands at :2361 — a bare `A.libDb.close()`
there closes the LIVE meta DB. Conversely, on a (hypothetical) re-entry the alias sites are where a
previous split-load's SEPARATE geo instance gets orphaned (:2294 would drop Clinic's 116MB geo with no
close). Fix: alias-aware guards everywhere — A.db sites close prior A.db then null a stale
`A.libDb === A.db` alias; A.libDb sites close only `A.libDb !== A.db`. All 7 streaming.js sites +
city.js:318 guarded; try/catch-wrapped, no-ops on every current path (prior value null or alias).

**§STAFFAGE_TEX_CAP (effects.js `_staffageTexCache`):** key space is STRICTLY bounded — 12 static
roster files (_STAFFAGE_PEOPLE 6 + _STAFFAGE_TREES 6); a DB-saved non-roster file name never reaches
`_staffageTex` (`_restoreStaffageInstances` drops it via `if (!entry) return`). Session-lifetime caching
is the documented design (§PHOTO_STAFFAGE_PRELOAD: building-independent cutouts, warmed once so the
second Alt+P is instant). Chose a dormant size cap (24 = 2x roster, dispose+evict oldest,
§STAFFAGE_TEX_EVICT log) over a clear-trigger, because both candidate triggers are wrong:
`clearRouteCache()`'s trigger is Find-panel open (navigate_find.js:4436, unrelated), and clearing in
`_disposeStaffage()` would re-incur the 2-6s decode on every building switch — the exact cost the
preload exists to kill. Cap fires only if a future change makes the key space dynamic.

**Witness (headless Playwright + CDP per §Method above, swiftshader; witness_run2.log):** re-entered
`A.init()` programmatically — the exact hypothetical multi-fire the guards protect — 3 cycles each on
real local DBs:
- Duplex 9.3MB single-DB: `oldDbClosed:true` (prior instance's `exec` throws "Database closed") both
  re-entries, count 1193 stable, libDb alias handled ("n/a (was alias of oldDb)"), 0 page errors.
- Clinic 6.1MB meta + 116MB geo split: `oldDbClosed:true` AND `oldLibClosed:true` — the :2294 alias
  guard provably closing the separate 116MB geo instance each cycle; count 16114 stable;
  renderer.info cycle2→cycle3 delta 0 on every counter (383 textures / 528 geometries / 712 meshes).
- Staffage: exactly 12 §STAFFAGE_TEX_READY across preload + 2 `togglePopulate()` presses (dedup intact
  through the new cap code), 0 §STAFFAGE_TEX_EVICT (dormant as designed), 0 errors. Press-2 GPU-texture
  growth (+3) is the documented additive-placement design, roster-bounded — not a leak signature.

**Shipped:** bim-ootb PR #1488 (branch `housekeeping/sqljs-close-leaks`) —
https://github.com/red1oon/bim-ootb/pull/1488 — merged (the repo's github-actions bot armed auto-merge
itself; not armed by this session). sw.js CACHE_VERSION v1076→v1077 (v1076 was a concurrent sibling
session's bump — took the HIGHER number per the conflict-magnet rule, same PR) + viewer.html ?v= bumps
(effects 25→26, streaming 63→64, city 7→8).
