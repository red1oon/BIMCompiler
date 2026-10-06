# ⚠ DO NOT REMOVE — SCOPE: read-only split PLAN for the 5 largest bim-ootb viewer files. No code changed. Read the log after every run.

**Date:** 2026-10-06 · **Studied:** `bim-ootb` `origin/main` @ `c6038f93ed86fbf11628eaab5f570dc5ba7dc5d3` (2026-10-06), read via `git archive` (shared checkout untouched).
**Method:** line ranges by brace counting; cross-seam name use by token scan with comments stripped (UPPER BOUND — string/regex hits count); witness coverage by token index over 1,179 test/witness/poc files (12.4 MB). "Tag tested" = the `§TAG` literal appears in some test file's text (UNVERIFIED that it is *asserted*). Scripts: `scratchpad/{inv,xvar2,xmut,cov,dup,ls_probe}.py|js`.
**Prior art (read first):** `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S58 (`support_sweep.js` out of time_machine, shipped), §S59 (fleet table). Rule from there: *low witness coverage DISQUALIFIES a candidate*. **§S59 line 227 records a user ruling: `effects.js`, `cinema_path_editor.js`, `cinema_maxq.js` are a PROTECTED LANE — only pure query/util helper extraction may be suggested.** A full split of effects/cinema_maxq needs that ruling lifted by the user (UNVERIFIED whether still in force).

## Summary

| File | Lines now (S59 on 2026-08-21) | Proposed files | Largest after split | Parts with no/low witness (tag-tested ≤35%) | Main commits 30d / unmerged branches touching |
|---|---|---|---|---|---|
| `effects.js` | 11,128 (8,803) | 8 (+ thin orchestrator) | 2,835 (`_cinemaPathPlan` is ONE 2,823-line function) | 2 of 8 | 49 / 70 |
| `time_machine.js` | 10,558 (9,194) | 8 | 1,919 | 0 of 8 | 13 / 17 |
| `cinema_maxq.js` | 5,339 (1,582) | 5 (4 new + `start`) | 2,775 (`start()` is ONE 2,660-line function) | 1 of 5 | 24 / 39 |
| `navigate_find.js` | 5,330 (5,452) | 7 | 1,094 | 1 of 7 | 10 / 51 |
| `cpe_load_path.js` | 4,684 | 6 | 1,103 | 6 of 6 | 4 / 11 |

**Parts with no/low witness: 10 of 34** (list in each section). Unmerged-branch counts include squash-merged leftovers (a branch whose commits never land on `main` by SHA) — treat as an upper bound.

### Facts that shape every plan (measured)
1. **None of the five is an ES module and none shares closure scope across files.** Four are one big closure: `effects.js` = one function `setupEffects(A,...)` lines 9–11128; `time_machine.js` = one IIFE 18–10558; `cinema_maxq.js` = one IIFE 8–5339; `cpe_load_path.js` = one function `setupCpeLoadPath(A)` 48–4682 (also `module.exports`); `navigate_find.js` = IIFE 14–5330 around one `init(A,nav,…)` (`window.NavigateFind={init}` :5291).
2. **Callers are NOT the problem; closure-shared names are.** Public surface is `A.x=`/`window.x=` (effects 174 exports, cinema_maxq 132, cpe_load_path 109, time_machine 50, navigate_find 30). Moving the assignment into another file with the same name leaves every external reference valid. What breaks is names shared *between sections of the same closure* (table below).
3. **The language service cannot see the `A.*` surface.** `ls_probe.js` over `origin/main`+`jsconfig.json`: for 495 `A.x=`/`window.x=` exports it found 0 cross-file references (A is untyped); it does resolve true globals (`setupEffects` → `scene.js:467`). Inbound counts below are therefore token-grep, not LS.
4. **Shared-name census per proposed seam set** (code lines only):

| File | names declared at closure top level | used across >1 seam | of those: var written from a non-declaring seam (needs shared-state object/accessor) | prelude lines a move needs (upper bound) |
|---|---|---|---|---|
| effects | 433 | 214 | 69 | 270 |
| time_machine | 410 | 239 | 104 | 406 |
| navigate_find | 269 | 132 | 29 | 230 |
| cinema_maxq | 124 | 64 | 11 | 70 |
| cpe_load_path | 190 | 79 | 7 | 102 |

   A truly move-only split is only possible when seams cross few mutable vars: **cpe_load_path (7) and cinema_maxq pre-`start` helpers (11) are cheap; navigate_find (29) middling; effects (69) and time_machine (104) require a shared-state object — not move-only.**
5. **Mechanism that keeps moved code byte-identical:** each new file opens with a prelude `var _x = NS._x, …` (imports; read-only names only), ends with `NS._y = _y` (exports), and mutable cross-seam vars become `NS.s.name` accessors in a SEPARATE tiny commit first. **ESLint `no-undef` is the free detector for a missed seam** (a name left behind is undefined in the new file; `'use strict'` also throws at runtime). One new global (`NS`) per family goes in `eslint.globals.json` (197 entries today).
6. **Wiring per split (all five):** `viewer/viewer.html` is the only HTML loading them (lines: effects 859, cinema_maxq 865, cpe_load_path 893, time_machine 1039; `navigate_find` is lazy — `viewer/main.js` `modules[]` ~:208, NOT in html). Each new file also needs (a) `viewer/sw.js` `PRECACHE_ASSETS` (effects/cinema_maxq/cpe_load_path/time_machine are precached ~:963–1071; navigate_* deliberately are NOT — sw.js v1078 comment), (b) `CACHE_VERSION` bump (`v1589` now) in the same commit, (c) `?v=` bump in html/main.js. `tests/audit_sw_precache.js` checks script-tag ↔ precache both ways. `sw.js` is the known conflict magnet (CLAUDE.md).
7. **Source-scraping tests are the hidden cost.** Test files that `readFileSync` the target by name and slice/regex it: **effects 16, time_machine 64, cinema_maxq 17, navigate_find 6, cpe_load_path 2** (heuristic count). Examples: `erp/tests/author_captured_witness.js` slices `var _cap = (function() {` … first `})();` out of `time_machine.js`; `erp/tests/find_openlink_witness.js` extracts SQL/URL templates from `navigate_find.js`. Each moved function breaks every test that slices it. Step 0 for any split: one helper `viewer/tests/_src.js` (`readFamily('time_machine')` = concatenation of the family in load order) and switch those tests to it in a test-only commit (green before AND after). UNVERIFIED that concatenation preserves every slice (slices spanning a seam would fail).

---

## 1. `viewer/effects.js` — 11,128 lines (protected lane; see top)

**Inventory** (all inside `setupEffects`, ranges are line spans):

| Proposed file | Lines | Content |
|---|---|---|
| `fx_composer.js` | 9–467 (459) | EffectComposer/SSAO/OutlinePass, §AO_EXCLUDE, cam light/torch, car loading |
| `fx_props_staffage.js` | 468–2542 (2,075) | sparkles/skyline/photo props, staffage, occupancy grid, populate, prewarm, billboard art, `_showPhotoProps` |
| `fx_sun_shadow.js` | 2543–4259 (1,717) | sun arc, §BAKE_FILL_PIN, mirror, glossy/env reassert, still fit, edge/cascade shadows, `_enablePhotoShadows`, puddles, HDRI |
| `fx_photo_staging.js` | 4260–5174 (915) | `_applyPhotoStaging` (520), film exposure/parity, teardown |
| `fx_still_refine.js` | 5175–6660 (1,486) | still AO (`_buildStillAO` 298), ember, fixture emissive, `A.startStillRefine`…`toggleStillRefineUI` |
| `fx_cpe_reveal_bands.js` | 6661–7757 (1,097) | CPE pacing, round corners, reveal visuals/captions, bands, hose, seed, fan, gaze acquire |
| `fx_cinema_path_plan.js` | 7758–10592 (2,835) | `_cinemaPathPlan` = one function, 43 inner functions, 26 `§` banners — cannot shrink without refactor |
| `fx_cinema_orbit.js` | 10593–11128 (536) | CPE persistence, preview divergence, flyaround arc, `A.startCinemaOrbit` (legacy orbit) |

Defines: global `setupEffects`; 174 `A.*`/`window.*` assignments (84 `A.x=` at closure top level; `window.ghostXrayOn/toggleGhostXray/__tmOverlaySync/_shadowAutoUpdate/__giStillEsc`). Reads: 120 distinct `A.*` from other files, `LightLaw`, `toggleNightMode`, `toggleShadow`.

**Inbound:** `setupEffects` ← `scene.js:467` (LS-verified, 1 caller). 102 of 174 exports have ≥1 non-test consumer: `cinema_maxq.js` 27 names, `tools.js` 24, `cinema_path_editor.js` 15, `effects_gi_poc.js` 14, `sourced_light.js` 14, `scene.js` 11, `gi_still.js` 11, `main.js` 9.

**Split:** *Not move-only.* 214 names cross seams, 69 mutable (`_stillRefineRAF`, `_photoStaffage*`, `_photoSkyline*`, …). Needs `FX.s` shared-state + each part as `FX.parts.x = function(A,ctx){…}` called from a thin `setupEffects` (+~270 prelude lines). Order to extract (fewest imports first): `fx_composer` (0 imports), `fx_still_refine` (20), `fx_sun_shadow` (14), `fx_cpe_reveal_bands` (5), then the rest; `fx_cinema_path_plan` last or left whole. Load order: all part files before `effects.js` (kept as orchestrator, so `viewer.html:859` stays last of the family; `scene.js:467` call unchanged).

**Witness coverage (tag-tested/tags):** composer 12/40 **LOW**; props_staffage 37/121 **LOW** (fn 7/51); sun_shadow 59/118; photo_staging 62/100; still_refine 63/132; cpe_reveal_bands 56/74; path_plan 73/99; orbit 29/47. S59 recorded 0 witness files for effects on 2026-08-21; now 16 read it by name. Must add before moving: a surface-census witness for composer + props_staffage.

**Duplicates / dead:** no repeated 10-line runs. Dead (token appears once repo-wide): `_getSparkleTexture` (524–552, 29), `_getSkylineWindowTexture` (559–596, 38), `_cinemaThree2Ifc` (7620–7623, 4) = **−71 lines** deletable. `A.startCinemaOrbit` (10904–11128, 225 lines) is "legacy" per S59 but still has a `panels.js` fallback caller — overlap with `cinema_maxq.js` UNVERIFIED.

**Churn:** 49 commits on main in 30 d (2 authors); 70 unmerged branches with commits touching it. **Worst collision risk of the five — do last.** Growth: +2,325 lines (+26%) since 2026-08-21.

## 2. `viewer/time_machine.js` — 10,558 lines

| Proposed file | Lines | Content |
|---|---|---|
| `tm_core.js` | 20–1419 (1,400) | state, `loadOps`, `computeDays`, storyboard, DLOD boxes, sparks, GI hold, `_gsp*` |
| `tm_render.js` | 1420–2842 (1,423) | `renderAtTime` (949), frontier, broadcast, highlight/outline, `applySunCycle` (197) |
| `tm_panel.js` | 2843–3735 (893) | status, visibility, `buildPanel` (470), playback |
| `tm_sched_xray.js` | 3736–4930 (1,195) | roof load path, classify, zone index wrapper, x-ray cache, `_displayTimeline`, HR cost, 4D template, remap, midair/verify wrappers |
| `tm_gantt_build.js` | 4931–6336 (1,406) | `injectGantt` (966), `buildTaskIndex`, twin/shopfloor, variance/EVM |
| `tm_gantt_edit.js` | 6337–8255 (1,919) | ruler/resize, `retimeTaskElements`, `commitGanttDrag`, undo, baseline, `wireGanttDrag`, props, P6 import/export |
| `tm_dash.js` | 8256–8973 (718) | `drawGanttMini` (283), dashboard, donut, S-curve |
| `tm_lifecycle_api.js` | 8974–10558 (1,585) | cache, `activate`/`deactivate`, 32 `window.tm*` API functions |

Defines 50 `window.*` (`tmGetState`, `tmSetCursor`, `tmActivateForBake`, `tmOrderBySchedule`, …). Reads `ScheduleGate` (23), `CpmSchedule` (10), `LABOR_RATES`, `SupportSweep`, `GanttModel`, `ZoneIndex`.
**Inbound:** 36 of 50 exports have non-test consumers: `cinema_maxq.js` 15, `cinema_path_editor.js` 9, `cpe_storey_reveal.js` 4, `optics_hud.js` 4, `scripts/probe_gantt_*.js`, `scripts/snap_timeline.js`.
**Split:** 239 names cross seams, **104 mutable** (`_active,_mode,_ops,_cursor,_projectStart/End,_panel,…`) → needs a `TM.s` state object; `render`/`life` need 96/102 imports. Not move-only. Prior extractions already done (`gantt_model.js`, `support_sweep.js`, `zone_index.js`) were *pure* functions — the remaining pure candidates are `drawGanttMini`, `drawDashboard`, `computeSCurve`, `drawVariance` (take canvas+data) — a cheaper first slice (~700 lines) than the full 8-way split. Load order: new files between `zone_index.js`/`support_sweep.js` and `time_machine.js` (`viewer.html:1036–1039`); `time_machine.js` keeps IIFE tail + API.
**Witness coverage:** every part ≥51% tag-tested, 0 flagged (tm_core 33/65, render 32/62, panel 23/34, sched_xray 65/91, gantt_build 77/118, gantt_edit 67/103, dash 41/56, lifecycle 67/104). But **64 test files slice the source by name** (step 0 above is mandatory; e.g. `witness_gantt_*`, `witness_tm_*`, `author_*_witness.js`, `test_shop_scurve.js`). Chain witnesses named in CLAUDE.md §PRIMAL LAW 2 (`witness_gantt_edit_coherence`, `…_lock_integrity`, `witness_tm_edit_exception`) hit `tm_gantt_edit` + `tm_sched_xray`.
**Duplicates / dead:** dead (token once repo-wide): `spawnSparks` 905–924, `spawnDust` 927–952, `updateSparks` 954–978, `applyFlash` 2525–2540, `lerpColor` 2582–2589; with `initSparkMaterial` (896) and `clearSparks` (980, one call at :9547) the sparks block is unused → **≈ −120 lines**. 11 near-duplicate 6–9-line runs (≈75 lines), e.g. night-stars/moon dispose repeated in `applySunCycle` (2700–2708) and `restoreSky` (2830–2839); 8-trial ray loop in `pickClearAngle` (568–577 / 585–594). 1 cross-file run vs `schedule_author.js:94` (7 lines, `_classifyRule`, UNVERIFIED parity intent).
**Churn:** 13 commits/30 d (1 author); 17 unmerged branches (mostly `civil-*`, `fast-bake*`). Moderate.

## 3. `viewer/cinema_maxq.js` — 5,339 lines (protected lane)

| Proposed file | Lines | Content |
|---|---|---|
| `maxq_buildup_ghost.js` | 1–544 (544) | `_workPacingArm`, `_workCursorAt`, `_buildupTAt`, `_ghostGroundArm/At/Restore` |
| `maxq_infra.js` | 545–799 (255) | wake lock, status, damp, IDB (`_idb*`), random freeze, `_awaitVisible`, `_waitFoldDone` |
| `maxq_hud_layers.js` | 800–1699 (900) | film-rec install, HUD layout witness impls, draw instrument, film layers, `_cease3D`, `_drawUnlessHold`, `_hudHold` |
| `maxq_capture_stitch.js` | 1700–2564 (865) | `_captureFrame` (597), `_frameBitmap`, `_stitchMp4`, `_stitch` |
| `cinema_maxq.js` (rest) | 2565–5339 (2,775) | `start()` (2,660 lines, 10 inner fns, many banners) + `cancel` + `window.APP.*` exports |

Defines `window.APP.startMaxQualityOrbit/cancelMaxQualityOrbit/buildupCursorAt/ghostGround*…` (132 exports) and `window.__maxqBake`. Reads 173 distinct `A.*`.
**Inbound:** 49 of 132 exports consumed elsewhere: `cpe_load_path.js` 13, `cpe_resource_panel.js` 8, `cinema_path_editor.js` 7, `effects.js` 6, `cli_silent_bake.js` 6, `cpe_slab_beat.js` 4, `cpe_sun_compass.js` 4.
**Split:** the four helper files are near move-only: 64 names cross, **11 mutable** (`_active,_cancel,_fcIdx,_wakeLock,_wakeWired,_db,_hiddenMsTotal,_hiddenPauses,_unconverged,_lpUnwrappedDrawCount,_lpAlphaAtDraw`); 43 helpers are used only by `start`. `start()` itself is not splittable without a refactor — leave. Net result 5,339 → 2,775 largest. Load order: four files before `cinema_maxq.js` (`viewer.html:865`) — they define on `window.__MQ`.
**Witness coverage:** buildup_ghost 41/44 (`witness_cpe_ghost_ground`, `witness_cpe_buildup_onset_blend`); infra 15/17 (`witness_maxq_idb_deadlock`, `witness_maxq_hidden_pause`, `witness_maxq_frame_budget`); hud_layers 19/34 (`witness_findings_cease`, `witness_hud_layout_coverage`); **capture_stitch 30/88 LOW**; start 131/260. 17 tests slice `cinema_maxq.js` by name.
**Duplicates:** 2 within-file 6-line runs (999–1004 / 1069–1074, ≈12 lines). None cross-file. No dead functions.
**Churn:** 24 commits/30 d (2 authors); 39 unmerged branches. Growth 1,582→5,339 (3.4×) since 08-21. High.

## 4. `viewer/navigate_find.js` — 5,330 lines (lazy-loaded)

| Proposed file | Lines | Content |
|---|---|---|
| `nf_ui_history.js` | 17–544 (528) | CSS, accordion rows, view history (`_vh*`) |
| `nf_tree_lens.js` | 545–1278 (734) | tree modes, parts lens/axes/needle, room-walker load, `ensureRooms` |
| `nf_highlight_cost.js` | 1279–1847 (569) | path highlight, merged ghost, selection cost |
| `nf_room.js` | 1848–2849 (1,002) | shape meshes, room cuboid/shell, room volumes, zoom/fit, category reveal |
| `nf_trees.js` | 2850–3828 (979) | `_buildRoomTree` (249), path panel, material/phase trees, `_zoomToGuids`, `_drillSelect` |
| `nf_isolate_drill.js` | 3829–4236 (408) | isolate, `_treeNode` (147), storey/disc trees |
| `navigate_find.js` (rest) | 4237–5330 (1,094) | chips, `A.openFindPanel`, search/suggest/results, `selectResult`, focus, `window.NavigateFind` |

Defines `window.NavigateFind`, `window._mergeGhost/toggleGhostXray/ghostXrayOn`, 30 `A.*` (`openFindPanel`, `highlightElement`, `friendlyName`, `focusElement`, `applyFindScope`, `allRoomVolumes`, `getRoomGraph`…). Reads `UniversalHistory` (9), `PanelNav` (6), `FindErpPush`, `FindAsk`.
**Inbound:** 23 of 30 exports consumed: `main.js` 9, `navigate_engine.js` 6, `effects.js` 6, `picking.js` 6, `scene.js` 5, `cinema_maxq.js` 4, `universal_history.js` 4, `panels.js` 4. 6 tests slice it (`find_openlink_witness.js`, `zoom_tm_route_witness.js`, `author_wizard_wiring.js`, `test_find_multiselect.js`, …).
**Split:** 132 names cross, 29 mutable (`_treeMode,_roomBoxes,_lastSelSet,_anchor,panel,style,…`); `nf_trees` imports 59, `nf_panel` 60 — middling. **Precedent exists:** `find_erp_push.js` (S59 §2, factory `FindErpPush.create(deps)` called inside `init`, loaded before it from `main.js` `modules[]`). Use the same factory-with-deps shape: each part file exports `NF.parts.x = function(ctx){…}`; `init` wires them. Load order: edit `main.js` `modules[]` (~:196–215): new files before `navigate_find.js?v=63`, after `find_ask.js`. **No viewer.html/sw.js precache change** (lazy modules intentionally not precached) but `CACHE_VERSION` still bumps (sw v1078 note: avoid old-nav/new-main pairing).
**Witness coverage:** ui_history 10/20 (fn 1/12); tree_lens 23/60; highlight_cost 21/48; room 18/49 (borderline 37%); **trees 13/46 LOW** (no export tested); isolate_drill 9/24; panel_search 28/55. Browser witnesses are mostly `witness_*_2026-07-*.js` (room lens, isolate zoom, find panel hidden).
**Duplicates / dead:** `_vhRender_RETIRED` 483–537 (55 lines, never referenced) and `isolateLeaf` 3881–3896 (16) → **−71 lines**; view-history replay duplicated 19+19 lines (`_replayViewObj` ~393–414 vs `_restoreView` ~430–453) → ≈ −19 by sharing one function. No cross-file duplicates.
**Churn:** 10 commits/30 d (1 author); 51 unmerged branches (many are old stacked `fix/*`; UNVERIFIED which are live). Low on main.

## 5. `viewer/cpe_load_path.js` — 4,684 lines

| Proposed file | Lines | Content |
|---|---|---|
| `lp_chain.js` | 56–1152 (1,097) | `_lookGhost`, chain resolve/count/bears/drawn, clones, ghost/whiten, batched clones, cut cap |
| `lp_geom_pick.js` | 1153–2255 (1,103) | world boxes, frustum/projection, reverse indexes, raycast universe, scoring, `_pickTwoStacks` (195), hold-point search, section cut |
| `lp_build.js` | 2256–2832 (577) | `_framingWitness`, `A.loadPathBuild`, stack witness/twins |
| `lp_backdrop_diag.js` | 2833–3187 (355) | backdrop fade/capture/apply/restore, diag raycast |
| `lp_apply_restore.js` | 3188–3867 (680) | `A.loadPathApplyVisual`, `_restore`, `_forceRestore` |
| `lp_hud.js` | 3868–4684 (817) | ladders, freeze plates/bands, info panel, cards, `A.loadPathCompositeOntoCanvas`, `loadPathDispose` |

Defines `window.setupCpeLoadPath` (+ `module.exports`), 109 `A._loadPath*`/`A.loadPath*`. Called from `main.js:16`. Reads `ScheduleGate`, `SupportSweep`, `calcLabor`, and `cinema_maxq.js`/`time_machine.js` exports (41 `A.*` + 13 `window.*`).
**Inbound:** 31 of 109 exports consumed: `cinema_maxq.js` 22 names, `cpe_freeze_perf.js` 4, `cpe_storey_reveal.js` 3, `time_machine.js` 2, `cpe_resource_panel.js`, `main.js`. Only 1 file uses the bulk; `cpe_storey_reveal.js` cites its `_loadPathRevealStackStep`.
**Split:** 79 names cross, **only 7 mutable** (`_lp,_whitenTmpColor,_lpStackOnlyHidden,_bd,_blackSample,_lpLabelsWitnessFiredThisHold,_lpCardWitnessFired`); 102 prelude lines max. **Cheapest true move-only split of the five.** Parts are a layered pipeline (chain → geom → build → apply/restore → hud), so dependency order = load order. `viewer.html:893` → six tags in that order, before `cpe_ledger_ticker.js`; `setupCpeLoadPath` stays in `cpe_load_path.js` (renamed shell, ≈120 lines: state + wiring) loaded LAST so `main.js:16` needs no change.
**Witness coverage — the weakest of the five (all parts LOW):** chain 5/19 (fn 3/40), geom_pick 3/12 (fn 0/38), build 1/18, backdrop_diag **0/9 (no test mentions it)**, apply_restore 3/34, hud 3/16. Witnesses that exist: `witness_loadpath_bearing.js` (own tags `§LP_BEARING/§LP_SPAN`; source-reads the file), `witness_card_font.js`, `witness_freeze_hud_theme.js`, `witness_frame_reuse.js`, `witness_hud_layout_coverage.js`. The `§LOADPATH_*` tags are only exercised by live bakes (`cli_silent_bake`), not asserted. **Per the §S58 rule this disqualifies it until a surface-census witness exists** (below).
**Duplicates / dead:** none found (0 repeated runs, 0 unreferenced functions).
**Churn:** 4 commits/30 d (1 author); 11 unmerged branches. **Quietest of the five.**

---

## Recommended order and exact steps

**Order (safest first):** 1 `cpe_load_path` → 2 `navigate_find` → 3 `time_machine` (pure slices first, then state-object split) → 4 `cinema_maxq` helpers (needs protected-lane ruling lifted) → 5 `effects` (needs ruling + state object + quiet window; consider leaving `_cinemaPathPlan` whole).
Rationale: lowest churn (4), fewest mutable cross-seam vars (7), 1 consumer file, not on the protected list — but weakest witness coverage, so the *witness first* step is not optional. `navigate_find` second: existing factory precedent, lazy-loaded (no html/precache), but 51 unmerged branches. Independent of order, do the deletions as separate commits: effects −71, time_machine ≈ −120, navigate_find −71/−19 (≈ −280 total, all "token appears once" — confirm each by a final grep before deleting).

**Steps for every split (one PR per file, one move per commit, no behaviour change):**
0. Schedule in a quiet moment: check `git log origin/main --since=3.days -- <file>` empty and no open PR touching it (`gh pr list --search <file>`). Fresh worktree off `origin/main` (reuse via `git worktree list` first).
1. **Surface-census witness (new, written first, spec section first):** records, from the ORIGINAL file, (a) sorted set of `A.*`/`window.*` assignment names, (b) sorted set of `§TAG` literals, (c) number of `console.log` sites per tag. It must print NO-OP/VACUOUS/INCONCLUSIVE when the family is empty. Proves/disproves: "a split dropped or renamed a public name or log tag". Run on the family (all files) after each commit → must equal baseline. Without this the 10 LOW parts have no guard.
2. Test-only commit: `viewer/tests/_src.js` family reader; repoint the N source-scraping tests (effects 16 / TM 64 / maxq 17 / nf 6 / lp 2). Run those tests: same pass/fail as before.
3. Mutable-var commit: convert the cross-seam mutable vars (7 / 11 / 29 / 69 / 104) to `NS.s.x` in place, still one file. ESLint + census + witnesses green. (Skip for `cpe_load_path` if the 7 are kept together in `lp_chain`.)
4. Move commit per part, leaf-most first: cut the exact line range into the new file verbatim; add prelude/epilogue only; add `NS` to `eslint.globals.json`; add `<script>` (or `modules[]`) entry in dependency order; add to `sw.js` `PRECACHE_ASSETS` (not for navigate_*); bump `CACHE_VERSION` + `?v=`.
5. **Proof per commit (all must hold, log saved and read):** (i) `git diff --stat` shows moved lines = deleted lines + prelude/epilogue only (reconstruction check: strip prelude/epilogue from the new files, concatenate in original order, `diff` against the original ⇒ empty); (ii) `npx eslint viewer modeller` green (no-undef catches a left-behind name); (iii) `node tests/audit_sw_precache.js` exit 0; (iv) census witness equal to baseline; (v) every witness that named the file passes unchanged (`witness_*` list per part above; `compare_witnesses.sh` exists at repo root); (vi) one headless bake/boot (`cli_silent_bake.js`) `§` log diffed against the pre-split log — identical modulo timestamps.
6. Never combine a move with a fix or a deletion; deletions are their own commits with lines −N stated. Expected add-only cost of a split: ≈ +8 header lines per new file and up to the prelude counts in the census table (e.g. cpe_load_path ≤ +102 +48 header, 0 deleted) — a pure move adds lines, so the deletion commits above are what pays that back.

**UNVERIFIED / open:** whether the protected-lane ruling (S59:227) still stands; whether tag text in a test means the tag is asserted; the squash-merged share of the "unmerged branches" figures; whether `_src.js` concatenation satisfies every slicing test; `A.startCinemaOrbit` overlap with `cinema_maxq`.

---

## §SAFETY_GATES — how each split is proven (added 2026-10-06, main session)
Every split commit must pass ALL of these; a missing one = not done.
1. **Move-only reconstruction** — concatenating the new family in load order reproduces the original text; only seam lines may differ (function bodies byte-identical).
2. **Load-time hoisting check** — inside one file, a top-level call may use a function declared further down (hoisting); across files it cannot. Statically list every statement that RUNS AT LOAD (outside function bodies) and assert each function it calls is defined in an earlier-loaded file. ESLint no-undef does NOT catch this (the name exists, just not yet).
3. **Names resolve** — `npx eslint viewer` green (no-undef); new shared names added to `eslint.globals.json` deliberately.
4. **Same § output** — same building, before vs after: identical `§` lines (timestamps aside), using the persisted run cache where it applies.
5. **Witnesses green** — every witness for touched parts; a part with no witness gets one first (census witness for cpe_load_path).
6. **Deploy proof** — `sw.js` precache + `CACHE_VERSION` bump; fetch the live page, every new file 200, zero console errors.
7. **One commit per file split** — a single revert restores it.
**Precondition:** effects.js / cinema_maxq.js are a PROTECTED LANE (`SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S59, verified present 2026-10-06) — splitting them needs the user to lift that ruling.

## §RESULT_LP — cpe_load_path.js split DONE, held for a live bake (2026-10-06, bim-ootb PR #1903, not merged)
4,684 lines → 6 parts (`lp_chain` 1,138 · `lp_geom_pick` 1,125 · `lp_hud` 847 · `lp_apply_restore` 678 · `lp_build` 561 ·
`lp_backdrop_diag` 426) + 73-line shell. Generated mechanically (two-phase setup; 79 cross names via `LP`; 26 literal
constants kept verbatim). Correction to §5 above: **16** cross names are written after declaration, not 7.
Gates: 1 identity PASS (127 fns + 101 statements) · 2 load order = original hoisting by construction (phase 1/2) ·
3 eslint 0 errors · 5 W-LP-SURFACE PASS + 4 related witnesses same exit/§ lines as main · 7 two commits (test-only, then
move). **Open:** gate 4 (live bake §LOADPATH_* lines before/after) and gate 6 (deploy fetch) — need the user's go.
Pre-existing, not caused here: `witness_card_font.js` INCONCLUSIVE on main (draw throws in its stub).

## §LANES — who may touch which big file next (2026-10-06, measured: main commits last 14 d / remote branches touching it last 7 d, upper bound)
| file | 14 d | branches | decision |
|---|---|---|---|
| cpe_load_path.js | 4 | 11 | DONE — PR #1903, held for one live bake |
| navigate_find.js | 7 | 14 | NEXT split candidate (no protection); schedule when its open branches (find-ask, i18n, bbox-ghost) have landed |
| time_machine.js | 8 | 12 (civil lane: chainage/mixed-programme/tm-phases) | WAIT — civil lane is editing it now; split after that lane lands. Cheaper first slice: the pure draw/curve functions (≈700 lines, §3 above) |
| effects.js | 45 | 22 | DO NOT SPLIT — protected lane (§S59) AND the hottest file in the repo; helper extraction only, and only with a witness |
| cinema_maxq.js | 15 | 16 | DO NOT SPLIT — protected lane (§S59); its 4 helper files are near move-only if the ruling is ever lifted |
Separate refactor lane (not a split): `support_sweep`/`cpm_schedule` one-owner collapse — spec `4D_MODEL_INTEGRITY.md` §I.1a,
patch prepared, baseline of the 24 related witnesses saved; resume = apply patch, rerun the 24, HHS+Terminal schedule diff.

## §LANES_RULING — git-admin decisions (2026-10-06, user-delegated: "as git admin u decide on lane control")
Supersedes the DO-NOT-SPLIT / WAIT rows of §LANES above.
1. **Move-only splits are allowed in every lane, protected ones included.** The §S59 protection covers BEHAVIOUR
   (camera beats, pacing, gaze, orbit); a split that passes the identity gate changes none. Behaviour edits stay protected.
2. **Order = fewest in-flight branches** (remote branches active in the last 3 days with UNMERGED commits touching the
   file, `git cherry`, measured 2026-10-06): navigate_find 5 → time_machine 6 → cinema_maxq 7 → effects 12.
3. **The generator is committed** (`scripts/split_closure.js` + a per-file config anchored on declaration NAMES, not line
   numbers), so an in-flight branch regenerates its own parts from its own version of the old file instead of hand-
   resolving a 5,000-line conflict. Recipe in the script header.
4. **One bake window verifies all film-code splits together** (cpe_load_path #1903, cinema_maxq, effects): same
   `§LOADPATH_*`/`§MQ_*`/`§FX_*` lines before vs after. Asked of the user once, not per split.
**§LANES_RULING amendment (same day):** order also weighs SOURCE-TEXT READERS (tests/scripts that read the file as text and
slice functions out of it — every one must switch to a reader): time_machine **80** readers (incl. scripts/lib/
tm_played_layer.js under cache_4d_run.js) · cinema_maxq 17 · effects 16 · navigate_find 8 (done, #1907). New order:
navigate_find ✅ → cinema_maxq → effects → time_machine LAST, as two PRs: (1) a `readUnsplit()` reader (rebuilds the
original single-file text from shell + parts, prefixes stripped) rolled out to all 80 readers, no product change;
(2) the split. Generated time_machine split already verified to generate (8 parts, 228 shared names, no refusals).

## §RESULT_ALL — all five big files split (2026-10-06), stacked PRs, held for one live bake
| PR | file | before | parts (largest) | proof beyond the shared gates |
|---|---|---|---|---|
| #1907 | navigate_find.js + tooling | 5,330 | 7 (1,071) | 8 source readers unchanged |
| #1908 | cinema_maxq.js | 5,342 | 5 (2,788 — `start()` is one 2,660-line fn) | witness_module_loads: 202 modules load clean |
| #1909 | effects.js | 11,149 | 8 (2,856 — `_cinemaPathPlan` one fn) | census desktop 84 keys + mobile 7 keys (early return kept) |
| #1910 | cpe_load_path.js | 4,684 | 6 (1,155) | supersedes #1903 (one split mechanism) |
| #1914 | time_machine.js | 10,558 | 8 (1,967) | 79 readers same exit; cache_4d_run --force HHS + Terminal: run.json IDENTICAL |
Shared gates on every PR: split_verify (every statement identical in order, modulo the shared prefix) · readUnsplit()
rebuilds each original BYTE-IDENTICAL (cmp) · W-SPLIT-SURFACE (A./window. surface, tags, functions, runtime keys, loader
order, sw) · eslint 0. Tooling: scripts/split_closure.js (generator parts, two-phase, early-exit, strictness copied,
`this`/outer-capture/let-const refusals), scripts/split_verify.js, viewer/tests/_split_families.js (readUnsplit/readSource).
**Open:** one live bake (film code: #1908/#1909/#1910) + a Find-panel browser smoke (#1907) — the user's go; closing #1903
(permission-blocked for this session). Largest viewer file after all five: see §LARGEST below.

**§LARGEST (after all five, measured on the #1914 branch):** cinema_path_editor.js 4,461 · streaming.js 4,354 · scene.js 3,756 · schedule_author.js 3,254 · tools.js 3,022 · fx_cinema_path_plan.js 2,856 · maxq_start.js 2,788. Was: effects.js 11,149.

**§COORD (2026-10-06):** civil road lane (session bim-compiler-f8, sky-ghost agent) edits main effects.js `_mirror*` / env-map / §STILL_GHOST_OWNERSHIP functions and lands first where it can. Before merging #1909: re-run `scripts/split_closure.js scripts/split_configs/effects.json` on current main and re-run the gates (anchors are names, so their edits land in fx_sun_shadow.js / fx_photo_staging.js / fx_still_refine.js).

## §RESUME (2026-10-06 session close) — read this first next time
**State:** five split PRs open in bim-ootb, stacked, NOT merged: #1907 (tooling + navigate_find) → #1908 (cinema_maxq) →
#1909 (effects) → #1910 (cpe_load_path, supersedes #1903) → #1914 (time_machine). Every PR passed every no-browser gate
(§RESULT_ALL). Worktrees: /tmp/wt-split-nf, -mq, -fx, -lp2, -tm2 (each has a node_modules symlink to ~/bim-ootb/node_modules).
**Blocked on the user (do not route around):**
1. ONE verification window — a live bake for the film code (#1908/#1909/#1910: §LOADPATH_*/§MQ_*/effects lines before vs after)
   + a Find-panel browser smoke (#1907). User rule: no bakes without their explicit go.
2. GitHub writes are permission-blocked in this mode (auto-mode classifier "External System Writes"): merging the stack,
   closing #1903, and the §PARKED_2026-10-06 sweep in AGENT_QUEUE.md (merge #966, park 9). The user can add a rule for
   `gh pr merge` / `gh pr close`, or run them.
**Before merging #1909:** re-run `node scripts/split_closure.js scripts/split_configs/effects.json` on CURRENT main (the civil
lane is editing effects.js mirror/env/ghost code, §COORD) and re-run the gates. Same for any part whose file changed on main
since its PR: the generator is idempotent on a fresh single file. sw.js CACHE_VERSION conflicts: take the higher, keep both notes.
**Merge order is the stack order.** After each merge: fetch the live viewer, confirm every new part file is 200 and loads
(witness_module_loads), per CLAUDE.md deploy flow.
**Tooling (typescript is a parser-only dep):** `npm i --no-save typescript@5.6.3` or `TSLIB=<path>`; split_closure.js,
split_verify.js, viewer/tests/_split_families.js (readUnsplit / readSource), witness_split_surface.js <family>.
**Next sizes:** largest viewer files now cinema_path_editor.js 4,461 · streaming.js 4,354 · scene.js 3,756 (§LARGEST).
Real code SAVINGS were not the goal of the splits (measured copy-paste 0.39%); the deletion lane is §I.1a in
4D_MODEL_INTEGRITY.md (contactGraph one owner, patch pushed) and the ~280 dead-function lines listed per file above.
