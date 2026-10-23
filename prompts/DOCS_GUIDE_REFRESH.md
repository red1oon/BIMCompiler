# ⚠ DO NOT REMOVE — Published user-guide refresh (screenshots + instructions)
Scope: walk every published user guide under `docs/` against the LIVE app, re-capture its screenshots,
and record each instruction that is broken or changed. **Read the capture log after every run — exit code is
not evidence.** Honour this block until the table below is all `✅` or `⛔`.

Started 2026-10-24 · worktree `/tmp/wt-docs-refresh` · branch `docs/guides-refresh-2026-10-24` off `origin/master 39f998301`
(the `fable/meshdb-livewire` checkout is 49 commits behind master and its `docs/` has diverged — never refresh from it).

## Spec
1. **Source of truth = the live app.** Each guide step is executed by a script (puppeteer, headless, `GPU=sw` —
   software GL, so it cannot contend for VRAM with the user's own browser). The page may quote only values the
   app reported into the capture's JSON report (`§DOCS_*` lines). No hand-typed numbers.
2. **A step passes** when its precondition selector/state exists AND the app-reported value matches the guide
   text. **Changed** = step works but the guide's number/label/wording is stale → fix the text from the report.
   **Broken** = selector missing / action does nothing / error → recorded here as `⛔ BROKEN: <step> — <observed>`;
   the guide is NOT silently reworded around a defect (the fix belongs in the app, TWIN/AD-LAYER rules apply).
3. **Screenshots are the deliverable, not the evidence.** Evidence = the `§DOCS_*` values + DOM/state asserts.
4. Re-capture only when the step ran. A step that failed keeps its old image and is flagged `STALE-IMG`.
5. No deploy from this lane without `scripts/safe_gh_deploy.sh` (see `prompts/DOCS_DEPLOY_POLICY.md`); this lane commits to
   the branch and pushes it, nothing more.

6. **Code-pattern note, in tandem, never a detour (user, 2026-10-24).** When a step makes me read source to find
   its selector/owner, record in the findings log one line: `CODE <step> → <file:line owner>`; add `SPAGHETTI?` only
   for what is visible from that read (two implementations of one responsibility, a dead/duplicate handler, a
   guide step whose behaviour lives in a per-window special case). No extra reading, no audit, no refactor — a
   note that would need its own investigation is dropped, not chased.

## Status (one row per guide; update in place)
| Guide | Imgs | Capture script | Status |
|---|---|---|---|
| AskFirstSteps | 9 | `scripts/docs_capture_ask_first_steps.js` | ✅ 2026-10-24: 9/9 re-shot, all 9 steps ran, 0 pageerrors; 1 text fix (schedule 122→123 days, labour 1,721,750→1,721,743) |
| USER_GUIDE | 1 | — | ☐ |
| BIMToolsGuide | 1 | — | ☐ |
| BIMUserGuide | 26 | `scripts/docs_capture_bim_user_guide_{a,a2,b,c1,c2,c3,c4,d,e}.js` + `docs_capture_lib.js` + `docs_capture_run.sh` | ✅ 2026-10-24 — text rewritten from the live app; 17 images re-shot (hub, rail/drawers, Find, Palette, Settings, Share, histories, Room→Type/highlight/Path, Fly Tour, Film-Maker panel); 7 flagged as earlier-build/history (4 Film-Maker interactive, 3 Hospital route); 2 ⛔ app defects + 1 UX defect logged to owner prompts; not re-checked: Terminal route, Quick-Start step 5, elevation/roof rows (marked unverified) |
| ModellerFirstSteps | 38 | — | ☐ |
| ModellerGuide | 47 | — | ☐ |
| DXF2BIMGuide | 14 | — | ☐ |
| ERPUserGuide | 14 | — | ☐ |
| ERP_FirstSetup | 4 | — | ☐ |
| HRBIMAssetGuide | 17 | — | ☐ |
| CivilWorksGuide | 7 | — | ☐ |
| TeamsOverlayGuide | 4 | — | ☐ |
| TimeMachine | 7 | — | ☐ |

Text-only guides (no screenshots, still instruction-checked): OFFLINE_INSTALL_GUIDE, IFC_ExportGuide.

## Findings log (dated, newest last)
- 2026-10-24 inventory: all 13 guides' image refs resolve (0 missing files). Live endpoints (front door, viewer,
  Terminal_extracted.db on OCI) answer 200.

