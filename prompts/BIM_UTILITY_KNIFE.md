# ⚠ DO NOT REMOVE — BIM_UTILITY_KNIFE (spec-first, 2026-10-09)

**SCOPE.** Spec for a light 4th surface next to Viewer / Modeller / ERP: small single-job IFC utilities
that BIM users' own apps will not do. SPEC ONLY — no code until the user approves §5 order.
**Read the log after every run. A witness with an empty population prints INCONCLUSIVE, never PASS.**
Prime rule applies: every filled value traces to a source (locale JSON / IFC itself) and is TAGGED as inferred.

## 1. What already exists (read 2026-10-09)
| Need | Existing owner | Gap |
|---|---|---|
| Browser STEP IFC writer | `bim-ootb/viewer/ifc_export_worker.js` (S229, pure STEP text, from DB elements) | writes from our DB, not from a user's original IFC |
| IFC parse in browser | `viewer/lib/web-ifc-api-iife.js` (+wasm), also `modeller/lib/` | web-ifc reads IFC2x3/4/4x3 (readiness worker msg, `metrics_worker.js` L93-103) |
| Authored → IFC4 | `modeller/bonsai_ifc.js` | shell only; drops Psets/materials/containment by design |
| Locale rates | `viewer/rates/*.json` (cidb2024_my, bcis2024_uk, bki2024_de, aramco2024_sa, asaqs2024_za, 4D_template, custom_template), `viewer/locale_loader.js`, `viewer/locales/*.js` (18 locales) | |
| 4D/5D fill logic | `schedule_author.js`, `cpm_schedule.js`, `rates.js`, `export_4d.js`, `export_5d.js` | wired to our extracted DB, not to a raw IFC |
| IFC self-check metrics | `readiness/metrics_worker.js` (M1–M15) | counts only; reuse as the "before/after" report |
| IFC4.3 / IFC2x3→4 upgrader | **none found** (grep IFC4X3 in viewer/modeller = 0 hits) | build |
| Extract one element → own IFC | **none found** | build |

Re-check before building: `~/bim-ootb` `git fetch && ff-only merge` (stale-checkout rule).

## 2. Surface
Page `bim-ootb/bim.html` (user 2026-10-09; no such file exists, checked), tool modules in `bim-ootb/bim/tools/` (own JS, own `lib/`, own `sw.js`; trilogy rule: never under `viewer/`).
Drag-drop IFC in → pick tool → file out. No server, no upload, no AI. Same web-ifc wasm.

