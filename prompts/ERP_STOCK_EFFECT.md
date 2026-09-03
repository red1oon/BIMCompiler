# ⚠ DO NOT REMOVE — scope guard
# ERP STOCK EFFECT (E-4) — a completed shipment/receipt must MOVE STOCK.
# Scope: emit the M_Transaction stock movement on M_InOut Complete, and make the on-hand READ see it.
# Nothing else: no costing, no reservation, no ASI/material-policy allocation, no inventory documents.
# READ THE LOG after every run (`build/erp/poc_stock_move.log`). Exit code is NOT evidence.
# Honour this block until the lane is DONE.

`AGENT_QUEUE.md` **E-4**, ⚑VERIFIED there as *"`grep -rln m_storageonhand erp/*.js` → **0 hits** across all
91 files"* and ranked by §E.UPDATE as an operational-integrity item beside E-5. Opened 2026-09-04.
`ERP_BUSINESS_CYCLE_E2E.md`'s own closing note asks for exactly this: *"each of these three is its own
scoped project … start a NEW dated section (or a new doc)."* This is that doc.

## §E4.1 STATE, measured not assumed (2026-09-04, `origin/main` `e5034c23`)
- `m_storageonhand` appears in **one** shipped place: `idempiere.html:2419` `onHandOf(pid, wh)` — a
  **read**, the InOutGenerate availability cap. **Zero** shipped `.js` mentions it at all.
- The seed carries the tables: `m_storageonhand` **20 rows**, `m_transaction` **28 rows**,
  `m_locator` **11 rows** (`glassbowl_data.db`).
- **The sign spine already exists and is witnessed** — `erp_engine.movementSign` / `qtyOnHand`
  (W-FOLD-QTYONHAND), whose own comment already states the model: *"iDempiere stores inventory qty NOWHERE
  as a master field — it is a FOLD of every MTransaction, and MStorageOnHand.qtyonhand is maintained in
  lockstep."*
- `completeReceipt` (`erp_engine.js`) emits `SET_STATUS` + `M_MatchPO` and **nothing inventory-side**.

So E-4 is not "build an inventory engine". The spine is built and proven; what is missing is the **emit**
and the **read**.

## §E4.2 EXTRACT — the Java rules this lane ports, cited
- `MInOut.getMovementType(ctx, C_DocType_ID, issotrx, trx)` (`MInOut.java:1275-1287`):
  `DocBaseType='MMS'` (MaterialDelivery) → `C-` when the doctype is SOTrx else `V-`;
  `DocBaseType='MMR'` (MaterialReceipt) → `C+` when SOTrx else `V+`. **Any other DocBaseType → null.**
- `MInOut.completeIt` (`:1688-1691`): `Qty = sLine.getMovementQty(); if (MovementType.charAt(1) == '-')
  Qty = Qty.negate();` — the polarity is the code's trailing char, which is exactly what
  `erp_engine.movementSign` already extracts.
- `MInOut.completeIt` (`:1905-1912`): `MStorageOnHand.add(ctx, sLine.M_Locator_ID, sLine.M_Product_ID,
  sLine.M_AttributeSetInstance_ID, pendingQty, dateMPolicy, trx)`.
- `MInOut.completeIt` (`:1939-1944`): `new MTransaction(ctx, sLine.AD_Org_ID, MovementType,
  sLine.M_Locator_ID, sLine.M_Product_ID, sLine.M_AttributeSetInstance_ID, Qty, getMovementDate())`,
  then `mtrx.setM_InOutLine_ID(sLine.getM_InOutLine_ID())`.

## §E4.3 DESIGN — emit the TRANSACTION, fold the READ. One shape, no new op type.
`M_StorageOnHand` is an **upsert** (add a delta to an existing row); `M_Transaction` is **append-only**.
The op log is append-only, and `listTip`-style folds read row-tips by key — so a delta row does not fit
`CREATE_LINE` cleanly, and inventing a `STORAGE_DELTA` op type to make it fit would be inventing.
**We emit the M_Transaction, which is what the log is shaped for, and derive on-hand as the fold the
engine's own comment already describes.** This is not a shortcut around `MStorageOnHand`: in real
iDempiere the storage row is a *maintained-in-lockstep cache* of exactly this sum.

1. **`erp_engine.stockMoves(doc, lines, opts)`** — PURE, no DB, no clock. Per line with a product and a
   locator: one `{op_type:'CREATE_LINE', table:'M_Transaction', movementtype, m_locator_id, m_product_id,
   m_attributesetinstance_id, movementqty:<SIGNED>, movementdate, m_inoutline_id, ad_org_id}`.
   `movementtype` comes from **`movementTypeOf(docBaseType, issotrx)`** (the `:1275` table above);
   the sign from the existing `movementSign`. A doctype whose DocBaseType is neither MMS nor MMR yields
   **no ops and a named reason** — never a guessed polarity.
