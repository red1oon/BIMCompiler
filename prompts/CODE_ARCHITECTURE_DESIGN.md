# ⚠ DO NOT REMOVE — SCOPE: the higher-level code design for bim-ootb (parts A–F below): turn implicit structure into declared, generated, checked structure, WITHOUT a build step, TypeScript in the app, a framework or a new runtime dependency, and keeping lazy loading. Design first: every open decision goes to the owner ONE AT A TIME, then spec, then witness-led migration in small PRs. Read the log after every run — exit code is not evidence. Honour this block until every part is ✅ or ⛔.

**Written 2026-11-13** under BIMCompiler #599 (closed by the write-up PR #600). **Vetted 2026-11-13** under #602: every claim re-checked
against bim-ootb `main` @ `a7c329e5`, corrected in place, evidence in §VET. **Each part opens its own tracker issue when it starts** (START HERE 5).
Owner, in order:
*"i wonder if we need to design the code at a higher level? Give your take again what can be a better design"* →
*"Why not write it out fully in the prompts/# spec'd so that a new session will tackle it fresh"* →
*"also look at how VSC can have a plugin or addon that specifically handles this codebase elegantly and dev help really"*.
Background and every measurement this file cites: `prompts/EDITOR_MAINTAINABILITY_STUDY.md` (§3, §7, §12–§15), `docs/DeveloperGuide.md`
(§0, §1 patterns, §9 breakers, §11 refactors), `prompts/REFACTOR_FOR_READERS.md` (the small, readability-only list).
**Which repo a path means:** code paths (`erp/…`, `viewer/…`, `modeller/…`, `common/…`, `capex/…`, `tests/…`, `witness_kit/…`, `types/…`,
`.vscode/…`, `.github/…`, `scripts/` in §M) and `GOVERNANCE.md` are **bim-ootb**. `prompts/…`, `docs/…`, `scripts/bridge/…`, `scripts/code_arch/…`,
`deploy/…` are **bim-compiler**, unless marked "bim-ootb".

---

## ▶▶ RESUME HERE FIRST (rewritten 2026-11-15 at the close of the third session; **"resume software" and "resume VSC" land here**)

Owner, closing 2026-11-15: *"get it well documented in the prompts/# consolidate, so new session when 'resume VSC' or 'resume software' gets the full context"* · *"update prompt also that new sesion will do up BIM side"*. This block is the whole hand-over; each section it names holds the evidence (older history: the archive, START HERE 7). If a line here and a `§` section disagree, the section wins. **Standing rules:** "ERP" = the Kernel ERP JavaScript in bim-ootb `erp/`; legacy iDempiere Java is a read-only oracle (cite file:line, never copy it in). Owner design talk: ONE detail per message, with a recommendation; record his answer in his words. Workers run on Sonnet. One heavy job at a time on this machine, `nice -n 19 ionice -c3` (two suites in parallel saturated it, a peer session asked to throttle, 2026-11-15).

**0. ✅ DONE 2026-11-15 (fourth session): F-18 answered, the provenance hover built and merged — §F.23 (bim-ootb #3064 + tooltip-in-window fix #3069); FILM 3 built (`prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 3 STATUS, awaiting the owner's review); the default-key + truss findings handed to the DXF2BIM lane (bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` §D113, #3070). NEXT = the X0 "New witness for this file" command (§F.21 OPEN), or Part A's remaining A2 (item 2).** The text below is the original hand-over.

**0c. 2026-11-16 (same session), after the owner said *"Focus on your VSC side, let the others handle as your info"*:** the door stamp fix (0b, first bullet) is the **CLI lane's** to do. It was handed back to bim-compiler-06 as information, and this lane will not open that PR. **ADVICE C is DONE (all three):** C1 X0 witnesses in CI (§F.24, #3090) · C2 stale-copy warning (§F.25, #3092) · C3 the "138" corrections (comments on #2974/#2975). **NEXT for this lane:** the X0 "New witness for this file" command (§F.21 OPEN) · F-19 waits for the owner (and for the message lane's `msg_keys.js`) · Part A's remaining timing items need headless-browser witnesses (W-GOAL-STORE, W-DASH-SYNC, W-TEAM-SO), which run only on the owner's go.

