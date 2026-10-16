<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ERP MODEL LAYER — the PO + DocAction contract, ported, so a completed document writes what iDempiere writes

```
# ⚠ DO NOT REMOVE
SCOPE: the MODEL layer of the in-browser iDempiere port (bim-ootb `erp/`): what a save and a DocAction
WRITE, table by table, column by column — not what the window shows (that is the AD window/tab lane,
erp/ad_gridtab.js) and not GL posting rules beyond "every generated document posts".
SCOPE OF "complete" = CLAUDE.md §AD-LAYER LAW rule 6: trade cycle + accounting (order, shipment,
invoice, payment, allocation, storage, costing, BP balances, numbering, workflow). Everything else
arrives through Ninja/plugins via the doc-action extension point defined here.
ORACLE = real iDempiere: Java source ~/idempiere-dev-setup/idempiere (cite file:line) + Postgres
(`idempiere` = reference, `idempiere_pilot` = the pilot worker's LIVE copy — READ-ONLY for this lane).
RULES: spec before code; every claim = a §-line in a saved log that was READ; witness scope = EVERY table
in the change list below (row counts + columns), never a chosen subset; a table that cannot be driven
prints INCONCLUSIVE, never PASS. No DB binary commits — seed changes ship as erp/patches/*.sql + the
idempiere.html self-heal loader. One implementation per responsibility (delete what this supersedes).
READ THE LOG AFTER EVERY RUN.
```

## §WHY — the scope-blind witness this lane exists to retire (user, 2026-10-04)

> *"We already run such tests before and claimed completion but I doubt it. Preempt what model and process
> gaps to be in place and put them in first."*

W-FOLD-COMPLETE printed `maxDiff=0c` while comparing three tables it chose (m_inoutline, c_invoiceline,
fact_acct). Measured below: one POS sale on a live iDempiere touches **16 document-keyed tables + 5 master
tables**. The other 13+5 were never asked.

## §MEASURED-FOOTPRINT — what one completed document really writes (2026-10-04)

Tool: `closure.py` (scratchpad, regenerable — walks every `<table>_id` FK downward + `(AD_Table_ID,Record_ID)`
generic refs + allocation/cash headers upward, over `information_schema`, so the table set is DERIVED, not
hand-listed). Rows per table reachable from the order:

| oracle doc | DB | generator | footprint (table: rows) |
|---|---|---|---|
| POS Order WR 80004 (`c_order_id=1000310`, PaymentRule=B cash) | idempiere_pilot | iDempiere 13 live server, 2026-10-04 | c_order 1 · c_orderline 1 · c_ordertax 1 · m_inout 1 · m_inoutline 1 · **m_inoutlinema 1** · **m_transaction 1** · **m_costdetail 2** (2 schemas) · c_invoice 1 · c_invoiceline 1 · c_invoicetax 1 · **c_payment 1** · **c_allocationhdr 1** · **c_allocationline 1** · fact_acct 18 · ad_changelog 9 |
| On-Credit Order WI 60002 (`1000311`) | idempiere_pilot | iDempiere 13 | c_order · c_orderline · c_ordertax · m_inout · m_inoutline · m_inoutlinema · m_transaction · m_costdetail 2 · c_invoice · c_invoiceline · c_invoicetax · fact_acct 8 · ad_changelog 5 |
| Standard Order SO 50305 (`1000312`) | idempiere_pilot | iDempiere 13 | c_order · c_orderline 2 · c_ordertax · **m_storagereservationlog 2** · ad_changelog 3 |
| Standard Order SO 50000 (`1000003`; 305 like it) | idempiere | iDempiere (2026-06-21 batch, completed via processIt, no workflow rows) | c_order · c_orderline · c_ordertax · m_storagereservationlog |
| Purchase Order 8000 (`200002`) | idempiere | iDempiere 7.x (2020), completed through **Process_Order workflow** | c_order · c_orderline 2 · c_ordertax · **ad_wf_process 1 · ad_wf_activity 3 · ad_wf_eventaudit 3** · m_inoutline 2 · m_matchpo 2 · c_invoiceline 2 · m_matchinv 2 · m_transaction 2 · m_costdetail 8 |
| POS Order WR 80000/80001 (`100`,`101`) | idempiere | Compiere 2002 seed (pre-C_POSPayment, cash journal era) | … + c_cash/c_cashline (old cash book) — NOT a modern oracle, used only where the modern one is absent |

