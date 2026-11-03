# ⚠ DO NOT REMOVE — Scope guard / SESSION CARD: WH×POS PICK LANE (§S-2 selector), queued 2026-06-12g2
# Paste-to-start: `proceed with prompts/WH_POS_PICK_LANE.md`
# Scope: the WALK-SIDE half of the "finish the sale → go pick it" loop. The ENGINE half is ✅ DONE
#   (POS_GAP_CLOSE §G-1, W-POS-DELIVERLATER, bim-compiler 5bc4b389) — do NOT rebuild it.
# READ THE LOG after every run (exit ≠ evidence). ALL poc_* via `bash build/erp/run_witness.sh scripts/poc_X.js`.
# NON-NEGOTIABLE: spec-first · witness-led · deterministic NON-INVENT · newVerbs=[] · BigDecimal money/qty ·
#   bim-ootb edits ONLY in /tmp/wt-* off FRESH origin/main, ONE PR, sw bump once, orphan-check the squash.
# STATE AT WRITING: erp sw v660 · viewer sw v647 · ledger 43 (G-3 OSGi-parked) · live POS = album cards +
#   float panel (dispose-with-cart §POS-FLOAT) + Import + hold/recall + deliver-later ENGINE (not yet a door).
# Design sources: docs/SPATIAL_PICKING_SPEC.md §S-2 (STATUS block names this card) · docs/POS_ADDON_SPEC.md
#   §P-12 · build/erp/pos_core.js (buildDeliverLaterGroup / completeShipmentOps / deliverLaterPolicy) ·
#   build/erp/inout_confirm.js (W-WH-CONFIRM gate) · scripts/poc_pos_deliverlater.js (the selector query,
#   witnessed) · ~/bim-ootb/viewer/wh_walk.js (draftPick:98 — the function this lane extends).

## THE LOOP TO CLOSE
Sell deliver-later at the POS (doctype 132 → C_Order CO + M_InOut born DR) → open the WH walk →
the walk OFFERS that open shipment as a route source → walk/scan it → the pick COMPLETES the
M_InOut (by picked qty; 148 demands the confirm fold first) → on-hand moves AT THE PICK. Two
lenses, one ledger, NO coupling (§P-12: new tab, the History timeline is the nav).

