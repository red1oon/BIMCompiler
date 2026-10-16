# BIM Intent Compiler — Session Protocol

## PRIME RULE
**EXTRACT OR COMPILE ONLY.** Query the database. Copy patterns you find. Compute positions via verbs. Never invent.

**NEVER TOUCH PRODUCTION.** `deploy/live/` is the production snapshot — do not edit directly. All dev work goes to `deploy/dev/` ONLY. Read `deploy/OCI_UPLOAD.md` §RULES before any OCI upload.

## ⚖ PRIMAL LAW — WITNESS REPLACES EVERY HUMAN VISUAL CHECK (2026-08-26, user directive)
> **USER, 2026-08-26:** *"Can u make it primal law now that WITNESS is to replace all human visual
> checks"* … *"till Gantt chart editor to successfully edit the bars and it correctly works"*
> Context they gave it in: *"How do i work with vibe coding like this? It is so wastefull long
> sessions all this weeks. I have to remind u things."*

**This ranks with the PRIME RULE. It is not advice and it is not scoped to geometry.**

**0a. RE-READ THE SPEC BEFORE EACH THINKING PASS, not once at session start (user, 2026-08-27:
*"Update the specs first, review each time u set out to think."*).** Reading `4D_MODEL_INTEGRITY.md`
at startup and then working from memory produced THREE retractions in one session — every one of
them an error that file already listed (§J.2). Before each new measurement or claim, re-open §E
(the table of proxies measured wrong) and §I (the ownership table) and check what you are about to
compute against them. **If the needle has not moved, stop and review the model, don't invent
another metric** — a metric invented to fill a hole where a RULE should be is the square peg.

**0. BEFORE you compute any 4D relation, read the OWNERSHIP TABLE — `prompts/4D_MODEL_INTEGRITY.md`
§I.** It says which function owns each question (support, ground exemption, level, phase, duration,
solve, audit, on-screen) and flags the three that have DUPLICATE, DISAGREEING implementations.
Re-deriving an owned relation is this lane's single most expensive recurring defect — five times in
two sessions. Find your question in the table and call the owner; if it is not there, add the row.

**1. The user's eyes are never the test instrument.** Never ask them to look, open, scroll, click,
confirm "does this look right", or report what they see. Never offer a screenshot as evidence.
If a claim cannot be stated as a `§`-tagged value a witness asserts, the claim is not ready — say
that instead of outsourcing the check.

**2. The law reaches ALL THE WAY THROUGH THE GANTT EDITOR.** The end of the chain is not "the
schedule generates" — it is **a bar is edited and the result is correct**. That whole path is
witness territory: drag/resize/lock/undo a bar → the stored timeline changed by the asserted
amount → every projection recomputed → persistence round-trips → the judge re-scores the NEW
timeline. `witness_gantt_edit_coherence`, `witness_gantt_lock_integrity`, `witness_tm_edit_exception`,
`witness_undo_dot_spawn`, `witness_whatif_authored_sync` are that chain; extend them, don't eyeball
the UI. A green editor witness that never edited a bar is a §CRISIS-class defect
(`prompts/WITNESS_INTERFACE_FRAMEWORK.md`).

