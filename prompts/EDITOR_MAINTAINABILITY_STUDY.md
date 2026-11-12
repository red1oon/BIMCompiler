# ⚠ DO NOT REMOVE — SCOPE: study only. Is bim-ootb easy to work on in an editor (VS Code/JetBrains) for a second developer? Gathers the specs that already exist, reviews an outside prompt, lists the gaps that are still open. No code changed. No Fable/agent run. Read the log after every run.

**Date:** 2026-11-13 · **Measured on:** bim-ootb `origin/main` @ `c421a957` (#2901), bim-compiler `origin/master` @ `66191f9c0`.
**Why this file exists:** the owner was given an outside "Editor-Maintainability Refactor Audit" prompt to hand to Fable.
Owner, 2026-11-13: *"Dont run in Fable yet.. just study and write up or gather from prompts/# specs concerning this area."*

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