### BIMUserGuide — findings so far (2026-10-24; Duplex / HHS_Office_Federated, live site, GPU=sw; reports under `scripts/docs_capture_bim_user_guide_*.report.json`)
Harness: `scripts/docs_capture_lib.js` + `docs_capture_run.sh` (retries a DEGRADED run: this machine gets `ERR_CONNECTION_RESET` on
random script loads — files return 200 from curl — so any run with a reset/`§LOAD_FAIL` is discarded, never installed).

**BROKEN (guide step cannot be done as written; app defect, not reworded away)**
- ⛔ BROKEN `Find box: typing a space` — a real Space keydown inside `#find-name` is `preventDefault`-ed, so "count doors" from a
  keyboard becomes "countdoors" (measured: typed `a b` → value `ab`; sendCharacter(' ') works). Evidence: `§PANEL_FOCUS id=find` at
  open, then `§KBD_ROUTE panel=find key=<space>` per space. CODE `scene.js:3550-3558` (panel-focused key block, dated 2026-05-23):
  arrows/Space/Enter/Home/End/Ctrl+A are routed to the panel with **no `notInput` guard**, unlike the Tab (3541) and shortcut
  (3595) branches. Every multi-word Find query is affected. SPAGHETTI? one key router, three branches, only two guarded.
- ⛔ MISLEADING `Phase axis, first open` — shows "Timeline unavailable (generator not loaded)." while the generator is running
  async (`§PHASE_LENS … generator running async (chunk-yield); reopen to load`, then `async-done ok=true`). The guide's "Timeline
  generating…" message never shows. CODE `nf_trees.js:622-640` (`_buildPhaseTree` treats every null as "not loaded").

**CHANGED (guide text stale; fix from the report)**
- Hub: new **➕ Blank Viewer** card ("Open your own .db file"); city/landmark counts match the guide's table (hub manifest).
  Duplex: hub says 1,169, the viewer's status line says 1,119 (elements_meta) — Δ50 unexplained, flagged not reworded.
- Toolbar: the guide's "Toolbar buttons (top-right panel)" and "Panels" tables describe the pre-pill UI. At load only the status bar
  shows; controls are the ⋯ rail (Save, Open, Navigate, Inspect, Palette, Camera/View, Share, Settings, Help, 4D Window).
- Navigate drawer: now Find / Navigate · f, **Role View · r**, World History · w, Page History · z, Home, **Fly Tour · l**,
  **Nav LOD (large bldgs) · o** (guide: 4 rows + mobile Walk).
- Inspect drawer: 6 rows — Measure m, Clash Matrix c, X-Ray/Bbox, Section Cut x, Time Machine t, 4D/5D 4. **Fly Tour left it** (guide: 7).
- Camera / View drawer: 4 rows — + **GI Preview (AO) · Alt+G** (guide: 3).
- Palette: new icon row (Still Refine Alt+S, Populate Alt+P, Cinema Orbit); first slider is "Color Studio" (guide: "Ambience");
  Shadow+Ground cycles Off → **Earth → Grass** → Paved (guide: Grass → Earth).
- Settings → Edit Project JSON: **8** files (adds Road Standards (ATJ sign table), Civil Labels (road route / stops)); guide: 6.
- Find axes: Duplex 1/5 … 5/5 (Storey, Discipline, Room, Material, Phase) — **the Parts axis is RETIRED** (`nf_trees.js:466`,
  §ROOM_LENS_TAXONOMY 2026-07-15). Stairs / Lift Shaft / Plant Room now sit under **Room → Type**. HHS Room→Type: INTERNAL 48,
  INTERNAL_SMALL 15, SUSPECT_OPEN 7, Restrooms 2, SUSPECT_NO_DOOR 2, SUSPECT_ELONGATED 1, **Stairs 11** (guide: Stairway 20),
  Lift Shaft 3, Plant Room 1769. HHS rooms by storey: L1 25 / L2 31 / L3 19 = **75** (guide: "105 across the whole building").