**3. The shipped `§`-log is PRIMARY EVIDENCE. Never suppress it.**
Wrapping a pipeline call to silence `console.log` throws away the witness the code already emits
and forces a hand re-derivation — which is how this lane got its wrong numbers. *(Committed twice
in one session, 2026-08-26; the user's own words: "Why dont u refer WITNESS debug logging?")*
`§HOSTED_BEFORE_HOST`, `§GEO_ORDER`, `§SUPPORT_CYCLE`, `§DEQ_REPAIR`, `§4D_BAND_MONOTONIC`,
`§TPL_*` already answer most of what gets re-measured by hand. **Read the log first; re-derive
only what it genuinely does not say — and when you must, add a `§` line so the next session
doesn't pay again.**

**4. A witness that cannot report its own failure is not a witness.** It must be able to say
NO-OP, VACUOUS, and WRONG:
  - **no-op** — the pass ran but changed nothing (`§TPL_LAYER_SELFCHECK moved=0`).
  - **vacuous** — the population it judged was empty, so its 0 means nothing (`§D0_VACUOUS`; a
    metric read 0 on all four buildings purely because every element was exempt, 2026-08-26).
  - **scope-blind** — it passes because the defect is outside the pairs it inspects
    (`§TPL_LAYER_SELFCHECK` returned PASS while regressing Hospital 13→15, because it skips
    cross-task pairs).
A verdict line must print `INCONCLUSIVE`, never `PASS`, when nothing was actually judged.

**5. RUN ONCE, PERSIST, READ FOREVER — re-running is a waste the user is paying for.**
`bim-ootb scripts/cache_4d_run.js` runs the shipped pipeline once per building with `§`-logging ON
and persists `witness.log` + `run.json` under `~/.cache/bim4d/`, keyed on the building DB **and the
content of `schedule_gate.js`/`schedule_author.js`/`support_sweep.js`/`cpm_schedule.js`/`rates.js`/
`4D_template.json`, so a stale cache is impossible.** MEASURED: 4 buildings (119,568 elements) read
back in **0.43 s** versus minutes to recompute. **Any probe/analysis reads the cache** — do not
re-invoke `materializeZones` to answer a question that a persisted run already answers.

## ⏸ PUSH PAUSE — LIFTED 2026-07-17
Stood 2026-07-11→2026-07-17 (local/localhost-only verification while a large merge burst got
batch-verified). **User directive 2026-07-17: "now push permission is ON, ie always push to live
until user decides to pause."** Push freely (normal fast-forward pushes / PRs — not force-push, not
skipping the localhost/§-witness verification habit this project still runs on) until the user says
to pause again. If they do, the same discipline as before applies: commit locally, verify on
localhost, no push/PR, and every Agent-tool dispatch must carry that instruction explicitly since a
fresh worker has no memory of it.

## WORK-TO-ZERO (the backlog contract — enforced every session)
**No standing backlog file right now — `prompts/archive/FRONTEND_LANE_MASTER.md §NEW BACKLOG` (archived 2026-07-11, prompts-audit) DRAINED 2026-07-08 (every
top-level item `✅`; same retirement treatment as the earlier `§OUTSTANDING` band, RETIRED 2026-06-20 → archived
to `prompts/archive/FRONTEND_LANE_MASTER_OUTSTANDING_drained_2026-06-20.md`). Do NOT re-walk either band, and
do NOT re-derive "is it still stale" by re-reading that 523-line file — it's settled. Two small real items were
found buried in its already-✅ prose (not lost, just not worth their own file): (1) bim-ootb `runSave()`'s 57s
wall-clock never profiled to WHERE the time goes (message-clarity was fixed, the budget wasn't); (2) bim-ootb
`38-offline-pwa.spec.js`'s hardcoded `VIEWER_URL` path blocks CI-wiring 3 offline/PWA specs (fix named in
`GH_DEPLOY_ISSUES.md` Issue 4). Pick either up directly if ever prioritized — no rediscovery needed.**

**The RULE stays live even with no active list** — the next time a dictated multi-item job is given, work it
top-to-bottom to zero in whatever file it lives:
- take the top open item → spec → implement → witness/§-log → mark it `✅ DONE (witness)` in the list → next item.
- **Do NOT stop and report "it's parked."** Keep going through the list. The default is *continue*, not *hand back*.
- **Stop only when:** (a) the user interrupts (their call, any time), or (b) an item genuinely needs a user
  fact/decision you cannot EXTRACT — then mark it `⛔ BLOCKED: <the one question>` and **move to the next item**
  (never loop on it, never silently drop it).
- **Session end** = every item is `✅` or `⛔`. Report only the ✅ list + the ⛔ questions. If the list isn't zero
  and you weren't interrupted, you stopped too early — that is the failure this rule exists to kill.