## 3. Requested items
### U1 — Upgrade IFC2x3 → IFC4.3
Spec basis: official mapping is the buildingSMART forum thread "IFC2x3 to IFC4 mappings" and the IfcOpenShell `ifcpatch` Migrate recipe (user's fork, see memory `reference_ifcopenshell_fork_prior_art`). Community says no robust free converter exists and class mapping needs human decisions ([OSArch](https://community.osarch.org/discussion/325/), [bSI forum](https://forums.buildingsmart.org/t/convert-upgrade-ifc2x3-to-ifc4/5210)) — so the tool must report every decision, not hide it.
Rules (each a table row in a mapping DB, not code):
- Entity renames/splits (e.g. `IfcBuildingElementProxy` stays; `IfcStairFlight` etc.), attribute reorder, `IfcOwnerHistory` optional, `IfcQuantity*` unchanged, `IfcRelAssociatesMaterial` kept, units/`IfcSIUnit` re-emitted.
- 4.3 additions used only if source gives the data (e.g. `IfcFacility` stays unset for buildings; spatial chain untouched).
- Output header `FILE_SCHEMA(('IFC4X3_ADD2'))` (the validated id per bSI Validation Service guide).
- Every entity: `converted | renamed | dropped | unmappable`, counts in a `§UPGRADE` log line. Unmappable → kept as `IfcBuildingElementProxy` with original type in a Pset, never silently dropped.
Witness claims: **W-UP-1** entity count in = out + dropped (INCONCLUSIVE if 0 entities). **W-UP-2** re-open output with web-ifc → 0 parse errors. **W-UP-3** M4/M7/M8/M14 metrics unchanged before vs after. **W-UP-4** (needs user fact) bSI Validation Service verdict — manual upload by owner, login required.

### U1.2 — Infer missing 4D/5D defaults from locale JSON
Reuse CivilWorks/Buildings inference path (`schedule_author.js` + `rates.js`), do not re-derive. Locale chosen from `rates/*.json` (user picks, default from browser locale via `locale_loader.js`).
Rule: only fill what is EMPTY; never overwrite. Every filled value written to a `Pset_BIMOOTB_Inferred` with `Source` = rates file + row key, `Basis` = rule id. Un-fillable → left blank and counted.
Fills: unit cost / material-labour-equipment (5D), task duration + phase (4D template), classification where the type name matches the locale table.
Witness: **W-INF-1** filled+skipped+blank = total. **W-INF-2** zero pre-existing values changed (hash of untouched props). **W-INF-3** every filled value has a Source that exists in the rates file. VACUOUS if no element matched any rate row.

### U2 — Pick item(s), export as a separate IFC
Select by GlobalId / class / storey / name filter. Output must stay valid on its own: keep the element's geometry, type, Psets, material, and pull its spatial parents (Project→Site→Building→Storey chain, units, context). Option: include voids/fillings (host wall openings), include aggregates children.
Witness: **W-EX-1** exported set == selected set (+ declared dependencies). **W-EX-2** no dangling `#id` references. **W-EX-3** GlobalIds preserved so the user's legacy app can re-link. **W-EX-4** bbox of export == bbox of element in source.

### U2.2 — Research: what BIM users cry out for
Sources: search 2026-10-09 (vendor plugins + forums, not a ranked survey — so ranking below is MY inference, not data). Paid single-job plugins exist for each, which shows demand:
| Tool | Evidence | Free alternative today |
|---|---|---|
| Split IFC by storey/class | [BIMvision IFC Split](https://bimvision.eu/ifc-split/) (paid) | none browser-side |
| Merge IFCs, fix duplicate GUIDs, same-unit limit | [BIMvision IFC Merge](https://bimvision.eu/ifc-merge/) | none |
| Shrink file (optimizer discontinued) | [Solibri IFC Optimizer](https://centralinnovation.com/?p=3401), [OSArch optimiser](https://community.osarch.org/discussion/comment/1800) | ifcpatch (CLI) |
| IDS check | [IfcTester](https://pypi.org/project/ifctester/0.0.240423), [IDS Maker](https://bimvision.eu/ids-maker-and-ids-checker-key-tools-for-managing-specifications-ids) | free but Python/CLI |
| Quantity takeoff → Excel | [BIMvision Takeoff Reports 130 €](https://bimvision.eu/takeoff-reports/) | `export_5d.js` already does it for our DB |
| Slow coordination file | [Graphisoft thread](https://community.graphisoft.com/t5/Project-data-BIM/Coordination-hotlinking-large-and-slow-file/m-p/374538) | split + link |

Candidate tools, ranked by (demand evidence × reuse of what we own):
1. **U3 Split** by storey/class/discipline — reuses U2 engine. Cheapest next.
2. **U4 Merge** + GUID collision fix (new GUID or skip) — same engine, unit reconcile.
3. **U5 Slim** — points, vertices, normals-smoothing, material fill (see U5 above); report MB before/after.
4. **U6 Health report** — `metrics_worker.js` M1–M15 + duplicate GUIDs + orphan elements, one page, no thresholds invented (thresholds still uncalibrated per Dubai SCORING_SPEC).
5. **U7 IFC → Excel** (props + quantities) — reuse `export_5d.js` ExcelJS code path.
6. **U8 IDS check** — browser port of IfcTester rules; only after U1–U6 (largest build).
Not proposed: authoring/editing geometry (stays in Revit/ArchiCAD per `project_modeller_assemble_handoff_strategy`).

### U5 — Slim / clean geometry (user add 2026-10-09: "redundant points, vertexes, smoothening, material fill")
Four passes, each separate, each reports before/after, none touches shape beyond its stated tolerance:
- **U5a Redundant points** — in `IfcCartesianPoint` / polylines / `IfcPolyLoop` / profile curves: drop exact duplicates (tol 0), then collinear mid-points (tol = user value, default 0.1 mm; units read from the file). Shared points re-pointed to ONE entity. Closed loops keep first=last rule.
- **U5b Redundant vertices (meshes)** — `IfcTriangulatedFaceSet` / `IfcPolygonalFaceSet`: weld coincident vertices (tol), remove degenerate (zero-area) faces, drop unreferenced vertices, reindex. Also dedupe identical geometry into one `IfcRepresentationMap` + `IfcMappedItem` (pattern already used in `bonsai_ifc.js` array export).
- **U5c Smoothing of ducts / pipes / poles** (user 2026-10-09: jagged-edged round things; "not sure if it can be edited into IFC"). YES, two ways, both writable into IFC:
  1. **Shading** — add smooth vertex `Normals` by crease angle. Positions untouched. Prior art: viewer-side `§MEP_SMOOTH_NORMALS` (`viewer/streaming.js` L26) + `§DUCT_SILHOUETTE` (#1631) — those smooth at RENDER time only, not stored in any IFC; U5c writes the result into the file.
  2. **Re-fit round parts (the real fix)** — a faceted n-gon prism is detected (all side verts equidistant from one axis, caps planar) and replaced by `IfcExtrudedAreaSolid` + `IfcCircleProfileDef` (or `IfcRectangleProfileDef` for rect ducts). Exact circle, smooth in any viewer, FEWER bytes. Applied only when fit residual ≤ tol (asserted); otherwise left as is and counted `not_round`. Keeps GlobalId, type, Psets.
  Mesh decimation = separate opt-in, stated max deviation.
- **U5d Material fill** — elements with no material/style: fill from (1) their own type's material if `IfcRelDefinesByType` gives one, else (2) a class→material/colour table row (IFC class → name + RGB), else leave blank. Never overwrite. Every fill logged and tagged in `Pset_BIMOOTB_Inferred` (Source = type | table row). Source IFC colours are trusted as-is (`feedback_ifc_colors`).
Witness: **W-SL-1** vertices/points in vs out (INCONCLUSIVE if 0 removed AND 0 candidates). **W-SL-2** max Hausdorff-style deviation of every element's bbox + volume ≤ tol (asserted number). **W-SL-3** re-open with web-ifc → same element count, 0 errors. **W-SL-4** U5c: shading mode → max vertex displacement == 0; re-fit mode → max radial residual ≤ tol and element bbox/volume within tol, `refit + not_round == candidates`. **W-SL-5** U5d: filled + skipped + already-had == total; 0 pre-existing materials changed. **W-SL-6** file MB before/after + heap/verts line (PERF BUDGET).

## 3b. Shape of the product (user 2026-10-09)
**Principle: each tool is singular, fast, repetitive — the job people avoid opening a heavy app for.** No tool depends on another.
- **Address = a SUB-DOMAIN, not a folder path** (user correction 2026-10-09). Today the apps live under one host path (`red1oon.github.io/bim-ootb/viewer/`, README L27). A sub-domain (e.g. `bim.<yourdomain>`) needs a domain you own + a DNS CNAME to GH Pages/OCI; I found no CNAME/custom domain in `bim-ootb`. ⛔ Which domain? Until then the code lives in repo folder `bim-ootb/bim/` and is reachable at `.../bim-ootb/bim/`; the sub-domain is a pure DNS/hosting step, zero code change (all asset paths relative).
- **UI = the viewer's pill tray, extended.** Opens with the pill rail (right edge, `#mobile-pill` + `pill_builder _layoutRail`, `viewer/viewer.html` L340-362; icons Lucide-only per `feedback_pill_icon_consistency`) showing the tools as pills, one pill per tool, long-press drawer for options (same pattern as the W pill, `panels.js` L121). Reuse the rail code; do not build a second pill system. Canvas stays empty until `o`. ⛔ rail code lives in `viewer/` — either `bim/` imports it via the shared-bundle path (like modeller's `../viewer/connect_scene.js`) or it is lifted to `common/`. I recommend import, no copy.
- **Drop-first, open-never.** A file dropped on the page runs the chosen tool directly — no scene load, no canvas needed. Result downloads. Rendering into the canvas is optional.
- **Shortcut key `o`** = open canvas preview of the dropped file (and back). Keys for the rest of the tools are one letter each, listed on an overlay. For repeat users: reach tool → out in 2 keystrokes. ⛔ pick the letter map with the user (not invented here).
- **Same code runs as CLI.** Every tool = a pure ES module `tools/<name>.js`: `run(bytes, opts) → {bytes, report}`, no DOM. Browser page and Node CLI are two thin shells over it:
  `node bim-cli.js <tool> in.ifc [-o out.ifc] [--tol 0.1] [--locale cidb2024_my] --json` → exit 0 / non-zero + `§`-log to stdout. Ships in the toolkit download (Node, no install beyond `npm i web-ifc`). Batch: a folder or glob.
- **W-CLI-1** browser result bytes == CLI result bytes for the same input+opts (hash). **W-CLI-2** CLI on a never-opened file works with no DOM globals (run under plain node, no jsdom).

### Key map (picked 2026-10-09; user: "simple letters, not in use by Viewer first")
Source: Viewer `_shortcuts` in `viewer/scene.js` L2283+ lists `+ - 2 x 4 f p t z w l o v s n b i h c m r a q = / .`; other Viewer key handlers add `d g j y` (+WASD fly). So Viewer-FREE letters = only **e k u**; free digits = 1 3 5 6 7 8 9.
| Key | Tool | Why |
|---|---|---|
| `u` | U1 Upgrade → IFC4.3 | **U**pgrade |
| `e` | U2 **E**xtract item | mnemonic |
| `k` | U3 Split (**k**nife cut) | only free letter left |
| `1` | U1.2 Fill 4D/5D defaults | first thing after upgrade |
| `3` | U5 Slim / smooth / material fill | |
| `5` | U4 Merge | |
| `6` | U6 Health report | |
| `7` | U7 IFC → Excel | |
| `8` | U8 IDS check | |
| `o` | open/close canvas preview | **kept as you asked.** It is a Viewer key (DLOD nav) — no clash because `bim.html` is a separate page, but the finger memory differs. Alternative free key: none left among letters. |
Keys only fire when no file-dialog/input has focus. Overlay on `?` lists them (`?` is free in the Viewer shortcut map? — NOT checked, `/` and `=` are taken; verify before use).

### Drop = run (the Mac-style rule, user 2026-10-09)
Dropping a file executes at once: no dialog, no "Run" button, sensible defaults (tolerance, locale from browser). Output lands beside the input as `name_<tool>.ifc` (CLI/droplet) or downloads (browser); original never overwritten. One-line result ("12,408 points removed, 61.2 → 38.9 MB"). Options exist but only behind the pill long-press / flags. Witness **W-DROP-3**: with defaults only, drop→output with zero extra input; input file hash unchanged.

### Desktop droplets (user idea 2026-10-09: one icon per tool, drop an IFC on it)
Known pattern (Photoshop droplets, drag-onto-exe). Demand for THIS form in BIM is **unverified** — my search showed demand for single-job tools, not for desktop icons. Cheap because the §3b core already runs headless. Two routes, both reuse `tools/<name>.js` unchanged:
- **D1 Installable PWA per tool.** One manifest per tool (`bim-upgrade.webmanifest` …, own `id`, `start_url=bim.html?tool=u`), manifest `file_handlers` for `.ifc` → dropping a file on the installed icon launches the tool with that file (Chrome/Edge desktop only; Firefox/Safari don't support it — ⛔ to verify against current Chrome docs before building). Works offline through `sw.js`; file never leaves the machine. Zero extra build.
- **D2 CLI launcher stubs** in the toolkit zip: Windows `.bat`, macOS `.command`, Linux `.desktop` — each calls `node bim-cli.js <tool> %*`, so drag-drop of one or many files works with no browser. Optional later: Node SEA single-exe per tool (bigger download, no Node needed).
Witness: **W-DROP-1** installed-manifest launch with a file → `tools/<name>` receives the same bytes (§-log byte count + hash). **W-DROP-2** each D2 stub on a sample IFC exits 0 and output hash == W-CLI-1 hash. Both INCONCLUSIVE if 0 files reached the tool.
Order: D2 first (works everywhere, trivial), D1 after the browser page exists.

### Installers live IN bim.html (user 2026-10-09)
A pill "Install" (drawer) lists, per tool: **[Add to desktop]** and **[Download toolkit]**.
- **Add to desktop (D1):** page swaps `<link rel=manifest>` to that tool's manifest, then fires the browser's `beforeinstallprompt`. One document = one manifest at a time, so the swap is per click. Unsupported browser → button hidden, not broken.
- **Download toolkit (D2):** zip built IN THE BROWSER (no server): `bim-cli.js`, `tools/*.js`, the per-tool launcher stubs (.bat / .command / .desktop), a README with the one-line `npm i web-ifc`. Reuses `viewer/lib/FileSaver.min.js`; ⛔ zip lib not yet chosen (none seen in `viewer/lib` — check `exceljs.min.js` bundle or add JSZip pinned).
- Stubs are generated from ONE tool table (key, name, module) — the same table that drives the pill rail and key map, so adding a tool adds its icon, key and launcher with no extra edits.
Witness **W-INST-1**: generated zip lists exactly one stub per tool in the table (count == table rows; INCONCLUSIVE if table empty). **W-INST-2**: unzip → run a stub under plain node on a sample IFC → exit 0.

### Pin from the pill (user 2026-10-09)
Right-click a tool pill (touch: long-press) → small menu: **Pin to desktop** · Options · Download launcher. This replaces the separate Install list as the main path (the Install pill stays as the all-tools view).
- **Pin to desktop** = the D1 install for THAT tool (manifest swap + `beforeinstallprompt`, fired from the menu click, which counts as the required user gesture). The browser then shows its OWN confirm ("Install … ?"); a page cannot skip it or create a desktop shortcut silently. Our menu text says "Pin to desktop" and the result line reports the browser's answer (installed / dismissed / unsupported).
- Unsupported browser → entry becomes **Download launcher** (D2 stub for that one tool).
- Long-press formerly meant "options drawer" (§3b); it now opens this menu, with Options inside it — one gesture, one place.
- Pinned state remembered per tool (`localStorage`, try/catch) so the pill shows a pin mark.
Witness **W-PIN-1**: menu click calls the install flow exactly once for the right tool's manifest (§-log tool id + manifest URL); **W-PIN-2** unsupported path yields the stub file, not a silent no-op.

### Pin panel with ticks (user 2026-10-09) + OS support
Pin opens a panel: tick tools, OS preselected from the browser (changeable), one **[Create]** → ONE zip with a launcher per ticked tool + the shared `bim-cli.js`/`tools/`. This is the D2 route and is the right home for multi-select. The D1 install (browser app icon) can NOT be multi-ticked: the browser allows one install prompt per user click, so it stays per-pill (right-click) — ticked D1 would need N clicks.
| OS | Launcher | Drop-a-file works? | Known catch (all UNTESTED — W-OS-1..3 must prove) |
|---|---|---|---|
| Windows | `.bat` → `node bim-cli.js <tool> %*` | yes, dropped files arrive as arguments | needs Node installed; generic icon (custom icon needs a `.lnk`) |
| Linux | `.desktop`, `Exec=node … %F` | file-manager dependent | zip must carry the exec bit; some desktops require "Allow launching" once |
| macOS | `<Tool>.app` folder (Info.plist + droppable script, AppleScript-style `on open`) — NOT a bare `.command`, which takes no drops | yes if built as .app | unsigned download is quarantined by Gatekeeper → first launch right-click → Open; needs Node installed |
Fallback for all three, no Node needed: Node SEA single executable per tool/OS (bigger download; built in release CI, not in the browser). ⛔ decide if wanted.
Witness: **W-OS-1/2/3** per OS — run the generated launcher with a sample IFC, exit 0, output hash == W-CLI-1. Only the OS actually run may print PASS; the others print INCONCLUSIVE (this machine is Linux only → Win/Mac need the user's or a CI runner).

### RECOMMENDATION — least hassle, two tiers (2026-10-09, supersedes the OS table as the default path)
**Default path = installable web app (D1), not launcher scripts.** Reason: Chrome/Edge install it the same way on Windows, Linux and macOS; no Node, no `.app` wrapper, no Gatekeeper warning, no exec-bit problem; works offline; file never leaves the machine. Fallback for any browser (Safari/Firefox, or no install): open `bim.html` and drop the file on the page — same tools. The D2 launcher zip + CLI becomes the **Advanced** door (batch folders, CI, scripts), for people who already have Node.
| Tier | Tools | Behaviour |
|---|---|---|
| **Easy** (drop = run, zero options) | Upgrade→4.3 · Extract item · Split · Merge · Health report · IFC→Excel | defaults only; `name_<tool>.ifc` beside input |
| **Advanced** (options behind pill menu / CLI flags) | Slim + re-fit + smooth + material fill (tolerances) · Fill 4D/5D (locale, overwrite rules) · IDS check · batch/folder mode · CLI + launcher zip | |
Pin panel therefore offers: Easy tools pre-ticked, Advanced unticked, and a single "Install" per tool for D1; "Download launchers" only inside an Advanced section.
Skip for now: Node SEA single-exe (extra CI per OS, three signing/quarantine problems, for little gain over the PWA).
⛔ UNVERIFIED before building: Chrome `file_handlers` support on macOS and Linux — read current Chrome docs and prove with W-DROP-1 on this Linux box first.

### Windows must work (user 2026-10-09) — how it is PROVEN, not assumed
This box is Linux; no Windows here. No workflow in `bim-ootb/.github/workflows/` runs on Windows today (grep `windows-latest` = 0). So: add a `windows-latest` job (GitHub-hosted runner, free for public repos; ⛔ confirm the repo's Actions minutes/visibility) that runs, on every tool PR:
- **W-WIN-1** CLI under Windows Node on the sample IFCs: exit 0, output hash == the Linux hash (same bytes both OS = no CRLF/path drift in the core).
- **W-WIN-2** the generated `.bat` launcher run with a path containing spaces and a drive letter (`C:\Users\x y\a.ifc`), several files at once: each yields `name_<tool>.ifc` beside its input.
- **W-WIN-3** Chromium (Playwright) on the Windows runner opens `bim.html`, drops a sample IFC on the page (the all-browsers fallback path), downloads the result, hash == Linux.
Known Windows traps to code for up front: `.bat` must have CRLF endings; output name must strip `.ifc` case-insensitively (`.IFC`); never build paths with `/` concatenation (use `path`); 260-char path limit on long project folders; Defender/SmartScreen may warn on a downloaded `.bat` (unsigned) — README says so.
**Cannot be proven by CI:** dropping a file on the INSTALLED desktop icon (OS shell integration). That one check is the user's, once, on their Windows PC: W-DROP-1 prints INCONCLUSIVE on CI. I will not report it PASS from the runner.

### Prior art / best practice (from model knowledge, NOT yet re-fetched — cite-check before relying)
- **One-task-per-file-drop** is a mature pattern: web tool-per-page suites (iLovePDF, Squoosh), Photoshop droplets, HandBrake presets, and in our own field **IfcOpenShell `ifcpatch` — one recipe = one task, CLI** (closest prior art; borrow its recipe naming and arg style so users of it feel at home).
- **OS-native "right-click a file" is the standard way for single-task file utilities**, better than desktop icons: Windows Explorer **Send to** folder (`shell:sendto`, a plain `.bat`/`.lnk` — no registry, no admin) or registry shell verbs; macOS **Quick Actions / Services** (Automator); Linux file-manager scripts / `.desktop` Actions. User never opens an app — right-click the IFC → tool. ⛔ Add as a third door: the toolkit installer drops launchers into `shell:sendto` (Windows) / `~/Library/Services` (Mac) / `~/.local/share/nautilus/scripts` (Linux).
- **Browser:** PWA `file_handlers` + `launchQueue` is the documented API for "open this file type with my installed web app"; File System Access API lets the tool save beside the input (Chromium only).
- Principle kept from all of these: defaults-only, original untouched, output beside input, a one-line report.

### Two run modes (user 2026-10-09)
| Mode | Tools | What drop does |
|---|---|---|
| **BACKGROUND** (no UI) | Upgrade, Fill 4D/5D, Slim/smooth/material, Merge, Health, IFC→Excel, IDS | Runs headless (Node CLI / launcher / installed app minimised); result beside input; desktop notification or one-line console "done". Browser never opens. |
| **INTERACTIVE** (needs eyes to pick) | Extract item, Split (choose storeys/classes) | Opens the browser on `bim.html` with THEIR model already loaded and rendered; user picks; **Export** saves the new IFC. |
Interactive launch path: launcher runs `node bim-cli.js open <file.ifc>` → starts a tiny static server bound to `127.0.0.1` on a free port, serves `bim.html` + libs + that one file, opens the default browser at `http://127.0.0.1:<port>/bim.html?file=…`; server exits when the tab closes/idle. Reason: web-ifc's `.wasm` cannot be fetched from `file://`, so a bare double-clicked `bim.html` cannot render IFC; a localhost server removes that limit with no install. Installed-PWA path: `launchQueue` hands the file straight in, no server. Rendering reuses `viewer/lib` (three + web-ifc); no second renderer. `o` = toggle canvas in the page (in INTERACTIVE mode canvas is on by default).
Witness: **W-RUN-1** BACKGROUND tool via launcher opens zero browser processes (assert none spawned; INCONCLUSIVE if launcher never ran). **W-RUN-2** `open` serves the file, page §-logs `elements=N rendered=N` equal to the engine's count. **W-RUN-3** server binds 127.0.0.1 only and exits after close.

### Pick UI in INTERACTIVE mode (user 2026-10-09)
- **Pointer tooltip:** hovering an element shows a small tip next to the cursor: `<Class> · <Name> — click to select` (touch: tap selects, tip not needed). Source of text = the parsed IFC (class, Name, GlobalId), nothing invented. Selected elements highlight; a count chip shows "N selected · Export".
- **Search panel:** one box (shortcut `/` is Viewer-taken but bim.html is a separate page — ⛔ keep `/` or use `f`? Viewer uses `f` for Find, so `f` reuses the same finger memory: **use `f`**). Type → live list filtered over Name, Class, GlobalId, storey, Pset values; click a row = select + frame it; "select all matches" button. Reuse the Viewer's find-panel behaviour (`A.openFindPanel`) as the model for UX, but over the parsed IFC list, not the Viewer DB.
Witness: **W-PICK-1** hover over element id X → tooltip text equals the engine's `<Class> · <Name>` for X (§-log both). **W-PICK-2** search "IFCWALL" count in panel == engine count of that class (INCONCLUSIVE if 0 in model). **W-PICK-3** select via panel then Export → output GlobalIds == selected (+declared deps).

### U9 — Library (LOD400) from our OCI  (NEW, user 2026-10-09; was not listed)
Pill **Library**: browse/search LOD400 parts held in our OCI bucket, pick one, get it as IFC.
- Source: bucket base already used by the apps (`viewer/config.js` L21 `A.PROD_BASE`, `objectstorage.ap-kulai-2…/b/bim-ootb/o/`); catalog = one `library/index.json` object listing `{id, name, class, discipline, bytes, sha256, ifc}` per part. Seed content that exists today: `bim-ootb/IFC/LOD/*.ifc` (4 LOD400 files + README: CCTV camera, power meter, CO2 sensor, PV module). Modeller already has a library loader (`modeller/bonsai_library.js`) — read it first; reuse its catalog shape if compatible, do not make a second one.
- Actions per part: **Download** (the .ifc as is) · **Insert into my IFC** (merge engine U4: remap ids, NEW GlobalIds so no duplicates, place at picked point or storey origin, attach to chosen storey via containment) · later **Replace selected with this** (class-matched swap).
- Search panel = the same `f` panel as the pick UI, scope toggle "My model | Library".
- Offline: fetched parts cached (Cache Storage); works from cache with no network. Fetch only on user click — nothing is uploaded, ever.
- OCI upload of catalog/parts is NOT done by this feature; it follows `deploy/OCI_UPLOAD.md` §RULES (diff first, `--content-type` on every put, `scripts/oci_patch_gate.js`) and needs the owner's go.
- ⛔ Licence: the 4 seed parts are manufacturer/NBS-sourced (file names say so) — redistribution terms must be checked per part before they go in a public bucket; catalog gets a `licence` field, blank = not publishable.
Witness: **W-LIB-1** downloaded bytes sha256 == catalog sha256 (INCONCLUSIVE if catalog empty). **W-LIB-2** Insert → output has 0 duplicate GlobalIds and part's element count == catalog count. **W-LIB-3** second open with network blocked still lists + inserts cached parts.

## 4. Engine decision (one, not a menu)
One shared core: web-ifc parse → entity graph in memory → closure-select → STEP re-write. U1/U2/U3/U4/U5 are all "select/transform a subgraph, re-emit STEP". Build the closure-select + STEP writer ONCE (U2 first); everything else is a mapping layer on top. Writer reuses `ifc_export_worker.js` STEP helpers (GUID encoding L22) instead of a second writer.
Memory: log verts/heap per PERF BUDGET; large files (KUL070 2 GB case) stream-parse — cap and say so.

## 5. Build order
U2 (engine + extract) → U1 (upgrade) → U1.2 (infer) → U3 → U6 → U5 → U4 → U7 → U8. Each: witness claim written first, headless run on `bim-ootb/IFC/Duplex_ARC.ifc` + `SampleHouse_ARC.ifc` (IFC2x3 samples — confirm schema header first), log read, then next.

## 6. Open (needs the user)

- ⛔ bSI Validation Service verdict for U1 needs owner login (W-UP-4).

## 7. BUILD LOG (2026-10-09) — slice 1 built, in `bim-ootb` branch `feat/bim-utility-knife` @72bc4b55 (pushed, no PR, not on main/Pages)
**Design change vs §4: the engine is a pure-JS STEP text engine (`bim/tools/step.js`), NOT web-ifc.** No wasm, no deps: same files run in Node and as classic `<script>`s. web-ifc is used ONLY to draw the model in the interactive view.
Built (tool table `bim/tools/table.js`): `u` Upgrade (IFC2X3 + IFC4 → IFC4X3_ADD2, attribute map GENERATED from the EXPRESS schemas by `bim/gen_upgrade_map.py`), `e` Extract, `k` Split by storey, `6` Health. Shell: `bim.html` (pill rail, drop = run, `o` toggle, `f` search, `?` keys, right-click pin menu, drag-a-pill-out) + `bim-cli.js` (+ `open` = loopback server → browser).
Witnesses run 2026-10-09 on `IFC/Duplex_ARC.ifc` (IFC2X3, 38,898 ent.) and `IFC/SampleHouse_ARC.ifc` (IFC4, 47,309 ent.), logs read:
- W-UP-1 accounting in==accounted (both) · W-UP-2a re-parse IFC4X3_ADD2 · W-UP-2b IfcOpenShell validate: Duplex 0→0, SampleHouse 15→15 (source already had 15; upgrade adds none) · W-UP-3a 0 GlobalIds lost · W-UP-3b health metrics before==after.
- W-EX-1/2/3 selected==written, GlobalIds kept, 0 dangling · W-EX-4 IfcOpenShell: 0 errors (SampleHouse IFCMEMBER inherits the source's 15) · W-SPLIT 4 / 2 storey files, 0 errors · W-CLI-1a/b Node CLI == browser-loaded scripts, byte-identical (sha256 match).
- Page (headless Chromium, software GL): W-RUN-2 215 elements rendered, all known STEP ids · W-PICK-1 hover tooltip text exact · W-PICK-2 search IFCWALL 57 == engine 57 · W-PICK-3 export 58 picked, 0 GlobalIds missing, file saved beside input · W-RUN-3a loopback bind · 0 page errors · W-DRAG-1 drag payload name+content.
- W-WIN-2 launcher stub from a folder with spaces, `.IFC` upper-case, 2 files: PASS **on Linux**.
Findings worth knowing: (1) Upgrade drops 28 `IfcRelSpaceBoundary` virtual boundaries in Duplex — 4.3 requires a building element they never had; counted in the report (`requiredEmpty`), not invented. (2) A door/window extract needs its placement FLATTENED (it is placed relative to a wall that does not travel; `IfcLocalPlacement.PlacesObject` is [1:1]) — 14 doors / 24 windows handled, validated. (3) `IfcPresentationStyleAssignment` no longer exists in 4.3 (267 / 54 dissolved into their `IfcStyledItem`).
NOT built / NOT proven: Windows + macOS runs (workflow `bim-tools.yml` written, never executed — push to a PR to run it; `.bat` CRLF path untested) · installed-app icon + `file_handlers` (no per-tool manifests yet) · launcher ZIP · standalone single-file `bim.html` (file:// view shows a message) · U1.2 fill, U4 merge, U5 slim/smooth/material, U7 Excel, U8 IDS, U9 library · OS-level drop of a dragged-out pill (W-DRAG-2, owner check once per OS) · key `?` conflict check done only in bim.html.
Not yet checked: IFC4X3 as a SOURCE (returns INCONCLUSIVE by design); enum-value drift 2X3→4.3 beyond what IfcOpenShell flagged on these two files; big files (>100 MB) — the parser holds the whole file as a JS string.

## 8. BUILD LOG — Toolkit zip (2026-10-09, bim-ootb feat/bim-utility-knife)
`bim/tools/zip.js` (own STORE writer, fixed timestamp => deterministic, Unix mode bits so launchers keep 0755) + `kit.js` (bim-cli.js, 7 tool modules, one launcher per ticked tool, README.txt, SHA256SUMS.txt); `bim.html` Toolkit pill / key `9`; `node bim-cli.js kit [tools] --os win|mac|sh`. Kit is ~0.45 MB, readable JS only, no network calls. Witnesses (Linux, logs read): W-KIT-1 page-built zip == CLI-built zip (same sha256) · W-KIT-2 python zipfile.testzip clean · W-KIT-3 launchers 0755 / sources 0644 · W-KIT-4a `sha256sum -c` all OK · W-KIT-4b extracted launcher ran on a file with a space in its name.
Bug the test caught: first kit omitted `kit.js`/`zip.js` while `bim-cli.js` required them at load -> made the require lazy (only the `kit` command needs them).
Security (unverified on real OS): Windows Mark-of-the-Web / SmartScreen on `.bat`, macOS Gatekeeper on `.command`, no signing possible for `.bat` — README carries the Unblock / Open Anyway steps (W-KIT-5 INCONCLUSIVE until an owner checks once per OS). macOS `.command` cannot take a dropped file: README says use the terminal line; a droppable `.app` wrapper is NOT built.

## 9. BUILD LOG — Windows + macOS proof via GitHub-hosted runners (2026-10-09, bim-ootb `feat/bim-utility-knife` @a21a66f2, run green)
`.github/workflows/bim-tools.yml` runs on ubuntu / windows / macos: job **engine** (W-UP, W-EX, W-SPLIT, W-CLI-1a, IfcOpenShell oracle, launcher from a path with spaces + upper-case `.IFC`, kit zip) and job **page** (headless Chromium: W-RUN-2, W-PICK-1..5, W-RELOAD-1/2, W-DRAG-1). All 6 jobs green on the last push. This replaces "untested on Windows/Mac" for everything a runner can exercise.
Real defects the Windows/Mac runs found (all fixed): (1) my test's `cmd /c` quoting broke on a `.bat` path with spaces — needs `cmd /d /s /c "…"`; the `.bat` itself was fine. (2) The launcher saved the export non-atomically; a reader saw a half-written file — now write-then-rename. (3) A machine with no WebGL threw an uncaught error — now falls back to the search list. (4) Page-load timeouts on slow shared runners (witnesses now allow 120 s). Earlier, from the user's own log: Export threw when the launcher's local server had closed — now falls back to a download; and tests were opening tabs in the user's real browser (`BIM_NO_OPEN=1`).
STILL NOT PROVEN (needs a person at a real machine, once): Explorer drag-drop of an IFC onto the `.bat` icon · SmartScreen / Mark-of-the-Web prompt on the downloaded zip · macOS Gatekeeper (and macOS cannot take a file dropped on `.command`; no droppable `.app` built) · drag a pill onto a real desktop · a real GPU (CI uses software GL) · Edge/Safari/Firefox (CI = Chromium only).
Handoff note for the Windows user: install Node 18+, unzip (Unblock first), drag `.ifc` files onto `BIM_upgrade.bat`; results appear beside each file; a desktop notice says done.

## 10. DECISION (user, 2026-10-10) — U9 Library moves to the MODELLER; BIM Tools stays lite
> User: pick items from our library (component/mesh DB on OCI) and drop them into a scene "should go to the Modeller side as this breaks our keep-this-lite doctrine."
Agreed and recorded: **U9 is NOT a BIM Tools feature.** BIM Tools = single-job, stateless, drop-a-file-get-a-file (no scene, no placement, no catalog). Placing library parts into a scene is authoring = Modeller.
What already exists there (read 2026-10-10): `modeller/bonsai_library.js` — "Insert library component @ LOD" (one signed GEOM_INSERT op-row per placed part; LOD-200 box proxy / LOD-300 real mesh); CATALOG today = **3 fixture components** (Column, Beam, Door) extracted from `library/component_library.db`; the full **23,888-row** DB via httpvfs range-load is named in that file as "the production follow-on" and is NOT built. So the Modeller lane = (1) serve `component_library.db` from OCI (OCI_UPLOAD rules; owner's go), (2) browse/search panel over it (same `f` search idea), (3) insert into scene, (4) licence field per part. The four `IFC/LOD/*.ifc` files are samples only (single manufacturer products on an empty site/building/storey) — useful to show Upgrade/Extract on a tiny file, not a library.
Nothing to build in `bim.html` for this. Next step lives in the Modeller prompts (`prompts/MODELLER_MASTER.md`).

## 11. web-ifc → three.js MAPPING — what was MEASURED here, and what was NOT (2026-10-10; user: "to map to THREE.js is not something an LLM knows")
Taken as a fair challenge: the generic tutorial path (`StreamAllMeshes` → `GetGeometry` → position+normal from the 6-float vertex array, `flatTransformation` → `mesh.matrix`, `color` → material) is what `bim.html` uses and it renders the Duplex. But the FIRST version was wrong in a way only a measurement caught — see below. Everything here is from the page's own `§BIM_*` logs and the witnesses (`bim/tests/witness_bim_camera.js`, `…_page.js`); nothing is from memory.
**Measured on `Duplex_ARC.ifc` (IFC2X3, 307 products):** 728 meshes for 215 rendered elements (≈3.4 placed geometries per element), 26,774 triangles, `COORDINATE_TO_ORIGIN:false` as in `viewer/import_worker.js`. **web-ifc's output is already Y-up:** area-weighted |normal| of floors/roofs is 0.949 on Y in the meshes' own matrices (`§BIM_UP axis=Y rotated=no shares=0.04/0.939/0.022` after the fix). The first build rotated the group −90° about X ("IFC is Z-up, three is Y-up") and laid the building on its back (floors 0.939 on Z) — the user saw "not sky-up" and orbit stopping at a "border" because OrbitControls clamps relative to Y. The page now MEASURES the up axis from the floors and rotates only if needed (`§BIM_UP`).
**Colours:** taken as given (`pg.color` → `MeshStandardMaterial`, opacity from alpha, `DoubleSide`); selected items override colour and draw with `depthTest:false` so they show through walls. The upgrade tool keeps colour by folding IFC4.3-removed `IfcPresentationStyleAssignment` into each `IfcStyledItem` (267 dissolved on the Duplex); the extract tool re-adds `IfcStyledItem` / `IfcMaterialDefinitionRepresentation` for items outside the closure.
**NOT covered, and where the baseline's hard-won work lives instead:** one `Mesh` per placed geometry (no instancing, no welding, no smooth normals, no DLOD, no eviction); never tried above 307 items / 26 k triangles; the memory model in CLAUDE.md §PERF BUDGET (≈0.17 GB per million vertices; JELAPANG 22 M verts) is not applied here — the page auto-draws only files under 60 MB and says so. Colour management / transparency sorting / texture handling were not examined. Treat this page as a small-model viewer; for anything big the Viewer's pipeline (`viewer/streaming.js`, `effects.js`) is the owner.
**Correction to the pointer above (user 2026-10-10: "in other repo bim-compiler"):** the IFC→three mapping knowledge and its failure history live in THIS repo (bim-compiler), not only in bim-ootb's `viewer/`: `prompts/GEOMETRY_TRUTH_CHAIN.md` (391 lines — the 2026-07-01 "scar": the Modeller drew every element as a 12-triangle box while real meshes sat unread in the same DB and all 32 witnesses stayed green, because a box satisfies counts/bbox/pixel checks identically), `prompts/MODELLER_RENDER_MATERIAL_PARITY.md` (material/colour parity), `scripts/extractIFC2DB.js` (746 lines; the web-ifc extractor, geometry stored as `component_geometries` keyed by `geometry_hash`), `deploy/dev/import_worker.js` + `deploy/dev/scene.js` (the dev loader/scene). Read those BEFORE changing how `bim.html` draws. One lesson applies to this page directly: its render witnesses (`§BIM_RENDER meshes=728 … tris=26774`) never asserted fake-vs-real. The cheap tell is triangles per mesh: 26,774 / 728 = 36.8 on the Duplex, above the 12 of a box, so real geometry reached the scene here — but no witness asserts it, so a regression to boxes would pass. Open item: add `tris/mesh > 12` (and a box-count of 0) to `witness_bim_page.js`.

## 12. DOCTRINE + NEXT TIME (user, 2026-10-10)
**Lite means lite.** GPU instancing, welding, DLOD, eviction, streaming = the VIEWER's job, never this toolkit's ("this is purely simple light"). `bim.html` stays a small-model viewer (§11). Only CORRECTNESS fixes against the baseline's lessons go in, and only when small. Done this round: far-from-origin rebase (same 10 km rule as bim-compiler `deploy/dev/import_worker.js`; display only) and a real-geometry-not-boxes witness. Correction to my earlier open item: the witness rule is NOT "zero box-like meshes" — plain walls/slabs are legitimately 12 triangles (Duplex: 47% box-like, 36.8 triangles/mesh); the fake signature from `GEOMETRY_TRUTH_CHAIN.md` is 100% boxes.
**NEXT TIME — semantic inference from CivilWorks (U1.2, user: "we just have semantic inferring from our CivilWorks which we can put in").** Where it is already written down (found 2026-10-10; it was NOT in this file until now): `docs/BrowserScaleBenchmark.md` §IFC43 "Novel art" + table "inferred today (IFC2X3 proxies) | read directly in IFC4.3" — discipline from the file name (CIVIL_DISCS), route + chainage from geometry, phases + trade order, junctions from signal psets, JKR sign codes, per-stretch quantities, uncertain items tagged SPECULATIVE; and in code `bim-ootb viewer/import_worker.js` §IMPORT_DISC / §IMPORT_FLOWTERM_SPLIT (discipline inferred from IFC class, + element name for the abstract IfcFlowTerminal; the tally is logged). For the Toolkit the light version = a BACKGROUND tool that WRITES the inferred meaning back into the IFC (a `Pset_BIMOOTB_Inferred` with Source + Basis per value, nothing overwritten, blanks counted — rules in §3 U1.2), reusing the same rule tables, no new inference logic. Spec the witness claims first (filled + skipped + blank = total; zero pre-existing values changed; INCONCLUSIVE when nothing matched).

## 13. STATUS AT CLOSE (2026-10-10) — read this first when resuming
**LIVE (all merged to bim-ootb main, PRs #1960–#1970, last verified on github.io):** `bim.html` (+ `bim-cli.js`, `bim/**`): Upgrade→IFC4.3 (U), Extract (E), Split by storey (K), Health (6), search (F), toolkit zip with per-OS launchers + INSTALL script (9), upright scene on a ground grid, free camera, selection never moves the view, persistence across reload, "nothing armed after refresh" (click again / Esc clears), opening progress panel, red-pill + manual corner icons, rebase of far-from-origin models. Manual: https://red1oon.github.io/BIMCompiler/BIMToolsGuide/ . Film: `~/Videos/BIM_Tools_narrated_chapters_AFTER.mp4` (witness entry in FILM_NARRATION.md §BIM-TOOLS FILM). Tests: `bim/tests/witness_bim_*.js`, CI `bim-tools.yml` on ubuntu/windows/macos (green at last push).
**DECIDED — do not re-open without a failing case (user):** the toolkit stays LITE. No instancing / scalability / large-file gating ("wait until something breaks"; the Viewer owns scale). Merge of many IFCs = the Viewer's job (est. 150–200 lines if ever done here; the Viewer's DB→IFC export is mesh-built and drops psets). Opening a Viewer `.db`: NOT built; if ever, "list + pick + export picks" (est. 60–80 lines, +30–40 for `element_psets`); converting a whole CW-size DB to IFC text does not fit (≈983 M chars estimated vs the ≈537 M browser string limit; CW DB = 7,839 unique shapes, 22.05 M vertices, 262,559 psets).
**NEXT (user said "next time"):** U1.2 semantic inference from CivilWorks (§12). **Open, needs a person at a real machine:** drop-onto-icon in Explorer / Finder, SmartScreen + Gatekeeper prompts, real GPU, Edge/Safari/Firefox, a 200+ MB file's timing (the user opened a 200 MB CW bridge OK; the progress panel's behaviour on it is unobserved). **Pin to desktop** (PWA install) cannot work: `bim.html` has no manifest or service worker.
**Cross-session:** accepted (via peer relay, user to confirm) the bim-ootb mechanics for the SQLite-parity agent's ERP port — draft PR only, never auto-merge (CI re-arms it); nothing started until their patch set exists.
