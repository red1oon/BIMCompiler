# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** cache the computed Fly Tour action array per building so a repeat Fly click (or a fresh
session on the same building) skips the slow route-planning pass entirely. Nothing else — no route
algorithm changes, no tour behaviour changes; a cache HIT must replay the identical tour a MISS
would have built.
**Read the log after every run.** Witness lines: `§TOUR_CACHE store` (first build), `§TOUR_CACHE hit`
(replay). The proof is the SECOND activation reaching `walkMode=true` + camera movement WITHOUT any
`§FLY_ROUTE`/`§PATH_LEGAL` route-planning lines — absence of the slow pass in the log, plus speed.
**Status: ✅ DONE again 2026-07-20 (briefly reopened same day, refixed same session) — see §4.**
Shipped live v827 (bim-ootb PR #917), W-TOUR-CACHE witnessed 15,745ms → 378ms (41×) on LTU (§1c)
under a clean browser profile — but a later live LTU report the same day found the cache
permanently failing to STORE (`§TOUR_CACHE store-skip The quota has been exceeded.`, localStorage
filled by its own un-evicted stale keys), so the 41× win silently stopped applying and every Fly
press paid full route-planning cost TWICE. Refixed same session, bim-ootb PR #926, W-TOUR-CACHE-EVICT
PASS (§4) — auto-merge armed onto `main`, not yet user-confirmed live. User request verbatim
(original ask): "can this aerial sweep in Tour Fly be saved in the metadata of the building so that
it need not recalculate again. For LTU it be dead slow." Live report that reopened it: "when pressing
Fly tour, it has to wait when it is supposedly cached" + "perhaps it is just the FlyTour isolated
case, then delve into its initial to allow cache for immediate Fly."

## 1. Design (KISS — client cache, not DB redistribution)
- `buildTour()`'s finished action array is plain JSON (orbit/flyPath/pause actions: coords,
  durations, names — no live refs). Serialize it to `localStorage`.
- **Key** = `tmTourCache:<building>:<TOUR_VERSION>:<elCount>-<doorCount>-<roomCount>:<renderedSetSize>`
  - `TOUR_VERSION` (v12) → algorithm changes bust the cache (keep in lockstep with the `§TOUR_VERSION`
    banner in `tour.js`).
  - element/door/room counts from the building DB → a new extraction or room recompile busts it.
  - rendered-building-set size → a city tour (extra appended orbits) never replays a single-building
    route and vice versa.
- **Explicit bust:** `§FLY_RECURE` (room recompile) calls `A._tourCacheBust()` — counts alone could
  miss a same-count recompile.
- **Budget guard:** skip store if JSON ≥ 1.5MB; `setItem` wrapped (quota errors degrade to no-cache,
  never break the tour).
- **Cache scope note:** the orbit-fly fallback (no walk data) is NOT cached — it's cheap anyway and
  `buildTour()===null` is the signal the building can't do a real tour.