- NL query: a recognised phrase now shows "Press Enter ↵" while typing (guide: no visible hint). Enter → answer in `#nlp-toast`
  ("14 — count door", Duplex); chips fire immediately: total cost → "$ 262,925 (RM 1,011,250)", show structure → 19.
- Find panel: Find | Ask tabs above the box (Ask documented in AskFirstSteps).

**VERIFIED unchanged**: X-Ray cycle Off → X-Ray → Bbox → Off; click → Info panel (Class, Name, GUID, Building, Storey,
Discipline, Material); World History card (Whole / This page, day nav, entries); Page History bar; Share card + deep link
(`#cam=…&tgt=…`); Settings has four sections (Pill Icons, Edit Project JSON, 5D Rate Pack, Cache Info).

**CODE notes**: Find panel DOM is built in `nf_ui_history.js:198-260` (file name says history, content is the Find panel).
`nlp.js:477-532` builds its own `#nlp-bar/#nlp-input/#nlp-chips` beside the Find panel's box and chips — SPAGHETTI? two query UIs
for one responsibility (not investigated further). Drawers are persistent `.bim-panel`s (`navigate-/inspect-/camview-drawer-panel`) that
Escape does not close; they toggle by tapping the master pill.

### Prompt housekeeping done 2026-10-24 (user: "update respective prompts that oversee affected functions" + "archive the stale ones")
**Archived** (`prompts/archive/*_archived_2026-10-24.md`, stale banner on top, inbound refs repointed):
`VIEWER_FIND_PANEL_PARTS_VERIFICATION.md` (subject = the retired Parts axis) · `BIMUSERGUIDE_PILL_COVERAGE_AUDIT.md` (07-12 snapshot,
superseded by this file + the capture scripts). **Kept on purpose:** `FIND_PANEL_PLANT_ROOM_GATE_FIX.md` (live code cites it —
`build/building_parts_taxonomy.js:43`; the word-boundary match is still in use).
**Owner prompts updated** (dated section appended to each): `ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md` (live Room→Type numbers, Parts retirement confirmed) ·
`BUILDING_PARTS_TAXONOMY.md` (Find-panel wiring superseded) · `PILL_DRAWER_REORGANIZATION.md` (as-shipped drawer map) ·
`Viewer/ROOM_CYCLE_HOME_SHORTCUTS.md` (⛔ Space/Enter/arrow swallowed in inputs, `scene.js:3550-3558`) · `REVIT_PLUS_LENS.md`
(⛔ Phase first-open message, `nf_trees.js:622-640`) · `Viewer/BLANK_VIEWER_LANDING_CARD.md` (guide follow-up).
Pending after the next captures: `Viewer/HOVER_NAME.md`, `Viewer/FLY_TOUR_*.md`, `Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md` (Hospital/Terminal numbers).
The two ⛔ app defects are NOT fixed here (viewer code in `~/bim-ootb`, own worktree); each owner prompt carries the fix shape and the witness to write.

