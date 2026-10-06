# ⚠ DO NOT REMOVE — Mobile Performance: the shipped stack + open levers (the ONE place)
# SCOPE: general mobile (3D viewer) speed. Consolidates what was scattered across the
#   `project_s271_mobile_perf` + `project_s280c_perf` memories and 4 done-prompts into one
#   live work-order. A mobile-perf session works FROM HERE.
# PRIME RULE: MEASURE FIRST. Real device (or DevTools mobile + CPU/GPU throttle) → §-log
#   the metric → change ONE lever → re-measure on the SAME device/building. No speculative
#   perf edits; every change names the number it moves. Read the log after every run.
# CAVEAT: the stack below is a MAP from point-in-time memory — VERIFY each item against
#   live code (main.js / scene.js / dlod.js) before relying on or changing it.

## WHERE IT LIVES (code)
- `viewer/main.js`    — DPR scaling, on-demand render gate, tab pause
- `viewer/scene.js`   — antialias off, WebGL context-lost handler
- `viewer/dlod.js`    — DLOD disabled (r160 native culling)
- `viewer/streaming.js` / `viewer/loader.js` — DB streaming, MergedMesh vs BatchedMesh routing

## THE SHIPPED STACK  (from project_s271_mobile_perf — bim-ootb, sw v444+)
1. **r160 native BatchedMesh culling** — `perObjectFrustumCulled=true` (zero JS cost)
2. **No antialias** (scene.js) — eliminates 4× MSAA fill cost
3. **DPR 1 at rest / 0.75 during orbit** (main.js) — 44% fewer pixels while dragging
4. **On-demand render gate** (main.js) — MOBILE ONLY, skip render when idle
5. **Tab pause** (main.js) — `cancelAnimationFrame` when backgrounded
6. **DLOD off** (dlod.js) — r160 handles culling natively
7. **WebGL context-lost handler** (scene.js) — banner + reload on Chrome idle-kill

## THE GPU FALLBACK  (from project_s280c_perf) — ⚠ **REMOVED FROM CODE 2026-05-27, see §2026-07-28 FINDING below**
- ~~**MergedMesh fallback** when `WEBGL_multi_draw` is ABSENT → 197 draws instead of 70K.
  Affects Intel iGPU + **ALL mobile**. Witnesses: `§S280c_MULTI_DRAW`, `§S280c_PERF_REPORT`.~~
  **NO LONGER SHIPPED** — reverted by `68bd9a7`; `_hasMultiDraw` exists nowhere in `viewer/*.js` and
  `mergeBuckets` is never filled. Kept here only as history. Read the 2026-07-28 finding section.

