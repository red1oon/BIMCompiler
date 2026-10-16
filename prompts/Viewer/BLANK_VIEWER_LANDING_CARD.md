# ⚠ DO NOT REMOVE — scope block
**Scope:** Landing page (`SYSNOVA/index.html`, the single canonical landing source per
`deploy/OCI_UPLOAD.md` §Bucket Landing Arrangement) + the viewer (`deploy/dev/index.html`, deploys to
bucket `sandbox/index.html`). Adds a **"Blank Viewer"** card so a user can open a truly empty 3D viewer
and load their own `.db` from local disk — no import/convert pipeline, no IndexedDB roundtrip.
Read the log after every run — exit code is not evidence.

## WHY (user, 2026-07-28)
"To facilitate user opening up own IFCs/DB, from landing page there is no blank Viewer page" — the
landing card grid (`BUILDINGS` map, `buildCard()`/`openViewer()`) only opens a PRE-KNOWN building's
`.db` by URL. There was no entry point that lands in an empty scene, and separately, the viewer itself
had **no local file-open control at all**.

## Audit (confirmed before writing code — don't re-derive)
- `deploy/dev/config.js:9` — `A.DB_URL` **always** falls back to `Duplex_extracted.db` when no `?db=`
  param is present. There is no way to reach a truly blank scene today; a "blank" open just silently
  loads the sample house.
- `deploy/dev/streaming.js` `A.init()` (~L1310) unconditionally proceeds to fetch `A.DB_URL` — an empty
  URL would resolve to the page's own HTML (`fetch('')` = current document) and fail confusingly.
- The existing "Drop IFC" zone (`SYSNOVA/index.html` inline, `#import-zone`) is **landing-page-only** —
  it converts IFC/3D formats via `import_db_builder.js` and stores to IndexedDB (`bim_ootb_imports`),
  then the resulting building appears as a normal card. This already covers "open an IFC I have." It
  does NOT cover: I already have a raw `.db` (e.g. built by this repo's own extraction pipeline) and
  just want to point the viewer at it directly.
- `deploy/dev/import.js` (loaded via `<script>` in `deploy/dev/index.html:807`) is **dead code in the
  viewer** — its `setupImport(A)` is never called from `main.js`'s `_mods` list, and its drop-zone wiring
  targets DOM ids (`#import-zone` etc.) that only exist on the landing page. Confirmed via grep, not
  assumed.
- Prior art `prompts/Viewer/OPEN_BUTTON_IFC_BCF_MERGE.md` (closed) solved the equivalent problem in the
  **bim-ootb** repo by widening the Open button's native file picker. That repo/viewer is a different
  codebase from this one (`bim-compiler/deploy/dev`) — not directly portable, but the shape (native
  Open, no new drop-zone chrome) is the same convention to follow.
- User decision (asked directly, not invented): blank card should give an **empty scene AND** a real
  local file-open control (file picker + drag-drop), not just an empty scene with no way forward.

## SPEC

### 1. Blank mode — `config.js` + `streaming.js`
- `config.js`: add `A.BLANK_MODE = _params.get('blank') === '1'`. When true, `A.DB_URL = ''` (skip the
  Duplex fallback).
- `streaming.js` `A.init()`: immediately after SQL.js is ready, if `!A.DB_URL && !A.CITY_URL`, set a
  status message and `return` — do NOT fall through to the fetch/HEAD logic. Guard `initSqlJs` with
  `A._SQL ||` so a later re-entry into `A.init()` (see §2) doesn't reinstantiate the WASM module.
- §-log: `§BLANK_MODE active=1 waiting_for_open=1` on entry, `§BLANK_OPEN file=<name> size=<bytes>` when
  a file is opened.

### 2. Local file Open — new `deploy/dev/blank_open.js` (`setupBlankOpen(A)`)
- Only wires anything when `A.BLANK_MODE` is true.
- Overlay (`#blank-open-overlay` in `index.html`, hidden by default) shown on boot: "Blank Viewer — no
  building loaded", drag-drop target + `<input type=file accept=".db,.sqlite">`.
- `A.openLocalFile(file)`: `.db`/`.sqlite` → `A.DB_URL = URL.createObjectURL(file)`, hide overlay, call
  `A.init()` again. **Reuses the existing single-DB load path in `streaming.js` verbatim** (a blob: URL
  doesn't match the `_extracted.db`/`.db` split-detection regexes, so it falls straight into the
  monolith branch — the correct behaviour for a raw opened file) — no duplicate DB-loading code written.
  `.ifc` → NOT wired in this card (would need `web-ifc`/`import_worker.js` ported into the viewer, a
  bigger lift matching `OPEN_BUTTON_IFC_BCF_MERGE.md`'s scope) — status message points the user at the
  landing page's existing Drop-IFC import instead. Named as a follow-on, not built here (Pareto: ship the
  DB path now, IFC-in-viewer is a separate card if ever prioritized).
- Registered in `main.js` `_mods`-style: `if (typeof setupBlankOpen === 'function') setupBlankOpen(APP);`

### 3. Landing card — `SYSNOVA/index.html`
- `openBlankViewer()`: opens `sandbox/index.html?blank=1` (same `_base`/tab-tracking convention as
  `openViewer()`).
- `buildBlankCard(container)`: same `.card` styling as `buildCard()`, dashed border, "➕ Blank Viewer /
  Open your own .db file", inserted first into `instantGrid` (small-buildings grid) before the manifest
  loop populates it — always present regardless of manifest fetch success/failure.

## TEST PLAN (whitebox — this project doesn't do live-browser value checks, see `docs/TestArchitecture.md`
§Browser Testing)
`deploy/dev/tests/witness_blank_viewer_card.js` — static/§-tag verification, no page.goto:
1. `node --check` every edited/added JS file.
2. `SYSNOVA/index.html` contains `buildBlankCard`, `openBlankViewer`, and the card is wired into
   `instantGrid` before `city.forEach`.
