# ⚠ DO NOT REMOVE — Hub page dead offline: root index.html is OUTSIDE the service worker's scope
SCOPE: bim-ootb offline/PWA — make the ROOT Hub (`index.html`) openable offline so a user who
starts offline can still click into their cached buildings. The viewer-side offline engine is
PROVEN WORKING (evidence below) — do NOT rebuild caching, do NOT touch cachedFetch/IDB. This is
a service-worker SCOPE problem only. Read the log after every run. NOT URGENT — parked
2026-07-19 for a dedicated session by user instruction ("not urgent feature for later").

## ▶ THE QUESTION THIS ANSWERS (user, 2026-07-19)
"When a building is cached, clicking it while offline — will it load? I thought it was supposed
to?" Answer: **the click works; opening the Hub to click it does not** (when starting offline).

## ▶ VERIFIED WORKING — do not re-investigate (W-OFFLINE-CACHED-CLICK, localhost Playwright run 2026-07-19)
Phase 1 online full load of Duplex, then `context.setOffline(true)`, then a FRESH page navigation
to the same `viewer/viewer.html?db=…` URL (exactly what a Hub card click's `window.open` does):
- `§PHASE2_OFFLINE_VIEWER loaded=true status="DONE — Ifc2x3_Duplex_Federated 1,119 elements
  (106 instanced groups). 1 building(s) rendered." meshes="77 draw calls"` — full real-mesh load.
- All bytes from cache: `§CACHE_HIT Duplex_extracted.db 14.3MB`, `§CACHE_HIT
  Duplex_positions.bin`, sql.js/THREE from SW precache. Patch fetch failed non-fatally
  (`§PATCH_NONE`) — by design, unpatched fallback.
- Offline-safe split detection confirmed live: `streaming.js` §OFFLINE-GATEWAY-LEAK guard checks
  IndexedDB before any HEAD probe.
- Existing spec `bim-ootb/tests/specs/38-offline-pwa.spec.js` (T_3801–3805) already covers the
  viewer-URL offline reload path.
- Script: session scratchpad `offline_check.js` (2026-07-19 session); rewrite from this file's
  facts if gone — it's ~60 lines.

## ▶ THE GAP (root cause, cited)
- `viewer/viewer.html:1015` → `navigator.serviceWorker.register('sw.js?v=…')` — SW file lives at
  `viewer/sw.js`, so max scope = `viewer/`. Nothing registers any SW at the repo root, and root
  `index.html` is in no precache list.
- Empirical: same offline session, `page.goto(<root index.html>)` →
  `§PHASE3_OFFLINE_HUB FAILED: net::ERR_INTERNET_DISCONNECTED`.
- Consequence: Hub already open when you go offline → clicking a cached building WORKS (opens a
  new controlled `viewer/…` window). Starting offline → Hub won't render → no way to click.
  (`viewer.html` with no `?db=` also resumes `pwa_last_db` — main.js ~L1074 — in-scope, works.)

## ▶ FIX SHAPE (for the pickup session — decide, don't gold-plate)
SW scope is capped at the SW file's directory and GH Pages cannot send `Service-Worker-Allowed`,
so the only real options are:
1. **Root-scoped SW** — move (or mirror as a thin `importScripts` shim) `sw.js` to repo root and
   register it from `index.html`, precaching the Hub shell (index.html + its css/js/sfx). One SW
   governs all. Watch: scope change orphans the old `viewer/` registration — needs a one-time
   unregister/migrate, and CACHE_VERSION discipline stays.
2. **Second tiny root SW** — dedicated `sw_hub.js` at root precaching only the Hub shell;
   `viewer/sw.js` untouched. Smaller blast radius, two versions to bump.
Either way: bump CACHE_VERSION(s), re-run 38-offline-pwa.spec.js, and add the new witness below.

## ▶ SECONDARY FACTS (note in passing, not blockers)
- Partial download ≠ cached: a split building abandoned mid-geo-download (e.g. Terminal at 18%)
  opens offline as "bounding boxes only" — correct degradation, not a bug.
- IDB cache keys = exact fetched URL; Hub always builds the same OCI-absolute URL
  (`index.html` `openBuilding()`), so keys are stable. Don't introduce a different URL form.
- Offline patch behavior: `_applyPendingPatch` fetch fails → unpatched data silently. Fine for
  now; a pickup session MAY additionally precache `patches/*.sql` (SW cacheFirst already stores
  them once fetched online).

## ▶ WITNESS PLAN
- **W-OFFLINE-HUB-SHELL**: setOffline → `page.goto(root index.html)` renders the Hub with
  building cards (title + `§HUB opened` log), no network.
- **W-OFFLINE-HUB-CLICK-E2E**: setOffline → open Hub → click a cached building card → viewer
  reaches DONE with real meshes (reuse W-OFFLINE-CACHED-CLICK's assertions).
- **W-OFFLINE-NO-REGRESSION**: full 38-offline-pwa.spec.js green after the SW change.

## DONE WHEN
Starting fully offline, a user can open the site root, see the Hub, click a previously-loaded
building, and get the full mesh view — witnessed by the three W- entries above; CACHE_VERSION
bumped; live smoke on GH Pages.

## §2026-10-06 FINDING — no localhost bypass in any of the 3 service workers
Found by the dev-toolkit triage, `bim-ootb prompts/DEV_TOOLKIT_NO_AI.md` §7 (2026-10-06). Read from bim-ootb `origin/main` @ fb183ddf. Not fixed — this lane decides.
- Precached files are cache-first everywhere, localhost included: `viewer/sw.js:1200` (`isNetworkFirst`),
  `modeller/sw.js:121`, `erp/sw.js:11`. On `localhost:8000` a dev's save + reload can serve the OLD file
  until `CACHE_VERSION` is bumped — mistaken for "my change didn't work".
- The dev toolkit works around it without app change (launch config with SW bypassed). Whether the SWs
  should get a localhost rule is this lane's call.

## §2026-10-06 FINDING — nobody watches local-storage quota or SQLite integrity
Found by the dev-toolkit triage, `bim-ootb prompts/DEV_TOOLKIT_NO_AI.md` §7 (assigned to this lane as the
local-storage durability owner). Read from bim-ootb `origin/main` @ fb183ddf. Not fixed — this lane decides.
- No `navigator.storage.estimate()` call in app code — big imports can fill storage with no warning.
- No `PRAGMA integrity_check` / `foreign_key_check` in app code — a corrupt or half-patched local DB
  presents as an app bug. The dev toolkit's Health Monitor (T19) will report both; the app-side fix is here.
