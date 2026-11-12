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
