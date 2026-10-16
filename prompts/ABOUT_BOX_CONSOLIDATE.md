# ⚠ DO NOT REMOVE — ONE shared About/DIY modal across landing + ERP + viewer; Install/Migrate retired
# STATUS: ✅ SHIPPED & LIVE 2026-06-16. bim-ootb PR #339 MERGED to main (09d41e2; erp sw v700, viewer sw v665).
#   Docs PUBLISHED to red1oon.github.io/BIMCompiler (ERPUserGuide §2 revamp + Spatial section + cross-link).
#   See §NEXT at the bottom for the open follow-ups.
# DOCTRINE: Spec-first · §-log first · NON-INVENT · delegate-to-install (browser never touches the source DB).
# EDIT RULE: ~/bim-ootb hook-blocked → edit in /tmp/wt-aboutbox. ERP deploy = PR→main (GH Pages). SW changelog DEPRECATED.

## WHY (user reasoning, 2026-06-16 — evolved over the session)
- Install + Migrate pills are the same picker; for real ERPs the route ignores the mode → both land on the
  staged delegate-to-install box. "Migrate" promises an in-browser transfer that never happens here → drop it.
- The old migrate_showme (5 steps) has nothing left to show → retire it.
- The landing already tells the project story (About) + has a DIY Downloader → REUSE, don't fork. Make it ONE
  shared module so any change is one spot (same ref). Mount it from landing + ERP Help pill + viewer Help.
- The README is the single "what to run" — UI never re-authors commands; you copy-paste from the README.
- Per-ERP **self-contained zips** (like the existing odoo_agent.zip): pick the ERP in the modal → download a zip
  that unzips to its own folder with its README + env props. NOT a repo reorg.
- Roadmap ERPs (SAP/Oracle/Dynamics) shown GREYED + "Under construction" (honest roadmap, no invention).
- Audio "ring" on open; Lucide icons only (feedback_pill_icon_consistency); brand BIM-blue / ERP-amber.

## BUILT SO FAR (in /tmp/wt-aboutbox)
- `common/about_diy.js` — `window.AboutDIY.open(tab?)/.openAbout()/.openDIY()/.close()`. Dark brand shell,
  segmented About/DIY tabs, Lucide feature grid, self-contained WebAudio ring, agent pills (Odoo+iDempiere live,
  SAP/Oracle/Dynamics greyed). Witnesses `§ABOUT-DIY open=Y tab=… audio=Y`, `tab=…`, `agent=…`, `diy-download os=…`.
  Visually validated (screenshots aboutdiy_about/diy.png).
- `erp/idempiere_agent.zip` — NEW bundle (migrate_agent.js + package.json[better-sqlite3] + README with env table).
  Mirrors odoo_agent.zip. Modal AGENTS → both point at zips.
- **Self-host installer FIXED** (was broken: `full` branch 404 + `BIMCompiler-full/deploy/dev` wrong folder → empty
  :8080). Now `main.zip` → `bim-ootb-main/` → serves repo ROOT → the LANDING (BIM + ERP) on localhost:8080.

## REMAINING (the wire-up — needs the visual go for the landing restyle)
1. Landing `index.html`: About link + DIY button → AboutDIY; add includes (icons.js, overlay_kit.js,
   common/about_diy.js); retire inline #about-dialog/#diy-dialog; fix/replace the broken downloadDIYScript.
2. ERP: idempiere `showme` + erp `guide` pills → AboutDIY.open(); REMOVE install+migrate pills from
   pills.json/pills_idmp.json + bindings (erp_pills.js, idmp_pills.js + §IDMP-LIFECYCLE gate); add include.
3. Viewer: wire its Help/About affordance → AboutDIY (confirm element; do NOT clobber the shortcuts palette).
4. Restyle the landing PRO to match the modal language (keep brand + content; screenshot before PR).
5. `sw.js` bump + precache common/about_diy.js + erp/idempiere_agent.zip; retire migrate_showme.js.
6. Witness (jsdom/playwright DOM) + ONE PR → main.

