# ⚠ DO NOT REMOVE — Scope guard
# SCOPE: follow-up film to the ERP Tech Trailer — "Kernel ERP has DEPTH, not just a legacy look": ONE POS Order is
#   completed in the iDempiere-parity UI and the whole cycle is shown moving: auto Shipment + Invoice, drill/zoom
#   across the generated documents, Info Product StorageOnHand changing, accounts posting (Fact_Acct), and whatever
#   else a legacy user checks. Spec-first: nothing is filmed until every beat below has a §-line that proves it.
# READ THE LOG after every run (exit code is not evidence). Honour until the # DONE appendix is written.
# TWIN CARDINAL RULE (CLAUDE.md): SQLite == legacy iDempiere, incl. look & feel. A beat the kernel cannot do
#   (e.g. Info Product, if absent) is a GAP fixed on the SQLite side — never filmed around, never "accepted".

## 1. THE ASK (red1, 2026-10-13, verbatim)
> "Since we have put in lots into our Kernel ERP to get parity with the legacy, have a follow up that show what is of
> main concern to legacy users. That it has depth ie do a complete cycle proof say POS doctype Order that triggers
> auto Shipment / Indirect invoice, resulting in change of all related, thus able to Zoom or drill thru documents such
> as those docs and show the InfoProduct that StorageOnHand is affected. Finally of course accounts posting, and what
> u deem is needed. If u want, u can have a dedicated agent handling the SQLite parity check."

## 2. WHAT IS ALREADY PROVEN / WHAT IS NOT (measured 2026-10-13, bim-ootb origin/main ca3c1176, worktree /tmp/wt-erp-depth)
| Piece | State | Evidence |
|---|---|---|
| POS Order (doctype 135, `DocSubTypeSO=WR`) → CO auto-creates Shipment + Invoice | **engine ported** (`erp/model_order.js` completeIt: `autoInOut`, `_createInvoice`) | legacy G3 (order 80005: on-hand 4→3, shipments=1, invoices=1); SD-11 MATCH compared=17; S1/S11 |
| Stock effect at CO (StorageOnHand ↓) | engine ported, sidecar baseline+Σ txns (`idempiere.html:2679-2707` `§STOCK-ONHAND`) | S7a/S7b, SD-11 |
| Accounts posting of the cycle (Fact_Acct DR/CR, COGS) | engine ported (`doc_poster.js`); Posted pill renders `readPostings` (`ACCTS_POSTED_PANEL.md`) | SD-11, `witness_*posted*` |
| Zoom Across (windows referencing this record) | toolbar button `idempiere.html:1639` | `poc_zoom_across*.js` |
| **Info Product window (legacy `InfoProductWindow.java`, coded, not AD_InfoWindow)** | **ABSENT** — no `InfoProduct` in `erp/*.js|html`; `ad_infowindow` has 2 custom rows only. Kernel has the reports "Storage Detail", "Storage per Product" (AD menu) | grep 2026-10-13 |
| The cycle driven END-TO-END in the generic Sales Order window with DocType=POS Order (not only the POS lens / harness) | **UNMEASURED** — to be probed (§4 P1) | — |

## 3. BEATS (draft — each needs a §-line before it is filmed; numbers spoken come only from those lines)
1. Before: Info Product for the sold product — QtyOnHand / Reserved / Ordered, per warehouse + locator. `§INFOPROD before=…`
2. New Sales Order, DocType **POS Order**, BP, product, qty → Prepare shows totals/tax. (`§CRUD`, `§AD-DOCFSM-LIVE`)
3. **Complete** → status CO. The legacy surprise: a Shipment and an Invoice appear that nobody keyed. `§DOC-COMMIT-LIVE`, ids of the 2 generated docs.
4. Zoom Across / drill from the order → Shipment (MM, CO, line qty) → Invoice (CO, totals, tax) → back. `§ZOOM-ACROSS`.
5. Info Product again — QtyOnHand dropped by the sold qty; the transaction row (Material Movement C-) is there. `§INFOPROD after=…`
6. Posted: order has none (order is not posted); Shipment posted Dr COGS / Cr Inventory; Invoice posted Dr Receivable|Cash / Cr Revenue / Cr Tax; balanced. `§POSTED-READ`.
7. Optional depth beats (decide after measuring): Void of the order reverses shipment + invoice + stock (SD-17, S12 MATCH); Storage Detail report; payment/allocation (`M-2`-class cash tender).
Language/format: PLAYBOOK (FILM_NARRATION.md) — English first (Kokoro two-voice dialogue), Thai afterwards; UI English (legacy users). New work, not a re-cut.

