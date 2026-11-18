# ⚠ DO NOT REMOVE — SCOPE: the film "CH 0 · Immersive Software" (the canvas hover of `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.21): how the hover is set up, then two dramatic moves on the real Modeller, ENGLISH ONLY. Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line in `out/facts.json` / `out/shots.log`; a number that no longer matches FAILS the build (`§FILM_GUARD`). The film file is never committed, only the scripts.

Owner, 2026-11-15: *"Make a film that shows, CH 0 'Immersive Software' - Soverignity begins with visbility in a single window.. how the hover is setup, and show at least 2 dramatic moves to show the point."* then *"last card to indicate the cost in mem, priort art lesson, and project credentials"*.

House style: `prompts/FILM_NARRATION.md` "HOUSE STYLE FOR ALL FUTURE FILMS" (split screen, REAL key sounds from `~/.local/share/film_narration/keys_eklee/`, typing first, voice after the return key, the key-sound credit on the end card). Mechanics copied from `scripts/film_ide_erp_debug/` (film 3: real VS Code on a private virtual display above, the real app page below, `facts.js` → `shoot.sh` → `build.sh`, `guard.js`, `k2.py`, `priorart.json` + guard check P). Scripts: `scripts/film_immersive_software/`.

**Honest framing (on screen):** the hover is a DEV tool, loaded by a bookmarklet into a localhost tab; users of the shipped Modeller never load it. The lower frame is the real Modeller on the real shed drawings (no client name on screen: the sheet names only).

## Beats (the beat ids are the tsv ids)
| id | top (terminal strip / real VS Code) | bottom (real Modeller, headless, CPU) | numbers from |
|---|---|---|---|
| cover | two-tone chapter card: kicker **CH 0**, title **Immersive Software**, sub-line **Sovereignty begins with visibility in a single window** | — | — |
| setup | typed: `node devtools/hover/gen_trace_index.js` → its `§DXF_HOVER_INDEX keys=N` line; then the bookmarklet (shown as typed text, then clicked) → `§DXF_HOVER installed index_keys=N` | Modeller, the 9 shed sheets opened, Convert: the model on the canvas | `facts.json` (the generator's and the page's own lines) |
| move1 "The truss you see 13 times was drawn once" | VS Code opens on **V** at `modeller/dxf2section.js` on the line the tooltip named (the `prov = atCut(n) ? 'derived' : 'assumed'` site), the line visible | the cursor on a truss bar away from cut AA; tooltip `dxf2section:bar · modeller/dxf2section.js:<line> · … assumed` | page `§DXF_HOVER` line; bodies count assumed / stations from the CLI trace run |
| move2 "The body nobody stamped" | VS Code on **V** at `modeller/dxf2bim_import.js:<line>` (the `dxf2bim_import:wall-line` stamp) | FIRST on the OLD tree (slice 2 without the wall-line stamp): the joined wall says *no trace key: the code that built this body has no trace stamp*; THEN on main: the same wall names its line | two page runs; `512 bodies → 511 inserts` from the CLI `§DXF_TRACE` lines |
| close | the LAST card (below) | — | `facts.json` |

