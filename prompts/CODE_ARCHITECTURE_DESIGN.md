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
6. **Order:** A → B → D → E → F → C (reasons in §ORDER). Status table at the end. **Exception (owner, 2026-11-13, #604), now spent:** §F.4 X0 slice 1 ran
   first and is **✅ DONE** (bim-ootb #2920 / PR #2922, result in §F.4). The order is back to A → B → D → E → F → C, so the NEXT session starts
   **A0** (§READY) and asks **A-1**. Before that, ask **F-9** once (it decides whether §-Lens jumps ahead). §F.0 Z1–Z3 are built (PR #2919).
7. **Where to start (§READY):** each part's first step that needs NO owner decision. Run that while the first decision is with the owner.

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

**Steps:** A1 the Env object (one owner file; name per decision A-2), taking its date from the login context the way legacy does · A2 move
each core file's clock/ID reads onto it, one file per PR, posting/parity witnesses identical before/after · A3 **scan witness `W-CORE-PURE`**: an
AST scan of the core file list that fails on any forbidden call outside the Env owner and the `§` log helper. **Red control:** a copied core verb
with a planted `Date.now()` must make it FAIL. Prints `§CORE_PURE files= forbidden= verdict=`.

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
**DECISIONS:** *(none yet)*

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
OPEN DECISION F-3 (revised 2026-11-13, #606): which assistant help? (a) the "Context for this file" command only; (b) plus a **local MCP fact
server** that answers the same questions from the same generated files for ANY assistant (Claude Code, Copilot, Cursor, Continue …), never
calling a model; (c) VS Code's own chat-participant API, which only VS Code's chat uses. Proposal: (a) now, (b) next, drop (c).

**Shape:** per DEV_TOOLKIT §8/§10 (above): one Extension Pack of separate extensions, plain JavaScript using only the `vscode` API (no npm
dependencies, no compile step), in `bim-ootb/devtools/vscode/`. **Install:** a developer working from the repo symlinks the folder into
`~/.vscode/extensions/` (works air-gapped, no internet). Releases ship the `.vsix` on GitHub Releases, built with `npx @vscode/vsce package`.
`vsce` runs through `npx` on the release machine only and is never a repo dependency.
**Order inside F:** §F.4 X0 slice 1 first (APP field F12/hover, `§TAG` hover). It needs no decision and gives the most daily help. Then the
bump prompt (after F-6). Then DEV_TOOLKIT's first slice (its §6, after its spikes S0/S2). Then the rows that wait on B/D/E.
**OPEN DECISIONS (all of F, in reading order):** F-1 Fetch back headless or HTTP only (§F.2) · F-2 the perf budgets (§F.3) · F-3 assistant tools or
the "Context for this file" command only (above) · ~~F-4 one pack or separate extensions~~ and ~~F-5 folder install or `.vsix`~~: **answered** by
DEV_TOOLKIT §8/§10, 2026-10-06 (separate extensions in one Extension Pack; `.vsix` on GitHub Releases, folder symlink for repo developers).
The 2026-11-13 draft listed them as open, and the first vetting pass even proposed "folder only", against §10. Corrected under #604 · F-6 "bump on save" automatic or a prompt?
Proposal: a prompt (a quick-fix), never silent · F-7 a hosted per-PR preview, and where (§F.3)? Proposal: none for now; Run local on the PR branch.
**Witnesses:** each feature has a node test that runs its provider against fixture files (no VS Code needed for the logic: a small fixture-side
stub of the `vscode` API calls the provider uses, no npm), e.g. W-X0-APPDEF: for
20 sampled `APP.x` reads, the provider returns the `APP_SURFACE.md` definition line (red control: a phantom field → "no definition", not a wrong one).

### §F.0 Zero-code editor wins + what other projects do (owner, 2026-11-13: *"Yes, and put in what can be built cheaply and without impact now"*, #606)

The review that led here: VS Code helps most when project knowledge lives in plain repo files and the tools only read them. Well-known projects
were surveyed from general knowledge (not measured here). What they teach, sorted by cost for this project:

| Technique | Known from | Here | Cost / impact | State |
|---|---|---|---|---|
| Multi-root workspace (`.code-workspace`) | multi-repo projects | bim-ootb + bim-compiler in one window: search, F12 and `§TAG` lookups cross both | one JSON file, dev-side | **Z1, build now** |
| Problem matchers on task output | compilers, linters | a witness's `FAIL` / `INCONCLUSIVE` / `VACUOUS` lines become clickable Problems entries | a few lines in `.vscode/tasks.json` | **Z2, build now** |
| Snippets (`.code-snippets`) | most frameworks | a witness skeleton that follows `witness_kit/contract.js`, and cannot PASS unedited | one JSON file | **Z3, build now** |
| Logpoints (log from the debugger, no code edit) | standard debugging | a `§` probe without editing or committing the file | built in; nothing to build | note it in `docs/DeveloperGuide.md` §6 when that doc is next edited |
| JSON Schema for config files (`json.schemas`) | Kubernetes, GitHub Actions | autocomplete + squiggles in `pills.json`, `pills_idmp.json`, `crud_ops.json`, later the B manifests | per file: extract the schema FROM the committed files, witness that every committed copy validates (Ajv, already a dependency of `contract.js`), red control a mutated copy | cheap next (= DEV_TOOLKIT T18) |
| Language-service plugin (Vue's Volar, Angular's language service) | frameworks whose links exist only at runtime | teach VS Code's TypeScript that `A.x` = `APP.x`: F12, find-references and rename all work | a `typescriptServerPlugins` entry in an extension; no npm | **decision F-8** |
| Values from the last run beside the code (Wallaby, Quokka) | test runners | each `§` line's last logged value next to the code that printed it, read from saved logs | = DEV_TOOLKIT X1 §-Lens | **decision F-9** |
| Facts server for any AI assistant (MCP) | assistants that read repo context files and MCP servers | "who owns X", "which witness proves this file" answered from the generated files, for any assistant; no model call | small local process | **F-3 revised** |
| Tag tree in the sidebar (Todo Tree) | many repos | every `§TAG`, grouped by spec file | X0 feature, after slice 1 | later |
| Guided code tours (CodeTour) | onboarding | "how a sale gets posted", step by step, stored in the repo | needs the CodeTour extension (developer's choice), or X0 reads the same `.tours/` files | later |
| Boundary lint rules (Nx module boundaries, dependency-cruiser) | monorepos | "core may not call the clock" as a live squiggle | = A3 W-CORE-PURE as an ESLint rule | after A |
| Dependency graph view | Nx, Madge | what loads what | from B's manifests | after B |
| Test explorer + coverage display | Jest, Vitest, VS Code's own coverage view | run one witness from the editor, see its verdict beside it | from E's proof map | after E |

Lessons that bind every F feature: (1) **generate the knowledge, never hard-code it in the tool**; (2) **prefer open standards** (language
servers, JSON Schema, MCP) so VSCodium/Cursor/other editors benefit; (3) **stay light**: activate on demand, cache indexes, never rescan per
keystroke; (4) **never guess**: "no definition" beats a wrong jump.

**Z1–Z3 build spec** (bim-ootb, one tracker issue, one PR; dev-side files only, nothing reaches a page, no new dependency):
- **Z1 `bim.code-workspace`** at the bim-ootb root: folders `.` (name `bim-ootb`) and `../bim-compiler` (name `bim-compiler`), no settings of its
  own (each folder keeps its own `.vscode/settings.json`, incl. bim-compiler's stale-copy hiding from BIMCompiler #596). Open it with *File → Open
  Workspace from File*. Plain folder opening keeps working as today.
- **Z2 problem matchers** on the task *"Run this witness"*: after the tail, the task also prints the log's `FAIL`, `INCONCLUSIVE` and `VACUOUS`
  lines (at most 20), each prefixed `<relative file>: `. Two matchers read them: `FAIL` → error, `INCONCLUSIVE|VACUOUS` → warning, `kind: file`
  (the whole witness file, since witnesses print no line numbers). The tail and the full log in `logs/` stay as they are.
- **Z3 `.vscode/witness.code-snippets`**, prefix `witness`: the file header (`WITNESS`, `ISSUE THIS PROVES OR DISPROVES`, `POPULATION`,
  `Command`), `require` of `witness_kit/contract` (default path `../../witness_kit/contract`, the `<app>/tests/` place, part E), and a
  `Witness(name)` chain with `population` / `schema` / `invariant` / `redControl`. The population starts EMPTY, so `contract.js` §W-EMPTY-POP
  prints `FAIL population-nonempty` and exits 1: an unedited skeleton fails loud and can never PASS.
- **Witness `W-EDITOR-ZERO-CODE`** (`scripts/tests/witness_editor_zero_code.js`, node, next to `witness_global_types.js`), one `§` line per issue:
  - Z1 *"search and F12 cannot cross the two repos"*: parse the workspace (comments allowed), each folder resolves to a git checkout whose
    `origin` is the expected repo → `§EZC_WORKSPACE folders=2 resolved= verdict=`. Red control: a copy with a wrong path → that folder unresolved.
    No `../bim-compiler` on this machine → INCONCLUSIVE, not PASS.
  - Z2 *"a failing witness is not clickable in Problems"*: run the task's own command (read from `tasks.json`, variables substituted) in a
    temp folder on 3 fixture witnesses (one prints `  FAIL`, one `INCONCLUSIVE`, one passes), apply the two matcher regexes (also read from
    `tasks.json`) → `§EZC_MATCHER fail_errors=1 inconclusive_warnings=1 pass_hits=0 verdict=`. Red control: the passing fixture must give 0.
  - Z3 *"a new witness starts without the contract, or can PASS unedited"*: expand the snippet body (placeholders → their defaults) into a temp
    `app/tests/` beside a link to the real `witness_kit`, run it → must exit non-zero and print no `fail=0` summary →
    `§EZC_SNIPPET unedited_exit= unedited_pass=N verdict=`. Red control: the same skeleton with one real row filled in must PASS, proving the check
    can see a PASS.
- **Done when:** the three `§EZC_*` lines PASS on a machine with both repos, red controls behave, the PR is merged on bim-ootb `main`.
- **RESULT 2026-11-13 — bim-ootb #2918 / PR #2919.** Built as specced. `node scripts/tests/witness_editor_zero_code.js --layout-root ~/bim-ootb`:
  `§EZC_WORKSPACE folders=2 resolved=2 red_unresolved=Y verdict=PASS` · `§EZC_MATCHER fail_errors=1 inconclusive_warnings=1 pass_hits=0
  exit_kept=Y verdict=PASS` · `§EZC_SNIPPET uses_contract=Y unedited_exit=1 unedited_pass=N filled_pass=Y verdict=PASS` · `§EZC checks=3
  verdict=PASS`. Against `origin/main`'s files (before): all three FAIL, exit 1. From a `/tmp` worktree (no bim-compiler beside it): Z1
  INCONCLUSIVE, as specced. `tests/audit_sw_precache.js` unchanged (268 found, 0 missing). Not checked by a witness: that VS Code itself
  accepts `kind: "file"` and shows the entries (the regexes and the task command are what the witness runs).

### §F.4 X0 slice 1 — BUILD SPEC · ✅ DONE 2026-11-13 (bim-ootb #2920 / PR #2922; owner, 2026-11-13: *"GO with your insight"*, #604)

**Scope:** two read-only features, nothing else. A new extension folder `bim-ootb/devtools/vscode/x0-navigator/`. Open a bim-ootb tracker issue
first, then one PR `Fixes #N`. Nothing outside `devtools/` changes. Nothing in it loads in a page: `devtools/` is not in any `PRECACHE_ASSETS`,
not in `scripts/minify_pages.js` `INCLUDE_DIRS`, and no page tags it. Check all three in the PR (`§X0_ISOLATION precache=0 minify=0 tags=0`).

**Layout:** `package.json` (`name: x0-navigator`, `publisher: bim-devtools`, `engines.vscode`, `main: extension.js`,
`activationEvents: ["onLanguage:javascript"]`, **no `dependencies`**) · `extension.js` (thin glue: registers providers, reads settings) ·
`lib/app_surface_index.js` and `lib/tag_index.js` (pure node modules, no `vscode` import, so witnesses run them directly) · `tests/`.

**X0-1 `APP.x` go-to-definition + hover.**
- **Input:** bim-ootb `internal/APP_SURFACE.md` (generated by `scripts/gen_app_surface.js`, task *"Regenerate editor indexes"*). Parse the
  `## All fields` table (`field | written at | writes | reads`) and the `## Phantom fields` table (`field | first read site | prod?`).
  Parse by table header, never by line number.
- **Trigger:** the word under the cursor is the property of a member expression whose object is `APP`, `A` or `app` (the three spellings,
  `gen_app_surface.js` R5/R6).
- **Definition:** return the `written at` location. **Hover:** `written at <file:line> · <writes> writes · <reads> reads`. For a phantom:
  `PHANTOM — read, never written (first read <file:line>)`, and no definition. For a field not in the index: nothing at all (never a guess).
- **Stale guard:** before jumping, read the target line. If it does not contain `.<field>` the hover says `index stale — run "Regenerate
  editor indexes"` and no jump is offered. A wrong jump is worse than none.
- **Witness `W-X0-APPDEF`** (`tests/witness_x0_appdef.js`, built from `witness_kit/contract.js`, node only): parse the real `APP_SURFACE.md`;
  take a fixed sample (every 50th row of `All fields`, sorted by name); for each, resolve and read the source line. Print
  `§X0_APPDEF rows= sampled= resolved= line_matches= verdict=`. PASS needs `line_matches == sampled`. **Red controls:** a phantom field → no
  location; a made-up field → none; a fixture index whose line is shifted by one → `stale`, never a jump. `rows=0` → INCONCLUSIVE.

**X0-2 `§TAG` hover** (= DEV_TOOLKIT T4, its §5.3).
- **Index:** every `§[A-Z][A-Z0-9_]+` in `prompts/*.md` and `docs/**/*.md` of bim-ootb, and of bim-compiler when the setting
  `bimDevtools.compilerRoot` points to it (default: a sibling folder `../bim-compiler`; never a hard-coded home path). Each hit is kept as
  `file:line` + the nearest heading above it.
- **Hover** on a `§TAG` inside JS (strings and comments included: this is a lookup, not a code claim): up to 5 spec places, places where the tag
  sits in a heading first, then `printed by:` up to 5 `.js` lines that contain it. A tag with no spec place says `no spec found` (DEV_TOOLKIT
  §5.3), never silence.
- **Witness `§DEVTK_SPEC`** (`tests/witness_x0_taghover.js`, name taken from DEV_TOOLKIT §5.3): `§HOSTED_BEFORE_HOST` resolves to a list that
  contains bim-compiler `prompts/4D_MODEL_INTEGRITY.md` (one mention, line 1347 on 2026-11-13: assert by file, not by line); a made-up
  `§ZZ_NOT_A_TAG` → `no spec found`. Print `§DEVTK_SPEC tags= files= known_hit=Y|N fake_none=Y|N verdict=`. bim-compiler root not found →
  INCONCLUSIVE, not PASS.

**Glue check `§X0_ACTIVATE`** (node, with a fixture-side stub of the `vscode` calls used): `activate()` registers exactly 1 definition provider
and 2 hover providers for `javascript` → `§X0_ACTIVATE definition=1 hover=2`. This proves wiring without anyone opening VS Code
(PRIMAL LAW 1: the owner's eyes are not the test).

**DECISION F-8 — ANSWERED 2026-11-13: own providers** (see DECISIONS). The question was: build X0-1 as X0's own definition/hover providers (this spec), or as a
**TypeScript language-service plugin** (`typescriptServerPlugins` in `package.json`, no npm), the way Vue and Angular teach the editor links that
exist only at runtime? The plugin also gives find-references and rename for `A.x`/`APP.x`; it is more machinery and harder to witness without the
TS server. Proposal: own providers for slice 1 (pure node modules, witnessed directly); the plugin later if find-references/rename are wanted.
**OPEN DECISION F-9:** move DEV_TOOLKIT X1 **§-Lens** (each `§` line's last logged value shown beside the code that printed it, read from saved
logs like `~/.cache/bim4d/` and `logs/`) to right after slice 1, ahead of DEV_TOOLKIT's own first slice? Proposal: yes. It brings "read the log"
(PRIMAL LAW 3) into the editor, which no other feature does.
**Not in slice 1:** bump prompt (F-6), CodeLens, badges, owner warnings, Run & Ship, perf monitor, `.vsix` release.
**Done when:** `§X0_APPDEF … verdict=PASS`, `§DEVTK_SPEC … verdict=PASS`, `§X0_ACTIVATE definition=1 hover=2`, `§X0_ISOLATION precache=0
minify=0 tags=0`, each red control FAILs as specified, PR merged on bim-ootb `main` and verified there.

**RESULT 2026-11-13 — bim-ootb #2920 / PR #2922, squash `d7ca9eb3` on `main`. ✅ DONE (witness).** Built as specced, own providers (F-8).
Files: `devtools/vscode/x0-navigator/` = `package.json` (no dependencies) · `extension.js` · `lib/app_surface_index.js` · `lib/tag_index.js` ·
`README.md` (symlink install) · `tests/witness_x0_{appdef,taghover,activate,isolation}.js`. Re-run on merged `main`, logs read:
- `§X0_APPDEF rows=1693 sampled=34 resolved=29 phantoms=5 line_matches=34 verdict=PASS` · whole index, for information:
  `§X0_APPDEF_ALL rows=1693 fields=1693 definition=1411 stale=0 phantom=282 phantom_table=282`
- `§DEVTK_SPEC tags=4346 files=719 known_hit=Y fake_none=Y verdict=PASS` (index of both repos builds in ~0.5 s: `§X0_TAG_INDEX … build_ms=461`)
- `§X0_ACTIVATE definition=1 hover=2 commands=1 checks_failed=0 verdict=PASS`
- `§X0_ISOLATION precache=0 minify=0 tags=0 sw_files=4 html_files=82 deps=0 red=Y verdict=PASS` · CI green · `audit_sw_precache` 268 found, 0 missing.
- Red controls all behave: sample shifted one line → FAIL; phantom → no location; made-up field → nothing; shifted fixture index → `stale`;
  spec places without `4D_MODEL_INTEGRITY.md` → FAIL; made-up tag → `no spec found`; planted precache/minify/page-tag hits each count 1;
  no bim-compiler root → INCONCLUSIVE.
- **How the spec was read (three places it did not say):** (1) the sample is every 50th row of ALL rows, so it holds phantoms; a phantom has no
  definition and is judged at its `first read site` line instead (`line_matches == sampled` still required). (2) bare `A.x` / `app.x` trigger only
  in a document that binds the name: the generator's own R5/R6 regexes, copied verbatim, and the witness FAILs if they drift from
  `scripts/gen_app_surface.js`. `window.APP.x` counts, as it does in the generator. (3) `printed by:` lists log calls outside tests first,
  then other code, then tests.
- **FINDING 1, the committed index was stale:** the first witness run FAILED (`line_matches=30` of 34; whole index 109 of 1405 written fields
  pointing at a line that no longer mentions the field). `internal/APP_SURFACE.md` was last generated 2026-11-09 and nothing regenerates or checks
  it when source moves. Fixed in the same PR by regenerating (the one change outside `devtools/`; `tests/witness_app_surface.js` ALL PASS). It
  **will drift again**: until something keeps it fresh, the stale guard turns those fields into "index stale", not into wrong jumps.
  → new **OPEN DECISION F-10** below.
- **FINDING 2, the generator indexes string literals:** a witness that quoted a god-object access in a string put 3 fake fields into the real
  index (R9 strips comments, not strings; R8 excludes only the generator and its own witness). The X0 witnesses now assemble such sample text from
  pieces and assert `devtools/` adds 0 rows. The class is still open for any other test file: a small item for `gen_app_surface.js`'s owner.
- **Not proven by a witness:** how VS Code itself draws the hovers and follows the `file://…#L<line>` links. `§X0_ACTIVATE` drives the real
  providers through a stub of the `vscode` calls, not through VS Code. The taghover witness ran against the local bim-compiler checkout.
**OPEN DECISION F-10 (new, from FINDING 1):** how is `internal/APP_SURFACE.md` kept fresh? (a) a CI step that regenerates it and fails the PR when
the committed copy differs; (b) X0 regenerates it in memory on demand and the committed file stops being the source; (c) leave it manual
(the stale guard already prevents wrong jumps). Proposal: (a). It is one node step, no browser, and it also keeps the file honest for readers
who do not use VS Code.

**DECISIONS:**
- 2026-11-13, owner, on F-8 (own providers or a TypeScript language-service plugin; recommendation: own providers): *"advice me and proceed"*.
  → advised own providers (pure node modules, witnessed directly; the plugin can follow if find-references/rename are wanted) and built that.
- 2026-11-13, owner (#604): *"GO with your insight"*, in reply to the proposal: "make F's source-reading features the Fable session's first task".
  → §F.4 X0 slice 1 runs first, before A0. F-4/F-5 were already answered by DEV_TOOLKIT §8/§10 (above), so no question was needed.

---

## §ORDER — why A → B → D → E → F → C

A is the only part tied to correctness (replay, posting dates), and A0 is cheap and settles a real question. B removes a whole class of stale-file
mistakes and is the data source for D, E and half of F. D and E are small once B exists. F's first features need nothing. **Owner, 2026-11-13: they go
first, as §F.4, the next session's bounded task**; A0 runs in parallel if a second session is free. C is long and best done slowly, module by module, after B/D make ownership visible.

## §READY — what a fresh session can start with no owner decision (vetted 2026-11-13)

| Part | Starts with no decision | First decision to ask | Why that one first |
|---|---|---|---|
| A | **A0: W-REPLAY-CLOCK** (spec above). Read-only for production code; it settles whether a real bug exists | A-1 core list | A3 and every A2 PR need the list |
| B | **B0: generator in check mode** (manifest built from today's files, regenerate, byte-compare; no file changes) | B-1 `?v=` numbers or hashes | B1 writes `?v=`; B0 does not |
| C | nothing; waits on B and D | C-1 part names + owners | |
| D | nothing new; the multi-publisher list already exists (`types/globals.gen.d.ts`) | D-1 where the questions list lives | needs B's `owner` field |
| E | `witness_kit/paths.js` (no behaviour change; witness: the same suite verdicts before and after) | E-1 the `PROVES:` header format | |
| F | §F.4 X0 slice 1 ✅ DONE (PR #2922). Nothing else in F starts without a decision | F-9 §-Lens next, or DEV_TOOLKIT's first slice | it picks F's next slice |

Ask the owner **one decision per message, with the recommendation** (START HERE 2). 21 decisions are open (STATUS: F-8 answered, F-10 added). Next session: A0, and ask F-9.
After it, start A0 and B0, and ask A-1 while they run.

## §M — re-measure before quoting

| Number | Command (bim-ootb root) |
|---|---|
| APP fields / phantoms | `node scripts/gen_app_surface.js` → header of `internal/APP_SURFACE.md` |
| script tags per page | `grep -cE '<script[^>]+src=' viewer/viewer.html erp/idempiere.html modeller/modeller.html` |
| clock/random/network calls | `node <bim-compiler>/scripts/code_arch/clock_probe.js <bim-ootb root> [pathspec …]` (committed 2026-11-13, #602; espree AST, comments never count; needs bim-ootb `node_modules`). Baseline @`a7c329e5`: default `erp/*.js` → `files=301 with_calls=58 calls=160`; the A-1 core pathspecs (`'erp/processes/*.js' 'erp/callouts/*.js' erp/ad_callout.js erp/doc_poster.js 'erp/model_*.js' erp/rule_fold.js erp/crud_core.js erp/kernel_ops.js`) → `112 / 19 / 32` (7 of them in `kernel_ops.js`); the viewer/4D set (`viewer/cpm_schedule.js 'viewer/schedule_*.js' viewer/tm_core.js common/room_graph.js`) → `11 / 7 / 32`. A3's W-CORE-PURE ports this probe into bim-ootb |
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

## STATUS
| Part | What | State |
|---|---|---|
| A | pure core + Env (A0 replay-clock fact first) | open: 4 decisions · A0 ready to start (§READY) |
| B | manifest per app | open: 4 decisions · B0 ready to start |
| C | named APP parts | open: 2 decisions |
| D | owner table | open: 2 decisions |
| E | proof map | open: 2 decisions · `paths.js` ready to start |
| F | VS Code extension (X0 Navigator + Run & Ship + perf-impact monitor + DEV_TOOLKIT pack); AI optional | **§F.4 X0 slice 1 ✅ DONE (witness)** (bim-ootb PR #2922) · §F.0 Z1–Z3 ✅ (PR #2919) · open: 7 decisions (F-1, F-2, F-3, F-6, F-7, F-9, F-10) |

## §VET — 2026-11-13 vetting pass (issue #602), against bim-ootb `main` @ `a7c329e5`

**Checked and correct as written** (file:line read): `ad_callout.js:116` (`DATE: '#Date'`), `:157` (wall-clock fallback), `:840` (`Env.now`);
`doc_poster.js:203`; `model_asi.js:70`; `processes/InvoiceGenerate.js:38`; `processes/ImportOrder.js:68`; `kernel_ops.js:941`; `viewer/scene.js:163`;
`viewer/tm_dash.js:688`; `erp/sw.js:400-425` (lazy parts precached); iDempiere `org.adempiere.base/.../util/Env.java:110` (`DATE = "#Date"`).
Every file and tool the spec names exists (`scripts/lib/find_ts.js`, `gen_app_surface.js`, `gen_global_types.js`, `tests/audit_sw_precache.js`,
`tests/run_witness_suite.js` with `--filter`, `scripts/bump.js`, `.vscode/tasks.json` "Serve repo", `.vscode/launch.json` 4 configs,
`eslint.globals.json`, `prompts/DEV_TOOLKIT_NO_AI.md` with T2/T4/T6/T14/T21/T25/T26, S0/S2, §3/§6/§10), except `witness_kit/paths.js` and
`devtools/` (both are proposed, now marked as such). Duplicates confirmed: `ERPKernel` ×2, `Bonsai` ×3, `ERP` ×4 (`types/globals.gen.d.ts`),
`routewalker.js` ×2.

**Corrected in place:**
1. A-3 proposal took the day from `SESSION_START`'s UTC `ts`, which would bring back the fixed "yesterday after local midnight" bug. Now: local day.
2. A-2 named one env; three exist (`ad_callout.js:116`, `model_layer.js:91`, `genesis.js:729`).
3. A-1's "15 core files" were never named and their probe was lost. Probe committed (`scripts/code_arch/clock_probe.js`), core set named, numbers re-measured.
4. P1 "1 production file uses ES modules": 53 `.mjs` plugin/migrate files are ES modules loaded by `import()`. B gains decision B-4 (plugins).
5. F.2 "Pages serves `main` directly … live bytes == committed bytes": the deploy is a workflow that minifies viewer/erp/common JS. Fetch back now
   checks `version.json` `sha` + `CACHE_VERSION` + minified bytes.
6. F.3 preview on `deploy/dev/`: that folder is bim-compiler's, not a bim-ootb preview. Now F-7.
7. F.2 "respects the PUSH PAUSE switch": the switch is prose. Now the step always asks.
8. Tracker #599 was closed by #600 while all parts were open. Now each part opens its own issue.
9. Added: value vs timing clock reads (A-4), `tm_core.js` visual `Math.random`, the 4D cache key + §I owners, alias-as-accessor cost and the protected
   lane limit (C), merge-conflict rule and one-time `?v=` re-download (B), witness-contract owner + INCONCLUSIVE (E), "Done when" for C/D/E,
   F decisions renumbered F-1…F-7 in reading order, the repo-of-a-path line, §READY.

**Numbers re-measured** (§M commands): APP fields 1,688 / alias-only 1,321 / phantom 277, of which 172 in production (`§APP_SURFACE files=3214`);
script tags 247 / 206 / 59; `?v=` 245 / 213 / 67; `§ED_TYPES_GEN … multi_publisher=3`; witnesses 1,357 (per folder in P5); contract users 65;
home-folder paths 665; `performance.mark/measure` users 0; live `CACHE_VERSION` viewer v1709, erp v1068, modeller v272 (live `version.json`
`sha 1e3833b5`, `main` had moved on by one merge during the pass).
**Not changed:** the design itself (parts, order, rules). Every owner decision is still open. Nothing was asked or decided for the owner.