### BIMUserGuide — A2 findings (Duplex; phrases, keys, Fly Tour; 2026-10-24, run clean: 0 resets, 0 pageerrors)
**Query phrases** (typed via sendCharacter — see the Space defect): count doors → 14 · how many beams → 12 · number of windows → 24 ·
total cost → "$ 262,925 (RM 1,011,250) — total building cost" (16 classes) · total area / total length of walls / total volume of slabs →
"N results — … (element count — no QTO dimensions in DB)" (as the guide says) · show structure = list structure → 19 · what disciplines →
"1,119 — disciplines breakdown" (3). **CHANGED:** `find door` → "14 — show door" + Show in 3D (guide: routes to a plain search).
**Not recognised on Duplex:** `floor area`, `floor 2 beams`, `ground floor doors` fall back to the plain-search "Did you mean…" list with no
answer (re-tested cleanly in A3 below). `cost of electrical` / `show electrical` → "No results … Available: IfcBeam, …" — Duplex has no ELEC
discipline, so this is data, not a defect; guide example stays but is now marked building-dependent.
**Keys:** F with the search box focused types "f" (panel stays open); F with focus on the 3D view closes it; × closes it. Apostrophe toggles Hover name
(checkbox false → true) ✓. **Fly Tour (L):** bar = "Aerial sweep 1 (1/10)", 0:00 / 1:25, 10 ticks, buttons ✕ ↺(restart) ◀◀ ⏸ ▶▶ 0.5x 1x 2x —
no loop button (guide said "pause/resume and loop"; the old Hospital image has none either).
**CODE:** the Film-Maker's footer `Preview` button is `display:none; aria-hidden` (`cinema_path_editor.js:1199`, "redundant now that the scrub panel's own
play/pause") — the guide still lists Preview in the button row; verified live in part E.
**SPAGHETTI?** a toast (`#nlp-toast`, nlp.js:404) carries query answers while the Find panel's own `#find-results` stays empty — answers and the panel
that asked live in two places.

### BIMUserGuide — Terminal, phrases (A3) and Film-Maker (E) findings (2026-10-24; all runs clean unless noted)
**Terminal (C3)** — 52 rooms: Aras 01 12 · Aras 02 10 · Aras 03 3 · Aras 04 3 · Aras Bumbung 1 · Aras Tanah 23. Room → Type: INTERNAL 27 · INTERNAL_SMALL 7 ·
SUSPECT_OPEN 4 · SUSPECT_NO_DOOR 8 · **Hall / Corridor 6** (new; guide said no corridor band) · Stairs 17 · Lift Shaft 5 · Plant Room 644. Guide's "59 rooms → 40 rooms,
73 rects; INTERNAL 30 / INTERNAL_SMALL 15 / SUSPECT_OPEN 22 / SUSPECT_NO_DOOR 6" no longer reproduces (rewritten; old figures kept as history). "Aras 02 R3" is
still the first SUSPECT_NO_DOOR room (list: R3, Aras 03 R2, Aras 04 R1, R2, Bumbung R1, Tanah R5, R17, R22). The old interior close-up beside the stair flight can't be
reproduced by script; replaced by an exterior capture of the same room. Load note: Terminal needs the third `openBuilding` attempt on software GL (two 240 s stalls) — the stall timeout is shorter than a normal Terminal load.
**OBSERVATION (not investigated):** the status line after a Find → Room click reads "Downloading ad_seed.db… 100% (26MB)" on both HHS and Terminal — an ERP dictionary fetch triggered by a room pick?
**Phrases (A3, toast dismissed before each Enter):** `floor 1 walls`, `floor 1 doors`, `floor 2 walls`, `ground floor doors/walls`, `floor area` → no answer (plain-search fallback) — ⛔ owner
`Viewer/FIND_NL_QUERY.md` (gate `nf_isolate_drill.js:426` lacks floor/level/ground). `total floor area` → "1,119 — storeys breakdown" (5) ✓; cost of structure $ 4,460 / architecture $ 71,847 ✓;
show mep 904, show architecture 196 ✓; `cost of mep` → no results (Duplex has no discipline named so).
**Film-Maker (E, HHS):** panel = "Cinema path — 3 bands" (settle, **exit door ×**, stop; "clear 1 stick"), reach 15 %, clip mark in / mark out / whole film, **tile grid**: Buildup (ON by default), 4D/5D
(= id `cpe-room-title`, the old "room titles"; tooltip "room name card, day counter, cost + ledger rows"), Reveal, Clash pairs, Measure, Sun compass, Storey highlight, Load path freeze,
Visual (CCTV) in freeze, Audio (RT) in freeze ("not built yet" per tooltip), Escape route; plus a **Bounce light (Alt+S look; needs WebGPU)** checkbox (ON). Silent-bake size options
this window (interactive) / 1280x720 @15fps / 1920x1080 @24fps / 2560x1440 @24fps; Day # counter top right (default) / top left / bottom right / bottom left / off; saved plans — none yet.
Footer: **Preview is `display:none`** (kept for compatibility), Cancel, "Save this path", "OK — record this".
**CODE / possible UX defect:** `cinema_path_editor.js _isEdited()` returns true whenever Buildup is ON, and Buildup now defaults ON, so the footer says "Edited — … Not saved to the building." and
OK reads "OK — record this" on a panel the user has not touched (code comment: "a currently-ON checkbox must ALWAYS produce an override"). The guide's "Unedited · OK records exactly the film the preview just showed"
and "opening the panel to look costs you nothing" no longer hold; guide rewritten to say so. SPAGHETTI? two defaults for one flag (panel `checked:true` vs `cinema_maxq.js` default false) reconciled by an always-true edited flag.
**OBSERVATION (determinism):** the derived total depends on the window — same building, same 28.5 m walk: 39.8 s / 597 frames at 1440×900, 41.9 s / 628 frames at 1440×1400. The guide says total is "derived
per building from real walk distance and pull-back distance, never a fixed number"; the window-size dependence is not stated anywhere. Not chased.
**STALE-IMG (not re-shot, flagged with a caption in the guide):** filmmaker-path-editor.png, filmmaker-walk-stick13.png, filmmaker-clash-and-bake-size.png, filmmaker-measure-storey-panel.png
(interactive 3D edits / older option sets). Re-shot: filmmaker-path-editor-initial.png (HHS, panel only).