Master/aggregate tables a completion also writes but are NOT doc-keyed (so a closure walk cannot see them —
exactly the scope-blindness): **c_bpartner** (TotalOpenBalance, SO_CreditUsed, ActualLifeTimeValue, FirstSale,
SOCreditStatus), **m_storageonhand** (QtyOnHand by locator/product/ASI/DateMaterialPolicy), **m_storagereservation**
(Qty by warehouse/product/ASI/IsSOTrx), **m_cost** (CurrentQty/CurrentCostPrice/Cumulated*), **m_costhistory**,
**ad_sequence** (CurrentNext). The pilot's `ad_changelog` for 80004 confirms the column-level writes (C_OrderLine
QtyDelivered/DateDelivered/QtyInvoiced; M_InOut Processed/DocStatus/IsApproved/Volume/Weight; C_AllocationHdr
Processed/IsApproved/DocStatus; C_Invoice C_Payment_ID/C_DocType_ID/TotalLines/IsPaid/DocStatus IR→CO/Processed;
C_Payment IsApproved/Processed/DocStatus; C_Order DocStatus/C_DocType_ID/IsApproved/Processed/DeliveryRule A→F).

## §CHANGE-LIST — every table/column the Java writes, with file:line, and our status

Status vocabulary (as of bim-ootb origin/main `880824d1`, 2026-10-04, BEFORE this lane):
**HAVE** = written on the live page path + witnessed · **PART** = some columns · **HEADLESS** = proven only in
bim-compiler scripts/build · **MISSING** = nothing writes it. The **now** column is filled by §RESULT.

Java root: `org.adempiere.base/src/org/compiere/model/` unless noted. `DocumentEngine.processIt` drives
prepareIt→completeIt; the UI reaches it through the DocAction column's AD_Process → AD_Workflow (row W1).

### A. Order prepare + complete (MOrder.prepareIt :1536, completeIt :2108)

