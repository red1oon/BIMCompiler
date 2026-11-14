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

## ▶▶ RESUME HERE FIRST (rewritten 2026-11-14 at the close of the long Fable session; replaces every earlier resume block)

Owner, closing that session: *"Wrap up session, update latest context to prompt as we continue non Fable session as work here is
matured."* → from here the lane continues in ordinary (non-Fable) sessions. This block is the whole hand-over; each section it names
holds the evidence, and the sections now live in the archive (START HERE 7). Nothing below is owed from memory: if a line here and a
`§` section disagree, the section wins.

**1. A-2, A-3, A-4 ANSWERED 2026-11-14 (see Part A DECISIONS); next is A1 (build).** (Old text kept below for the wording.) The last message put this to the owner; ask it again, on its own:
> Today the ERP code gets "now" and "today" from three objects that do not know about each other: the login context the callouts use
> (it carries legacy's own `#Date`), the transaction's `env` (22 files read it), and the fixed-time object used when a company is born.
> Which becomes the one source the core files ask? **Option 1 (recommended): extend the login context**, the other two become views of
> it (legacy has one context, so the twin stays a twin). **Option 2:** a new small object that all three feed.

Then **A-3** (what happens when no date was injected; it also settles bim-ootb **#2996**) and **A-4** (timing reads), one per message,
each with the recommendation written in Part A. A1 (the Env object) may start once A-2 is answered; A2 needs A-3 and A-4.
Record every answer in the owner's words in Part A's DECISIONS block.

**2. Where each part stands (details: the STATUS table at the end, and the section named).**

| Part | State | Next step |
|---|---|---|
| A | A0 ✅ `§REPLAY_CLOCK … match=Y` in both time zones: a replay applies the ROWS, not the process, so the clock fallbacks are tidy-up (Part A "A0 RESULT"). A-1 ✅ answered (the core list) | A-2 (above) → A1 |
| B | not started | **B0 needs no decision** (generator in check mode, no file changes, §READY). Then ask B-1 |
| C, D | not started; wait on B | — |
| E | not started | `witness_kit/paths.js` needs no decision (§READY). Then ask E-1 |
| F | **every row that needed no decision and no part A–E data is built** (§F.4–§F.20) | nothing unblocked. See 4 below |

**3. What Part F is today (bim-ootb `devtools/`, all merged, all re-run on `main`; the Developer Guide §4.1, §4.2, §6.1 is current and live).**
X0 Navigator: F12 + hover on a field of the shared object · Find All References (§F.19) · `§TAG` hover with the last provable value or the
named reason (§F.15, §F.16) · the grey "last:" line, which also reads `~/.cache/bim4d` (§F.15 step 1) · *Context for this file* (§F.16) ·
Run & Ship (Run local, Check, Cost if deployed, Fetch back) · the one-click cache bump on save (§F.20, decision F-6) · snippets `witness`,
`slog`, `spec` (§F.0 Z4). Facts server `devtools/mcp/x0-facts/` (8 read-only tools, OFF by default). The index now says `PHANTOM?` where it
cannot be sure (§F.17). Witnesses: the list in `devtools/vscode/x0-navigator/README.md`; the real-editor one is
`tests/realvsc/run.js --go --compiler-root <bim-compiler>` (last: `§X0_REALVSC vscode=1.146.0 … refs=Y bump=Y … context=Y … verdict=PASS`).
Two films: `~/Videos/Editing_Real_Code_EN_AFTER_2026-11-14_v5.mp4` (the owner: it is fine as it is, no recut) and
`~/Videos/Editing_Real_Code_2_EN_AFTER_2026-11-14_v1.mp4` (§F.18; the owner has not reviewed the cut; English only).

**4. Open with the owner, none of it started.**
- **F-1** (should Fetch back also run a headless browser) · **F-2** (size and speed budgets) · **F-7** (a hosted preview per pull request).
- **F-12 step 2:** a token so CI-bot merges also deploy (§F.13). The repo has no secrets; only the owner can create it.
- **A bake, on his go:** the first bake after bim-ootb #2977 writes a `§LOG_STAMP`; read its log and check that a "last:" line lights up.
  Until then `§LENS_REAL_EXTRA … stamped=0`: nothing new shows.
- **His hands-on dry run:** `~/VSCcheatsheet.txt` (26 steps, his own worktree `~/bim-ootb-dryrun`, not yet created). He said it can come
  later. When he reports, steps 21–26 are the first time a person uses the 2026-11-14 features: what differs from the sheet is a finding.
- **Sequel film:** his review of the cut (title, chapter names and wording are a first draft); other languages.

**4b. Film 3 plan (owner, 2026-11-14: split screen, VSC above, the real ERP window below; ENGLISH ONLY for now; house style = `prompts/FILM_NARRATION.md`
HOUSE STYLE, scripts in a new `scripts/film_ide_erp_debug/`, film never pushed).** Owner: *"Yes, and do English only for now"*, then *"The other scenarios are good so keep note for later"*.
- **Scenario 1 (the film): "The invoice dated yesterday" = bim-ootb #2996.** 00:30 local at +08, an order shipped and invoiced; ERP window shows DateInvoiced = the 12th,
  `§REPLAY_CLOCK_SESSION_DAY … same=N`. In VSC: hover the `§` tag, F12 on `env` to `ws_kernel.js:80` (`toISOString()` = UTC day), Find All References (the producers of "now"),
  fix, Run local, window shows the 13th, `same=Y`. **Cannot be filmed until the A2 fix is made AND checked against the legacy oracle** (twin rule). No staged fix.
- **Scenario 2 (later): "Replay can't lie"** = the A0 witness: replay a day's journal 3 days later, hash equal in both zones; plant a re-run of the process, the invoice date
  moves and the hash breaks; the ERP window shows the same books before and after (red-control story).
- **Scenario 3 (later, candidate): "A posting that won't balance"**: take a REAL posting-preview defect from the ERP lane's `§` logs (never invented), trace the red `§` line, fix, the
  ledger below balances.
Every number on screen comes from a `§` line. Order: A1/A2 build first, then Scenario 1.

**5. Open, no owner needed, not started.**
- **bim-ootb #2996** (the headless kernel's session day is the UTC day; `§REPLAY_CLOCK_SESSION_DAY tz=Asia/Kuala_Lumpur … same=N`). Not
  checked against the legacy oracle yet; it is `erp/ws_kernel.js`, the ERP lane's file: ask that lane before editing. Fix under A-3.
- **11 "untied" fields** the index flags `PHANTOM?` (§F.17): four one-off binding forms. Do NOT add more text patterns; tying them needs
  the parser, a Part C question.
- **The 4D cache's `witness.log` files** carry no `§LOG_STAMP` (§F.15 step 1, "Not done"): their folder name is a code key, a different
  proof. Left for a decision.
- **bim-ootb issue #2974 and PR #2975 still say "138 of 281"**; the measured figure is 130 (§F.17, §F.18). The design file and the guide are
  corrected; those two GitHub texts are not.

**6. Traps this lane has paid for (each cost a retraction or a broken `main`).**
- **A file under `devtools/` that spells the shared object's access out in a string becomes a fake field in the index** (three times:
  §F.4 FINDING 2, §F.16, §F.19). Run `node devtools/vscode/x0-navigator/tests/witness_x0_appdef.js` before any PR that adds or edits a
  file there. CI does not run it.
- **A witness's "made-up" name must not appear in a spec** (§F.17 FINDING 1): use a per-run suffix.
- **The stamp rule refuses a log made with more than 10 edited files**: a `realvsc` run on a dirty worktree fails `lens` / `last_value`
  for that reason alone. Commit first, then run.
- **Docs deploy from a clean worktree:** first `git show origin/gh-pages:glassbowl_data.db > docs/glassbowl_data.db` (live but
  gitignored), then `DRY_RUN=1 scripts/safe_gh_deploy.sh`, then the real one, then fetch the live page back (§F.17).
- **`*.log` is gitignored:** a log the spec says is committed needs `git add -f` (§F.18).
- **bim-compiler has no auto-merge:** `gh pr merge --squash` by hand. bim-ootb has it: `gh pr merge --auto --squash` right after
  `gh pr create`, then wait, then re-run the witnesses on `main` and Fetch back.
- **The local checkout of bim-compiler is on another branch** (`fable/meshdb-livewire`): read this file with
  `git show origin/master:prompts/CODE_ARCHITECTURE_DESIGN.md`, edit it in a worktree off `origin/master`.
- **Worktrees:** a unique `/tmp/wt-<task>-<id>` each, removed when clean and pushed, never `--force` (another session's work was
  destroyed that way, 2026-11-14). Check `git worktree list` first.
- **Measure before quoting:** "138 of 281" (a looser count) had to be corrected to 130. A number in a PR body or to the owner comes from a
  `§` line, with the command that made it.
- **Pages (§F.13):** the source is the workflow build since 2026-11-14; every merge today published correctly
  (`§SHIP_FETCH … verdict=PASS` after each). A CI-bot merge still does not deploy (F-12 step 2).

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

---

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
1. **Put the node-only X0 witnesses into CI's fast checks**, `witness_x0_appdef.js` first. CI passed two changes that broke `main`'s own
   witnesses (archive §F.16, §F.19 "caught before the PR" was luck the second time). They need no browser and run in seconds.
2. **Stamp the extension's version at pack time.** `package.json` says `0.1.0` for every build, so an installed copy cannot tell that it is
   stale after a pull. Let `pack.js` write the commit into the version (or a visible "built from" line in a command's output).
3. **Fix the two stale GitHub texts** (bim-ootb issue #2974, PR #2975: "138" should read 130) with a comment, not an edit of history.

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

## §READY — what a session can start with no owner decision (as of 2026-11-14)

| Part | Starts with no decision | Next decision to ask | Why that one |
|---|---|---|---|
| A | nothing more (A0 ✅, A-1 ✅) | **A-2**, asked and not answered | A1 needs it |
| B | **B0: generator in check mode** (manifest built from today's files, regenerate, byte-compare; no file changes) | B-1 `?v=` numbers or hashes | B1 writes `?v=`; B0 does not |
| C | nothing; waits on B and D | C-1 part names + owners | |
| D | nothing new; the multi-publisher list already exists (`types/globals.gen.d.ts`) | D-1 where the questions list lives | needs B's `owner` field |
| E | `witness_kit/paths.js` (no behaviour change; witness: the same suite verdicts before and after) | E-1 the `PROVES:` header format | |
| F | the three small PRs of ADVICE C | F-1, F-2, F-7 | |

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

## STATUS (2026-11-14)

| Part | What | State |
|---|---|---|
| A | pure core + Env | **A0 ✅** rows are replayed, `match=Y` in both zones (bim-ootb PR #2997) · **A-1 ✅** the core list · open: A-2 (asked, not answered), A-3, A-4 |
| B | manifest per app | not started · B0 ready · open: B-1 to B-4 |
| C | named APP parts | not started · open: C-1, C-2 |
| D | owner table | not started · open: D-1, D-2 |
| E | proof map | not started · `paths.js` ready · open: E-1, E-2 |
| F | VS Code extension + facts server | every unblocked row built (§F index) · open: F-1, F-2, F-7, the token for F-12 step 2 |

**§VET** (the 2026-11-13 vetting pass of every claim in this file) is in the archive.