### BIMUserGuide — Hospital (C4 first pass) and leftovers (2026-10-24)
**Hospital** loads 64,150 element rows; Find shows **4 axes** (Storey, Discipline, Room, Phase — no Material, consistent with the data gate). Room → Path list now holds "Level 1 Hall/Corridor 1…8", "Level 1 R1 / R2 / R3" and Hall/Corridors on each level —
**`≈ Level 1 R35` and `≈ Level 4 R8` (the guide's route) no longer exist**, so the quoted 124.69 m / 3 doors / 1 stair / polyPts 19 route and its three screenshots cannot be re-measured by name. Second pass picks a live route (first Level 1 R-room → first Level 4 R-room).
`§PATH_LEGAL_DETOUR_FAIL` count in the run: 0.
**Unverified rows left in the guide, now marked so:** cheat-sheet "Front / Back / Left / Right" elevation views and "Roof" plan — no rail action, no key in `window._shortcuts` (keys present: ' + - . / 2 4 = Ctrl+O Ctrl+S a b c f h i j l m n o p q r s t v w x z).
**Not checked (no deterministic route found):** "Open another building → the first pauses; tap back to resume" (Quick Start step 5); mobile-only features; Pick Walk (needs a warehouse building); HBA/Teams (own guides).

### BIMUserGuide — Room → Path (C4) 2026-10-24
Path = two selects + **Find Path** button (guide never said to tap it — added). HHS `≈ Level 1 R1 → ≈ Level 3 R2` = "5 doors · 2 stairs · 75.0m", 4 numbered stops; image `find-room-path-hhs.png`. Hospital's quoted route cannot be selected any more
(rooms recompiled; Level 1 = Hall/Corridor 1–8 + R1–R3) — three Hospital images captioned as history; Hospital graph now `nodes=30 doors=440 edges=7` (flagged in ROOM_ACCURACY as an item to examine, not concluded).
Harness lessons: a `<select>` option cannot be clicked — set `.value` + dispatch `change`; scope a pick to its own select when two lists share names; a stall timeout shorter than a large building's load wastes whole reloads (`opts.stallMs`).