**Last card (owner):** (1) **cost in memory**, measured, never estimated: the heap with and without the overlay after Convert (`performance.memory.usedJSHeapSize` after a forced GC, Chromium `--js-flags=--expose-gc`, same page, same sheets), the trace map's entries, the overlay and index file sizes, and the OFF path (one `typeof` test per body; model bytes identical, W-DXF-TRACE T1); (2) **prior art, the lesson**: rows built like film 3's `priorart.json`, every row = a file or page this lane READ (path:line, or the URL fetched), guard check P fails a row whose text is not found there; nothing from memory; (3) **project credentials**: the repos and licence (from the repo's own LICENSE / SPDX lines), the PRs and witness verdict lines of this feature (#3043, #3047; `§DXF_TRACE_W VERDICT PASS`, `§DXF_HOVER_W VERDICT PASS`), the Developer Guide link, the published paper link if its page answers 200. Plus the key-sound credit.

## Build plan (each step has its log)
1. `scripts/film_immersive_software/` copied from `scripts/film_ide_erp_debug/`. Two bim-ootb worktrees: NEW = `origin/main` (has #3047), OLD = NEW with the one `_trace('dxf2bim_import:wall-line', …)` statement removed (the state of slice 2's FIRST, failing witness run). `git worktree list` first.
2. `facts.js`: the generator line; the CLI `--trace` run (bodies, inserts, per-key counts, assumed counts, stations); a headless Modeller page per tree with the overlay, real mouse moves to the two target bodies (found by a sweep, as W-DXF-HOVER does), the tooltip text and the page's `§DXF_HOVER` lines; the memory measurement; file sizes.
3. `shoot.sh`: real VS Code on the virtual display (`--disable-gpu`), opened at each `file:line` the tooltip named; Modeller stills from step 2. All browser/GUI work under `nice -n 19 ionice -c3`, ONE job at a time (2026-11-15: two parallel suites saturated the machine).
4. `build.sh`: `guard.js` (`§FILM_GUARD`, checks every spoken number, check P), `k2.py` (`§K2_VERDICT PASS`), narration after each return key.
5. Output `~/Videos/Immersive_Software_CH0_EN_AFTER_<date>_v1.mp4`, never committed.

## STATUS
2026-11-15: **BUILT, v1, awaiting the owner's review.** `~/Videos/Immersive_Software_CH0_EN_AFTER_2026-11-15_v1.mp4` (1920x1080, 70.9 s, never committed). Pipeline in `scripts/film_immersive_software/`:
`facts.js` (`§FACTS VERDICT PASS`: index `keys=28`; CLI `bodies=512 inserts=511 untraced=0/0 assumed=252`, truss `stations=13 spacing_m=3.048`; three real Modeller sessions via `modeller_shot.js`, 0 page errors;
the bar → `modeller/dxf2section.js:89` `assumed`, the joined wall → `modeller/dxf2bim_import.js:716`, on the OLD tree the same wall *no trace key*; V recorded `vscode://file/…:89` and `…:716`) → `shoot.sh`
(real VS Code opened at those two links, `§FILM_SHOOT stills=2 errors=0`, the editor's own line text logged) → `build.sh` (`§FILM_GUARD VERDICT PASS`, 28 OK incl. check P on 4 prior-art rows; `§CARDS_DONE beats=5 stills=93 too_tall=0`;
voice 3 of 3 `DETAIL`, 0 `WRONG`; `§FILM_DONE frames=1701 planned=1701`; `§K2_VERDICT PASS beats=2 bad=0 audible=True`). Logs: `out/*.log`, `out/facts.json` (committed); pictures, the CLI model output and the fetched pages are ignored.
- **Memory, measured (one run each, forced GC):** heap after Convert with the tool 43.5 MB, without 43.7 MB (−0.2 MB: no measurable cost); the trace 513 entries, 20.6 KB as JSON; overlay 6.4 KB, index 1.6 KB.
- **Found and fixed in the build:** v1's last card ran off the right edge (the card check measured height only); `cards.js` now also fails on any width overflow; the cut was rebuilt before anyone saw it.
- **The wrong guid trap:** the first page session was given a beam pair whose guid contains `+` as "the joined wall"; the joined wall is the ONE insert whose guid is not a body (`facts.js` derives it that way now).
- Rebuild: two bim-ootb worktrees (NEW = `origin/main`, OLD = NEW minus the one `_trace('dxf2bim_import:wall-line', …)` statement), `node devtools/hover/gen_trace_index.js` in each, then `node facts.js <NEW> <OLD> <first-run hover log> <hover log on main> <trace log on main>`, `./shoot.sh <NEW>`, `./build.sh`. The first-run log is committed as `out/witness_hover_first_run.log`.

---

# FILM 2 — "CH 0 · Immersive Software: the ERP field" (owner, 2026-11-15: *"Yes a film to show how ERP uses it and later a remake of the BIM with layers. Prior art?"*)

Same house style and pipeline (copy `scripts/film_immersive_software/` → `scripts/film_erp_layers/`; the Modeller session becomes an ERP page session: GardenWorld login, the Sales Order
window, the overlay `devtools/hover/erp_hover.js` loaded with its bookmarklet's own code; real mouse; the tooltip and the `§ERP_HOVER` lines are the evidence). Source of every number:
W-ERP-HOVER (bim-ootb #3055) and the page session's own lines.

| id | top | bottom (real ERP page) | numbers from |
|---|---|---|---|
| cover | CH 0 · Immersive Software · *the ERP field: every layer at one spot* | — | — |
| setup | typed `node devtools/hover/gen_erp_index.js` → its `§ERP_HOVER_INDEX` line; the bookmarklet; `§ERP_HOVER installed` | the Sales Order window | generator + page lines |
| move1 "One field, many layers" | VS Code on key **1**/**2** at the line the tooltip numbered (the callout method, then the model hook) | hover Target Document Type: dictionary → on change `CalloutOrder.docType` → picker rule → on save hooks / doc action / validators | page `§ERP_HOVER` line; E2 |
| move2 "It says what is missing" | terminal strip: W-ERP-HOVER's E2 line (`fields=12323 … unported=213`) | hover a field whose callout or process is UNPORTED: the tooltip says so, no guessed file | witness log; page |
| close | last card: memory (heap with / without the overlay after the window opens, one run each, forced GC; index size), prior art (rows read: iDempiere `ADTabpanel.java:837` + `WFieldRecordInfo.java:174-179` show the field's ENTITY TYPE, the owner, with `IsShowTechnicalInfOnHelp`, not the code; Odoo developer mode `?debug=1` page; click-to-component README), credentials | — | facts.json |

**Prior art, read 2026-11-15 (for the card; guard check P cites these exact places):** iDempiere's field tooltip adds the Entity Type when the user preference `IsShowTechnicalInfOnHelp` is on
(`org.adempiere.ui.zk/…/adwindow/ADTabpanel.java:837`), and Field Record Info shows `Table.Column='value'` + the entity type (`…/window/WFieldRecordInfo.java:174-179`): the OWNER of a field,
not the code that runs. Odoo's developer mode is a per-session switch (`?debug=1`) whose bug-icon menu shows "technical data, such as a view's field" (docs page, fetched 2026-11-15).
**Lesson for the card:** both name who owns a field; neither lists the code that fires on it in order. That list is what this hover adds, and it can because the twin keeps every layer in a
registry with an owner and a rank.

**FILM 2 STATUS (2026-11-15): BUILT, v1, awaiting the owner's review.** `~/Videos/Immersive_Software_CH0_ERP_Field_EN_AFTER_2026-11-15_v1.mp4` (1920x1080, 78.1 s, never committed). Scripts
`scripts/film_erp_layers/` (`erp_shot.js` = the ERP page session). `§FACTS VERDICT PASS` · `§FILM_SHOOT stills=2 errors=0` (VS Code at `CalloutOrder.js:97` `prototype.docType` and `ad_callout.js:477`
`prototype.dateAcct`) · `§FILM_GUARD VERDICT PASS` · `§CARDS_DONE beats=5 stills=92 too_tall=0` · voice 3/3 `DETAIL` · `§FILM_DONE frames=1874 planned=1874` · `§K2_VERDICT PASS`.
Memory (one run each, forced GC, the Sales Order window open): with the tool 46.1 MB, without 47.0 MB; overlay 15.3 KB, index 65.2 KB (302 registrations).
**Making it found TWO real defects in the merged hover (both fixed, both witnessed red→green):** (1) bim-ootb #3057: v1 read only the layered registry's `describe()` and called
`CalloutEngine.dateAcct` (put in directly, `erp/ad_callout.js:512`) UNPORTED; #3055's `unported=213` was inflated, the truth is 199; new check E2b (red `false_unported=17` → 0); E2b's first
version read the hover's own field and its red run PASSED (blind): rewritten to read the dictionary. (2) bim-ootb #3059: the key map wiped a number after an unlined layer (`[1]` on Target Document
Type opened nothing); E4 now presses every number shown (red `tried=112 wrong_or_dead=9` → 0). Move 2 of the film is defect (1), shown as it happened.

**FILM 2 MANDARIN (2026-11-15, owner: *"Do Mandarin version and drop remote-control for mobile to share"*): BUILT.** `~/Videos/Immersive_Software_CH0_ERP_Field_ZH_AFTER_2026-11-15_v1.mp4`
(1920x1080, 84.2 s). `FILM_LANG=zh OUTD=out_zh`: the ERP page opened with `?lang=zh_CN` (three fresh page sessions, `out_zh/facts.log` `VERDICT PASS`), Chinese narration in `narr.js` ZH and Chinese
cards (`cards.js` `tr()`, Noto Sans CJK SC), Microsoft Edge TTS (free), `§FILM_GUARD VERDICT PASS`, `§CARDS_DONE too_tall=0`, `§FILM_DONE frames=2020 planned=2020`, voice 3/3 `DETAIL`,
`§K2_VERDICT PASS`. **Translated by the build session, NOT reviewed by a native speaker** (said on the last card). The tooltip and code stay English (they are the tool's own text). Sent to the
owner's phone with SendUserFile together with both English films (all under 5 MB, no mobile copy needed). Film 1 has no Mandarin version yet (only if asked).
**Prior art checked 2026-11-15 for the owner's question "anyone else?" (searches + the pages read):** LocatorJS (github.com/infi-pc/locatorjs: Option/Alt-click a component → its code in the
IDE; React/Preact/Solid, Vue/Svelte experimental) · click-to-component (README read, needs a Babel source plugin) · Chrome/Firefox DevTools Event Listeners pane (an element's handlers with file
and line) · iDempiere technical info (owner only) · Odoo debug tooltip (field name, type, model) and the paid add-on **CML Field and Button Tooltip Plus** (apps.odoo.com, LGPL-3, $38.36 for v18:
*"See the full list of modules that touch a field, from the original definition to every override"*, file via Python introspection; its page names no line numbers and no onchange/compute).
Nothing found for a BIM body → the code that built it. Searches were three quick ones, not a survey.

# FILM 3 — "CH 0 · Immersive Software: a body's history" (the BIM film remade with layers; owner 2026-11-15 *"proceed"* after F.23 merged)
The tool: the provenance hover, `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.23 (bim-ootb #3064). Same house style and pipeline (copy `scripts/film_immersive_software/` → `scripts/film_bim_layers/`).
ONE bim-ootb tree (`origin/main`, has #3064): no OLD tree this time. Page sessions: the real Modeller, headless, CPU (SwiftShader), ONE at a time, `nice`; one with the overlay (targets,
heap), one without (heap). Source of every number: the page session's own `§DXF_HOVER` lines and tooltip, the W-BIM-LAYERS log on `main`, the W-DXF-HOVER (H2b) log.

| id | top | bottom (real Modeller, headless, CPU) | numbers from |
|---|---|---|---|
| cover | CH 0 · Immersive Software · *a body's history, in one hover* | — | — |
| setup | typed `node devtools/hover/gen_trace_index.js` → its `§DXF_HOVER_INDEX keys=N defaults=M` line; the bookmarklet; `§DXF_HOVER installed` | the shed, converted | generator + page lines |
| move1 "Why is this column this tall?" | the tooltip's own text (six layers), then VS Code at the line key **3** opened (`modeller/element_defaults.json`, the `column.top_under_beam` row) | the cursor on a column whose top is a default; the tooltip | page `§DXF_HOVER … layers=` line; key 3's recorded link |
| move2 "Where did this hole come from?" | the tooltip: layer 4, two door cuts, each holding its door | the cursor on the joined north wall | page; W-BIM-LAYERS L4 `cuts=2` |
| move3 "It says what it does not know" | terminal strip: W-BIM-LAYERS L3 lines (`by_source=…`, `default_sides linked=12 not_recorded=110`) | the cursor on a truss bar whose width is a default with no recorded key: *which default is not recorded on the body*, nothing linked | W-BIM-LAYERS log; page |
| close | last card: memory (heap with / without the overlay after Convert, forced GC, one run each; overlay + index sizes), prior art (rows below, check P), credentials (#3043 #3047 #3064, W-BIM-LAYERS + W-DXF-HOVER verdicts) | — | facts.json |

**Prior art for the card (fetched 2026-11-15 into `out/prior/`, check P reads them):** RenderDoc's Pixel History, *"shows all modifications that have happened to the texture since the start of the
frame"* (renderdoc.org/docs/window/texture_viewer.html) → a body's layers in the order they happened · The Whyline (CMU), *"ask "Why did" and "Why didn't" questions about their program's
output"* (cs.cmu.edu/~NatProg/whyline.html) → the hover answers "why this size", and says what it does not know · click-to-component, *"Option+Click a Component … goto the source"*, line numbers
from a Babel plugin → no build step here · VS Code *"Open a file to line and column"* → the link each key makes.
**Honest framing on screen:** a DEV tool loaded by a bookmarklet into a localhost tab; layer 5 (edits) is not shown on the page (the film makes no edit; W-BIM-LAYERS L5 judges it in Node).
Output `~/Videos/Immersive_Software_CH0_BIM_Layers_EN_AFTER_<date>_v1.mp4`, never committed.

**FILM 3 STATUS (2026-11-15): BUILT, v1, awaiting the owner's review.** `~/Videos/Immersive_Software_CH0_BIM_Layers_EN_AFTER_2026-11-15_v1.mp4` (1920x1080, 85.4 s, 5.2 MB, never committed).
Scripts `scripts/film_bim_layers/` (bim-ootb tree `origin/main` @ `5e01bc3d`). `§FACTS VERDICT PASS` (index `keys=28 defaults=99`; CLI `bodies=512 inserts=511 untraced=0/0`; two real Modeller sessions,
0 page errors; col `#22` `layers=1,0,4,0,0,5` key 3 → `element_defaults.json:5`; wall `#100` `layers=1,0,1,2,0,1` key 1 → `dxf2bim_import.js:716`; bar `#248` `layers=1,0,3,0,0,1` key 3 → nothing) ·
`§FILM_SHOOT stills=2 errors=0` (VS Code on `"column.top_under_beam": {` and the wall-line `_trace`) · `§FILM_GUARD VERDICT PASS` (36 OK, incl. check P on 4 prior-art rows and "the lower band holds the
whole tooltip") · `§CARDS_DONE beats=6 stills=96 too_tall=0` · voice 4/4 `DETAIL` · `§FILM_DONE frames=2050 planned=2050` · `§KEYS_VERDICT PASS` · `§K2_VERDICT PASS beats=2 bad=0 audible=True`.
Memory (one run each, forced GC, after Convert): with the tool 45.5 MB, without 45.6 MB (−0.1 MB); overlay 15.7 KB, index 7.5 KB, the trace 513 entries.
**Making it found TWO defects (both fixed, red → green, bim-ootb #3069 `Fixes #3068`):** (1) the six-layer tooltip (~300-415 px) was placed at cursor+14 with no clamp: the column's ran to y=1086 in a
1080 page; it now flips above / left near an edge. (2) W-DXF-HOVER's `setViewport` sat inside a comment, so its page always ran at 800x600; new check H2c (every hovered tooltip inside the window):
red on the old overlay `tip_out_of_window=4` of 14 at 1440x900, green `0`, `§DXF_HOVER_W VERDICT PASS fail=0` on main. Also logs `§DXF_HOVER edit_delta=Y` once the edits owner is loaded (seen in `out/ms_new.log`).
**Card layout lesson:** the tooltip text in the top band first cut lines at 70 characters (it would have hidden `element_defaults.json:5`, move 1's point); `cards.js` now measures every tooltip line's width
(the check failed at 18 px, passes at 17 px in 820 | 1000 px columns). Rebuild: `node facts.js <tree> <W-BIM-LAYERS log> <W-DXF-HOVER log>`, `./shoot.sh <tree>`, `./build.sh`.

# FILM 4 — "CH 0 · From an empty folder to a witnessed dev setup" (owner 2026-11-18: *"list outline of what achieved since last film"* → *"update prompt on that film script when resume"*)

**STATUS (2026-11-18): BUILT, v1, awaiting the owner's review.** `~/Videos/Dev_Setup_CH0_EN_AFTER_2026-11-18_v1.mp4` (1920x1080, **209.1 s**, never committed; over the ~150 s the owner's script aimed at: see the cut list below). Scripts `scripts/film_dev_setup/`, built from the download of bim-ootb `41b6b676` (`out/from_scratch.log`):
`§FROM_SCRATCH steps_ran=5/5 gaps=2 verdict=PASS` (4,816 files, 544 MB) → `pages.js` `§PAGES VERDICT PASS` (three apps open, Ctrl+S Save Building writes a 14,987,264-byte .db, opened by name with every outside host blocked: only `gc.zgo.at` was asked) → `facts.js` `§FACTS VERDICT PASS` (17 typed commands run byte for byte in a copy of the download, each exit 0, whole output in `out/cmd_*.log`) →
`shoot.sh` `§FILM_SHOOT stills=7 errors=0` (real VS Code on Xvfb, X0 Navigator INSTALLED from the film's own `.vsix` into a throwaway `--extensions-dir`/`--user-data-dir`; both edits made in the editor, saved, undone: `§FILM_UNDO … restored=true`, no `§FILM_WS_CHANGED`) → `guard.js` `§FILM_GUARD VERDICT PASS` (35 spoken figures resolved from the RAW logs, 3 prior-art rows by check P, not-said list) →
`build.sh`: `§CARDS_DONE beats=10 stills=698 too_tall=0`, voice 8/8 `DETAIL` 0 `WRONG`, `§FILM_DONE frames=5018 planned=5018`, `§KEYS_VERDICT PASS` (656 typed, 20 returns), `§K2_VERDICT PASS beats=8 bad=0 audible=True`.
Figures spoken (2026-11-18 run): manifest `identical=55/55 deps_declared=25 order_check=PASS`, the red run `§MANIFEST_FAIL modeller/modeller.html:290 …` verdict FAIL; proof map `modules=100 proven=13 named_only=63 unproven=24`, `bad_paths` 0 → 1; CI: 1,543 witness files by the typed `git ls-files` count, 40 in the fast tier, 39 excluded; `x0 where camera` `viewer/grid_views.js:83`, 4 writes, 1,247 reads; `x0 loaded viewer/scene.js` start-up 238,950 bytes; b7 = this build session's own transcript (`x0 session --transcript $T`: 117 min, 15,542 output tokens, 1 PR, `load=-`; it changes every rebuild, the guard re-reads it).
**Deviations from the script table above, and why:** (1) b6 types `git ls-files | grep -c …`, a `node -e` on `tests/ci_fast_tier.json` and one excluded row instead of `gen_ci_tier.js` and "61 of 1,512": `gen_ci_tier.js` reads THIS machine's witness-result cache (`~/.cache`), not the download, and "61" has no command that derives it; the film says "forty of 1,543, thirty-nine kept out". (2) b3 types `tag §MANIFEST_CHECK`, not `§BUMP`: in a download with no bim-compiler beside it the answer is "no spec found … (not searched: bim-compiler — checkout not found)", which the film says plainly. (3) The `x0` alias question was not answered: the film types the full `node devtools/x0/x0.js`. (4) b5/b4 reds ran on the copy and were undone with `git checkout -- .`. (5) b1b: the headless browser has no native Save dialog, so `showSaveFilePicker` is removed and the page's OWN `<a download>` fallback runs on a real Ctrl+S (`§SAVE_DONE mode=download`).
**FOUND while making it (the film's reason to exist, listed on the last card): a ZIP download cannot run the manifest tools.** `node scripts/gen_manifest.js --check modeller` on the unpacked ZIP fails with `Cannot find module …/node_modules/espree` (the lint package; `npm install` fixes it, and Developer Guide §3 says npm install is "needed only for the lint check and the browser witnesses": that sentence is wrong for the manifest/bump/proof-map tools) and then with `Command failed: git ls-files viewer/` / `fatal: not a git repository` (a ZIP has no `.git`; `git init -q && git add -A` is enough; GitHub's own page: "Snapshots don't contain the entire repository history"). Logs `out/cmd_b4_gap.log`. **Not fixed here (guide / tool owners): either say so in Guide §3, or give those tools a clear message.**
**Cut list if the owner wants ~150 s (nothing was cut):** b1b offline (−19 s) · b6 CI (−23 s) · b3 terminal (−26 s) together bring it to ~141 s; b4 (33 s) is the longest and the one the film is about.
**Honest framing on the last card:** first viewer run needs the internet (OCI, 11 local requests fail first) · the viewer also loads `gc.zgo.at` · the ZIP needs `npm install` + `git init` · 39 witnesses kept out of CI with their reasons · the editor ran in a throwaway profile.
**Rebuild:** `node scripts/tests/witness_from_scratch.js --keep` in bim-ootb (move the kept folder to `~/.cache/film_dev_setup/fs1/bim-ootb-main`, write the archived commit to `~/.cache/film_dev_setup/base_commit.txt`, delete any `node_modules`/`package-lock.json` there) · `./fetch_prior.sh` · `node facts.js ~/.cache/film_dev_setup/fs1/bim-ootb-main <the session transcript .jsonl>` · `./shoot.sh` · `node guard.js` · `./build.sh` (refuses to overwrite the mp4). CPU only, one heavy job at a time.
bim-compiler-a3 held the GPU for the LOD Upgrade film captures that day). Covers what the tenth session built after "When AI Dies". House style binds (bim-compiler `prompts/FILM_NARRATION.md` ▶ HOUSE STYLE):
split screen, the terminal strip on top, every line TYPED with real recorded key sounds, the voice only after Return; the app or editor below shows the data that line produced; every number spoken or shown
comes from a `§` line in the build's `facts.json`, and a stale number FAILS the build (`§FILM_GUARD`); the guide link on the last card (Developer Guide §3, §4.1: `red1oon.github.io/BIMCompiler/DeveloperGuide/`);
the film file is never committed, only its scripts; EN first, other languages on the owner's word. Scripts go to `scripts/film_dev_setup/` (copy `scripts/film_bim_layers/`: `facts.js` → `shoot.sh` → `build.sh`, `guard.js`, `narr.js`, `tsv.js`, `k2.py`).
Output `~/Videos/Dev_Setup_CH0_EN_AFTER_<date>_v1.mp4`, never committed.

**ONE folder runs the whole film (continuity, and it is the honest path).** Beat 1 makes a temp folder from the download; beats 2 to 7 all run INSIDE that downloaded copy (never the owner's checkout, never his VS Code profile).
No `x0` is on PATH (measured 2026-11-18: `which x0` empty; `package.json` bin has only `red1`): the film types `node devtools/x0/x0.js <verb>`. Whether to show a shell alias instead is a build-time choice for the owner; the film must not pretend a global `x0` exists.

**Honest framing (on screen, last card too):** the first viewer run needs the internet (its building comes from OCI); the viewer also loads GoatCounter (`?ignore-me`); the CI tier runs 61 of 1,512 witness files, not all;
the Modeller runner still has failing witnesses on unedited main (named in RESUME 0). The film names these, it does not hide them.

## Beats (typed line · what the lower frame shows · narration F asks, M answers, short · where the number comes from)
Narration is spelled in words for the voice. `says` keys below are what `narr.js` will carry; `guard.js` resolves each from `out/facts.json` and FAILS on a mismatch.

| id | top (terminal strip, typed) | bottom | narration (F: … \| M: …) | numbers from |
|---|---|---|---|---|
| cover | two-tone card: kicker **CH 0**, title **From an empty folder to a witnessed dev setup** | — | — | — |
| b1 download | `node scripts/tests/witness_from_scratch.js` (run in the repo; it makes the empty temp folder itself) | the page the witness opened per app, one still each: Modeller, ERP, then the Viewer showing the Duplex | F: Can a stranger run this from nothing? \| M: Download the zip: four thousand seven hundred ninety-eight files, five hundred forty-one megabytes. Serve it. ERP and Modeller open with no failed request. The viewer opens the Duplex, but only after it fetches the building from the internet. We say so. | `§FROM_SCRATCH_S2 files= mb=`, `_S4` per page `http_fail= console_errors=`, the viewer's `1,118/1,118` line, the final `§FROM_SCRATCH steps_ran=5/5 gaps=2 verdict=PASS`; the two `§FROM_SCRATCH_GAP` lines are shown, not cut |
| b1b offline | `ls viewer/buildings/` then the URL `viewer.html?db=buildings/<name>.db` | the viewer opening the saved Duplex with no network (host blocked in the headless context, logged) | F: And offline? \| M: Save Building, Ctrl S. Put the file here. Open it by name. No internet this time. | the page's own building-loaded line + the blocked-host count `0` requests out; the file is the one Save Building wrote in the same run |
| b2 x0 vsix | `node devtools/vscode/pack.js --install` (throwaway `--extensions-dir`) | real VS Code on the virtual display, hover on `A.camera` in `viewer/grid_views.js` | F: And the editor part? \| M: One command packs the add-on and installs it. Hover a shared field: every write, every read. | `§FROM_SCRATCH_S5` pack/install line; the hover text recorded from the live editor (not a mock); `x0 where camera` numbers `4 writes · 1247 reads` re-measured at build |
| b3 terminal | `node devtools/x0/x0.js where camera` · `... loaded viewer/scene.js` · `... tag §BUMP` | the same three answers highlighted in the editor (file at the named line) | F: Without the editor? \| M: The same facts, typed. Where the camera is written. How a file reaches a user: start-up, two hundred thirty-nine kilobytes. What a tag means and who prints it. | W-X0-CLI `§X0_CLI verbs=8 same=8/8 red=2/2 verdict=PASS`; the three answers (2026-11-18: `viewer/grid_views.js:83`; `viewer/scene.js` start-up 238,950 bytes; `scripts/bump.js:142`) |
| b4 manifest | edit ONE `?v=` in the downloaded `modeller/modeller.html` by hand (typed `sed -i`), then `node scripts/gen_manifest.js --check modeller` → RED naming the file, the line and the command; then `node scripts/bump.js modeller/arc_editable.js --write` → `--check` green | the Modeller page before / after is NOT shown (no new GPU need); the lower frame is the editor on the edited line | F: What if I edit a version by hand? \| M: The check refuses, names the file and the line, and prints the command. The bump tool does it right, the inline version goes up with its module. Twenty-five dependencies are declared, fifty-five files identical. | the RED run's own `§MANIFEST_*` lines (captured at build: text not guessed); green `§MANIFEST_CHECK … identical=55/55 deps_declared=25 order_check=PASS verdict=PASS`; W-MANIFEST-ROUNDTRIP `claims=15/15 red=12/12` |
| b5 proof | `node scripts/gen_proof_map.js modeller` | the editor on one `PROVES:` header, then a header naming a missing file, then the map red | F: Which witness proves which file? \| M: Ninety-nine modules. Thirteen have a witness that says it proves them. Sixty-two are only named. Twenty-four have none. A header that names a missing file goes red. | `§PROOF_MAP app=modeller modules=99 proven=13 named_only=62 unproven=24 … bad_paths=0` (2026-11-18); the red run `bad_paths=1` captured at build on the throwaway copy |
| b6 ci | `node scripts/gen_ci_tier.js` | `tests/ci_fast_tier.json` open in the editor, one excluded row with its measured reason | F: What does CI run? \| M: Sixty-one of fifteen hundred twelve witness files on every pull request, up from twenty-one. The others stay local, each with its measured reason. | `§CI_TIER` line + the #3274 result (`61 of 1,512`, was 21); **drift to settle at build:** the 2026-11-18 probe-less run printed `kept=40 excluded=37`, the merged result says 39 excluded (probe adds 2): the film uses the probe run's number |
| b7 bill | `node devtools/x0/x0.js session last` | the printed block, nothing else | F: What did the session cost? \| M: Tokens, merged pull requests, witnesses run, and what it added to what users load. | `§X0_SESSION …` for the film's OWN build session (not the stale one: 2026-11-18 `session last` read another lane's session, `load=modeller:boot+847,precache+26004`; the earlier note's "offline +183 B" was a different session and is NOT to be spoken) |
| close | last card (below) | — | — | `facts.json` |

**Last card.** (1) what a stranger gets, in the five numbers above; (2) **the named gaps**: first viewer run online, GoatCounter, 39 witnesses local-only, the failing modeller witnesses; (3) **prior art, the lesson**: rows built like film 3's
`priorart.json`, every row a page this lane READ and fetched at build into `out/prior/` (guard check P fails a row whose text is not found there; nothing from memory); (4) **credentials**: repos and licence from their own LICENSE/SPDX lines,
the PRs (#3245 #3250 #3256 #3259 #3266 #3274 #3280) and their verdict lines, the Developer Guide link, the key-sound credit.

## Build plan (each step has its log; one heavy job at a time, `nice -n 19 ionice -c3`)
1. Owner's go; `ListAgents` for GPU holders; `git worktree list`; scripts to `scripts/film_dev_setup/` from `film_bim_layers/`.
2. `facts.js`: run `witness_from_scratch.js` once (log kept), then every beat's command in the downloaded folder, each `> out/<beat>.log`; hand-edit and PROVES-header reds on throwaway copies only; extract every figure into `facts.json`.
3. `shoot.sh`: real VS Code (`--disable-gpu`) at the hover and the edited line; app stills from the from-scratch run. 4. `build.sh`: `guard.js` (`§FILM_GUARD`, check P), cards (width AND height checks), voice after each return key, `k2.py` (`§K2_VERDICT PASS`), `§FILM_DONE frames=planned`.
5. Read every `out/*.log` before any claim (Log Mandate); `§FILM_GUARD` or `§K2_VERDICT` not PASS = not done.

**Measured 2026-11-18 while writing the script (read-only, no GPU), tree `origin/main` `700fbdcb`:** `§MANIFEST_CHECK … identical=55/55 … deps_declared=25 order_check=PASS … verdict=PASS` · `§PROOF_MAP app=modeller modules=99 proven=13 named_only=62 unproven=24 proves_lines=20 bad_paths=0`
(the resume block said 18 `PROVES:` lines: 20 now, E1 headers keep landing: re-measure) · `§CI_TIER … kept=40 excluded=37` (no `--probe`) · `x0 where camera` → `viewer/grid_views.js:83`, 4 writes, 1247 reads · `x0 loaded viewer/scene.js` → start-up, 238950 bytes.
**Open for the owner before the build:** (a) show a shell alias `x0`, or type the full `node devtools/x0/x0.js`; (b) go for the headless-browser + real-VS-Code capture; (c) which beats to cut (the film is long: seven beats plus b1b; film 3 ran 85 s).

