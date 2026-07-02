# ⚠ DO NOT REMOVE — Combined FRONT-END lane · THE SINGLE PLAN (open this first; it supersedes the handoffs)
# WHO I AM: the one combined FRONT-END lane. Backend/engine = CLOSED+FROZEN. Tour = DONE+BOUND. I own everything
#   front-of-seam: host-conformance · engine consumption (`window.ERP`, never reach past it) · the AD-gen STRUCTURE
#   (any-source → renderable iDempiere) · data-acquisition (INSTALL + MIGRATE icons) · the lenses · Tour stability.
# THIS SUPERSEDES (kept only for detail; act from HERE): COMBINED_ERP_LANE.md · TOUR_GUIDE_FRONTEND_HANDOFF.md ·
#   AD_RENDER_HANDOFF.md · LENS_FAMILY.md · MIGRATE_SHOWME_OVERLAY.md · SPECS_AND_STRATEGY_RESUME.md.
#   Specs: docs/AD_GEN_FROM_DICTIONARY_SPEC.md · docs/ENGINE_CONTRACT.md §1/§2/§6.1 · docs/PLUGIN_ARCHITECTURE.md §13.7.
# NON-NEGOTIABLE (every turn): spec-first · witness-led (each test NAMES its issue) · §-log first (READ the log) ·
#   deterministic/NON-INVENT (real rows; absent→source/coverage, never synthesized; NO Date.now/Math.random in op paths) ·
#   consume the seam / NEVER fork a verb (browser files are UMD copies of bim-compiler/scripts/) · EXPLICIT GO before deploy.

---

## ▶ THESIS + STATE (2026-06-03)
ONE owned model (AD dictionary + data + signed op-log); the UI is a cheap swappable LENS. Three streams converged:
the ENGINE is frozen behind a 5-call seam (`window.ERP`); the TOUR is bound + read-only; I built the AD-gen STRUCTURE
(fold ANY source → renderable iDempiere seed, render-proven headless). What remains is front-end assembly: the two data
icons (INSTALL + MIGRATE) over `dispatch`, the live write path into the lenses, the Accts-Posted panel, and shipping the
render. **NEXT SESSION = plan + organise agents from §WORK; build ONE bounded task at a time; GO before deploy.**