3. `config.js` sets `A.BLANK_MODE` and gates the `Duplex_extracted.db` fallback on it.
4. `streaming.js` `A.init()` has the blank-mode early return before the `fetch(A.DB_URL, ...)` HEAD call.
5. `blank_open.js` exists, defines `setupBlankOpen`/`A.openLocalFile`, and is both `<script src>`-included
   in `deploy/dev/index.html` and referenced in `main.js`'s module-registration block.
6. `index.html` contains the `#blank-open-overlay` markup with the file input.

## STATUS
✅ DONE (witness) — 2026-07-28. `deploy/dev/tests/witness_blank_viewer_card.js` 19/19 PASS
(`deploy/dev/tests/witness_blank_viewer_card.log`). Additionally smoke-tested through the REAL relative-path
topology (`index.html` + sibling `sandbox/` — symlinks, no repo files moved): landing serves the Blank card
wiring, `sandbox/index.html?blank=1` serves the overlay + `blank_open.js` include, `blank_open.js` returns
200. Files touched: `config.js`, `streaming.js`, `main.js`, `blank_open.js` (new), `index.html`,
`SYSNOVA/index.html`. Pushed `fable/meshdb-livewire` (`40e333efd`, `de9b49406`).

### ✅ bim-ootb PORT DONE — 2026-07-28, PR #1068 (`fix/blank-viewer-landing-card`, `c7a6ce0`)
User checked bim-ootb's own landing (`~/bim-ootb/index.html`) and didn't see the card — **this repo's
`SYSNOVA/index.html`/`deploy/dev` and bim-ootb's `index.html`/`viewer/` are two entirely separate
codebases**, per `feedback_edit_right_repo.md` (bim-ootb = the canonical, actually-viewed-by-the-user
stage). Ported the same fix there, via a fresh `origin/main` worktree (`/tmp/wt-blank-viewer` — the local
`~/bim-ootb` main checkout was 88 commits stale, per project doctrine never measure/branch from it):
- `viewer/config.js`: same `A.BLANK_MODE` guard, but ALSO gates bim-ootb's `§S283 pwa_last_db` PWA-resume
  fallback (bim-compiler's config.js doesn't have this — bim-ootb-only code path).
- `viewer/streaming.js` `A.init()`: same early-return before the DB fetch.
- `index.html`: dashed "Blank Viewer" card added into the Buildings/IFC hub (`buildHubBody()`'s
  `.hub-grid`), opens `viewer/viewer.html?blank=1&ghost=1`.
- **No new open-file UI built** (unlike the bim-compiler port's `blank_open.js`) — bim-ootb's viewer
  ALREADY ships a full native Open control (`A.openModelDb()`/Ctrl+O/"Open Building" pill, FSA picker +
  input fallback, `scene.js:718`) per the already-closed `OPEN_BUTTON_IFC_BCF_MERGE.md`. Blank mode just
  needed to stop erroring/auto-loading Duplex so that existing pill has something to open into.
- Whitebox: `node --check` both JS files + inline `<script>` parse in `index.html`; curl-smoke-tested
  through the real repo topology (python http.server on the worktree itself — genuine `index.html` +
  `viewer/` siblings, no symlink hack needed here).
- **Push note:** first `git push` attempt hung ~90s. User correctly questioned "what r u sending? LFS is
  for DB" — checked directly (`git lfs pre-push` run standalone against this exact commit range: exit 0,
  instant, zero objects) — confirmed the hang was NOT the documented LFS-probe issue for once; a retry
  with `GIT_SSH_COMMAND="ssh -v"` succeeded in 14.9s (ref negotiation, not LFS, not auth). Transient.
  Don't assume every bim-ootb push hang is the LFS probe — verify before citing it.

### ✅ FOLLOW-UP FIX — 2026-07-28, PR #1070 (`fix/blank-viewer-sw-cache-bump`, merged `0db250e`)
User clicked the merged card live and still got Hospital, not blank — "discuss first if u face issue"
before pushing another guess. Root cause found and confirmed via `viewer/sw.js`'s own `isNetworkFirst()`:
`viewer.html`/`config.js`/`streaming.js` are in `PRECACHE_ASSETS`, which routes them **cache-first**
(freshness = `CACHE_VERSION` bump on deploy, by this file's own doctrine/comment) — NOT the network-first
fallback that untracked `.html`/`.js` get. PR #1068 edited exactly those three files without bumping
`CACHE_VERSION`, so an already-installed client (the user's, which already had a `pwa_last_db` of
Hospital) kept serving the stale pre-fix `config.js` straight from cache — hence "shows Hospital", not
the hardcoded `Duplex` default a fresh client would have seen. Fix: `CACHE_VERSION` `v871`→`v872`, one
line, `viewer/sw.js`. `main` is a protected branch (2 required status checks) — a direct push was
rejected; opened as a PR instead, `gh pr merge --auto --squash`, both checks (`fast-checks`,
`e2e-tests`) passed, merged clean. **Standing lesson for future viewer-file changes in bim-ootb: check
`viewer/sw.js`'s `PRECACHE_ASSETS` list for every touched file and bump `CACHE_VERSION` in the SAME PR —
don't ship the code change and the cache-bust as two round trips.**

## ✅ CLOSED — user-confirmed live, 2026-07-28
User confirmed the Blank Viewer opens correctly after the PR #1070 cache-bump. Nothing left open on this
card. (Unrelated low-priority thread the user raised in the same session — an idempiere-seed-db status
message while at the Viewer — is tracked in `PROGRESS.md`, not here; source not located, user says not
urgent/not disturbing.)