## 4. WORK ORDER (spec → witness → implement)
- **P1 PROBE (kernel side, CPU):** headless Playwright on the worktree, GardenWorld/GardenAdmin: create a POS Order in the generic Sales Order window, Complete, read: generated M_InOut + C_Invoice ids, `m_storageonhand`/sidecar delta, `fact_acct` rows. Record every step that cannot be done as a named GAP.
- **P2 PARITY (dedicated agent, read-only vs legacy):** same scenario on the local legacy pilot via the Bridge (`scripts/bridge/`, `prompts/SQLiteIDEMPIERE.md`): compare doc statuses, line/tax/grand totals, stock effect, **Fact_Acct lines per doc** and **StorageOnHand per locator**. Every difference = `§GAP` fixed on the SQLite side.
- **P3 INFO PRODUCT port:** port legacy `InfoProductWindow` (criteria + result grid + lower tabs incl. Warehouse/StorageOnHand) as an Info Window mechanism in the generic layer (AD-LAYER LAW: no per-window code; source `~/idempiere-dev-setup/idempiere/org.adempiere.ui.zk/WEB-INF/src/org/adempiere/webui/info/InfoProductWindow.java`). Witness: a sale changes its on-hand figure, number equals legacy.
- **P4 FILM:** recorder (pattern `scripts/film_erp_techtrailer.js`) + dialogue TSV + fit + mux; GPU only with red1's OK.

## 5. WITNESSES (each names the issue it proves)
- W-DEPTH-CYCLE — issue: "a POS Order in the generic window really produces Shipment+Invoice+stock+postings"; INCONCLUSIVE if the generated docs are not found by id.
- W-DEPTH-PARITY — issue: "the twin's cycle equals legacy's"; VACUOUS if either side produced 0 docs.
- W-INFOPROD-ONHAND — issue: "Info Product on-hand moves with the sale and equals StorageOnHand"; NO-OP if before==after.

## 6. LOG
- 2026-10-13: spec written.
- 2026-10-13 P2 PARITY (agent, pilot :8088 started via ~/idempiere-pilot/start.sh; logs `…/scratchpad/parity/`, session-local): POS Order 135, BP 112, org 12, wh 104, qty 1, **costed product Mulch 137**: order, auto Shipment (CO, C-, qty 1, loc 102), auto Invoice (CO, 3.18 = 3.00 + 0.18 tax 105), QtyDelivered/Invoiced, BP open balance +3.18, Fact_Acct per doc in both schemas (invoice 518 DR 3.18 / 596 CR 0.18 / 758 CR 3.00; shipment 430 DR 2.70 / 742 CR 2.70) — **MATCH legacy (legacy docs 1002926 / M_InOut 1001804 / C_Invoice 1002060)**. StorageOnHand: the C- transaction (-1, loc 102) matches; the ABSOLUTE figures differ only because the seed's baseline ≠ the pilot's accumulated stock (`§GAP storageonhand_baseline`, baseline only, not a rule). Tax: the model path (ML.run) does not derive line tax — c_tax_id was supplied as 105 by the probe; via the UI the line callout fills it.
  **OPEN candidate GAP (unproven):** Oak Tree 123 — legacy shipment is Posted=E (AverageCostingNegativeQty, cost qty 0) while the model path posted it Y (cost qty 25 in seed; forcing 0 still posted Y; no m_costdetail table in the seed). Settle with the harness's M3_STATE_SYNC (legacy m_cost + m_costdetail) before any claim. **FILM USES MULCH 137** (costed, posted both sides).
- 2026-10-13 P1 (UI probe, worktree /tmp/wt-erp-depth): POS Order creatable in the generic Sales Order window (doctype/BP/org pickers, line tab, product select 198 options). **FOUND + FIXED (twin gap): saving a New order left with the document-number preview was REJECTED `regex:docno_numeric`** (the seeded sequence preview is not purely numeric; `_allocDocNo` already treats `<n>`/issued previews as empty per PO.saveNew:3571 but the validator judged it first) — `crud_core.js` now skips the numeric pin for a `<…>` DocumentNo; after the fix `§DOCNO table=c_order docno=80003 … via=ModelTrade.MSequence`. Witness still to write (W-DOCNO-PLACEHOLDER-SAVE).