## W-1 the POS door (bim-ootb, pos_lens.js) — a deliver-later sale must be MAKEABLE live
- Payment panel gains the deliver-later choice (e.g. "Deliver later · pick at warehouse" beside
  Tender) — DICTIONARY-GATED: shown only when a docsubtypeso='SO' doctype exists in the loaded db
  (seed 132). Rides POSCore.buildDeliverLaterGroup VERBATIM (ctx + {orderId, inoutId,
  c_bpartner_id, doctype: <row read from the db>, invoiceRule: <AD_Column extraction — copy the
  witness query>}). newVerbs=[]. §POS-DELIVERLATER live log line (mirror the witness's).
- Falsifier: the default Tender path stays byte-identical (W-POS-LIVE regression).

## W-2 the §S-2 selector (wh_walk.js draftPick extension) — additive, not a rewrite
- draftPick currently: existing DR m_movement → walk it; else draft from m_storageonhand.
  ADD source: open POS-generated shipments — `SELECT … FROM m_inout io JOIN c_order o ON
  o.c_order_id=io.c_order_id WHERE io.docstatus IN ('DR','IP') AND o.c_pos_id IS NOT NULL`
  (the EXACT witnessed query, poc_pos_deliverlater.js) + their m_inoutline rows as walk lines.
- ⚠ THE REAL SEAM (solve honestly, do not paper over): the walk reads the STATIC ../erp/ad_seed.db
  (wh_walk.js:72) — a live POS sale exists only as SIGNED OPS in the idempiere page's IDB sidecar
  (kernel_ops store), NOT in that static file. Same-device demo = the walk page FOLDS the sidecar
  ops over the seed read (read the same IDB the ERP page persists to — the #268 CRUD-rails store;
  EXTRACT its db/store names from kernel_ops.js, never invent). Cross-device stays the §P-5
  relay/sync story — OUT OF SCOPE here, name it. If the fold-over-IDB is too big for one train,
  the honest staging is: selector + pick-complete proven on a SEEDED DR m_inout first (headless +
  live fixture), the IDB fold as the second commit of the SAME lane — never fake it with a
  hand-inserted row presented as a POS sale.
- Route source choice UI: only when BOTH sources are non-empty (replenish draft + open POS docs)
  show a minimal chooser; one source → walk it directly (KISS, no decision trees on screen).

## W-3 pick-complete = the engine's completion, not M_Movement-style CO
- For a POS-shipment route, the last-step completion calls POSCore.completeShipmentOps(inout,
  lines, dtRow, {pickedQtyOf}) → UPDATE_LINE short-picks + SET_STATUS M_InOut CO, ONE signed
  group via KernelOps.commitGroup; on-hand fold moves by PICKED qty (§S-4 stepper already exists).
- Doctype with IsPickQAConfirm/IsShipConfirm (148/147): completeShipmentOps REFUSES
  'confirm-gated' → drive inout_confirm.createConfirmationOps → operator confirms →
  completeConfirmOps → re-complete (the W-WH-CONFIRM fold, now LIVE). Falsifiers: double-complete
  refused · non-target tap holds the step (existing) · WR sales NEVER appear in the selector.

## W-4 witnesses + train
- Headless: scripts/poc_wh_pos_pick.js (W-WH-POS-PICK) — seeded DR shipment → selector offers it →
  route covers its lines → completeShipmentOps fold → on-hand delta == picked; falsifiers above.
- Live: extend poc_wh_walk_live.js (or sibling) — §-logs `§WH SRC pos-docs=N`, `§WH PICK-COMPLETE
  inout=… CO picked=…`; W-WH-LIVE + W-POS-LIVE regressions byte-honest. ONE bim-ootb train
  (wh_walk.js?v= bump + viewer sw v647→next; pos_lens ?v= + erp sw v660→next if W-1 rides along).
- Bank: SPATIAL_PICKING_SPEC §S-2 STATUS flip · matrix third-axis row update (deliver-later row
  gains the walk-side half) · ERPUserGuide §7/§9 cross-link · lane-master handoff · memory.

## DONE WHEN
W-1..W-4 ✅ (or ⛔ with one fact each, WORK-TO-ZERO): a deliver-later sale made on the LIVE POS is
picked to completion in the LIVE walk with on-hand moving at the pick — §-logs end to end, no fork,
newVerbs=[].

# DONE — 2026-06-13 (Fable5 session): BUILT + HEADLESS-WITNESSED. LIVE VERIFY + TRAIN = SONNET SESSION.
# (user 2026-06-13: "need not test but note in prompt for Sonnet session to test")

## What is DONE (every claim has a §-line in the named log)
- **Spec-first:** `docs/SPATIAL_PICKING_SPEC.md §S-2b` — the full walk-side design incl. the REAL seam,
  sharper than this card guessed: the ERP page op log (`window.ERP.opDb` = the KanbanHost projDb) persists
  to IDB `bim_ootb_cache`/`dbs`/key **`idmp_kanban_proj`** — and today ONLY Kanban drags persist; a POS
  sale lived in page memory only. So W-1 ALSO persists at sale time (host `persist` passthrough). Plus the
  loop-closing decision the card missed: completion **WRITE-BACK** into the shared blob (same gids,
  commitGroup idempotency) — without it the sidecar stays DR and the selector re-offers a picked doc.
- **W-2 verb (engine src):** `build/erp/wh_route.js openPosDocsFromOps(rows)` — PURE sidecar fold (op
  shapes extracted from pos_core/erp_engine; gid adjacency links lines; SET_STATUS folds status; WR
  self-filters). W-WH-ROUTE regression PASS (`build/erp/poc_wh_route.log`).
- **W-4 headless:** `scripts/poc_wh_pos_pick.js` → **W-WH-POS-PICK PASS, 14 verdicts, exit 0**
  (`build/erp/poc_wh_pos_pick.log`): sidecar fold honesty (WR absent) · two sources merged · bins from
  m_storageonhand (qtyonhand DESC; no row → unroutable) · short-pick fold == picked (`§WH PICK-COMPLETE
  inout=910002 CO picked=2/3 foldDiffs=0`) · selector empties · double-complete refused · 148 confirm-gated
  sequence (spawn → confirm(picked) → gate → CO, `§WH PICK-COMPLETE inout=930002 CO via=confirm-gate`).
- **bim-ootb branch `feat/wh-pos-pick`** (worktree `/tmp/wt-poswalk`, base origin/main 07da9c3) — coded,
  node --check green, NOT live-verified, NOT merged:
  - `erp/pos_lens.js?v=5` — W-1 door `#pos-float-deliverlater` (dictionary-gated on docsubtypeso='SO',
    `§POS-DELIVERLATER door=on/off`), rides buildDeliverLaterGroup verbatim, persists via `cfg.persist`;
    Tender handler untouched (W-POS-LIVE falsifier).
  - `erp/idempiere.html` — PosLens.open gains `persist: KanbanHost.persist(opDb, _KPROJ)`; ?v= bumps
    pos_core 3 / pos_lens 5.
  - `erp/pos_core.js` ← SYNCED from build/erp (bim-ootb copy was BEHIND: no §P-12 half!) ·
    **NEW `erp/inout_confirm.js`** (UMD copy; lazy-fetched by the walk, not precached).
  - `viewer/wh_route.js?v=2` ← synced (new verb) · `viewer/wh_walk.js?v=3` — W-2 sidecar read +
    seed SQL merge + chooser (`§WH SRC pos-docs=N`) + bin resolution + W-3 completePos (direct 120 +
    148 confirm branch) + ANNOTATE-only per-step + `§WH SIDECAR-WRITEBACK`.
  - `erp/sw.js v661` · `viewer/sw.js v648` (change notes inside).

## §SONNET-TEST — the executing Sonnet session runs EXACTLY this (then the train)
1. Worktree exists at `/tmp/wt-poswalk` (branch `feat/wh-pos-pick`, committed). If gone:
   `git -C ~/bim-ootb worktree add /tmp/wt-poswalk feat/wh-pos-pick`.
2. `cd ~/bim-compiler` and run the THREE live witnesses — READ each log, exit code ≠ evidence:
   - `bash build/erp/run_witness.sh scripts/poc_wh_pos_pick_live.js` — NEW, the whole loop (door →
     persisted sale → walk offers → short-pick walk → `§WH PICK-COMPLETE … CO picked=2/3 diffs=0` →
     `§WH SIDECAR-WRITEBACK` → reload → `pos-docs=0`). Serves /tmp/wt-poswalk (WT_ROOT to override).
   - `WT_ROOT=/tmp/wt-poswalk bash build/erp/run_witness.sh scripts/poc_wh_walk_live.js` — W-WH-LIVE
     regression (replenish path byte-honest; fresh IDB origin → pos-docs=0 → NO chooser, old flow).
   - `ERP_ROOT=/tmp/wt-poswalk/erp node scripts/poc_pos_live.js` — W-POS-LIVE regression (Tender
     byte-identical; §POS-CENT still green).
   Known-trap notes: test-server must serve /erp/ AND /viewer/ from the SAME origin (shared IDB) —
   poc_wh_pos_pick_live does; BarcodeDetector absent headless → the witness drives WHWalk.confirmHere()
   (manual gate), §-honest. If `?db=../buildings/warehouse_gardenworld.db` 404s, the worktree predates
   #272 — re-base.
3. Witnesses green → ONE train: `cd /tmp/wt-poswalk && git push -u origin feat/wh-pos-pick &&
   gh pr create` (title `erp+viewer(wh×pos): deliver-later door + §S-2b walk selector + pick-complete
   (erp sw v661, viewer sw v648)`) → `gh pr merge --auto --squash` → VERIFY the squash landed (orphan
   check, CLAUDE.md §concurrent-branches; sw.js is the conflict magnet — keep both, higher version).
4. Bank: flip this card's residuals below · SPATIAL_PICKING_SPEC §S-2b add "LIVE ✅ (PR #N)" ·
   ERPUserGuide §7/§9 cross-link (sell deliver-later → pick in the walk) · lane-master 2026-06-13 entry
   → ✅ merged · memory `project_spatial_picking.md`.

## ✅ §SONNET-TEST DONE — 2026-06-13 (Sonnet/Opus session): LIVE-VERIFIED + MERGED (bim-ootb PR #283)
- **W-WH-POS-PICK-LIVE PASS** (`scripts/poc_wh_pos_pick_live.js` → `build/erp/poc_wh_pos_pick_live.log`):
  the full loop on the served pages — door on → persisted deliver-later sale → walk offers
  `§WH SRC pos-docs=1 [910032(oplog)]` → short-pick `§WH PICK-COMPLETE inout=910032 CO
  via=completeShipmentOps(120) picked=2/3 diffs=0 chainOk=Y` → `§WH SIDECAR-WRITEBACK groups=1/1` →
  reload `§WH SRC pos-docs=0` (no double-pick). + W-WH-LIVE + W-POS-LIVE regressions byte-honest.
- **REAL BUG FIXED (live-only):** `viewer/wh_walk.js` opened `bim_ootb_cache` at hardcoded version 1,
  drifting below `scene.js`'s version 2 (`openCacheDB`) → `VersionError` → the sidecar was NEVER read →
  the deliver-later sale was never offered. Headless (W-WH-POS-PICK) couldn't catch it (in-memory
  sql.js, no scene.js IDB). Fixed: all 3 open sites → shared `_openCacheDB()` (kernel_ops §KRN_PERSIST_FIX idiom).