- **Why not "in the metadata of the building" (the user's literal ask):** shipping a precomputed
  route inside `*_extracted.db` would make FIRST-ever load instant for all users but requires
  per-building precompute + OCI redistribution (or a `patches/*.sql` self-heal per building). The
  localStorage cache achieves the felt goal (never recompute twice) with zero distribution. The DB
  route stays open as a follow-up if first-load cost matters: same JSON, one row in a `tour_route`
  table via the patch+self-heal convention.

## 1b. FIRST WITNESS RUN FINDING (2026-07-20) — buildTour was the WRONG (well, half the) target
The first W-TOUR-CACHE run showed `§TOUR_CACHE hit actions=25` on the warm pass — yet
`toggle→walkMode` was an IDENTICAL ~16.5s on both passes and route-planning lines still appeared.
Cause: `_prepareGraphTour`'s §THIN-GRAPH-RECURE probe (`A._buildGraphRoute({})`) runs the FULL
route builder on EVERY activation, before `_startFlyTour` is ever reached — the probe, not
`buildTour`, is the repeat-click cost. Fix: `toggleFlyAround` now takes a cache fast path — on a
key hit it skips the entire prepare (loadNavigate + ensureRooms + probe), keeping ONLY the
§STREAM-FIRST drain wait, logs `§TOUR_CACHE fast-path (prepare skipped)`, and goes straight to
`_startFlyTour`. Key mismatch/parse failure falls through to the full prepare. Witness criterion
updated: warm pass must show `planned=false` (zero §FLY_ROUTE/§PATH_LEGAL lines) + sustained
camera movement (≥2 moving pairs across 12s — tours open with pause actions; a 4s window sampled
after the initial snap reads falsely as frozen).

## 1c. MEASURED RESULT + one open headless observation (2026-07-20)
Isolated-browser two-pass run (fresh browser per pass, persistent profile for localStorage):
- **Cold: toggle→walkMode 16,519ms** (full prepare + probe + build), `§TOUR_CACHE store actions=25
  bytes=8786`.
- **Warm: toggle→walkMode 431ms — 38×** — `§TOUR_CACHE fast-path (prepare skipped)` → `hit
  actions=25` → `START cinematic tour: 25 actions` → first orbit starts → `§IDLE_GATE wake`.
  ZERO route-planning lines.
- **Open headless-only observation (NOT blocked on, NOT a cache defect):** under headless
  swiftshader the camera stalls after the first tour action on BOTH passes — including the cold
  pass, which contains none of the cache code, so it is orthogonal to this change. `§IDLE_GATE
  wake` fires, no park follows, no PAGEERROR — the loop is alive but the camera holds. Not
  reproduced live (v825 live check pending user confirmation). If a LIVE report of a stalling
  tour arrives, start from this note + `TOUR_WALKMODE_IDLE_PARK_STUCK.md` §9, and test walkTick's
  action-advance under low-FPS rAF — do not blame the cache first.
- Witness gate is therefore movement PARITY (warm ≥ cold) + the cache claims (hit, planning
  skipped, ≥5× faster, same action count) — absolute movement is a headless-environment property.

## 2. The slow part being skipped (measured shape, LTU 122k)
Route planning = room-graph walk + door-legality pass: dozens of `§PATH_LEGAL legalized=… detoured=…`
+ `§PATH_LEGAL_DETOUR_FAIL` lines before `§FLY_ROUTE storeys=5 stops=10/11 … pts=90` appears —
minutes of main-thread work on LTU under load. `§FLY_STREAM_WAIT` (waiting for streaming to drain)
is NOT skipped — touring mid-stream tours placeholder bboxes and starves the promote pipeline
(user doctrine 2026-07-16); the cache only removes the planning cost, not the stream-drain gate.

## 3. Verification — W-TOUR-CACHE
Two-pass witness on LTU_AHouse (the only building with proven room-graph data — see
`TOUR_WALKMODE_IDLE_PARK_STUCK.md` §7 for why Hospital silently tests the wrong branch):
1. Pass A (cold): activate Fly → expect `§TOUR_CACHE store actions=N`, `walkMode=true`, camera moves.
2. Reload page (same browser profile → same localStorage), Pass B (warm): activate Fly → expect
   `§TOUR_CACHE hit actions=N` (same N), `walkMode=true`, camera moves, and ZERO `§FLY_ROUTE`/
   `§PATH_LEGAL` lines after the toggle.
FAIL = pass B rebuilds the route, different N, or no movement. Results recorded below when run.

## 4. REOPENED — cache never stores on LTU, quota permanently exceeded (2026-07-20)

**Live log (user, LTU_AHouse, Fly Tour press):** shows TWO full `§PATH_LEGAL`/`§FLY_ROUTE` blocks
back-to-back before `[WALK] START cinematic tour`, then `§TOUR_CACHE store-skip The quota has been
exceeded.` — i.e. every single Fly press pays the full slow pass twice, the exact "supposedly cached
but still waits" symptom.

**Root cause, traced to exact code (`viewer/tour.js`), not guessed:**
- `A._tourCacheKey()`'s per-key 1.5MB guard (`tour.js:202`) runs BEFORE `setItem` — if the route JSON
  itself were the problem, execution would never reach `setItem` and no `store-skip` line would print.
  It DID print, with the browser's own `QuotaExceededError` message ("The quota has been exceeded") —
  proof the failure is the ORIGIN'S TOTAL localStorage usage, not this one route's size.
- Nothing ever evicts old `tmTourCache:` keys except `A._tourCacheBust()` (`tour.js:156-163`), which
  only removes keys prefixed `tmTourCache:<CURRENTLY ACTIVE building>:` — it never runs proactively,
  only on a `§FLY_RECURE` room-recompile. Every other axis of the cache key (`TOUR_CACHE_VER` bumped
  across route-algorithm changes, `elCount-doorCount-roomCount` bumped by any re-extraction/recompile,
  `renderedSetSize` for city views) mints a BRAND NEW key that coexists with all the old ones forever.
  Across a testing history spanning many buildings (LTU, Hospital, Terminal, SC, DX…) and many DB
  recompiles per building, each up to the 1.5MB ceiling, the origin's real quota (~5-10MB, browser-
  dependent) fills permanently — after which `setItem` throws on EVERY future attempt, for EVERY
  building, forever, with no user-visible signal beyond one console line the user has to go looking
  for. This is self-inflicted by the Fly Tour cache's own key scheme — confirms the user's hunch
  ("perhaps it is just the FlyTour isolated case"), not unrelated app data (checked: the other
  `localStorage.setItem` call sites in the viewer — sfx toggle, grid sections, locale cache, panel
  prefs — are all small fixed-shape settings blobs, not per-building/per-version accumulators).