**0b. 2026-11-16 SYNC with the CLI lane (`prompts/CLI_ERP_IVR.md`, the `red1` shell) and the message lane (`prompts/VOCAB_MESSAGE_CATALOG.md`).** Owner: *"with much happening on the CLI side and a new session doing translation messaging, do your 'resume VSC' to see if it needs updating besides continuing its pending roadmap"*. Since 2026-11-15, bim-ootb `main` (`8c3f0af6`) gained the `red1` shell (#3060-#3088), `vocab/words.json` + `vocab/messages.json` + `msg_core.js` (#3082) and the Student level (#3083/#3084). The VS Code tools knew none of it: `git grep` over `devtools/` finds 0 hits for `verbs.json`, `messages.json`, `words.json`, `vocab` or `msg_core`. What changes here:
- **Part A, a real defect (CLI owner agreed, 2026-11-16: *"please do it from the code-design lane … object_cli's UTC is the defect"*):** `common/door/object_cli.js:212` stamps the model Trx `now` in **UTC** (`new Date().toISOString()`), but `common/door/erp_cli.js:26` stamps **LOCAL** time (the §20 rule, W-DOOR-STAMP, #2953). So `object.update` and `mis.update` write `Updated` on two different clocks. `erp_cli.js:26` is also a second local-day helper beside `crud_core.localDay` (`erp/crud_core.js:64`, which says it is "the ONE implementation"). Measured: `clock_probe.js <bim-ootb> 'common/door/*.js'` → `§CLOCK_PROBE files=18 with_calls=7 calls=58 parse_fail=0`. Most are ms timers or log-file names (fine at an edge). **Fix (handed to the CLI lane, 0c), one PR touching only those lines:** object_cli takes the one stamp, and erp_cli's `stamp()`/`today()` are built on `crud_core.localDay(Date.now())` plus the time. Its agent was editing `erp_cli.js` (§29.6 P3a/P3b) at the time. Witnesses the CLI lane named: W-DOOR-STAMP, a NEW claim that `object.update` and `mis.update` stamp the same clock (with a falsifier: put the UTC line back and it must FAIL), W-MIS-CRUD, W-ERP-VERBS, W-OBJ-COUNT.
- **Part A3 scope:** `common/door/` is an EDGE: it reads the clock and hands `env` in, which is the Part A pattern. Its `*_core.js` files (`assist_core`, `draw_core`, `menu_core`, `msg_core`, `report_core`, `mis_core`) have zero clock reads (same probe) and are pure. W-CORE-PURE should list them as core and `door.js`/`*_cli.js`/`red1.js` as edge, and it should flag a second local-day implementation anywhere.
- **Part F, a new decision F-19 (ask the owner, one message):** X0 Navigator support for the catalog and the verbs, dev-side only, nothing reaches the browser (§13 guard). Hovering a `t('key', …)` shows the English (and later the Student and other-language) text; F12 jumps to its `messages.json` line; while you edit, it warns about an unknown key or a `{n}` with no argument. Today `msg_core.js` throws only when the code runs. The same for a verb name, opening its `common/door/verbs.json` entry. **Recommendation: yes, built as one more X0 index (`lib/catalog_index.js`) that reads the JSON files, plus a witness with a red control (a made-up key must be flagged, a real key must not).** **Message lane's answer (2026-11-16):** a key checker already exists, so REUSE it and don't copy it: W-MSG-CATALOG M3 (bim-ootb `common/door/tests/witness_msg_catalog.js`) checks every literal `M('key'` / `.t('key'` both ways against `messages.json`, checks that placeholders run {0}..{n-1}, and catches calls that pass too many arguments. Keys must stay LITERAL strings (M3 caught one chosen by a ternary). The message lane offers to pull that scan out into one shared module (e.g. `common/door/msg_keys.js`) when P2b starts, used by both the witness and X0. The shape `{"_", "messages": {"<file>.<name>": {"en": …}}}` is stable: `en` stays, and later phases ADD fields beside it (Student text, per-language texts such as `ja`), never a new top level. `msg_core.js` is pure, so X0 can require it to render the hover. **So the F-19 recommendation becomes:** X0 reads the catalog through the shared `msg_keys.js` and `msg_core.js`, with no scanner of its own; it is built after the message lane extracts `msg_keys.js`.

**0. THE NEXT SESSION'S JOB (owner 2026-11-15): the BIM side.** The ERP field hover shows a STACK of layers (§F.22); the BIM hover (§F.21 slice 2) shows only the builder line. Do for BIM what F.22 did for ERP, then remake the BIM film with layers (`prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 3).
- **Ask the owner first, one message (F-18), with this recommendation:** a body's layers, in the order they happened, each from data the body or the op already carries, never guessed: (1) the BUILDER (the trace key → its line, `devtools/hover/dxf_hover.js`) · (2) PASS-THROUGH stamps (the `a > b` chain the trace already keeps) · (3) each SIZE and its source (`size.*.source` on the body: `drawn` / `schedule` / `label` / `default` / `user` / `inherited`; `height_source`, `thick_source`), a `default` linked to its `dxf2defaults.js` row (the yellow default a user can change) · (4) CUTS that opened it (the `GEOM_CUT` ops whose provenance names this body) · (5) EDITS after Convert (the op log: moves / resizes of that fid) · (6) the evidence the converter attached (handle, layer, sheet, prov). Number keys / V open each layer's line, as the ERP hover does.
- **Witness the same way F.22 was:** a denominator (every body of the shed: 512 bodies / 511 inserts), a red control per claim, and a check that each claim agrees with an independent source (the lesson of §F.22's two defects below). Then the film: same recipe as FILM 2.
- **The accuracy item for the DXF→BIM lane (found by the trace, not yet raised there):** the truss is drawn once at cut AA and copied to 13 stations (`modeller/dxf2section.js:42-44`): 144/156 bars + 108/117 plates (252 bodies, ~half the model) are `assumed`, spaced by ONE default, `section.spacing` (= the column pitch) unless stated. The "64 synthesized columns" are NOT an issue (below-grade parts from the column schedule, §L29; corrected in §F.21).

**1. The hover family, built 2026-11-15 (all merged in bim-ootb, witnessed red → green, re-run on `main`; how to use: bim-ootb `devtools/hover/README.md`).**
| What | PRs | Witness, line on `main` |
|---|---|---|
| `dxf2bim_cli.js --trace`: which line built each body (`Dxf2Prep.trace`, 27 stamps; model bytes unchanged) | #3043, #3047 | W-DXF-TRACE `VERDICT PASS bodies=512 keys=12` (T2b inserts 511/511) |
| BIM canvas hover (Modeller): body → its builder line, **V** opens VS Code | #3047 | W-DXF-HOVER `VERDICT PASS` (real mouse sweep, red control) |
| ERP field hover: every layer in firing order (dictionary → callouts → picker rule → model hooks / doc action / validators → process), owner@rank, Java origin; **Alt+1-9** opens a layer | #3055, #3057, #3059 | W-ERP-HOVER `VERDICT PASS`: `fields=12323 lines_resolved=6590 wrong_line=0 unported=199`, E2b `false_unported=0`, E4 `keys tried=112 wrong_or_dead=0` |
| ERP legacy-parity gate in `scripts/bump.js` (F-16: block on a NEW mismatch, `scripts/bump_parity.json` mode block/warn/off, `--no-parity "<reason>"`) | #3050 | W-BUMP-PARITY `PASS judged=14 failed=0 real_row=run` |
**Two defects the films found in merged code (keep the lessons):** (a) #3057: the ERP hover read only the layered registry's `describe()`, which misses classes put in directly (`erp/ad_callout.js:512` CalloutEngine) and called real callouts UNPORTED (213 claimed, 199 true); presence must be the ENGINE's own lookup (`getCallout :442`; processes JAVA + `registerHandler :76`). (b) #3059: the tooltip's key map wiped a number after a layer without a line. Both witnesses' first checks were BLIND (one read the hover's own field, one pressed only key 1 on one field): a check must judge from an independent source and over every case, and its red run must FAIL. **Parity-gate caveat:** its default bridge path is the shared `~/bim-compiler` checkout (usually on another branch); point `BUMP_PARITY_BRIDGE` at a worktree on `origin/master` (`/tmp/wt-bridge` exists for it). Today's known parity failures: `DD:FAIL`, `CTX:FAIL`, `DDS:HARNESS-FAIL`.

**2. Part A (the pure core).** A-1..A-5 answered (Part A DECISIONS). Built and merged: `Env.stamp/modelEnv/nowStamp/nowMs` (#3007) · session day = local day (#2996 → #3010) · `Import*` x7 + `ClientAcctProcessor` (#3013) · `InvoiceGenerate` + `InOutGenerate` (#3016) · `model_asi` + `doc_poster` (#3021) · `crud_core.localDay` + report handlers (#3026) · **A-5 `Env.setEdge`**: `rule_fold.js` (#3030, W-RULE-FOLD-EDGE) + `processes/PackIn.js` (#3033). **Remaining A2, one PR each:** timing reads via `Env.elapsed` (`ad_callout.js:995`, `model_pa.js:23`, `viewer/cpm_schedule.js:862-918`, `viewer/schedule_gate.js:849/1007` (4D cache key: re-run `scripts/cache_4d_run.js` once), `common/room_graph.js:1692/1773`, `viewer/schedule_inject.js:55`) · viewer `schedule_author.js:3115/3448`, `schedule_sync.js:36` · the EDGE producers `crud_overlay._modelEnv`, `plugin_overlay._localNow`, `genesis.js:729` LAST · then **A3 `W-CORE-PURE`** (an AST scan replacing the hand list in `erp/tests/witness_core_clock_reads.js`, which now lists 15 files). **Method that worked (keep):** baseline the touching witnesses BEFORE editing (a second detached worktree), edit, compare, investigate every diff; `poc_gated_complete.js` / `poc_i4_reconcile.js` are stale (wait for `#pill-kanban`, fail on `main`): do not use them as before/after.

**3. Where each part stands.**
| Part | State | Next step |
|---|---|---|
| A | A-1..A-5 ✅, A2 done for 15 files | remaining A2 (above; browser witnesses, on the owner's go) → A3; the door stamp is the CLI lane's (0c) |
| B | not started | B0 needs no decision (§READY), then ask B-1 |
| C, D | not started; wait on B | — |
| E | not started | `witness_kit/paths.js` needs no decision (§READY), then ask E-1 |
| F | §F index rows + §F.21 (BIM trace + hover) + §F.22 (ERP hover) + F-16 gate built | **the BIM layered hover (0)**, then the X0 "New witness for this file" command (§F.21 OPEN; a skeleton pre-filled from facts the index has, population + red control left empty so it FAILs until a person fills them) |

**4. Part F's other tools (bim-ootb `devtools/`; Developer Guide §4.1, §4.2, §5.6, §6, §6.1 live).** X0 Navigator: F12 / hover / Find All References on shared-object fields, `§TAG` hover with the last provable value, *Context for this file*, Run & Ship, one-click cache bump, snippets `witness` / `slog` / `spec`; facts server `devtools/mcp/x0-facts/` (OFF by default). A saved edit does NOT show on a plain reload (service worker; measured 2026-11-14); the hot server is parked at `~/.cache/bim_film3/hot_server_parked/`.

**5. Films (never committed; scripts + logs are).** CH 0 · Immersive Software (`prompts/FILM_IMMERSIVE_SOFTWARE.md`, scripts `scripts/film_immersive_software/`, `scripts/film_erp_layers/`): film 1 the BIM hover `~/Videos/Immersive_Software_CH0_EN_AFTER_2026-11-15_v1.mp4` · film 2 the ERP field `~/Videos/Immersive_Software_CH0_ERP_Field_EN_AFTER_2026-11-15_v1.mp4` + Mandarin `_ZH_` (see the film file's status) · film 3 = BIM with layers (after 0). Both EN films were sent to the owner's phone (SendUserFile). Earlier CH 0 "VSC Hot Edit" films: `prompts/FILM_IDE_ERP_DEBUG.md`. Rebuild recipes are in each film file (removing a film worktree deletes its ignored pictures; the recipe recreates them).

**6. Open with the owner.** F-18 ✅ (§F.23) · **F-19** (catalog + verb hover, 0b) · F-1 (Fetch back runs a headless browser?) · F-2 (size and speed budgets) · F-7 (hosted preview per PR) · F-12 step 2 (a deploy token only he can create) · a status-bar Bump button (suggested, not built) · the parity gate's default bridge path (above) · his hands-on dry run (`~/VSCcheatsheet.txt`, 29 steps; `~/bim-ootb-dryrun` not created) · a bake on his go (check a "last:" line after #2977).

**7. Open, no owner needed.** 15 of 51 `ws_kernel.js` witnesses fail on unedited `main` (ERP lane's; list in the archive) · the Modeller runner on this machine: `§ALLWITNESS PASS=106 FAIL=10 SKIP=5 ENV=12 of 133` before the shed inputs were restored; inputs RESTORED 2026-11-15 to `~/Videos/dxf2bim_film_work/why/{raw,cli/marked}` (README there), and some witnesses need `SHED_RAW_DIR=~/Videos/dxf2bim_film_work/why/raw` set · 11 `PHANTOM?` fields (§F.17, a Part C question) · the 4D cache's `witness.log` has no `§LOG_STAMP` · bim-ootb #2974/#2975 texts still say "138 of 281" (true: 130).

**8. Traps this lane has paid for.**
- **A registry's own summary is not the truth:** `describe()` missed directly-put classes (§F.22 defect a). Ask the code path that RUNS (the engine's lookup), and give the witness an independent source.
- **A witness that reads the tool's own output to judge the tool is blind** (E2b v1); **a witness that tries one case is scope-blind** (E4 v1 key 1 only). Red-run every new check against the OLD code: it must FAIL.
- **A text grep that globs a file twice inflates counts** (`erp/*.js` + `erp/model_*.js`); the parser count is the number.
- **A devtools file that spells the shared object's access in a string becomes a fake field** in the X0 index: run `devtools/vscode/x0-navigator/tests/witness_x0_appdef.js` before a devtools PR.
- **Headless pages:** wait for the field you read; a fresh browser context per session (a shared one timed out at Convert); the camera of the Modeller is inside a module (sweep with real mouse moves instead).
- **`rm` with a relative glob after a `cd` is blocked by the safety check** (the whole command does not run, edits included): never chain a removal onto an edit.
- `< /dev/null` on every `node` in a loop; wait on processes, not on a log marker from the previous run; `*.log` is gitignored (`git add -f` the logs a spec commits); bim-compiler has no auto-merge (merge by hand), bim-ootb does (`--auto --squash`, wait for MERGED, re-run on `main`); the bim-compiler checkout is on another branch (read `git show origin/master:…`, edit in a `/tmp/wt-*` worktree); never `git stash` (shared), never `--force` a worktree path.
- **Measure before quoting** (a `§` line and its command); check the visible effect before choosing a film example.

## ▶ START HERE (fresh session)

1. **Read, in order:** this file to the end · `docs/DeveloperGuide.md` §0, §1, §5, §9 · `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13 (minimalism
   guard) · bim-ootb `GOVERNANCE.md` · `CLAUDE.md` §TWIN CARDINAL RULE, §AD-LAYER LAW, §PERF BUDGET, §DB CHANGES.
2. **This is a DESIGN lane before it is a coding lane.** The owner's rule for design talk: *one detail at a time, never decide topology
   alone* (memory `feedback_design_discussion_one_detail_at_a_time`). Each part below lists its **OPEN DECISIONS**, named `<part>-<n>` (A-1 is part A's first). Bring them to the owner
   one per message, with a recommendation, and record the answer **in the owner's words** in that part's `DECISIONS` block. Do not
   code a part whose decisions are open.
3. **Re-measure the baselines** (commands in §M) before quoting any number. They drift daily.
4. **Coordinate:** `ListAgents`, then ask live sessions before touching their files (owner: *"be careful not to break ongoing sessions work,
   ask the other session what it thinks first"*). `gh pr list --state open` for overlapping paths. Work in a `/tmp/wt-*` worktree off fresh
   `origin/main` (bim-ootb shared checkout is hook-blocked). Run `git worktree list` first and reuse one if it fits.
5. **FOSS flow per PR:** a tracker issue (what, baseline, witness), then branch, one small PR `Fixes #N`, conventional title, CI green, merged
   and verified on `main` before the next (`docs/DeveloperGuide.md` §10; own sessions may merge their own verified PRs).
6. **Order:** A → B → D → E → F → C (reasons in §ORDER). **F ran first on the owner's word and its unblocked rows are built**; the
   design itself continues at Part A. What to do next is in ▶▶ RESUME HERE FIRST, nowhere else.
7. **History:** every build spec, result and finding of 2026-11-13/14 is in
   `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md` under the same `§F.n` names. Read a section there
   before changing the code it describes. This file keeps one line per section (the §F index).

## RULES (any break = stop that part)

- **Minimalism (owner, 2026-11-13):** *"pure SQLite WASM resisting any forks, or TS that can overload its lightweight kernel local first
  air gapped handling"*. Nothing new may reach the browser except the code a part explicitly moves, and **no new runtime dependency**. Generators,
  manifests, `types/`, `.vscode/` and the VS Code extension are dev-side only. The extension is plain JS with no npm dependencies.
- **Lazy loading kept** (owner: *"retain its fast perf lazy loading strategy"*): nothing lazy becomes boot-loaded or precached as a side effect.
- **Twin rule:** the SQLite ERP stays the twin of legacy iDempiere, look and feel included. A difference found is fixed on the SQLite side.
- **AD-layer law:** ERP behaviour lives in the one generic dictionary engine, never per window.
- **No behaviour change without a before/after witness** that shows identical results (or, where a part fixes a real bug, an owner-approved
  issue that states the intended change, with the witness updated in the same PR).
- **Protected lane:** film/camera families (`fx_*`/`effects`, `cinema_path_editor`, `maxq_*`/`cinema_maxq`): no structural change unless the
  owner lifts `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S59.
- **No browser/GPU runs, no bakes, no paid model calls** without the owner's explicit go. Headless node witnesses are fine.
- **Instrument honesty:** code scans use a parser (espree or VS Code's TypeScript via `scripts/lib/find_ts.js`), never regex over raw source.
  Comments and strings are not code (`EDITOR_MAINTAINABILITY_STUDY.md` §9: this error was made twice in one session). A witness that judged nothing
  prints INCONCLUSIVE. Every witness has a red control.
- Status, findings and decisions go in THIS file (dated lines in each part), not in `MEMORY.md`.

---

## THE PROBLEM, in one table (measured 2026-11-13 @ `cc9988c2`, re-measured the same day @ `a7c329e5`, §VET)

| # | Structural problem | Evidence | Who it hurts |
|---|---|---|---|
| P1 | Dependencies are implicit | page-loaded app code is classic `<script>` globals; load order = `<script>` order (`viewer/viewer.html` 247, `erp/idempiere.html` 206, `modeller/modeller.html` 59). The ES-module exceptions are the ERP plugins and migrate engine: **53 `.mjs` files** under `erp/` and `capex/`, loaded by `import()` (`erp/plugin_overlay.js:78`, `erp/plugin_registry.js:114`). A shared object of 1,688 fields, 1,321 written only as `A.x`, **172 read in production but never written** | anyone reading or moving code |
| P2 | The same lists are kept by hand in several places | page `<script>` lists · lazy list `viewer/main.js:170` `modules[]` · three `PRECACHE_ASSETS` (`viewer/`, `erp/`, `modeller/sw.js`) · `?v=` tags (245 viewer, 213 erp, 67 modeller) · three `CACHE_VERSION` · `_GANTT_CACHE_VERSION` (`viewer/tm_dash.js:688`) · ERP plugin lists `BUILTINS`/`INSTALL_ONLY` (`erp/plugin_overlay.js:230-232`) and 29 `plugins/*.mjs` entries in `erp/sw.js` | every edit; stale-file bugs |
| P3 | Side effects are mixed into core logic | AST scan (`scripts/code_arch/clock_probe.js`, §M) of 301 ERP production files (vendored sql.js excluded): 58 files / 160 calls to clock, random, network. The proposed ERP core set (decision A-1) has 18 files / 25 calls, plus 7 in `erp/kernel_ops.js` where ops are minted. Most are "today, with a wall-clock fallback", written differently each time (`ad_callout.js:157`, `doc_poster.js:203`, `model_asi.js:70`, `processes/InvoiceGenerate.js:38`, `processes/ImportOrder.js:68`, the other 9 `processes/*.js`). *(The first draft's 299/59/181 and "15 files / 26 calls" came from an uncommitted probe and cannot be reproduced. The committed probe is the baseline now.)* | correctness of replay; testability |
| P4 | No app-wide owner list | duplicates found by accident: `ERPKernel` in `erp/erp_kernel.js` and `erp/odoo_agent/erp_kernel.js`; `modeller/routewalker.js` vs `viewer/routewalker.js`; `Bonsai` ×3 and `ERP` ×4 publishers (`types/globals.gen.d.ts` header); the clock reads of P3, written a dozen different ways; `erp/kernel_ops.js` vs bim-compiler `build/erp/kernel_ops.js` (different bytes; the bim-compiler copy last changed 2026-10-04 and is hidden from the editor by BIMCompiler #596). Only the 4D lane has an owner table (`prompts/4D_MODEL_INTEGRITY.md` §I) | anyone fixing a bug in "the" implementation |
| P5 | Proof is scattered | witnesses in `modeller/tests` 368 · `viewer/tests` 317 · `erp/tests` 305 · `witness/` 183 · `capex/tests` 45 · `hr_bim_asset/tests` 45 · `tests/` 27 · `common/door` 26 · 8 smaller folders 41 (1,357 in all); 65 files use `witness_kit/contract.js`; 665 tracked files contain the author's home-folder path; no lookup "which witness proves this file / rule" | reviewers; a second machine |

**Re-measured 2026-11-14 after the index fix (archive §F.17):** P1's shared object has 1,856 fields, 1,595 written only under the short
name, **107** read in production and never written (the 172 above was an index fault: 130 of the 281 "phantoms" had a writer), plus 11 the
index flags as not sure.

Each item in `REFACTOR_FOR_READERS.md` patches one symptom. This design removes the causes.

---

## PART A — A pure core with one Env handed in   (fixes P3, half of P4)

**Design.** Split code into two kinds:
- **Core:** ERP verbs, posting, processes, callouts, the op-log fold, schedule/CPM maths, geometry maths. Plain calculation: data in, results out.
  **No** `Date`, `Math.random`, `crypto.randomUUID`, `fetch`, `window`, `document`, storage, or `console` outside a `§` log helper.
- **Edge (shell):** UI, Three.js, panels, service worker, IndexedDB/OPFS, network.

Everything core needs from outside arrives through **one Env object**: `now()`, `today()`, `newId()`, `fetchSource()` (if any), `log(§…)`.
The edge mints each value **once** and records it in the op, so a replay reads the recorded value and never asks the clock again. This is
iDempiere's own pattern: the working date lives in the session context (`Env.java:110` `DATE = "#Date"`; 39 iDempiere source files read it with
`Env.getContextAsDate(ctx, Env.DATE)`), and the twin already carries `#Date` (`erp/ad_callout.js:116`). So the twin rule is honoured, not bent.
It also makes `docs/DistributedERP.md` §7 (*"nondeterministic values … generated at the edge and recorded as inputs … kernel only reads"*) true by
construction and checkable, which closes the DeepSeek review's point "we have a rule vs we enforce a rule".

**Facts the design must respect (vetted 2026-11-13):**
- **Three env objects exist today, not one.** (1) `AdCallout`'s `Env` with the context keys, incl. `DATE: '#Date'` (`erp/ad_callout.js:116`) and
  `Env.now()` (`:840`); (2) the transaction's `trx.env` (`erp/model_layer.js:91` `this.env = env || {}`), read as `trx.env.now` / `nowMillis` by
  `processes/ImportOrder.js:68` and 21 other ERP files (`git grep -lE 'env\.(now|nowMillis|today)\b' -- erp`); (3) the genesis seed env
  (`erp/genesis.js:729`, `{date, now, nowMillis}` at a fixed 09:00). Decision A-2 chooses how these become one.
- **Local day, never the UTC day (a fixed bug that A must not undo).** `Env.now()` (`erp/ad_callout.js:836-840`) shifts to local time on purpose:
  with a UTC clock the login date and SQL SYSDATE were *yesterday* just after local midnight at +08 (the comment cites W-LOCAL-TIME). `SESSION_START`
  records `ts: new Date().toISOString()` (`erp/kernel_ops.js:941`), a UTC instant. So `today()` returns the **local calendar day**, and whatever
  records the session date records that local day (or the instant plus its timezone offset). It never cuts the day out of the UTC string.
- **Value reads vs timing reads.** Some calls only time a pass for its `§` line and never change a result (`viewer/cpm_schedule.js:862`
  `var t0 = Date.now()`, `viewer/schedule_gate.js:849`, `common/room_graph.js:1692`). Others are not maths at all: `viewer/tm_core.js` has 19
  calls, most of them `Math.random()` for visual scatter (`:547` a random angle, `:1024` "5-10 points"). The probe counts both kinds. Decision A-4 sets
  how W-CORE-PURE treats timing, and decision A-1 must split or drop files like `tm_core.js`.
- **4D cache + 4D owners.** `viewer/schedule_gate.js` and `schedule_author.js` are part of the `~/.cache/bim4d` key (CLAUDE.md PRIMAL LAW 5), so an
  A2 PR that touches them invalidates that cache (expected; re-run `scripts/cache_4d_run.js` once, bim-ootb). Their owners are in
  `prompts/4D_MODEL_INTEGRITY.md` §I. Read it before moving any 4D function.

**Owner file:** the determinism rule is already owned by `prompts/BACKEND_SUBSTRATE_LANE.md` (scope block: *"deterministic on every fold/replay
path (ids/ts/balances are recorded INPUTS, no Date.now()/Math.random())"*). Part A is carried out under that lane's rules. Record progress here and
add one dated pointer line there.

**Step A0 — settle the open fact first (witness, no code change):** when the op-log replays, does it RE-RUN a process (which would pick up a new
"today" on a later day) or replay the ROWS the process wrote? Witness `W-REPLAY-CLOCK`: run a dated process (e.g. InvoiceGenerate) with a fixed
injected date, replay the log under a different wall clock (fake `Date`), compare the replay hash with the live hash. Equal → the fallbacks are tidy-up
(A2). Different → a real bug. Open an issue that states it, and fix it in A1 before anything else.
- **Code-read lead (not the answer):** ERP writes are recorded as ROW ops, not as process runs: `AD_SAVE`/`AD_DELETE` (`erp/ad_data.js:121`, `:263`),
  `CRUD_CREATE`/`CRUD_UPDATE`/`CRUD_DELETE` carrying field values (`erp/ad_process.js:773-774`, `erp/borrower.js:35-37`), and `replayOps` returns the
  recorded `parameters` and re-reads `op_uuid` (`erp/kernel_ops.js:849-866`). So "rows are replayed" is the expected answer. The witness still has to
  prove it, on the path a process writes through (`ModelLayer.run` with `timing: 'PROCESS'`).
- **W-REPLAY-CLOCK spec.** File `erp/tests/witness_replay_clock.js` (bim-ootb), node only, built from `witness_kit/contract.js`. Load the kernel the
  way `erp/tests/witness_migration_trade.js:29-31` does (`ws_kernel.js` `K.load()`, register the `processes/*.js`), then:
  1. run `InvoiceGenerate` and one `Import*` process with `#Date` = a fixed day D;
  2. keep the op log and the live hash;
  3. replay the log into a fresh db with `Date` stubbed to D + 3 days, at 00:30 local, once with `TZ=UTC` and once with a +08 zone;
  4. print `§REPLAY_CLOCK ops= liveHash= replayHash= tz= match=Y|N`.
  **Red control:** a planted op that re-runs the process on replay must give `match=N`. **INCONCLUSIVE** if the process wrote 0 rows.
  Reuse, don't rewrite: the `replay-hash == live-hash` path in `prompts/RESUME_PROVE_BOOKS_MONITOR.md` (bim-compiler `scripts/erp_kernel.js`,
  `poc_kernel.js`, `poc_longtail.js`) and `prompts/KERNEL_COMMITGROUP.md` item F. The witness runs against **bim-ootb's** `erp/kernel_ops.js`,
  not the older bim-compiler `build/erp/` copy (P4).

**A0 RESULT 2026-11-14 — bim-ootb #2995 / PR #2997. ✅ DONE (witness): the rows are replayed, not the process.** (owner, 2026-11-14: *"Proceed"*)
- **Run:** seed company (client 11), shipped paths only (`ML.newPO/save/processIt`, `AP.runInTrx`, the kernel's own `inTrx` → commit → journal),
  clock fixed at 2026-11-10 10:00 local in a child process: a new order completed (7 ops), shipped by process 118 (29), invoiced by process 119
  with NO DateInvoiced (10: it took the session's date), and one undated `I_Order` row imported by process 206 (8). 4 journal groups, 54 ops,
  22 tables, 1,991 rows hashed. A second child with the clock at 2026-11-13 00:30 local loads a fresh kernel and applies the journal with the
  kernel's own `replay()` (`erp/ws_kernel.js:99`).
- `§REPLAY_CLOCK ops=54 liveHash=4f32f7549452eda5 replayHash=4f32f7549452eda5 tz=UTC match=Y` ·
  `§REPLAY_CLOCK ops=54 liveHash=48b1cd5ebacad0ad replayHash=48b1cd5ebacad0ad tz=Asia/Kuala_Lumpur match=Y` ·
  `§WITNESS_REPLAY_CLOCK pass=4 fail=0 ran=2` (through `witness_kit/contract.js`).
- **Red control, real:** the same replay with the invoice group RE-RUN instead of applied: `invoice={"dateinvoiced":"2026-11-13 …"}`, 7 tables
  differ (`ad_sequence, c_bpartner, c_invoice, c_invoiceline, c_invoicetax, c_orderline, fact_acct`), match=N, `redControl-detected`.
  The first run of the witness, whose order set-up was broken, printed `§REPLAY_CLOCK_VERDICT INCONCLUSIVE`, not PASS.
- **So:** the wall-clock fallbacks in the processes are **tidy-up (A2), not a replay bug**. No A1 "fix first" is needed for replay.
  Scope of the claim: the headless kernel's journal and `replay()` (`ws_kernel.js`), the path a process writes through. The page's own op
  log fold (`erp/kernel_ops.js` `replayOps`) was read (§A0 code-read lead) but not driven by this witness.
- **Two things the run showed that the spec did not ask about:**
  1. **The session day is the UTC day (bim-ootb #2996, open, not fixed).** `§REPLAY_CLOCK_SESSION_DAY tz=Asia/Kuala_Lumpur local_clock=2026-11-13
     00:30 session_day=2026-11-12 same=N` (UTC: `same=Y`). `erp/ws_kernel.js:80` cuts the day from `toISOString()`. In the red-control run the
     invoice made at 00:30 local on the 13th was dated the 12th. This is the "local day, never the UTC day" fact above, still true of the
     headless kernel; legacy dates by the server's local day. It is decision **A-3**'s subject. Not checked against the legacy oracle yet.
  2. **The hash differs from run to run** (`bc95…` then `4f32…` for UTC): the kernel's `uuid()` is `crypto.randomUUID()` (`ws_kernel.js:82`), so
     two live runs never give the same rows. Live == replay holds inside a run because the ids are recorded in the ops. This is the P3 "IDs
     minted in many places" item, for the Env's `newId()`, not a replay fault.
- Merged; re-run on bim-ootb `main` @ `abecbbb8`: match=Y in both zones, `pass=4 fail=0`. Not in CI (needs the local `sql.js` path the other ERP witnesses use). Run: `node erp/tests/witness_replay_clock.js`.

**Steps:** A1 the Env object (one owner file; name per decision A-2), taking its date from the login context the way legacy does · A2 move
each core file's clock/ID reads onto it, one file per PR, posting/parity witnesses identical before/after · A3 **scan witness `W-CORE-PURE`**: an
AST scan of the core file list that fails on any forbidden call outside the Env owner and the `§` log helper. **Red control:** a copied core verb
with a planted `Date.now()` must make it FAIL. Prints `§CORE_PURE files= forbidden= verdict=`.

**A1 SPEC (2026-11-14; decisions A-2/A-3/A-4 answered; additive, NO caller changes, so no behaviour change).** Measured producers of the trx env /
"now" in bim-ootb `main` (`git grep -n` on `nowMillis`, `toISOString`, `getTimezoneOffset`): (1) `erp/ws_kernel.js:78-82` `env(s)`: clock +1000 ms per call, day = `toISOString().slice(0,10)`
= **UTC day** (#2996); (2) `erp/crud_overlay.js:1902` `_modelEnv()`: local day, local stamp, `nowMillis = Date.now()`; (3) `erp/genesis.js:729`: fixed
`D` at 09:00, deterministic `uuid`; (4) `erp/plugin_overlay.js:114` `_localNow()`: local stamp; (5) `erp/ad_callout.js:840` `RUNTIME.now`: local wall clock as
UTC ms. **Build (all in `erp/ad_callout.js` `Env`, the login context, per A-2):**
- `Env.stamp(ms)` → `{ day:'YYYY-MM-DD', now:'YYYY-MM-DD HH:MM:SS', millis }` from LOCAL calendar fields (one implementation of what (2), (4), (5) each spell out).
- `Env.modelEnv(ctx, edge)` → the trx env object `{client, org, user, role, date, now, nowMillis, uuid, elapsed, …}`. `ctx` is the login context (`#AD_Client_ID`,
  `#AD_Org_ID`, `#AD_User_ID`, `#AD_Role_ID`, `#Date`); `edge` is what the shell injects once: `{ nowMs(), uuid(), perfMs() }` (the ONLY places a clock/RNG may be called).
  `date` = ctx `#Date` when set (A-3: legacy's session date), else the edge's local day; if neither exists it **throws** and prints `§ENV_NO_DATE` (A-3: core never falls back).
- `env.elapsed(t0)` / `env.perfMs()` = A-4's timing seam (reads `edge.perfMs`).
**Witness W-ENV-VIEWS** (`erp/tests/witness_env_views.js`, node, `witness_kit/contract.js`): with a fixed injected clock, for `TZ=UTC` and `TZ=Asia/Kuala_Lumpur` at 00:30
local, compare `Env.modelEnv` field by field with `_modelEnv()` (2), the genesis env (3) and `ws_kernel env()` (1). Prints `§ENV_VIEWS producer= field= same=Y|N`.
(1) is EXPECTED `same=N` on `date` in +08 (#2996, the UTC-day defect) and is reported as `KNOWN-DIFF #2996`, not PASS; A2 fixes it after a legacy-oracle check.
**Red control:** a copy of `_modelEnv` with `toISOString()` must give `same=N` at +08. **INCONCLUSIVE** if fewer than 3 producers were compared. Not-a-test warning: equality
on UTC only proves nothing, which is why +08 00:30 is mandatory.

**OPEN DECISIONS (ask one at a time):**
1. Which files are "core"? Proposal (measured in §VET): ERP `erp/processes/*.js`, `erp/callouts/*.js`, `ad_callout.js`, `doc_poster.js`,
   `model_*.js`, `rule_fold.js`, `crud_core.js` (112 files, 18 with calls, 25 calls), with `erp/kernel_ops.js` as the **minting point** (it records
   edge values into ops, so it is the Env side, not core); plus viewer `cpm_schedule.js`, `schedule_*.js` and `common/room_graph.js`.
   `viewer/tm_core.js` stays **out** unless it is split (19 calls, mostly visual `Math.random`). Other geometry maths: the owner names the files,
   or they wait. Owner confirms the list.
2. Three env objects exist (above). Does Env extend the twin's existing context (`AdCallout`'s `Env`/`#Date`), with `trx.env` and the genesis env
   becoming views of it, or is it a new small object that all three feed? Proposal: extend the existing one, because legacy has one context.
3. What happens when no date was injected (today: wall-clock fallback)? Proposal: the EDGE records the session's **local calendar day** (plus the
   instant and the timezone offset) in `SESSION_START`, and `today()` reads that day. Core never falls back. Today `SESSION_START` stores only a UTC
   instant (`erp/kernel_ops.js:941`), so this adds a field, under `BACKEND_SUBSTRATE_LANE.md` rules.
4. Timing reads (elapsed ms that only feed a `§` line): allowed as `performance.now()` inside a `§` call, or routed through `Env.elapsed()`?
   Proposal: `Env.elapsed()`, so W-CORE-PURE stays a plain ban on calls and needs no data-flow analysis.

**Witnesses:** W-REPLAY-CLOCK (A0) · W-CORE-PURE (A3, red control) · per migrated file: its posting/parity witnesses identical · ERP parallel run
(`scripts/bridge/run_all.sh`) unchanged.
**Done when:** W-REPLAY-CLOCK `match=Y` on both time zones (or its bug fixed), W-CORE-PURE PASS on the agreed core list, `forbidden=0`, red control
FAILs as it should.
**DECISIONS:**
- 2026-11-14, owner, on **A-1** (which files are "core"; recommendation: the list measured in §VET — ERP `erp/processes/*.js`,
  `erp/callouts/*.js`, `ad_callout.js`, `doc_poster.js`, `model_*.js`, `rule_fold.js`, `crud_core.js` (112 files, 18 with calls); viewer
  `cpm_schedule.js`, `schedule_*.js` and `common/room_graph.js`; `viewer/tm_core.js` left out; `erp/kernel_ops.js` left out as the place
  that records the values): *"Yes"*. → **A-1 = that list.** Other geometry maths is not in it until the owner names files. A3's
  `W-CORE-PURE` scans exactly this list. A-2 asked next.
- 2026-11-14, owner, on **A-2** (one source for "now"/"today"; recommendation: Option 1, extend the login context): *"U git admin, manage
  commits question. On question, advice me as u know better."* → delegated to the recommendation (rule at the end of this file: "follow the
  advice" is his answer). **A-2 = Option 1: the login context (carries legacy's `#Date`) is the one source; the transaction's `env` and the
  fixed-time object used at company birth become views of it.** A1 may start. A-3 answered below.
- 2026-11-14, owner, on **A-3** (no date injected; advice given: core fails loudly with a `§` line, never falls back to the UTC day): *"Agreed"*.
  → **A-3 = core never falls back; a missing date fails loudly (`§` line). The EDGE records the session's local calendar day + instant + timezone
  offset in `SESSION_START` (the proposal in item 3 above, adds a field at `erp/kernel_ops.js:941`) and `today()` reads that day.** Settles bim-ootb
  **#2996** (fix lands with A2; `erp/ws_kernel.js` is the ERP lane's file: ask that lane first). A-4 answered below.
- 2026-11-14, owner, on **A-4** (timing reads; advice given: Option 1, `Env.elapsed()`): standing delegation *"On question, advice me as u know better."*,
  then *"continue what is pending"*. → **A-4 = Env.elapsed(); `performance.now()`/`Date.now()` are banned in core even inside a `§` call**, so
  W-CORE-PURE stays a plain call ban with no data-flow analysis. All of Part A's decisions are now answered: A1, A2, A3 may proceed.
- 2026-11-15, owner, on **A-5** (how a standalone core module with no transaction, `rule_fold.js` and `processes/PackIn.js`, gets its clock and id;
  advice given: Option 1, the shell installs the edge once): *"Go with your advice on Option 1."* → **A-5 = `Env.setEdge({nowMs, uuid, perfMs})`,
  installed once by the page; core modules ask `Env.edge()`; no edge installed = `§ENV_NO_DATE` + throw (A-3).** Spec: A2-EDGE below.

**A2-EDGE SPEC (2026-11-15, decision A-5; bim-ootb tracker issue opened with the PR).** Measured on bim-ootb `main` @ `27ac46cc`:
`erp/rule_fold.js:94` `commitEdit` mints the op uuid with `crypto.randomUUID()`, else `'rule:'+nextTs()` (a fallback that can collide across
sessions); its 4 callers are all in that file (`:116 :135 :145 :155`). `erp/processes/PackIn.js:39` builds DateProcessed from `new Date()`.
Both load only on `erp/idempiere.html` (`rule_fold.js` at line 647, `ad_callout.js` at 679; `capex/index.html` loads `ad_callout.js` but neither file).
**Build (one PR per file, `ad_callout.js` change rides with the first):**
- `Env.setEdge(edge)` in `erp/ad_callout.js`: `edge.nowMs` and `edge.uuid` must be functions (`perfMs` optional), else throw; stores it; logs
  `§ENV_EDGE set nowMs=Y uuid=Y perfMs=Y|N replaced=Y|N`. `Env.edge()` returns it, or logs `§ENV_NO_DATE no edge installed` and throws. Core code
  never calls a clock: `ad_callout.js` itself stays clock-free on this path. `Env.modelEnv(ctx, edge)` is NOT changed (callers pass their edge).
- The installer is EDGE code: one inline `<script>` in `erp/idempiere.html` right after `ad_callout.js`: `nowMs` = `Date.now`, `perfMs` =
  `performance.now`, `uuid` = `crypto.randomUUID` when present, else an RFC 4122 v4 id from `crypto.getRandomValues` (available outside a secure
  context too), so the id stays unique where the old `'rule:'+N` fallback did not. No new file, so no precache / `?v=` list grows (P2).
- `rule_fold.js` `commitEdit`: `uuid = Env.edge().uuid()`; the `'rule:'` fallback is removed (A-3). `nextTs()` stays: it is already a
  deterministic counter, not a clock.
- `PackIn.js` (second PR): `now = Env.stamp(Env.edge().nowMs()).now` (the same local stamp the hand-written line made; legacy
  `new Timestamp(System.currentTimeMillis())`, the server's local time).
**Witnesses.** Before/after, unchanged verdict lines: `erp/tests/poc_gated_complete.js` and `erp/tests/poc_i4_reconcile.js` (the real page drives
`RuleFold.setT` / `runGesture`), `capex/tests/witness_td_packin_window.js` (W-TD-PACKIN-WINDOW, the Pack In button), `erp/tests/witness_env_views.js`.
`erp/tests/witness_core_clock_reads.js` gains `rule_fold.js` (then `processes/PackIn.js`) in its list (`clockReads=0`), plus behaviour rows:
`§ENV_EDGE_HELPER` (a) a fixed edge in → `Env.edge().uuid()` returns it; (b) no edge → `§ENV_NO_DATE` + throw (red control: the old silent
fallback would return a value and FAIL this row); (c) an edge without `uuid` is refused. **Issue proved:** a core module reached the wall clock
and the RNG directly, and silently fell back to a colliding id; after: one edge, installed once, and a missing edge fails loudly.
**A2-EDGE RESULT (2026-11-15).** Built and merged: **bim-ootb #3030** (`Fixes #3029`: `Env.setEdge`/`Env.edge()` in `erp/ad_callout.js`, the
inline installer in `erp/idempiere.html`, `rule_fold.js` `commitEdit`) and **#3033** (`processes/PackIn.js`). **Spec deviations, said here:** (1) the
behaviour rows went into a NEW witness `erp/tests/witness_rule_fold_edge.js` (**W-RULE-FOLD-EDGE**), not into `witness_core_clock_reads.js`, which
only gained the two file names; (2) `poc_gated_complete.js` / `poc_i4_reconcile.js` could not serve as before/after: they wait for `#pill-kanban`,
which no longer exists, and FAIL on unedited `main` (left to the ERP lane, not fixed here). Evidence (logs read):
- W-RULE-FOLD-EDGE on unedited `main`: `§RFE VERDICT FAIL rows=4 fail=4`, R3 `outcome=returned id="rule:5001"` (the colliding fallback, live; every
  gesture op was `rule:500x`). After, and re-run on `main` @ `58376fe3`: `§RFE VERDICT PASS rows=5 fail=0` (PackIn re-run on `main` @ `51438e7e`: WTW PASS 4/4, `clockReads=0`); R2 on the real seed DB (GardenWorld 11,
  N=114) `edge_ids_minted=3 reversible=Y oracle=Y`; R5 the real page (headless, no GPU) `§ENV_EDGE_lines=1 §ENV_NO_DATE=0 setT_uuid=<v4> chainOk=Y`.
- W-TD-PACKIN-WINDOW: `VERDICT PASS judged=4` before, after #3030 and after the PackIn edit (W3 = DateProcessed on the local day). Under a load
  average of 22 it timed out at `page.goto` (load, not code): run it alone.
- `witness_core_clock_reads`: `ran=19` → `ran=21`, `rule_fold.js` and `processes/PackIn.js` `clockReads=0`; `witness_env_views` § lines identical.

---

## PART B — One manifest per app   (fixes P2, declares half of P1)

**Design.** Each app (`viewer/`, `erp/`, `modeller/`) gets one small JSON manifest listing every module it loads, in order:
`{ "file", "deps": [...], "load": "boot" | "lazy", "lazyGroup": "find", "precache": true | false, "v": 5 }`.
A generator script (dev-side, like `scripts/gen_global_types.js`) **writes** the derived parts that are hand-kept today: the page's
`<script>` block between two marker comments, the lazy list in `viewer/main.js`, each `PRECACHE_ASSETS`, every `?v=`, and the `CACHE_VERSION` bump
when anything it covers changed. The page stays a static file. **No build step at run time:** the generated text is committed, exactly as today.
- Load order becomes **declared** (`deps`), and the generator refuses a manifest whose order breaks a dependency.
- Lazy loading becomes an explicit flag. The generator refuses `load:"lazy"` + `precache:true` unless the owner allowed it (ERP/modeller lazy
  parts ARE precached for the air gap on purpose, `erp/sw.js:408-421`, so the rule is per app: decision B-2).
- `scripts/bump.js` becomes one line: change a module's `v` (or the generator bumps it from the content hash).

**Facts the design must respect (vetted 2026-11-13):**
- **ERP plugins are not listed in the manifest by hand.** By the AD-layer law a plugin arrives with zero host code. Plugin lists exist today
  (`BUILTINS`/`INSTALL_ONLY`, `erp/plugin_overlay.js:230-232`, and 29 `plugins/*.mjs` precache entries in `erp/sw.js`). Each plugin `.mjs` exports a
  `manifest` (read that way by `erp/tools/gen_2pack.js:22`). Decision B-4 says what B does with them.
- **What users download is minified.** A push to `main` runs `.github/workflows/deploy-pages.yml`: it stamps `erp/version.json`, builds the agent
  zips (`erp/tools/build_agent_zips.js`), and minifies own JS in `erp/ viewer/ common/` (`scripts/minify_pages.js`, esbuild 0.23.0, whitespace and
  syntax only, never identifiers; `modeller/` is not minified). Git keeps readable source. B generates SOURCE, so the round trip compares against git.
  Size budgets (F.3) are measured on the minified output, because that is what users pay for.
- **Concurrent sessions.** Today's `sw.js` merge rule (keep both precache additions, take the higher `CACHE_VERSION`, CLAUDE.md WORK-TO-ZERO)
  becomes: merge the manifest JSON, then regenerate. The generator must be stable (same manifest in, same bytes out, fixed order), so two sessions
  that regenerate after a merge get the same file.

**Migration:** B0 generator in **check mode only**: build the manifest FROM today's files (pages, `main.js`, `sw.js`) and prove that regenerating
them from it is **byte-identical** to what is committed. No file changes. B1 switch one app (smallest first: modeller, 59 tags) to "manifest is the
source", generated sections between markers, byte-identical again. B2 erp, B3 viewer. `tests/audit_sw_precache.js` stays green throughout.

**OPEN DECISIONS:** 1. versions: hand-kept `v` numbers, or content hashes (`?v=<8 hex>`)? Proposal: content hash. Nobody bumps by hand, and a
stale file is impossible. But it changes every `?v=` once, so every user downloads every tagged file again on the next visit, offline installs on
slow links included. That needs owner sign-off. 2. Lazy + precache per app: viewer lazy = not precached
(today's rule), erp/modeller lazy = precached (today's rule). Confirm, or make one rule. 3. Should the manifest also carry each module's
**owner** and **witnesses**? Proposal: yes, that is how D and E get their data for free. 4. ERP plugins (above): does B leave the plugin lists
alone, or derive the plugin precache entries from the `.mjs` files on disk? Proposal: derive the precache entries only, and leave `BUILTINS` as the
host's one list (B must not become a second plugin registry).

**Witnesses:** W-MANIFEST-ROUNDTRIP (manifest → generated text byte-identical to committed; red control: swap two dependent modules → generator
refuses) · `audit_sw_precache.js` · page boot witnesses unchanged.
**Done when:** all three apps generated from their manifests, round-trip identical, `bump.js` retired or reduced to "edit `v`", and the Pages
deploy workflow still green on the first merge after each switch (fetch `erp/version.json`, §F.2 Fetch back).
**DECISIONS:** *(none yet)*

---

## PART C — Named APP parts, each with one owner   (fixes the rest of P1; slow, background)

**Design.** Instead of 1,688 loose fields on one object: named parts, `APP.scene`, `APP.stream`, `APP.panels`, `APP.schedule`, `APP.film`,
`APP.find`, `APP.erp`, …, each **owned by one module** that declares its fields in a JSDoc `@typedef` (in `types/`, editor-only). A field nobody
owns is visible at once, so phantoms cannot exist, and "where is this set?" has one answer (F12 works through the typedef).
Compatibility during migration: the old flat name stays as an alias that forwards to the new place, and the alias is deleted when its last reader
moves. **How the alias forwards:** a plain copy does not forward (a later `A.x = …` splits the two), so the alias is an accessor
(`Object.defineProperty(A, 'x', { get, set })`). A getter on a field read every frame (e.g. `A.camera`) is a call per read: measure it on one hot
field before migrating `scene`, and log the cost in a `§` line (PERF BUDGET). **Protected lane:** a field read by `fx_*`/`effects`,
`cinema_path_editor` or `maxq_*`/`cinema_maxq` keeps its alias until the owner lifts §S59, so C can delete only the aliases those files do not read.
**Migration:** one part at a time, `scene` first (it creates `APP.camera`, `viewer/scene.js:163`). This replaces
`REFACTOR_FOR_READERS.md` item 6 (`A` → `APP` rename) and absorbs item 4 (phantoms).
**OPEN DECISIONS:** 1. The list of part names and which module owns each (proposal drawn from the folder roles in `docs/DeveloperGuide.md` §1.1). 2.
Keep `A` as the parameter name inside `setupX(A)` (less churn), or rename to `APP` while moving (greppable)? Proposal: rename while moving.
**Witnesses:** `scripts/gen_app_surface.js` counts: phantoms → 0 for migrated parts; total reads unchanged; each module's witnesses identical.
**Done when:** every agreed part has its owner module and typedef, phantoms 0 for migrated parts, and every alias deleted except those the protected
lane reads (listed by name in this file).
**DECISIONS:** *(none yet)*

---

## PART D — App-wide owner table, generated   (fixes P4)

**Design.** Generalise `prompts/4D_MODEL_INTEGRITY.md` §I to the whole app: a table *question → owner file* ("what is today", "is this element
supported", "post a document", "route a pipe", …). It is generated from the manifest (B, `owner` field) plus a small hand-kept list of questions.
The generator **flags a second implementation**: a global published by two files (already detected by `scripts/gen_global_types.js`'s multi-publisher
list) or a function with the same normalised body in two files. That turns duplicates from an accident into a red check.
**OPEN DECISIONS:** 1. Where the questions list lives (proposal: next to the manifests, one JSON per app). 2. Is a namespace extended by several
files on purpose (`Bonsai.x = …` from 3 files) allowed? Proposal: yes, if the manifest marks it `"extends": "Bonsai"`.
**Witnesses:** W-OWNER-UNIQUE (every question one owner; red control: register a second owner → FAIL).
**Done when:** the owner table is generated for all three apps, W-OWNER-UNIQUE PASS, its red control FAILs, and each duplicate found today
(`ERPKernel`, `routewalker.js`, the `Bonsai`/`ERP` publishers) is either marked `"extends"` or has its own tracker issue.
**DECISIONS:** *(none yet)*

---

## PART E — A proof map   (fixes P5)

**Design.** Every witness declares, in its spec header, the module(s) and spec rule(s) it proves (`PROVES: viewer/db_resolve.js R1-R4`). One
generator writes the map *module → witnesses → last verdict* and *rule → witness*, from the headers plus the suite log. One runner
(`tests/run_witness_suite.js`) and one path resolver (`witness_kit/paths.js`, replacing hard-coded home folders) serve every folder. New witnesses go
in `<app>/tests/`. Existing ones are moved later, mechanically, using the map. `witness_kit/paths.js` does not exist yet; E creates it.
**Owner of the witness contract:** bim-compiler `prompts/WITNESS_INTERFACE_FRAMEWORK.md` (read §CRISIS first) and bim-ootb `witness_kit/contract.js`.
E builds the map on that contract and must not define a second one. The map stores **PASS / FAIL / INCONCLUSIVE** (and VACUOUS where the contract
emits it) and never counts INCONCLUSIVE as PASS (CLAUDE.md PRIMAL LAW 4).
**OPEN DECISIONS:** 1. The header keyword (`PROVES:`) and format. 2. Does the suite log persist (like `~/.cache/bim4d/`) so the map can show last
verdicts? Proposal: yes, a small JSON per run.
**Witnesses:** W-PROOF-MAP (every production module has ≥1 witness or is listed as unproven; red control: a header naming a missing module → FAIL).
**Done when:** the map is generated from headers plus the suite log, W-PROOF-MAP PASS, red control FAILs, and no hard-coded home folder is left
in a witness that the map lists.
**DECISIONS:** *(none yet)*

---

## PART F — A VS Code extension for this codebase   (owner: *"a plugin or addon that specifically handles this codebase elegantly and dev help really"*)

**Prior art, do not re-triage:** bim-ootb `prompts/DEV_TOOLKIT_NO_AI.md`, PARKED 2026-10-06, spec complete enough to build: 26 tools → 6 extensions
(X1 §-Lens, X2 Live Doctor, X3 Maps, X4 Rules, X5 Workflow, X6 Witness & Ship) on 3 engines (E1 log parser, E2 live-tab bridge, E3 static parser), a
symptom playbook (§3), first slice (§6), admin decisions (§10). It is about **runtime debugging** without AI. Its spikes S0/S2 come first.

**Decisions already taken there, binding here (do not re-ask):** §8 layout: source in `bim-ootb/devtools/vscode/`, one folder per extension
(`x1-slens/` … `x6-witness-ship/`, shared `engines/`), and `pack/` = an Extension Pack. §10: name *BIM DevTools*, pack id `bim-devtools`,
distributed as a `.vsix` attached to GitHub Releases (Open VSX / Marketplace only after the first slice is witnessed). So X0 is one more folder,
`x0-navigator/`, inside that pack.

**What this design adds: a code-structure extension, "X0 Navigator"**, built on the data parts A–E produce. It holds **no knowledge of the codebase
itself**: it only reads the generated files, so it cannot drift from the code.

| Feature | Dev's question | Reads | Available after |
|---|---|---|---|
| F12 / hover / find-references for `APP.x` and `A.x` fields (a DefinitionProvider) | "Where is this field set?" | `internal/APP_SURFACE.md` (today), named parts (C) | **now** (APP_SURFACE exists) |
| `§TAG` hover → the spec paragraph + the code that prints it | "What rule is this tag?" | prompts/docs + source (= DEV_TOOLKIT T4) | now |
| CodeLens on line 1 of every file: `boot · precache · v5 · owner: … · 3 witnesses (last: PASS)` | "How is this file loaded, who owns it, what proves it?" | manifest (B) + owner table (D) + proof map (E) | B, D, E |
| Bump on save (or a quick-fix "this precached file changed: bump?") | "Did I forget the cache bump?" | `scripts/bump.js` today, manifest (B) later | now |
| "Run the witnesses for this file", with the verdict in the Testing panel | "Did I break it?" | proof map (E), suite runner | E |
| Owner warning: "a second implementation of *what is today*" | "Am I duplicating an owner?" | owner table (D) | D (also unparks DEV_TOOLKIT T6 Owner Trace) |
| Core-purity squiggle: `Date.now()` in a core file | "Am I breaking determinism?" | W-CORE-PURE rule (A3) | A |
| Lazy/boot badge in the status bar for the open file | "Will this load at start?" | manifest (B) | B |

### F.2 Run & Ship: localhost, commit, deploy, fetch back from github.io   (owner: *"The VSC tool aid can help control launch in localhost or deploy and fetch etc"* · *"helps commit to github and run from the standard project URL github.io/"*)

The full loop a developer runs by hand today, as a panel of stepped commands. Each step prints a `§` line and stops on the first failure.
**It calls the project's existing scripts and never re-implements them** (DEV_TOOLKIT T26 Ship Runner's own rule).

| Step | What the panel does | Uses (existing) | Facts it relies on (measured 2026-11-13) |
|---|---|---|---|
| **Run local** | start the static server, open the chosen app (Viewer / ERP / Modeller) in Chrome with the debugger attached; show which `CACHE_VERSION` the tab is running vs the disk | `.vscode/tasks.json` *Serve repo*, `.vscode/launch.json`; DEV_TOOLKIT T2 Version Doctor for the tab version | precached files are cache-first, so the panel warns "tab is on v1709, disk is v1710: reload / Update on reload" |
| **Check** | lint, precache audit, the witnesses for the changed files (proof map, part E), bump if a precached file changed | `npx eslint viewer modeller`, `tests/audit_sw_precache.js`, `scripts/bump.js`, `npm test -- --filter …` | |
| **Issue + commit + PR** | FOSS flow: pick or open the tracker issue, branch from fresh `main` in a worktree, commit with a conventional title, push, open the PR with `Fixes #N` and the `§` evidence pasted in | `git`, `gh` (the developer's own login) | `docs/DeveloperGuide.md` §10. Push and PR steps always stop and ask first. The PUSH PAUSE rule (`CLAUDE.md`) is prose the extension cannot read, so the developer answers it at that prompt. A machine-readable switch would be a new owner decision, not assumed |
| **Deploy** | bim-ootb: merge the PR. A push to `main` runs `.github/workflows/deploy-pages.yml` (stamp `erp/version.json`, build agent zips, minify `erp/ viewer/ common/` JS with `scripts/minify_pages.js`, upload the tree), so merged = deployed **once that workflow succeeds**. The repo's Pages setting also shows a legacy branch build (both ran for the same push on 2026-11-13; live was the minified artifact). Docs site (BIMCompiler): `scripts/safe_gh_deploy.sh` only, dry run first. Building DBs: object storage per `deploy/OCI_UPLOAD.md` §RULES (every upload with `--content-type`) | `gh pr merge`, `scripts/safe_gh_deploy.sh`, `oci` | never bare `mkdocs gh-deploy` (`CLAUDE.md` §Docs deploy) |
| **Fetch back** | wait for Pages, then fetch from the **project URL** (`https://red1oon.github.io/bim-ootb/<app>/…`, docs `https://red1oon.github.io/BIMCompiler/…`): HTTP 200 for each changed file; live `erp/version.json` `sha` == the merged commit; live `CACHE_VERSION` == `main`; live bytes == the bytes `scripts/minify_pages.js` makes from that commit (run on a throwaway copy, as the workflow does), or == committed bytes for `modeller/` (not minified); and the page's boot `§` lines from a headless check if the owner allows | `curl`/fetch; the DEV_TOOLKIT T26 steps 7–10 | 2026-11-13: live `CACHE_VERSION` viewer v1709, erp v1068, modeller v272. Modeller `sw.js` live == committed bytes; viewer and erp `sw.js` live are minified, so a raw byte compare FAILs by design. A green pipeline is not a deployed feature: always fetch (`prompts/AGENT_QUEUE.md`, this repo) |
| **Open live** | open the github.io URL of the app being worked on, the same way users reach it | | |

Rules for F.2: no step runs without the developer pressing it. Deploy and push steps show what they will do and ask first. Headless browser checks only
with the owner's go (GPU/VRAM contention with a live session is a known crash, memory `feedback_gpu_vram_contention_crashes_user_tab`).
Witness `W-SHIP-PANEL` (node, fixtures): a sandbox repo where (a) a planted syntax error stops at Check, (b) a precached file changed without a bump stops
at Check, (c) a fake "live" server returning an old `CACHE_VERSION` makes Fetch back FAIL, (d) a live `version.json` whose `sha` is not the merged commit makes
Fetch back FAIL. **Red control:** compare against a wrong hash, which must FAIL.
OPEN DECISION F-1: does Fetch back run a headless browser for the boot `§` lines, or only HTTP + version + hash? Proposal: HTTP + version + hash by
default. Headless is a button the owner enables.

### F.3 What advanced teams built, adapted here + a "what will this cost if deployed" monitor   (owner: *"suggest things that advanced devs have done in tools that can help here"* · *"with monitors that can tell its perf impact if deployed"*)

Well-known tools, named as **prior art to copy the idea from, not to install** (each would be a new dependency; the adaptation is a small
dev-side script or an X0 feature). The descriptions are general knowledge, not measured here.

| Prior art (what it does there) | The idea | Adapted here |
|---|---|---|
| **size-limit / bundlesize**: fail a PR whose JS grows past a budget, and comment the delta | a size budget per entry point | **boot-bytes and precache-bytes per app**, measured on the minified output (`scripts/minify_pages.js`, what users download), from the manifest (B) or, until then, from page tags + `PRECACHE_ASSETS`. The PR shows `viewer boot +12 KB · precache +0`. Over budget = red |
| **Import Cost** (VS Code: size shown next to each import) | see the cost while typing | CodeLens on line 1: `boot · 84 KB · every user pays this at start` vs `lazy (find) · 0 at start` |
| **bundle analyzer treemaps** | see where the bytes are | treemap of each app's boot bytes by folder/family (viewer `fx_*`, `tm_*`, …) |
| **Chrome DevTools Coverage** (JS loaded but never run) | find code that should not be at boot | a headless boot of each app (owner's go) lists boot files that ran **zero** functions, as candidates for the lazy list |
| **Lighthouse CI**: run a page per PR, assert budgets (load time, blocking time), keep history | measured budgets per PR | for the ERP shell (no WebGL, cheap): time to `§INIT`, using the browser's built-in `performance.mark/measure` (today **0** files use them; add marks, no library) |
| **continuous benchmarking with bisect** (e.g. the Rust compiler's perf site, Chromium's perf dashboard): run fixed benchmarks on each commit, flag regressions, bisect to the commit | a perf history per commit | the `§` heap/verts lines the PERF BUDGET already asks for, collected per commit for fixed reference buildings into a JSON history (DEV_TOOLKIT T21 Perf-budget history); a jump flags and names the commit range |
| **Danger.js / PR bots**: rules that comment on a PR ("changed X without Y") | project laws as PR checks | a plain-node CI step: `sw.js` changed without `CACHE_VERSION` · lazy module added to precache · `Date.now` in a core file · new global missing from `eslint.globals.json`. Reuses W-CORE-PURE, `audit_sw_precache.js`, the manifest checks |
| **CODEOWNERS** (GitHub asks the owner to review paths they own) | route a change to its owner | generated from the owner table (D): each lane's files list the session/person to ask, so the X0 panel says "ask <owner> before editing" |
| **mutation testing (Stryker)**: change the code on purpose, check that a test fails | prove tests can fail | automated red controls: flip one comparison in the module a witness PROVES (E) and check the witness goes red (DEV_TOOLKIT T14/T25) |
| **preview/canary deploys** (a per-PR preview URL before production) | see it live before users do | **Not adopted yet: bim-ootb has no preview host.** Pages serves only `main` (§F.2 Deploy). `deploy/dev/` is bim-compiler's own object-storage dev tree, not a bim-ootb preview. Until the owner picks one, the preview is **Run local** on the PR branch. A hosted preview is OPEN DECISION F-7 |
| **real-user monitoring** | perf from real users | **not adopted: the app is local-first and air-gapped, so no phone-home.** Instead a local *flight recorder*: the user can export their own `§PERF` lines on request |

**The perf-impact monitor ("what will this cost if deployed"):** shown in the PR and in the X0 panel *before* merge, in three tiers:
1. **Static, always (no browser, deterministic):** boot bytes and precache bytes per app, diff vs `main`; files moved between boot and lazy;
   new geometry passes without a cost `§` line.
2. **Model estimate, always:** for a change that adds geometry, the vertex delta on the reference buildings (from the cached runs, like
   `~/.cache/bim4d/`) times the measured fit **heap ≈ 0.173 GB per million vertices** (`docs/BrowserScaleBenchmark.md`, r = 0.997 over 3 buildings, "treat as
   indicative"). Shown as an estimated peak heap per building, against a phone line (the PERF BUDGET's *unverified* ~0.6 GB / ~4 M verts per tab).
3. **Measured, only with the owner's go:** headless boot of the reference pages on the PR build vs `main`: time to `§INIT`, `performance.memory` heap,
   draw calls, verts. A regression beyond the threshold (OPEN DECISION F-2) flags the PR, and the history (above) bisects it. Never run beside a live
   session's GPU work.
**Witness `W-PERF-IMPACT`:** fixture PRs where (a) a boot script is added → boot bytes rise by exactly that file's size, (b) a lazy module is moved to
boot → flagged, (c) a planted +1 M-vertex pass → estimate rises by ≈ 0.17 GB. **Red control:** a change with no cost must show zero delta.
**OPEN DECISION F-2:** the budgets: per-app boot-bytes ceiling, allowed heap growth per PR, `§INIT` time regression threshold, and which reference
buildings (proposal: the three in `BrowserScaleBenchmark.md`, named by role, not by client).

**AI assistance is the developer's choice, never required** (owner: *"it can allow code-assist on user choice as there are those plugins for
that, but at least make it resourceful"*). Every feature above works with no AI, no network and no account. That is the point of the
extension: the project's knowledge (patterns, owners, rules, proofs) is **in the tool, not in an assistant's head**. For a developer who *chooses*
an AI assistant plugin (any of the existing ones), X0 makes that assistant better informed, without the extension itself ever calling a model:
- **"Context for this file"** command: assembles, from the generated data only, the file's spec header, owner, load mode (boot/lazy, precache),
  witnesses and last verdicts, the `§` tags it prints, and the project rules that apply (minimalism, twin, AD-layer, no `Date.now` in core) into a
  markdown block. It is copied to the clipboard or opened beside the code, ready to paste into whatever assistant the developer uses.
- **Optional assistant tools:** where the developer's assistant supports VS Code's own extension points for chat participants/tools (e.g. a
  `@bim` participant, or tools such as "who owns X", "which witness proves this file"), X0 registers them, **off by default** and switched on in
  settings. They answer from the same generated files, so the assistant gets facts, not guesses.
- **Never:** the extension does not call a model, send code anywhere, or need an API key. No paid calls (standing rule). Anything an assistant does
  is the developer's own plugin, on their own account, by their own choice.
DECISION F-3 (ANSWERED: (b) built first, then (a); (c) dropped. Archive §F.14, §F.16). The question was: which assistant help? (a) the "Context for this file" command only; (b) plus a **local MCP fact
server** that answers the same questions from the same generated files for ANY assistant (Claude Code, Copilot, Cursor, Continue …), never
calling a model; (c) VS Code's own chat-participant API, which only VS Code's chat uses. Proposal: (a) now, (b) next, drop (c).

**Shape:** per DEV_TOOLKIT §8/§10 (above): one Extension Pack of separate extensions, plain JavaScript using only the `vscode` API (no npm
dependencies, no compile step), in `bim-ootb/devtools/vscode/`. **Install:** `node devtools/vscode/pack.js` writes a real `.vsix` (plain
node, no npm), then `code --install-extension devtools/vscode/dist/x0-navigator-0.1.0.vsix`. **Never a symlink into
`~/.vscode/extensions/`:** VS Code ignores a folder its `extensions.json` does not list (archive §F.10).
**Witnesses:** each feature has a lib function witnessed in node on a fixture with a red control, a check through a stub of the `vscode`
calls, and a check in the real editor (`tests/realvsc/`). The list is in `devtools/vscode/x0-navigator/README.md`.
**Open decisions in F:** F-1 (§F.2), F-2 and F-7 (§F.3). Everything else is answered (below).

### F.22 Hover an ERP field, see every layer of code behind it   (owner 2026-11-15; decision **F-17**)
- 2026-11-15, owner: *"Can we do one when we hover an ERP panel item? But i reckon, similar to BIM, there maybe other layers of code at that spot?"* → advice: yes, a STACK, not
  one line (AD-LAYER LAW: one generic engine + named layers registered per table/column); show every registered layer in firing order (recommended) or only what ran on
  the last edit. Owner: *"So BIM has no layers? Go with your layering tool tip idea"*. → **F-17 = every registered layer, in firing order.** (BIM answer given: it has
  layers too — the size sources, the pass-through stamps, the door cuts, the edits after Convert; a layered BIM tooltip may follow, not now.)
- **Measured 2026-11-15 (bim-ootb `main`):** form fields carry `data-ad-table` + `data-ad-column` (`erp/crud_overlay.js:1553`), so no stamp is needed: the ERP's own
  registries are the index. Each keeps its layers with owner and rank (`erp/layered_registry.js:32-35`) and says so in `describe()`: callouts `erp/ad_callout.js:1051`
  (classes + legacy handlers; per-column callouts `findColumnCallouts` `:437`), model hooks + doc actions `erp/model_layer.js:643`, processes `erp/ad_process.js:1176`.
  Every registration is a call with a literal first name: `ML.registerModel` 72 + `MLo.registerModel` 4, `P.defineProcess` 56, `ML.registerDocAction` 26,
  `A.defineCallout` 17, `A.defineColumnCallout` 4. The node kernel loads all of them (`erp/ws_kernel.js:20-31`).

**F.22 SPEC (dev-only, the same pattern as §F.21 slice 2; nothing shipped changes).**
- **Index, generated:** `devtools/hover/erp_sites.js` (espree over `erp/**/*.js`, vendored and `tests/` excluded) → every registration call
  `{kind: callout|column-callout|process|model|docaction, name, file:line}` plus, per file, the iDempiere Java file:line its comments cite (comments read through the
  parser's comment list, not by text search over code). `node devtools/hover/gen_erp_index.js` → `devtools/hover/erp_index.json` (git-ignored: absolute root).
- **The stack for (table, column), in firing order** (`stackFor()`, pure, used by the page AND the node witness): 1 the dictionary row (`AD_Column`: reference,
  default, mandatory / read-only logic) · 2 ON CHANGE: each `Class.method` of `AD_Column.Callout`, then the per-column callouts, each with owner@rank and file:line, or
  `UNPORTED` when nothing is registered (never a guessed file) · 3 PICKER: the `AD_Val_Rule` (name + its SQL; it is data, it has no file) · 4 ON SAVE: the table's model
  hooks (owner@rank: beforeSave / afterSave / …) and its doc action · 5 BUTTON: the column's `AD_Process` Classname → the registered process · 6 per layer, the legacy Java
  file:line its file cites. Keys **1-9** open that layer's line in VS Code (`vscode://file/<root>/<file>:<line>`).
- **Overlay:** `devtools/hover/erp_hover.js`, bookmarklet-loaded into `erp/idempiere.html` on localhost; reads `window.__idmpDb` and the registries' `describe()`;
  prints `§ERP_HOVER installed index_entries=N` and per new field `§ERP_HOVER table= column= layers=K [kind:name@file:line …]`.
- **Witness W-ERP-HOVER** (`devtools/hover/tests/witness_erp_hover.js`): E1 index = a fresh parse, and every registered name the registries report has its line ·
  **E2 the denominator (AD-LAYER LAW, "X of N"):** node kernel + `erp/ad_seed.db`: for EVERY column shown on an AD window (`AD_Field`→`AD_Tab`→`AD_Window`, active), the
  stack is built; prints `§ERP_HOVER_W fields=N with_layers=K callouts_named=a resolved=b unported=c models=…`; FAILS on any layer whose file:line does not resolve
  (UNPORTED is reported, not failed: it is a coverage fact) · E3 red control: one index entry removed → the judge counts that layer as unresolved · E4 THE PAGE (headless,
  CPU, ONE session, `nice`): GardenWorld login, the Sales Order window, the overlay, REAL mouse hovers on fields with layers → the tooltip's stack = E2's for that column;
  key 1 records the `vscode://` link. INCONCLUSIVE if E4 hovered 0 fields with layers.
- **Issue proved:** *"what code runs when I touch this field?"* needed reading the dictionary and four registries by hand; after: hover it, the whole stack in order.

**F.22 RESULT (2026-11-15): built and merged, bim-ootb #3055 + fixes #3057, #3059; re-run on `main` @ `b71c15fe`: `§ERP_HOVER_W VERDICT PASS fail=0`.** E2 over every active AD window field:
`fields=12323 with_layers=3311 lines_resolved=6590 wrong_line=0 unresolved=0 unported=199 (distinct 169)`; E2b `false_unported=0`; E4 (Sales Order, real page) `same_as_node=33`, `keys tried=112
wrong_or_dead=0`. Built beyond the spec: model validators are listed from the index before the page's first save (`crud_overlay.js:1968` installs them lazily); Alt+1-9 for a focused field;
the Java citation is the one ON/just above a registration, or the file's own only when the class names match (v0 put `PO.java` on model hooks). **Corrections, said to the owner:** #3055's
`unported=213` was wrong (real callouts called UNPORTED: CalloutEngine is put in directly); a dead key in the tooltip (#3059). Prior art and the film: `prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 2.

### §F index — what is built (one line each; the full section is in the archive under the same name)

| § | What | bim-ootb PR | The line that proves it |
|---|---|---|---|
| F.0 | Zero-code editor wins: workspace file, clickable witness failures, snippets `witness` / `slog` / `spec` | #2919, #2963 | `§EZC checks=4 verdict=PASS` |
| F.4 | X0 Navigator slice 1: F12 + hover on a field of the shared object, `§TAG` hover | #2922 | `§X0_APPDEF … verdict=PASS` |
| F.5 | X0 keeps its own fresh index in VS Code's storage (F-10) | #2925 | `§X0_FRESH … verdict=PASS` |
| F.6 | Measurement: values beside the code were not worth building before logs name their code (F-9 closed) | — | 26.8% coverage, in the archive |
| F.7 | Every saved log starts with a `§LOG_STAMP` (F-11) | #2928 | `§LOG_STAMP_W` |
| F.8 | Finding + fix: a nested checkout was indexed as source | #2931 | rule R10 |
| F.9 | X0 in a real VS Code (`tests/realvsc/`) + the first film | #2933 | `§X0_REALVSC … verdict=PASS` |
| F.10 | Finding + fix: the documented install did not load; `pack.js` makes a real `.vsix` | #2939 | `§X0_INSTALL` |
| F.11 | Film 1 "Editing Real Code", recut v5. The owner: fine as it is, no recut | — | `~/Videos/Editing_Real_Code_EN_AFTER_2026-11-14_v5.mp4` |
| F.12 | First versions: Cost if deployed · values beside the code · Run & Ship | #2944, #2946, #2948 | `§PERF_IMPACT`, `§LENS`, `§SHIP_PANEL` |
| F.13 | Pages findings: the stamp fixed; the source is the workflow build (F-12 step 1). Step 2 waits for a token | #2951 | `§SHIP_FETCH … verdict=PASS` |
| F.14 | Local facts server for an assistant (MCP), OFF by default (F-3 (b)) | #2955 | `§X0_MCP tools=8 … verdict=PASS` |
| F.15 | Values beside the code, three steps (F-13): reads `~/.cache/bim4d` and the bake writes the stamp · the hover names the reason · the rule as Developer Guide §6.1 | #2977, #2970, #2981 | `§LENS … extra_dir=Y bake_env_not_a_stamp=Y … verdict=PASS` |
| F.16 | *Context for this file* (F-3 (a)): command + facts-server tool | #2966, #2968 | `§X0_CONTEXT … verdict=PASS` |
| F.17 | The index called 130 live fields dead: gate widened, `PHANTOM?` for what it cannot tie; new guide picture; docs redeployed | #2964, #2972, #2975 | `§APP_SURFACE … phantom=171 untied=11` |
| F.18 | Film 2 "It said dead. It was alive." (scripts `scripts/film_ide_x0_2/`) | — | `§FILM_GUARD … verdict=PASS`; `~/Videos/Editing_Real_Code_2_EN_AFTER_2026-11-14_v1.mp4` |
| F.19 | Find All References (generator rule R12) + facts-server `where_is_field_used` | #2985 | `§X0_REFS … verdict=PASS` |
| F.20 | One-click cache bump on save (F-6) | #2988 | `§SHIP_PANEL … one_file_needs=Y applied=Y`, `realvsc bump=Y` |

**Not built, and why (do not start these without what they wait for):** the lazy/boot badge, the line-1 summary, "run the witnesses for
this file", the owner warning and the determinism squiggle wait for the data of parts B, D, E, A. Complete Run & Ship (issue, commit,
PR, deploy), budgets and a hosted preview wait for F-1, F-2, F-7. DEV_TOOLKIT's runtime-debug slice needs a browser run (owner's go).

**F decisions answered, in the owner's words (the full exchanges are in the archive):** F-3 *"Both."* → the facts server, OFF by default;
later (a) too · F-4, F-5 by DEV_TOOLKIT §8/§10 · F-6 *"go for one click"* · F-8 *"advice me and proceed"* → own providers, no TypeScript
plugin · F-9 closed "not next", then built as F.12b once logs were stamped · F-10 and F-11 *"Go with your advice."* · F-12 *"Both."* (step 1
applied on *"yes do it"*) · F-13 *"ok"*, then *"Follow your yes advice."* · film 1 *"Past film is OK as it delivers the idea."* · film 2
*"This one again is a conceptual idea. Proceed."* **Still open in F: F-1, F-2, F-7.**

### F.21 Hover in the app, jump VS Code to the code   (owner idea 2026-11-14; decision **F-14**; not built)
- 2026-11-15, owner, on **F-14** (which surface first; advice given: the ERP window): *"About experimental browser hover, let's go for Modeller
  canvas first as we try to debug the 2D processing accuracy, and then BIM to ERP."* → **F-14 = the Modeller canvas first (DXF → BIM accuracy
  debugging), then BIM → ERP.** Still a DEV-ONLY overlay on localhost (advice 3 of the 2026-11-14 idea, minimalism §13).
- **Measured 2026-11-15 (read-only, bim-ootb `main` @ `27ac46cc`, all paths `modeller/`):** a DXF element on the canvas is a `THREE.Mesh` with only
  `userData.featureId` = the `kernel_ops` id (`bonsai_kernel.js:285-286`). Hover already exists: `pointermove` → `setHover` → `CustomEvent('dagevu:hover',
  {detail:{fid}})` (`modeller.html:1710-1728`); a tooltip precedent listens to it (`edit_delta_ui.js:77-83`). The op's `parameters.provenance` holds
  `{dxf_handle, layer, sheet, run_id, prov_kind, ifc}` (`dxf2bim_import.js:593-598`, `:623`), readable after reload by `Bonsai.oplog._geomOps()`
  (`bonsai_oplog.js:300-305`). **The gap:** nothing records WHICH rule or code made an element (no gate / verb / function anywhere in the element or
  the op; producers are `dxf2bodies.js` `:389`, `:422`, `dxf2bim_import.js` `toOps` steps 1, 2, 2b, 3, and `dxf2bim/dxf2shell.js`); merged walls keep
  a `+`-joined handle list with no rule per piece; no `§` line prints element + handle + rule.
- **OPEN F-15 (ask next): where is "which code made this element" recorded?** (a) a field added to `provenance` in the op (changes op bytes and
  every pinned op hash / sha; shipped data grows); (b) a trace switch, OFF by default: when on (localhost dev only), each producer site records
  `handle → producer name` in a side map the overlay reads; ops and their hashes stay identical. **Recommendation: (b)**, the producer recorded as a
  NAME (e.g. `dxf2bodies.wallFromLines`) that the X0 index turns into file:line, so line numbers never go stale in data.
- 2026-11-15, owner, on **F-15**: *"go with (b)"*. → **F-15 = a trace switch, OFF by default; producer recorded by NAME in a side map; ops unchanged.**

**F.21 SLICE 1 SPEC — the trace (2026-11-15; no browser, no UI; the hover is slice 2).**
- **One helper, no new file:** `Dxf2Prep.trace(key, el)` in `modeller/dxf2prep.js` (the module almost every producer already loads; it is on the
  Modeller's lazy list `dxf_import_ui.js:14`, so nothing new is boot-loaded or precached). It returns `el`. When `globalThis.__DXF_TRACE` is a `Map`
  it records `guid → key`; otherwise it does nothing (the OFF path is one `typeof` test). Producers wrap the object they push:
  `els.push(P.trace('dxf2walls:wall', {...}))`. The key is a string literal `'<module>:<what>'`, so a parser finds the one line that made the element.
  `dxf2bim/` (the shared library) is not edited: its elements are stamped where `dxf2bim_import.js` takes them in.
- **CLI `--trace`** (`modeller/dxf2bim_cli.js`): sets the map before the run, writes `trace.json` `{guid: key}` beside `bodies.json`, and prints
  `§DXF_TRACE elements=N traced=T untraced=U keys=K`, plus `§DXF_TRACE_UNTRACED guid= class= kind= handle=` for each element no producer claimed
  (the gap list that says which site still needs a stamp). `bodies.json`, `ops.json`, `verdict.json` are NOT changed by the switch.
- **Witness W-DXF-TRACE** (`modeller/tests/witness_dxf_trace.js`, node), on the CLI-marked shed set (`SHED_MARKED`; missing = INCONCLUSIVE):
  T1 the switch changes no data: `bodies.json` + `ops.json` sha-256 identical with `--trace` off and on · T2 coverage: `untraced=0` over every
  body (the shed: 512) · T3 every key resolves: an espree parse of `modeller/*.js` finds exactly ONE `trace('<key>', …)` call per key, printed as
  `§DXF_TRACE_KEY key= bodies= at=<file>:<line>` (the resolver slice 2's hover uses) · T4 red control: the T2 judge run on the map with one key's
  entries removed must report `untraced>0` · OFF run: `globalThis.__DXF_TRACE` stays undefined. **Issue proved:** an element on the canvas cannot
  be traced to the code that built it; after: every body names one source line, and the switch leaves the model byte-identical.
- **Input found 2026-11-15:** `~/Videos/dxf2bim_film_work/why/cli/marked` (the default of **39** `modeller/tests` witnesses) no longer exists, so those
  witnesses SKIP / INCONCLUSIVE today. A leftover `/tmp/w_reg_report_2156169_b/marked` (2026-10-31, re-marked sheets) reproduces the known fact
  `gate STRUCTURE ok=true bodies=512` (`--complete --pack pwd2024_bd`). Slice 1 runs on a copy of it; restoring the default folder is the owner's call.

**F.21 SLICE 1 RESULT (2026-11-15): built and merged, bim-ootb #3043 (`Fixes #3042`), re-run on `main` @ `f7cb6425`: `§DXF_TRACE_W VERDICT PASS bodies=512 keys=11 fail=0`.**
- 27 builder lines in 14 modules stamped; `dxf2bim/` untouched (`dxf2bim_import.js` stamps what it takes in, through `_trace` → `Dxf2Prep.trace`). First key = the
  builder; a later pass-through stamp is appended (`a > b`), never replaces it (0 such chains on the shed).
- Model untouched: `bodies.json` / `ops.json` / `verdict.json` sha-256 identical on unedited main, the branch with the switch off, and on (`e4bca8a8…`, `62d4bc7b…`, `10591e3e…`).
- Full runner before → after (same machine, same input): `§ALLWITNESS PASS=106 FAIL=10 SKIP=5 ENV=12 of 133` → `PASS=107 FAIL=10 SKIP=5 ENV=12 of 134`; every verdict and
  FAIL line identical, +1 = `witness_dxf_trace`. The 10 FAILs and the ENV/SKIP-set drift are on unedited `main` (missing inputs; not this lane's).
- **What it showed (shed):** 96 columns = 32 from `dxf2bodies.js:422` (20 drawn, 12 derived) + **64 synthesized by `dxf2synth.js:62`**; 144 of 168 members
  (`dxf2section.js:89`) and 108 of 117 plates (`dxf2section.js:103`) are `assumed`. `dxf2bodies.js:422` alone builds 99 bodies (footings, 32 columns, beams): the
  trace names that line, not the branch inside it (coarse there, by design; finer only when a real accuracy bug needs it).
- **Machine load:** two runner suites in parallel saturated the machine (a peer session asked to throttle, 2026-11-15). Run ONE suite at a time, under `nice -n 19 ionice -c3`.
- 2026-11-15, owner, after the advice "next: the hover (slice 2), witness-led; then use it on the 64 synthesized columns; the X0 witness stub after": *"WITNESS, go
  with your recommendation."* → **slice 2 is GO, witness first.** The X0 "New witness for this file" command waits until slice 2 is done (not asked again).
- **Inputs restored 2026-11-15 (owner: *"Restore what is needed"*):** `~/Videos/dxf2bim_film_work/why/raw` = the 9 raw sheets from
  `~/Projects/SYSNOVA/DXF2BIM/ShedDrawing/sheets/`; `…/why/cli/marked` = the 9 marked sheets from `~/.cache/capex_uat_dryrun/shed_cli/marked/` (2026-11-14, original file
  names; its `bodies.json` = the `/tmp` copy's byte for byte once the sheet names are normalised; `bodies=512`). A `README.txt` there says where each came from. Some
  witnesses read the raw set ONLY through `SHED_RAW_DIR` (no default): run the runner with `SHED_RAW_DIR=~/Videos/dxf2bim_film_work/why/raw`.

**F.21 SLICE 2 SPEC — hover a body on the Modeller canvas, see the line that built it, open it in VS Code (2026-11-15; dev-only).**
- **Nothing shipped changes.** The overlay is `devtools/hover/dxf_hover.js` (a classic script), loaded into an open Modeller tab by a bookmarklet from the same
  localhost server (the "Serve repo" task serves the repo root; the Modeller service worker's scope is `/modeller/`, so `/devtools/` is not cached):
  `javascript:(function(){var s=document.createElement('script');s.src='/devtools/hover/dxf_hover.js?'+Date.now();document.head.appendChild(s)})()`.
  `modeller.html`, `sw.js` and the precache lists are untouched.
- **The key → line index is generated, never typed:** `node devtools/hover/gen_trace_index.js` writes `devtools/hover/trace_index.json`
  `{format, root, keys: {key: 'modeller/<file>.js:<line>'}}` from an espree parse. The scan lives in ONE module, `devtools/hover/trace_sites.js`, which W-DXF-TRACE T3 also
  uses (one implementation). The file holds this machine's absolute repo path (for the `vscode://` link), so it is git-ignored, not committed.
- **Overlay behaviour:** on load it installs the trace map (`globalThis.__DXF_TRACE`) if absent and prints `§DXF_HOVER installed index_keys=N`; a body converted
  BEFORE that has no key, and the tooltip says *convert again (the trace is on now)*, never a guessed line. It listens to the page's own `dagevu:hover` event
  (`modeller.html` `setHover`), resolves fid → guid (`__arcGuidByFid`) → key (the map) → `file:line` (the index), and shows a small fixed tooltip: key, `file:line`,
  class, DXF handle / layer / sheet, provenance. **V** opens `vscode://file/<root>/<file>:<line>` for the body under the cursor. Each new hover prints
  `§DXF_HOVER fid= guid= key= at=` (the witness reads these, not pixels).
- **Witness W-DXF-HOVER** (`devtools/hover/tests/witness_dxf_hover.js`; headless Chromium with SwiftShader as `witness_dxf_props_panel.js` does, ONE page, run under
  `nice -n 19 ionice -c3`): H1 the generated index = a fresh parse (every stamp site, one line per key) · H2 THE PAGE: open the marked shed, Complete, load the overlay,
  Convert, then REAL mouse moves over a grid of canvas points: for every body the page's own pick hovered, the tooltip's key = the page's trace map = the Node CLI's
  `trace.json` for that guid (an independent run), and its `file:line` = the index · H3 RED CONTROL: a second tab converts BEFORE the overlay loads → every hovered body
  shows *convert again*, 0 lines claimed · INCONCLUSIVE if the sweep hovered 0 bodies. **Not proven by the witness:** that the operating system hands `vscode://` to
  VS Code (no desktop in a headless run); the witness checks the link text and the session reports whether a `vscode` URL handler is registered (`xdg-mime`).
- **Issue proved:** *"I see a wrong body on the canvas; which code made it?"* had no answer without reading the pipeline; after: hover it, read the line, press V.

**F.21 SLICE 2 RESULT (2026-11-15): built and merged, bim-ootb #3047 (`Fixes #3046`), re-run on `main` @ `460c6eea`: W-DXF-HOVER `VERDICT PASS` (H2 15 bodies / 8 keys
`wrong=0`, H3 red control `claimed_a_line=0`), W-DXF-TRACE `VERDICT PASS bodies=512 keys=12`.** How to use it: bim-ootb `devtools/hover/README.md`.
- **Gap the witness found (its first run FAILED):** `toOps` joins wall pieces into NEW bodies that exist only as inserts (shed: 512 bodies → 511 inserts; `CC-L0`+`CC-L1`
  became one). Slice 1 judged `R.els` only. Fixed: stamped at `dxf2bim_import.js:716` (`dxf2bim_import:wall-line`); the CLI keeps the trace on through `write()` and
  judges inserts too (`§DXF_TRACE inserts=511 inserts_untraced=0`, W-DXF-TRACE T2b). Model bytes unchanged (T1 off == on == main).
- Deviations from the spec: the overlay reads handle / layer / sheet from the op (`Bonsai.oplog._geomOps()`, survives a reload) first, `R.els` second; a body with a
  trace map on but no key says *no stamp* (UNSTAMPED), not *convert again*. Each witness page gets its own browser context (the shared one timed out at Convert).
- Not proven: the OS handing `vscode://` to VS Code (headless). This machine has `code_code-url-handler.desktop` registered.
- **Correction (2026-11-15), said to the owner:** slice 1's result called "64 synthesized columns" the place to start. Wrong: they are 32 below-grade parts (14", from
  the column SCHEDULE, `source: schedule`) + 32 grade-to-base stubs (12", inherited), one pair per drawn column (§L29, `dxf2synth.js:52-62`). The real assumption is the
  truss: drawn once at cut AA, copied to 13 stations (`dxf2section.js:42-44`), so 144/156 bars and 108/117 plates (252 bodies, ~half the model) are `assumed`, and their
  spacing is ONE default, `section.spacing` (= column pitch) unless the user states it. That is the accuracy item to raise with the DXF2BIM lane.
- **Handed to this lane 2026-11-15 by bim-compiler-8e (owner's words, typed into that session): an ERP legacy-parity check before the bump.** *"atm, the main user of VSC
  will be me, so having an auto legacy parity validation while working on the ERP can be set here as i eventually get to learning it up"* · *"That means we should have a
  parity check button before the bump, but do advice"*. NOT decided. Facts measured there: legacy stack up (docker postgres :5432 `idempiere_pilot`, pilot :8088); the full
  run `scripts/bridge/run_all.sh` ≈ 70 s, writes throwaway clients to the pilot, last run 2026-11-04 had 2 FAIL + 1 HARNESS-FAIL (a zero-failure gate would block every bump
  today); repeat-safe parity witnesses exist (e.g. bim-ootb `common/door/tests/witness_valrule_parity.js`, #3041). Their advice: one VS Code task; the gate inside
  `bump.js --write` for `erp/` files keyed on a parity PASS log for the current commit + dirty set; "no NEW failure vs a stored baseline"; not on save; no parity witness =
  INCONCLUSIVE; a logged `--no-parity` override. **Open question to put to the owner (F-16): a new parity failure BLOCKS the bump (with the logged override) or only WARNS?**
- 2026-11-15, owner, on **F-16**: *"About bump, yes block note mismatch for now, but a config setting for such be good"*. → **F-16 = BLOCK on a new parity
  mismatch (logged override), with a config setting (block / warn / off).** Also asked: *"So such hover can be toggled on and off by the dev outside so not impact
  normal non dev users?"* (answered: yes; on = the bookmarklet in that tab, off = reload; nothing loads it for other users).

**F-16 BUILD SPEC — the ERP parity gate in `scripts/bump.js` (2026-11-15).** Measured today: the parallel run (bim-compiler `scripts/bridge/run_all.sh`, run on
`origin/master`, pilot up: `/webui/` 200) took ~70 s and printed one `§<TAG>_VERDICT <WORD>` line per witness; log
`~/.cache/bim_bridge/run_20261115_110513.log`. Its non-passing verdicts are the same 3 as on 2026-11-04: `DD FAIL`, `CTX FAIL`, `DDS HARNESS-FAIL`
(`ATTACH_PARITY` / `PRODUCT_ICONS` are `NOT-RUN` without their env).
- **Config (tracked):** bim-ootb `scripts/bump_parity.json` `{ "mode": "block", "applies_to": ["erp/"], "bridge": "~/bim-compiler/scripts/bridge/run_all.sh",
  "known": ["DD:FAIL", "CTX:FAIL", "DDS:HARNESS-FAIL"] }`. `BUMP_PARITY=block|warn|off` overrides `mode` for one run (a VS Code task can set it).
- **When:** `bump.js … --write` and at least one target under `applies_to`. A dry run never runs it; a non-ERP bump never runs it.
- **What:** run the bridge (its own log under `~/.cache/bim_bridge/`), parse every `§<TAG>_VERDICT <WORD>`; NEW = a `FAIL`/`HARNESS-FAIL` whose `TAG:WORD` is not in
  `known`. Prints `§BUMP_PARITY mode= verdicts=N new=[...] known=[...] log=<path> verdict=PASS|BLOCKED|WARN|INCONCLUSIVE|OFF`.
- **Block:** NEW non-empty, or INCONCLUSIVE (the bridge printed 0 verdicts, e.g. the pilot is down: the line says how to start it), in `block` mode → nothing written,
  exit 3. `warn` → written, the line says WARN. `off` → not run, the line says OFF.
- **Override:** `--no-parity "<reason>"` writes and prints `§BUMP_PARITY verdict=OVERRIDE reason="…"` (the reason is required; the commit message should carry it).
- **No re-run for the same tree:** a PASS is cached under `~/.cache/bim_bridge/bump_parity/<sha256 of HEAD + git diff>.json`; same tree = reused (printed `cached=Y`).
- **Witness W-BUMP-PARITY** (bim-ootb `tests/witness_bump_parity.js`, node): a stub bridge (`BUMP_PARITY_BRIDGE=<script>`) printing chosen verdict lines drives:
  P1 new FAIL → BLOCKED, file and `?v=` unchanged · P2 only known FAILs → PASS, written · P3 `warn` → written + WARN · P4 `off` → not run · P5 non-ERP target → not run ·
  P6 `--no-parity` without a reason → refused; with one → OVERRIDE, written · P7 0 verdicts → INCONCLUSIVE, blocked · P8 same tree twice → second `cached=Y`.
  Every row on a temp copy (`--root`, as W-BUMP does). One REAL row (opt-in `BUMP_PARITY_REAL=1`): the real bridge on this machine gives `verdict=PASS` with today's
  `known`. **Issue proved:** an ERP edit could be bumped (shipped to users) with no check that it still matches legacy iDempiere; after: a new mismatch stops it, visibly.
**F-16 RESULT (2026-11-15): built and merged, bim-ootb #3050 (`Fixes #3049`, `f5367092`), by a Sonnet worker; its logs checked here.** W-BUMP-PARITY on main: `§BUMP_PARITY_W_VERDICT PASS judged=14
failed=0 real_row=run`; the real row: `mode=block verdicts=14 new=[] known=[DD:FAIL,CTX:FAIL,DDS:HARNESS-FAIL] verdict=PASS`. Red controls: gate no-op'd → 11 rows FAIL; `known` ignored → 4 rows FAIL. The
existing W-BUMP unchanged (`PASS judged=5 failed=0`). Added beyond the spec: `BUMP_PARITY_BRIDGE` / `BUMP_PARITY_HOME` env (the witness's stub bridge), a copy of the bridge output in the cache folder,
`--no-parity` without a reason = usage error (exit 1). **Caveat:** the config's default bridge path is the shared `~/bim-compiler` checkout, which is usually on another branch; point `BUMP_PARITY_BRIDGE`
at a worktree on `origin/master` (e.g. `/tmp/wt-bridge`) until the default is decided. Film of the hover: `prompts/FILM_IMMERSIVE_SOFTWARE.md`.


### F.23 Hover a BIM body, see every layer behind it (the provenance hover)   (owner 2026-11-15; decision **F-18**)
- 2026-11-15, asked F-18 with the recommendation (six layers in the order they happened, each from data the body or the op already carries; number keys / V open each
  layer's line). Owner: *"Go with your take, on how coders will usually wish it"*. → **F-18 = the six layers, in that order, laid out the way a coder expects a hover:**
  an identity title line first (class · fid · handle · layer · sheet · provenance), then the six numbered layers, **every layer row always shown** (an empty one says
  `none`, so key 3 is always the sizes), each item with its `file:line` when one exists and NOTHING when none exists (never a guessed line). Keys **1-6** open the first
  line of that layer (Alt+1-6 in a text field); **V** stays = the builder line (slice 2 behaviour kept).
- Owner, same day, asked what such an IDE feature is called. Answer given: no one standard name; it is **origin tracking / provenance** (database "why-provenance"),
  shown as **output-to-code navigation** (the Whyline, Ko & Myers 2008), closest to a graphics debugger's **pixel history** (RenderDoc / PIX), and the edits layer is a
  small **omniscient (time-travel) debugging**. Working name in this file: **the provenance hover**.
- **Measured 2026-11-15 (bim-ootb `main` @ `1b291137`, CLI `--complete --pack pwd2024_bd --trace` on the marked shed; `§DXF_TRACE elements=512 traced=512`, `inserts=511`):**
  - Every body's `size` is an object of sides; a side is EITHER an object with a `source` (445 `{number,source}`, 170+18 `{drawn,number,class,rule,source[,align]}`,
    41 `{number,source,text}`, 12 `{value,source,key,drawn}`) OR a plain value with no source (345 numbers, 74 strings, 39 nested: `profile`, `run`). Both `number` and
    `value` name the number (`dxf2beams.js:84` `value`, `dxf2doors.js:78` `number`): the hover reads both and shows a side without a source as `(no source recorded)`.
  - Sources seen: `label` 499, `default` 139, `inherited` 99, `schedule` 64, `drawn` 38. Every body also has `height_source` (`section` 285, `elevation` 110, `derived` 67,
    `stated` 50). The source is free text in code (`dxf2beams.js:84` also writes `TOC label` / `plan level` / `split at the midpoint …`): shown as written, never bucketed.
  - **Only ONE default-sourced kind records WHICH default it used:** `column.top` (12, `key: column.top_under_beam`). The other 127 `source: default` sides (`bar.w` 91,
    `fan.depth` 13, `net.t` 3, `slab.t` 1, `roof.t` 2, …) carry no key: the hover says `default (which default is not recorded on the body)` for them and links nothing.
    **Finding for the DXF2BIM lane (raise there, not fixed here: it changes the model files):** stamping the `key` where a builder calls `DF.use(<key>)` would let the
    hover link every yellow default.
  - The op (`GEOM_INSERT` parameters, survives a reload) carries `provenance.ifc.props.SizeBasis` (`"x:label y:label"`, 511/511) = the sides + sources, written by a second
    code path (the IFC props writer); on the shed it agrees with `bodies.json` on 510/510 bodies that have one (the 511th insert is the joined wall line, which exists only
    as an insert). The props also carry `NoteSource_*` (457) / `SchedSource_*` (128) = `sheet#handle` of each drawn note / schedule row the converter attached.
  - Cuts: `toOps` returns `cuts` (`GEOM_CUT`, `dxf2bim_import.js:653`, `:727`); the page commits them with `parent = nextId + index` and `slide.fillingFid` = the fill's fid
    (`dxf_import_ui.js:951-952`). The CLI's `ops.json` does not write them (inserts only).
  - Edits: the ONE definition of "which ops edit fid X" is `EditDelta.netEdits` (`viewer/edit_delta.js:23`: `GEOM_MOVE`/`GEOM_SCALE`/`GEOM_ROTATE` `parent`, `GEOM_GRID_MOVE`
    `commands[].featureId`). The hover calls it per op (`netEdits([op]).has(fid)`) rather than re-deriving it; a cut's own edits are `GEOM_CUT_MOVE` / `GEOM_CUT_RESIZE`
    with `parent` = the host (`modeller/cut_move.js`). Only ops before the op-log cursor count (an undone edit is not shown).
  - Pass-through (`a > b` in the trace map, `dxf2prep.js:222`): **0 chains on the shed.** The layer is built and judged on a synthetic chain; on the shed it is VACUOUS
    and the witness says so.
- **The six layers (`layersFor(fid, ctx)`, pure, the page and the node witness call the same function):**
  1 **BUILDER** — the trace key's first part → its `file:line` (slice 2's `resolve`, reused, not copied).
  2 **PASS-THROUGH** — each later key of the chain → its `file:line`.
  3 **SIZES** — each side `name number source` (+ `text` / `rule` when present) from the body (`R.els`), else the op's `SizeBasis` (side + source, number from nothing:
    not shown); `height  <height_source>`; a `default` side with a `key` → `modeller/element_defaults.json:<line of that key>` (the yellow row a user can change).
  4 **CUTS** — every active `GEOM_CUT` whose `parent` is this fid (opening, its rule, the fill it holds) + every `GEOM_CUT_MOVE`/`RESIZE` on them; and, for a fill, the cut
    whose `slide.fillingFid` is this fid (`fills the opening of #<host>`).
  5 **EDITS** — every op before the cursor that `EditDelta.netEdits` says touches this fid: `#<op index> <op_type> <dx,dy,dz | fx,fy,fz | grid command>`.
  6 **EVIDENCE** — `handle · layer · sheet · prov · run` + each `NoteSource_*` / `SchedSource_*` the converter attached (data, no code line).
- **Index:** `gen_trace_index.js` also writes `defaults: {key: 'modeller/element_defaults.json:<line>'}`, from an espree parse of the JSON as an expression (a parser, not a
  text search). One file, still git-ignored.
- **Overlay:** `devtools/hover/dxf_hover.js` grows the layered tooltip (same bookmarklet; nothing shipped changes). If `window.EditDelta` is absent it loads
  `/viewer/edit_delta.js` once (dev overlay only). Per new body: `§DXF_HOVER fid= guid= key= at= layers=b,p,s,c,e,v` (the count per layer).
- **Witness W-BIM-LAYERS** (`devtools/hover/tests/witness_bim_layers.js`, node, no browser), on the marked shed in-process (`dxf2bim_cli.run`) + `toOps` + the page's
  commit mapping, and the CLI `--trace` run in a SEPARATE process as the independent oracle:
  L1 builder: for EVERY insert (denominator 511), layer 1 key = the oracle's `trace.json`, line = a fresh parse · L2 pass-through: synthetic `a > b > c` → 2 items, each
  line = the parse; shed population printed (`chains=0 → VACUOUS`, not PASS) · L3 sizes: for every insert, layer 3's `side:source` list = the op's `SizeBasis` (second code
  path) AND each number = the oracle's `bodies.json`; every `default` side with a key links a line of `element_defaults.json` that holds that key (read back), every one
  without a key links nothing; counts printed by source · L4 cuts: over all inserts, Σ host cuts listed = `cuts.length` and each cut appears under exactly its host; each
  fill names its host · L5 edits: synthetic ops appended (a `GEOM_MOVE` on A, a `GEOM_GRID_MOVE` command on B, a `GEOM_SCALE` on C, a fourth op past the cursor): A, B, C each
  list exactly theirs, no other body lists any, the past-cursor op is listed nowhere · L6 evidence: handle / layer / sheet = the oracle's `bodies.json` for that guid ·
  K keys: for every insert and key 1-6, the link is `vscode://file/<root>/<file>:<line>` of an existing line or absent, never a dangling one ·
  **RED controls:** R1 slice 2's single-line `resolve` judged as if it were the layered hover → L3-L6 FAIL; R2 a corrupted `SizeBasis` on one op → L3 catches exactly that
  body; R3 the cursor moved before the edits → L5 lists 0. INCONCLUSIVE (exit 2) if the shed is missing or 0 inserts were judged.
  **Page check (W-DXF-HOVER, extended, ONE headless CPU page, `nice -n 19 ionice -c3`):** H2 also asserts, for every hovered body, the tooltip's six layer counts = the node
  `layersFor` for that fid.
- **Issue proved:** *"why is this body this size, here, with this hole?"* needed reading six places by hand (the builder, the trace, the size record, the defaults file,
  the op log, the converter's props); after: hover it, the whole history in order, a key per layer.

**F.23 RESULT (2026-11-15): built and merged, bim-ootb #3064 (`Fixes #3063`); re-run on `main` @ `ba7c880a`: `§BIM_LAYERS_W VERDICT PASS fail=0 inserts=511 cuts=2`.**
- **Page check (owner's go 2026-11-15: *"yes, run hover check"*), on the branch:** W-DXF-HOVER `§DXF_HOVER_W VERDICT PASS fail=0`: H1 `keys=28 defaults=99 same=Y` · H2
  `hovered=15 wrong=0 page_errors=0` · **H2b `nextId=1 hovered=15 counts_differ=0`** (the tooltip's six counts = Node `layersFor`; the sweep hit the joined north wall `#100`,
  the one host with cuts) · H3 red control `claimed_a_line=0`. Not exercised on the page: layer 5 with a real edit (the sweep makes none; L5 judges it in Node) and the
  OS handing `vscode://` to VS Code. CI on #3064: fast-checks + e2e-tests pass.
- W-BIM-LAYERS on the branch: `§BIM_LAYERS_W VERDICT PASS fail=0 inserts=511 cuts=2`. L1 `inserts=511 wrong=0` · L2 synthetic chain `items=2`, `shed_chains=0 -> VACUOUS` ·
  L3 `wrong=0 by_source={"label":376,"default":122,"inherited":98,"drawn":25,"schedule":64}`, `default_sides linked=12 not_recorded=110` · L4 `cuts=2 listed_under_hosts=2` (the two
  D88B door gaps in the joined north wall `#100`, holding `#158`/`#159`) · L5 A/B/C exactly theirs · L6 `wrong=0` · K `keys_tried=3066 links=523 dangling=0` · red controls R1
  `L3_wrong=511 L4_wrong=511 L6_wrong=511`, R2 catches exactly the corrupted body, R3 `wrong=3`. `bodies_with_layer {"builder":511,"pass":0,"sizes":511,"cuts":3,"edits":0,"evidence":511}`.
- Its first run FAILED L6 `wrong=510`: the judge read `layer` from `bodies.json`, which has no top-level layer (the hover was right). The judge now reads the oracle's
  `ifc.props.SourceLayer`. Kept as a lesson: check the oracle's shape before trusting a 510-of-511 failure.
- Unchanged neighbours on the branch: W-DXF-TRACE `VERDICT PASS bodies=512 keys=12`, W-X0-APPDEF `verdict=PASS`.
- Deviation from the spec: the page-shaped setup lives in ONE helper, `devtools/hover/tests/shed_ctx.js`, used by both witnesses (not a second copy of the commit mapping).
- **Next: FILM 3** (BIM with layers, `prompts/FILM_IMMERSIVE_SOFTWARE.md`, same recipe as FILM 2) · raise the 110 unrecorded default keys with the DXF2BIM lane. *(Both done 2026-11-15: FILM 3 STATUS; bim-ootb #3070 §D113.)*
- **Developer Guide §4.3 "The provenance hover"** (2026-11-15, owner: *"Software Guide updated?"* — it was not: §F.21 / §F.22 / §F.23 had never reached the guide): numbered steps for both hovers, the six
  layers, three figures clipped from ONE real Modeller session (`scripts/film_bim_layers/modeller_shot.js` `MS_DPR=2 MS_CLIP=1`, `errors=[]`, every tooltip `tipInView`), a troubleshooting table, the
  witnesses. Name used: **BIM DevTools** for the set, **the provenance hover** for the feature (owner asked whether it is an "SDK": advised no — an SDK is what outside developers build ON; this is
  developer tooling, an inspector).

---

### F.24 The X0 witnesses in CI's fast checks (ADVICE C1; no decision needed; spec 2026-11-16)
- **Issue proved:** CI passes a change that breaks an X0 witness. That happened twice: archive §F.15 (#2954) and §F.19, the "fake field in the index" class that `witness_x0_appdef` catches, and both times it was caught before the PR only by luck. Today `.github/workflows/ci.yml` runs no `devtools/` witness (`git grep x0 .github/workflows` = 0 hits).
- **Measured 2026-11-16** on a fresh `git clone --depth 1` of bim-ootb `main` @ `8c3f0af6`, with no `../bim-compiler` beside it (the CI runner's view; `node_modules` from `npm ci`):

| witness | exit | seconds | verdict |
|---|---|---|---|
| `witness_x0_isolation` | 0 | 0.7 | PASS |
| `witness_x0_lens` | 0 | 1.3 | PASS |
| `witness_x0_deploy_cost` | 0 | 1.3 | PASS |
| `witness_x0_appdef` | 0 | 2.6 | PASS |
| `witness_x0_context` | 0 | 2.8 | PASS |
| `witness_x0_refs` | 0 | 13.9 | PASS |
| `witness_x0_ship` | 0 | 17.8 | PASS |
| `witness_x0_fresh` | 0 | 18.2 | PASS |
| `witness_x0_mcp` | 0 | 28.0 | PASS |
| `witness_x0_activate` | 0 | 28.3 | PASS |
| `witness_x0_taghover` | **0** | 0.2 | **INCONCLUSIVE** (it needs the bim-compiler repo) |

- **Build:** one step in `ci.yml` `fast-checks`, **"X0 Navigator witnesses (node only)"**, first planned for the five that take under 3 s (isolation, lens, deploy_cost, appdef, context), and cut to three after the FINDING below. The step **fails unless each witness exits 0 AND prints a `verdict=PASS` line**: `taghover` shows that an exit code of 0 can mean INCONCLUSIVE (PRIMAL LAW 4), and a CI step that judged nothing must not be green. `taghover` stays out (it would be vacuous on a runner). The five slower ones (14 to 28 s each, about 106 s together) stay local, run with "Run this witness" as before. Moving them into CI is a later choice, if the cost is worth it.
- **Witness of the step itself (red control):** the step's `run:` script, read from `ci.yml` and run by `bash` in the clean clone, must exit 0. In a copy with a planted defect, it must exit 1 and name the witness that failed. **Done when:** both local runs behave, and the PR's own CI run shows the step green on GitHub.
- **Not in this PR:** ADVICE C2 (the version stamp at pack time) and C3 (the stale "138" texts), one PR each after this.
- **FINDING on the PR's first CI run (2026-11-16):** on GitHub's runner, `deploy_cost` printed `§PERF_IMPACT parser=N verdict=INCONCLUSIVE` and `context` printed `load=?`, **both with exit 0**. The verdict check failed the step (`§X0_CI verdict=FAIL failed=deploy_cost context`), which is the vacuous-green case it exists to catch. Cause: both parse with the TypeScript **inside VS Code** (`scripts/lib/find_ts.js`, the no-install rule of `EDITOR_MAINTAINABILITY_STUDY.md` §14), and a runner has no VS Code. My local "CI-like" clone borrowed the shared checkout's `node_modules` and ran on a machine with VS Code installed, so it hid this: a local imitation of CI is not CI. **Fix:** the step runs the three that judge without that parser (`isolation`, `lens`, `appdef`), so `appdef`, the one that catches the past breaks, stays in. `deploy_cost` and `context` stay local. Installing TypeScript in CI only for them was not done, since it would go against the §13 minimalism guard.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3089 / PR #3090, merged `234a6dc1`.** GitHub run 43778395254: `§X0_CI isolation … verdict=PASS` · `lens … PASS` · `appdef rows=1856 … verdict=PASS` · `§X0_CI checked=3 verdict=PASS`. The step's own script under `bash -eo pipefail` (GitHub's shell; my first local test used plain `bash`, under which a failing node would have aborted the loop before naming it, now fixed with `rc=0; node … || rc=$?`): clean clone, exit 0. Red: a devtools path planted in `erp/sw.js` PRECACHE gives `failed=isolation`; an exit-0 INCONCLUSIVE stub gives `failed=context`; a log with no verdict gives `failed=lens`. All witnesses are still reported each time.

### F.25 The installed X0 copy knows when it is stale (ADVICE C2; no decision needed; spec 2026-11-16)
- **Issue proved:** `package.json` says `0.1.0` for every build, so an installed X0 cannot tell that the source changed after a pull (or an edit), and the developer runs old hovers without knowing.
- **Why a content hash and not the commit:** `pack.js` is deterministic (same input, same bytes, kept by W-X0-INSTALL). A hash of the packed files keeps that, catches uncommitted edits, and needs no git. Bumping the version number would also change the file name and the install list for no reason.
- **Build:**
  - `x0-navigator/lib/build_stamp.js` (packed, node only): `listFiles` moves here from `pack.js` (ONE listing rule: no `tests/`, `node_modules/` or dot-folders). `sourceHash(dir)` is the sha-256 of each relative path plus its bytes, in sorted order, leaving out `built.json`. `compare(extensionPath, sourceRoot)` → `{ state: 'same' | 'stale' | 'unknown', built, source, reason }`. `unknown` comes with a reason (no `built.json` = a build from before this change; no `devtools/vscode/x0-navigator` in the open folder) and never says `same` when nothing was compared.
  - `pack.js` adds `extension/built.json` = `{ "sourceHash": … }`.
  - `extension.js` `activate`: one output line `§X0_STAMP state= built= source=`. Only on `stale`, one warning: *"X0 Navigator is older than devtools/vscode/x0-navigator in this folder: run node devtools/vscode/pack.js --install, then reload the window."* Nothing is shown on `same` or `unknown` (ADVICE D: keep it quiet).
  - The `vscode` stub moves from `witness_x0_activate.js` into `tests/vscode_stub.js`, shared by both witnesses (one stub, not two).
- **Witness W-X0-STAMP** (`tests/witness_x0_stamp.js`, node):
  - S1: a packed temp copy carries `extension/built.json`, whose hash equals `sourceHash` of that copy.
  - S2: two packs of the same input give the same bytes.
  - S3: an unpacked copy compared with the same source gives `same`. Editing one packed file in the source gives `stale` (the red control: the judge must flip). An edit under `tests/` stays `same`, since tests are not packed, so there is no false alarm.
  - S4: no `built.json` gives `unknown`, and so does no source folder. Neither gives `same`.
  - S5 (wiring, through the shared stub): `activate` with a stale `extensionPath` shows the warning once; with a matching one it shows none.
  - Before/after: `witness_x0_activate` and the realvsc install suite keep their verdicts.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3091 / PR #3092, merged `186d80ae`.** On `main`: `§X0_STAMP_W files=13 stamp=1c3372cfee90 deterministic=Y checks=10 failed=0 verdict=PASS`. S5 activates the PACKED `extension.js`: stale gives `§X0_STAMP state=stale built=1c3372cfee90 source=4ed593f6e739 warnings=1`, restored gives `state=same … warnings=0`. **Red run on the old code** (the new witness with `main`'s old `pack.js`/`extension.js`): exit 1, S1 `null = f56ea15ddad5`, S3 `state=unknown`. The stub refactor is neutral: `witness_x0_activate` gives the same 30 PASS checks and the same `§X0_ACTIVATE definition=1 hover=2 commands=8 fresh=Y checks_failed=0 verdict=PASS`. Also PASS on the branch and on `main`: isolation (`deps=0`), lens, appdef, deploy_cost, context. `pack.js` prints `source=<hash12>`. **Not run:** the realvsc install suite (it starts a real VS Code; owner's go first). **For the owner's own copy:** the next `node devtools/vscode/pack.js --install` is the first build that carries a stamp. Copies installed before it report `unknown` and show no warning.

### F.27 The § tag grammar drops everything after a hyphen (found 2026-11-16 by §F.26; a defect, no decision)
- **Issue proved:** `devtools/vscode/x0-navigator/lib/tag_index.js:14` `TAG_RE = /§[A-Z][A-Z0-9_]+/g` stops at `-`. So `§CRUD-PERSIST` is read as `§CRUD`, and the §TAG hover, the grey "last:" line (lens), *Context for this file* and the facts server all look up the wrong tag. Measured on bim-ootb `main` @ `234a6dc1`: **3,847 distinct hyphenated tags, 11,418 uses** in `.js` (`git grep -o -E "§[A-Z][A-Z0-9_]*(-[A-Z0-9_]+)+" -- '*.js'`). Found when §F.26's stub for `erp/model_pa.js` listed `§MODEL` for the line that prints `§MODEL-PA`.
- **Second gap, same grammar:** a tag that starts with a digit is not read at all: **50 distinct** such tags are printed in `console.log('§…` (`§4D_RECV` x7, `§4D_REAL_TASKS`, `§5D_SIDECAR` …). Section numbers (`§5.24`, `§4b`, `§12.3`) must stay non-tags, so the digit-first form needs an underscore.
- **Fix:** the ONE grammar, `TAG_RE = /§(?:[A-Z](?:[A-Z0-9_]+(?:-[A-Z0-9_]+)*|(?:-[A-Z0-9_]+)+)|[0-9]+[A-Z][A-Z0-9]*_[A-Z0-9_]+(?:-[A-Z0-9_]+)*)/g`. It allows hyphen-joined parts and keeps the 2-character minimum (`§W-EMPTY-POP` is read; a lone `§W` is not). A trailing `-` is not part of a tag. A digit-first tag is read only in the `§4D_X` form.
- **Witness:** a check added to `witness_x0_taghover.js` (§DEVTK_SPEC): `tagsInLine` reads `§CRUD-PERSIST`, `§W-EMPTY-POP`, `§4D_RECV` and `§MODEL-PA` whole, and gives none for `§F.24`, `§5.24`, `§4b`, `§4D`, `§W` or `§ x`. Red control: the old regex must fail that check. Before/after: the `tags=` count of `§DEVTK_SPEC` and the lens, context, activate and mcp verdicts, every change explained.

### F.26 X0 "New witness for this file" (§F.21 OPEN; no decision needed, owner "Go" 2026-11-16; spec 2026-11-16)
- **Issue proved:** a new witness starts from a blank `witness` snippet, so the writer must look up by hand what the index already knows about the file: the spec its header cites, the `§` tags it prints with their last values, and the APP fields it writes. The archive's rule still holds: **never pre-fill tests from the file's functions** (that is a guess). Pre-fill only FACTS, and leave the claim, the population and the red control to a person.
- **Build (bim-ootb `devtools/vscode/x0-navigator`):**
  - `lib/witness_stub.js`, pure node. `make(root, rel, facts)` → `{ path, text }` or `{ refused: reason }`.
    - **Template:** ONE template, the `witness` body in `.vscode/witness.code-snippets`, read and expanded here. `${n:default}` gets the values below, `${RELATIVE_FILEPATH}` the new path, `$0` nothing. No second copy of the skeleton.
    - **Values:** NAME is `W-` plus the basename, upper-case, `_` → `-`. Spec is the first `prompts/…md §…` citation found in the file's own header (`file_context.headerOf`); with none, it says `NO SPEC in this file's header: write it first (Spec-First)` and does not invent one. The contract path is `witness_kit/contract` relative to the new file. ISSUE, POPULATION and RED CONTROL stay as the snippet's placeholder words.
    - **A comment block `FACTS FROM X0`:** the `§` tags the file prints, each with its spec (`tag_index`) and last value (`lens_index`), or the reason it is not shown; the APP fields it writes; and the line *"which witnesses already prove this file: not indexed yet (Part E)"*. All of it comes from `file_context.build(...).facts` and the same lookups, so there is nothing new to keep in sync.
    - **Where:** `<first folder>/tests/witness_<basename>.js`. If that exists, `_2`, `_3` … are added: **never overwrite**. A file already under a `tests/` folder, or not a `.js`, is refused with a reason.
  - `extension.js`: command `x0Navigator.newWitnessForFile` (*"X0 Navigator: New witness for this file (facts pre-filled; FAILs until you fill it)"*). It writes the file and opens it, and says why when refused. `package.json` lists it.
- **Witness W-X0-NEWWIT** (`tests/witness_x0_newwit.js`, node):
  - N1: for `erp/model_pa.js` (it prints `§GOAL_STORE`), the stub names the file and lists exactly the tags an independent regex finds in the file's `console.log('§…` literals. Its spec line equals the header's citation, or says NO SPEC.
  - N2: the generated file, run with the real `witness_kit`, exits non-zero and prints `population-nonempty` (it can never PASS unedited). Red control: the same file with ONE real row and a real red control filled in must PASS, proving the run can see a PASS.
  - N3: a second `make` while the first file exists gives `_2`, and the first file's bytes are unchanged.
  - N4: a file with no header gives NO SPEC, not an invented one. A `tests/` file and a `.json` are refused.
  - N5 (wiring, shared stub): `activate` registers the command (the count in `witness_x0_activate` goes 8 → 9). Running it on an active editor writes the file and opens it once.
  - Red run on the old code: no command, no lib, so N5 FAILs.

## ADVICE — from the session that built Part F, for the owner and the sessions that follow (2026-11-14)

Owner: *"Put in your advice as you know VSC and software better"*. **These are recommendations, not decisions.** A decision is only
what the owner answers; when he says "follow the advice" on an item, record that as his answer in that part's DECISIONS block.

**A. What to answer on each open decision, and why.**

| Decision | Advice | Why |
|---|---|---|
| A-2 one source for "now" | Extend the login context; the transaction's `env` and the genesis env become views of it | legacy has one context; a fourth object would have no twin |
| A-3 no date injected | The edge records the session's LOCAL calendar day, the instant and the timezone offset in `SESSION_START`; core never falls back | it is the same fix bim-ootb #2996 needs: today the headless kernel dates by the UTC day |
| A-4 timing reads | Route them through `Env.elapsed()` | the purity check stays a plain ban on calls, with no judgement about "does this result feed the answer" |
| B-1 `?v=` numbers or content hashes | Content hashes, but as its own announced step | nobody bumps by hand again and a stale file becomes impossible; the price is one full re-download for every user, so do it once, on a quiet day |
| B-2 lazy and precache rule | Keep today's per-app rules; write them in the manifest | changing load behaviour and introducing the manifest in one step hides which one broke something |
| B-3 owner and witnesses in the manifest | Yes | parts D and E then get their data for free, and three F rows unblock at once |
| B-4 ERP plugin lists | Derive only the precache entries; leave the host's one list alone | B must not become a second plugin registry |
| C-2 rename `A` to `APP` while moving | Yes, one module per PR | it removes the whole class of index faults that §F.17 found: the index has to GUESS which local name is the shared object |
| D-2 a namespace extended by several files | Allowed when the manifest marks it | forbidding it would force a refactor nobody asked for |
| E-2 keep the suite's verdicts | Yes, a small JSON per run, stamped like any log | the proof map can then show "last verdict" under the same provenance rule as values beside the code |
| F-1 headless step in Fetch back | No by default; a separate button the owner presses | a browser run beside a live bake has crashed tabs; HTTP + version + commit already caught both real deploy faults |
| F-2 budgets | Do not pick numbers. Print "Cost if deployed" in every PR for two weeks, then set each ceiling at the observed level plus a small margin | a guessed budget is either ignored or blocks honest work |
| F-7 hosted preview per PR | None for now | *Run local* on the PR branch is the preview; a host is a new thing to keep alive |

**B. The order I would work in.** B0 next, in parallel with the A decisions. The manifest (part B) is the highest-value step left: it
removes the hand-kept lists that cause the stale-file bugs (P2), and it is what four of F's unbuilt rows wait for. In part A, build A1 (the
Env) and A3 (the purity check with its red control) early, then let A2 (moving each file's clock reads) run as a long tail, a file at a
time when someone is in that file anyway. A0 showed nothing is broken, so A2 is not urgent. Part C last, as written.

**C. Three small things worth doing soon (none needs a decision; each is one PR).**
1. ✅ 2026-11-16 (§F.24, #3090: isolation, lens, appdef; deploy_cost + context need VS Code's TypeScript) **Put the node-only X0 witnesses into CI's fast checks**, `witness_x0_appdef.js` first. CI passed two changes that broke `main`'s own
   witnesses (archive §F.16, §F.19 "caught before the PR" was luck the second time). They need no browser and run in seconds.
2. ✅ 2026-11-16 (§F.25, #3092, as a content hash, not the version) **Stamp the extension's version at pack time.** `package.json` says `0.1.0` for every build, so an installed copy cannot tell that it is
   stale after a pull. Let `pack.js` write the commit into the version (or a visible "built from" line in a command's output).
3. ✅ 2026-11-16 (correction comments: bim-ootb #2974 issuecomment-6903656757, #2975 issuecomment-6903657121) **Fix the two stale GitHub texts** (bim-ootb issue #2974, PR #2975: "138" should read 130) with a comment, not an edit of history.

**D. How to keep the editor tooling healthy (the rules that made it trustworthy).**
- **It never guesses.** Every answer is a lookup in something the repo generated, or a named reason why there is none. A new feature that
  cannot say "I do not know" is not ready.
- **No knowledge of the codebase in the extension.** If a feature needs to read one file by name, the missing piece is a generated
  declaration (usually the manifest), not an exception in the extension.
- **One implementation per rule.** The bump rule is `lib/ship.js`; the stamp proof is `lib/lens_index.js`; the index is
  `scripts/gen_app_surface.js`. Extend the owner; do not write a second one next to it.
- **Three levels of proof, in this order:** the lib function on a fixture with a red control → the registered provider through the stub →
  the real editor (`tests/realvsc/`). The real-editor run found faults the first two could not (archive §F.10, §F.17, §F.18).
- **Text patterns have a ceiling.** The index's binding gate was widened twice and still leaves 11 fields unsure. The next widening should
  be the parser (which name holds the shared object), not a fifth pattern.
- **Keep it quiet.** One warning per real rule, one grey line only where a value is proven. A tool that shows something on every line is
  switched off within a week.
- **Plain JavaScript, no dependencies, nothing a page loads.** `§X0_ISOLATION … deps=0` is the check; keep it green.

**E. For a session that is not Fable.** Take ONE row of the RESUME table per session. Read its section in the archive first. Write the
spec lines, then the witness with its red control, then the code. Quote only `§` lines you have just produced. When a check fails,
suspect the instrument before the product (it was the instrument about half the time here). When unsure whether something is yours to
change (an ERP file, the film and camera family), file the issue and leave the code.

---

## §ORDER — why A → B → D → E → F → C

A is the only part tied to correctness (replay, posting dates), and A0 is cheap and settles a real question. B removes a whole class of stale-file
mistakes and is the data source for D, E and half of F. D and E are small once B exists. F's first features need nothing. **Owner, 2026-11-13: they go
first, as §F.4, the next session's bounded task**; A0 runs in parallel if a second session is free. C is long and best done slowly, module by module, after B/D make ownership visible.

## §READY — what a session can start with no owner decision (as of 2026-11-16)

| Part | Starts with no decision | Next decision to ask | Why that one |
|---|---|---|---|
| A | A0 ✅, A-1..A-5 ✅, A1 ✅ | none | the remaining A2 files (RESUME 2) |
| B | **B0: generator in check mode** (manifest built from today's files, regenerate, byte-compare; no file changes) | B-1 `?v=` numbers or hashes | B1 writes `?v=`; B0 does not |
| C | nothing; waits on B and D | C-1 part names + owners | |
| D | nothing new; the multi-publisher list already exists (`types/globals.gen.d.ts`) | D-1 where the questions list lives | needs B's `owner` field |
| E | `witness_kit/paths.js` (no behaviour change; witness: the same suite verdicts before and after) | E-1 the `PROVES:` header format | |
| F | the X0 "New witness for this file" command (ADVICE C ✅ 2026-11-16) | **F-19 (catalog + verb hover, RESUME 0b)**, then F-1, F-2, F-7 | F-18 ✅ 2026-11-15; F-19 follows the CLI + message lanes (2026-11-16) |

Ask the owner **one decision per message, with the recommendation** (START HERE 2). The recommendations are in each part and in ADVICE A.

## §M — re-measure before quoting

| Number | Command (bim-ootb root) |
|---|---|
| APP fields / phantoms | `node scripts/gen_app_surface.js` → header of `internal/APP_SURFACE.md` |
| script tags per page | `grep -cE '<script[^>]+src=' viewer/viewer.html erp/idempiere.html modeller/modeller.html` |
| clock/random/network calls | `node <bim-compiler>/scripts/code_arch/clock_probe.js <bim-ootb root> [pathspec …]` (committed 2026-11-13, #602; espree AST, comments never count; needs bim-ootb `node_modules`). Baseline @`a7c329e5`: default `erp/*.js` → `files=301 with_calls=58 calls=160`; the A-1 core pathspecs (`'erp/processes/*.js' 'erp/callouts/*.js' erp/ad_callout.js erp/doc_poster.js 'erp/model_*.js' erp/rule_fold.js erp/crud_core.js erp/kernel_ops.js`) → `112 / 19 / 32` (7 of them in `kernel_ops.js`); the viewer/4D set (`viewer/cpm_schedule.js 'viewer/schedule_*.js' viewer/tm_core.js common/room_graph.js`) → `11 / 7 / 32`. A3's W-CORE-PURE ports this probe into bim-ootb |
| printed `§TAG`s found in saved logs; logs with a code stamp (§F.6) | `node <bim-compiler>/scripts/code_arch/lens_precheck.js [<bim-ootb root>] [<bim-compiler root>]` (read-only, ~1 min; needs bim-ootb `node_modules` for espree) |
| UMD globals F12 can follow | `node scripts/tests/witness_global_types.js` |
| multi-publisher globals | header of `types/globals.gen.d.ts` (`node scripts/gen_global_types.js`) |
| witnesses per folder | `git ls-files \| grep -E 'witness[^/]*\.js$' \| awk -F/ '{print (NF>2)? $1"/"$2 : $1}' \| sort \| uniq -c \| sort -rn` (the first draft's `cut -d/ -f1-2` splits top-level `witness/` into one line per file) |
| ES-module files | `git ls-files '*.mjs' \| grep -cE '^(erp\|capex)/'` (53) |
| home-folder paths | `git ls-files -z \| xargs -0 grep -l "$HOME" \| wc -l` (665; slow on this tree) |
| live version | `curl -s https://red1oon.github.io/bim-ootb/erp/version.json` (`sha`, `build`) and each app's `sw.js` `CACHE_VERSION` |

## Relation to other files

- `prompts/REFACTOR_FOR_READERS.md`: the small, readability-only items. Items 4 and 6 are absorbed by part C, item 3 by D, items 7 and 8 by E.
  Items 1, 2 and 5 stay there.
- `prompts/BACKEND_SUBSTRATE_LANE.md`: owns determinism. Part A runs under its rules.
- bim-ootb `prompts/DEV_TOOLKIT_NO_AI.md`: owns the runtime-debugging extensions. Part F adds X0 Navigator on top.
- `docs/DeveloperGuide.md`: update §1 (patterns) and §5 (change flow) as each part lands.
- `prompts/WITNESS_INTERFACE_FRAMEWORK.md` + bim-ootb `witness_kit/contract.js`: own the witness contract. Part E builds on them.
- `prompts/4D_MODEL_INTEGRITY.md` §I: owns the 4D questions. Part A moves 4D files only under it, and part D folds it in rather than redoing it.
- bim-ootb `.github/workflows/deploy-pages.yml` + `scripts/minify_pages.js`: the real deploy (minified artifact). Parts B and F measure against it.
- `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md`: this file before it was cut down. Every §F.n
  section, the §VET pass and all owner exchanges in full.

## STATUS (2026-11-16; the RESUME block above is current)

| Part | What | State |
|---|---|---|
| A | pure core + Env | **A0 ✅** · **A-1..A-5 ✅** · **A1 ✅** (#3007) · **A2** done for 15 files (#3010 #3013 #3016 #3021 #3026 #3030 #3033), remaining listed in RESUME 2, then A3 |
| B | manifest per app | not started · B0 ready · open: B-1 to B-4 |
| C | named APP parts | not started · open: C-1, C-2 |
| D | owner table | not started · open: D-1, D-2 |
| E | proof map | not started · `paths.js` ready · open: E-1, E-2 |
| F | VS Code extension + facts server + the hovers | every unblocked row built (§F index) · §F.21 BIM trace + hover (#3043 #3047) · §F.22 ERP hover (#3055 #3057 #3059) · F-16 parity gate (#3050) · §F.23 BIM layered hover (#3064 #3069) · §F.24 X0 in CI (#3090) · §F.25 stale-copy stamp (#3092) · next: the X0 "New witness" command · open: F-19 (RESUME 0b), F-1, F-2, F-7, the F-12 step 2 token |

**§VET** (the 2026-11-13 vetting pass of every claim in this file) is in the archive.