## DELIBERATELY NOT ON MOBILE  (proven net-negative — do NOT re-add without a fresh witness)
- InstancedMesh zero-scale (buffer re-upload cost > savings)
- Custom BatchedMesh frustum tick (redundant with r160 native)
- On-demand render on DESKTOP (panels don't call markDirty → static screen)

## HARD CONSTRAINT
- `InstancedMesh.frustumCulled` MUST stay `false` — its boundingSphere is base-geometry
  only, so native culling would wrongly cull instances. (GPU stack depends on this.)

## OPEN LEVERS  (next session — pick by MEASURED impact, biggest first)
1. **[I/O — biggest] First-load is DB-fetch-bound on mobile, not GPU.** The meta+geo split
   (load 17–40M meta, not 251–421M geo) exists but is UNDER-USED, and some meta DBs are
   BROKEN on OCI (`LTU_AHouse_meta.db` = **0 bytes** → falls back to the 421M geo file).
   → Audit every served building's `_meta.db` on OCI; regenerate the empty/missing ones.
2. **[I/O] OPFS-resident DB** — persist the building DB to OPFS so REPEAT opens skip the
   network fetch entirely. OPFS is already proven in `analysis_sidecar.js` / `ANALYSIS_SIDECAR.md`
   (no COOP/COEP needed via the async API). Same idea, applied to the building buffer.
   **This lever is bigger than mobile-only** (2026-07-15, user-reported "fly-thru/navigate feels
   heavier on LTU, was smooth before" — real bim-ootb session, relegated here for a dedicated
   session per user's own instruction, not fixed inline): `[[project_ltu_ahouse_memory_architecture]]`
   (2026-07-13) already measured the root cause on DESKTOP, not just mobile — `sql.js` loads the
   ENTIRE DB into WASM linear memory with no paging (`new SQL.Database(new Uint8Array(buf))`,
   5 call sites: `main.js:812`, `streaming.js:1459/1519/1533/1605`, re-verified live 2026-07-15,
   unchanged). LTU = ~440MB permanently resident (43MB meta + 397MB geo) for the tab's whole life.
   **Fresh real-browser evidence (2026-07-15, user's own LTU load console log, not sandboxed)**:
   `§SPLIT_GEO_LOADED src=cache size=379MB ms=2786` — 2.8 real seconds to load geo.db into memory
   from CACHE alone (no network fetch involved) — this is the pure sql.js-parse-into-WASM cost,
   the same cost pays on EVERY open regardless of mobile/desktop or cache-hit.
   **What was checked 2026-07-15 and came back clean (do NOT re-derive)**: LTU's DB files are
   byte-identical to the 2026-07-13 measurement (same 43,053,056/397,422,592 byte sizes, mtimes
   unchanged since June — ruled out "the data grew"). A full code review of every `viewer/*.js`
   commit between 2026-07-12 13:00 and 2026-07-15 found ZERO new `markDirty`/`requestAnimationFrame`/
   `setInterval` calls and ZERO new `mousemove`/`pointermove`/`wheel` listeners — ruled out an
   obvious discrete regressive commit in that window. **What could NOT be completed**: a live
   before/after frame-time comparison (old commit `f7f27e7` 2026-07-12 vs current HEAD) — every
   attempt timed out streaming LTU's 71MB `extracted.db`/397MB `geo.db` over a single-threaded
   local `python3 -m http.server` in the dev sandbox (tried up to 400s budgets). **Next session
   needs either**: real device/devtools Performance+Memory profiling (bypasses the sandbox
   bottleneck entirely, per this file's own PRIME RULE), or a properly-resourced bisection
   environment (parallel http server, or the real OCI-served URL instead of localhost).
   **OPFS impact study needed before building it** (user's own ask, 2026-07-15, not yet scoped):
   the real open question is API compatibility, not just "will it be faster" — every `A.db.exec()`/
   `A.dbQuery()` call site across `viewer/*.js` (hundreds) currently assumes SYNCHRONOUS sql.js
   calls; `@sqlite.org/sqlite-wasm`'s OPFS-backed VFS is ASYNC-only for real paged I/O (the sync
   OPFS access handle API needs a dedicated Worker, per its own spec) — determine whether this is
   a drop-in swap or requires converting every DB-touching call path to async/await before
   estimating effort or committing to the migration.
   **2026-07-16 follow-up sweep (code-side ruled-out set EXTENDED — do not re-derive):**
   - **The 07-08 → 07-12 13:00 window (incl. the 07-11 merge burst, PRs #727–#757) is clean.**
     Every viewer commit there is event-driven Find-panel/Room-Lens UI (CSS visibility, taxonomy,
     Dijkstra-on-tap, role filter); a grep over the FULL `234d41c..HEAD` viewer diff found only
     bounded/self-clearing timers (`_glowInterval` ≤20 tries, `pulseFrame` finite tween,
     `_checkDone` self-clears) and gated `onBeforeRender` hooks — zero new unconditional per-frame
     work. This extends the earlier 07-12→07-15 review both backward and forward.
   - **TAA/still-refine (#801) gating VERIFIED in current code**: `A._composerEnabled=false` by
     default, `main.js:786/798` bypasses the composer entirely during normal navigation; teardown
     restores `accumulate=false` + prior composer flag. Photoreal shaders (#805/#806 triplanar/
     night/puddles/sparkle/shadows) are all `uTriActive`-style gated or staged+torn-down inside
     Alt+S/Cinema Orbit — and ALL post-date the first lag report (07-15 ~morning) anyway, so they
     are not the origin (could only compound). `renderer.shadowMap.enabled=false` at startup
     (scene.js:60) unchanged. three.js upgrades were 05-24 (r160→r184) and 06-27 (r184→r185) —
     outside "this week."
   - **NEW LEAD, environment not code — GPU identity during the laggy sessions (timeline matches
     exactly):** this machine's Chrome launchers carried broken NVIDIA PRIME offload flags that
     killed WebGL outright and were stripped on **2026-07-13** (`[[project_machine_chrome_firefox_
     gpu_launchers]]`) — the lag was reported 07-15. Verified 07-16 live: X primary provider is
     NVIDIA-0, and the RUNNING Chrome gpu-process has `libnvidia-glcore`+`/dev/nvidia0` mapped —
     i.e. TODAY Chrome renders on the RTX 4060, no iGPU fallback active. But whether the 07-13→
     07-15 laggy sessions ran on Intel/ANGLE-fallback is unknown — and **decidable retroactively**:
     `scene.js:54` has printed `§RENDERER_CAPS multi_draw=... gpu=<UNMASKED_RENDERER>` at EVERY
     viewer startup since S281b. → **Next action (user, 1 min): check the §RENDERER_CAPS line in
     any saved laggy-session console log** (and in a fresh LTU load now). `gpu=Intel/llvmpipe` or
     `multi_draw=off` during lag = environment cause, closed, no code chase. `gpu=NVIDIA` +
     `multi_draw=on` = the sql.js-residency/GC baseline stands and a DevTools Performance+Memory
     recording on a real LTU fly-thru is the only remaining instrument (sandbox cannot, twice
     confirmed).
   **2026-07-16 RESOLUTION of the GPU check + new suspects from the user's fresh LTU log
   (real browser, OCI-served GH Pages viewer):**
   - **GPU healthy in Chrome NOW**: `§RENDERER_CAPS multi_draw=on gpu=ANGLE (NVIDIA ... RTX 4060
     Laptop GPU)` — this session ran on the dGPU with the fast batched path. Whether the 07-13→15
     laggy sessions did is still unknown (check §RENDERER_CAPS in any SAVED log from those days).
   - **Firefox answer (user asked "must have affected FF a bit?")**: NO — the 07-13 fix touched
     only the two `google-chrome*.desktop` launchers; Firefox (snap) was untouched and re-asserts
     its own GPU prefs anyway. BUT FF on this machine NEVER has `WEBGL_multi_draw` (Mesa/driver
     gap, `[[project_machine_chrome_firefox_gpu_launchers]]`) → FF always runs the slow per-draw
     BatchedMesh fallback → LTU is permanently heavier in FF than Chrome. Not new, not a
     regression — if this week's testing mixed FF in, that alone explains "FF feels a bit off."
   - **NEW CONFIRMED HITCH MECHANISM — per-op full-DB persist (`viewer/kernel_ops.js` v8,
     `_persistToIdb` line ~100)**: EVERY committed kernel op — including a plain `ELEMENT_PICK`
     that modifies nothing — schedules, 2s debounced, `sealChain()` + a **synchronous main-thread
     `db.export()` of the ENTIRE 42MB LTU extracted.db** + a 42MB IndexedDB write. Fired twice in
     the user's short log (`§KRN_PERSIST ... size=42056KB` ×2, after ELEMENT_PICK and
     BUILDING_OPEN). Small buildings export a few MB → invisible; LTU pays a ~hundreds-of-ms
     main-thread stall landing 2 SECONDS AFTER the interaction — exactly the "slight lag I can't
     pin to anything" signature, and structurally invisible to every §PERF_PROBE (fires on a
     timer, not in any probed path). Live since 06-08 (`df813ce` KRN_PERSIST_FIX revived a
     silently-dead persist), so a month old, not this-week — but it is the biggest LTU-specific
     interaction-hitch found so far. **Fix candidates (fix-session, PUSH PAUSE in effect)**:
     (a) don't persist on read-only ops like ELEMENT_PICK (op-log row ≠ worth a 42MB export), or
     (b) op-log in a small sidecar DB persisted alone, or (c) port erp/kernel_ops.js v12's
     T7-incremental pattern — note the viewer page LOADS BOTH copies (`§KERNEL_OPS_LOADED v12`
     then `v8` — v8 loads LAST and is 4 versions stale; dedupe/upgrade is part of the same fix).
   **SPEC — fix (a) IMPLEMENTED 2026-07-16 (user go: "Then proceed"), branch
   `fix/krn-persist-readonly-ops`, worktree /tmp/wt-krn-persist, LOCAL-ONLY (PUSH PAUSE):**
   - `viewer/kernel_ops.js` (v8, the copy that wins `window.KernelOps` — viewer.html loads it
     LAST at line 875) `commitOp()`: a conservative deny-list `READONLY_OPS = {ELEMENT_PICK,
     BUILDING_OPEN}` — the two ops PROVEN firing full persists in the user's 07-16 LTU log, both
     observational (a pick highlights, an open is a marker; neither mutates the model). For
     those, skip `_persistToIdb()` and log **`§KRN_PERSIST_DEFER type=<op>`** instead. All other
     types (GRID_MOVE/ADD/DELETE/CALIBRATE/DETECT, DISC_SWITCH, ENACT_MOVE, SECTION_CUT,
     VIEW_FILTER, history replays) persist EXACTLY as before — grey-zone view-state ops stay on
     the persisting side deliberately (no judgment calls beyond the proven two).
   - Deferral is loss-bounded by design: persist exports the WHOLE db, so deferred rows ride
     along in the next mutating op's export. Only a session with ZERO mutating ops loses its
     pick/open log rows on refresh — acceptable (they're navigation events, and universal-history
     keeps its own localStorage record regardless).
   - Deliberately NOT gating inside `_persistToIdb` (its `clearTimeout` would let a read-only op
     reset a pending mutating persist's debounce) — the gate is in `commitOp` BEFORE the call.
   - **Witness (issue it proves): "read-only ops no longer trigger the 42MB export"** —
     localhost §-log: (1) BUILDING_OPEN → `§KRN_PERSIST_DEFER`, no `§KRN_PERSIST` follows;
     (2) console-driven GRID_MOVE → `§KRN_PERSIST` still fires. Cache-bust viewer.html
     `kernel_ops.js?v=4→5`.
   - **DONE 2026-07-16 ✅ (witness): `tests/probe_krn_persist_readonly.js` 7/7 PASS** — real
     viewer on real Duplex (localhost :8149, SW blocked, real 3D tap): BUILDING_OPEN and
     ELEMENT_PICK both → `§KRN_PERSIST_DEFER` with ZERO `§KRN_PERSIST`; GRID_MOVE →
     `§KRN_PERSIST url=...Duplex_extracted.db size=14620KB` with `§KRN_CHAIN sealed=3` (the two
     deferred rows rode along, loss-bounded design confirmed). Zero page errors. Log:
     /tmp/wt-krn-persist-probe.log. **LIVE 2026-07-16 ✅ (user lifted PUSH PAUSE for this
     session's work): PR #808 squash-merged (`4c0f4a0`), sw CACHE_VERSION v763→v764. Live
     verified by fetch-back: kernel_ops.js?v=5 contains §KRN_PERSIST_DEFER, viewer.html
     references v=5, sw.js serves v764. The v764 bump ALSO delivers #807 (the Find-panel
     freeze fix, merged separately without its own bust) to returning browsers — live
     navigate_find.js confirmed carrying the parentSet≤1500 gate. Worktree pruned, branch
     deleted both ends.**
   - **First-minute heaviness on LTU is structural, also visible in the log**: progressive
     streaming runs the scene at up to **13,545 draw calls** (`§PROGRESSIVE_FLUSH at=102500`)
     before the final `§BATCHED_FLUSH` collapses to 229; plus `§BVH_DEFERRED built=83537 ms=7381`
     (7.4s incremental BVH build) and `§SHELL_GHOST_BBOX boxes=28569 build_ms=207` right after
     load. Any fly-thru started in the first ~60s (e.g. pressing L immediately, as in this log)
     runs against ALL of that concurrently — feels laggy, is not a regression.
   - **Minor observation**: the log shows the L cinematic tour STARTING TWICE back-to-back
     (`[WALK] START cinematic tour` ×2, no stop between) — `toggleFlyAround` should toggle, so a
     second fire ought to cancel, not restart; two concurrent flyPath tweens fighting the camera
     would read as stutter. Unconfirmed whether double-press or double-wired listener
     (f7f27e7 07-12 touched keyboard wiring for touch-capable desktops — this machine is one).
     Check §KBD_SEQ_ENGINE count per single press if tour fly-thru specifically feels jerky.
3. **[RAM] Dispose-before-navigate** — shipped for 4D5D on mobile (`a98fcbc`: same-tab,
   dispose renderer+scene, free GPU RAM). Extend the dispose pattern to other heavy
   transitions where two scenes would otherwise co-exist.
4. **[GPU] Profile the worst building on a real device** — LTU (~122k elements) on a
   mid-tier Android: confirm draw-call count + frame ms with `§S280c_PERF_REPORT`; only
   then touch the GPU stack.
5. **[GPU — CONFIRMED via code read, not yet live-measured] Alt+Z's X-Ray state has no
   large-building fast path.** `A.cycleXrayBboxMode` (`viewer/tools.js:235`, Off→X-Ray→Bbox→Off)
   unconditionally calls `A.toggleXray()` on its first press — dims EVERY material to opacity
   0.3/transparent regardless of building size, forcing the renderer to sort+blend thousands of
   transparent draws every orbit/pan frame on a large building. `_roomLensOn()`
   (`navigate_find.js:2231`, dated comment "2026-07-15m") got a fix for the EXACT same cost on
   the Find/Room-Lens path: on a large building it now skips X-Ray entirely and goes straight to
   the cached bbox-ghost (`_buildMergedGhost()`) + `filterByGuids(new Set())` — one instanced
   wireframe draw call instead of per-material transparent shading. That fast path was never
   ported back to the manual Alt+Z toggle, so pressing Alt+Z once (Off→X-Ray) on LTU_AHouse
   still pays the old expensive cost even though the Bbox state 2 presses later would have been
   cheap. **Recommended fix (not yet implemented — diagnostic session only, PUSH PAUSE in
   effect)**: give `cycleXrayBboxMode`'s Off→X-Ray step the same "large building → skip to
   bbox-ghost directly" branch `_roomLensOn()` already has, rather than removing/detaching
   Alt+X — the ghost/bbox mechanism itself (`toggleMergedGhost`) is cheap and correctly
   cached+disposed; only the X-Ray state 1 step lacks the guard.
   - **Ruled out by code read**: `toggleXray()`'s OFF-transition (tools.js:200-204) fully restores
     each material's original `transparent`/`opacity`/`side` from `_orig*` fields and resets
     `renderer.sortObjects=true` — cycling back to "solid" should NOT leave residual per-frame
     cost by design. This was NOT independently live-verified (see sandbox limitation below) —
     treat as code-level evidence only, not a measured fact.
   - **Retracted theory (user re-tested live, 2026-07-15)**: earlier in this session, a real
     console-log paste appeared to show `_roomLensOn`/`_probeLenses`/`_allRoomVolumes` costs
     roughly doubling (99ms→229ms, 82ms→191ms, 21ms→45ms) coinciding with Find-panel opening,
     suggesting "something accumulates in RAM and Find clears it." User re-tested directly and
     reports **this does not hold up** — do not re-chase a Find-panel-fixes-it correlation.
6. **[OPEN, UNEXPLAINED — new lead 2026-07-15] HHS_Office_Federated (small building: 94 rooms,
   21 unique materials, 6880 elements) also stalls ~2s "when moving" during real Find-panel use**
   (user's own live report, real browser). This building is FAR too small for lever 5's
   large-building x-ray-dim mechanism to apply (only 21 materials to dim — trivial cost), so
   it's a DIFFERENT, not-yet-diagnosed cause. A full user console-log capture around the stall
   was reviewed — every `§PERF_PROBE` in it tops out at 21ms, nowhere near 2000ms, so the stall
   is invisible to the existing JS-side instrumentation (same blind spot the lever-5 code comment
   already names: "one-shot synchronous JS work, not ongoing paint cost"). Candidates NOT yet
   confirmed or ruled out: (a) `§ROOM_PATH` multi-hop pathfinding (`_roomGraphFor()` →
   `RG.buildGraph()`, `navigate_find.js:1037`) — the graph itself IS cached per-building so repeat
   queries should be cheap, but the Dijkstra/path-search call on a query has no `§PERF_PROBE`
   wrapping it at all, so its cost is simply unmeasured, not ruled out; (b) GC pressure from the
   fresh-`BoxGeometry`-per-door churn in `§DOOR_MARKER_SHAPE` across rapid category-tap sequences
   (each disposed correctly on toggle-off per code read, but disposal ≠ free of GC pause cost);
   (c) the perceived "stall" may simply be the camera fly-to/zoom animation duration
   (`§ROOM_SELECT_ZOOM`/`§GROUP_ZOOM`), not a technical bug at all. **Next step**: wrap the
   tap→visual-update path with `performance.now()` deltas (start at `§TAP_FIRE`, end at next
   paint) on a REAL reproduction of the actual stall, since none of today's existing probes
   caught it.
   - **Sandbox limitation reproduced again this session**: headless Chromium (Playwright +
     swiftshader) crashed twice attempting a live before/after frame-time trace on LTU_AHouse —
     not at load time (that succeeded, `§SPLIT_GEO_LOADED` fired fine), but during the FIRST
     scripted orbit/drag immediately after load ("Target page, context or browser has been
     closed" — no OOM in `dmesg`/`journalctl`, 18GB free at the time, so likely a
     swiftshader/GPU-process crash under sustained software-rendered interaction at 122k-element
     scale, not memory exhaustion). This is the SAME class of sandbox ceiling
     `[[project_ltu_ahouse_memory_architecture]]` already hit at the load stage — now confirmed to
     also block the INTERACTION stage. Real device or DevTools Performance/Memory recording
     remains the only reliable way to get frame-time numbers for large buildings; do not
     re-attempt a full headless orbit-drag session against LTU/HHS-scale geometry in this sandbox,
     it will not complete.

## 2026-07-28 FINDING — the mobile MergedMesh low-draw path is DEAD CODE (regression, silent since 2026-05-27)
**User recall was right ("mobile was fast due to some low mesh draw count") and it is NO LONGER TRUE.**
Verified by code read against live `~/bim-ootb` HEAD (`73d3676`), not memory. This supersedes
"THE GPU FALLBACK (from project_s280c_perf)" above — that stack item is now FALSE for current code.

**What's gone (two mechanisms, both removed by ONE commit):**
1. **`_hasMultiDraw` routing no longer exists anywhere in `viewer/*.js`** (grep: zero refs). S280c's
   rule `BatchedMesh only when WEBGL_multi_draw is available, else MergedMesh` is gone. `scene.js:51`
   still PROBES the extension, but `_md` is a local var used only for the `§RENDERER_CAPS` log line —
   it feeds no routing decision. So a device without `multi_draw` now gets BatchedMesh anyway =
   **one draw call per slot**, which is the exact 70K-draw case S280c was built to prevent.
2. **The mobile merge path is unreachable.** `streaming.js:1013` declares `const mergeBuckets = {}`;
   `streaming.js:1184` still has `if (A._isMobile) { for (... of Object.entries(mergeBuckets)) ... }` —
   but **nothing ever pushes into `mergeBuckets`**. The routing loop (`streaming.js:1027-1033`) sends
   EVERY single-instance element to `batchBuckets` unconditionally. It's a `const` local, so no other
   file can fill it. Mobile therefore runs the identical BatchedMesh path as desktop; `mergedCount`
   is always 0 and `§BATCHED_FLUSH` doesn't even print it.

**When and why (not this week — 2 months stale):** `68bd9a7` "fix(S280d): revert streaming.js to
pre-S280b logic — restore smooth TM + no lag" (2026-05-27 07:37, sw v501). Its own message names the
real bug it was fixing: *"`_hasMultiDraw` was never defined → `_useMerge` always true → all ≤5 elements
routed to MergedMesh → GUIDs lost → TM broken + CPU-heavy vertex baking caused lag."* The revert
restored the merge **guard** to `A._isMobile` but deleted the routing that **fills** `mergeBuckets` —
so it fixed desktop TM correctly and killed mobile's low-draw path as collateral, silently.
(Chain for the record: `47a69ee` S280c added it → `675a5ac` S280d extended it to desktop →
`d46a450` patched the missing declaration → `68bd9a7` reverted the lot.)

**Why a straight revert is NOT the fix:** MergedMesh concatenates geometry and has **no per-GUID
metadata** (this file's own §S280d Streaming Contract says so) — that is precisely what broke Time
Machine/picking in May. Any restoration must keep the contract (every non-merged element in exactly
one of `_batchMeta`/`_instanceMeta` + a `guidMap` entry), i.e. a merged path that carries a slot→GUID
range map, not the 2026-05 naive merge.

**Everything ELSE in "THE SHIPPED STACK" is still intact** (verified same pass): DPR 1.0/0.75 orbit
scaling (`main.js:672,690,696`), mobile on-demand render gate (`main.js:847-860`), tab pause
(`main.js:716`), `InstancedMesh.frustumCulled=false` hard constraint (`streaming.js:1037`),
`§CONSOLIDATE` collapsing ~1040 progressive BatchedMeshes to ~40 (`streaming.js:1495`). The mobile
`_isMobile` predicate itself is unchanged and consistent across `config.js:12`/`streaming.js:180`.
So mobile's *whole* remaining draw-call story is: ~40 BatchedMesh objects post-consolidation —
**~40 draw calls IF the device has `WEBGL_multi_draw`, tens of thousands if it does not.** There is
no longer any fallback between those two outcomes.

**THE ONE MEASUREMENT NEEDED (user, on the actual slow phone, 30 seconds — not derivable here):**
open the viewer on the device, load the building that feels slow, and read two §-lines from the
console (remote-debug via `chrome://inspect`, or Eruda/vConsole if easier):
- `§RENDERER_CAPS multi_draw=<on|off> gpu=<...>`
- `§CONSOLIDATE old_bm=<N> new_bm=<M> ...` (and `§BATCHED_FLUSH ... drawCalls=<D> mobile=true`)

Decision table — no code changes until this is read:
- `multi_draw=off` → **this IS the regression**; the missing S280c fallback is costing the device
  one draw call per slot. Fix = re-introduce a contract-preserving merged path (or a `_hasMultiDraw`
  gate that picks it), witnessed by draw-count before/after on that same device.
- `multi_draw=on` and `new_bm` ≈ 40 → draw count is NOT the cause; the slowdown is elsewhere and the
  next suspects are the already-documented ones in OPEN LEVERS 1/2 (sql.js full-DB residency, DB
  fetch/parse) — do not touch the GPU stack (this file's own lever 4 rule).
- Caveat when it reads `on`: ANGLE can *emulate* `WEBGL_multi_draw` over a native draw loop, so
  "on" means "no JS-side per-draw cost", not necessarily "one GPU draw". If it reads `on` and the
  device is still slow with ~40 batches, capture frame-ms before concluding.

## SPEC (2026-07-28) — restoring the merged path WITH the GUID contract: what it costs
**Question answered: "can the merged path be restored with GUID contract preserved, and what needs to
break or be disabled on mobile?"** Grounded in a live code read of the consumers, not from memory.
**GATE: do not implement any of this until the `§RENDERER_CAPS multi_draw=` reading from the real
device is in.** `on` → merging buys nothing, the slowdown is elsewhere (levers 1/2). This spec is only
worth executing on `off`.

### Part 1 — identity is the EASY half (and comes out better than the old path)
The merge loop (`streaming.js:1204-1256`) already walks `items` in order with running `vOff/iOff/vBase`
offsets. Recording `{guid, storey, disc, ifcClass, idxStart, idxCount}` per item is one array push
inside the existing loop — then `hit.faceIndex * 3` → binary search over sorted `idxStart` → **exact
GUID**. Register into a `_mergedMeta[mesh.id]` (mirroring `_batchMeta`) plus `A.guidMap`, and the
§S280d Streaming Contract line *"mobile single-instance → MergedMesh → no per-GUID metadata"* can be
deleted rather than worked around.
This is strictly BETTER than the 2026-05 merged path, which had no GUIDs at all and fell back to a
nearest-centroid SQL query (`picking.js:348-372`: `ORDER BY dist2 ASC LIMIT 1` within storey+disc) —
approximate by construction, returns the wrong element among close-packed neighbours.

### Part 2 — the hard half is MUTABILITY, not identity
A merged `THREE.Mesh` has none of the per-slot APIs the fleet is built on. Measured call sites:
- **`setVisibleAt`** — 24 sites / 8 files (`dlod`, `grid_views`, `helpers`, `dlod_nav`, `doc_canvas`,
  `streaming`, `panels`, `time_machine`)
- **`setMatrixAt`** — 50 sites / 11 files (adds `ghostglass`, `grid_recompose`, `city`, `measure`,
  `navigate_find`)
- **`setColorAt`** — `hba_lens.js:59-84` per-element diffuse recolour
On merged geometry each becomes an **O(vertices-of-that-element) buffer rewrite + re-upload** instead
of an O(1) call. That, not picking, is the whole cost of this decision.

### Part 3 — what actually breaks / must be disabled on mobile (the concrete list)
1. **Time Machine — ALREADY SOLVED IN-TREE, no new work.** `time_machine.js:4374` `activate()` detects
   `app._isMobile`, flips it to `false`, `clearStreamed()` + `streamBuilding()` re-streams unmerged,
   then activates. `streaming.js:180`'s `?tm` URL opt-out forces the same. This is the original
   unmerge-on-demand hatch and it still works — restoring merge does NOT re-break TM.
   ⚠ **Side-finding, live TODAY and independent of this decision**: since merge is dead, that branch
   fires on every mobile TM activation and re-streams the entire building **for nothing**. One-line
   guard worth fixing regardless.
2. **`filterByGuids` / Room Lens / isolate — THE ONE THAT SILENTLY BREAKS.** `panels.js:839-851`
   collects three shapes: `isMesh && userData.guid !== undefined`, `isInstancedMesh`, `isBatchedMesh`.
   A merged mesh is a plain `isMesh` carrying only `storey`/`disc`/`isMerged`/`mergedCount` — **no
   `userData.guid`** → matches none of the three → an isolate leaves every merged element visible.
   Silent-wrong, worse than an error. Fix = a `filterMergedMesh(mesh, pred)` that rebuilds the index
   buffer from the visible ranges (O(total indices) per toggle, once per lens action, NOT per frame),
   using the Part-1 range map. Without this, do not ship merge.
3. **Per-element hide/move/recolour consumers** — split by whether they already exclude mobile:
   - already mobile-excluded, no work: 2D grid_views/doc_canvas (`main.js:292` desktop-only), DLOD
     (`_useDlodPath && !A._isMobile`, `streaming.js:1061`)
   - NOT excluded, need promote-on-demand or an explicit mobile disable: `measure`, `grid_recompose`,
     `city`, `ghostglass`, `hba_lens`, and kernel `ENACT_MOVE`/`GRID_MOVE`.
4. **Storey/disc filter — no work.** Merge buckets are keyed `storey|disc|rgba`, so bucket-level
   `mesh.visible` is already exact (`streaming.js:1265-1270` sets both from the key).

### Part 4 — recommended shape (avoids disabling anything)
- **Merge the bulk + keep identity**: range map → exact picking + `filterMergedMesh` for isolate.
- **Promote-on-demand for mutation**: when one element must move/recolour, zero its index range
  (degenerate triangles) and spawn a standalone `Mesh` from `A.meshCache[hash]` — source geometry is
  session-resident (`scene.js:376`, shared, never disposed per `city.js:81`), so unmerge is cheap and
  bounded by the number of TOUCHED elements, not by model size. Standard static-batch/unbatch pattern;
  it is what makes item 3 a non-issue rather than a disable-list.
- **Gate it twice**: re-introduce `A._hasMultiDraw` (the flag `scene.js:51` already computes as a
  throwaway local `_md`) **and** an element-count threshold — engage merge only where BatchedMesh
  genuinely degrades to per-slot draws on a model big enough to care.
- **Witness (the issue it proves)**: on the same device + building, `§BATCHED_FLUSH`/`§CONSOLIDATE`
  draw count before vs after, PLUS a picking round-trip proving `§MERGED_PICK guid=` equals the
  `§BATCHED_PICK guid=` the unmerged path returns for the same screen coordinate (identity preserved),
  PLUS `§FILTER_GUIDS isolate=N` leaving exactly N elements visible.

### ✅ DONE 2026-07-28 — IMPLEMENTED (user go: "Do it as long as does not impact mobile strength — Walk and snag/share URL/GPS")
Branch `feat/merged-guid-contract` @ `0a713e4`, pushed. Worktree /tmp/wt-merged-guid.
**Gate note:** the user authorised this ahead of the §RENDERER_CAPS device reading. Built so that
authorisation is safe either way — the merge routing is gated on `A._hasMultiDraw === false`, so on
any device WITH multi_draw the change is inert (identical BatchedMesh path as today). The device
reading now only decides whether the user SEES a gain, not whether this is safe to ship.

**What shipped** (7 files):
- `scene.js` — persists `A._hasMultiDraw` (S280c's flag was computed and discarded here; that is the
  bug that made the whole path dead). Defaults TRUE on probe failure = never merge on unknown caps.
- `streaming.js` — `_useMerge` routing; per-element `{guid,storey,disc,ifcClass,idxStart,idxCount,
  hidden,AABB}` recorded inside the EXISTING bake loop → `_mergedMeta` + `_mergedIndex`. AABB from
  the BAKED vertices (exact under rotation; the DB `bbox_x/y/z` is IFC-axis-aligned and would
  understate a rotated element). Plus `_installMergedRaycast`, and the §S280d contract assertion now
  counts merged as a first-class side instead of excusing it via `_isMobile`.
- `picking.js` — exact guid from the range that produced the hit (O(1), tagged by the raycast). Old
  nearest-centroid SQL guess demoted to a labelled fallback.
- `helpers.js` — `filterMergedMesh()`: hides an element by writing DEGENERATE triangles into its
  index slice. Deliberately not index compaction — compaction would shift every later `idxStart` and
  invalidate the map picking/raycast depend on. Pristine index copy allocated lazily on first filter.
- `panels.js` — `filterByGuids` gains the fourth collector (merged meshes matched none of the three).
- `time_machine.js` — unmerge trigger is `_mergeActive` (not `_isMobile`), sets `_forceNoMerge`, and
  is one-shot.
- `tests/probe_merged_guid.js` — the witness.

**Mobile strengths, as required — verified not regressed:**
- **GPS** — pure `navigator.geolocation` (`walk.js:174/264`, `clash_snag.js:20`), no scene coupling.
- **Walk Wall-X-Ray** — `walk.js:549` already falls back to DB-centroid marker spheres when no
  per-mesh guid match exists; that fallback is the normal path today anyway (BatchedMesh/
  InstancedMesh carry no `userData.guid` either), so merging changes nothing.
- **Walk/fly frame cost** — the one real risk, engineered for: `sfx.js:445` fly-rayblast casts at
  11Hz and a merged bucket has NO BVH (three-mesh-bvh builds boundsTree on the shared meshCache
  source geometries, not on baked merged copies). Two-level raycast instead: ray→element-AABB slab
  test, then the STOCK `Mesh.raycast` restricted by `drawRange` to the survivors. **Measured: 0.41%
  of elements triangle-tested on HHS** (587 of 142,251), 60 casts in 75ms under swiftshader.
- **snag** — GUIDs come from DB rows + the picked guid; picking is now exact rather than guessed.
- **share URL** — `share.js:225` reads `#info-guid`; the probe asserts it carries the picked guid.

**WITNESS — `tests/probe_merged_guid.js`, 16/16 PASS on BOTH Duplex and HHS_Office_Federated.**
Real viewer, real DB, real 3D tap, SW blocked. Logs: `/tmp/probe_merged_guid_duplex2.log`,
`/tmp/probe_merged_hhs.log`.
- W-MERGED-ROUTE: Duplex 344 draws → 20 (17.2×); HHS 264 → 19 (13.9×)
- W-MERGED-CONTRACT: `§CONTRACT_CHECK batch=0 instanced=4123 merged=2716 mergedIndex=2716 orphans=0`,
  zero §CONTRACT_FAIL
- W-MERGED-PICK: `§MERGED_PICK guid=3XrBtx9eX7mQE6EqWHPeuA` — and the SAME screen point on `?merge=0`
  gives `§BATCHED_PICK guid=3XrBtx9eX7mQE6EqWHPeuA`. **Identity provably unchanged by merging.**
- W-SHARE-URL: `#info-guid` = that guid
- W-MERGED-FILTER: isolate → exactly 1 of 2716 merged elements visible, 1 bucket drawn; restore → all
  2716 back
- W-MERGED-RAYCAST: 60/60 aimed rays HIT (proves the AABB test isn't rejecting valid hits) at 0.41%
  triangle-tested
- W-MERGED-TM: `§TM_UNMERGE` exactly once → `mergedMetas=0 batchMetas=60`, zero PAGEERROR both runs

**BUG THE WITNESS CAUGHT (worth keeping in mind, it is the same class as 68bd9a7's):** the first run
passed every assertion while the log showed `§TM_UNMERGE` firing ~30×. `?merge=1` outranked
`_forceNoMerge`, so TM's re-stream re-merged → activate() saw merged meshes → re-streamed again:
an unbounded clearStreamed/streamBuilding loop. Fixed by ordering (`_forceNoMerge` wins) + a one-shot
guard, and the probe now asserts `§TM_UNMERGE` count === 1. **A passing check-list did not mean a
correct run — the log did.**

**NOT done / deliberately deferred:**
- **Promote-on-demand (Part 4)** is NOT implemented. Consumers that mutate individual elements on a
  merged mesh — `measure`, `grid_recompose`, `city`, `ghostglass`, `hba_lens`, kernel `ENACT_MOVE`/
  `GRID_MOVE` — are unchanged and will simply find no per-slot API. They are not broken today
  because merging only engages without multi_draw; wire promote-on-demand if a no-multi_draw device
  needs them.
- **Not deployed.** No `sw.js` CACHE_VERSION bump, no PR merged — the branch is pushed only.
- **Pre-existing leak observed, not fixed (out of scope, named so it is not re-discovered):**
  `clearStreamed()` resets `_instanceMeta` but NOT `A.guidMap`, so guidMap grew 1119 → 11191 across
  the looping re-streams. Harmless at one re-stream; real if something ever re-streams repeatedly.

## ✅ DEPLOYED LIVE 2026-07-28 — sw `v873` (user: "deploy then i can only test in mobile")
`bim-ootb` PR **#1071** (`f091f26`) + PR **#1073** (`5de3562`, the fix below). Live-verified by
fetch-back from `https://red1oon.github.io/bim-ootb`: `CACHE_VERSION="v873"`; `streaming.js?v=58`
`picking.js?v=30` `helpers.js?v=6` `panels.js?v=43` `scene.js?v=53` `time_machine.js?v=64`
`hba_lens.js?v=7`; deployed code contains `MERGE_ROUTE` / `MERGED_PICK` / `_installMergedRaycast` /
`filterMergedMesh` / `_hasMultiDraw` / `TM_UNMERGE` / `HBA_LAZY` / `ensureHbaData`.
⚠ When fetch-back-grepping deployed files, **grep ASCII-only** (`MERGE_ROUTE`, not `§MERGE_ROUTE`) —
the `§` through curl→grep returns 0 hits as an encoding artifact and reads exactly like missing code.

**Shipped in #1071** (both witnesses re-run against the merged result, 16/16 + 11/11 PASS):
1. §MERGED_GUID — the merged low-draw path with identity (spec above).
2. §HBA_LAZY — HBA is opt-in; the `hbaFM` pill no longer casts itself onto the rail, and the whole
   HBA compile (footprints, members, 7 demonstrator seeds, `ad_seed.db` fetch) no longer runs at load.
   `§HBA_SEED ms=8.8 rooms=5` (Duplex) / `ms=10 rooms=14` (HHS) when actually invoked.

**MERGE CONFLICT RESOLUTIONS — both kept BOTH sides, and one MATTERS for LTU:**
- `streaming.js`: upstream **§S280e** (2026-07-25) raised the BatchedMesh cutoff from 1 instance to
  `LOW_INSTANCE_BATCH_MAX = 3`, because LTU had **13,453 InstancedMesh scene objects averaging 2.7
  instances each**, every one paying per-object frustum-cull traversal each frame. Kept verbatim; the
  merge/batch target selection now applies INSIDE it, so ≤3-instance elements bake individually into
  the merged buffer with their own ranges (Duplex merged elements went 758 → 929, draws 420 → 22).
- `panels.js`: upstream's `_visibilityGen` bump kept alongside the new merged collector.

**‼ SELF-INFLICTED DEPLOY FAILURE — the reason #1073 exists (read before serving test data):**
Setting up a local `http.server` to run the probes, I ran `ln -sf ~/bim-ootb/buildings/<db>
buildings/<db>` INSIDE the PR worktree. Duplex's DB is gitignored so its symlink was invisible to
git — but `buildings/HHS_Office_Federated_extracted.db` is **TRACKED**, so `ln -sf` overwrote the real
file and `git add -A` committed it: 75,579,392 bytes → a 63-byte symlink (mode 100644 → 120000).
The Pages build for `f091f26` then FAILED (`tar: ... File removed before we read it`) and **#1071
never reached the live site** until #1073 restored the blob (`0e2d157f`, byte-identical, verified
`file` reports valid SQLite 18452 pages). **Never symlink into a repo worktree to serve test data —
serve from a directory outside the checkout, or copy.** See [[feedback_never_symlink_into_repo_worktree]].

## NEXT SESSION — open items, ranked (nothing here is blocked on code, only on a reading)
1. **[THE GATE] `§RENDERER_CAPS multi_draw=` from the user's real phone on LTU.** User is testing.
   `off` ⇒ merged path auto-engages, expect `§MERGE_ROUTE on` + `§MERGED_FLUSH buckets=N elements=M`
   with M ≈ 10–20× N — that is the fly fix. `on` ⇒ inert by design; A/B by hand with `&merge=1` vs
   `&merge=0`. **If `merge=1` does not help, draw calls are NOT the bottleneck** → go to lever 2
   (sql.js full-DB residency), do NOT keep tuning the GPU stack.
2. **Fly-on-LTU, if merging doesn't fix it.** Analysis done this session, not yet measured on device:
   during a fly the camera signature changes EVERY frame (`dlod_nav.js:553`), so `_scanPending` never
   clears and `_evalChunk` runs **every frame at `EVAL_CHUNK = 16384`** (`dlod_nav.js:51`) — on LTU's
   122k that is ~7.5 frames per pass with 16K distance+frustum tests per frame, plus continuous
   `_startFade` churn where each fade hoists a standalone copy mesh (MORE draw calls) for 10 frames.
   **So `o` DLOD trades GPU draws for CPU scan + fade churn — expect a wash on a phone, which matches
   the user's "with DLOD bboxes on even so."** Measure before changing it.
3. **⛔ BLOCKED (needs one user fact): "its panel does not disappear even though touch empty spot as in
   Desktop, or when deselect in pill tray."** Could NOT reproduce on Duplex at mobile viewport — the
   HBA family drawer toggles closed correctly via the pill path, and outside-tap dismissal is
   implemented ad-hoc per drawer (`panels.js:170` whist-drawer, `:1093` disc popup), NOT globally, so
   the answer depends entirely on WHICH panel. May also be moot now that HBA no longer auto-wakes.
   **The one question: which panel?**
4. **§S280e is UNVERIFIED at LTU scale** — its own author flagged it "UNVERIFIED against TM/picking/
   storey+disc filter... do not treat this as shipped/done until those three are re-tested on a large
   building." This session's witnesses cover exactly those three ON THE MERGED PATH, but only on
   Duplex/HHS. If picking or isolate misbehaves on LTU specifically, look here first.
5. **guidMap does not contain merged elements** (by design — it is keyed by `mesh.id`, one-to-many for
   a bucket; identity lives in `_mergedIndex`). Every guidMap-based consumer therefore cannot see
   merged elements: `hba_lens` (25 refs — zone tinting silently no-ops), `city` (7), `ghostglass` (6),
   `hba_avatars` (3). NOT a regression vs the 2026-05 merged path (it registered nothing either), but
   a gap vs the BatchedMesh path. Only `hba_lens` is mobile-relevant; user closed it 2026-07-28
   ("no need further featuring in mobile"). Cheapest fix if reopened is per-vertex colour over the
   element's range + a cloned `vertexColors` material — NOT full promote-on-demand.
6. **Pre-existing leak, named so it is not re-discovered:** `clearStreamed()` resets `_instanceMeta`
   but NOT `A.guidMap` — observed growing 1119 → 11191 across repeated re-streams.

## TEST / WITNESS
- Real device (preferred) or DevTools mobile emulation + CPU 4–6× + GPU throttle.
- Capture per run, naming building + device: **draw calls · frame ms · DPR · first-load ms · peak RAM**.
- NEVER claim a speedup from config presence — measure before/after on the same device/building.
- §-log first; Playwright/visual only to confirm wiring (see docs/TestArchitecture.md §Browser Testing).

## SOURCES CONSOLIDATED HERE  (read for detail; this file supersedes them as the entry point)
- Memory: `project_s271_mobile_perf` (the stack), `project_s280c_perf` (multi_draw fallback).
- Done prompts (bim-compiler/prompts/done/): `S280c_PERF_VERIFY.md`, `S250_mobile_desktop_polish.md`,
  `S207_mobile_ux_viewer.md`, `TIME_MACHINE_MOBILE_FIX.md`.
- Docs: `docs/MOBILE_DEPLOY.md` (split-DB strategy), `prompts/ANALYSIS_SIDECAR.md` (OPFS pattern).

## §2026-10-06 FINDING — two different `_isMobile` definitions
Found by the dev-toolkit triage, `bim-ootb prompts/DEV_TOOLKIT_NO_AI.md` §7 (2026-10-06). Read from bim-ootb `origin/main` @ fb183ddf. Not fixed — this lane decides.
- Owner: `viewer/config.js:12` — `('ontouchstart' in window || navigator.maxTouchPoints > 0) && screen.width < 1024`.
- Re-derived locally WITHOUT the `ontouchstart` term: `viewer/effects.js:52`, `viewer/effects_gi_poc.js:14`
  (also the `effects.js.pacefloor` copy). A device can be mobile to `config.js` and desktop to `effects.js`.
  One-owner violation: effects should read `window._isMobile`.