2. **`completeReceipt` calls it**, so the same fanout that already emits `M_MatchPO` now also emits the
   stock movement. The shipment (SO) side rides the same verb — the movement type is what differs.
3. **`idempiere.html:onHandOf`** adds the sidecar term: bundle `SUM(qtyonhand)` **+** Σ signed sidecar
   `M_Transaction` for that (product, warehouse). One function, one added term — the whole read seam.

**Deliberately OUT of scope, named so nobody mistakes silence for coverage:** costing (`M_CostDetail`),
reservations (`MStorageReservation` — `:1919-1935`), the ASI / `dateMPolicy` material-policy allocation
loop (`:1771-1830`), reversals, and the physical-inventory / movement documents. This lane closes
*"a completed shipment moves stock"*, nothing wider.

## §E4.4 THE WITNESS — `W-STOCK-MOVE`, arms that can each fail
`scripts/poc_stock_move.js`, over the REAL `erp_engine.js`, fixtures = real rows from
`glassbowl_data.db` (purchase receipt `M_InOut 105` and a sales shipment), no authored qtys.
1. **MOVEMENT TYPE IS THE AD TABLE** — MMR/`issotrx=N` → `V+`, MMR/`Y` → `C+`, MMS/`Y` → `C-`, MMS/`N` →
   `V-`, and an unknown DocBaseType → **no ops + a named reason** (not a defaulted sign).
2. **SIGN FOLLOWS THE CODE** — a receipt ADDS and a shipment SUBTRACTS the same positive line qty; the
   emitted `movementqty` equals `movementSign(type) × |line qty|` for every line.
3. **ONE TRANSACTION PER STOCKABLE LINE** — N lines → N ops, each carrying the source `m_inoutline_id`,
   locator, product and ASI verbatim; a line with no product or no locator is skipped **and counted**.
4. **THE FOLD MOVES ON-HAND** — baseline on-hand from the real `m_storageonhand` rows, plus the emitted
   transactions through the existing `qtyOnHand`, equals baseline ± the shipped qty. This is the arm that
   turns *"a real signed shipment still cannot move stock"* into a number.
5. **NOT VACUOUS** — the fixture must contain at least one stockable line and a non-zero qty, else the
   run prints **INCONCLUSIVE**, never PASS.
6. **DEFERRALS DECLARED** — costing / reservation / ASI-policy come back in `result.deferred`, not silence.

## §E4.5 RESULT 2026-09-04 — **E-4 CLOSED at the engine + read seam.** `W-STOCK-MOVE` 15/15
```
§STOCK-MOVETYPE docsJudged=9 combos={"MMS/Y→C-":4,"MMR/N→V+":5} mismatches=0
§STOCK-FIXTURE  receipt=105 docbasetype=MMR issotrx=N lines=10 | shipment=100 docbasetype=MMS issotrx=Y lines=1
§STOCK-SIGN     receipt type=V+ ops=10 net=+237 signMismatches=0 | shipment type=C- ops=1 net=-1 signMismatches=0
§STOCK-LINES    stockable=10 ops=10 fieldMismatches=0   skipTest: ops=9 skipped=1
§STOCK-ONHAND-FOLD rows=10 mismatches=0 sample=["p136@l101 40→80 (+40)","p125@l101 12→24 (+12)","p138@l101 20→40 (+20)"]
§STOCK-GATE     docBaseType=GLJ ops=0 skipped=10 reason="…neither MMS nor MMR… a guessed polarity would be a wrong inventory sign"
§STOCK-FANOUT   ops=21 matchPO=10 mTransaction=10 | noPolicyCaller ops=11 mTransaction=0
🟢 W-STOCK-MOVE PASS — 15 PASS / 0 FAIL
```
**Arm 1's oracle is the seed's own `m_inout.movementtype` column**, over **9 real documents** in two
combos — not a table this witness wrote. **Falsifier proven:** flipping `MMS` to `C+` in
`movementTypeOf` turns exactly two arms red and the oracle names the four documents
(`100:MMS/Y derived=C+ seed=C-`, …).

Backward compatibility is itself an arm: a caller that passes no `docBaseType` gets
`ops=11 mTransaction=0` — byte-identical to the pre-§E4 fan-out, because a guessed sign is worse than
no movement.

Regression: **36 `erp_engine`-judging witnesses run before and after — 34 PASS / 3 FAIL, identical set,
0 regressions** (`poc_longtail`, `poc_p4_buyside_live`, `poc_pos_eoda` fail on the pre-change file too).
`poc_minout_live` PASS against the branch.

