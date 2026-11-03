# ⚠ DO NOT REMOVE — Code hygiene review, 2026-11 (scope + rules)

**Scope:** read-only review of bim-ootb `origin/main` (viewer/, modeller/, erp/, common/, hr_bim_asset/, capex/) and the
code this repo ships copies of (`build/comm`, `build/kernel`, `build/erp`), for **memory hogs** and **redundancy**.
No product code is changed by this review; fixes are proposed here and done in their own lanes. Read the log after every run.

User ask (2026-11-03): *"deploy agent if needed to review the codebase not to drift ie causing mem hog, or redundancy..
keep good software hygiene"*.

## §1 Yardsticks (already law — the review measures against these, invents none)
- CLAUDE.md §PERF BUDGET: heap ≈ 0.17 GB per million vertices; count vertices; release what is off screen; **never
  duplicate big buffers**; save deltas not the DB; log heap/verts in a `§` line after heavy passes.
- CLAUDE.md §AD-LAYER LAW 5: **one implementation per responsibility**; deletion budget (add-only = not done).
- `prompts/4D_MODEL_INTEGRITY.md §I`: the ownership table — duplicate, disagreeing owners are defects.

## §2 Method
Static reading + grep + measurement scripts that do not touch the GPU or run bakes
(`feedback_no_autonomous_bakes_without_permission`, `feedback_gpu_vram_contention_crashes_user_tab`). Each finding
gives file:line evidence, an estimate of cost (bytes / vertices / lines) only where it can be computed from the
code, and a fix proposal with its deletion count.

## §3 Findings (2026-11-03, bim-ootb origin/main 342fb4eb)
Three static reviewers (Viewer memory · cross-app/cross-repo redundancy · ERP). Items marked ✔ were re-read by hand
this session; the rest carry the reviewer's file:line and are unmeasured at runtime (no bakes/GPU, per §2).

### A. Memory — whole-DB copies (the dominant pattern; violates "save deltas, not the DB")
- ✔ **A1 Load patch chain** `viewer/scene.js:2032-2075` — main → light-field → qto patches each open a sql.js DB,
  `export()`, close: ~3× DB size at peak during load. Fix: one open, all SQL, one export.
- ✔ **A2 Save, split building** `viewer/scene.js:936-965` — `new Database(A.db.export())` + every geo table through
  `exec("SELECT *")` into JS arrays + a second export. Multi-GB peak on large geo DBs. Fix: ATTACH/chunk, or save the pair.
- **A3 Persist per edit** `viewer/kernel_ops.js:150`, `viewer/schedule_author.js:3418`, ✔ `erp/kernel_ops.js:135`,
  `erp/team_sync.js:140`, `erp/idempiere.html:917` — whole-DB `export()` to IDB after each edit burst (ERP ~27 MB → ~54 MB
  transient). Fix exists in-tree: crud_overlay's per-op IDB store (`_hydrateSide`).
- ✔ **A4 ad_seed.db (27 MB) opened by up to 8 Viewer modules** (diff, find_erp_push, hba_lens, schedule_author_ui,
  whatif_panel, tm_gantt_build ×2, tm_lifecycle_api, proj_order_state); 3+ held for the session (~135 MB resident). Fix:
  one memoised `APP.erpSeedDb()`.
- **A5** `erp/crud_overlay.js:2188` `legacyDb` never closed; `erp/mfg_whatif.js:14` clones the live DB per what-if.

### B. Memory — geometry kept past its use
- ✔ **B1** `viewer/helpers.js:95` `_fullIndex = arr.slice()` per filtered merged mesh, never released.
- **B2** `viewer/streaming.js:3155` merged buffers coexist with their `meshCache` templates (~24 B/vertex extra; suspected).
- **B3** `viewer/contact_floor.js:71-91` floor triangle cache kept until the building changes; `light_zones.js` shell soup
  capped at 6 M tris (~216 MB transient) with no `§` bytes line.
- **B4** `viewer/fx_still_refine.js:326-342` three full-res HalfFloat RTs, no dispose (~200 MB GPU at 4K).
- **B5** Permanent intervals with no teardown (chainage_grid, wing_2d, civil_sections, panels 500 ms, ERP `_rsTick` 1 s,
  team_terms/seatbelt 1 s).

### C. Redundancy — one implementation per responsibility
- **C1 Tax ×3** `erp/erp_engine.js:522`, `erp/doc_poster.js:452`, ✔ `erp/model_trade.js:33` (MTax port) — two rounding
  scales (10 vs 12 dec). Owner: model_trade; ~35 lines delete.
