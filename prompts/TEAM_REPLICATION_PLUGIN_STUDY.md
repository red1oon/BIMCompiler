# ⚠ DO NOT REMOVE — Scope & Protocol
- **Scope:** a STUDY (no code) of how the Team / Replication feature becomes a **plugin of the Kernel ERP** instead of built-in host code. It is the focus of the NEXT session (owner, 2026-10-26: *"make a study how Team Replication feature can be a plugin for Kernel ERP (focus of new session after wrapping this session up)"*).
- **Source of truth:** every claim cites a file:line in bim-ootb `origin/main` @ 159d6506 (2026-10-26), the legacy source under `~/idempiere-dev-setup/idempiere/`, or a § of `prompts/TEAMWORK_FRAMEWORK.md` / `prompts/PLUGIN_SYSTEM_LANE.md`. Proposals are marked **PROPOSAL**.
- **Read the log after every run.** Spec before code; RED first; a mutant must prove it applied and a crash is not a kill (the lane's habits, `TEAMWORK_FRAMEWORK.md` RESUME block).
- **Twin rule + AD-LAYER LAW apply:** port the iDempiere mechanism, one implementation per responsibility, deletion budget (CLAUDE.md §AD-LAYER LAW 1, 4, 5, 6).

---

## §0 Why this is in line with the doctrine (not a new idea)
- **CLAUDE.md §AD-LAYER LAW 6:** *"CORE = trade cycle + accounting … Everything else … arrives like any other extra module through Ninja/plugins. Ninja/plugin handling is the ONE core extension enabler."* Team / replication is not in the CORE list → by the owner's own rule it should be a module.
- **Legacy does exactly this:** iDempiere's replication is an OSGi plugin, not core — `org.adempiere.replication` (+ `org.adempiere.replication.server`), `ActivatorImpl.java` (48 lines) starts it; `model/ExportModelValidator.java` (278 lines) is a **ModelValidator** that, in `initialize(engine, client)` (:98), reads `AD_ReplicationStrategy` → for each `AD_ReplicationTable` of type Merge / Broadcast / Reference calls `engine.addModelChange(tableName, this)` (:125-131) and for each `AD_ReplicationDocument` calls `engine.addDocValidate(tableName, this)` (:139-144); `modelChange` acts on `TYPE_AFTER_NEW / TYPE_AFTER_CHANGE` (:160-167), `docValidate` on `TIMING_AFTER_COMPLETE / CLOSE / REVERSECORRECT / VOID / REACTIVATE` (:193-205); transports are pluggable `IExportProcessor`s (`TopicExportProcessor`, `HDDExportProcessor`); the receiving side is `org.adempiere.replication.server` (`ReplicationProcessor`, `TopicImportProcessor`, `FileImportProcessor`).
- **TEAMWORK doctrine §2 item 11:** *"Team off = pixel-identical; additive only."* A plugin that is not installed contributes nothing — that guarantee becomes structural instead of the `?team=1` conditional script tags it rests on today.

## §1 The legacy → ours mapping (EXTRACTED)
| Legacy replication plugin | Ours today | Note |
|---|---|---|
| `AD_ReplicationStrategy` / `AD_ReplicationTable` / `AD_ReplicationDocument` (dictionary rows; type Merge/Broadcast/Reference/Local) | the signed compiled **plan** (`erp/team_plan.js`; scriptor `build/scriptor/flows.json` → `emit_erp_plan.js`) read by `common/comm/team_scope.js` | ours is signed and compiled; legacy is plain dictionary rows. The scriptor already TYPES tables from `AD_ReplicationTable` when present (§16.16b) |
| `ExportModelValidator.modelChange` AFTER_NEW/CHANGE | `crud_overlay.js:1952-1960` `_teamPush(rows, db)` — a commit observer that hands the whole op group to `TeamSync.onCommit` | legacy is per record; ours is per commit GROUP (§13.7 all-or-none) |
| `ExportModelValidator.docValidate` AFTER_COMPLETE … | the DocAction group rides the same commit observer (SET_STATUS + its consequences) | |
| `IExportProcessor` (Topic = JMS, HDD = files) | the post office pipes (`common/comm/comm_pipe.js`: GitHub pipe, folder pipe, web relay) | same idea: the transport is pluggable |
| `ReplicationProcessor` / `IImportProcessor` (server side applies) | every device's fold + `crud_overlay.js:3168` `teamRebuild` = `rebuildSide` (the sidecar rebuilt as a projection of the comm log) | ours has no server: every device imports |
| plugin activation (OSGi `start`) | `idempiere.html:756-760` script tags written only with `?team=1` | |

## §2 The plugin host we already have (EXTRACTED — `prompts/PLUGIN_SYSTEM_LANE.md` Phases A–D DONE, live)
- `erp/plugin_registry.js` (514 lines): a `.foldbundle` = one ES module `{manifest, activate, deactivate}`; lifecycle INSTALLED → RESOLVED → ACTIVE → STOPPED → UNINSTALLED with `PLUGIN_*` audit ops; `requires` with semver + topological order; **engineVersion gate**; **atomic activation** (a failed `activate` undoes every contribution, :353-380); **HOT chunks** (`manifest.chunks.hot`, loaded and activated BEFORE the bundle is ACTIVE "so no covered save can run without them", :365-370); **owner-scoped, undoable contributions** via `buildCtx` (:156-186): `modelval.registerValidator(table, timing, name, fn)`, `callout.*`, `process.registerHandler/defineProcess`, `docAction.registerModel/registerDocAction`, `docFsm.register`, `form.register`, `lens.register`, `pill.register`, `docClass.register`, `postTokens` (layered), and **`dict.insert` — dictionary rows staged by the bundle and removed on stop** (`stageDictionary`, :304-309).
- `erp/plugin_overlay.js` (601 lines): the Plugin Engine pill — install by URL, state in IndexedDB `fold_plugins`, re-activates on open. `erp/plugin_release.js`: plugins "each signed + reversible" (SYSTEM_ADMIN_LANE §6). Example bundles: `erp/plugins/*.mjs` (`friendly_ops`, `libero_*`, `ninja_create`).
- The model layer fires AFTER timings on the UI save: `crud_overlay.js` calls `ML.run(… timing: 'AFTER_SAVE')` once; `model_layer.js:534` then fires `AFTER_NEW|AFTER_CHANGE` + `AFTER_SAVE` validators; `ad_modelval.js:27-28` lists the DocAction timings (BEFORE/AFTER_COMPLETE, VOID …). **Not yet measured X of N** — §5 Phase 0.

## §3 Every place the ERP host touches Team today (the coupling map — EXTRACTED)
| # | Touchpoint | Where | What it does |
|---|---|---|---|
| T1 | boot loading | `erp/idempiere.html:756-760` | writes the comm engine + `team_*.js` + `team_sync.js` script tags ONLY with `?team=1`; "parser-blocking so TeamSync exists before the first commit" |
| T2 | commit observer | `erp/crud_overlay.js:1952-1960` `_teamPush` | every commit's rows → `TeamSync.onCommit(rows, db)`; inert without `window.TeamSync` |
| T3 | projection | `erp/crud_overlay.js:3168` `teamRebuild: rebuildSide` | the sidecar rebuilt from the comm log under the cross-tab lock, chain re-sealed |
| T4 | DocAction list | `erp/idempiere.html` `_docActionAccess` (:3141) | `TeamSync.notExecutor(table, pk)` removes every action for a non-executor (FL-8 E2b, §38.6) |
| T5 | record-open seam | `erp/idempiere.html:4982` `_emitRecordSeam` | a DOM event only `team_sync.js` listens to (people strip, "is editing this") |
| T6 | Team pill | `erp/idempiere.html:6980` | `TeamPanel.open()` |
| T7 | status-bar chip | `erp/team_sync.js` `ensureChip()` | DOM injected into `#idmp-status` (`idempiere.html:488`) |
| T8 | offline cache | `erp/sw.js:285-291` | precaches `team_panel.js`, `team_avatars.js`, `team_guide.html`, `team_trust.js`, `team_scope.js`, `team_versions.js` |
| T9 | the Modeller | `modeller/team_sync.js`, `modeller/teams_embed.js` | a second host of the same comm engine — **the Modeller has no plugin registry** |
Code that would move into the bundle: `erp/team_sync.js` + `common/comm/*` ≈ **3,277 lines** (`wc -l`).

## §4 Each touchpoint as a plugin — exists / gap (STUDY RESULT)
| # | Plugin form | Extension point today | Gap / decision |
|---|---|---|---|
| T1 | the bundle `erp/plugins/team.mjs` installed (IndexedDB), the comm engine as **HOT chunks** | ✅ hot chunks + engineVersion gate | prove "no commit before the observer is registered" by witness (the guarantee T1 gives today by being parser-blocking) |
| T2 | **legacy shape:** `modelval.registerValidator(table, AFTER_NEW/AFTER_CHANGE/AFTER_DELETE, …)` per planned table + DocAction AFTER_* timings, registered from the plan = `ExportModelValidator.initialize` | ✅ `registerValidator` | **GAP:** ours ships a commit GROUP (§13.7 all-or-none); a per-record validator sees one record at a time → needs a generic **after-commit-group** extension point (or the validator collects and the group seam flushes). Decide: per-record (legacy-faithful) vs group (our atomicity) — likely both: records via validators, flush at the group seam |
| T3 | a **projection provider** contributed to the host | ❌ none (`kernel_ops` is named among the SIX points in `plugin_registry.js:6-7`, but nothing like `rebuildSide` is exposed to `ctx`) | **GAP:** a generic `ctx.kernel.rebuild(build)` seam = today's `rebuildSide`, kept in the host (it is generic, table-agnostic) and handed to the bundle |
| T4 | **legacy-faithful option:** the bundle stages `AD_Document_Action_Access` rows `IsActive='N'` for non-executor roles through `ctx.dict` (owned; removed on stop ⇒ team off = gone), and the host's ported `MRole.checkActionAccess` (§38.6) does the rest — **no team code in `_docActionAccess`**; an admin sees the rows in the Role window (closes §38.6 limit (4)) | ⚠ `dict.insert` exists but stages at ACTIVATION; the executor map changes at runtime (a POLICY) | **GAP:** runtime re-staging (`dict.replace` owned by the bundle) — or keep a generic access-overlay seam. PROPOSAL: re-stage, so the host has zero team code |
| T5 | the bundle listens to the existing DOM event | ✅ (a plain event) | none |
| T6 | `ctx.pill.register('team', …)` | ✅ `pill.register` | none |
| T7 | a **status-bar slot** | ❌ no extension point | **GAP:** a generic `ctx.status.register(id, render)` (or the chip moves into the pill badge) |
| T8 | plugin code cached for offline | ⚠ unknown — `plugin_release.js` / sw handling of installed bundle URLs not read yet | Phase 0 question |
| T9 | the Modeller | ❌ no plugin host | **owner scope question** (§6 Q1) |

## §5 PROPOSAL — the next session's plan (spec → RED witness → build, one phase at a time)
- **Phase 0 — measure, no code:** (a) a witness that the UI save, the grid save, every ported process and every DocAction fire `AFTER_NEW/CHANGE/DELETE` + the DocAction AFTER timings through `ad_modelval`, **X of N** over the dictionary's windows/tables (AD-LAYER LAW 2) — the legacy replication shape needs them all; (b) read `plugin_release.js` + `erp/sw.js` for how an installed bundle's code is cached offline; (c) list what of `common/comm/*` the Modeller needs (T9).
- **Phase 1 — the missing generic seams, in `plugin_registry.js buildCtx`** (each owner-scoped + undone on stop, none naming a table): after-commit-group observer (T2), projection provider (T3), status-bar slot (T7), runtime dictionary re-staging (T4). Each with its own small witness in the PLUGIN_SYSTEM_LANE style.
- **Phase 2 — package:** `erp/plugins/team.mjs` (manifest: id, version, `requires` engine version, `chunks.hot` = the comm engine, `dictionary` = none at install); `activate(ctx)` registers T2–T7 from the signed plan; `deactivate` = nothing (the registry undoes). **Deletion budget:** remove the `?team=1` tags (T1), `_teamPush` (T2), the `TeamSync.notExecutor` call (T4) and `ensureChip`'s DOM reach (T7) from the host — state lines +/−; add-only = not done.
- **Phase 3 — witnesses:** the 16 Team browser witnesses green with Team installed AS A PLUGIN (unchanged counts) · **W-TEAM-OFF:** not installed → the page is byte-identical (DOM + globals + kernel rows) to a page that never knew Team · install → stop → uninstall leaves no trace (owner-scoped undo, staged access rows gone) · a team space survives a plugin upgrade (engineVersion + the §16.31 versioning).

## §6 Questions for the owner (decide or say "decide for me")
- **Q1 (T9):** the Modeller has no plugin host. Give it the same `plugin_registry.js` (one plugin, two hosts), or keep Team built-in there for now?
- **Q2 (T2):** per-record validators (legacy-faithful, like `ExportModelValidator`) flushed at a commit-group seam, or keep the group observer only? (Recommendation: both — validators decide WHAT, the group seam decides WHEN, so §13.7 atomicity holds.)
- **Q3 (T4):** stage `AD_Document_Action_Access` rows (legacy-visible in the Role window) instead of the runtime overlay? (Recommendation: yes — fewer special cases, and an admin sees what the team rule does.)

## §7 Risks named before starting
Ordering (a commit before the bundle's hooks are live); per-record hook cost on big DocAction groups (a 54-op Complete, §36.1); two implementations during migration (AD-LAYER LAW 5 — the built-in path must be DELETED in the same PR that installs the plugin path); the Modeller diverging if Q1 says "keep built-in"; offline (T8).

---

## §8 ONE plugin or two? — and the separation of concern (owner, 2026-10-26: *"Study if the Team should combine with Replication as a singular plugin. And good separation of concern where it doesn't do any legacy core document function. It just manages multi user comm etc."*)
### §8.1 Answer: ONE runtime plugin, three layers inside it; the compiler stays outside
- **Why one.** Team and Replication share ONE signed log, ONE roster and trust anchor, ONE admission and ONE Visit cycle: the people strip, the chip, the plan reader and the executor map all read the same `CommStore`. Two plugins would need either two stores (two truths of who is in the team) or a plugin-to-plugin protocol over one store — a second implementation of one responsibility (AD-LAYER LAW 5). Legacy agrees: replication is ONE plugin with pluggable transports (`org.adempiere.replication`, §0).
- **The three layers (each knows less than the one above):** **L1 comm** — `common/comm/comm_*.js` + `op_versions.js`: seal, send, fetch, order, roster, admission, versions, trust. Knows NO table and NO host; shared by the ERP and the Modeller. **L2 replication** — the plan reader (`team_scope.js`) and the host adapter (`erp/team_sync.js` translate / project): which tables and columns travel, in which direction, for which role; reads the dictionary, names no table in code. **L3 team UX** — pairing, people strip, chip, pill, panel, guide.
- **Outside the plugin:** the **scriptor** (`build/scriptor/*`) is a BUILD tool; its output, the signed plan, is DATA the plugin loads (as a 2Pack is to an iDempiere plugin). The **comm relay / pipes** are a dumb post office (immutable twin principle (2)).
### §8.2 The boundary contract — what the plugin MAY and MAY NOT do
**MAY:** carry (seal, send, fetch); order and fold deterministically; **admit or refuse an op** by signature, roster, role and the signed policy (that is *who may send what* — a comm gate, not document behaviour); **project the results it receives into the local store as data** (a received Complete is its result rows, never re-executed, FL-8); **express team policy as CORE DATA** the core already understands (access rows, import rows, scheduler rows); run its own UX.
**MAY NOT:** run a DocAction, post, author a document, give a document its number, compute stock / price / tax, decide access in its own code, or show its own copy of a core message. Those are the core's — ported legacy classes (`ad_docfsm.js`, `model_*.js`, `erp/processes/*.js`, `ad_access.js`).
### §8.3 Audit of today's code against the contract (measured 2026-10-26, bim-ootb main @159d6506)
| # | Where | Verdict | Fix (as data, the core does the work) |
|---|---|---|---|
| A1 | `erp/team_sync.js` — any call into the model layer, DocAction FSM, process engine | ✅ **none** (grep `ModelLayer\|ML.run\|processIt\|runJava\|AdProcess\|AdDocFsm\|dispatch*` = 0 hits) | — keep it so; a witness should pin it (W-TEAM-NO-CORE: the plugin's files name none of these) |
| A2 | `erp/idempiere.html` `_docActionAccess` → `TeamSync.notExecutor` (FL-8 E2b, §38.6) | ⚠ **crosses the line**: team code inside the core's DocAction list | the plugin writes `AD_Document_Action_Access` rows `IsActive='N'` for non-executor roles (owned by the plugin, removed on stop); the core's ported `MRole.checkActionAccess` does the filtering; the host line is DELETED. An admin sees the rule in the Role window (study §4 T4 / Q3 — now **recommended by the contract, not only by tidiness**) |
| A3 | the engine's document-number claims: `comm_admit.js:29-46` (BOOKING / BLOCK), `comm_store.js:97,174` (`docno_ref`, `seqByUU`) | ⚠ **crosses the line**: deciding document numbers is a core function (`AD_Sequence`); no host calls it today (guide §36.2) | keep only the generic **KEYCLAIM** primitive (a unique key, no meaning); retire BOOKING/BLOCK from the plugin. Numbering stays core: under FL-8 the processor's own sequence numbers its documents, and station tickets are namespace keys (§16.16a); legacy's own answer for per-org numbers is `IsOrgLevelSequence` (C8, §3) |
| A4 | `erp/team_sync.js:31` `MSG_CRM = 'Current record was changed by another user, please ReQuery'` rendered in the plugin's own `#team-conflicts` box | ⚠ a core message copied as a literal and shown outside the core's display | the plugin raises the conflict; the core shows it through its own message lookup (`AD_Message` `CurrentRecordModified`) and its own record-level error path — same look and feel as legacy (TWIN rule) |
| A5 | admission's access check — the host's `access(roleId, client, org, table)` adapter (`team_sync.js:75`) over `ad_access.js` (the `MRole.canUpdate` port) | ✅ the plugin CALLS the core's access function, it does not re-implement it | — the model for every other case |
| A6 | E3 `not-executor` (`comm_store.js` admission of `SET_STATUS`) | ✅ a comm gate: *who may send this op*, from signed policy data; executes nothing | — |
| A7 | G-1…G-3 processor (§38.8) | ✅ by design: the station's declaration arrives as `I_Order` rows; **Import Orders (AD_Process 206) is CORE** (a ported legacy process), run by the processor's core | restate §38.8 B2 as core work, not plugin work |
| A8 | the scriptor's RULE treatment (`R1 replenish-rule`: *on F1, run GenerateReplenishment*) | ⚠ if the RUNTIME plugin ever triggers a process, that is business orchestration inside comm | a RULE row compiles to a core **AD_Scheduler / process** entry on the processor (legacy triggers imports and replenishment by scheduler); the plugin delivers rows and never starts a process |
### §8.4 What this changes in the plan (§5)
- **Phase 1 seams shrink:** T4 needs no seam (A2 becomes data); the conflict seam (A4) goes to the core's existing error path; the remaining generic seams are the after-commit-group observer (T2), the projection provider (T3) and a status-bar slot (T7).
- **Phase 2 deletion budget grows:** delete `_docActionAccess`'s team branch (A2), BOOKING/BLOCK + `docno_ref` from the engine (A3, with their witnesses `witness_comm_docno_booking` / `_modes` retired or turned into KEYCLAIM witnesses), the hardcoded `MSG_CRM` (A4).
- **New witness W-TEAM-NO-CORE (Phase 3):** the plugin's files (L1–L3) contain no call into the core's document engines (the A1 grep made a test, with a mutant that adds one call), and every team policy the plugin applies is visible as core data (access rows, import rows) — counted X of N over the plan.
### §8.5 Owner questions added
- **Q4 (A3):** retire document-number BOOKING/BLOCK from the comm engine (numbering stays core: processor sequences + station ticket keys)? Recommendation: yes.
- **Q5 (A8):** a RULE row compiles to a core scheduler/process entry on the processor, never a plugin-run process? Recommendation: yes.