- **eslint no-undef gate:** declared `POSCore`/`InOutConfirm` in `eslint.globals.json` (branch used
  `node --check` only; CI gate flagged the lazy UMD globals). + sw.js synced with origin #282 (erp v661→v663).
- **Train:** PR #283 squash-merged to origin/main (tip 72c9868, erp sw v663, no orphan); SPATIAL_PICKING_SPEC
  §S-2b flipped ✅ LIVE; lane-master 2026-06-13 entry → ✅ DONE.

## Residuals (named, honest)
- Kanban board tip does NOT reflect the walk's write-back SET_STATUS (the seam's `documents`
  projection is untouched by raw kernel ops) — named omission, fold-at-dispatch covers correctness.
- Cross-device selector = §P-5 relay/sync, out of scope (named in spec).
- Walk write-back races a concurrently-writing ERP tab (last-writer blob) — §P-5 story, named.

## §STANDALONE — the WH walk leaves the viewer pill bar; PLANNED, not built (owner, 2026-11-03)
> *"The WH walk also is misplaced as a pill. It should be planned later as a standalone app as the POS to keep the twin clean"*

**Same ruling as the POS** (`prompts/POS_PLUGIN_LOCAL_FIRST.md` §13): a device-side operation is its own app on its own device, joined to the team as a Team device of its Org. It is not a pill inside the twin. The twin keeps only what legacy has.