| # | table.column(s) | written by (file:line) | before |
|---|---|---|---|
| A1 | c_order.C_DocType_ID ← C_DocTypeTarget_ID | MOrder.prepareIt :1592-1630 | PART (crud_overlay reads tgt, never writes it) |
| A2 | c_order period-open gate (no write; blocks) | MOrder.prepareIt :1544-1549 → MPeriod.isOpen | MISSING |
| A3 | c_orderline.QtyReserved ; m_storagereservation.Qty (+diff) ; **m_storagereservationlog** row (ReservationLogTracer) | MOrder.reserveStock :1925-2024 → MStorageReservation.add :263-301, addQty :315-326 → ReservationLogTracer.trace (org/adempiere/util :55-73) | MISSING |
| A4 | c_order.Volume/Weight | MOrder.reserveStock :2019-2021 | MISSING |
| A5 | c_ordertax rows (delete + recreate per tax; TaxAmt, TaxBaseAmt, IsTaxIncluded, Processed) ; c_order.TotalLines/GrandTotal | MOrder.calculateTaxTotal :2030 → StandardTaxProvider.calculateOrderTaxTotal :38-110 → MOrderTax.calculateTaxFromLines :312-372 → MTax.calculateTax :340-372 | PART (header totals by callout; c_ordertax not regenerated on complete) |
| A6 | credit check (BP SOCreditStatus vs GrandTotal) — blocks | CreditManagerOrder.checkCreditStatus (model/credit :48-97); MBPartner.getSOCreditStatus(amt) :823-848 | MISSING |
| A7 | c_orderpayschedule (OnCredit/DirectDebit with schedule) | MOrder.prepareIt :1672-1686 → createPaySchedule | MISSING (no GardenWorld term has a schedule — named, not ported) |
| A8 | c_order.IsApproved='Y' | MOrder.completeIt :2159 approveIt :2075 | MISSING |
| A9 | c_order.DeliveryRule → 'F' (shipment-generating subtypes, warehouse allows negative) | MOrder.completeIt :2181-2186 | MISSING |
| A10 | **M_InOut + M_InOutLine** generated (WR/WP/WI, PR+auto) | MOrder.completeIt :2178-2193 → createShipment :2433-2490 (MInOut(order) ctor, MInOutLine.setOrderLine, qty=ordered−delivered, locator via MStorageOnHand.getM_Locator_ID else WH default) | PART (`_fs15BuildDocs` builds rows, marks CO directly — the shipment's OWN completeIt (B) never runs) |
| A11 | c_order.InvoiceRule → 'D' (with shipment) / 'I' | MOrder.createInvoice :2510-2511, :2536-2537 | MISSING |
| A12 | **C_Invoice + C_InvoiceLine** generated (WR/WI/PR+auto) ; m_inoutline.IsInvoiced='Y' | MOrder.completeIt :2197-2207 → createInvoice :2497-2590 (MInvoice(order), setShipLine, qty=movementqty) | PART (built by `_fs15BuildDocs`, invoice completeIt (C) never runs) |
| A13 | c_order.C_CashLine_ID ← invoice | MOrder.createInvoice :2582 | MISSING |
| A14 | POS mixed payments: c_payment per C_POSPayment ; c_pospayment.C_Payment_ID/Processed | MOrder.createPOSPayments :2298-2392 (only PaymentRule='M') | MISSING |
| A15 | counter document (inter-org BP) | MOrder.createCounterDoc :2598-2672 | MISSING (GardenWorld has no counter doctype pair — named) |
| A16 | m_inoutline.QtyOverReceipt=0 | MOrder.updateOverReceipt :2259-2268 | MISSING |
| A17 | c_order.Processed/c_orderline.Processed='Y', DocAction='CL', DocStatus='CO' ; ProcessedOn | MOrder.completeIt :2236-2240, setProcessed ; PO.set_ProcessedOn | PART (DocStatus via SET_STATUS only) |
| A18 | c_order.DocumentNo (definite / overwrite-on-complete) | MOrder.setDefiniteDocumentNo :2398-2420 → MSequence.getDocumentNo :674 | PART (`_allocDocNo` on save, bumps AD_Sequence OUTSIDE the op-log) |

### B. Shipment complete (MInOut.completeIt :1630-2159)

| # | table.column(s) | written by | before |
|---|---|---|---|
| B1 | **m_inoutlinema** (material-policy allocation of the taken qty: ASI + DateMaterialPolicy per storage) | MInOut.checkMaterialPolicy (called :1714) | MISSING |
| B2 | **m_storageonhand**.QtyOnHand (±qty per locator/product/ASI/DateMaterialPolicy) | MInOut.completeIt :1765-1775 (MA loop), :1823-1886 (fallback) → MStorageOnHand.add :817-845, addQtyOnHand :851-866 (NegativeInventoryDisallowed when WH.IsDisallowNegativeInv) | HEADLESS→PART (`stockMoves` emits M_Transaction only; storage is never folded) |
| B3 | **m_transaction** (MovementType, signed qty, M_InOutLine_ID, MovementDate) | MInOut.completeIt :1778-1788 / :1888-1898 | PART (E-4 `stockMoves`, receipt/shipment via completeFanoutReceipt only) |
| B4 | m_storagereservation.Qty (−min(movementQty, line.QtyReserved)) + reservation log | MInOut.completeIt :1736-1747, :1790-1813 / :1871-1885 | MISSING |
| B5 | c_orderline.QtyReserved (−movementQty, floor 0) ; QtyDelivered (+) ; DateDelivered | MInOut.completeIt :1961-1985 | MISSING |
| B6 | m_matchpo (PO receipt) ; m_matchinv (invoice-first) ; c_orderline.M_AttributeSetInstance_ID | MInOut.completeIt :2059-2134 | PART (`completeReceipt` M_MatchPO only) |
| B7 | A_Asset for IsCreateAsset products | MInOut.completeIt :2016-2048 | MISSING (non-core: assets) |
| B8 | m_inout.IsApproved/Processed/DocAction/DocStatus ; Volume/Weight (beforeSave) | MInOut.completeIt :2154-2158 | PART |

### C. Invoice complete (MInvoice.prepareIt :1716, completeIt :1965-2345)

| # | table.column(s) | written by | before |
|---|---|---|---|
| C1 | c_invoicetax rows ; c_invoice.TotalLines/GrandTotal | MInvoice.calculateTaxTotal :1886 → StandardTaxProvider.calculateInvoiceTaxTotal :166-238 | PART (`_fs15BuildDocs` derives once at build) |
| C2 | c_invoice.C_DocType_ID ← target (DR→IP→CO, the changelog's IP hop) | MInvoice.prepareIt | MISSING |
| C3 | Cash PaymentRule & !fromPOS → **c_payment** (tender Cash, bank account by org/currency IsDefault DESC, ARR doctype) completed → allocation | MInvoice.completeIt :2008-2073 | MISSING |
| C4 | c_orderline.QtyInvoiced (+) | MInvoice.completeIt :2111-2124 | MISSING |
| C5 | m_matchinv (PO invoice ↔ receipt) ; m_matchpo (invoice-first) | MInvoice.completeIt :2083-2108, :2125-2165 | PART (`completeInvoice` M_MatchInv only) |
| C6 | **c_bpartner**.TotalOpenBalance (+invAmt unless Cash&!POS), ActualLifeTimeValue (+), SO_CreditUsed (+), FirstSale, SOCreditStatus | CreditManagerInvoice.checkCreditStatus (model/credit :76-170) ; MBPartner.setSOCreditStatus :798-819 | MISSING |
| C7 | ad_user.LastContact/LastResult | MInvoice.completeIt :2193-2203 | MISSING |
| C8 | c_invoice.IsPaid (testAllocation) | MInvoice.completeIt :2321-2327 → testAllocation :1433-1455 | MISSING |
| C9 | c_invoicepayschedule (copied from order schedule) | MOrder.createInvoice :2566-2577 | MISSING (no schedule in GardenWorld terms — named) |

### D. Payment complete (MPayment.completeIt :2038-2130) and Allocation complete (MAllocationHdr.completeIt :518-560)

| # | table.column(s) | written by | before |
|---|---|---|---|
| D1 | **c_allocationhdr + c_allocationline** (payment → invoice, Amount/Discount/WriteOff/OverUnder, DateAcct = max(payment, invoice)) | CreditManagerPayment :68-73 → MPayment.allocateIt :2298 → allocateInvoice :2366-2410 | MISSING |
| D2 | c_payment.IsAllocated (testAllocation) | MPayment.testAllocation :966-982 ; MAllocationLine.processIt :286-303 | MISSING |
| D3 | c_bpartner.TotalOpenBalance (prepayment branch only) | CreditManagerPayment :75-127 | MISSING |
| D4 | c_invoice.C_Payment_ID ; c_order.C_Payment_ID | MPayment.completeIt :2110-2128 ; MAllocationLine.processIt :306-330 | MISSING |
| D5 | c_bpartner.TotalOpenBalance + SO_CreditUsed recomputed from open items | MAllocationHdr.updateBP :954-968 → MBPartner.setTotalOpenBalance :711-757 | MISSING |
| D6 | c_invoice.IsPaid ; c_allocationline.C_BPartner_ID | MAllocationLine.processIt :276-280, :365-371 | MISSING |
| D7 | c_cashline (cashbook-trx tender) | MPayment.completeIt :2085-2115 | MISSING (GardenWorld bank accounts are not cashbook-trx — named) |

### E. Costing, posting, numbering, workflow, audit

| # | table.column(s) | written by | before |
|---|---|---|---|
| E1 | **m_costdetail** per accounting schema (shipment: Amt=−cost×qty, Qty, snapshot CurrentCostPrice/CurrentQty/Cumulated*) ; **m_cost**.CurrentQty ; m_costhistory | Doc_InOut.createFacts → MCostDetail.createShipment :303-351 → process :1305-1418, :1423-1830 (AveragePO qty branch :1741-1780) | MISSING (`erp_engine.js` names it deferred) |
| E2 | fact_acct for EVERY generated document (InOut, Invoice, Payment, Allocation, MatchInv, MatchPO) ; doc.Posted='Y' | org/compiere/acct Doc_*.createFacts ; Doc.post | PART (`_fs15PostDocs` posts Invoice+InOut only; the proven 14-type poster lives in bim-compiler `scripts/doc_poster.js`, shipped `erp/doc_poster.js` is the 2-type copy) |
| E3 | ad_sequence.CurrentNext ; doc DocumentNo | PO.saveNew :3149-3162 → MSequence.getDocumentNoFromSeq :330-560 | PART (bumped outside the signed op-group, `crud_overlay.js:_allocDocNo`) |
| W1 | **ad_wf_process** (WFState CC, TextMsg) + **ad_wf_activity** per node + **ad_wf_eventaudit** per activity | AbstractADWindowContent :3766 → ServerProcessCtl :220 startWorkflow → MWFProcess.startWork / MWFActivity.run :938-973, performWork D-node :1095-1153 (Process_Order 116: Start→DocPrepare→DocComplete) | MISSING (DocAction bypasses workflow: `crud_core.js` buildOp verb=process → SET_STATUS) |
| W2 | ad_changelog (audited columns, per change) | PO.saveUpdate → MChangeLog (when AD_Table.IsChangeLog / session audit) | MISSING — **our op-log IS the change log**: every CRUD_UPDATE carries {old,new}; the projection to AD_ChangeLog rows is a read view, not a second write (named, see §W2) |

## §DESIGN — one registry, the iDempiere contract, every write in the SAME signed op-group

1. **Registry = `ad_modelval.js`** (already the AD_ModelValidator/save-hook engine). Extended, not forked:
   timings become the full iDempiere set (ModelValidator TYPE_BEFORE/AFTER_NEW/CHANGE/DELETE + docValidate
   TIMING_BEFORE/AFTER_PREPARE/COMPLETE/VOID/CLOSE/REACTIVATE/REVERSECORRECT/REVERSEACCRUAL/POST). A hook may
   now WRITE through the unit-of-work it is handed (`ctx.trx`) — the writes land in the caller's group.
2. **`erp/model_layer.js`** = the PO + DocumentEngine contract, PURE (host injects `query`):
   - `Trx` — read-your-writes unit of work over the injected reader: `get/find/insert/update/delete`, emits the
     EXISTING op shapes (`CRUD_CREATE` with `{__opRef:i}` FKs, `CRUD_UPDATE {changes:{col:{old,new}}}`) that
     `applyOpGroup`/`commitGroup` already seal as one group. Nothing writes outside it — incl. AD_Sequence.
   - `save(trx, table, rec)` = PO.save: BEFORE_NEW/CHANGE validators → write → model afterSave → AFTER_NEW/CHANGE.
   - `registerDocAction(table, impl)` — the **document-action extension point** (a Ninja/plugin module brings its
     own DocAction class: `{prepareIt, completeIt, voidIt, closeIt, reverseCorrectIt, reverseAccrualIt, reActivateIt}`).
     Exposed to bundles as the 6th `plugin_registry` contribution point (`ctx.docAction`).
   - `processIt(trx, table, id, action)` = DocumentEngine.processIt (status machine) — fires BEFORE/AFTER doc
     timings around each step.
   - `runWorkflow(trx, table, id, action)` = the UI path: DocAction column → AD_Process.AD_Workflow_ID →
     `AdWorkflow` node walk (shipped from build/erp/ad_workflow.js — ONE copy), each D-node calls processIt,
     writing AD_WF_Process / AD_WF_Activity / AD_WF_EventAudit through the same Trx.
   - **Single host entry** `ModelLayer.run(table, timing, ctx) → {ok, ops, log}` for the overlay/core seams.
3. **`erp/model_trade.js`** = the faithful ports registered into (1)/(2): MOrder, MOrderLine, MInOut, MInvoice,
   MInvoiceLine, MPayment, MAllocationHdr/Line, MBPartner balances, MStorageOnHand.add, MStorageReservation.add
   (+log), MCostDetail shipment/receipt (AveragePO + Standard), MSequence, StandardTaxProvider. Each rule body
   carries a one-line `// Java:file:line` cite. Money via `bigdecimal.js` only.
4. **Posting**: `erp/doc_poster.js` becomes the merged proven poster (one copy; the 14-type `scripts/doc_poster.js`
   is the source); every document the model generates is posted through it.
5. **Seed**: missing tables (m_storagereservationlog, m_costdetail, m_costhistory, m_inoutlinema, c_pospayment,
   ad_workflow, ad_wf_node, ad_wf_nodenext, ad_wf_process, ad_wf_activity, ad_wf_eventaudit) + Process_* workflow
   rows ship in `erp/patches/ad_seed.db.sql` via `build_ad_seed_patch.sh` (extract-only from PG) and the existing
   idempiere.html self-heal loader. Never a DB binary.

### Seams in files owned by the window lane (released 2026-10-04 after #1837; minimal wiring only)
- DocAction: `crud_overlay.js commitProcess → completeFanout` — replace the per-table `completeFanoutOrder/
  Receipt/Invoice` + `_fs15BuildDocs` branches (an `if key==='c_order'` dispatch = AD-LAW defect) with ONE call
  `ModelLayer.run(table,'DOCACTION',{id,action})`; its ops ride `buildDocActionGroup` as today.
- AFTER save: inside `_commitCrudSealed` BEFORE the seal: `ModelLayer.run(table,'AFTER_SAVE',{record,old})` ops are
  appended to the same `groupOps`.
- DocumentNo: `_allocDocNo` returns the AD_Sequence CRUD_UPDATE op into the same group (no out-of-log bump).

## §WITNESS CLAIMS (written before code)

- **W-MODEL-ORACLE** (`scripts/poc_model_layer_oracle.js`, bim-compiler): for each oracle document in
  §MEASURED-FOOTPRINT, build the PRE-STATE in an in-memory SQLite from Postgres (masters + the doc back in Draft),
  run `ModelLayer.runWorkflow(…,'CO')`, fold the ops, then compare EVERY table of §CHANGE-LIST (rows + columns,
  ids mapped by natural key, volatile created/updated/uu excluded). Per table prints `MATCH` / `MISSING` / `EXTRA` /
  `VALUE-DIFF col=ours≠oracle` / `INCONCLUSIVE <why>`. Summary `§MODEL-ORACLE doc=… tables=N matched=X`.
  Issue it exposes: a completion that leaves any of the N tables unwritten or wrong. Must FAIL on today's
  shipped path (it writes ≤4 of N) — that failure is the proof the witness is not vacuous.
- **W-MODEL-AGG** (master tables not isolatable from a final state): c_bpartner balance formula
  (setTotalOpenBalance / ActualLifeTimeValue SQL ported) evaluated on the oracle DB's CURRENT rows must equal the
  stored columns for every GardenWorld BP with open items; m_storageonhand delta per (locator,product) must equal
  the doc's oracle m_transaction. Else INCONCLUSIVE, never PASS.
- **W-MODEL-OPGROUP**: every op the model emits for one DocAction is in ONE group (incl. the AD_Sequence bump);
  replaying the group onto the pre-state reproduces the same tip (deterministic, no Date.now).
- **W-MODEL-PLUGIN**: a plugin bundle registering a DocAction class for a table with no host code completes a
  record of that table through `processIt` and its writes land in the group.

## §RESULT 2026-10-04 — what is now in place (bim-ootb branch `feat/erp-model-layer`, sw v814)

**Code (bim-ootb `erp/`):** `model_layer.js` (Trx / PO.save / registerDocAction / DocumentEngine.processIt / runWorkflow /
`run` seam / newPO = setStandardDefaults + X_ mandatory AD defaults + DDL defaults) · `model_trade.js` (MSequence, MPeriod.isOpen
with AutoPeriodControl, MStorageOnHand.add, MStorageReservation.add + ReservationLogTracer, MBPartner open balance /
credit status, invoiceOpen/paymentAvailable) · `model_order.js` (MOrder, MOrderLine, MInOut) · `model_invoice.js` (MInvoice,
MInvoiceLine, MPayment, MAllocationHdr/Line, MOrder.createInvoice, FixedAssets validator) · `model_post.js` (Doc.post per schema:
Doc_Order/InOut(SO)/Invoice(ARI)/Payment/AllocationHdr + MCostDetail/M_Cost/M_CostHistory/M_CostQueue) · `ad_workflow.js` shipped
(one copy) · `ad_modelval.js` full timing set · `plugin_registry.js`/`plugin_overlay.js` 6th point `ctx.docAction` ·
seams in `crud_overlay.js`/`crud_core.js` (DocAction → model; BEFORE/AFTER save → model in the same group; DocumentNo from
C_DocTypeTarget sequence with the bump IN the group; listTip folds composite-key rows by `_UU`) · seed patch
(`patches/build_model_patch.py`). Deleted: the FS-15 per-table document builder/poster (`_fs15BuildDocs/_fs15PostDocs/_fs15Tax`).

**Witness W-MODEL-ORACLE** — `scripts/poc_model_layer_oracle.js`, log `build/erp/poc_model_layer_oracle.log`. Replays the pilot's
documents in creation order (read from `idempiere_pilot`, VO/DR named not driven), drafts reverted from AD_ChangeLog old values,
lines through the model SAVE path, DocAction CO; compares each document's WHOLE footprint (closure walk, other driven documents
excluded) at the end of the replay:
`§MODEL-ORACLE-SUMMARY docs=14 tablesJudged=135 tablesMatched=118` —
- **POS (WR ×2) + On-Credit (WI ×2) + Standard SO + SO chain (order → hand-entered shipment → invoice → payment/allocation) +
  2 standalone AR invoices: 118 / 118 doc-keyed tables MATCH, every non-volatile column** (c_order, c_orderline, c_ordertax,
  m_inout(+line), m_inoutlinema, m_transaction, m_storagereservationlog, c_invoice(+line,+tax), c_payment, c_allocationhdr(+line),
  m_costdetail, m_costhistory, fact_acct both schemas).
- **P2P (PO 1000315 → receipt → AP invoice): 14 of 31 tables MATCH — OPEN.** Missing: `MMatchPO.create`/afterSave (receipt+invoice
  matching updates C_OrderLine.QtyDelivered/QtyInvoiced, MatchPO.C_InvoiceLine_ID, MMatchPO.java:294-560, :1123-1215), Doc_InOut
  receipt (V+), Doc_Invoice API, Doc_MatchPO/Doc_MatchInv + AveragePO cost update from the match (MCostDetail :1520-1700).
- Aggregates (`§MODEL-AGG`, pilot final state): 24 / 35 rows MATCH; the 11 diffs are the P2P cost rows above, sequences advanced
  by pilot documents not driven (void order 1000313), and BP 118 (touched by the void + AP invoice).
- Falsifier `build/erp/poc_model_layer_oracle_falsifier.log` (posting switched off): 8 / 16 tables — the witness is not vacuous.

**Witness W-MODEL-PLUGIN** — `scripts/poc_model_plugin_docaction.js`: a bundle registers a DocAction class for an unknown table
through `plugin_registry` ctx.docAction; `§MODEL-PLUGIN-SUMMARY pass=3 fail=0` (falsifier: without the bundle → refused, 0 ops).

**W2 AD_ChangeLog** stays NAMED-EXCLUDED: the signed op-log carries {old,new} per column; a projection, not a second write.
**Workflow:** the page path runs Process_* (AD_WF_* rows written, as iDempiere's UI does); the pilot's reference ran through
ADInterface (processIt, no workflow) → those 3 tables show EXTRA-IN-OURS in the pilot compare — expected, not a defect.

## §STATIONS 2026-10-04 — what the 3-station relay test (ERP_PARALLEL_RUN_PILOT.md §9-R) needs from the model layer

1. **Record identity across stations — PROPOSAL (core-lane change in `crud_core.listTip`, not made here).** iDempiere's own
   cross-system identity is `<Table>_UU`: PO.saveNew:3546-3555 stamps it on every new row, and 2Pack/replication match records by it,
   never by the numeric key (numeric ids are per-database). Ours: listTip gives a created row the pk `-opId`, unique only per device
   → the admin fold merges three stations' `c_order:-1`. The faithful rule: a created row's identity = its op's `op_uuid` (already
   the row's `_UU`, §GT); the fold keys rows by `_UU`, and an FK written as a local synthetic id is carried in the op as the
   referenced row's `_UU` (resolved by the station at seal time, like `{__opRef}` today). The model layer already addresses
   composite-key rows by `_UU` (`idCol`, this PR) — the same mechanism generalised.
2. **DocumentNo within a station — DONE here:** from C_DocTypeTarget's sequence (PO.saveNew:3574-3579), the AD_Sequence bump is a
   CRUD_UPDATE in the document's own signed group, CurrentNext read through the tip, an issued preview treated as "<…>" (empty).
   **Across stations — ⛔ one question (policy):** iDempiere allocates under a row lock (MSequence.java:176-188, FOR UPDATE) which an
   offline station cannot take. Its three mechanisms that work without a central lock: (a) one AD_Org per station +
   `AD_Sequence.IsOrgLevelSequence='Y'` (AD_Sequence_No per org — numbers unique per station, real iDempiere data model);
   (b) a per-station `Prefix`/`Suffix` on the doctype sequence; (c) a provisional number at save + a definite number at Complete
   (`C_DocType.IsOverwriteSeqOnComplete` + `DefiniteSequence_ID`, MOrder.setDefiniteDocumentNo :2398) assigned by the relay/admin
   when the op reaches it. **Which one does the customer want?**
3. **POS lens** (`erp/pos_lens.js` → `window.ERP.opDb`, no relay push, `SELECT * FROM c_pos LIMIT 1` at :409) — not in this PR.
   The model layer gives it the path: build the C_Order/C_OrderLine through `ModelLayer.run(SAVE)` and complete with
   `ModelLayer.run(DOCACTION,'CO')`, commit the returned ops through crud_overlay's signed `applyOpGroup` (which relays), take the
   station's C_POS from the session org (`C_POS.AD_Org_ID`/`SalesRep_ID` = AD_User) — listed for the POS lane.

## §PILOT-ACCEPTANCE 2026-10-04 — the pilot harness (scripts/pilot) through OUR UI, against the pilot's saved reference diffs
Our side re-run with `PILOT_OOTB=<this branch>` (ref side NOT re-run — no new writes to `idempiere_pilot`); logs
`build/erp/pilot_ours_model_layer.log` + `build/erp/pilot_cmp_model_layer_<case>.log`. Tables of the whole-DB diff:

| case | ref tables | before (origin/main fcaaa411) MATCH / PARTIAL / MISSING | after MATCH / PARTIAL / MISSING / EXTRA |
|---|---|---|---|
| pos_one | 24 | 0 / 8 / 14 | 11 / 10 / 1 / 3 |
| c2_oncredit | 20 | 0 / 8 / 10 | 10 / 7 / 1 / 3 |
| c3_standard | 9 | 0 / 2 / 5 | 3 / 3 / 1 / 3 |
| c4_so_chain | 26 | 0 / 7 / 17 | 10 / 13 / 1 / 3 |
| c5_po_chain | 26 | 0 / 6 / 18 | 6 / 10 / 8 / 3 |
| c6_closed_period | 9 | 0 / 2 / 5 | 4 / 2 / 1 / 3 |
| c7_void | 9 | 0 / 2 / 5 | 3 / 3 / 1 / 3 |
| **total** | 123 | **0 / 35 / 74** | **47 / 48 / 14 / 21** |

The 1 MISSING per case = `ad_changelog` (W2, named). EXTRA 3 per case = `ad_wf_process/activity/eventaudit`: our page path runs the
DocAction workflow as iDempiere's UI does; the reference was driven through ADInterface (processIt, no workflow). POS fact_acct
18/18, m_cost/m_costqueue/m_storageonhand/m_transaction/c_bpartner MATCH. Remaining PARTIALs, by owner:
- **harness/reference-state artifacts** — DocumentNo off by the pilot's earlier documents (the reference DB had advanced its sequences;
  ours starts from the pristine bundle), cost/reservation `oldqty/newqty` likewise, `datematerialpolicy` 'T' vs ' ' formatting.
- **window/callout lane (not model):** `c_order.dateacct` (no DateAcct field on the form → today), EXTRA defaults the form writes
  (`c_conversiontype_id`, `amounttendered/refunded`, `volume/weight`, `pricecost`…), c4 payment `OverUnderAmt=-131.5` → allocation 0
  (CalloutPayment.amounts input), c4/c6 invoice line `PriceActual=0` and missing `C_OrderLine_ID` link from the invoice window.
- **model, open:** P2P (c5: MMatchPO.create/afterSave, Doc_InOut receipt, Doc_Invoice API, Doc_MatchPO/MatchInv + AveragePO cost
  from the match); c7 `posted=Y` after Void comes from the server's Accounting Processor (AD_Scheduler), not DocumentEngine.voidIt.

## ▶ RESUME 2026-10-04 (core-model-integrity lane, paused for token shortage)
**Done (bim-ootb PR #1843, branch `feat/model-p2p`, auto-merge squash set; worktree /tmp/wt-model-core):**
- MSequence.getDocumentNo verbatim (model_trade.js getDocumentNoFromSeq/ByDocType/ByTable: org-level AD_Sequence_No, Prefix/Suffix
  @var@ incl. `X_ID.Column` + `<fmt>`, /K keys, DecimalPattern, StartNewYear/Month); PO.saveNew DocumentNo/Value in ModelLayer.save;
  crud_overlay `_allocDocNo` delegates (bumps ride the doc's group). `build/erp/poc_model_docno_orglevel.log`:
  `§MODEL-DOCNO-ORG-SUMMARY judged=8 verdict=PASS` (HQ-0001..3, Store Central-0001..3, Store North-0001..2; falsifier one shared run 50305..).
- M-class ctors `erp/model_ctor.js` → `ModelTrade.ctor.*` (MInOutFromOrder/FromInvoice, MInOutLine+ioSet*, MInvoiceFromOrder/FromInOut,
  MInvoiceLine+ilSet*, MAllocationHdr/Line+alSet*, MPaySelection/Line/Check+psl*/psc*); createShipment/createInvoice use them.
- Costing engine `erp/model_cost.js` (MCostDetail create*/process/processProduct, MCost getCostInfo/getCost/setWeightedAverage, MCostHistory,
  MCostQueue, getSeedCosts); MMatchPO/MatchPOAutoMatch/MMatchInv `erp/model_match.js`; MInOut.completeIt matching block; IDocsPostProcess +
  repost→T_Fact_Acct_History; Doc_InOut shipment+receipt on faithful Fact/FactLine (model_post.js createLine/updateReverseLine).
- Oracle (`OOTB=/tmp/wt-model-core node scripts/poc_model_layer_oracle.js`, prestate extended in model_oracle/dump_prestate.py):
  `§MODEL-ORACLE-SUMMARY docs=15 tablesJudged=139 tablesMatched=123` (was 121; SO docs unchanged 100%; receipt m_inout1000005 5→7/11).
- UI pilot (ours only vs saved ref): pos_one MATCH=11 PARTIAL=10 MISSING=1 (unchanged); c5 MATCH=6 PARTIAL=11 MISSING=7 (was 6/10/8); pageerrors=0.

**In progress / next, in order:**
1. Doc_Invoice API/APC + Doc_MatchPO + Doc_MatchInv (createMatchInvCostDetail, IPV) in model_post.js using createLine/updateReverseLine;
   MInvoice.completeIt matching block (MInvoice.java:2076-2170 → ModelMatch.create(iLine,null)) — replaces the `§MODEL-NAMED MMatchPO.create
   (invoice-first)` line in model_invoice.js. Target: c_order1000315 / m_inout1000005 / c_invoice1000005 all MATCH (31/31).
2. Oracle closure: add m_matchpo/m_matchinv to DOCS so their fact_acct is judged (+ closure.py same).
3. Migrate old Fact.line users (Doc_Invoice ARI, Doc_Payment, Doc_Allocation) to the faithful createLine — one Fact implementation.
4. Rest of DocAction set (voidIt/reverseCorrectIt/closeIt/reActivateIt) for MOrder/MInOut/MInvoice/MPayment/MAllocationHdr, then MJournal,
   MMovement, MInventory, MBankStatement, MInOutConfirm, MRMA, MRequisition; hooks X/N; W-MORDER-SAVE PriceList default (item 4).
5. Reuse the processes lane's verbatim MConversionRate.getRate (erp/callouts/currency.js) in model_trade.rate and delete ours (requested).
**§MODEL-UNPORTED-DEP named in code:** MNote on posting error; getSeedCostFromPriceList/Product_PO; MWarehouse auto-create locator;
MInvoiceLine.setPrice/setTax (MProductPricing) in setShipLine without order line; Doc_InOut customer/vendor returns + reversal posting;
MSequence.createTableSequence; DefaultEvaluatee number/reference formats; back-date re-posting chain (BackDateDay null → not triggered in GardenWorld).
**Twin:** build/erp/crud_overlay.js NOT mirrored (shared tree has another worker's uncommitted edits) — mirror after #1843 merges.