## 7. INFO PRODUCT PORT (2026-10-13) — spec written BEFORE code. Witness: W-INFOPROD-ONHAND (+ W-INFOPROD-PARITY)
Legacy oracle = `org.adempiere.webui.info.InfoProductWindow` (1128 l) over `InfoWindow` (3787 l), driven by the DICTIONARY row
`AD_InfoWindow 200000 "Product Info"` (AD_Table 208, 25 `AD_InfoColumn` rows — seed lacked them: shipped via `erp/patches/ad_seed.db.sql`,
extracted from the reference `idempiere` DB by `build_model_patch.py`). NOT hand-coded columns: the generic engine reads the dictionary.
| Behaviour | Java source | Port |
|---|---|---|
| Entry point = toolbar "Product" button (always present, role `canAccess_Info_Product`) → `InfoPanel.showPanel("M_Product")` | `ADWindowToolbar.java:282-286`, `AbstractADWindowContent.java:3533-3537` | button next to Zoom in `renderToolbar` (same `btn()` helper). The Product-field lookup Info button + menu entry: DEFERRED (field Info button = another call site of the SAME engine; no new mechanism) |
| Criteria = AD_InfoColumn `IsQueryCriteria='Y'` (Value, Name, UPC, SKU, Warehouse, Vendor, AttributeSet, ASI, PriceListVersion, Category, Sold, Purchased); `SelectClause="0"` columns (Warehouse, ASI) only publish context, never enter the WHERE | `InfoWindow.java:1395-1412` | `erp/ad_infowin.js` |
| WHERE per criterion: `[Function](col) <Operator> [UPPER](?)`; `Like` appends `%` to the value; criteria joined AND | `InfoWindow.java:1455-1500`, `setParameter:1686-1702` | same |
| Warehouse selected ⇒ add `p.IsSummary='N'`; default order `QtyAvailable DESC` when a warehouse is selected | `InfoProductWindow.getSQLFilter:~232-240`, `prepareTable:~1090` | same |
| Warehouse default = login context `M_Warehouse_ID` (`initParameters`) | `InfoProductWindow.initParameters` | session org's `AD_OrgInfo.M_Warehouse_ID` (this app has no login-warehouse pick); empty if none |
| Result columns = `IsDisplayed='Y'` by SeqNo: Discontinued, Search Key, Name, Available, List Price, Standard Price, On Hand, Reserved, Ordered, Unconfirmed Qty, Unconfirmed Move, Margin, Vendor, Limit Price, Instance Attribute | AD_InfoColumn 200000 | same; labels = AD_InfoColumn.Name |
| Qty/price columns call DB functions `bomQtyOnHand/Available/Reserved/Ordered(product, warehouse, 0)`, `bomPriceList/Std/Limit` (PL/pgSQL, `\df+` in `idempiere`): stocked item ⇒ `SUM(M_StorageOnHand.QtyOnHand)` over the warehouse's locators / `SUM(M_StorageReservation.Qty)` IsSOTrx=Y (reserved) or N (ordered); non-stocked non-BOM ⇒ 99999 / 0 / 0; Available = OnHand(ForReservation) − Reserved | functions in DB | SQLite templates in ONE registry (`AdInfoWindow.SQLFN`) rewriting the dictionary's SelectClause; ONE stock truth = the tip-shadowed `m_storageonhand` (records of THIS session live in the signed sidecar — read through `window.__crud.withModelTrx`) |
| Lower tabs on row select: Warehouse Stock (`M_PRODUCT_STOCK_V` grouped by Warehouse: QtyAvailable/QtyOnHand/QtyReserved, totals row), Description (`M_Product.DocumentNote`), Substitute, Related, ATP (per LOCATOR: QtyOnHand/Reserved/Ordered + open order lines, "show detail" check), Price (`M_ProductPrice` × active PLV) | `InfoProductWindow.renderContentPane:~215-420`, `refresh:~620-700`, `initAtpTab:~705-880` | Warehouse Stock, Description, ATP (locator rows + open-order rows, detail check = ASI split), Price: PORTED. |
**Named-deferred (each stays a GAP until closed, never "accepted"):** Substitute + Related tabs (`M_PRODUCT_SUBSTITUTERELATED_V` not in seed); BOM-assembly rollup of the bom* functions (`isBOM='Y'` products show blank qty, not a wrong number); `bomQtyOnHandForReservation` locator-type exclusion (`M_LocatorType` not in seed ⇒ every locator available, equals legacy while no type is flagged unavailable); Unconfirmed Move column (`M_MovementLineConfirm` absent ⇒ blank); ASI criterion/button (`InfoPAttributeInstance`); `PriceListVersion`-less duplicate rows are LEGACY behaviour (one row per price version) and are kept; product-field Info button + menu entry; `SysConfig INFO_PRODUCT_SHOW_PRODUCTS_WITHOUT_PRICE` (default false ⇒ inner price filter not needed because FromClause LEFT JOINs price).
**Witnesses:** W-INFOPROD-ONHAND (browser; issue: "Info Product on-hand moves with the sale and equals the tip StorageOnHand sum"; NO-OP/INCONCLUSIVE if before==after or the row is not found). W-INFOPROD-PARITY (issue: "the SQL the twin runs is the rule the Java runs"; VACUOUS if either side returns 0 rows): same product, the twin's generated SQL executed on a scratch SQLite loaded with the PILOT's storage rows vs the pilot's own `bomQty*` functions.

