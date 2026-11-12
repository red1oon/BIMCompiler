# ⚠ DO NOT REMOVE — SCOPE: study only. Is bim-ootb easy to work on in an editor (VS Code/JetBrains) for a second developer? Gathers the specs that already exist, reviews an outside prompt, lists the gaps that are still open. No code changed. No Fable/agent run. Read the log after every run.

**Date:** 2026-11-13 · **Measured on:** bim-ootb `origin/main` @ `c421a957` (#2901), bim-compiler `origin/master` @ `66191f9c0`.
**Why this file exists:** the owner was given an outside "Editor-Maintainability Refactor Audit" prompt to hand to Fable.
Owner, 2026-11-13: *"Dont run in Fable yet.. just study and write up or gather from prompts/# specs concerning this area."*
**Who it is for (owner, 2026-11-13):** *"review the code for dev editor friendliness ie myself when i need to manually handle
the code without further Vibe assistance."* The reader is **the owner, editing by hand in VS Code with no AI**, not a new hire.
So the test for each item: *does this stop me finding, reading, changing or checking code by hand?* **Read §7 first**:
it is the hands-on list. §1–§6 are the first pass on the outside prompt.

---

## §1 What is already written down (read these first, don't redo them)

| Topic | Where | State |
|---|---|---|
| How the code loads, the `A`/`APP` god object, reading order, navigation cost, housekeeping | bim-ootb `internal/CodeScrapBook.md` §1, §2, §7, §8, §10, §12, §13 | written 2026-09-13/16 |
| "Go to definition" for the god object (all fields, `file:line`, phantoms) | bim-ootb `internal/APP_SURFACE.md` ← `scripts/gen_app_surface.js`, witness `tests/witness_app_surface.js` | regenerated `df13bf69` (2026-11-08) |
| VS Code setup: `jsconfig.json`, `types/erp-globals.d.ts`, tasks | bim-ootb PR #1896 (MERGED) | live |
| Splitting the 5 biggest viewer files (closure-split generator, byte-identical gates) | bim-compiler `prompts/VIEWER_FILE_SPLIT_PLAN.md`; tooling `scripts/split_closure.js`, `split_verify.js`, `viewer/tests/_split_families.js` | #1907 + #1914 MERGED. #1908/#1909/#1910 show CLOSED, but #1914 (`569817de`) carried the whole stack: `effects.js` is now 24 lines, `fx_*`/`maxq_*`/`tm_*` = 21 part files |
| Debug tools for a developer working without Claude (6 VS Code extensions) | bim-ootb `prompts/DEV_TOOLKIT_NO_AI.md` | PARKED 2026-10-06, spec only, nothing built |
| A reading path for a new developer + review guards | bim-ootb `prompts/SESSION_OPENER_READ_AND_REVIEW.md` §B, §C | written |
| Earlier length/seam work | bim-compiler `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S58/§S59 (incl. the PROTECTED-LANE ruling on `effects`/`cinema_path_editor`/`cinema_maxq`) | — |

## §2 Review of the outside prompt — where it is wrong for this codebase

1. **Its numbers are old.** It says "~208 modules" and "966 PRs in ~3 months". Those come from the README, and the README
   doesn't agree with itself (`README.md:109` says "140+", `:192` says "208 … through July 2026"). Measured today:
   **3,167 tracked `.js` files** (viewer 716, erp 810, modeller 635, common 119), and the PR counter is at **#2901**.
2. **Item 1 (import/require graph) would come back empty.** Only **4** files in viewer/erp/modeller use `import`/`export`.
   The dependency graph is the **`<script>` order in the HTML pages** plus the god object (CodeScrapBook §1, §2). An import map
   would show zero cycles and nearly all files as orphans: an empty result that looks like a clean pass. Ask for script-tag order plus `APP_SURFACE.md` instead.
3. **Items 2, 4 and 6 are mostly answered already** (§1 above). Run as written, it would spend tokens finding again what
   CodeScrapBook §10/§12 and VIEWER_FILE_SPLIT_PLAN already measured.
4. **It asks for GitHub fetches.** The code is local, so fetching is slower and can be stale. Point it at the local checkout and `git show`.
5. **It doesn't know the house rules:** every finding needs a `file:line` or a count, a result that judged nothing is
   INCONCLUSIVE, and the PROTECTED-LANE ruling (§S59). Without these it will propose splitting `cinema_path_editor.js`, the
   largest file and protected.
6. **The good part to keep:** item 5 (is bim-compiler still the parent?) and the closing bus-factor verdict. Both are new
   questions, and §3 below gives a measured start on them.

## §3 Gaps still open — measured today (sorted: most help for least risk first)

| # | Gap | Measured | Effort | Risk |
|---|---|---|---|---|
| G1 | **`jsconfig.json` doesn't include the modeller or common.** `include` = `erp/**`, `viewer/**`, `types/*.d.ts` only | modeller 635 js + common 119 + bim 24 + capex 68 + teams 67 get no cross-file go-to-definition | 1 h | none (editor-only file, never loaded by a page) |
| G2 | **The lint gate skips the ERP.** `eslint.config.js:31` covers `viewer/**` + `modeller/**`; it also ignores `viewer/ad_*.js` ("phases in flight", since 2026-10). CI `ci.yml:25` = `eslint viewer modeller`; `package.json` `lint` = `eslint viewer` only (doesn't match CI) | erp/ 810 js have no `no-undef` gate. `eslint viewer modeller` today: exit 0, 0 errors, 1 warning (log: scratchpad `eslint.log`) | ½ day (baseline the erp globals first) | low. CI-only, but a new red gate can block merges until the baseline is clean |
| G3 | **Two hand-kept lists of the same globals.** `eslint.globals.json` (206 names) vs `types/erp-globals.d.ts` (38 lines) | They will drift apart. Generate the `.d.ts` from the JSON | 2 h | none |
| G4 | **Fields read but never written are growing.** `APP_SURFACE.md` | 36 in production (2026-09-13) → **171 in production / 271 total** (2026-11-08). Each one is a dead guard or a deleted writer | days (one pass per module) | medium: touches running code. One module at a time, behind its witness |
| G5 | **Witnesses live in 5 places** | `modeller/tests` 368 · `viewer/tests` 317 · `erp/tests` 303 · `witness/` 203 · `tests/` 28. Plus `test/` (7 sample OBJ/HTML files) next to `tests/` | 1 day for a written rule on where new ones go; moving files is a change, not a tidy (CodeScrapBook H5: name-referenced in CI/scripts) | low for the rule, medium for moves |
| G6 | **Hard-coded paths to the owner's machine** | **636** `.js` files contain `/home/red1`, **349** of them `/home/red1/bim-compiler` (most in `*/tests`, `witness/`). DEV_TOOLKIT §9.1 counted 110 on 2026-10-06 | 1–2 days: one env/config resolver + a mechanical replace | medium: touches the witness chain. Verify each witness's verdict is the same before and after |
| G7 | **Small leftovers** | `out/` is now in `.gitignore:90`, but **16 files under `out/` are still tracked**. `poc/` = 1 html, `archive/` = 1 html, `sandbox/` = 44 files, referenced from `viewer/tools.js`, `viewer/gi_still.js`, `erp/tests/pilot_hosts.js` (so it is used, not a graveyard). Root `.js` down to 9 (was 217, H5 done) | 1 h (`git rm --cached out/`) | none |
| G8 | **README counts are stale and contradict each other** (`:109` vs `:192`) | — | 15 min | none |

**Closed since CodeScrapBook §12:** H3 (lint couldn't run): `node_modules/.bin/eslint` v9.39.4 runs on Node 18.19.1. H5 root clutter: 9 root `.js` files left.
Biggest files after the splits: `cinema_path_editor.js` 4,461 (protected) · `streaming.js` 4,408 · `scene.js` 3,904 ·
`schedule_author.js` 3,540 · `modeller/disc_walker.js` 3,507 · `erp/crud_overlay.js` 3,403.

## §4 bim-compiler — is it still the parent? (outside prompt item 5, first pass)
- **It is still active, but as a different kind of repo.** 1,790 commits since 2026-10-01; most changed paths are `scripts/` (21,601),
  `prompts/` (1,986), `build/`, `docs/`. Today it works as the lane for specs, migration, film and the docs site, not as the Java engine the browser calls.
- **The link between the two repos is file paths, not a written contract:** 349 bim-ootb `.js` files point at `/home/red1/bim-compiler` (G6).
  Rules and building DBs flow through migration SQL plus self-heal loaders (`CLAUDE.md` §DB CHANGES). Building schema:
  bim-ootb `schema/ootb-building-v1.sql` + `schema/README.md`; bim-compiler `docs/SQLite3D_Schema.md`, `docs/DATA_MODEL.md`.
  **UNVERIFIED** whether those two schema docs still agree. That check is the open half of item 5.

## §5 Verdict (study only)
**Marginal, not a bus-factor emergency.** The parts a second developer would hit first are covered: the god object has a
generated "go to definition", there is a reading path, the 11k-line files are split with byte-identical proof, and lint runs.
The things that would actually stop them on day one: (a) the witnesses assume the owner's machine (G6, 636 files),
(b) the modeller and ERP are outside the editor index and the lint gate (G1, G2), and (c) witnesses spread across 5 folders (G5).
G1, G3, G7 and G8 together take under a day and touch no running code.

## §6 If it is dispatched later
Do not send the outside prompt as written. Send §3 as the work list: G1 → G3 → G7 → G8 first (no runtime risk), then G2, then
G6 (witness verdicts the same before and after). Add one task, the §4 schema-agreement check. Model per standing rule: Sonnet, not Fable.

---

## §7 HANDS-ON: what stops the owner editing by hand (measured 2026-11-13, same commits as above)
Probe: `scratchpad/fnlen.js` (espree, the same parser ESLint uses) over **788 production files / 280,870 lines** in
viewer/erp/modeller/common (lib/, tests, witnesses, probes excluded). Logs: `fnlen.log` (all functions), `fnlen_inner.log`
(wrapper closures removed). `§EDIT_STUDY parse_fail=0`.

Each item follows one task you would do by hand.

### A. "I change one file — what else must I touch, or users get the old code?"  ← the biggest hand-editing trap
- Every shipped `.js` is listed in an HTML page with a `?v=` tag (**247** in `viewer/viewer.html`, **221** in `erp/idempiere.html`),
  is precached in a service worker, and the worker's `CACHE_VERSION` must go up (`viewer/sw.js:260` v1709, `erp/sw.js:13` v1062,
  `modeller/sw.js:28` v272). Forget one, and the browser serves the old file with no error message.
- A checker exists (`tests/audit_sw_precache.js`, tag ↔ precache), but **there is no "bump" command**: no script under
  `scripts/` does the `?v=` + `CACHE_VERSION` edit. By hand, that's 3 edits in 2–3 files for a one-line fix.
- **Fix:** one `scripts/bump.js <file>` (rewrites `?v=`, bumps the right `CACHE_VERSION`, runs `audit_sw_precache`) + a
  `.vscode/tasks.json` entry. Effort ½ day. Risk: low, touches the deploy path, so prove it with `audit_sw_precache` before/after.

### B. "I open a file and the editor chokes"
- **`erp/sw.js` line 13 is one 234,833-character comment**: the change log of every `CACHE_VERSION` bump, written into the
  code. VS Code stops colouring long lines (default `editor.maxTokenizationLineLength` = 20,000), and the file you must edit on
  every ERP deploy is 280 KB. `modeller/sw.js:28` already follows the right rule ("per-change detail is the git commit
  message"); erp/viewer don't. **Fix:** move the text to `CHANGELOG.md`/git, leave `const CACHE_VERSION = 'v1062';`. 30 min, no risk.
- Data written as JS on one line: `erp/genesis_dict.js:3` (196,831 chars), `erp/fk_rules.js:2` (143,773), `erp/team_plan.js:2`
  (76,514), `erp/genesis_seed.js:7`, `erp/team_plan_pos.js:2`, `erp/ad_official_indexes.js:5`. These are generated data,
  not code. **Fix:** list them under `search.exclude` / `files.readonlyInclude` in a committed `.vscode/settings.json`
  (none exists today) and `linguist-generated` in `.gitattributes` (no entry today), so search results and diffs aren't
  full of them. 1 h, no risk.

### C. "Where is this defined?"
- True globals (`setupScene`, `ADParser` …) → F12 works inside `erp/` + `viewer/` only (G1: modeller/common are not indexed).
- Fields on the shared object (`APP.camera`, written as `A.camera`) → **F12 can't follow them** (VIEWER_FILE_SPLIT_PLAN fact 3:
  0 of 495 found). The by-hand route is `internal/APP_SURFACE.md` (1,676 fields, `file:line`). It is a document, not an
  editor action. **Fix:** a VS Code task "Find APP field" that greps `APP_SURFACE.md` for the word under the cursor, or a
  generated `types/app-surface.d.ts` declaring `A`/`APP` fields with `@see file:line` JSDoc. The second gives real hover/F12.
  Effort ½–1 day, no runtime risk (editor-only files). Regenerate with `gen_app_surface.js`.

### D. "This function is too long to hold in my head"
- 62 functions are ≥1,000 lines, but most are the **whole-file closure** (`setupScene` 3,848 = all of `scene.js`). The
  Outline panel still lists the inner functions, so this costs little.
- **Real single functions that are too long** (wrapper closures removed; `fnlen_inner.log`): 27 functions ≥400 lines, plus 2
  that fill nearly a whole part file:
  `fx_cinema_path_plan.js:14 _cinemaPathPlan` **2,823** · `maxq_start.js:11 start` **2,663** (both film code, protected lane) ·
  `panels.js:1320` (anon) 1,255 · `import_worker.js:125 onmessage` 1,048 · `dxf2bim/ifc_extract_core.js:169 extractToDb` 997 ·
  `tm_gantt_build.js:28 injectGantt` 992 · `common/comm/comm_store.js:100 open` 969 · `tm_render.js:19 renderAtTime` 961 ·
  `common/room_graph.js:308 buildGraph` 889 · `streaming.js:1539 _getMaterial` 762 · `schedule_gate.js:484 computeSchedule` 654.
- Splitting these is real refactoring with runtime risk, so it is NOT on the quick list. If done, use the split-generator
  method (byte-identical gates) and do one at a time behind its witness. `computeSchedule`/`renderAtTime`/`injectGantt` are
  the 4D lane you would touch most.

### E. "The comments: help or noise?"
- 27.0% of production lines are comments (75,735). **4.9% (13,630 lines) are history comments**: dates, PR numbers and
  `§`-spec references explaining *why it changed*, not *what it does*. CLAUDE.md §AD-LAYER rule 7 already says
  *"Fix history goes in the prompts file, not in code comments."* The `§TAG` pointers are useful (they link code to its
  spec); the dated stories are what makes a by-hand read slow. No action proposed. This is a habit to keep for new code, not a sweep.

### F. "How do I check my change without Claude?"
- Runners exist but aren't wired into the editor: `tests/run_witness_suite.js`, `modeller/tests/run_all_witnesses.js`.
  ERP: `bim-compiler/build/erp/run_witness.sh`. `.vscode/tasks.json` has only *Serve* + *Lint viewer*.
- 636 files hard-code `/home/red1` (G6). For you on this machine that is fine. It matters only for a second machine or a
  second person.
- **Fix:** add tasks "Run witness for this file" (`node ${file}` → log under `logs/`, show the last lines) + "Run suite".
  1 h, no risk. This is the by-hand version of the Log Mandate.

### G. "Which spec covers this code?"
- 70 prompts files / 16,932 lines in bim-ootb, **354 / 122,690 in bim-compiler**. Code → spec goes through `§TAG` (grep it).
  Spec → code has no index. DEV_TOOLKIT_NO_AI §5.3 *T4 Spec hover* (`§TAG` → its paragraph) is the designed answer;
  it is parked and has no code yet.

### Owner hand-editing order (cheapest first, none touch running code except A)
1. **B** sw.js comment out + `.vscode/settings.json` + `.gitattributes` (≈1.5 h)
2. **G1** add modeller/common/capex/teams/bim to `jsconfig.json` (1 h)
3. **F** witness tasks in `.vscode/tasks.json` (1 h)
4. **A** `scripts/bump.js` + task (½ day). Prove with `audit_sw_precache` before/after
5. **C** generated `types/app-surface.d.ts` (½–1 day)
6. Then G2/G3 from §3. **D** only if the owner picks one function to work on by hand.

---

## §8 SPEC: build steps 1–5 of §7 (owner, 2026-11-13: *"Proceed but be careful not to break ongoing sessions work, ask the other session what it thinks first."*)
**Coordination:** asked bim-compiler-c3 and -5c. c3 had no objection. Its next PR (CAPEX §5.66 PR B) bumps `erp/sw.js` CACHE_VERSION
and `goal_engine.js?v=`, and the agreed rule is *keep the `const CACHE_VERSION = '…';` line exact, take the higher version, drop
the long trailing comment*. No reply from 5c at write time. One PR in bim-ootb, branch `chore/editor-tidy`, worktree `/tmp/wt-editor-tidy`
off `origin/main` @ `c2de4dea`. The shared checkout is not touched.

| Step | Issue it fixes | Change | Witness: what fails before and passes after |
|---|---|---|---|
| S1 | **W-ED-LONGLINE**: `erp/sw.js:13` is 234,833 chars, so VS Code stops colouring it and it is unreadable by hand | Move the trailing comment of line 13 *verbatim* to `erp/SW_VERSION_HISTORY.md` (moved, not deleted). Line 13 becomes `const CACHE_VERSION = 'v1062';   // bump on each deploy; history: SW_VERSION_HISTORY.md`. CACHE_VERSION is **not** bumped (no precached asset changes) | (a) longest line in `erp/sw.js` ≤ 2,000 chars, before = 234,833. (b) `node --check erp/sw.js`. (c) every erp witness that reads `sw.js` (the scratchpad list) gives the **same exit code** before and after. Any change means that witness was matching comment text, and it gets reported, not hidden |
| S2 | **W-ED-SEARCHNOISE**: 7 generated one-line data files flood search and diffs | New `.vscode/settings.json`: `search.exclude` + `files.readonlyInclude` for those 7 files. `.gitattributes`: `linguist-generated` for the same 7 | `git check-attr linguist-generated` gives `set` for all 7, `unspecified` before |
| S3 | **W-ED-JSCONFIG**: modeller/common/capex/teams/bim are not indexed, so F12 can't jump across files there | Add them to `include`. Add `**/lib/**` (+ minified/vendored) to `exclude` | TypeScript LS probe: resolve-definition for a sample of cross-file globals used in modeller/common. Before: 0 resolved. After: >0, with `§ED_JSCONFIG files= resolved=/sampled=`. Sample is 0 → INCONCLUSIVE |
| S4 | **W-ED-TASKS**: no editor way to run a witness and keep its log | `.vscode/tasks.json`: add "Run this witness (log → logs/)" (`node ${file}` piped to `logs/<name>.log`, then the last 20 lines) | the task JSON parses. A dry run of the command line on one witness writes the log file and exits with the same code as running the witness directly |
| S5 | **W-BUMP**: a precached file edited by hand without bumping `?v=` + `CACHE_VERSION` is silently served stale | `scripts/bump.js <file…> [--write] [--root DIR]`. For each target file, find every tracked `.html` whose `src=`/`href=` resolves to it and add 1 to its `?v=N`. Add 1 to the `CACHE_VERSION` of each `sw.js` sitting in the folder of a changed html. Warn if the file is missing from that sw's `PRECACHE_ASSETS`. List `?v=` mentions in `.js` loaders (e.g. `viewer/main.js modules[]`) as *check by hand*. **Dry run by default**, and `--write` applies. Never touches anything else | `scripts/tests/witness_bump.js` on a temp copy: the exact expected diff (html `?v=` +1, sw +1, nothing else byte-changed). Unknown file → exit 2 and nothing written. Dry run → nothing written. Prints `§BUMP` lines |

### §8.1 S3 RESULT + S6 SPEC — why F12 fails, measured (2026-11-13)
- **S3 alone barely helps.** `§ED_JSCONFIG` before: indexed 1,474, sampled 13 cross-file globals, resolved 0 (all 13 not indexed).
  After adding modeller/common/capex/teams/bim: indexed 2,342, all 13 now indexed, **resolved 1**. Probe and logs: scratchpad `ls_probe.js`, `ls_before.log`, `ls_after.log`.
  Instrument check: `setupScene` in `viewer/main.js:14` → `viewer/scene.js` (`§LS_ONE`), so the probe can succeed when the code allows it.
- **Cause:** **557 of 855** production files end with the UMD tail `if (typeof module…) module.exports = X`. TypeScript then treats the
  file as a CommonJS module, so `X` is **not** a global to the editor (erp 242/300, modeller 103/146, common 41/52, viewer 121/290).
  Only viewer's 55 `function setupX(A)` files are true globals. On top of that, `types/erp-globals.d.ts` declares the ERP globals
  as `any`, which sends F12 to the `.d.ts` line (`ADParser` → `types/erp-globals.d.ts:13`) and gives members no target at all.
- **Fix proven on one:** `declare var ADParser: typeof import("../erp/ad_parser.js")` gives `ADParser.init` @ `erp/ad_ui.js` →
  **`erp/ad_parser.js:525`** (was `none`) (`§LS_MEMBER`, scratchpad `lsm_before.log` / `lsm_after.log`; the trial edit was restored).

| Step | Issue | Change | Witness |
|---|---|---|---|
| S6 | **W-ED-TYPES**: F12 / hover / autocomplete are dead on every UMD global (`ADParser.init` → none) | `scripts/gen_global_types.js` → `types/globals.gen.d.ts` (generated, do-not-edit header): for each production file with `module.exports = NAME` or `(root\|window\|g\|self\|globalThis).NAME = factory()`, where `NAME` is read as `NAME.` in another production file, emit `declare var NAME: typeof import("../<file>")`. Remove those names' `any` lines from `erp-globals.d.ts` (they would clash). Editor-only: no page loads `types/` | `scripts/tests/witness_global_types.js`: for every generated global, take its first `NAME.member(` use in another file and resolve the member. Before: resolved/sampled from the current types. After: resolved/sampled from the generated types. Prints `§ED_TYPES globals= sampled= resolved_before= resolved_after=`, INCONCLUSIVE if sampled=0. Needs TypeScript as a parser-only dep (`TSLIB=` path, as `split_closure.js` does) |

---

## §9 RESULT — S1–S6 built, bim-ootb PR #2904 (2026-11-13)
Branch `chore/editor-tidy`, worktree `/tmp/wt-editor-tidy`. Logs in session scratchpad (`before.txt`/`after2.txt`, `ls_*.log`,
`wtypes.log`, `wbump.log`, `audit2.log`).
| Step | Witness line | Result |
|---|---|---|
| S1 | `§ED_LONGLINE erp/sw.js max_line=456` (was 234,833) · `readers=24 same_exit=24` (14 pass, 10 already failing before the change, none changed) | ✅ (witness) |
| S2 | `git check-attr linguist-generated` set on 7 files (was 0) · settings JSON parses | ✅ (witness) |
| S3 | `§ED_JSCONFIG indexed 1,474 → 2,342` | ✅ indexing. Alone it gives F12 for only 1/13 globals; S6 is the real fix |
| S4 | `§ED_TASKS json_ok tasks=6` · task exit = direct exit on a PASS (0) and a FAIL (1) witness | ✅ (witness) |
| S5 | `§BUMP_W_VERDICT PASS judged=4 failed=0` · real-tree dry run predicted c3's `goal_engine.js?v=1→2`, `v1062→v1063` exactly, wrote 0 | ✅ (witness) |
| S6 | `§ED_TYPES sampled=44 resolved_before=0 resolved_after=27 verdict=PASS` · `§ED_TYPES_GEN emitted=109 editor_blind=4` | ✅ (witness). **17/44 still miss**: exported inside a UMD wrapper function TypeScript can't follow (e.g. `Dxf2Bim.run`, `ScheduleEngine.compute`). Fixing those needs a small code change per file (top-level `var X = factory(); module.exports = X`), which touches running code, so it was **not done**. That's an owner decision |
Gates: `tests/audit_sw_precache.js` 268/268, 0 unlisted · `npx eslint viewer modeller` 0 errors.
**Conflict:** c3's #2903 landed first and bumped line 13 to v1063. Resolved as agreed: v1063 + short comment, and the v1063 note was
moved verbatim to `SW_VERSION_HISTORY.md`. After the merge, the 24 readers still exit the same and the audit still passes.
**Instrument errors caught on the way (do not repeat):** (1) the first sample of "globals" was generic local names (`update`,
`column`), 0/41 meaningless. Fixed by sampling from `eslint.globals.json`. (2) The witness sampled uses inside comments, which always come back as none.
Fixed by blanking comments with offsets kept (CodeScrapBook §10 R9 class). The first blanking pass used `skipTrivia=true`, which is the wrong flag: comments are skipped, not
returned. (3) "a wrapped export is unfixable" was a guess, refuted by the data (24 resolved). TypeScript now decides per global.

## §10 FOUND IN THE HEAVY-CODING PROMPTS (owner, 2026-11-13: *"do your own review by examining more prompts/# that does heavy coding"*)
Read: MIGRATE_INSTALL_TENANT, MODELLER_MASTER, 4D_MODEL_INTEGRITY, ERP_IDEMPIERE_UX_PARITY, SQLiteIDEMPIERE, FINANCIALS_GROUNDING,
LOD400_UPGRADER, bim-ootb CAPEX_DASHBOARD, DXF2BIM_ARCHITECT_REVIEW, DISC_WALK_DRAWN_INTEGRATION. Grep for trap/duplicate/stale/override/CACHE_VERSION, then the hit lines read.
1. **Stale copies across the two repos are the biggest by-hand trap.** Measured: same-named JS in both repos, **462 bim-compiler copies
   identical, 329 diverged**: `build/scriptor` 132, `deploy/dev` 80, `deploy/live` 53, `deploy/sandbox` 19, `build/erp` 18. The prompts keep
   hitting it: DXF2BIM R7-6 (12 stale reader copies in `deploy/dev`, specs still naming them), ERP_IDEMPIERE_UX_PARITY §739–772 ("shipped ⊃
   copy" / "copy AHEAD"). With both repos open, Ctrl+P and search offer the stale copy first as often as not. **Proposed, not built:**
   a bim-compiler `.vscode/settings.json` that hides `build/scriptor/**`, `deploy/live/**`, `deploy/sandbox/**` from search/quick-open and
   makes `deploy/live/**` read-only in the editor (the PRIME RULE "never touch production", enforced by the editor). Editor-only, ~1 h.
2. **"Who owns this?" is answered only for 4D.** `4D_MODEL_INTEGRITY §I` ownership table (one owner per question, duplicates flagged:
   `support_sweep.js:432` vs `cpm_schedule.js:126`). Other lanes found duplicates after the fact: `modeller/routewalker.js` vs
   `viewer/routewalker.js` (MODELLER_MASTER:76), `erp/pa_engine.js` vs `erp/overlay/goal_engine.js` (CAPEX §5.18, deleted), `ERPKernel`
   published by `erp/erp_kernel.js` AND `erp/odoo_agent/erp_kernel.js`. Also `Bonsai` ×3 and `ERP` ×4 publishers
   (`globals.gen.d.ts` header, now listed automatically on every regeneration).
3. **Version knobs beyond sw.js:** `_GANTT_CACHE_VERSION` (4D §, `time_machine.js`) is a second hand-bumped cache key. `bump.js` doesn't
   cover it. A by-hand 4D edit needs it bumped too, or users keep a stale cached schedule.
4. **Line refs rot after splits** (DEV_TOOLKIT: cite by FUNCTION NAME). Prompts are full of `file:line` that the 2026-10 splits moved.
   That's fine for history, but when you open a cited line by hand and it's wrong, search for the function name.
5. **Not editor issues, recorded so they aren't mistaken for one:** legacy test-DB writes (MIGRATE landmine), CI never green (MODELLER
   §310), PA_Goal 30-min staleness (CAPEX). These are runtime/oracle traps; their lanes already list them.

## §11 SPEC — bim-compiler editor settings: hide the stale copies (owner, 2026-11-13: *"yes proceed"* on §10.1)
**Issue W-ED-XREPO:** with both repos open, search and Ctrl+P offer out-of-date copies of bim-ootb modules (329 diverged).
**Where they are (measured, `xrepo_copies.txt`):** `build/scriptor/*/_kw_old/**` = 437 copies across 13 dated run snapshots. The
originals beside them stay visible (`build/scriptor/*.js`, `treatments/` 5, `film_v4/` 3, `perf_review_20261101/` 4 probes).
Also `deploy/live/**` (production snapshot, 35 diff + 18 locales; last touched 2026-08-04) and `deploy/sandbox/**` (19 diff,
last touched 2026-05-19). **`deploy/dev/` stays visible.** It is the dev target (CLAUDE.md PRIME RULE). Its 55 diverged copies are
a real sync question for the DXF2BIM/viewer lanes (DXF2BIM R7-6), not something to hide.
**Change:** `.vscode/settings.json` (`search.exclude` + `files.exclude`-free, so the file tree still shows them; `files.readonlyInclude`
for `deploy/live/**`). `.gitignore`: `.vscode/` → `.vscode/*` + `!.vscode/settings.json` (other personal .vscode files stay ignored).
**Witness:** of the 329 diverged + 462 identical copies, the count that the search.exclude globs hide (minimatch, same semantics as
VS Code) vs. the count of ORIGINAL (non-copy) files hidden. Pass = most diverged copies hidden AND 0 originals outside
deploy/live|sandbox hidden. `§ED_XREPO hidden_diff= hidden_same= visible_diff= originals_hidden=`.

## §12 RESULT §11 + what is left vs. mainstream VS Code expectations (2026-11-13)
**§11 DONE:** bim-compiler PR #596 merged (`90684efbe`), check `system-is-real` SUCCESS. `§ED_XREPO hidden_diff=204 hidden_same=316
js_originals_hidden_outside_deploy=0 verdict=PASS`. c3 had no objection. 5c was gone (unreachable) by then.
**Owner question:** *"did u detect much room for dev editability improvement? … VSC friendly is something i think u know what the devs in the world prefers"*
Measured over 856 production files (bim-ootb `6fc6b8dd`):
| Mainstream expectation | Here | Room | Cost / risk |
|---|---|---|---|
| Files say what they use (`import`/`export`) → F12, rename, find-references just work | **1** file uses ES modules. Script order + window globals + the `A`/`APP` object (1,676 fields) | **Largest.** #2904 patched F12 for 27/44 UMD globals. `A.x` fields still have no F12 | Weeks, touches running code. Only file-by-file behind witnesses. Not recommended as a sweep |
| Types from JSDoc + `// @ts-check` (the standard no-build route) | 0 files `@ts-check`, 54 with any `@param` | Large, and the cheapest structural step: opt-in per file, no runtime change | Hours per file. Start with files you edit by hand most |
| Files < ~500 lines, functions < ~100 | 159 files >500, 67 >1,000. 29 functions ≥400 lines | Large. Hurts reading more than navigation | Real refactor (split-generator method, protected lanes excluded) |
| `npm test` runs the checks | `package.json` has only `lint`. Witnesses in 5 folders | Medium | `npm test` → `tests/run_witness_suite.js`: 1 h, no risk |
| Shared formatting (`.editorconfig`/Prettier) | none (0 tab-indented files, so it's consistent anyway) | Small | `.editorconfig` only, 15 min. **Never mass-reformat** (one giant diff that collides with every open lane) |
| Debug in the editor (`launch.json`, breakpoints) | none | Medium for by-hand bug-hunting | 1 h. DEV_TOOLKIT S0 spike already specced |

## §13 MINIMALISM GUARD (owner, 2026-11-13: *"be aware of our minimalist approach where we are pure SQLite WASM resisting any forks, or TS that can overload its lightweight kernel local first air gapped handling"*)
**Rule for every item in this file:** nothing may reach the browser or add a runtime dependency. Editor help lives only in files no page
loads (`.vscode/`, `jsconfig.json`, `types/*.d.ts`, `scripts/`, `// @ts-check` comments). **Never:** `.ts` source files, a compile/bundle
step, a forked or extra runtime library, TypeScript (or anything else) in `package.json` `dependencies`.
**Verified for #2904 (bim-ootb `6fc6b8dd`):** no sw.js precaches and no html loads any new file. The only sw.js hits are my comment on
`erp/sw.js:13` and an unrelated `modeller/sw.js:128` `pdf2dxf/types/*.json`. `package.json` unchanged (`dependencies` = `sql.js` only).
**One dev-machine dependency added:** `scripts/gen_global_types.js` (filter step) and `scripts/tests/witness_global_types.js` use
the TypeScript npm package as a parser on the developer's machine, the same as `scripts/split_closure.js` already does. Ships nowhere, but needs
a one-time `npm i` that an air-gapped dev machine may not have. VS Code already contains TypeScript for its own JS help, so
`@ts-check` and the `.d.ts` files need nothing installed.
**§12 re-ranked under this rule:** OK = `.editorconfig` (plain text), `launch.json` (VS Code only), `npm test` → existing node runner,
per-file `// @ts-check` + JSDoc (comments; the browser ignores them). **Dropped:** Prettier (an npm tool, not needed: formatting is
already consistent). ES modules: native to the browser, no tool, but they change load order and globals at run time, so **not
recommended** (runtime risk to the kernel). File by file, only if the owner asks.

## §14 SPEC — conveniences + no-install + keep the lazy-loading strategy (owner, 2026-11-13: *"Proceed"*; mid-turn: *"in the same also look at or retain its fast perf lazy loading strategy"*)
One bim-ootb PR, branch `chore/editor-conveniences`, worktree `/tmp/wt-editor-conv` off `origin/main` @ `6fdcf25a`. Nothing reaches the browser (§13).
**The lazy-loading strategy as it stands (read, not changed):** the viewer's Find/navigate parts (`find_erp_push`, `find_ask*`, `nf_*`,
`navigate_find`, `room_graph`, …) load on first use from `viewer/main.js` `modules[]` (`'nf_room.js?v=1'` …) and are **NOT precached
on purpose** (`viewer/sw.js:753`, v1078: network-first online, no boot bytes). ERP/modeller lazy parts ARE precached for the air gap
but load on demand in the page (`erp/sw.js:408-421`, `modeller/sw.js:59-139`). None of §14 changes what loads, when, or what is cached.
| Step | Issue | Change | Witness |
|---|---|---|---|
| N1 | **W-ED-NOTSDEP**: the types generator/witness asked for `npm i typescript`, which an air-gapped dev machine may not have | `scripts/lib/find_ts.js`: `$TSLIB` → local package → **VS Code's bundled copy**. The tools only help VS Code users, and VS Code always ships TypeScript | `§ED_NOTSDEP found=vscode:… v6.0.3` with no npm package present. Generator output **byte-identical** under npm 5.6.3 vs VS Code 6.0.3. Witness PASS on VS Code's copy (`resolved 0→27/44`) |
| N2 | **W-BUMP-LAZY**: `bump.js` (#2904) exits 2 for a lazy module (it looks only at `.html`), and its "not precached, offline users will not get it" WARN pushes toward precaching a file that is lazy on purpose | Also bump string literals `'<path>?v=N'` in `.js` loaders (path resolved from the loader's folder), bump the sw of the loader's folder (the loader itself is precached, as `main.js` is). The not-precached line becomes a neutral NOTE citing the lazy rule. Never adds anything to PRECACHE | `witness_bump.js` C5: lazy `nf_room.js` → `main.js` exactly 1 line `?v=` +1, `viewer/sw.js` +1, `viewer.html` unchanged, exit 0, NOTE not WARN. C1–C4 still PASS |
| N3 | **W-ED-EDITORCONFIG**: no shared editor settings | `.editorconfig` describing **only the measured current style** (no reformat): see N3 measurement | the share of files that already match each rule (must be ≥ majority, otherwise the rule is left out) |
| N4 | **W-ED-LAUNCH**: no breakpoint debugging from VS Code | `.vscode/launch.json`: Chrome on `localhost:8000` for viewer/ERP/modeller (uses the existing *Serve repo* task) + "Node: this witness" | JSON parses; every launched URL's file exists. **Not run in a browser** (no browser/GPU runs without the owner's go). The SW-bypass question stays DEV_TOOLKIT spike S0 |
| N5 | **W-ED-NPMTEST**: no `npm test` | `package.json` `"test": "node tests/run_witness_suite.js"` (headless class only, its default; browser witnesses stay behind `--browser`) | `npm test` exit == direct runner exit; baseline log `logs/witness_suite_baseline.log` |

### §14 RESULT — bim-ootb PR #2908 (2026-11-13)
| Step | Witness line | Result |
|---|---|---|
| N1 | `§ED_NOTSDEP found=vscode:/snap/code/current/…/typescript.js v6.0.3` (no npm package in the repo) · output identical npm 5.6.3 vs VS Code 6.0.3 · `§ED_TYPES … resolved_before=0 resolved_after=27 verdict=PASS` on VS Code's copy | ✅ (witness) |
| N2 | `§BUMP_W C5-lazy-module-kept-lazy PASS lazy=viewer/find_erp_push.js main_lines=1 page_lines=1 sw_lines=1 precache_unchanged=true note=true warn=false` · `§BUMP_W_VERDICT PASS judged=5` · real-tree dry run `nf_room.js` → `main.js` 1→2, `viewer.html` `main.js?v=61→62`, `viewer/sw.js` v1709→v1710, NOTE only | ✅ (witness). Also found: `erp/goal_engine.js` is loaded by `capex/index.html` too (no sw there, NOTE) |
| N3 | measured: JS 2,819 files step 2 / 115 step 4 / 138 too short; py 42/43 4-space; CRLF 1/3,072; no-final-newline 0/3,072; trailing-space 19 files → indent not forced (detected per file), no trimming | ✅ (measurement). Note: VS Code does not read `.editorconfig` natively, so the same rules are in `.vscode/settings.json` |
| N4 | `§ED_LAUNCH json_ok configs=4 urls_exist=3 missing=[]` | ✅ static only. **Not run in a browser** (owner rule). SW-bypass launch stays DEV_TOOLKIT spike S0 |
| N5 | `§ED_NPMTEST npm_exit=0 direct_exit=0 same=yes` (`--filter 4d_template_reached`) | ✅ (witness). Full headless suite = 279 witnesses (38 browser ones skipped by default), baseline run to `~/bim-ootb/logs/witness_suite_baseline.log` |
