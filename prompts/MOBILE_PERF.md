# ⚠ DO NOT REMOVE — Mobile Performance: the shipped stack + open levers (the ONE place)
# SCOPE: general mobile (3D viewer) speed. Consolidates what was scattered across the
#   `project_s271_mobile_perf` + `project_s280c_perf` memories and 4 done-prompts into one
#   live work-order. A mobile-perf session works FROM HERE.
# PRIME RULE: MEASURE FIRST. Real device (or DevTools mobile + CPU/GPU throttle) → §-log
#   the metric → change ONE lever → re-measure on the SAME device/building. No speculative
#   perf edits; every change names the number it moves. Read the log after every run.
# CAVEAT: the stack below is a MAP from point-in-time memory — VERIFY each item against
#   live code (main.js / scene.js / dlod.js) before relying on or changing it.

## ▶▶ RESUME HERE — "resume mobile" (written 2026-11-26; read THIS block, then §2026-11-26 REVIEW at the end of this file)
**State (2026-11-27 night):** **F3 steps 3 + 4 BUILT (bim-ootb #3471 Send to HQ into the Team folder; #3474 HQ view: Get from team, one merged Issue Log, walk replay — ✅ F3 STEP 3 / STEP 4 at the end). NEXT = finish FILM-M1 rc3 (BIMCompiler PR #1336; owner notes in §2026-11-27 EVENING at the end), then re-run W-MOBILE-PANELS on a quiet machine.** Same evening: drawer rows (#3476) and the Issue Log's phone route (#3480) merged. Earlier the same day: **FILM-M1 rc1 RECORDED** (`~/Videos/Phone_fast_FILM-M1_EN_rc1.mp4`, 42.3 s — see ✅ FILM-M1 rc1 at the end; owner's notes pending). **F3 steps 1–2 LIVE (bim-ootb #3468, Send to HQ); panel redesign BUILT (bim-ootb #3469, bottom sheets in the top layer — ✅ P6 at the end). NEXT = F3 step 3 (Team folder), then step 4 (HQ view), then the FILM-M1 recut** (§2026-11-27 OWNER DECISIONS). Earlier: film was next. Team guide now positive DIY (bim-ootb #3465). Previously — owner APPROVED the panel redesign; team trial already in place (paired-browser key) — read §2026-11-27 OWNER DECISIONS (last section) for the next 4 builds in order. Before that — panel spill-through FIXED (bim-ootb #3462, W-MOBILE-P2 63/0 incl. J7). **NEXT BUILD = §P5 F3 steps 1-2** (local-first 'Send to HQ' bundle + Email relay via share sheet — no owner input needed); step 3 Team folder waits on the owner creating the `bim-teams-trial` token; owner to decide the §2026-11-27 PANELS proposal (Popover/top-layer + bottom sheet). Earlier: **P5 field ops F1+F2 DONE** (bim-ootb #3461: auto X-Ray on Walk, walk trace in the op-log, W-FIELD-OPS 8/0); F3 shared snag list to HQ waits on 2 owner facts (HQ folder URL, key holder) — see ✅ P5 at the end. Before that: P0 settled in a sandbox (§2026-11-27 P0 SANDBOX RESULT — the freeze was a device-bound shader wait); **P3 stage 1 DONE** (bim-ootb #3460: no shader freeze on phones, W-MOBILE-P3 9/0); **P2 DONE** (#3459, 61/0); **P1 DONE** (#3458, 23/0). **Read §2026-11-27 LEVELS OF IMPROVEMENT** (last section) for the before/after on a typical phone. Next = P3 stage 2, the byte diet toward ≤ 3 MB (owner accepted the target with the go); open owner decision: extend §SHADER_ASYNC to desktop (desktop freezes 6.6 s on an iGPU). P0 DONE headless, see **§2026-11-26 P0 RESULT** at the end (CPU boot cost measured up ≥1.8× eval, 4.3× parse, +1.6 s new geometry passes; first frame 2.9→7.5 s on software GL; real-phone trace still owed by the owner). Nothing built yet. Earlier state: review done, nothing built. Facts (boot JS 1.51→10.24 MB, 7 panel systems, Back only on Site Camera, 10 key-only actions, dead controls on phones) and the PROPOSED strategy are in **§2026-11-26 REVIEW** (BIMCompiler #1303). The owner has not approved any of it yet — settle one detail at a time.
**Advice (the lead's, 2026-11-26):**
1. **Start with P0 — measure, don't argue.** Lighthouse mobile *Total Blocking Time* + script-evaluation ms, headless CPU, on 818ae9f3 (May) vs HEAD, same building (Duplex). Ask the owner for one real-phone `chrome://inspect` trace. Until then "it got slower" stays INFERRED; say so.
2. **Then P1, the cheapest visible win (one PR, deletion-heavy):** one `A.caps` owner replacing the 5 `_isMobile` copies; hide (not grey) controls a phone cannot run (gi-preview row, Still/Populate/MaxQ); open Settings + JSON editor on-screen on phones (`panels.js:1891, 2420`); 44 px ✕; no `backdrop-filter` on phones. Witness: a headless phone viewport lists the pills/rows shown, each one's action runs without `§MAXQ_FAIL`/no-op, every panel's rect is inside the viewport — and a mutant (restore `left:320px`) goes RED.
3. **P2 one sheet manager under `A.createPanel`** (generic, not per panel): one sheet at a time, closes by swipe-down / tap on the canvas / Android Back (`pushState` generalised from `sitecam.js:161-177`) / ✕. Desktop unchanged.
4. **P3 boot diet + `§BOOT_WEIGHT` ratchet** — film/bake/CPE/4D-authoring/charts to the lazy tier; target to propose ≤ 3 MB phone boot JS.
5. **P4 thumb rail of five + More + context chips** — only after the owner picks the five.
**Don't:** add new pills before P1; build a second panel engine beside `createPanel`; claim a speed-up without the P0 numbers re-run.


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

---

## §2026-11-26 REVIEW — mobile HMI + perf drift (owner: *"Pull up on perf of mobile … less pill icons that cannot work in mobile besides improving those that can … The panels are awkward as they do not close easily. Think of a UI HMI strategy that is smarter and easier. Suggest here before we resume in its dedicated session"* · *"also conduct a check if perf has degraded due to much changes since"*)
Read-only review, nothing changed in code. Two read-only audits of bim-ootb `origin/main` @ 851e49f6 (2026-11-26); the load-bearing lines re-read by the lead (`scene.js:3540`, `config.js:12`, `panels.js:1755-1757,1891,2420`, `viewer.html:75,80-83`). **This file stays THE place** (the bim-ootb `prompts/MOBILE_PERF.md` copy, 64 lines, 2026-06-05, is stale: it still lists the MergedMesh fallback removed 2026-05-27).

### A. Perf drift — MEASURED: code weight; NOT measured: phone time
| date | commit | boot `<script>` tags | boot JS | SW precache | viewer/*.js |
|---|---|---|---|---|---|
| 05-23 (first) | 818ae9f3 | 58 | 1.51 MB | 93 / 6.65 MB | 2.19 MB |
| 07-01 | 0162d549 | 104 | 2.64 MB | 111 / 3.80 MB | 3.05 MB |
| 09-01 | cd999e61 | 155 | 5.94 MB | 142 / 6.35 MB | 5.91 MB |
| 10-01 | a5931407 | 196 | 8.59 MB | 182 / 9.01 MB | 8.64 MB |
| HEAD 11-26 | 851e49f6 | 266 | **10.24 MB** | 305 / 16.04 MB | 10.16 MB |
- **Boot JS grew 6.8× (1.51 → 10.24 MB), tags 4.6×; every tag is a plain parser-blocking `<script src>`** (0 defer / async / module at every point). Plus at boot: three.js r184 ~780 KB, sql-wasm 50 KB + 631 KB wasm, and `xlsx.full.min.js` 952 KB background-fetched every boot (`loader.js:259-260`, constant since day 1).
- Biggest jumps: 09→10 +2.65 MB (cpe_load_path, cpe_storey_reveal, sourced_light, cpe_escape_route, cinema_maxq) · 07→08 +1.87 MB (effects, chart.umd, dlod_nav, cinema_path_editor) · 08→09 +1.42 MB (time_machine, effects, CPE). November slowed to +0.46 MB.
- `modules.json` HAS a lazy tier, but only 41 modules / 1.26 MB use it; 63 eager scripts > 50 KB = 6.95 MB. Top eager: cinema_path_editor 308 KB, streaming 300, schedule_author 265, scene 240, maxq_start 234, fx_cinema_path_plan 211, tools 211, chart.umd 205, sourced_light 205, panels 177 — mostly film / bake / 4D-authoring code a phone user opening a building never runs.
- **No boot time, TTI or FPS has ever been recorded on a phone** (every number on file is DB size, GPU or heap, desktop/headless). So "slower on phones" is INFERRED (≈10 MB of synchronous JS to parse/compile on a mid-range phone), not measured. **The settling measurement:** same real mid-range Android, same building (Duplex), cold cache + SW cleared, `chrome://inspect` Performance trace — script evaluation ms and first rendered frame — 818ae9f3 vs HEAD (serve each with `git archive`). Cheap substitute and future ratchet: Lighthouse mobile **Total Blocking Time** on both, headless CPU.

### B. The HMI as it is on a phone (facts)
- **Pills:** one registry `_actions` (`panels.js:1331-1578`, 44 entries) → `PillBuilder`. Phone shows 10 rail pills (+2 data-gated) and 22 rows in 3 drawers (Navigate 8, Inspect 10, Camera/View 4). Wrong-platform rail pills are greyed, drawer rows omitted.
- **Dead or unreachable on a phone:** every key shortcut (`scene.js:3540` returns on mobile) → **10 actions reachable only via Help or not at all**: issues, fullscreen, sanity, egress, bbox, sched4d, background, night, shadow, audio. **Shown but do nothing:** gi-preview drawer row (`effects_gi_poc.js:15` no-op), Palette's Still / Populate / MaxQ (no composer on mobile, `fx_composer.js:108`; `§MAXQ_FAIL … mobile`). Desktop-bound: report (new tab `boq_charts.html`), open/save (File System Access pickers; save falls back to download), 2D views, hover.
- **Panels: 7 separate systems** (`A.createPanel`, PillBuilder panels, ~58 ad-hoc `position:fixed` glass panels, HBA card stack, Help palette, Export popover, Site Camera overlay). **No one-panel-at-a-time manager**; drawers stack (top 70/250/430 px); **drawers close only by ✕** (`panels.js:1755-1757`, by design "never outside-tap"); Esc dead on mobile; **Android Back is handled only by Site Camera + clash snag** (`history.pushState`, `sitecam.js:161-177`); the ✕ is 18 px with 2/6 px padding (`viewer.html:80-83`, below the 44 px touch target that only `.panel-toggle` gets); **Settings and the JSON editor open at fixed `left:320px` / `left:624px`** (`panels.js:1891, 2420`) — on a ~400 px phone they start partly off-screen (auto-placement skipped on mobile, `:317`; the drawers alone were fixed by §MOBILE-DRAWER-FIX); `.bim-panel` keeps `backdrop-filter: blur(16px)` on mobile (`viewer.html:75`) although the pill CSS notes blur stuttered the GPU.
- **`_isMobile` derived in 5 places that disagree** (config.js:12, scene.js:33, fx_composer.js:107, effects_gi_poc.js:14, streaming.js:520 — the last also cleared by `?tm`); the 2026-10-06 finding above, still open.

### C. PROPOSED strategy (for the owner to approve, one detail at a time, in the dedicated session — NOT decided)
**Principle: on a phone the screen is the model; controls appear when asked and leave by the thumb's natural moves. Nothing is shown that cannot work there.**
1. **One capability owner, then "can't-work = not shown".** One probe (`A.caps`: touch, keyboard, composer/GPU tier, File System Access, new-tab) replaces the 5 `_isMobile` copies. Each `_actions` entry declares `needs:[…]`; the PillBuilder hides (not greys) what the device can't do. Desktop-only features (bakes, MaxQ, 2D, 4D/5D page) collapse into ONE row **"On a computer…"** that lists them and shares a link opening this building on the desktop (handoff, the same share deep link).
2. **One sheet manager (mobile), under `A.createPanel`, so all 7 systems inherit it — no per-panel code.** A bottom sheet with a grab handle; **one sheet at a time** (opening another replaces it, a back-stack remembers it); closes by **swipe down, tap on the dimmed canvas, Android Back** (generalise Site Camera's `pushState`/`popstate` to every sheet), and a 44 px ✕. Half-height by default so the model stays visible; drag up for full. Desktop keeps floating panels unchanged.
3. **Thumb rail of five at the bottom + "More".** Candidates (owner picks): Find, Walk, Inspect/Clash, Site Camera (snag), Share. "More" is a sheet with every other action — including the 10 key-only ones — so nothing is reachable only through Help.
4. **Context chips on selection.** Tapping an element shows one row of chips — Isolate, Measure, Snag photo, Share, Properties — instead of hunting through drawers.
5. **Lighter chrome on phones:** no `backdrop-filter` blur, solid panels, 44 px targets everywhere.
6. **Boot diet with a ratchet.** Core boot = scene, streaming, find, pills, share, site camera; everything film / bake / CPE / 4D-authoring / charts moves to the lazy tier in `modules.json` (load on first use; on a phone, never unless asked); skip the xlsx background fetch on phones. **Target to propose: phone boot JS ≤ 3 MB (from 10.24).** Witness: a `§BOOT_WEIGHT eager_bytes= tags= lazy_bytes=` line per build + Lighthouse mobile TBT headless as a ratchet that goes RED when eager bytes grow without a lazy flag (scope-blind guard: it must also count `common/`, `erp/`, `modeller/` tags the viewer loads).

### D. Order for the dedicated session (each: spec § → witness that can fail → build → read the log)
P0 measure first: Lighthouse mobile TBT + script-eval ms, 818ae9f3 vs HEAD, headless; and ask the owner for one real-phone trace (Duplex) — the A-section verdict stays INFERRED until then. · P1 `A.caps` single owner + hide dead/no-op controls + Settings/JSON-editor placement (smallest, visible win) · P2 sheet manager + Back/swipe/backdrop close (generic, under `createPanel`) · P3 boot diet + `§BOOT_WEIGHT` ratchet · P4 thumb rail + context chips (owner picks the five).
**Owner questions to settle there (not here):** the five rail items · desktop-only features: "On a computer…" row vs fully hidden · the boot-weight target number · keep drawers' "never outside-tap" rule on desktop (proposal: yes, desktop unchanged).

## §2026-11-26 P0 RESULT — measured: May (818ae9f3) vs reviewed HEAD (851e49f6), Duplex, headless phone emulation
**Spec (P0, §D):** same building, cold profile, phone emulation (412×823, touch, Android UA → the viewer takes its mobile path), **CPU 4× slowdown, no network throttle** (isolates parse/compile/eval from download). Each build served from `git archive` with the same `Duplex_extracted.db`. Lighthouse 11.7.1 ×3 alternating + a console/long-task probe + a JS sampling profile. Scripts: `scripts/mobile_perf/` (`run.sh` Lighthouse, `extract.js` metrics, `probe.js` timeline, `prof.js` attribution, `gl.js` backend check; needs `npm i lighthouse@11.7.1` in `scripts/mobile_perf/tools/`, not committed). Logs: `build/mobile_perf_p0_2026-11-26/*.txt`.
**⚠ Backend:** headless WebGL = **SwiftShader (software GL)** (`§P0_GL`). So anything GPU-bound (shader compile, per-frame draw) is CPU-rendered here and is NOT a phone number. The table splits the two.

| measure (CPU 4×) | May 818ae9f3 | Nov 851e49f6 | GPU-independent? | source |
|---|---|---|---|---|
| JS requests / JS bytes | 65 / 3.9 MB | 275 / 12.8 MB | yes | `§P0_LH js_reqs js_KB` |
| script evaluation (whole run) | 3.1 s* | **5.5 s** | yes | `§P0_LH scriptEval_ms`, 3/3 runs within 3 % |
| parse + compile | 90 ms | **390 ms** (4.3×) | yes | `§P0_LH parseCompile_ms` |
| new post-load geometry JS before first frame | — | **≈1.6 s** (silhouette_refine 713, wind_flip 390, three-mesh-bvh 231, dup_shell 174, light_zones 98) | yes | `§P0_PROF TOP_FN/BY_FILE` |
| DB fetched → `§DB_LOADED` | 1.7 s | 2.5 s | mostly | `§P0_EV` |
| first frame with the model drawn | **2.9 s** | **7.5 s** | **no** (includes one 4.57 s long task, three.js `R` 1.6 s + native 3.6 s = shader/GL on SwiftShader) | `§P0_PROBE first_tri_ms`, `§P0_LT` |
| Lighthouse TBT / TTI | not computable (page never went quiet in 90 s) | 7.3–7.6 s / 9.4–9.7 s | no | `§P0_LH` |
| steady state after load | main thread busy forever: a ~435 ms long task every frame, 2.3 frames/s | **idle**, last long task ends 8.8 s, 60 rAF/s | no (SwiftShader) | `§P0_PROBE steady_raf_per_s`, `§P0_LT` |
*May's 3.1 s covers the full 90 s run including its per-frame JS, so its boot-only share is lower and the boot growth is **≥1.8×**.

**Verdict (what is now MEASURED, replacing §A's INFERRED):**
1. **Boot got slower on the CPU side — measured, not inferred:** script eval ≥1.8×, parse/compile 4.3×, plus ≈1.6 s of new geometry passes (silhouette refine, wind flip, BVH, dup shell, light zones) that run on the phone before the first frame. This is the P3 boot-diet target, and it is GPU-independent.
2. **Time to first drawn model 2.9 s → 7.5 s on this rig**, but about 5 s of that one blocking task is shader/GL work done in software here. A real phone GPU will be faster on that part; how much is UNKNOWN until the real-phone trace.
3. **Something got better:** May redrew every frame forever (busy main thread, battery and heat on a phone); Nov goes idle after load. P3 must not undo that.
**Still needed from the owner (the only thing headless can't give):** one real mid-range Android `chrome://inspect` Performance trace, Duplex, cold cache + SW cleared, on today's live viewer — it settles row 2 (GPU share of the 4.57 s task).
**Next (per §D):** P1 (`A.caps` single owner + hide dead controls + Settings/JSON-editor placement). P3 gets a second target from this result: the five post-load passes above should be gated off, or deferred until after the first frame, on phones. Each needs its own witness.

## §P1 SPEC — one capability owner + hide what a phone can't run + panels on screen (owner GO 2026-11-26: "Yes")
Code read on bim-ootb origin/main 851e49f6 before this spec. Desktop must be unchanged; every change is phone-only or a deletion.
1. **One owner — `window._caps`** (`viewer/config.js` top level, the one probe): `touch` (ontouchstart or maxTouchPoints>0), `narrow` (screen.width<1024), `phone` = touch && narrow, `fsAccess` ('showSaveFilePicker' in window). `window._isMobile = _caps.phone` stays as the alias its ~80 readers already use. `setupConfig` sets `A.caps`. The 4 duplicate formulas (`scene.js:33`, `fx_composer.js:107`, `effects_gi_poc.js:14`, `streaming.js:520`) read `window._caps.phone` instead (`streaming.js` keeps its own `?tm` clause, a different promise). Safe: only `viewer/viewer.html` loads those four, and `config.js` loads first (line 863). Log `§CAPS phone= touch= narrow= fsAccess=`.
2. **Hide, not grey** (`common/pill_builder.js:270-281`): a wrong-platform pill is not rendered; log `§PILL_HIDDEN action= platform=`. No tracked manifest today uses `platform:'desktop'`, so the change only bites where an entry declares it.
3. **Dead controls on a phone, hidden:** `gi-preview` gets `platform:'desktop'` (the Navigate/Inspect/Camera drawer row builder `panels.js:1770-1771` already omits wrong-platform rows; its mobile setup is a no-op stub, `effects_gi_poc.js:15`). The Palette's Still (Alt+S) and MaxQ (Alt+C) buttons are not built on a phone (no composer on phones, `fx_composer.js:108`; `maxq_start.js:15-17` fails `§MAXQ_FAIL`). **Populate is decided by the witness, not assumed:** it stays unless a phone run shows it doing nothing.
4. **Every panel on screen, generic:** the `§PANEL-AUTOPLACE` observer (`panels.js:317`) skips phones; on a phone it now calls `A._fitPanelToViewport(el)` instead — clamp width to `innerWidth-16` and left into `[8, innerWidth-8-width]`, top ≥ 8. One rule for all `.bim-panel`s (Settings `left:320`, JSON editor `left:624`, and any future one) — no per-panel positions. Log `§PANEL_FIT id= from= to=`.
5. **Touch chrome on a phone:** `body.is-phone` (set from `_caps.phone`) → `.bim-panel-close` 44×44 px, `.bim-panel` `backdrop-filter:none` with a solid background.
**Witness W-MOBILE-P1** (`bim-ootb viewer/tests/witness_mobile_p1.js`, Playwright, Duplex): phone 412×823 touch — `§CAPS phone=true`; no rail pill greyed (opacity .35); `gi-preview` row absent; Still/MaxQ absent; Settings, JSON editor, the 3 drawers and Palette opened → each rect inside the viewport; ✕ ≥44 px; backdrop-filter none. Desktop 1400×900 control — Settings still at `left:320`, Still/MaxQ/gi-preview present (desktop unchanged). **Red control:** the same phone run with `A._fitPanelToViewport` disabled must go RED on Settings. Prints INCONCLUSIVE if no panel opened.
### ✅ P1 DONE 2026-11-26 — bim-ootb #3458 merged (sw viewer v1798, erp v1147)
**Witness** `viewer/tests/witness_mobile_p1.js`: `§WITNESS_MOBILE_P1 PASS judged=23 fails=0` on the final code. Phone 412×823 (Duplex): `§CAPS phone=true` once, `A.caps.phone=true`; rail shows `lod400,save,open,navigate,inspect,palette,camview,share,settings,help,sched4d`, none greyed; Camera/View drawer = Precision, Reset Camera, Auto-Pivot (no GI Preview); `§PANEL_FIT settings-panel from=320,70 to=104,9`, `json-editor-corporate from=624,70 to=84,70`, all 6 opened panels inside the viewport; ✕ 44×44; backdrop-filter none. Desktop 1400×900 control: 0 `§PANEL_FIT`, GI Preview row + Still/Populate/MaxQ present, Populate runs (`✓ Scene populated — 3 people, 4 trees, 1 cars`), blur kept. **Red control** (fit disabled): Settings at left 320 → RED as required.
**Spec item 3 settled by measurement, not assumed:** on a phone `A.togglePopulate` is `undefined` (the effects parts never load there, `fx_composer.js` §EFFECTS_SKIP), so Populate was dead too → the whole cinema row (Still / Populate / MaxQ) and its separator are not built on phones.
**Deviation from the spec text, recorded:** the spec's desktop control said "Settings still at `left:320`"; measured, desktop Settings is placed by `A._placePanel` (right-anchored, left 1088 at 1400 px) — that was already true before P1. The control now asserts what P1 must not change: no `§PANEL_FIT` on desktop.
**CI note:** the first push failed W-MANIFEST-ROUNDTRIP C15 — a `prompts/MOBILE_PERF.md` path in config.js's leading comment was read as the module's owner; the comment now cites "MOBILE_PERF §P1" without the path. Pre-existing, unrelated: `erp/tests/witness_pill_canonical.js` fails on `#pill-erpdoc` (pill retired 2026-11-24).
Lines (code): +57 −30; 4 duplicate phone formulas and the grey-and-block branch deleted.
**Next:** P2 (one sheet manager under `A.createPanel`: one sheet at a time, swipe-down / canvas tap / Android Back / ✕). Real-phone trace for P0 still owed.

## §P2 SPEC — one way to close any panel on a phone, one panel at a time (owner GO 2026-11-27: "Proceed")
Owner's agreed wording (2026-11-26): *one shared way to close any panel on a phone, by swiping down, tapping the model, pressing Android Back or tapping ✕, with only one panel open at a time.* Desktop unchanged.
**Measured population first** (phone survey on bim-ootb c20b4b89, Duplex, every rail pill + every drawer row tapped; `Home` skipped, it leaves the page):
| opens | element | system | in P2? |
|---|---|---|---|
| rail Navigate / Inspect / Camera-View | `*-drawer-panel` | `createPanel` | yes |
| rail Palette | `sunglass-slider-panel` | `.bim-panel` | yes |
| rail Settings → Edit Project JSON | `settings-panel`, `json-editor-*` | `createPanel` | yes |
| Navigate → Find | `find-panel` | `.bim-panel` | yes |
| rail Help | `cmd-palette` | `HelpPanel` (common/help) | yes — adapter |
| Navigate → World History | `whole-hist-panel` | `WholeHistory` (common) | yes — adapter |
| Inspect → Clash Matrix | `A._clashMatrixDiv` | scene.js `'c'` shortcut | yes — adapter |
| tap on the model | `info-panel` | selection card | **no** — a tap on the model must keep selecting |
| Walk / Fly Tour / Section Cut / Precision | `walk-anchor-prompt`, `tour-scrub-panel`, `section-slider-panel`, `precision-indwrap` | mode controls | **no** — closing them would strand a running mode |
(`Role View`, `Page History`, `Measure`, `X-Ray`, `Time Machine`, `4D/5D`, `Reset Camera`, `Auto-Pivot`, `Nav LOD` opened no fixed element.)
**Build (all in `viewer/panels.js`, beside §PANEL_FIT; phone only, desktop never enters it):**
1. `A.sheets` — the set of open sheets = every shown `.bim-panel` (any creator) + the 3 adapters `{get, close}` (Help → `showCommandPalette()` toggle, World History → `WholeHistory.close()`, Clash → `_shortcuts.c()` toggle). One `MutationObserver` (childList + style/class, rAF-batched) diffs that set. Closing a `.bim-panel` = its own `.bim-panel-close` (so its `onClose` runs), else `display:none`.
2. **One at a time:** a newly shown sheet closes any other open sheet (`§SHEET_REPLACE`). No back-stack (spec C.2 floated one; replace-only is simpler — recorded as a deviation, owner may ask for it).
3. **Android Back:** the first open sheet pushes one history entry `{bimSheet:1}`; `popstate` closes the open sheet (`via=back`). A sheet closed any other way consumes that entry (`history.back()`, its popstate ignored), so Back never leaks and never leaves the page while a sheet is open.
4. **Tap on the model:** a capture-phase tap (≤ 8 px) on the canvas while a sheet is open closes it and is consumed — no pick, no measure point (`via=canvas`). Drags still orbit.
5. **Swipe down:** a pointer that starts inside a sheet on a non-control element (not input/button/select/textarea/range), with the sheet scrolled to top, and moves ≥ 60 px down (more down than sideways) closes it (`via=swipe`). A grab bar (CSS, `.bim-panel` only, phone only) shows the affordance.
6. ✕ is the panel's own close (P1 made it 44 px); the manager only does the bookkeeping (`via=other`).
Log: `§SHEET_OPEN id= n=`, `§SHEET_CLOSE id= via=back|canvas|swipe|replace|other`, `§SHEET_HIST push|consume`.
**Witness W-MOBILE-P2** (`bim-ootb viewer/tests/witness_mobile_p2.js`): phone Duplex — for each of the 10 sheets above × each closer it supports (Back, canvas tap, swipe, ✕ where it has one): open → close → not shown + the `§SHEET_CLOSE via=` line; after canvas-tap closes, no `info-panel` (no pick); one-at-a-time (open Settings then Navigate → Settings shut); history clean after every close (`history.state` not `bimSheet`). Desktop control: Settings + Navigate both stay open, a canvas tap leaves them, no `§SHEET_` line. **Red control:** the phone run with `A.sheets.disable()` must go RED on Back. INCONCLUSIVE if no sheet opened.
### ✅ P2 DONE 2026-11-27 — bim-ootb #3459 merged (sw viewer v1799)
**Witness** `viewer/tests/witness_mobile_p2.js`: `§WITNESS_MOBILE_P2 PASS judged=61 fails=0 vacuous=3`. All 10 sheets close by Back (10/10), swipe down (10/10), their ✕ (9/9 that have one, after the rail fix), and a tap on the model (7/7 where the model is visible beside the sheet; Settings, World History and Help cover the whole canvas, so N/A). The closing tap did not pick (`§PICK hits>0` absent) in 5 judged samples, each with a control tap at the same point that does pick; 3 samples VACUOUS (every pickable point was under the panel), reported not counted. One at a time: `§SHEET_REPLACE closed=settings-panel by=navigate-drawer-panel`. No history entry left after any close. Desktop control: no manager, Settings + Navigate coexist, canvas tap leaves them. **Red control** (`A.sheets.disable()`): Back did not close Settings → RED. W-MOBILE-P1 re-run PASS 23/0.
**Found by the witness, fixed before merge:** (1) the manager's synthetic bubbling `pointerup` on a ✕ reached OrbitControls' document listener and threw (`Cannot read properties of undefined (reading 'x')`) — now non-bubbling with a `click` fallback; (2) **pre-existing phone defect:** World History (z 61) and Clash Matrix had their own ✕ under the right-edge pill rail (z 500), so tapping ✕ opened Inspect instead — an opening sheet is now lifted to z ≥ 1000 (`§SHEET_OPEN … z=1000(was 61)`); new check J6 "its ✕ is on top" 9/9.
**Deviations from the spec text, recorded:** no back-stack (replace-only), as the spec said; ✕ judged with a real tap (pointerup + click) because Help, Find, History and Clash listen to `click`.
**Lines:** +113 −1 — add-only. Candidates it could later absorb (not done, desktop must stay unchanged): the desktop Esc ad-hoc list (`scene.js` §S280, `#find-panel, #issues-panel, .glass-panel, #cmd-palette`) could call `A.sheets.closeTop()` once the manager runs on desktop too; Site Camera keeps its own `pushState`.
**Next:** P3 boot diet + `§BOOT_WEIGHT` ratchet (the P0 result named two targets: eager film/bake/CPE/4D code, and the ≈1.6 s post-load geometry passes on phones). Owner question still open from §C: the boot-weight target number (proposed ≤ 3 MB).

## §2026-11-27 P0 SANDBOX RESULT — the GPU question settled on paper, no phone (owner: *"Go for a programmatically sandboxed workaround … at least exhaust it on paper"*)
**Method (all headless, scratchpad only, repo untouched):** the 851e49f6 snapshot with three.js r186 swapped for its readable build (npm `three@0.186.0`, same revision); every blocking WebGL call wrapped and timed; JS profile limited to the window `§DB_LOADED` → first frame with triangles; same phone emulation + CPU 4×. Two backends: **SwiftShader** (software GL) and **Intel UHD (ADL-S GT0.5) via ANGLE gl-egl** — a real, weak integrated GPU, closer to a phone class than the RTX (and it leaves the owner's RTX alone). Script `p0b.js`/`p0c.js` (scratchpad; to be committed with P3 as `scripts/mobile_perf/`).
| measure (CPU 4×, Duplex) | SwiftShader | Intel iGPU |
|---|---|---|
| DB loaded → first drawn frame | 5.8 / 6.2 s | 6.9 / 6.8 s |
| **shader wait** (`getProgramInfoLog`, 12 programs — three r186 `onFirstUse`, `debug.checkShaderErrors` default true) | 1.10 s (max 145 ms) | **3.69 s (max 658 ms)** |
| texture upload (`texSubImage2D` ×324) | 0.14 s | 0.15 s |
| buffer upload (`bufferData` ×314, 18.7 MB) | 0.03 s | 0.04 s |
| JS in the window (profile): render loop `animate` incl. `streamTick` | 1.08 s | 1.15 s |
| of which `blobToGeometry` / `refineGeometry` (silhouette) / `WindFlip.count` / BVH | 0.57 / 0.26 / 0.21 / 0.15 s | 0.62 / 0.32 / 0.18 / 0.15 s |
Operating parameters (device-independent, measured): **12 programs, 26 shaders, 1,192,450 chars of GLSL** (9 fragment shaders ≈ 102–105 k chars each = three's standard-material source before preprocessing — normal for three, not our code: 3 lights, 0 custom `onBeforeCompile`), 95 geometries, 97 draw calls, 357,884 triangles, `KHR_parallel_shader_compile` requested by three; exposed by the Intel driver, **not** by SwiftShader.
**Verdict:** the freeze is **mostly the shader wait, and it is device-bound** — the real iGPU waited 3.4× longer than software GL. The rest is plain JS a phone pays at its CPU speed (≈ 1.1 s at 4×). The paper model for a phone's first frame after the DB arrives:
`T ≈ T_js(4×) ≈ 1.1–1.2 s  +  T_shader(phone) = 1.19 M chars × k_driver  +  ~0.2 s uploads`, with k measured at 0.92 µs/char (SwiftShader) and 3.1 µs/char (Intel iGPU). **k for a phone driver is the ONE number no sandbox here can give** — everything else is counted.
**And it stops mattering once the wait leaves the main thread:** three r186 `compileAsync` polls `COMPLETION_STATUS_KHR` instead of blocking, so where the driver exposes parallel compile the shader time overlaps the JS work instead of freezing the page (then `T ≈ max(T_js, T_shader)`), and where it does not, nothing gets worse. That is P3 step 1 below. **The real-phone recording then has a single, narrow job:** read the phone's shader wait (`getProgramInfoLog` total) once — or confirm it is gone.

## §P3 SPEC — boot diet, staged by measured payoff (owner GO 2026-11-27: "Proceed"; target ≤ 3 MB phone boot JS = the lead's proposal, accepted with the go)
Typical-phone yardstick for every number below (EXTRACTED, not assumed): Lighthouse 11.7.1 `core/config/constants.js` mobile default = **Moto G Power (2022) UA, CPU 4× slowdown, network 1.6 Mbps / 150 ms RTT ("roughly the 75th percentile of 4G connections")**.
Stages this session (each: witness that can fail → build → read the log):
1. **§SHADER_ASYNC (phone):** in `main.js` `animate()` phone branch, before a render while streaming (or the first after it), call `renderer.compileAsync(scene, camera)` and hold the last frame until it resolves. Kill switch `?shaderasync=0` (red control). Desktop unchanged.
2. **§DUCT_SILHOUETTE off on phones:** `SilhouetteRefine.refineGeometry` (outline of curved ducts only — shading is §MEP_SMOOTH_NORMALS, untouched) can only run before batching (`scene.js:2402-2411`), so "after the first frame" is impossible; on a phone it is skipped (`§DUCT_SILHOUETTE_SKIP phone`). Also fewer vertices = less heap (§PERF BUDGET). `WindFlip` and `DupShell` stay: they decide correctness (material side, duplicate shells).
3. **SheetJS on demand on phones:** `loader.js:260` fetches `xlsx.full.min.js` (952 KB) on every boot, competing with the DB on a 1.6 Mbps link; on a phone it loads when the Issues panel opens (`excel.js _cacheIssuesForExport`, the only consumer). Desktop unchanged.
4. **§BOOT_WEIGHT ratchet:** `scripts/boot_weight.js` sums the bytes of every `<script src>` `viewer/viewer.html` loads at boot (all folders — common/, erp/, modeller/ counted: scope-blind guard), prints `§BOOT_WEIGHT eager_bytes= tags= lazy_bytes=`; `--check` fails when eager bytes exceed `scripts/boot_weight_baseline.json` by > 1 %, and says "lower the baseline" when they drop. Wired into CI fast-checks.
Next stages (not this session, listed with their measured weights): move film/bake/CPE/4D-authoring code to on-demand loaders (top eager: cinema_path_editor 308 KB, schedule_author 265, maxq_start 234, fx_cinema_path_plan 211, chart.umd 205, sourced_light 205 …) toward ≤ 3 MB, each with its own entry-point proxy as `APP.loadNavigate` does.
**Witness W-MOBILE-P3** (`viewer/tests/witness_mobile_p3.js`, phone emulation CPU 4×, Duplex, Intel iGPU backend under `gpu.lock`, real minified build): shader wait on the phone path < 150 ms (was 3.69 s) and the longest main-thread task after `§DB_LOADED` shorter than before; `§DUCT_SILHOUETTE_SKIP` logged and no refine; no `xlsx.full.min.js` request at phone boot, and XLSX defined after Issues opens; model drawn (triangles > 0). Desktop control: xlsx fetched at boot, silhouette refine runs, no `§SHADER_ASYNC`. **Red control:** `?shaderasync=0` brings the shader wait back (> 1 s) → RED.
### ✅ P3 STAGE 1 DONE 2026-11-27 — bim-ootb #3460 merged (sw viewer v1801, live)
**Witness** `viewer/tests/witness_mobile_p3.js`: `§WITNESS_MOBILE_P3 PASS judged=9 fails=0` on the Intel iGPU (K1 shader wait 91 ms; K2 longest task 566 ms vs 5,246 ms; K3 silhouette skip; K4 SheetJS on demand; K5 model drawn 344,600 tris; K6 a mid-poll readiness failure releases the hold and drawing resumes; K7 no real fallback during load; desktop control unchanged). **Red control** `?shaderasync=0` → shader wait 4,554 ms → RED. W-MOBILE-P1 23/0 and W-MOBILE-P2 61/0 re-run on the final code. `scripts/boot_weight.js --check` wired into CI fast-checks; its own red control (baseline −5 % → exit 1) proven.
**Found while building it:** the vendored `viewer/lib/three.module.min.js` is an OLDER WebGL renderer than its r186 core; its `compileAsync` polls `currentProgram.isReady()` without r186's disposed-material guard, so it threw (`reading 'isReady'`) in the W-MOBILE-P2 run and its promise never settles. §SHADER_ASYNC therefore runs its own poll with the r186 guard (`renderer.compile` + `renderer.properties`), with an error/15 s backstop. The vendored file itself is untouched (open item: upgrade the renderer to its r186 build).
**Also measured (not changed — desktop rule):** desktop on the same Intel iGPU freezes 6.6–6.7 s in the same shader wait (`desktop shaderBlockMs=6715`). Extending §SHADER_ASYNC to desktop is a one-line gate change — **owner decision**.

## §2026-11-27 LEVELS OF IMPROVEMENT — what changed, and the speed difference on a typical phone today (owner ask)
**"Typical phone today" = Lighthouse 11.7.1's own mobile calibration (EXTRACTED from `core/config/constants.js` + `computed/load-simulator.js`):** Moto G Power (2022) user agent, **CPU 4× slower than this desktop**, network **1.6 Mbps (× 1024 × 1024 bits/s) / 150 ms RTT — "roughly the 75th percentile of 4G"**. Time figures are measured in that emulation with the Duplex on a real weak GPU (Intel UHD ADL-S GT0.5) unless marked *computed* (bytes × 8 ÷ 1,677,722 bits/s, gzip sizes as GitHub Pages serves them).
| level | what changed | before | after | difference on a typical phone |
|---|---|---|---|---|
| P1 | controls a phone cannot run | 4 dead controls shown (GI Preview, Still, Populate, MaxQ) + wrong-platform pills greyed | not shown | 4 fewer dead taps (not a speed number) |
| P1 | panels on a 412-px screen | Settings at x 320, JSON editor at x 624 — partly off-screen | x 104 / x 84, fully on | every panel reachable |
| P2 | closing a panel | only an 18-px ✕ (drawers); Android Back left the viewer; World History / Clash ✕ covered by the pills | Back · tap on model · swipe down · 44-px ✕; one panel at a time | one gesture instead of hunting a small ✕ |
| P3 | shader freeze after the building arrives | longest frozen stretch **5.6 s**, blocked **7.0 s**, shader wait **4.5 s** | **0.6 s**, **2.2 s**, **0.09 s** | the screen answers touches **≈ 5 s sooner**; the model itself appears at the same time (7.8 s → 7.7–8.2 s) — the compile work is the same, it no longer blocks |
| P3 | silhouette refine | ≈ 0.26–0.32 s CPU before the first frame (P0 profile) + 13,284 triangles | 0 | ≈ 0.3 s less CPU, 3.7 % fewer triangles (less heap) |
| P3 | SheetJS at boot | 952 KB (335 KB gzip) on every first visit | loads with the Issues panel | ≈ **1.6 s** less download on a first visit *(computed)* |
| P3 | growth guard | nothing stopped boot JS growing 6.8× in six months | CI fails at +1 % | prevents regression |
| — | **not yet achieved** — boot JS size | **10.26 MB (3.46 MB gzip)** → ≈ **16.5 s** first-visit download *(computed)*; script evaluation 5.5 s + parse 0.39 s at 4× (P0 Lighthouse) | target ≤ 3 MB (≈ 1.06 MB gzip at today's ratio) → ≈ **5.1 s** *(computed)* | **≈ 11 s** less first-visit download still to win; evaluation time should fall with it (re-measure, don't extrapolate) |
Repeat visits load scripts from the service worker, so the download rows apply to a first visit (or after a new version). **The one number still unmeasured:** a phone driver's shader compile speed (P0 sandbox `k`, µs per GLSL char); since P3 it no longer freezes the screen, it only sets when the model appears. A real-phone recording can read it later in one pass (`getProgramInfoLog` total / `§SHADER_ASYNC … ms=`).
**Next (P3 stage 2):** the byte diet toward ≤ 3 MB — on-demand loaders for the film / bake / CPE / 4D-authoring modules (top eager today: cinema_path_editor 301 KB, streaming 293, schedule_author 259, scene 235, maxq_start 229, fx_cinema_path_plan 206, tools 206, chart.umd 201, sourced_light 200, panels 182), each lowering `scripts/boot_weight_baseline.json`.

## §P5 SPEC — field ops for HQ: auto X-ray on Walk, walk trace in the op-log, shared snag list (owner GO 2026-11-27)
Owner, 2026-11-27: *"Yes go, and replaying oplog is cheap as its innate in our design. GPS is a non blocker as the building also has geo-ref data to default to as backup."* — earlier: *"if walk steps can be logged and also shared, so that HQ or someone else can replay to track trace back. Also during walk, it be good to auto alt-z for x-ray mode, which can be off by going back to the menu (if it is still available and u retained it)."* Transport choice: **(b) a plain folder on HQ's own host** (the lead's recommendation, accepted with "Yes go"); a private GitHub repo only for demos.
Code read first (bim-ootb origin/main): X-Ray is `A.cycleXrayBboxMode` (tools.js:454, Off→X-Ray→Bbox→Off) and stays on the phone as Inspect drawer row "X-Ray / Bbox" (P2 survey). Walk anchors at the nearest door / building centre in MODEL coordinates (walk.js `setWalkAnchor`), GPS only refines it; steps move the camera `WALK_STEP_DISTANCE` along the view direction (`advanceWalkStep`). The op-log is the history bar: `UniversalHistory.recordEvent(type,label,ref)` stamps `HistoryTap.currentView()` = fields `cam`, `xray`, `ghost`, `section`, `palette`, `clash` (universal_history.js:237-273); scrubbing restores them; entries persist per building (history_bar.js `serialize`/`hydrate`, localStorage) and coalesce only same-signature entries < 700 ms apart. Georef: imports write `site_latitude`/`site_longitude`/`true_north_angle` rows (common/georef_frame.js `metadataRows`) into `project_metadata`; the shipped Duplex predates them (no rows) — so "absent stays absent".
**F1 — auto X-Ray on Walk.** `setWalkAnchor` (walk start): if neither X-Ray nor Bbox is on, turn X-Ray on (`§WALK_XRAY_AUTO on`). The user turns it off from the menu row (3-state cycle: X-Ray → Bbox → Off). `stopWalkMode`: if Walk turned it on and the user did not touch the cycle during the walk, turn it back off (`§WALK_XRAY_AUTO restored`); a user choice during the walk is kept.
**F2 — walk trace = op-log events, replay = scrub.** Walk start, every 5th step, any heading change ≥ 30°, and walk stop call `UniversalHistory.recordEvent('walk', label, ref)`; label = `Walk · <n> steps · <d> m` (distinct → never coalesced); ref = `{ i, steps, p:[x,y,z] model metres (cm), yaw°, t, geo }`, geo = last GPS fix `{src:'gps',lat,lng,acc}` else building site ref `{src:'site',lat,lng}` from `project_metadata` else `{src:'model'}`. Replay needs no new code: each entry carries `cam`, so scrubbing the bar walks the camera back along the route. Sharing the trace rides F3 (the bar's own `serialize()` JSON).
**F3 — shared snag list + trace to HQ (spec; build after F1/F2).** Phone → HQ folder over the existing comm layer `httpPipe(base)` (common/comm/comm_pipe.js: PUT/GET `<base>/f/<name>`, any writable static host), encrypted envelopes as in TEAMWORK_FRAMEWORK. Up = each new Issue (record + photo) and each finished walk trace; HQ page merges all devices into one Issue Log with replay. Minimal payload up, HQ holds the full picture (§16.0a doctrine). Open detail for the owner when F3 starts: the HQ folder URL + who holds the key.
**Witness W-FIELD-OPS** (`bim-ootb viewer/tests/witness_field_ops.js`, phone emulation, Duplex): F1 — start Walk → X-Ray on + `§WALK_XRAY_AUTO on`; stop → off; start, cycle twice from the menu row (→ Off), stop → stays off (user choice kept); desktop-style start with X-Ray already on → untouched. F2 — 23 simulated steps with one 45° turn → ≥ 6 `walk` events with distinct labels, monotonic `i`, positions moving `WALK_STEP_DISTANCE` per step; `jumpTo` an early walk event → camera within 1 cm of its recorded `p`; geo.src stated. **Red control:** with tracing disabled (`?walktrace=0`) → 0 walk events → RED.
### ✅ P5 F1 + F2 DONE 2026-11-27 — bim-ootb #3461 merged (sw viewer v1802)
**Witness** `viewer/tests/witness_field_ops.js`: `§WITNESS_FIELD_OPS PASS judged=8 fails=0`. F1a Walk → X-Ray on, stop → Off; F1b two quick taps on Inspect "X-Ray / Bbox" mid-walk → Off, kept at stop; F1c X-Ray already on → untouched. F2a 23 steps with a 45° turn → 7 `WALK` events (start@0, step@5, step@10, turn@12, step@17, step@22, stop@23), distinct labels, 5 straight segments each = Δsteps × 0.6 m; F2b scrub (`jumpTo`) to "Walk · 10 steps · 6.0 m" → camera 2.80, 0.45, 4.67 vs logged 2.8, 0.45, 4.67 (err 5.8 mm = the log's cm rounding); F2c geo source stated — **the Duplex resolved `site`** (its patch SQL carries the site reference). **Red control** `?walktrace=0` → 0 events; **mutant** (race fix removed) → F1b RED with X-Ray + Bbox both on.
**Found by the witness:** two quick taps on X-Ray/Bbox while the lazy Bbox module (navigate_find.js) loads left X-Ray AND Bbox on — a pre-existing phone race; a pending Bbox now counts as Bbox (`tools.js` §XRAY_CYCLE_PENDING). `WALK` registered in the history bar's significant event types (universal_history.js `_EVENTS`, the existing convention). `internal/APP_SURFACE.md` regenerated (CI W-CODEFACTS-APPDEF caught the line shifts).
Regression: `poc_z_events` ALL PASS, `poc_histbar_tap_subscribe` pass, W-MOBILE-P1/P2/P3 unaffected files; `poc_histbar_viewer` 13/2 and `witness_xray_cache_memo` 3 FAIL (n=0/0) are **identical on unchanged main** — pre-existing, logged not fixed.
**F3 (shared snag list + trace to HQ) — NEXT, needs two owner facts:** (1) the HQ folder URL the phones PUT to (any writable static host / folder server — comm `httpPipe(base)`), (2) who holds the team key (encrypted envelopes, TEAMWORK_FRAMEWORK). Payload up = each new Issue (record + photo JPEG) + each finished walk trace = the history bar's `serialize()` of the WALK events; HQ page merges devices into one Issue Log and replays by hydrate + scrub.

## §P5 F3 SPEC (revised by the owner 2026-11-27) — local first, then relay: Email (just OK) or Team folder (user need not know)
Owner, verbatim: *"I think it first writes to its own IndexDB or kernel and then it can be relayed (not sure the present Team mode) but should be simple no fuss sharing to email as attachment in the back and user just OK it. But if your Team mode is better where user need not know, and it goes to a specific folder right … a setting for user to set one time or else it is default to our github for trial (and only our machine can do that, users has to setup own eventually. For now allow it as we got unknown very few usage at the moment)."* · *"ie in our setting here we point to github, but when deployed to github, it requires their own setting in the config"*
Facts (code read): issues already persist to IndexedDB (`viewer/issues.js`); walk traces persist in the history bar (localStorage, `serialize()`); the comm layer's system default is `common/comm/team_defaults.js` → private repo `red1oon/bim-teams-trial` (exists, PRIVATE), fine-grained single-repo expiring token, **token currently EMPTY** (the maintainer creates it — no code can), trial caps `trialOpCap 60`, `trialCycles 1`. A web page cannot send e-mail silently: the closest is the share sheet with the files attached (user picks Mail, presses Send) — that IS "user just OK it".
Build, in order:
1. **Local first (always):** a "Send to HQ" bundle = the Issue Log (records + photo JPEGs) + the WALK trace (`serialize()` of WALK events), assembled from IndexedDB/localStorage; nothing leaves the phone until step 2/3.
2. **Relay = Email (default, works today):** `navigator.share({ files: [bundle.json, photos…] })` — the user OKs; fallback download. Witnessed by the bundle's content, not by a mail server.
3. **Relay = Team folder (set once in Settings):** comm `ghPipe` / `httpPipe` with the encrypted envelope; queued in IndexedDB and flushed when online; silent. **Default target is our trial repo ONLY on our own deployment** (origin check); any other deployment (a fork on GitHub Pages, a customer host) has NO default and must set its own target in its config/Settings — the owner's rule. Trial caps stay.
4. **HQ view:** an HQ page merges every device's bundles into one Issue Log; a walk replays by `hydrate` + scrub.
Owner action needed for step 3 to go live: create the fine-grained token for `bim-teams-trial` (Contents read/write, with expiry) and paste it into `team_defaults.js` — the file's own instructions.

## §2026-11-27 PANELS — "opening should be instant … a design rethink in line with modern techniques" (owner)
**Measured first** (phone profile: CPU 4×, real Intel iGPU, Duplex, after boot settled; tap → panel shown → 2 animation frames = painted; bim-ootb c20b4b89+P2/P3/F1-F2):
| panel | 1st open painted | 2nd open | DOM nodes |
|---|---|---|---|
| Navigate / Inspect / Camera drawers | 25 / 19 / 11 ms | 14 / 28 / 10 ms | 58 / 47 / 29 |
| Palette | 23 ms | 12 ms | 86 |
| Settings | 52 ms | 30 ms | 548 |
| Help | 35 ms | 44 ms | 584 → **890** |
No long task in any open. Google's RAIL guideline: a response under 100 ms reads as instant — every panel is inside it today. What made panels FEEL heavy was measured elsewhere and is already fixed: the 5.6 s frozen main thread after load (taps queued) → 0.6 s (P3), and the 16-px backdrop blur behind every panel on phones (removed in P1). **New finding:** Help grew 584 → 890 DOM nodes on its second open (measured once) — a rebuild that accumulates; to confirm and fix.
**Rethink — PROPOSAL for the owner (not built):** the modern browser primitives now do natively what our 7 panel systems + `A.sheets` hand-roll: the **Popover API** (`popover="auto"`: top layer — no z-index fights, so no "✕ under the rail"; *light dismiss* — tap outside or Esc/Back closes; one auto popover at a time) and **`<dialog>`** (modal, `::backdrop`, focus trap). Pattern used by current design systems: a bottom **sheet** (half height, drag handle, swipe to dismiss), compositor-only `transform`/`opacity` transitions (~150–200 ms, never layout properties), DOM built once and reused, long lists virtualised (Help), `content-visibility: auto` for off-screen sections. Proposed path: ONE change under `A.createPanel` (generic, AD-layer style) — make each sheet a `popover` element when the browser supports it, keep `A.sheets` only for what the platform lacks (swipe, Back history), delete the z-index and outside-tap code it supersedes; witness = P2's J1–J7 unchanged + open latency ≤ 100 ms per panel. Owner decides: adopt Popover/top-layer (yes/no), and bottom-sheet layout on phones (yes/no).

## §2026-11-27 OWNER DECISIONS (close of session)
- **Panel redesign: APPROVED** (owner: *"Agree on the panel redesign."*) — the §2026-11-27 PANELS proposal: Popover API / top layer + bottom sheets on phones, ONE generic change under `A.createPanel`, `A.sheets` kept only for what the platform lacks (swipe, Back history), the superseded z-index / outside-tap code deleted. Witness = W-MOBILE-P2 J1–J7 unchanged + open latency ≤ 100 ms per panel (measured baseline in §2026-11-27 PANELS) + the Help DOM-growth check (584 → 890 on reopen).
- **Team trial: nothing to open up.** Owner: *"This Github for team trials i thot we already have it. If u mean to open it up more tell me again."* Correct — `bim-teams-trial` (private, 2026-10-24) + the Team panel + one-cycle trial shipped (bim-ootb #2355, W-TEAM-PILL 14/0). The public `team_defaults.js` token is empty BY DESIGN: a key typed in the Team panel stays in that browser ("a key typed here is the user's own", comm_phone.html:144), so the trial works on every browser the owner pairs once. Filling the public file would open the trial to everyone — NOT requested. F3 step 3 reads the same cfg (paired key first, defaults second).
- **Next session, in order:** (1) F3 steps 1–2 (local-first bundle + Email relay); (2) panel redesign under `createPanel`; (3) F3 step 3 Team-folder relay using the paired key; (4) F3 step 4 HQ merged view.
- **Trial policy (owner, 2026-11-27):** *"Yes it is only privy to us in our trials. We can leave notes in our guide on how they can setup on their own as we won't give such trials to avoid cost on our part."* → DONE in bim-ootb #3463: `erp/team_guide.html` says there is no public trial and gives the 4-step own setup (private repo + fine-grained single-repo token with expiry, via the Team panel's real labels); witness `erp/tests/witness_team_guide_own_setup.js` PASS, red control on the old guide FAIL 3. Consequence for F3 step 3: **no default target for anyone else** — our trial works only on browsers we pair; every other user/deployment sets its own. Small follow-up noticed, not done: the Team panel's own hint text (`common/comm/team_panel.js:49`, "System default is a …") still reads as a trial offer to an outsider (it shows "trial key not installed" for them) — align it with the guide when F3 step 3 touches the panel.

## ▶ NEXT SESSION FIRST — FILM-M1: "the phone, fast" (owner, 2026-11-27; begin recording)
> Owner, verbatim: *"Update the prompt for new session to begin recording a new film that mock or simulate a phone experience with the CitaGlobal trailer opening screen - reuse one of the stick figures mobile frame zooming in to demo this fast usability and features. U may use both phones side by side with the desktop frame to dramatize the flow."*
**This IS the owner's go to record** (headless, CPU only, never beside the owner's live tab; any GPU run = `nvidia-smi` VRAM check + `flock /tmp/claude-1000/gpu.lock`). Films stay in `~/Videos/` — commit scripts, logs and this spec only, never an mp4/wav/still set (owner rule).
**Reuse, don't redraw (all on bim-compiler master, BIMCompiler #1305):** `scripts/film_citaglobal_trailer/` — `opener.html` + `render_opener.js` (dusk landscape, stick figures with phones, HQ radio tower; a pure function of t; prints `§OPENER_BOX`), `phone1.html` + `render_phone1.js` (the stick figure's raised phone), `build_hq.py`, `assemble.sh` (`§ASSEMBLE planned=… counted=…`), `narration_{en,ms}.tsv`. Frame device and two-phone rules: `~/Projects/CitaGlobal/CitaGlobal_Pitch_Report.md` §13.4 (zoom into the raised phone until it fills the frame height; seam = first/last frame of the part) and §13.5 (both phones land on the same box `§OPENER_BOX phone x=732 y=73 w=456 h=933` → record every phone part **portrait 456×933**; only action frames, no loading, no menu hunting). Style: this film follows the trailer's frame device (the owner's explicit ask for this film) rather than the CLI split screen; wherever text is typed, real key sounds (FILM_NARRATION.md house style); voice per FILM_NARRATION ▶ PLAYBOOK.
**Storyboard — PROPOSED, ~60 s (owner trims; every caption number must come from a § line, labelled "measured on a phone profile" where it is emulation):**
| s | beat | what is shown (only what is LIVE today) | source of truth |
|---|---|---|---|
| 0–4 | opener | trailer opener; zoom into the site figure's raised phone | `§OPENER_BOX`, `§OPENER_FRAMES` |
| 4–14 | PHONE A — fast | building ready to touch at once ("frozen 5.6 s → 0.6 s"); tap a pill → panel opens (≤ 52 ms), **swipe down** closes it, **Back** closes the next, one panel at a time, the icon behind never fires | P3 `§P3_RUN`, §2026-11-27 PANELS, `§SHEET_CLOSE via=swipe|back`, `§SHEET_SWALLOW` |
| 14–24 | PHONE A — walk | Walk → **X-Ray switches on by itself** (pipes and ducts through the walls); steps; a snag photo with element, GPS and bearing | `§WALK_XRAY_AUTO on`, `§WALK_TRACE`, Site Camera share text |
| 24–44 | **two phones + desktop** | zoom out to the split: phone A (left) · desktop "HQ" frame (centre, 1920×1080 recording scaled) · phone B (right, a second stick figure: Civil Works or Hospital). A shares a clash link → the desktop opens the **same view** (deep link); B takes its own snag; the walk **replays by scrubbing** the history bar | share deep link (`A.buildShareUrl`), `§WALK_TRACE` + `UniversalHistory.jumpTo` |
| 44–56 | end | zoom back to the stick overview, links green → card "Fast on the phone. Every step on the record." | trailer outro |
**Truth gate:** cross-device replay (phone walk → desktop scrub) and "Send to HQ" need F3 (steps 1–4) — NOT built yet. Until they are, the replay beat shows the phone scrubbing its own trace and the desktop shows only what a shared link opens; no caption may claim automatic sending. **Panel look:** the approved panel redesign (Popover + bottom sheets) will change how panels look; the owner asked for the film now, so record today's panels and re-cut that beat after the redesign if the owner wants.
**Witness the film like the trailer:** frames planned = counted (`§ASSEMBLE`), each beat's § lines present in its recording log, narration fit per FILM_NARRATION, a contact sheet only for the owner's review (never as proof).
**After the film:** continue §2026-11-27 OWNER DECISIONS in order (F3 1–2 → panel redesign → F3 3 → F3 4).

## §FILM-M1 RECORDING SPEC (2026-11-27, written before any code; the owner's go = ▶ NEXT SESSION FIRST above)
**Scripts:** `scripts/film_phone_fast/` (new) — reuse `scripts/film_citaglobal_trailer/opener.html` as the frame device (one small generic addition: a phase set + caption set chosen by a `film` key, trailer phases unchanged).
**R1 — phone recorder `record_phone.js <outDir> <building> <role>`** (Playwright, headless, CPU, bim-ootb origin/main served locally like the W-FIELD-OPS witness). Context = the witness's phone profile (Moto G Power UA, isMobile, hasTouch) at viewport **456×933** = `§OPENER_BOX phone`, so the frame is a real phone layout, not a resized desktop. Recording starts only after the viewer is ready (no loading frames). Each beat = real UI actions (pointer events on the real pills/rows, `page.goBack()` for Android Back, mouse drag for swipe); frames are screenshots taken between actions; a `manifest.json` lists every frame with its hold (frames) and beat id. Each beat's evidence = the viewer's own § lines captured from the console (`§SHEET_CLOSE via=swipe|back`, `§WALK_XRAY_AUTO on`, `§WALK_TRACE`, `§SITECAM_*`/`§ISSUE_SAVED`), printed as `§M1_BEAT id=… ok=… evidence="…"`. A beat whose evidence line is missing prints `ok=false` and is NOT used in the film (never faked).
**R2 — Site Camera feed:** a headless browser has no camera. The fake camera (`--use-file-for-fake-video-capture`) is fed the viewer's OWN render at the walk position (an mjpeg of the canvas) — the trailer's precedent (its "camera" frames were model frames). Caption says "simulated camera". GPS = Playwright geolocation set to the building's site reference read from its `project_metadata` (`site_latitude`/`site_longitude`), the same source `§WALK_TRACE geo=site` uses; absent → no GPS set, the stamp shows what the app shows.
**R3 — desktop "HQ":** a 1920×1080 desktop context opens the deep link phone A built (`A.buildShareUrl()`, printed `§M1_SHARE url=`); evidence = desktop camera within 0.2 m of the link's `cam=` (the link rounds to 0.1 m).
**R4 — compositor `stage.html` + `render_stage.js`:** a pure function of t (as opener.html) at 1920×1080: phone-only beats = the phone frame in the `§OPENER_BOX` with captions beside it; the split beat = phone A (left) · desktop (centre, 16:9) · phone B (right). Every caption number comes from a § line (§2026-11-27 LEVELS / PANELS tables or this run's log), labelled "measured on a phone profile" where it is emulation. No caption claims automatic sending (F3 not built).
**R5 — assembly + witness:** `assemble.sh` → `§ASSEMBLE planned=… counted=…` (equal), `§M1_BEAT` all ok for every beat used, page errors 0; narration per FILM_NARRATION ▶ PLAYBOOK (English = Kokoro, local). Output to `~/Videos/` only; scripts + logs + this spec committed, never media.
**Found while recording (2026-11-27, real viewer, phone profile, bim-ootb 9c1eb58d):** (1) tapping **Walk** in the Navigate drawer opens the Walk prompt UNDER the still-open drawer — its SET button is covered until the user swipes the drawer away (the film shows exactly that). Fix = a drawer row that opens its own prompt/sheet closes the drawer (generic, under the sheet manager, not a Walk special case) — NOT done here. (2) Headless Chrome's `getCurrentPosition` timed out with an emulated position, so the snag stamp reads "GPS: unavailable" — the film says nothing about GPS. (3) The Hospital cannot be filmed on CPU (one X-Ray frame > 4 min); phone B uses the Office (HHS_Office_Federated) unless the owner OKs a GPU run (`M1_GPU=1 M1_B_DB=buildings/Hospital_extracted.db`, under `flock /tmp/claude-1000/gpu.lock`).
**Site Camera feed (R2 as built):** instead of a fake-camera file, `getUserMedia` returns the viewer canvas's own `captureStream()` (test-harness init script only, no app change) — same picture, no extra pass.
### ✅ FILM-M1 rc1 RECORDED 2026-11-27 — `~/Videos/Phone_fast_FILM-M1_EN_rc1.mp4` (42.3 s, EN voice; media stays local)
**Witness (logs in `scripts/film_phone_fast/logs/`):** `§ASSEMBLE planned=1270 counted=1270 OK`, `beats_not_ok=0` · phone A 11/11 beats with their own § evidence (`§SHEET_CLOSE via=swipe`, `via=back`, `§WALK_XRAY_AUTO on` / `restored off`, `§WALK_TRACE geo=site`, `§SNAP` + `§ISSUE_SAVED IfcCovering Level 1`, `§M1_SCRUB walk_events=5`) · phone B (Office) 3/3 (`§WALK_XRAY_AUTO on`, `§ISSUE_SAVED IfcPlate`) · HQ desktop `§M1_HQ_CAM dist_m=0.000 SAME_VIEW` · `§STAGE_IMG broken=0`, page errors 0 · narration Kokoro 11 clips, `§MIX overlaps=0`, loudness −16.9 LUFS · trailer frame device unchanged (`§OPENER_TRAILER_UNCHANGED IDENTICAL`, 5 sampled frames md5-equal to master).
**Cut:** intro 3.2 s (zoom into Site A's phone) → phone A 24.8 s (ready · panels · swipe · Back · Walk + auto X-Ray · steps · snag · X-Ray off · scrub replay) → split 10.3 s (phone A · HQ desktop on the shared link · phone B walks and snags) → outro 4.0 s ("Fast on the phone. / Every step on the record."). Every caption's source is in `render_stage.log` (`§STAGE_CAPTION … source=`). Timing captions are the measured phone-profile numbers (P3 5.6 → 0.6 s, panels ≤ 52 ms), labelled as such; steps are labelled simulated; camera labelled simulated; no claim of automatic sending.
**Owner choices left:** (a) Hospital for phone B needs a GPU run — your OK; (b) re-cut the panel beats after the approved panel redesign; (c) other languages (FILM_NARRATION ▶ PLAYBOOK, Edge voices). **Next:** §2026-11-27 OWNER DECISIONS in order (F3 1–2 → panel redesign → F3 3 → F3 4) — plus the Walk-row drawer defect found above.
**Owner on rc1 (2026-11-27):** *"Good show, proceed on plan. If recut prefer to also show the clash and history synching on detail."* → a recut adds (1) a clash beat in detail (pick a clash, its detail card, the snag/link from it) and (2) history syncing in detail (the walk trace arriving at HQ and replaying there) — the latter needs F3 steps 3–4, so it is recut AFTER them.

## §P5 F3 STEPS 1–2 BUILD SPEC (2026-11-27, owner: "proceed on plan") — "Send to HQ": local bundle + email relay
**Where:** bim-ootb `viewer/send_hq.js` (new, `setupSendHQ(A)`), one button in the Issues panel toolbar beside Export Excel: "📤 Send to HQ" (`data-trl="ui_send_hq"`). No server, nothing leaves the phone until the user OKs the share sheet.
**Step 1 — bundle (always local):** `A.buildHqBundle()` reads (a) every issue from IndexedDB `bim_ootb_issues/issues` (issues.js) and (b) every walk waypoint from the history tree (`HistoryBar.serialize()`, nodes with `type === 'WALK'`: `label`, `ref` {i, steps, p, yaw, t, geo}, `viewState` — the camera a scrub restores). Output = files: `bim_site_report_<building>_<stamp>.json` `{ v:1, kind:'bim-site-report', building, made_at, issues:[…fields, photo:'<name>.jpg'], walk:[…] }` + one JPEG per issue photo (the stored `jpeg_blob`). Logs `§HQ_BUNDLE issues=<n> photos=<n> walk=<n> bytes=<n>`.
**Step 2 — relay by email:** `A.sendToHq()`: if `navigator.canShare({files})` → `navigator.share({ files, title, text })` (the user picks Mail and presses Send — "user just OK it"); `§HQ_SEND via=share ok`; AbortError → `§HQ_SEND via=share cancelled` (nothing lost — the data stays in IndexedDB/history). No share with files (most desktops) → download every file (`§HQ_SEND via=download files=<n>`). Empty (0 issues, 0 walk) → status message, `§HQ_SEND empty`, no share.
**Witness W-SEND-HQ** (`viewer/tests/witness_send_hq.js`, phone emulation, Duplex): arrange 2 issues with photos in IndexedDB + a 12-step walk; tap the real button with `navigator.share` captured by the harness → the shared files: one JSON that parses, `issues.length === 2`, each issue's `photo` names a shared file whose bytes start `FF D8` (JPEG), `walk.length` == the `§WALK_TRACE` lines, each walk entry has `p` + `geo.src`. Fallback run (`navigator.share` removed) → downloads = 1 + photos. Empty run → `§HQ_SEND empty`. **Red control:** the validator run on the shared set minus one photo must FAIL (proves the check can fail).
### ✅ F3 STEPS 1–2 BUILT + LIVE 2026-11-27 — bim-ootb #3468 (sw viewer v1805; live GitHub Pages checked: sw v1805, button + sendToHq served)
**As built (two deviations from the spec text above, both on reading the code):** the code sits in `viewer/issues.js` (the Issue Log's own module) instead of a new `send_hq.js` — a new file means four registry edits (viewer.html tag, main.js setup list, sw.js precache, modules.json) for ~80 lines; and photos are named by the stored blob's OWN type (`.jpg` for Site Camera JPEGs, `.png` for snags stored as PNG — `bcf_export.js` header note), not always JPEG. Files: `bim_site_report_<building>_<stamp>.json` + `issue_<id>_<building>.<jpg|png>`.
**Witness** `viewer/tests/witness_send_hq.js`: `§WITNESS_SEND_HQ PASS judged=5 fails=0` — S1 share sheet got 3 files (report 4.3 KB + JPEG + PNG), 0 problems, walk 5 = 5 `§WALK_TRACE` lines; **red control** (one photo removed) → `photo missing for issue 2` (RED as required); S2 no share → 3 downloads, `§HQ_SEND via=download files=3`; S3 empty → `§HQ_SEND empty`, no sheet. Regression: W-FIELD-OPS 8/0, W-MOBILE-P2 63/0 (vacuous 3, as before), `build_trl --check` changed=0, sw precache 305/305. `ui_send_hq` machine-translated in 14 locales (`trl_batch_2026-11-27_send_hq.js`).
**Next (owner order):** (2) panel redesign under `createPanel` → (3) F3 step 3 Team-folder relay with the paired key → (4) HQ merged view (`hydrate` + scrub) — after (3)+(4), the FILM-M1 recut with clash detail + history syncing (owner note above).

## §P6 PANELS BUILD SPEC (2026-11-27, owner "yes" to the next build = the approved panel redesign)
**Where (one generic place):** `A.sheets` in bim-ootb `viewer/panels.js` — every phone panel already passes through it (the 7 `.bim-panel`s + 3 adapters: Help/command palette, World History, Clash Matrix). Desktop never enters it, so desktop is unchanged.
**1 Top layer:** when a sheet opens, the manager sets `popover="manual"` and calls `showPopover()`; when it closes, `hidePopover()` and removes the attribute. **manual, not auto:** auto's light dismiss closes on an outside tap but lets that tap fall through to the model (it selects) — W-MOBILE-P2 J3 forbids that, so the manager's own tap-close + swallow stays. **Deleted:** the z-index 1000 bump (the top layer supersedes it). Feature check: no `showPopover` → old behaviour. `?sheetpop=0` = off (escape hatch + red control).
**2 Pre-popover look kept:** one injected stylesheet, zero specificity (`:where()`), resets the browser's popover defaults (inset, margin, border, padding, overflow, colours, size) so a panel looks as its own CSS says.
**3 Bottom sheet on phones:** an open sheet gets class `bim-sheet`: pinned to the bottom, full width, max-height 70 % of the screen (scrolls inside), rounded top, a grab bar; enters with `transform`+`opacity` only (160 ms). The top 30 %+ stays model, so a tap there still closes it.
**Witness W-MOBILE-PANELS** (`viewer/tests/witness_mobile_panels.js`, phone profile, CPU 4× via CDP, Duplex), over the same 10 sheets as W-MOBILE-P2: each opened sheet is in the top layer (`:popover-open`); rect bottom = screen bottom ±1 px, width = screen width ±1 px, height ≤ 70 % +1 px; its ✕ (if any) is the top element at its centre; tap → painted (2 frames) ≤ 100 ms on 1st and 2nd open; Help (command palette) DOM nodes on reopen ≤ 1st open + 5 % (the 584 → 890 finding). Desktop control: Settings + Navigate opened → no `popover` attribute anywhere. **Red control:** `?sheetpop=0` → the top-layer check FAILs. Regression: W-MOBILE-P2 63/0 (J1–J7 unchanged), W-MOBILE-P1, W-FIELD-OPS, W-SEND-HQ.
### ✅ P6 PANELS BUILT + LIVE 2026-11-27 — bim-ootb #3469 (sw viewer v1806; live GitHub Pages checked: sw v1806, §SHEET_TOPLAYER served)
**As built:** the three spec parts, plus three generic rules the witnesses forced: (a) a panel that already IS a full-screen modal (World History, Help) goes into the top layer but keeps its own layout — squeezing it into a 70 % sheet clipped its ✕ off-screen (P2 J6 caught it); (b) the open sheet's box catches touches (`pointer-events:auto`) — Clash Matrix's box was `pointer-events:none`, so a swipe on the new grab strip fell through to the model (P2 lost one judged check until fixed); (c) every bottom sheet has an 18 px free grab strip at the top (absolute bar), whatever the panel's own layout. The z-index bump is kept ONLY for a browser without the Popover API. Light dismiss NOT used (`manual`): it would let the closing tap select the model (J3).
**Witness** `viewer/tests/witness_mobile_panels.js`: `§WITNESS_MOBILE_PANELS PASS judged=43 fails=0` over 9 sheets (the JSON editor opens inside Settings; P2 covers it): all in the top layer; 7 bottom sheets at bottom 823 / width 412 / ≤ 70 %; Help + World History full-screen modals; every ✕ reachable; open painted at CPU 4×: drawers 9.5–28 ms, Palette 12–24, Settings 34–74, Help 51–54 (all ≤ 100); **Help reopen 890 = 890 nodes — the 584 → 890 growth does NOT reproduce** (the earlier 584 was a first open before its lazy content filled); desktop: no `popover` attribute, no manager; red `?sheetpop=0` → Settings not in the top layer (RED as required). Regression: W-MOBILE-P2 63/0 (same not-judged set as main, measured side by side), W-MOBILE-P1 23/0 (its red control now also sets `?sheetpop=0` — the bottom sheet alone keeps Settings on screen, so the old red could not fail), P3 9/0, FIELD-OPS 8/0, SEND-HQ 5/0; CI fast checks run locally, all PASS.
**Next (owner order):** F3 step 3 (Team-folder relay with the paired-browser key) → step 4 (HQ merged view) → FILM-M1 recut (clash detail + history syncing; the panels now look different, so that beat re-records too).

## §P5 F3 STEP 3 BUILD SPEC (2026-11-27) — "Send to HQ" into the Team folder: the same files, sealed + signed, in the phone's own drawer
**Finding that changed the plan (code read, bim-ootb ec1deef4):** the comm layer carries signed RECORD CHANGES (v3 envelopes, `comm_envelope.js`) folded on every device; it has no carrier for binary files, and a snag report is mostly photos. Putting photos into ops would make every paired device hold every photo forever. **Owner decision 2026-11-27** (asked, answered "Drop the files (Recommended)"): put the SAME files the email route sends (report JSON + photos) in the phone's own drawer of the team folder, sealed with the team key and signed by the phone — the precedent is `team_updates.js`, which already drops signed files under `s/<space>/pub/<kid>/…` with the relay contract unchanged.
**Where:** (1) `common/comm/team_drop.js` (new, generic, node + browser, no DOM): `seal(files, ctx)` / `open(pipe, space, kid, drop, ctx)` / `list(pipe, space)`. Any host may drop files; it is not a viewer special case. (2) `viewer/issues.js` `A.sendToHq()`: one new branch in front of the email route. No change to `comm_store.js` / `comm_pipe.js` / the envelope.
**Names (one writer per name, under my own prefix — `ghPipe.putMany` refuses anything else):** `s/<space>/pub/<kid>/drop-<id>/m.json` (the signed manifest) and `s/<space>/pub/<kid>/drop-<id>/<n>.bin` (n = 0,1,2…). `<id>` = 16 hex of SHA-256(manifest body). ONE commit per send (`putMany`). The relay sees no file name, no building, no count of issues beyond the number of parts.
**Seal:** key = the newest epoch key this device holds (`store.keyring()` after `store.sync(pipe)`); AES-GCM-256, fresh 12-byte IV per part, part = `iv‖ct`; AAD = `bim-drop|<space>|<epoch>|<n>`. The manifest = `{ v:1, kind:'bim-drop', space, author:<kid>, epoch, made_at, parts:[{ n, sha256(part), bytes }], meta:'<iv‖ct of {files:[{n,name,type}], label}> b64' }`, signed by the device key with `CommEnvelope.sign` (same ECDSA P-256 as every op). No key held for any epoch → nothing is sent in plaintext: `§HQ_TEAM nokey` and the email route runs.
**Open (HQ side, the reader step 4 will use; the witness uses it now):** the author must be a device in the folded roster and not revoked; `CommEnvelope.verify(manifest, roster jwk)`; every part's SHA-256 matches; each part decrypts under the roster's epoch key → the original files. Any failure → that drop is refused with its reason (`unknown-author`, `bad-signature`, `part-hash`, `tampered`, `no-key`), never shown half.
**When it runs (the owner's "user need not know"):** the paired browser = IndexedDB `comm_phone` holds `device` + `cfg.space` + a key (`cfg.token`, or `?pipe=` for a plain folder host). Paired → Send to HQ goes to the team folder silently: `§HQ_SEND via=team drop=<id> parts=<n>` and the status line says "Sent to your team folder". Not paired → the email route exactly as today (W-SEND-HQ unchanged). **No default target for anyone**: the public `team_defaults.js` key stays empty, so an unpaired browser never reaches our trial repo (owner trial policy).
**Offline / failure = queued, never lost:** the bundle is put in IndexedDB `bim_hq_outbox` BEFORE any network call (`§HQ_TEAM queued id=<q> files=<n>`); it is removed only after the pipe confirms the commit. Flushed on the next Send, on `online`, and once after load (`§HQ_TEAM flushed sent=<n> left=<n>`). The comm scripts load lazily only on that path (P3 boot diet: zero bytes added to boot).
**Witness W-SEND-HQ-TEAM** (`viewer/tests/witness_send_hq_team.js`, phone profile, Duplex, a dumb folder server as the relay via `?pipe=`): arrange — the phone creates its device IN the page, node founds an encrypted space as HQ and enrols the phone (grant), the phone's `cfg` names the space; 2 issues with photos + a walk. **T1** tap Send to HQ → `§HQ_SEND via=team`, no share sheet opened, the folder holds exactly 1 manifest + parts under the phone's prefix. **T2** HQ (node, its own store, its own sync) opens the drop → the files byte-equal to what `A.buildHqBundle()` made on the phone, and the step-2 validator passes on them (report parses, 2 issues, each photo present + magic bytes, walk = `§WALK_TRACE` count). **T3** the folder bytes contain no plaintext: neither the building name nor any issue title occurs in any stored file. **T4 offline:** context offline → Send → `queued`, folder unchanged, outbox 1; back online → flushed, outbox 0, a second drop opens. **T5 unpaired:** a fresh context → the share sheet route (W-SEND-HQ behaviour), folder unchanged. **Red controls (each must FAIL the open):** one byte of one part flipped → `part-hash`; the manifest re-signed by a device NOT in the roster → `unknown-author`; a manifest whose `parts` list is edited after signing → `bad-signature`. Regression: W-SEND-HQ 5/0, W-FIELD-OPS, W-MOBILE-P2, W-MOBILE-PANELS, comm witnesses touching `pub/` (W-UPDATE-LIST) unchanged.
### ✅ F3 STEP 3 BUILT 2026-11-27 — bim-ootb #3471 (sw viewer v1807)
**As built:** `common/comm/team_drop.js` (seal / open / list, generic), one branch in `viewer/issues.js` `A.sendToHq()` + the `bim_hq_outbox` outbox + `A.flushHqOutbox()` (on Send, on `online`, once 4 s after load when the outbox is not empty). The viewer keeps its own comm store bytes under `comm_phone` key `viewer_db` (as the Modeller keeps `modeller_db`). No change to the comm store, pipe or envelope. +438 / −2 lines (new capability; nothing superseded).
**Defect the witness found (fixed in the same PR):** the viewer's service worker answered every relay `list?prefix=…` with the FIRST prefix's list (cacheFirst keys on the URL without its query), so the store read a bundle where it expected a head (`§HQ_TEAM flush_err Unexpected token 'S', "SQLite for"…`, run 1 = 4 fails). Rule added in `viewer/sw.js`: a request that says `cache:'no-store'` and is outside the app's scope goes straight to the network. Run 1 is the observed red for that rule.
**Witness** `viewer/tests/witness_send_hq_team.js`: `§WITNESS_SEND_HQ_TEAM PASS judged=10 fails=0` — T1 `§HQ_SEND via=team drop=… parts=3 epoch=1`, no share sheet, 1 manifest + 3 parts in the phone's drawer; T2 HQ's own store opens it, files byte-equal to the phone's bundle (report 4315 B + JPEG 780 B + PNG 230 B), validator 0 problems, walk 5 = 5 `§WALK_TRACE`; T3 0 plaintext hits over 7 stored files; T4 offline `queued` + `reason=offline`, outbox 1→0, folder unchanged until online, second drop opens; T5 unpaired → `via=share ok`, folder untouched; T6 (added) the same drop on `ghPipe` against `common/tests/gh_standin.js`: 1 commit, HQ opens it, another device's drawer refused (`not under my prefix`); **red controls** flipped byte → `part-hash`, edited manifest → `bad-signature`, device not in the roster → `unknown-author` (all RED as required). Regression: W-SEND-HQ 5/0, W-FIELD-OPS 8/0, W-MOBILE-PANELS 43/0, W-MOBILE-P1 23/0, W-MOBILE-P2 63/0 (vacuous 3, as before), W-UPDATE-LIST PASS 38; sw precache 305/305, manifest round-trip PASS, boot weight within 1 %.
**Not proven:** a send against live GitHub with a real paired key (stand-in only — needs the owner's paired browser); a revoked device's drop (`revoked` reason has no arm yet — add it in step 4's witness).
**Next (owner order):** F3 step 4 HQ view (reads every device's drops with `TeamDrop.list/open`, one merged Issue Log, a walk replays by `hydrate` + scrub) → FILM-M1 recut. Still open from before: the Team panel hint text (`team_panel.js:49`), the Walk-row drawer defect (FILM-M1 finding 1).

## §P5 F3 STEP 4 BUILD SPEC (2026-11-27) — HQ view: "Get from team" merges every phone's report into ONE Issue Log; a walk replays by scrubbing
**Where (no new page, no second issue list):** the same viewer on HQ's paired browser, the same Issue Log (`viewer/issues.js`). One button beside Send to HQ: "📥 Get from team" (`#issues-get-team`, `data-trl="ui_get_team"`), shown only on a paired browser. Reader = `TeamDrop.list` / `TeamDrop.open` (step 3) with HQ's own store, roster and key ring.
**`A.getFromTeam()`:** sync the store → list drops → skip my own and the ones already read (`comm_phone` key `viewer_drops`) → open each, oldest `made_at` first. A drop that does not open is REFUSED whole with its reason (`§HQ_GET refused drop=<id> kid=<kid> reason=<r>`), never half-imported, and is retried on the next Get (it is not marked read).
**Merge rule (one row per site issue, however often the phone re-sends):** a phone sends its WHOLE log every time, so the key is (author device, the issue's id on that device). Same key → the row is replaced in place (HQ's local id kept); new key → added. Each merged row carries `src_kid`, `src_id`, `src_code` (the device code `XXXX-XXXX` the Team panel shows), `src_drop`, and its photo as a Blob of the photo's own type. HQ's own issues (no `src_kid`) are never touched. The card shows the device code. **Consequence fixed in the same change:** `A.buildHqBundle()` leaves out rows with `src_kid` — HQ must not re-send other people's issues as its own.
**Walk:** the newest walk per device is kept (`comm_phone` key `viewer_walks`); the Issue Log shows one row per device, "Walk · <code> · <n> points · Replay". Replay = the points enter HQ's history bar as WALK events carrying the PHONE's recorded view (`HistoryBar.push`, the same entry shape `recordEvent` writes), then scrubbing restores each camera — replay stays cheap because it is the op-log's own mechanism (owner 2026-11-27). **Deviation from the F3 spec text ("hydrate + scrub"):** `hydrate` replaces HQ's whole history tree; `push` adds the walk beside HQ's own history. Same scrub, nothing of HQ's lost.
**Logs:** `§HQ_GET drops=<n> new=<n> issues_added=<n> issues_updated=<n> walks=<n> refused=<n>` · `§HQ_REPLAY kid=<kid> points=<n>`.
**Witness W-HQ-VIEW** (`viewer/tests/witness_hq_view.js`; folder relay; founder in node; phone A, phone B and HQ are three browser contexts with page-made devices, all enrolled): **V1** A (2 issues + walk) and B (1 issue + walk) send; HQ taps Get → `drops=2 issues_added=3 walks=2 refused=0`; the Issue Log holds 3 rows, each with the right device code, each photo byte-equal to the phone's. **V2** Get again → `new=0`, still 3 rows (idempotent). **V3** A adds one issue and re-sends → HQ Get → `issues_added=1 issues_updated=2`, 4 rows, no duplicate. **V4** HQ's own issue + `A.buildHqBundle()` on HQ → the bundle holds 1 issue (its own), none of the 4 merged. **V5** Replay A's walk → `§HQ_REPLAY points=<n>` = A's `§WALK_TRACE` count; `jumpTo` each point → HQ camera within 1 cm of the position A logged. **V6 revoked:** the founder revokes B, B sends again → `refused=1 reason=revoked`, rows unchanged. **Red control:** one byte of a part flipped in the folder before Get → that drop `refused reason=part-hash`, 0 rows from it (the check can fail). Regression: W-SEND-HQ-TEAM 10/0, W-SEND-HQ 5/0, W-FIELD-OPS, W-MOBILE-P2, W-MOBILE-PANELS; `build_trl --check`.
### ✅ F3 STEP 4 BUILT 2026-11-27 — bim-ootb #3474 (sw viewer v1808)
**As built:** `A.getFromTeam()`, `A.replayTeamWalk(kid)`, `A._renderTeamRows()` in `viewer/issues.js` (the store open + sync is now ONE function, `_teamOpen`, shared by send and get, serialised); the button `#issues-get-team` (14 locales, machine); `A.buildHqBundle()` leaves out merged rows. +516 / −109 lines over 44 files (39 of them the i18n tables).
**Defect the witness found (fixed in the same PR):** `team_drop.js` read `roster.revokes[kid]` as a truth value; the value is the last good seq and `0` is a revoke, so a device revoked at seq 0 was NOT refused (V6 red on run 1).
**Witness** `viewer/tests/witness_hq_view.js`: `§WITNESS_HQ_VIEW PASS judged=9 fails=0` — V1 `§HQ_GET drops=2 new=2 issues_added=3 issues_updated=0 walks=2 refused=0`, 3 rows with the right device codes, photos byte-equal, 2 walk rows; V2 `new=0`, 3 rows; V3 `new=1 issues_added=1 issues_updated=2`, local ids kept; V4 HQ's bundle = `["HQ-own"]`; V5 `§HQ_REPLAY points=5` = 5 `§WALK_TRACE`, scrub max error 0.0000 m; red control flipped byte → `refused=1 reason=part-hash`, row absent, and the restored drop is taken on the next Get; V6 `reason=revoked`, rows 6→6. Regression: W-SEND-HQ-TEAM 10/0, W-SEND-HQ 5/0, W-FIELD-OPS 8/0, W-MOBILE-PANELS 43/0, W-MOBILE-P2 63/0 (vacuous 3); precache 305/305, manifest round-trip PASS, `build_trl --check` changed=0, boot weight within 1 %.
**Known limits (not defects of the witness):** a refused drop is retried on every Get (it shows as `refused=1` each time until the folder is cleaned); a device revoked later keeps the rows HQ already merged; nothing is run against live GitHub with a real paired key (folder relay + GitHub stand-in only).
**Also done 2026-11-27 (agents):** Team panel wording aligned with the guide — bim-ootb #3473 (outsider sees the DIY sentence, no "trial"; W-TEAM-PILL 15/0, red control FAIL 2).
**Next:** FILM-M1 recut (clash beat in detail being recorded: BIMCompiler branch `film/m1-clash-beat`; history arriving at HQ = Send to HQ → Get from team → Replay, now real). Open: Walk-row drawer defect (agent at work).

## §2026-11-27 EVENING — two HMI fixes found by use, and the FILM-M1 recut (owner notes verbatim)
**✅ Drawer row closes its drawer — bim-ootb #3476 (sw v1809), MERGED.** Rule `§SHEET_ROW_PROMPT` in the sheet manager (`viewer/panels.js`): a drawer row whose action opens its own prompt closes the drawer (by effect, 3 s watch; no Walk branch; `?sheetrow=0` = off). Covers Walk, Fly, Page History, Section, Time Machine. `§WITNESS_MOBILE_DRAWER_ROW PASS judged=24 fails=0 swept_rows=17`; red control (`?sheetrow=0`) reproduced the covered SET button. Regression P2 63/0, PANELS 43/0, P1 23/0, FIELD-OPS 8/0.
**✅ Issue Log reachable on a phone + replay opens the history bar — bim-ootb #3480 (sw v1810), MERGED.** Found by the film recording of the real UI: the Issue Log (so Send to HQ) had no phone route except Help → scroll; `replayTeamWalk` left the history bar hidden. Fix: `'issues'` added to the Inspect drawer's row list (existing action/label "Issues"), `#issues-panel` made a sheet through the manager's ADAPTERS list (swipe / Back close; `§SHEET_REPLACE`); replay calls `HistoryBar.open()` (`§HQ_REPLAY … bar=open`) and, on a phone, closes the Issue Log sheet that covered the bar. Phone path to Send to HQ: FAB → `#pill-inspect` → `#drawer-row-issues` → `#issues-send-hq`. `§WITNESS_ISSUE_LOG_ROUTE PASS judged=12 fails=0` (both red controls red). Regression HQ-VIEW 9/0, SEND-HQ-TEAM 10/0, SEND-HQ 5/0, DRAWER-ROW 25/0 (18 rows), P2 63/0, P1 23/0, FIELD-OPS 8/0. **Open check:** W-MOBILE-PANELS T4 (first open ≤ 100 ms at CPU 4×) failed 5 runs in a row at machine load 14–18 and passed 3 in a row at low load; main failed 1 of 4 under the same load. Read as load, NOT proven — re-run on a quiet machine before closing (a small first-open cost from the new adapter is not ruled out).
**Also noticed, not fixed (from the recordings):** the pill rail covers the right edge of the clash list on a phone until the FAB folds it; the clash matrix says MEP|ARC 956 while the list header says "200 Total: 501" for the same pair (cause not traced: `_countClashesRtree` vs `_countClashesAsync`); a clash link carries `st=Unknown` on Duplex; a snag taken after the walk ends finds no `#snag-btn-fixed`; `APP.buildShareUrl()` has no phone button.
**FILM-M1 recut.** Owner, 2026-11-27, on the frame: *"can the film do actual mobile phone shape usage? Ie not mock up as CitaGlobal trailer film?"* → rc2 (`~/Videos/Phone_fast_FILM-M1_EN_rc2.mp4`, 60.9 s): the usage in a real phone body, HQ in a browser window, new parts "clash in detail" (recorder role C) and "report arrives at HQ" (role S: Send to HQ → Get from team → Replay → scrub). Scripts on BIMCompiler branch `film/m1-rc2` (PR #1336; it contains #1328 clash, #1330 phone frame, #1332 sync). `§ASSEMBLE planned=1828 counted=1828 … beats_not_ok=0 OK`, `§WITNESS_STAGE PASS judged=117 fails=0`, `§MIX clips=18 overlaps=0`, loudness −17.1 LUFS.
Owner on rc2, verbatim: *"Seen the film. It lacks the opening nice card and it supposed to be same as the earlier frame zoom in CitaGLobal trailer v1. Also close card prior art/credentials. Opening CH: 'Offfline Mobility' - comes to BIM and ERP world"* → rc3 in progress on the same branch: two-colour chapter card (kicker `CH 0 · OFFLINE MOBILITY`, title "Offline mobility comes to the BIM and ERP world" — kicker and sub-line wording are the lead's, the owner may reword), the trailer v1 zoom-in handing off to the real phone body at the same rect (732,73,456,933), zoom-out, and the house last card (what you saw / prior art read / credentials / guide link — FILM_NARRATION ▶ HOUSE STYLE). **Lesson:** the house cover and last-card rules in FILM_NARRATION.md apply to EVERY film brief; rc2's brief did not cite them and the owner had to ask.