- **C2 Posting ×2-3** doc_poster.js (1,615 lines) derive* + cost fns beside model_post.js (Doc_* port) and erp_engine
  complete*. Retire doc_poster derive* once model-layer parity is witnessed (~900-1,100 lines).
- **C3 Dead verbs in a shipped file** `erp/erp_engine.js` — ~700 of 1,396 lines have no browser caller (✔ completeInOut
  only defined/exported); drifted 223 lines from `bim-compiler/scripts/erp_engine.js`.
- **C4 Two ERP UI engines** erp.html/ad_ui.js (2,711) + ad_data/ad_charts beside idempiere.html; glassbowl.html a third
  host that keeps the `completeFanout*` per-table fallback alive (crud_overlay.js:2302-2476, the bulk of the 11 AD-layer
  table-name branches). Retiring the two hosts removes most drift (~3,600 lines).
- **C5 Doc-number / id allocators ×6** (crud_overlay legacy AD_Sequence bump :2685, ad_data MAX+1, doc_poster MAX+1,
  pipo, pos_lens, ws_kernel) — MAX+1 races across tabs.
- **C6 Viewer ↔ Modeller forks drifting:** routewalker (≥450 shared lines), grid_kinematics (~240), ✔ kernel_ops (Modeller
  lacks the Viewer's `READONLY_OPS` persist skip → whole-DB persist on read-only ops), patch loader, composeGhostsFromAggregates
  (93 lines verbatim), bcf_export, bom_tree. Move cores to `common/` as `common/comm` already is.
- **C7 4D owner duplicate:** support/contact grid in `viewer/cpm_schedule.js:64-120` and `viewer/support_sweep.js:393-450`
  (§I ownership-table class; currently agree).
- **C8 Cross-repo drift (no sync check):** `build/room_walker.js` v2 vs `viewer/lib/room_walker.js` v3 (§STOREY_DATUM_FLOOR
  fix missing in build/); `build/disc_walker.js` vs `modeller/disc_walker.js` (1,044 diff lines); room_type_classifier;
  build/erp/kernel_ops, pill_builder, redpill vs hr_bim_asset. `build/comm` ↔ `common/comm`: all 9 files identical ✔-clean.

### D. Dead weight / vendored duplicates
- ✔ **D1** `viewer/lib` and `modeller/lib` byte-identical web-ifc (6.1 MB + 1.3 MB wasm), sql.js, planegcs, OrbitControls
  (~8.6 MB); three.js r186 in different builds per app; ✔ modeller importmap = `three.webgpu.min.js` while it also imports
  `three.module.min.js` (two THREE copies possible). Viewer precaches `three.webgpu.min.js` (820 KB) for every user.
- ✔ **D2** `viewer/effects.js.pacefloor` (5,128-line backup; live effects.js is 24 lines). `sandbox/` 4.3 MB spike.
  `oplogpic/app.js` inlines qrcode (~1,300 lines).
- **D3** httpvfs/sqlite.worker stack in `viewer/lib` (~2.6 MB) has no caller today ✔ (comments only) — **owner decision,
  not a delete:** CLAUDE.md §PERF BUDGET names httpvfs range reads as the growth path.
- **D4** ERP: unreferenced feed_fold.js, chat_lens.html, spike_writepath.html, slipverify/; `erp_key_epochs.js` precached
  but never loaded; agent .zip copies of their own source dirs; tracked binary DBs in erp/ (~28.9 MB; Pages serves them —
  policy vs deploy decision, AGENT_QUEUE §PAGES-SERVES-THE-BRANCH).
- **D5** bim-compiler `build/scriptor/` — 753 tracked run outputs (~11 MB) incl. `_kw_old/` pre-change comm copies.

### E. Proposed order (each its own lane, spec + witness first, deletion count stated)
1. A4 shared ERP seed opener + A5 close leak (small, big resident win).  2. C6 kernel_ops READONLY_OPS port to Modeller.
3. A1/A3 delta persist (fix exists in-tree).  4. D1/D2 shared `common/lib`, delete backups/spikes.  5. C1 one tax owner.
6. C4/C2/C3 retire the old ERP hosts and folds (largest deletion budget).  7. C8 cross-repo parity check in CI.
Add a `§MEM` heap/bytes line to A1, A2, B3 so the next review reads the cost from a log instead of the code.

## §4 Wave 1 (owner 2026-11-03: "You decide") — status per item
- ✅ **A1 DONE (witness)** — bim-ootb #2553 (squash-merged, live sw v1672, `scene.js?v=75`; live `scene.js` carries `§PATCH_CHAIN`).
  W-PATCH-CHAIN-ONE-OPEN PASS on the real Hospital_meta.db: opens/exports 3/3 → 1/1, content identical to the pre-change
  oracle in 6 scenarios, 4/4 mutants killed; FAILs on the old code. Full spec + result below.
- ✅ **D2 DONE** — `viewer/effects.js.pacefloor` deleted in the same PR (0 refs before; live URL now 404).
- ⏸ **C6 NO-OP, not built** — the Modeller commits no READONLY op type (only `SESSION_START` via commitOp; geometry ops via
  commitGroup; `BUILDING_OPEN` appears only in `modeller_history.js` labels). Porting the Viewer's `READONLY_OPS` gate would
  change nothing measurable; the drift stays listed under C6 for the `common/` consolidation.
- ⏸ **A5 not built** — `erp/crud_overlay.js:2188` `legacyDb` is opened only on the ONE-TIME migration of a pre-fix op-log
  sidecar (small); no witness covers that path. Worth a `close()` when the hydrate path next gets a witness.
- ℹ **D4 correction** — `erp/erp_key_epochs.js` is NOT dead: it is a ported, witnessed (W-ROSTER-VERIFY) trust module that
  no page loads yet — a wiring gap, not a delete.
- ✅ **A3a DONE (witness) — lost persist guards restored** — bim-ootb #2560 (squash-merged; live viewer sw v1675, erp sw v964,
  `erp/kernel_ops.js?v=14` carries `§KRN_PERSIST_DEFER`; `viewer/kernel_ops.js` 404). Found while starting A3: the Viewer loads
  ONLY `erp/kernel_ops.js`; the viewer copy stopped loading 2026-08-10 (#1271) but kept receiving guards, so every element
  pick has exported + stored the whole building DB since then (42 MB on LTU), and the 2026-06-12 P0 foreign-db guard was off.
  Restored both (+ commitGroup rule); dead copy deleted (−580). W-ONE-KERNEL-OPS 16/16; baseline fails exactly the 9
  restoration claims. W-PERS-5b now judges code not comments (a comment had made it PASS) → INCONCLUSIVE on the decision below.
  ✅ **A3a-key RESOLVED → A3b DONE (witness)** — bim-ootb #2562 (live viewer sw v1677, erp sw v965, `erp/kernel_ops.js?v=15`).
  The question was ALREADY ruled on record (found by the owner-requested prompts check, 2026-11-03), so no new decision
  was needed: 4D_GANTT_TM_REFACTOR §S70 ("edits vanishing on reload is a GAP, not a design choice"; whole-DB cost measured
  and accepted, Hospital 252 MB/86 ms), HISTORY_PERSIST_RECALL §LOCKED-2 (the signed log always records), SEAM_IDENTITY_AUDIT
  (cacheKey wired into 1 of 10 callers — migrate the rest), KERNEL_TIMEBOMB_AUDIT T5 (one write path). My earlier "first
  time / stale shadow" worry was wrong on both counts: ScheduleAuthor.persistDb already writes this key since 2026-08-23,
  and cachedFetch §R6a ETag/Content-Length revalidation owns staleness (persist writes the 'dbs' store, never
  'revalidation'). Also new: the superseded raw-url copy is deleted after a canonical write (`§KRN_PERSIST_RAW_RECLAIM`).
  W-ONE-KERNEL-OPS 17/17 (baseline 13 fail, mutant 4 fail); witness_gantt_edit_persist 18/0 (W-PERS-5b PASS on code).
  **Lesson:** before calling something an owner decision, grep prompts/ for the ruling — the record usually has it.
  Still open from T5: `modeller/kernel_ops.js` is a third copy (C6); T5's boot assertion ("refuse to run if two copies
  define window.KernelOps") is not built. SEAM_IDENTITY_AUDIT's other unmigrated cacheKey callers not re-checked here.
- ✅ **A4 DONE (witness)** — bim-ootb #2557 (squash-merged, live sw v1673; live `proj_order_state.js` carries `persistShared`).
  Open question answered from code: What-if slips stay in JS until Accept (`commitSlip`/`acceptSlip` are its only writes),
  so it shares the instance; it keeps its private-seed fallback when the store has no C_ProjectPhase. W-ONE-PO-STORE 13/13:
  store opens 1 across diff + find_erp_push + whatif + schedule_author_ui (was up to 4 × 27 MB), cross-visibility without
  reopen, external change → reopen + stale write refused, 2 mutants caught, vacuous → INCONCLUSIVE. `refresh()` no longer
  forces a re-parse (stamp check owns it). Existing: s9_pure 8/0, whatif_authored_sync 9/9, s7_gate 25/0, sw audit 0 unlisted.
  ~90 lines of private OPFS code deleted. Left as is: hba_lens / tm_gantt_build / tm_lifecycle_api read the plain seed.

### §A4 SPEC — one Project-Order store in the Viewer (written 2026-11-03, not built)
**Measured (read, bim-ootb origin/main):** five Viewer modules each hold a PRIVATE sql.js copy of the SAME OPFS file
`bim_analysis/bim_project_orders.db` (seeded from `erp/ad_seed.db`, 27,193,344 B) and each `export()`s the whole DB back:
`diff.js:375-418` (`_voErpDb`), `find_erp_push.js:77-94` (via `ProjOrderState.openStore`, then its own persist),
`whatif_panel.js:41-206` (`_db`), `schedule_author_ui.js:60-82`, `proj_order_state.js:42-68` (the declared ONE owner —
its header says so). `hba_lens.js:345` holds a 6th, read-only copy of the plain seed, never closed.
Lost updates are ALREADY guarded: every writer checks `ProjOrderState.storeStamp()` (lastModified:size) and reloads or
refuses on change (§STORE_STAMP, `§PUSH_STORE_RELOAD` / `§PUSH_STORE_STALE`). So the cost is **memory (up to ~5 × 27 MB
resident) + four copies of the OPFS open/persist code**, not data loss.
**Change:** `ProjOrderState.shared(SQL, fetchSeed)` — one memoised instance keyed on the store stamp; `persist()` stays the
one writer. diff / find_erp_push / schedule_author_ui read and write through it and delete their private OPFS helpers
(~80 lines). hba_lens reads it too (read-only) instead of opening the seed.
**⛔ Open question before building (owner or code-read):** does What-if mutate its copy as an un-accepted PREVIEW
(`whatif_panel.js:189-206` persists only on accept)? If yes, a shared instance would leak preview rows into the other
lenses. Then What-if keeps a private copy opened from the shared bytes ON DEMAND and closes it when the panel closes —
still removing the resident copy. Read `whatif_panel.js` fully to decide; do not guess.
**Witness claim (W-ONE-PO-STORE):** with all five lenses exercised in node (fake OPFS), `SQL.Database` constructions on
the store = 1 (+1 transient for What-if if preview-private), every lens sees another lens's committed write without a
reload, a stale-stamp write is still refused (negative control), and the §S9-STORE log prints opens/exports.

## §A1 SPEC + RESULT (2026-11-03, branch fix/hygiene-wave1, bim-ootb viewer/scene.js)

### Problem
`A._applyPendingPatch` (scene.js) = `_applyMainPatch` -> `_applyLightFieldPatch` -> `_applyQtoPatch`. Each step does
`new SQL.Database(new Uint8Array(buf))` (a full copy), applies, `export()` (another full copy), `close()`.
Hospital_meta.db (main + lightfield + qto) = 3 opens + 3 exports in series (§PERF BUDGET: never duplicate big buffers).

### Invariant (must not change)
Patched bytes/content identical to today's chain:
- same SQL, same order: main `.sql` -> `.lightfield.bin` (only reached if main was 404 or applied OK) -> `.qto.sql`;
- same skip behaviour: main 404 => `§PATCH_NONE`, still tries lightfield, still tries qto; main throws / sql.js factory
  missing => unpatched buf, lightfield SKIPPED (today's `return buf`), qto still runs; lightfield bad magic / header
  mismatch / 404 => no change; qto 404 / failure => db without cost patch;
- failure isolation: a failing patch must not lose an earlier patch, and must leave NO partial writes of itself;
- every existing log line keeps its text (`§DB_LOAD_STEP`, `§PATCH_NONE`, `§PATCH_APPLY`, `§PATCH_APPLY_FAIL`,
  `§LIGHT_FIELD_PATCH*`, `§PATCH_QTO*`). Added: `§PATCH_CHAIN opens=N exports=N patches=K bytesIn=X bytesOut=Y`.
(No manifest/hash check exists in these three functions; none is added or removed.)

### Change
1. Phase 1 (no DB): fetch all patch payloads (main text, lightfield ArrayBuffer parsed+validated, qto text) in the same
   decision order. No patch applicable => return ORIGINAL `buf` untouched, opens=0 (as today).
2. Phase 2: ONE `new Database(buf)`; for each applicable patch in order main, lightfield, qto:
   `SAVEPOINT pN; apply; RELEASE pN`; on exception `ROLLBACK TO pN; RELEASE pN` + the same FAIL log, continue per the
   skip rules above. Per-patch isolation is therefore kept WITHOUT a re-open (today each failure discards its own
   partial open; the savepoint rollback discards the same writes). Main failing marks lightfield skipped (today's rule).
3. ONE `export()`, `close()`. Pre-existing helpers `_applyMainPatch/_applyQtoPatch/_applyLightFieldPatch` stay as
   standalone functions (other callers / the oracle) but `_applyPendingPatch` no longer chains them.

### Witness claim — viewer/tests/witness_patch_chain_single_open.js
- C1 same input (real Hospital_meta.db + real main + qto patches + synthetic LFP1 sidecar): OLD chain (verbatim copy
  from origin/main) vs NEW => identical table content (every table SELECT * ORDER BY rowid) [bytes compared and reported].
- C2 SQL.Database constructions / export() counted: NEW opens=1 exports=1 with >=2 patches; opens=0 with none; OLD=3/3.
- C3 negative control: broken qto => main + lightfield applied, qto rolled back, logged, content == OLD with same break.
- C4 mutation controls (reordered / dropped patch) => witness must FAIL.
- INCONCLUSIVE (exit 2) if no patch was exercised.

### RESULT
Code: viewer/scene.js A._applyPendingPatch rewritten (single lazy open, SAVEPOINT per patch, one export); the three old
functions deleted (+87/-57 net -). Witness: viewer/tests/witness_patch_chain_single_open.js (+ fixtures/oracle_patch_chain_pre_A1.js
= verbatim pre-change chain from a2026c89).
Input: REAL Hospital_meta.db (22,441,984 B) + real main (5.95 MB, 38,186 stmts) + real qto (223 stmts) + synthetic LFP1 sidecar
(no light-field .bin ships in git). Equality = every-table content (SELECT * ORDER BY rowid, sha256); raw bytes differ only by
sqlite page layout (reported per scenario), no-patch path returns the identical input buffer.
Measured §PATCH_CHAIN: main+lf+qto: old opens/exports 3/3 -> new 1/1 (patches=3, bytesIn=22441984 bytesOut=26071040);
main+qto 2/2 -> 1/1; no patches 0/0 -> 0/0 (input returned untouched); broken qto 3/2 -> 1/1 (qto rolled back, main+lf kept);
broken main 2/1 -> 1/1 (lf skipped, qto applied); order-sensitive synthetic 2/2 -> 1/1, value 12 = main then qto.
Verdict: §A1_VERDICT PASS (6 scenarios content-identical, log lines identical to oracle, 4/4 mutants killed: drop-qto,
swap-order, drop-lightfield, no-rollback). Run on the OLD scene.js it prints FAIL (cannot find the new code's anchors).
Other witnesses before/after: witness_georef_patches PASS/PASS (dbs=6/10); witness_storey_datum_frame PASS/PASS (10/14);
tests/witness_nogeo_compose.js FAIL before (`A._applyMainPatch is not a function`: it slices _applyPendingPatch out of scene.js
without its helpers) -> PASS after (pass=12 fail=0), a side fix of the self-contained function.
Logs: scratchpad a1_witness_after.log, a1_witness_before_oldscene.log, witness_*_before/_after.log.
# §A4 BUILD SPEC + RESULT (2026-11-03, bim-ootb branch fix/one-po-store)
## SPEC (written before code)
Design (decided; source: CODE_HYGIENE_REVIEW_2026-11.md §A4 SPEC):
1. proj_order_state.js gains `shared(SQL, fetchSeed)` -> Promise<{db,src,stamp}> memoised in the module. disk stamp == memo stamp
   (and != 'unknown') -> memo. Else openStore, replace memo, log `§PO_SHARED reload was=.. now=..`; replaced instance NOT closed.
   Every store open logs `§PO_SHARED opens=N`. `persistShared(db, writer)`: disk stamp != memo stamp -> false + `§PUSH_STORE_STALE writer=<w>`
   (memo dropped); else persist(db), memo.stamp := new disk stamp. `invalidateShared()` drops the memo.
2. diff.js / find_erp_push.js / schedule_author_ui.js delete private OPFS open/stamp/export code, use shared()/persistShared().
   Existing § lines keep their text; no-OPFS fallback unchanged (seed fetch).
3. whatif_panel.js uses shared() but keeps `_hasFoldedProject`: no C_ProjectPhase rows -> own seed copy
   (`§WHATIF-UI db=private-seed reason=no-folded-project`). Persist via persistShared when on shared db; unchanged stale-refusal on private copy.
   refresh() -> ProjOrderState.invalidateShared().
4. hba_lens / tm_gantt_build / tm_lifecycle_api untouched.
Open question (What-if preview leaking into a shared db) READ FROM CODE: whatif_panel keeps slips in `_slips`; scheduleWhatIf/ripple/readPhases
are read-only (whatif.js:132-); the only db mutations are commitSlip/acceptSlip, run only inside _accept, followed at once by persist. So a
shared instance leaks no preview rows; design stands.
Invariant: at most ONE SQL.Database on bim_project_orders.db per tab per on-disk stamp; lost-update guard (stamp) preserved.
Witness claim W-ONE-PO-STORE (viewer/tests/witness_one_po_store.js): see RESULT.
## RESULT
Commit on fix/one-po-store (see git log). Witness: viewer/tests/witness_one_po_store.js -> 13 claims, PASS (log after_witness_one_po_store.log).
§PO_SHARED numbers: four consumers (diff load+write, find_erp_push load+write, what-if load+accept, then author sync) -> opens=1, SQL.Database from OPFS bytes=1, private/seed copies=0, OPFS reads=1, reloads-by-stamp after own writes=0. Was: 4 private copies.
Author Apply -> WhatIfPanel.refresh() (panel open) -> invalidateShared (spec'd) -> one explicit re-read: opens 1 -> 2.
Stale: persistShared from old stamp refused (file unchanged); external change -> reopen (opens 2); what-if accept refused via shared path; mutants (diff bypass, no stamp guard) both caught.
What-if rule: no C_ProjectPhase in store -> log db=private-seed reason=no-folded-project, 1 seed copy; with phases -> shared, 0 seed copies.
Open question resolved from code: what-if preview (_slips) never touches the db; only commitSlip/acceptSlip mutate, inside _accept, then persist.
Script order (viewer.html): proj_order_state.js:988 < whatif_panel:990 < diff:1003 < schedule_author_ui:1102; find_erp_push is lazy (main.js:231), after all. Consumers also fail soft without ProjOrderState.
Caveats: (1) refresh() after every author Apply costs one more 27 MB parse. (2) pre-existing: whatif _accept does readPhases(_db=null) after a stale refusal -> unhandled rejection (unchanged). (3) a failed persist leaves the mutation in the shared in-memory db (was: private copy).
# §A3a SPEC + RESULT — one kernel_ops, guards restored   (bim-ootb /tmp/wt-krn, branch fix/one-kernel-ops, base 38fbb8fb)

## Finding (verified)
- Only viewer/viewer.html:983 `../erp/kernel_ops.js` is loaded by the live Viewer (viewer/sw.js:1144 precaches the same).
  `git grep kernel_ops.js -- '*.html'`: viewer/kernel_ops.js is loaded only by viewer/tests/cherry_harness.html:11 and
  histbar_viewer_harness.html:12 (test harnesses).
- Five persist guards live only in the dead copy viewer/kernel_ops.js:
  1. READONLY_OPS defer (:67, gate :102-107) — ELEMENT_PICK/BUILDING_OPEN/WING_PLANE/EXPORT_2D skip persist (§KRN_PERSIST_DEFER).
  2. §KRN_PERSIST_GUARD (:116-125) foreign db (db !== APP.db) skipped BEFORE the timer.
  3. §TM_SPLITMODE_PERSIST_KEY (:142) url = APP._dbPersistUrl || APP.DB_URL.
  4. §SCHED_PERSIST_KEY (:145-149) key = DbResolve.cacheKey(url, APP.PROD_BASE); also §APP._cacheDisabled skip (:144).
  5. _bakeOwned gate — already in both.
- erp/kernel_ops.js:74-103 commitOp always persists; :182-203 _persistToIdb keyed on raw APP.DB_URL; :129-180 _idbPersist (T6) tip key `<url>::tip`.

## Change
- erp/kernel_ops.js: port 1-4. commitOp defers READONLY ops; commitGroup defers only when EVERY op is READONLY
  (any mutating op persists). _persistToIdb: foreign-db guard, bake gate (kept), url from _dbPersistUrl||DB_URL,
  _cacheDisabled skip, dbKey=DbResolve.cacheKey(url, PROD_BASE) when DbResolve present. Lock name + tip key follow dbKey
  (`dbKey + '::tip'`). All existing § log text kept (§KRN_PERSIST gains ` key=`).
- Delete viewer/kernel_ops.js (nothing live loads it); re-point harnesses/witnesses.
- Cache-bust: viewer sw.js CACHE_VERSION, `?v=` on erp/kernel_ops.js script tags.

## Invariants
- ERP pages with no window.APP: dbUrl null -> no persist (unchanged). No DbResolve -> key = raw url (unchanged).
- T6 tip guard, navigator.locks serialisation, incremental sealFrom unchanged. Existing § text kept.

## Witness claims (viewer/tests/witness_one_kernel_ops.js)
C1 each READONLY op: 0 exports after debounce + §KRN_PERSIST_DEFER; rows ride next mutating persist.
C2 mutating op: exactly 1 export; IDB key == DbResolve.cacheKey(shipped url); tip key == key+'::tip'; raw-url slot empty.
C3 split mode: key from APP._dbPersistUrl.
C4 foreign db: 0 writes, §KRN_PERSIST_SKIP foreign db, pending legit persist NOT cancelled.
C5 no window.APP: no persist.
C6 T6 stale tip still refuses (negative control).
C7 commitGroup: READONLY-only group defers; mixed group persists.
Before-proof: same claims vs origin/main erp/kernel_ops.js FAIL; mutant without READONLY gate FAILs; 0 judged -> INCONCLUSIVE.

## RESULT
(filled below)

### Result (2026-11-03)
- erp/kernel_ops.js: guards 1-4 ported (READONLY_OPS in commitOp + all-READONLY commitGroup defer; foreign-db guard; _dbPersistUrl; _cacheDisabled; DbResolve.cacheKey key; lock name and `::tip` follow key). viewer/kernel_ops.js DELETED (nothing live loaded it; only 2 test harnesses, re-pointed).
- '::tip' readers: only erp/kernel_ops.js (_idbPersist). Raw-url key readers: none besides the writer; scene.js cachedFetch reads DbResolve.cacheKey (legacy raw fallback).
- witness_one_kernel_ops.js: TARGET 17/17 PASS; BASELINE 38fbb8fb 13/17 FAIL (C1a x4, C2b-d, C3, C4a-c, C7a-b); MUTANT(no gate) 4 FAIL. Verdict PASS. Log: witness_one_kernel_ops.final.log
- Sweep before/after (before/, after/ dirs): no exit-code regression in plain-node witnesses; diffs are browser-driven (puppeteer/playwright) or load-timeouts (see report). audit_sw_precache: 0 missing, 0 unlisted.
- Version bumps: viewer sw v1674->v1675, viewer.html kernel_ops.js?v=14, erp/sw.js v963->v964, idempiere.html ?v=4, kanban_lens/pivot_lens ?v=2.

### §A3a REVISION (2026-11-03, reviewer) — key fixes NOT shipped; decision recorded
Dated history (git -S on origin/main viewer/kernel_ops.js): §KRN_PERSIST_GUARD added 2026-06-12, §KRN_PERSIST_DEFER 2026-07-16 —
both LIVE until the viewer copy was dropped from viewer.html on 2026-08-10 (#1271). §SCHED_PERSIST_KEY and
§TM_SPLITMODE_PERSIST_KEY were added 2026-08-23 — AFTER the copy stopped loading, so they have NEVER run in kernel_ops.
Shipped: the two RESTORATIONS (READONLY defer incl. commitGroup, foreign-db guard) + `_cacheDisabled` skip. The persist key
stays the RAW url, exactly as shipped. **⛔ OWNER DECISION:** switch kernel_ops to the canonical cache key (+ split-mode
url)? That turns on "Viewer edits replace the cached building and survive a refresh" for the first time — and the
stale-building risk that comes with a persisted copy shadowing a newer download. Until then each mutating edit burst
still writes a full copy to a raw-url slot (read only by cachedFetch's legacy fallback).
Witness after revision: W-ONE-KERNEL-OPS 16/16 on the target; baseline 38fbb8fb fails exactly the 9 restoration claims
and passes the key-UNCHANGED claims; READONLY-gate mutant fails 4. W-PERS-5b (witness_gantt_edit_persist) now judges code
with comments stripped (a comment naming the key function had made it PASS; before §A3a it read the unloaded copy) and
reports INCONCLUSIVE for the open decision: pass=17 fail=0 inconclusive=1 (exit 2; not in CI).

## §5 D1 — one shared lib folder ✅ DONE (witness) — 2026-11-03, bim-ootb #2581 (live viewer sw v1688, modeller sw v214)
Owner: *"proceed the single folder without breaking backward compatibility."* The byte-identical (sha256) Viewer/Modeller
libs — web-ifc-api-iife.js + web-ifc.wasm, sql-wasm.js + sql-wasm.wasm, OrbitControls.module.js, planegcs/ (8.4 MB) — now
have ONE source, `common/lib/`, and every shipped consumer loads from it (70 refs / 28 files: tags, importmap/imports,
`importScripts` in both IFC workers, every web-ifc `SetWasmPath`/`Init` and sql.js `locateFile` resolved against its own
worker/module url, both SWs' SHELL_LIBS/DEFERRED_LIBS; deferred libs stay on-demand). **Compatibility:** the old files stay
at `viewer/lib/` and `modeller/lib/` as byte-identical mirrors (README: do not edit) so open tabs, old service workers and
external links still resolve — git stores identical blobs once, so zero repo cost. Live check: all 6 `common/lib/` urls 200
with the expected sizes; old `viewer/lib/web-ifc.wasm`, `modeller/lib/sql-wasm.wasm`, `viewer/lib/sql-wasm.js` still 200.
W-ONE-LIB-FOLDER (L1 no shipped old-path ref · L2 every common ref resolves · L3 mirror drift guard · L4 deferred off
install): PASS; baseline efaa13ce FAIL; 5/5 mutants FAIL. CI incl. page tests on macOS/Ubuntu/Windows green.
**Later (one-line change):** delete the mirrors once old tabs/SWs have aged out — W-ONE-LIB-FOLDER L3 then flips to "absent".
**Not in scope:** the three.js bundles differ per app (Modeller importmap = webgpu build + a second module import — possible
two THREE copies, D1 note); `erp/sqljs` + bim-compiler `build/erp/sqljs` keep their own copies.

## §6 C1 + three.js — ✅ DONE (witness) — 2026-11-03
- **C1 one tax owner → bim-ootb #2584 (live erp sw v969).** ONE body `BigDecimal.mtaxCalculate` (erp/bigdecimal.js — the module
  every host loads; model_trade needs model_layer, which engine/till/pos host cannot load); model_trade / erp_engine /
  doc_poster are shape adapters; `taxGet` one copy. Oracle = real java.math.BigDecimal on verbatim MTax.java:340-372, 4,608
  cases (all seed C_Tax + summary variant × incl/excl × precision 0/2/3/12 × 36 amounts): model_trade 0 and doc_poster 0
  disagreements; erp_engine 108 — all summary-tax-with-parent-Rate-0, where legacy returns 0 (`isZeroTax()` MTax.java:310-313,
  :343). Twin fixes: engine → 0 there; child taxes filtered IsActive (getChildTaxes :254-259). **No seed number changes.**
  W-ONE-TAX-OWNER PASS; baseline 0dc101a9 FAIL; 3/3 mutants. Not run: posting-balance / bridge twin checks (need servers).
- **three.js → bim-ootb #2582 (live modeller sw v215).** Measured: NOT two cores — both wrappers import one three.core.min.js.
  Waste was the Modeller importmap sending bare `three` to the unused 638 KB WebGPU wrapper (evaluated every load, precached
  every install). Repointed to three.module.min.js as the Viewer did 2026-07-16; webgpu wrapper → cache-on-use.
  W-THREE-ONE-BUILD 7/7; baseline fails exactly the 2 targeted claims.
**Remaining from §3:** C4/C2/C3 retire the old ERP hosts + folds (erp.html/ad_ui.js, glassbowl.html, doc_poster derive*, dead
erp_engine verbs) — removes user-reachable pages → needs owner go · T5 Modeller kernel_ops third copy + boot assertion ·
B-items (viewer caches kept past mode exit, permanent intervals) · A5 legacyDb close (needs a witness on the hydrate path).

## §7 ERP retirement (owner go 2026-11-03) — phase 1 + 2a ✅ DONE, phase 2b WITHDRAWN (twin work first)
- **Phase 1 → bim-ootb #2588 (erp sw v972).** `erp/erp.html` is the owner's bubble LAUNCHER ("ALWAYS", ad_ui.js §IDEMPIERE-ROUTE
  2026-06-10) — kept unchanged. Retired the window/tab engine inside it that could no longer run (`_currentWindow` only ever
  `null`): ad_ui.js 2,711 → 1,034, ad_charts.js 432 → 151 (AST reachability from every live entry). glassbowl.html +
  gravity are user-reachable (2 pills, whole_history, ERP guide) → kept, so crud_overlay `completeFanout*` stays (glassbowl
  loads it without the model layer). 6 tests that drove only the dead engine removed. W-ERP-DEAD-UI PASS; baseline 07bf3f9e FAIL.
- **Phase 2a → bim-ootb #2589 (erp sw v973).** Shipped `erp/erp_engine.js` = the browser subset of bim-compiler
  `scripts/erp_engine.js` (which keeps the full engine): 1,389 → 421 lines, 54 → 14 exports; the 24 kept declarations
  byte-identical. W-ERP-ENGINE-SUBSET PASS; 45 engine witnesses identical before/after.
- **Phase 2b (retire doc_poster derive*) WITHDRAWN** (and its "twin defect" reading CORRECTED the same day — the recorded proofs pass;
  the measurement must be reconciled first, see SQLiteIDEMPIERE.md §POSTING-PARITY correction): measured parity shows real posting (`model_post`) lacks
  Doc_AllocationHdr / Doc_BankStatement / Doc_GLJournal and the MatchInv IPV split, and doc_poster is itself a live posting
  path in the twin architecture — recorded as twin work items in `prompts/SQLiteIDEMPIERE.md §POSTING-PARITY 2026-11-03`.
  Retire only after those land.