**Measured today (bim-ootb `origin/main` @ efaa13ce):**
- The walk is a data-gated viewer pill (`pill_whwalk`, `viewer/i18n/*.json:368`). It lights only on models with locator-GUID bins (`viewer/wh_walk.js:12-14`).
- Its route sources are POS deliver-later shipments: `seedPosDocs` `wh_walk.js:169-197` (the tenant seed, plus "live sale (op log)").
- It completes a pick through `POSCore.completeShipmentOps` (`wh_walk.js:105,853-870`).

**Interaction with the POS retirement (P1 slice 2, running 2026-11-03):**
- The pill's deliver-later door (`pos_lens.js` F12, §14.6) is deleted with the POS pill, so the walk loses its *live* POS source. The seed source stays.
- `pos_core.js` is trimmed to `completeShipmentOps` so the walk keeps working until this plan is built.
- uniCenta has no deliver-later (§14/§14A).

**The plan (spec before code; build only on the owner's go):**
1. **Standalone page** on the till pattern (`erp/till.html` / `borrower.html`: engine in a hidden frame, `?team=1`), plus the 3D building it flies through. The app needs the viewer's model; how a slim page gets it without the full viewer is a P0 measurement.
2. **Route source = legacy's own open shipments, not POS-specific.**
   - A deliver-later sale in legacy is a standard order (doctype SO).
   - Generate Shipments makes the `M_InOut` in Drafted status, and the walk picks it.
   - So the selector reads any Drafted customer shipment of the device's warehouse. This removes the `c_order`-POS join in `seedPosDocs`.
3. **Base + batch, like the POS (owner, 2026-11-03: *"Similar to POS, we batch messages with a base. Also to minimise central server usage on our local first model."*). This answers the earlier Q-W1: head office completes, the device only declares.** Legacy already has every piece:
   - **The base (down, once per wave).** Head office runs the legacy steps it already owns:
     - Generate Shipments (`erp/processes/InOutGenerate.js`) makes the shipments in Drafted status.
     - Create Confirmation (`erp/processes/InOutCreateConfirm.js`, ported verbatim) makes the Pick/QA confirm (`M_InOutConfirm` + its `M_InOutLineConfirm` lines).
     - The device receives that set as one base: the shipments, the confirm line ids, the products and the locators. It works fully offline against it.
   - **The batch (up, per Visit, never per scan).**
     - Each bin scan writes an `I_InOutLineConfirm` row on the device (AD_Table 740, AccessLevel 2): `M_InOutLineConfirm_ID`, `ConfirmedQty`, `DifferenceQty`, `ScrappedQty`, `ConfirmationNo`, `Description`.
     - These are exactly the columns legacy's import copies (`ImportInOutConfirm.java:166-170`).
     - A wave's rows travel together at the device's next Visit, which authors the pending rows in one pass (`erp/team_sync.js:259-266`).
     - The relay sees one Visit per wave, not one message per pick. That is the "minimise central usage" half.
   - **Head office imports in a batch, the one executor (FL-8).**
     - Import Confirmations (AD_Process 296, `org.compiere.process.ImportInOutConfirm`, 197 legacy lines) updates the confirm lines by id. A missing id is marked "ID Not Found" (`:156-162`) and every row is re-runnable (`I_IsImported`).
     - Head office then completes the confirm, and with it the shipment. Legacy completes the shipment only when its confirmations are processed.
     - These steps can join Branch Day Close (`POS_PLUGIN_LOCAL_FIRST.md` §2.3) as one more legacy step.
   - **Missing in the twin today (measured):**
     - the `I_InOutLineConfirm` physical table: `erp/ad_import_tables.js` creates only `i_order` and `i_payment`;
     - the Import Confirmations port: the seed has process row 296 but no `erp/processes/ImportInOutConfirm.js`.
     - Both follow the `ImportPayment.js` pattern (DDL via the boot overlay, base hash unchanged).
   - **Consequence:** the device completes no `M_InOut` and no `M_InOutConfirm`. `POSCore.completeShipmentOps` is not needed by the app, so `pos_core.js` can go entirely once the viewer pill is deleted (item 5).
4. **Delete from the viewer when it ships:**
   - the `whwalk` pill entry and its i18n keys (`pill_whwalk`, `pillc_whwalk_1-4` in every `viewer/i18n/*.json`)
   - the `wh_walk.js` tag and the viewer `sw.js` precache line
   - **W-WH-OFF:** the viewer page has no `whwalk` pill and requests no deleted file.
5. **Then `pos_core.js` goes entirely.** Its last caller moves to the app, or to the ported `M_InOutConfirm` path.
6. **Robot seam** (`WH_ROBOTICS_LANE.md` §R-1…§R-4): `window.WHWalk.robot` moves with the app unchanged.

**Witnesses to write before the build:**
- W-WH-BATCH: a wave of N picks rung offline arrives as ONE Visit with N `I_InOutLineConfirm` rows. Relay requests are counted, and must not grow with the number of scans. Import Confirmations then sets every confirm line, and the device wrote 0 `M_InOut`/`M_InOutConfirm` status changes. Mutants: a Visit per scan (the relay count grows with N); a wrong `M_InOutLineConfirm_ID` (must show "ID Not Found", never a silent skip).
- W-WH-APP-ROUTE: the app's route equals `WHRoute.route` over the same Drafted shipment.
- W-WH-APP-CONFIRM: a wrong bin is refused through the one shared gate (W-WH-CONFIRM). A confirm deposits once, offline included.
- W-WH-OFF (above).
