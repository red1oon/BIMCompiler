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