- The doubled route-planning pass itself is `1b`'s already-diagnosed mechanism, just never actually
  fixed on this profile: `toggleFlyAround` (`tour.js:53-56`) peeks `localStorage.getItem(_ckPeek)`
  BEFORE deciding whether to take the fast path. Since the key was never successfully stored, the peek
  always misses → `_prepareGraphTour()` runs, whose `§THIN-GRAPH-RECURE` probe (`tour.js:112`,
  `A._buildGraphRoute({})`) executes the FULL route builder as pass #1 → falls through to
  `_startFlyTour`'s `buildTour()` for pass #2 (`_fromCache` is false because there was nothing to
  hit) → THAT attempt also fails to store (same quota wall) → the next press repeats both passes
  again, forever. The 41× speedup in §1c was real but was measured on a browser profile with room in
  its quota; it silently stops applying the moment that profile's localStorage fills up, and nothing
  in the current design detects or recovers from that state.

**FIXED same session (2026-07-20), not handed off — user asked "if u can solve the initial tour,
then do so." bim-ootb PR #926 (`fix/tour-cache-quota-evict`), auto-merge armed onto `main`:**
1. **Store-side self-heal (shipped):** `viewer/tour.js`'s `setItem` catch now sweeps `localStorage`
   for every OTHER `tmTourCache:` key and removes them, then retries `setItem` once — logs
   `§TOUR_CACHE_EVICT removed=N bytes_freed=…` before the retry, `§TOUR_CACHE store` on success (or
   a second `store-skip (post-evict)` if the route alone still doesn't fit — legitimately rare).
   Makes the very next Fly press on ANY building benefit, no manual bust or hand-cleared profile
   needed — directly answers "allow cache for immediate Fly."
2. **Proactive stale-version prune (shipped):** `_tourCachePruneStale()` runs once at module setup
   (page load), dropping any `tmTourCache:` key whose version segment isn't the current `TOUR_CACHE_VER`
   — those are provably dead (the algorithm changed, they can never hit again), no error needed.
3. **W-TOUR-CACHE-EVICT (witness, PASS):** `witness_tour_cache_evict.js`/`.html` (bim-ootb repo root)
   — an isolated harness (stubs `A.buildTour`, calls `A._startFlyTour()` directly; the real
   `buildTour()` needs a full DB schema this harness doesn't set up, so this proves the CACHE
   store/evict path, not the route algorithm — that's already covered by §3's `witness_tour_cache.js`).
   Part A: seeds stale-version + current-version keys, confirms only stale ones are pruned at setup.
   Part B: fills localStorage to TRUE exhaustion (even a 1-byte write fails — matches the live "every
   future write fails forever" state), confirms `store-skip` → `§TOUR_CACHE_EVICT` → a successful
   retry `§TOUR_CACHE store` → `walkMode=true`. Both PASS.
4. **Not in scope, unchanged:** the §1c headless-only camera-stall observation (orthogonal note) and
   the §2 route-planning algorithm itself (untouched — this was purely a cache-eviction bug). The
   original two-pass §3 witness (clean-profile 41× claim) was NOT re-run live post-fix — the fix only
   touches the failure path, PR #926's own harness covers what changed; re-run §3 on LTU if a live
   confirmation is wanted.

## §5 RE-OPENED FINDING — 2026-07-21 (live user log, LTU on the deployed origin): quota self-heal
is IMPOTENT on github.io — the cache never engages, Fly re-plans (and "hangs the scene") every press
User's live console (LTU_AHouse, red1oon.github.io):
`§TOUR_CACHE store-skip The quota has been exceeded` → `§TOUR_CACHE_EVICT removed=0 bytes_freed=0`
→ `store-skip (post-evict) The quota has been exceeded`. Diagnosis, from the §4 evict code itself:
the evict-and-retry only removes OTHER `tmTourCache:` keys — but `removed=0` proves none exist; the
origin's localStorage is full of NON-tour data. **`https://red1oon.github.io` is ONE ORIGIN for
every GH-Pages app in every repo** — viewer, modeller (op-logs), ERP all share the same ~5-10MB
localStorage quota. §4's self-heal can only reclaim its own keys, so on this machine the 41×
fast-path NEVER engages: every Fly press re-runs the full route plan (minutes of main-thread
`§PATH_LEGAL` on LTU = the "kinda hanging"/"hangs the scene" the user reported — NOT the new
nav-DLOD module; no `§DLOD_NAV` lines were present, the pill was off).
Second observation from the same log: the planning sweep ran TWICE per press (two full
`§PATH_LEGAL`+`§FLY_ROUTE` blocks before one `§TOUR_PATH`) — `§FLY_ROUTE_ISOLATED dropped=2`
triggers a full re-route rather than reusing the legality results; doubles the already-minutes cost.
**Named fix direction (not yet implemented, needs its own go):** move the route cache off
localStorage to IndexedDB (per-origin quota is orders of magnitude larger, and the viewer already
uses IDB for building caches — `A.CACHE_STORE`/`§CACHE_EVICT_LRU` in scene.js is the pattern to
reuse); keep the same key scheme. Optionally also de-duplicate the double plan (reuse door-legality
across the isolated-stop re-route). Route JSON itself is small (~tens of KB) — the store choice,
not the payload, is the whole problem.

## §6 ✅ DONE — bust the route cache when a stage-3 recompile fires (bim-ootb PR #946)
(2026-07-21, spec authored by the Alt-C/rooms session — preserved here verbatim from its session
scratchpad, since that location evaporates; this file is the cache's canonical home)

**SCOPE: `viewer/tour.js` (+ one hook in `navigate_find.js`). Read the log after every run.**

GIVEN (verified by that session in code, don't re-derive):
- `toggleFlyAround`'s fast-path (PR bim-ootb#940, `_decide()`, tour.js:39-79): on a route cache hit
  it calls `A._startFlyTour(btn)` directly — skips `_prepareGraphTour()` entirely, the ONLY caller
  of `A.ensureRooms()` (tour.js:101-102).
- `ROOM_INJECTOR_NEEDLE.md` §ROOM_WALKER_VERSION_STAMP stage 3 (bim-ootb#939): `_ensureRoomsCore()`
  recompiles when `rooms_meta.version` ≠ loaded `ROOM_WALKER_V` — HHS-only pilot today.
- Interaction: the (now-persistent, #940) cached route wins BEFORE `ensureRooms()` runs, so a
  stage-3 recompile never fires on a cached building — the user never sees improved rooms.
- Existing partial bust: `A._tourCacheBust()` (tour.js:236) clears LS + IDB + route memo, called
  today only by §THIN-GRAPH-RECURE (route-probe failure), NOT by a version-triggered recompile.

SPEC — call `A._tourCacheBust()` in the same breath as any stage-3-triggered recompile:
1. **Reactive (PREFERRED — smaller diff, fast-path perf untouched):** `_ensureRoomsCore()`
   (navigate_find.js) already knows a version-mismatch recompile happened (`§NEEDLE_VERSION_STALE`
   fires just before it) — call `A._tourCacheBust()` (guarded `if defined` — tour.js may not be
   loaded) right after the version-triggered recompile completes.
2. Alternative (only if (1) composes badly): hoist a CHEAP `rooms_meta.version` check into
   `_decide()`'s cache-hit fast-path — must NOT reintroduce `_prepareGraphTour()`'s cost per hit
   (that cost removal is exactly what #940 shipped).

VERIFY (headless): force a stale `rooms_meta` on HHS (delete row / old version string), fly once
to warm the cache, fly again — the SECOND run's rooms must reflect the fresh recompile, not the
stale cached route. Prove the path with both `§NEEDLE_VERSION_STALE` and `§TOUR_CACHE` bust/
fast-path log lines.

NOT IN SCOPE: widening stage 3 past HHS (separately gated, `ROOM_INJECTOR_NEEDLE.md` risk-cliff
guidance). This task only makes the interaction safe for whenever that widening happens.

### RESULT (2026-07-21) — reactive shape (option 1) implemented, PR bim-ootb#946
`_ensureRoomsCore()` (navigate_find.js, right before the `'injected'` return, same S4 breath as
the existing `_pathGraphCache`/`_corridorLabelsCache` bust) now calls `A._tourCacheBust()` whenever
`versionStale` was true for that recompile — guarded `if (A._tourCacheBust)`. This covers EVERY
caller of `A.ensureRooms()`, not just Fly's own `_prepareGraphTour` — dlod_nav's nav-scope toggle,
the needle button, and cinema orbit all call it too, and any of them can now be the one that busts
a Fly-tour route left over from before a version bump.
W-TOUR-CACHE-BUST (headless, `witness_tour_cache_versionbust.js` in the bim-ootb worktree): fresh
profile → one Fly toggle builds+stores a real cache (`§TOUR_CACHE store`) → force `rooms_meta.version`
stale → a DIRECT (non-Fly) `ensureRooms({})` call → both `§NEEDLE_VERSION_STALE` and
`§TOUR_CACHE_BUST idb removed>0` fire → next Fly press MISSES (rebuilds) instead of replaying the
stale-rooms route. PASS. This is the scenario the spec's GIVEN actually describes (a cache stored
BEFORE a version bump, busted by whichever caller next notices the staleness) — a same-session
"fly once / fly again" alone can't exercise it, since the first-ever Fly press already recompiles
before anything is cached.
Concurrent-edit note: `feat/room-walker-stage4-fleet-wide` (widening the HHS-only gate at
`_dbFileNow === 'HHS_Office_Federated_extracted.db'` fleet-wide, per `ROOM_INJECTOR_NEEDLE.md`
Stage 4) touches the same function, ~140 lines earlier (the gate condition, not the `versionStale`
variable or the `'injected'` return) — compatible, not conflicting; its widening only makes this
fix apply to more buildings, not fewer.
