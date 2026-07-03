# BIM Intent Compiler — Session Protocol

## PRIME RULE
**EXTRACT OR COMPILE ONLY.** Query the database. Copy patterns you find. Compute positions via verbs. Never invent.

**NEVER TOUCH PRODUCTION.** `deploy/live/` is the production snapshot — do not edit directly. All dev work goes to `deploy/dev/` ONLY. Read `deploy/OCI_UPLOAD.md` §RULES before any OCI upload.

## WORK-TO-ZERO (the backlog contract — enforced every session)
There is ONE standing backlog: `prompts/FRONTEND_LANE_MASTER.md §NEW BACKLOG`. A dictated item, once given,
**STICKS until ✅ DONE or ⛔ BLOCKED — it is never re-parked, never re-asked if the answer is in the code.**
(The old `§OUTSTANDING` band ran to ZERO and was RETIRED 2026-06-20 → archived to
`prompts/archive/FRONTEND_LANE_MASTER_OUTSTANDING_drained_2026-06-20.md`. Do NOT re-walk it; its 3 still-⛔ items
were carried forward into the master file's `§OUTSTANDING — RETIRED` block.)
- After the session's explicit task (or immediately if none is given), **work §NEW BACKLOG top-to-bottom to zero**:
  take the top open item → spec → implement → witness/§-log → mark it `✅ DONE (witness)` in the list → next item.
- **Do NOT stop and report "it's parked."** Keep going through the list. The default is *continue*, not *hand back*.
- **Stop only when:** (a) the user interrupts (their call, any time), or (b) an item genuinely needs a user
  fact/decision you cannot EXTRACT — then mark it `⛔ BLOCKED: <the one question>` and **move to the next item**
  (never loop on it, never silently drop it).
- **Session end** = every item is `✅` or `⛔`. Report only the ✅ list + the ⛔ questions. If the list isn't zero
  and you weren't interrupted, you stopped too early — that is the failure this rule exists to kill.
- Shared working tree: editing `~/bim-ootb/` is now **BLOCKED by a PreToolUse hook** (verified 2026-06-06) —
  work in a `/tmp/wt-*` worktree, never the shared checkout. See `~/.claude/hooks/block-shared-tree.sh`.
- **Concurrent branches (N-terminal workflow):** with multiple terminals, `main` advances under you.
  - A PR showing **`BEHIND`/`DIRTY` is *sync*, NOT a redo** — `git fetch origin && git merge origin/main`,
    re-run witnesses, push. Your commits are preserved (you layer main's in).
  - Let **auto-merge** keep it current (`gh pr merge <n> --auto --squash`; the github-actions bot also enables it)
    — but **verify it actually landed**: a squash-merge + a late push *orphans* the new commit (observed PR #138,
    2026-06-05). After a branch is squash-merged, start the follow-up off **fresh `origin/main`** — never re-use it
    (its history collides with the squash → `DIRTY`).
  - **`sw.js` is the conflict magnet** (every deploy bumps `CACHE_VERSION` + `PRECACHE_ASSETS`). On conflict: KEEP
    BOTH precache additions, take the HIGHER `CACHE_VERSION`. Never resolve by dropping the other session's hunk.
  - The worktree isolates working-dir + checked-out branch, **NOT** line-level merge conflicts on shared files.
- **Docs deploy (READ `prompts/DOCS_DEPLOY_POLICY.md` + `prompts/DOCS_DEPLOY_GUARD.md`):** publish docs ONLY
  via **`scripts/safe_gh_deploy.sh`** (the no-shrink seatbelt — W-DEPLOY-GUARD) from your FULL working branch.
  **NEVER run bare `mkdocs gh-deploy`** — it overwrites the whole `gh-pages` site and a stale/thin tree silently
  wipes live pages (happened twice). The seatbelt aborts SOFT (exit 1, `gh-pages` untouched) if a publish would
  DELETE a live page or SHRINK an html/asset >`SHRINK_TOL`% — recoverable, never a hard lock. `docs.yml` is
  DISARMED (manual-only + a no-deletion guard). **Do NOT re-arm its master auto-deploy.** `master` was reconciled
  to the live superset 2026-06-16 (`21f7bbd2`). If the guard ABORTS: your tree is missing live pages — `git merge
  origin/master` to become the superset (or `ALLOW_SHRINK=1 paths=...` to bless an intentional removal), then
  re-deploy. Never `--force` a thin tree over `gh-pages`.
- **Push before you finish (every session):** committing saves work to THIS disk only — `git push` is the backup
  and the only thing that lets work reach `master`/other branches. Leave NO committed-but-unpushed branch at
  session end (it caused a 63-commit single-copy near-miss, 2026-06-16). Pushing is a clean fast-forward to your
  own branch = pure upload, deletes nothing. Verify zero local-only: `git rev-list --count origin/<branch>..HEAD`.

## BOM PRINCIPLE
A BOM is a recipe: one parent, N children, each with a quantity. Each child can itself be a BOM — building → floor → room → furniture → leaf, recursively. Each level is atomic and self-contained. **Three Concerns never merge:** WHAT (Orders, Categories, Products), HOW (BOMs, AttributeSets, Validation), WHERE (output.db for 4D–8D downstream).

## ERP Blueprint
ERP / secured-distributed / serverless work → **`docs/ERP.md`** is the overarching blueprint; its Companion-docs map fans out to `docs/DistributedERP.md` (the doctrine + edge suite) + the `scripts/poc_*.js` witnesses. Read it first for ERP-side sessions.

## Walker Doctrine (ANTI-DRIFT — read before ANY disc-walker / MEP-walk / rules-DB work)
**`docs/WalkerDoctrine.md`** is the LOCKED core doc. The settled fundamentals (do NOT re-litigate or override): small/residential
buildings (SH/DX/**SC**) walk **`duplex_rules.db`** — they do NOT use Terminal rules in production; the walk axis is BUILDING-CLASS,
discipline is a `WHERE` column (never a per-building file). Terminal = the LOD400 reference + a BORROW source for disciplines ABSENT
from residential (e.g. FP/sprinkler) rendered as a SEPARATE class with LOD400-mesh priority — borrowing a discipline's measured rows,
NOT switching the building to Terminal rules. ⚠ `disc_walker.dwInit` DEFAULTS to `terminal_rules.db` (back-compat) — a residential
caller MUST pass `duplex_rules.db`. `§DWG` walks Terminal-on-small as a GENERALIZATION TEST, not the production path.

## Session Startup
0. Before reading `~/bim-ootb` as canon: `git -C ~/bim-ootb fetch origin && git -C ~/bim-ootb merge --ff-only origin/main`
   (clean tree only). A 21-commit-stale checkout made a review report SHIPPED code as missing (2026-06-12).
1. User states activity category (BOM/geometry | schema/ERP | IFC/extraction | SRS/spec | pipeline/debug) → read only matching [category] feedback files from MEMORY.md
2. Read PROGRESS.md §Current State (gate table, what's next)
3. Read `docs/WorkOrderGuide.md` §Invention Boundary + §Step 5-6 (pipeline flow)
4. Read the analysis doc for the building you're working on (`docs/{Building}Analysis.md`)
5. Read the Java interface of whatever you're modifying
6. Run `./scripts/run_RosettaStones.sh classify_{prefix}.yaml` to verify current state

## Session Closeout
**Auto-compact is OFF.** When context reaches ~5%, wrap up and exit cleanly to a new session.

Before ending, update PROGRESS.md with:
- What was done
- What's next
- Witness count if claims changed
- Run space contract check — if `space_contract` FAIL, fix before committing

### Housekeeping (every session end)
- Update MEMORY.md. Delete obsolete topic files. Keep MEMORY.md ≤80 lines. Screenshots: `~/Pictures/Screenshots/`
- If PROGRESS.md > 80 lines, archive DONE items as single-line pointers to spec docs

## Watchdog Protocol (runs in same session after every coder task)
- Read the coder's `# DONE` appendix — every claim must have a `§` log line proving it. No log line = not done. Flag it.
- If log doesn't cover a claim — coder must add `_log()`, rerun, and produce the evidence before closing.

## Standing Rules
- One bounded task per session
- Witnesses prove; SanityCheck is fallback
- All geometry is a maths issue — verify numerically via pipeline logs, not manual DB queries
- **Log Mandate:** After ANY run, save output to a log file, read the log before conclusions — exit code is not evidence. Never rely on inline terminal output. Improve FINE logging to reveal issues; extract insights from log only, never invent. Every prompt file opens with `# ⚠ DO NOT REMOVE` block stating scope + "read the log." Honour until DONE.
- **Deploy Flow (deploy/dev/ ONLY):** Edit → syntax check → verify all `§` tags exist → save test log → upload to dev bucket → smoke test URLs → fetch back and verify content → confirm file is loaded by viewer. ONE flow, never stop partway or ask user to check.
- **OCI MIME Rule:** EVERY `oci os object put` MUST include `--content-type` — OCI does NOT infer it from the extension; omitting it → `X-Content-Type-Options: nosniff` block + silent script failure. Full MIME table: `deploy/OCI_UPLOAD.md §RULES`.
- **Spec-First (ALL work):** Spec before code, spec before tests, spec before prompts. No implementation without a written spec section. New features: witness claim first, then implement.
- **Tests expose issues:** Every test must name the issue it proves or disproves. A test that passes without revealing whether the issue is solved is not a test.
- **Browser testing — §-log first, Playwright second:** Primary browser verification = whitebox `§`-tagged `console.log()` output. The coder reads `§` lines to confirm values, counts, and state are correct. Playwright is secondary — for wiring/deploy checks only (scripts load, buttons exist, DB returns data). Do NOT add Playwright tests for value verification — add a `§` log line instead. See `docs/TestArchitecture.md` §Browser Testing. Run `node deploy/dev/tests/audit_specs.js` after any Playwright changes — must exit 0.
- **Anti-Drift Policy:** Read `docs/TestArchitecture.md` §Anti-Drift before adding BOMs, products, or geometry paths
- **Pre-Flight Citation:** Before code changes, cite the spec: `// Implementing BBC.md §X.Y — Witness: W-NAME`
- **Traceability:** Check `TestArchitecture.md` §Traceability Matrix before and after changes

## Sacred Files (edit with extreme care)
- `deploy/live/*` — PRODUCTION snapshot, never edit (see PRIME RULE)
- `migration/*.sql` — append only, never modify existing migrations. EXEMPT: `DV_<prefix>_rules.sql` — regenerated
  mined artifacts (written by `run_RosettaStones.sh`/`onboard_ifc.sh` each gate run, applied by `rebuild_erp.sh`),
  not ledger migrations; in-place regeneration is their normal lifecycle (decided 2026-07-03).
- `BuildingCompiler.java` — main orchestrator, many dependencies
- `RosettaStoneGateTest.java` — defines G1-G6 gates (compiler-reconstruction truth). NOTE: no CI in this repo runs it — "GREEN before commit" is a LOCAL discipline (Anti-Drift #5), not automation. See `docs/TestArchitecture.md` §Truth Model (2026). The headless smoke subset runs via `.github/workflows/ci.yml` + `scripts/system_is_real.sh`.
- `X_M_BOM.java` / `X_M_BOMLine.java` — EntityType guards, GodMode bypass
