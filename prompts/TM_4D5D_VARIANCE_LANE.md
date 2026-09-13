# ⚠ DO NOT REMOVE — THE SINGLE LANE: "BIM↔ERP 4D/5D twin — Zoom-Across coupling · Planned/Committed variance · shopfloor costing"
# This is the ONE act-from-here plan for the whole arc. It ABSORBS (kept only for deep detail/provenance):
#   prompts/GW_HOSPITAL_SHOWCASE_SPEC.md · prompts/TM_SHOPFLOOR_COSTING_SPEC.md · (ships record) prompts/ZOOM_ACROSS_SCOPE_SESSION.md
# PRIME RULE: EXTRACT/COMPILE ONLY. The cost taxonomy + resources + FK fabric are REAL in the seed; the ONLY
#   generated layer is a DOCUMENTED DETERMINISTIC variant (no random / no Date.now, fixed seed, 'generated' marker).
# DISCIPLINE every stage: spec-first · witness-led (each test NAMES its issue) · §-log FIRST (read the log, exit
#   code is not evidence) · money via site/bigdecimal.js · GO before deploy · sw bump + KEEP-BOTH precache.

## §THESIS
The BIM model, the schedule (4D), the cost (5D) and the what-if are all FOLDS of one signed op-log, so they can
never drift; and separate concerns (PP/Project/BIM/TM) stay LOOSELY COUPLED yet COHESIVE by ONE convention —
**Zoom Across, navigation by `_ID`/identity**. Time Machine is the surface that PLAYS the fold: scrub the 4D and
the 5D cost story walks with you. We turn a mocked variance into a true one, make it discoverable, generate the
missing 4D, then deepen to manufacturing-grade cost — each layer a peer linked by `_ID`, nothing tightly bound.