## ENV PROPS (sourced, for the READMEs — NON-INVENT)
- Odoo (erp/odoo_agent/README.md): ODOO_HOST=localhost · ODOO_PORT=8069 · ODOO_DB=odoodemo · ODOO_LOGIN=admin
  · ODOO_PASSWORD=admin · ODOO_SO=S00023.
- iDempiere (erp/migrate_agent.js): ERP_PG_CONTAINER=postgres · ERP_PG_DB=idempiere · ERP_PG_USER=adempiere
  · ERP_PG_SCHEMA=adempiere · ERP_OUT · ERP_TABLES · flags --masters / --list-clients.

## DOCS (separate PR, sourced, awaiting publish go)
- MigrateComparisonPaper → prominent cross-link to ERPUserGuide.
- ERPUserGuide += "Running the scripts" + "Spatial BIM→ERP: Find→Project Order (LIVE, proj_fold.js / PR#316)".
- BIMtoERP.md "Check ERP" read-chip is PAPER — do NOT advertise.

## NOTE — adjacent (NOT this work): tenant-delete trashcan already fixed on origin/main (#333, 307f015). Stale
## local screenshots only. No work needed.

## ▶ NEXT (open follow-ups, 2026-06-16 — what this session did NOT finish)
1. **Landing FULL pro-restyle** — only the header action-links were polished (→ uniform `.hlink` pill-chips,
   shipped in #339). The hero lockup, the import-zone, the feature/DIY card sections are UNTOUCHED. This wants
   a look→approve loop (it's the public home page, 2,400 lines of bespoke inline style) — do it incrementally,
   screenshot each block. `index.html` in a fresh worktree off origin/main (NOT the merged about-box branch).
2. **Viewer Help pill** now opens AboutDIY (was `showCommandPalette`). Decide: is the keyboard/gesture
   shortcuts palette lost from that pill acceptable, or re-home it (e.g. a separate entry / keep F1=palette,
   Help-pill=AboutDIY)? `viewer/panels.js:1124`.
3. **DIY self-host README as the single "what to run" for BOTH halves** — today the install script serves the
   app on :8080 (BIM+ERP) and the ERP agents are separate per-ERP zips. The user's "one README explains launch
   + migrate" idea could go further: the self-host bundle's top README could point into the agent zips. Optional.
4. **Real SAP / Oracle / Dynamics agents** — currently greyed "under construction" in the DIY box (honest
   roadmap). When an agent ships, flip `soon:false` + add its zip + a line in `AGENTS` (common/about_diy.js) —
   single spot. (Build the zip like erp/idempiere_agent/.)
5. **Stale deploy canaries** — `safe_gh_deploy.sh` §STEP6 warns `RetailScaleStory` + `glassbowl` → 404 (not a
   regression; pre-existing). Either publish those pages or prune them from the canary list (DOCS_DEPLOY_GUARD).
6. **bim-compiler working tree** has ~144 pre-existing non-doc changes (build/erp, deploy, scripts) untouched by
   this session — the user's own pending work; commit/triage separately.
7. **The real ERP roadmap spine** is unchanged: GRAND_LANE S3/J6 POST → P2 (this About/DIY lane was a tributary).

## §2026-07-22 AUDIT — user asked "does the self-host installer have a witness run log, and is it in the guide"

**No execution witness exists for the self-host installer itself.** `viewer/tests/poc_about_help_restore.js` and
`erp/tests/poc_overlay_kit.js` (the only tests touching this area) prove UI WIRING only — clicking the DIY
download button triggers a Blob download and logs `§ABOUT-DIY diy-download os=...`. Neither one, nor anything
else found in either repo, actually RUNS the generated `bim-ootb-install.sh`/`.bat` (curl the zip → extract →
`python -m http.server 8080` → confirm the landing serves). The "Self-host installer FIXED" line above (correcting
the old broken `full` branch / `BIMCompiler-full/deploy/dev` 404) was a **code-read fix, not an executed one** —
no `.log` file for this flow exists anywhere. Per this project's own Log Mandate, "fixed" here means "read and
reasoned to be correct," not "proven."

**Guide coverage — already there, but check for staleness in a sibling doc:**
- `docs/ERPUserGuide.md` §2 (line 163-164) + pill table (line 645) DO document this, briefly and accurately
  (doesn't over-claim beyond what the code does).
- `docs/AboutMore.md` §"DIY Self-Host" (lines 120-143) gives a MORE DETAILED but possibly STALE manual recipe —
  it instructs downloading from `github.com/red1oon/BIMCompiler`'s `deploy/dev/`, which reads like the OLD path
  this lane's 2026-06-16 fix replaced (corrected script pulls `bim-ootb`'s own `main.zip` instead). It also lists
  bundle contents (DXF templates, locales, `rates.js`) that look like they describe the SEPARATE "Save Offline
  Copy" (`packageLandingPage`) bundle, not the git-zip self-host installer — possibly two different downloads
  conflated in one doc section. Not confirmed either way — flagging for the next session to verify against
  current `about_diy.js` behavior before editing.

**NEXT TASK for a future session (spec, not yet built):**
1. Write an actual execution witness: either a Playwright/Node test that runs the generated script (or its
   logic directly) against a mocked/real zip fetch and asserts `localhost:8080` serves the landing page, or at
   minimum a manually-run, logged (`tee`'d) end-to-end pass on each OS this claims to support — Windows path
   especially, since `winget install Python.Python.3.12` inside the `.bat` has never been observed to run.
2. Re-verify `docs/AboutMore.md` §"DIY Self-Host" against current `about_diy.js` (`_downloadInstaller()`,
   `REPO_ZIP` constant) and fix the stale `BIMCompiler`/`deploy/dev` instructions if confirmed wrong; separate
   its "What gets installed" content into the correct one of the two flows (self-host installer vs. Save
   Offline Copy) rather than presenting them as one.

## §2026-07-22 AUDIT PART 2 — CONFIRMED BUG: self-host install breaks all 8 Modeller buildings' geometry

User asked to trace whether the self-host installer truly enables "download once (incl. CDN), then run fully
offline" — including IFC drop-import, ERP seeds, and Modeller's 8 embedded buildings. Traced end-to-end:

**Working as intended:**
- IFC drop-import (`viewer/import_worker.js`) is genuinely local-first (§S284c): loads `lib/web-ifc-api-iife.js`/
  `.wasm` from same-origin first, CDN (`unpkg.com`) only on local-load failure. `lib/` (three.js, web-ifc,
  sql.js, xlsx, chart.js — both `viewer/lib/` and `modeller/lib/`) are ORDINARY git files (confirmed via
  `git check-attr filter` — unspecified, not LFS) — survive a GitHub codeload zip intact.
- ERP seed DBs (`erp/ad_seed.db` + `12-odoo.db`/`13-idempiere.db`/`14-sap.db`/`15-oracle.db`/`16-dynamics.db`)
  are ALSO ordinary git blobs (`.gitattributes` only LFS-filters `modeller/*_geo.db` + `modeller/mesh.db`) —
  survive the zip fine, persist to IndexedDB on first load same as live.
- Some secondary CDN refs remain live (newer OrbitControls/three-mesh-bvh in `viewer/loader.js`, ERP's
  `sql-wasm-fts5`, clash-report's Chart.js tag) — by design these rely on the SW precaching them on one real
  online visit, offline after. Not a bug, but means "truly zero-network from install onward" isn't quite
  accurate for those specific features — only "online once, offline after," which matches what the user described.

**CONFIRMED BUG — `modeller/mesh.db` (115MB, THE shared geometry for all 8 Modeller buildings: SampleHouse,
Duplex, SampleCastle, HHS, Clinic, Hospital, HospitalGarage, Terminal — `modeller/str_walker_outliner.js:36-46`
`EMBED_8_ARC_BUILDINGS_MESH_DB`) is Git-LFS-tracked** (`.gitattributes`: `modeller/mesh.db filter=lfs`).
GitHub's repo-archive ZIP endpoint (`archive/refs/heads/main.zip` — exactly what `about_diy.js`'s
`_downloadInstaller()` fetches via the `REPO_ZIP` constant) does **not** resolve LFS pointers — it ships the
~130-byte pointer text, not the real binary. **Empirically confirmed**: `git show HEAD:modeller/mesh.db`
returns the literal `version https://git-lfs.github.com/spec/v1...` pointer, not mesh data. Each building's own
per-building DB (`Clinic_ARC.db` etc, `Terminal_meta.db`) IS an ordinary git blob and would come through fine —
only the SHARED geometry backing all 8 is broken. Net effect: **after running today's self-host installer, all
8 Modeller buildings load structure/metadata but have NO real mesh geometry** — silent breakage (no error
surfaced), not a crash. `modeller/sw.js` doesn't help here either — like the ERP/viewer SWs, it deliberately
skips `.db` from precache (`url.endsWith('.db') → skip SW`, relies on IndexedDB after a real fetch succeeds) —
irrelevant when the fetched file itself is a corrupt pointer from the start.

**NEXT TASK for a future session:** fix `_downloadInstaller()` (or the generated script) to pull `mesh.db`'s
real LFS content — options: (a) have the generated script run `git clone` + `git lfs pull` instead of a plain
zip download (needs git+git-lfs on the user's machine — heavier prerequisite than today's curl/unzip-only
approach), or (b) host `mesh.db` on OCI (matching this project's own DB-distribution doctrine — see
`feedback_db_change_via_sql_migration_not_binary` memory — LFS-tracked runtime data arguably belongs there
already) and have the installer/served app fetch it from there directly, independent of the git-zip. Whichever
direction, this needs an ACTUAL execution witness afterward (per Part 1's finding above — none exists today):
run the real installer, load a Modeller building, confirm real geometry renders, not just that files exist.

## §2026-07-26 AUDIT PART 3 — real download+serve+headless-load test run (closes PART OF Part 1's gap, not all of it); one new bug found

Triggered from a `bim-compiler` session (`prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §8, moved here —
that file is FreeCAD-interop scope, this file owns the installer). Ran the FIRST real execution test of this
flow that Part 1 (2026-07-22) noted was missing:

1. Downloaded the actual zip `_downloadInstaller()` fetches (`archive/refs/heads/main.zip`, 79MB real) into a
   scratch dir, extracted it, served it via `python3 -m http.server` exactly as the generated script does.
2. `curl`'d `index.html` (200, 42.6KB), `viewer/sw.js` (200, 16.9KB), `common/about_diy.js` (200, 22.2KB),
   `viewer/lib/web-ifc-api-iife.js` (200, 6.08MB — confirms local-first IFC parsing survives the zip).
3. Loaded `index.html` in real headless Chromium (Playwright, not a mock) — title `"BIM / ERP OOTB"` renders,
   page boots.
4. **New bug found, not previously recorded:** `index.html:180` — `<script src="viewer/bonsai_kernel.js">`
   — **404s**. Confirmed the real file lives at `modeller/bonsai_kernel.js`, a stale path in the landing
   page's own script tag. Did not block boot (title/state still reached), but whatever that script provides
   on the landing-page context is silently missing on EVERY load of `index.html` — self-hosted or straight off
   GH Pages, same file, same stale path, not a self-host-specific bug. **Not fixed** — found via a scratch
   download/serve test, not an edit to the shared `~/bim-ootb` checkout; needs a proper `/tmp/wt-*` session.

**What this test does NOT close — Part 2's bug is still fully open:** this pass never loaded an actual
Modeller building (SampleHouse/Duplex/etc.) — it only proved the landing shell boots. **The `mesh.db` LFS-
pointer bug from Part 2 is unverified-as-fixed and should be assumed still live** — nothing in this pass
touched it either way. Don't read "self-host installer live-tested, works" as covering building geometry —
it specifically does not. The real gap Part 1 asked for (install → open a Modeller building → confirm real
geometry renders) is **still the next task**, not this one.

## §2026-07-26 STRATEGY — user-directed: split "install" into Part 1 (minimal, wow-first) vs Part 2 (advanced)

User's explicit framing this session (paraphrased, don't drift from it): ship a Part 1 that's **just enough
to wow and convince** — Pareto 80% — browser-only, non-native-app, local-first, minimal. Everything heavier
is **Part 2**, offered only **after** the user is already convinced and invested — the two are deliberately
**separate**, not one lump to keep polishing indefinitely before shipping. The `mesh.db` LFS-zip bug (Part 2
audit above) is explicitly **not** being treated as a big lift — user's own words: "temporary, easily
worked around for repo" — so it stays IN Part 1 scope as a small fix, not deferred.

### Part 1 — what "done" means (redefine against this framing, not gold-plate further)
- **Mechanism stays as-is**: browser-only zip-download + `python3 -m http.server`, NOT a native
  Electron/Tauri app — already the settled call (`OFFLINE_GITHUB_RELEASE_BUNDLE.md`, closed 2026-07-06 —
  the user explicitly rejected the heavier native-installer framing once already; this is the same instinct
  applied a second time, consistent, not a new call).
- **Persists on the local machine** — already real (IndexedDB + cache-first SW, confirmed in Part 1's own
  audit above).
- **Drop-your-OWN-IFC → straight to work** — already real AND witnessed
  (`prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §9: `importMultiIFC` + version-merge popup, real
  headless-Chromium e2e, `pass=true`). This is the actual wow-moment the user is pointing at — already
  working, just needs the surrounding install path to not be broken underneath it.
- **ERP seed present** — already real (Part 2 audit above: seed DBs are ordinary git blobs, survive the zip).
- **Still-open, small, IN-SCOPE-for-Part-1 fix:** `mesh.db`-over-LFS-zip (Part 2 audit above) — host it on
  OCI instead of relying on the git-zip's broken LFS resolution (matches this project's own existing
  DB-distribution doctrine, `feedback_db_change_via_sql_migration_not_binary` memory — not a new pattern to
  invent). This is the ONE concrete thing standing between "the mechanism runs" and "the curated sample
  buildings actually look real" — prioritize this over any Part 2 item, since it's cheap and it's what
  actually delivers the promised wow for a first-time visitor clicking a sample building, not just a
  drop-your-own-IFC user.
- **`bonsai_kernel.js` 404** (Part 3 audit above) — small, same bucket, worth closing alongside the mesh.db
  fix since both are "the existing mechanism isn't fully honest yet" bugs, not new scope.

### Part 2 — advanced installation, offered only to the already-convinced
Explicitly NOT required for Part 1 to ship or be considered "done." Two things already correctly belong here,
one newly re-filed:
- **The existing legacy toolchain already IS Part 2, just not named that way.**
  `docs/SYSTEMS_INSTALLER_GUIDE.md` (Java/Maven/SQLite/Python/Blender/IfcOpenShell, full compiler + back-office
  from source) already carries almost exactly this framing in its own banner: *"BIM OOTB now runs in the
  browser — you probably don't need this guide... legacy/advanced path... most users can skip it entirely."*
  No new doc needed — just recognize this is prior art for the Part 2 concept, not a gap to fill.
- **ERP native agents** (`odoo_agent.zip`/`idempiere_agent.zip`, per the "Bring your ERP data in" section of
  the DIY modal) are also naturally Part 2 in spirit — they require running a native Node agent against a
  real ERP/Docker install, a heavier ask than drop-an-IFC-and-look-at-it. Already correctly gated as opt-in;
  worth naming as a Part-2 exemplar, not restructuring.
- **NEWLY RE-FILED (was under debate as "build or don't build" — now just correctly sequenced):** the DXF
  Tier 2 Python-local-endpoint bridge idea (`prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §7 Tier 2) —
  full AIA-layer/DIMSTYLE-fidelity DXF export via a local Python bridge into the existing
  `drawing_writer_dxf.py` pipeline. Not rejected — just belongs here, offered to users who are already
  self-hosting and want more, not gating Part 1's minimal wow-path on it. Tier 1 (client-side, honest-scoped
  JS DXF export, zero install) remains the Part-1-appropriate version of that same feature.

### The rule going forward
When scoping ANY future installer/onboarding work: ask "is this needed for the FIRST wow moment (drop an
IFC, see it work, offline-persisted), or is it something a converted, invested user would opt INTO later?"
The former is Part 1 — keep it minimal, fix what's actually broken (mesh.db, bonsai_kernel.js), don't add.
The latter is Part 2 — real, valuable, but never a blocker on Part 1 shipping/being "done."

## §2026-07-26 AUDIT PART 5 — the FULL Part 1 sphere, user-defined: drop IFC → blank Viewer → merge →
## Modeller ARC-remodel → Find → ERP → Project Order → Time Machine Budget-vs-Actual. Checked leg by leg.

User expanded the Part 1 definition to the whole journey, not just install+import. Checked each leg against
real code (not memory-on-trust, per this doc's own standing discipline) — 6 legs, verdicts below, ranked by
what actually blocks the journey today.

**LEG 1 — blank Viewer as the first-touch entry: ⛔ NOT BUILT.** Confirmed again: the drop-zone lives on the
LANDING PAGE's import hub (`#m-import-zone`, opened as a hub overlay), not inside an empty `viewer.html`/
`modeller.html` canvas. Today's flow is land → open hub → drop → NEW TAB opens already populated. The
user's ask is "first touch IS the empty Viewer" — a real, un-built navigation change (§10 in
`prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md`, DB-format question already resolved = our own `.db`).

**LEG 2 — scoop all IFCs at one go, merged: ✅ REAL, code-confirmed + partially e2e-witnessed.**
`import_own.js` wires `input.multiple=true` and passes the WHOLE native multi-file `dataTransfer.files`
FileList straight to `handleImportFiles` → `importMultiIFC` when 2+ IFCs are present — a single drop
gesture, not sequential drops. The e2e witness that passed (§9 in the interop doc) drove sequential/paired
drops to prove the merge+version-popup LOGIC; it did not specifically drive one N-file simultaneous drop.
Logic is the same code path either way (code-confirmed), but flagging the residual gap honestly rather than
claiming full e2e coverage of that exact gesture.

**LEG 3 — later diff IFC → variance treatment: ⛔ CONFIRMED BROKEN for the general case, not a rumor.**
`viewer/diff.js` (S222: real GUID-set diff, added/removed/changed colour overlay, `› VO — fold to ERP
amendment` button) is real and Playwright-tested — but its trigger in `import_own.js`'s `openProject()`
(line 180) is `if (/revised/i.test(record.versions[vi].key || ''))` — and **nothing that creates a new
version ever sets that key to contain "revised."** Both merge-accept code paths (`import_own.js:384` single-
file, `:701` multi-file) push `{key: file.name, ...}` — literally the dropped file's own name. So dropping a
genuinely updated IFC and accepting the version-merge does **not** reliably open the diff/variance view —
only if the user's own filename happens to contain "revised". This is the single most consequential finding
this session: it silently breaks the chain into Leg 5's `› VO` ERP-amendment button too (that button only
appears when `A.diffDb` is populated — same broken trigger). **This is almost certainly the "older landing
page" behavior the user remembers** — a real feature that survived a landing-page redesign in code but lost
its live wiring, same shape as the multimerge branch that had to be re-verified in §9 (except this one is
confirmed still-broken, not confirmed-fine).

**LEG 4 — Modeller: extract ARC-only from a freshly user-imported DB, to remodel: ✅ REAL, robust even to
arbitrary files.** `modeller/arc_editable.js`'s `buildSeedOps` filters `discipline='ARC'` when a discipline
column is populated, but — checked the fallback, not just the happy path — **falls back to filtering by
known architectural `ifc_class` names when no discipline tag exists at all**, which is exactly the case for
a user's plain-named IFC (discipline tagging in `import_own.js` is filename-convention-only —
`_discFromFilename`, e.g. `_ARC` suffix — and returns nothing for an ordinary filename). This fallback is a
sound, non-invented heuristic (`ARC_CLASSES` membership), not a broken path. Also confirmed the Modeller's
own Open panel (`modeller.html` `pickLocal()`) accepts a raw local `.ifc` file directly and routes it through
the SAME `_openIfcFile()` path as the curated sample IFCs — "no separate code path for 'our' buildings vs a
user's own file" (the code's own comment). **Caveat found:** that direct picker takes `files[0]` only — no
multi-file merge. So today, multi-IFC merge (Leg 2) and direct-to-Modeller open are two SEPARATE paths; to
get a multi-merged building into the Modeller for ARC editing requires the existing Save (Ctrl+S, real per
`LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`) → then Open-from-disk in the Modeller — a working but manual
two-step bridge, not one seamless click.

