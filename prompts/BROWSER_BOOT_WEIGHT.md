# ⚠ DO NOT REMOVE — BROWSER BOOT WEIGHT: what every page open loads, and loading the rest on first use
Scope: `bim-ootb` `modeller/modeller.html` and `viewer/viewer.html` (ERP later). Measure first, then move scripts that a page open does not need to load-on-first-use, one at a time, each with a witness. **Read the log after every run.** Honour this block until the file is marked DONE.

**Why this file exists (owner, 2026-11-08):** *"recall related prompts/# on such sharding that keeps mem hog away from user browser, to see if it notes so for all tis scripts to also not hog browser … so we can assign a new session to that prompt."* Searched 2026-11-08: no prompt owns JS load weight. Neighbours, read but not duplicated:
| File | What it owns | What it does not |
|---|---|---|
| `docs/BrowserScaleBenchmark.md` | DATA memory: heap per million vertices, sql.js opening a whole DB, httpvfs range reads, evict-behind and chainage tiles as the growth path | scripts loaded at open |
| CLAUDE.md §PERF BUDGET | vertices, buffers, deltas, a `§` heap line after heavy passes | scripts |
| `prompts/VIEWER_FILE_SPLIT_PLAN.md`, `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` | splitting long files for maintainability; notes `navigate_find.js` is already lazy | load timing |
| `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §14.6 | the case that started this: `bay_add.js` had been made eager by mistake and was put back to first use | anything wider |

## ▶ START HERE — measured 2026-11-08 at bim-ootb `origin/main` (static count of `<script src>` tags; nothing run in a browser)
| Page | Eager script tags | Own code | Libraries | The HTML page |
|---|---|---|---|---|
| `modeller/modeller.html` | 61 | 21,859 lines, 1,580 KB | 6,071 KB | 8,034 lines, 660 KB |
| `viewer/viewer.html` | 248 | 144,342 lines, 9,298 KB | 376 KB | 1,278 lines, 90 KB |
**Heaviest eager, Modeller:** `common/lib/web-ifc-api-iife.js` **5,941 KB** (the IFC parser), `disc_walker.js` 230, `dxf_import_ui.js` 135, `str_walker_outliner.js` 84, `viewer/lib/room_walker.js` 80, `routewalker.js` 77 KB.
**Heaviest eager, Viewer:** `cinema_path_editor.js` 300, `streaming.js` 292, `scene.js` 233, `schedule_author.js` 232, `maxq_start.js` 224, `fx_cinema_path_plan.js` 205, `tools.js` 205, `lib/chart.umd.min.js` 200, `sourced_light.js` 200, `panels.js` 172 KB.
**Loaders that already exist:** these files contain a `createElement('script')` loader, so each already loads *something* on first use. What each one loads was not checked, except two: `dxf_import_ui.js` loads the DXF2BIM modules (and `bay_add.js` for "Add a bay"), and `modeller.html` loads `bay_add.js` on the first block shift. Modeller: `dxf_import_ui.js`, `dxf_export_ui.js`, `dxf_meta_editor.js`, `edit_delta_ui.js`, `proj_order_ui.js`, `reg_report_ui.js`, `teams_embed.js`, `viewer_db_export.js`, `modeller.html`. Viewer: `find_ask.js`, `import.js`, `loader.js`, `main.js`, `nf_tree_lens.js`, `tm_gantt_edit.js`, `wh_walk.js`, `wing_2d.js`, `viewer.html`. `VIEWER_FILE_SPLIT_PLAN.md` records `navigate_find.js` as lazy. **Copy one of these, do not invent a second loader.**
**Not measured yet, do these first:** heap and parse time at open (`performance.memory`, a `§BOOT_WEIGHT` line); which eager scripts are *called* before the first user action; whether `web-ifc` is used at open at all.

## Rules
1. **Measure, then move one script per PR.** No batch moves: each move is its own witness and its own revert.
2. **A script stays eager if anything calls it before the first user action.** Prove that from a run (a `§` call log or a stub that throws if called early), never from reading names.
3. **Offline must keep working.** A lazy script must still be in `sw.js` `PRECACHE_ASSETS`, with `CACHE_VERSION` bumped in the same commit (`feedback_sw_version.md`).
4. **First use pays once and says so:** a `§…loaded on first use` line, and a loading status if the wait is noticeable.
5. **Tests are callers too.** A witness that reads a global right after Open will break; fix it to trigger the first use, as W-BLOCK-SHIFT Z1–Z2 do.
6. **Count it, do not guess it:** state lines and KB moved, and heap at open before and after (§PERF BUDGET).

## Witness to write first — W-BOOT-WEIGHT
Real Open of a resident in each page, no user action. Print `§BOOT_WEIGHT page= scripts= ownKB= libKB= heapMB= parseMs= calledBeforeFirstAction=[…]`. Each claim names its issue:
| Claim | Proves or disproves |
|---|---|
| The tag count and KB equal a static recount of the HTML | The census is wrong |
| Heap at open is printed, and is not null | "Lighter" is claimed without a number |
| Each lazy script is absent until its first use, then present, and the first use works | A lazy move broke the feature, or did not happen |
| Every lazy script is in `PRECACHE_ASSETS` | Offline broke |
| Falsifier: a lazy script restored to a tag must fail the absent-until-first-use claim | The witness cannot fail |

## Candidates, in the order to look (unverified until W-BOOT-WEIGHT says who is called at open)
1. **Modeller `web-ifc-api-iife.js`, 5.9 MB.** If only IFC import and export use it, it is most of the Modeller's open weight.
2. **Modeller walkers** (`disc_walker.js`, `routewalker.js`, `viewer/lib/room_walker.js`): needed only when a walk runs?
3. **Viewer film and cinema** (`cinema_path_editor.js`, `maxq_start.js`, `fx_cinema_path_plan.js`, `sourced_light.js`): needed only when a film or bake starts?
4. **Viewer `schedule_author.js` and `chart.umd.min.js`:** needed only when 4D or a chart opens?
5. ~~The edit report~~: owner chose first use, 2026-11-08. The two files (13.6 KB) load on the first committed grid move; the 46 lines of glue stay inline (NEURO_SYMBOLIC_ORDER_CONTRACT §15.2).

## Landmines
- `bim-ootb` Pages serves tracked files from `main`: what is committed is what users load (`AGENT_QUEUE.md` §PAGES-SERVES-THE-BRANCH).
- `sw.js` is the merge-conflict magnet: keep both precache additions, take the higher `CACHE_VERSION`.
- Work in a `/tmp/wt-*` worktree; the shared checkout is hook-blocked.
- Viewer witness fleet: check `prompts/WITNESS_INTERFACE_FRAMEWORK.md` §CRISIS before trusting a green run.

## STATUS
2026-11-08: file written, census above. Nothing moved beyond `bay_add.js`. W-BOOT-WEIGHT not written.