## ▶ POC SHIPPED — localhost (2026-06-03, this arc) + GAP LEDGER  ← READ THIS FIRST for resume
Phase decision: **deploy = LOCALHOST** (bim-ootb/erp, dev :9090, sw **v568**), NOT gh-pages (Accts-Posted Item C
did go to gh-pages PR #94/#97; everything after is localhost). Built + §-witnessed on `idempiere.html`:
- **Accts-Posted lens** — desktop `mount` + mobile `mountAccordion`, `§POSTED-READ/-GATE/-COVERAGE/-CTX/-MOBILE`. (`prompts/ACCTS_POSTED_PANEL.md`)
- **Pill rail** — `icons.js` Lucide SVG (NO emoji), ALONGSIDE the classic bar ([[project_pill_alongside]]); iDempiere toolbar actions transferred (nav/refresh/grid-form REAL; New/Save/Delete/Attach honest-disabled); glassbowl/gravity REMOVED. `§RAIL/§RAIL-NAV`.
- **RED-PILL 3-state** — classic→expanded→clean (header 🔴 rightmost + in-rail 🔴 revert + `⋯` mini; bar hides, `#idmp-content` maxes; localStorage). `§REDPILL`.
- **Empty-start DASHBOARD** — KPI tiles + by-status strip, real `ad_seed.db`, `§DASHBOARD tiles=6 handAuthored=0` (`erp_dashboard.js`).
- **Mobile cards** (reuse `ad_ui .acc`) `§MOBILE-VIEW` · **Graph/Kanban switchable views** `§VIEW` · **Migrate**→`MigrateShowMe` · **Install**→QR/pair stub `§INSTALL-PILL`.
- **WRITES (POC-DEMO, signed kernel)** — `ErpSigner` installed; kanban drag→`SET_STATUS`, New/Save/Delete → signed+chained ops. `§WRITE-DRAG/-CRUD/-CHAIN/-SIGNER`. I-4 decided (POC): use deployed signed `kernel_ops.js`.

### GAP LEDGER — what the NEW session closes (in priority order)
1. **⚠ ENGINE (gates ALL real writes):** resolve `prompts/ENGINE_FULL_ERP_ISSUES.md` decision matrix (I-A durability · I-B New/DocNo via §6.1 edge-mint · I-C callouts · I-D O(n²) seal · I-E single-writer · I-F schema · I-G posting · I-H migration · I-I fold/hash). Each resolution → wire that write; until then it stays demo/disabled.
2. **Projection persistence:** edits commit to the op-log but NOT IDB (`kernel_ops` keys on unset `APP.DB_URL`) → reload re-folds `ad_seed`, visible edits reset (op-log survives). Fix: set `APP.DB_URL` + persist, OR replay op-log over projection on boot.
3. **Streaming T1/T2** ("the rest of the data") NOT wired — non-seed tables show "not in seed". `docs/DATA_ACQUISITION_ORCHESTRATION.md §8` (the unified login→client→tier→lens flow, written this arc).
4. **Attach** (no blob path) · real **posting** beyond sales-invoice class (§13.6 record-keyed `fact_acct`) · **client→shard** select on read.
5. **Odoo depth:** the landing dashboard → a real interactive Kanban dashboard (pillar 1); kanban drag→dispatch as a default view (needs write path, gated by #1).
   - **✅ kanban drag→dispatch WIRED + DEPLOYED LIVE (§KANBAN-WRITE-RESULT PASS, 2026-06-04, bim-ootb PR #115, sw v569).**
     The board chrome/drag-resolution were already done; the gap was that `dispatch`/`ctx` were null (TODO STEP-0) → snap-back.
     `kanban_lens.html` now boots `window.ERP` (the seam) like `spike_writepath.html`: per-row fold (real doc cards) +
     role-gated ctx + all wfmc stages as columns. A legal drag commits a **signed SET_STATUS** (chainOk=Y, card moves);
     illegal drag snaps back. Witness `tests/poc_kanban_write.js` (C_Invoice#109 CO→VO).
   - **✅ gap #2 DURABILITY DONE + LIVE (§KANBAN-PERSIST-RESULT PASS, bim-ootb PR #117, sw v570):** `kanban_lens.html`
     persists the projection op-log to IDB (key `kanban_proj`) after each ok dispatch (onResult export+idbPut — the seam's
     erp_kernel path bypasses KernelOps.commitOp so APP.DB_URL alone won't fire) and restores it on boot; `foldDocStatus`
     overlays the projection `documents` tip (read-the-tip). A drag now survives a full reload (C_Invoice#109 CO→VO comes
     back in VO, tipOverlaid=1). Witness `tests/poc_kanban_persist.js`.
   - **✅ gap (c) MAIN-RENDERER DONE + LIVE (§IDMP-KANBAN-RESULT PASS, bim-ootb PR #119, sw v571):** idempiere.html's
     Kanban pill now mounts the REAL draggable `KanbanLens` board over the open window's records (per-row docstatus fold,
     op-log tip overlay) and a drag commits a signed `SET_STATUS` via `window.ERP` built from the login `_session`.
     Factored the host into **`kanban_host.js`** (`window.KanbanHost.{publish,tip,persist}`) so the lens + idempiere share
     ONE write path. Witness `tests/poc_idmp_kanban.js`: login → Invoice window 167 → Kanban → board 11 cols/4 C_Invoice
     cards → drag C_Invoice#100 CO→VO (chainOk=Y). Honest read-only fallback if engine absent.
   - **✅ (a) LAUNCH-FROM-GRAPH UX DONE + LIVE (bim-ootb PR #120, sw v572):** the Graph pill and Kanban pill are two
     lenses of the SAME doc-status data, so the Graph view now carries a **🗂 View as Kanban** button (launch the
     interactive board in one tap from the graph icon after login) and the board carries **📊 View as Graph** back.
     User-directed UX call (made it, didn't hand back). Verified visually (`tests/see_idmp_flow.js` + switch_2_kanban.png).
   - **STILL OPEN (parallels, not blocking):** chat lens `send`→dispatch (same TODO(STEP-0), now trivial via
     `kanban_host`) · making the board the literal *default landing* (bigger entry-view change) · R5 receipt channel-deliver.

### OUTSTANDING — RETIRED 2026-06-20 (fully drained → archived)
**This dictated/parked backlog ran to ZERO and was retired by user decree** so WORK-TO-ZERO stops re-surfacing it
every session. The full ✅/⛔ history (PRs, witnesses, §-logs — Blue-Future, in-place CRUD, AD self-edit, POS/WH,
doc-panel band, the lot) lives verbatim in `prompts/archive/FRONTEND_LANE_MASTER_OUTSTANDING_drained_2026-06-20.md`.
Do NOT re-walk it — it is provenance, not work.

**The live ERP/Viewer spine moved on** — the active plan is now: `prompts/GRAND_LANE_STRATEGY.md` (the single index +
doctrine) + the current RESUME card (`prompts/RESUME_IDMP_FIDELITY.md`) + MEMORY.md §SPINE. New dictated items append
to **§NEW BACKLOG** below (this is the WORK-TO-ZERO list going forward).

**CARRIED-FORWARD — RESOLVED by user 2026-07-01 (all three closed; kept here as the record, not active work):**
- **G-3 — headless WH-confirm (doctype-148) oracle. ⛔ DROPPED (low value).** User (2026-07-01) didn't recall needing
  it; clarified. The blocker was never the DB — it's the Java **OSGi/Equinox runtime** (`Adempiere.startup` NPEs on the
  BundleContext / SecureEngine service locator); docker Postgres (GardenWorld) is necessary-not-sufficient. The
  browser-side `inout_confirm.js` rule already SHIPS (E-5 W-WH-CONFIRM) with every fold citing its exact
  `MInOut`/`MInOutConfirm` source line + a rule-consistency arm → the Java fact-diff is a nice-to-have, not load-bearing.
  If ever wanted: run `ConfirmOracle.java` (`35b8e96f`, compiled+rollback-safe) INSIDE the already-bootable iDempiere
  server's OSGi runtime (the A2 Release-13 instance) against a throwaway docker-PG GardenWorld — NOT as a standalone main.
- **§P-11 payable-QR. ✅ CLOSED — QR is always a demo "SAMPLE".** User (2026-07-01): the explicit DEMO/SAMPLE-labelled
  generic QR IS the answer; no real registered-merchant DuitNow payload is wanted. Nothing further to do.
- **renderer #2 (Odoo) descriptor seam. ⛔ CANCELLED by doctrine (not blocked).** User (2026-07-01): the framework's
  end-state is that all other ERPs are ABSORBED into a single iDempiere(-2.0) base — they exist only TRANSITIONALLY as
  migration sources after a fresh migration off their legacy. So there is no permanent "2nd renderer" to abstract a
  descriptor seam for; Odoo's view types/reconciliation become fold-projections in the ONE core (`docs/internal/IDEMPIERE_2.md`
  §pivot: "a lingua franca other ERPs map onto"). Building the seam = the speculative one-consumer abstraction the recorded
  decision pre-empts. Retired. See [[project_erp_one_base_doctrine]].

### NEW BACKLOG — dictated items go here (WORK-TO-ZERO list, post-retire)
_(append new dictated items below. NOTE: the TM/variance/shopfloor + Zoom-Across arc has its OWN dedicated
 prompts — do NOT track it here: `prompts/ZOOM_ACROSS_SCOPE_SESSION.md`, `prompts/GW_HOSPITAL_SHOWCASE_SPEC.md`,
 `prompts/TM_SHOPFLOOR_COSTING_SPEC.md`.)_

- [✅] **Retire `viewer/2d.html`** — RESOLVED 2026-06-27 (user call): the viewer-side 2D/red-pill work is
  **DEPRECATED by the Modeller/3DGrid — leave it as-is** (dead-weight but harmless, lazy/new-tab only; nothing
  to learn from it). Do NOT spend effort on the mechanical retirement. Focus shifted to Modeller feature UI polish.
  (Step-1 witness below still stands as the record of WHY a naive retirement was wrong.)
  **Step-1 witness: `grid_overlay.js` does NOT cover what `2d.html` serves.** EXTRACTED (not assumed): `grid_overlay.js` has ZERO DXF capability
  (grep dxf|bimsrc|aia-layer|drag-drop = 0); `2d.html` is a standalone DXF/CAD plan viewer — parse DXF,
  AIA layers panel, BIMSRC xdata→GUID correlation, drag-drop external DXF (per `tests/specs/14-2d-plans.spec.js`).
  They overlap ONLY on the 2D toolbar button (already routed to the in-scene grid overlay); `2d.html` is now
  reachable only via the `main.js:264` error-fallback + direct URL. So retiring it DELETES the DXF-import
  capability, not just dead weight. **THE ONE QUESTION (user owns):** accept losing the standalone DXF/CAD
  floor-plan viewer (drag-drop DXF, AIA layers, BIMSRC correlation), or keep `2d.html` until a replacement
  DXF path exists? If "accept loss" → the 4 steps below are mechanical and ready to run.
  Last touched 2026-05-23. **NOT a file move** — it is still wired live, so retirement = 4 steps,
  all in a `/tmp/wt-*` worktree (shared `~/bim-ootb` checkout is hook-blocked):
  1. CONFIRM `grid_overlay.js` fully covers the 2D-plan cases that `2d.html` served (don't assume — witness it).
  2. Delete the fallback in `viewer/main.js:242` (`open2DPlans()` → `window.open('2d.html?...')`).
  3. Remove `'2d.html'` from the precache list in `viewer/sw.js:61` **and bump `CACHE_VERSION`** (sw.js = conflict magnet;
     dropping a file without de-listing → SW install 404s).
  4. Retire/redirect the ~30 tests in `tests/specs/14-2d-plans.spec.js` + the fallback-guard in `28-grid-overlay-init.spec.js`.
  THEN `git mv viewer/2d.html` to an archive dir. Witness: `§2D-RETIRE main-fallback=gone sw-precache=gone tests=retired`.
  Rationale: 434 KB / 47k-line single inline block = the codebase's biggest under-modularized file; dead weight once
  `grid_overlay.js` confirmed. Costs the running app nothing today (lazy, new-tab-only), so LOW urgency — purely declutter.

## 1. DONE + FROZEN — consume, do NOT rebuild
- **Engine seam (C0):** `bim-compiler/scripts/erp_seam.js` `makeSeam→{read,dispatch,manifest,verbs,verify}`; `dispatch(intent,ctx)`
  gates role+owner engine-side; `verify→{chainOk,len,tip}`. `poc_seam.js` ALL PASS. Browser UMD `window.ERP` published by the
  reference spike `bim-ootb/erp/spike_writepath.html` (signed chain `chainOk=Y`, gate zero-leak). (`fad5b096`)
- **readPostings (§13.7):** `erp_postings.js` → `{visible,posted,lines,balanced,source,coverage,note,reason}`, role-gated by
  `isshowacct`; honest degrade `absent→partial→complete`. `poc_postings.js` ALL PASS.
- **Data:** 15 closed D2 shards + `manifest.json` (`§SHARD-MANIFEST tables=660`) + real `fact_acct` (`Dr=Cr=46574.97`). (`a541a873`,`30a1e1a6`)
- **MIGRATE backing:** `scripts/odoo_adapter.js` + `poc_odoo_fold*.js` → `§ODOO-FOLD PASS newVerbs=[]` (each foreign hop = one `dispatch`).
- **Tour (read-only, bound):** `help_overlay.js`/`help_idmp.js` `forked=0`, `W-TOUR-BIND 11/11`, suite green. ShowMe drives real
  `IdmpHost.focus→openWindow` (#80001); NeedHelp? gated on real `[data-ad-table]`.
- **AD-gen STRUCTURE (mine, this arc, on `full` `8abed18c`+`8f6071c9`):** `scripts/gen_ad.js`+`error_report.js`. Fold any source's
  dictionary → AD seed the renderer draws with ZERO renderer change. Providers `fromSqlite`(deterministic) + `fromExcel`(majority-infer);
  `ErrorReport` traps rubbish (import goes through); positive role-id (entity BPartner/Products/Orders + identifier+amounts+key); line→header
  FK nest (L0/L1); render-contract + session tables match `ad_parser.js`+`idmp_session.js` EXACTLY. Headless **`§RENDER-SIM ALL-CLEAN=Y`**.
  Seeds in `deploy/dev/`: `sap_ad_seed.db`(14/90, full scaffold) · `odoo_ad_seed.db`(8/8, cols=0 gap) · `glassbowl_ad_seed.db`(13/721,
  richest — regenerated WITH session tables) · `sampleerp_ad_seed.db`(Excel 4/20). `idempiere.html?seed=` loader wired (UNCOMMITTED, bim-ootb).

## 2. THE WORK — bounded, agent-assignable items (next session sequences + fans these out)
> **THE DESTINATION REACHED (2026-06-11):** the write-path rails this section built now carry their first
> addon — the **POS lens** (`docs/POS_ADDON_SPEC.md` §P-1..§P-4, `prompts/POS_LENS_SESSION.md # DONE`):
> ring → ONE signed group (order+ship+invoice+backflush, WR from the dictionary) → replenishment fold.
> W-POS-* ×4 headless + W-POS-LIVE green; newVerbs=[]; **DEPLOYED 2026-06-12 (PR #269 sw v652, Pages
> live-verified — `prompts/POS_LENS_SESSION.md ## DEPLOY DONE`)**.
**Chosen first (user):** fold A+B1+F into ONE bim-ootb deploy PR off `origin/main`. Engine-lane order for the write path: C → D → B2.

| ID | Item | Files (edit-only) | Witness | Depends on | Parallel? |
|----|------|-------------------|---------|-----------|-----------|
| **A** | Ship AD-gen RENDER | `bim-ootb/erp/idempiere.html` (`?seed=`) + ship a demo seed | `§AD-RENDER … menu nodes=N windows openable=N` + `§AD-RENDER VBAK fields==ad_field count` | — | yes (isolated render path) |
| **B1** | INSTALL icon | pill registry (`erp_pills.js`/`pill_builder.js`) + `migrate_showme.js` | `§INSTALL-PILL opens=dialog` | install-tier §3.3 | yes |
| **B2** | MIGRATE icon | new migrate chrome → `odoo_adapter` fold → `window.ERP.dispatch` | `§MIGRATE source=odoo hops=N newVerbs=[]` | D, I-4 §3.1 | after D |
| **C** | Accts-Posted panel | new panel + `buildCtx()` over `readPostings` | `§POSTED-READ`/`-GATE` rendered verbatim | — (read-only) | yes (decision-free, ship FIRST) |
| **D** | Wire `window.ERP` into chrome | `kanban_lens` drag→dispatch · `idempiere` record-panel · `chat_lens` send · `buildCtx` (augment `idmp_session`) | `§WRITE dispatch→refold chainOk=Y` + `§METER` | I-4 §3.1 | after I-4 decided |
| **E** | Re-fold seam | the host's post-dispatch re-derive | `§REFOLD view=… ms=…` | D | after D |
| **F** | Remove stale icons | main viewer (`deploy/dev/index.html` — glassbowl/gravity) | `§ICONS removed=[…] pill-covers=Y` | — | yes (isolated file) |
| **G** | DataSource (optional) | serve D2 shards behind `read` on window-open | `§DATASOURCE tier=shard swap=Y` | — | yes |
| **H** | Odoo master extractor | `bim-compiler/scripts/migrate_odoo_to_sqlite` (allowlist+AD-key map) | `§MIGRATE-ODOO-MASTERS fabricated=0` | — | yes (bim-compiler) |

**Demo-source strategy (A):** prove §AD-RENDER on `sap_ad_seed.db`/`odoo_ad_seed.db` (full scaffold, known-good). For the data-rich
front-door demo use **`glassbowl_ad_seed.db`** — iDempiere's own order→invoice→payment data, the one source we own STRUCTURE *and* DATA for.
SAP = structure-only with honest empty grids = the "and it generalizes" reach claim, not the front door.

## 3. DECISIONS I OWN (make BEFORE the dependent build; don't guess)
1. **[I-4] op-log schema** — live `erp_kernel.kernel_ops`(`op_uuid` PK) ≠ signed `kernel_ops.js`(`id/prev_hash/op_hash/sig`). Reconcile to
   ONE schema **before** wiring signing into the live path (engine lane: *"first decision, not cleanup; signed-over-the-wrong-table is worse than unsigned"*). Blocks D, B2.
2. **Persist** — per-write (simple, O(n²) seal, fine at hundreds) vs batch/compact (needs I-4). Lean: per-write now, resolve I-4 before claiming signed, defer perf backlog to thousands.
3. **★ Install-icon TIER** — does INSTALL launch **MigrateShowMe (master-data ONLY)** or a **unified full-install**? Tiers: master browse
   (MigrateShowMe) · `coverage:complete` (S1 Fact_Acct §13.6 cent-gated) · full AD metadata (shard streaming) · full editing (T3). Sets B1 copy
   AND unblocks the Tour pointer (owed-back). Don't over-promise a tier the icon doesn't deliver.

## 4. INVARIANTS — don't break through UI finishing
- **Tour A1–A4:** keep `window.IdmpHost` (5 methods) · **keep render-path `data-ad-table/record` tagging** (⚠ the one real render-rewrite risk —
  drop it → badges go SILENT, no error; guard with a `§`-assert `[data-ad-table]` count>0 after render) · keep `#idmp-content` mount · keep keymap window names matching AD menu.
- **Column casing bites:** sql.js/better-sqlite3 return DECLARED case — **alias every read column** (`SELECT grandtotal AS grandtotal`) or `undefined→NaN→silent unbalanced POST`.
- **readPostings honesty is engine-enforced** — render `source`/`coverage` verbatim; never gate the Posted tab; INSTALL/MIGRATE lift it.
- **Determinism** — no `Date.now`/`Math.random` in op paths; `performance.now()` only for `§METER`/`§BLOAT`.

## 5. OWED BACK to the Tour lane
1. Install-icon tier answer (§3.3) → sets Tour pointer copy. 2. Live-browser screenshot of NeedHelp? lit (I have Playwright, Tour doesn't). 3. Ping if UI finishing touches A1–A4.

## 6. KNOWN ISSUES (spike-measured, N=300; non-invent)
I-1 dispatch double-hashes/write (drift 1.57×)→incremental hash · I-2 seal+verify re-hash whole log/persist→O(n²), signed verify 4.6→26.6ms→rolling seal ·
I-3 projection bloat (52→336KB/600 ops, full re-export/write)→compact/prune · I-4 schema mismatch (§3.1) · I-5 re-fold full GROUP BY (watch 10k+).
~500 op/s, comfy at hundreds. Re-measure `scripts/spike_writepath.js [N]`.

## 7. DEPLOY + STATE
- **Deploy = PR to bim-ootb protected `main`** (Pages only from main; CI~95s+review+~60s rebuild). **Branch off `origin/main` BEFORE editing**
  ([[feedback_gh_deploy_base]] — currently on `idmp-host-conformance`, WRONG base). Bump `erp/sw.js` CACHE_VERSION (now **v564**) + `?v=` in sync; PRECACHE the seed. EXPLICIT GO.
- bim-compiler `full`: AD-gen `8abed18c`,`8f6071c9`; engine `fad5b096`,`a541a873`,`30a1e1a6`. Seeds in `deploy/dev/`.
- bim-ootb `idmp-host-conformance` (LOCAL): `idempiere.html` `?seed=` MODIFIED-uncommitted (move to fresh branch); `spike_writepath.html` `09773e1` not pushed.

## 8. ▶ AGENT ORGANISATION (next session)
Fan out from §2 as **worktree-isolated agents**, each owning ONE item, editing ONLY its files, integrating by **key + seam + §-witness** (never co-edit).
- **Round 1 (parallel, no blockers):** C (Accts-Posted) · F (icon cleanup) · A (render) · H (Odoo extractor). Each independently witnessable, no deploy.
- **Gate:** decide §3 (I-4 · persist · install-tier) BEFORE round 2.
- **Round 2 (after gate):** D (wire `window.ERP`) → E (re-fold) → B2 (MIGRATE). B1 (INSTALL) once tier is decided.
- **Agent firewall:** consume `window.ERP`, NEVER fork a verb (re-copy UMD from `bim-compiler/scripts/`) · NEVER edit Tour chrome (`help_*`) or drop `data-ad-table` tagging · alias every read column · §-log first · NO deploy (EXPLICIT GO) · a missing verb = a NAMED finding back to the frozen engine, not a UI hack.
- **Deploy = ONE bundled PR** off `origin/main` (fold A+B1+F + sw bump), after their §-witnesses are green.
