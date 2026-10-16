---
description: How to install BIM OOTB and Kernel-ERP so they keep working with the network fully disconnected — what's proven, what to caveat, step by step.
---
# Fully Offline / Air-Gapped Install

*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*

You can install both the **BIM Viewer** and **Kernel-ERP** once, then cut the network entirely — no
GitHub, no OCI, no CDN — and keep working. This page states exactly what that guarantees, what it does
not, and the steps to set it up correctly. Every claim below cites the code or a witness log; nothing
here is aspirational.

!!! warning "The one thing that trips people up"
    **A fresh, cold, zero-network visit to the site root will fail.** The landing page ("the Hub") has no
    service worker of its own yet. Offline only works once you have opened a specific app — the Viewer or
    the ERP — at least once while online. **Bookmark the app URL directly** (see §Setup below), not the
    front door, and you're covered.

## What "offline" actually means here

Three separate layers, each independently offline-capable:

| Layer | What it is | Network needed |
|---|---|---|
| **Browser PWA install** | "Add to Home Screen" on `red1oon.github.io/bim-ootb` | Once, to install + first-open each building/tenant |
| **Self-host (DIY)** | Your own machine serves the same app from a local folder | Once, to download the ZIP — then never again |
| **Air-gapped** | Either of the above, with the network physically cut afterward | Same as above — this page is about doing that safely |

The self-host path is `common/about_diy.js` → downloads
`github.com/red1oon/bim-ootb/archive/refs/heads/main.zip`, unzips to `~/bim-ootb`, and runs
`python3 -m http.server 8080`. After that it is a plain static file server — no external calls of its
own. Full walkthrough: **[Self-Host (DIY installer)](SYSTEMS_INSTALLER_GUIDE.md)**.

## BIM Viewer — proven offline behaviour

- The Viewer and the ERP each ship their own service worker (`viewer/sw.js`, `erp/sw.js`) with their own
  version and precache list — 109 assets for the Viewer (all JS modules, entry HTML, the web manifest),
  split into an auto-cached "shell" (THREE.js, sql.js/wasm, ~1.5 MB) and larger libraries fetched on
  first use (web-ifc, xlsx — a few MB each, cached after that).
- Fetch strategy: pages/local scripts are network-first (fall back to cache when offline); libraries,
  wasm, images, and fonts are cache-first. `.db` files are handled separately, below.
- An explicit **"make available offline"** control force-downloads the full asset shell (~10 MB) in one
  shot, and the browser's own "Install app" prompt adds it to your home screen / app list.
- Offline IFC **import** works too — the WASM IFC parser used to require a CDN fetch; it is now vendored
  locally and covered by its own offline test.

**Building data (`.db` files) — read this carefully:**

- Building databases are **not** in the installed app — only 2 sample buildings ship in the repo; the
  full library lives on object storage. The first time you open a given building, the app fetches it and
  caches the raw bytes in IndexedDB, keyed by URL. Every open after that — including fully offline — is
  served from that cache (proven: a witnessed offline re-open of a 14.3 MB building rendered its full real
  geometry, zero network).
  **Practical consequence: to use a building air-gapped, you must open it once while still online.**
- That cache holds at most 80 buildings on a least-recently-used basis. If you cache more than that while
  online, the oldest ones get evicted and will need re-fetching next time you have network.
- Small SQL "patch" fixes for a building fetch separately and are skipped silently if you're offline —
  you still get a working building, just without that patch applied yet.

## Kernel-ERP — proven offline behaviour

The ERP is architected offline-first, not offline-patched on afterward: state is a fold over a local,
signed, append-only log of operations, and **"offline availability… [is a] structural consequence of the
log model, not an optimisation."** Concretely: a sale, purchase, or any other transaction is committed
locally in one step (0 ms), postings and BOM effects apply immediately, and nothing needs to reach a
server to be real on your machine.

- **What "durable" means here:** the app tracks which of your operations have been relayed to a peer vs.
  are still only local ("in-flight"), and the honesty rule is that an in-flight op is **never shown as
  safe** — the UI amber/reds out instead of lying. This is a promise about not misreporting risk, not a
  promise that local-only data can never be lost (see the persistence note below).