**LEG 5 — Find → ERP → Project Order: ✅ REAL, shipped live (spot-checked, not re-litigated).** Per
`project_bim_to_project` memory (2026-06-14/15, PRs #316/#318/#321, live on GH Pages) — spot-checked
existence + wiring on current code rather than trusting 19-day-old memory outright: `viewer/proj_fold.js`,
`viewer/vo_fold.js`, `erp/bim_orders_overlay.js`, `viewer/proj_control.js`, `viewer/vo_approve.js` all
present; `navigate_find.js`'s `_pushToErp`/`› ERP` button and `diff.js`'s `_voToErp`/`› VO` button both still
wired. This leg is real. Its `› VO` half is the one that depends on Leg 3's broken trigger, though — see above.

**LEG 6 — back to Time Machine, Budget-vs-Actual diff timeline: ✅ REAL, shipped live (spot-checked).** Per
`project_tm_4d5d_variance_lane` memory — W0/S5 "earn-the-actual" shipped 2026-06-22 (PR #492), real AC folded
from atomic `PP_Order_Cost` rows, not a hashed factor. Spot-checked: `viewer/time_machine.js` (4878 lines),
`viewer/whatif.js`, `viewer/whatif_panel.js`, `erp/tests/earn_gw_hospital_actual.js` all present on current
tree. This leg is real.

### Bottom line — what actually blocks the "whole sphere" from working end-to-end today
Legs 4, 5, 6 are genuinely solid (built, live, spot-verified). Leg 2 is solid at the code level. **The two
real blockers are Leg 1 (blank-canvas entry point, simply not built yet) and Leg 3 (the diff/variance
trigger, built but disconnected — a real bug, not a missing feature).** Leg 3 is the higher-priority fix of
the two: it's not a new build, it's reconnecting an existing, tested mechanism (`diff.js`) to the existing,
tested mechanism (`_confirmVersionMerge`) — the fix is almost certainly small (stamp SOME marker — not
necessarily literally "revised" — onto a pushed version when it's accepted as a merge over an existing
project, and have `openProject` key off that marker instead of sniffing the filename). Not fixed here —
this was a check-first pass, per the user's own request; flagging precisely so a build session doesn't have
to re-discover it.

**§2026-07-26 FOLLOW-UP — Leg 2 clarified: "the Viewer's Open icon" is NOT the multi-merge path, and a
second dead code path was found.** User asked whether Leg 2 (scoop-all-IFCs-merge) works via the Viewer's
own Open icon. Checked precisely: **no.** `viewer/panels.js` has two Open-labelled icons — "Open Design"
(`doc-open-btn`, lists saved freehand sketches via `DocCanvas.listDesigns`, unrelated) and "Open Building"
(Ctrl+O, `A.openModelDb()`, opens an already-saved `.db` via native OS dialog) — neither imports raw IFC.
**Found in the process: `viewer/viewer.html` itself loads `viewer/import.js` (a SECOND, independent
`importMultiIFC` implementation, separate from `import_own.js`'s proven one), which wires a drop-zone via
`document.getElementById('import-zone')` — but no `id="import-zone"` element exists anywhere in
`viewer.html`'s markup. This code is dead — it runs, finds nothing, silently no-ops.** The only LIVE
multi-IFC-merge path today is the landing page (`index.html` → `import_own.js` → `#m-import-zone`), already
verified in Part 5 above. Full detail + the "don't resurrect the dead path, reuse the proven one" guidance
for Item 2 now lives in `prompts/RESUME_PART1_JOURNEY_COMPLETION.md` — read that file for the actual build
spec; this entry is the audit record only.

**Next session: see `prompts/RESUME_PART1_JOURNEY_COMPLETION.md`** — the two real open items (diff-trigger
fix, blank-canvas entry) are written up there as a ready-to-execute resume spec, not left only as audit
findings here.