## §DOCTRINE (invariants across all stages)
1. **Zoom Across = the coupling fabric**, ONE gesture ("go to the related thing by `_ID`/identity"), three scopes:
   in-ERP (native btnZoomAcross, where-used by FK — LIVE) · cross-surface (red pill → Viewer/Modeller/TM — LIVE
   v1+v2) · cross-module (PP↔Project↔Resource↔Routing by existing `_ID` — spec'd). Adding a peer = make it
   reachable by `_ID`/identity, never a bespoke link.
2. **Variance = the Compiere/iDempiere `PlannedAmt`↔`CommittedAmt` pair** on C_Project/Phase/Task/Line — the single
   source of truth for COST. Two grains (line=BoQ rolls up to phase), one number.
3. **Read the twin, don't recompute.** Surfaces show the SAME stored figure, not a correlated re-derivation.
4. **Honest labels.** Cost Δ = "from records"; any date Δ that has no ERP column = "projected", never blurred.
5. **Invention boundary.** Sequence/dates/material come from extraction; only rate/split/setup ratios are the
   documented deterministic generator, carrying a 'generated' marker, byte-identical across runs.

## §STATE
- S7 ⬜ SPEC'D 2026-09-13, NOT BUILT — "when + what it costs on the thing itself": the persisted 4D window
  (`tasks`⋈`task_elements`, read via `schedule_read_4d.js`) beside S2's cost block in `#info-panel`, plus one
  extra line on the existing `hover_name.js` label and a data-gated pill toggle. Grain decided up front (date =
  element, cost = IFC class) — see S7 §S7-GRAIN. No pop-up-on-hover panel, by decision.
- S6 ✅ DONE/LIVE 2026-06-22 — ENGINE (PR #474 `feat/tm-whatif-s6`, viewer sw v694; W-WHATIF 13/13 whitebox on REAL
  990000): `viewer/whatif.js` schedule what-if = blue branch op on C_ProjectPhase, F-S ripple (SeqNo chain + preserved
  lag), commit/discard/accept reuse Blue Future. `erp/tests/whatif_witness.js`. + UI (PR #475 `feat/tm-whatif-ui`,
  viewer sw v695): `viewer/whatif_panel.js` floating "What-if schedule" panel — grey official F-S bars + per-phase
  −/+ slip steppers + blue downstream ripple bars + Accept(re-baseline+OPFS persist)/Discard; "What-if" btn in Find
  selection row. Playwright-verified (slip Super +21d→6 downstream re-fold, finish 2029-05-28→06-18, PV 64.7M→61.1M,
  BAC unchanged, accept re-baselines, 0 errors). proj_control.js UNTOUCHED. ALL math via window.WhatIf.
- LIVE: Zoom-Across v1+v2 (bim-ootb PR #439, erp sw v737 / viewer sw v673; W-ZOOM-ACROSS-SCOPE erp 8/8 + viewer
  6/6). Native btnZoomAcross where-used LIVE.
- WIP (branch `feat/tm-variance`, commit 6718146, worktree /tmp/wt-tmvar — may be held by another session, SYNC
  before touching): the ⚖ variance drawer EXISTS but RECOMPUTES both sides at runtime (planned `LABOR_RATES×days`,
  actual a hash variant) → only *correlates* with the records. The seed bake (`erp/tests/bake_gw_hospital_variance.js`)
  already persisted CommittedAmt into the records.

## §DATA (verified in erp/ad_seed.db, 2026-06-20 — the grounding; all EXTRACTED)
### ⚠⚠ THE HOSPITAL VARIANCE IS ALREADY BAKED — STOP RE-DISCOVERING IT. Check the right GRAIN before EVER saying "missing".
The GW Hospital Project Order (C_Project **990000**, `Value='Hospital'`) carries budget-vs-actual, baked by
`erp/tests/bake_gw_hospital_variance.js` (a prior session). Two sessions nearly shipped "it's absent" — it is NOT.
**Grain map (the single source of truth — also memory `project_hospital_twin_facts.md`):**
- **C_Project 990000** — `PlannedAmt 64,719,479` → `CommittedAmt 87,372,995` (**+35%**). ✅ pair present.
- **C_ProjectPhase** (6 real + 'Unsequenced'=0) — `PlannedAmt` + `CommittedAmt` BOTH populated. Superstructure
  `36,865,263 → 58,984,421` (**+60%** marquee); MEP-Rough-in **−3%**, Finishes **−11%** (honest MIXED signs). ✅
  Σ phase == project, to the rupiah.
- **C_ProjectTask** (13) — `CommittedAmt` present but **0** (their PlannedAmt=0; ignore for cost).
- **C_ProjectLine** (28, per IFC class via `M_Product.Value`) — `PlannedAmt` populated; **`CommittedAmt` NULL ON
  DISK *BY DESIGN*** — line commitment accrues from real docs (POs / C_ProjectIssue) = lane **S5**, NOT a gap.
  ⛔ Do NOT bake a pro-rata line committed (tried + REVERTED 2026-06-20; user veto: extract, don't invent). A
  line-scope cost panel folds line `PlannedAmt` + COMMITTED from `c_projectphase_id` → `C_ProjectPhase.CommittedAmt`
  (phase / control-account grain, labelled honestly).
- **C_Order / C_OrderLine** (Hospital PO) — **NOT on disk**; lives in browser **OPFS** (idb `ad_seed_v16`),
  unreachable from disk (see `prompts/BIM_ERP_ROUNDTRIP_RETHINK.md`).
Viewer reads it via fetch `../erp/ad_seed.db` → sql.js (the `navigate_find._ensureErpDb` / TM `_loadTwin` path).
- `M_CostElement` (9): Material / **Labor** / **Burden** / **Overhead** / Outside-Processing — the taxonomy.
- `S_Resource` (11 work-centers) + `S_ResourceType` (incl. "Work Center"). `injectGantt` (time_machine.js:2297)
  ALREADY tags every element {phase, resource, seq, start/end} — a live 4D generator.
- `PP_Order` (2): carries `C_Project_ID` (the PP↔Project link EXISTS), `S_Resource_ID`, `AD_Workflow_ID`,
  `qtybatchsize`, and **DateStartSchedule/Finish vs DateStart/Finish** (planned↔ACTUAL dates — C_Project lacks
  these). + `PP_Product_BOM` (7). ABSENT (seed-from-pattern or derive): AD_Workflow/AD_WF_Node, PP_Order_Node,
  PP_Cost_Collector, C_ProjectIssue, M_Product_Costing.
- Scrub sync today: `renderAtTime` redraws scene ✅ / gantt ✅ (hairline) / 5D dashboard ✅; variance drawer ✗
  (drawn on toggle only — the gap-close S1 owns).

# ═════════════════════════ STAGES (do top-to-bottom; each ✅/⛔; §-log first) ═════════════════════════

## S1 — MAKE VARIANCE TRUE  (smallest, makes the WIP honest; do FIRST)   [detail: GW spec §PC-COLLAPSE/§PC-SYNC-NOTE]
GOAL: the ⚖ drawer shows the twin's STORED numbers and tracks the scrub.
DO (viewer/time_machine.js): (a) `drawVariance` reads PlannedAmt/CommittedAmt from the twin (the `proj_claim.js`
read path; folded ERP db in OPFS via `bim_orders_overlay.js`) — DELETE the `LABOR_RATES×days` + hash recompute.
(b) add `if (_varVisible) drawVariance()` to `renderAtTime` + a cursor hairline on the var canvas + highlight the
phase under the cursor; tapping a phase row repositions the cursor (reciprocal).
WITNESS: **W-PC-TWIN-SOURCE** (§FALSIFIER: drawer total == `SELECT CommittedAmt FROM C_Project WHERE Value='Hospital'`
exactly, not correlated) · **W-PC-DRAWER** (phase-under-cursor highlights as it scrubs; tap-to-jump works).
✅ **S1 DONE (branch `feat/tm-variance-s1`, off fresh origin/main + cherry-picked WIP 6718146; W-PC-TWIN-SOURCE +
W-PC-DRAWER 13/13, `tests/test_tm_variance.js`):** `drawVariance` now READS the stored twin — new `_loadTwin()`
fetches `../erp/ad_seed.db` → sql.js → `C_Project`/`C_ProjectPhase` PlannedAmt/CommittedAmt (same lazy-fetch idiom
as `navigate_find._ensureErpDb`; read-only, db.close after); `_computeVariance` JOINS the stored cost to TM's gantt
phase windows (cost = records verbatim, windows = scrub axis). DELETED the `LABOR_RATES×days` (`_opCost`) + hash
(`_phaseVariant`/`_buildActualOps`/`_toggleWatchActual`/`_watchActual`) recompute. Drawer total == 87,372,995 to the
rupiah; honest mixed signs (Superstructure +60% marquee, MEP −3%, Finishes −11% — NOT a fabricated always-over).
`renderAtTime` redraws the drawer (hairline + phase-under-cursor highlight); tap a phase row → cursor jumps to its
window (`§TM_VARIANCE_JUMP`). Honest labels: cost "from records", schedule "planned baseline" (no actual-date column
till §S3). §-log `§TM_TWIN_LOADED`/`§TM_VARIANCE source=twin`. NOTE: populated-drawer Playwright shot deferred —
Hospital geometry lives in browser OPFS (unreachable from disk); whitebox §-log is the primary proof per project rule.

## S2 — MAKE IT DISCOVERABLE (the red-pill discovery loop)   [detail: GW spec §PC-FLOW]
GOAL: follow a cost number from the ledger to the moment in time it happened.
DO: 1. ERP Project line → ⋯ "Zoom Across" carries `&find=<ifc_class>` (LIVE). 2. Viewer: Find highlights + a
compact **IFC info panel** anchored to the selection shows IFC facts + **Planned RMxx→Committed RMyy (+z%)**
FOLDED from the twin (C_ProjectLine grain; whole-building for header scope). 3. Press TM → cursor JUMPS to the
scope's PHASE window (ifc_class→C_ProjectLine→c_projectphase_id→StartDate) → building rendered at that juncture;
user scrubs. 4. The ⚖ drawer (from S1) sits beside the 5D dashboard, coupled to the cursor.
WITNESS: **W-PC-PANEL** (panel folds twin's pair == stored line, marquee +60%) · **W-PC-JUNCTURE** (cursor lands
in the class's phase window; scene partially-built there) · **W-PC-HONEST** (cost Δ "from records", date Δ "projected").
✅ **S2 DONE (branch `feat/tm-variance-s1`; W-PC-PANEL + W-PC-JUNCTURE + W-PC-HONEST 17/17, `tests/test_zoom_cost_panel.js`):**
Zoom-Across `?find=<class>` lands → `navigate_find._foldClassTwin` reads the twin off `../erp/ad_seed.db` (reuses
`_ensureErpDb`) → `_showClassCost` fills the `#info-panel` `#info-cost` block: line `PlannedAmt` (line grain) + the
COMMITTED from its phase (`c_projectphase_id`→`C_ProjectPhase.CommittedAmt` — **per §DATA, line CommittedAmt is NULL
by design; fold from the phase/control-account grain, do NOT bake a line figure, that's S5**) + the whole-project
header pair. IfcBeam→Superstructure +60% marquee, IfcCovering→Finishes −11% (honest mixed). "⏱ View at this moment"
button → `window.tmJumpToPhase(phaseName)` (new in time_machine.js): lands the cursor at that phase's `_ops` window
start (scene partially-built) + opens the ⚖ drawer. Honest labels: cost "from records", phase grain stated, NO
fabricated actual date. §-log `§ZOOM-COST`/`§TM_JUNCTURE`. **Also (user ask):** the ⚖ drawer now only OFFERS itself
when the building has a twin — `#tm-var` button hidden unless `_loadTwin()` resolves a C_Project (`§TM_VAR_GATE`);
`_loadTwin` is building-aware (re-probes on building switch). Populated-drawer/panel Playwright shot deferred (Hospital
geometry in OPFS); whitebox §-log is the primary proof.

## S3 — REALTIME CROSS-TAB SCRUB + SCENE PINPOINT  (REFRAMED 2026-06-20 by user decree)
⚠ **The 4D ALREADY EXISTS — do NOT regenerate it.** `injectGantt` builds the timeline; `C_ProjectPhase` holds the
real dates. PP_Order routing / overhead costing (the e-Evolution Mfg plugin the user built to iDempiere) is the
LATER **S4** "Primavera/Navisworks-rival" dashboard (`TM_SHOPFLOOR_COSTING_SPEC.md`) — NOT this stage. Schedule
variance, when shown, is a **relative projection from the cost variance** (ratio r=Committed/Planned → slip =
planned-dur×(r−1)), labelled "projected from cost", never an invented actual date (ripple = S6).
GOAL (now): demonstrate the framework's two muscles — **(a) realtime cross-tab broadcast** + **(b) timeline scrub
that pinpoints the exact scene item the data is addressing**, with an overlay singling each addressed item out.
DO (viewer/time_machine.js): scrub → `Connect.publish('timeline',{cursor,frac,frontier,lead,building,surface})`
(the SAME bus the modeller already speaks) + `Connect.publish('selection',lead)` so an ERP/sibling tab lights the
record; PURE `_frontierAt(cursor)` = ops straddling the cursor (parked→last-finished fallback) drives a `#tm-pinpoint`
HUD callout; subscribe inbound `timeline` (viewer-sourced, same building, echo-guarded + throttled) → sibling viewer
tabs scrub in lockstep. ⚖ drawer already twin-gated (S2).
WITNESS: **W-TM-PINPOINT** (`_frontierAt` = the ops the cursor straddles; empty before start; last-finished fallback)
· **W-TM-BROADCAST** (publishes timeline+lead selection tagged surface=viewer; echo-guarded; throttled; inbound
sibling scrub applies, foreign surface/building ignored).
✅ **S3 DONE (branch `feat/tm-variance-s1`; W-TM-PINPOINT + W-TM-BROADCAST 11/11, `tests/test_tm_broadcast.js`):**
all of the above shipped; `renderAtTime` calls `_broadcastTimeline()`; sw v675→ (bumped at commit). §-log
`§TM_BROADCAST`/`§TM_TL_IN`/`§TM_PINPOINT`. Cross-tab visual demo (two tabs in lockstep, ERP record-light) is the
Playwright/manual leg — deferred with the rest (Hospital geom in OPFS); whitebox §-log is the primary proof.

## S4 — SHOPFLOOR COSTING  (cost elements + setup/batch)   [detail: TM_SHOPFLOOR spec §MODEL/§TM-AS-SHOPFLOOR]
GOAL: each operation's cost = real M_CostElement buckets (Material/Labor/Burden/Overhead/Setup) summing to its
PlannedAmt to the cent; setup is fixed per LOT (perElementSetup=setup/N), run=rate×N ("minimal items built
together" = the lot). TM plays it: setup spike → run accrual → overhead applied; 5D dashboard = the cost-element
STACKED S-curve; a batch's elements light together; variance drawer extends to element grain.
WITNESS: **W-SHOP-ELEMENTS** (buckets sum to PlannedAmt, map to real M_CostElement) · **W-SHOP-BATCH**
(perElementSetup==setup/N; double N halves per-unit setup) · **W-SHOP-SCURVE** (monotonic stacked accrual ends at
Planned/Committed) · **W-SHOP-DATES** (PP schedule-vs-actual = real op date variance) · **W-SHOP-SOURCE** (every id
resolves to a real seed row; generated values carry the marker).

## S5 / W0 — EARN THE ACTUAL  ✅ DONE 2026-06-22 (PR #492, branch lane/tm-w0-earn-actual, auto-merge armed SQUASH)
GOAL: CommittedAmt becomes a real fold of atomic per-cost-element rows (not PlannedAmt×factor). Then EVM
(PV/EV/AC→SPI/CPI) is honest, not seeded. WITNESS: **W-PC-EARN 8/8** (CommittedAmt == Σ atomic actuals; signs preserved).
SHIPPED: new `erp/tests/earn_gw_hospital_actual.js` pushes the per-PHASE variance anchor (C_ProjectPhase.CommittedAmt)
DOWN onto 64 atomic `PP_Order_Cost.CumulatedAmt` rows (∝ planned, largest-remainder ties), re-sources
C_Project.CommittedAmt = SUM(CumulatedAmt). RM 87,372,995 now EMERGES from 64 auditable rows (line-to-line AC).
Planned fold untouched (ΣCurrentCostPrice·Qty=64,719,479, S-curve holds); existing W-GW-HOSP-COSTVAR 7/7 unaffected;
idempotent; ad_seed.db not SW-precached → no sw bump. Drill: Superstructure Material 11.9M→19.1M = the overrun driver.
NEXT consumer = W1 W-EAC (forecast reads CumulatedAmt as real AC). ⚠ C_ProjectLine.CommittedAmt stays NULL (no clean
line↔order map; don't pro-rata, per standing memory).

### §W0-SOURCE-DECISION — RESOLVED 2026-06-22 (verified against the real seed bim-ootb/erp/ad_seed.db; canonical, the
### bim-compiler/build/erp/ad_seed.db is 0-bytes/empty — always read bim-ootb's).
**CHOSE (A) PP_Order_Cost — NOT (B) C_ProjectIssue.** Fold the actual from `PP_Order_Cost.CumulatedAmt` per
`M_CostElement`, at `PP_Order` grain, rolled to `C_Project` via `PP_Order.c_project_id`. Reasons (all extracted):
- **Zero schema invention.** PP_Order_Cost (64 rows) ALREADY carries planned (`CurrentCostPrice×CurrentQty`) AND the
  actual accumulator (`CumulatedAmt`) per element. iDempiere-native: CumulatedAmt = the shop-floor accrued actual.
  `C_ProjectIssue` does NOT exist as a table (nor PP_Cost_Collector) → option B = invent a whole table tree. Rejected.
- **Reuses proven S4 fold.** `_loadShopfloor` already sums these 64 rows → ΣCurrentCostPrice·Qty = 64,719,479 ==
  C_Project Hospital PlannedAmt (W-SHOP-SCURVE). The ACTUAL fold is the SAME join reading CumulatedAmt. M_CostElement
  taxonomy real & 4 active: Material 62.42M / Labor 1.55M / Burden 0.52M / Overhead 0.23M. 16 of 18 orders link to
  C_Project 990000 (2 stray = Landscape/Standard).
**THE NON-INVENT CRUX (what W0 actually builds):** today CumulatedAmt == planned EXACTLY (64.72M == 64.72M) → NO
variance lives at the atomic PP grain. The +35% (→ CommittedAmt 87,372,995) lives ONLY as the ×factor at C_Project,
and the REAL per-phase signs live at C_ProjectPhase (Super +60%, Architecture +10%, MEP-Final +7%, Substructure +6%,
MEP-Rough −3%, Finishes −11%). W0 = push those phase-grain signs DOWN onto the atomic PP_Order_Cost.CumulatedAmt rows
as a DOCUMENTED DETERMINISTIC variant (fixed seed, 'generated' marker, NO Date.now/random — same discipline as the
§ACTUAL date generator), then DELETE the ×factor in bake_gw_hospital_variance.js and let C_Project.CommittedAmt
EMERGE as SUM(CumulatedAmt). 87,372,995 must FALL OUT of the atomic sum, never be multiplied in. Invention boundary =
the per-order allocation only, and it is PINNED to reproduce the already-real phase signs → it stays a fold of
documented rows. W-PC-EARN §FALSIFIER: ΣCumulatedAmt(by phase) == C_ProjectPhase.CommittedAmt to the cent, and
Σ(all) == C_Project.CommittedAmt == 87,372,995 — with the ×factor line removed from the bake.

## S6 — WHAT-IF via BLUE FUTURE + (future) WH-ROUTING SCENE   ✅ DONE/LIVE 2026-06-22 (PR #474 engine + #475 UI)
> CLOSED — pending user sight. Engine `viewer/whatif.js` (W-WHATIF 13/13, sw v694) + UI `viewer/whatif_panel.js`
> (Playwright-verified, sw v695). ERPUserGuide §"What-if schedule" written (fig `docs/figs/whatif_ripple.png`).
> To RAISE BACK: the only deferred piece is the banked WH-ROUTING SCENE (a scene+data swap on the TM cursor engine —
> own card when reached, see FUTURE line below); the schedule what-if itself is complete. Also optional: `durDelta`
> steppers in the UI (engine already supports duration slips; UI ships start-slip only).
> [detail: GW spec §NEXT-STAGE-1 / TM_SHOPFLOOR §FUTURE]
GOAL (what-if): a schedule/item edit lands as a BLUE branch op → downstream re-folds in blue (finish+totals move)
beside official; accept=re-baseline, discard=drop. PREREQUISITE: a minimal finish-to-start DEPENDENCY model so a
slip RIPPLES (today phases are independent date ranges) — scope F-S only, NOT a full P6 network. Reuses Blue Future
(branch_id/foldBackGroup/acceptBranchUpTo). FUTURE (banked): TM engine is `cursor→{scene,activeSet,accrual}` — the
WH pick-route is a scene+data swap, own card when reached.
WITNESS: **W-WHATIF** (blue edit re-folds downstream in blue; accept re-baselines; discard restores; forward
variance = planned vs blue).

### §S6-SPEC (resolved 2026-06-21 — EXTRACT-only; the F-S chain is REAL in the seed)
GROUNDING (verified `erp/ad_seed.db` C_Project 990000 'BIM: Hospital'): the 7 C_ProjectPhase rows are ALREADY a
contiguous finish-to-start chain ordered by SeqNo — each phase StartDate == prior phase EndDate (lag=0):
Substructure 06-13→07-06 · Superstructure →2027-05-15 · MEP Rough-in →2028-11-09 · Architecture →2029-03-27 ·
MEP Final →2029-04-30 · Finishes →2029-05-14 · Unsequenced →2029-05-28. The forward-pass proj_fold ran (cursor+=days)
IS the F-S dependency. So the "minimal F-S model" = **SeqNo order is the chain; lag_i = start_i − end_{i-1}** (read
from the baseline, preserved on ripple). NO new dependency table, NO P6 network. Scope = single project's phases.
ENGINE `viewer/whatif.js` (sibling of blue_fold.js, schedule-scoped, node-testable via sql.js — KernelOps op-log
calls are guarded/optional exactly like blue_fold's `var ko=KO()`):
- `ripple(phases, slips)` — PURE F-S forward pass. slips: `{seqno:{startDelta,durDelta}}` (days). phase k:
  newStart=start+startDelta, newDur=max(0,dur+durDelta); for i>k in SeqNo order: start_i=end_{i-1}+lag_i (lag preserved),
  end_i=start_i+dur_i. Returns rippled phase array + projectFinish.
- `readPhases(db, projectId, branchId)` — SeqNo-ordered; branchId=null → official (branch_id IS NULL); branchId set
  → overlay (blue row per seqno if present else official). Mirrors proj_control.contractSum branch param.
- `scheduleWhatIf(db, projectId, slips)` → `{official, blue, forward}`; forward = finishSlipDays + PV-at-asOf on both
  schedules (PV via the SAME linear-fraction × PlannedAmt, BigDecimal — money via site/bigdecimal.js). BAC unchanged
  (same scope) — only dates+PV move = "finish+totals move".
- `commitSlip(db, branchId, projectId, slips)` — ensure branch_id col on C_ProjectPhase; INSERT rippled blue phase
  rows tagged branch_id (downstream re-fold), official rows untouched & invisible-filtered; if KernelOps present also
  `commitGroup` a SCHEDULE_SLIP op on the branch (dot rail / op-log). `discardSlip` = DELETE blue phase rows
  (+KernelOps.discardBranch) → official reverts (never moved). `acceptSlip` = copy blue StartDate/EndDate onto official
  rows, DELETE blue rows (+KernelOps.acceptBranchUpTo) → re-baseline.
WITNESS `erp/tests/whatif_witness.js` (W-WHATIF, whitebox §-log, real 990000 phases): (1) commitSlip on Substructure
+30d → readPhases(blue) every downstream phase shifted +30d & projectFinish +30d, readPhases(official) UNCHANGED;
(2) forward.finishSlipDays==30, blue PV ≠ official PV at a mid as-of; (3) acceptSlip → official now carries rippled
dates; (4) fresh DB → commitSlip then discardSlip → official == original, zero blue rows. proj_control.js UNTOUCHED.
UI ✅ SHIPPED (PR #475, sw v695) — `viewer/whatif_panel.js`: floating "What-if schedule" panel opened by the "What-if"
btn in the Find selection row. Grey official F-S bars + per-phase −/+ slip steppers + blue downstream ripple bars +
header (finish slip / PV move / BAC unchanged) + Accept(commitSlip→acceptSlip→OPFS persist) / Discard. Loads the same
folded project the › ERP push uses (OPFS push-store first, else bundled erp/ad_seed.db 990000). ALL math via
window.WhatIf. Playwright-verified (slip Super +21d→6 downstream re-fold, 2029-05-28→06-18, PV 64.7M→61.1M, accept
re-baselines, 0 errors); wow-shot `docs/figs/whatif_ripple.png`. proj_control.js UNTOUCHED. §-log gated, not visual.

## S7 — WHEN IT GETS BUILT, ON THE THING ITSELF  (hover + `#info-panel` 4D block)   ⬜ SPEC ONLY
GOAL: answer "when does this get built, and what does it cost" **on the element the user is already
looking at** — no Gantt, no Find panel, no ERP tab, no Time Machine activation. S2 put the COST on the
selection; this stage puts the DATE beside it and makes both reachable by hover as well as click.
Idea + go-ahead: user, 2026-09-13 ("an icon in the pill where a panel pops up during hover any item in
the model, to show when they are likely to build and cost").

### §S7-GROUND (verified in bim-ootb `main` @ `fc7e4ac6`, 2026-09-13 — every surface already exists)
- **Hover surface: `viewer/hover_name.js`.** `pointermove` → rAF-throttled raycast → guid → `elements_meta`
  → one-line `#hover-name-label` (`pointer-events:none`). Armed by the Find-panel "hover name" checkbox /
  `'`. Its header records the budget trap it ALREADY solved: "raycast per pointermove is not free at 63k
  elements" — an earlier draft re-raycast on a perpetual rAF loop and was replaced. `_lastGuid` early-return
  means work happens once per TARGET CHANGE, not per frame.
- **Click surface: `#info-panel`** (`viewer/viewer.html:515`) — Class/Name/GUID/Building/Storey/Discipline/
  Material rows, then `#info-cost` (hidden, own top border), then `#snag-btn-row`.
- **Cost already lands there (S2).** `find_erp_push.js _showClassCost` → `_foldClassTwin(ifcClass)` reads
  `C_Project`/`C_ProjectLine`/`C_ProjectPhase` off `../erp/ad_seed.db`. It is NOT Zoom-Across-only:
  `navigate_find.js:4865` already calls `_showClassCost(ifcClass, 1, guid)` on a plain pinpoint pick
  (`:5188` on a scope). So the panel S7 extends is already wired to an ordinary click.
- **The date exists in TWO places; only one is right for a panel:**
  - `time_machine.js:9106 window.tmJumpToElement(guid)` (§360-IDENTITY) scans `_ops` for
    `output_guid === guid` and uses `op.end_ts`. It needs TM **active** with `_ops` loaded, and it *jumps*
    — it does not *read*. **NOT the source for S7.**
  - The **persisted schedule**: `tasks(task_id, name, schedule_start, schedule_finish, resource,
    total_float, is_critical, schedule_id, is_summary)` ⋈ `task_elements(task_id, guid)`, active schedule
    via `ScheduleAuthor.activeSchedule(db)`. Already read by `viewer/schedule_read_4d.js` (pure, DOM-free,
    node-testable, "computes NOTHING about when work happens"). **This is the source.**
- DOCTRINE FIT: §3 *read the twin, don't recompute* — the date is READ from the record `schedule_author.js`
  wrote. §4 *honest labels* — see §S7-GRAIN, which is the whole reason this stage has a grain section.

### §S7-GRAIN — DECIDED FIRST, BEFORE ANY CODE (user agreed 2026-09-13: ship at IFC-class grain)
The two halves of this panel do **not** share a grain, and that is the one thing that can make it lie.
- **Date = ELEMENT grain, honest.** `task_elements.guid` is per-element; "this door is built 2027-04-12"
  is true of that door.
- **Cost = IFC-CLASS grain, NOT element.** `_foldClassTwin` joins `M_Product.Value = ifcClass` →
  `C_ProjectLine.PlannedAmt` is the whole class's line, and per §DATA the line `CommittedAmt` is NULL by
  design so the committed side folds from the PHASE. Hovering one door shows what **all 254 IfcDoor** cost.
- **RULE (load-bearing, not cosmetic):** the cost row must NAME its grain inline — the class and its match
  count — and must never render a bare money string next to the element's own name, where it reads as this
  element's price. Reuse S2's existing "from records" honesty label; add the count.
- **Per-element cost is explicitly OUT of S7.** It needs guid-grain pricing (`navigate_find` `selectionPriced`)
  plus the per-line precision already logged as a follow-up in `FIND_OPENLINK_EXISTING_ORDERLINE.md`
  ("Slice-1 grain = project-level"). Do not sneak it in; it is a separate, larger stage.

### §S7-DO
1. **`viewer/schedule_read_4d.js` gains `windowForGuid(db, guid, opts)`** — pure, one query, reusing the
   module's own `activeSchedule`/`execRows`. Returns `{taskId, name, startDate, finishDate, resource,
   totalFloat, isCritical}` or `null` (guid in no task / no active schedule / undated task). NO new module,
   NO recompute, NO second copy of the reader — the same reason this file exists instead of living inside
   `boq_charts.html`.
2. **`#info-panel` gains `<div id="info-4d">`** — same position/pattern as `#info-cost` (hidden by default,
   own top border), filled on pick from `windowForGuid`. Rows: task/phase · `start → finish` · trade ·
   float, with a critical marker when `is_critical`. This is the answer to "what does *add a 4D window to
   #info-panel* mean": one more sibling block in the panel that already opens on click, not a new panel.
3. **Hover label gains ONE line**, not a panel: `<name> · <phase> <startDate>`, only when `windowForGuid`
   hits. `#hover-name-label` stays `pointer-events:none` and one-line; the existing `_lastGuid` early-return
   already bounds this to one query per target change.
4. **Pill toggle** registered through `panels.js` PillBuilder (`:1303`, the declarative icon+panel wiring),
   **data-gated** in the shipped convention — icon appears only when `ScheduleAuthor.activeSchedule(db)`
   resolves (same rule as `hba_lens.js:1096` "no data → no icon, no clutter" and S2's own `§TM_VAR_GATE`).

### §S7-NOT-DOING (recorded so it isn't re-proposed)
**A pop-up panel on hover.** It must chase the cursor, re-render on every target change, and stay
`pointer-events:none` or it eats the very hover that opened it — and it duplicates `#info-panel`, which
already opens on click and already carries the cost block. Two grains of detail, ONE panel: hover = one
line, click = the block.

### §S7-WITNESS (each NAMES the issue it proves or disproves)
- **W-S7-WINDOW** — `windowForGuid` returns the SAME `schedule_start`/`schedule_finish` the persisted
  `tasks` row holds for a guid present in `task_elements`; `null` for a guid in no task; `null` with no
  active schedule. *Proves the date is READ from the record, not re-derived — the §3 doctrine breach this
  stage would otherwise be.*
- **W-S7-GRAIN** — the rendered cost row names its IFC class and match count; no element-grain money string
  is ever emitted next to the element name. *Proves a class figure cannot be misread as this element's cost.*
- **W-S7-GATE** — on a building with no `schedules` row, `#info-4d` stays `display:none` AND the pill icon
  is absent. *Proves no empty panel and no dead icon — the clutter the data-gate convention exists to stop.*
- **W-S7-HOVER-BUDGET** — hovering N distinct elements issues N `windowForGuid` calls, not N-per-frame;
  the `_lastGuid` early-return still holds with the extra lookup attached. *Proves S7 does not re-open the
  raycast/query budget `HOVER_NAME.md` already had to fix once.*

### §S7-LOG
`§4D_ON_ELEMENT guid= task= start= finish= resource= critical=` on a hit ·
`§4D_ON_ELEMENT_GATE reason=no_active_schedule|guid_not_in_task|undated` on a miss (never silent — the
same "REPORTS, never silently drops" rule `4D_template.json` states for itself).

### §S7-STATUS
⬜ **SPEC ONLY — nothing implemented.** Blocked on nothing; §S7-GRAIN is already decided. Do §S7-DO 1 + its
witness (W-S7-WINDOW) FIRST and stop there for review — it is the only leg with a new engine surface; 2-4
are wiring onto surfaces that already ship.

# ═════════════════════════ PHASE 2 — THE WEDGE (from twin to commercial cockpit) ═════════════════════════
## §WEDGE-STRATEGY (decided 2026-06-22 after the "is it a killer?" analysis)
VERDICT of the analysis: the one-op-log BIM↔ERP twin is a killer *architecture* + killer *demo*; it is NOT yet a
killer *product* because (a) it is demo-grade on the seed (990000), (b) "unifies 4 tools" is a feature list, not a
buyer, (c) the F-S what-if is not a scheduler. Phase 2 = turn the architecture into a product by picking ONE wedge
and making the moat load-bearing for it. **It FITS AS-IS — no redesign.** The signed-op-log + blue-branch model is
already the right shape for forecasting + claims; the only new engine work EXTENDS existing files (proj_control.js,
proj_claim.js, whatif.js), none rewrites.
THE WEDGE (the one persona): the **QS / commercial manager** running **progress claims + cost variance + forecast**.
Sharper pain than scheduling (money disputes, claim certification, EAC accuracy) and it uses the moat DIRECTLY: every
claim/forecast is a signed op-group = a defensible audit trail ("git for your claims"); BIM quantities tie each line
to the model (no spreadsheet drift); EVM to-the-cent; what-if = forecast scenarios, reversible.
THE TRAP (explicitly DO NOT build): CPM / resource leveling / calendars / critical-path. That is out-P6-ing P6 — a
loss. Keep the minimal F-S what-if; say so in writeups. Gaps to close are the WEDGE's, not the scheduler's.

## W0 (keystone) = S5 EARN THE ACTUAL — do FIRST. Without real AC the whole cockpit is seeded → not defensible.
(See S5 above: CommittedAmt = Σ real C_ProjectIssue + overhead via M_CostElement; EVM PV/EV/AC honest. W-PC-EARN.)

## W1 — FORECAST AT COMPLETION (make the what-if load-bearing)   [extends viewer/whatif.js + viewer/proj_control.js]
GOAL: the S6 what-if stops being a date toy and drives a COST re-forecast. A slip or a productivity edit on the blue
branch recomputes EAC/ETC beside the baseline: EAC = AC + (BAC−EV)/CPI (index method) AND a bottom-up re-fold (the
honest one); VAC = BAC−EAC; the forecast finish from the rippled schedule. Blue forecast vs official baseline;
accept = re-baseline the forecast. EXTRACT-only — every input is a real folded/posted number (BigDecimal).
WITNESS: **W-EAC** (EAC/ETC/VAC derive from real EV/AC/CPI + the rippled schedule; index-EAC vs bottom-up-EAC both
shown; blue forecast ≠ baseline; accept re-baselines; discard restores).

## W2 — CERTIFIED, DEFENSIBLE PROGRESS CLAIM (surface "git for your claims")   [extends viewer/proj_claim.js]
GOAL: a progress claim becomes a SIGNED op-group carrying its provenance — the BIM quantities (model guids/QTO), the
rate-pack id, the % complete per phase, the EV earned — then a **certify** step (DocAction) posts it (F-lane GL to the
cent, reuse postingPreview). The op-log IS the audit trail: re-open any past claim, see exactly what it was built
from, prove it wasn't back-edited (tamper-evident chain, kernel_ops verifyChain). This is the buyer-visible moat.
WITNESS: **W-CLAIM-CERT** (claim op-group seals qty+rate+EV provenance; certify posts to the cent; verifyChain proves
the trail; a later edit is a NEW op, never a silent rewrite).

## W3 — THE LOOP ON A REAL PUSHED PROJECT (kill "demo-grade")   [end-to-end, no seed shortcuts]
GOAL: drive the WHOLE cockpit on a project pushed live from the viewer (NOT baked 990000): select in 3D → › ERP push
→ period-1 claim → variance → W1 what-if forecast → W2 certify → period-2. Every number traces to the pushed fold or a
posted op; §-log + visual witness; the Hospital seed is only a fallback demo, never the proof.
WITNESS: **W-COCKPIT-LOOP** (a freshly-pushed project completes claim→variance→forecast→certify→next-period with
every figure sourced; round-trips into native iDempiere windows; zero invented values).

## §POSITIONING (honest — say in any writeup)
PHASE-2 SHARPENING: lead with the WEDGE, not the feature list — **"the BIM-linked commercial cockpit: your progress
claims, cost variance, and forecast-at-completion on one signed log — to the cent, reversible, no install, every line
tied to the model."** One persona (QS/commercial), one loop (claim→variance→forecast→certify).
(Underlying, still true:) Unifies what is normally FOUR tools — P6 (schedule/EVM) + Unifier (cost) + Synchro (4D) +
CostX (5D) — onto ONE signed op-log (no drift, free what-if). NOT a CPM engine (no resource leveling/calendars/
critical-path depth). Claim the unification + log-native what-if + the defensible audit trail; never the scheduling
horsepower.

### §MARKET-EVIDENCE (deep-research wf_dd45809b-abb, 2026-06-22 — VERIFIED claims only; synthesis hand-done, verify
### partially truncated by session quota — re-run the abstained "link-rots" claims after the next reset to firm up).
THE ONE-LINER (sourced): *every 5D BIM tool folds the PLAN from the model then TYPES IN the actuals; we fold the
actuals too — AC is derived from the same signed op-log as the geometry, so the cost↔model link can't rot.*
- **The AC gap is real and unclaimed.** Across commercial + 2024–2026 academic work, the PLANNED/EARNED side (PV/EV)
  is folded from the model; the ACTUAL side (AC) is ENTERED/imported. Nobody folds AC from atomic work-order/txn rows
  up a model-linked BOM. This is W0's exact target = a NAMED gap, not a solved problem.
- RIB **CostX** = "5D BIM, model live-linked to rate libraries/workbooks"; NO EVM (PV/EV/AC absent on its BIM page).
  [primary 3-0] https://www.rib-software.com/en/rib-costx/bim
- **RIB 4.0 / iTWO** = "model-oriented 5D BIM linking time/cost/design", procurement generated from the model; cost-
  control yes, but NO PV/EV/AC, NO CPI/SPI/EAC, no atomic-row AC fold. [primary 3-0] https://www.rib-software.com/en/rib-4-0
- **IFC-EVM framework** (Applied Sciences 2026) computes BCWS/BCWP/ACWP from a shared IFC model — but ACWP = "actual
  input cost recorded on site" = ENTERED, not folded. [primary 3-0 / 2-1] https://www.mdpi.com/2076-3417/16/5/2547
- **COST-BIM** (Java OpenBIM research tool) co-locates 5D+EVM in one interface; its "auto-maintained on model change,
  no data loss" claim was **REFUTED 0-3** → even the research tool's link ROTS. https://www.researchgate.net/publication/330573866
- **BIM↔ERP single substrate = "nascent stage, open research gaps"** (MDPI survey 2024, 3-0); BIM & ERP framed as
  "two separate systems". https://www.mdpi.com/2075-5309/14/10/3165 . Nearest research match = a Springer chapter
  arguing BIM should move read-only→interactive read-write shared DB (= our op-log thesis, as a proposal not a product).
- **ITcon Pishdad 2024 — NOW VERIFIED (primary PDF re-fetched 2026-06-22, was abstained):** https://itcon.org/papers/2024_24-ITcon-Pishdad.pdf
  · "Existing 5D BIM tools are used to estimate the cost of projects during the preconstruction period. There is a lack
    of integration between the 5D BIM models, existing progress monitoring tools, and payment systems." [CONFIRMED]
  · 3 linkage modes (Ramaji et al 2018): manual data mapping / cost-loaded BIM / linked models — and "the overall
    information flow still requires manual work, such as the [mapping]" → the link is NOT self-maintaining. [CONFIRMED]
  · Real case study (Georgia Tech campus-center, 8-storey): "5D BIM was not used to track actual payments… The accounting
    system is not interoperable with the 5D BIM [tool]… At present, there is no tool for tracking costs on a line-to-line
    basis… Pay certificates did not correspond to the Work Breakdown Structure." [CONFIRMED — directly validates W0]
- Nearest open-source neighbour to watch: `datadrivenconstruction/OpenConstructionERP` (GitHub, BIM+ERP, unverified-depth).
- NOVEL & defensible (verified by ABSENCE): (1) AC from atomic op-log rows not entered; (2) one signed op-log where
  geometry/BOM/work-order/cost are the SAME folded data; (3) link structurally can't rot (single substrate, not a bridge).
- ALREADY-SHIPPING (don't claim novel): 5D quantities→live-linked cost; 5D+EVM co-located; work-orders generated from model.
- COVERAGE CAVEAT: CostX + RIB primary-sourced; ITcon Pishdad 2024 now primary-VERIFIED (above). STILL unverified:
  Synchro / Navisworks TimeLiner / Vico / Procore / P6+EVM not individually primary-confirmed; Nature s41598-025-27546-0
  "AC entered as aggregate, no audit trail to atomic rows" UNVERIFIED (source behind auth wall, couldn't re-fetch).

## §STARTUP READS
- this lane (act from here) · viewer/time_machine.js (renderAtTime, drawVariance, drawDashboard, injectGantt,
  _phaseVariant, _opCost) · viewer/proj_fold.js + viewer/proj_claim.js (the twin read/write) · erp/idempiere.html
  (native _zoomAcross/_zoomDestinations + the registered 'viewer' Zoom-Across destination) · erp/zoom_across.js ·
  erp/ad_seed.db (the §DATA facts) · detail cards: GW_HOSPITAL_SHOWCASE_SPEC.md, TM_SHOPFLOOR_COSTING_SPEC.md,
  ZOOM_ACROSS_SCOPE_SESSION.md.

## §WITNESS INDEX (in stage order)
S1 W-PC-TWIN-SOURCE · W-PC-DRAWER  |  S2 W-PC-PANEL · W-PC-JUNCTURE · W-PC-HONEST  |  S3 W-4DGEN  |
S4 W-SHOP-ELEMENTS · W-SHOP-BATCH · W-SHOP-SCURVE · W-SHOP-DATES · W-SHOP-SOURCE  |  S5 W-PC-EARN  |  S6 W-WHATIF ✅13/13  |
S7 W-S7-WINDOW · W-S7-GRAIN · W-S7-GATE · W-S7-HOVER-BUDGET ⬜spec
PHASE 2 (the wedge): W0=S5 W-PC-EARN (keystone) | W1 W-EAC | W2 W-CLAIM-CERT | W3 W-COCKPIT-LOOP