- Shared working tree: editing `~/bim-ootb/` is now **BLOCKED by a PreToolUse hook** (verified 2026-06-06) —
  work in a `/tmp/wt-*` worktree, never the shared checkout. See `~/.claude/hooks/block-shared-tree.sh`.
  **⚠ `bim-compiler` has NO equivalent hook** — this checkout (`/home/red1/bim-compiler`) is fully editable
  by any concurrent session. Confirmed live 2026-07-11: two parallel sessions both directly edited
  `build/room_walker.js`/`scripts/compile_rooms.py` in this shared tree at the same time — non-destructive
  only by luck (verified after the fact, nothing lost). Prefer a `/tmp/wt-*` worktree here too when a task
  might overlap with concurrent work on the same files; if editing the shared tree directly, expect this
  risk and verify post-hoc (diff/syntax-check) rather than assume no collision occurred.
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
**`docs/internal/WalkerDoctrine.md`** is the LOCKED core doc. The settled fundamentals (do NOT re-litigate or override): small/residential
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
7. Writing a new witness (`witness_*.js`)? Start from `bim-ootb/witness_kit/contract.js` + the worked
   example `bim-ootb/viewer/tests/witness_tm_schedule_output_of_truth.js` — not a copy-pasted old witness.
   (Doesn't fit every shape — pixel-diff/DOM-interaction witnesses are still hand-rolled; use judgment.)

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
- **Anti-Drift / No Self-Invented Rules (HARD RULE, non-negotiable — 2026-07-06):** Every role boundary, admin-scope
  question, and workflow decision on this project is ALREADY DEFINED in this file + `MEMORY.md`'s feedback entries.
  There is nothing left to improvise. When challenged ("aren't you supposed to X?", "isn't this already defined?")
  or when unsure whether an action is in-scope: **STOP. Grep this file + the feedback memory files for the actual
  rule FIRST. Never fabricate a plausible-sounding self-restriction on the spot** — inventing a NEW boundary under
  pressure (e.g. "that's not my role" with no memory citation) is ITSELF the drift, not a correction. State the
  verified rule with its source, then act — don't oscillate, don't ask a permission question a disciplined read
  would have already resolved. Documenting findings/recommendations into a canonical `prompts/*.md` file (append
  a dated section) is ALWAYS in scope — see `feedback_prompt_file_organization.md` — it is not something to ask
  permission for, and it is not something to retract under pushback either. This is a DETERMINISM requirement:
  the whole project runs on documented, checkable rules, not per-session judgment calls that reset every drift.
- **Housekeeping is a standing duty, done unprompted, every time — not a crisis cleanup (2026-07-06):** Every
  session that adds to `MEMORY.md` or a `prompts/*.md` file checks, in that same turn: is this a NEW file when
  a canonical one already owns the topic (merge it in, delete the new one)? Did the entry add prose to
  `MEMORY.md` instead of a bare link (fix it now, don't wait to be told)? Is `PROGRESS.md`/`MEMORY.md` back over
  their line budgets (compact now)? This is not something the user asks for — `MEMORY.md` itself has carried a
  "links only, ≤80 lines" rule (`feedback_memory_links_only.md`) since 2026-06-04 and drifted back to 264 lines
  of prose TWICE before this rule was written. Check after every edit, not when it's already a mess again.
- **A session working a `prompts/#.md` file updates ONLY that file, never `MEMORY.md` (2026-07-06):** this is the
  root cause of the repeated `MEMORY.md` bloat above — task/builder sessions kept creating their own memory
  entries duplicating what their own prompts file already recorded in full. Findings/status/proof go in the
  prompts file's dated section, full stop. Writing to memory is a separate, deliberate synthesis pass for
  durable cross-session lessons, not a byproduct of finishing a task — see `feedback_prompt_file_organization.md`
  rule 0.
- **Deploy Flow (deploy/dev/ ONLY):** Edit → syntax check → verify all `§` tags exist → save test log → upload to dev bucket → smoke test URLs → fetch back and verify content → confirm file is loaded by viewer. ONE flow, never stop partway or ask user to check.
- **OCI MIME Rule:** EVERY `oci os object put` MUST include `--content-type` — OCI does NOT infer it from the extension; omitting it → `X-Content-Type-Options: nosniff` block + silent script failure. Full MIME table: `deploy/OCI_UPLOAD.md §RULES`.
- **Spec-First (ALL work):** Spec before code, spec before tests, spec before prompts. No implementation without a written spec section. New features: witness claim first, then implement.
- **Tests expose issues:** Every test must name the issue it proves or disproves. A test that passes without revealing whether the issue is solved is not a test.
- **Verify a code claim before it's load-bearing (2026-08-18):** Before a code-behavior claim drives
  a decision — dispatching on it, telling the user it's proven — re-read the file:lines and cite
  them, unless already read this same turn. Don't re-verify casual mentions. Sibling:
  `feedback_code_read_before_empirical_testing.md`. Example: `prompts/4D_GANTT_TM_REFACTOR.md` §S23 Part D.
- **Browser testing — §-log first, Playwright second:** Primary browser verification = whitebox `§`-tagged `console.log()` output. The coder reads `§` lines to confirm values, counts, and state are correct. Playwright is secondary — for wiring/deploy checks only (scripts load, buttons exist, DB returns data). Do NOT add Playwright tests for value verification — add a `§` log line instead. See `docs/archive/TestArchitecture.md` §Browser Testing. Run `node deploy/dev/tests/audit_specs.js` after any Playwright changes — must exit 0.
- **FUNDAMENTAL LAW — code and maths is the truth, never screenshots/visuals (hardened 2026-07-21,
  user had to repeat this after a prior-session warning was dropped):** For ANY continuous/geometric
  behavior — camera paths, orbits, motion over time, positions, angles, rates — the proof is the
  `§`-tagged log values PLUS numbers computed from real object state (position, tilt/pitch, azimuth,
  rate-of-change), read and asserted programmatically. Screenshots, "does it look right", and eyeballing
  a recording are NOT proof and must not be the verification method, even as a supplement — they are
  "programmatically bad" per the user's own words: unverifiable, non-reproducible, and not something a
  session can assert a pass/fail on. If a live-browser run is needed at all (e.g. to reach real
  navigation/raycast state a synthetic call can't), still extract the SAME kind of numeric truth from
  it — camera position/tilt/rate time series compared against the intended formula — never a screenshot
  as the evidence. This applies on top of, and hardens, the existing whitebox rules
  ([[feedback_whitebox_deduce_not_browser]], [[feedback_whitebox_not_playwright]]) — those already said
  this; this entry exists because it was violated anyway (dispatched a screenshot-capturing agent for
  the §CINEMA_ORBIT_V2 live-trial check) and had to be corrected twice.
- **Anti-Drift Policy:** Read `docs/archive/TestArchitecture.md` §Anti-Drift before adding BOMs, products, or geometry paths
- **Pre-Flight Citation:** Before code changes, cite the spec: `// Implementing BBC.md §X.Y — Witness: W-NAME`
- **Traceability:** Check `TestArchitecture.md` §Traceability Matrix before and after changes

## DB CHANGES = MIGRATION SCRIPT + SELF-HEAL LOADER, ALWAYS (hardened 2026-07-11 — read this FIRST)
**This is the PERMANENT architecture, not a workaround for LFS bandwidth.** Every DB content change —
schema/rules DB or a shipped extracted/library DB — ships as a small SQL script (`migration/*.sql`, or
`<app>/patches/<dbfile>.sql` for the self-heal convention below) plus, where the target is a live-served
app, a runtime loader that applies it client-side on load. **We would do this even with unlimited LFS
bandwidth** — it's smaller, reviewable as text, and reaches a live user without a binary ever moving.
**NEVER cite "LFS block"/"LFS quota" as the reason a DB fix isn't live.** That framing is WRONG — it
implies binary-push is the normal path and LFS is what's stopping it. It is not: binary `.db` commits are
banned outright, unconditionally, regardless of LFS quota status (see `.gitignore` — most DB paths are
already excluded on purpose, keep it that way). The only real reasons a DB fix isn't live are: (a) the
patch script hasn't been written yet, or (b) the consuming app's self-heal loader hasn't been wired yet
(Modeller has one — `str_walker_outliner.js` `_applyPendingPatch()`; Viewer got its own port 2026-07-11 —
`viewer/scene.js` `A._applyPendingPatch()` + `buildings/patches/*.sql`, mirror this pattern for any new
target). Report status in those terms, not "blocked by LFS."
- **Schema/rules/pattern DBs** (small, structurally regenerable — `duplex_rules.db`, `terminal_rules.db`,
  `ERP.db` seed data): `migration/*.sql` (Sacred Files below — `DV_<prefix>_rules.sql` is this pattern for
  mined rules) or the mining scripts that generate them (`run_RosettaStones.sh`/`onboard_ifc.sh`/
  `project_rule_mesh_binding.py`) — regenerate on demand, don't version the binary.
- **Extracted/derived building DBs** (`deploy/buildings/*_extracted.db`/`*_library.db`, mesh/geo DBs — NOT
  reproducible from a short SQL script, only from re-running extraction on the source IFC): distribute the
  FULL rebuilt binary via **OCI** (`deploy/OCI_UPLOAD.md` §RULES), never git/LFS; ship an incremental FIX
  to an already-distributed one via the patch+self-heal-loader pattern above.
- **Deliverable = patch AND loader together, not the patch alone.** A committed-but-unapplied migration
  script is not "done" — the loader wiring is part of the same task, not a follow-up.
- **A `git push` can be slow OR hang regardless of DB policy — it is INTERMITTENT, not a fixed cost and
  not a hard quota block (corrected 2026-08-12, superseding the 2026-07-11 note below).**
  `GIT_TRACE=1 git lfs pre-push` shows the mechanism: git-lfs first tries a "pure SSH transfer" protocol
  GitHub doesn't support, fails after ~3-7s, retries once more, THEN falls back to `git-lfs-authenticate`
  over SSH for the real push. **Measured behavior is inconsistent**, same repo, same session, back to back
  (2026-08-12, `bim-ootb` batch of 49 branch pushes): branch 1 completed in ~18.5s, branch 2
  (`feat/erp-odoo-descriptor`) still hadn't returned after 90s. Do not assume a longer fixed timeout
  "fixes" it — it doesn't reliably. **Working approach for a batch of pushes:** try each with a ~90s
  timeout; on a timeout, do NOT retry that same branch in a loop — skip it and move to the next one (this
  is trying a *different* operation, not retry-looping a failing one). Come back to any skipped branches
  standalone later. Applies to `bim-ootb`/`bim-compiler` regardless of whether the diff touches LFS
  content, since the pre-push hook always runs. Not a reason to fall back to committing a DB binary — the
  DB rule above holds regardless of push speed. (Original 2026-07-11 note, `bim-ootb` `fix/dw-datum-port` @
  `4ff22c0`, 2+ min hang on a zero-LFS-diff push — consistent with this same intermittent mechanism.)
- **Worktree/checkout caution, same mechanical cause:** don't `git worktree add`/`checkout` a branch whose
  LFS blobs aren't already in the local cache (`.git/lfs/objects`) without expecting a possible hang; branches
  already checked out in an existing worktree are safe (blobs already local). Applies to spawned Agent-tool
  workers too — tell them the same caution, not "don't touch DB binaries" (that's unconditional anyway).

## Worktree Hygiene — the OTHER LFS bandwidth drain (2026-07-10, same root cause, different mechanism)
**Committing new DBs (above) was only half the bandwidth story.** The other half: bim-ootb's
`modeller/mesh.db` (120MB) + `modeller/*_geo.db` are LFS-tracked, and DOZENS of parallel worktrees
(peaked at 49 in bim-ootb, 20 in bim-compiler) each pull a fresh 100–250MB blob from GitHub the moment a
branch whose mesh/geo data isn't already in the local LFS cache gets checked out. **Real end users never
cost LFS bandwidth at all** — they hit the deployed static site (GH Pages / OCI), never `git clone` — so
100% of the quota is dev/agent-side worktree churn. A second, fully separate clone (`~/Projects/bim-ootb`,
its own independent LFS cache) doubled bandwidth on any overlapping blob and has been removed (2026-07-10,
confirmed clean + 100+ commits stale first). Rules going forward:
- **Before `git worktree add`, always run `git worktree list` first.** If a worktree already exists for
  the branch/commit you need, reuse it (`cd` in, `git fetch`/`pull` if needed) — do NOT create a second one
  at a different path. This applies to Agent-tool prompts too: any prompt that spawns a verification/build
  agent must instruct it to check for and reuse an existing worktree before creating a fresh one.
- **One local clone per repo, no exceptions** — never `git clone` a second copy of `bim-ootb` or
  `bim-compiler` alongside the primary checkout.
- **Prune on sight, not on a schedule.** When a worktree's branch is fully pushed (`git rev-list --count
  origin/<branch>..<branch>` = 0) AND clean (`git status --short` empty), remove it
  (`git worktree remove <path>`) — don't let dozens accumulate "just in case." A worktree with unpushed
  commits or uncommitted changes is NOT safe to prune — leave those alone, they're someone's in-progress work.
- **`.claude/worktrees/agent-*` are harness-managed** — never manually `git worktree remove` these; they're
  the Claude Code tool's own isolation mechanism, not dev-created clutter.
- **MANDATORY at session closeout, not "when you notice" (hardened 2026-07-21 — 61 worktrees found
  accumulated, 26 confirmed prunable in one pass, despite a prior verbal "everyone clean up" that only
  reached sessions live at that moment):** a spoken/one-off cleanup ask does not persist — a fresh session
  has no memory of it unless it's a standing rule read here. So every session that used `~/bim-ootb` runs
  this before ending, not only when asked: for each worktree, check `ahead` (`git rev-list --count
  origin/<branch>..<branch>`) and `dirty` (`git status --short`); if both are 0, it's prunable. **Before
  removing, check nobody's actively inside it** — scan `for p in /proc/[0-9]*; do readlink -f "$p/cwd";
  done | grep '^/tmp/wt-'` and skip any path that shows up live, even if git-clean (a concurrent session may
  be mid-command there — pulling the directory out from under them is disruptive even when no data is at
  risk). Prune everything else that qualifies; leave dirty/unpushed/actively-occupied ones alone and move on.

## Sacred Files (edit with extreme care)
- `deploy/live/*` — PRODUCTION snapshot, never edit (see PRIME RULE)
- `migration/*.sql` — append only, never modify existing migrations. EXEMPT: `DV_<prefix>_rules.sql` — regenerated
  mined artifacts (written by `run_RosettaStones.sh`/`onboard_ifc.sh` each gate run, applied by `rebuild_erp.sh`),
  not ledger migrations; in-place regeneration is their normal lifecycle (decided 2026-07-03).
- `BuildingCompiler.java` — main orchestrator, many dependencies
- `RosettaStoneGateTest.java` — defines G1-G6 gates (compiler-reconstruction truth). NOTE: no CI in this repo runs it — "GREEN before commit" is a LOCAL discipline (Anti-Drift #5), not automation. See `docs/archive/TestArchitecture.md` §Truth Model (2026). The headless smoke subset runs via `.github/workflows/ci.yml` + `scripts/system_is_real.sh`.
- `X_M_BOM.java` / `X_M_BOMLine.java` — EntityType guards, GodMode bypass