**Shipped:** bim-ootb `feat/erp-stock-effect` — `erp/erp_engine.js` (`movementTypeOf` + `stockMoves`,
`completeReceipt` calls it), `erp/crud_overlay.js` (`completeFanoutReceipt` reads the DocBaseType and logs
`§RECEIPT-FANOUT … docBaseType=… stockOps=… movementtype=… netQty=…`), `erp/idempiere.html`
(`_sidecarStockDelta` + `onHandOf`), `erp/sw.js` v780→**v781**.

## §E4.6 ⚠ FOUND WHILE VERIFYING — the P2P end-to-end witness is RED on `origin/main` ITSELF
Driving `witness_p2p_invoice_match.js` (the UI-level lane witness) against this branch failed at
**Stage 1**. Checked the instrument before believing the defect, per `AGENT_QUEUE` standing rule 3: the
**same run against unmodified `origin/main` fails identically**, stage for stage —
```
§P2P stage=1 PurchaseOrder  FAIL  PO id=-1 chip=null
§P2P stage=2 MaterialReceipt FAIL  m_inout header create did not persist (timeout waiting for §CRUD-PERSIST)
§P2P stage=3 VendorInvoice   FAIL  could not resolve the fresh Receipt line via listTip fold
§P2P stage=4 ThreeWayMatch   PARTIAL  m_matchpo=[] m_matchinv=[] sharedInOutLineId=false
```
So this is **not a regression from §E4 or from §Fix5** — but it IS a live finding: **the UI-driven proof
of the three-way match is currently broken at its first stage on main**, and the cascade means stages 2–4
prove nothing right now. The *engines* are proven headless (`W-CREATEFROM-INVOICE` 16/16,
`W-STOCK-MOVE` 15/15); the *UI path that stitches them* is not, and no claim here says otherwise.
### §E4.7 DIAGNOSED (2026-09-04) — it is a STALE WITNESS, not a product dead-end. Evidence, per stage.
Read the log rather than re-running: `build/erp/` sibling `p2p_base.log` was the origin/main run.

**Stage 1 — the PO is created fine; the witness cannot then act on it.**
```
§CRUD validate key=c_order verb=create ok
§KRN_GROUP committed gid=5dd0c0ab… ops=1 tip=92f910b3097d… sealed=1 (WHOLE — all-or-none)
§CRUD-OPLOG-ROW key=c_order id=-1 loaded=40 source=listTip
🔴 Stage1: PO reaches CO — chip=null        §P2P stage=1 … detail=PO id=-1 chip=null
```
So creation SUCCEEDS and seals. The row lives sidecar-only with the new-row id **`-1`**, and the witness's
chip/DocAction lookup expects a resolved id. **The defect is in the witness's post-create resolution, not
in the write path** — the write path's own §-lines say it committed.

**Stage 2 — the reject names exactly two columns, and the AD says a user supplies both.**
```
§CRUD validate key=m_inout verb=create REJECT errors=[{"col":"c_doctype_id","why":"required"},
                                                      {"col":"c_bpartner_location_id","why":"required"}]
```
Queried the seed: on `M_InOut`, **both are `IsMandatory='Y'`, both `IsDisplayed='Y'` on the main tabs
(257/296), and NEITHER has an `AD_Column.DefaultValue` or `AD_Field.DefaultValue`** — a real iDempiere user
picks the DocType and the location on the form. The witness fills only
`documentno,movementdate,m_warehouse_id,c_bpartner_id,c_order_id,description`.

**So the product got MORE faithful and the witness did not follow.** bim-ootb **#1636**'s whole-row
`§PARITY-MANDATORY` check now enforces the AD's own mandatory set on create; before it, an incomplete row
slipped through. The witness predates it. Stages 3 and 4 are pure cascade from Stage 2.

**⬜ NEXT, its own bounded item — fix the WITNESS, in this order:**
1. Stage 2: fill `c_doctype_id` and `c_bpartner_location_id` on the m_inout create (both are on the form).
2. Stage 1: resolve the created PO's id instead of reading `-1` — the row is in the sidecar under
   `listTip`, which the witness already uses elsewhere (`§CRUD-OPLOG-ROW … source=listTip`).
3. Re-run; stages 3/4 should follow without further change, since the engines behind them are proven
   headless (`W-CREATEFROM-INVOICE` 16/16, `W-STOCK-MOVE` 15/15).

**Worth noting for the callout corpus (E-1):** `M_InOut.C_BPartner_ID` carries
`org.compiere.model.CalloutInOut.bpartner` and `C_DocType_ID` carries `CalloutInOut.docType` — neither is
in our 6-atom registry (139 named-deferred). Porting `bpartner` would DEFAULT the location from the vendor
the way real iDempiere does, making step 1 above unnecessary for a human user. `CalloutInOut.docType`'s
own body sets `MovementType` via `MInOut.getMovementType` — **the same rule §E4 just ported as
`movementTypeOf`**, so that atom is already half-built.