- **Reference/seed data** (the Application Dictionary + demo datasets) ships as an ordinary ~27 MB file
  fetched once at first load and cached into IndexedDB — an ordinary git blob, not LFS, so it survives the
  self-host ZIP path intact. A separate zero-seed path (`genesis.html`) can also birth a fresh tenant
  entirely locally, from a built-in default chart of accounts, with no seed file at all.
- **Persistence mechanism:** the ERP runs SQLite in-memory (via sql.js/WASM, bundled locally — the one CDN
  fallback for this library only fires if the local copy fails to load, which it won't in an air-gapped
  install) and snapshots that database into IndexedDB. Your live business data (`glassbowl_kernel_ops`) is
  appended to, never overwritten. The app also asks the browser for persistent storage so this survives
  routine cache clears.
- **No telemetry of any kind** — no analytics, no crash beacon (the code comments explicitly say
  send-on-error was left out on purpose), no external calls in the transaction path. A dedicated offline
  witness confirms zero external network activity and zero page errors running the ERP fully offline.
- **Sync is opt-in and inert by default** — the relay-to-a-peer feature only activates behind an explicit
  URL flag, and even when it does, a failed relay never blocks or breaks a local commit.

**Honest limits:** live rule editing, cross-tenant schema migration for offline clients, and the full
document-action suite are specified but not yet fully shipped — see
**[Distributed ERP](DistributedERP.md)** for the complete, un-sugarcoated scope. Peer-sync itself is a
separate, opt-in feature and unrelated to whether the app works offline (it does).

## Security & privacy — what's actually verified

There is no AI or LLM anywhere in either app, no analytics, and no telemetry — confirmed by grep across
the shipped code, not just asserted. See the full guarantee: **[Enterprise Authentication (security)](EnterpriseAuthentication.md)**.
Two honest exceptions worth knowing, neither of which touches *your* data:

- The landing page loads a Google Fonts stylesheet for decorative type — a real third-party network call,
  though it carries no user data and simply falls back to a system font if blocked.
- Two secondary, non-core pages (the clash report and schedule editor) pull a couple of small charting
  libraries from a CDN. The main Viewer and ERP surfaces do not.

For a true air-gapped install where even the font request is unwanted, block or remove the
`fonts.googleapis.com` reference in the landing page — it's decorative only and nothing else depends on it.

## Setup checklist — do this while still online

1. **Install:** either open `red1oon.github.io/bim-ootb` and use "Install app," or run the DIY
   self-host installer (**[guide](SYSTEMS_INSTALLER_GUIDE.md)**) to get your own local copy.
2. **Open every building you'll need**, once each, so its `.db` lands in the permanent offline cache.
   For the Viewer, also trigger **"make available offline"** to force-cache the full app shell.
3. **Open the ERP** (`erp/erp.html` or `idempiere.html`) once, so the Application Dictionary / seed data
   downloads and caches.
4. **Bookmark the app pages directly** — the Viewer and ERP URLs, not the front-door landing page (see
   the warning at the top). These pages carry their own offline logic and resume where you left off.
5. **Disconnect and verify** before you rely on it — turn on airplane mode (or use DevTools' offline
   throttle) and confirm each bookmarked page still opens and your buildings/ledger are there.

## Known gaps (tracked, not hidden)

| Gap | Effect | Owner doc |
|---|---|---|
| No service worker at the site root | Cold offline start at the front door fails; direct app bookmarks work | `prompts/OFFLINE_HUB_SW_SCOPE_GAP.md` |
| 80-entry building cache is LRU | Heavy multi-building offline use can evict older ones | `scene.js` cache layer |
| SQL patches skip silently when offline | You get correct base data, not yet the latest patch | `scene.js _applyPendingPatch` |
| 3 automated offline-mode tests are currently excluded from CI | Behaviour is manually witnessed, not yet CI-gated | `GH_DEPLOY_ISSUES.md` Issue 4 |
| No offline-specific witness for the full `idempiere.html` surface | The lighter ERP surface is witnessed offline; the full app isn't yet | — |

## See also

- **[BIM Viewer Guide](BIMUserGuide.md)** · **[Kernel-ERP User Guide](ERPUserGuide.md)**
- **[Self-Host (DIY installer)](SYSTEMS_INSTALLER_GUIDE.md)**
- **[Enterprise Authentication (security)](EnterpriseAuthentication.md)**
- **[Distributed ERP](DistributedERP.md)** — the full offline/sync architecture and its honest scope