## 8. STATUS 2026-10-13 (end of build session) — bim-ootb branch `feat/erp-depth-cycle` @3ec60236 (pushed, NO PR yet, sw `CACHE_VERSION` not bumped)
**Witnesses (real browser, CPU):** `erp/tests/poc_depth_cycle_live.js` → `§DEPTH-CYCLE PASS pass=22 fail=0` · `poc_infoprod_onhand_live.js` → `§INFOPROD-ONHAND PASS 12/12` · `witness_infoprod_parity.js` → `§INFOPROD-PARITY PASS cells=187 mismatches=0`. Neighbours re-run green: poc_zoom_across_live, poc_parity_docno_live 10/10, poc_parity_mandatory_live 18/18, poc_posted_column_live, witness_model_void_reversal 7/7, witness_sd16_engine_port. `poc_zoom_across` / `poc_zoom_scope_live` fail identically on pristine origin/main (Viewer/BIM leg, env) — not caused by this branch.
**Twin gaps FOUND by driving the cycle through the window, all FIXED (commits 1bf3f6aa 281c5932 5284f79b 3ec60236):**
1. New order saved as shown was REJECTED (`regex:docno_numeric` judged the `<n>` preview before `_allocDocNo`) — crud_core.js (PO.saveNew:3571).
2. EVERY UI Complete refused "Cannot complete an order with no lines" — `MOrder.hasLines` hook read 0 on the model path (ctx.trx, no lineCount) — ad_modelval.js.
3. Zoom Across counted the bare bundle (destinations=0 for just-generated docs) AND used the wrong rule — now `GenericZoomProvider.java:60-290` (first tab of every window + tab where + client), tip-shadowed — idempiere.html.
4. Posted button empty for a document generated this session (`readPostings` folds the older POST journal) — `_factPostings` reads Fact_Acct through the tip reader — idempiere.html.
5. Void left the reversal Shipment UNPOSTED: `updateReverseLine` tested the line id with `> 0`; session pks are NEGATIVE (−opId) — model_post.js:146.
6. Info Product did not exist — ported (agent): generic Info Window engine `erp/ad_infowin.js` + AD_InfoWindow/AD_InfoColumn 200000 rows (patch) + toolbar "Product" button; §7 above.
**Legacy parity measured (pilot :8088, order 1002927 = BP 118 / org 11 / wh 103 / Mulch 137 ×1, PaymentRule P — the WS refuses PaymentRule B, `ws_webservicefieldinput` row + restart needed, not done):** tax 104 / total 3.00 / shipment 51100 DR 2.70 – 14120 CR 2.70 / invoice 12110 DR 3 – 41000 CR 3 / no payment for P / Zoom = 3 windows / Void = order VO, originals RE, reversals RE (invoice −3, shipment line +1, both C-), stock restored, reversal books (invoice negative amounts, shipment swapped) — **all MATCH the twin (D8, D9 in the witness)**. Not measured: PaymentRule B on legacy (by source MInvoice.completeIt:2009-2072 creates a Cash payment + allocation linked to the INVOICE, not the order — SQLite does the same: tendertype X, c_invoice_id set, c_order_id null ⇒ no Payment window in Zoom, consistent).
**OPEN / not claimed:** (a) Oak Tree 123 negative-cost shipment (legacy Posted=E vs model path Posted=Y) — unproven, needs `M3_STATE_SYNC`; film uses Mulch. (b) **L&F gap seen in the order form: `PaymentRule` renders as a free-text input (value `B`) — legacy shows the Payment Rule list dropdown.** Cause not yet traced (ref-list rows for the column absent in the seed's field fold?). (c) stale log line `§SO-COMPLETE order=… ship=0 invoice=0` is printed after the model path already created them (old fan-out counter) — misleading in the log, harmless. (d) Info Product deferrals listed in §7 (Substitute/Related tabs, BOM rollup, locator-type exclusion, Unconfirmed Move, ASI criterion, Product-field Info button, menu entry). (e) Absolute StorageOnHand differs seed(50)/pilot(51–52): baseline only.
**NEXT:** (1) open the bim-ootb PR from `feat/erp-depth-cycle` (bump sw CACHE_VERSION at deploy); (2) trace the PaymentRule input; (3) film: dialogue TSV + recorder `scripts/film_erp_depthcycle.js` (pattern film_erp_techtrailer.js; the probes in the session scratch show every selector) + Kokoro two-voice fit + mux; English first, no title card (red1: intro/end cards later), GPU only with red1's OK.
