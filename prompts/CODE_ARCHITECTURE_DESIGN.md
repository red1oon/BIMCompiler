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

## ▶▶ RESUME HERE FIRST (rewritten 2026-11-18, ninth session; **"resume software" and "resume VSC" land here**)

Owner, 2026-11-18: *"consolidate the VSC prompt.md remove any stale or redundant sentences"*. This block replaces the dated resume entries of
2026-11-15 to 2026-11-18, and the finished build specs and results were moved out. Nothing was lost: the whole file as it stood before this cut is in
`prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-15_to_2026-11-18.md` under the same headings (earlier history: START HERE 7).
If a line here and a section disagree, the section wins.

**Standing rules.** "ERP" = the Kernel ERP JavaScript in bim-ootb `erp/`; legacy iDempiere Java is a read-only oracle (cite file:line, never copy it
in). Owner design talk: ONE detail per message, with a recommendation; record his answer in his words. Workers run on Sonnet; a code-design or spec
problem may go to one well-scoped Fable agent (owner 2026-11-17: *"if u hit a code design or spec problem use a well scoped Fable agent to resolve"*).
One heavy job at a time on this machine, under `nice -n 19 ionice -c3`. Headless-browser runs are allowed for this lane's parked browser items (owner
2026-11-16: *"U can do browser run for those items new session"*), one at a time, never beside a live bake or GPU work.

