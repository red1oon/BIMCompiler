# ⚠ DO NOT REMOVE — SCOPE: make bim-ootb easier for a human to read and change by hand, one file/module at a time, with NO runtime behaviour change and NO new dependency. Work the list top to bottom (WORK-TO-ZERO). Read the log after every run — exit code is not evidence. Honour this block until every item is ✅ or ⛔.

**Written 2026-11-13** by the editor-maintainability session for a later session (owner: *"spec out the requirement, and later a Fable
model which i shall launch once well prompted to solve"*). Background, measurements and reasoning: `prompts/EDITOR_MAINTAINABILITY_STUDY.md`
(§3, §7, §12–§14). The developer-facing summary of this list is `docs/DeveloperGuide.md` §11.

---

## ▶ START HERE

1. Read, in this order: `docs/DeveloperGuide.md` §0, §1, §5, §6, §9 (the patterns, the change flow, the proof rules, what not to add) ·
   `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13 (minimalism guard) · bim-ootb `GOVERNANCE.md`.
2. Sync: `git -C ~/bim-ootb fetch origin`. Work in a `/tmp/wt-*` worktree off fresh `origin/main` (the shared checkout is hook-blocked).
   Run `git worktree list` first and reuse an existing worktree if one fits.
3. **Before touching any file, check who else is in it:** `ListAgents`, then ask the live sessions whether they are editing that file
   (the owner's standing rule: *"be careful not to break ongoing sessions work, ask the other session what it thinks first"*). Also
   `gh pr list --state open` and look for open PRs touching the same paths.
4. **FOSS flow, per item:** open a bim-ootb issue first (what, why, the baseline measurement, the witness you will use). Then branch
   `refactor/<item>-<file>`, one small PR with `Fixes #<issue>`, conventional title (`refactor:` / `docs:`), CI green. You may merge your own
   verified PR (owner's git-admin rule), then verify it really landed on `main` before starting the next.
5. Re-measure the baseline numbers below at the start. They drift.

## RULES (any break = stop that item)

- **Nothing may change at run time** except where an item explicitly says so (item 2's export move, item 3's de-duplication), and then
  only with a before/after witness showing identical results.
- **No new dependency, no build step, no `.ts` files, no bundler, no framework, no repo-wide reformat** (study §13).
- **Keep the lazy-loading strategy:** never move a lazy module (viewer `main.js` `modules[]`) into a page's boot list or into
  `PRECACHE_ASSETS`. Any edit to a browser-loaded file: `node scripts/bump.js <file> --write`, then `node tests/audit_sw_precache.js`.
- **Protected lane:** the film/camera families (`effects`/`fx_*`, `cinema_path_editor`, `cinema_maxq`/`maxq_*`): only small pure helper
  extraction, never a split, unless the owner lifts the ruling (`prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S59).
- **ERP:** one generic dictionary engine (`CLAUDE.md` §AD-LAYER LAW). Never add per-window code while refactoring.
- **Deletion budget:** a de-duplication PR states lines +/−. Add-only is not done.
- **No browser/GPU runs and no bakes without the owner's explicit go.** Headless node witnesses are fine.
- **Proof:** every item ends with a `§` line from a witness, saved to a log and read. A witness that judged nothing prints INCONCLUSIVE.
  Regex counts must ignore comments and strings (study §9: this instrument error happened twice in one session).
- Findings and status go in THIS file (dated section under each item), not in `MEMORY.md`.

## THE LIST

### 1. `// @ts-check` + JSDoc, file by file
**Why:** autocomplete, hover docs and red squiggles where someone edits by hand. Comments only, invisible to the browser.
**Baseline:** 0 production files with `@ts-check`; 54 with any `@param`/`@returns` (856 production files).
**Do:** start with the files edited most in the last 30 days (`git log --since=30.days --name-only`), production `.js` only, not
generated files. Add `// @ts-check` on line 1 (after the licence lines) and JSDoc on exported functions. If VS Code's checker shows
errors, fix them **only** with JSDoc/comments or by narrowing a type. Never change logic to satisfy the checker. If a file needs logic
changes to go clean, drop `@ts-check` there and record why.
**Witness:** the file's own witness verdict identical before/after, plus a program built with VS Code's TypeScript reports 0 errors for that file
(`scripts/lib/find_ts.js` → `ts.createProgram([file], {allowJs:true, checkJs:true, noEmit:true})` → `getSemanticDiagnostics`; VS Code's bundle has no `tsc` binary, measured). Print `§RFR_TSCHECK file= errors=0 witness=same`.
**Done when:** the 20 most-edited files are covered, or every remaining one is listed with its reason.

### 2. Top-level export for the UMD globals F12 cannot follow
**Why:** F12 / find-references dead on these globals (`witness_global_types.js`: 17 of 44 sampled uses still resolve to nothing).
**Baseline:** `node scripts/tests/witness_global_types.js` → `§ED_TYPES … resolved_after=27` of 44. The misses are listed as `§ED_TYPES_MISS_AFTER`.
**Do:** per file, turn `(function (global) { … global.X = API; if (module) module.exports = API; })(…)` into the equivalent with the
exported value at the top level: `var X = (function (global) { … return API; })(…); if (typeof module !== 'undefined' && module.exports) module.exports = X;`
keeping `global.X = API` inside. **Same object, same name, same load order.** Regenerate `types/globals.gen.d.ts`.
**Witness:** `witness_global_types.js` resolved count +1 per converted file. The file's own witness, and every witness that requires it,
gives the same verdict. `npx eslint viewer modeller` 0 errors. Print `§RFR_EXPORT file= resolved_before= resolved_after= callers_same=`.

### 3. One owner per responsibility
**Why:** duplicates drift and disagree.
**Baseline (from `types/globals.gen.d.ts` header + prompts):** `ERPKernel` published by `erp/erp_kernel.js` and `erp/odoo_agent/erp_kernel.js` ·
`Bonsai` ×3 (`modeller/bcf_export.js`, `bonsai_itemdrag.js`, `bonsai_roommove.js`) · `ERP` ×4 · `modeller/routewalker.js` vs `viewer/routewalker.js`.
**Do:** for each, first decide whether it is a real duplicate or a namespace that several files extend on purpose (`Bonsai.x = …` from
three files may be intended; record which). For real duplicates: diff the bodies (comments/whitespace stripped), pick the owner, point
callers at it, delete the copy. **Ask the owner session of that lane before deleting** (step 3 of START HERE).
**Witness:** every caller's witness same verdict before/after; lines −N stated. Print `§RFR_OWNER name= kept= deleted_lines= callers_same=`.

### 4. Clear phantom fields
**Why:** a field read but never written is a dead guard or a deleted writer.
**Baseline:** bim-ootb `internal/APP_SURFACE.md`: 271 phantoms, 171 read in production (`node scripts/gen_app_surface.js`).
**Do:** per field: confirm it is never written under any spelling (`A.x`, `APP.x`, `app.x`, `window.x`, bracket access). Then either
remove the dead read (if the guard can never be true) or restore the missing writer (if history shows one was deleted by mistake;
cite the commit). Ask before changing a guard in another lane's file.
**Witness:** phantom count −1 per field; the file's witness same verdict. Print `§RFR_PHANTOM field= action= phantom_before= phantom_after=`.

### 5. Split the longest non-protected functions
**Why:** 600–1,000-line functions cannot be held in your head.
**Baseline:** `tm_gantt_build.js` `injectGantt` 992 · `tm_render.js` `renderAtTime` 961 · `streaming.js` `_getMaterial` 762 ·
`schedule_gate.js` `computeSchedule` 654 (study §7 D, probe `fnlen.js`).
**Do:** only with the byte-identical tooling (`scripts/split_closure.js`, `scripts/split_verify.js`, `viewer/tests/_split_families.js`).
Mutable variables shared across the new parts go through a shared-state object in a SEPARATE commit first (`VIEWER_FILE_SPLIT_PLAN.md` fact 5).
4D files: read `prompts/4D_MODEL_INTEGRITY.md` §I (ownership) first.
**Witness:** `split_verify` every statement identical in order. For 4D: `cache_4d_run.js --force` on HHS and Terminal gives `run.json` IDENTICAL.
Print `§RFR_SPLIT fn= parts= largest= identical=yes`.

### 6. `A` to `APP`, one module
**Why:** `grep 'APP.camera ='` finds nothing today; 1,316 fields are written only as `A.x`.
**Do:** `viewer/scene.js` only (606 sites), as the exercise in bim-ootb `prompts/SESSION_OPENER_READ_AND_REVIEW.md` §B. Stop after one
module and report.
**Witness:** `APP_SURFACE.md` field count and phantom count **identical** before and after; `viewer/scene.js` witnesses same verdict.

### 7. One path resolver for witnesses
**Why:** 636 `.js` files contain the author's home folder; a second machine cannot run them.
**Do:** one small resolver (`witness_kit/paths.js`: env var → repo-relative default). Convert witnesses in batches of ≤ 20, one folder at a time.
**Witness:** each converted witness same exit code and same verdict line before/after, run from the same machine. Print `§RFR_PATHS batch= converted= same=`.

### 8. A rule for where new witnesses go
**Why:** witnesses live in six folders.
**Do:** write the rule into `docs/DeveloperGuide.md` §6 and bim-ootb `witness_kit/` README (new witnesses: `<app>/tests/witness_*.js`;
cross-app: `tests/`). **Do not move existing files** in this item.
**Witness:** the rule is in both places; `node tests/run_witness_suite.js --list` count unchanged.

## STATUS
| # | Item | State |
|---|---|---|
| 1 | @ts-check + JSDoc | open |
| 2 | top-level export | open |
| 3 | one owner | open |
| 4 | phantom fields | open |
| 5 | split long functions | open |
| 6 | A → APP, one module | open |
| 7 | witness path resolver | open |
| 8 | witness folder rule | open |

---
**2026-11-13 — superseded in part by `prompts/CODE_ARCHITECTURE_DESIGN.md` (issue #599).** That file holds the higher-level design that removes the
causes these items patch. Items 4 (phantoms) and 6 (`A` → `APP`) are absorbed by its part C, item 3 (one owner) by part D, and items 7–8 (witness paths and
folders) by part E. **Items 1, 2 and 5 stay here.** Before starting 3, 4, 6, 7 or 8, check that file's STATUS: if its part is decided, work it there.