**0. SESSION CLOSE 2026-11-18 (tenth session; owner: "resume VSC" → "proceed").** Done, merged, verified on main:
B1-Q1..Q3 answered (A / yes / session cites + owner OK; #944) · the 37 order edges read in code and confirmed by the owner (#947) · **B1 ✅**: deps tool + W-DEPS-CAND (bim-ootb #3245),
the modeller written from `modeller/modules.json` (#3250 → `b9b2e522`; `§MANIFEST_ROUNDTRIP … claims=15/15 red=12/12 order_check=PASS deps_declared=25 verdict=PASS`; live `modeller/sw.js` v295 fetched back;
5 live sessions told first; the LOD pill lane's P5 (#3252) then merged through `modules.json` cleanly, check PASS on main) · **W-X0-MCP false FAIL fixed** (#3254: a 127.0.0.1 listener counted apart,
`network_modules=0 local_listeners=1 verdict=PASS`) · **E0 ✅** `witness_kit/paths.js` + W-PATHS (#3256, `§PATHS judged=10 same=10/10 red=3/3 verdict=PASS`; a worktree has no `tests/node_modules`,
so `nodeModule()` falls back to the shared checkout's installs; not in CI by design: every row is a /home path) · **F-25 ✅** the `x0` terminal command (§F.36, #3259,
`§X0_CLI verbs=8 same=8/8 red=2/2 verdict=PASS`; `cost [base]` and `last <file>` follow the tools' real arguments) · Developer Guide §4.1 (x0) + §5.1/§5.2 (modules.json) live, fetched back
(the docs guard aborted once on `glassbowl_data.db`, live but untracked: published with the live file's own bytes, nothing removed). Nothing unpushed.
Handed over as information (not this lane's): 7 modeller witnesses fail identically on unedited main (`dxf_accept_page`, `dxf_airgap`, `dxf_datum_pick`, `dxf_edefaults`, `dxf_libtypes`, `dxf_zdim`, `viewer_db_export`).
**Later the same session (owner "proceed", "resume"):** E-1, E-2, D-1, D-2, F-26 and the CI tier answered (each in its part's DECISIONS) · **F-26 ✅** `x0 session` (#3266 → `ca609a2b`;
W-X0-SESSION 8/8) + the SessionEnd hook in `~/.claude/settings.json` (stderr + exit 2, the only way the docs allow; checked end-to-end after `~/bim-ootb` pulled) · a B1 extractor bug found by
#3266's own CI and fixed there (a bare `'sw.js'` in any test counted as a modeller witness; 433 → 343 links) · CI coverage gap measured (21 of 1,512) and its tier decided.
**C15 watch item ✅ CLOSED 2026-11-19** (§B-3R RESULT): `modules.json` no longer stores `witnesses`, so a test-only PR needs no refresh commit. A module's tests: `node scripts/gen_manifest.js --witnesses <file>`.

**1. NEXT, in order** (session closed 2026-11-18 by the owner: *"close, will resume VSC in future"*).
00. **RENAME ✅ 2026-11-18: X0 / x0 → Code Facts / code-facts** (§F.40 SPEC + RESULT; bim-ootb #3317). Everything below that says X0 / x0 means this tool under its old name. Docs: Developer Guide §3/§4.1 rewritten, first sentence is the owner's. Film 4 v4 is the owner's next step, from the SCRIPT v4 section of `prompts/FILM_IMMERSIVE_SOFTWARE.md` (another agent).
0. **FILM 4 v4 ✅ BUILT 2026-11-18 (owner: "Lets do it")**: current file `~/Videos/Dev_Setup_CH0_EN_AFTER_2026-11-18_v4c.mp4`, 172.5 s (over the ~150 s target; the session beat is cut), scripts `scripts/film_dev_setup/` (v2 = git history). All gates PASS (`§FILM_GUARD`, `§K2`, `§KEYS`, `§FLOW`, `§STRIP_VIDEO`, voice 0 WRONG); one name on screen (Code Facts), a progress strip, three fixed cues, an animated pointer drawn to the token's real pixel rectangle. The owner's first v4 cut had a leftover top bar over the last cards (found by watching; fixed, check S in cards and on the encoded file). Details, defects, rebuild recipe in `prompts/FILM_IMMERSIVE_SOFTWARE.md` # FILM 4 STATUS. Waiting on the owner: review of v4c and a cut list (about 22 s over), F-27 (published installer: not now).
1. **B2 ✅ and B3 ✅ DONE 2026-11-20: all three apps are written from `<app>/modules.json`** (ERP bim-ootb #3367 + #3373, viewer #3378 → `14bb498f`; Part B, "B2 PART 2 RESULT" and "B3 RESULT"). **B3-Q2 ✅ ANSWERED 2026-11-21: the three outside pages come in NOW (step B3-OUT, before B4-HASH), then the old regex path of `bump.js` is deleted. B3-Q3 ✅ 2026-11-21: `archive/gallery.html` frozen. **B3-OUT ✅ DONE 2026-11-22** (bim-ootb #3385 → `0fa163b8`, Fixes #3379; B3-OUT RESULT in Part B). Next in B: then the B4-HASH spec (content hashes, an announced step, B-1).**
2. **D spec** (owner table: `<app>/questions.json`, `"extends"` marks, W-OWNER-UNIQUE).
3. Grow the CI fast tier when a runner has filled the cache (`node scripts/gen_ci_tier.js --write --probe`); add `PROVES:` lines as witnesses are touched.
4. **§F.41 W-VSC-OPERATIONAL ✅ 2026-11-19** (#3332): 39 entry points, all routed, 27 run, 12 not run by design (browser / heavy, named); local, ~90 s. Run it before a PR that adds a page, command or runner.
5. **2026-11-30:** propose the F-2 cost ceilings (§F.3). The F-1 headless Fetch-back button is still unbuilt.
Done this session (tenth): B1, E0, E1, F-25 `x0`, F-26 `x0 session` + SessionEnd hook, CI fast tier (61 of 1,512), §F.38 from scratch + guide §3 — results in their sections.

**2. Where each part stands.**
| Part | State | Next step |
|---|---|---|
| A | ✅ DONE 2026-11-17: A0, A-1..A-7, A1, A2, A3 (W-CORE-PURE PASS, `forbidden=0`, in CI). Results: Part A RESULT INDEX | none |
| B | **B0 ✅** (#3200, W-MANIFEST-ROUNDTRIP in CI) · **B1 ✅** 2026-11-18 (#3245, #3250: modeller written from modules.json, 25 deps declared) · **B-1 ✅** 2026-11-18 content hashes, own step · **B-2 ✅** 2026-11-18 per-module flag as today · **B-5 ✅** tool proposes deps, a person confirms · **B-3 ✅** owner + witnesses per module · **B-4 ✅** plugin precache derived, `BUILTINS` untouched | **B2 ✅** and **B3 ✅** 2026-11-20 (#3367, #3373, #3378): viewer, ERP and modeller written from `modules.json`, 261 deps declared. **B3-Q2 ✅** 2026-11-21 (outside pages in now). **B3-Q3 ✅** (gallery frozen). **B3-OUT ✅** 2026-11-22 (bim-ootb #3385 → `0fa163b8`). Next: the B4-HASH spec |
| C, D | not started; B's data is now there for all three apps (D can start: D spec) | — |
| E | **E0 ✅** 2026-11-18 `witness_kit/paths.js` (#3256) | ask E-1 (the `PROVES:` header) |
| F | every row that needs no data from B to E is built (§F index, F.0 to F.35) | F-2 ceilings on 2026-11-30; the F-1 headless Fetch-back button (unbuilt, browser go given); rows waiting on B/D/E data |

**3. The tools (bim-ootb `devtools/`; Developer Guide §4.1, §4.2, §5.6, §6, §6.1 live).** **Code Facts** (formerly X0, renamed 2026-11-18, §F.40) answers questions about this code from the repo's own indexes (where a name is written, what a tag means, how a file reaches users, what a change costs). Read-only, no network. Two forms: a VS Code extension (`devtools/vscode/code-facts/`) and a terminal command (`node devtools/code-facts/code-facts.js <verb>`, verbs `where uses tag loaded cost last context check pure bump session`); an optional facts server for an AI assistant, `devtools/mcp/code-facts/`, is OFF by default. In the editor: F12 / hover / Find All References on
shared-object fields, `§TAG` hover with the last provable value, *Context for this file*, *New witness for this file*, Run & Ship, the Bump button
(background check, one press to write, parity gate inside), Deploy main now, hover and F12 for message keys and door verbs, the core-purity warning,
the browser-memory panel, snippets `witness` / `slog` / `spec`. Hovers in the apps (a separate overlay): BIM body → its builder line and layers, ERP field → every layer in
firing order (`devtools/hover/README.md`). The installed Code Facts copy warns when it is older than
the source (§F.25): reinstall with `node devtools/vscode/pack.js --install`. A saved edit does NOT show on a plain reload (service worker; measured
2026-11-14); the hot server is parked at `~/.cache/bim_film3/hot_server_parked/`.

**4. Films (never committed; scripts + logs are).** CH 0 · Immersive Software (`prompts/FILM_IMMERSIVE_SOFTWARE.md`, scripts
`scripts/film_immersive_software/`, `scripts/film_erp_layers/`): film 1 the BIM hover, film 2 the ERP field (+ Mandarin), film 3 BIM with layers,
built and waiting for the owner's review (see that file's FILM 3 STATUS). Earlier CH 0 "VSC Hot Edit" films: `prompts/FILM_IDE_ERP_DEBUG.md`.
Rebuild recipes are in each film file.

**5. Open with the owner.** the read-through of Developer Guide §3 "Start from scratch" (or the 29-step dry run) before announcing the VS Code setup · D-2 (`"extends"`) · FILM 3 review · "When AI Dies" EN/TH/ZH review · his hands-on dry run (`~/VSCcheatsheet.txt`, 29 steps; `~/bim-ootb-dryrun`
not created) · a bake on his go (then check a "last:" line, §F.15).

**6. Open, no owner needed.**
- 9 of the 51 node witnesses that load `ad_callout.js` fail on unedited `main` (measured 2026-11-17 by §F.33's first run; list in the archive).
- The Modeller runner on this machine: `§ALLWITNESS PASS=106 FAIL=10 SKIP=5 ENV=12 of 133` was measured before the shed inputs were restored
  (2026-11-15, `~/Videos/dxf2bim_film_work/why/{raw,cli/marked}`, README there). Some witnesses need `SHED_RAW_DIR=~/Videos/dxf2bim_film_work/why/raw`.
- 11 `PHANTOM?` fields (§F.17, a Part C question).
- **Code Facts witnesses not PASS before AND after the rename (machine state, not fixed; §F.40 RESULT has the table):** `activate` FAIL, `heap_impact` INCONCLUSIVE, real-VS-Code `bump=N`. Look at `activate` next.
  **`cli` ✅ 2026-11-19, no code defect:** re-run on bim-ootb `main` @ `d04188e1`, unedited, gives `§CODEFACTS_CLI verbs=8 same=8/8 help_rows=11 pure=Y isolated=Y red=2/2 verdict=PASS`, in a clean worktree AND in the shared checkout.
  The 2026-11-18 `same=7/8` was the `check` verb: it judges the working tree against the base (`§SHIP_SYNTAX files=N vs=origin/main`), so its text follows whatever that tree held at that moment. Not reproducible on a clean or current tree.
  **Worktree trap found on the way:** with no `node_modules` in a `/tmp/wt-*` worktree, `pure` exits 1 with `Cannot find module …/node_modules/espree`, and so does the `cli` witness (`pure=N verdict=FAIL`). Eight dev files hard-require `<root>/node_modules/…` instead of `witness_kit/paths.js` `nodeModule()`: `scripts/lib/core_pure.js:9`, `scripts/lib/page_refs.js`, `scripts/gen_global_types.js`, `scripts/setup.js`, `scripts/tests/witness_manifest_roundtrip.js`, `devtools/hover/erp_sites.js`, `devtools/hover/trace_sites.js`, `viewer/tests/witness_tm_played_layer_midair.js`. For now, link `~/bim-ootb/node_modules` into the worktree. Not fixed. Routing them through `nodeModule()` would be one small PR.
- Leftover: worktree `/tmp/wt-film-devsetup3` (superseded v3 film, 33 uncommitted files, never pushed): the owner may delete it; the v3 mp4 is in `~/Videos`.
- Other lanes' items, handed over as information only: the 4D cache's `witness.log` has no `§LOG_STAMP` (`scripts/cache_4d_run.js` is
  `prompts/4D_MODEL_INTEGRITY.md`'s) · `common/door/object_cli.js:212` stamps the model Trx `now` in UTC while `erp_cli.js` stamps local time
  (the CLI lane's, `prompts/CLI_ERP_IVR.md`, owner 2026-11-16: *"Focus on your VSC side, let the others handle as your info"*) ·
  `witness_fa_gap` slow / FA FAIL and M3 HARNESS-FAIL (`prompts/SQLiteIDEMPIERE.md`).

**7. Traps this lane has paid for.**
- **A registry's own summary is not the truth:** `describe()` missed directly-put classes (§F.22). Ask the code path that RUNS (the engine's
  lookup), and give the witness an independent source.
- **A witness that reads the tool's own output to judge the tool is blind; a witness that tries one case is scope-blind.** Red-run every new
  check against the OLD code: it must FAIL.
- **A text grep that globs a file twice inflates counts** (`erp/*.js` + `erp/model_*.js`); the parser count is the number.
- **A devtools file that spells the shared object's access in a string becomes a fake field** in the X0 index: run
  `devtools/vscode/x0-navigator/tests/witness_x0_appdef.js` before a devtools PR.
- **Headless pages:** wait for the field you read; a fresh browser context per session; the Modeller's camera is inside a module (sweep with
  real mouse moves instead).
- **"Auto-merge off" does not hold in bim-ootb:** the github-actions bot turns it back on (#3168 merged before its gate check). To hold a PR
  back, open it as a DRAFT. bim-compiler has no auto-merge (merge by hand).
- **The parity gate** runs only the bridge witnesses that read the bumped tree (§F.32, ~5.5 min) plus the changed file's own witnesses
  (§F.33, up to ~16 min). Which bridge witnesses load the bumped tree: check by `grep BRIDGE_OOTB`, never from memory. Link all 39 untracked
  `build/erp/*.db` into a fresh bridge worktree. The real-VS-Code witness and the gate default to `~/bim-compiler`, which is usually on another
  branch: pass `--compiler-root` at a current bim-compiler.
- **`rm` with a relative glob after a `cd` is blocked by the safety check** (the whole command does not run, edits included): never chain a
  removal onto an edit.
- `< /dev/null` on every `node` in a loop; wait on processes, not on a log marker from the previous run; `*.log` is gitignored (`git add -f`
  the logs a spec commits); bim-ootb merges with `--auto --squash` (wait for MERGED, re-run on `main`); the bim-compiler checkout is on another
  branch (read `git show origin/master:…`, edit in a `/tmp/wt-*` worktree); never `git stash` (shared), never `--force` a worktree path.
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
6. **Order:** A → B → D → E → F → C (reasons in §ORDER). F's unblocked rows and Part A are done; the design continues at Part B.
   What to do next is in ▶▶ RESUME HERE FIRST, nowhere else.
7. **History:** every build spec, result and finding is in the archive, under the same `§F.n` / `A…` names:
   `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md` (2026-11-13/14) and
   `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-15_to_2026-11-18.md` (2026-11-15 to 18). Read a section there
   before changing the code it describes. This file keeps one line per finished section (the §F index, Part A RESULT INDEX).

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

**RESULT INDEX (Part A is DONE 2026-11-17; each step's spec, witness and logs are in the 2026-11-15→18 archive under the same name).**
| Step | What | bim-ootb PR | Proof |
|---|---|---|---|
| A0 | an op-log replay applies the ROWS, not the process, so the clock fallbacks are tidy-up, not a replay bug | #2997 | `§REPLAY_CLOCK … match=Y`, both time zones |
| A1 | `Env.stamp/modelEnv/nowStamp/nowMs` (A-2) | #3007 | W-ENV-VIEWS |
| A2 | session day = local day (#2996) · `Import*` x7 + `ClientAcctProcessor` · `InvoiceGenerate` + `InOutGenerate` · `model_asi` + `doc_poster` · `crud_core.localDay` + report handlers | #3010, #3013, #3016, #3021, #3026 | each file's posting/parity witnesses unchanged |
| A2-EDGE | `Env.setEdge` / `Env.edge()` (A-5): `rule_fold.js`, `processes/PackIn.js` | #3030, #3033 | W-RULE-FOLD-EDGE |
| A2-TIMING-1..3 | timing reads through `Env.elapsed` / the one global `CoreEdge` (A-4, A-6): the ERP pair, the 4D pair, `room_graph.js` + `schedule_inject.js` | #3110, #3122, #3124 | `§CORE_TIMING checks=6 failed=0 verdict=PASS` (TIMING-1); 4D cache identical |
| A2-VALUE-1 | the viewer core's last clock/RNG reads (baseline `set_at`, cache stamp, tab id) | #3135 | W-CORE-TIMING T12–T14 |
| A2-EDGE-2 | `crud_overlay._modelEnv` and `plugin_overlay`'s env become views of the one edge clock | #3140 | W-EDGE-PRODUCERS |
| A2-PIPO | bundle Pack In stamps local time, as legacy does (`PO.java:1985/:3341`) | #3143 | W-PIPO-LOCAL |
| A3-CLOCK-1 | a Java process's SYSDATE was the UTC wall clock and froze the page clock; also InventoryCountCreate's scrambled rows | #3146, #3149 | W-PROC-SYSDATE |
| A3-CLOCK-2 | `RUNTIME.now` and `generate_uuid` read the installed edge | #3168 | post-merge gate check on `main` @ `b732d923` PASS |
| A3 | W-CORE-PURE: an AST scan of the 125 A-1 files, in CI fast-checks (A-7: values only) | #3181 | `§CORE_PURE files=125 parse_fail=0 forbidden=0 red_control=detected verdict=PASS` |

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
  installed once by the page; core modules ask `Env.edge()`; no edge installed = `§ENV_NO_DATE` + throw (A-3).** Spec: A2-EDGE (archive).
- 2026-11-16, owner, on **A-6** (the viewer and `common/` files never load `erp/ad_callout.js`, so they have no `Env.edge()`; where does their edge come from?
  advice given: Option 1, one shared global edge): chose *"Option 1 (Recommended)"*. → **A-6 = one global `CoreEdge` `{nowMs, uuid, perfMs}`, installed
  once by each shell: `viewer/viewer.html` with a small inline `<script>` (no new file, so no precache / `?v=` list grows), `erp/ad_callout.js`
  `Env.setEdge` stores into that same global (one holder), and Node runners (`scripts/cache_4d_run.js`, probes) install it the same way. Core reads it
  at call time. No edge: a timing prints `ms=?`; a missing date or id fails loudly (A-3).** Rejected: loading the ERP file in the viewer (a big file on
  every boot, against lazy loading); passing `opts.edge` through every call (every caller changes). Spec: A2-TIMING-2 (archive).
- 2026-11-17, owner, on **A-7** (what W-CORE-PURE fails on; measured on `main` @ `249fb934` over the 125 A-1 files: clock/RNG 6, network 0, storage 2
  (`schedule_author.js` IndexedDB cache), `window` 330 = the UMD wrapper, `console` 246 = the `§` lines, `document` 26 in 3 files; a literal ban fails
  ~600 lines, none a determinism bug; advice: values only): chose *"Values only (Recommended)"*. → **A-7 = W-CORE-PURE FAILS on clock, random and network
  calls (goal `forbidden=0`); storage, `document` and `console` are printed as per-file INFO counts for Part C; the wrapper's `window` is not counted.**

---

## PART B — One manifest per app   (fixes P2, declares half of P1)

**Design.** Each app (`viewer/`, `erp/`, `modeller/`) gets one small JSON manifest listing every module it loads, in order:
`{ "file", "deps": [...], "load": "boot" | "lazy", "lazyGroup": "find", "precache": true | false, "v": 5 }`.
A generator script (dev-side, like `scripts/gen_global_types.js`) **writes** the derived parts that are hand-kept today: the page's
`<script>` block between two marker comments, the lazy list in `viewer/main.js`, each `PRECACHE_ASSETS`, every `?v=`, and the `CACHE_VERSION` bump
when anything it covers changed. The page stays a static file. **No build step at run time:** the generated text is committed, exactly as today.
- Load order becomes **declared** (`deps`), and the generator refuses a manifest whose order breaks a dependency.
- Lazy loading becomes an explicit flag, and `precache` is recorded per module exactly as today (decision B-2; B0 measured that the viewer has
  no single rule today, and the ERP/modeller lazy parts ARE precached for the air gap on purpose, `erp/sw.js:408-421`).
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

**OPEN DECISIONS:** none. B-1 to B-5, B1-Q1 to B1-Q3, B2-Q1, B2-Q2, B3-Q2 and B3-Q3 are answered (DECISIONS).

**Witnesses:** W-MANIFEST-ROUNDTRIP (manifest → generated text byte-identical to committed; red control: swap two dependent modules → generator
refuses) · `audit_sw_precache.js` · page boot witnesses unchanged.
**Done when:** all three apps generated from their manifests, round-trip identical, `bump.js` retired or reduced to "edit `v`", and the Pages
deploy workflow still green on the first merge after each switch (fetch `erp/version.json`, §F.2 Fetch back).
**DECISIONS:**
- **B-1 (2026-11-18): content hashes, as their own announced step.** Asked with B0's counts (unify numbers inside the apps = 17 sites change, still hand-bumped, 42 inline literals `bump.js` cannot see; content hashes = all 715 versioned sites change once, every user re-downloads every tagged file once, offline installs on slow links included) and the recommendation "content hashes, done as its own announced step on a quiet day". Owner: *"proceed"*. **What it means for the plan:** B1 to B3 keep today's numbers and stay byte-identical (the manifest is introduced alone, so a break points at one cause); then one separate step, B4-HASH, switches every `?v=` to an 8-hex content hash, announced to the owner beforehand with its date, and `bump.js` is retired. The hash step's spec (which bytes are hashed: git source or the minified deploy output; how `CACHE_VERSION` follows) is written before B4-HASH, not now.
- **B-2 (2026-11-18): each module's precache flag is recorded as it is today; no per-app rule yet.** Asked with B0's counts (lazy AND precached: viewer 15,
  erp 22, modeller 21; lazy, not precached: 26 / 1 / 10; so the viewer has no single rule today, and Part B's "viewer lazy = not precached" did not match the
  files) and the recommendation "copy each module's state as it is; choosing one rule, e.g. precache every lazy module, is its own later step, because
  changing what is saved offline in the step that brings in the manifest would hide which change broke something". Owner: *"Agree."* → the manifest
  writes `precache` per module; the generator refuses nothing on lazy + precache in B1 to B3.
- **B-5 (2026-11-18): who declares `deps` — a tool proposes, a person confirms, once per app.** Asked with B0's finding (nothing records a dependency
  today; load order is tag order) and three options: a script reads the code and lists each module's likely dependencies, someone checks that list once per
  app as it switches (modeller, then ERP, then viewer) (recommended) · by hand only (slow across ~680 modules, easy to miss one) · tool only (records what the
  code seems to need, which can be wrong when an order works by luck). Owner: *"Agree"*. → each of B1 to B3 ships the app's candidate list and the
  confirmed `deps` together; a dependency the tool cannot prove goes in only once a person confirms it.
- **B-3 and B-4 (2026-11-18).** Asked B-3 (should each module's entry also carry its owner and the witnesses that check it; recommendation yes: parts D and
  E get their data for free, and the F rows "owner warning" and "run the witnesses for this file" can be built; no = separate hand-kept lists later).
  B-4's recommendation was the one already written in ADVICE A (derive only the plugin precache entries from the `.mjs` files on disk; leave `BUILTINS` /
  `INSTALL_ONLY` in `erp/plugin_overlay.js` as the host's one list, so B never becomes a second plugin registry). Owner: *"Agree on your recommendations"*
  (plural, so it is recorded for both). → **B-3 = yes**: `owner` and `witnesses` fields per module. **B-4 = derive the precache entries only.**
  Plan note (from B0's `§MANIFEST_PLUGINS precached_mjs=29 on_disk=36`): deriving from disk would add 7 entries to ERP's precache, which changes what is
  saved offline, so by B-2's reasoning it is its own step after B2, not part of B2's byte-identical switch.
- **B-3 REVISED (2026-11-19, eleventh session): a module's witnesses are worked out when asked, not stored; `owner` stays stored.** First asked: should the
  refresh move into `bump.js` (the watch item of the tenth session; advice yes). Owner: *"Folow your advice"*. Reading the code before building showed that
  advice did not fit the failures that happened: four other-lane PRs on 2026-11-18 (#3269, #3285, #3295, #3298) each needed an extra "refresh modeller
  witnesses" commit, and each one only ADDED A TEST naming a modeller-side file (`common/lib/sql-wasm.js`, `modeller/arc_editable.js`), and a test-only PR
  never runs `bump.js`. Asked again: keep the stored list (refresh in bump + C15 a warning; the file then holds a list that is sometimes stale) or work it
  out when asked (recommended; the extractor already exists, one reader `scripts/gen_proof_map.js:39` moves onto it). Owner: *"Follow your advice"*.
  → §B-3R SPEC below.

- **B3-Q2 (2026-11-21, thirteenth session).** Asked with the recommendation "keep the old regex path of `bump.js` for the three outside pages until B4-HASH". Owner: *"is it better to change early and mature faster?"*
  The session then measured the three pages against the apps' lists (bim-ootb `main` @ `e4fa52fe`, each page's `?v=` against the owning app's `modules.json` `v`):
  `index.html` loads 7 app files and 2 are behind (`viewer/locale_loader.js` 15 vs 16, `viewer/import_db_builder.js` 11 vs 12) · `capex/index.html` loads 6 ERP files, 0 behind ·
  `archive/gallery.html` loads 9 files in 15 tags, most behind (e.g. `viewer/import_worker.js` 9 vs 22). (`test/test_ifc_export.html` also matches `?v=`, but only inside `new Worker(...)` literals of a May fixture: not a tag.)
  So the old path does not keep them in step today, and B4-HASH would have to bring them in anyway. Revised recommendation: bring them in now, each outside tag taking its number from the app that owns the file
  (`capex/` is not a fourth app: all 6 of its tags are ERP files), delete the regex path, and let W-MANIFEST-ROUNDTRIP cover the three pages. Owner: *"proceed"*. → **B3-Q2 = bring them in now, as step B3-OUT, before B4-HASH.**
  **CORRECTION, same session, after reading `scripts/bump.js:122-134` and the history:** "behind" was partly wrong. The regex path DOES raise outside pages (every page not owned by an app), each site from ITS OWN number,
  so a different number is not a stale one: `fce8fdc4` (#3302) raised `index.html`'s `locale_loader.js` 14→15 in the same commit that raised the viewer's 15→16. The ONE real miss measured: `viewer/import_db_builder.js`
  went 11→12 in `viewer/viewer.html` (#2702, `8d1ede96`, 2026-11-08) but `index.html` stayed at 11 (that change did not go through `bump.js`). No `sw.js` serves `index.html`, `capex/` or `archive/`, so the cost of a miss there
  is the browser's own cache, not a service worker. The decision still stands on its other grounds (B4-HASH has to bring these pages in anyway; one real miss exists; one step, one cause); the owner was told the correction.
- **B3-Q3 (2026-11-21, thirteenth session).** Asked: is `archive/gallery.html` frozen as it is, or kept current? Measured: it is the old front page kept when the new landing replaced it (`index.html:8`), nothing links to it
  (one code comment, `viewer/scene.js:1072`), last edited 2026-10-04; freezing stops only its `?v=` from following, the page still loads today's files. Recommended: freeze it (the witness counts its tags, owns none, no bump edits it;
  B3-OUT covers `index.html` + `capex/index.html`, 14 tags). Owner: *"agree"*. → **B3-Q3 = frozen.**

- **B2-Q1 and B2-Q2 (2026-11-20, twelfth session).** Asked B2-Q1 with the measured 216 order-forcing edges and the recommendation "the session reads all 216 and cites each; the owner is shown only the ones that
  are not plain, plus the count of the rest". Owner: *"decide for me"*. → **B2-Q1 = as recommended.** The session took the same words for **B2-Q2 = yes** (an ERP bump raises the inline literals with their module, the two service-worker
  register lines stay pinned): it was the other open question of the same spec, and its recommendation repeats his B1-Q2 answer for the modeller. He was told so in the same reply; it can be reversed before the switch PR (part 2) at no cost.

- **B1-Q1, B1-Q2, B1-Q3 (2026-11-18, tenth session).** Asked one per message with the B1 BUILD SPEC counts. **B1-Q1** (32 comments + 4 inline scripts between the page's
  67 tags, 59 comment marks between `sw.js`'s 164 entries; A = they stay in the files, tool rewrites only tags/entries, +4 marker lines; B = into the manifest;
  C = a marker pair per run, 174 lines): owner picked **"A: stay in files (Recommended)"**. **B1-Q2** (may a modeller bump also raise the 17 inline `?v=`
  literals so each module has ONE number): owner **"Yes, raise them (Recommended)"**. **B1-Q3** (who confirms the dependency list): owner **"Session cites,
  you OK (Recommended)"** = the building session cites file:line for each of the 17 order-forcing edges, the owner confirms that short list in one message,
  the ~89 call-time edges go in as `uses` on the tool's evidence alone. → The B1 BUILD SPEC stands as written (it was written for A / yes / this answer).

**B0 BUILD SPEC (2026-11-17, eighth session; bim-ootb #3195; no owner decision).** Owner, this session: *"if u hit a code design or spec problem use a well
scoped Fable agent to resolve"* → the measuring and the design below came from one such agent (read-only), then checked here. Measured on bim-ootb `main` @ `695d16fe`:
- **Tags** (a tag reader, comments and inline bodies skipped): viewer.html 252 (249 with `?v=`), idempiere.html 226 (224), modeller.html 62 (59). `grep -c` counts LINES
  (250/212/61, the numbers P2 quotes). Two shapes only: `<script src="X"></script>`, and the same with one `onerror="…"`. The tags are not one block: the first-to-last
  span holds 27/70/32 comments and 6/7/4 inline scripts. A raw regex also hits a `document.write('<script src=…` inside an inline script (idempiere.html:847, modeller.html:360).
- **Versions `bump.js` cannot see:** inline page scripts hold whole `'file?v=N'` literals (at least 1 viewer, 17 erp, 7 modeller).
- **Service workers:** `PRECACHE_ASSETS` 272 / 405 / 159 entries, all plain string literals, no `?v=`; modeller has 1 duplicate; one `CACHE_VERSION` each. Running each
  `sw.js` in a Node `vm` with stubs returns the same list a parser extracts. erp precaches 29 `plugins/*.mjs` of 36 tracked. Only the viewer has a precache audit.
- **Versions disagree:** 582 files are referenced with `?v=`, 81 from more than one place, **27 with different numbers in different referrers (11 inside one app, 16 only
  across apps)**; 34 sites sit below their file's highest number. So "one `v` per module" cannot reproduce today's bytes. 11 referenced targets do not exist, all from referrers outside the three apps.
- **Nothing records a dependency today.** Load order is tag order.

**Decisions taken inside B0 (each with the alternative rejected):**
| # | Decision | Rejected |
|---|---|---|
| D1 | An **app** = a folder with a tracked `sw.js` named in Part B (`viewer/`, `erp/`, `modeller/`); its pages are every tracked `.html` under it; its loaders the `.js` under it that hold a whole `'file?v=N'` literal. Everything else is counted as outside, never owned | only the three main pages (hides the 11 same-app disagreements; `bump.js` could never retire) |
| D2 | A module is keyed by repo-relative file and listed in every app that references it | one global manifest |
| D3 | The unit is the **site** (one reference in one referrer). A module's `v` is set only when all the app's sites agree, else `null` and each site keeps its own. Any B-1 answer turns every `null` into a value | "take the highest" (a decision, and not byte-identical) |
| D4 | The generator owns **whole sites** (the whole tag with its `onerror`, the whole string literal, the whole `CACHE_VERSION` literal) and writes each from manifest fields by one fixed template per kind. The rest of the file is the frame. No markers in B0 | digits only (a tautology); whole blocks (impossible today, see the span fact) |
| D5 | `deps` is `[]` everywhere, `"depsDeclared": false`; the order check prints `order_check=NOT-JUDGED`, never PASS | deriving deps from "reads a global another file publishes" (precision unmeasured; a false edge would later refuse a legal reorder) |
| D6 | The manifest stays in memory; `--out <file>` writes it outside the tree on request; no `--write` in B0 | a committed manifest nothing reads yet (P2 again) |
| D7 | `bump.js` and the audits are not touched: their parsers are the independent second readers. The new readers live once in `scripts/lib/page_refs.js`; bump and the audits move onto it in the B-step that makes the manifest the source | refactoring bump now |
| D8 | Plugin `.mjs` precache entries are counted, never interpreted (B0; B-4 since answered: derive them, in their own step) | reading each plugin's `manifest` export |

**Manifest (in memory, ajv-checked):** `{ app, sw, cacheVersion, depsDeclared:false, pages[], modules[], precacheOrder[] }`; a module is
`{ file, deps:[], load:"boot"|"lazy", lazyGroup, precache, v, sites[] }`; a site is `{ in, at, kind:"tag"|"asset"|"inline"|"lazy", as, v, onerror?, q? }`
(`at` = its place in the file `in`; `load` is `boot` when any site is a `tag`; `lazyGroup` in B0 is the loader file; `precache` = the file is in that app's `PRECACHE_ASSETS`).
**Readers (`scripts/lib/page_refs.js`):** HTML by a small state machine (comments skipped whole, `script`/`style`/`textarea`/`title` bodies raw to the closing tag, quoted
attributes, byte ranges); inline script bodies, loaders and `sw.js` by espree only; a site is a string literal whose WHOLE value is `path.(js|css|json|wasm|mjs)?v=digits`;
any other `?v=` literal is counted as partial, never owned. **Generator (`scripts/gen_manifest.js --check`):** regenerate = frame + each site rendered from the manifest
after a JSON round trip; exit 1 on a file that differs from the committed bytes (file, line, the canonical spelling), a non-literal `PRECACHE_ASSETS` element, a schema
failure, or two runs giving different manifest bytes.
**Witness W-MANIFEST-ROUNDTRIP (`scripts/tests/witness_manifest_roundtrip.js`):** population = every owned file of the three apps by `git ls-files`; denominator = sites per kind per app. Claims, each with its own source:
C1 every script tag is a site (raw `<script[^>]+src=` count on the page minus on the frame; the hits left must lie in inline bodies; bump's PAGE_REF hits) ·
C2 the precache list and `CACHE_VERSION` (the `vm` run of the committed `sw.js`) · C3 loader sites (bump's JS_REF hits against the parser's literals) ·
C4 the frame holds no module data (frame re-read: 0 sites) · C5 the manifest drives the output (for EVERY versioned site: +1 in the manifest, regenerate, the bytes differ in that site's range only) ·
C6 the viewer counts equal `tests/audit_sw_precache.js`'s own summary · C7 the sites equal what a `bump.js` dry run of every target prints.
**Red controls, same run, each must FAIL:** R1 swap the places of two adjacent tags in the manifest · R2 drop one precache entry · R3 change `CACHE_VERSION` ·
R4 reader fixtures on a copy of the real modeller.html (a tag in a comment and in an inline string adds 0 sites, a planted real tag adds 1, a non-canonical tag is refused) ·
R5 the order checker on a synthetic edge between two adjacent real modules, then swapped (`synthetic=Y`: it proves the refusal code, not any dependency).
**The lane's red control "swap two dependent modules" becomes real only when deps are declared** (decision **B-5**, answered 2026-11-18, DECISIONS: who declares `deps`? advice: a tool-derived candidate list, confirmed by hand per app in B1 to B3).
**INCONCLUSIVE** when any app has 0 sites, any parse fails, any red control does not fail, the `vm` run throws, the bump dry run or the audit prints no summary, or C5 judged 0 sites.
`§MANIFEST_ROUNDTRIP apps=3 files= sites= tag= asset= inline= lazy= precache= identical=N/N driven=N/N sw_vm=3/3 red=5/5 order_check=NOT-JUDGED verdict=`.
**Findings printed, never a failure (they feed B-1, B-2, B-4):** `§MANIFEST_VERSIONS` (disagreements, sites below max) · `§MANIFEST_UNVERSIONED` · `§MANIFEST_INLINE_SITES` ·
`§MANIFEST_MISSING` · `§MANIFEST_LAZY_PRECACHE` (lazy+precached, boot not precached, duplicates) · `§MANIFEST_PLUGINS` · `§MANIFEST_OUTSIDE`.
**Not in B0:** any write to a page, loader or `sw.js`; markers; a committed manifest; dependency data; owner/witness fields (B-3); plugin reading (B-4); unifying versions or hashes (B-1);
a lazy+precache rule (B-2); pages outside the three apps, `oplogpic/`, importmaps, `_GANTT_CACHE_VERSION`. **CI:** one fast-checks step, beside W-CORE-PURE.
**Issue proved:** "the module lists kept by hand in pages, lazy lists and service workers cannot be rebuilt from one manifest per app without losing or changing a byte".

**B0 RESULT (2026-11-17, eighth session): ✅ DONE (witness), bim-ootb #3195 / PR #3200, merged `7ee6a108`.** +568 lines, 0 removed; no page, loader, `sw.js` or `bump.js` changed. Logs read:
- Full run on `main` @ `695d16fe`: `§MANIFEST_ROUNDTRIP apps=3 files=54 sites=788 tag=667 asset=0 inline=42 lazy=79 precache=836 identical=54/54 driven=715/715
  sw_vm=3/3 claims=7/7 red=5/5 order_check=NOT-JUDGED verdict=PASS` (`§WITNESS_MANIFEST_ROUNDTRIP pass=5 fail=0 ran=54`). CI (`--skip-c7`): `claims=6/6 c7=NOT-RUN … verdict=PASS`. Re-run on merged `main` @ `7ee6a108` (which had moved): `sites=790 … identical=54/54 driven=717/717 … verdict=PASS`.
- Claims: C1 raw tag hits 669, 2 left in frames (the two inline `document.write` texts), tag sites 667 · C2 `vm` run of each `sw.js` same list, order and version 3/3 ·
  C3 JS_REF hits 79 = lazy sites 79 · C4 every frame re-read holds 0 sites · C5 driven 715/715 · C6 audit 272 / 247 / 214 = manifest 272 / 247 / 214 ·
  C7 bump dry run: 666 lines in owned files = 666 manifest sites, 0 missing, 0 extra.
- Red controls R1 to R5 all detected (`§MANIFEST_RED`). **Red on real files** (edit, run, revert): two spaces before `src` → `§MANIFEST_FAIL modeller/modeller.html:224
  differs from what the manifest writes …` `identical=53/54 verdict=FAIL`; a non-literal precache entry → `§MANIFEST_FAIL modeller/sw.js: 1 PRECACHE_ASSETS element(s) are not plain string literals`.
- Per app (`§MANIFEST_APP`): viewer 5 pages, 15 loaders, 302 modules (261 boot, 41 lazy), 337 sites, precache 272 · erp 13 / 5 / 283 (260, 23) / 352 / 405 ·
  modeller 2 / 11 / 94 (63, 31) / 99 / 159.
- **Findings for the open decisions (printed on every run, never a failure):**
  - **B-1** `§MANIFEST_VERSIONS`: inside an app, viewer 3 modules disagree (3 sites below the highest), erp 10 (14 sites), modeller 0. So unifying numbers inside the apps
    would change 17 sites; content hashes change all 715 versioned sites once.
  - **B-1** `§MANIFEST_INLINE_SITES`: 42 versioned literals sit in inline page scripts (viewer 2, erp 23, modeller 17), which `bump.js` cannot see; tags with no `?v=`: 13 / 56 / 4.
  - **B-2** `§MANIFEST_LAZY_PRECACHE`: lazy AND precached viewer 15, erp 22, modeller 21 · lazy, not precached 26 / 1 / 10 · boot but NOT precached 43 / 13 / 7 ·
    precached but referenced by no site 39 / 136 / 81 · duplicate entries 0 / 0 / 1. Part B's "viewer lazy = not precached (today's rule)" does not match the files: 15 viewer modules that no page loads by a tag are precached (not looked at one by one here).
  - **B-4** `§MANIFEST_PLUGINS precached_mjs=29 on_disk=36`.
- **A defect in today's bump, found by C7 (bim-ootb #3201; ✅ FIXED the same session, PR #3204, merged `c5bdc601`, see below):** `node scripts/bump.js viewer/main.js viewer/nf_room.js` → `§BUMP_ERR
  not_loaded_by_any_page_or_loader=viewer/nf_room.js written=0`, although `viewer/main.js:240` lists it. `bump.js` skips a WHOLE loader in the round where the loader is
  itself a target, so the Bump button stops (exit 2, nothing written) when a PR changes a loader and a lazy module it lists. Fix: skip only the literal that points at the loader itself; W-BUMP gains the case.
- **#3201 fix (PR #3204, +2 / −2 in `scripts/bump.js`):** only the literal that points at the loader itself is skipped. W-BUMP new case C6, red on the old code
  (`§BUMP_W C6-loader-with-its-lazy-module FAIL … exit=2 list_line=0 page_line=1 err=true`), then `PASS … exit=0 list_line=1 page_line=1 err=false`,
  `§BUMP_W_VERDICT PASS judged=6 failed=0` (re-run on merged `main`). W-MANIFEST-ROUNDTRIP C7 lost its batching workaround: one dry run, `668 = 668`, `claims=7/7 verdict=PASS`.
  `§X0_BUMP_BUTTON checks=6 failed=0 verdict=PASS`; W-X0-SHIP all `Y`.
- **Deviations from the spec, said here:** (1) order lives in each site's `at` (its place in its file), so R1 swaps two `at` values, not two array rows: one module order cannot
  serve several pages. (2) a page with no site is not owned (54 files, not 60). (3) a CDN URL is keyed by the URL, not counted missing (2 sites, `viewer/clash_report.html`).
  (4) C7 takes ~57 s (bump re-reads 1,208 loader files per target), so CI passes `--skip-c7` and prints `c7=NOT-RUN`; run the full witness before a merge that touches the generator.
  (5) `libs` / `assets` rows were left out of the manifest (nothing in B0 reads them); `§MANIFEST_BLOCK` (comment runs inside the tag span) is not printed: B1 measures it when it places markers.
- **Scope of the claim:** the three apps' own pages, loaders and service workers. Not judged: load order (no deps declared), the 46 pages outside the apps, `oplogpic/`,
  lazy list entries with no `?v=`, `_GANTT_CACHE_VERSION`.
- **NEXT in Part B:** B1, modeller first, on today's numbers (RESUME 1; its build spec is the next block). The content-hash switch (B-1) is its own announced step after B3.

**B1 BUILD SPEC (2026-11-18; spec only, no bim-ootb change yet; three owner questions at the end, B1-Q1 to B1-Q3).** Scope: `modeller/` only becomes "the manifest is the
source". Viewer and ERP stay exactly as B0 left them (check mode). Every number below was re-measured on bim-ootb `main` @ `560b3541`, read-only, with B0's own readers
(`node scripts/gen_manifest.js --check --out <scratch>`) and three scratch probes that live in no repo (their output lines are quoted with a `§B1_` tag).

**Baseline (it moved since B0, so B0's "94 modules, 99 sites, precache 159" is stale).**
- `§MANIFEST_APP app=modeller pages=2 loaders=11 modules=99 boot=68 lazy=31 sites=104 tag=68 asset=0 inline=17 lazy_sites=19 precache=164 cacheVersion=v285`
- `§MANIFEST_VERSIONS app=modeller versioned_modules=95 one_version=95 disagree=0 sites_below_max=0` · `§MANIFEST_UNVERSIONED app=modeller tags_without_v=4`
- `§MANIFEST_LAZY_PRECACHE app=modeller lazy_precached=21 lazy_not_precached=10 boot_not_precached=7 precached_not_referenced=81 dup_entries=1` (the duplicate is `dxf2bim/ifc_extract_core.js`; it stays, B-2)
- Sites per file: `modeller.html` 67 tags + 17 inline literals, `load_summary.html` 1 tag, 11 loaders 19 literals (1 to 4 each). 36 of the 99 modules live outside `modeller/` (`common/`, `viewer/`, `geomapping/`). 63 tags carry an `onerror`.
- Whole check, three apps: `§MANIFEST_CHECK apps=3 files=54 identical=54/54 sites=805 … precache=871 order_check=NOT-JUDGED deps_declared=0 written=0 verdict=PASS`.

**1. The manifest file: `modeller/modules.json`** (not `manifest.json`: `erp/manifest.json` and the root `manifest.json` are web-app manifests already). Committed, dev-side: no page, loader or
`sw.js` names it, and it is not in `PRECACHE_ASSETS` (witness claim C12). One record per line, keys in a fixed order, so two sessions that add different modules merge without a conflict.
```
{ "app": "modeller", "schema": 1, "sw": "modeller/sw.js", "cacheVersion": "v286", "depsDeclared": true,
  "depsReview": { "by": "", "on": "", "tool": "<sha-256 of the candidate list that was reviewed>" },
  "modules": {            // keyed by repo-relative file, sorted by key, one line each
    "modeller/bom_tree_outliner.js": { "v": 3, "load": "boot", "lazyGroup": null, "precache": true,
        "deps": ["modeller/bom_tree.js"], "uses": [], "notDeps": [], "owner": "", "witnesses": [] }, … },
  "order": {              // per owned file, its sites in file order, one line each; the place of a site is its index (B0's `at`)
    "modeller/modeller.html": [ { "kind": "tag", "as": "cut_move.js", "onerror": "console.warn(…)" }, … , { "kind": "inline", "as": "reg_report_ui.js" }, … ],
    "modeller/edit_delta_ui.js": [ { "kind": "lazy", "as": "../viewer/rates.js" }, … ] },
  "precacheOrder": [ "modeller.html", "rules_editor.js", … ] }
```
| Field | Rule in B1 |
|---|---|
| `v` | **One number per module, no per-site number.** B0's D3 kept the site as the unit because numbers disagreed; the modeller has `disagree=0`, so one `v` reproduces today's bytes. `null` = today's 4 tags with no `?v=`. A site-level `v` is refused in this app (ERP and viewer will need it until B4-HASH; the schema keeps the optional field for them). Numbers stay numbers (B-1) |
| `load`, `lazyGroup`, `precache` | Copied as today (B-2). `load` is `boot` when any site is a tag. `precache` must agree with `precacheOrder`; a mismatch is refused |
| `deps` / `uses` / `notDeps` | Section 3. `deps` forces order, `uses` does not, `notDeps` is a candidate a person turned down |
| `owner` | **Extracted or empty, never written by guess.** Source: the `prompts/*.md` file the module's own header comment names. Measured: `§B1_OWNER_PROBE js_modules=93 header_names_a_prompts_file=64 of_which_names_2plus=13 … names_none=29`. So 51 modules get one owner, 13 get the list of files their header names (a person picks one later), 29 stay `""`. The 29 are printed by name on every run as `§MANIFEST_OWNER_GAP`; that list is the gap, and Part D closes it. There is no CODEOWNERS file |
| `witnesses` | **Extracted or empty.** Source: tracked test files whose text names the module's file inside a string (a `require`, a read, a path). Measured: `§B1_WITNESS_PROBE test_files=1912 with_a_PROVES_header=21 js_modules=93 modules_named_by_1plus_test=74 named_by_0=19 links=613 median=2 max=84`. "Names the file" is weaker than "proves it" (Part E's `PROVES:` header exists on 21 test files only), so the field is written by `gen_manifest.js --witnesses` (a refresh, never by hand), and the 19 with none are printed as `§MANIFEST_WITNESS_GAP`. Part E replaces the source later, not the field |

**2. Markers, and the answer to B0's `§MANIFEST_BLOCK` question.** Measured (probe, B0's readers):
- `§B1_BLOCK_TAGS page=modeller/modeller.html tags=67 span_lines=224..363 runs=30 comments_in_span=32 inline_scripts_in_span=4 runs_of_one=14` · `§B1_BLOCK_LINES … lines_with_a_tag=65 lines_with_2plus_tags=1 tag_lines_with_a_comment=0`
- `§B1_BLOCK_INLINE page=modeller/modeller.html inline_bodies=10 bodies_with_sites=3 sites_per_body=6,1,10 body_start_lines=364,382,391` (the last inline literal is on line 6508, inside the page's big module script)
- `§B1_BLOCK_SW file=modeller/sw.js entries=164 lines=61..202 gaps_not_plain_comma=56 comment_marks_in_gaps=59 cache_version_line=31 value=v285`
- Loaders: 19 literals in 11 files, never more than 4 together.

So no list is one clean block: 32 comments and 4 inline scripts sit between the page's tags, 59 comment marks sit between the precache entries, and the inline literals are spread over 6,100 lines.
**This spec is written for answer A of B1-Q1** (the owner decides): the generator keeps owning whole sites in place, as B0 proved, and the hand-written comments stay in the file between them. Markers say where the generated sites are and where a new one may be written:
| File | Marker (exact place) | Bytes changed |
|---|---|---|
| `modeller/modeller.html` | `<!-- §MANIFEST:BEGIN modeller tags (script tags here are written by scripts/gen_manifest.js from modeller/modules.json; comments are yours) -->` on its own line before line 221 (the first comment of the span), `<!-- §MANIFEST:END modeller tags -->` after line 363 | +2 lines |
| `modeller/sw.js` | `// §MANIFEST:BEGIN precache …` after line 60 (`const PRECACHE_ASSETS = [`), `// §MANIFEST:END precache` before the closing `];`; the comment on line 31 becomes `// §MANIFEST cacheVersion (written by gen_manifest.js; edit modeller/modules.json)` | +2 lines, 1 changed |
| `load_summary.html`, the 11 loaders, the 17 inline literals | **No marker.** The site is owned in place and listed in `order`. A marker line in a loader would change a file that is loaded with `?v=`, and force a bump of all 11 for a comment | 0 |

Rules: a `<script src>` outside the page's marker pair, or a precache entry outside the `sw.js` pair, is refused. A site in the file that the manifest does not list, or the reverse, is refused in `--check`.
`--write` puts a new site on its own line after the site before it in `order` (same indent), and removes a deleted site's line; a comment on a removed line is printed (`§MANIFEST_DROPPED_COMMENT`), never dropped in silence.
The marker PR changes `modeller.html` and `sw.js`, both served offline, so it raises `CACHE_VERSION` once (v285 → the next number at build time). That is the only version that moves in B1.

**3. The `deps` candidate tool (B-5): `scripts/gen_deps_candidates.js <app>`**, dev-side, parser only (espree + eslint-scope, both already in `node_modules`).
- **Evidence.** Module R **publishes** a name when it assigns `window.N` / `globalThis.N` / `self.N` (or through an IIFE parameter bound to one of those) or declares it at the top level of a classic script. R **reads** N when N is a free identifier or `window.N` in R. An edge R → P is a candidate when exactly one other module of the app publishes N. `import` and `importScripts` of a literal path are edges too, already proven.
- **When the read happens is the class.** `load` = at top level, in an IIFE, or in the factory handed to an IIFE (the UMD shape): the publisher must already have run, so order matters. `call` = inside any other function: the publisher must exist by the time of the call, tag order does not matter. `-guarded` = under `typeof`, on the left of `&&` / `||` / `??`, in an `if` test, or optional-chained.
- **Measured on the modeller (scratch probe, read-only):** `§B1_DEPS_PROBE app=modeller modules=99 read=93 skipped_not_js_or_lib=6 parse_fail=0` · `§B1_DEPS_EDGES candidates=97 load=7 load_guarded=1 call=80 call_guarded=9 import_or_importScripts=9 mutual_pairs=5` ·
  `§B1_DEPS_ORDER page=modeller/modeller.html both_are_tags=53 agree_with_tag_order=35 against_tag_order=18 of_which_load_unguarded=0 guarded_or_call=18` · `§B1_DEPS_SCOPE from_lazy_module=28 to_lazy_module=32 modules_with_0_edges_out=53`.
  So about **106 edges to look at, of which 17 can force an order** (7 load, 1 guarded load, 9 imports; 5 of the 9 imports point at files that are not manifest modules). No unguarded load read runs against today's tag order, which is what a working page predicts; the 18 that do are all call-time or guarded.
- **Blind spot, measured:** `§B1_DEPS_NAMES published=242 published_by_2plus=6 ambiguous_names_read=5`. A name with several publishers gives no edge. `Bonsai` has 12 publishers and 11 reader modules (`§B1_DEPS_AMBIG name=Bonsai publishers=12 reader_modules_dropped=11`); the other four are `__arcFidByGuid`, `__arcGuidByFid`, `swXEdges`, `TEAM_PLAN_TRUST`.
  The tool must therefore go one level down for a shared name (`Bonsai.x` written by one file, read by another) and print what is left as `§DEPS_AMBIGUOUS`. **Not measured:** the edge count at that member level, and the load-time reads of the page's own inline scripts (the tool reads those bodies as readers placed at their spot in the page, so the order check covers them).
- **What it prints.** One line per edge: `§DEPS_CAND from= to= class=load|load-guarded|call|call-guarded|import names= at=<file:line of the first read> order=ok|AGAINST|n/a state=new|deps|uses|notDeps`, then `§DEPS_SUMMARY app= candidates= load= call= import= ambiguous= new= reviewed= sha=`. `--out` writes the list for review; nothing is written to the manifest by this tool.
- **How the confirmation is recorded.** A person moves each candidate into one of three lists on the reader's manifest line: `deps` (order is forced), `uses` (real, no order), `notDeps` (not a dependency). Then `depsReview` gets the reviewer, the date and the `sha` of the list that was reviewed, and `depsDeclared` becomes `true`.
  A dependency the tool did not find may be added to `deps` by hand; it is printed as `§DEPS_HAND` on every run. When the code changes and the tool finds an edge that is in none of the three lists, the order check prints `INCONCLUSIVE unreviewed=N`, never PASS (who reviews: B1-Q3).
- **What the generator refuses once deps are declared:** a `deps` target that loads after its reader on a page where both are tags; a boot module that `deps` on a lazy one; a cycle in `deps`; an unknown file.

**4. `scripts/bump.js` after B1.** The command lines, the exit codes and every `§BUMP…` line stay as they are, so the X0 Bump button keeps working unchanged: it calls `bump.js --changed --check|--write --root <tree>`, and the one-file quick fix calls `ship.bump()` = `bump.js <file> --root <tree> [--write]`, reading `§BUMP sw=… CACHE_VERSION v…->v…` and the exit code (`devtools/vscode/x0-navigator/extension.js:541`, `lib/ship.js:126-134`).
- Inside, bump becomes **mixed**: a referrer owned by an app that has a committed `modules.json` is not edited by regex. Bump raises that module's `v` and the app's `cacheVersion` in the JSON, then calls the generator for that app. Any other referrer (viewer, ERP, the pages outside the apps) goes through today's regex path, untouched. A shared file (`viewer/rates.js`, in both apps) takes both paths in one run.
- The parity gate and the changed-file witnesses (`parityGate`, `touchGate`) are not touched. `needsBump` in X0 reads `sw.js` with its own parser (`lib/js_facts.js`); a comment line inside the array does not change what it reads (W-X0-SHIP and `§X0_BUMP_BUTTON` are in the unchanged list).
- **One intended behaviour change (B1-Q2):** with one `v` per module, a modeller bump also raises the 17 literals in inline page scripts that today's bump cannot see.

**5. Concurrent sessions.** Today's rule (keep both precache additions, take the higher `CACHE_VERSION`) becomes: (1) merge `modeller/modules.json` (one record per line; keep both sides' lines, take the higher `cacheVersion`); (2) in the generated files keep both sides' comment lines and do not hand-fix a tag or an entry; (3) run `node scripts/gen_manifest.js --write modeller`; (4) `--check` must print PASS.
Stability the generator must have: the manifest is rewritten in canonical form on every `--write` (`--check` refuses a manifest that is not canonical); a second `--write` changes 0 bytes; the output does not depend on the clock, the machine or the order files are read in. Under answer A the output is a function of the manifest AND the file's hand-kept text, so two sessions get the same bytes only from the same merged tree. That is the cost of A; answer B does not have it (B1-Q1).

**6. Witnesses.** W-MANIFEST-ROUNDTRIP is extended, not replaced (same file, same CI step, same verdict line with new fields). Its B0 claims keep running for all three apps. New claims, modeller only:
| Claim | What it says | Judged against (never the generator itself) |
|---|---|---|
| C8 | The committed manifest is the source: generating from `modules.json` gives the committed bytes of all 15 owned files (2 pages, 11 loaders, `sw.js`, and the manifest itself in canonical form) | the committed files |
| C9 | The switch moved nothing: the switch commit minus its marker lines and the one `CACHE_VERSION` step equals its parent, byte for byte (pinned to that commit, so it stays true later) | `git show <parent>:<file>` |
| C10 | The manifest equals the files as a second reader sees them: sites = B0's `buildApp` read of the tree; precache list and version = the `vm` run of `sw.js`; `§BUMP` lines of a dry run of every target | B0 reader, `vm`, `bump.js` |
| C11 | A second `--write` changes 0 bytes, on the real tree and on a copy where two sites were added in the two possible merge orders | a temp copy |
| C12 | Nothing new reaches the browser: `modules.json` is named by no page, loader or `sw.js`, and is not in `PRECACHE_ASSETS` | a text search of the app + the `vm` list |
| C13 | Every candidate edge is reviewed: each `§DEPS_CAND` is in `deps`, `uses` or `notDeps`; `depsReview.tool` equals the tool's `sha` today | `gen_deps_candidates.js` |
| C14 | The order holds: 0 refusals on the committed manifest, `order_check=PASS deps_declared=N` with N > 0 | `checkOrder` |
| C15 | `owner` and `witnesses` equal what their extractors print today; a value no extractor gives is a FAIL | the two extractors |

**Red controls (same run, on a temp copy, each must FAIL):** R6 **swap two dependent modules**: take a real confirmed `deps` pair that are both tags of `modeller.html`, swap their places in `order` → the generator refuses (`synthetic=N`; B0's R5 stays as the synthetic one) ·
R7 edit one generated tag by hand in the page → `--check` FAIL naming file and line · R8 a `<script src>` planted outside the markers → refused · R9 a manifest with the keys of one line reordered → "not canonical" ·
R10 a `deps` entry on a module that loads later, and a boot module that `deps` on a lazy one → refused · R11 an `owner` typed by hand that no header names → C15 FAIL · R12 one candidate edge removed from all three lists → `order_check=INCONCLUSIVE unreviewed=1`.
**Red on the old code:** W-BUMP's new case "an inline literal goes up with its module" must FAIL on today's `bump.js` (it prints no line for an inline site) and PASS after (only if B1-Q2 = yes).
**INCONCLUSIVE, never PASS, when:** `modules.json` is missing or has 0 modules; no confirmed `deps` pair exists where both are tags of one page (R6 would judge nothing); the candidate tool read 0 modules or failed to parse one; any red control did not fail; the parent commit of C9 cannot be read; C13 has unreviewed edges.
`§MANIFEST_ROUNDTRIP apps=3 source=modeller files= sites= … identical=N/N driven=N/N claims=15/15 red=12/12 order_check=PASS|INCONCLUSIVE deps_declared= unreviewed= owner_gap= witness_gap= verdict=`
**Runs that must be unchanged, before (on `main`) and after (on the branch), logs kept and read:** `node tests/audit_sw_precache.js` (viewer; same summary lines) · `node modeller/tests/run_all_witnesses.js` (the `§ALLWITNESS …` line and the pinned status list identical; 216 files under `modeller/tests/` name `modeller.html` and 2 name `sw.js`, so a marker line could move one of them) ·
`node scripts/tests/witness_bump.js` (`§BUMP_W_VERDICT PASS judged=6 failed=0`, plus the new case) · `node tests/witness_bump_parity.js` · `§X0_BUMP_BUTTON` and W-X0-SHIP · W-CORE-PURE · the full W-MANIFEST-ROUNDTRIP with C7 (not `--skip-c7`) · after the merge, the Pages deploy green and the live `modeller/sw.js` fetched back showing the new `CACHE_VERSION`.
**Issue proved:** "the modeller's module lists cannot be owned by one committed manifest, with declared load order, without changing a byte the browser gets".

**7. Deletion budget (stated honestly: B1 adds more than it removes).**
| Hand-kept today | After B1 |
|---|---|
| 68 script tags, 17 inline literals, 19 loader literals (104 sites in 13 files) | generated; a hand edit is refused in CI |
| 164 `PRECACHE_ASSETS` entries and `CACHE_VERSION` in `modeller/sw.js` | generated |
| Load order (tag order, nothing says why) | declared: `deps` per module, checked |
| `owner`, `witnesses` | new, extracted; nothing existed |
Lines: about +380 for `modules.json` (99 module lines, 104 site lines, 164 precache lines, a few header lines: an estimate, not measured), +4 marker lines, 1 changed; the generator's write mode, the deps tool, the bump change and the new claims are new code, counted in the build's result. **Removed in B1: 0 lines of pages or lists** (byte-identical is the point), and `bump.js` cannot lose its regex path while viewer and ERP still use it. The deletions come at B3 (bump's regex path) and B4-HASH (`bump.js` itself).

**8. Risks.**
- A modeller test that reads the page by line number or counts comments moves with the 2 marker lines: caught by the `§ALLWITNESS` before/after, fixed in the test.
- The first bump after B1 is where a user would first see a mistake: the build PR ends with a real dry-run and a real `--write` bump of one modeller file on the branch, diffed against what the old `bump.js` writes for the same file (must be the same bytes, plus the inline literals if B1-Q2 = yes).
- A session on an old branch edits a tag by hand: CI fails with the file, the line and "edit modeller/modules.json". Tell live sessions before the switch merges (START HERE 4).
- A false `deps` edge would later refuse a legal reorder (B0's D5 worry): that is why `deps` holds only edges a person confirmed, and why `uses` never forces order.
- The `witnesses` field can go stale between refreshes: C15 fails the CI step until `--witnesses` is run. If that proves noisy, the refresh moves into the Bump button (not decided here).

**Not in B1:** viewer and ERP as a source (B2, B3) · content hashes and retiring `bump.js` (B4-HASH) · any change to what is precached, the duplicate entry included (B-2) · plugin entries (B-4) · moving, re-ordering or deleting any tag or comment · the `sw.js` change-log comments (`// v285 …`, 18 lines, still written by hand) ·
Part D's question table and `"extends"` marks · Part E's `PROVES:` headers · new X0 rows that read the manifest ("owner warning", "run the witnesses for this file") · the test fixtures under `modeller/tests/fixtures/*.html` (not owned pages).

**Owner questions (ANSWERED 2026-11-18 (tenth session): A / yes / session cites + owner OK; see DECISIONS).**
- **B1-Q1: where do the hand-written comments between the generated lines live?** There are 32 comments and 4 inline scripts between the page's tags, and 59 comment marks between the precache entries. **A (recommended):** they stay in the files; the generator rewrites only the tags and entries around them; +4 marker lines; today's bytes are kept. Cost: the result depends on the manifest and the file together. **B:** they move into the manifest as text and the whole block is generated from the manifest alone (the design's "same manifest in, same bytes out" in full). Cost: 91 pieces of comment text and 4 small scripts are from then on edited inside JSON. **C:** one marker pair around every unbroken run: 30 pairs in the page and 57 in `sw.js`, 174 marker lines.
- **B1-Q2: may a modeller bump also raise the 17 version numbers in inline page scripts that today's bump skips?** Recommended: yes. They are the same files, today's numbers agree everywhere (`disagree=0`), and one number per module is what makes the manifest small. "No" means the manifest keeps a number per site and the first bump makes them disagree.
- **B1-Q3: who confirms the modeller's dependency list?** Recommended: the building session reads each of the 17 order-forcing edges in the code and writes its file:line beside it; the owner confirms that short list in one message; the roughly 89 call-time edges are recorded as `uses` (they force no order) on the tool's evidence alone.

**B1 PART 1 RESULT — the deps candidate tool (2026-11-18, tenth session; bim-ootb #3244, PR #3245).** `scripts/gen_deps_candidates.js <app>` (§3 above) + W-DEPS-CAND
`scripts/tests/witness_deps_candidates.js` (in CI). The witness judges the tool against RUNNING 16 fixture cases in a Node vm in both orders (reader first throws = load,
sees less = load-guarded, calling before = throws/fallback = call/call-guarded), never against the tool's output; red control BLIND (a local alias of `window`, the tool's
known blind spot) must be caught; on the real modeller every cited file:line holds the name. Mutation check (IIFE detection off) → `agree=13/15 verdict=FAIL`.
- Re-measured on bim-ootb main (moved since the spec: 104 modules, not 99), and the inline page bodies are now read as readers (10 bodies):
  `§DEPS_SUMMARY app=modeller modules=104 read=98 inline_bodies=10 skipped=6 parse_fail=0 candidates=207 load=9 load_guarded=18 call=83 call_guarded=87 import=10 import_not_module=7 forces_order=37 against=31 against_load_unguarded=0 ambiguous=18 published=248 published_by_2plus=6`
  `§DEPS_W cases=16 agree=16/16 case_table_matches_vm=16/16 against_seen=Y red=1/1 real_candidates=207 at_cited=207/207 deterministic=Y wrote=0 verdict=PASS`
- Differences from the spec's probe, on purpose: a guarded read also counts when it sits in the branch of an `if` / `?:` or the right of `&&` whose test names the same
  thing, inside `try`, or after `if (!X) return;` in the same block (the last one found by reading the real list: `modeller/modeller_history.js:11`, fixture EARLYRET).
  So the order-forcing count is 37 (9 load + 18 load-guarded + 10 import), not the spec's 17; the extra come from the 10 inline page bodies.

**B1 DEPS REVIEW — the session's reading of the 37 order-forcing edges (B1-Q3; each line read in the code, file:line = the first read).** Proposed lists:
- **`deps` (9 unguarded load reads; the page or worker throws without this order):**
  `geomapping/geomap_bridge.js:15` → `classify_geom.js` (UMD factory gets `root.ClassifyGeom`) · `modeller/arc_editable.js:14` → `real_geometry.js` (UMD, `root.RealGeometry`) ·
  `modeller/bonsai_kernel_worker.js:10` → `cut_move.js` (`self.CutMove` right after `import './cut_move.js'`) · `modeller.html:2060` → `bonsai_grid.js` (`Bonsai.grid.define()`) ·
  `modeller.html:4353` → `bonsai_outliner.js` (`Bonsai.outliner.mount()`) · `modeller.html:6274` → `str_walker_outliner.js` (`window.STRWalkerOutliner` in `initOpenChooser` IIFE) ·
  `modeller.html:6698` → `bonsai_oplog.js`, `:7068` → `bonsai_library.js`, `:7653` → `bonsai_sketch.js` (top level of the page's module script, inside `?recipe=` / `?routewalk=` / `?constrain=` demo branches).
- **`deps` (17 guarded load reads; the wrong order does not throw, it silently turns the feature off):** `common/comm/team_versions.js:12` → `op_versions.js` (`global.ERP && …OpVersions`) ·
  `modeller/bom_tree_outliner.js:16` → `bom_tree.js` · `modeller/modeller_history.js:11` → `common/history_bar.js` (bails out with `§MHIST_NO_MODULE`) · `modeller_history.js:282` → `bonsai_oplog.js` ·
  `modeller/str_walker_outliner.js:69` → `geomapping/geomap_bridge.js` · `modeller.html:242` → `common/whole_history.js` · `:359` → `teams_embed.js` · `:843` → `viewer/connect_scene.js` ·
  `:4435` → `bom_tree_outliner.js` · `:4437` → `dw_instances_outliner.js` · `:4438` → `building_parts_outliner.js` · `:6516` → `dxf_import_ui.js` · `:6517` → `common/file_store.js` ·
  `:6639` → `common/drag.js` · `:6886` → `bonsai_ifc.js` · `:7710` → `bonsai_gridmove.js` · the `routewalker.js` `rw*` functions (first read in the `?routewalk=` demo branch).
- **`notDeps` (1):** `viewer/locale_loader.js:418` → `modeller/edit_delta_ui.js` (`__TRL_NO_AUTORUN`, order=AGAINST today). Not a dependency: `edit_delta_ui.js:21-22` sets the flag
  only when `window._TRL_LOADER` is absent, i.e. on a page WITHOUT the boot loader; the modeller loads `locale_loader.js` at boot (`modeller.html:322`, before `:323`) on purpose (S226 §R3).
- **`uses` (10 imports):** the `import` / `importScripts` statement itself orders them, and 7 of the 10 targets are not manifest modules (`lib/kernel/index.js`, `three.module.min.js`,
  `OrbitControls.module.js`, `three-mesh-bvh.module.js`, `georef_frame.js`, `ifc_grid_read.js`, `ifc_open_db.js`), so no tag order can be checked for them.
- **`uses` (170 call-time edges, 83 call + 87 call-guarded):** on the tool's evidence alone (B1-Q3). **§DEPS_AMBIGUOUS 18** (mostly `Bonsai.*` members with 2+ writers): printed, not edges.
- **OWNER CONFIRMED 2026-11-18:** asked with the four groups above; owner: **"Confirm as proposed (Recommended)"** → 26 `deps`, 1 `notDeps`, 180 `uses`; `depsReview.by` = owner, tool sha recorded at build.

**B1 PART 2 RESULT — ✅ DONE 2026-11-18 (bim-ootb #3250 → main `b9b2e522`, Fixes #3244).** The modeller is a SOURCE app: `modeller/modules.json` writes its 68 tags,
22 inline + 19 loader literals, 177 precache entries and `CACHE_VERSION` (`scripts/lib/manifest_source.js`; `gen_manifest.js --write modeller` / `--init`; `bump.js` mixed path).
- **Correction to the confirmed list, made by the generator's own rule:** `modeller.html#inline9 → common/file_store.js` moved from `deps` to `uses` (the page lazy-loads
  it itself at the read, `sc.src = '../common/file_store.js?v=1'`; a boot page cannot depend on a lazy module). Final: **25 deps, 1 notDeps, 181 uses**, review sha `5be36e57…`.
- **Bytes:** +2 marker lines in `modeller.html`, +2 in `sw.js`, `CACHE_VERSION` v294 → v295 once (main moved v285 → v294 during the build; merged twice, review sha unchanged).
- **bump.js vs the old one, 4 real targets** (`arc_editable.js`, `edit_report.js`, `viewer/rates.js`, `reg_report_ui.js`): same bytes plus only the inline literals the old one
  could not see; `edit_report.js` the old bump could not bump at all (inline-only).
- **Design choices made in the build (no owner decision, recorded here):** inline page bodies are readers keyed `<page>#inline<n>` in a manifest `inline` section · `--write`
  refreshes `owner` / `witnesses` and records new call-time edges as `uses` (B1-Q3: tool evidence alone); only order-forcing edges (load / load-guarded / import) need a person,
  and the review sha covers those only · a lazy or inline literal is placed in the code by hand and listed in `order` (the generator inserts / removes tags and precache entries only) ·
  CI runs `--skip-c7 --skip-c9` (C9 needs git history; a shallow checkout has none).
- Logs on main `b9b2e522`: `§MANIFEST_ROUNDTRIP apps=3 source=modeller files=54 … identical=54/54 driven=737/737 sw_vm=3/3 claims=15/15 red=12/12 order_check=PASS deps_declared=25 unreviewed=0 owner_gap=32 witness_gap=24 verdict=PASS`
  (C9 `switch=b9b2e5225395 files=14`) · `§BUMP_W_VERDICT PASS judged=7 failed=0` (C7 on the old bump.js: FAIL exit=2) · `§DEPS_W cases=16 agree=16/16 … verdict=PASS` · audit `296 found, 0 missing` ·
  `§BUMP_PARITY_W_VERDICT PASS judged=24` · `§CORE_PURE … verdict=PASS` · `§X0_BUMP_BUTTON checks=6 failed=0` · `§SHIP_PANEL … verdict=PASS` · `§X0_APPDEF … verdict=PASS` · Pages deploy green,
  live `modeller/sw.js` fetched back: `CACHE_VERSION = 'v295'` + both markers.
- `§ALLWITNESS PASS=118 FAIL=7 ENV=9 of 134` on the branch; the 7 FAILs (`dxf_accept_page`, `dxf_airgap`, `dxf_datum_pick`, `dxf_edefaults`, `dxf_libtypes`, `dxf_zdim`,
  `viewer_db_export`) fail identically on unedited main `43218701`: not B1's, handed to the modeller lane as information.
- Live sessions told before the merge (5 peers); the LOD Upgrade pill lane (P5–P7 open) was told how lazy `lod/*.js` packs are listed (precacheOrder only, unless a `?v=` site names them).
- Note: `modeller/modules.json` is served by Pages as a static file (HTTP 200) because Pages serves tracked files; nothing fetches or precaches it (C12).

**B2 BUILD SPEC (2026-11-20, twelfth session; spec only, no bim-ootb change yet; two owner questions at the end, B2-Q1 and B2-Q2).** Scope: `erp/` becomes "the manifest is the
source", the way the modeller did in B1. The viewer stays in check mode (B3). Every number below was measured read-only on bim-ootb `main` @ `79755693` with the shipped tools
(`node scripts/gen_manifest.js --check --out <scratch>`, `node scripts/gen_deps_candidates.js erp`); a number with no `§` line beside it came from reading that `--out` file or from the `git` / `grep` command named.

**Baseline.**
- `§MANIFEST_APP app=erp pages=13 loaders=5 modules=297 boot=274 lazy=23 sites=366 tag=338 asset=0 inline=23 lazy_sites=5 precache=419 cacheVersion=v1120`
- `§MANIFEST_VERSIONS app=erp versioned_modules=267 one_version=246 disagree=10 sites_below_max=14 files=erp/icons.js,erp/erp_picker.js,erp/kernel_ops.js,erp/kanban_lens.js,erp/model_layer.js,erp/tip_fold.js,erp/crud_core.js,erp/crud_overlay.js,erp/manifest.json,erp/sw.js`
- `§MANIFEST_UNVERSIONED app=erp tags_without_v=56` (42 modules) · `§MANIFEST_INLINE_SITES app=erp inline_sites=23 … partial_literals=4` · `§MANIFEST_MISSING app=erp targets_not_on_disk=0`
- `§MANIFEST_LAZY_PRECACHE app=erp lazy_precached=22 lazy_not_precached=1 boot_not_precached=13 precached_not_referenced=136 dup_entries=0` · `§MANIFEST_PLUGINS app=erp precached_mjs=29 on_disk=36`
- Whole check: `§MANIFEST_CHECK apps=3 files=55 identical=55/55 sites=830 … precache=907 order_check=PASS deps_declared=25 unreviewed=0 source=modeller written=0 verdict=PASS`.
- Sites per file: `idempiere.html` 240 tags + 17 inline · `glassbowl.html` 19 + 1 · `till.html` 18 · `genesis.html` 14 · `erp.html` 12 + 3 · `branch_admin.html` 9 · `spike_writepath.html` 6 · `kanban_lens.html` 5 + 1 ·
  `glassbowl_gravity.html` 4 + 1 · `kitchen.html` 4 · `pivot_lens.html` 3 · `chat_lens.html` 2 · `borrower.html` 2 · 5 loaders, 1 literal each (`ninja_pill.js`, `plugin_overlay.js`, `ad_attachment.js`, `erp_pills.js`, `idmp_pills.js`).
  46 modules sit on 2 or more pages; 23 of the 297 live outside `erp/`; 6 tags carry an `onerror`. `git ls-files 'erp/*.html'` = 20, so 7 ERP pages have no site and stay unowned (B0 deviation 2).
- **How busy the tree is** (`git log --since="7 days ago" origin/main`): 50 commits touched `erp/sw.js`, 46 touched `erp/idempiere.html`. The modeller had nothing like this.

**What is the same as B1 (not repeated here):** the file is `erp/modules.json` (`erp/manifest.json` is the web-app manifest), one record per line, canonical form, dev-side only (C12) · hand-written comments stay in the files, the
generator owns whole sites (B1-Q1 = A) · `load` / `lazyGroup` / `precache` copied as today (B-2) · `owner` extracted or empty, witnesses worked out when asked (B-3 REVISED) · `deps` / `uses` / `notDeps` and `depsReview` ·
the 29 plugin `.mjs` precache entries stay plain entries of `precacheOrder` exactly as today (B-4's "derive from disk" adds 7 and is its own later step) · `bump.js` keeps its command lines, exit codes and `§BUMP` lines.

**What ERP needs that the modeller did not (the five design points of B2).**
1. **A number per site where the pages disagree (B-1: today's numbers stay until B4-HASH).** `modules.json`'s `order` entries gain an optional `v`. A module's `v` is its highest number today; a site carries its own `v` only when it
   differs (14 sites today, e.g. `erp/icons.js` is 12 on `idempiere.html`, 26 on `erp.html`, 3 on `glassbowl.html` and `glassbowl_gravity.html`). A tag with no `?v=` of a module that is versioned elsewhere carries `"v": null`
   (`erp/kernel_ops.js`: 8 on `idempiere.html`, 6 on two lens pages, none on `glassbowl.html` and `spike_writepath.html`; how many more such modules: counted at build). A site `v` equal to its module's is "not canonical" and refused.
   The schema keeps refusing a site `v` in the modeller (`disagree=0` there). B4-HASH deletes the field.
2. **Bump keeps today's arithmetic.** Today's `bump.js` raises every reference by one from its own number (`scripts/bump.js:122-131`). The manifest path does the same: the module's `v` and each site `v` go up by one, a `null` stays `null`.
   So a bump of a disagreeing module writes the same bytes as the old bump (claim C17).
3. **Several marker pairs per page.** `idempiere.html`'s 240 tags are in two groups, lines 551-865 (211 tag lines) and 8160-8180 (3 tag lines), 7,300 lines of page script apart. One pair around both would say nothing. Rule: a page may hold
   any number of `§MANIFEST:BEGIN erp tags` / `§MANIFEST:END erp tags` pairs, placed by hand in the switch PR; the generator refuses a `<script src>` outside every pair and a pair with no tag. How many pairs the 13 pages need: counted at build
   (`idempiere.html` 2; the other 12 not looked at one by one here). `erp/sw.js`: one precache pair inside `const PRECACHE_ASSETS = [` (line 77) … `];` (line 379), as B1.
4. **Two literals no bump may raise: `navigator.serviceWorker.register('sw.js?v=683')` (`idempiere.html:8175`) and `…('sw.js?v=600')` (`erp.html:389`).** They are inline sites of the module `erp/sw.js`. `sw.js` changes with every bump
   (its `CACHE_VERSION`), so under B1's rule "inline literals go up with their module" every later bump of a branch would also change the address the service worker is registered under. Nothing raises them today (the old bump cannot see
   inline literals). B2 keeps that: an `order` entry may carry `"pin": true`; the generator writes it, `--check` guards it, bump never raises it. What a browser does when that address changes was not measured, which is the reason not to change it here.
   The other 21 inline literals (15 team / comm / attachment scripts, 3 `manifest.json`, 3 pill / bubble JSON) follow B2-Q2.
5. **The dependency review is six times larger** (next block), and the order rule is per page: a `deps` target must load before its reader on every page where both are tags (46 modules are on 2+ pages).

**The `deps` candidate list (B-5), measured:**
`§DEPS_SUMMARY app=erp modules=297 read=288 inline_bodies=25 skipped=9 parse_fail=0 candidates=603 load=186 load_guarded=30 call=204 call_guarded=183 import=0 import_not_module=0 forces_order=216 against=56 against_load_unguarded=1 ambiguous=5 published=375 published_by_2plus=5 new=603`
- By class and today's tag order (counted from the `§DEPS_CAND` lines): load 182 ok / 1 AGAINST / 3 n/a · load-guarded 22 / 3 / 5 · call 154 / 23 / 27 · call-guarded 129 / 29 / 25.
- So **216 edges can force an order; 204 of them agree with today's tag order, 4 run against it, 8 cannot be placed** (the two are not tags of one page). The 387 call-time edges go in as `uses` on the tool's evidence (B1-Q3, unchanged).
- The 4 against today's order: `erp/model_pa.js:11` → `ad_callout.js` (load; read here: `A = root.AdCallout` at load, but `:16` reads `root.AdCallout || A` again at call time, and the page loads `model_pa.js` at `idempiere.html:698`, before
  `ad_callout.js` at `:702`, so it works today without the order: proposed `uses`) · `erp_replica_client.js:14` → `overlay/boot.js` (name `fetch`) · `erp_seam.js:31` → `bigdecimal.js` (`BigDecimal`) · `erp_snapshot_sign.js:12` → `genesis.js` (`crypto`).
  The last three are load-guarded and not read yet; they are read at build, like every other edge.
- `§DEPS_AMBIGUOUS` 5 (the shared `ERP` object with 5 to 6 publishers, and `IdmpPillActions` with 2): printed, not edges.

**Build order: two PRs, so the busy tree is touched once and briefly.**
- **Part 1 (no ERP file changes):** the generator learns points 1 to 4 (`scripts/lib/manifest_source.js`, `gen_manifest.js`, `bump.js`), proven on fixtures and on a temp copy of the real ERP tree switched in memory; the modeller's bytes and its
  `claims=15/15` unchanged. The session reads the 216 order-forcing edges and writes the proposed lists here (B2-Q1).
- **Part 2 (the switch):** `gen_manifest.js --init erp`, the marker lines, the confirmed `deps`, one `CACHE_VERSION` step (v1120 → the next number at merge time), CI's W-MANIFEST-ROUNDTRIP with `source=modeller,erp`. Live sessions are told first
  (START HERE 4). Main moves about 7 times a day on these files, so the PR is opened, checked and merged in one sitting, and re-inited (not hand-merged) if main moved.

**Witnesses.** W-MANIFEST-ROUNDTRIP is extended (same file, same CI step). B1's C8 to C15 and R6 to R12 run for every source app (`source=modeller,erp`). New claims, ERP:
| Claim | What it says | Judged against (never the generator itself) |
|---|---|---|
| C16 | Site numbers are exactly today's disagreements: the sites that carry their own `v` are the sites B0's reader finds below their module's highest number, plus the unversioned tags of versioned modules | B0's `buildApp` read of the tree (`§MANIFEST_VERSIONS`) |
| C17 | A bump of a disagreeing module writes what the old bump wrote: for `erp/icons.js`, `erp/crud_overlay.js` and `erp/kernel_ops.js`, the tag bytes equal those of `bump.js` from the commit before the switch, run on the same tree | `git show <parent>:scripts/bump.js` on a temp copy |
| C18 | The pinned literals do not move: a bump whose targets include `erp/sw.js` and a `--changed` bump on a branch that changed it leave both `sw.js?v=` literals as they were | the two page lines before and after |
| C19 | The deploy stamp still reads the version: the pattern of `.github/workflows/deploy-pages.yml:35` (`CACHE_VERSION = '[^']+'`) applied to the generated `erp/sw.js` gives the manifest's `cacheVersion` | the workflow's own pattern |
| C20 | The order holds on every page: for each `deps` pair, on each of the 13 pages where both are tags, the target is first; printed as `pairs_judged= pages_judged=` | `checkOrder` per page |
**Red controls (same run, temp copy, each must FAIL):** R13 swap the site numbers of one module between two pages → `--check` FAIL naming both lines · R14 delete one site `v` → FAIL · R15 a site `v` equal to its module's → "not canonical" ·
R16 a `<script src>` planted between the two marker pairs of `idempiere.html` → refused · R17 `"pin"` removed from a register literal, then a bump with `erp/sw.js` among the targets → C18 FAIL · R18 a `deps` pair in the right order on
`idempiere.html` and swapped on a second page → refused, naming that page · R6 on a real confirmed ERP pair (`synthetic=N`).
**Red on the old code:** C16 to C18 must FAIL on the generator as it is on `main` today (it refuses a site `v`, and has no `pin`).
**INCONCLUSIVE, never PASS, when:** `erp/modules.json` is missing or has 0 modules; 0 sites carry their own `v` (C16 and C17 would judge nothing); no `deps` pair has both ends as tags on 2+ pages (R18 would judge nothing);
the parent `bump.js` cannot be read; any red control did not fail; C13 has unreviewed edges.
`§MANIFEST_ROUNDTRIP apps=3 source=modeller,erp files= sites= site_v= pinned= identical=N/N driven=N/N claims=20/20 red=18/18 order_check=PASS|INCONCLUSIVE deps_declared= unreviewed= owner_gap= verdict=`
**Runs that must be unchanged, before (on `main`) and after (on the branch), logs kept and read:** the tests that read the two changed files as text (`git grep -lE "readFileSync\([^)]*idempiere\.html"` = 36 files; the same for `sw\.js`
under `erp tests scripts` = 11): a marker line could move one of them · `node scripts/tests/witness_bump.js` · `node tests/witness_bump_parity.js` · the parity gate once on the switch branch (§F.32, `--compiler-root` at a current
bim-compiler) · W-CORE-PURE · W-DEPS-CAND · the Code Facts ship and bump-button witnesses · W-VSC-OPERATIONAL (§F.41) · the CI fast tier · the full W-MANIFEST-ROUNDTRIP with C7 and C9 · `tests/audit_sw_precache.js` (viewer) ·
after the merge: the Pages deploy green, `erp/version.json` fetched back with `build` = the new `CACHE_VERSION`. The deployed `erp/sw.js` is minified, so the marker comments are not expected in the fetched copy (not measured; the modeller's are, it is not minified).
**Issue proved:** "ERP's module lists (13 pages, 5 loaders, one service worker, numbers that disagree between pages) cannot be owned by one committed manifest, with declared load order, without changing a byte the browser gets".

**Deletion budget (stated honestly: B2 adds, it does not remove).** Hand-kept today, generated after: 338 tags, 23 inline and 5 loader literals in 18 files, 419 precache entries, `CACHE_VERSION`. New file `erp/modules.json`, about 1,100 lines
(297 + 366 + 419 + header; an estimate). Marker lines: 2 per pair + 2 in `sw.js`. **Removed: 0 lines of pages or lists**; `bump.js` keeps its regex path while the viewer uses it (it goes at B3, `bump.js` itself at B4-HASH).

**Risks.**
- **A live ERP session on an older branch hand-edits a tag or `sw.js`:** CI fails with the file, the line and "edit erp/modules.json". With 50 `sw.js` commits a week this WILL happen in the first days. Sessions that bump with `bump.js` or the Bump button notice nothing.
- **Merge rule for sessions** (replaces "keep both precache additions, take the higher `CACHE_VERSION`" for ERP): merge `erp/modules.json` keeping both sides' lines and the higher `cacheVersion`, then `node scripts/gen_manifest.js --write erp`, then `--check` = PASS. CLAUDE.md's WORK-TO-ZERO line is updated in the switch PR's companion docs PR.
- A test that reads `idempiere.html` by line number moves with the marker lines: caught by the before / after runs, fixed in the test.
- The first ERP bump after the switch: the build ends with a real `--write` bump of one single-number module and one disagreeing module on the branch, diffed against the old bump's bytes.
- A false `deps` edge would refuse a legal reorder: only edges a person confirmed are `deps`.

**Not in B2:** the viewer (B3) · content hashes (B4-HASH) · unifying the 10 disagreeing modules' numbers · deriving plugin precache entries from disk (B-4's step) · any change to what is precached · the 7 ERP pages with no site, test fixtures, `erp/tests/*.html` ·
moving or deleting a tag or comment · the 4 partial `?v=` literals (not whole-string sites; counted, never owned) · the web-app `erp/manifest.json` itself.

**Owner questions (ANSWERED 2026-11-20: both as recommended; see DECISIONS).**
- **B2-Q1: who confirms ERP's 216 order-forcing dependencies?** The modeller had 37 and the owner confirmed them as one short list. **Recommended:** the session reads all 216 in the code and writes file:line for each here; the owner is shown
  only the ones that are not plain (the 4 that run against today's order, the 8 that cannot be placed, and any the session moves out of `deps`) plus the count of the rest, and confirms that in one message. Alternative: the owner is shown all 216.
- **B2-Q2: may an ERP bump also raise the 21 inline literals the old bump cannot see, as the modeller's does (B1-Q2), while the two service-worker register lines stay untouched?** Recommended: yes.

**B2 PART 1 RESULT — ✅ DONE 2026-11-20 (bim-ootb #3365, PR #3367 → main `1cedcf2f`).** The generator learned points 1 to 4 of the spec; no ERP file changed; ERP is still in check mode. +147 / −21 lines in
`scripts/lib/manifest_source.js`, `scripts/bump.js`, the witness, and one line of `modeller/modules.json`.
- **Built:** an `order` entry may carry `v` (integer or null) and `pin`; `MS.raise()` is the one bump arithmetic (module `v` and each site `v` + 1, a pinned site keeps its number); `MS.bumpSites()` says which sites a bump raises (used by the
  bump loop and by `--changed`); `--init` no longer refuses differing numbers (module `v` = the highest, a differing site keeps its own, an inline site that names the app's own `sw.js` gets `pin`); a page may hold any number of marker pairs
  (in order, never nested, none empty).
- **Measured, more exact than the spec:** 28 sites carry their own `v`: 14 below their module's highest number, and **14 tags with no `?v=` of modules versioned elsewhere** (the spec knew one, `kernel_ops.js`). 19 modules have differing sites. The fixture rule places 16 marker pairs on the 13 pages.
- **Log on merged main `1cedcf2f` (full run, C7 and C9 included):**
  `§MANIFEST_ROUNDTRIP apps=3 source=modeller files=55 sites=830 … identical=55/55 driven=757/757 sw_vm=3/3 claims=19/19 red=20/20 order_check=PASS deps_declared=25 unreviewed=0 owner_gap=31 witness_gap=24 b2_trial=Y site_v=28 pinned=2 verdict=PASS`
  · `C16 … check_fails=0 driven_files=20/20 marker_pairs=16 modules_differing_from_reader=0 site_v=28 reader_says=28 … pinned=2` · `C17 … modules_bumped=19 … bump_lines=38/38 files_changed=8 files_differing=0/19` ·
  `C18 … named_as_target: regex_exit=2 manifest_exit=2 · --changed (sw.js + icons.js changed): exit=0 bumpable=erp/icons.js sw_lines=0 literals unchanged` · `C19 … stamp_reads=v1121 manifest=v1121 before_the_bump=v1120`.
- **Red on the old code** (the new witness with `manifest_source.js`, `bump.js` and the modeller manifest of main `79755693`): `C16 ok=N … check_fails=31 … site_v=0 reader_says=28`, C17 and C18 "judged nothing", `claims=15/18 red=16/19 … verdict=INCONCLUSIVE`.
  C19 is a guard with no red on the old code (it read `v1120 = v1120` there): it protects the deploy stamp from a later change of the `sw.js` line.
- **Unchanged, on the branch:** `§BUMP_W_VERDICT PASS judged=7 failed=0` · `§BUMP_PARITY_W_VERDICT PASS judged=24` · `§DEPS_W cases=16 agree=16/16 … verdict=PASS` · `§SW_AUDIT_SUMMARY 303 found, 0 missing` ·
  `§CODEFACTS_BUMP_BUTTON checks=6 failed=0 verdict=PASS` · `§SHIP_PANEL … verdict=PASS` · `§CORE_PURE files=125 … forbidden=0 … verdict=PASS`.
- **Deviations from the spec, said here:** (1) the new red controls are **R16 to R20** (R13 to R15 were taken by #3326); R18 of the spec (a pair swapped on a second page) and C20 wait for part 2, because ERP has no declared `deps` until the switch.
  (2) **One rule for every app** instead of "a site `v` is refused in the modeller": a site `v` is legal only when it is lower than its module's, or null; the modeller has none, so its bytes and verdict are as before. A per-app exception would have been a special case in the generic layer.
  (3) C17 bumps all 19 differing modules, not the three the spec named. (4) Until `erp/modules.json` exists the claims run on ERP switched in memory and in temp trees (`b2_trial=Y`); part 2 turns the same claims onto the committed file.
- **Found on the way, fixed in the same PR:** the modeller's register literal (`sw.js?v=1`, an inline site of `modeller/sw.js`) would have been raised by a second `--changed` bump on one branch. It is now `"pin": true` (one manifest line, no page byte changes). It had not happened yet (the literal is still 1).

**B2 DEPS REVIEW — the session's reading of ERP's 216 order-forcing edges (B2-Q1; tool sha `1c213995…` on main `79755693`; each cited line read in the code).**
- **`deps`, 201:** every plain edge whose cited line reads the name when the file loads. By publisher: `ad_process.js` 63 (each `processes/*.js`: `… : global.AdProcess`) · `ad_callout.js` 29 (28 `callouts/*.js` + `idempiere.html:709`) ·
  `model_layer.js` 22 and `model_trade.js` 17 (the `model_*.js` UMD factories and 5 processes) · `bigdecimal.js` 10 · `layered_registry.js` 4 · `page_status.js` 3 · `model_order.js` 3 · 2 each: `ad_modelval.js`, `rest_core.js`, `ad_data.js`,
  `ad_parser.js`, `idmp_session.js`, `erp_kernel.js`, `common/whole_history.js`, `kds_core.js`, `model_asi.js`, `ninja_stage.js` · 1 each: `genesis.js` (`genesis.html:103`, `window.Genesis.b3`) and 28 more publishers (the list is the tool's
  `§DEPS_CAND … order=ok` lines minus the three below).
- **`notDeps`, 7 (the name is a browser built-in that the "publisher" only wraps or fills in):** `fetch` → `overlay/boot.js` (`boot.js:25` assigns `window.fetch`): `chat_lens.html:68`, `erp.html:106`, `erp_replica_client.js:14` (AGAINST today) ·
  `crypto` → `genesis.js` (`genesis.js:667-668` fills `global.crypto` only when it is missing): `erp_snapshot_sign.js:12` (AGAINST), `erp_attrib.js:21`, `erp_signer.js:13`, `idempiere.html:706`.
- **`uses`, 8 (real, but no tag order can or should be forced):** `model_pa.js:11` → `ad_callout.js` (AGAINST today; `:16` reads `root.AdCallout` again at call time) · `erp_seam.js:31` → `bigdecimal.js` (AGAINST today, and a real fault: next line) ·
  six that are not two tags of one page (loaded by inline page scripts or on different pages): `team_updates.js:12` → `semver_strict.js`, `team_versions.js:12` → `op_versions.js`, `odoo_descriptor.js:22` → `erp_descriptor.js`,
  `team_docno.js:14` → `model_trade.js`, `team_sync.js:876` → `team_scope.js`, `team_sync.js:30` → `ad_modelval.js`.
- **A real fault the review found (bim-ootb #3368, handed to the ERP lane, not fixed here):** `idempiere.html` loads `erp_seam.js` (`:662`) before `bigdecimal.js` (`:666`), so `erp_seam.js:31` holds `BD = null` in the browser and the
  rule-guard test at `:124-126` compares with `Number()` instead of BigDecimal. Whether any real value differs between the two was not measured. It is recorded as `uses`, so the switch keeps today's bytes; when the lane fixes the order it becomes `deps`.
- **Checked in memory** (`MS.init` with these lists, then `MS.order`): `§TRIAL_ORDER app=erp deps=201 notDeps=7 uses=395 judged=201 errors=0 module_pairs_with_both_tags=185 page_placements_judged=202` (a scratch probe, in no repo; part 2's C20 is the kept form).
- **OWNER CONFIRMED 2026-11-20:** shown the 15 that are not plain `deps` (7 `notDeps`, 8 `uses`) in three groups; owner: *"yes"*.

**B2 PART 2 RESULT — ✅ DONE 2026-11-20 (bim-ootb #3370, PR #3373 → main `e4c7356a`; the owner confirmed the 15 not-plain edges with "yes").** ERP is a SOURCE app: `erp/modules.json` (1,147 lines: 297 modules, 366 sites,
419 precache entries; 201 `deps`, 7 `notDeps`, 395 `uses`, `depsReview.by` = owner) writes every ERP script tag, `'file?v=N'` literal, `PRECACHE_ASSETS` entry and `CACHE_VERSION`.
- **Bytes:** 16 marker pairs on the 13 pages (32 lines; `idempiere.html`, `glassbowl.html` and `glassbowl_gravity.html` have 2 pairs each), 2 marker lines in `erp/sw.js`, `CACHE_VERSION` one step. Nothing else in those files changed
  (`C9 ok=Y app=erp switch=e4c7356aa2c7 files=19`). The hand comment on the `CACHE_VERSION` line was left as it is (the deploy stamp reads that line, C19).
- **Main moved during the build:** a peer's ERP bump (#3371: `ctx_help.js` 2 → 3, `ad_ctxhelp_app_rows.js` 4 → 5, `CACHE_VERSION` v1120 → v1121) merged first. `origin/main` merged in cleanly; its two numbers were set in `erp/modules.json` and the
  version stepped v1121 → v1122. The peer had been told before the switch and again when it landed (4 live sessions).
- **Log on merged main `e4c7356a` (full run):** `§MANIFEST_ROUNDTRIP apps=3 source=erp,modeller files=55 sites=830 … identical=55/55 driven=757/757 sw_vm=3/3 claims=28/28 red=21/21 order_check=PASS deps_declared=226 unreviewed=0 owner_gap=152 witness_gap=152 b2_trial=N site_v=28 pinned=2 verdict=PASS`
  · `C20 ok=Y app=erp deps_declared=201 pairs_judged=185 page_placements_judged=202 pairs_on_2plus_pages=16 out_of_order_in_the_pages=0 generator_refusals=0` (judged against the pages' own tag positions) ·
  `R21 detected=Y erp/crud_overlay.js and its dep erp/crud_core.js swapped on erp/idempiere.html only (right on 1 other page(s)): 1 refusal(s), all naming erp/idempiere.html`.
- **Before / after, the tests that read the two changed files as text:** 41 files; 6 need a browser and were not run; the 35 node ones give the same result line for line on unedited main and on the switch branch (24 exit 0, 10 exit 1, 1 timeout on both;
  the 10 + 1 are not this lane's: `poc_idmp_host`, `witness_already_there`, `witness_bc_migrate`, `witness_docno` (timeout at 240 s), `witness_migration_recover`, `witness_odoo_form`, `witness_odoo_messy`, `witness_role_access_update`,
  `test_s253_gantt_sync`, `test_s283_pwa_install`, `witness_zoom_linkback_node`).
- **Unchanged on the branch:** `§BUMP_W_VERDICT PASS judged=7 failed=0` · `§BUMP_PARITY_W_VERDICT PASS judged=24` · `§DEPS_W … verdict=PASS` · `§SW_AUDIT_SUMMARY 303 found, 0 missing` · `§CODEFACTS_BUMP_BUTTON checks=6 failed=0 verdict=PASS` ·
  `§SHIP_PANEL … verdict=PASS` · `§CORE_PURE … forbidden=0 … verdict=PASS`.
- **Live, fetched back:** `erp/version.json` = `{"version":"v1.95.0","build":"v1122","sha":"e4c7356a","pr":3373,…}`; live `erp/sw.js` holds `CACHE_VERSION="v1122"` and no marker comment (it is minified, as the spec expected); live
  `erp/idempiere.html` holds its 2 `§MANIFEST:BEGIN erp tags` lines. A dry-run bump on main: `§BUMP page=erp/erp.html ref=icons.js v=26->27 (manifest erp/modules.json)` … `v=3->4`, `v=3->4`, `v=12->13` (each page from its own number).
- **A generator weakness found by C11 and fixed in the PR:** ERP pages keep several tags on one line (`branch_admin.html`, `kitchen.html`, `till.html`). A new tag was written on a new line after the WHOLE line, so removing it again did not give
  back the same bytes. Now a new tag (or precache entry) whose anchor shares its line with later sites stays on that line, right after the anchor.
- **Two witness assumptions corrected (the instrument, not the product):** C10 compared the module's `v` with the reader's, which is null when sites differ (now: the highest site number); C17 stripped marker lines from one side only.
- **NOT run, said plainly:** the legacy-parity bridge on the switch branch (the spec listed it). No JS module is bumped by the switch and the pages gain comment lines only; the bridge's own bump witness (`§BUMP_PARITY_W_VERDICT`) passed.
  The first real ERP bump by any session runs the gate as always. W-VSC-OPERATIONAL and the CI fast tier: CI ran its tier green on the PR; §F.41 was not run locally.
- **Docs:** CLAUDE.md WORK-TO-ZERO merge rule and Developer Guide §5.1 / §5.2 now say ERP and the Modeller are written from `modules.json` (this PR).
- **Open after B2:** `owner_gap` (ERP 121 modules name no prompts file in their header) and `witness_gap` (128) are printed on every run; Part D and Part E close them · bim-ootb #3368 (`erp_seam.js` before `bigdecimal.js`), with the ERP lane ·
  B-4's own step (7 plugin `.mjs` on disk are not precached) · the 10 modules whose numbers differ between pages stay so until B4-HASH.
- **NEXT in Part B:** B3, the viewer: its build spec is the next block.

**B3 BUILD SPEC (2026-11-20, twelfth session; spec only; one confirmation and one question at the end).** Scope: `viewer/` becomes "the manifest is the source", the last of the three apps. Measured read-only on bim-ootb `main` @ `9dde6d7d` with the
shipped tools, plus two scratch probes (`§TRIAL_*` lines, in no repo).

**Baseline.**
- `§MANIFEST_APP app=viewer pages=5 loaders=15 modules=314 boot=273 lazy=41 sites=352 tag=295 asset=0 inline=2 lazy_sites=55 precache=303 cacheVersion=v1779`
- `§MANIFEST_VERSIONS app=viewer versioned_modules=307 one_version=302 disagree=3 sites_below_max=3 files=viewer/locale_loader.js,viewer/schedule_author.js,viewer/sw.js` · `§MANIFEST_UNVERSIONED app=viewer tags_without_v=13 external_url_sites=2` ·
  `§MANIFEST_INLINE_SITES app=viewer inline_sites=2 … partial_literals=2 non_js_inline_blocks=1` · `§MANIFEST_LAZY_PRECACHE app=viewer lazy_precached=15 lazy_not_precached=26 boot_not_precached=43 precached_not_referenced=58 dup_entries=0`
- Sites per file: `viewer.html` 264 tags + 1 inline · `boq_charts.html` 16 + 1 · `mep_report.html` 7 · `clash_report.html` 5 · `model_check_report.html` 3 · `main.js` 26 lazy literals · 14 more loaders, 1 to 5 each (29 literals).
  60 of the 314 modules live outside `viewer/`; 13 are on 2+ pages; 232 tags carry an `onerror`; 5 modules are both a tag on a page and a lazy literal in a loader; 2 sites are CDN URLs (`clash_report.html`, keyed by the URL as in B0).
- Tag groups (a new group where two tags are more than 25 lines apart): `viewer.html` 852-1194 (263) and 1308 (1) · `boq_charts.html` 57-73 (14) and 2272 (2) · `clash_report.html` 7 (1) and 44-46 (4) · `mep_report.html` 7 (1) and 58-62 (6) ·
  `model_check_report.html` 49-51 (3). So 9 marker pairs, placed by hand in the switch PR.
- **Busier than ERP** (`git log --since="7 days ago" origin/main`): 68 commits touched `viewer/sw.js`, 46 touched `viewer/viewer.html`.

**No new generator work is expected.** The viewer switched in memory with what B2 built: `§TRIAL_VIEWER modules=314 inline_readers=8 files=22 identical=22/22 marker_pairs=9 site_v=5 pinned=2 check_fails=0 owner_gap=191`.
The 5 site numbers: `locale_loader.js` is 15 on `clash_report.html` and 16 elsewhere; `schedule_author.js` is 20 on `boq_charts.html` and 31 on `viewer.html`; `viewer/sw.js`'s two register literals (538 and 594, both pinned);
`erp/bigdecimal.js` and `erp/ad_docfsm.js` are tags with no `?v=` on `viewer.html` and versioned literals in `wh_walk.js`.

**What is the same as B1 / B2 (not repeated):** `viewer/modules.json`, canonical, dev-side only · comments stay in the files · `precache` copied per module as today (B-2; the viewer has no single rule: 15 lazy and precached, 26 lazy and not) ·
site `v` and `pin` · `bump.js` command lines and `§BUMP` lines · the merge rule for sessions (CLAUDE.md gains `viewer/`).

**What the viewer has that the others did not.**
1. **Its own audits stay the second reader:** `tests/audit_sw_precache.js` (LISTED-IS-REAL, NEEDED-IS-LISTED) and `tests/audit_script_tags.js` are not moved onto the manifest in B3; C6 keeps comparing their summary with the manifest's counts.
2. **`_GANTT_CACHE_VERSION` in `viewer/tm_dash.js` stays by hand** (not a file version; Developer Guide §5.1 says so already).
3. **The import map** (1 non-JS inline block) and the 2 partial `?v=` literals are counted, never owned.
4. **After B3 the regex path of `bump.js` serves three pages only:** `index.html`, `capex/index.html`, `archive/gallery.html` (the tracked `.html` outside the three apps that hold a `?v=` reference; measured by `git grep`). That is B3-Q2.

**The `deps` candidate list (B-5), measured:** `§DEPS_SUMMARY app=viewer modules=314 read=297 inline_bodies=13 skipped=17 parse_fail=0 candidates=726 load=26 load_guarded=15 call=293 call_guarded=364 import=28 import_not_module=26 forces_order=69 against=169 against_load_unguarded=0 ambiguous=8 published=750 published_by_2plus=22`
**B3 DEPS REVIEW — the session's reading of the 69 order-forcing edges (each cited line read in the code):**
- **`deps`, 35 (26 load + 9 guarded load, all in today's order):** the `hr_bim_asset/*.js` family → `watermark.js` (6), `connectors.js`, `rules.js`, `mock_rates.js` · `bom_engine/bom_node.js:24-25` → `bom_strategies.js`, `bom_constraints.js`; `bom_tree.js:18` → `bom_node.js` ·
  `proj_claim.js:21`, `proj_control.js:21`, `proj_fold.js:18`, `vo_approve.js:20`, `vo_fold.js:30`, `whatif.js:26` → `erp/bigdecimal.js`; `proj_claim.js:22` → `proj_period.js`; `vo_approve.js:21` → `erp/ad_docfsm.js` ·
  `common/flythru_maths.js:33` → `common/storey_raster.js` · `materialize.js:26` → `common/import_key.js` · `sourced_light.js:13` → `light_law.js` · `boq_charts.html:96`, `viewer.html:1020`, `cpm_schedule.js:51` → `rates.js` ·
  `clash_report.html:546` → `locale_loader.js` · `model_check_report.html:99` → `road_check.js`, `:113` → `earthworks_volume.js` · `doc_canvas.js:577` → `grid_state.js`, `:579` → `grid_recompose.js` · `edit_delta_viewer.js:77` → `connect_scene.js` ·
  `universal_history.js:12` → `common/history_bar.js`, `:464` → `common/whole_history.js`, `:417` → `erp/kernel_ops.js`.
- **`uses`, 3 that run AGAINST today's tag order and work anyway:** `input_registry.js:245` → `scene.js` and `:248` → `panels.js` (both sit inside `pollAudit` / `pollPills`, which retry on a timer until the names exist; `input_registry.js` is the tag at
  `viewer.html:885`, `scene.js` at `:898`, `panels.js` at `:909`) · `silhouette_refine.js:487` → `main.js` (`if (global.APP) global.APP.silhouette = API`: the tag at `:901` runs before `main.js` at `:1191`, so the line does nothing on this page,
  and no viewer file reads `APP.silhouette` / `A.silhouette` (`git grep`): a dead line, noted for the viewer lane, not a fault).
- **`uses`, 3 that cannot be placed:** `wizard.js:61-63` → `wizard_orientation.js`, `wizard_storeys.js`, `wizard_classify.js` (`typeof` guarded; not two tags of one page).
- **`uses`, 28 imports** (as B1: the `import` / `importScripts` statement orders them; 26 of the 28 targets are `lib/` files or worker-only files that are not manifest modules).
- `notDeps`: none. `§DEPS_AMBIGUOUS` 8: printed, not edges.
- Checked in memory: `§TRIAL_ORDER app=viewer deps=35 notDeps=0 uses=691 judged=35 errors=0`. With all 41 load edges as `deps` the generator refuses exactly the three AGAINST ones (`errors=3`).

**Build: one PR** (no part 1 is needed): live sessions told first · the 9 marker pairs + the `sw.js` pair · `gen_manifest.js --init viewer --as-uses <the 6>` · one `CACHE_VERSION` step · the witness's B2 block (C16 to C21 today named for ERP) made to run for every source app with site numbers or pins ·
opened, checked and merged in one sitting; if main moved in `viewer/`, merge it and set the moved numbers in `viewer/modules.json` (as #3373 did with #3371).
**Witness:** `§MANIFEST_ROUNDTRIP apps=3 source=erp,modeller,viewer … claims=N/N red=M/M order_check=PASS deps_declared=261 unreviewed=0 verdict=`; C6 (the precache audit's own summary) must still equal the manifest; C9 for the viewer's switch commit.
**INCONCLUSIVE** as in B1 / B2, plus: the audit prints no summary line.
**Runs unchanged before / after:** `tests/audit_sw_precache.js`, `tests/audit_script_tags.js` · the node tests that read `viewer.html` or `sw.js` as text (`git grep` finds 12 files, 10 of them node-only) · `witness_bump.js`, `witness_bump_parity.js`, W-DEPS-CAND,
W-CORE-PURE, the Code Facts ship and bump-button witnesses · after the merge: the Pages deploy green and the live `viewer/sw.js` `CACHE_VERSION` fetched back.
**Not in B3:** content hashes (B4-HASH) · one precache rule for lazy modules · the audits' move onto the manifest · the three pages outside the apps · `_GANTT_CACHE_VERSION` · any tag, literal or comment moved.
**Deletion budget (honest):** B3 adds `viewer/modules.json` (about 1,000 lines, an estimate) and removes 0 lines of pages or lists. The regex path of `bump.js` is NOT removed in B3 unless B3-Q2 says so (the B1 spec expected it to go here; three outside pages still use it).
**Risk particular to the viewer:** it is the tree most sessions touch (68 `sw.js` commits a week). The first days after the switch will see CI refusals on branches that hand-edit a tag; the message names the file, the line and the command.

**Owner items (open; one per message).**
- **B3 confirmation (B-5) ✅ ANSWERED 2026-11-20, owner: *"Agree"*:** the 6 edges that are not plain `deps` go in `uses` (the 3 against today's order, the 3 wizard edges). The 28 imports follow B1's answer.
- **B3-Q2 ✅ ANSWERED 2026-11-21 (owner: *"proceed"*, on the revised recommendation "bring them in now"; DECISIONS):** ~~what happens to the old regex path in `bump.js` once all three apps are written from their lists?~~ Three pages outside the apps still need it. **Recommended:** keep it for those three until B4-HASH (nothing deleted now).
  Alternative: bring `capex/` in as a fourth app and the two single pages under the app they load from, then delete the path (a separate step with its own spec).

**B3 RESULT — ✅ DONE 2026-11-20 (bim-ootb #3377, PR #3378 → main `14bb498f`; the owner confirmed the 6 not-plain edges with "Agree").** The viewer is a SOURCE app, so **all three apps are written from their lists.**
`viewer/modules.json`: 314 modules, 352 sites, 303 precache entries; 35 `deps`, 691 `uses`, `depsReview.by` = owner.
- **Bytes:** 9 marker pairs on the 5 pages, 2 marker lines in `viewer/sw.js`, `CACHE_VERSION` v1780 → v1781. Nothing else in those files changed (`C9 ok=Y app=viewer switch=14bb498ff1d0 files=21`).
- **Main moved before the build:** the 4D lane's #3375 (hand bumps of `schedule_author.js`, `shim_bonds.js`, `cpm_schedule.js`, sw v1780) merged after the notice went out. The branch was moved onto it BEFORE the baseline and the init, so its values are
  the list's starting values. 4 live sessions told before; 3 told when it landed (one had ended).
- **Log on merged main `14bb498f` (full run):** `§MANIFEST_ROUNDTRIP apps=3 source=viewer,erp,modeller files=55 sites=830 … identical=55/55 driven=757/757 sw_vm=3/3 claims=40/40 red=26/26 order_check=PASS deps_declared=261 unreviewed=0 owner_gap=331 witness_gap=272 b2_trial=N site_v=33 pinned=4 verdict=PASS`
  · `C6 ok=Y audit: total=303 scripts=259 precached=226 · manifest: total=303 scripts=259 precached=226` · `C16 … app=viewer … driven_files=22/22 marker_pairs=9 … site_v=5 reader_says=5 … pinned=2` ·
  `C17 … app=viewer modules_bumped=4 (ad_docfsm.js,bigdecimal.js,locale_loader.js,schedule_author.js) … bump_lines=9/9 files_changed=6 files_differing=0/21` · `C18 … app=viewer pinned=2 … literals unchanged` ·
  `C20 ok=Y app=viewer deps_declared=35 pairs_judged=30 page_placements_judged=30 pairs_on_2plus_pages=0 out_of_order_in_the_pages=0 generator_refusals=0`.
- **Before / after:** the 10 node tests that read `viewer.html` or `sw.js` as text, plus `tests/audit_sw_precache.js` and `tests/audit_script_tags.js`: the same result line for line on unedited main (`0c27edc9`) and on the switch branch
  (7 exit 0, 5 not, on both; the 5 are not this lane's: `poc_fin_evm`, `test_s253_gantt_sync`, `test_s283_pwa_install`, `poc_precache_trim`, `witness_split_surface`).
- **Unchanged on the branch:** `§BUMP_W_VERDICT PASS judged=7` · `§BUMP_PARITY_W_VERDICT PASS judged=24` · `§DEPS_W … verdict=PASS` · `§CODEFACTS_BUMP_BUTTON checks=6 failed=0 verdict=PASS` · `§SHIP_PANEL … verdict=PASS` · `§CORE_PURE … verdict=PASS`.
- **Live, fetched back:** deploy run for `14bb498f` success; live `viewer/sw.js` holds `CACHE_VERSION="v1781"`; live `viewer.html` holds its 2 `§MANIFEST:BEGIN viewer tags` lines. A dry-run bump of `viewer/schedule_author.js` on main raises it on
  `boq_charts.html` 20 → 21 and `viewer.html` 32 → 33, and the modeller's loader literal 22 → 23 with that loader's own tag (two manifests in one run).
- **A generator weakness found by C11, fixed in the PR:** `viewer/sw.js` keeps several precache entries on one line with no space after the comma. A new entry is now written after the separator that follows its anchor and repeats that separator, so
  adding and removing gives back the same bytes for both `'a','b'` and `'a', 'b'`.
- **Witness change:** the B2 block (C16 to C18, C20, R16 to R21) runs for every app whose pages load a module under different numbers (ERP, the viewer); C19 stays ERP's (the deploy stamp). R21 is INCONCLUSIVE only when no source app has a
  `deps` pair on 2+ pages (the viewer has none: `pairs_on_2plus_pages=0`; ERP has 16).
- **Deviation from the spec:** `tests/audit_script_tags.js` printed no summary line the before / after set could compare (its exit code was compared, 0 on both).
- **Not run:** the 2 tests that need a browser; W-VSC-OPERATIONAL locally (CI's tier was green on the PR).
- **Docs:** CLAUDE.md merge rule and Developer Guide §5.1 / §5.2 now say all three apps (this PR).
- **Part B's "Done when", where it stands:** all three apps generated from their manifests ✅, round-trip identical ✅, the Pages deploy green after each switch ✅. Still open: `bump.js` "retired or reduced" (its regex path now serves 3 outside
  pages only: B3-Q2, then B4-HASH) · B-4's own step (7 ERP plugin `.mjs` not precached) · one precache rule for lazy modules (B-2's later step) · the `owner` gap (331 modules across the apps; Part D).

**B3-OUT BUILD SPEC (written 2026-11-22; decisions B3-Q2 = bring the outside referrers in now, B3-Q3 = `archive/gallery.html` frozen; no decision open).**
**Issue it fixes:** after B3 the regex path of `scripts/bump.js` (`:122-154`, the `pages` / `loaders` loops for files no manifest owns) is the only thing that keeps the referrers outside the three apps in step, and only when a
change goes through `bump.js`. Measured miss: `viewer/import_db_builder.js` went 11→12 in `viewer/viewer.html` (#2702, `8d1ede96`) and `index.html` still says 11; `import_own.js` says `viewer/import_worker.js?v=20` while the
viewer is at 22. No check reports either. B4-HASH would have to bring these files in anyway.
**Measured baseline (bim-ootb `main` @ `e4fa52fe`, the same reader `bump.js` uses, a node one-off over `trackedFiles`):** the non-owned files with a `?v=` reference the regex path would edit are exactly four:
| File | `?v=` sites | Unversioned `<script src>` | Owning list after B3-OUT | Files it loads (each already a module there, except `import_own.js`) |
|---|---|---|---|---|
| `index.html` (the landing page) | 8 tags | 4 (`erp/icons.js`, `common/whole_history.js`, `common/about_diy.js`, `viewer/bonsai_kernel.js`) | `viewer/modules.json` | `common/pill_builder.js` 1, `common/i18n/lang_choice.js` 1, `viewer/locale_loader.js` 15 (module 16), `viewer/vertex_weld.js` 1, `viewer/import_db_builder.js` 11 (module 12), `common/import_key.js` 2, `import_own.js` 7 (NEW module), `viewer/db_resolve.js` 4 |
| `import_own.js` (root loader, loaded only by `index.html:186`) | 3 literals (`:355` ×2, `:527`) | — | `viewer/modules.json` | `viewer/import_worker.js` 20 (module 22) ×2, `viewer/mesh_import_worker.js` 2 (module 1: **above** the module, see 3) |
| `capex/index.html` | 6 tags | 4 (`tiles.js`, `pa_tiles.js`, `adapters.js`, `dash.js`: capex's own files) | `erp/modules.json` | `erp/layered_registry.js` 1, `erp/bigdecimal.js` 2, `erp/db_export_safe.js` 1, `erp/ad_callout.js` 11, `erp/callouts/sqlfn.js` 3, `erp/goal_engine.js` 3 (all equal to their module) |
| `archive/gallery.html` | 4 tags the regex sees (+ 11 `?v=` inside inline-script strings it never saw) | — | **none: FROZEN (B3-Q3)** | — |
No `sw.js` serves `index.html`, `import_own.js`, `capex/` or `archive/` (the tracked `sw.js` are `erp/`, `modeller/`, `viewer/`, `oplogpic/`; `oplogpic/` pages hold no `?v=`). Activity since 2026-10-22: `index.html` 9 commits, `capex/index.html` 14, `import_own.js` 5 (the CAPEX dashboard lane is live: told first).
**What changes (one PR, bim-ootb):**
1. **`gen_manifest.js --adopt <app> <file…>`** (new, one-time, like `--init`): reads each file with the B0 reader (`readSites`), appends its sites to `<app>/modules.json` `order` in file order, adds a `modules` line for a target the list lacks
   (`import_own.js`; the 8 unversioned targets: `v:null` where no site of it carries a number), then runs the deps candidate tool for the new edges. Writes nothing to the adopted file except the marker pair(s). Refuses a file already
   in another app's `order`, a file under `lib/`/`tests/`, and a FROZEN file.
2. **Marker pairs** `<!-- §MANIFEST:BEGIN viewer tags … -->` / `END` round `index.html:174-187` (all 12 `<script src>` sit there) and `<!-- §MANIFEST:BEGIN erp tags … -->` / `END` round `capex/index.html:41-61`. 4 marker lines. A `.js` loader needs none (as today).
3. **A site above its module** (`import_own.js` → `viewer/mesh_import_worker.js` 2, the module is 1): the module's `v` becomes 2 and the viewer's own sites of it gain a site `v:1` (byte-identical; the existing "a site `v` only when lower" rule holds).
4. **`bump.js`: the regex path is DELETED** — the `pages` / `loaders` replace loops, `PAGE_REF` / `JS_REF` in `--changed` (it reads the manifests only), the non-manifest `sw.js` branch, `§BUMP_CHECK_BY_HAND`. A target no list names exits 2 `not_loaded_by_any_page_or_loader` as today.
5. **A site in a file outside the app folder adds nothing to that app's `CACHE_VERSION`** (no service worker serves it): bumping `import_own.js` raises `index.html:186` and no `CACHE_VERSION`; bumping `viewer/locale_loader.js` raises its viewer pages, the modeller's,
   `index.html:179`, and the viewer's and modeller's `CACHE_VERSION` once each (as today). The loader rule holds: a raised literal in `import_own.js` raises `import_own.js`'s own tag next round.
6. **`FROZEN`** in `gen_manifest.js`: `['archive/gallery.html']`, with the decision cited beside it. Counted, never owned, never written.
**Witness (W-MANIFEST-ROUNDTRIP, new claims; red-run each against today's code, it must FAIL):**
- **C22 OUTSIDE-OWNED:** every tracked file outside `lib/` / `tests/` that the B0 reader finds a `?v=` site in is in exactly one app's `order` or in `FROZEN`. Red: a temp-tree root page with one `?v=` tag → FAIL naming the file and `--adopt`. Prints `outside_owned=N/N frozen=1`.
- **C23 FROZEN-UNTOUCHED:** a dry-run bump of every module `archive/gallery.html` names leaves it byte-identical. Red: today's `bump.js` edits it.
- **C24 OUTSIDE-NO-CV:** in a temp copy, `bump.js import_own.js --write` changes exactly `index.html` (one tag +1) and `viewer/modules.json`, no `sw.js`. Red: without rule 5 → the viewer's `CACHE_VERSION` moves.
- **C25 NO-REGEX:** `bump.js --root <temp tree with a non-owned page loading viewer/rates.js>` leaves that page byte-identical. Red: today's `bump.js` raises it.
- Existing claims run unchanged: C1-C21, byte-identical `identical=N/N` (the adoption commit's only byte change to the three adopted files is the 4 marker lines: `git diff --stat` shows it), `order_check=PASS`.
**Line:** `§MANIFEST_ROUNDTRIP apps=3 source=erp,modeller,viewer … outside_owned=3/3 frozen=1 claims=N/N red=M/M order_check=PASS deps_declared=N unreviewed=0 verdict=`.
**INCONCLUSIVE** when: C22 judged 0 files (the reader found no outside file: the claim is blind) · the deps review of the new edges is not done (`unreviewed>0`).
**Deps review (B-5: the tool proposes, a person confirms):** the session reads each new order-forcing edge in the code (file:line) and writes the list here; the owner confirms the not-plain ones in one message, as in B2 / B3.
**Runs unchanged before / after:** `scripts/tests/witness_bump.js` (C1-C7; a case that used the regex path is moved onto a manifest file, named in the PR, never deleted), `tests/witness_bump_parity.js`, the Code Facts ship / bump-button /
context witnesses, `tests/audit_sw_precache.js`, `tests/audit_script_tags.js`, W-CORE-PURE; after the merge: the Pages deploy green and the live `index.html` fetched back byte-equal to `main`.
**Deletion budget:** removes the regex path of `bump.js` (`PAGE_REF` / `JS_REF`, their two scans in `--changed`, the `pages` and `loaders` replace loops, `swFor` / `needSw` and the loop that bumps a `sw.js` no manifest owns, the `§BUMP_CHECK_BY_HAND` loop; an estimate of about 60 lines, counted in the PR) · adds `--adopt` (about 40) + rule 5 (about 3) + `FROZEN` (2) + 4 claims (about 60) + ~30 `order` lines and ~10 `modules` lines in the two lists.
**Not in B3-OUT:** content hashes and the `?v=` the 8 unversioned tags lack (B4-HASH) · `archive/gallery.html` (frozen) · `test/test_ifc_export.html` (a May fixture, `?v=` only inside `new Worker(...)` strings) · `capex/` as its own app · retiring `bump.js` (B4-HASH).
**B3-OUT RESULT — ✅ DONE 2026-11-22 (bim-ootb #3385 → main `0fa163b8`; owner confirmed the one not-plain edge, `capex/index.html#inline0 -> erp/genesis.js` in `notDeps`, with "proceed").** Re-run by this session on main:
`§MANIFEST_CHECK apps=3 files=58 identical=58/58 sites=856 … order_check=PASS deps_declared=264 unreviewed=0 … verdict=PASS` · `§MANIFEST_ROUNDTRIP … files=58 identical=58/58 driven=774/774 claims=44/44 red=31/31 outside_owned=3/3 frozen=1 unresolved=1 order_check=PASS deps_declared=264 unreviewed=0 … verdict=PASS`
(`witness_gap=276` on that line is the sum of the per-app gaps 123+129+24, printed, not judged). Live fetch-back after the Pages deploy (success): `§LIVE_FETCHBACK index.html|capex/index.html|import_own.js byte_equal=Y` (3/3).
New claims: C22 `judged=49 outside_owned=3/3 frozen=1 unresolved=1 unowned=0` (red on old code: `unowned=3`) · C23 gallery `gallery_changed=N` after 19 bump lines · C24 `bump import_own.js`: `index.html` 7→8, `sw_changed=0` (red: no `viewer/modules.json`) · C25 a page in no list byte-identical (red: changed).
**Spec error found by the build:** C23's "today's `bump.js` edits it" was wrong. The old regex path never edited `archive/gallery.html`: its paths resolve from `archive/` to `archive/viewer/…`, which does not exist (so the frozen page's scripts are likely 404 in a browser too; information only).
R26 (a root copy of the gallery, adopted, is edited) proves the claim can fail. Byte change to the adopted files: `index.html` +4 marker lines (2 pairs, the GoatCounter tag kept verbatim through the new `keep` site key), `capex/index.html` +2, `import_own.js` 0.
`bump.js` +19 / −88; PR +347 / −130, 13 files. Regex-path cases moved onto the manifest path, none deleted: `witness_bump.js` C1 C2 C5 C6, `witness_bump_parity.js` 23 rows, the Code Facts ship fixture, the roundtrip's C17 oracle (now `regexBump` inside the witness).
Before = after: `witness_bump` PASS 7 · `witness_bump_parity` PASS 24 · `audit_sw_precache` 303/0 · `audit_script_tags` 259/0 · Code Facts bump-button / context / ship PASS. Not run: `witness_setup.js`, browser tests, the real-bridge parity row. Logs: `/tmp/b3out_logs/` (machine-local).
Developer Guide §5.1 / §5.2 updated for the outside pages and `--adopt` (this PR). **Part B now:** `bump.js` is "reduced" (manifest path only); retired at B4-HASH.

**B3-OUT ADDENDUM (2026-11-22, the build met the code; a worker stopped before any commit, each finding re-read by this session):**
- **13th tag:** `index.html:663-664` is the GoatCounter tag (`data-goatcounter="…"` and `async`, over two lines). The generator writes only `<script src="X"></script>` with an optional `onerror` (`scripts/lib/page_refs.js` header: `canonical=false`
  otherwise), and `--check` refuses a `<script src>` outside the markers, so adopting the page rewrote the tag and dropped its attributes (seen in a dry run: 5 lines changed, not 4). **B3-OUT-Q1**, asked with the recommendation
  "the generator keeps a tag's other attributes verbatim; it owns only `src` and its `?v=`" (alternative: exempt external unversioned tags from the markers rule). Owner: *"Proceed."* → **B3-OUT-Q1 = attributes kept verbatim.**
  The byte-identical check over the 55 files already listed proves no other page moves. The markers then go round `index.html:174-187` AND `:663-664` (two pairs; B2 allows several).
- **Dead tag:** `index.html:181` loads `viewer/bonsai_kernel.js`, which moved to `modeller/bonsai_kernel.js` in #550 (`964ad3cc`, 2026-06-27): a 404 since then. `index.html:321` guards it (`if(window.Bonsai && Bonsai.preload)`), so the landing page's
  occt-wasm preload has silently not run. B3-OUT keeps the tag byte-identical (`--adopt` prints `§ADOPT_MISSING`; `gen_deps_candidates.js` skips a module not on disk). **Handed over as information** (pointing it at `modeller/` starts a
  large download on the landing page: the landing / Modeller lane's call, not this lane's).
- **C22's population** is "a `?v=` site whose target is a file on disk"; an unresolved one is printed apart (`unresolved=N`). Measured: 1, `prompts/film_bim_doonce_rec.js:258` `load('reg_report_ui.js?v=1')` (a film recording script; it runs
  inside the Modeller page, where the name resolves to `modeller/reg_report_ui.js`; no bump edits it).
- **Deps (B-5), read in the code:** plain `deps`: `capex/dash.js -> capex/adapters.js` and `-> capex/tiles.js` (`capex/dash.js:19`; tags `capex/index.html:60`, `:41`, both before `dash.js` `:61`) ·
  `capex/index.html#inline0 -> erp/ad_callout.js` (`capex/index.html:54`; its tag `:46` is before the body). Not plain: `capex/index.html#inline0 -> erp/genesis.js` (`:51` `var C = window.crypto`: a browser built-in name; B2 put the same
  edge in `notDeps`) → `notDeps`, for the owner to confirm on the PR. The viewer side (`index.html`, `import_own.js`) has no new order-forcing edge.

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
**DECISIONS:**
- **D-1 (2026-11-18, tenth session):** asked where the hand-kept question list lives (options `<app>/questions.json` next to modules.json / inside modules.json / one repo-wide file). Owner: **"<app>/questions.json (Recommended)"** → one question per line (question, owner file, where in it), dev-side, joined with modules.json by the generator, which flags a question with two owners. 
- **D-2 (2026-11-18):** asked with `Bonsai` published by 12 modeller files on purpose. Owner: **"Yes, if marked "extends" (Recommended)"** → a file that adds to a shared namespace gets
  `"extends": "Bonsai"` on its modules.json line; only a member written by two files (`Bonsai.x` from 2 files) is flagged; an unmarked multi-publisher stays red. Part D can be specced.

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
**DECISIONS:**
- **E-1 (2026-11-18, tenth session):** asked with the count (333 of 1,320 witnesses carry an "ISSUE IT PROVES OR DISPROVES" sentence, 0 name the files they prove). Owner: **"One PROVES: line (Recommended)"** →
  `// PROVES: <repo path>[ <rule ids>], …` under the ISSUE line; a path that does not exist fails W-PROOF-MAP; a witness without it falls back to B1's "names the file" link, shown as weaker; added as files are touched, the modeller first in one batch.
- **E-2 (2026-11-18):** owner: **"Yes, ~/.cache JSON (Recommended)"** → each witness run writes `~/.cache/bim_witness/<witness>.json` (verdict, verdict line, git HEAD, time); never committed; the map shows it as stale when the code changed since.

**E0 BUILD SPEC — `witness_kit/paths.js` (2026-11-18, tenth session; §READY, no owner decision).** Measured on bim-ootb main `b9b2e522`:
`git ls-files` witness files under `tests/` = 1,320, of which **326 hard-code `/home/red1/`**; the roots they name: `bim-compiler/node_modules` 125 · `bim-ootb/tests` 108 ·
`bim-ootb/node_modules` 98 · `bim-compiler/deploy` 23 · `bim-ootb` 20 · `bim-ootb/buildings` 16 · `bim-compiler/scripts` 9 · `Downloads/OPEN…` 4 · others ≤ 3; plus `os.homedir()`
joins (`bim-ootb/buildings` 30, `Videos/dxf2bim_film_work/why/cli/marked` 27, `Downloads/JALAN JELAPANG IFC` 17, `bim-compiler/node_modules/puppeteer` 11 …).
A hard-coded `/home/red1/bim-ootb/…` also makes a witness run in a `/tmp/wt-*` worktree read the SHARED checkout's files, not the tree under test.
- **What E0 builds:** one dev-side module, `witness_kit/paths.js`, no dependency, nothing reaches the browser. Roots: `ootb()` = the tree the module itself lives in
  (so a worktree resolves to itself) · `compiler()` = `$BIM_COMPILER_ROOT`, else `~/bim-compiler` · `home(...parts)` · `cache(name)` = `~/.cache/<name>` ·
  `input(name)` = a named outside input (`shed_raw`, `shed_marked`, `jelapang_ifc`, …) from its env variable (`SHED_RAW_DIR` …) else today's default folder ·
  `nodeModule(name)` = the first of `<ootb>/node_modules`, `<ootb>/tests/node_modules`, `<compiler>/node_modules` that holds it (the three places witnesses load from today) ·
  `need(path, why)` = the path, or a thrown error whose message starts `MISSING input` (the runner already reads that as ENV). Every resolver prints nothing; `describe()` returns the table.
- **No behaviour change in E0:** no existing witness is edited. Converting the 326 files is a later mechanical step, done by the proof map (Part E, after E-1).
- **Witness W-PATHS** (`witness_kit/tests/witness_paths.js`): (1) on this machine every measured hard-coded root equals what the resolver returns for it (`/home/red1/bim-compiler/node_modules`
  = `nodeModule` dir for a module that lives there, etc.), judged by `fs.realpathSync` on both sides; (2) in a worktree `ootb()` is the worktree, not `~/bim-ootb`;
  (3) env overrides win (`BIM_COMPILER_ROOT`, `SHED_RAW_DIR`) in a child process; (4) red controls: an unknown input name throws; `need()` on a missing path throws `MISSING input …`;
  a module found in none of the three places throws naming all three. INCONCLUSIVE when a measured root does not exist on this machine (a CI runner): that row is NOT-JUDGED, never PASS.
  Verdict line: `§PATHS roots= judged= same= env_override= red= verdict=`.

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
| Core-purity squiggle: `Date.now()` in a core file | "Am I breaking determinism?" | W-CORE-PURE rule (A3) | A ✅ · **built 2026-11-17, §F.35 (bim-ootb #3209)**; the scan lives in bim-ootb `scripts/lib/core_pure.js` |
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
DECIDED F-1 (2026-11-16, *"Agree with you"*): does Fetch back run a headless browser for the boot `§` lines, or only HTTP + version + hash? Proposal: HTTP + version + hash by
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
| **preview/canary deploys** (a per-PR preview URL before production) | see it live before users do | **Not adopted yet: bim-ootb has no preview host.** Pages serves only `main` (§F.2 Deploy). `deploy/dev/` is bim-compiler's own object-storage dev tree, not a bim-ootb preview. Until the owner picks one, the preview is **Run local** on the PR branch. A hosted preview was OPEN DECISION F-7: **DECIDED 2026-11-16, owner *"agreed"*** (to: no preview host for now; Run local on the PR branch is the preview; revisit only if a PR needs someone else to see it) |
| **real-user monitoring** | perf from real users | **not adopted: the app is local-first and air-gapped, so no phone-home.** Instead a local *flight recorder*: the user can export their own `§PERF` lines on request |

**The perf-impact monitor ("what will this cost if deployed"):** shown in the PR and in the X0 panel *before* merge, in three tiers:
1. **Static, always (no browser, deterministic):** boot bytes and precache bytes per app, diff vs `main`; files moved between boot and lazy;
   new geometry passes without a cost `§` line.
2. **Model estimate, always:** for a change that adds geometry, the vertex delta on the reference buildings (from the cached runs, like
   `~/.cache/bim4d/`) times the measured fit **heap ≈ 0.173 GB per million vertices** (`docs/BrowserScaleBenchmark.md`, r = 0.997 over 3 buildings, "treat as
   indicative"). Shown as an estimated peak heap per building, against a phone line (the PERF BUDGET's *unverified* ~0.6 GB / ~4 M verts per tab).
3. **Measured, only with the owner's go:** headless boot of the reference pages on the PR build vs `main`: time to `§INIT`, `performance.memory` heap,
   draw calls, verts. A regression beyond the threshold (F-2, decided below) flags the PR, and the history (above) bisects it. Never run beside a live
   session's GPU work.
**Witness `W-PERF-IMPACT`:** fixture PRs where (a) a boot script is added → boot bytes rise by exactly that file's size, (b) a lazy module is moved to
boot → flagged, (c) a planted +1 M-vertex pass → estimate rises by ≈ 0.17 GB. **Red control:** a change with no cost must show zero delta.
**DECIDED F-2 (2026-11-16, owner *"agreed"*,** to: pick no numbers now; every X0-lane PR prints its "Cost if deployed" for two weeks, **until 2026-11-30**, then each ceiling = the observed level plus a small margin; the reference buildings are the three in `BrowserScaleBenchmark.md`, named by role). **How the numbers are collected:** CI cannot measure it, because `deploy_cost` needs VS Code's TypeScript, and on the runner it is INCONCLUSIVE (§F.24 FINDING). So the PR author runs `node -e` `deploy_cost.measure` (or *X0: Cost if deployed*) locally against `main` and pastes the `§PERF_IMPACT` lines into the PR body. On 2026-11-30, read those PR bodies and propose the ceilings to the owner. **The original question:** the budgets: per-app boot-bytes ceiling, allowed heap growth per PR, `§INIT` time regression threshold, and which reference
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
**Open in F:** no decision. The F-2 ceilings are due 2026-11-30 (§F.3); the F-1 headless Fetch-back button is unbuilt (§F.2).

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
| F.21 | `dxf2bim_cli.js --trace`: which line built each body (OFF by default, ops unchanged; F-14, F-15) · the Modeller canvas hover, **V** opens VS Code | #3043, #3047 | `§DXF_TRACE_W VERDICT PASS bodies=512 keys=11 fail=0` · W-DXF-HOVER `VERDICT PASS` |
| F-16 | ERP legacy-parity gate in `scripts/bump.js` (block on a NEW mismatch; `scripts/bump_parity.json`; `--no-parity "<reason>"`) | #3050 | `§BUMP_PARITY_W_VERDICT PASS judged=14` |
| F.22 | ERP field hover: every layer in firing order, owner@rank, Java origin; **Alt+1-9** opens a layer (F-17) | #3055, #3057, #3059 | `§ERP_HOVER_W VERDICT PASS fail=0` (`fields=12323 wrong_line=0 unported=199`) |
| F.23 | BIM provenance hover: a body's layers in the order they happened (F-18) | #3064, #3069 | `§BIM_LAYERS_W VERDICT PASS fail=0 inserts=511 cuts=2` |
| F.24 | the node-only X0 witnesses in CI's fast checks (ADVICE C1) | #3090 | `§X0_CI checked=3 verdict=PASS` |
| F.25 | the installed X0 copy knows when it is stale (source hash at pack time, ADVICE C2) | #3092 | `§X0_STAMP_W … checks=10 failed=0 verdict=PASS` |
| F.26 | *New witness for this file*: a skeleton that FAILs until a person fills the population and red control | #3100 | `§X0_NEWWIT_W … checks=12 failed=0 verdict=PASS` |
| F.27 | fix: the `§` tag grammar dropped everything after a hyphen (3,847 tags misread) | #3099 | `PASS tag grammar reads §CRUD-PERSIST … whole` |
| F.28 | hover, F12 and warnings for message keys and door verbs (F-19) | #3103 | `§X0_CATALOG_W … checks=11 failed=0 verdict=PASS` |
| F.29 | *Deploy main now* from this machine (replaces F-12 step 2; a bot merge starts no Pages deploy) | #3106 | `§X0_DEPLOY_W checks=10 failed=0 verdict=PASS` |
| F.30 | fix: the parity gate judged the shared checkout, not the tree it bumps | #3112 | `W-BUMP-PARITY judged=14 failed=0` |
| F.31 | browser memory of the three pages in VS Code (F-20..F-22); X0-lane PRs paste `§HEAP_IMPACT_DELTA` beside `§PERF_IMPACT` | #3131 | `§HEAP_W checks=12 failed=0 runs=3 verdict=PASS` |
| F.32 | the parity gate runs only the bridge witnesses that read the bumped tree (~5.5 min, was a 25-min timeout) | #3154 | `§BUMP_PARITY_W_VERDICT PASS judged=17 failed=0` |
| F.33 | the gate also runs the changed file's own witnesses, new failures only (F-23, 10-min budget F-23b) | #3159 | `W-BUMP-PARITY PASS judged=21 failed=0` |
| F.34 | the Bump button: background check, solid when it passes, one press to write (F-24); fix for a loader + its lazy module, #3204 | #3162, #3204 | `§X0_BUMP_BUTTON checks=6 failed=0 verdict=PASS` |
| F.35 | the core-purity warning in the editor, the same scanner as W-CORE-PURE (`scripts/lib/core_pure.js`) | #3209 | `§X0_CORE_PURE_W core_files=125 tracked_js=3395 judged=9 failed=0 verdict=PASS` |

**Not built, and why (do not start these without what they wait for):** the lazy/boot badge, the line-1 summary, "run the witnesses for
this file" and the owner warning wait for the data of parts B, D, E. The F-1 headless Fetch-back button is unbuilt (the browser-run go was given
2026-11-16). Budgets wait for the F-2 date (2026-11-30). DEV_TOOLKIT's runtime-debug slice needs a browser run.

**F decisions answered, in the owner's words (the full exchanges are in the archives):** F-3 *"Both."* → the facts server, OFF by default;
later (a) too · F-4, F-5 by DEV_TOOLKIT §8/§10 · F-6 *"go for one click"* · F-8 *"advice me and proceed"* → own providers, no TypeScript
plugin · F-9 closed "not next", then built as F.12b once logs were stamped · F-10 and F-11 *"Go with your advice."* · F-12 *"Both."* (step 1
applied on *"yes do it"*; step 2 withdrawn by the owner 2026-11-16 for the Deploy button, §F.29) · F-13 *"ok"*, then *"Follow your yes advice."* ·
film 1 *"Past film is OK as it delivers the idea."* · film 2 *"This one again is a conceptual idea. Proceed."* · F-14 Modeller canvas first, F-15
*"go with (b)"* (§F.21) · F-17 *"Go with your layering tool tip idea"* (§F.22) · F-18 (§F.23) · F-19 *"Go"* (§F.28) · **F-1** *"Agree with you"*
(plain HTTP + version + commit by default, the headless check only as a separate button) · **F-2** *"agreed"* (observe until 2026-11-30, then
ceilings = observed + margin; §F.3) · **F-7** *"agreed"* (no preview host; Run local is the preview) · F-20..F-22 as recommended (§F.31) ·
F-23 (§F.33) · F-24 the Bump button (§F.34) · **F-25 (2026-11-18): an `x0` terminal command, its OWN help, NOT a fourth group beside `bim`/`mis`/`erp` in the `red1` help.** Asked: owner *"x0 terminal CLI sounds good, will it add to the Help besides bim/erp/mis with 'x0'?"*; advice: no, because the `red1` help (`common/door/words_core.js`) is loaded by `erp/idempiere.html`, `viewer/viewer.html`, `modeller/modeller.html` and their `sw.js` (measured 2026-11-18), so an `x0` group would ship dev tooling to every user (minimalism §13); x0 needs repo files a browser does not have; the `red1` help is the CLI and message lanes' (Student level, 6 languages). Instead: `x0 help` with the same layout, `x0 where|uses|tag|context|pure|bump`, the SAME lib as the X0 Navigator and the facts server (one implementation), in `devtools/`, loaded by no page, listed in Developer Guide §4.1. Owner: *"Agreed"*.


**§F.36 BUILD SPEC — the `x0` terminal command (F-25; 2026-11-18, tenth session).** Owner F-25: an `x0` command with its OWN help, not a group in the `red1` help.
- **One implementation:** `devtools/mcp/x0-facts/server.js` exports its `TOOLS` (each `{name, run}`) when required, and starts its stdin loop only when run as the server
  (`require.main === module`); `devtools/x0/x0.js` maps verbs onto those tools and prints the same text the MCP `tools/call` returns. Verbs: `x0 where <field>` (where_is_field_set) ·
  `uses <field>` (where_is_field_used) · `tag <§TAG>` (what_is_tag) · `loaded <file>` (how_is_file_loaded) · `cost <file>` (cost_if_deployed) · `last <§TAG>` (last_logged_value) ·
  `context <file>` (context_for_file) · `check [base]` (ship_check) · `pure` (runs `erp/tests/witness_core_pure.js`, prints its verdict line) · `bump …` (runs `scripts/bump.js …`, args passed as given).
  `x0 help` prints the `red1 help` layout: one header line, one row per verb (verb · what it answers · a typed example), one footer line; `x0 help <verb>` = that verb's tool description.
  Unknown verb → the help on stderr, exit 1. `--root` / `--compiler-root` as the server takes them.
- **Minimalism:** dev-side only, in `devtools/`, plain node, no npm, named by no page, loader or `sw.js`; read-only except `bump` (which is `bump.js` itself); no network module.
- **Witness W-X0-CLI** (`devtools/x0/tests/witness_x0_cli.js`): (1) for every tool verb, `x0 <verb> <arg>` stdout = the text the facts server returns over stdio JSON-RPC for the same
  tool and argument (the server is spawned, not required: the protocol path is the independent side); (2) `x0 help` lists every TOOLS entry (none missing, none extra) plus `pure` and `bump`;
  (3) `pure` prints the W-CORE-PURE verdict line; (4) red controls: an unknown verb exits 1 with the help on stderr; a planted extra tool in a copy of the TOOLS list would show as "missing
  from help" (the help is generated from TOOLS, so the check reads TOOLS from the spawned server's `tools/list`); (5) `x0.js` and its folder are named by no page / loader / `sw.js` and
  require no network module. Verdict: `§X0_CLI verbs= same= help_rows= red= verdict=`. Listed in Developer Guide §4.1 after the build.


**F-26 (asked by the owner 2026-11-18, tenth session): Claude Code token use beside the URL load size, with a history and a session-end summary.** Owner: *"note whether token usage
during VSC usage with Claude Code is kept track with the URL load size.. can track history too so that each session end user can see some session summary"*.
Measured: **not tracked today.** Tokens: Claude Code itself records `usage` per reply in its local transcripts (`~/.claude/projects/<repo>/<session>.jsonl`; 165 for bim-compiler);
this session (`48fd266f…`, 2026-11-17T18:05Z → 11-18T02:04Z): `replies=218 input=482 cache_write=491161 cache_read=53622360 output=162371`. Nothing in X0 reads them (`devtools/`: 0 matches).
URL load size: X0's `cost_if_deployed` computes it on demand from the diff; no history. Design (open, one question at a time): a dev-side `x0 session [last|<id>]` that reads the transcript
(tokens, time span) and the session's git changes (`cost` = bytes added to what users load, PRs, witnesses run), appends one line per session to `~/.cache/bim_x0/sessions.jsonl` (history),
and prints a short summary at session end; local files only, no network, no model call, no money figures (no invented prices).


**F-26 decision (2026-11-18):** asked where the summary appears (terminal at session end + an `x0` command / an X0 panel / both). Owner: **"Terminal + x0 command (Recommended)"**.
**§F.37 BUILD SPEC — `x0 session` (F-26).** Dev-side, in `devtools/x0/` (no page, no network, no model call, no money figures).
- **Reads only local files:** the Claude Code transcript (`--transcript <path>`, the `transcript_path` a hook passes on stdin with `--hook`, or `last` = the newest `*.jsonl` in
  `~/.claude/projects/<cwd with / → ->/>`). Tokens = per-reply `message.usage`, each reply counted once (by `message.id`): input, cache write, cache read, output; replies; model(s); first → last timestamp.
- **What the session shipped:** PR links (`github.com/<owner>/<repo>/pull/N`) found in the session's tool output, by repo; witness scripts it ran (distinct `witness_*.js` in its shell commands).
- **URL load size:** for each bim-ootb PR, its squash commit on the local `origin/main` (subject ends `(#N)`, as of the last fetch); X0's `deploy_cost` measures that commit against its parent:
  per app, start-up bytes delta and offline-cache bytes delta, summed over the session's commits. A PR not on the local `origin/main` is listed `not merged (as of last fetch)`.
- **History:** one JSON line per session in `~/.cache/bim_x0/sessions.jsonl` (a re-run replaces its line); `x0 session history [N]` prints the last N.
- **Terminal at session end:** a `SessionEnd` hook in the owner's local Claude settings runs `node <bim-ootb>/devtools/x0/x0.js session --hook` (shape per the Claude Code hook docs).
- **Witness W-X0-SESSION:** a synthetic transcript with known numbers (two streamed copies of one reply must count once; a PR link; two witness runs) → exact totals; a temp git repo with a
  squash commit `(#7)` growing a precached file by a known number of bytes → that delta; history replace-not-append on a re-run; red controls: a reply counted twice and a PR missing
  from `origin/main` must be reported, not hidden. Verdict `§X0_SESSION_W … verdict=`.


**§F.37 RESULT — ✅ built 2026-11-18 (bim-ootb #3266).** `node devtools/x0/x0.js session last | history [N] | --transcript F | --hook`. W-X0-SESSION `checks=8/8 verdict=PASS`
(mutation: reply dedupe off → `6/8 FAIL`); local-only like deploy_cost (needs VS Code's TypeScript). First real run (this session): `179 replies · out 201.0k · cache read 48.4M ·
cache write 489.5k · 9 PRs · URL load modeller start-up ±0 B, offline +183 B` (the B1 marker comments). **Hook:** the Claude Code docs (hooks page) say a SessionEnd hook's stdout and
JSON `systemMessage` are discarded; only stderr on exit 2 reaches the user, default timeout 1.5 s. So `--hook` prints to stderr and exits 2; installed in the owner's `~/.claude/settings.json`
as `SessionEnd`, timeout 30 s, guarded (`[ -f ~/bim-ootb/devtools/x0/x0.js ] || exit 0`); it shows once `~/bim-ootb` has pulled #3266. Pipe-tested: 0.14 s, exit 2, summary on stderr.

**E1 BUILD SPEC — the `PROVES:` line, the result cache, the proof map (2026-11-18, tenth session; from E-1 and E-2).**
- **`witness_kit/proves.js`:** reads a witness's leading comment block for `PROVES: <repo path>[ <rule ids>], …` (one line; several lines add up). Returns `[{file, rules}]`.
- **`witness_kit/results.js` (E-2):** `record(witnessFile, {verdict, seconds, line, exit})` writes `~/.cache/bim_witness/<repo-relative path with / → __>.json` = `{file, verdict, line, exit, seconds, head, at}`
  (`head` = `git rev-parse HEAD` of the tree run). `verdict` = the last `verdict=WORD` / `_VERDICT WORD` in the output, else `PASS`/`FAIL` from the exit code, marked `from_exit`.
  Written by the two runners that already spawn witnesses and know exit + time: `tests/run_witness_suite.js` and `modeller/tests/run_all_witnesses.js` (one call each, no behaviour change).
  A witness run by hand is not recorded (said in the map, never guessed).
- **`scripts/gen_proof_map.js <app>`** (dev-side, prints; `--out FILE` outside the tree): per module of `<app>/modules.json`: **proven by** (witnesses whose `PROVES:` names it) · **named by** (B1's extracted
  `witnesses`, shown as weaker) · each with its last cached verdict and `stale` when the module or the witness changed since that run's `head`. INCONCLUSIVE is never shown as PASS.
  `§PROOF_MAP app= modules= proven= named_only= unproven= proves_lines= bad_paths= cached= stale=`.
- **W-PROOF-MAP** (`scripts/tests/witness_proof_map.js`): every module is proven, named-only or listed unproven (none lost); every `PROVES:` path exists (red control: a planted line naming a missing
  file → FAIL naming it); a cached INCONCLUSIVE shows as INCONCLUSIVE (red: a fake cache entry); a witness changed after its cached run shows stale.
- **Modeller batch (E-1 "the modeller first"):** a `// PROVES: <module>` line goes into each witness that is NAMED after a modeller module (`witness_<basename>…`) AND loads it (B1's link) — measured:
  13 modules, 16 witness files. No other witness is edited by guess.

**E1 RESULT — ✅ DONE 2026-11-18 (bim-ootb #3272 → `6cd994b5`).** `witness_kit/proves.js`, `witness_kit/results.js` (written by `tests/run_witness_suite.js` and `modeller/tests/run_all_witnesses.js`),
`scripts/gen_proof_map.js <app>`, W-PROOF-MAP in CI. `§PROOF_MAP app=modeller modules=99 proven=13 named_only=62 unproven=24 proves_lines=15 bad_paths=0` · `§PROOF_MAP_W checks=7/7 verdict=PASS`.
Batch: 15 witness files got `// PROVES: <module>` (placed just before the ISSUE line, or as the first line of a `/** */` header); re-run: unchanged (`witness_team_versions.js` times out at 120 s on main too).
A witness run by hand is not recorded; the map says `no run recorded`.

**CI COVERAGE GAP (reported by session bim-compiler-9b, re-measured here 2026-11-18 on bim-ootb main):** 1,512 witness files; **21 run in CI** (17 named across the workflows + the 4-witness X0 loop) = 1.4%.
`npm test` = `tests/run_witness_suite.js` (every `viewer/tests/witness_*.js`; headless class gates, browser class report-only, KNOWN_RED list) is not run in CI. The 0.000 mm Rosetta geometry
witnesses and bim-compiler's RosettaStoneGateTest run before commit by habit only. Already written in `docs/VibeProgramming.md` (#933) and `prompts/FILM_VIBE_CODING_LEDGER.md`. Belongs to Part E
(one runner). Measured for the decision: `tests/run_witness_suite.js` = 289 headless + 38 browser viewer witnesses; one local run on main `2a6371e2` (nice 19) finished **5 of 289 in ~25 min**
(the 4D witnesses sort first, up to 150 s each) and was stopped; a runner also lacks the untracked building DBs.
**CI-TIER decision (2026-11-18):** asked fast tier on every PR / nightly full run / both / leave as is. Owner: **"Fast tier on every PR (Recommended)"**.
**CI-TIER BUILD SPEC (after E-2's cache exists):** (1) E-2's `witness_kit` result writer records each run's verdict AND wall seconds in `~/.cache/bim_witness/<witness>.json`; (2) `scripts/gen_ci_tier.js`
(dev-side) writes the committed list `tests/ci_fast_tier.json` = every headless witness whose last local runs were PASS in under 10 s and that needs no untracked input (no `MISSING input` /
ENV in its last run), with its measured seconds; (3) one new CI job runs that list through `tests/run_witness_suite.js` (its KNOWN_RED and flaky rules), job budget 10 min, and names every
witness it skipped; (4) W-CI-TIER: the list equals what the generator writes from the cache (no hand edits), a planted slow witness is left out, a planted red one fails the job (red control).
Heavy and DB witnesses stay local (Bump gate, before commit); the list grows as witnesses get faster.


**F-27 (owner 2026-11-18): roll out the enhanced VS Code setup only after a from-scratch path is proven.** Owner asked: *"Does the guide shows 'How to Setup Developer Environment'?"* ·
*"Also a starting from scratch, ie 'How to Download and Run the Project from local machine'"* · *"Then we should already got a good enough enhaned VSC to roll out?"*. Measured: Developer Guide §3 has 6 steps,
no prerequisites, no clone link, no building-data step (building DBs are not in git); never walked from an empty folder. Asked what first; owner: **"From-scratch witness, then guide (Recommended)"**.
**§F.38 BUILD SPEC — W-FROM-SCRATCH** (bim-ootb `scripts/tests/witness_from_scratch.js`, dev-side, no second clone): S1 prerequisites (node, python3, git, `code`, a Chromium — versions printed) ·
S2 the download = exactly what GitHub "Download ZIP" gives (`git archive origin/main`) into an empty temp folder: files, bytes, LFS pointer files counted · S3 serve it with `python3 -m http.server`
(Guide §3 step 3) · S4 open `viewer/viewer.html`, `erp/idempiere.html`, `modeller/modeller.html` headless: HTTP failures, console errors, outside hosts contacted, and what a newcomer sees with no
building · S5 X0: `node devtools/vscode/pack.js` in the download, install into a throwaway `--extensions-dir` (never the owner's profile) · every failure is a GAP line (`§FROM_SCRATCH_GAP step= what=`),
never hidden. Verdict PASS only when every step ran; the gaps are the guide's to-do list. Then Developer Guide §3 becomes "Start from scratch", written from that run.


**§F.38 RESULT — ✅ 2026-11-18 (bim-ootb #3280; Developer Guide §3 rewritten "Start from scratch", live, fetched back).** `§FROM_SCRATCH steps_ran=5/5 gaps=2 verdict=PASS`:
download 4,798 files / 541 MB / 0 LFS pointers · ERP and Modeller: 0 failed requests, 0 console errors, no outside host · viewer: opens the Duplex (`1,118/1,118`) only after its local
`viewer/buildings/Duplex_*.db` 404 (not shipped) and it loads them from OCI — **first viewer run needs the internet** (the guide says so) · the viewer also loads GoatCounter (`gc.zgo.at`;
guide: `?ignore-me`) · X0 packs and installs from the download into a throwaway `--extensions-dir`. **Rollout readiness (owner's question):** the from-scratch path is now proven and written;
open before announcing: the owner's own read-through (`~/VSCcheatsheet.txt`). Offline buildings: **no sample in the repo needed** — owner 2026-11-18: *"the landing page already has buildings the user can download and save DB to access by local code in VSC. Just add a note"* → guide §3 now says: Save Building (Ctrl+S) → put the `.db` in `viewer/buildings/` (git-ignored) → `viewer.html?db=buildings/<name>.db`.

**CI-TIER RESULT — ✅ 2026-11-18 (bim-ootb #3274 → `ac718b1b`).** `tests/ci_fast_tier.json` = 40 modeller witnesses (local < 10 s, PASS, no outside input), 39 excluded with measured reasons
(probe without outside inputs: 31; first runner pass: 8 — marked shed sheets under ~/Videos, ~/bim-compiler/node_modules, a bim-compiler page, e2e_harness = a browser). CI now runs 61 of 1,512
witness files (was 21). Grow it: run a runner (`modeller/tests/run_all_witnesses.js`, `npm test`) so the cache fills, then `node scripts/gen_ci_tier.js --write --probe`.

**§F.39 SPEC — `node scripts/setup.js`, one command from a ZIP download to a working dev setup** (bim-ootb issue #3297; owner 2026-11-18: *"it seems complicated, too much typing. Can't we have a ready setup script?"* and *"setup.js must also set up the VS Code side, not only the tools"*).
**Baseline, measured 2026-11-18** (`git archive origin/main` into a temp dir, no `node_modules`, no `.git`): `gen_manifest.js --check modeller` exit 1 (`Cannot find module …/node_modules/espree`, `scripts/lib/page_refs.js:12`) · `bump.js` exit 1 (same, it loads gen_manifest) · `gen_proof_map.js` exit 1 (`git ls-files`: not a git repository) · `x0.js where camera` exit 0 · `pack.js` exit 0. Developer Guide §3's sentence "npm install only for lint and browser witnesses" is wrong for these tools.
**DECISION (mine, owner may overrule): remove what is incidental, fail clearly on what is real.** (a) git is incidental: three tools call `git ls-files` only to list the repo's files; bump.js already has a walk fallback. ONE helper `scripts/lib/tracked_files.js` (git when the folder is a git tree, else a walk that skips `node_modules`, `.git`, `dist`) replaces the three call sites and bump.js's private copy (deletion budget: the copy goes). No `git init` in a user's folder: it would invent a repository they did not ask for. (b) espree is a real dependency of the parser the manifest uses, not incidental: `setup.js` runs `npm ci` (the lockfile's exact versions, deterministic; also gives lint + sql.js for the node witnesses), and `page_refs.js` replaces the stack trace by ONE line naming the fix: `§NEED_DEPS espree is not installed: run  node scripts/setup.js`.
**WHAT IT DOES (idempotent; one `§SETUP_<step>` line per step; the last line `§SETUP steps=N ok=N gaps=M verdict=PASS|FAIL|INCONCLUSIVE`):**
S1 `§SETUP_PREREQ` node (>=18) · npm · python3 · code (path or `missing`). S2 `§SETUP_DEPS` `npm ci --no-audit --no-fund` unless `node_modules/espree` exists (then `skipped=present`). S3 `§SETUP_TOOLS` runs, in the folder, `gen_manifest.js --check modeller`, `gen_proof_map.js modeller`, `bump.js modeller/arc_editable.js` (dry run) and reads their own verdict lines: a tool that fails is a GAP naming its first error line, never a PASS. S4 `§SETUP_VSC code=<path|missing> x0=installed|skipped eslint=recommended|installed|skipped tasks=N snippets=N launch=Y|N mode=throwaway|user ext_dir=<path>`: `node devtools/vscode/pack.js` then `code --install-extension <vsix> --extensions-dir <ext_dir>`; `tasks`/`snippets`/`launch` are counted from `.vscode/tasks.json`, `witness.code-snippets`, `launch.json` (JSONC read); `eslint` is the id in `.vscode/extensions.json` recommendations. S5 `§SETUP_NEXT` the one line to serve and the one line to open.
**FLAGS:** `--install` (the ONLY way the user's own VS Code profile is touched: X0 and every recommended extension go into the user's normal extensions folder; the recommended ones come from the Marketplace, so this is the one step that uses the network beyond `npm ci`) · default = a THROWAWAY extensions folder `<folder>/.setup/vscode-ext` (git-ignored) and no Marketplace call · `--open` runs `code [--extensions-dir <ext_dir>] <folder>` (in the throwaway mode the window sees X0 and nothing else of yours) · `--serve [port]` runs `python3 -m http.server` (default 8000) in the foreground and prints the three app URLs · `--no-x0` skips pack/install · `--dry-run` prints what each step would do and changes nothing (`verdict=DRY`). If `code` is missing: a `§SETUP_GAP step=S4 what="VS Code's code command is not on PATH" fix="VS Code: Command Palette > Shell Command: Install 'code' command in PATH (or install from https://code.visualstudio.com)"` line, and the verdict is FAIL only when the user asked for VS Code (`--install` / `--open`), otherwise the gap is reported and the tools part still counts.
**MUST NOT:** touch `~/.vscode`, the user's `--user-data-dir` or extensions without `--install` · call the network except `npm ci` (+ the Marketplace under `--install`) · run `git init`, `git add`, or write outside the folder (`node_modules`, `.setup/`, `devtools/vscode/dist/`) · add a dependency, a build step or TypeScript (EDITOR_MAINTAINABILITY_STUDY §13).
**WITNESS W-SETUP** (`scripts/tests/witness_setup.js`; each check names the issue it proves; `--go` is required for the real VS Code stage, otherwise that stage prints INCONCLUSIVE, never PASS):
T0 *the documented fetch URL is alive*: `curl -sIL https://github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz` answers 200, read-only HEAD, recorded as `§SETUP_FETCH url= status=`; offline = INCONCLUSIVE, never PASS. T1 *a ZIP cannot run manifest/bump and says so in one line* (measured after the git requirement was removed: `proof_map` now works in a folder with no `.git`; `manifest` and `bump` stop with the ONE `§NEED_DEPS espree is not installed: run  node scripts/setup.js` line, exit 3, no stack trace; RED control: `--tree <the old main's download>` makes T1 and T2 to T8 FAIL, 14 of 17). T2 *setup.js fixes it*: after `node scripts/setup.js` the three tools exit 0 and their verdict lines read PASS / `bad_paths=0` / dry-run, in the same folder, with no `.git` in it. T3 *idempotent*: a second run prints `skipped=present` for S2 and the same verdict. T4 *never touches the profile*: with `HOME` pointed at an empty temp dir, nothing is created under it, and `eslint=recommended` (listed, not installed). **T4 found a real leak and it is fixed:** `code --install-extension` writes `~/.cache/Microsoft/DeveloperTools/deviceid` even with its own `--extensions-dir`/`--user-data-dir`; throwaway mode sets `XDG_CACHE_HOME=<folder>/.setup/cache` for every `code` call. T5 *VS Code side is what the files say*: the `§SETUP_VSC` `tasks=`/`snippets=`/`launch=`/`eslint=` equal an independent count of `.vscode/` read by the witness (6 tasks today). T6 *`--dry-run` changes nothing* (folder tree hash before = after). T7 *the missing-`code` gap is loud*: run with a PATH holding no `code`: a `§SETUP_GAP step=S4 … fix=` line, verdict FAIL under `--open`. T8 *clear error, no stack trace*: with `node_modules` removed, `gen_manifest.js --check` prints the one `§NEED_DEPS … node scripts/setup.js` line. T9 *the folder opens with X0 alive and the tasks listed* (real VS Code via the `devtools/vscode/x0-navigator/tests/realvsc` driver, `--go`, a temp `--user-data-dir`, the setup's own `ext_dir`): VS Code opens THAT folder, `bim-devtools.x0-navigator` is found and active, and `vscode.tasks.fetchTasks()` returns the same 6 task labels `tasks.json` declares. Verdict `§SETUP_W … verdict=PASS|FAIL|INCONCLUSIVE`. W-FROM-SCRATCH S5 then runs `node scripts/setup.js` instead of its own pack+install, and its gap list shrinks by what the script fixes.
**TERMINAL SEQUENCE (owner 2026-11-18: *fetch from a terminal without visiting GitHub, and a proper step-by-step from the terminal*; the repo is public, the anonymous tarball answers 200):** step 0 `curl -L https://github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz | tar xz && cd bim-ootb-main` · step 1 `node scripts/setup.js --open` · step 2 `node scripts/setup.js --serve` · step 3 the three app URLs. Prerequisites: node (18+), curl, tar required; python3 for `--serve`; `code` and git optional. **The tarball, not `git clone`, because** a GitHub archive carries no LFS objects, while a clone on a machine with git-lfs tries to smudge LFS pointers and the bandwidth quota is used up (CLAUDE.md NO-LFS HARD STOP); if a clone is documented it is `GIT_LFS_SKIP_SMUDGE=1 git clone …`.
**OPEN DECISION F-27 (owner; outward-facing, so NOT built): a published installer** (an npm package / `npm create`, or `curl … | sh`). **Recommendation: not now.** The tarball already needs two commands; a script piped from curl is a trust cost for the user, and a package under the project's name is a new public artefact to maintain and a name to defend. Revisit only if the two-command path proves too long for real newcomers (their own report, not a guess).
**GUIDE §3** becomes: download → `node scripts/setup.js` (add `--open`) → the VS Code side (folder, X0 in the Extensions list, Run Task list, the `witness` snippet, F5 launch, the X0 hover) → `viewer.html?db=` for offline. **FILM 4 must be rebuilt shorter around it:** beat 1 is the single typed line `node scripts/setup.js`, and the top frame is the REAL VS Code opened by the script (folder open, X0 in the Extensions list, the Run Task menu, a snippet, the hover), not mostly a terminal strip. The film is NOT rebuilt until the owner has reviewed/cut-listed the v1.

**§F.39 RESULT — ✅ 2026-11-18 (bim-ootb #3298 → `a2227c39`, issue #3297; spec PR bim-compiler #1007).** `scripts/setup.js` + `scripts/lib/tracked_files.js` + `scripts/tests/witness_setup.js` (+ `setup_vsc_suite.js`); +275/−36 lines (bump.js's private walk copy deleted; `gen_manifest`, `gen_proof_map`, `bump`, `manifest_source` use the helper; `page_refs.js` prints the one `§NEED_DEPS` line).
**Chosen for the tools:** git requirement REMOVED (it was incidental: ZIP and git trees give byte-identical `§MANIFEST_CHECK … identical=55/55 … verdict=PASS`), espree stays a real dependency installed by `npm ci` with a one-line error naming `node scripts/setup.js`. No `git init`.
**Green (`--go`, real VS Code 1.146):** `§SETUP_FETCH url=https://github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz status=200` · `§SETUP_W_VSC {"vscode":"1.146.0","folder":"<the download>","x0_found":true,"x0_active":true,"tasks":6}` · `§SETUP_W checks=20 pass=20 fail=0 inconclusive=0 verdict=PASS`. **Red control** (`--tree` = the old main's download, no setup.js): `§SETUP_W checks=17 pass=3 fail=14 inconclusive=1 verdict=FAIL`. The first green run FAILED T4 (`created=[".cache"]`): `code --install-extension` writes `~/.cache/Microsoft/DeveloperTools/deviceid` even with its own dirs; fixed with `XDG_CACHE_HOME` under `.setup/`, re-run 20/20. Other witnesses over the touched tools: `§MANIFEST_ROUNDTRIP … claims=13/13 … red=12/12` (C7/C9 skipped locally), `§PROOF_MAP_W checks=7/7 verdict=PASS`, `§BUMP_W_VERDICT PASS judged=7 failed=0`.
**W-FROM-SCRATCH on `main` after the merge:** `§FROM_SCRATCH_S5_SETUP exit=0 §SETUP steps=4 ok=4 gaps=0 verdict=PASS` and `§FROM_SCRATCH steps_ran=5/5 gaps=2 verdict=PASS` (the 2 gaps are the viewer's known `Duplex_meta.db` 404s, §F.38).
**Watch item hit again:** C15 (`witnesses` equal the extractor) failed CI on this PR because W-SETUP names a modeller file; fixed with `node scripts/gen_manifest.js --write modeller` (`modules.json`, 1 line). It will keep failing any PR that adds a witness naming a modeller file; the stated fallback (move the refresh into `bump.js`) needs the owner's word.
**Open for the owner:** F-27 (a published installer: recommendation not now) · the C15 fallback · the FILM 4 review/cut list, then the shorter rebuild around `setup.js` (resume block, FILM 4 REBUILD NOTE) · `--install` has been exercised only as far as the code path (the witness never touches a real profile by design).

**§F.40 SPEC — rename X0 / x0 to code-facts** (bim-ootb issue #3311; owner 2026-11-18: *"rename it to something plain like code-facts"*, after *"Why is it called x0?"*: "X0" was only a numbering label from the parked `DEV_TOOLKIT_NO_AI.md` series X1–X6, none built; this file's Part F first wrote "X0 Navigator" on 2026-11-13).
**Rename map** (one tool, one name; the verbs do not change):
| Was | Now |
|---|---|
| add-on "BIM DevTools: X0 Navigator", folder `devtools/vscode/x0-navigator/`, id `bim-devtools.x0-navigator` | "BIM DevTools: Code Facts", `devtools/vscode/code-facts/`, id `bim-devtools.code-facts` (publisher unchanged) |
| terminal command `node devtools/x0/x0.js <verb>` (+ `devtools/x0/session.js`) | `node devtools/code-facts/code-facts.js <verb>` (+ `devtools/code-facts/session.js`); not on PATH, as before |
| MCP server `devtools/mcp/x0-facts/` (`claude mcp add x0-facts …`) | `devtools/mcp/code-facts/` (`claude mcp add code-facts …`) |
| tags `§X0_*` (`§X0_CLI`, `§X0_SESSION`, `§X0_REALVSC`, `§X0_ACTIVATE`, `§X0_PACK`, `§X0_CI` …) | `§CODEFACTS_*` (NOT `§FACTS_*`: the film scripts already print `§FACTS`) |
| witnesses `W-X0-*`, files `witness_x0_*.js`, CI log `ci_x0_*.log` | `W-CODEFACTS-*`, `witness_codefacts_*.js`, `ci_codefacts_*.log` |
| env `X0_COMPILER_ROOT`, `X0_SESSION_HISTORY`; history file `~/.cache/bim_x0/sessions.jsonl` | `CODEFACTS_COMPILER_ROOT`, `CODEFACTS_SESSION_HISTORY`; `~/.cache/bim_codefacts/sessions.jsonl` (the owner's existing history file is moved once, not copied by code) |
| `§SETUP_VSC … x0=installed` field and the `x0_found/x0_active/x0_path` suite fields | `codefacts=installed`, `codefacts_found/_active/_path` |
**Not renamed, on purpose:** every `§FROM_SCRATCH*` tag and its `exit=` / `listed=` fields (the SYSNOVA UAT dry run judges them; only the extension id `listed=Y` looks for changes, to `bim-devtools.code-facts`); `§SETUP*` tags other than the one field above; `§F.xx` numbers; the verbs; `x0`/`X0` as geometry (`x0,y0` coordinates in drawing code: not this tool).
**History is left as it was written** (it says what was true then): `*.log`, `prompts/archive/**`, `CHANGELOG.md` (release-please output), dated RESUME / SESSION CLOSE entries, committed film outputs and `scripts/film_*` of films 1–4 until the film rebuild step. Each renamed README / guide section carries ONE line: *"formerly X0 (a numbering label from DEV_TOOLKIT_NO_AI's X1–X6)"* at its first mention. No compatibility shim for the old paths (§13 minimalism). The installed old extension `bim-devtools.x0-navigator` in a person's own VS Code stays until they uninstall it (reported, never touched by the rename).
**Witness W-CODEFACTS-RENAME** (`devtools/code-facts/tests/witness_codefacts_rename.js`; verdict `§CODEFACTS_RENAME checks= pass= fail= verdict=`; INCONCLUSIVE when it judged nothing):
 R1 *no live file still names the tool X0* — word scan (`X0 Navigator`, `x0-navigator`, `x0-facts`, `devtools/x0`, `x0.js`, `§X0`, `W-X0`, `witness_x0_`, `X0_`, `x0 <verb>`, the capitalised word `X0` outside the history allowlist and outside a geometry context) over `git ls-files`; the allowlist is a short list IN the witness file, each entry with its reason; a scan of an EMPTY population prints INCONCLUSIVE (§D0_VACUOUS rule). **Red control:** the same scan over the pre-rename commit must FAIL with the file count it finds.
 R2 *every renamed witness still gives its old verdict* — a table `before.json` (verdict lines of the 25 former W-X0-* witnesses measured on the pre-rename tree, committed under the witness's `fixtures/`) compared with the live run, tag-for-tag after mapping `§X0_` → `§CODEFACTS_`; a missing witness or a changed verdict word is a FAIL. **Red control:** a planted renamed verdict in a temp copy flips R2 to FAIL.
 R3 *the install path uses the new id* — `scripts/setup.js`, `devtools/vscode/pack.js`, `scripts/tests/setup_vsc_suite.js`, `witness_setup.js` and the `.vsix` manifest all carry `bim-devtools.code-facts`; no `x0-navigator` anywhere in `.setup/` of a fresh setup (W-SETUP T9 real VS Code: folder opens, Code Facts found + active, 6 tasks). **Red control:** the old id in a temp copy fails T9.
 R4 *no dead path* — `.github/workflows/*`, `tests/ci_fast_tier.json`, `modeller/modules.json`, `.vscode/*`, snippets, package.json scripts, Developer Guide links: every `devtools/…` path they name exists (`git cat-file`); `node scripts/gen_manifest.js --check` `verdict=PASS` (C15 refreshed if the witness list changed).
**Outside the repos (reported, not scripted):** the SessionEnd hook in the owner's `~/.claude/settings.json` (command string only), `~/.cache/bim_x0/` (moved once), the old installed extension. **The film:** FILM 4 is rebuilt as v4 around the new name AFTER v3 merges (the v3 agent owns `scripts/film_dev_setup/**` and the FILM 4 section meanwhile).
**Order:** spec (this PR) → bim-ootb PR 1 (renames + witness) → hook + cache dir + `ff-only` → Developer Guide text + `safe_gh_deploy.sh` + fetch back → resume block / memory pointer → film v4.

**§F.40 RESULT — ✅ 2026-11-18 (bim-ootb #3317 → `e049540e`, issue #3311; spec PR bim-compiler #1021).** X0 / x0 is now **Code Facts / code-facts**: add-on `bim-devtools.code-facts` ("BIM DevTools: Code Facts", `devtools/vscode/code-facts/`), command `node devtools/code-facts/code-facts.js <verb>`, server `devtools/mcp/code-facts/`, tags `§CODEFACTS_*`, witnesses `W-CODEFACTS-*`, env `CODEFACTS_*`, history `~/.cache/bim_codefacts/` (moved once). 65 files, +730/−465, 48 of them `git mv`.
**Build-time changes to the spec above:** the former witnesses number **20** (not 25) plus the real-VS-Code `run.js` and `install.js`; the terminal command typed in films and docs is `node devtools/code-facts/code-facts.js <verb>`, with a plain note for a shorter way (`node code-facts.js` from inside the folder, or the person's own shell alias; the repo adds none); the README/Guide first sentence is the owner's: *"Code Facts answers questions about this code from the repo's own indexes (where a name is written, what a tag means, how a file reaches users, what a change costs). Read-only, no network. Two forms: a VS Code extension and a terminal command."*; Guide screenshots (`docs/figs/x0/`, 14 files) keep their folder name and still show the old name inside the pictures (the Guide says so); the films and `scripts/film_*` stay as history (the owner moved the film rebuild to a separate agent, FILM 4 v4, section SCRIPT v4).
**W-CODEFACTS-RENAME:** `§CODEFACTS_RENAME checks=10 pass=10 fail=0 go=Y verdict=PASS` (R1 `files_judged=4416 old_name_lines=0`; R2c all 20 verdict words as recorded; R3 new id everywhere; R4 `gen_manifest --check verdict=PASS`, no dead path). **Red run** on the pre-rename tree (`--root` ce04a4d8): `checks=9 pass=3 fail=6 verdict=FAIL`, R1 `old_name_lines=326` in 58 files; R1c plants an old name and must count it.
**Before / after, the 20 former witnesses (verdict word):** mcp, appdef, bump_button, catalog, context, core_pure, deploy_cost, deploy, fresh, isolation, lens, newwit, refs, ship, stamp, taghover, session = PASS → PASS (17); activate = FAIL → FAIL (a stamped `§HOSTED_BEFORE_HOST` log now in `~/.cache/bim4d`, the red control no longer holds); cli = FAIL → FAIL (`check` verb text differs by 15 chars between server and command on this machine: `same=7/8`); heap_impact = INCONCLUSIVE → INCONCLUSIVE (no browser). The three non-PASS rows are the machine's state, identical before and after, and are NOT fixed here. **Real VS Code 1.146** (clean tree): `§X0_REALVSC … lens=Y … bump=N … verdict=FAIL` → `§CODEFACTS_REALVSC` identical field by field (the one-click-bump check fails the same way before and after); install `§X0_INSTALL … verdict=PASS` → `§CODEFACTS_INSTALL … verdict=PASS`. **W-SETUP** with the renamed add-on in a real VS Code: `§SETUP_W checks=20 pass=20 fail=0 verdict=PASS` (tasks=6, Code Facts found + active).
**Changed lines other lanes read:** `§SETUP_VSC … x0=installed` → `codefacts=installed`; `--no-x0` → `--no-code-facts`. **Unchanged:** every `§FROM_SCRATCH*` tag and its `exit=` / `listed=` fields (`listed=Y` now means `bim-devtools.code-facts` is in the throwaway extensions folder).
**Left as written (history):** bim-ootb `CHANGELOG.md`, `*.log`, the LOD-pill lane's dated "Built:" records (5 files hold an old name on purpose, each named in the witness's allowlist); bim-compiler 76 prompt/doc/script files that describe the X0 era (archive, dated entries, other lanes, films 1–4 scripts).
**Outside the repos:** the SessionEnd hook command in `~/.claude/settings.json` now runs `…/devtools/code-facts/code-facts.js session --hook` (only that string changed; dry `--hook` call exits 2 and prints the summary, as designed); `~/.cache/bim_x0/sessions.jsonl` moved to `~/.cache/bim_codefacts/`; `code --list-extensions` shows no old or new add-on installed in the owner's own profile (nothing to uninstall).

**§F.41 SPEC — W-VSC-OPERATIONAL: every operational entry point can be run from VS Code (owner 2026-11-18: *"update the prompt to check in future that all operational code can work from the VSC"*). SPEC; owner go 2026-11-19 (DECISIONS below).**
- **Claim (an invariant over a denominator, as the AD-LAYER LAW asks, never a hand-picked list):** of the N operational entry points of the bim-ootb download, M have BOTH (a) a route a developer can start from VS Code (a task in `.vscode/tasks.json`, a launch in `.vscode/launch.json`, or a Code Facts command) AND (b) a headless check that the route really starts it and prints its `§` verdict. Verdict `§VSC_OPERATIONAL entry_points=N routed=M run_ok=K gaps=N-M verdict=PASS|FAIL|INCONCLUSIVE`; PASS only when `routed=run_ok=N`; every miss is a `§VSC_OPERATIONAL_GAP entry=<name> what=<routed|run>` line, never hidden.
- **The denominator is DERIVED, never typed:** (1) every app page named by a `modules.json`/manifest app (today: viewer, ERP `erp/idempiere.html`, modeller = 3; `§MANIFEST_CHECK apps=3`); (2) every `package.json` `bin` (today: `red1`) and every `devtools/*` command (today: `code-facts`); (3) the runners the repo names in `package.json` scripts (today: `npm test` = `tests/run_witness_suite.js`, `npm run lint`) and the modeller runner `modeller/tests/run_all_witnesses.js`; (4) `scripts/setup.js` itself. The witness prints the derived list with its source for each row, so a reader can see what N is.
- **What exists today (measured 2026-11-18 on `origin/main`):** launch configs: Viewer / ERP / Modeller in Chrome + `Node: this witness / script`; tasks: Serve repo, Lint viewer, Lint as CI does, Run this witness, Run viewer witness suite, Regenerate editor indexes. **Known gap, to be found by the witness, not assumed:** the `red1` command line has no VS Code route; the modeller witness runner has none; no task runs `node scripts/setup.js`. Do not fix them in the spec: the witness reports them first (RED), then each gap is closed with the smallest task/launch entry.
- **Out of scope, said once:** the separate bim-compiler repo (Java compiler, prompts, bridge scripts) and the legacy iDempiere are not in the archive and are not operational code of the download; the in-app hover overlay is a dev tool loaded by bookmarklet, not an entry point.
- **Witness shape (each test names the issue it proves):** V1 *a new entry point added without a VS Code route is caught*: red run adds a fake page to a throwaway manifest copy, must FAIL with the gap line. V2 *a route that exists but does not start the thing is caught*: red run breaks a task's command in a throwaway copy, must FAIL on `run`. V3 *an empty derived population is INCONCLUSIVE, never PASS* (`§D0_VACUOUS` style). V4 *scope-blind guard*: the headless run must observe the entry's own verdict/URL answering (HTTP 200 for a page, exit 0 and a `§` line for a CLI), not just that the task file parses. Runs on a fresh `git archive` download after `node scripts/setup.js` (extends W-FROM-SCRATCH / W-SETUP; browser pieces headless on the CPU, one at a time).
- **STANDING RULE (the point of the request, "in future"):** any PR that adds an operational entry point (a new app page, a `bin`, a runner) must add its VS Code route in the same PR, and this witness is what fails otherwise; add it to the CI fast tier when it runs in under the tier's limit, else keep it local and list it in `tests/ci_fast_tier.json` with its measured reason. The Developer Guide §4 gets one line: "everything runnable is runnable from the folder you opened".
- **Cost, to measure before building:** the derived N today is about 3 apps + 2 commands + 3 runners + setup = about 9; each headless start is seconds; total expected well under the heavy-job budget, but measure, do not assume.
- **DECISIONS (2026-11-19, eleventh session).** **F-41 go:** asked "build it red first, it should report the three gaps"; owner: *"Agree"*. Measured before building
  (bim-ootb `020c9700`), the spec's own rule gives **39** entry points, not ~9: 20 app pages (every page of each manifest app: ERP 13, Viewer 5, Modeller 2), 2 commands
  (`red1`, Code Facts), 2 package scripts, 14 runners (`*/tests/run_*`, `scripts/run_*`: 5 `.js`, 9 `.sh`), `scripts/setup.js`; 6 have a NAMED route. **F-41-Q1, how to
  close the gaps:** asked: generic routes (one launch "This page in Chrome" for the open `.html`; "Run this witness" also runs `.sh`) + named tasks only for daily
  tools (`red1`, setup, the Modeller runner), the witness counting a generic route but listing generic-only rows apart (recommended) · or one named entry per
  entry point (33). Owner: *"Follow you."*
- **BUILD NOTES (from the decision and the measurement):** a route is NAMED (a task/launch whose command or url names the entry; the Code Facts extension for its
  command) or GENERIC (a `${file}`/`${relativeFile}` task or launch whose file kind fits). `routed` = named or generic; `§VSC_OPERATIONAL_GENERIC_ONLY` lists the
  rest. **run_ok**, judged headless: a page = HTTP 200 from the Serve task's own command (its port swapped for a free one, said in the line) for the URL its route
  opens; a command or runner = its route's command run with stdin closed, `run_ok` when it exits 0 or prints its own verdict/`§` line. **Never run by the witness**
  (machine safety, the lane's no-browser/GPU-without-go rule): a runner whose source launches a browser or a benchmark (`chromium`/`playwright`/`puppeteer`/
  `run_bench`) is `run=not-run reason=browser` and counts as INCONCLUSIVE for that row, never as PASS; long runners run with a timeout and count `run=started` when they
  printed their first line before it. `setup.js` runs with `--dry-run`. The download in V4 is a clean worktree of `origin/main` (tracked files = the archive's).

**§F.41 RESULT — ✅ 2026-11-19 (bim-ootb #3332 → `f2a34bf8`, issue #3330; spec/decision PR bim-compiler #1052).** +241 / −10 lines in 6 files
(`scripts/tests/witness_vsc_operational.js` new; `scripts/lib/jsonc.js` = setup.js's JSONC reader moved out, setup.js −8; `.vscode/tasks.json` +3 named tasks and
"Run this witness" runs a `.sh` with bash; `.vscode/launch.json` + "This page in Chrome (the open .html)"; `tests/ci_fast_tier.json` one exclude row). Logs read:
- **RED** (before the route edits): `§VSC_OPERATIONAL entry_points=39 (page:20 cli:2 script:2 runner:14 setup:1) routed=13 named=6 generic_only=7 run_judged=10 run_ok=10
  not_run=3 gaps=26 red=4/4 verdict=FAIL`.
- **After**, on a fresh worktree of `main` `f2a34bf8`: `routed=39 named=9 generic_only=30 run_judged=27 run_ok=27 not_run=12 gaps=0 red=5/5 verdict=PASS`, 88 s.
  `run=started` (killed at 30 s after printing): the Modeller runner; the 20 pages answer HTTP 200 from the Serve task's own command on a swapped port.
- **not-run, each with its reason (12):** `npm test` and both `run_bench*` (Playwright in the code), 6 `tests/run_history*`/`run_status_just`/`run_universal_history`
  (Playwright in the probe they call), `run_migration_lane.sh` (Chromium), `run_4d_gates.sh` (`cache_4d_run`), `run_regression.sh` (starts programs through a variable).
- **Red controls:** V1 planted entry with no route → gap · V2 every lint task given a bad option → `exit=2`, run fail · V3 empty → INCONCLUSIVE · V4 server on an empty
  folder → `http=404` · **V5** a run asking Playwright for a browser → `BLOCKED … Executable doesn't exist` (the backstop).
- **Found while building (fixed before the PR; nothing harmed):** (1) the first `setup` row put `--dry-run` on log_stamp's argument, so setup ran for real once in the
  worktree: `§SETUP_DEPS skipped=present` (no `npm ci`; the shared `node_modules`, reached through the worktree's symlink, unchanged since 2026-08-25), Code Facts
  packed into the worktree's own `.setup/` only; now only the `node …setup.js` call gets `--dry-run`, and no such call = not run. (2) `tests/run_regression.sh` passed
  the word scan (it calls `node "tests/$1"`), was started once and killed at 30 s; its first step is a Playwright probe; nothing of it was left running (no listener on
  its port 8150; the headless browsers seen afterwards belonged to another session's `witness_hq_box.js`). Since then: shell runners with a variable call are not run,
  every run is its own session killed whole (`timeout` moves its child to its own process group, so a group kill missed it), and browser paths are empty (V5).
- **Trap for this lane:** a worktree's `node_modules` symlink points into the shared checkout, so any `npm ci` started in a worktree would rewrite the shared installs.
- Unchanged: `witness_log_stamp` PASS (it replays the edited "Run this witness" command) · `witness_editor_zero_code` task/snippet checks identical to `main` (its
  workspace check is INCONCLUSIVE in `/tmp`, no `../bim-compiler` beside it) · `setup.js --dry-run` reads `tasks=9 launch=Y` · `witness_ci_tier` `committed=DIFFERS`
  exactly as on unedited `main` (local run cache).
- Not in CI: ~90 s against the tier's 10 s limit; listed in `tests/ci_fast_tier.json` `exclude` with that reason. Developer Guide §3 has the routes and the rule
  (put beside the task table, where a reader looks for them, not in §4).

**§B-3R SPEC — the `witnesses` field leaves `modules.json`; the extractor answers instead (owner B-3 REVISED 2026-11-19, Part B DECISIONS).**
- **Issue it fixes:** C15 (W-MANIFEST-ROUNDTRIP, in CI) fails every PR that adds a test whose text names a modeller-side file, until someone runs
  `node scripts/gen_manifest.js --write modeller` and commits the regenerated `modeller/modules.json`. Measured: 4 other-lane PRs paid that commit on
  2026-11-18. The stored list is a cache of `witnessesOf()` (`scripts/lib/manifest_source.js:195`) that every new test anywhere makes stale.
- **Change (bim-ootb):** (1) `witnesses` leaves `MOD_KEYS` and the schema; `init` and `refresh` stop writing it; every line of `modeller/modules.json` loses
  the key (written by the serializer, not by hand). (2) `witnessesOf()` stays the ONE extractor. Its callers: `check` (the `§MANIFEST_WITNESS_GAP` line,
  now from the extractor), `scripts/gen_proof_map.js` ("named by", now live), and a new `node scripts/gen_manifest.js --witnesses <file> [--app A]` that
  prints `§MANIFEST_WITNESSES app=A file=F n=N` then one witness per line (exit 1 with `§MANIFEST_ERR` when the file is no module of a source app).
  (3) C15 judges `owner` only; its line keeps `witness_gap=`. (4) A `witnesses` key typed back into `modules.json` is refused as not canonical (the schema).
  Code Facts is not changed in this step (its `context` text "not indexed yet" is a separate, later row).
- **Witness (each case names the issue):** W-MANIFEST-ROUNDTRIP new **R13** *"a test-only change fails CI"*: in a temp copy of the tree, add one test that
  names a modeller module and leave `modules.json` alone → C15 must stay ok (`owner_mismatch=0`) and the planted test must appear in
  `witnessesOf()` for that module. **Red on the old code:** the same plant on today's tree gives `witnesses_mismatch=1` (C15 FAIL). New **R14** *"the old key
  comes back by hand"*: a line with `"witnesses":[…]` added → `not canonical` fail. W-PROOF-MAP: its fixture `modules.json` drops `witnesses`; the named
  test must still show under "named by" (proves the proof map reads the extractor, not a stored copy). The `--witnesses` command: its output equals
  `witnessesOf()` for 3 modules, and an unknown file exits 1.
- **Must stay identical:** every generated page, loader and `sw.js` byte for byte (C8, C10, C11), `§MANIFEST_ROUNDTRIP … identical=55/55 … verdict=PASS`,
  W-BUMP, the proof map's "proven by" rows. Deletion budget: the PR states lines +/−; the stored field, its refresh line and its C15 half are removed.
- **Not in this step:** viewer/ERP manifests (B2/B3 simply never get the field), the `owner` field, Code Facts.

**§B-3R RESULT — ✅ 2026-11-19 (bim-ootb #3327 → `248cefdc`, issue #3326; spec PR bim-compiler #1043).** +164 / −129 lines (scripts +57 / −22; the 107 module lines of
`modeller/modules.json` each lose the key, nothing else: checked by `diff` against the old file with the key stripped; 55 KB → 39 KB). Logs read:
- `§MANIFEST_ROUNDTRIP … identical=55/55 driven=751/751 sw_vm=3/3 claims=15/15 red=15/15 order_check=PASS … verdict=PASS` (full run, C7 and C9 included; CI and
  `main` after the merge: `claims=13/13 red=15/15 … verdict=PASS` with the CI skips).
- **R13** `a test-only change (zz_r13/tests/witness_zz_r13_plant.js names common/comm/op_versions.js), modules.json untouched: extractor_sees_it=Y
  --witnesses_sees_it=Y owner_mismatch=0 witnesses_mismatch=0 check_fails=0`. **Red on the old code** (the new witness run in a worktree at the pre-change
  `origin/main`): `R13 detected=N … witnesses_mismatch=1`, `red=12/15 verdict=INCONCLUSIVE`. R13 builds a non-git temp folder of symlinks to the tree's
  top-level entries plus the planted test (so `tracked_files.js` walks it and the real tree is never written); the round trip went to ~31 s locally.
- **R14** `"witnesses":[]` typed back → `schema: … should NOT have additional properties`; **R15** `--witnesses` on a non-module exits 1 with `§MANIFEST_ERR`.
- `§PROOF_MAP_W checks=8/8 verdict=PASS` (new `named_live_not_stored`: the fixture stores no list; a test that names a file only in a comment is not counted).
- `--witnesses` (one-file call) equals the old stored list for **107/107** modules (`stored!=extractor 0`, `one-file!=all 0`).
- Unchanged: `§BUMP_W_VERDICT PASS judged=7 failed=0`, `§DEPS_W … agree=16/16 … verdict=PASS`, `gen_manifest --check … verdict=PASS`.
- **Not this change:** `witness_ci_tier` `committed=DIFFERS verdict=FAIL` here, the same on unedited `main` (the local run cache differs from the committed list).
- Live sessions told before and after (4D lane `fix/4d-ltu-zone-split`, Viewer export `feat/viewer-export-d` will touch the file: `git merge origin/main`, then
  `node scripts/gen_manifest.js --write modeller`, which drops the key). Nothing reaches the browser: C12 (nothing fetches `modules.json`), no `sw.js` change.

## ADVICE — from the session that built Part F, for the owner and the sessions that follow (2026-11-14)

Owner: *"Put in your advice as you know VSC and software better"*. **These are recommendations, not decisions.** A decision is only
what the owner answers; when he says "follow the advice" on an item, record that as his answer in that part's DECISIONS block.

**A. What to answer on each open decision, and why** (answered rows are removed; the answers are in each part's DECISIONS).

| Decision | Advice | Why |
|---|---|---|
| C-2 rename `A` to `APP` while moving | Yes, one module per PR | it removes the whole class of index faults that §F.17 found: the index has to GUESS which local name is the shared object |
| D-2 a namespace extended by several files | Allowed when the manifest marks it | forbidding it would force a refactor nobody asked for |
| E-2 keep the suite's verdicts | Yes, a small JSON per run, stamped like any log | the proof map can then show "last verdict" under the same provenance rule as values beside the code |

**B, C** (the work order, and three small things to do soon): done as advised (A first with B0 beside it; C1 to C3 = §F.24, §F.25 and the
bim-ootb #2974/#2975 correction comments). The text is in the archive.

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

**E. For a session that is not Fable.** Take ONE item of RESUME 1 per session. Read its section (here or in the archive) first. Write the
spec lines, then the witness with its red control, then the code. Quote only `§` lines you have just produced. When a check fails,
suspect the instrument before the product (it was the instrument about half the time here). When unsure whether something is yours to
change (an ERP file, the film and camera family), file the issue and leave the code.

---

## §ORDER — why A → B → D → E → F → C

A is the only part tied to correctness (replay, posting dates), and A0 is cheap and settles a real question. B removes a whole class of stale-file
mistakes and is the data source for D, E and half of F. D and E are small once B exists. F's first features needed nothing, so on the owner's word (2026-11-13) they went
first. C is long and best done slowly, module by module, after B/D make ownership visible.

## §READY — what a session can start with no owner decision (as of 2026-11-18)

| Part | Starts with no decision | Next decision to ask | Why that one |
|---|---|---|---|
| A | ✅ done 2026-11-17 (W-CORE-PURE in CI) | none | — |
| B | the B4-HASH spec (which bytes are hashed, how `CACHE_VERSION` follows) | none (B3-Q2, B3-Q3 ✅ 2026-11-21) | the B3-OUT spec: `index.html` + `capex/index.html` follow their apps' lists, gallery frozen, regex path deleted |
| C | nothing; waits on B and D | C-1 part names + owners | |
| D | nothing new; the multi-publisher list already exists (`types/globals.gen.d.ts`) | D-1 where the questions list lives | needs B's `owner` field |
| E | nothing; E0 done | E-1 the `PROVES:` header format | |
| F | the F-1 headless Fetch-back button (browser-run go given 2026-11-16) | none (F-2 ceilings on 2026-11-30) | |

Ask the owner **one decision per message, with the recommendation** (START HERE 2). The recommendations are in each part and in ADVICE A.

## §M — re-measure before quoting

| Number | Command (bim-ootb root) |
|---|---|
| APP fields / phantoms | `node scripts/gen_app_surface.js` → header of `internal/APP_SURFACE.md` |
| script tags per page | `grep -cE '<script[^>]+src=' viewer/viewer.html erp/idempiere.html modeller/modeller.html` |
| dev side vs deployed side (DeveloperGuide §0.1 diagram) | `bash <bim-compiler>/scripts/code_arch/size_stack.sh <bim-ootb tree>` → `§STACK_SIZE` lines. @`9b7d2f86` 2026-11-16: app_js 1,004 / 313,887 lines · witness_js 2,112 / 284,795 · witness_named 1,403 · precache viewer 268 / erp 403 / modeller 157, tests 0. Shipped-JS bytes: the deploy log's `§PAYLOAD-MIN-TOTAL` (`gh run view <id> --log`) |
| module lists per app (sites, versions that disagree, lazy vs precache) | `node scripts/gen_manifest.js --check` → `§MANIFEST_*` lines (2 s); the witness: `node scripts/tests/witness_manifest_roundtrip.js` (~1 min) |
| core purity (A-1 list) | `node erp/tests/witness_core_pure.js` → `§CORE_PURE files= forbidden= verdict=` (2026-11-17: 125 / 0 / PASS) |
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
- `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md`: this file before the first cut (2026-11-14). §F.0 to
  §F.20, the §VET pass and all owner exchanges of those days in full.
- `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-15_to_2026-11-18.md`: this file before the second cut (2026-11-18). Every
  Part A step, §F.21 to §F.35, the dated resume entries 0 to 0u and the STATUS table in full.

**§VET** (the 2026-11-13 vetting pass of every claim in this file) is in the 2026-11-13→14 archive. The STATUS table moved into RESUME 2.
